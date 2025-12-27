"use strict";

const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");
const PERMISSION_ERROR_PREFIX = `${MedmanMainUseCaseError.ERROR_PREFIX}permission/`;

const Get = {
  UC_CODE: `${PERMISSION_ERROR_PREFIX}get/`,
  UserHasNoPermission: class extends MedmanMainUseCaseError {
    constructor() {
      super(...arguments);
      this.code = `${Get.UC_CODE}userHasNoPermission`;
      this.message = "Logged-in user does not have permission to perform this action."
    }
  }
};

module.exports = {
  Get,
};
