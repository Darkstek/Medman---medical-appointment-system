import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
import { useAlertBus } from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import Calls from "../calls.js";

const Css = {};

const CancelAppointmentModal = createVisualComponent({
  uu5Tag: Config.TAG + "CancelAppointmentModal",
  propTypes: {
    onClose: PropTypes.func.isRequired, // Add onClose prop to handle modal close
    open: PropTypes.bool.isRequired, // Add isOpen prop to control modal visibility
    onConfirm: PropTypes.func.isRequired, // Callback for confirming cancellation
    // appointmentId: PropTypes.string.isRequired, // ID of the appointment to cancel
    appointmentId: PropTypes.string.isRequired, // ID of the appointment to cancel for testing -> can be null
  },
  render({ open, onClose, onConfirm, appointmentId }) {
    const [loading, setLoading] = useState(false);
    //const [message, setMessage] = useState(null); // State for success message
    const [error, setError] = useState(null);
    const { addAlert } = useAlertBus();

    function showError(error, header = "") {
      addAlert({
        header,
        message: error.message,
        priority: "error",
        durationMs: 2000,
      });
    }

    const handleSubmit = async (e) => {
      e.preventDefault();

      //-> for testing - this is coming from props
      // appointmentId = null;
      if (!appointmentId) {
        // setError("Appointment ID is missing.");
        addAlert({
          message: `Appointment ID is missing.`,
          priority: "error",
          durationMs: 2000,
        });
        return;
      }

      setLoading(true);
      // setError(null);

      // -> for testing Mocked success response
      const mockCancelAppointment = () =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({ message: "Appointment has been cancelled!" });
          }, 1000); // Simulate a 1-second delay
        });

      const dtoIn = { id: appointmentId };
      console.log("dtoIn:", dtoIn);

      try {
        //for testing -> call mocked function insttead of BE call
        // const dtoOut = await mockCancelAppointment(); // Use the mocked function
        const dtoOut = await Calls.cancelAppointment(dtoIn);
        //    alert(dtoOut.message || "Appointment has been cancelled!"); // Show success message
        // setMessage(dtoOut.message || "Appointment has been cancelled!"); // Set success message
        addAlert({
          message: `Appointment has been cancelled!`,
          priority: "success",
          durationMs: 2000,
        });
        onConfirm(); // Notify parent component
        onClose(); // Close the modal
      } catch (err) {
        console.error(err);
        //  setError(err.message || "Failed to cancel the appointment.");
        showError(err, "Failed to cancel the appointment.");
      } finally {
        setLoading(false);
      }
      //BE call - uncomment section and comment out alert
    };
    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={
          <Uu5Elements.Text category="interface" segment="title" type="major">
            Do you really want to cancel this appointment?
          </Uu5Elements.Text>
        }
      >
        {/* Display success message */}
        {/* {message && (
          <Uu5Elements.HighlightedBox category="interface" colorScheme="positive" style={{ marginBottom: "16px" }}>
            {message}
          </Uu5Elements.HighlightedBox>
        )} */}
        {/* Display error message if it exists -> for testing */}
        {/* {error && (
          <Uu5Elements.HighlightedBox category="interface" colorScheme="negative" style={{ marginBottom: "16px" }}>
            {error}
          </Uu5Elements.HighlightedBox>
        )} */}
        <Uu5Forms.SubmitButton onClick={handleSubmit} colorScheme="red" disabled={loading}>
          {/* Confirm */}
          {loading ? "Cancelling..." : "Confirm"}
        </Uu5Forms.SubmitButton>
      </Uu5Elements.Modal>
    );
  },
});
//@@viewOn:exports
export { CancelAppointmentModal };
export default CancelAppointmentModal;
//@@viewOff:exports
