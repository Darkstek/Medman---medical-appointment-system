"use strict";
const Crypto = require("crypto");
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UuAppWorkspace } = require("uu_appg01_server").Workspace;
const { AuthenticationService } = require("uu_appg01_server").Authentication;
const { UuDateTime } = require("uu_i18ng01");
const { ConsoleClient, ProgressClient } = require("uu_consoleg02-uulib");

const AppWorkspaceAbl = require("uu_appg01_workspace/src/abl/sys-app-workspace-abl");
const Errors = require("../../api/errors/medman-main-error");
const Warnings = require("../../api/warnings/medman-main-warning");
const Validator = require("../../components/validator");
const DtoBuilder = require("../../components/dto-builder");
const ScriptEngineClient = require("../../components/script-engine-client");
const MedmanMainClient = require("../../components/medman-main-client");
const StepHandler = require("../../components/step-handler");

const ProgressConstants = require("../../constants/progress-constants");
const MedmanMainConstants = require("../../constants/medman-main-constants");
const Configuration = require("../../components/configuration");

const SCRIPT_CODE = "team1_medman_maing01-uuscriptlib/medman-main/clear";

class ClearAbl {
  constructor() {
    this.dao = DaoFactory.getDao(MedmanMainConstants.Schemas.MEDMAN_INSTANCE);
  }

  async clear(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoIn(uri, dtoIn);

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    if (team1Medman) {
      if (team1Medman.state !== MedmanMainConstants.StateMap.FINAL) {
        // 2.1
        throw new Errors.Clear.NotInProperState({
          state: team1Medman.state,
          expectedStateList: [MedmanMainConstants.StateMap.FINAL],
        });
      }

      if (team1Medman.temporaryData && team1Medman.temporaryData.useCase !== uri.getUseCase()) {
        // 2.2
        throw new Errors.SetStateClosed.UseCaseExecutionForbidden({
          concurrencyUseCase: team1Medman.temporaryData.useCase,
        });
      }
    } else {
      try {
        await UuAppWorkspace.setAssignedSysState(awid);
      } catch (e) {
        // 2.3
        throw new Errors.Clear.SetAssignedSysStateFailed({}, e);
      }

      return DtoBuilder.prepareDtoOut({ progressMap: {} });
    }

    // HDS 3
    const configuration = await Configuration.getUuSubAppConfiguration({
      awid,
      artifactId: team1Medman.artifactId,
      uuTerritoryBaseUri: team1Medman.uuTerritoryBaseUri,
    });

    // HDS 4
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const lockSecret = Crypto.randomBytes(32).toString("hex");
    const progressClient = await this._createClearProgress(
      team1Medman,
      dtoIn,
      configuration,
      lockSecret,
      sysIdentitySession,
    );

    // HDS 5
    if (!team1Medman.temporaryData) {
      team1Medman = await this.dao.updateByAwid({
        awid,
        temporaryData: {
          useCase: uri.getUseCase(),
          dtoIn: dtoIn.data,
          stepList: [MedmanMainConstants.ClearStepMap.CLEAR_STARTED.code],
          progressMap: {
            progressCode: progressClient.progress.code,
            uuConsoleUri: configuration.uuConsoleBaseUri,
            consoleCode: MedmanMainConstants.getMainConsoleCode(awid),
          },
        },
      });
    }

    if (team1Medman.temporaryData.stepList.includes(MedmanMainConstants.ClearStepMap.CONSOLE_CLEARED.code)) {
      await this._clearFinalize(uri, { lockSecret });
    } else {
      // TODO If your application requires any additional steps, add them here...
  
      // HDS 6
      await this._runScript(
        uri.getBaseUri(),
        dtoIn,
        configuration,
        progressClient.progress.lockSecret,
        sysIdentitySession,
      );
    }

    // HDS 7
    return DtoBuilder.prepareDtoOut({ data: team1Medman });
  }

