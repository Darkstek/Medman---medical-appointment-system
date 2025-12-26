import Uu5, { createVisualComponent, PropTypes, useEffect, useState } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import AppointmentDetailModal from "./appointment-detail-modal.js";
import CancelAppointmentModal from "./cancel-appointment-modal.js";
import RateDoctorModal from "./rate-doctor-modal.js";
import Calls from "../calls";

//@@viewOn:css
const Css = {
  ratingDisplay: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      gap: "4px",
      color: "#ffc107",
      fontSize: "16px",
    }),
  starFilled: () =>
    Config.Css.css({
      color: "#ffc107",
    }),
  starEmpty: () =>
    Config.Css.css({
      color: "#e0e0e0",
    }),
  ratingComment: () =>
    Config.Css.css({
      marginTop: "8px",
      padding: "8px 12px",
      backgroundColor: "#fff9e6",
      borderLeft: "3px solid #ffc107",
      borderRadius: "4px",
      fontStyle: "italic",
      fontSize: "14px",
      color: "#666",
    }),
};
//@@viewOff:css

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
      rating: PropTypes.number, // Existing rating
      ratingComment: PropTypes.string, // Existing rating comment
      doctor: PropTypes.shape({
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        clinicName: PropTypes.string
      }),
    }).isRequired,
    onCancel: PropTypes.func,
  },

  render({ appointment, onCancel }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [appointmentDetailModalOpen, setAppointmentDetailModalOpen] = useState(false);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [submittedRating, setSubmittedRating] = useState(appointment.rating || null);
    const [submittedComment, setSubmittedComment] = useState(appointment.ratingComment || null);
    // Check if appointment is in the past or completed
    //const appointmentDate = new Date(appointment.dateTime);
    //const isPastAppointment = appointmentDate < new Date();
    //const canRate = (isPastAppointment || appointment.status === "Completed") && !submittedRating;
    const canRate = appointment.status === "Completed" && !submittedRating;
    const hasRating = submittedRating !== null;

    //BE call for rating and comment
    useEffect(() => {
      async function fetchRatingAndComment() {
        setLoading(true);
        try {
          const dtoOut = await Calls.findRatings({appointmentId: appointment.id});
          if (Array.isArray(dtoOut.itemList) && dtoOut.itemList.length > 0) {
            const ratingData = dtoOut.itemList[0]; // first rating
            setSubmittedRating(ratingData.ratingScore); // number
            setSubmittedComment(ratingData.comment); // comment string
          }
          console.log("Fetched ratings:", dtoOut);
        } catch (err) {
          setError(err.message);
        } finally {
          setLoading(false);
        }
      }
      fetchRatingAndComment();
    }, [appointment?.id]);

    // Render star rating display
    const renderRatingStars = (rating) => {
      return (
        <span className={Css.ratingDisplay()}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span key={star} className={star <= rating ? Css.starFilled() : Css.starEmpty()}>
              ★
            </span>
          ))}
        </span>
      );
    };

    return (
      <Uu5TilesElements.Tile
        header={<Uu5Elements.DateTime value={appointment.dateTime} />}
        footer={
          <div style={{ display: "flex", alignItems: "center", gap: "8px", justifyContent: "flex-end" }}>
            {hasRating && renderRatingStars(submittedRating)}
            <Uu5Elements.ButtonGroup
              spacing="8px"
              itemList={[
                canRate && {
                  children: (
                    <>
                      <Uu5Elements.Icon icon="mdi-star" /> Rate
                    </>
                  ),
                  colorScheme: "yellow",
                  onClick: () => setRateModalOpen(true),
                },
                {
                  children: <Uu5Elements.Icon icon="uugds-eye" />,
                  colorScheme: "blue",
                  onClick: () => setAppointmentDetailModalOpen(true),
                },
                appointment.status === "Confirmed"
                //&& !isPastAppointment
                && {
                  children: "Cancel",
                  colorScheme: "red",
                  onClick: () => onCancel(appointment.appointment),
                },
              ].filter(Boolean)}
            ></Uu5Elements.ButtonGroup>
          </div>
        }
        footerHorizontalAlignment="end"
      >
        <Uu5Elements.Grid justifyItems="start">
          <Uu5Elements.Text category="interface" segment="title" type="common">
            {appointment.doctor?.firstName} {appointment.doctor?.lastName}
          </Uu5Elements.Text>
          <div>
            <Uu5Elements.Icon icon="uugds-mapmarker" />
            <Uu5Elements.Text>{appointment.doctor?.clinicName}</Uu5Elements.Text>
          </div>
          <div>
            <Uu5Elements.Icon icon="uugdsstencil-education-student" />
            <Uu5Elements.Text>{appointment.doctor?.specialization}</Uu5Elements.Text>
          </div>
        </Uu5Elements.Grid>

        {/* Rating comment display */}
        {appointment.status === "Completed" && submittedComment && (
          <div className={Css.ratingComment()}>
            "{submittedComment}"
          </div>
        )}

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
          onSuccess={(rating, comment) => {
            setSubmittedRating(rating);
            setSubmittedComment(comment);
            setRateModalOpen(false);
          }}
        />
      </Uu5TilesElements.Tile>
    );
  },
});

export { AppointmentTile };
export default AppointmentTile;
