"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class AppointmentMongo extends UuObjectDao {

  async createSchema(){
  }

  async create(UuObject) {
    return await super.insertOne(UuObject);
  }
}

module.exports = AppointmentMongo;
