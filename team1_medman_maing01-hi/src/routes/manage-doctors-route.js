//@@viewOn:imports
import { createVisualComponent, useState, useEffect, useCallback } from "uu5g05";
import Uu5Elements, { useAlertBus } from "uu5g05-elements";
import Uu5Forms from "uu5g05-forms";
import Plus4U5App, { withRoute } from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import RouteBar from "../core/route-bar.js";
import Calls from "calls";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  container: () =>
    Config.Css.css({
      padding: "24px",
      maxWidth: "800px",
      margin: "0 auto",
    }),
  pageTitle: () =>
    Config.Css.css({
      marginBottom: "32px",
      textAlign: "center",
    }),
  areaSelector: () =>
    Config.Css.css({
      display: "flex",
      justifyContent: "center",
      marginBottom: "32px",
    }),
  buttonGroup: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "300px",
      margin: "0 auto",
    }),
  actionButton: () =>
    Config.Css.css({
      padding: "16px 32px",
      fontSize: "16px",
      borderRadius: "8px",
    }),
  formContainer: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "16px",
      maxWidth: "500px",
      margin: "0 auto",
    }),
  backButton: () =>
    Config.Css.css({
      marginBottom: "24px",
    }),
  sectionTitle: () =>
    Config.Css.css({
      marginTop: "24px",
      marginBottom: "16px",
      paddingBottom: "8px",
      borderBottom: "1px solid #e0e0e0",
    }),
  doctorInfo: () =>
    Config.Css.css({
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      padding: "16px",
      backgroundColor: "#f8f9fa",
      borderRadius: "8px",
      marginBottom: "16px",
    }),
  infoRow: () =>
    Config.Css.css({
      display: "flex",
      gap: "8px",
    }),
  infoLabel: () =>
    Config.Css.css({
      fontWeight: "600",
      minWidth: "120px",
      color: "#666",
    }),
  submitButton: () =>
    Config.Css.css({
      marginTop: "24px",
    }),
};
//@@viewOff:css

// Mock data for clinics and specializations
const SPECIALIZATIONS = [
  { value: "Cardiology", children: "Cardiology" },
  { value: "Pediatrics", children: "Pediatrics" },
  { value: "Dermatology", children: "Dermatology" },
  { value: "Neurology", children: "Neurology" },
  { value: "Orthopedic Surgery", children: "Orthopedic Surgery" },
  { value: "Psychiatry", children: "Psychiatry" },
  { value: "Ophthalmology", children: "Ophthalmology" },
  { value: "Obstetrics and Gynecology", children: "Obstetrics and Gynecology" },
  { value: "Emergency Medicine", children: "Emergency Medicine" },

];

const CLINICS = [
  { value: "Central Health Clinic", children: "Central Health Clinic" },
  { value: "Downtown Medical Center", children: "Downtown Medical Center" },
  { value: "Westside Hospital", children: "Westside Hospital" },
];

const STATUS_OPTIONS = [
  { value: "active", children: "Active" },
  { value: "inactive", children: "Inactive" },
];


//@@viewOn:helpers
// Main Menu View
const MainMenuView = ({ onNavigate }) => {
  const [manageArea, setManageArea] = useState("doctors");

  return (
    <div className={Css.container()}>
      <Uu5Elements.Text category="story" segment="heading" type="h1" className={Css.pageTitle()}>
        Manage System
      </Uu5Elements.Text>

      <div className={Css.areaSelector()}>
        <Uu5Forms.Select
          value={manageArea}
          onChange={(e) => setManageArea(e.data.value)}
          itemList={[
            { value: "doctors", children: "Doctors" },
            { value: "appointments", children: "Appointments", disabled: true },
            { value: "patients", children: "Patients", disabled: true },
          ]}
          style={{ minWidth: "250px" }}
          label="Choose area to manage"
        />
      </div>

      <div className={Css.buttonGroup()}>
        <Uu5Elements.Button
          className={Css.actionButton()}
          colorScheme="grey"
          significance="highlighted"
          onClick={() => onNavigate("add")}
          size="xl"
        >
          Add Doctor
        </Uu5Elements.Button>
        <Uu5Elements.Button
          className={Css.actionButton()}
          colorScheme="grey"
          significance="highlighted"
          onClick={() => onNavigate("remove")}
          size="xl"
        >
          Remove Doctor
        </Uu5Elements.Button>
        <Uu5Elements.Button
          className={Css.actionButton()}
          colorScheme="grey"
          significance="highlighted"
          onClick={() => onNavigate("update")}
          size="xl"
        >
          Update Doctor details
        </Uu5Elements.Button>
      </div>
    </div>
  );
};

