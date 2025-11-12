export function mockFetchDoctors() {
  // Simulate network delay
  return new Promise((resolve) => {
    setTimeout(() => {
      import("/Users/matejklee/Desktop/MedMan/team1_medman_maing01-server/app/config/demo-data/doctors.json").then((module) => {
        resolve(module.default); // module.default is the imported JSON
      });
    }, 500); // 0.5 second delay to simulate server response
  });
}
