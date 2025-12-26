//@@viewOn:imports
import { createVisualComponent, useState, useRoute, useEffect } from "uu5g05";
import Uu5Elements from "uu5g05-elements";
import Config from "./config/config.js";
//@@viewOff:imports

//@@viewOn:css
const Css = {
  wrapper: () =>
    Config.Css.css({
      position: "relative",
      display: "inline-flex",
      alignItems: "center",
    }),
  profileButton: () =>
    Config.Css.css({
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundColor: "transparent",
      border: "none",
      cursor: "pointer",
      transition: "background-color 0.2s",
      color: "#333",
      "&:hover": {
        backgroundColor: "rgba(0,0,0,0.08)",
      },
    }),
  dropdown: () =>
    Config.Css.css({
      position: "absolute",
      top: "48px",
      right: "0",
      backgroundColor: "#fff",
      border: "1px solid #e0e0e0",
      borderRadius: "8px",
      boxShadow: "0 4px 16px rgba(0, 0, 0, 0.15)",
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
  divider: () =>
    Config.Css.css({
      height: "1px",
      backgroundColor: "#e0e0e0",
      margin: "4px 0",
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

    // Close dropdown when clicking outside
    useEffect(() => {
      if (!isOpen) return;
      
      const handleClickOutside = (e) => {
        if (!e.target.closest("[data-profile-menu]")) {
          setIsOpen(false);
        }
      };
      
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }, [isOpen]);

    const handleMenuClick = (route) => {
      setIsOpen(false);
      if (route === "logout") {
        alert("Logout functionality - would redirect to login");
      } else {
        setRoute(route);
      }
    };

    return (
      <div className={Css.wrapper()} data-profile-menu>
        <button 
          className={Css.profileButton()} 
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
          aria-label="User profile menu"
        >
          <Uu5Elements.Icon icon="mdi-account" style={{ fontSize: "28px" }} />
        </button>

        {isOpen && (
          <div className={Css.dropdown()}>
            <div className={Css.menuItem()} onClick={() => handleMenuClick("myMedicalRecord")}>
              <Uu5Elements.Icon icon="mdi-account-circle" />
              <span>My profile</span>
            </div>
            <div className={Css.menuItem()} onClick={() => handleMenuClick("pastAppointments")}>
              <Uu5Elements.Icon icon="mdi-history" />
              <span>Past Appointments</span>
            </div>
            <div className={Css.divider()} />
            <div className={Css.menuItem()} onClick={() => handleMenuClick("logout")}>
              <Uu5Elements.Icon icon="mdi-logout" />
              <span>Log Out</span>
            </div>
          </div>
        )}
      </div>
    );
  },
});

//@@viewOn:exports
export { UserProfileMenu };
export default UserProfileMenu;
//@@viewOff:exports
