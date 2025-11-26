"use strict";

const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const APPOINTMENT_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}appointment/`;

const Create = {
  UC_CODE: `${APPOINTMENT_ERROR_PREFIX}create/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  AppointmentCollision: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}appointmentCollision`;
      this.message = "Time of the appointment collides with existing one(s)."
    }
  },
  AppointmentInThePast: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}appointmentInThePast`;
      this.message = "Appointment time must be in the future."
    }
  },
  TimeSlotNotAvailable: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}timeSlotNotAvailable`;
      this.message = "Time slot is not available."
    }
  },
  AppointmentDoesNotFit: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}appointmentDoesNotFit`;
      this.message = "Appointment does not fit selected time slot."
    }
  },
  DoctorNotFound: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}doctorNotFound`;
      if (arguments?.length > 1 && arguments[1].id) {
        this.message = `Doctor with id ${arguments[1].id} not found.`
      } else {
        this.message = `Doctor not found.`
      }
    }
  },
  PatientNotFound: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}patientNotFound`;
      if (arguments?.length > 1 && arguments[1].id) {
        this.message = `Patient with id ${arguments[1].id} not found.`
      } else {
        this.message = `Patient not found.`
      }
    }
  }
};

module.exports = {
  Create
};
