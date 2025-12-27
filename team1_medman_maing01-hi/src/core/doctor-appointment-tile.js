//@@viewOn:imports
import { createVisualComponent, PropTypes, useState } from "uu5g05";
import { useAlertBus } from "uu5g05-elements";
import * as Uu5Elements from "uu5g05-elements";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import DoctorAppointmentDetailModal from "./doctor-appointment-detail-modal.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  statusBadge: (status) => {
    const colors = {
      Requested: "#ff9800",
      Confirmed: "#2196f3",
      Completed: "#4caf50",
      Cancelled: "#f44336",
    };
    return Config.Css.css({
      backgroundColor: colors[status] || "#757575",
      color: "white",
      padding: "4px 12px",
      borderRadius: "12px",
      fontSize: "12px",
      fontWeight: "500",
    });
  },
  patientInfo: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    }),
  infoRow: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      gap: "8px",
    }),
};
//@@viewOff:css

const DoctorAppointmentTile = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorAppointmentTile",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    appointment: PropTypes.shape({
      id: PropTypes.string.isRequired,
      patientId: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      dateTime: PropTypes.string.isRequired,
      note: PropTypes.string,
      patient: PropTypes.shape({
        firstName: PropTypes.string,
        lastName: PropTypes.string,
        phoneNumber: PropTypes.string,
      }),
    }).isRequired,
    onUpdate: PropTypes.func,
  },
  //@@viewOff:propTypes

  render({ appointment, onUpdate }) {
    const [detailModalOpen, setDetailModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const { addAlert } = useAlertBus();

    const formatDateTime = (dateTime) => {
      const date = new Date(dateTime);
      return date.toLocaleString("en-US", {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    };

    const handleQuickStatusChange = async (newStatus) => {
      setLoading(true);
      try {
        // Mock implementation for development - replace with real API call when backend is ready
        //await new Promise(resolve => setTimeout(resolve, 500));
        // BE call below
        console.log("doctor tile id", appointment.id)

        await Calls.updateAppointmentStatus({id: appointment.id, status: newStatus});
        addAlert({
          message: `Appointment ${newStatus.toLowerCase()} successfully!`,
          priority: "success",
          durationMs: 2000,
        });
        if (onUpdate) onUpdate();
      } catch (err) {
        console.error(err);
        addAlert({
          message: err.message || "Failed to update appointment status",
          priority: "error",
          durationMs: 2000,
        });
      } finally {
        setLoading(false);
      }
    };

    const getActionButtons = () => {
      const buttons = [
        {
          children: "View Details",
          colorScheme: "blue",
          onClick: () => setDetailModalOpen(true),
        },
      ];

      if (appointment.status === "Created") {
        buttons.unshift(
          {
            children: "Confirm",
            colorScheme: "positive",
            onClick: () => handleQuickStatusChange("Confirmed"),
            disabled: loading,
          },
          {
            children: "Decline",
            colorScheme: "negative",
            onClick: () => handleQuickStatusChange("Cancelled"),
            disabled: loading,
          }
        );
      } else if (appointment.status === "Confirmed") {
        buttons.unshift({
          children: "Complete",
          colorScheme: "positive",
          onClick: () => handleQuickStatusChange("Completed"),
          disabled: loading,
        });
      }

      return buttons;
    };

    return (
      <>
        <Uu5TilesElements.Tile
          header={
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Uu5Elements.DateTime value={appointment.dateTime} />
              <span className={Css.statusBadge(appointment.status)}>{appointment.status}</span>
            </div>
          }
          footer={
            <Uu5Elements.ButtonGroup
              spacing="8px"
              itemList={getActionButtons()}
            />
          }
          footerHorizontalAlignment="end"
        >
          <div className={Css.patientInfo()}>
            <div className={Css.infoRow()}>
              <Uu5Elements.Icon icon="uugds-account" />
              <Uu5Elements.Text category="interface" segment="title" type="common">
                {appointment.patient?.firstName} {appointment.patient?.lastName}
              </Uu5Elements.Text>
            </div>

            {appointment.patient?.phoneNumber && (
              <div className={Css.infoRow()}>
                <Uu5Elements.Icon icon="uugds-phone" />
                <Uu5Elements.Text>{appointment.patient.phoneNumber}</Uu5Elements.Text>
              </div>
            )}

            <div className={Css.infoRow()}>
              <Uu5Elements.Icon icon="uugds-calendar" />
              <Uu5Elements.Text>{formatDateTime(appointment.dateTime)}</Uu5Elements.Text>
            </div>

            {appointment.note && (
              <div className={Css.infoRow()}>
                <Uu5Elements.Icon icon="uugds-note" />
                <Uu5Elements.Text>{appointment.note}</Uu5Elements.Text>
              </div>
            )}
          </div>
        </Uu5TilesElements.Tile>

        <DoctorAppointmentDetailModal
          handleStatusChange={handleQuickStatusChange}
          open={detailModalOpen}
          appointment={appointment}
          onClose={() => setDetailModalOpen(false)}
          onUpdate={() => {
            setDetailModalOpen(false);
            if (onUpdate) onUpdate();
          }}
        />
      </>
    );
  },
});

//@@viewOn:exports
export { DoctorAppointmentTile };
export default DoctorAppointmentTile;
//@@viewOff:exports
