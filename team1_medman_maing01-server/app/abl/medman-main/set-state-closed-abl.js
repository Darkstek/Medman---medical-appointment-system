"use strict";
const Crypto = require("crypto");
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { AuthenticationService } = require("uu_appg01_server").Authentication;
const { UriBuilder } = require("uu_appg01_server").Uri;
const { UuDateTime } = require("uu_i18ng01");
const { ProgressClient } = require("uu_consoleg02-uulib");

const Errors = require("../../api/errors/medman-main-error");
const Warnings = require("../../api/warnings/medman-main-warning");
const Validator = require("../../components/validator");
const DtoBuilder = require("../../components/dto-builder");
const ScriptEngineClient = require("../../components/script-engine-client");
const MedmanMainClient = require("../../components/medman-main-client");
const StepHandler = require("../../components/step-handler");

const ProgressConstants = require("../../constants/progress-constants");
const MedmanMainConstants = require("../../constants/medman-main-constants");
const TerritoryConstants = require("../../constants/territory-constants");
const Configuration = require("../../components/configuration");

const SCRIPT_CODE = "team1_medman_maing01-uuscriptlib/medman-main/set-state-closed";

class SetStateClosedAbl {
  constructor() {
    this.dao = DaoFactory.getDao(MedmanMainConstants.Schemas.MEDMAN_INSTANCE);
  }

