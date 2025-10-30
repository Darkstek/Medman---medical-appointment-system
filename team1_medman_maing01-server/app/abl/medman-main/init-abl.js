"use strict";
const Crypto = require("crypto");
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UuAppWorkspace } = require("uu_appg01_server").Workspace;
const { AuthenticationService } = require("uu_appg01_server").Authentication;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { UuDateTime } = require("uu_i18ng01");
const { ConsoleClient, ProgressClient } = require("uu_consoleg02-uulib");

const Errors = require("../../api/errors/medman-main-error");
const Warnings = require("../../api/warnings/medman-main-warning");
const Validator = require("../../components/validator");
const DtoBuilder = require("../../components/dto-builder");
const ScriptEngineClient = require("../../components/script-engine-client");
const MedmanMainClient = require("../../components/medman-main-client");
const StepHandler = require("../../components/step-handler");
const InitRollbackAbl = require("./init-rollback-abl");

const ConsoleConstants = require("../../constants/console-constants");
const ProgressConstants = require("../../constants/progress-constants");
const MedmanMainConstants = require("../../constants/medman-main-constants");
const Configuration = require("../../components/configuration");

const SCRIPT_CODE = "team1_medman_maing01-uuscriptlib/medman-main/init";

class InitAbl {
  constructor() {
    this.dao = DaoFactory.getDao(MedmanMainConstants.Schemas.MEDMAN_INSTANCE);
  }

  async init(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    this._validateDtoIn(uri, dtoIn);

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);
    let uuAppWorkspace = await UuAppWorkspace.get(awid);

    // HDS 3
    this._validateMode(team1Medman, dtoIn, uuAppWorkspace.sysState);

    // HDS 4
    const configuration = await Configuration.getUuSubAppConfiguration({
      awid,
      artifactId: dtoIn.data.locationId || team1Medman.temporaryData.dtoIn.locationId,
      uuTerritoryBaseUri: dtoIn.data.uuTerritoryBaseUri || team1Medman.temporaryData.dtoIn.uuTerritoryBaseUri,
    });

    // HDS 5
    let initData;
    switch (dtoIn.mode) {
      case MedmanMainConstants.ModeMap.STANDARD: {
        initData = dtoIn.data;
        const uuTerritoryBaseUri = this._parseTerritoryUri(initData.uuTerritoryBaseUri);
        const temporaryData = {
          useCase: uri.getUseCase(),
          dtoIn: { ...initData },
          stepList: [MedmanMainConstants.InitStepMap.MEDMAN_OBJECT_CREATED.code],
          progressMap: {
            uuConsoleUri: configuration.uuConsoleBaseUri,
            progressCode: MedmanMainConstants.getInitProgressCode(awid),
            consoleCode: MedmanMainConstants.getMainConsoleCode(awid),
          },
        };

        team1Medman = await this.dao.create({
          awid,
          state: MedmanMainConstants.StateMap.CREATED,
          code: `${MedmanMainConstants.AWSC_PREFIX}/${awid}`,
          uuTerritoryBaseUri: uuTerritoryBaseUri.toString(),
          name: initData.name,
          desc: initData.desc,
          temporaryData,
        });

        try {
          await UuAppWorkspace.setBeingInitializedSysState(awid);
        } catch (e) {
          throw new Errors.Init.SetBeingInitializedSysStateFailed({}, e);
        }
        break;
      }

      case MedmanMainConstants.ModeMap.RETRY: {
        initData = team1Medman.temporaryData.dtoIn;
        break;
      }

      case MedmanMainConstants.ModeMap.ROLLBACK: {
        team1Medman.temporaryData.rollbackMode = true;
        if (!team1Medman.temporaryData.rollbackStepList) {
          team1Medman.temporaryData.rollbackStepList = [];
        }
        team1Medman = await this.dao.updateByAwid({ ...team1Medman });
        initData = team1Medman.temporaryData.dtoIn;
        break;
      }

      default: {
        throw new Errors.Init.WrongModeAndCircumstances({
          mode: dtoIn.mode,
          appObjectState: team1Medman?.state,
          temporaryData: team1Medman?.temporaryData,
        });
      }
    }

    // HDS 6
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const lockSecret = Crypto.randomBytes(32).toString("hex");
    const progressClient = await this._createInitProgress(
      team1Medman,
      dtoIn,
      configuration,
      lockSecret,
      sysIdentitySession,
    );

