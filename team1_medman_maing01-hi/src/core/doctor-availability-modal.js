//@@viewOn:imports
import { createVisualComponent, PropTypes, useState, useEffect } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import BookAppointmentConfirmModal from "./book-appointment-confirm-modal.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  timeSlotRow: () =>
    Config.Css.css({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "12px 16px",
      borderBottom: "1px solid #e0e0e0",
      "&:last-child": {
        borderBottom: "none",
      },
    }),
  timeSlotText: () =>
    Config.Css.css({
      flex: 1,
    }),
  modalContent: () =>
    Config.Css.css({
      maxHeight: "60vh",
      overflowY: "auto",
    }),
  noSlotsMessage: () =>
    Config.Css.css({
      padding: "24px",
      textAlign: "center",
    }),
};
//@@viewOff:css

const DoctorAvailabilityModal = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorAvailabilityModal",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    open: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    doctor: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      specialization: PropTypes.string,
      availableTimeSlots: PropTypes.arrayOf(
        PropTypes.shape({
          start: PropTypes.string.isRequired,
          end: PropTypes.string.isRequired,
        }),
      ),
    }),
    clinicName: PropTypes.string

  },
  //@@viewOff:propTypes

  render({ open, onClose, doctor }) {
    const [bookAppointmentModalOpen, setBookAppointmentModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
    const [appointments, setAppointments] = useState([]);
    const [loadingAppointments, setLoadingAppointments] = useState(false);


    const handleBookClick = (timeSlot) => {
      setSelectedTimeSlot(timeSlot);
      setBookAppointmentModalOpen(true);
      onClose(); // Close availability modal when opening book modal
    };

    const formatTimeSlot = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);

      const options = {
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      const startStr = startDate.toLocaleString("en-US", options);
      const endTime = endDate.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      return `${startStr} - ${endTime}`;
    };
    console.log("doctor", doctor.id)
    useEffect(() => {
      if (!open || !doctor?.id) return;

      const fetchAppointments = async () => {
        setLoadingAppointments(true);
        try {
          const result = await Calls.findAppointments({ doctorId: doctor.id });
          setAppointments(result?.itemList || []);
        } catch (error) {
          console.error("Failed to fetch appointments", error);
          setAppointments([]);
        } finally {
          setLoadingAppointments(false);
        }
        console.log("appointments", appointments)
      };

      fetchAppointments();
    }, [open, doctor.id]);


    // Filter available time slots
    const now = new Date();

    const filteredTimeSlots = (doctor.availableTimeSlots || []).filter((slot) => {
      const slotStart = new Date(slot.start);
      const slotEnd = new Date(slot.end);

      // only future slots
      if (slotStart <= now) return false;

      // exclude booked slots
      const isBooked = appointments.some((appointment) => {
        // ignore cancelled appointments
        if (appointment.status === "Cancelled") return false;
        if (appointment.doctorId !== doctor.id) return false;

        const appointmentTime = new Date(appointment.dateTime);

        // appointment falls inside slot
        return (
          appointmentTime >= slotStart &&
          appointmentTime < slotEnd
        );
      });

      return !isBooked;
    });
    const hasAvailableSlots = filteredTimeSlots.length > 0;

    return (
      <>
        <Uu5Elements.Modal
          open={open}
          onClose={onClose}
          header={
            <Uu5Elements.Text category="interface" segment="title" type="major">
              {doctor.firstName} {doctor.lastName} is available on the following dates
              {` at ${doctor.clinicName}`}
            </Uu5Elements.Text>
          }
        >
          <div className={Css.modalContent()}>
            {!hasAvailableSlots ? (
              <div className={Css.noSlotsMessage()}>
                <Uu5Elements.HighlightedBox colorScheme="warning">
                  No available time slots at the moment. Please check back later.
                </Uu5Elements.HighlightedBox>
              </div>
            ) : (
              <Uu5Elements.Block>
                {filteredTimeSlots.map((slot, index) => (
                  <div key={index} className={Css.timeSlotRow()}>
                    <Uu5Elements.Text className={Css.timeSlotText()}>
                      {formatTimeSlot(slot.start, slot.end)}
                    </Uu5Elements.Text>
                    <Uu5Elements.Button
                      colorScheme="primary"
                      significance="highlighted"
                      onClick={() => handleBookClick(slot)}
                    >
                      Book
                    </Uu5Elements.Button>
                  </div>
                ))}
              </Uu5Elements.Block>
            )}
          </div>
        </Uu5Elements.Modal>

        <BookAppointmentConfirmModal
          open={bookAppointmentModalOpen}
          onClose={() => setBookAppointmentModalOpen(false)}
          doctorId={doctor.id}
          timeSlot={selectedTimeSlot}
        />
      </>
    );
  },
});

//@@viewOn:exports
export { DoctorAvailabilityModal };
export default DoctorAvailabilityModal;
//@@viewOff:exports
