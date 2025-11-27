import { createVisualComponent, PropTypes } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";

const Css = {
  statusBox: () =>
    Config.Css.css({
      padding: "10px",
      marginTop: "10px",
    }),
};

const AppointmentDetailModal = createVisualComponent({
  uu5Tag: "AppointmentDetailModal",

  propTypes: {
    open: PropTypes.bool.isRequired,
    appointment: PropTypes.object,
    onClose: PropTypes.func.isRequired,
  },

  render({ open, appointment, onClose }) {
    if (!appointment) return null;

    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={
          appointment.status === "Completed" ? (
            <Uu5Elements.HighlightedBox colorScheme="positive" significance="distinct" className={Css.statusBox()}>
              Realised Appointment
            </Uu5Elements.HighlightedBox>
          ) : appointment.status === "Cancelled" ? (
            <Uu5Elements.HighlightedBox colorScheme="negative" significance="distinct" className={Css.statusBox()}>
              Appointment Cancelled
            </Uu5Elements.HighlightedBox>
          ) : (
            <Uu5Elements.HighlightedBox colorScheme="important" significance="distinct" className={Css.statusBox()}>
              Upcoming Appointment
            </Uu5Elements.HighlightedBox>
          )
        }
      >
        <Uu5Elements.ListLayout
          itemList={[
            { label : <Uu5Elements.Icon icon="uugds-calendar" />,
              children: <Uu5Elements.DateTime value={appointment.dateTime} />,
            },
            {
              label: "About",
              children: appointment.note,
            },
            {
              label: <Uu5Elements.Icon icon="uugdsstencil-education-student" />,
              children: <><div>{appointment.doctor.firstName + " " + appointment.doctor.lastName}</div> <div> {appointment.doctor.specialization}</div></>,
            },
            {
              label: <Uu5Elements.Icon icon="uugds-mapmarker" />,
              children: (
                <>
                  <div>{appointment.clinic?.name} {appointment.clinic?.building}</div>
                  <div> {appointment.clinic?.street}</div>
                  <div> {appointment.clinic?.city}</div>
                </>
              ),
            },
            {
              label: <Uu5Elements.Icon icon="uugds-phone" />,
              children: appointment.clinic?.phone,
            },
            {
              label: <Uu5Elements.Icon icon="uugds-email" />,
              children: appointment.clinic?.email,
            },
          ]}
        ></Uu5Elements.ListLayout>
      </Uu5Elements.Modal>
    );
  },
});

export { AppointmentDetailModal };
export default AppointmentDetailModal;
