import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Icon } from "./Icons";
import { logoutUser } from "../utils/logout";

export const TopBar = ({ onMenuClick }) => {
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleLogout = async () => {
    await logoutUser({ navigate });
  };

  return (
    <div className="sticky top-0 z-30 h-16 border-b border-slate-200/80 bg-white/85 px-4 shadow-sm shadow-slate-200/50 backdrop-blur-xl transition-colors duration-200 dark:border-slate-800/80 dark:bg-[#111318]/85 dark:shadow-black/20 sm:px-6">
      {/* Left side — hamburger on mobile/tablet + breadcrumbs placeholder */}
      <div className="flex h-full items-center gap-3">
        <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
          aria-label="Open sidebar"
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
        {/* Page title or breadcrumbs can go here */}
      </div>

      {/* Right side - Notification and Logout buttons */}
      <div className="flex items-center gap-3">
        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:border-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
            title="Notifications"
          >
            <Icon
              name="notification"
              className="h-5 w-5"
            />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-[#171a21] dark:shadow-black/40">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-white">
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    New order received
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    2 minutes ago
                  </p>
                </div>
                <div className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Inventory low alert
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    1 hour ago
                  </p>
                </div>
                <div className="cursor-pointer p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    Payment processed successfully
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    3 hours ago
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 p-3 text-center dark:border-slate-800">
                <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:text-slate-300 dark:hover:border-red-900/40 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          title="Logout"
        >
          <Icon
            name="logout"
            className="h-5 w-5 transition-colors duration-200"
          />
        </button>
      </div>
      </div>
    </div>
  );
};
