import { createVisualComponent, useRoute, useState, useEffect } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Tiles from "uu5tilesg02";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";

import DoctorTile from "../core/doctor-tile.js";
import { mockFetchDoctors, mockFetchClinics } from "../../mock/mockFetch";
import Calls from "../calls.js";

const Css = {};

const DoctorsList = createVisualComponent({
  uu5Tag: Config.TAG + "DoctorsList",

  render() {
    const [route] = useRoute();
    const search = route.params?.search?.toLowerCase() || "";
    const [data, setData] = useState([]);
    const [clinics, setClinics] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      setLoading(true);
      //   Promise.all([
      //     mockFetchDoctors(),
      //     mockFetchClinics()
      //   ])
      //     .then(([doctorsJson, clinicsJson]) => {
      //       setData(doctorsJson);
      //       setClinics(clinicsJson);
      //     })
      //     .catch((err) => setError(err.message))
      //     .finally(() => setLoading(false));
      // }, []);

      //Backend call to fetch doctors based on specialization, need to delete _ in development.json/callsBaseUri for this to work and uncoment call.js.

      setError(null);

      const dtoIn = search ? { specialization: search } : {};

      Calls.findDoctors(dtoIn)
        .then((dtoOut) => {
          setData(dtoOut.itemList ?? []);
        })
        .catch((err) => {
          console.error(err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }, [search]);

    if (loading) return <Uu5Elements.Text>Fetching doctors...</Uu5Elements.Text>;
    if (error) return <Uu5Elements.Text style={{ color: "red" }}>Error: {error}</Uu5Elements.Text>;

    if (!data.length) {
      return (
        <Uu5Elements.HighlightedBox>
          No doctors were found for {search}. Please check the spelling, or note that there may not be any doctors with
          this specialization registered in the database yet.
        </Uu5Elements.HighlightedBox>
      );
    }

    const getClinicForDoctor = (doctorClinicId) => {
      return clinics.find((clinic) => clinic.clinicId === doctorClinicId);
    };

    return (
      <Uu5Tiles.ControllerProvider data={data}>
        <Uu5TilesElements.Grid tileMinWidth={100} tileMaxWidth={400}>
          {({ data }) => (
            <DoctorTile key={data.id || data.doctorId} doctor={data} clinic={getClinicForDoctor(data.clinicId)} />
          )}
        </Uu5TilesElements.Grid>
      </Uu5Tiles.ControllerProvider>
    );
  },
});

//@@viewOn:exports
export { DoctorsList };
export default DoctorsList;
//@@viewOff:exports
