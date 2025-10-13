import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ListChecks, // Icon for Activity Type
  Activity, // Icon for Activity
  Clock, // Icon for Stop Time
  AlertTriangle, // Icon for Trouble Item
  ChevronRight,
  Sun,
  Moon,
  Bell,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Wrench, // For header title icon (representing maintenance activity)
  ChevronDown,
  ToolCase,
} from "lucide-react";
import Sidebar from "../Sidebar"; // Assuming Sidebar is in ../../component/Sidebar
import PageHeader from "../PageHeader";
import { useAuth } from "../../routes/AuthContext"; // Import useAuth for user context

const MaintenanceActivitySelection: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // Get user for profile display

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 768); // Keep sidebar open on desktop by default
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  // Handle window resize for mobile view and sidebar
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false); // Close sidebar on mobile
      } else {
        setSidebarOpen(true); // Open sidebar on desktop
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle clicks outside notification/profile popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Handle dark mode toggle
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  const handleCardClick = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      {/* Sidebar component */}
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header section */}
         <PageHeader mainTitle="Maintenance Activity" mainTitleHighlight="Management" description="blablablabl" icon={<ToolCase />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Maintenance Activity Management</h1>
            <p className="text-gray-600 mt-2">Select a category to manage maintenance activities.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto py-8">
            {/* Activity Type Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/maintenanceactivity/activitytypes")}
            >
              <ListChecks size={64} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity Type</h3>
              <p className="text-gray-700 mb-4">Define and manage different types of maintenance activities.</p>
              <span className="text-blue-600 font-semibold flex items-center">
                Go to Activity Types <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Activity Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/maintenanceactivity/activity")}
            >
              <Activity size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Activity</h3>
              <p className="text-gray-700 mb-4">Manage the details of individual maintenance activities.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Go to Activities <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Stop Time Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-purple-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/maintenanceactivity/stoptimes")}
            >
              <Clock size={64} className="text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Stop Time</h3>
              <p className="text-gray-700 mb-4">Record and analyze machine downtime and stop times.</p>
              <span className="text-purple-600 font-semibold flex items-center">
                Go to Stop Time <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Trouble Item Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/maintenanceactivity/troubleitem")}
            >
              <AlertTriangle size={64} className="text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Trouble Item</h3>
              <p className="text-gray-700 mb-4">Manage and categorize common trouble items or issues.</p>
              <span className="text-orange-600 font-semibold flex items-center">
                Go to Trouble Items <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default MaintenanceActivitySelection;
