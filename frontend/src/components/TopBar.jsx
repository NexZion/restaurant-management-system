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
    <div className="h-16 bg-white dark:bg-[#18181B] border-b border-gray-300 dark:border-gray-800 flex items-center px-6 transition-colors duration-200">
      {/* Left side — hamburger on mobile/tablet + breadcrumbs placeholder */}
      <div className="flex items-center gap-3 flex-1">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
          aria-label="Open sidebar"
        >
          <svg
            className="w-5 h-5 text-gray-600 dark:text-gray-300"
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
            className="relative p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
            title="Notifications"
          >
            <Icon
              name="notification"
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
            />
            {/* Notification Badge */}
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-[#212125] rounded-lg shadow-lg border border-gray-300 dark:border-gray-700 z-50">
              <div className="p-4 border-b border-gray-300 dark:border-gray-700">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Notifications
                </h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white">
                    New order received
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    2 minutes ago
                  </p>
                </div>
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Inventory low alert
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    1 hour ago
                  </p>
                </div>
                <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors">
                  <p className="text-sm text-gray-900 dark:text-white">
                    Payment processed successfully
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    3 hours ago
                  </p>
                </div>
              </div>
              <div className="p-3 border-t border-gray-300 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200 group"
          title="Logout"
        >
          <Icon
            name="logout"
            className="w-6 h-6 text-gray-600 dark:text-gray-300 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors duration-200"
          />
        </button>
      </div>
    </div>
  );
};
