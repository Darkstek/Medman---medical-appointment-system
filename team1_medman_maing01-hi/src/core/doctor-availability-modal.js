//@@viewOn:imports
import { createVisualComponent, PropTypes, useState } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import BookAppointmentModal from "./book-appointment-modal.js";
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
      doctorId: PropTypes.string,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      specialization: PropTypes.string,
      availableTimeSlots: PropTypes.arrayOf(
        PropTypes.shape({
          start: PropTypes.string.isRequired,
          end: PropTypes.string.isRequired,
        })
      ),
      clinicId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }).isRequired,
    clinic: PropTypes.shape({
      name: PropTypes.string,
    }),
  },
  //@@viewOff:propTypes

  render({ open, onClose, doctor, clinic }) {
    const [bookAppointmentModalOpen, setBookAppointmentModalOpen] = useState(false);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);

    const handleBookClick = (timeSlot) => {
      setSelectedTimeSlot(timeSlot);
      setBookAppointmentModalOpen(true);
      onClose(); // Close availability modal when opening book modal
    };

    const formatTimeSlot = (start, end) => {
      const startDate = new Date(start);
      const endDate = new Date(end);
      
      const options = { 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      };
      
      const startStr = startDate.toLocaleString('en-US', options);
      const endTime = endDate.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
      
      return `${startStr} - ${endTime}`;
    };

    const hasAvailableSlots = doctor.availableTimeSlots && doctor.availableTimeSlots.length > 0;

    return (
      <>
        <Uu5Elements.Modal
          open={open}
          onClose={onClose}
          header={
            <Uu5Elements.Text category="interface" segment="title" type="major">
              {doctor.firstName} {doctor.lastName} is available on the following dates
              {clinic && ` at ${clinic.name}`}
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
                {doctor.availableTimeSlots.map((slot, index) => (
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

        <BookAppointmentModal 
          open={bookAppointmentModalOpen} 
          onClose={() => setBookAppointmentModalOpen(false)}
        />
      </>
    );
  },
});

//@@viewOn:exports
export { DoctorAvailabilityModal };
export default DoctorAvailabilityModal;
//@@viewOff:exports
