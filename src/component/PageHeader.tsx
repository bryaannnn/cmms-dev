// src/component/PageHeader.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext"; // Assuming AuthContext is in this path

import {
  ChevronRight,
  Bell,
  ChevronDown,
  User as UserIcon, // Renamed to avoid conflict with User interface
  Settings,
  LogOut,
  Sun,
  Moon,
  AlertTriangle,
  Calendar,
} from "lucide-react";

// Interface for notification items
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

// Static notification data for demonstration
const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Peringatan Mesin A",
    description: "Suhu mesin A melebihi batas normal.",
    date: "Today, 10:00 AM",
    icon: <AlertTriangle className="text-red-500" />,
  },
  {
    id: 2,
    title: "Jadwal Perawatan Mendatang",
    description: "Perawatan rutin untuk Mesin B akan dilakukan besok.",
    date: "Yesterday, 03:00 PM",
    icon: <Calendar className="text-blue-500" />,
  },
];

// Props interface for the PageHeader component
interface PageHeaderProps {
  mainTitle: string; // The main part of the page title (e.g., "Machine History")
  mainTitleHighlight: string; // The highlighted part of the page title (e.g., "Records")
  description: string; // The descriptive paragraph below the title
  // Changed icon type to be more specific, expecting an SVG element from Lucide
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  isMobile: boolean; // Boolean to check if the current view is mobile
  toggleSidebar: () => void; // Function to toggle the sidebar visibility
}

const PageHeader: React.FC<PageHeaderProps> = ({ mainTitle, mainTitleHighlight, description, icon, isMobile, toggleSidebar }) => {
  // Access user authentication context
  const { user, logout } = useAuth();
  // Hook for programmatic navigation
  const navigate = useNavigate();

  // State for controlling notification popup visibility
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  // State for controlling user profile menu visibility
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  // State for controlling dark mode (managed internally by PageHeader)
  const [darkMode, setDarkMode] = useState(false);

  // Refs for detecting clicks outside notification and profile popups
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Effect to handle clicks outside popups to close them
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close notifications if click is outside its ref
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      // Close profile menu if click is outside its ref
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    // Add event listener when component mounts
    document.addEventListener("mousedown", handleClickOutside);
    // Clean up event listener when component unmounts
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []); // Empty dependency array means this effect runs once on mount and clean up on unmount

  // Safely get the existing className from the icon's props
  // Now, icon.props is already typed as React.SVGProps<SVGSVGElement>, so direct access is safe.
  const existingIconClassName = icon.props.className || "";

  return (
    <>
      {/* Main header section */}
      <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        {/* Left section: Sidebar toggle, icon, and page title */}
        <div className="flex items-center space-x-4">
          {/* Mobile sidebar toggle button */}
          {isMobile && (
            <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
              <ChevronRight className="text-xl" />
            </motion.button>
          )}
          {/* Page icon, dynamically styled */}
          {/* Clones the icon element and adds/merges className for consistent styling */}
          {React.cloneElement(icon, { className: `text-xl text-blue-600 ${existingIconClassName}` })}
          {/* Main page title */}
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{mainTitle}</h2>
        </div>

        {/* Right section: Dark mode toggle, notifications, and user profile */}
        <div className="flex items-center space-x-3 relative">
          {/* Dark mode toggle button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
          </motion.button>

          {/* Notifications dropdown */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="text-xl" />
              {/* Notification indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
            </motion.button>

            {/* Notification popup content */}
            <AnimatePresence>
              {showNotificationsPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                          {notif.icon && <div className="flex-shrink-0 mr-3">{notif.icon}</div>}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationsPopup(false);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
            >
              {/* User avatar */}
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-blue-200 object-cover"
              />
              {/* User name */}
              <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
              {/* Dropdown arrow */}
              <ChevronDown className="text-gray-500 text-base" />
            </motion.button>

            {/* User profile menu content */}
            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                >
                  <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Signed in as</div>
                  <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{user?.name || "Guest User"}</div>
                  <button
                    onClick={() => {
                      navigate("/profile");
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                  >
                    <UserIcon size={16} className="mr-2" /> My Profile
                  </button>
                  <button
                    onClick={() => {
                      navigate("/settings");
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                  >
                    <Settings size={16} className="mr-2" /> Settings
                  </button>
                  <hr className="my-1 border-gray-100" />
                  <button
                    onClick={() => {
                      logout(); // Use logout from useAuth
                      navigate("/login"); // Redirect to login after logout
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      
    </>
  );
};

export default PageHeader;
