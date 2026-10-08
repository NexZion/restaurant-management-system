import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { Link, useLocation, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
import { menuItems } from "../data/menuItems";
import { Icon } from "./Icons";
import { useTheme } from "../context/ThemeContext";
import { storageUrl } from "../utils/storageUrl";
import { logoutUser } from "../utils/logout";
import { ToggleSwitch } from "./DataFields";
import api from "../axiosClient";

export const Sidebar = ({
  isOpen = false,
  isCollapsed = false,
  onToggleCollapse = () => {},
  onClose = () => {},
}) => {
  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 1024);
  const isDesktopCollapsed = isCollapsed && !isMobile;

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
        className={`relative z-40 flex flex-shrink-0 flex-col border-r border-slate-200/80 bg-white text-slate-900 transition-[width] duration-200 dark:border-[#1F2226] dark:bg-[#080808] dark:text-[#F7F8F8] ${isDesktopCollapsed ? "w-[72px]" : "w-[264px]"}`}
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
        <div className={`relative flex min-h-[76px] flex-col items-center justify-center border-b border-slate-100 py-4 dark:border-[#1F2226] ${isDesktopCollapsed ? "px-2" : "px-5"}`}>
          {/* Close button — mobile/tablet only */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg bg-transparent p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 dark:bg-transparent dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20] dark:hover:text-white lg:hidden"
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
            className={`h-auto invert transition-opacity dark:invert-0 ${isDesktopCollapsed ? "hidden" : "w-[68%]"}`}
            alt="Logo"
          />
        </div>

        <div className={`flex flex-1 flex-col gap-3.5 overflow-y-auto py-3.5 sm:gap-5 sm:py-4.5 ${isDesktopCollapsed ? "px-1.5" : "px-2.5"}`}>
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
                  aria-label={isDesktopCollapsed ? item.name : undefined}
                  title={isDesktopCollapsed ? item.name : undefined}
                  className={`group flex items-center rounded-lg py-2 transition-all duration-200 hover:bg-slate-100 hover:text-slate-950 dark:hover:bg-[#1A1C20] dark:hover:text-white ${isDesktopCollapsed ? "justify-center px-2.5" : "gap-2.5 px-3.5"} ${
                    location.pathname === item.path
                      ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-[#1A1C20] dark:text-[#F7F8F8] dark:ring-white/5"
                      : ""
                  }`}
                >
                  <Icon
                    name={item.icon}
                    className={`h-5 w-5 flex-shrink-0 ${location.pathname === item.path ? "text-blue-600 dark:text-[#F7F8F8]" : "text-slate-500 group-hover:text-slate-800 dark:text-[#8A8F98] dark:group-hover:text-[#F7F8F8]"}`}
                  />
                  <span
                    className={`${isDesktopCollapsed ? "hidden" : "text-sm font-medium"} ${location.pathname === item.path ? "text-blue-700 dark:text-[#F7F8F8]" : "text-slate-700 group-hover:text-slate-950 dark:text-[#D0D6E0] dark:group-hover:text-[#F7F8F8]"}`}
                  >
                    {item.name}
                  </span>
                </Link>
              ) : (
                <div key={index} className={`relative flex flex-col ${isDesktopCollapsed ? "items-center" : ""}`}>
                  <div
                    role="button"
                    tabIndex={0}
                    aria-label={isDesktopCollapsed ? item.name : undefined}
                    title={isDesktopCollapsed ? `${item.name} (expand sidebar to open links)` : undefined}
                    onClick={() => {
                      if (isDesktopCollapsed) {
                        setExpandedGroups({ [item.name]: true });
                        onToggleCollapse();
                      } else {
                        toggleGroup(item.name);
                      }
                    }}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        if (isDesktopCollapsed) {
                          setExpandedGroups({ [item.name]: true });
                          onToggleCollapse();
                        } else {
                          toggleGroup(item.name);
                        }
                      }
                    }}
                    className={`group flex cursor-pointer items-center rounded-lg py-2 transition-all duration-200 hover:bg-slate-100 dark:hover:bg-[#1A1C20] dark:hover:text-white ${isDesktopCollapsed ? "justify-center px-2.5" : "gap-2.5 px-3.5"}`}
                  >
                    <Icon
                      name={item.icon}
                      className="h-5 w-5 flex-shrink-0 text-slate-500 group-hover:text-slate-800 dark:text-[#8A8F98] dark:group-hover:text-[#F7F8F8]"
                    />
                    <span className={`flex-1 text-sm font-medium text-slate-700 group-hover:text-slate-950 dark:text-[#D0D6E0] dark:group-hover:text-[#F7F8F8] ${isDesktopCollapsed ? "hidden" : ""}`}>
                      {item.name}
                    </span>
                    <svg
                      className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${expandedGroups[item.name] ? "rotate-180" : ""} ${isDesktopCollapsed ? "hidden" : ""}`}
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
                    <div className="ml-5 mt-1 flex flex-col gap-1 border-l border-slate-200 pl-2 dark:border-[#1F2226]">
                      {item.items.map((subItem, subIndex) => (
                        <Link
                          key={subIndex}
                          to={subItem.path}
                          onClick={onClose}
                          className={`flex cursor-pointer items-center rounded-lg px-2.5 py-1.5 transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-[#1A1C20] dark:hover:text-white ${
                            location.pathname === subItem.path
                              ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 dark:bg-[#1A1C20] dark:text-[#F7F8F8] dark:ring-white/5"
                              : ""
                          }`}
                        >
                          <span
                            className={`text-sm ${location.pathname === subItem.path ? "text-blue-700 dark:text-[#F7F8F8]" : "text-slate-600 dark:text-[#D0D6E0] dark:hover:text-[#F7F8F8]"}`}
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
            <div className={`absolute bottom-full mb-2 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-[#1F2226] dark:bg-[#121314] dark:shadow-black/40 ${isDesktopCollapsed ? "left-0 w-48" : "left-0 right-0 mx-2 sm:mx-4"}`}>
              <div className="flex flex-col">
                <div
                  className="cursor-pointer px-2.5 py-2.5 transition-colors duration-200 hover:bg-slate-50 dark:hover:bg-[#1A1C20] dark:hover:text-white sm:px-3.5"
                  onClick={() => {
                    navigate("/settings");
                    setIsProfileMenuOpen(false);
                  }}
                >
                  <span className="text-sm font-medium text-slate-900 dark:text-[#F7F8F8]">
                    Settings
                  </span>
                </div>
                <hr className="my-1 border-slate-100 dark:border-[#1F2226]" />
                <div
                  className="cursor-pointer px-2.5 py-2.5 transition-colors duration-200 hover:bg-red-50 dark:hover:bg-red-950/30 sm:px-3.5"
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
            className={`group m-2 flex cursor-pointer items-center rounded-xl border border-slate-200 bg-slate-50 py-2 transition-all duration-200 hover:border-blue-200 hover:bg-white hover:shadow-sm dark:border-[#1F2226] dark:bg-[#121314] dark:hover:border-white/30 dark:hover:bg-[#1A1C20] dark:hover:text-white sm:m-3 sm:py-2.5 ${isDesktopCollapsed ? "justify-center px-1" : "gap-2 px-2 sm:gap-2.5 sm:px-2.5"}`}
          >
            <div className={`flex flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 p-0.5 ${isDesktopCollapsed ? "h-8 w-8" : "h-8 w-8 sm:h-10 sm:w-10"}`}>
              <img
                src={profilePhoto}
                alt=""
                className="h-full w-full rounded-full object-cover"
              />
            </div>
            <div className={`flex min-w-0 flex-1 flex-col ${isDesktopCollapsed ? "hidden" : ""}`}>
              <div className="truncate text-xs font-semibold text-slate-950 dark:text-[#F7F8F8] sm:text-sm">
                {profileName}
              </div>
              <div className="truncate text-[10px] text-slate-500 dark:text-[#8A8F98] sm:text-xs">
                {profileRole}
              </div>
            </div>

            {/* Theme Toggle Switch */}
            <div
              className={`flex-shrink-0 ${isDesktopCollapsed ? "hidden" : ""}`}
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
      {createPortal(
        <button
          type="button"
          onClick={() => {
            setExpandedGroups({});
            onToggleCollapse();
          }}
          className="fixed top-[38px] z-[45] hidden h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-sm transition-colors hover:bg-slate-100 hover:text-slate-900 dark:border-[#1F2226] dark:bg-[#121314] dark:text-[#8A8F98] dark:hover:bg-[#1A1C20] dark:hover:text-[#F7F8F8] lg:flex"
          style={{ left: isDesktopCollapsed ? "72px" : "264px" }}
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {isDesktopCollapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5l-7 7 7 7" />
            )}
          </svg>
        </button>,
        document.body,
      )}
    </>
  );
};
