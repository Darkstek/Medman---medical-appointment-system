import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import { mockFetchDoctors } from "../../mock/mockFetch.js";
const Css = {};
const CancelAppointmentModal = createVisualComponent({
  uu5Tag: Config.TAG + "CancelAppointmentModal",
  propTypes: {
    onClose: PropTypes.func.isRequired, // Add onClose prop to handle modal close
    open: PropTypes.bool.isRequired, // Add isOpen prop to control modal visibility
    onConfirm: PropTypes.func.isRequired, 
  },
  render({ open, onClose, onConfirm }) {

     //TODO: Implement cancel appointment functionality BE
    const handleSubmit = (e) => {
      e.preventDefault();
      alert("Appointment has been cancelled!"); // Show a success message
      onConfirm(); 
    //  onClose();
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
        <Uu5Forms.SubmitButton onClick={handleSubmit}>Confirm</Uu5Forms.SubmitButton>
      </Uu5Elements.Modal>
    );
  },
});
//@@viewOn:exports
export { CancelAppointmentModal };
export default CancelAppointmentModal;
//@@viewOff:exports