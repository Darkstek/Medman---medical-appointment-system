import { createVisualComponent, useState, useEffect, PropTypes, setLoading, setError } from "uu5g05";
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
    appointmentId: PropTypes.string.isRequired, // ID of the appointment to cancel
  },
  render({ open, onClose, onConfirm, appointmentId }) {
    const handleSubmit = async (e) => {
      e.preventDefault();
      console.log("Cancel appointment triggered for ID:", appointmentId); // Log appointment ID

      const dtoIn = { id: appointmentId };
      console.log("dtoIn:", dtoIn);
      //BE call - uncomment section and comment out alert
      /*
      setLoading(true);
      Calls.cancelAppointment(dtoIn)
        .then((dtoOut) => {
          // dtoOut === { id, message, uuAppErrorMap }
          alert(dtoOut.message || "Appointment has been cancelled!");
          console.log(dtoOut);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message || "Failed to cancel appointment.");
        })
        .finally(() => setLoading(false));
*/
      alert("Appointment has been cancelled!"); // Show a success message

      onConfirm();
      onClose();
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
        <Uu5Forms.SubmitButton onClick={handleSubmit} colorScheme="red">
          Confirm
        </Uu5Forms.SubmitButton>
      </Uu5Elements.Modal>
    );
  },
});
//@@viewOn:exports
export { CancelAppointmentModal };
export default CancelAppointmentModal;
//@@viewOff:exports
