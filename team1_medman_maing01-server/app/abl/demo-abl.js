// noinspection JSUnresolvedReference

"use strict";
const Path = require("path");
const fs = require("fs").promises;
const {Validator} = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;

const DOCTORS_CONFIG = Path.join(__dirname, "../config/demo-data/doctors.json");

class DemoAbl {

  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("doctor");
  }

  async sysUuAppWorkspaceInitDemo() {
    const doctorDemoData = await fs.readFile(DOCTORS_CONFIG);
    let doctors = JSON.parse(doctorDemoData);
    let existingIds = await this.dao.distinct("id");
    let convertedExistingIds = existingIds.itemList.map(value => {
      return {_id: value}
    });
    if (convertedExistingIds?.length > 0) {
      await this.dao.deleteMany({$or: convertedExistingIds});
    }
    await this.dao.insertMany(doctors);

    return doctors;
  }

}

module.exports = new DemoAbl();
