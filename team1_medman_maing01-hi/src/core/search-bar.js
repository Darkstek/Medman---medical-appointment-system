//@@viewOn:imports
import Uu5, { createVisualComponent, useState, useRoute } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
//@@viewOff:imports

//@@viewOn:constants

//@@viewOff:constants

//@@viewOn:css
const Css = {
  main: () => Config.Css.css({}),

  searchForm: () => Config.Css.css({}),

  textInput: () =>
    Config.Css.css({
      margin: "2px",
    }),

  button: () =>
    Config.Css.css({
      margin: "2px",
    }),
};

//@@viewOff:css

const SearchBar = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "SearchBar",
  //@@viewOff:statics
  propTypes: {},

  defaultProps: {},

  render: function () {
    const [route, setRoute] = useRoute();
    const [query, setQuery] = useState("");

    const handleSearch = () => {
      if (query.trim()) {
        setRoute("doctorsList", { search: query.trim() });
      }
    };

    return (
      <Uu5Elements.Grid templateColumns="3fr 1fr">
        <Uu5Forms.Text
          borderRadius="expressive"
          placeholder="Search for a specialist"
          value={query}
          onChange={(e) => setQuery(e.data.value)}
          size="m"
          className={Css.textInput()}
        />

        <Uu5Elements.Button className={Css.button()} size="m" significance="highlighted" onClick={handleSearch}>
          Search
        </Uu5Elements.Button>
      </Uu5Elements.Grid>
    );
  },
});

//@@viewOn:exports
export { SearchBar };
export default SearchBar;
//@@viewOff:exports
