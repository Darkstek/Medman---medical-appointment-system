// noinspection JSUnresolvedReference

"use strict";
const {Validator} = require("uu_appg01_server").Validation;
const {DaoFactory} = require("uu_appg01_server").ObjectStore;
const {ValidationHelper} = require("uu_appg01_server").AppServer;
const {AppointmentStatus} = require("../enums/appointment-status");
const {ObjectId} = require("mongodb");

const Errors = require("../api/errors/appointment-error.js");

const WARNINGS = {
  appointmentCreateDtoInType: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
  appointmentUpdateNotesDtoInType: {
    code: `${Errors.UpdateNotes.UC_CODE}unsupportedKeys`
  },
  appointmentUpdateStatusDtoInType: {
    code: `${Errors.UpdateStatus.UC_CODE}unsupportedKeys`
  },
  appointmentGetDtoInType: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  appointmentFindDtoInType: {
    code: `${Errors.Get.UC_CODE}unsupportedKeys`
  },
  appointmentCancelDtoInType: {
    code: `${Errors.Cancel.UC_CODE}unsupportedKeys`
  }
};

/**
 * This class handles the operations related to appointments such as creation, validation,
 * and fetching associated doctor/patient data.
 */
class AppointmentAbl {

  constructor() {
    this.validator = Validator.load();
    this.appointmentDao = DaoFactory.getDao("appointment");
    this.doctorDao = DaoFactory.getDao("doctor");
    this.patientDao = DaoFactory.getDao("patient");
  }

  async create(awid, dtoIn) {
    const validationResult = this.validator.validate("appointmentCreateDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.appointmentCreateDtoInType?.code,
      Errors.Create.InvalidDtoIn
    );
    let doctor = await this._getDoctor(awid, dtoIn.doctorId, uuAppErrorMap);
    let patient = await this._getPatient(awid, dtoIn.patientId, uuAppErrorMap);
    await this._verifyTimeSlot(awid, dtoIn, doctor, uuAppErrorMap);

    let appointment = {
      awid,
      ...dtoIn,
      status: AppointmentStatus.CONFIRMED,
    }

    appointment = await this.appointmentDao.create(appointment);
    appointment.appointmentId = appointment.id;

    return {...appointment, uuAppErrorMap};
  }

  async updateNotes(awid, dtoIn) {
    const validationResult = this.validator.validate("appointmentUpdateNotesDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.appointmentUpdateNotesDtoInType?.code,
      Errors.UpdateNotes.InvalidDtoIn
    );

    let appointment = await this.appointmentDao.get(awid, dtoIn.id);
    if (!appointment) {
      throw new Errors.UpdateNotes.AppointmentDoesNotExist({id: dtoIn.id});
    }

    appointment.note = dtoIn.note
    appointment = await this.appointmentDao.update(dtoIn.id, appointment);

    return {...appointment, uuAppErrorMap};
  }

  async updateStatus(awid, dtoIn) {
    const validationResult = this.validator.validate("appointmentUpdateStatusDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.appointmentUpdateStatusDtoInType?.code,
      Errors.UpdateStatus.InvalidDtoIn
    );

    let appointment = await this.appointmentDao.get(awid, dtoIn.id);
    if (!appointment) {
      throw new Errors.UpdateStatus.AppointmentDoesNotExist({id: dtoIn.id});
    }

    appointment.status = dtoIn.status
    appointment = await this.appointmentDao.update(dtoIn.id, appointment);

    return {...appointment, uuAppErrorMap};
  }

  async get(awid, dtoIn) {
    const validationResult = this.validator.validate("appointmentGetDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.appointmentGetDtoInType?.code,
      Errors.Get.InvalidDtoIn
    );

    let appointment = await this.appointmentDao.get(awid, dtoIn.id);
    if (!appointment) {
      throw new Errors.Get.AppointmentDoesNotExist({id: dtoIn.id});
    }

    return {...appointment, uuAppErrorMap};
  }

