"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class AppointmentMongo extends UuObjectDao {

  async createSchema(){
  }

  async create(UuObject) {
    return await super.insertOne(UuObject);
  }

  async get(awid, id) {
    return await super.findOne({id});
  }

  async find(awid, filter, pageInfo, sort, projection) {
    return await super.find(filter, pageInfo, sort, projection);
  }
}

module.exports = AppointmentMongo;
