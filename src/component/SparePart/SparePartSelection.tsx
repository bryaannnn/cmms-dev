import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings, // Icon for General Settings
  Type, // Icon for Spare Part Type
  Boxes, // Icon for Spare Part Group
  ToolCase, // Icon for Spare Part Maintenance
  ChevronRight,
  Sun,
  Moon,
  Bell,
  X,
  User as UserIcon,
  LogOut,
  Package, // For header title icon (representing spare parts)
  ChevronDown,
  Wrench,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Sidebar from "../../component/Sidebar"; // Assuming Sidebar is in ../../component/Sidebar
import { useAuth } from "../../routes/AuthContext"; // Import useAuth for user context

const SparePartSelection: React.FC = () => {
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
        <PageHeader mainTitle="Spare Paarts" mainTitleHighlight="Groups" description="Manage service groups used across the service management system." icon={<Wrench />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Spare Part Management</h1>
            <p className="text-gray-600 mt-2">Select a category to manage your spare parts inventory and settings.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto py-8">
            {/* General Settings Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-blue-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/sparepart/generalsettings")}
            >
              <Settings size={64} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">General Settings</h3>
              <p className="text-gray-700 mb-4">Configure overall settings for spare part management.</p>
              <span className="text-blue-600 font-semibold flex items-center">
                Go to Settings <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Spare Part Type Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-green-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/sparepart/spareparttype")}
            >
              <Type size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Spare Part Type</h3>
              <p className="text-gray-700 mb-4">Define and manage different types of spare parts.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Go to Types <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Spare Part Group Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-purple-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/sparepart/sparepartgroup")}
            >
              <Boxes size={64} className="text-purple-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Spare Part Group</h3>
              <p className="text-gray-700 mb-4">Categorize spare parts into logical groups.</p>
              <span className="text-purple-600 font-semibold flex items-center">
                Go to Groups <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Spare Part Maintenance Card */}
            <motion.div
              className="w-full bg-white rounded-2xl shadow-xl p-8 border border-orange-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/sparepart/sparepartmaintenance")}
            >
              <ToolCase size={64} className="text-orange-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Spare Part Maintenance</h3>
              <p className="text-gray-700 mb-4">Manage maintenance records related to spare parts.</p>
              <span className="text-orange-600 font-semibold flex items-center">
                Go to Maintenance <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SparePartSelection;
