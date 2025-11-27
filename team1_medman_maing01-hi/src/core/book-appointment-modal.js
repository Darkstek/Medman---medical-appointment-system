import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import { mockFetchDoctors } from "../../mock/mockFetch.js";
import Calls from "../calls.js";

const Css = {};

const BookAppointmentModal = createVisualComponent({
  uu5Tag: Config.TAG + "BookAppointmentModal",

  propTypes: {
    onClose: PropTypes.func.isRequired, // Add onClose prop to handle modal close
    open: PropTypes.bool.isRequired, // Add isOpen prop to control modal visibility
  //  onCreate: PropTypes.func.isRequired, // TODO: Callback to add mock - to remove
  },

  render({ open, onClose }) {
    const [data, setData] = useState([]); // State to store fetched doctors
    const [loading, setLoading] = useState(true); // State to track loading status
    const [selectedSpecialization, setSelectedSpecialization] = useState(""); // State to store selected specialization
    const [filteredDoctors, setFilteredDoctors] = useState([]); // State to store filtered doctors
    const [selectedDoctor, setSelectedDoctor] = useState(""); // State to store selected doctor
    const [availableTimeSlots, setAvailableTimeSlots] = useState([]); // State to store available time slots

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

      const appointmentData = {
        //  specialization: formData.specialization,
        doctorId: doctor?.doctorId,
        dateTime: new Date(
          availableTimeSlots.find(
            (slot) =>
              `${new Date(slot.start).toLocaleString()} - ${new Date(slot.end).toLocaleString()}` ===
              formData.appointmentTimeSlot,
          )?.start,
        ).toISOString(), // Use start time of the selected time slot
      };

      console.log("Creating appointment with data:", appointmentData); // Log appointment data

      // try {
      //   console.log("Sending request to create appointment..."); // Log before API call

      //   //    await Calls.call("POST", "appointments", {
      //   await Calls.call("cmdPost", Calls.getCommandUri("appointments"), {
      //     data: appointmentData,
      //     done: (response) => {
      //       console.log("Appointment created successfully. Response:", response); // Log success response
      //       alert("Appointment created successfully!"); // Show success message
      //       onClose(); // Close the modal
      //     },
      //     fail: (error) => {
      //       console.error("Error creating appointment:", error);
      //       alert("Failed to create appointment. Please try again."); // Show error message
      //     },
      //   });
      // } catch (error) {
      //   console.error("Unexpected error during appointment creation:", error); // Log unexpected error
      //   alert("An unexpected error occurred. Please try again."); // Show error message
      // }

      alert("Appointment created successfully!"); // Show a success message
      onClose();
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
          <Uu5Forms.SubmitButton
            disabled={availableTimeSlots.length === 0} // Disable the button if no time slots are available
          >
            Create an Appointment
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
