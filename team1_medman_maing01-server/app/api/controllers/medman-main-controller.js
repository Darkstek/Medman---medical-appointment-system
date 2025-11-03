"use strict";
const MedmanMainAbl = require("../../abl/medman-main-abl.js");

class MedmanMainController {
  init(ucEnv) {
    return MedmanMainAbl.init(ucEnv.getUri(), ucEnv.getDtoIn(), ucEnv.getSession());
  }

  load(ucEnv) {
    return MedmanMainAbl.load(ucEnv.getUri(), ucEnv.getSession());
  }

  loadBasicData(ucEnv) {
    return MedmanMainAbl.loadBasicData(ucEnv.getUri(), ucEnv.getSession());
  }
}

module.exports = new MedmanMainController();
