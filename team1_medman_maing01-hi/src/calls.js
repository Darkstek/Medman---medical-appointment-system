import { Environment } from "uu5g05";
import Plus4U5 from "uu_plus4u5g02";

// NOTE During frontend development it's possible to redirect uuApp command calls elsewhere, e.g. to production/staging
// backend, by configuring it in *-hi/env/development.json:
//   "uu5Environment": {
//     "callsBaseUri": "https://uuapp-dev.plus4u.net/vnd-app/awid"
//   }

const Calls = {
  call(method, url, dtoIn, clientOptions) {
    // console.log("Method:", method);
    // console.log("Available methods:", Object.keys(Plus4U5.Utils.AppClient));
    return Plus4U5.Utils.AppClient[method](url, dtoIn, clientOptions);
  },

  // // example for mock calls
  // loadDemoContent(dtoIn) {
  //   const commandUri = Calls.getCommandUri("loadDemoContent");
  //   return Calls.call("cmdGet", commandUri, dtoIn);
  // },

  loadIdentityProfiles() {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/initUve");
    return Calls.call("cmdGet", commandUri);
  },

  initWorkspace(dtoInData) {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/init");
    return Calls.call("cmdPost", commandUri, dtoInData);
  },

  getWorkspace() {
    const commandUri = Calls.getCommandUri("sys/uuAppWorkspace/get");
    return Calls.call("cmdGet", commandUri);
  },

  async initAndGetWorkspace(dtoInData) {
    await Calls.initWorkspace(dtoInData);
    return await Calls.getWorkspace();
  },

  findDoctors(dtoIn) {
    const commandUri = Calls.getCommandUri("doctor/find");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  getDoctor(dtoIn) {
    const commandUri = Calls.getCommandUri("doctor/get");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  createDoctor(dtoIn) {
    const commandUri = Calls.getCommandUri("doctor/create");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  updateDoctor(dtoIn) {
    const commandUri = Calls.getCommandUri("doctor/update");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  removeDoctor(dtoIn) {
    const commandUri = Calls.getCommandUri("doctor/remove");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  // Rate Doctor
  createRating(dtoIn) {
    const commandUri = Calls.getCommandUri("rate-doctor/create");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  getRating(dtoIn) {
    const commandUri = Calls.getCommandUri("rate-doctor/get");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  findRatings(dtoIn) {
    const commandUri = Calls.getCommandUri("rate-doctor/find");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  cancelAppointment(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/cancel");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  createAppointment(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/create");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  findAppointments(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/find");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  getAppointment(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/get");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },

  findPatient(dtoIn) {
    const commandUri = Calls.getCommandUri("patient/find");
    return Calls.call("cmdGet", commandUri, dtoIn);
  },
  updatePatient(dtoIn) {
    const commandUri = Calls.getCommandUri("patient/update");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  updateAppointmentStatus(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/update-status");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  updateAppointmentNotes(dtoIn) {
    const commandUri = Calls.getCommandUri("appointment/update-notes");
    return Calls.call("cmdPost", commandUri, dtoIn);
  },

  getCommandUri(useCase, baseUri = Environment.appBaseUri) {
    return (!baseUri.endsWith("/") ? baseUri + "/" : baseUri) + (useCase.startsWith("/") ? useCase.slice(1) : useCase);
  },
};

export default Calls;
