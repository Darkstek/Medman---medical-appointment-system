import { mockFetchAppointments } from "./mockFetch.js";
import { mockFetchDoctors } from "./mockFetch.js";
import { mockFetchClinics } from "./mockFetch.js";
import { mockFetchPatients } from "./mockFetch.js";

export async function getAppointmentsWithDetails() {
  try {
    const [appointments, doctors, clinics, patients] = await Promise.all([
      mockFetchAppointments(),
      mockFetchDoctors(),
      mockFetchClinics(),
      mockFetchPatients(),
    ]);


    const doctorsMap = Object.fromEntries(doctors.map((d) => [d.doctorId, d]));
    const clinicsMap = Object.fromEntries(clinics.map((c) => [c.id, c]));
    const patientsMap = Object.fromEntries(patients.map((p) => [p.patientId, p]));

    const appointmentsWithDetails = appointments.map((app) => {
      const doctor = doctorsMap[app.doctorId] || { doctorId: app.doctorId, name: "Unknown Doctor", clinicId: null };
      const clinic = doctor.clinicId ? clinicsMap[doctor.clinicId] : { id: null, name: "Unknown Clinic" };
      const patient = patientsMap[app.patientId] || { patientId: app.patientId, firstName: "Unknown", lastName: "Patient" };

      return {
        ...app,
        doctor,
        clinic,
        patient,
      };
    });

    // console.log("DoctorsMap", doctorsMap);
    // console.log("Data", appointmentsWithDetails);

    return appointmentsWithDetails;
  } catch (err) {
    console.error("Failed loading data:", err);
    return [];
  }
}
