import { createVisualComponent, useRoute, useState, useEffect } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Tiles from "uu5tilesg02";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import { mockFetchDoctors } from "../../mock/mockFetch";
import DoctorTile from "../core/doctor-tile.js";

const Css = {};

const DoctorsList = createVisualComponent({
  uu5Tag: Config.TAG + "DoctorsList",

  render() {
    const [route] = useRoute();
    const search = route.params?.search?.toLowerCase() || "";
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const matchesSearch = !search || data.some((doctor) => doctor.specialization?.toLowerCase().includes(search));
    useEffect(() => {
      setLoading(true);
      mockFetchDoctors() // replace with fetch (API) endpoint
        /*.then((res) => {
          if (!res.ok) throw new Error("Failed to fetch doctors");
          return res.json();
        */
        .then((json) => setData(json))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    if (loading) return <Uu5Elements.Text>Fetching doctors...</Uu5Elements.Text>;
    if (error) return <Uu5Elements.Text style={{ color: "red" }}>Error: {error}</Uu5Elements.Text>;
    if (search && !matchesSearch) {
      return (
        <Uu5Elements.HighlightedBox>
          No doctors were found. Please check the spelling, or note that there may not be any doctors with this
          specialization registered in the database yet.
        </Uu5Elements.HighlightedBox>
      );
    }

    return (
      <Uu5Tiles.ControllerProvider
        data={data} // fetch from backend
        filterDefinitionList={[
          {
            key: "specialization",
            label: "Specialization",
            filter: (item, value) => {
              return item.specialization?.toLowerCase().includes(value?.toLowerCase() || "");
            },
          },
        ]}
        filterList={[
          {
            key: "specialization",
            value: search, // prefill from route param
          },
        ]}
      >
        <Uu5TilesElements.Grid tileMinWidth={100} tileMaxWidth={400}>
          {({ data }) => <DoctorTile key={data.id} doctor={data} />}
        </Uu5TilesElements.Grid>
      </Uu5Tiles.ControllerProvider>
    );
  },
});

//@@viewOn:exports
export { DoctorsList };
export default DoctorsList;
//@@viewOff:exports
