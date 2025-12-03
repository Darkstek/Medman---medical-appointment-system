import { createVisualComponent, useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import BookAppointmentModal from "./book-appointment-modal.js";

const Css = {
  main: () => Config.Css.css({}),

  button: () =>
    Config.Css.css({
      margin: "2px",
    }),
};

const BookAppointmentButton = createVisualComponent({
  uu5Tag: Config.TAG + "BookAppointmentButton",

  render: function () {
    const [bookAppointmentModalOpen, setBookAppointmentModalOpen] = useState(false);

    const handleButtonClick = () => {
      setBookAppointmentModalOpen(true);
    };

    const handleModalClose = () => {
      setBookAppointmentModalOpen(false);
    };

    // const handleCreateAppointment = (newAppointment) => {
    //   console.log("Book appointment button:", newAppointment);
    //   //Update parent state or perform additional actions
    // };
    // console.log("onCreate prop in BookAppointmentModal:", onCreate);

    return (
      <>
        <Uu5Elements.Button onClick={handleButtonClick} className={Css.button()} size="m" significance="highlighted">
          Create an Appointment
        </Uu5Elements.Button>
        <BookAppointmentModal open={bookAppointmentModalOpen} onClose={handleModalClose} />
      </>
    );
  },
});

//@@viewOn:exports
export { BookAppointmentButton };
export default BookAppointmentButton;
//@@viewOff:exports