  /**
   * Finds a list of appointments based on provided criteria and retrieves it from the data source.
   *
   * @param {string} awid - The application workspace ID.
   * @param {Object} dtoIn - Data transfer object containing the search criteria and paging information.
   * @param {Object} dtoIn.sortBy - Criteria for sorting the results (optional).
   * @param {Object} dtoIn.pageInfo - Paging information for the query (optional).
   * @return {Promise<Object>} A promise resolving to an object containing the resulting list of appointments.
   * @return {Object} Result object consisting of:
   * pageInfo - Paging information for the result set.
   * itemList - List of appointments meeting the specified criteria.
   * uuAppErrorMap - Map of validation errors and warnings that occurred during processing.
   */
  async find(awid, dtoIn) {
    const validationResult = this.validator.validate("appointmentFindDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.appointmentFindDtoInType?.code,
      Errors.Find.InvalidDtoIn
    );

    let filter = this._createFilterFrom(dtoIn);
    let sortBy = this._transformSortBy(dtoIn.sortBy) ?? {_id: -1};
    let appointmentList = await this.appointmentDao.find(awid, filter, dtoIn.pageInfo, sortBy, {});

    if (dtoIn.searchMode === "or" && dtoIn.status) { // we need this because in "or" mode we can have a result containing appointment with any status
      appointmentList.itemList = appointmentList.itemList.filter(appointment => appointment.status === dtoIn.status);
    }

    // reorder pageInfo and itemList
    return {pageInfo: appointmentList.pageInfo, itemList: appointmentList.itemList, uuAppErrorMap};
  }

