// noinspection JSUnresolvedReference

"use strict";
const {Validator} = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;
const {ValidationHelper} = require("uu_appg01_server").AppServer;
const {ObjectId} = require("mongodb");

const Errors = require("../api/errors/rate-doctor-error.js");

const WARNINGS = {
  rateDoctorCreateDtoInType: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  rateDoctorGetDtoInType: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  rateDoctorFindDtoInType: {
    code: `${Errors.Find.UC_CODE}unsupportedKeys`
  }
};

class RateDoctorAbl {
  constructor() {
    this.validator = Validator.load();
    this.ratingDao = DaoFactory.getDao("rate-doctor");
    this.doctorDao = DaoFactory.getDao("doctor");
    this.patientDao = DaoFactory.getDao("patient");
  }

  async create(awid, dtoIn) {
    const validationResult = this.validator.validate("rateDoctorCreateDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.rateDoctorCreateDtoInType?.code,
      Errors.Create.InvalidDtoIn
    );

    let doctor = await this.doctorDao.findOne({awid, $or: [{doctorId: dtoIn.doctorId}, {_id: ObjectId.isValid(dtoIn.doctorId) ? new ObjectId(dtoIn.doctorId) : dtoIn.doctorId}]});
    if (!doctor) {
      throw new Errors.Create.DoctorNotFound({uuAppErrorMap}, {doctorId: dtoIn.doctorId})
    }

    let patient = await this.patientDao.findOne({awid: awid,$or: [{patientId: dtoIn.patientId}, {_id: ObjectId.isValid(dtoIn.patientId) ? new ObjectId(dtoIn.patientId) : dtoIn.patientId}]});
    if (!patient) {
      throw new Errors.Create.PatientNotFound({uuAppErrorMap}, {id: dtoIn.patientId})
    }

    let rating = {
      awid,
      ...dtoIn
    }

    rating = await this.ratingDao.create(rating);

    return {...rating, uuAppErrorMap};
  }

  async get(awid, dtoIn) {
    const validationResult = this.validator.validate("rateDoctorGetDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.rateDoctorGetDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );

    let rating = await this.ratingDao.get(awid, dtoIn.id);
    if (!rating) {
      throw new Errors.Get.RatingDoesNotExist({id: dtoIn.id});
    }

    return {...rating, uuAppErrorMap};
  }

  async find(awid, dtoIn) {
    const validationResult = this.validator.validate("rateDoctorFindDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.rateDoctorFindDtoInType?.code,
      Errors.Find.InvalidDtoIn
    );

    let filter = this._createFilterFrom(dtoIn);
    let sortBy = this._transformSortBy(dtoIn.sortBy) ?? {_id: -1};
    let ratingList = await this.ratingDao.find(awid, filter, dtoIn.pageInfo, sortBy, {});

    // reorder pageInfo and itemList
    return {pageInfo: ratingList.pageInfo, itemList: ratingList.itemList, uuAppErrorMap};
  }

  _createFilterFrom(dtoIn) {
    let filter = [];
    if (dtoIn.patientId) {
      filter.push({patientId: dtoIn.patientId});
    }
    if (dtoIn.doctorId) {
      filter.push({doctorId: dtoIn.doctorId});
    }

    if (filter.length === 0) {
      return {};
    } else {
      return dtoIn.searchMode === "and" ? {$and: filter} : {$or: filter};
    }
  }

  _transformSortBy(sortBy = {}) {
    return Object.fromEntries(
      Object.entries(sortBy).map(([field, direction]) => [field, direction === "asc" ? 1 : -1])
    );
  }
}

module.exports = new RateDoctorAbl();
