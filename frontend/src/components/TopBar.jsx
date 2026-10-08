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
    <div className="sticky top-0 z-30 h-14 border-b border-slate-200/80 bg-white/90 px-3.5 backdrop-blur-xl transition-colors duration-200 dark:border-[#1F2226] dark:bg-[#090A0B]/90 sm:px-5">
      {/* Left side — hamburger on mobile/tablet + breadcrumbs placeholder */}
      <div className="flex h-full items-center gap-2.5">
        <div className="flex items-center gap-2.5 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:border-transparent dark:bg-transparent dark:text-[#D0D6E0] dark:hover:border-white/8 dark:hover:bg-[#1A1C20]"
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
      <div className="flex items-center gap-2.5">
        {/* Notification Button */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-slate-200 hover:bg-slate-100 hover:text-slate-950 dark:border-transparent dark:bg-transparent dark:text-[#D0D6E0] dark:hover:border-white/8 dark:hover:bg-[#1A1C20] dark:hover:text-white"
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
            <div className="absolute right-0 z-50 mt-3 w-80 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-[#1F2226] dark:bg-[#121314] dark:shadow-black/40">
              <div className="border-b border-slate-100 px-3.5 py-2.5 dark:border-[#1F2226]">
                <h3 className="text-sm font-semibold text-slate-950 dark:text-[#F7F8F8]">
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="cursor-pointer p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1A1C20]/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F7F8F8]">
                    New order received
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8F98]">
                    2 minutes ago
                  </p>
                </div>
                <div className="cursor-pointer p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1A1C20]/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F7F8F8]">
                    Inventory low alert
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8F98]">
                    1 hour ago
                  </p>
                </div>
                <div className="cursor-pointer p-3.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1A1C20]/70">
                  <p className="text-sm font-medium text-slate-900 dark:text-[#F7F8F8]">
                    Payment processed successfully
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-[#8A8F98]">
                    3 hours ago
                  </p>
                </div>
              </div>
              <div className="border-t border-slate-100 p-2.5 text-center dark:border-[#1F2226]">
                <button className="rounded-full bg-transparent px-2.5 py-1 text-sm font-semibold text-blue-600 hover:text-blue-700 dark:bg-transparent dark:text-[#D0D6E0] dark:hover:bg-[#1A1C20] dark:hover:text-white">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="group rounded-lg border border-transparent p-2 text-slate-600 transition-all duration-200 hover:border-red-100 hover:bg-red-50 hover:text-red-600 dark:border-transparent dark:bg-transparent dark:text-[#D0D6E0] dark:hover:border-red-900/50 dark:hover:bg-red-950/30 dark:hover:text-red-400"
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
