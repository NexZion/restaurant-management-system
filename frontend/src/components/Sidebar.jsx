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
    setExpandedGroups((prev) => ({
      ...prev,
      [groupName]: !prev[groupName],
    }));
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
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <div
        className="relative flex flex-col w-[280px] bg-white dark:bg-[#09090B] text-gray-900 dark:text-white border-r border-gray-300 dark:border-gray-800 flex-shrink-0"
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
        <div className="flex flex-col items-center py-8 px-6 border-b border-gray-300 dark:border-gray-800">
          {/* Close button — mobile/tablet only */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 lg:hidden p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
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
            className="invert dark:invert-0 w-[70%] h-auto"
            alt="Logo"
          />
        </div>

        <div className="flex flex-col flex-1 px-4 py-3 sm:py-6 gap-4 sm:gap-6 overflow-y-auto">
          <div className="flex flex-col gap-1">
            {menuItems.map((item, index) =>
              item.type === "item" ? (
                <Link
                  key={index}
                  to={item.path}
                  onClick={onClose}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200 ${
                    location.pathname === item.path
                      ? "bg-blue-100 dark:bg-[#161617] border-l-4 border-blue-600 dark:border-white"
                      : ""
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`w-5 h-5 ${location.pathname === item.path ? "text-blue-600 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
                  />
                  <span
                    className={`text-sm font-medium ${location.pathname === item.path ? "text-blue-600 dark:text-white" : "text-gray-700 dark:text-gray-300"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              ) : (
                <div key={index} className="flex flex-col">
                  <div
                    onClick={() => toggleGroup(item.name)}
                    className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200"
                  >
                    <Icon
                      name={item.icon}
                      className="w-5 h-5 text-gray-500 dark:text-gray-400"
                    />
                    <span className="text-sm font-medium flex-1 text-gray-700 dark:text-gray-300">
                      {item.name}
                    </span>
                    <svg
                      className={`w-4 h-4 transition-transform duration-200 ${expandedGroups[item.name] ? "rotate-180" : ""}`}
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
                    <div className="flex flex-col ml-4 mt-1 gap-1">
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={onClose}
                          className={`flex items-center px-4 py-2 rounded-lg hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200 ${
                            location.pathname === subItem.path
                              ? "bg-blue-100 dark:bg-[#161617] border-l-4 border-blue-600 dark:border-white"
                              : ""
                          }`}
                        >
                          <span
                            className={`text-sm ${location.pathname === subItem.path ? "text-blue-600 dark:text-white" : "text-gray-600 dark:text-gray-300"}`}
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
            <div className="absolute bottom-full left-0 right-0 mb-0 mx-2 sm:mx-4 bg-white dark:bg-[#212125] rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 overflow-hidden">
              <div className="flex flex-col">
                <div
                  className="px-3 sm:px-4 py-2 hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200"
                  onClick={() => {
                    navigate("/settings");
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span className="text-sm text-gray-900 dark:text-white">
                    Settings
                  </span>
                </div>
                <hr className="my-1 border-gray-300 dark:border-gray-700" />
                <div
                  className="px-3 sm:px-4 py-2 hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200"
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
            className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2 sm:py-3 m-2 sm:m-3 rounded-lg border-t border-gray-300 dark:border-gray-800 hover:bg-blue-100 dark:hover:bg-[#161617] cursor-pointer transition-colors duration-200"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0">
              <img
                src={profilePhoto}
                alt=""
                className="rounded-full w-8 h-8 sm:w-10 sm:h-10 object-cover"
              />
            </div>
            <div className="flex flex-col flex-1 min-w-0">
              <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">
                {profileName}
              </div>
              <div className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 truncate">
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
