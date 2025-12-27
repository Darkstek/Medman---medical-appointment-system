// noinspection JSUnresolvedReference

"use strict";
const {Validator} = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;
const {ValidationHelper} = require("uu_appg01_server").AppServer;
const {AppointmentStatus} = require("../enums/appointment-status");
const Errors = require("../api/errors/doctor-error.js");

const WARNINGS = {
  doctorCreateDtoInType: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  doctorGetDtoInType: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  doctorFindDtoInType: {
    code: `${Errors.Find.UC_CODE}unsupportedKeys`
  },
  doctorUpdateDtoInType: {
    code: `${Errors.Update.UC_CODE}unsupportedKeys`
  },
  doctorRemoveDtoInType: {
    code: `${Errors.Remove.UC_CODE}unsupportedKeys`
  },
};

class DoctorAbl {

  constructor() {
    this.validator = Validator.load();
    this.dao = DaoFactory.getDao("doctor");
    this.appointmentDao = DaoFactory.getDao("appointment");
    this.rateDoctorDao = DaoFactory.getDao("rate-doctor");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};

    const validationResult = this.validator.validate("doctorCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      WARNINGS.doctorCreateDtoInType?.code,
      Errors.Create.InvalidDtoIn
    );

    const doctor = {
      awid,
      status: dtoIn.status ?? "active",
      ...dtoIn,
    };

    const created = await this.dao.create(doctor);

