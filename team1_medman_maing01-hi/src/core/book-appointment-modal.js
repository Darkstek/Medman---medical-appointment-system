import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import { useAlertBus } from "uu5g05-elements";
import Config from "./config/config.js";
import Calls from "../calls.js";

const BookAppointmentModal = createVisualComponent({
  uu5Tag: Config.TAG + "BookAppointmentModal",

  propTypes: {
    onClose: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
  },

  render({ open, onClose }) {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSpecialization, setSelectedSpecialization] = useState("");
    const [filteredDoctors, setFilteredDoctors] = useState([]);
    const [selectedDoctor, setSelectedDoctor] = useState("");
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
    const [patientId, setPatientId] = useState(null);
    const [doctorAppointments, setDoctorAppointments] = useState([]);

    const { addAlert } = useAlertBus();

    const showError = (error, header = "") => {
      addAlert({ header, message: error.message, priority: "error", durationMs: 2000 });
    };

    // Fetch logged-in patient ID
    useEffect(() => {
      const fetchPatientId = async () => {
        try {
          const response = await Calls.findPatient({ emailAddress: "jess.davis@college.edu" });
          const patientData = response.itemList?.[0] ?? null;
          setPatientId(patientData?.id || null);
        } catch (error) {
          console.error("Error fetching patient ID:", error);
          setPatientId(null);
        }
      };
      fetchPatientId();
    }, []);

    // Fetch doctors when modal opens
    useEffect(() => {
      if (!open) return;

      const fetchDoctors = async () => {
        setLoading(true);
        try {
          const response = await Calls.findDoctors();
          setDoctors(response?.itemList || []);
        } catch (error) {
          console.error("Error fetching doctors:", error);
          showError(error, "Failed to fetch doctors.");
        } finally {
          setLoading(false);
        }
      };

      fetchDoctors();
    }, [open]);

    // Filter doctors by selected specialization
    useEffect(() => {
      if (selectedSpecialization) {
        setFilteredDoctors(doctors.filter((doc) => doc.specialization === selectedSpecialization));
      } else {
        setFilteredDoctors([]);
      }
    }, [selectedSpecialization, doctors]);

    // Fetch doctor appointments for displaying available time slots
    useEffect(() => {
      if (!selectedDoctor) {
        setAvailableTimeSlots([]);
        return;
      }

      const doctor = filteredDoctors.find(
        (doc) => `${doc.lastName} ${doc.firstName}` === selectedDoctor
      );
      if (!doctor) return;

      const loadAndFilterSlots = async () => {
        try {
          // 1️⃣ fetch appointments for doctor
          const response = await Calls.findAppointments({ doctorId: doctor.id });
          const appointments = response?.itemList || [];
          console.log("appointments",appointments);
          const now = new Date();

          // 2️⃣ filter free slots
          const freeSlots = doctor.availableTimeSlots
            .filter((slot) => new Date(slot.start) > now)
            .filter((slot) => {
              const slotStart = new Date(slot.start);
              const slotEnd = new Date(slot.end);

              return !appointments.some((appt) => {
                if (appt.status && appt.status === "Cancelled") return false;
                if (appt.doctorId !== doctor.id) return false;

                const apptTime = new Date(appt.dateTime);
                return apptTime >= slotStart && apptTime < slotEnd;
              });
            });
          setAvailableTimeSlots(freeSlots);
        } catch (e) {
          console.error("Failed to load doctor slots:", e);
          setAvailableTimeSlots([]);
        }
        console.log("available ts",availableTimeSlots);
      };

      loadAndFilterSlots();
    }, [selectedDoctor, filteredDoctors]);

    const uniqueSpecializations = [...new Set(doctors.map((doc) => doc.specialization))];

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = e.data.value;
      const doctor = filteredDoctors.find((doc) => `${doc.lastName} ${doc.firstName}` === formData.doctor);

      const slot = availableTimeSlots.find(
        (slot) =>
          `${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}` ===
          formData.appointmentTimeSlot
      );

      const dtoIn = {
        patientId,
        doctorId: doctor?.id,
        dateTime: new Date(slot?.start).toISOString(),
        note: null,
      };

      setLoading(true);
      try {
        const dtoOut = await Calls.createAppointment(dtoIn);
        addAlert({
          message: dtoOut.message || "Appointment has been created successfully!",
          priority: "success",
          durationMs: 2000,
        });
        // Relload appointments to update available time slots
        const response = await Calls.findAppointments({ patientId });
        setDoctorAppointments(response?.itemList || []);

        window.dispatchEvent(new Event("appointmentsUpdated"));
        onClose();
      } catch (err) {
        console.error(err);
        showError(err, "Failed to create an appointment.");
      } finally {
        setLoading(false);
      }
    };
    console.log("Available Time Slots:", availableTimeSlots);
    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={<Uu5Elements.Text category="interface" segment="title" type="major">Please fill in this form</Uu5Elements.Text>}
      >
        <Uu5Forms.Form onSubmit={handleSubmit}>
          <Uu5Forms.FormSelect
            label="Specialization"
            name="specialization"
            required
            itemList={loading ? [{ value: "Loading..." }] : uniqueSpecializations.map((s) => ({ value: s }))}
            onChange={(e) => setSelectedSpecialization(e.data.value)}
          />
          <Uu5Forms.FormSelect
            label="Doctor"
            name="doctor"
            required
            disabled={!selectedSpecialization}
            itemList={loading ? [{ value: "Loading..." }] : filteredDoctors.map((d) => ({ value: `${d.lastName} ${d.firstName}` }))}
            onChange={(e) => setSelectedDoctor(e.data.value)}
          />
          <Uu5Forms.FormSelect
            label="Available Time Slots"
            name="appointmentTimeSlot"
            required
            disabled={!selectedDoctor}
            itemList={availableTimeSlots.length === 0
              ? [{ value: "No free slots available" }]
              : availableTimeSlots.map((slot) => ({
                value: `${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`,
              }))
            }
          />
          <Uu5Forms.SubmitButton disabled={loading || availableTimeSlots.length === 0}>
            {loading ? "Booking..." : "Create an Appointment"}
          </Uu5Forms.SubmitButton>
        </Uu5Forms.Form>
      </Uu5Elements.Modal>
    );
  },
});

export { BookAppointmentModal };
export default BookAppointmentModal;
