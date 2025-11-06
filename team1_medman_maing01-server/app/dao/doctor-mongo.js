"use strict";
const { UuObjectDao } = require("uu_appg01_server").ObjectStore;

class DoctorMongo extends UuObjectDao {

  async createSchema(){
  }

}

module.exports = DoctorMongo;
