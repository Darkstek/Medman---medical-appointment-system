"use strict";
const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");

class InvalidDtoIn extends MedmanMainUseCaseError {
  constructor(dtoOut, paramMap = {}, cause = null) {
    super("invalidDtoIn", "DtoIn is not valid.", paramMap, cause, undefined, dtoOut);
  }
}

module.exports = {
  InvalidDtoIn,
};
