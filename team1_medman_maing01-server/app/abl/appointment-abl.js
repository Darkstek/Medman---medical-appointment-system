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
      doctorId: doctor.doctorId,
      patientId: patient.patientId,
      status: AppointmentStatus.CONFIRMED,
    }

    appointment = await this.appointmentDao.create(appointment);
    appointment.appointmentId = appointment.id;

    return {...appointment, uuAppErrorMap};
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
    let existingAppointments = await this.appointmentDao.find({
      awid: awid,
      $or: [
        {$or: [{doctorId: dtoIn.doctorId}, {_id: ObjectId.isValid(dtoIn.doctorId) ? new ObjectId(dtoIn.doctorId) : dtoIn.doctorId}]},
        {$or: [{patientId: dtoIn.patientId}, {_id: ObjectId.isValid(dtoIn.patientId) ? new ObjectId(dtoIn.patientId) : dtoIn.patientId}]},
      ],
      status: {$in: [AppointmentStatus.CREATED, AppointmentStatus.CONFIRMED]}
    })

    if (existingAppointments?.itemList) {
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
      throw new Errors.Create.TimeSlotNotAvailable({uuAppErrorMap}, {dateTime: dtoIn.dateTime, availableTimeSlots: doctor.availableTimeSlots})
    }

    if (new Date(timeSlot.end) - dtoInDateTime < 15 * 60 * 1000) {
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
}

module.exports = new AppointmentAbl();
