//@@viewOn:imports
import { createVisualComponent, Utils } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";

import Config from "./config/config.js";
import DoctorsList from "../core/doctors-list.js";
import RouteBar from "../core/route-bar.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  list: () =>
    Config.Css.css({
      paddingLeft: "50px",
      paddingRight: "50px",
    }),
};
//@@viewOff:css

let DoctorsListRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorsListRoute",
  //@@viewOff:statics

  render(props) {
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        <RouteBar />
        <Uu5Elements.Block
          className={Css.list()}
          header={
            <Uu5Elements.Text category="story" segment="heading" type="h2">
              Available doctors
            </Uu5Elements.Text>
          }
          headerSeparator={true}
        >
          <DoctorsList />
        </Uu5Elements.Block>
      </div>
    );
  },
});

DoctorsListRoute = withRoute(DoctorsListRoute, { authenticated: true });

//@@viewOn:exports
export { DoctorsListRoute };
export default DoctorsListRoute;
//@@viewOff:exports
