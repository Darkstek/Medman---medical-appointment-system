//@@viewOn:imports
import { createVisualComponent, Lsi, useRoute, useState } from "uu5g05";
import Plus4U5App from "uu_plus4u5g02-app";

import Config from "./config/config.js";
import SearchBar from "./search-bar.js";
import BookAppointmentModal from "../core/book-appointment-modal.js";
import BookAppointmentButton from "../core/book-appointment-button.js";
import importLsi from "../lsi/import-lsi.js";

//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:css
const Css = {
  main: () =>
    Config.Css.css({
      margin: "0px",
    }),

  searchForm: () => Config.Css.css({
    paddingRight: "5px"
  }),

  textInput: () => Config.Css.css({}),

  button: () => Config.Css.css({
    margin: "0px",
  }),
};
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

const RouteBar = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "RouteBar",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    ...Plus4U5App.PositionBar.propTypes,
  },
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {

    //@@viewOn:private
    const [route, setRoute] = useRoute();
    const [bookAppointmentModalOpen, setBookAppointmentModalOpen] = useState(false);
    const [query, setQuery] = useState("");

    const handleSearch = () => {
      if (query.trim()) {
        setRoute("doctorsList", { search: query.trim() });
      }
    };

    const actionList = [
      {
        children: "Book Appointment",
        significance: "highlighted",
        colorScheme: "neutral",
        onClick: () => setBookAppointmentModalOpen(true),
      },
      {
        children: <SearchBar query={query} setQuery={setQuery} onSearch={handleSearch}/>,
        className: Css.searchForm(),


      },
      {
        children: "Search",
        className: Css.button(),
        significance: "highlighted",
        colorScheme: "neutral",
        onClick: handleSearch,
      }
    ];
    const ITEM_LIST = [
      { code: "myAppointments", label: "My Appointments", href: "myAppointments" },
      { code: "doctorsList", label: "Doctors List", href: "doctorsList" },
      { code: "doctorAppointments", label: "Doctor Schedule", href: "doctorAppointments" },
      { code: "myMedicalRecord", label: "My Medical Record", href: "myMedicalRecord" },
      { code: "manage", label: "Manage", href: "manageDoctors" },
    ];

    // Determine active item based on current route

    const currentRouteName = route?.uu5Route || "";
    const activeItemCode = ITEM_LIST.find((item) => item.href === currentRouteName)?.code;

    //@@viewOff:private

    //@@viewOn:render
    return (
      <>
        <Plus4U5App.PositionBar view = "short" actionList={actionList} itemList={ITEM_LIST} activeItem={activeItemCode} />

        {/* Book Appointment Modal */}
        <BookAppointmentModal
          open={bookAppointmentModalOpen}
          onClose={() => setBookAppointmentModalOpen(false)}
        />
      </>
    );
 },
});


//@@viewOn:exports
export { RouteBar };
export default RouteBar;
//@@viewOff:exports
