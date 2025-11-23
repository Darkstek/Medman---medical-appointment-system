import { mockFetchAppointments } from "./mockFetch.js";
import { mockFetchDoctors } from "./mockFetch.js";
import { mockFetchClinics } from "./mockFetch.js";

export async function getAppointmentsWithDetails() {
  try {
    const [appointments, doctors, clinics] = await Promise.all([
      mockFetchAppointments(),
      mockFetchDoctors(),
      mockFetchClinics()
    ]);

    // Převod doctors a clinics na mapy pro rychlé hledání
    const doctorsMap = Object.fromEntries(doctors.map(d => [d.id, d]));
    const clinicsMap = Object.fromEntries(clinics.map(c => [c.id, c]));

    const appointmentsWithDetails = appointments.map(app => {
      const doctor = doctorsMap[app.doctorId] || { id: app.doctorId, name: "Unknown Doctor", clinicId: null };
      const clinic = doctor.clinicId ? clinicsMap[doctor.clinicId] : { id: null, name: "Unknown Clinic" };

      return {
        ...app,
        doctor,
        clinic
        
      };    
    });

    return appointmentsWithDetails;
  } catch (err) {
    console.error('Chyba při spojování dat:', err);
    return [];
  }
}