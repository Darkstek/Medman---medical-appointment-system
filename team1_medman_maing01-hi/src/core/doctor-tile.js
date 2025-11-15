//@@viewOn:imports
import { createVisualComponent, PropTypes } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  main: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      backgroundColor: "#fff",
      width: "100%",
    }),

  photo: () =>
    Config.Css.css({
      width: "120px",
      height: "120px",
      borderRadius: "50%",
      objectFit: "cover",
      marginBottom: "12px",
    }),
  statusBox: () =>
    Config.Css.css({
      padding: "10px",
      marginTop: "10px",
    }),
};
//@@viewOff:css

const DoctorTile = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorTile",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    doctor: PropTypes.shape({
      profilePhoto: PropTypes.string,
      firstName: PropTypes.string.isRequired,
      lastName: PropTypes.string.isRequired,
      specialization: PropTypes.string.isRequired,
      rating: PropTypes.number.isRequired,
      status: PropTypes.string.isRequired,
    }).isRequired,
  },
  //@@viewOff:propTypes

  render: function (props) {
    const { doctor } = props;
    return (
      <Uu5Elements.Box className={Css.main()}>
        <img
          src={doctor.profilePhoto || "https://via.placeholder.com/120"}
          alt={`${doctor.firstName} ${doctor.lastName}`}
          className={Css.photo()}
        />
        <Uu5Elements.Text category="interface" segment="title" type="common">
          {doctor.firstName} {doctor.lastName}
        </Uu5Elements.Text>
        <Uu5Elements.Text>{doctor.specialization}</Uu5Elements.Text>

        <Uu5Elements.Text>{doctor.averageRating}</Uu5Elements.Text>

        {doctor.status === "active" ? (
          <Uu5Elements.HighlightedBox colorScheme="positive" className={Css.statusBox()}>
            Available for appointments
          </Uu5Elements.HighlightedBox>
        ) : (
          <Uu5Elements.HighlightedBox colorScheme="negative" className={Css.statusBox()}>
            Not available for appointments at the moment
          </Uu5Elements.HighlightedBox>
        )}
      </Uu5Elements.Box>
    );
  },
});

//@@viewOn:exports
export { DoctorTile };
export default DoctorTile;
//@@viewOff:exports
