"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/permission-error.js");

const WARNINGS = {

};

class PermissionAbl {
  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("sysPermission");
  }

  async get(awid, dtoIn, session) {
    const uuIdentity = session.getIdentity().getUuIdentity();

    const profiles = await this.dao.getProfilesByUuIdentity(awid, uuIdentity);

    return {
      uuIdentity,
      profiles
    };
  }


}

module.exports = new PermissionAbl();
