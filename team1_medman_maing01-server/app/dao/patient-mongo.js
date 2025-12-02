"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const {ObjectId} = require("mongodb");

class PatientMongo extends UuObjectDao {

  async createSchema(){
  }

  async create(UuObject) {
    return await super.insertOne(UuObject);
  }

  async get(awid, id) {
    return await super.findOne({awid, id});
  }

  async getByPatientId(awid, id) {
    return await super.findOne({awid, patientId: id});
  }

  async update(id, patient) {
    return await super.findOneAndUpdate({_id: id}, patient, "NONE");
  }

  async updateByPatientId(awid, patientId, patient) {
    return await super.findOneAndUpdate({awid: awid, patientId: patientId}, patient, "NONE");
  }

  async find(awid, filter, pageInfo, sort, projection) {
    return await super.find(filter, pageInfo, sort, projection);
  }
}

module.exports = PatientMongo;
