import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
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

      //TODO: BE call to cancel appointment - once update/delete available
      // try {
      //   console.log("Sending request to cancel appointment..."); // Log before API call

      //   //    await Calls.call("PUT", `appointments/${appointmentId}`, {
      //   await Calls.call("cmdUpdate", Calls.getCommandUri(`appointments/${appointmentId}`), {
      //     done: (response) => {
      //       console.log("Cancellation successful. Response:", response); // Log success response

      //       alert("Appointment has been cancelled successfully!"); // Show success message
      //       onConfirm(); // Trigger the onConfirm callback
      //       onClose(); // Close the modal
      //     },
      //     fail: (error) => {
      //       console.error("Error cancelling appointment:", error);
      //       alert("Failed to cancel the appointment. Please try again."); // Show error message
      //     },
      //   });
      // } catch (error) {
      //   console.error("Unexpected error during cancellation:", error); // Log unexpected error
      //   alert("An unexpected error occurred. Please try again."); // Show error message
      // }
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
