//@@viewOn:imports
import { Utils, createVisualComponent, Environment } from "uu5g05";
import { withRoute } from "uu_plus4u5g02-app";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import SearchBar from "../core/search-bar.js";
import RouteBar from "../core/route-bar.js";
import importLsi from "../lsi/import-lsi.js";
import AppointmentsList from "../core/appointments-list.js";

//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:css
const Css = {
  headerWrapper: () =>
    Config.Css.css({
      paddingLeft: "30px",
      paddingRight: "30px",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

let MyAppointmentsRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "MyAppointmentsRoute",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render(props) {
    //@@viewOff:private`

    //@@viewOn:render
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        <Uu5Elements.GridTemplate
          contentMap={{
            header: <RouteBar />,
            content: <div className={Css.headerWrapper()}><AppointmentsList />  </div>,
          }}
          templateAreas={{
            xs: `header, content, sidebar, footer`,
            m: `
        header header header header,
        content content content content,
        footer footer footer footer
      `,
          }}
          templateColumns={{ xs: "100%", m: "repeat(4, 1fr)" }}
          rowGap={8}
          columnGap={8}

        />
      </div>
    );
    //@@viewOff:render
  },
});

MyAppointmentsRoute = withRoute(MyAppointmentsRoute, { authenticated: true });

//@@viewOn:exports
export { MyAppointmentsRoute };
export default MyAppointmentsRoute;
//@@viewOff:exports