// Add Doctor View
const AddDoctorView = ({ onBack, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: "",
    clinicName: "",
    status: "active",
    firstName: "",
    lastName: "",
    phoneNumber: "",
    emailAddress: "",
    description: null,
    profilePhoto: null,
  });
  console.log(formData)
  const { addAlert } = useAlertBus();
  const handleSubmit = async () => {
    setLoading(true);
    try {
      await Calls.createDoctor({
        ...formData,
        //name: `${formData.firstName} ${formData.lastName}`,
      });
      addAlert({message: "Doctor created successfully!", priority:"success"});
      onSuccess();
      //onBack();
    } catch (err) {
      addAlert({message:err.message || "Failed to create doctor", priority:"error"});
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={Css.container()}>
      <Uu5Elements.Button
        className={Css.backButton()}
        icon="mdi-arrow-left"
        onClick={onBack}
        significance="subdued"
      >
        Back
      </Uu5Elements.Button>

      <Uu5Elements.Text category="story" segment="heading" type="h1" className={Css.pageTitle()}>
        Add Doctor
      </Uu5Elements.Text>

      <div className={Css.formContainer()}>
        <Uu5Forms.Select
          label="Choose specialization"
          value={formData.specialization}
          onChange={(e) => updateField("specialization", e.data.value)}
          itemList={SPECIALIZATIONS}
          required
        />

        <Uu5Forms.Select
          label="Choose clinic"
          value={formData.clinicName}
          onChange={(e) => updateField("clinicName", e.data.value)}
          itemList={CLINICS}
          required
        />

        <Uu5Forms.Select
          label="Set status"
          value={formData.status}
          onChange={(e) => updateField("status", e.data.value)}
          itemList={STATUS_OPTIONS}
          required
        />

        <Uu5Forms.Text
          label="First name"
          value={formData.firstName}
          onChange={(e) => updateField("firstName", e.data.value)}
          placeholder="Add doctor first name ..."
          required
        />

        <Uu5Forms.Text
          label="Last name"
          value={formData.lastName}
          onChange={(e) => updateField("lastName", e.data.value)}
          placeholder="Add doctor last name ..."
          required
        />

        <Uu5Forms.Text
          label="Phone number"
          value={formData.phoneNumber}
          onChange={(e) => updateField("phoneNumber", e.data.value)}
          placeholder="Add doctor phone number ..."
          required
        />

        <Uu5Forms.Text
          label="Email"
          value={formData.emailAddress}
          onChange={(e) => updateField("emailAddress", e.data.value)}
          placeholder="Add doctor email ..."
          required
        />

        <Uu5Forms.TextArea
          label="Description"
          value={formData.description}
          onChange={(e) => updateField("description", e.data.value)}
          placeholder="Add doctor description ..."
          rows={4}
        />

        <Uu5Forms.Text
          label="Profile photo URL"
          value={formData.profilePhoto}
          onChange={(e) => updateField("profilePhoto", e.data.value)}
          placeholder="Upload photo URL ..."
        />

        <Uu5Elements.Button
          className={Css.submitButton()}
          colorScheme="grey"
          significance="highlighted"
          onClick={handleSubmit}
          disabled={loading || !formData.firstName || !formData.lastName || !formData.specialization}
          size="xl"
        >
          {loading ? "Creating..." : "Create Doctor"}
        </Uu5Elements.Button>
      </div>
    </div>
  );
};

