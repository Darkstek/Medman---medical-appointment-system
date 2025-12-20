"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class RateDoctorMongo extends UuObjectDao {

  async createSchema(){
  }

  async create(UuObject) {
    return await super.insertOne(UuObject);
  }

  async get(awit, id) {
    return await super.findOne({id});
  }

  async find(awid, filter, pageInfo, sort, projection) {
    return await super.find(filter, pageInfo, sort, projection);
  }
}

module.exports = RateDoctorMongo;
