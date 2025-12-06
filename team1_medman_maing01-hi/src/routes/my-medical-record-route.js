//@@viewOn:imports
import { Utils, createVisualComponent } from "uu5g05";
import { withRoute } from "uu_plus4u5g02-app";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import SearchBar from "../core/search-bar.js";
import RouteBar from "../core/route-bar.js";
import AppointmentsList from "../core/appointments-list.js";
import { MyMedicalRecordTile } from "../core/my-medical-record-tile.js";
import importLsi from "../lsi/import-lsi.js";

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

let MyMedicalRecordRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "MyMedicalRecordRoute",
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
            content: (
              <div className={Css.headerWrapper()}>
                <MyMedicalRecordTile />
              </div>
            ),
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

MyMedicalRecordRoute = withRoute(MyMedicalRecordRoute, { authenticated: false });

//@@viewOn:exports
export { MyMedicalRecordRoute };
export default MyMedicalRecordRoute;
//@@viewOff:exports
