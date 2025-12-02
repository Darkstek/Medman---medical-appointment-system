"use strict";

const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const PATIENT_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}patient/`;

const Create = {
  UC_CODE: `${PATIENT_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  }
}

const Get = {
  UC_CODE: `${PATIENT_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  PatientDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}patientDoesNotExist`;
      this.message = "Patient does not exist.";
      if (arguments?.length > 1 && arguments[1].id) {
        this.message = `Patient with id ${arguments[1].id} not found.`
      } else if (arguments?.length > 1 && arguments[1].patientId) {
        this.message = `Patient with patientId ${arguments[1].patientId} not found.`
      } else {
        this.message = `Patient not found.`
      }
    }
  }
}

const Find = {
  UC_CODE: `${PATIENT_ERROR_PREFIX}find/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Find.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  }
};

const Update = {
  UC_CODE: `${PATIENT_ERROR_PREFIX}update/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  PatientDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}patientDoesNotExist`;
      this.message = "Patient does not exist.";
      if (arguments?.length > 1 && arguments[1].id) {
        this.message = `Patient with id ${arguments[1].id} not found.`
      } else if (arguments?.length > 1 && arguments[1].patientId) {
        this.message = `Patient with patientId ${arguments[1].patientId} not found.`
      } else {
        this.message = `Patient not found.`
      }
    }
  }
};

module.exports = {
  Create,
  Get,
  Find,
  Update,
};
