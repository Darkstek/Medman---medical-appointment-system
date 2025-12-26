import Uu5, { createVisualComponent, PropTypes, useState } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import AppointmentDetailModal from "./appointment-detail-modal.js";
import CancelAppointmentModal from "./cancel-appointment-modal.js";
import RateDoctorModal from "./rate-doctor-modal.js";

const AppointmentTile = createVisualComponent({
  uu5Tag: Config.TAG + "AppointmentTile",

  propTypes: {
    appointment: PropTypes.shape({
      appointmentId: PropTypes.string,
      id: PropTypes.string,
      doctorId: PropTypes.string.isRequired,
      status: PropTypes.string.isRequired,
      dateTime: PropTypes.string.isRequired,
      //  time: PropTypes.string.isRequired,
      note: PropTypes.string,
      doctor: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
      }),
      clinic: PropTypes.shape({
        id: PropTypes.string,
        name: PropTypes.string,
      }),
    }).isRequired,
    onCancel: PropTypes.func,
  },

  render({ appointment, onCancel }) {
    const [appointmentDetailModalOpen, setAppointmentDetailModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);

    // Check if appointment is in the past or completed
    const appointmentDate = new Date(appointment.dateTime);
    const isPastAppointment = appointmentDate < new Date();
    const canRate = isPastAppointment || appointment.status === "Completed";

    return (
      <Uu5TilesElements.Tile
        header={<Uu5Elements.DateTime value={appointment.dateTime} />}
        footer={
          <Uu5Elements.ButtonGroup
            spacing="8px"
            itemList={[
              {
                children: <Uu5Elements.Icon icon="uugds-eye" />,
                colorScheme: "blue",
                onClick: () => setAppointmentDetailModalOpen(true),
              },
              canRate && {
                children: (
                  <>
                    <Uu5Elements.Icon icon="mdi-star" /> Rate
                  </>
                ),
                colorScheme: "yellow",
                onClick: () => setRateModalOpen(true),
              },
              appointment.status === "Confirmed" && !isPastAppointment && {
                children: "Cancel",
                colorScheme: "red",
                onClick: () => onCancel(appointment.appointment),
              },
            ].filter(Boolean)}
          ></Uu5Elements.ButtonGroup>
        }
        footerHorizontalAlignment="end"
      >
        <Uu5Elements.Grid justifyItems="start">
          <Uu5Elements.Text category="interface" segment="title" type="common">
            {appointment.doctor?.firstName} {appointment.doctor?.lastName}
          </Uu5Elements.Text>
          <div>
            <Uu5Elements.Icon icon="uugds-mapmarker" />
            <Uu5Elements.Text>{appointment.clinic?.name}</Uu5Elements.Text>
          </div>
          <div>
            <Uu5Elements.Icon icon="uugdsstencil-education-student" />
            <Uu5Elements.Text>{appointment.doctor?.specialization}</Uu5Elements.Text>
          </div>
        </Uu5Elements.Grid>

        <AppointmentDetailModal
          open={appointmentDetailModalOpen}
          appointment={appointment}
          onClose={() => setAppointmentDetailModalOpen(false)}
        />

        <RateDoctorModal
          open={rateModalOpen}
          onClose={() => setRateModalOpen(false)}
          doctor={appointment.doctor}
          patientId={appointment.patientId}
          appointmentId={appointment.id || appointment.appointmentId}
          onSuccess={() => {
            setRateModalOpen(false);
          }}
        />
      </Uu5TilesElements.Tile>
    );
  },
});

export { AppointmentTile };
export default AppointmentTile;
