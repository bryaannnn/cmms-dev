import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Computer, // Icon for IT
  Hammer, // Icon for TD
  ChevronRight,
  Sun,
  Moon,
  Bell,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Users,
  Clipboard, // For header title icon
  ChevronDown,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Sidebar from "../../component/Sidebar"; // Assuming Sidebar is in ../../component/Sidebar
import { useAuth } from "../../routes/AuthContext"; // Import useAuth for user context

const GanbaSelection: React.FC = () => {
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
        <PageHeader mainTitle="Select Ganba Menu" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Clipboard />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Select Ganba Menu</h1>
            <p className="text-gray-600 mt-2">Choose the menu you wish to manage other for ganba action.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 max-w-4xl mx-auto py-8">
            {/* SO Configuration */}
            <motion.div
              className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-blue-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/ganba/soconfiguration")}
            >
              <Users size={64} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">SO Configuration</h3>
              <p className="text-gray-700 mb-4">Manage structure organization templates.</p>
              <span className="text-blue-600 font-semibold flex items-center">
                Go to SO Configuration <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div> 

            {/* Daily Activity */}
            <motion.div
              className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-green-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/ganba/dailyactivity")}
            >
              <Hammer size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Daily Activity</h3>
              <p className="text-gray-700 mb-4">Handle report daily tasks.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Go to Daily Activity
                <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Area 5S */}
            <motion.div
              className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-green-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/ganba/ganbaarea")}
            >
              <Hammer size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Ganba Area</h3>
              <p className="text-gray-700 mb-4">Handle Area for 5S.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Go to Ganba Area
                <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GanbaSelection;
