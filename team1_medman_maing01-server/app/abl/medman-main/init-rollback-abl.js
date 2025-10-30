"use strict";
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { UuAppWorkspace } = require("uu_appg01_server").Workspace;
const { AuthenticationService } = require("uu_appg01_server").Authentication;
const { ConsoleClient, ProgressClient } = require("uu_consoleg02-uulib");
const { UuTerrClient: UuTerritoryClient } = require("uu_territory_clientg01");
const Errors = require("../../api/errors/medman-main-error");
const Warnings = require("../../api/warnings/medman-main-warning");
const DtoBuilder = require("../../components/dto-builder");
const Validator = require("../../components/validator");
const TerritoryConstants = require("../../constants/territory-constants");
const ScriptEngineClient = require("../../components/script-engine-client");
const StepHandler = require("../../components/step-handler");
const ConsoleConstants = require("../../constants/console-constants");
const ProgressConstants = require("../../constants/progress-constants");
const MedmanMainConstants = require("../../constants/medman-main-constants");

class InitRollbackAbl {
  constructor() {
    this.dao = DaoFactory.getDao(MedmanMainConstants.Schemas.MEDMAN_INSTANCE);
  }

  async initRollback(appUri, configuration, lockSecret) {
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const scriptEngineClient = new ScriptEngineClient({
      scriptEngineUri: configuration.uuScriptEngineBaseUri,
      consoleUri: configuration.uuConsoleBaseUri,
      consoleCode: MedmanMainConstants.getMainConsoleCode(appUri.getAwid()),
      scriptRepositoryUri: configuration.uuScriptRepositoryBaseUri,
      session: sysIdentitySession,
    });
    const scriptDtoIn = {
      team1MedmanUri: appUri.toString(),
      lockSecret,
    };

    return await scriptEngineClient.runScript({
      scriptCode: "team1_medman_maing01-uuscriptlib/medman-main/init-rollback",
      scriptDtoIn,
    });
  }

  async _initFinalizeRollback(uri, dtoIn) {
    // HDS 1
    const awid = uri.getAwid();
    Validator.validateDtoInCustom(uri, dtoIn, "sysUuAppWorkspaceInitFinalizeRollbackDtoInType");

    // HDS 2
    let team1Medman = await this.dao.getByAwid(awid);

    // HDS 3
    if (!team1Medman) {
      // 3.1
      throw new Errors._initFinalizeRollback.Team1MedmanDoesNotExist({ awid });
    }

    if (![MedmanMainConstants.StateMap.BEING_INITIALIZED, MedmanMainConstants.StateMap.CREATED].includes(team1Medman.state)) {
      // 3.2
      throw new Errors._initFinalizeRollback.NotInProperState({
        state: team1Medman.state,
        expectedStateList: [MedmanMainConstants.StateMap.BEING_INITIALIZED, MedmanMainConstants.StateMap.CREATED],
      });
    }

    // HDS 4
    const sysIdentitySession = await AuthenticationService.authenticateSystemIdentity();
    const { uuConsoleUri, progressCode, consoleCode } = team1Medman.temporaryData.progressMap;
    let progressClient = null;
    if (
      !team1Medman.temporaryData.rollbackStepList.includes(MedmanMainConstants.InitRollbackStepMap.PROGRESS_DELETED.code)
    ) {
      progressClient = await ProgressClient.get(
        uuConsoleUri,
        { code: progressCode, lockSecret: dtoIn.lockSecret },
        { session: sysIdentitySession },
      );
    }
    const stepHandler = new StepHandler({
      schema: MedmanMainConstants.Schemas.MEDMAN_INSTANCE,
      progressClient,
      stepList: team1Medman.temporaryData.rollbackStepList,
      rollbackMode: true,
    });

    // TODO If your application requires any additional steps, add them here...

    // HDS 5
    if (team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.CONSOLE_CREATED.code)) {
      team1Medman = await stepHandler.handleStep(
        team1Medman,
        MedmanMainConstants.InitRollbackStepMap.CONSOLE_CLEARED,
        async () => {
          await this._clearConsole(uuConsoleUri, consoleCode, sysIdentitySession);
        },
      );
    }

