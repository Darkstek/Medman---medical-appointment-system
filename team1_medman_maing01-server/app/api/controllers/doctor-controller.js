"use strict";
const DoctorAbl = require("../../abl/doctor-abl.js");

class DoctorController {

  find(ucEnv) {
    return DoctorAbl.find(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  create(ucEnv) {
    return DoctorAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  get(ucEnv) {
    return DoctorAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

}

module.exports = new DoctorController();
