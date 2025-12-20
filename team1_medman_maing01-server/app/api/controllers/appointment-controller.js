"use strict";
const AppointmentAbl = require("../../abl/appointment-abl.js");

class AppointmentController {

  create(ucEnv) {
    return AppointmentAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  updateNotes(ucEnv) {
    return AppointmentAbl.updateNotes(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  updateStatus(ucEnv) {
    return AppointmentAbl.updateStatus(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  get(ucEnv) {
    return AppointmentAbl.get(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  find(ucEnv) {
    return AppointmentAbl.find(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

  cancel(ucEnv) {
    return AppointmentAbl.cancel(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }
}

module.exports = new AppointmentController();