    // HDS 6
    if (team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.WS_CONNECTED.code)) {
      team1Medman = await stepHandler.handleStep(
        team1Medman,
        MedmanMainConstants.InitRollbackStepMap.WS_DISCONNECTED,
        async () => {
          await UuAppWorkspace.setAuthorizationStrategy(
            uri,
            {
              authorizationStrategy: "roleGroupInterface",
              roleGroupUriMap: {},
            },
            sysIdentitySession,
          );
        },
      );
    }

    // HDS 7
    if (team1Medman.temporaryData.stepList.includes(MedmanMainConstants.InitStepMap.AWSC_CREATED.code)) {
      await stepHandler.handleStep(team1Medman, MedmanMainConstants.InitRollbackStepMap.AWSC_DELETED, async () => {
        await this._deleteAwsc(team1Medman, uri, sysIdentitySession);
      });
    }

    // HDS 8
    await stepHandler.handleStep(
      team1Medman,
      MedmanMainConstants.InitRollbackStepMap.PROGRESS_DELETED,
      async () => {
        let progressExists = true;
        try {
          await progressClient.end({
            state: ProgressConstants.StateMap.COMPLETED,
            message: "Rollback finished.",
            doneWork: MedmanMainConstants.getInitRollbackStepCount(),
          });
        } catch (e) {
          if (e.cause?.code?.endsWith("progressDoesNotExist")) {
            progressExists = false;
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressDoesNotExist({ code: progressClient.progress.code }));
          } else if (e.cause?.code?.endsWith("progressIsNotInProperState") && e.cause.paramMap?.state?.includes("completed")) {
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressEndCallFailed({
              code: progressClient.progress.code,
              state: e.cause.paramMap.state,
            }));
          } else {
            throw new Errors._initFinalizeRollback.ProgressEndCallFailed({}, e);
          }
        }

        try {
          progressExists && await progressClient.setState({
            state: ProgressConstants.StateMap.CANCELLED,
          });
        } catch (e) {
          if (e.cause?.code?.endsWith("progressDoesNotExist")) {
            progressExists = false;
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressDoesNotExist({ code: progressClient.progress.code }));
          } else if (e.cause?.code?.endsWith("progressIsNotInProperState") && e.cause.paramMap?.state === "cancelled") {
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressSetStateCallFailed({
              code: progressClient.progress.code,
              state: e.cause.paramMap?.state,
            }));
          } else {
            throw new Errors._initFinalizeRollback.ProgressSetStateCallFailed({}, e);
          }
        }

        try {
          progressExists && await progressClient.delete();
        } catch (e) {
          if (e.cause?.code?.endsWith("progressDoesNotExist")) {
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressDoesNotExist({ code: progressClient.progress.code }));
          } else if (e.cause?.code?.endsWith("progressIsNotInProperState")) {
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ProgressDeleteCallFailed({
              code: progressClient.progress.code,
              state: e.cause.paramMap?.state,
            }));
          } else {
            throw new Errors._initFinalizeRollback.ProgressDeleteCallFailed({}, e);
          }
        }
      },
      false,
    );

    // HDS 9
    await this.dao.deleteByAwid(awid);

    // HDS 10
    try {
      await UuAppWorkspace.setAssignedSysState(awid);
    } catch (e) {
      throw new Errors._initFinalizeRollback.SetAssignedSysStateFailed({}, e);
    }

    // HDS 11
    return DtoBuilder.prepareDtoOut();
  }

  async _clearConsole(uuConsoleUri, consoleCode, session) {
    let consoleClient;
    try {
      consoleClient = await ConsoleClient.get(uuConsoleUri, { code: consoleCode }, { session });
    } catch (e) {
      if (e.cause?.code === ConsoleConstants.CONSOLE_GET_DOES_NOT_EXISTS) {
        throw new Errors._initFinalizeRollback.ConsoleGetCallFailed({ code: consoleCode }, e);
      }
    }

    try {
      await consoleClient.clear();
    } catch (e) {
      if (e.cause?.code === ConsoleConstants.CONSOLE_CLEAR_DOES_NOT_EXISTS) {
        DtoBuilder.addWarning(new Warnings._initFinalizeRollback.ConsoleDoesNotExist({ code: consoleCode }));
      } else {
        throw new Errors._initFinalizeRollback.ConsoleClearCallFailed({ code: consoleCode }, e);
      }
    }
  }

  async _deleteAwsc(team1Medman, appUri, session) {
    const appClientOpts = { baseUri: team1Medman.uuTerritoryBaseUri, appUri, session };

    try {
      await UuTerritoryClient.Awsc.setState(
        {
          id: team1Medman.artifactId,
          state: MedmanMainConstants.StateMap.FINAL,
        },
        appClientOpts,
      );
    } catch (e) {
      let throwError = true;

      switch (e.code) {
        case TerritoryConstants.ARTIFACT_DOES_NOT_EXIST:
          // 5.1.1.
          throwError = false;
          DtoBuilder.addWarning(new Warnings._initFinalizeRollback.UuAwscDoesNotExist());
          break;

        case TerritoryConstants.INVALID_ARTIFACT_STATE:
          if (e.paramMap?.artifactState === MedmanMainConstants.StateMap.FINAL) {
            // 5.1.2.
            throwError = false;
            DtoBuilder.addWarning(new Warnings._initFinalizeRollback.UuAwscDoesNotExist());
          }
          break;
      }

      if (throwError) {
        // 5.1.3.
        throw new Errors.MedmanMain.SetAwscStateFailed({}, e);
      }
    }

    try {
      await UuTerritoryClient.Awsc.delete({ id: team1Medman.artifactId }, appClientOpts);
    } catch (e) {
      if (e.code === TerritoryConstants.ARTIFACT_DOES_NOT_EXIST) {
        // 5.2.1.
        DtoBuilder.addWarning(new Warnings._initFinalizeRollback.UuAwscDoesNotExist());
      } else {
        // 5.2.2.
        throw new Errors.MedmanMain.DeleteAwscFailed({}, e);
      }
    }
  }
}

module.exports = new InitRollbackAbl();
