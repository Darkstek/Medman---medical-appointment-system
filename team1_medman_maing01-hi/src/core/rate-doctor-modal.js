//@@viewOn:imports
import { createVisualComponent, PropTypes, useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Config from "./config/config.js";
import Calls from "calls";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  content: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "24px",
      padding: "32px",
      alignItems: "center",
    }),
  doctorName: () =>
    Config.Css.css({
      fontSize: "24px",
      fontWeight: "600",
      textAlign: "center",
      marginBottom: "8px",
    }),
  starsContainer: () =>
    Config.Css.css({
      display: "flex",
      gap: "16px",
      justifyContent: "center",
    }),
  star: (isSelected, isHovered) =>
    Config.Css.css({
      fontSize: "48px",
      cursor: "pointer",
      color: isSelected || isHovered ? "#ffc107" : "#e0e0e0",
      transition: "all 0.2s ease",
      transform: isHovered ? "scale(1.15)" : "scale(1)",
      "&:hover": {
        transform: "scale(1.15)",
      },
    }),
  commentSection: () =>
    Config.Css.css({
      width: "100%",
      maxWidth: "400px",
    }),
  buttonGroup: () =>
    Config.Css.css({
      display: "flex",
      gap: "16px",
      marginTop: "16px",
      width: "100%",
      maxWidth: "400px",
    }),
  button: () =>
    Config.Css.css({
      flex: 1,
      padding: "12px 24px",
    }),
  successMessage: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "16px",
      padding: "32px",
      textAlign: "center",
    }),
  successIcon: () =>
    Config.Css.css({
      fontSize: "64px",
      color: "#4caf50",
    }),
  errorMessage: () =>
    Config.Css.css({
      width: "100%",
      maxWidth: "400px",
    }),
};
//@@viewOff:css

const RateDoctorModal = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "RateDoctorModal",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSuccess: PropTypes.func,
    doctor: PropTypes.shape({
      id: PropTypes.string,
      doctorId: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      specialization: PropTypes.string,
    }),
    patientId: PropTypes.string,
    appointmentId: PropTypes.string,
  },
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {
    open: false,
    onClose: () => {},
    onSuccess: () => {},
    doctor: null,
    patientId: "PAT-001",
    appointmentId: null,
  },
  //@@viewOff:defaultProps

  render(props) {
    const { open, onClose, onSuccess, doctor, patientId, appointmentId } = props;

    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    const handleClose = () => {
      setRating(0);
      setHoveredRating(0);
      setComment("");
      setError(null);
      setSubmitted(false);
      onClose();
    };

    const handleSubmit = async () => {
      if (rating === 0) {
        setError("Please select a rating");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        await Calls.createRating({
          doctorId: doctor?.doctorId || doctor?.id,
          patientId: patientId,
          appointmentId: appointmentId,
          rating: rating,
          comment: comment.trim() || undefined,
        });

        setSubmitted(true);
        onSuccess?.(rating, comment.trim() || null); // Pass rating and comment to parent
      } catch (err) {
        console.error("Error submitting rating:", err);
        setError(err.message || "Failed to submit review. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    const renderStars = () => {
      return (
        <div className={Css.starsContainer()}>
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={Css.star(star <= rating, star <= hoveredRating)}
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              role="button"
              aria-label={`Rate ${star} stars`}
            >
              ☆
            </span>
          ))}
        </div>
      );
    };

    // Success state
    if (submitted) {
      return (
        <Uu5Elements.Modal open={open} onClose={handleClose} width={500}>
          <div className={Css.successMessage()}>
            <span className={Css.successIcon()}>✓</span>
            <Uu5Elements.Text category="story" segment="heading" type="h3">
              Review Submitted!
            </Uu5Elements.Text>
            <Uu5Elements.Text category="interface" segment="content" colorScheme="building">
              Thank you for rating Dr. {doctor?.firstName} {doctor?.lastName}. Your feedback helps improve
              healthcare quality.
            </Uu5Elements.Text>
            <Uu5Elements.Button
              colorScheme="grey"
              significance="highlighted"
              onClick={handleClose}
              className={Css.button()}
            >
              Close
            </Uu5Elements.Button>
          </div>
        </Uu5Elements.Modal>
      );
    }

    // Rating form
    return (
      <Uu5Elements.Modal open={open} onClose={handleClose} width={500}>
        <div className={Css.content()}>
          {/* Doctor Name */}
          <div className={Css.doctorName()}>
            {doctor?.firstName} {doctor?.lastName}
          </div>

          {/* Error message */}
          {error && (
            <Uu5Elements.HighlightedBox colorScheme="negative" className={Css.errorMessage()}>
              {error}
            </Uu5Elements.HighlightedBox>
          )}

          {/* Star Rating */}
          {renderStars()}

          {/* Comment */}
          <div className={Css.commentSection()}>
            <Uu5Forms.TextArea
              value={comment}
              onChange={(e) => setComment(e.data.value)}
              rows={4}
              placeholder="Add comment..."
              maxLength={500}
            />
          </div>

          {/* Buttons */}
          <div className={Css.buttonGroup()}>
            <Uu5Elements.Button
              colorScheme="grey"
              significance="highlighted"
              onClick={handleClose}
              disabled={loading}
              className={Css.button()}
            >
              Cancel
            </Uu5Elements.Button>
            <Uu5Elements.Button
              colorScheme="grey"
              significance="highlighted"
              onClick={handleSubmit}
              disabled={loading || rating === 0}
              className={Css.button()}
            >
              {loading ? "Submitting..." : "Submit Review"}
            </Uu5Elements.Button>
          </div>
        </div>
      </Uu5Elements.Modal>
    );
  },
});

//@@viewOn:exports
export { RateDoctorModal };
export default RateDoctorModal;
//@@viewOff:exports