  /**
   * Creates a filter object based on the input data transfer object (dtoIn).
   * The filter is constructed with conditions for various fields using regex and comparison operators.
   *
   * @param {Object} dtoIn - The input object containing filtering criteria.
   * @param {string} [dtoIn.patientId] - Filter condition for the clinic ID.
   * @param {string} [dtoIn.doctorId] - Filter condition for the last name, using case-insensitive partial match.
   * @param {string} [dtoIn.status] - Filter condition for the appointment status (confirmed/cancelled/completed).
   * @return {Object} The constructed filter object.
   * @*/
  _createFilterFrom(dtoIn) {
    let filter = [];
    if (dtoIn.patientId) {
      filter.push({patientId: dtoIn.patientId});
    }
    if (dtoIn.doctorId) {
      filter.push({doctorId: dtoIn.doctorId});
    }
    if (dtoIn.searchMode === "and") {
      filter.push({status: dtoIn.status ?? AppointmentStatus.CONFIRMED});
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

  /**
   * Verifies if the time slot for the given appointment is valid and doesn't conflict with any existing appointments.
   *
   * @param {string} awid - The application workspace identifier.
   * @param {Object} dtoIn - The data transfer object containing appointment details, including date and time.
   * @param {Object} doctor - The doctor object for the appointment.
   * @param {Object} uuAppErrorMap - An object used for error tracking and mapping application errors.
   * @return {Promise<void>} Resolves if the time slot is valid and doesn't conflict with existing appointments, otherwise throws an error.
   */
  async _verifyTimeSlot(awid, dtoIn,  doctor, uuAppErrorMap) {
    let dtoInDateTime = new Date(dtoIn.dateTime);
    if (dtoInDateTime.getTime() < Date.now() - 1000) {
      throw new Errors.Create.AppointmentInThePast({uuAppErrorMap}, {dateTime: dtoIn.dateTime})
    }
    // check for existing appointments either for the same doctor or patient
    let existingAppointments = await this.appointmentDao.find(
      awid,
      {
        $or: [
          // dtoIn.doctorId can be actually doctor._id or doctor.doctorId from a mongodb collection
          // ternary operator is used to avoid error when doctorId is not a valid ObjectId
          {$or: [{doctorId: dtoIn.doctorId}, {_id: ObjectId.isValid(dtoIn.doctorId) ? new ObjectId(dtoIn.doctorId) : dtoIn.doctorId}]},
          // dtoIn.patientId can be actually patient._id or patient.patientId from a mongodb collection
          // ternary operator is used to avoid error when patientId is not a valid ObjectId
          {$or: [{patientId: dtoIn.patientId}, {_id: ObjectId.isValid(dtoIn.patientId) ? new ObjectId(dtoIn.patientId) : dtoIn.patientId}]},
        ],
        status: {$in: [AppointmentStatus.CREATED, AppointmentStatus.CONFIRMED]}
      },
      dtoIn.pageInfo,
      {_id: -1}, // sort by id descending
      {} // projection
    )

    if (existingAppointments?.itemList) {
      // find appointments within 15 minutes of the appointment we are creating
      existingAppointments = existingAppointments.itemList.filter(item => {
        let timeDiff = Math.abs(new Date(item.dateTime) - dtoInDateTime);
        return timeDiff < 15 * 60 * 1000; // 15 minutes
      });
      if (existingAppointments.length > 0) {
        throw new Errors.Create.AppointmentCollision({uuAppErrorMap}, {appointments: existingAppointments})
      }
    }

    let timeSlot = doctor.availableTimeSlots.find(slot => new Date(slot.start) <= dtoInDateTime && new Date(slot.end) >= dtoInDateTime);
    if (!timeSlot) {
      // the appointment is outside the doctor's available time slots, so it can't be scheduled
      throw new Errors.Create.TimeSlotNotAvailable({uuAppErrorMap}, {dateTime: dtoIn.dateTime, availableTimeSlots: doctor.availableTimeSlots})
    }

    if (new Date(timeSlot.end) - dtoInDateTime < 15 * 60 * 1000) {
      // appointment is less than 15 minutes away from the end of the time slot, so it can't fit in the slot
      throw new Errors.Create.AppointmentDoesNotFit({uuAppErrorMap}, {dateTime: dtoIn.dateTime, timeSlot: timeSlot})
    }

  }


  /**
   * Retrieves a doctor based on the given identifiers.
   * If the doctor is not found, an error is thrown.
   *
   * @param {string} awid - The identifier of the application workspace.
   * @param {string} doctorId - The unique identifier of the doctor to retrieve.
   * @param {Object} uuAppErrorMap - An object to capture and map errors.
   * @return {Promise<Object>} A promise that resolves with the doctor object if found.
   * @throws {Errors.Create.DoctorNotFound} Thrown if the doctor is not found.
   */
  async _getDoctor(awid, doctorId, uuAppErrorMap) {
    let doctor = await this.doctorDao.findOne({awid, $or: [{doctorId: doctorId}, {_id: ObjectId.isValid(doctorId) ? new ObjectId(doctorId) : doctorId}]});

    if (!doctor) {
      throw new Errors.Create.DoctorNotFound({uuAppErrorMap}, {doctorId: doctorId})
    }

    if (doctor.status !== "active") {
      throw new Errors.Create.DoctorNotActive({uuAppErrorMap}, {doctorId: doctorId, status: doctor.status})
    }

    return doctor;
  }

  /**
   * Retrieves a patient's information based on the specified `awid` and `patientId`.
   * If the patient is not found, an error is thrown.
   *
   * @param {string} awid - The identifier of the application workspace.
   * @param {string} patientId - The unique identifier of the patient.
   * @param {Object} uuAppErrorMap - An error map to track any application errors.
   * @return {Promise<Object>} A promise that resolves to the patient object if found.
   * @throws {Errors.Create.PatientNotFound} If no patient is found with the provided `patientId`.
   */
  async _getPatient(awid, patientId, uuAppErrorMap) {
    let patient = await this.patientDao.findOne({
      awid: awid,
      $or: [{patientId: patientId}, {_id: ObjectId.isValid(patientId) ? new ObjectId(patientId) : patientId}]
    });

    if (!patient) {
      throw new Errors.Create.PatientNotFound({uuAppErrorMap}, {id: patientId})
    }

    return patient;
  }

  /**
   * Cancels an existing appointment based on the provided input.
   * The method validates the input, checks whether the appointment exists,
   * removes it from the database, and returns a confirmation response.
   *
   * @param {string} awid - The identifier of the application workspace.
   * @param {Object} dtoIn - The input DTO containing the appointment ID to be cancelled.
   * @param {string} dtoIn.id - The unique identifier of the appointment.
   * @return {Promise<Object>} A promise resolving to an object containing the cancelled appointment ID and the uuAppErrorMap.
   * @throws {Errors.Cancel.InvalidDtoIn} If the input DTO fails validation.
   * @throws {Errors.Cancel.AppointmentDoesNotExist} If the appointment with the provided ID does not exist.
   */

  async cancel(awid, dtoIn) {
    // Validate input
    const validationResult = this.validator.validate("appointmentCancelDtoInType", dtoIn);
    let uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      {},
      WARNINGS.appointmentCancelDtoInType?.code,
      Errors.Cancel.InvalidDtoIn
    );

    // Verify that the appointment exists
    let appointment = await this.appointmentDao.get(awid, dtoIn.id);
    if (!appointment) {
      throw new Errors.Cancel.AppointmentDoesNotExist(
        { uuAppErrorMap },
        { id: dtoIn.id }
      );
    }

    // Setting the status to Cancelled
    const updatedAppointment = await this.appointmentDao.update(
      dtoIn.id,
      { status: AppointmentStatus.CANCELLED }
    );

    // Return a simple confirmation response
    return {
      ...updatedAppointment,
      message: "Appointment has been canceled",
      uuAppErrorMap
    };
  }

}

module.exports = new AppointmentAbl();