  async _clearFinalize(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoInCustom(uri, dtoIn, "sysUuAppWorkspaceInitFinalizeDtoInType");

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    if (!team1Medman) {
      // 2.1
      throw new Errors._clearFinalize.Team1MedmanDoesNotExist({ awid });
    }

    if (team1Medman.state !== MedmanMainConstants.StateMap.FINAL) {
      // 2.2
      throw new Errors._clearFinalize.NotInProperState({
        state: team1Medman.state,
        expectedStateList: [MedmanMainConstants.StateMap.FINAL],
      });
    }

    if (!team1Medman.temporaryData) {
      // 2.3
      throw new Errors._clearFinalize.MissingRequiredData();
    }

    if (team1Medman.temporaryData && team1Medman.temporaryData.useCase !== "sys/uuAppWorkspace/clear") {
      // 2.4
      throw new Errors._clearFinalize.UseCaseExecutionForbidden({
        concurrencyUseCase: team1Medman.temporaryData.useCase,
      });
    }

    // HDS 3
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const progress = {
      code: MedmanMainConstants.getClearProgressCode(team1Medman.awid),
      lockSecret: dtoIn.lockSecret,
    };
    let progressClient = null;
    if (!team1Medman.temporaryData.stepList.includes(MedmanMainConstants.ClearStepMap.PROGRESS_ENDED.code)) {
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

    // HDS 5
    team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.ClearStepMap.INIT_PROGRESS_DELETED, async () => {
      await this._deleteProgress(
        MedmanMainConstants.getInitProgressCode(awid),
        team1Medman.temporaryData.progressMap.uuConsoleUri,
        sysIdentitySession,
      );
    });

    // HDS 6
    team1Medman = await stepHandler.handleStep(
      team1Medman,
      MedmanMainConstants.ClearStepMap.SET_STATE_CLOSED_PROGRESS_DELETED,
      async () => {
        await this._deleteProgress(
          MedmanMainConstants.getSetStateClosedProgressCode(awid),
          team1Medman.temporaryData.progressMap.uuConsoleUri,
          sysIdentitySession,
        );
      },
    );

    // HDS 7
    team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.ClearStepMap.CONSOLE_CLEARED, async () => {
      await this._clearConsole(
        team1Medman.temporaryData.progressMap.uuConsoleUri,
        MedmanMainConstants.getMainConsoleCode(awid),
        sysIdentitySession,
      );
    });

