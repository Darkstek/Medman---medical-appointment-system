//@@viewOn:imports
import { createVisualComponent, PropTypes, useState, useEffect } from "uu5g05";
import * as Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import { mockFetchPatients } from "../../mock/mockFetch.js";
import Calls from "../calls.js";
import UpdateMedicalRecordButton from "./update-medical-record-button.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  main: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      padding: "16px",
      border: "1px solid #ddd",
      borderRadius: "8px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      width: "100%",
    }),
};
//@@viewOff:css

const MyMedicalRecordTile = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "MyMedicalRecordTile",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  render(props) {
    const [patient, setPatient] = useState(undefined);

    useEffect(() => {
      async function fetchPatient() {
        try {
          //const patients = await mockFetchPatients(); // Fetch mock data
          const loggedInPatientEmail = "jess.davis@college.edu";

          const response = await Calls.findPatient({ emailAddress: loggedInPatientEmail });
          console.log("BE Patient:", response);
          const patientData = response.itemList?.[0] ?? null;

          //const loggedInPatient = patients.find((patient) => patient.emailAddress === loggedInPatientEmail);
          //setPatient(loggedInPatient ?? null);

          setPatient(patientData ?? null);
        } catch (error) {
          console.error("Error fetching patient:", error);
          setPatient(null);
        }
      }

      fetchPatient();
    }, []);

    console.log("Patient from state:", patient);
    if (patient === undefined) {
      return <Uu5Elements.Text>Loading medical record...</Uu5Elements.Text>;
    }
    if (patient === null) {
      return <Uu5Elements.Text colorScheme="negative">Patient not found.</Uu5Elements.Text>;
    }

    console.log("Logged-in patient ID:", patient);

    const itemList = [
      { title: patient.gender, subtitle: "Gender" },
      { title: Math.floor((Date.now() - new Date(patient.dateOfBirth)) / 31557600000), subtitle: "Age" },
      {
        title: (
          <Uu5Elements.Grid>
            {patient.medicalRecord?.medications?.length > 0 ? (
              patient.medicalRecord.medications.map((medication, i) => (
                <Uu5Elements.Text key={i}>{medication}</Uu5Elements.Text>
              ))
            ) : (
              <Uu5Elements.Text>No medications</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Medications",
      },
      {
        title: (
          <Uu5Elements.Grid>
            {patient.allergies?.length > 0 ? (
              patient.allergies.map((allergy, i) => <Uu5Elements.Text key={i}>{allergy}</Uu5Elements.Text>)
            ) : (
              <Uu5Elements.Text>No allergies</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Allergies",
      },

      {
        title: (
          <Uu5Elements.Grid>
            {patient.medicalRecord?.illnesses?.length > 0 ? (
              patient.medicalRecord.illnesses.map((illness, i) => (
                <Uu5Elements.Text key={i}>{illness}</Uu5Elements.Text>
              ))
            ) : (
              <Uu5Elements.Text>No illness</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Illness",
      },
      {
        title: (
          <Uu5Elements.Grid>
            {patient.medicalRecord?.surgeries?.length > 0 ? (
              patient.medicalRecord.surgeries.map((surgery, i) => (
                <Uu5Elements.Text key={i}>{surgery}</Uu5Elements.Text>
              ))
            ) : (
              <Uu5Elements.Text>No surgeries</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Surgeries",
      },
      {
        title: (
          <Uu5Elements.Grid>
            {patient.medicalRecord?.vaccinations?.length > 0 ? (
              patient.medicalRecord.vaccinations.map((vaccination, i) => (
                <Uu5Elements.Text key={i}>{vaccination}</Uu5Elements.Text>
              ))
            ) : (
              <Uu5Elements.Text>No vaccinations</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Vaccinations",
      },
      {
        title: (
          <Uu5Elements.Grid>
            {patient.medicalRecord?.dietaryRestrictions?.length > 0 ? (
              patient.medicalRecord.dietaryRestrictions.map((restriction, i) => (
                <Uu5Elements.Text key={i}>{restriction}</Uu5Elements.Text>
              ))
            ) : (
              <Uu5Elements.Text>No dietary restrictions</Uu5Elements.Text>
            )}
          </Uu5Elements.Grid>
        ),
        subtitle: "Dietary Restrictions",
      },
    ];

    return (
      <Uu5Elements.Block
        header={
          <Uu5Elements.Grid display="inline" templateColumns = "repeat(2, 1fr)" columnGap = {8}>
            <Uu5Elements.InfoGroup
              itemList={[
                { title: patient.firstName + " " + patient.lastName, subtitle: "Name", icon: "uugds-account" },
              ]}
              size="xl"
            />
            <UpdateMedicalRecordButton patient={patient} setPatient={setPatient} />
          </Uu5Elements.Grid>
        }
        headerSeparator={true}
      >
        <Uu5Elements.InfoGroup itemList={itemList} direction="vertical" size="xl" />
      </Uu5Elements.Block>
    );
  },
});

//@@viewOn:exports
export { MyMedicalRecordTile };
export default MyMedicalRecordTile;
//@@viewOff:exports