// Remove Doctor View
const RemoveDoctorView = ({ onBack, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const { addAlert } = useAlertBus();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const result = await Calls.findDoctors({});
      setDoctors(result.itemList || []);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const filteredDoctors = selectedSpecialization
    ? doctors.filter((d) => d.specialization === selectedSpecialization && d.status === "active")
    : doctors;

  const doctorOptions = filteredDoctors.map((d) => ({
    value: d.id || d.doctorId,
    children: `${d.firstName} ${d.lastName}`,
  }));

  const handleRemove = async () => {
    setLoading(true);
    try {
      await Calls.removeDoctor({ id: selectedDoctor });
      addAlert({message: "Doctor removed successfully!", priority: "success"});
      onSuccess();
      onBack();
    } catch (err) {
      if (err.message?.includes("active appointments")) {
        addAlert({message:"Cannot remove this doctor. They have active appointments. Please cancel or reassign those appointments first.", priority:"warning"});
      } else {
        addAlert({message: err.message || "Failed to remove doctor", priority:"error"});
      }
    } finally {
      setLoading(false);
      setConfirmOpen(false);
    }
  };

  return (
    <div className={Css.container()}>
      <Uu5Elements.Button
        className={Css.backButton()}
        icon="mdi-arrow-left"
        onClick={onBack}
        significance="subdued"
      >
        Back
      </Uu5Elements.Button>

      <Uu5Elements.Text category="story" segment="heading" type="h1" className={Css.pageTitle()}>
        Remove Doctor
      </Uu5Elements.Text>

      <div className={Css.formContainer()}>
        <Uu5Forms.Select
          label="Choose specialization"
          value={selectedSpecialization}
          onChange={(e) => {
            setSelectedSpecialization(e.data.value);
            setSelectedDoctor("");
          }}
          itemList={[{ value: "", children: "All specializations" }, ...SPECIALIZATIONS]}
        />

        <Uu5Forms.Select
          label="Choose Doctor"
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.data.value)}
          itemList={doctorOptions}
          disabled={doctorOptions.length === 0}
        />

        <Uu5Elements.Button
          className={Css.submitButton()}
          colorScheme="grey"
          significance="highlighted"
          onClick={() => setConfirmOpen(true)}
          disabled={!selectedDoctor || loading}
          size="xl"
        >
          Remove Doctor
        </Uu5Elements.Button>
      </div>

      <Uu5Elements.Dialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        header="Confirm Removal"
        icon={<Uu5Elements.Svg code="mdi-alert" />}
        info={
          <>
            <p>Are you sure you want to remove this doctor?</p>
            <p style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
              Note: If this doctor has active appointments, they must be cancelled first.
              Past appointments will remain in the system.
            </p>
          </>
        }
        actionDirection="horizontal"
        actionList={[
          {
            children: "Cancel",
            significance: "distinct",
            onClick: () => setConfirmOpen(false),
          },
          {
            children: "Remove",
            colorScheme: "negative",
            significance: "highlighted",
            onClick: handleRemove,
            disabled: loading,
          },
        ]}
      />
    </div>
  );
};

