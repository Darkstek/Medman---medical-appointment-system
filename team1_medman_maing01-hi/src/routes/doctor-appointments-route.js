//@@viewOn:imports
import { createVisualComponent, Utils } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import { withRoute } from "uu_plus4u5g02-app";

import Config from "./config/config.js";
import DoctorAppointmentsList from "../core/doctor-appointments-list.js";
import RouteBar from "../core/route-bar.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  container: () =>
    Config.Css.css({
      paddingLeft: "30px",
      paddingRight: "30px",
    }),
};
//@@viewOff:css

let DoctorAppointmentsRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorAppointmentsRoute",
  //@@viewOff:statics

  render(props) {
    const attrs = Utils.VisualComponent.getAttrs(props);

    return (
      <div {...attrs}>
        <Uu5Elements.GridTemplate
          contentMap={{
            header: <RouteBar />,
            content: (
              <Uu5Elements.Block
                className={Css.container()}
                header={
                  <Uu5Elements.Text category="story" segment="heading" type="h4">
                    My Schedule
                  </Uu5Elements.Text>
                }
                headerSeparator={true}
              >
                <DoctorAppointmentsList />
              </Uu5Elements.Block>
            ),
          }}
          templateAreas={{
            xs: `header, content, footer`,
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
  },
});

DoctorAppointmentsRoute = withRoute(DoctorAppointmentsRoute, { authenticated: true });

//@@viewOn:exports
export { DoctorAppointmentsRoute };
export default DoctorAppointmentsRoute;
//@@viewOff:exports
