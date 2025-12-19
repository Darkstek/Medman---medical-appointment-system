"use strict";

const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const DOCTOR_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}doctor/`;

const Create = {
  UC_CODE: `${DOCTOR_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Create.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  }
}

const Get = {
  UC_CODE: `${DOCTOR_ERROR_PREFIX}get/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  DoctorDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}doctorDoesNotExist`;
      this.message = "Doctor does not exist."
    }
  }
}

const Find = {
  UC_CODE: `${DOCTOR_ERROR_PREFIX}find/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Find.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  },
  DoctorDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Find.UC_CODE}doctorDoesNotExist`;
      this.message = "Doctor does not exist."
    }
  }
};

const Update = {
  UC_CODE: `${DOCTOR_ERROR_PREFIX}update/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  DoctorDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Update.UC_CODE}doctorDoesNotExist`;
      this.message = "Doctor does not exist.";
    }
  },
};

const Remove = {
  UC_CODE: `${DOCTOR_ERROR_PREFIX}remove/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Remove.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  DoctorDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Remove.UC_CODE}doctorDoesNotExist`;
      this.message = "Doctor does not exist.";
    }
  },
};

module.exports = {
  Create,
  Get,
  Find,
  Update,
  Remove,
};
