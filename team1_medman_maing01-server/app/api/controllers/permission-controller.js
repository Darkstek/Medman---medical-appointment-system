"use strict";
const PermissionAbl = require("../../abl/permission-abl.js");

class PermissionController {

  get(ucEnv) {
    return PermissionAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

}

module.exports = new PermissionController();
