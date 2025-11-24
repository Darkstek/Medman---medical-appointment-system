"use strict";
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { ValidationHelper } = require("uu_appg01_server").AppServer;
const { AppointmentStatus } = require("../enums/appointment-status");
const Errors = require("../api/errors/appointment-error.js");

const WARNINGS = {
  appointmentCreateDtoInType: {
    code: `${Errors.Create.UC_CODE}unsupportedKeys`
  },
};

class AppointmentAbl {

  constructor() {
    this.validator = Validator.load();
    this.appointmentDao = DaoFactory.getDao("appointment");
    this.doctorDao = DaoFactory.getDao("doctor");
    this.patientDao = DaoFactory.getDao("patient");
  }

  async create(awid, dtoIn) {
    let uuAppErrorMap = {};
    const validationResult = this.validator.validate("appointmentCreateDtoInType", dtoIn);
    uuAppErrorMap = ValidationHelper.processValidationResult(
      dtoIn,
      validationResult,
      WARNINGS.appointmentCreateDtoInType?.code,
      Errors.Create.InvalidDtoIn
    );

    let appointment = {
      awid,
      status: AppointmentStatus.CREATED,
      ...dtoIn
    }

    await this._verifyTimeSlot(awid, dtoIn, uuAppErrorMap);
    await this._verifyDoctorExists(awid, dtoIn.doctorId, uuAppErrorMap);
    await this._verifyPatientExists(awid, dtoIn.patientId, uuAppErrorMap);

    appointment = await this.appointmentDao.create(appointment);
    appointment.appointmentId = appointment.id;

    return { ...appointment, uuAppErrorMap };
  }

  /**
   * Verifies if the specified time slot is available for scheduling an appointment.
   * Checks for any existing appointments that overlap with the provided time slot.
   *
   * @param {string} awid - application workspace ID
   * @param {Object} dtoIn - Data transfer object containing input data, including the desired time slot for validation.
   * @param {Object} uuAppErrorMap - An object to collect encountered errors during the validation process.
   * @return {Promise<void>} Resolves with no value if the time slot is available, otherwise throws an error for overlapping appointments.
   */
  async _verifyTimeSlot(awid, dtoIn, uuAppErrorMap) {
    let existingAppointments = await this.appointmentDao.find({
      awid: awid,
      status: { $in: [AppointmentStatus.CREATED, AppointmentStatus.CONFIRMED] }
    })

    if (existingAppointments?.itemList) {
      existingAppointments = existingAppointments.itemList.filter(item => item.dateTime === dtoIn.dateTime);
      if (existingAppointments.length > 0) {
        throw new Errors.Create.TimeOverlap({ uuAppErrorMap }, { appointments: existingAppointments })
      }
    }
  }


  /**
   * Verifies the existence of a doctor in the database by their identifier.
   *
   * @param {string} awid Unique identifier of the application workspace.
   * @param {string} doctorId Unique identifier of the doctor to verify.
   * @param {Object} uuAppErrorMap An object to collect validation and execution errors.
   * @return {Promise<void>} Resolves if the doctor exists, otherwise throws an error.
   */
  async _verifyDoctorExists(awid, doctorId, uuAppErrorMap) {
    let doctor = await this.doctorDao.findOne({ id: doctorId }); // TODO: use awid and doctorId after merge

    if (!doctor) {
      throw new Errors.Create.DoctorNotFound({ uuAppErrorMap }, { id: doctorId })
    }
  }

  async _verifyPatientExists(awid, patientId, uuAppErrorMap) {
    let doctor = await this.doctorDao.findOne({ id: patientId }); // TODO: use awid and patientId after merge

    if (!doctor) {
      throw new Errors.Create.PatientNotFound({ uuAppErrorMap }, { id: patientId })
    }
  }
}

module.exports = new AppointmentAbl();