  async setStateClosed(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoIn(uri, dtoIn);

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    if (!team1Medman) {
      // 2.1
      throw new Errors.SetStateClosed.Team1MedmanDoesNotExist({ awid });
    }

    if (team1Medman.state !== MedmanMainConstants.StateMap.ACTIVE) {
      // 2.2
      throw new Errors.SetStateClosed.NotInProperState({
        state: team1Medman.state,
        expectedStateList: [MedmanMainConstants.StateMap.ACTIVE],
      });
    }

    if (team1Medman.temporaryData && team1Medman.temporaryData.useCase !== uri.getUseCase()) {
      // 2.3
      throw new Errors.SetStateClosed.UseCaseExecutionForbidden({
        concurrencyUseCase: team1Medman.temporaryData.useCase,
      });
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
    const progressClient = await this._createSetStateClosedProgress(
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
          dtoIn: {},
          stepList: [MedmanMainConstants.SetStateClosedStepMap.CLOSE_STARTED.code],
          progressMap: {
            progressCode: progressClient.progress.code,
            uuConsoleUri: configuration.uuConsoleBaseUri,
            consoleCode: MedmanMainConstants.getMainConsoleCode(awid),
          },
        },
      });
    }

    // TODO If your application requires any additional steps, add them here...

    // HDS 6
    await this._runScript(uri.getBaseUri(), configuration, progressClient.progress.lockSecret, sysIdentitySession);

    // HDS 7
    return DtoBuilder.prepareDtoOut({ data: team1Medman });
  }

  async _setStateClosedFinalize(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoInCustom(uri, dtoIn, "sysUuAppWorkspaceSetStateClosedFinalizeDtoInType");

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    if (!team1Medman) {
      // 2.1
      throw new Errors._setStateClosedFinalize.Team1MedmanDoesNotExist({ awid });
    }

    if (!team1Medman.state === MedmanMainConstants.StateMap.ACTIVE) {
      // 2.2
      throw new Errors._setStateClosedFinalize.NotInProperState({
        state: team1Medman.state,
        expectedStateList: [MedmanMainConstants.StateMap.ACTIVE],
      });
    }

    if (!team1Medman.temporaryData) {
      // 2.3
      throw new Errors._setStateClosedFinalize.MissingRequiredData();
    }

    if (team1Medman.temporaryData && team1Medman.temporaryData.useCase !== "sys/uuAppWorkspace/setStateClosed") {
      // 2.4
      throw new Errors._setStateClosedFinalize.UseCaseExecutionForbidden({
        concurrencyUseCase: team1Medman.temporaryData.useCase,
      });
    }

    // HDS 3
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const progress = {
      code: MedmanMainConstants.getSetStateClosedProgressCode(team1Medman.awid),
      lockSecret: dtoIn.lockSecret,
    };
    let progressClient = null;
    if (!team1Medman.temporaryData.stepList.includes(MedmanMainConstants.SetStateClosedStepMap.PROGRESS_ENDED.code)) {
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
    team1Medman = await stepHandler.handleStep(team1Medman, MedmanMainConstants.SetStateClosedStepMap.AWSC_CLOSED, async () => {
      const medmanMainClient = new MedmanMainClient(team1Medman, team1Medman.uuTerritoryBaseUri);
      try {
        await medmanMainClient.setAwscState(MedmanMainConstants.StateMap.FINAL);
      } catch (e) {
        if (e.cause?.code !== TerritoryConstants.INVALID_ARTIFACT_STATE) {
          throw e;
        } else {
          DtoBuilder.addWarning(new Warnings._setStateClosedFinalize.AwscAlreadyInFinalState());
        }
      }
    });

    // HDS 5
    team1Medman = await stepHandler.handleStep(
      team1Medman,
      MedmanMainConstants.SetStateClosedStepMap.PROGRESS_ENDED,
      async () => {
        await progressClient.end({
          state: ProgressConstants.StateMap.COMPLETED,
          message: "Setting closed state finished.",
          expireAt: UuDateTime.now().shift("day", 7),
          doneWork: MedmanMainConstants.getSetStateClosedStepCount(),
        });
      },
      false,
    );

    // HDS 6
    team1Medman = await this.dao.updateByAwid({
      awid,
      state: MedmanMainConstants.StateMap.FINAL,
      temporaryData: null,
    });

    // HDS 7
    return DtoBuilder.prepareDtoOut();
  }

  _parseTerritoryUri(locationUri) {
    let uuTerritoryUri;

    try {
      uuTerritoryUri = UriBuilder.parse(locationUri);
    } catch (e) {
      throw new Errors.SetStateClosed.UuTLocationUriParseFailed({ uri: locationUri }, e);
    }

    return uuTerritoryUri;
  }

  async _createSetStateClosedProgress(team1Medman, dtoIn, config, lockSecret, session) {
    const uuTerritoryUri = this._parseTerritoryUri(team1Medman.uuTerritoryBaseUri);

    let progressClient;
    let progress = {
      expireAt: UuDateTime.now().shift("day", 7),
      name: MedmanMainConstants.getSetStateClosedProgressName(team1Medman.awid),
      code: MedmanMainConstants.getSetStateClosedProgressCode(team1Medman.awid),
      authorizationStrategy: "boundArtifact",
      boundArtifactUri: uuTerritoryUri.setParameter("id", team1Medman.artifactId).toUri().toString(),
      boundArtifactPermissionMatrix: MedmanMainConstants.CONSOLE_BOUND_MATRIX,
      lockSecret,
    };

    try {
      progressClient = await ProgressClient.get(config.uuConsoleBaseUri, { code: progress.code }, { session });
    } catch (e) {
      if (e.cause?.code !== ProgressConstants.PROGRESS_DOES_NOT_EXIST) {
        throw new Errors.SetStateClosed.ProgressGetCallFailed({ progressCode: progress.code }, e);
      }
    }

    if (!progressClient) {
      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.SetStateClosed.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    } else if (dtoIn.force) {
      try {
        await progressClient.releaseLock();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_RELEASE_DOES_NOT_EXIST) {
          throw new Errors.SetStateClosed.ProgressReleaseLockCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        await progressClient.setState({ state: "cancelled" });
      } catch (e) {
        DtoBuilder.addWarning(new Warnings.SetStateClosed.ProgressSetStateCallFailed(e.cause?.paramMap));
      }

      try {
        await progressClient.delete();
      } catch (e) {
        if (e.cause?.code !== ProgressConstants.PROGRESS_DELETE_DOES_NOT_EXIST) {
          throw new Errors.SetStateClosed.ProgressDeleteCallFailed({ progressCode: progress.code }, e);
        }
      }

      try {
        progressClient = await ProgressClient.createInstance(config.uuConsoleBaseUri, progress, { session });
      } catch (e) {
        throw new Errors.SetStateClosed.ProgressCreateCallFailed({ progressCode: progress.code }, e);
      }
    }

    try {
      await progressClient.start({
        message: "Progress was started",
        totalWork: MedmanMainConstants.getSetStateClosedStepCount(),
        lockSecret,
      });
    } catch (e) {
      throw new Errors.SetStateClosed.ProgressStartCallFailed({ progressCode: progress.code }, e);
    }

    return progressClient;
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

module.exports = new SetStateClosedAbl();
