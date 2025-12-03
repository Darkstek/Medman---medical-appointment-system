import { createVisualComponent, useState, useEffect, PropTypes, setError } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import { useAlertBus } from "uu5g05-elements";
import Config from "./config/config.js";
import { mockFetchDoctors, mockFetchPatients } from "../../mock/mockFetch.js";

import Calls from "../calls.js";

const Css = {};

const BookAppointmentModal = createVisualComponent({
  uu5Tag: Config.TAG + "BookAppointmentModal",

  propTypes: {
    onClose: PropTypes.func.isRequired, // Add onClose prop to handle modal close
    open: PropTypes.bool.isRequired, // Add isOpen prop to control modal visibility
  },

  render({ open, onClose }) {
    const [data, setData] = useState([]); // State to store fetched doctors
    const [loading, setLoading] = useState(true); // State to track loading status
    const [selectedSpecialization, setSelectedSpecialization] = useState(""); // State to store selected specialization
    const [filteredDoctors, setFilteredDoctors] = useState([]); // State to store filtered doctors
    const [selectedDoctor, setSelectedDoctor] = useState(""); // State to store selected doctor
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // State to store available time slots
    const [patientId, setPatientId] = useState(null); // State to store the logged-in user's patientId

    const { addAlert } = useAlertBus();

    function showError(error, header = "") {
      addAlert({
        header,
        message: error.message,
        priority: "error",
        durationMs: 2000,
      });
    }

    // Replace with actual logic to identify the logged-in user
    useEffect(() => {
      async function fetchPatientId() {
        try {
          const patients = await mockFetchPatients(); // Fetch mock data
          const loggedInPatient = patients.find((patient) => patient.emailAddress === "jess.davis@college.edu");
          setPatientId(loggedInPatient?.patientId || "Unknown");
        } catch (error) {
          console.error("Error fetching patient ID:", error);
        }
      }
      fetchPatientId();
    }, []);
    // Fetch mock data
    useEffect(() => {
      async function fetchDoctors() {
        try {
          const doctors = await mockFetchDoctors(); // Fetch mock data
          setData(doctors); // Set fetched data to state
        } catch (error) {
          console.error("Error fetching doctors:", error);
        } finally {
          setLoading(false); // Set loading to false after fetching
        }
      }
      fetchDoctors();
    }, []);
    // Update filtered doctors when specialization changes
    useEffect(() => {
      if (selectedSpecialization) {
        const filtered = data.filter((doctor) => doctor.specialization === selectedSpecialization);
        setFilteredDoctors(filtered);
      } else {
        setFilteredDoctors([]);
      }
    }, [selectedSpecialization, data]);
    // Update available time slots when doctor changes
    useEffect(() => {
      if (selectedDoctor) {
        const doctor = filteredDoctors.find((doc) => `${doc.lastName} ${doc.firstName}` === selectedDoctor);
        setAvailableTimeSlots(doctor?.availableTimeSlots || []);
      } else {
        setAvailableTimeSlots([]);
      }
    }, [selectedDoctor, filteredDoctors]);

    // Extract unique specializations
    const uniqueSpecializations = [...new Set(data.map((doctor) => doctor.specialization))];

    const handleSubmit = async (e) => {
      e.preventDefault();
      const formData = e.data.value; // Get form data from the form

      // Find the selected doctor object
      const doctor = filteredDoctors.find((doc) => `${doc.lastName} ${doc.firstName}` === formData.doctor);

      const dtoIn = {
        patientId, // Add the logged-in user's patientId
        doctorId: doctor?.doctorId,
        dateTime: new Date(
          availableTimeSlots.find(
            (slot) =>
              `${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}` ===
              formData.appointmentTimeSlot,
          )?.start,
        ).toISOString(), // Use start time of the selected time slot
        note: null,
      };

      console.log("Creating appointment with data:", dtoIn); // Log appointment data
      setLoading(true);

      // -> for testing Mocked success response - enriched with status and appointmentId
      const mockCreateAppointment = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              // message: "Appointment has been created successfully!",
              patientId: dtoIn.patientId,
              doctorId: dtoIn.doctorId,
              dateTime: dtoIn.dateTime,
              note: dtoIn.note,
            });
          }, 1000); // Simulate a 1-second delay
        });

      try {
        //for testing Mocked success response - enriched with status and appointmentId, comment out/uncomment as needed
        //const dtoOut = await mockCreateAppointment();
        const dtoOut = await Calls.createAppointment(dtoIn); // Call the backend
        addAlert({
          message: dtoOut.message || "Appointment has been created successfully!",
          priority: "success",
          durationMs: 2000,
        });

        window.dispatchEvent(new Event("appointmentsUpdated"));
        console.log("Creating appointment with data:", dtoOut);

        onClose(); // Close the modal
      } catch (err) {
        console.error(err);
        showError(err, "Failed to create an appointment.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={
          <Uu5Elements.Text category="interface" segment="title" type="major">
            Please fill in this form
          </Uu5Elements.Text>
        }
      >
        <Uu5Forms.Form onSubmit={handleSubmit}>
          <Uu5Forms.FormSelect
            label="Specialization"
            itemList={
              loading
                ? [{ value: "Loading..." }] // Show loading state
                : uniqueSpecializations.map((specialization) => ({ value: specialization })) // Unique specializations
            }
            name="specialization"
            required
            onChange={(e) => setSelectedSpecialization(e.data.value)} // Update selected specialization
          />
          <Uu5Forms.FormSelect
            label="Doctor"
            itemList={
              loading
                ? [{ value: "Loading..." }] // Show loading state
                : filteredDoctors.map((doctor) => ({ value: `${doctor.lastName} ${doctor.firstName}` })) // Filtered doctors formatted
            }
            name="doctor"
            required
            disabled={!selectedSpecialization} // Disable if no specialization is selected
            onChange={(e) => setSelectedDoctor(e.data.value)} // Update selected doctor
          />
          <Uu5Forms.FormSelect
            label="Available Time Slots"
            itemList={
              availableTimeSlots.length === 0
                ? [{ value: "No time slots available" }] // Show if no time slots are available
                : availableTimeSlots.map((slot) => ({
                    value: `${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}`,
                  })) // Map time slots to readable format
            }
            name="appointmentTimeSlot"
            required
            disabled={!selectedDoctor}
          />
          <Uu5Forms.SubmitButton disabled={loading || availableTimeSlots.length === 0}>
            {/* Create an Appointment */}
            {loading ? "Booking..." : "Create an Appointment"}
          </Uu5Forms.SubmitButton>
          {/* 
          <Uu5Forms.ResetButton>
        Start Over</Uu5Forms.ResetButton>  */}
        </Uu5Forms.Form>
      </Uu5Elements.Modal>
    );
  },
});
//@@viewOn:exports
export { BookAppointmentModal };
export default BookAppointmentModal;
//@@viewOff:exports
