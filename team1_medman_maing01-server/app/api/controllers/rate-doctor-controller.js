"use strict";
const RateDoctorAbl = require("../../abl/rate-doctor-abl.js");

class RateDoctorController {
  create(ucEnv) {
    return RateDoctorAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  get(ucEnv) {
    return RateDoctorAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  find(ucEnv) {
    return RateDoctorAbl.find(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new RateDoctorController();