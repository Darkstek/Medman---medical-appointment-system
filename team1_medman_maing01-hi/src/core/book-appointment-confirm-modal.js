import { createVisualComponent, useState, useEffect, PropTypes, setError } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import { useAlertBus } from "uu5g05-elements";
import Config from "./config/config.js";

import Calls from "../calls.js";

const Css = {
  main: () => Config.Css.css({}),

  button: () =>
    Config.Css.css({
      margin: "2px",
      backgroundColor: "rgb(33, 150, 243)",
      color: "rgb(255, 255, 255)",
    }),
};

const BookAppointmentConfirmModal = createVisualComponent({
  uu5Tag: Config.TAG + "BookAppointmentConfirmModal",

  propTypes: {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    doctorId: PropTypes.string.isRequired, // Selected doctor
    timeSlot: PropTypes.object, // Selected time slot
  },

  render({ open, onClose, doctorId, timeSlot }) {
    //const [patientId, setPatientId] = useState(null); // State to store the logged-in user's patientId
    const [loading, setLoading] = useState(false); // State to track loading status

    const { addAlert } = useAlertBus();

    function showError(error, header = "") {
      addAlert({
        header,
        message: error.message,
        priority: "error",
        durationMs: 2000,
      });
    }
    // console.log("Modal doctorId:", doctorId);
    // console.log("Modal timeSlot:", timeSlot);

    const handleConfirm = async () => {
      // e.preventDefault();
      // const formData = e.data.value; // Get form data from the form
      // console.log("Form Data:", formData); // Log form data

      const dtoIn = {
        patientId: "PAT-1008", // Replace with actual patientId
        doctorId: doctorId,
        dateTime: timeSlot.start,
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
        const dtoOut = await mockCreateAppointment();
        //const dtoOut = await Calls.createAppointment(dtoIn); // Call the backend
        addAlert({
          message: dtoOut.message || "Appointment has been created successfully!",
          priority: "success",
          durationMs: 2000,
        });

        window.dispatchEvent(new Event("appointmentsUpdated"));
        console.log("Created appointment with data:", dtoOut);

        onClose(); // Close the modal
      } catch (err) {
        console.error(err);
        showError(err, "Failed to book appointment.");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={<Uu5Elements.Text>Do you really want to book this time slot ?</Uu5Elements.Text>}
      >
        <Uu5Elements.Button onClick={handleConfirm} className={Css.button()}>
          {/* Create an Appointment */}
          {loading ? "Booking..." : "Create an Appointment"}
        </Uu5Elements.Button>
      </Uu5Elements.Modal>
    );
  },
});
//@@viewOn:exports
export { BookAppointmentConfirmModal };
export default BookAppointmentConfirmModal;
//@@viewOff:exports
