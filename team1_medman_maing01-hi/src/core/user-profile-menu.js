//@@viewOn:imports
import { createVisualComponent, useState, useRoute } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  profileButton: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "#f5f5f5",
      border: "2px solid #333",
      cursor: "pointer",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#e0e0e0",
      },
    }),
  dropdown: () =>
    Config.Css.css({
      position: "absolute",
      top: "50px",
      right: "0",
      backgroundColor: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
      minWidth: "200px",
      zIndex: 99999,
      overflow: "hidden",
    }),
  menuItem: () =>
    Config.Css.css({
      padding: "12px 16px",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      gap: "12px",
      transition: "background-color 0.2s",
      "&:hover": {
        backgroundColor: "#f5f5f5",
      },
    }),
  menuDivider: () =>
    Config.Css.css({
      height: "1px",
      backgroundColor: "#e0e0e0",
      margin: "4px 0",
    }),
  container: () =>
    Config.Css.css({
      position: "relative",
    }),
  overlay: () =>
    Config.Css.css({
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 999,
    }),
};
//@@viewOff:css

const UserProfileMenu = createVisualComponent({
  //@@viewOn:statics
  uu5Tag: Config.TAG + "UserProfileMenu",
  //@@viewOff:statics

  render() {
    const [isOpen, setIsOpen] = useState(false);
    const [, setRoute] = useRoute();

    const handleMenuClick = (route) => {
      setIsOpen(false);
      if (route === "logout") {
        // Handle logout
        alert("Logout functionality - would redirect to login");
      } else {
        setRoute(route);
      }
    };

    return (
      <div className={Css.container()}>
        <div className={Css.profileButton()} onClick={() => setIsOpen(!isOpen)}>
          <Uu5Elements.Icon icon="mdi-account" style={{ fontSize: "24px" }} />
        </div>

        {isOpen && (
          <>
            <div className={Css.overlay()} onClick={() => setIsOpen(false)} />
            <div className={Css.dropdown()}>
              <div className={Css.menuItem()} onClick={() => handleMenuClick("myMedicalRecord")}>
                <Uu5Elements.Icon icon="mdi-account-circle" />
                <span>My profile</span>
              </div>
              <div className={Css.menuItem()} onClick={() => handleMenuClick("pastAppointments")}>
                <Uu5Elements.Icon icon="mdi-history" />
                <span>Past Appointments</span>
              </div>
              <div className={Css.menuDivider()} />
              <div className={Css.menuItem()} onClick={() => handleMenuClick("logout")}>
                <Uu5Elements.Icon icon="mdi-logout" />
                <span>Log Out</span>
              </div>
            </div>
          </>
        )}
      </div>
    );
  },
});

//@@viewOn:exports
export { UserProfileMenu };
export default UserProfileMenu;
//@@viewOff:exports

