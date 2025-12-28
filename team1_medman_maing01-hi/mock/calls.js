import Calls from "../src/calls.js";

let appAssetsBaseUri =
  document.baseURI ||
  (document.querySelector("base") || {}).href ||
  location.protocol + "//" + location.host + location.pathname;
if (!appAssetsBaseUri.endsWith("/")) {
  appAssetsBaseUri = appAssetsBaseUri.slice(0, appAssetsBaseUri.lastIndexOf("/")); // strip what's after last slash
}

// Session-persistent data store for doctors
let doctorsStore = null;
let doctorsInitialized = false;

// Initialize doctors store from JSON file
async function initDoctorsStore() {
  if (doctorsInitialized) return;
  
  try {
    const mockUrl = (process.env.MOCK_DATA_BASE_URI || appAssetsBaseUri) + "mock/data/doctor/find.json";
    const response = await fetch(mockUrl);
    const data = await response.json();
    doctorsStore = data.itemList || [];
    doctorsInitialized = true;
    console.log("Doctors store initialized with", doctorsStore.length, "doctors");
  } catch (err) {
    console.error("Failed to initialize doctors store:", err);
    doctorsStore = [];
    doctorsInitialized = true;
  }
}

// Generate a unique ID for new doctors
function generateDoctorId() {
  const maxId = doctorsStore.reduce((max, doc) => {
    const num = parseInt(doc.id?.replace("doc", "") || "0");
    return num > max ? num : max;
  }, 0);
  return `doc${maxId + 1}`;
}

// Custom handlers for doctor operations
const customHandlers = {
  "doctor/find": async () => {
    await initDoctorsStore();
    return {
      itemList: [...doctorsStore],
      pageInfo: { pageIndex: 0, pageSize: 100, total: doctorsStore.length },
      uuAppErrorMap: {},
    };
  },

  "doctor/get": async (dtoIn) => {
    await initDoctorsStore();
    const doctor = doctorsStore.find(
      (d) => d.id === dtoIn?.id || d.doctorId === dtoIn?.id
    );
    if (!doctor) {
      throw new Error("Doctor not found");
    }
    return { ...doctor, uuAppErrorMap: {} };
  },

  "doctor/create": async (dtoIn) => {
    await initDoctorsStore();
    const newDoctor = {
      id: generateDoctorId(),
      doctorId: `DOC-${String(doctorsStore.length + 1).padStart(3, "0")}`,
      firstName: dtoIn.firstName,
      lastName: dtoIn.lastName,
      specialization: dtoIn.specialization,
      phoneNumber: dtoIn.phoneNumber || "",
      emailAddress: dtoIn.emailAddress || "",
      status: dtoIn.status || "active",
      description: dtoIn.description || "",
      clinic: dtoIn.clinic || "",
      profilePhoto: dtoIn.profilePhoto || "",
      averageRating: 0,
      ratingCount: 0,
      availableTimeSlots: [],
    };
    doctorsStore.push(newDoctor);
    console.log("Doctor created:", newDoctor.firstName, newDoctor.lastName);
    return { ...newDoctor, uuAppErrorMap: {} };
  },

  "doctor/update": async (dtoIn) => {
    await initDoctorsStore();
    const index = doctorsStore.findIndex(
      (d) => d.id === dtoIn.id || d.doctorId === dtoIn.id
    );
    if (index === -1) {
      throw new Error("Doctor not found");
    }
    
    const updatedDoctor = {
      ...doctorsStore[index],
      ...dtoIn,
      id: doctorsStore[index].id, // Preserve original id
      doctorId: doctorsStore[index].doctorId, // Preserve original doctorId
    };
    doctorsStore[index] = updatedDoctor;
    console.log("Doctor updated:", updatedDoctor.firstName, updatedDoctor.lastName);
    return { ...updatedDoctor, uuAppErrorMap: {} };
  },

  "doctor/remove": async (dtoIn) => {
    await initDoctorsStore();
    const index = doctorsStore.findIndex(
      (d) => d.id === dtoIn.id || d.doctorId === dtoIn.id
    );
    if (index === -1) {
      throw new Error("Doctor not found");
    }
    
    const removedDoctor = doctorsStore[index];
    doctorsStore.splice(index, 1);
    console.log("Doctor removed:", removedDoctor.firstName, removedDoctor.lastName);
    return { success: true, uuAppErrorMap: {} };
  },
};

Calls.call = (method, url, dtoIn) => {
  // Check for custom handler first
  if (customHandlers[url]) {
    return customHandlers[url](dtoIn);
  }

  // Fallback to loading from JSON files
  let mockUrl = (process.env.MOCK_DATA_BASE_URI || appAssetsBaseUri) + "mock/data/" + url + ".json";
  let responsePromise = (async () => {
    let response = await fetch(mockUrl);
    return await response.json();
  })();
  return dtoIn != null ? responsePromise.then(dtoIn.done, dtoIn.fail) : responsePromise;
};

Calls.getCommandUri = (useCase) => {
  return useCase;
};

export default Calls;
