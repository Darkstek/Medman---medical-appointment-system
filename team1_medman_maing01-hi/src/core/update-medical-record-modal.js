import { createVisualComponent, useState, useEffect } from "uu5g05";
import Uu5Forms from "uu5g05-forms";
import Uu5Elements from "uu5g05-elements";
import { useAlertBus } from "uu5g05-elements";
import Config from "./config/config.js";
import Calls from "../calls.js";

const UpdateMedicalRecordModal = createVisualComponent({
  uu5Tag: Config.TAG + "UpdateMedicalRecordModal",

  propTypes: {},

  render({ open, onClose, patient, setPatient }) {
    const alertBus = Uu5Elements.useAlertBus();

    const [medications, setMedications] = useState(patient.medicalRecord?.medications?.join(", ") || "");
    const [allergies, setAllergies] = useState(patient.allergies?.join(", ") || "");
    const [illnesses, setIllnesses] = useState(patient.medicalRecord?.illnesses?.join(", ") || "");
    const [insuranceProvider, setInsuranceProvider] = useState(patient.insuranceProvider);
    const [emergencyContact, setEmergencyContact] = useState(patient.emergencyContact);
    // Sending updated data to backend
    console.log("patientID:", patient.id);
    async function handleSubmit() {
      try {
        const updatedData = {
          id: patient.id,
          medicalRecord: {
            medications: (medications || "")
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean),
            illnesses: (illnesses || "")
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean)
          },
          allergies: (allergies || "")
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
          insuranceProvider: insuranceProvider,
          emergencyContact: emergencyContact
        };
        console.log("updated Data", updatedData)
        await Calls.updatePatient(updatedData);

        alertBus.addAlert({
          message: "Medical record updated successfully.",
          priority: "success",
        });
        onClose();

        //Updating displayed data
        const response = await Calls.findPatient({ emailAddress: patient.emailAddress });
        setPatient(response.itemList?.[0] ?? null);
      } catch (error) {
        alertBus.addAlert({
          message: "Error updating medical record: " + error.message,
          priority: "error",
        });
      }
    }
    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={
          <Uu5Elements.Text>
            <Uu5Elements.Icon icon="uugds-account" />
            {" " + patient.firstName + " " + patient.lastName}
          </Uu5Elements.Text>
        }
        footer={
          <Uu5Elements.Button colorScheme="primary" significance="highlighted" onClick={handleSubmit}>
            Submit
          </Uu5Elements.Button>
        }
      >
        <Uu5Elements.Grid rowGap={10}>
          <Uu5Elements.Label>Medications</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={medications} onChange={(opt) => setMedications(opt.data.value)} />

          <Uu5Elements.Label>Allergies</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={allergies} onChange={(opt) => setAllergies(opt.data.value)} />

          <Uu5Elements.Label>Illness</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={illnesses} onChange={(opt) => setIllnesses(opt.data.value)} />

          <Uu5Elements.Label>Insurance Provider</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={insuranceProvider} onChange={(opt) => setInsuranceProvider(opt.data.value)} />

          <Uu5Elements.Label>Emergency Contact</Uu5Elements.Label>
          <Uu5Forms.Text.Input required width="50%" value={emergencyContact} onChange={(opt) => setEmergencyContact(opt.data.value)} />

        </Uu5Elements.Grid>
      </Uu5Elements.Modal>
    );
  },
});

export { UpdateMedicalRecordModal };
export default UpdateMedicalRecordModal;
