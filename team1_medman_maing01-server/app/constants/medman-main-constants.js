"use strict";

//@@viewOn:constants
const MedmanMainConstants = {
  AWSC_PREFIX: "team1-medman",
  CONSOLE_PREFIX: "medman",
  ERROR_PREFIX: "team1-medman-main",
  INIT_PROGRESS_CODE_PREFIX: "team1-medman-maing01-progress-init-",
  INIT_PROGRESS_NAME_PREFIX: "team1Medman Init ",
  SET_STATE_CLOSED_PROGRESS_CODE_PREFIX: "team1-medman-maing01-progress-setStateClosed-",
  SET_STATE_CLOSED_PROGRESS_NAME_PREFIX: "team1Medman Set State Closed ",
  CLEAR_PROGRESS_CODE_PREFIX: "team1-medman-maing01-progress-clear-",
  CLEAR_PROGRESS_NAME_PREFIX: "team1Medman Clear ",
  UUAPP_CODE: "team1-medman-maing01",

  CONFIG_CACHE_KEY: "configuration",
  UU_APP_ERROR_MAP: "uuAppErrorMap",

  // This is bound matrix of uuAwsc and uuConsole which has authorization bounded to that uuAwsc.
  CONSOLE_BOUND_MATRIX: {
    Authorities: ["Authorities", "Readers", "Writers"],
    Operatives: ["Readers", "Writers"],
    Auditors: ["Readers"],
    SystemIdentity: ["Authorities", "Readers", "Writers"],
  },

  InitStepMap: {
    MEDMAN_OBJECT_CREATED: { code: "team1MedmanObjectCreated", message: "The uuObject of team1Medman created." },
    AWSC_CREATED: { code: "uuAwscCreated", message: "The uuAwsc of team1Medman created." },
    WS_CONNECTED: { code: "uuAppWorkspaceConnected", message: "The team1Medman uuAppWorkspace connected." },
    CONSOLE_CREATED: { code: "consoleCreated", message: "The console of team1Medman created." },
    PROGRESS_ENDED: { code: "progressEnded", message: "The progress has been ended." },
    WS_ACTIVE: { code: "uuAppWorkspaceActiveState", message: "The uuAppWorkspace of team1Medman set to active state." },
  },

  InitRollbackStepMap: {
    CONSOLE_CLEARED: { code: "consoleCleared", message: "The team1Medman console has been cleared." },
    WS_DISCONNECTED: { code: "uuAppWorkspaceDisonnected", message: "The team1Medman uuAppWorkspace disconnected." },
    AWSC_DELETED: { code: "uuAwscDeleted", message: "The uuAwsc of team1Medman deleted." },
    PROGRESS_DELETED: { code: "progressDeleted", message: "The progress has been deleted." },
  },

  SetStateClosedStepMap: {
    CLOSE_STARTED: { code: "setStateClosedStarted", message: "SetStateClosed has started." },
    AWSC_CLOSED: { code: "uuAwscClosed", message: "The uuObject of team1Medman set to closed state." },
    PROGRESS_ENDED: { code: "progressEnded", message: "The progress has been ended." },
  },

  ClearStepMap: {
    CLEAR_STARTED: { code: "clearStarted", message: "Clear has started." },
    INIT_PROGRESS_DELETED: { code: "initProgressDeleted", message: "The init progress has been deleted." },
    SET_STATE_CLOSED_PROGRESS_DELETED: {
      code: "setStateClosedProgressDeleted",
      message: "The setStateClosed progress has been deleted.",
    },
    CONSOLE_CLEARED: { code: "consoleCleared", message: "The team1Medman console has been cleared." },
    AUTH_STRATEGY_UNSET: {
      code: "authorizationStrategyUnset",
      message: "The authorization strategy has been unset.",
    },
    AWSC_DELETED: { code: "uuAwscDeleted", message: "The uuAwsc of team1Medman deleted." },
    PROGRESS_ENDED: { code: "progressEnded", message: "The progress has been ended." },
  },

  ModeMap: {
    STANDARD: "standard",
    RETRY: "retry",
    ROLLBACK: "rollback",
  },

  ProfileMask: {
    STANDARD_USER: parseInt("00010000000000000000000000000000", 2),
  },

  PropertyMap: {
    CONFIG: "config",
    SCRIPT_CONFIG: "scriptConfig",
    MEDMAN_CONFIG: "team1MedmanConfig",
  },

  Schemas: {
    MEDMAN_INSTANCE: "medmanMain",
  },

  SharedResources: {
    SCRIPT_CONSOLE: "uu-console-maing02",
    SCRIPT_ENGINE: "uu-script-engineg02",
  },

  StateMap: {
    CREATED: "created",
    BEING_INITIALIZED: "beingInitialized",
    ACTIVE: "active",
    FINAL: "closed",
  },

  getMainConsoleCode: (awid) => {
    return `team1-medman-maing01-console-${awid}`;
  },

  getInitProgressCode: (awid) => {
    return `${MedmanMainConstants.INIT_PROGRESS_CODE_PREFIX}${awid}`;
  },

  getInitProgressName: (awid) => {
    return `${MedmanMainConstants.INIT_PROGRESS_NAME_PREFIX}${awid}`;
  },

  getSetStateClosedProgressName: (awid) => {
    return `${MedmanMainConstants.SET_STATE_CLOSED_PROGRESS_NAME_PREFIX}${awid}`;
  },

  getSetStateClosedProgressCode: (awid) => {
    return `${MedmanMainConstants.SET_STATE_CLOSED_PROGRESS_CODE_PREFIX}${awid}`;
  },

  getClearProgressName: (awid) => {
    return `${MedmanMainConstants.CLEAR_PROGRESS_NAME_PREFIX}${awid}`;
  },

  getClearProgressCode: (awid) => {
    return `${MedmanMainConstants.CLEAR_PROGRESS_CODE_PREFIX}${awid}`;
  },

  getInitStepCount: () => {
    return Object.keys(MedmanMainConstants.InitStepMap).length;
  },

  getInitRollbackStepCount: () => {
    return Object.keys(MedmanMainConstants.InitRollbackStepMap).length;
  },

  getSetStateClosedStepCount: () => {
    return Object.keys(MedmanMainConstants.SetStateClosedStepMap).length;
  },

  getClearStepCount: () => {
    return Object.keys(MedmanMainConstants.ClearStepMap).length;
  },
};
//@@viewOff:constants

//@@viewOn:exports
module.exports = MedmanMainConstants;
//@@viewOff:exports