    return { ...created, uuAppErrorMap };
  }

  async get(awid, dtoIn) {
    let uuAppErrorMap;
    const validationResult = this.validator.validate("doctorGetDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.doctorGetDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );

    let doctor = await this.dao.get(awid, dtoIn.id);
    if (!doctor) {
      throw new Errors.Get.DoctorDoesNotExist({id: dtoIn.id});
    }

    await this._addRating(awid, doctor);

    return {...doctor, uuAppErrorMap};
  }


  /**
   * Finds a list of doctors based on provided criteria and retrieves it from the data source.
   *
   * @param {string} awid - The application workspace ID.
   * @param {Object} dtoIn - Data transfer object containing the search criteria and paging information.
   * @param {Object} dtoIn.availableBetween - Time range for filtering available doctors (optional).
   * @param {Object} dtoIn.sortBy - Criteria for sorting the results (optional).
   * @param {Object} dtoIn.pageInfo - Paging information for the query (optional).
   * @return {Promise<Object>} A promise resolving to an object containing the resulting list of doctors.
   * @return {Object} Result object consisting of:
   * pageInfo - Paging information for the result set.
   * itemList - List of doctors meeting the specified criteria.
   * uuAppErrorMap - Map of validation errors and warnings that occurred during processing.
   */
  async find(awid, dtoIn) {
    const validationResult = this.validator.validate("doctorFindDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.doctorFindDtoInType?.code,
      Errors.Find.InvalidDtoIn
    );
    let filter = this._createFilterFrom(dtoIn);
    let sortBy = this._transformSortBy(dtoIn.sortBy) ?? {averageRating: -1};
    let doctorList = await this.dao.find(awid, filter, dtoIn.pageInfo, sortBy, {});

    if (dtoIn.availableBetween) {
      // keep only doctors with available time slots in the specified range
      doctorList.itemList = doctorList.itemList.filter(doctor => {
        return doctor.availableTimeSlots.some(slot =>
          slot.start >= dtoIn.availableBetween.start && slot.end <= dtoIn.availableBetween.end)
      });
    }

    if (dtoIn.searchMode === "or" && dtoIn.status) { // we need this because in "or" mode we can have a result containing doctors with any status
      doctorList.itemList = doctorList.itemList.filter(doctor => doctor.status === dtoIn.status);
    }

    await Promise.all(doctorList.itemList.map(doctor => this._addRating(awid, doctor)));

    if (dtoIn.averageRatingAbove) {
      doctorList.itemList = doctorList.itemList.filter(doctor => doctor.averageRating >= dtoIn.averageRatingAbove);
    }

    if (dtoIn.ratingCountGreaterThan) {
      doctorList.itemList = doctorList.itemList.filter(doctor => doctor.ratingCount > dtoIn.ratingCountGreaterThan);
    }

    // reorder pageInfo and itemList
    return {pageInfo: doctorList.pageInfo, itemList: doctorList.itemList, uuAppErrorMap};
  }


  /**
   * Creates a filter object based on the input data transfer object (dtoIn).
   * The filter is constructed with conditions for various fields using regex and comparison operators.
   *
   * @param {Object} dtoIn - The input object containing filtering criteria.
   * @param {string} [dtoIn.firstName] - Filter condition for the first name, using case-insensitive partial match.
   * @param {string} [dtoIn.lastName] - Filter condition for the last name, using case-insensitive partial match.
   * @param {string} [dtoIn.specialization] - Filter condition for the specialization, using case-insensitive partial match.
   * @param {string} [dtoIn.phoneNumber] - Filter condition for the phone number, using case-insensitive partial match.
   * @param {string} [dtoIn.emailAddress] - Filter condition for the email address, using case-insensitive partial match.
   * @param {string} [dtoIn.clinicId] - Filter condition for the clinic ID.
   * @param {string} [dtoIn.status] - Filter condition for the doctor status (active or inactive).
   * @param {string} [dtoIn.description] - Filter condition for the doctor description, using case-insensitive partial match.
   * @return {Object} The constructed filter object.
   * @*/
  _createFilterFrom(dtoIn) {
    let filter = [];
    if (dtoIn.firstName) {
      filter.push({firstName: {$regex: dtoIn.firstName, $options: "i"}});
    }
    if (dtoIn.lastName) {
      filter.push({lastName: {$regex: dtoIn.lastName, $options: "i"}});
    }
    if (dtoIn.specialization) {
      filter.push({specialization: {$regex: dtoIn.specialization, $options: "i"}});
    }
    if (dtoIn.phoneNumber) {
      filter.push({phoneNumber: {$regex: dtoIn.phoneNumber, $options: "i"}});
    }
    if (dtoIn.emailAddress) {
      filter.push({emailAddress: {$regex: dtoIn.emailAddress, $options: "i"}});
    }
    if (dtoIn.clinicName) {
      filter.push({clinicName: {$regex: dtoIn.clinicName, $options: "i"}});
    }
    if (dtoIn.searchMode === "and") {
      filter.push({status: dtoIn.status ?? "active"});
    }
    if (dtoIn.description) {
      filter.push({description: {$regex: dtoIn.description, $options: "i"}});
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

  async _addRating(awid, doctor) {
    const ratings = await this.rateDoctorDao.find(awid, {doctorId: doctor.id.toString()}, undefined, {}, {});

    let totalRating = 0
    ratings.itemList.forEach(rating => {
      totalRating += rating.ratingScore;
    })

    doctor.averageRating = ratings.itemList.length > 0 ? totalRating / ratings.itemList.length : 0

    doctor.ratingCount = ratings.itemList.length
  }

  async update(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("doctorUpdateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      WARNINGS.doctorUpdateDtoInType?.code,
      Errors.Update.InvalidDtoIn
    );

    let existing = await this.dao.get(awid, dtoIn.id);
    if (!existing) {
      throw new Errors.Update.DoctorDoesNotExist({ uuAppErrorMap }, { id: dtoIn.id });
    }

    const { id, ...updateObject } = dtoIn;

    let updated = await this.dao.update(awid, id, updateObject);
    if (!updated) {

      updated = await this.dao.get(awid, id);
    }

    return { ...updated, uuAppErrorMap };
  }

  async remove(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("doctorRemoveDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      uuAppErrorMap,
      WARNINGS.doctorRemoveDtoInType?.code,
      Errors.Remove.InvalidDtoIn
    );

    const existing = await this.dao.get(awid, dtoIn.id);
    if (!existing) {
      throw new Errors.Remove.DoctorDoesNotExist({ uuAppErrorMap }, { id: dtoIn.id });
    }

    if (existing.status === "inactive") {
      return { ...existing, uuAppErrorMap };
    }

    const pageInfo = { pageIndex: 0, pageSize: 1 }; // just to find out the existence
    const nowIso = new Date().toISOString();

    const appointments = await this.appointmentDao.find(
      awid,
      {
        awid,
        doctorId: existing.doctorId,
        status: "Confirmed",
        dateTime: { $gte: nowIso }   // only future
      },
      pageInfo,
      {},
      {}
    );

    if (appointments?.itemList?.length > 0) {
      throw new Errors.Remove.DoctorHasScheduledAppointments(
        { uuAppErrorMap },
        { id: dtoIn.id, doctorId: existing.doctorId }
      );
    }

    let updated = await this.dao.update(awid, dtoIn.id, { status: "inactive" });
    if (!updated) {
      updated = await this.dao.get(awid, dtoIn.id);
    }

    return { ...updated, uuAppErrorMap };
  }

}

module.exports = new DoctorAbl();
