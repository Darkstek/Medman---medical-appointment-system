//@@viewOn:imports
import { createVisualComponent, Utils, useState, useEffect   } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Plus4U5 from "uu_plus4u5g02";
import Plus4U5Elements from "uu_plus4u5g02-elements";
import Plus4U5App from "uu_plus4u5g02-app";
import Config from "./config/config.js";
import Home from "../routes/home.js";
import calls from "../calls";

import DoctorAppointmentsRoute from "../routes/doctor-appointments-route.js";

const InitAppWorkspace = Utils.Component.lazy(() => import("../routes/init-app-workspace.js"));
const ControlPanel = Utils.Component.lazy(() => import("../routes/control-panel.js"));
const MyAppointmentsRoute = Utils.Component.lazy(() => import("../routes/my-appointments-route.js"));
const DoctorsListRoute = Utils.Component.lazy(() => import("../routes/doctors-list-route.js"));
const MyMedicalRecordRoute = Utils.Component.lazy(() => import("../routes/my-medical-record-route.js"));
const ManageDoctorsRoute = Utils.Component.lazy(() => import("../routes/manage-doctors-route.js"));
//@@viewOff:imports

//@@viewOn:constants
const ROLE = {
  DOCTOR: "doctor",
  PATIENT: "patient",
  ADMIN: "authorities",
};
const ROUTE_ACCESS = {
  myAppointments: [ROLE.PATIENT],
  doctorsList: [ROLE.PATIENT, ROLE.ADMIN],
  myMedicalRecord: [ROLE.PATIENT, ROLE.ADMIN],
  doctorAppointments: [ROLE.DOCTOR, ROLE.ADMIN],
  manageDoctors: [ROLE.ADMIN],
  controlPanel: [ROLE.ADMIN],
};

function withRoleGuard(Component, allowedRoles, userRole) {
  return (props) => {
    if (!allowedRoles || allowedRoles.includes(userRole)) {
      return <Component {...props} />;
    }

    return (
      <Plus4U5Elements.Unauthorized />
    );
  };
}
function createRouteMap(userRole) {
  return {
    "": { redirect: "myAppointments" },

    home: (props) => <Home {...props} />,

    "sys/uuAppWorkspace/initUve": (props) => (
      <InitAppWorkspace {...props} />
    ),

    myAppointments: withRoleGuard(
      MyAppointmentsRoute,
      ROUTE_ACCESS.myAppointments,
      userRole
    ),

    doctorsList: withRoleGuard(
      DoctorsListRoute,
      ROUTE_ACCESS.doctorsList,
      userRole
    ),

    myMedicalRecord: withRoleGuard(
      MyMedicalRecordRoute,
      ROUTE_ACCESS.myMedicalRecord,
      userRole
    ),

    doctorAppointments: withRoleGuard(
      DoctorAppointmentsRoute,
      ROUTE_ACCESS.doctorAppointments,
      userRole
    ),

    controlPanel: withRoleGuard(
      ControlPanel,
      ROUTE_ACCESS.controlPanel,
      userRole
    ),

    manageDoctors: withRoleGuard(
      ManageDoctorsRoute,
      ROUTE_ACCESS.manageDoctors,
      userRole
    ),

    "*": () => (
      <Uu5Elements.Text category="story" segment="heading" type="h1">
        Not Found
      </Uu5Elements.Text>
    ),
  };
}

/*
const ROUTE_MAP = {

  "": { redirect: "myAppointments" },
  home: (props) => <Home {...props} />,
  "sys/uuAppWorkspace/initUve": (props) => <InitAppWorkspace {...props} />,
  myAppointments: (props) => <MyAppointmentsRoute {...props} />,
  doctorsList: (props) => <DoctorsListRoute {...props} />,
  myMedicalRecord: (props) => <MyMedicalRecordRoute {...props} />,
  doctorAppointments: (props) => <DoctorAppointmentsRoute {...props} />,
  controlPanel: (props) => <ControlPanel {...props} />,
  manageDoctors: (props) => <ManageDoctorsRoute {...props} />,
  "*": () => (
    <Uu5Elements.Text category="story" segment="heading" type="h1">
      Not Found
    </Uu5Elements.Text>
  ),
};
*/
async function resolveUserRole() {
  const identity = await calls.getPermission();

  const profileList = identity?.profiles?.[0]?.profileList || [];

  if (profileList.includes("Authorities")) return ROLE.ADMIN;
  if (profileList.includes("Doctor")) return ROLE.DOCTOR;

  return ROLE.PATIENT;
}
//@@viewOff:constants

//@@viewOn:css
//@@viewOff:css

//@@viewOn:helpers
//@@viewOff:helpers

const Spa = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "Spa",
  //@@viewOff:statics

  //@@viewOn:propTypes
  propTypes: {},
  //@@viewOff:propTypes

  //@@viewOn:defaultProps
  defaultProps: {},
  //@@viewOff:defaultProps

  render() {
    const [userRole, setUserRole] = useState(null);
    const [state, setState] = useState("pending");

   useEffect(() => {
      resolveUserRole()
        .then((role) => {
          setUserRole(role);
          setState("ready");
        })
        .catch(() => setState("error"));
    }, []);

    if (state === "pending") {
      return <Uu5Elements.Pending />;
    }

    if (state === "error") {
      return (
        <Uu5Elements.Text colorScheme="negative">
          Failed to load user permissions
        </Uu5Elements.Text>
      );
    }
    //@@viewOn:private
    //@@viewOff:private

    //@@viewOn:render
    return (
      <Plus4U5.SpaProvider initialLanguageList={["en", "cs"]}>
        <Uu5Elements.ModalBus>
          <Plus4U5App.Spa routeMap={createRouteMap(userRole)} />
        </Uu5Elements.ModalBus>
      </Plus4U5.SpaProvider>
    );
    //@@viewOff:render
  },
});

//@@viewOn:exports
export { Spa };
export default Spa;
//@@viewOff:exports
