//@@viewOn:imports
import { createVisualComponent, PropTypes, useState } from "uu5g05";
import { useAlertBus } from "uu5g05-elements";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Config from "./config/config.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  statusBox: () =>
    Config.Css.css({
      padding: "10px",
      marginBottom: "16px",
    }),
  actionButtons: () =>
    Config.Css.css({
      display: "flex",
      gap: "12px",
      marginTop: "24px",
      justifyContent: "flex-end",
    }),
  noteSection: () =>
    Config.Css.css({
      marginTop: "24px",
      padding: "16px",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
    }),
};
//@@viewOff:css

const DoctorAppointmentDetailModal = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorAppointmentDetailModal",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    open: PropTypes.bool.isRequired,
    appointment: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onUpdate: PropTypes.func,
  },
  //@@viewOff:propTypes

  render({ open, appointment, onClose, onUpdate }) {
    const [loading, setLoading] = useState(false);
    const [note, setNote] = useState(appointment?.note || "");
    const { addAlert } = useAlertBus();

    if (!appointment) return null;

    const showError = (error, header = "") => {
      addAlert({
        header,
        message: error.message || error,
        priority: "error",
        durationMs: 2000,
      });
    };

    const showSuccess = (message) => {
      addAlert({
        message,
        priority: "success",
        durationMs: 2000,
      });
    };

    const handleStatusChange = async (newStatus) => {
      setLoading(true);
      try {
        // Mock implementation for development - replace with real API call when backend is ready
        await new Promise(resolve => setTimeout(resolve, 500));
        
        showSuccess(`Appointment ${newStatus.toLowerCase()} successfully!`);
        onClose();
        
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error(err);
        showError(err, "Failed to update appointment status");
      } finally {
        setLoading(false);
      }
    };

    const handleAddNote = async () => {
      if (!note.trim()) {
        showError("Please enter a note");
        return;
      }

      setLoading(true);
      try {
        // Note: Backend doesn't have a separate update note endpoint yet
        // This would need to be implemented on the backend
        // For now, we'll just show success and update locally
        showSuccess("Note functionality requires backend implementation");
        
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error(err);
        showError(err, "Failed to add note");
      } finally {
        setLoading(false);
      }
    };

    const getStatusColorScheme = () => {
      switch (appointment.status) {
        case "Requested":
          return "warning";
        case "Completed":
          return "positive";
        case "Cancelled":
          return "negative";
        case "Confirmed":
          return "important";
        default:
          return "building";
      }
    };

    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={
          <Uu5Elements.Text category="interface" segment="title" type="major">
            Appointment Details
          </Uu5Elements.Text>
        }
      >
        <Uu5Elements.HighlightedBox
          colorScheme={getStatusColorScheme()}
          significance="distinct"
          className={Css.statusBox()}
        >
          Status: {appointment.status}
        </Uu5Elements.HighlightedBox>

        <Uu5Elements.ListLayout
          itemList={[
            {
              label: <Uu5Elements.Icon icon="uugds-user" />,
              children: (
                <>
                  <Uu5Elements.Text category="interface" segment="title" type="common">
                    {appointment.patient?.firstName} {appointment.patient?.lastName}
                  </Uu5Elements.Text>
                  {appointment.patient?.emailAddress && (
                    <div>Email: {appointment.patient.emailAddress}</div>
                  )}
                </>
              ),
            },
            {
              label: <Uu5Elements.Icon icon="uugds-phone" />,
              children: appointment.patient?.phoneNumber || "N/A",
            },
            {
              label: <Uu5Elements.Icon icon="uugds-calendar" />,
              children: <Uu5Elements.DateTime value={appointment.dateTime} />,
            },
            {
              label: <Uu5Elements.Icon icon="uugds-mapmarker" />,
              children: (
                <>
                  <div>{appointment.clinic?.name}</div>
                  <div>{appointment.clinic?.street}, {appointment.clinic?.city}</div>
                </>
              ),
            },
            appointment.note && {
              label: "Current Note",
              children: appointment.note,
            },
          ].filter(Boolean)}
        />

        {/* Note Section */}
        {(appointment.status === "Confirmed" || appointment.status === "Requested") && (
          <div className={Css.noteSection()}>
            <Uu5Elements.Text category="interface" segment="title" type="micro" style={{ marginBottom: "8px" }}>
              Add/Update Note:
            </Uu5Elements.Text>
            <Uu5Forms.TextArea
              value={note}
              onChange={(e) => setNote(e.data.value)}
              placeholder="Add notes about this appointment..."
              rows={3}
              maxLength={500}
            />
            <Uu5Elements.Button
              colorScheme="blue"
              onClick={handleAddNote}
              disabled={loading}
              style={{ marginTop: "8px" }}
            >
              Save Note
            </Uu5Elements.Button>
          </div>
        )}

        {/* Action Buttons for Requested Appointments */}
        {appointment.status === "Requested" && (
          <div className={Css.actionButtons()}>
            <Uu5Elements.Button
              colorScheme="negative"
              onClick={() => handleStatusChange("Cancelled")}
              disabled={loading}
            >
              Decline
            </Uu5Elements.Button>
            <Uu5Elements.Button
              colorScheme="positive"
              onClick={() => handleStatusChange("Confirmed")}
              disabled={loading}
            >
              Confirm Appointment
            </Uu5Elements.Button>
          </div>
        )}

        {/* Action Buttons for Confirmed Appointments */}
        {appointment.status === "Confirmed" && (
          <div className={Css.actionButtons()}>
            <Uu5Elements.Button
              colorScheme="negative"
              onClick={() => handleStatusChange("Cancelled")}
              disabled={loading}
            >
              Cancel Appointment
            </Uu5Elements.Button>
            <Uu5Elements.Button
              colorScheme="positive"
              onClick={() => handleStatusChange("Completed")}
              disabled={loading}
            >
              Mark as Completed
            </Uu5Elements.Button>
          </div>
        )}
      </Uu5Elements.Modal>
    );
  },
});

//@@viewOn:exports
export { DoctorAppointmentDetailModal };
export default DoctorAppointmentDetailModal;
//@@viewOff:exports
