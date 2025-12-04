import Uu5, { createVisualComponent, useRoute, useState, useEffect, setData, Promise } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Tiles from "uu5tilesg02";
import Uu5TilesElements from "uu5tilesg02-elements";
import { getAppointmentsWithDetails } from "../../mock/mockAppointments.js";
import Config from "./config/config.js";
import Calls from "../calls.js";
import AppointmentTile from "./appointment-tile.js";
import CancelAppointmentModal from "./cancel-appointment-modal.js";

const Css = {};

const AppointmentsList = createVisualComponent({
  uu5Tag: Config.TAG + "AppointmentsList",

  render() {
    const [route] = useRoute();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [selectedAppointmentId, setSelectedAppointmentId] = useState(null); // State for selected appointment ID
    const [selectedId, setSelectedId] = useState(null); // State for selected appointment ID

    // useEffect(() => {
    //   setLoading(true);

    //   getAppointmentsWithDetails() // replace with fetch (API) endpoint
    //     .then((json) => setAppointments(json))
    //     .catch((err) => setError(err.message))
    //     .finally(() => setLoading(false));
    // }, []);

    //modified to refresh after appointment cancellation or creation based on demo-data - appointments.json -> if without server, comment out and uncomment the above useEffect
    useEffect(() => {
      fetchAppointments();
    }, []);

    useEffect(() => {
      function updateHandler() {
        fetchAppointments();
      }

      window.addEventListener("appointmentsUpdated", updateHandler);

      return () => window.removeEventListener("appointmentsUpdated", updateHandler);
    }, []);

    async function fetchAppointments() {
      setLoading(true);
      try {
        const json = await getAppointmentsWithDetails();
        setAppointments(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const openCancelModal = (data) => {
      setSelectedAppointmentId(data.appointmentId);
      setSelectedId(data.id);
      setIsModalOpen(true);
    };

    if (loading) return <Uu5Elements.Text>Fetching appointments...</Uu5Elements.Text>;
    if (error) return <Uu5Elements.Text style={{ color: "red" }}>Error: {error}</Uu5Elements.Text>;

    const upcomingAppointments = appointments.filter((a) => a.status === "Confirmed");
    const pastAppointments = appointments.filter((a) => a.status === "Cancelled" || a.status === "Completed");

    return (
      <>
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
                {(tile) => <AppointmentTile appointment={tile.data} onCancel={() => openCancelModal(tile.data)} />}
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

        {/* Cancel Appointment Modal */}
        <CancelAppointmentModal
          open={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          //for testing without server - uncomment onConfirm and the handleConfirmCancel function above
          // onConfirm={handleConfirmCancel}
          appointmentId={selectedAppointmentId}
          id={selectedId}
        />
      </>
    );
  },
});

//@@viewOn:exports
export { AppointmentsList };
export default AppointmentsList;
//@@viewOff:exports
