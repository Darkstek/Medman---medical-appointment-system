//@@viewOn:imports
import { Utils, createVisualComponent } from "uu5g05";
import { withRoute } from "uu_plus4u5g02-app";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import SearchBar from "../core/search-bar.js";
import RouteBar from "../core/route-bar.js";
import importLsi from "../lsi/import-lsi.js";

//@@viewOff:imports

//@@viewOn:constants
//@@viewOff:constants

//@@viewOn:css
const Css = {
  headerWrapper: () =>
    Config.Css.css({
      textAlign: "center",
      paddingLeft: "50px",
      paddingRight: "50px",
    }),
};
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

let SearchForDoctors = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "SearchForDoctors",
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
        <RouteBar />
        <Uu5Elements.Block className={Css.headerWrapper()}>
          <SearchBar />
        </Uu5Elements.Block>
      </div>
    );
    //@@viewOff:render
  },
});

SearchForDoctors = withRoute(SearchForDoctors, { authenticated: true });

//@@viewOn:exports
export { SearchForDoctors };
export default SearchForDoctors;
//@@viewOff:exports
