"use strict";
const MedmanMainUseCaseError = require("./medman-main-use-case-error.js");

class CallScriptEngineFailed extends MedmanMainUseCaseError {
  constructor(paramMap = {}, cause = null) {
    super("callScriptEngineFailed", "Call scriptEngine failed.", paramMap, cause);
  }
}

module.exports = {
  CallScriptEngineFailed,
};
