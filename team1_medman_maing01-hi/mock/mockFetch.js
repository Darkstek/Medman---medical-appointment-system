export function mockFetchDoctors() {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      import("../../team1_medman_maing01-server/app/config/demo-data/doctors.json").then((module) => {
        resolve(module.default); // module.default is the imported JSON
      });
    }, 500); // 0.5 second delay to simulate server response
  });
}

export function mockFetchClinics() {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      import("./data/clinics.json").then((module) => {
        resolve(module.default); // module.default is the imported JSON
      });
    }, 500); // 0.5 second delay to simulate server response
  });
}

export function mockFetchAppointments() {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      import("./data/appointments.json").then((module) => {
        resolve(module.default); // module.default is the imported JSON
      });
    }, 500); // 0.5 second delay to simulate server response
  });
}
