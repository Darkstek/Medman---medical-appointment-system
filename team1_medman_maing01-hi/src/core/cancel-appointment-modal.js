import { createVisualComponent, useState, useEffect, PropTypes } from "uu5g05";
import { useAlertBus } from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import { mockFetchAppointments } from "../../mock/mockFetch.js";
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
  render({ open, onClose, appointmentId }) {
    const [loading, setLoading] = useState(false);
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
      console.log("AppointmentId: ", appointmentId);

      if (!appointmentId) {
        addAlert({
          message: `Appointment ID is missing.`,
          priority: "error",
          durationMs: 2000,
        });
        return;
      }

      setLoading(true);

      try {
        // Define the dtoIn for findAppointments
        const findAppointments = {
          sortBy: {
            id: "desc",
          },
          pageInfo: {
            pageIndex: 0,
            pageSize: 100,
          },
        };

        // testing -> comment out whole section and user dToIn and mockCancelAppoitment for testing without server
        // Fetch appointments using findAppointments
        const appointmentsResponse = await Calls.findAppointments(findAppointments);
        function matchAppointmentId(payload, targetAppointmentId) {
          if (!payload || !Array.isArray(payload.itemList)) return null;

          for (const item of payload.itemList) {
            if (item.appointmentId === targetAppointmentId) {
              return item.id;
            }
          }
          return null; // not found
        }

        const matchedId = matchAppointmentId(appointmentsResponse, appointmentId);
        console.log("MatchedIdApi: ", matchedId);

        if (!matchedId) {
          addAlert({
            message: `Appointment with ID ${appointmentId} not found.`,
            priority: "error",
            durationMs: 2000,
          });
          return;
        }

        //Set dtoIn using the fetched appointment data
        const cancelDtoIn = { id: matchedId };
        console.log("cancelDtoIn: ", cancelDtoIn);

        //for testing Mocked success response - in demo data we fetch appointmentId-> comment out code above
        const dtoIn = { id: appointmentId };
        console.log("dtoInMock:", dtoIn);
        const mockCancelAppointment = (dtoIn) =>
          new Promise((resolve) => {
            setTimeout(() => {
              resolve({
                message: "Appointment has been cancelled!",
                id: dtoIn.id, // Include the appointment ID in the response
              });
            }, 1000); // Simulate a 1-second delay
          });

        // try {
        //for testing -> call mocked function instead of BE call + onConfirm to uncomment - please check comments in appointment-list for mock usage
        //const dtoOut = await mockCancelAppointment(dtoIn); // Use the mocked function
        const dtoOut = await Calls.cancelAppointment(cancelDtoIn);
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
