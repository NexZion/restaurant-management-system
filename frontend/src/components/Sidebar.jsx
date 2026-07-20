import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { menuItems } from "../data/menuItems";
import { Icon } from "./Icons";
import { useTheme } from "../context/ThemeContext";
import { storageUrl } from "../utils/storageUrl";
import { logoutUser } from "../utils/logout";
import { ToggleSwitch } from "./DataFields";
import api from "../axiosClient";

export const Sidebar = ({ isOpen = false, onClose = () => {} }) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);

  useLayoutEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);
  const storedUser = useMemo(
    () => JSON.parse(localStorage.getItem("USER")) || {},
    [],
  );
  const [user, setUser] = useState(storedUser);
  const profileName = user.name || user.username || "User";
  const profileRole = user.role?.name || "Loading role...";
  const photo = user.profileImage || user.profile_photo_path || user.image;
  const profilePhoto = photo ? storageUrl(photo) : null;

  const location = useLocation();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();

  const [expandedGroups, setExpandedGroups] = useState({});

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  const profileMenuRef = useRef(null);

  useEffect(() => {
    if (user.role?.name || !user.role_id) return;

    api.get("auth/me")
      .then(({ data }) => {
        if (!data.user) return;
        setUser(data.user);
        localStorage.setItem("USER", JSON.stringify(data.user));
      })
      .catch(() => {
        // Keep the stored profile if it cannot be refreshed.
      });
  }, [user.role?.name, user.role_id]);

  const toggleGroup = (groupName) => {
    setExpandedGroups((prev) =>
      prev[groupName] ? {} : { [groupName]: true },
    );
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileMenuRef.current &&
        !profileMenuRef.current.contains(event.target)
      ) {
        setIsProfileMenuOpen(false);
      }
    };

    if (isProfileMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileMenuOpen]);

  const handleLogout = async () => {
    await logoutUser({
      navigate,
      onAfterLogout: () => setIsProfileMenuOpen(false),
    });
  };

  return (
    <>
      {/* Backdrop — mobile/tablet only */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className="relative flex w-[280px] flex-shrink-0 flex-col border-r border-slate-200/80 bg-white text-slate-900 shadow-xl shadow-slate-200/40 dark:border-slate-800/80 dark:bg-[#0f1117] dark:text-white dark:shadow-black/20"
        style={
          isMobile
            ? {
                position: "fixed",
                top: 0,
                left: 0,
                height: "100dvh",
                zIndex: 50,
                transform: isOpen ? "translateX(0)" : "translateX(-100%)",
                transition: "transform 300ms ease",
                overflowY: "auto",
                WebkitOverflowScrolling: "touch",
              }
            : { height: "100dvh" }
        }
      >
        <div className="relative flex flex-col items-center border-b border-slate-100 px-6 py-7 dark:border-slate-800">
          {/* Close button — mobile/tablet only */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            aria-label="Close sidebar"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <img
            src={logo}
            className="h-auto w-[68%] invert transition-opacity dark:invert-0"
            alt="Logo"
          />
        </div>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-3 py-4 sm:gap-6 sm:py-5">
          <div className="flex flex-col gap-1">
            {menuItems.map((item, index) =>
              item.type === "item" ? (
                <Link
                  key={index}
                  to={item.path}
                  onClick={() => {
                    setExpandedGroups({});
                    onClose();
                  }}
                  className={`group flex items-center gap-3 rounded-lg px-3.5 py-2.5 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-slate-800/80 ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700 shadow-sm ring-1 ring-blue-100 dark:bg-blue-500/12 dark:text-blue-200 dark:ring-blue-400/20"
                      : ""
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`h-5 w-5 ${location.pathname === item.path ? "text-blue-600 dark:text-blue-300" : "text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"}`}
                  />
                  <span
                    className={`text-sm font-medium ${location.pathname === item.path ? "text-blue-700 dark:text-blue-100" : "text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-white"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              ) : (
                <div key={index} className="flex flex-col">
                  <div
                    onClick={() => toggleGroup(item.name)}
                    className="group flex cursor-pointer items-center gap-3 rounded-lg px-3.5 py-2.5 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                  >
                    <Icon
                      name={item.icon}
                      className="h-5 w-5 text-slate-500 group-hover:text-slate-800 dark:text-slate-400 dark:group-hover:text-slate-200"
                    />
                    <span className="flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-950 dark:text-slate-300 dark:group-hover:text-white">
                      {item.name}
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedGroups[item.name] ? "rotate-180" : ""}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </div>

                  {expandedGroups[item.name] && (
                    <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-2 dark:border-slate-800">
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={onClose}
                          className={`flex cursor-pointer items-center rounded-lg px-3 py-2 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 ${
                            location.pathname === subItem.path
                              ? "bg-blue-50 text-blue-700 ring-1 ring-blue-100 dark:bg-blue-500/12 dark:text-blue-100 dark:ring-blue-400/20"
                              : ""
                          }`}
                        >
                          <span
                            className={`text-sm ${location.pathname === subItem.path ? "text-blue-700 dark:text-blue-100" : "text-slate-600 dark:text-slate-300"}`}
                          >
                            {subItem.name}
                          </span>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ),
            )}
          </div>
        </div>

        <div className="relative flex-shrink-0" ref={profileMenuRef}>
          {isProfileMenuOpen && (
            <div className="absolute bottom-full left-0 right-0 mx-2 mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40 sm:mx-4">
              <div className="flex flex-col">
                <div
                  className="cursor-pointer px-3 py-2.5 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-slate-800 sm:px-4"
                  onClick={() => {
                    navigate("/settings");
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-white">
                    Settings
                  </span>
                </div>
                <hr className="my-1 border-slate-100 dark:border-slate-800" />
                <div
                  className="cursor-pointer px-3 py-2.5 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 sm:px-4"
                  onClick={handleLogout}
                >
                  <span className="text-sm text-red-600 dark:text-red-400">
                    Sign Out
                  </span>
                </div>
              </div>
            </div>
          )}

          <div
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            className="m-2 flex cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-sm dark:border-slate-800 dark:bg-[#171a21] dark:hover:border-slate-700 dark:hover:bg-slate-800/60 sm:m-3 sm:gap-3 sm:px-3 sm:py-3"
          >
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 sm:h-10 sm:w-10">
              <img
                src={profilePhoto}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="truncate text-xs font-semibold text-slate-950 dark:text-white sm:text-sm">
                {profileName}
              </div>
              <div className="truncate text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                {profileRole}
              </div>
            </div>

            {/* Theme Toggle Switch */}
            <div
              className="flex-shrink-0"
              onClick={(event) => event.stopPropagation()}
            >
              <ToggleSwitch
                checked={!isDarkMode}
                onChange={toggleTheme}
                size="medium"
                checkedColor="#79b7fd"
                uncheckedColor="#4B5563"
                leftIcon={
                  <svg
                    className="h-full w-full text-gray-800"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                }
                rightIcon={
                  <svg
                    className="h-full w-full text-yellow-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
