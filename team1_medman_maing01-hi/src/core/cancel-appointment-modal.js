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
    // onConfirm: PropTypes.func, // Callback for confirming cancellation
    //appointmentId: PropTypes.string.isRequired, // ID of the appointment to cancel
    appointmentId: PropTypes.string, // ID of the appointment to cancel for testing -> can be null
  },
  render({ open, onClose, onConfirm, appointmentId }) {
    const [loading, setLoading] = useState(false);
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

      //for testing - this is coming from props, if uncommented, failure on missing appointmentId can be tested
      // appointmentId = null;
      if (!appointmentId) {
        addAlert({
          message: `Appointment ID is missing.`,
          priority: "error",
          durationMs: 2000,
        });
        return;
      }

      setLoading(true);
      // setError(null);

      //for testing Mocked success response
      const mockCancelAppointment = (dtoIn) =>
        new Promise((resolve) => {
          setTimeout(() => {
            resolve({
              message: "Appointment has been cancelled!",
              id: dtoIn.id, // Include the appointment ID in the response
            });
          }, 1000); // Simulate a 1-second delay
        });

      const dtoIn = { id: appointmentId };
      console.log("dtoIn:", dtoIn);

      try {
        //for testing -> call mocked function instead of BE call + onConfirm to uncomment - please check comments in appointment-list for mock usage
        // const dtoOut = await mockCancelAppointment(dtoIn); // Use the mocked function
        const dtoOut = await Calls.cancelAppointment(dtoIn);
        addAlert({
          message: /*dtoOut.message ||*/ `Appointment has been cancelled!`,
          priority: "success",
          durationMs: 2000,
        });
        window.dispatchEvent(new Event("appointmentsUpdated"));

        // onConfirm(); // Notify parent component
        onClose(); // Close the modal
      } catch (err) {
        console.error(err);
        showError(err, "Failed to cancel the appointment.");
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
            Do you really want to cancel this appointment?
          </Uu5Elements.Text>
        }
      >
        <Uu5Forms.SubmitButton onClick={handleSubmit} colorScheme="red" disabled={loading}>
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
