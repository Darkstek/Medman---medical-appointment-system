"use strict";
const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const RATE_DOCTOR_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}rate-doctor/`;

const Create = {
  UC_CODE: `${RATE_DOCTOR_ERROR_PREFIX}create/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
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
}

const Get = {
  UC_CODE: `${RATE_DOCTOR_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  AppointmentDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}doctorDoesNotExist`;
      this.message = "Appointment does not exist."
    }
  }
}

const Find = {
  UC_CODE: `${RATE_DOCTOR_ERROR_PREFIX}find/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Find.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  }
}

module.exports = {
  Create,
  Get,
  Find
}
