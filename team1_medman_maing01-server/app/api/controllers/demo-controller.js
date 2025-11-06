"use strict";
const DemoAbl = require("../../abl/demo-abl.js");

class DemoController {

  // noinspection JSUnusedGlobalSymbols
  sysUuAppWorkspaceInitDemo(ucEnv) {
    return DemoAbl.sysUuAppWorkspaceInitDemo(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

}

module.exports = new DemoController();
