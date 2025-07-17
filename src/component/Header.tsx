import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, MachineHistoryRecord } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useDebouncedCallback } from "use-debounce";
import Sidebar from "../component/Sidebar";
import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Users,
  BarChart2,
  Database,
  Clipboard,
  Filter,
  Package,
  ChevronLeft,
  Home,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
  Settings,
  Bell,
  Edit,
  Eye,
  Clock,
  Calendar,
  Trash2,
  Key,
  Info,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

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

const Header: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        <div className="flex items-center space-x-4">
          {isMobile && (
            <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
              <ChevronRight className="text-xl" />
            </motion.button>
          )}
          <Clipboard className="text-xl text-blue-600" />
          <h2 className="text-lg md:text-xl font-bold text-gray-900">Machine History</h2>
        </div>

        <div className="flex items-center space-x-3 relative">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
          </motion.button>

          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="text-xl" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
            </motion.button>

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

          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-blue-200 object-cover"
              />
              <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
              <ChevronDown className="text-gray-500 text-base" />
            </motion.button>

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
                      navigate("/logout");
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
    </div>
  );
};

export default Header;
