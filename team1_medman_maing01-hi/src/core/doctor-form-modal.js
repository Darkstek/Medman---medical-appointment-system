//@@viewOn:imports
import { createVisualComponent, PropTypes, useState, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Config from "./config/config.js";
import Calls from "calls";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  form: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      padding: "16px",
    }),
  row: () =>
    Config.Css.css({
      display: "flex",
      gap: "16px",
      flexWrap: "wrap",
    }),
  field: () =>
    Config.Css.css({
      flex: "1 1 200px",
      minWidth: "200px",
    }),
  timeSlotsSection: () =>
    Config.Css.css({
      marginTop: "16px",
      padding: "16px",
      backgroundColor: "#f5f5f5",
      borderRadius: "8px",
    }),
  timeSlotRow: () =>
    Config.Css.css({
      display: "flex",
      gap: "8px",
      alignItems: "flex-end",
      marginBottom: "12px",
      flexWrap: "wrap",
    }),
};
//@@viewOff:css

const SPECIALIZATIONS = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Orthopedics",
  "Pediatrics",
  "Psychiatry",
  "General Practice",
  "Surgery",
  "Ophthalmology",
  "Gynecology",
];

const DoctorFormModal = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "DoctorFormModal",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {
    open: PropTypes.bool,
    onClose: PropTypes.func,
    onSave: PropTypes.func,
    doctor: PropTypes.object,
  },
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {
    open: false,
    onClose: () => {},
    onSave: () => {},
    doctor: null,
  },
  //@@viewOff:defaultProps

  render(props) {
    const { open, onClose, onSave, doctor } = props;
    const isEdit = !!doctor;

    const [formData, setFormData] = useState({
      firstName: "",
      lastName: "",
      specialization: "",
      phoneNumber: "",
      emailAddress: "",
      description: "",
      status: "active",
      availableTimeSlots: [],
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
      if (doctor) {
        setFormData({
          firstName: doctor.firstName || "",
          lastName: doctor.lastName || "",
          specialization: doctor.specialization || "",
          phoneNumber: doctor.phoneNumber || "",
          emailAddress: doctor.emailAddress || "",
          description: doctor.description || "",
          status: doctor.status || "active",
          availableTimeSlots: doctor.availableTimeSlots || [],
        });
      } else {
        setFormData({
          firstName: "",
          lastName: "",
          specialization: "",
          phoneNumber: "",
          emailAddress: "",
          description: "",
          status: "active",
          availableTimeSlots: [],
        });
      }
      setError(null);
    }, [doctor, open]);

    const handleFieldChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
    };

    const handleAddTimeSlot = () => {
      const now = new Date();
      const start = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString();
      const end = new Date(now.getTime() + 24 * 60 * 60 * 1000 + 60 * 60 * 1000).toISOString();
      setFormData((prev) => ({
        ...prev,
        availableTimeSlots: [...prev.availableTimeSlots, { start, end }],
      }));
    };

    const handleTimeSlotChange = (index, field, value) => {
      setFormData((prev) => {
        const slots = [...prev.availableTimeSlots];
        slots[index] = { ...slots[index], [field]: value };
        return { ...prev, availableTimeSlots: slots };
      });
    };

    const handleRemoveTimeSlot = (index) => {
      setFormData((prev) => ({
        ...prev,
        availableTimeSlots: prev.availableTimeSlots.filter((_, i) => i !== index),
      }));
    };

    const handleSubmit = async () => {
      setLoading(true);
      setError(null);

      try {
        const dtoIn = {
          ...formData,
          availableTimeSlots: formData.availableTimeSlots.filter((slot) => slot.start && slot.end),
        };

        if (isEdit) {
          dtoIn.id = doctor.id;
          await Calls.updateDoctor(dtoIn);
        } else {
          dtoIn.doctorId = `DOC-${Date.now()}`;
          await Calls.createDoctor(dtoIn);
        }

        onSave();
        onClose();
      } catch (err) {
        console.error("Error saving doctor:", err);
        setError(err.message || "Failed to save doctor");
      } finally {
        setLoading(false);
      }
    };

    return (
      <Uu5Elements.Modal
        open={open}
        onClose={onClose}
        header={isEdit ? "Edit Doctor" : "Add New Doctor"}
        footer={
          <Uu5Elements.Grid templateColumns="1fr 1fr" columnGap={8}>
            <Uu5Elements.Button colorScheme="neutral" onClick={onClose} disabled={loading}>
              Cancel
            </Uu5Elements.Button>
            <Uu5Elements.Button
              colorScheme="primary"
              significance="highlighted"
              onClick={handleSubmit}
              disabled={loading || !formData.firstName || !formData.lastName || !formData.specialization}
            >
              {loading ? "Saving..." : isEdit ? "Update" : "Create"}
            </Uu5Elements.Button>
          </Uu5Elements.Grid>
        }
        width={650}
      >
        <div className={Css.form()}>
          {error && <Uu5Elements.HighlightedBox colorScheme="negative">{error}</Uu5Elements.HighlightedBox>}

          <div className={Css.row()}>
            <Uu5Forms.Text
              className={Css.field()}
              label="First Name"
              value={formData.firstName}
              onChange={(e) => handleFieldChange("firstName", e.data.value)}
              required
            />
            <Uu5Forms.Text
              className={Css.field()}
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => handleFieldChange("lastName", e.data.value)}
              required
            />
          </div>

          <Uu5Forms.Select
            label="Specialization"
            value={formData.specialization}
            onChange={(e) => handleFieldChange("specialization", e.data.value)}
            itemList={SPECIALIZATIONS.map((s) => ({ value: s, children: s }))}
            required
          />

          <div className={Css.row()}>
            <Uu5Forms.Text
              className={Css.field()}
              label="Phone Number"
              value={formData.phoneNumber}
              onChange={(e) => handleFieldChange("phoneNumber", e.data.value)}
            />
            <Uu5Forms.Text
              className={Css.field()}
              label="Email Address"
              value={formData.emailAddress}
              onChange={(e) => handleFieldChange("emailAddress", e.data.value)}
            />
          </div>

          <Uu5Forms.TextArea
            label="Description"
            value={formData.description}
            onChange={(e) => handleFieldChange("description", e.data.value)}
            rows={3}
          />

          <Uu5Forms.Select
            label="Status"
            value={formData.status}
            onChange={(e) => handleFieldChange("status", e.data.value)}
            itemList={[
              { value: "active", children: "Active" },
              { value: "inactive", children: "Inactive" },
            ]}
          />

          <div className={Css.timeSlotsSection()}>
            <Uu5Elements.Text category="interface" segment="title" type="micro">
              Available Time Slots
            </Uu5Elements.Text>

            {formData.availableTimeSlots.map((slot, index) => (
              <div key={index} className={Css.timeSlotRow()}>
                <Uu5Forms.DateTime
                  label="Start"
                  value={slot.start}
                  onChange={(e) => handleTimeSlotChange(index, "start", e.data.value)}
                  style={{ flex: 1, minWidth: "200px" }}
                />
                <Uu5Forms.DateTime
                  label="End"
                  value={slot.end}
                  onChange={(e) => handleTimeSlotChange(index, "end", e.data.value)}
                  style={{ flex: 1, minWidth: "200px" }}
                />
                <Uu5Elements.Button
                  icon="mdi-delete"
                  colorScheme="negative"
                  significance="subdued"
                  onClick={() => handleRemoveTimeSlot(index)}
                  tooltip="Remove slot"
                />
              </div>
            ))}

            <Uu5Elements.Button
              icon="mdi-plus"
              colorScheme="primary"
              significance="subdued"
              onClick={handleAddTimeSlot}
              style={{ marginTop: "8px" }}
            >
              Add Time Slot
            </Uu5Elements.Button>
          </div>
        </div>
      </Uu5Elements.Modal>
    );
  },
});

//@@viewOn:exports
export { DoctorFormModal };
export default DoctorFormModal;
//@@viewOff:exports


