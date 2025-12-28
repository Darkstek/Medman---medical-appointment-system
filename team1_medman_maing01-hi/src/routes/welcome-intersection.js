//@@viewOn:imports
import { Utils, createVisualComponent, useState, useRoute } from "uu5g05";
import { withRoute } from "uu_plus4u5g02-app";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
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
      paddingTop: "30px",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

let WelcomeIntersection = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "WelcomeIntersection",
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
    const [route, setRoute] = useRoute();
    const attrs = Utils.VisualComponent.getAttrs(props);
    const actionListPatient = [
      { children: "Go to patient", onClick: () =>setRoute("myAppointments"), colorScheme: "primary", significance: "highlighted" },
    ]
    const actionListDoctor = [
      { children: "Go to doctor", onClick: () =>setRoute("doctorAppointments"), colorScheme: "primary", significance: "highlighted" },
    ]
    return (
      <div {...attrs} className={Css.headerWrapper()}>
        <Uu5Elements.GridTemplate
          justifyItems="center"
          contentMap={{
            header: <Uu5Elements.Text category="story" segment="heading" type="h1">Welcome to MedMan</Uu5Elements.Text>,
            content: (

                <Uu5Elements.Grid  justifyContent = "center" alignContent = "center" flow="column">
                <Uu5Elements.PlaceholderBox code="female-user" actionList={actionListPatient} size = "m" colorScheme="primary"/>
                <Uu5Elements.PlaceholderBox code="graduation-hat" actionList={actionListDoctor} size="m" colorScheme="positive" />
                </Uu5Elements.Grid>

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

WelcomeIntersection = withRoute(WelcomeIntersection, { authenticated: false });

//@@viewOn:exports
export { WelcomeIntersection };
export default WelcomeIntersection;
//@@viewOff:exports
