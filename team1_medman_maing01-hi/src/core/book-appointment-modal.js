import { createVisualComponent, useState, useEffect, PropTypes, useSession } from "uu5g05";
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
    const { addAlert } = useAlertBus();
    const errorMessages = {
      "team1-medman-main/appointment/create/appointmentDoesNotFit":
        "Sorry, the time is too close to the doctor's availability end.",
      "team1-medman-main/appointment/create/timeSlotNotAvailable":
        "Oops! Someone just booked this slot.",
      "team1-medman-main/appointment/create/appointmentCollision":
        "This time is already booked. Please pick another slot.",
    };

    // Fetch logged-in patient ID
    const uuId = useSession.identity?.uuIdentity
    useEffect(() => {
      const fetchPatientId = async () => {
        try {
          const response = await Calls.findPatient({ uuIdentity: uuId });
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
          //  fetch appointments for doctor
          const response = await Calls.findAppointments({ doctorId: doctor.id });
          const appointments = response?.itemList || [];
          const now = new Date();
          const filteredTimeSlots = (doctor.availableTimeSlots || []).filter((slot) => {
            const slotStart = new Date(slot.start);
            const slotEnd = new Date(slot.end);
            if (slotStart <= now) return false;

            const isBooked = appointments.some((appointment) => {
              if (appointment.status === "Cancelled") return false;
              if (appointment.doctorId !== doctor.id) return false;
              const appointmentTime = new Date(appointment.dateTime);
              return (
                appointmentTime >= slotStart &&
                appointmentTime < slotEnd
              );
            });

            return !isBooked;
          });
          setAvailableTimeSlots(filteredTimeSlots);
        } catch (e) {
          console.error("Failed to load doctor slots:", e);
          setAvailableTimeSlots([]);
        }
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
        window.dispatchEvent(new Event("appointmentsUpdated"));
        onClose();
      } catch (err) {
        console.error(err);
        const code = err?.dtoOut?.uuAppErrorMap
          ? Object.keys(err.dtoOut.uuAppErrorMap)[0]
          : null;
        addAlert({
          header: "Appointment wasn't created.",
          message: errorMessages[code] || "Unable to create appointment. Please try again.",
          priority: "warning",
          durationMs: 5000,
        });
      } finally {
        setLoading(false);
      }
    };

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