    // HDS 7
    switch (dtoIn.mode) {
      case MedmanMainConstants.ModeMap.STANDARD:
      case MedmanMainConstants.ModeMap.RETRY: {
        const stepHandler = new StepHandler({
          schema: MedmanMainConstants.Schemas.MEDMAN_INSTANCE,
          progressClient,
          stepList: team1Medman?.temporaryData?.stepList,
        });

        const medmanMainClient = new MedmanMainClient(team1Medman, team1Medman.uuTerritoryBaseUri);

        team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.InitStepMap.AWSC_CREATED, async () => {
          team1Medman.state = MedmanMainConstants.StateMap.BEING_INITIALIZED;
          await this.dao.updateByAwid({ ...team1Medman });
          await medmanMainClient.createAwsc(
            initData.locationId,
            initData.responsibleRoleId,
            initData.permissionMatrix,
            configuration.uuAppMetaModelVersion,
          );
        });

        team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.InitStepMap.WS_CONNECTED, async () => {
          await this._connectAwsc(team1Medman, uri.getBaseUri(), team1Medman.uuTerritoryBaseUri, sysIdentitySession);
        });

        team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.InitStepMap.CONSOLE_CREATED, async () => {
          await this._createConsole(team1Medman, configuration, sysIdentitySession);
        });

        // TODO If your application requires any additional steps, add them here...

        if (!team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.PROGRESS_ENDED.code)) {
          await this._runScript(uri.getBaseUri(), configuration, lockSecret, sysIdentitySession);
        } else {
          await this._initFinalize(uri, { lockSecret });
        }
        break;
      }

      case MedmanMainConstants.ModeMap.ROLLBACK: {
        if (
          team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.CONSOLE_CREATED.code) &&
          !team1Medman.temporaryData.rollbackStepList.includes(MedmanMainConstants.InitRollbackStepMap.CONSOLE_CLEARED.code)
        ) {
          await InitRollbackAbl.initRollback(uri.getBaseUri(), configuration, lockSecret);
        } else {
          await InitRollbackAbl._initFinalizeRollback(uri, { lockSecret });
        }
        break;
      }

      default: {
        throw new Errors.Init.WrongModeAndCircumstances({
          mode: dtoIn.mode,
          appObjectState: team1Medman?.state,
          temporaryData: team1Medman?.temporaryData,
        });
      }
    }

    // HDS 8
    return DtoBuilder.prepareDtoOut({ data: team1Medman });
  }

  async _initFinalize(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoInCustom(uri, dtoIn, "sysUuAppWorkspaceInitFinalizeDtoInType");

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    if (!team1Medman) {
      // 2.1
      throw new Errors._initFinalize.Team1MedmanDoesNotExist({ awid });
    }

    if (![MedmanMainConstants.StateMap.BEING_INITIALIZED, MedmanMainConstants.StateMap.ACTIVE].includes(team1Medman.state)) {
      // 2.2
      throw new Errors._initFinalize.NotInProperState({
        state: team1Medman.state,
        expectedStateList: [MedmanMainConstants.StateMap.BEING_INITIALIZED, MedmanMainConstants.StateMap.ACTIVE],
      });
    }

    // HDS 3
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const progress = {
      code: MedmanMainConstants.getInitProgressCode(team1Medman.awid),
      lockSecret: dtoIn.lockSecret,
    };
    let progressClient = null;
    if (!team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.PROGRESS_ENDED.code)) {
      progressClient = await ProgressClient.get(team1Medman.temporaryData.progressMap.uuConsoleUri, progress, {
        session: sysIdentitySession,
      });
    }
    const stepHandler = new StepHandler({
      schema: MedmanMainConstants.Schemas.MEDMAN_INSTANCE,
      progressClient,
      stepList: team1Medman.temporaryData.stepList,
    });

    // TODO If your application requires any additional steps, add them here...

    // HDS 4
    team1Medman = await stepHandler.handleStep(
      team1Medman,
      MedmanMainConstants.InitStepMap.PROGRESS_ENDED,
      async () => {
        await progressClient.end({
          state: ProgressConstants.StateMap.COMPLETED,
          message: "Initialization finished.",
          doneWork: MedmanMainConstants.getInitStepCount(),
        });
      },
      false,
    );

    // HDS 5
    if (team1Medman.state === MedmanMainConstants.StateMap.BEING_INITIALIZED) {
      team1Medman = await this.dao.updateByAwid({ awid, state: MedmanMainConstants.StateMap.ACTIVE, temporaryData: null });
    }

    // HDS 6
    await UuAppWorkspace.setActiveSysState(awid);

    // HDS 7
    return DtoBuilder.prepareDtoOut({ data: team1Medman });
  }

  // Validates dtoIn. In case of standard mode the data key of dtoIn is also validated.
  _validateDtoIn(uri, dtoIn) {
    let uuAppErrorMap = Validator.validateDtoIn(uri, dtoIn);
    if (dtoIn.mode === MedmanMainConstants.ModeMap.STANDARD) {
      Validator.validateDtoInCustom(uri, dtoIn.data, "sysUuAppWorkspaceInitStandardDtoInType", uuAppErrorMap);
    }
    return uuAppErrorMap;
  }

  _validateMode(team1Medman, dtoIn, sysState) {
    switch (dtoIn.mode) {
      case MedmanMainConstants.ModeMap.STANDARD:
        if (![UuAppWorkspace.SYS_STATES.ASSIGNED, UuAppWorkspace.SYS_STATES.BEING_INITIALIZED].includes(sysState)) {
          // 3.A.1.1.
          throw new Errors.Init.SysUuAppWorkspaceIsNotInProperState({
            sysState,
            expectedSysStateList: [UuAppWorkspace.SYS_STATES.ASSIGNED, UuAppWorkspace.SYS_STATES.BEING_INITIALIZED],
          });
        }
        if (team1Medman) {
          // 3.A.2.1.
          throw new Errors.Init.Team1MedmanObjectAlreadyExist({
            mode: dtoIn.mode,
            allowedModeList: [MedmanMainConstants.ModeMap.RETRY, MedmanMainConstants.ModeMap.ROLLBACK],
          });
        }
        break;

      case MedmanMainConstants.ModeMap.RETRY:
        if (sysState !== UuAppWorkspace.SYS_STATES.BEING_INITIALIZED) {
          // 3.B.1.1.
          throw new Errors.Init.SysUuAppWorkspaceIsNotInProperState({
            sysState,
            expectedSysStateList: [UuAppWorkspace.SYS_STATES.BEING_INITIALIZED],
          });
        }
        if (!team1Medman?.temporaryData) {
          // 3.B.2.1.
          throw new Errors.Init.MissingRequiredData();
        }
        if (team1Medman?.temporaryData?.rollbackMode) {
          // 3.B.3.1.
          throw new Errors.Init.RollbackNotFinished();
        }
        break;

      case MedmanMainConstants.ModeMap.ROLLBACK:
        if (sysState !== UuAppWorkspace.SYS_STATES.BEING_INITIALIZED) {
          // 3.C.1.1.
          throw new Errors.Init.SysUuAppWorkspaceIsNotInProperState({
            sysState,
            expectedSysStateList: [UuAppWorkspace.SYS_STATES.BEING_INITIALIZED],
          });
        }
        if (!team1Medman?.temporaryData) {
          // 3.C.2.1.
          throw new Errors.Init.MissingRequiredData();
        }
        if (!dtoIn.force && team1Medman?.temporaryData?.rollbackMode) {
          // 3.C.3.1.
          throw new Errors.Init.RollbackAlreadyRunning();
        }
        break;
    }
  }

  _parseTerritoryUri(locationUri) {
    let uuTerritoryUri;

    try {
      uuTerritoryUri = UriBuilder.parse(locationUri).toUri();
    } catch (e) {
      throw new Errors.Init.UuTLocationUriParseFailed({ uri: locationUri }, e);
    }

    return uuTerritoryUri.getBaseUri();
  }

  async _createInitProgress(team1Medman, dtoIn, config, lockSecret, session) {
    let progressClient;
    let progress = {
      expireAt: UuDateTime.now().shift("day", 7),
      name: MedmanMainConstants.getInitProgressName(team1Medman.awid),
      code: MedmanMainConstants.getInitProgressCode(team1Medman.awid),
      authorizationStrategy: "uuIdentityList",
      permissionMap: await this._getInitProgressPermissionMap(team1Medman.awid, session),
      lockSecret,
    };

    try {
      progressClient = await ProgressClient.get(config.uuConsoleBaseUri, { code: progress.code }, { session });
    } catch (e) {
      if (e.cause?.code !== ProgressConstants.PROGRESS_DOES_NOT_EXIST) {
        throw new Errors.Init.ProgressGetCallFailed({ progressCode: progress.code }, e);
      }
    }

    if (!progressClient) {
      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.Init.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    } else if (dtoIn.force) {
      try {
        await progressClient.releaseLock();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_RELEASE_DOES_NOT_EXIST) {
          throw new Errors.Init.ProgressReleaseLockCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        await progressClient.setState({ state: "cancelled" });
      } catch (e) {
        DtoBuilder.addWarning(new Warnings.Init.ProgressSetStateCallFailed(e.cause?.paramMap));
      }

      try {
        await progressClient.delete();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_DELETE_DOES_NOT_EXIST) {
          throw new Errors.Init.ProgressDeleteCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.Init.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    }

    try {
      await progressClient.start({
        message: "Progress was started",
        totalWork:
          dtoIn.mode === MedmanMainConstants.ModeMap.ROLLBACK
            ? MedmanMainConstants.getInitRollbackStepCount()
            : MedmanMainConstants.getInitStepCount(),
        lockSecret,
      });
    } catch (e) {
      throw new Errors.Init.ProgressStartCallFailed({ progressCode: progress.code }, e);
    }

    return progressClient;
  }

  async _getInitProgressPermissionMap(awid, sysIdentitySession) {
    const awidData = await UuAppWorkspace.get(awid);

    let permissionMap = {};
    for (let identity of awidData.awidInitiatorList) {
      permissionMap[identity] = MedmanMainConstants.CONSOLE_BOUND_MATRIX.Authorities;
    }
    permissionMap[sysIdentitySession.getIdentity().getUuIdentity()] =
      MedmanMainConstants.CONSOLE_BOUND_MATRIX.Authorities;

    return permissionMap;
  }

  async _connectAwsc(team1Medman, appUri, uuTerritoryBaseUri, session) {
    const artifactUri = UriBuilder.parse(uuTerritoryBaseUri).setParameter("id", team1Medman.artifactId).toUri().toString();

    try {
      await UuAppWorkspace.connectArtifact(appUri, { artifactUri }, session);
    } catch (e) {
      throw new Errors.MedmanMain.ConnectAwscFailed(
        {
          awid: team1Medman.awid,
          awscId: team1Medman.artifactId,
          uuTerritoryBaseUri,
        },
        e,
      );
    }
  }

  async _createConsole(team1Medman, configuration, session) {
    const artifactUri = UriBuilder.parse(team1Medman.uuTerritoryBaseUri).setParameter("id", team1Medman.artifactId).toString();
    const console = {
      code: MedmanMainConstants.getMainConsoleCode(team1Medman.awid),
      authorizationStrategy: "boundArtifact",
      boundArtifactUri: artifactUri,
      boundArtifactPermissionMatrix: MedmanMainConstants.CONSOLE_BOUND_MATRIX,
    };

    try {
      await ConsoleClient.createInstance(configuration.uuConsoleBaseUri, console, { session });
    } catch (e) {
      throw new Errors.Init.FailedToCreateConsole({}, e);
    }
  }

  async _setConsoleExpiration(uuConsoleUri, consoleCode, session) {
    let consoleClient;
    try {
      consoleClient = await ConsoleClient.get(uuConsoleUri, { code: consoleCode }, { session });
    } catch (e) {
      if (e.cause?.code === ConsoleConstants.CONSOLE_GET_DOES_NOT_EXISTS) {
        throw new Errors._initFinalize.ConsoleGetCallFailed({ code: consoleCode }, e);
      }
    }

    try {
      await consoleClient.update({ expireAt: new UuDateTime().shift("day", 7).date });
    } catch (e) {
      if (e.cause?.code === ConsoleConstants.CONSOLE_UPDATE_DOES_NOT_EXISTS) {
        DtoBuilder.addWarning(new Warnings._initFinalize.ConsoleDoesNotExist({ code: consoleCode }));
      } else {
        throw new Errors._initFinalize.ConsoleUpdateCallFailed({ code: consoleCode }, e);
      }
    }
  }

  async _runScript(appUri, configuration, lockSecret, session) {
    const scriptEngineClient = new ScriptEngineClient({
      scriptEngineUri: configuration.uuScriptEngineBaseUri,
      consoleUri: configuration.uuConsoleBaseUri,
      consoleCode: MedmanMainConstants.getMainConsoleCode(appUri.getAwid()),
      scriptRepositoryUri: configuration.uuScriptRepositoryBaseUri,
      session,
    });

    const scriptDtoIn = {
      team1MedmanUri: appUri.toString(),
      lockSecret,
    };

    await scriptEngineClient.runScript({ scriptCode: SCRIPT_CODE, scriptDtoIn });
  }
}

module.exports = new InitAbl();
