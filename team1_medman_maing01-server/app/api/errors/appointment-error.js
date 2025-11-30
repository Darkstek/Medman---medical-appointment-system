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

const Get = {
  UC_CODE: `${APPOINTMENT_ERROR_PREFIX}get/`,
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
  UC_CODE: `${APPOINTMENT_ERROR_PREFIX}find/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid."
    }
  }
};

const Cancel = {
  UC_CODE: `${APPOINTMENT_ERROR_PREFIX}cancel/`,
  InvalidDtoIn: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Cancel.UC_CODE}invalidDtoIn`;
      this.message = "DtoIn is not valid.";
    }
  },
  AppointmentDoesNotExist: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Cancel.UC_CODE}appointmentDoesNotExist`;
      this.message = "Appointment does not exist.";
    }
  }
};

module.exports = {
  Create,
  Get,
  Find,
  Cancel
};
