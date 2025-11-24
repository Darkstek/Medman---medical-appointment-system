"use strict";

const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const APPOINTMENT_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}appointment/`;

const Create = {
  UC_CODE: `${APPOINTMENT_ERROR_PREFIX}create/`,
  InvalidDto: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  TimeOverlap: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}timeOverlap`;
      this.message = "Time of the appointment overlaps existing one."
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
