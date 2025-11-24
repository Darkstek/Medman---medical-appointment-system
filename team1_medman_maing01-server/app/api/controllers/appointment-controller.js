"use strict";
const AppointmentAbl = require("../../abl/appointment-abl.js");

class AppointmentController {

  create(ucEnv) {
    return AppointmentAbl.create(ucEnv.getUri().getAwid(), ucEnv.getDtoIn());
  }

}

module.exports = new AppointmentController();
