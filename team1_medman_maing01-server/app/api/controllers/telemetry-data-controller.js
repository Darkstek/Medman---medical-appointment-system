"use strict";
const TelemetryDataAbl = require("../../abl/telemetry-data-abl.js");

class TelemetryDataController {

  // noinspection JSUnusedGlobalSymbols
  sysLogTelemetryData(ucEnv) {
    return TelemetryDataAbl.sysLogTelemetryData(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

}

module.exports = new TelemetryDataController();
