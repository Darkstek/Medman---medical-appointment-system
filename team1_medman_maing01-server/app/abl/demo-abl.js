// noinspection JSUnresolvedReference

"use strict";
const Path = require("node:path");
const fs = require("node:fs").promises;
const { Validator } = require("uu_appg01_server").Validation;
const { DaoFactory } = require("uu_appg01_server").ObjectStore;
const { LoggerFactory } = require("uu_appg01_server").Logging;

const DATA_FILES = [
  { id: "doctor", path: Path.join(__dirname, "../config/demo-data/doctors.json") },
  { id: "patient", path: Path.join(__dirname, "../config/demo-data/patients.json") },
  { id: "appointment", path: Path.join(__dirname, "../config/demo-data/appointments.json") },
]

const logger = LoggerFactory.get();

class DemoAbl {

  constructor() {
    this.validator = Validator.load();
    this.daoList = {};
    this.daoList["doctor"] = DaoFactory.getDao("doctor");
    this.daoList["patient"] = DaoFactory.getDao("patient");
    this.daoList["appointment"] = DaoFactory.getDao("appointment");
  }

  /**
   * Initializes the application workspace with demo data by processing predefined data files.
   * It reads JSON data from files, processes the data based on its type (e.g., shifting doctor's availability hours or adjusting appointment times),
   * deletes any existing records of the same type from the database, and inserts the new processed data.
   *
   * @return {Object} An object containing details about the inserted records for each data file definition. The keys of the object represent the type of data,
   *                  and the values contain the result of the database insertion operation for that type.
   */
  async sysUuAppWorkspaceInitDemo() {
    let dtoOut = {};
    const nextFullHourDate = this._getFutureFullHour();
    for (let definition of DATA_FILES) {
      let data = await fs.readFile(definition.path);
      // noinspection JSCheckFunctionSignatures
      let dataJson = JSON.parse(data);
      if (definition.id === "doctor") {
        dataJson.forEach(
          // shift doctor's available hours so they are not in the past
          doctor => this._shiftDoctorAvailableHours(doctor, nextFullHourDate)
        );
      } else if (definition.id === "appointment") {
        dataJson.sort((a, b) => a.dateTime.localeCompare(b.dateTime));
        const firstAppointmentDateTime = new Date(dataJson[0].dateTime);
        dataJson.forEach(
          appointment => appointment.dateTime = this._shiftTime(appointment.dateTime, firstAppointmentDateTime, nextFullHourDate)
        );
      }
      let dao = this.daoList[definition.id];
      let existingIds = await dao.distinct("id");
      let convertedExistingIds = existingIds.itemList.map(value => {
        return { _id: value }
      });
      if (convertedExistingIds?.length > 0) {
        logger.info(`Deleting ${convertedExistingIds.length} existing ${definition.id} items`);
        await dao.deleteMany({ $or: convertedExistingIds });
      }
      logger.info(`Creating ${convertedExistingIds.length} new ${definition.id} items`);
      dtoOut[definition.id] = await dao.insertMany(dataJson);
    }

    return dtoOut;
  }


  /**
   * Calculates a future date object representing a full hour (not necessarily the nearest one).
   * Adjusts the time so that the minutes, seconds, and milliseconds are set to zero.
   *
   * @return {Date} A Date object representing the future full hour.
   */
  _getFutureFullHour() {
    const futureDate = new Date(new Date().getTime() + 1000 * 60 * 119); // add 119 minutes, it is good enough for our purposes
    futureDate.setMinutes(0, 0, 0); // set hours, minutes and seconds to zero
    return futureDate;
  }

  /**
   * Adjusts the available time slots of a doctor by shifting them relative to a new starting point.
   * The new starting point is based on the provided next full hour date.
   *
   * @param {Object} doctor - The doctor object containing availability details.
   * @param {Array} doctor.availableTimeSlots - The list of time slots indicating the doctor's availability.
   * @param {string} doctor.availableTimeSlots[].start - The start time of a specific time slot in ISO string format.
   * @param {string} doctor.availableTimeSlots[].end - The end time of a specific time slot in ISO string format.
   * @param {Date} startingHour - The new starting point as a Date object from which the time slots will be shifted.
   * @return {void} This method does not return a value but modifies the doctor's time slots in place.
   */
  _shiftDoctorAvailableHours(doctor, startingHour) {
    // sort time slots by start time (alphabetical sorting seems good enough)
    doctor.availableTimeSlots?.sort((a, b) => a.start.localeCompare(b.start));
    const firstTimeSlot = doctor.availableTimeSlots[0];
    const firstSlotDateTime = new Date(firstTimeSlot?.start);
    doctor.availableTimeSlots.forEach(slot => {
      slot.start = this._shiftTime(slot.start, firstSlotDateTime, startingHour);
      slot.end = this._shiftTime(slot.end, firstSlotDateTime, startingHour);
    });
  }

  /**
   * Shifts the given date to align with a new starting hour, preserving the time difference.
   *
   * @param {string} dateString - The date represented as a string.
   * @param {Date} originalStartingHour - The original starting hour to calculate the time difference.
   * @param {Date} newStartingHour - The new starting hour to adjust the date accordingly.
   * @return {string} The shifted date as an ISO 8601 string.
   */
  _shiftTime(dateString, originalStartingHour, newStartingHour) {
    const date = new Date(dateString);
    let timeDiff = date - originalStartingHour;
    return new Date(newStartingHour.getTime() + timeDiff).toISOString()
  }
}

module.exports = new DemoAbl();
