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

  render: function ({query, setQuery, onSearch}) {

    return (
        <Uu5Forms.Text
          borderRadius="expressive"
          placeholder="Search for a specialist"
          value={query}
          onChange={(e) => setQuery(e.data.value)}
          size="m"

          inputAttrs={{ onKeyDown: (e) => e.key === "Enter" && onSearch() }}
        />

    );
  },
});

//@@viewOn:exports
export { SearchBar };
export default SearchBar;
//@@viewOff:exports
