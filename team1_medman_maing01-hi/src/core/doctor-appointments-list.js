//@@viewOn:imports
import { createVisualComponent, useState, useEffect } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Uu5Tiles from "uu5tilesg02";
import Uu5TilesElements from "uu5tilesg02-elements";
import Config from "./config/config.js";
import { getAppointmentsWithDetails } from "../../mock/mockAppointments.js";
import DoctorAppointmentTile from "./doctor-appointment-tile.js";
import Calls from "../calls.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  filterSection: () =>
    Config.Css.css({
      marginBottom: "24px",
      padding: "16px",
      backgroundColor: "rgba(142,139,139,0.19)",
      borderRadius: "8px",
    }),
  filterRow: () =>
    Config.Css.css({
      display: "flex",
      gap: "16px",
      alignItems: "center",
      flexWrap: "wrap",
    }),
  filterLabel: () =>
    Config.Css.css({
      minWidth: "120px",
      fontWeight: "500",
    }),
};
//@@viewOff:css

const DoctorAppointmentsList = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorAppointmentsList",
  //@@viewOff:statics

  render() {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [viewMode, setViewMode] = useState("all"); // "all", "today", "week", "custom"

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
        //Using Mock data uncomment bellow
        //const json = await getAppointmentsWithDetails();

        const doctorId = "DOC-009" //Replace with logged in doctor logic
        //Backend Call, comment when mocking
        Calls.findAppointments({ doctorId: doctorId }).then((dtoOut) => {
          setAppointments(Array.isArray(dtoOut.itemList) ? dtoOut.itemList : []);
        }
        )
        //Using Mock data uncomment bellow
        //setAppointments(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    const filterAppointmentsByDate = (appointments) => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      switch (viewMode) {
        case "today":
          return appointments.filter((apt) => {
            const aptDate = new Date(apt.dateTime);
            const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
            return aptDay.getTime() === today.getTime();
          });

        case "week":
          const weekEnd = new Date(today);
          weekEnd.setDate(weekEnd.getDate() + 7);
          return appointments.filter((apt) => {
            const aptDate = new Date(apt.dateTime);
            return aptDate >= today && aptDate < weekEnd;
          });

        case "custom":
          if (!selectedDate) return appointments;
          const selected = new Date(selectedDate);
          const selectedDay = new Date(selected.getFullYear(), selected.getMonth(), selected.getDate());
          return appointments.filter((apt) => {
            const aptDate = new Date(apt.dateTime);
            const aptDay = new Date(aptDate.getFullYear(), aptDate.getMonth(), aptDate.getDate());
            return aptDay.getTime() === selectedDay.getTime();
          });

        case "all":
        default:
          return appointments;
      }
    };

    const handleViewModeChange = (mode) => {
      setViewMode(mode);
      if (mode !== "custom") {
        setSelectedDate(null);
      }
    };

    if (loading) return <Uu5Elements.Text>Fetching appointments...</Uu5Elements.Text>;
    if (error) return <Uu5Elements.Text style={{ color: "red" }}>Error: {error}</Uu5Elements.Text>;

    // Filter appointments by date (showing all status types)
    const filteredAppointments = filterAppointmentsByDate(appointments);
    const uniqueAppointments = Array.from(
      new Map(filteredAppointments.map(a => [a.id, a])).values()
    );

    // Group appointments by status
    const createdAppointments = uniqueAppointments.filter((a) => a.status === "Created");
    const confirmedAppointments = uniqueAppointments.filter((a) => a.status === "Confirmed");
    const completedAppointments = uniqueAppointments.filter((a) => a.status === "Completed");
    const cancelledAppointments = uniqueAppointments.filter((a) => a.status === "Cancelled");

    //Sorting displayed appointments
    const sorterDefinition = [
      {
        key: "dateTimeDesc",
        label: "Date & Time (Descending)",
        sort: (a, b) => new Date(b.dateTime) - new Date(a.dateTime),
      },
    ];

    return (
      <Uu5Elements.Grid>
        {/* Filter Section */}
        <Uu5Elements.Block className={Css.filterSection()}>
          <div className={Css.filterRow()}>
            <Uu5Elements.Text className={Css.filterLabel()}>View:</Uu5Elements.Text>
            <Uu5Elements.Button
              onClick={() => handleViewModeChange("all")}
              colorScheme="primary"
              significance={viewMode === "all" ? "highlighted" : "subdued"}
            >
              All Appointments
            </Uu5Elements.Button>
            <Uu5Elements.Button
              onClick={() => handleViewModeChange("today")}
              colorScheme="primary"
              significance={viewMode === "today" ? "highlighted" : "subdued"}
            >
              Today
            </Uu5Elements.Button>
            <Uu5Elements.Button
              onClick={() => handleViewModeChange("week")}
              colorScheme="primary"
              significance={viewMode === "week" ? "highlighted" : "subdued"}
            >
              This Week
            </Uu5Elements.Button>
            <Uu5Elements.Button
              onClick={() => handleViewModeChange("custom")}
              colorScheme="primary"
              significance={viewMode === "custom" ? "highlighted" : "subdued"}
            >
              Custom Date
            </Uu5Elements.Button>
          </div>

          {viewMode === "custom" && (
            <div className={Css.filterRow()} style={{ marginTop: "16px" }}>
              <Uu5Elements.Text className={Css.filterLabel()}>Select Date:</Uu5Elements.Text>
              <Uu5Forms.FormDate
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.data.value)}
                placeholder="Choose a date"
              />
            </div>
          )}
        </Uu5Elements.Block>

        {/* Appointments Display */}
        {filteredAppointments.length === 0 ? (
          <Uu5Elements.HighlightedBox colorScheme="warning">
            No appointments found for the selected period.
          </Uu5Elements.HighlightedBox>
        ) : (
          <>
            {/* Requested Appointments */}
            {createdAppointments.length > 0 && (
              <Uu5Elements.Block
                header={
                  <Uu5Elements.Text category="story" segment="heading" type="h5">
                    Requested Appointments ({createdAppointments.length})
                  </Uu5Elements.Text>
                }
                headerSeparator={true}
              >
                <Uu5Tiles.ControllerProvider
                  data={createdAppointments}
                  sorterDefinitionList={sorterDefinition}
                  sorterList={[{ key: "dateTimeDesc" }]}
                >
                  <Uu5TilesElements.Grid tileMinWidth={250} tileMaxWidth={400}>
                    {(tile) => <DoctorAppointmentTile appointment={tile.data} onUpdate={fetchAppointments} />}
                  </Uu5TilesElements.Grid>
                </Uu5Tiles.ControllerProvider>
              </Uu5Elements.Block>
            )}

            {/* Confirmed Appointments */}
            {confirmedAppointments.length > 0 && (
              <Uu5Elements.Block
                header={
                  <Uu5Elements.Text category="story" segment="heading" type="h5">
                    Confirmed Appointments ({confirmedAppointments.length})
                  </Uu5Elements.Text>
                }
                headerSeparator={true}
              >
                <Uu5Tiles.ControllerProvider
                  data={confirmedAppointments}
                  sorterDefinitionList={sorterDefinition}
                  sorterList={[{ key: "dateTimeDesc" }]}
                >
                  <Uu5TilesElements.Grid tileMinWidth={250} tileMaxWidth={400}>
                    {(tile) => <DoctorAppointmentTile appointment={tile.data} onUpdate={fetchAppointments} />}
                  </Uu5TilesElements.Grid>
                </Uu5Tiles.ControllerProvider>
              </Uu5Elements.Block>
            )}

            {/* Completed Appointments */}
            {completedAppointments.length > 0 && (
              <Uu5Elements.Block
                header={
                  <Uu5Elements.Text category="story" segment="heading" type="h5">
                    Completed Appointments ({completedAppointments.length})
                  </Uu5Elements.Text>
                }
                headerSeparator={true}
              >
                <Uu5Tiles.ControllerProvider
                  data={completedAppointments}
                  sorterDefinitionList={sorterDefinition}
                  sorterList={[{ key: "dateTimeDesc" }]}
                >
                  <Uu5TilesElements.Grid tileMinWidth={250} tileMaxWidth={400}>
                    {(tile) => <DoctorAppointmentTile appointment={tile.data} onUpdate={fetchAppointments} />}
                  </Uu5TilesElements.Grid>
                </Uu5Tiles.ControllerProvider>
              </Uu5Elements.Block>
            )}

            {/* Cancelled Appointments */}
            {cancelledAppointments.length > 0 && (
              <Uu5Elements.Block
                header={
                  <Uu5Elements.Text category="story" segment="heading" type="h5">
                    Cancelled Appointments ({cancelledAppointments.length})
                  </Uu5Elements.Text>
                }
                headerSeparator={true}
              >
                <Uu5Tiles.ControllerProvider
                  data={cancelledAppointments}
                  sorterDefinitionList={sorterDefinition}
                  sorterList={[{ key: "dateTimeDesc" }]}
                >
                  <Uu5TilesElements.Grid tileMinWidth={250} tileMaxWidth={400}>
                    {(tile) => <DoctorAppointmentTile appointment={tile.data} onUpdate={fetchAppointments} />}
                  </Uu5TilesElements.Grid>
                </Uu5Tiles.ControllerProvider>
              </Uu5Elements.Block>
            )}
          </>
        )}
      </Uu5Elements.Grid>
    );
  },
});

//@@viewOn:exports
export { DoctorAppointmentsList };
export default DoctorAppointmentsList;
//@@viewOff:exports
