//@@viewOn:imports
import { createVisualComponent, Lsi, useRoute, uu5Route } from "uu5g05";
import Plus4U5App from "uu_plus4u5g02-app";

import Config from "./config/config.js";
import SearchBar from "./search-bar.js";
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

  searchForm: () => Config.Css.css({}),

  textInput: () => Config.Css.css({}),

  button: () => Config.Css.css({}),
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

    const actionList = [
      {
        children: <SearchBar />,
      },
    ];
    const ITEM_LIST = [
      { code: "main", label: "My Appointments", href: "myAppointments" },
      { code: "doctorsList", label: "Doctors List", href: "doctorsList" },
    ];

    //@@viewOff:private

    //@@viewOn:render
    return <Plus4U5App.PositionBar actionList={actionList} itemList={ITEM_LIST} activeItem={null} />;
    //@@viewOff:render
  },
});

//@@viewOn:exports
export { RouteBar };
export default RouteBar;
//@@viewOff:exports
