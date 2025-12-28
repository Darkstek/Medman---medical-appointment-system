import { createVisualComponent, useState } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
import BookAppointmentModal from "./book-appointment-modal.js";
import UpdateMedicalRecordModal from "./update-medical-record-modal.js";

const Css = {
  main: () => Config.Css.css({}),

  button: () => Config.Css.css({}),
};

const UpdateMedicalRecordButton = createVisualComponent({
  uu5Tag: Config.TAG + "UpdateMedicalRecordButton",

  render({ patient, setPatient, uuId }) {
    const [updateRecordModalOpen, setUpdateRecordModalOpen] = useState(false);
    const [editableData, setEditableData] = useState(null);

    return (
      <>
        <Uu5Elements.Button
          onClick={() => setUpdateRecordModalOpen(true)}
          className={Css.button()}
          size="m"
          significance="highlighted"
        >
          Update My Medical Record
        </Uu5Elements.Button>
        <UpdateMedicalRecordModal
          uuId={uuId}
          open={updateRecordModalOpen}
          onClose={() => setUpdateRecordModalOpen(false)}
          editableData={editableData}
          patient={patient}
          setPatient={setPatient}
        />
      </>
    );
  },
});

//@@viewOn:exports
export { UpdateMedicalRecordButton };
export default UpdateMedicalRecordButton;
//@@viewOff:exports
