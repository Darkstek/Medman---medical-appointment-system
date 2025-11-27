import Uu5, { createVisualComponent, useRoute, useState, useEffect, setData, Promise } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Tiles from "uu5tilesg02";
import Uu5TilesElements from "uu5tilesg02-elements";
import { getAppointmentsWithDetails } from "../../mock/mockAppointments.js";
import Config from "./config/config.js";
import Calls from "../calls.js";
import AppointmentTile from "./appointment-tile.js";

const Css = {};

const AppointmentsList = createVisualComponent({
  uu5Tag: Config.TAG + "AppointmentsList",

  render() {
    const [route] = useRoute();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
      setLoading(true);

      getAppointmentsWithDetails() // replace with fetch (API) endpoint
        .then((json) => setAppointments(json))
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false));
    }, []);

    //TODO: Implement cancel appointment functionality BE
    const handleCancelAppointment = (appointmentId) => {
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment.id === appointmentId ? { ...appointment, status: "cancelled" } : appointment,
        )
      );
    };

    if (loading) return <Uu5Elements.Text>Fetching appointments...</Uu5Elements.Text>;
    if (error) return <Uu5Elements.Text style={{ color: "red" }}>Error: {error}</Uu5Elements.Text>;

    const upcomingAppointments = appointments.filter((a) => a.status === "upcoming");
    const pastAppointments = appointments.filter((a) => a.status === "cancelled" || a.status === "realised");

    return (
      <Uu5Elements.Grid>
        <Uu5Elements.Block
          header={
            <Uu5Elements.Text category="story" segment="heading" type="h4">
              Upcoming Appointments
            </Uu5Elements.Text>
          }
          headerSeparator={true}
        >
          <Uu5Tiles.ControllerProvider data={upcomingAppointments}>
            <Uu5TilesElements.Grid tileMinWidth={100}>
              {(tile) => <AppointmentTile appointment={tile.data} onCancel={handleCancelAppointment} />}
            </Uu5TilesElements.Grid>
          </Uu5Tiles.ControllerProvider>
        </Uu5Elements.Block>

        <Uu5Elements.Block
          header={
            <Uu5Elements.Text category="story" segment="heading" type="h4">
              My appointment history
            </Uu5Elements.Text>
          }
          headerSeparator={true}
        >
          <Uu5Tiles.ControllerProvider data={pastAppointments}>
            <Uu5TilesElements.Grid tileMinWidth={100}>
              {(tile) => <AppointmentTile appointment={tile.data} />}
            </Uu5TilesElements.Grid>
          </Uu5Tiles.ControllerProvider>
        </Uu5Elements.Block>
      </Uu5Elements.Grid>
    );
  },
});

//@@viewOn:exports
export { AppointmentsList };
export default AppointmentsList;
//@@viewOff:exports