    // HDS 8
    team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.ClearStepMap.AUTH_STRATEGY_UNSET, async () => {
      await this.dao.cleanWorkspaceAuthStrategy(awid);
      AppWorkspaceAbl.clearCache();
    });

    // HDS 9
    team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.ClearStepMap.AWSC_DELETED, async () => {
      const medmanMainClient = new MedmanMainClient(team1Medman, team1Medman.uuTerritoryBaseUri);
      await medmanMainClient.deleteAwsc();
    });

    // HDS 10
    team1Medman = await stepHandler.handleStep(
      team1Medman,
      MedmanMainConstants.ClearStepMap.PROGRESS_ENDED,
      async () => {
        await progressClient.end({
          state: ProgressConstants.StateMap.COMPLETED,
          message: "Clear finished.",
          expireAt: UuDateTime.now().shift("day", 1),
          doneWork: MedmanMainConstants.getSetStateClosedStepCount(),
        });
      },
      false,
    );

    // HDS 11
    if (team1Medman.temporaryData.dtoIn.awidInitiatorList) {
      await UuAppWorkspace.reassign({
        awid,
        awidInitiatorList: team1Medman.temporaryData.dtoIn.awidInitiatorList,
      });
    }

    // HDS 12
    await this.dao.deleteByAwid(awid);

    // HDS 13
    try {
      await UuAppWorkspace.setAssignedSysState(awid);
    } catch (e) {
      throw new Errors._clearFinalize.SetAssignedSysStateFailed({}, e);
    }

    // HDS 14
    return DtoBuilder.prepareDtoOut();
  }

  async _createClearProgress(team1Medman, dtoIn, config, lockSecret, session) {
    let progressClient;
    let progress = {
      expireAt: UuDateTime.now().shift("day", 7),
      name: MedmanMainConstants.getClearProgressName(team1Medman.awid),
      code: MedmanMainConstants.getClearProgressCode(team1Medman.awid),
      authorizationStrategy: "uuIdentityList",
      permissionMap: await this._getClearProgressPermissionMap(team1Medman.awid, team1Medman.temporaryData?.dtoIn?.awidInitiatorList, session),
      lockSecret,
    };

    try {
      progressClient = await ProgressClient.get(config.uuConsoleBaseUri, { code: progress.code }, { session });
    } catch (e) {
      if (e.cause?.code !== ProgressConstants.PROGRESS_DOES_NOT_EXIST) {
        throw new Errors.Clear.ProgressGetCallFailed({ progressCode: progress.code }, e);
      }
    }

    if (!progressClient) {
      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.Clear.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    } else if (dtoIn.force) {
      try {
        await progressClient.releaseLock();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_RELEASE_DOES_NOT_EXIST) {
          throw new Errors.Clear.ProgressReleaseLockCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        await progressClient.setState({ state: "cancelled" });
      } catch (e) {
        DtoBuilder.addWarning(new Warnings.Clear.ProgressSetStateCallFailed(e.cause?.paramMap));
      }

      try {
        await progressClient.delete();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_DELETE_DOES_NOT_EXIST) {
          throw new Errors.Clear.ProgressDeleteCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.Clear.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    }

    try {
      await progressClient.start({
        message: "Progress was started",
        totalWork: MedmanMainConstants.getClearStepCount(),
        lockSecret,
      });
    } catch (e) {
      throw new Errors.Clear.ProgressStartCallFailed({ progressCode: progress.code }, e);
    }

    return progressClient;
  }

  async _getClearProgressPermissionMap(awid, awidInitiatorList, sysIdentitySession) {
    const awidData = await UuAppWorkspace.get(awid);

    let permissionMap = {};
    for (let identity of Array.from(new Set([...awidData.awidInitiatorList, ...awidInitiatorList]))) {
      permissionMap[identity] = MedmanMainConstants.CONSOLE_BOUND_MATRIX.Authorities;
    }
    permissionMap[sysIdentitySession.getIdentity().getUuIdentity()] =
      MedmanMainConstants.CONSOLE_BOUND_MATRIX.Authorities;

    return permissionMap;
  }

  async _deleteProgress(progressCode, uuConsoleBaseUri, session) {
    let progressClient;

    try {
      progressClient = await ProgressClient.get(uuConsoleBaseUri, { code: progressCode }, { session });
    } catch (e) {
      if (e.cause?.code === ProgressConstants.PROGRESS_DOES_NOT_EXIST) {
        return;
      } else {
        throw new Errors.Clear.ProgressGetCallFailed({ code: progressCode }, e);
      }
    }

    try {
      await progressClient.setState({ state: "final" });
      await progressClient.delete();
    } catch (e) {
      DtoBuilder.addWarning(new Warnings._clearFinalize.FailedToDeleteProgress(e.parameters));
    }
  }

  async _clearConsole(uuConsoleBaseUri, consoleCode, session) {
    const consoleClient = new ConsoleClient(uuConsoleBaseUri, { code: consoleCode }, { session });

    try {
      await consoleClient.clear();
    } catch (e) {
      DtoBuilder.addWarning(new Warnings._clearFinalize.FailedToClearConsole({ code: consoleCode }));
    }
  }

  async _runScript(appUri, dtoIn, configuration, lockSecret, session) {
    const scriptEngineClient = new ScriptEngineClient({
      scriptEngineUri: configuration.uuScriptEngineBaseUri,
      consoleUri: configuration.uuConsoleBaseUri,
      consoleCode: MedmanMainConstants.getMainConsoleCode(appUri.getAwid()),
      scriptRepositoryUri: configuration.uuScriptRepositoryBaseUri,
      session,
    });

    const scriptDtoIn = {
      team1MedmanUri: appUri.toString(),
      awidInitiatorList: dtoIn.data.awidInitiatorList,
      lockSecret,
    };

    await scriptEngineClient.runScript({ scriptCode: SCRIPT_CODE, scriptDtoIn });
  }
}

module.exports = new ClearAbl();
