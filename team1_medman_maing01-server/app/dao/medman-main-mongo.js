"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;
const { DbConnection } = require("uu_appg01_datastore");

class MedmanMainMongo extends UuObjectDao {
  async createSchema() {
    await super.createIndex({ awid: 1 }, { unique: true });
  }

  async create(uuObject) {
    return await super.insertOne(uuObject);
  }

  async getByAwid(awid) {
    return await super.findOne({ awid });
  }

  async update(uuObject) {
    let filter = {
      awid: uuObject.awid,
      id: uuObject.id,
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async updateByAwid(uuObject) {
    let filter = {
      awid: uuObject.awid,
    };
    return await super.findOneAndUpdate(filter, uuObject, "NONE");
  }

  async deleteByAwid(awid) {
    return await super.deleteOne({ awid });
  }

  async cleanWorkspaceAuthStrategy(awid) {
    const db = await DbConnection.get(this.customUri);
    let data = { authorizationStrategy: "", artifactUri: "" };
    return await db.collection("sysUuAppWorkspace").findOneAndUpdate({ awid }, { $unset: data });
  }
}

module.exports = MedmanMainMongo;
