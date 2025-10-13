import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Boxes, // Icon for Assets Group
  Database, // Icon for Assets Data
  ChevronRight,
  Sun,
  Moon,
  Bell,
  X,
  User as UserIcon,
  Settings,
  LogOut,
  Package, // For header title icon (representing assets)
  ChevronDown,
} from "lucide-react";
import PageHeader from "../PageHeader";
import Sidebar from "../../component/Sidebar"; // Assuming Sidebar is in ../../component/Sidebar
import { useAuth } from "../../routes/AuthContext"; // Import useAuth for user context

const AssetsSelection: React.FC = () => {
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
        <PageHeader mainTitle="Assets" mainTitleHighlight="Trail" description="Manage activities and their configurations within the system." icon={<Package />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Asset Management</h1>
            <p className="text-gray-600 mt-2">Select a category to manage your assets.</p>
          </motion.div>

          <div className="flex flex-col md:flex-row justify-center items-center gap-6 max-w-4xl mx-auto py-8">
            {/* Assets Group Card */}
            <motion.div
              className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-blue-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/assets/assetsgroup")}
            >
              <Boxes size={64} className="text-blue-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Assets Group</h3>
              <p className="text-gray-700 mb-4">Organize your assets into logical groups for better management.</p>
              <span className="text-blue-600 font-semibold flex items-center">
                Go to Assets Group <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>

            {/* Assets Data Card */}
            <motion.div
              className="w-full md:w-1/2 bg-white rounded-2xl shadow-xl p-8 border border-green-100 cursor-pointer flex flex-col items-center text-center transition-all duration-300 hover:scale-105 hover:shadow-2xl"
              whileHover={{ y: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleCardClick("/assets/assetsdata")}
            >
              <Database size={64} className="text-green-600 mb-4" />
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Assets Data</h3>
              <p className="text-gray-700 mb-4">View and manage detailed information about your individual assets.</p>
              <span className="text-green-600 font-semibold flex items-center">
                Go to Assets Data <ChevronRight size={18} className="ml-1" />
              </span>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AssetsSelection;
