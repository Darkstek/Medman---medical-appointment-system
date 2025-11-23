import Uu5, { createVisualComponent, PropTypes, useState } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import AppointmentDetailModal from "./appointment-detail-modal.js";

const AppointmentTile = createVisualComponent({
  uu5Tag: Config.TAG + "AppointmentTile",

  propTypes: {
    appointment: PropTypes.shape({
      date: PropTypes.string.isRequired,
      time: PropTypes.string.isRequired,
      note: PropTypes.string,
      doctor: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
      }),
      clinic: PropTypes.shape({
        name: PropTypes.string,
      }),
    }).isRequired,
  },

  render({ appointment }) {
    const [appointmentDetailModalOpen, setAppointmentDetailModalOpen] = useState(false);

    return (
      <Uu5TilesElements.Tile
        header={<Uu5Elements.DateTime value={appointment.date} />}
        footer={
          <Uu5Elements.ButtonGroup
            spacing="8px"
            itemList={[
              {
                children: <Uu5Elements.Icon icon="uugds-eye" />,
                colorScheme: "blue",
                onClick: () => setAppointmentDetailModalOpen(true),
              },
              appointment.status === "upcoming" && {
                children: "Cancel",
                colorScheme: "red",
                onClick: () => alert("Cancel appointment functionality to be implemented"),
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
            <Uu5Elements.Text> {appointment.clinic?.name}</Uu5Elements.Text>
          </div>
          <div>
            <Uu5Elements.Icon icon="uugdsstencil-education-student" />
            <Uu5Elements.Text> {appointment.doctor?.specialization}</Uu5Elements.Text>
          </div>
        </Uu5Elements.Grid>

        <AppointmentDetailModal
          open={appointmentDetailModalOpen}
          appointment={appointment}
          onClose={() => setAppointmentDetailModalOpen(false)}
        />
      </Uu5TilesElements.Tile>
    );
  },
});

export { AppointmentTile };
export default AppointmentTile;
