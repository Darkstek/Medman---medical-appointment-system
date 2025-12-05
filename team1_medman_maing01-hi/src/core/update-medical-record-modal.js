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
    const [surgeries, setSurgeries] = useState(patient.medicalRecord?.surgeries?.join(", ") || "");
    const [vaccinations, setVaccinations] = useState(patient.medicalRecord?.vaccinations?.join(", ") || "");
    const [dietaryRestrictions, setDietaryRestrictions] = useState(
      patient.medicalRecord?.dietaryRestrictions?.join(", ") || "",
    );
    // Sending updated data to backend
    async function handleSubmit() {
      try {
        const updatedData = {
          id: patient.id,
          patientId: patient.patientId,
          medicalRecord: {
            medications: medications
              .split(",")
              .map((m) => m.trim())
              .filter(Boolean),
            illnesses: illnesses
              .split(",")
              .map((i) => i.trim())
              .filter(Boolean),

            /* Need to change backend according to bussines use case
            surgeries: surgeries.split(",").map((s) => s.trim()).filter(Boolean),
            vaccinations: vaccinations.split(",").map((v) => v.trim()).filter(Boolean),
            dietaryRestrictions: dietaryRestrictions.split(",").map((d) => d.trim()).filter(Boolean),
            */
          },
          allergies: allergies
            .split(",")
            .map((a) => a.trim())
            .filter(Boolean),
        };

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

          <Uu5Elements.Label>Surgeries</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={surgeries} onChange={(opt) => setSurgeries(opt.data.value)} />

          <Uu5Elements.Label>Vaccinations</Uu5Elements.Label>
          <Uu5Forms.Text.Input width="100%" value={vaccinations} onChange={(opt) => setVaccinations(opt.data.value)} />

          <Uu5Elements.Label>Dietary Restrictions</Uu5Elements.Label>
          <Uu5Forms.Text.Input
            width="100%"
            value={dietaryRestrictions}
            onChange={(opt) => setDietaryRestrictions(opt.data.value)}
          />
        </Uu5Elements.Grid>
      </Uu5Elements.Modal>
    );
  },
});

export { UpdateMedicalRecordModal };
export default UpdateMedicalRecordModal;
