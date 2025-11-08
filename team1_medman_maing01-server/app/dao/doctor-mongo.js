"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class DoctorMongo extends UuObjectDao {

  async createSchema(){
  }

  async create(UuObject) {
    return await super.insertOne(UuObject);
  }

  async get(awid, id) {
    return await super.findOne({id, awid});
  }

}

module.exports = DoctorMongo;
