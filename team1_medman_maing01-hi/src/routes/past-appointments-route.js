//@@viewOn:imports
import { createVisualComponent, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Plus4U5App, { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import RateDoctorModal from "../core/rate-doctor-modal.js";
import Calls from "calls";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  container: () =>
    Config.Css.css({
      padding: "24px",
      maxWidth: "900px",
      margin: "0 auto",
    }),
  pageTitle: () =>
    Config.Css.css({
      marginBottom: "32px",
    }),
  appointmentCard: () =>
    Config.Css.css({
      border: "1px solid #e0e0e0",
      borderRadius: "12px",
      padding: "20px",
      marginBottom: "16px",
      backgroundColor: "#fff",
    }),
  cardHeader: () =>
    Config.Css.css({
      display: "flex",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: "12px",
    }),
  doctorName: () =>
    Config.Css.css({
      fontSize: "18px",
      fontWeight: "600",
      marginBottom: "4px",
    }),
  dateTime: () =>
    Config.Css.css({
      color: "#666",
      fontSize: "14px",
    }),
  notes: () =>
    Config.Css.css({
      color: "#444",
      fontSize: "14px",
      marginTop: "8px",
      fontStyle: "italic",
    }),
  statusBadge: (isCompleted) =>
    Config.Css.css({
      padding: "6px 12px",
      borderRadius: "16px",
      fontSize: "12px",
      fontWeight: "600",
      backgroundColor: isCompleted ? "#e8f5e9" : "#fff3e0",
      color: isCompleted ? "#2e7d32" : "#e65100",
    }),
  ratingSection: () =>
    Config.Css.css({
      marginTop: "16px",
      paddingTop: "16px",
      borderTop: "1px solid #f0f0f0",
      display: "flex",
      alignItems: "center",
      gap: "12px",
    }),
  ratingLabel: () =>
    Config.Css.css({
      fontSize: "14px",
      color: "#666",
    }),
  stars: () =>
    Config.Css.css({
      display: "flex",
      gap: "4px",
    }),
  star: (isClickable, isFilled) =>
    Config.Css.css({
      fontSize: "28px",
      color: isFilled ? "#ffc107" : "#e0e0e0",
      cursor: isClickable ? "pointer" : "default",
      transition: "transform 0.2s, color 0.2s",
      "&:hover": isClickable
        ? {
            transform: "scale(1.1)",
            color: "#ffc107",
          }
        : {},
    }),
  notAvailable: () =>
    Config.Css.css({
      color: "#999",
      fontSize: "14px",
      fontStyle: "italic",
    }),
  submittedRating: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "4px",
    }),
  submittedStars: () =>
    Config.Css.css({
      display: "flex",
      gap: "2px",
    }),
  submittedComment: () =>
    Config.Css.css({
      fontSize: "13px",
      color: "#666",
      fontStyle: "italic",
      marginTop: "4px",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
const PastAppointmentCard = ({ appointment, onRate }) => {
  // Allow rating if appointment is Completed OR if date is in the past (attended)
  const appointmentDate = new Date(appointment.dateTime);
  const isPastDate = appointmentDate < new Date();
  const isCompleted = appointment.status === "Completed" || (isPastDate && appointment.status !== "Cancelled");
  const hasRating = appointment.rating != null;
  const [hoveredStar, setHoveredStar] = useState(0);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = () => {
    if (!isCompleted) {
      return <span className={Css.notAvailable()}>Not Available</span>;
    }

    if (hasRating) {
      return (
        <div className={Css.submittedRating()}>
          <div className={Css.submittedStars()}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                className={Css.star(false, star <= appointment.rating)}
                style={{ fontSize: "24px" }}
              >
                ★
              </span>
            ))}
          </div>
          {appointment.ratingComment && (
            <span className={Css.submittedComment()}>"{appointment.ratingComment}"</span>
          )}
        </div>
      );
    }

    return (
      <div
        className={Css.stars()}
        onMouseLeave={() => setHoveredStar(0)}
        onClick={() => onRate(appointment)}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <span
            key={star}
            className={Css.star(true, star <= hoveredStar)}
            onMouseEnter={() => setHoveredStar(star)}
          >
            ☆
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={Css.appointmentCard()}>
      <div className={Css.cardHeader()}>
        <div>
          <div className={Css.doctorName()}>
            {appointment.doctor?.firstName} {appointment.doctor?.lastName}
          </div>
          <div className={Css.dateTime()}>
            {formatDate(appointment.dateTime)} at {formatTime(appointment.dateTime)}
          </div>
        </div>
        <span className={Css.statusBadge(isCompleted)}>
          Status: {appointment.status === "Cancelled" ? "Cancelled" : isCompleted ? "Completed" : "Not Completed"}
        </span>
      </div>

      {appointment.note && <div className={Css.notes()}>{appointment.note}</div>}

      <div className={Css.ratingSection()}>
        <span className={Css.ratingLabel()}>Rate the doctor</span>
        {renderStars()}
      </div>
    </div>
  );
};
//@@viewOff:helpers

let PastAppointmentsRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "PastAppointmentsRoute",
  //@@viewOff:statics

  render() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [rateModalOpen, setRateModalOpen] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    useEffect(() => {
      loadPastAppointments();
    }, []);

    const loadPastAppointments = async () => {
      setLoading(true);
      try {
        const result = await Calls.findAppointments({ past: true });
        // Filter to show past appointments (completed, cancelled, or date in past)
        const now = new Date();
        const pastAppointments = (result.itemList || []).filter((apt) => {
          const aptDate = new Date(apt.dateTime);
          // Show if completed, cancelled, or date is in the past
          return apt.status === "Completed" || apt.status === "Cancelled" || aptDate < now;
        });
        // Sort by date, most recent first
        pastAppointments.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime));
        setAppointments(pastAppointments);
      } catch (err) {
        console.error("Error loading appointments:", err);
        setError(err.message || "Failed to load past appointments");
      } finally {
        setLoading(false);
      }
    };

    const handleRate = (appointment) => {
      setSelectedAppointment(appointment);
      setRateModalOpen(true);
    };

    const handleRatingSuccess = () => {
      loadPastAppointments(); // Reload to show the new rating
    };

    return (
      <>
        <RouteBar />
        <div className={Css.container()}>
          <Uu5Elements.Text category="story" segment="heading" type="h1" className={Css.pageTitle()}>
            Past Appointments
          </Uu5Elements.Text>

          {loading ? (
            <Plus4U5App.SpaPending />
          ) : error ? (
            <Uu5Elements.HighlightedBox colorScheme="negative" icon="mdi-alert">
              {error}
            </Uu5Elements.HighlightedBox>
          ) : appointments.length === 0 ? (
            <Uu5Elements.HighlightedBox icon="mdi-calendar-blank">
              No past appointments found.
            </Uu5Elements.HighlightedBox>
          ) : (
            appointments.map((apt) => (
              <PastAppointmentCard
                key={apt.id || apt.appointmentId}
                appointment={apt}
                onRate={handleRate}
              />
            ))
          )}
        </div>

        {selectedAppointment && (
          <RateDoctorModal
            open={rateModalOpen}
            onClose={() => {
              setRateModalOpen(false);
              setSelectedAppointment(null);
            }}
            doctor={selectedAppointment.doctor}
            patientId={selectedAppointment.patientId}
            appointmentId={selectedAppointment.id || selectedAppointment.appointmentId}
            onSuccess={handleRatingSuccess}
          />
        )}
      </>
    );
  },
});

PastAppointmentsRoute = withRoute(PastAppointmentsRoute);

//@@viewOn:exports
export { PastAppointmentsRoute };
export default PastAppointmentsRoute;
//@@viewOff:exports

