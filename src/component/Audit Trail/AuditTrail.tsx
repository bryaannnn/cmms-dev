import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, AuditLog, User } from "../../routes/AuthContext"; // Assuming AuditLog and User are exported from AuthContext
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../component/Sidebar";
import {
  Clipboard,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Info,
  Moon,
  Sun,
  UserIcon,
  Clock, // For timestamp
  User as UserLucide, // For user icon
  Activity, // For action performed
  MapPin, // For location/IP/device
  AlertTriangle, // Added for error state
} from "lucide-react";

// Moved useDebounce definition here to resolve "Cannot find module" error
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <motion.button
      onClick={() => navigate(to)}
      whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left flex items-center py-3 px-4 rounded-xl transition-all duration-200 ease-in-out group
        ${active ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-blue-700"}
      `}
    >
      <span className={`text-xl transition-colors duration-200 ${active ? "text-white" : "text-blue-500 group-hover:text-blue-700"}`}>{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="ml-4 text-base font-medium whitespace-nowrap">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

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
    title: "New Audit Entry",
    description: "User 'admin' created a new asset.",
    date: "Today, 10:00 AM",
    icon: <Activity className="text-blue-500" />,
  },
  {
    id: 2,
    title: "System Update",
    description: "Audit trail system updated to latest version.",
    date: "Yesterday, 03:00 PM",
    icon: <Info className="text-green-500" />,
  },
];

const AuditTrail: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const { user, getAuditTrail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>({ key: "changed_at", direction: "descending" });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const loadAuditTrail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditTrail();
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit trail:", err);
      setError("Failed to load audit trail data. Please try again.");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [getAuditTrail]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getDisplayValue = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return value.name || value.toString();
    }
    return value?.toString() || "";
  };

  const filteredAndSortedLogs = React.useMemo(() => {
    // Ensure auditLogs is an array before spreading
    let currentLogs = [...(auditLogs || [])];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase().trim();
      currentLogs = currentLogs.filter((log) => {
        // Explicitly convert to string to prevent .toLowerCase() on undefined
        const userMatch = (log.changed_by || "").toLowerCase().includes(lowerCaseQuery);
        const actionMatch = (log.action || "").toLowerCase().includes(lowerCaseQuery);
        // Ensure JSON.stringify output is treated as a string before .toLowerCase()
        const detailsMatch = (JSON.stringify(log.mhs_details || {}) || "").toLowerCase().includes(lowerCaseQuery);
        const oldDataMatch = (JSON.stringify(log.old_data_snapshot || {}) || "").toLowerCase().includes(lowerCaseQuery);
        const newDataMatch = (JSON.stringify(log.new_data_snapshot || {}) || "").toLowerCase().includes(lowerCaseQuery);

        return userMatch || actionMatch || detailsMatch || oldDataMatch || newDataMatch;
      });
    }

    // Apply sorting
    if (sortConfig !== null) {
      currentLogs.sort((a, b) => {
        const aValue = getDisplayValue((a as Record<string, any>)[sortConfig.key]);
        const bValue = getDisplayValue((b as Record<string, any>)[sortConfig.key]);

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return currentLogs;
  }, [auditLogs, debouncedSearchQuery, sortConfig]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAndSortedLogs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAndSortedLogs.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString(); // Formats to "MM/DD/YYYY, HH:MM:SS AM/PM"
    } catch (e) {
      return timestamp; // Return original if invalid date
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Audit Trail</h2>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Audit <span className="text-blue-600">Trail</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm max-w-xl">Track all user activities and system changes for enhanced security and accountability.</p>
          </motion.div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search audit logs"
                />
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading audit trail data...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <AlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
              <p className="text-red-700 text-base font-medium">{error}</p>
              <button onClick={loadAuditTrail} className="mt-5 px-5 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm">
                Retry
              </button>
            </div>
          ) : filteredAndSortedLogs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">{debouncedSearchQuery ? "No audit entries found matching your search." : "No audit entries available."}</p>
              {debouncedSearchQuery && (
                <button onClick={() => setSearchQuery("")} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("changed_at")}>
                        <div className="flex items-center">
                          <Clock className="mr-2 text-sm" /> Timestamp
                          {sortConfig?.key === "changed_at" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("changed_by")}>
                        <div className="flex items-center">
                          <UserLucide className="mr-2 text-sm" /> User
                          {sortConfig?.key === "changed_by" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("action")}>
                        <div className="flex items-center">
                          <Activity className="mr-2 text-sm" /> Action Performed
                          {sortConfig?.key === "action" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      {/* Optional: Device/IP/Location column if available in AuditLog */}
                      {/* <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                        <div className="flex items-center">
                          <MapPin className="mr-2 text-sm" /> Device/Location
                        </div>
                      </th> */}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.map((log) => (
                      <motion.tr
                        key={log.history_id} // Assuming history_id is unique
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatTimestamp(log.changed_at)}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.changed_by || "N/A"}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900">{log.action || "N/A"}</div>
                          {/* Display additional details if available and relevant */}
                          {log.mhs_details && <div className="text-xs text-gray-600 truncate max-w-xs">Details: {JSON.stringify(log.mhs_details)}</div>}
                          {(log.old_data_snapshot || log.new_data_snapshot) && (
                            <div className="text-xs text-gray-600 truncate max-w-xs">
                              Changes: {log.old_running_hour !== undefined && log.new_running_hour !== undefined && `Running Hour: ${log.old_running_hour} -> ${log.new_running_hour}`}
                              {log.old_kegiatan_id !== undefined && log.new_kegiatan_id !== undefined && ` Kegiatan ID: ${log.old_kegiatan_id} -> ${log.new_kegiatan_id}`}
                            </div>
                          )}
                        </td>
                        {/* Optional: Device/IP/Location column data */}
                        {/* <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">N/A</div>
                        </td> */}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {filteredAndSortedLogs.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredAndSortedLogs.length)}</span> of{" "}
                <span className="font-semibold">{filteredAndSortedLogs.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Previous page"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-3.5 py-2 rounded-md transition-colors duration-200 shadow-sm font-medium text-sm
                      ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
                    `}
                    aria-label={`Go to page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Next page"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AuditTrail;
