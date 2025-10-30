"use strict";
const MedmanMainUseCaseError = require("../errors/medman-main-use-case-error.js");

class MedmanMainUseCaseWarning {
  constructor(code, message, paramMap) {
    this.code = MedmanMainUseCaseError.generateCode(code);
    this.message = message;
    this.paramMap = paramMap instanceof Error ? undefined : paramMap;
  }
}

module.exports = MedmanMainUseCaseWarning;
