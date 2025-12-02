"use strict";
const PatientAbl = require("../../abl/patient-abl.js");

class PatientController {

  create(ucEnv) {
    return PatientAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
  update(ucEnv) {
    return PatientAbl.update(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
  find(ucEnv) {
    return PatientAbl.find(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
  get(ucEnv) {
    return PatientAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

}

module.exports = new PatientController();