// Update Doctor View
const UpdateDoctorView = ({ onBack, onSuccess }) => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSpecialization, setSelectedSpecialization] = useState("");
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [formData, setFormData] = useState(null);
  const { addAlert } = useAlertBus();

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      const result = await Calls.findDoctors({});
      setDoctors(result.itemList || []);
    } catch (err) {
      console.error("Error loading doctors:", err);
    }
  };

  const filteredDoctors = selectedSpecialization
    ? doctors.filter((d) => d.specialization === selectedSpecialization)
    : doctors;

  const doctorOptions = filteredDoctors.map((d) => ({
    value: d.id || d.doctorId,
    children: `${d.firstName} ${d.lastName}`,
  }));

  const handleDoctorSelect = (doctorId) => {
    setSelectedDoctorId(doctorId);
    const doctor = doctors.find((d) => (d.id || d.doctorId) === doctorId);
    if (doctor) {
      setFormData({
        firstName: doctor.firstName || "",
        lastName: doctor.lastName || "",
        specialization: doctor.specialization || "",
        phoneNumber: doctor.phoneNumber || "",
        emailAddress: doctor.emailAddress || "",
        clinicName: doctor.clinicName || "",
        description: doctor.description || "",
        profilePhoto: doctor.profilePhoto || "",
        status: doctor.status || "active",
      });
    }
  };

  const updateField = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  const handleUpdate = async () => {
    setLoading(true);
    try {
      await Calls.updateDoctor({
        id: selectedDoctorId,
        ...formData,
      });
      addAlert({message: "Doctor updated successfully!", priority: "success"});
      onSuccess();
      onBack();
    } catch (err) {
      addAlert({message: err.message || "Failed to update doctor", priority: "error"});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={Css.container()}>
      <Uu5Elements.Button
        className={Css.backButton()}
        icon="mdi-arrow-left"
        onClick={onBack}
        significance="subdued"
      >
        Back
      </Uu5Elements.Button>

      <Uu5Elements.Text category="story" segment="heading" type="h1" className={Css.pageTitle()}>
        Update Doctor
      </Uu5Elements.Text>

      <div className={Css.formContainer()}>
        <Uu5Forms.Select
          label="Choose current specialization"
          value={selectedSpecialization}
          onChange={(e) => {
            setSelectedSpecialization(e.data.value);
            setSelectedDoctorId("");
            setFormData(null);
          }}
          itemList={[{ value: "", children: "All specializations" }, ...SPECIALIZATIONS]}
        />

        <Uu5Forms.Select
          label="Choose current doctor name"
          value={selectedDoctorId}
          onChange={(e) => handleDoctorSelect(e.data.value)}
          itemList={doctorOptions}
          disabled={doctorOptions.length === 0}
        />

        {formData && (
          <>
            <Uu5Elements.Text category="interface" segment="title" type="minor" className={Css.sectionTitle()}>
              Update the information below
            </Uu5Elements.Text>

            <Uu5Forms.Text
              label="First Name"
              value={formData.firstName}
              onChange={(e) => updateField("firstName", e.data.value)}
            />

            <Uu5Forms.Text
              label="Last Name"
              value={formData.lastName}
              onChange={(e) => updateField("lastName", e.data.value)}
            />

            <Uu5Forms.Select
              label="Specialization"
              value={formData.specialization}
              onChange={(e) => updateField("specialization", e.data.value)}
              itemList={SPECIALIZATIONS}
            />

            <Uu5Forms.Text
              label="Phone"
              value={formData.phoneNumber}
              onChange={(e) => updateField("phoneNumber", e.data.value)}
            />

            <Uu5Forms.Text
              label="Email"
              value={formData.emailAddress}
              onChange={(e) => updateField("emailAddress", e.data.value)}
            />

            <Uu5Forms.Select
              label="Clinic"
              value={formData.clinicName}
              onChange={(e) => updateField("clinicName", e.data.value)}
              itemList={CLINICS}
            />

            <Uu5Forms.TextArea
              label="Description"
              value={formData.description}
              onChange={(e) => updateField("description", e.data.value)}
              rows={3}
            />

            <Uu5Forms.Text
              label="Profile Photo URL"
              value={formData.profilePhoto}
              onChange={(e) => updateField("profilePhoto", e.data.value)}
            />

            <Uu5Forms.Select
              label="Status"
              value={formData.status}
              onChange={(e) => updateField("status", e.data.value)}
              itemList={STATUS_OPTIONS}
            />

            <Uu5Elements.Button
              className={Css.submitButton()}
              colorScheme="grey"
              significance="highlighted"
              onClick={handleUpdate}
              disabled={loading}
              size="xl"
            >
              {loading ? "Updating..." : "Update"}
            </Uu5Elements.Button>
          </>
        )}
      </div>
    </div>
  );
};
//@@viewOff:helpers

let ManageDoctorsRoute = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "ManageDoctorsRoute",
  //@@viewOff:statics

  render() {
    const [currentView, setCurrentView] = useState("menu"); // menu, add, remove, update

    const handleSuccess = () => {
      // Refresh data if needed
    };

    return (
      <>
        <RouteBar />
        {currentView === "menu" && <MainMenuView onNavigate={setCurrentView} />}
        {currentView === "add" && (
          <AddDoctorView onBack={() => setCurrentView("menu")} onSuccess={handleSuccess} />
        )}
        {currentView === "remove" && (
          <RemoveDoctorView onBack={() => setCurrentView("menu")} onSuccess={handleSuccess} />
        )}
        {currentView === "update" && (
          <UpdateDoctorView onBack={() => setCurrentView("menu")} onSuccess={handleSuccess} />
        )}
      </>
    );
  },
});

ManageDoctorsRoute = withRoute(ManageDoctorsRoute);

//@@viewOn:exports
export { ManageDoctorsRoute };
export default ManageDoctorsRoute;
//@@viewOff:exports
