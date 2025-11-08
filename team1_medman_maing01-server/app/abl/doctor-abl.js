"use strict";
const Path = require("path");
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/doctor-error.js");

const WARNINGS = {
  doctorCreateDtoInType: {
    code: '${Errors.Create.UC_CODE}unsupportedKeys'
  },
  doctorGetDtoInType: {
    code: '${Errors.Get.UC_CODE}unsupportedKeys'
  }
};

class DoctorAbl {

  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("doctor");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    /*const validationResult = this.validator.validate("doctorCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.doctorCreateDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );*/

    let doctor = {
      awid,
      ...dtoIn
    }

    doctor = await this.dao.create(doctor);

    return {...doctor, uuAppErrorMap};
  }

  async get(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("doctorGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.doctorGetDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );

    let doctor = await this.dao.get(awid, dtoIn.id);
    if (!doctor) {
      throw new Errors.Get.DoctorDoesNotExist({id: dtoIn.id});
    }

    return {...doctor, uuAppErrorMap};
  }

}

module.exports = new DoctorAbl();
