// noinspection JSUnresolvedReference

"use strict";
const Path = require("node:path");
const fs = require("node:fs").promises;
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { LoggerFactory } = require("uu_appg01_server").Logging;

const DATA_FILES = [
  { id: "doctor", path: Path.join(__dirname, "../config/demo-data/doctors.json") },
  { id: "patient", path: Path.join(__dirname, "../config/demo-data/patients.json") },
  { id: "appointment", path: Path.join(__dirname, "../config/demo-data/appointments.json") },
]

const logger = LoggerFactory.get();

class DemoAbl {

  constructor() {
    this.validator = Validator.load();
    this.daoList = {};
    this.daoList["doctor"] = DaoFactory.getDao("doctor");
    this.daoList["patient"] = DaoFactory.getDao("patient");
    this.daoList["appointment"] = DaoFactory.getDao("appointment");
  }

  async sysUuAppWorkspaceInitDemo() {
    let dtoOut = {};
    for (let definition of DATA_FILES) {
      const data = await fs.readFile(definition.path);
      let dataJson = JSON.parse(data);
      let dao = this.daoList[definition.id];
      let existingIds = await dao.distinct("id");
      let convertedExistingIds = existingIds.itemList.map(value => {
        return { _id: value }
      });
      if (convertedExistingIds?.length > 0) {
        logger.info(`Deleting ${convertedExistingIds.length} existing ${definition.id} items`);
        await dao.deleteMany({ $or: convertedExistingIds });
      }
      logger.info(`Creating ${convertedExistingIds.length} new ${definition.id} items`);
      dtoOut[definition.id] = await dao.insertMany(dataJson);
    }

    return dtoOut;
  }

}

module.exports = new DemoAbl();
