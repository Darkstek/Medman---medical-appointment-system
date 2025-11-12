//@@viewOn:imports
import { createVisualComponent, useState, useRoute } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
//@@viewOff:imports

//@@viewOn:constants

//@@viewOff:constants

//@@viewOn:css
const Css = {
  main: () =>
    Config.Css.css({
      width: "100%",
      maxWidth: 680,
      margin: "24px auto",
      padding: "0 16px",
      borderRadius: "9999px",
    }),

  searchForm: () => Config.Css.css({}),

  textInput: () => Config.Css.css({}),

  button: () => Config.Css.css({}),
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
      <Uu5Elements.Block
        className={Css.searchForm()}
        header={
          <Uu5Elements.Text category="interface" segment="title" type="major">
            Search for a specialist
          </Uu5Elements.Text>
        }
        footer={
          <Uu5Elements.Button className={Css.button()} size="l" significance="highlighted" onClick={handleSearch}>
            Search
          </Uu5Elements.Button>
        }
      >
        <Uu5Forms.Text
          className={Css.textInput()}
          borderRadius="expressive"
          placeholder="Specialization..."
          value={query}
          onChange={(e) => setQuery(e.data.value)}
        />
      </Uu5Elements.Block>
    );
  },
});

//@@viewOn:exports
export { SearchBar };
export default SearchBar;
//@@viewOff:exports
