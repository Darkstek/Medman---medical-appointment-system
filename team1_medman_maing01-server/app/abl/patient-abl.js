// noinspection JSUnresolvedReference

"use strict";
const {Validator} = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;
const {ValidationHelper} = require("uu_appg01_server").AppServer;
const Errors = require("../api/errors/patient-error.js");

const WARNINGS = {
  patientCreateDtoInType: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  patientGetDtoInType: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  patientFindDtoInType: {
    code: `${Errors.Find.UC_CODE}unsupportedKeys`
  },
  patientUpdateDtoInType: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`
  }
};


class PatientAbl {

  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("patient");
  }

  /**
   * Creates a new patient record based on the provided data transfer object (DTO).
   *
   * @param {string} awid - Unique identifier of the application workspace.
   * @param {Object} dtoIn - Data transfer object containing the details for the new patient.
   * @return {Promise<Object>} - A promise that resolves to the created patient record along with the validation error map.
   */
  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("patientCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.patientCreateDtoInType?.code,
      Errors.Create.InvalidDtoIn
    );

    let patient = {
      awid,
      ...dtoIn
    }

    patient = await this.dao.create(patient);

    return {...patient, uuAppErrorMap};
  }

  /**
   * Updates a patient record in the database based on the provided data.
   *
   * @param {string} awid - An active identifier for the workspace (application workspace ID).
   * @param {Object} dtoIn - Data transfer object containing the patient details to update.
   * Includes properties such as `id` and `patientId`.
   * @returns {Object} An object containing the updated patient record and `uuAppErrorMap` with information about executed validations and potential warnings or errors.
   */
  async update(awid, dtoIn) {
    const validationResult = this.validator.validate("patientUpdateDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.patientUpdateDtoInType?.code,
      Errors.Update.InvalidDtoIn
    );

    await this.get(awid, { id: dtoIn.id, patientId: dtoIn.patientId }); // throws if the patient does not exist

    let patient;
    if (dtoIn.patientId && !dtoIn.id) {
      patient = await this.dao.updateByPatientId(awid, dtoIn.patientId, dtoIn);
    } else {
      patient = await this.dao.update(dtoIn.id, dtoIn);
    }

    return {...patient, uuAppErrorMap};
  }

  /**
   * Retrieves patient data based on the provided unique identifiers.
   *
   * @param {string} awid - The application workspace ID.
   * @param {object} dtoIn - Data transfer object containing the input parameters.
   * @param {string} [dtoIn.id] - Unique identifier of the patient.
   * @param {string} [dtoIn.patientId] - Alternative unique identifier of the patient.
   * @returns {Promise<object>} A promise that resolves to the patient data, including any error mapping if applicable.
   * @throws {Errors.Get.InvalidDtoIn} If the input data is invalid.
   * @throws {Errors.Get.PatientDoesNotExist} If no patient matches the provided identifiers.
   */
  async get(awid, dtoIn) {
    let uuAppErrorMap;
    const validationResult = this.validator.validate("patientGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.patientGetDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );

    let patient;
    if (dtoIn.patientId && !dtoIn.id) {
      patient = await this.dao.getByPatientId(awid, dtoIn.patientId);
    } else {
      patient = await this.dao.get(awid, dtoIn.id);
    }

    if (!patient) {
      throw new Errors.Get.PatientDoesNotExist({uuAppErrorMap}, {id: dtoIn.id, patientId: dtoIn.patientId});
    }

    return {...patient, uuAppErrorMap};
  }

  async find(awid, dtoIn) {
    const validationResult = this.validator.validate("patientFindDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.patientFindDtoInType?.code,
      Errors.Find.InvalidDtoIn
    );
    let filter = this._createFilterFrom(dtoIn);
    let sortBy = this._transformSortBy(dtoIn.sortBy) ?? {lastName: -1};
    let patientList = await this.dao.find(awid, filter, dtoIn.pageInfo, sortBy, {});

    // reorder pageInfo and itemList
    return {pageInfo: patientList.pageInfo, itemList: patientList.itemList, uuAppErrorMap};
  }


  /**
   * Creates a filter object based on the input criteria.
   *
   * @param {Object} dtoIn - The input data object containing filter criteria.
   * @param {string} [dtoIn.firstName] - The first name to filter by (supports partial match, case-insensitive).
   * @param {string} [dtoIn.lastName] - The last name to filter by (supports partial match, case-insensitive).
   * @param {string} [dtoIn.gender] - The gender to filter by (supports partial match, case-insensitive).
   * @param {string} [dtoIn.phoneNumber] - The phone number to filter by (supports partial match, case-insensitive).
   * @param {string} [dtoIn.emailAddress] - The email address to filter by (supports partial match, case-insensitive).
   * @param {Date} [dtoIn.dateOfBirth] - The specific date of birth to filter by.
   * @param {string} [dtoIn.searchMode] - Determines whether filters should use "and" or "or" logic. Defaults to "or".
   * @param {string} [dtoIn.status] - The status to filter by (defaults to "active" if searchMode is "and").
   * @param {string} [dtoIn.insuranceNumber] - The insurance number to filter by (supports partial match, case-insensitive).
   * @return {Object} A MongoDB-compatible query object containing the filter logic, using `$and` or `$or` depending on the search mode.
   */
  _createFilterFrom(dtoIn) {
    let filter = [];
    if (dtoIn.firstName) {
      filter.push({firstName: {$regex: dtoIn.firstName, $options: "i"}});
    }
    if (dtoIn.lastName) {
      filter.push({lastName: {$regex: dtoIn.lastName, $options: "i"}});
    }
    if (dtoIn.gender) {
      filter.push({gender: {$regex: dtoIn.gender, $options: "i"}});
    }
    if (dtoIn.phoneNumber) {
      filter.push({phoneNumber: {$regex: dtoIn.phoneNumber, $options: "i"}});
    }
    if (dtoIn.emailAddress) {
      filter.push({emailAddress: {$regex: dtoIn.emailAddress, $options: "i"}});
    }
    if (dtoIn.dateOfBirth) {
      filter.push({dateOfBirth: dtoIn.dateOfBirth});
    }
    if (dtoIn.searchMode === "and") {
      filter.push({status: dtoIn.status ?? "active"});
    }
    if (dtoIn.insuranceNumber) {
      filter.push({insuranceNumber: {$regex: dtoIn.insuranceNumber, $options: "i"}});
    }
    if (filter.length === 0) {
      return {};
    } else {
      return dtoIn.searchMode === "and" ? {$and: filter} : {$or: filter};
    }
  }

  /**
   * Transforms the sorting parameter map by converting sorting directions from "asc"/"desc"
   * to 1 and -1 respectively.
   *
   * @param {Map} sortBy - A map representing fields and their corresponding sorting directions.
   *                          Keys are field names, and values are either "asc" or "desc".
   * @return {Object} A transformed object where sorting directions are represented by 1 (for "asc")
   *                  and -1 (for "desc").
   */
  _transformSortBy(sortBy = {}) {
    return Object.fromEntries(
      Object.entries(sortBy).map(([field, direction]) => [field, direction === "asc" ? 1 : -1])
    );
  }

}

module.exports = new PatientAbl();
