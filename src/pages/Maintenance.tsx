import React, { useState, useEffect } from "react";
import {
  FiCalendar,
  FiClock,
  FiUser,
  FiSettings,
  FiCheckCircle,
  FiAlertTriangle,
  FiArchive,
  FiFilter,
  FiSearch,
  FiPlus,
  FiDownload,
  FiPrinter,
  FiChevronLeft,
  FiChevronRight,
  FiChevronDown,
  FiChevronUp,
  FiX,
  FiHome,
  FiPackage,
  FiClipboard,
  FiDatabase,
  FiBarChart2,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type MaintenanceType = "preventive" | "corrective" | "predictive";
type MaintenanceStatus = "completed" | "pending" | "in-progress" | "overdue";

interface MaintenanceLog {
  id: string;
  assetId: string;
  assetName: string;
  type: MaintenanceType;
  description: string;
  technician: string;
  scheduledDate: string;
  completedDate: string;
  status: MaintenanceStatus;
  duration: string;
  cost: number;
  partsUsed: {
    partId: string;
    partName: string;
    quantity: number;
  }[];
  notes: string;
}

const MaintenanceLogBook: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<MaintenanceType | "all">("all");
  const [statusFilter, setStatusFilter] = useState<MaintenanceStatus | "all">("all");
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: "",
    end: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const [logs, setLogs] = useState<MaintenanceLog[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [logsPerPage] = useState(10);
  const [showAddLogModal, setShowAddLogModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState<MaintenanceLog | null>(null);

  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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
    // Simulate API call to fetch maintenance logs
    const fetchLogs = async () => {
      // Mock data based on the CMMS design document
      const mockLogs: MaintenanceLog[] = [
        {
          id: "ML-001",
          assetId: "AST-001",
          assetName: "HVAC System",
          type: "preventive",
          description: "Quarterly filter replacement and system check",
          technician: "Budi Santoso",
          scheduledDate: "2023-05-15",
          completedDate: "2023-05-15",
          status: "completed",
          duration: "2 hours",
          cost: 150,
          partsUsed: [
            { partId: "SP-001", partName: "Air Filter", quantity: 2 },
            { partId: "SP-002", partName: "Coolant", quantity: 1 },
          ],
          notes: "System operating normally after maintenance",
        },
        // Add more mock logs as needed
      ];
      setLogs(mockLogs);
    };

    fetchLogs();
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const filteredLogs = logs.filter((log) => {
    const matchesSearch = log.assetName.toLowerCase().includes(searchQuery.toLowerCase()) || log.assetId.toLowerCase().includes(searchQuery.toLowerCase()) || log.technician.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || log.type === typeFilter;
    const matchesStatus = statusFilter === "all" || log.status === statusFilter;
    const matchesDateRange = (!dateRange.start || log.scheduledDate >= dateRange.start) && (!dateRange.end || log.scheduledDate <= dateRange.end);

    return matchesSearch && matchesType && matchesStatus && matchesDateRange;
  });

  const indexOfLastLog = currentPage * logsPerPage;
  const indexOfFirstLog = indexOfLastLog - logsPerPage;
  const currentLogs = filteredLogs.slice(indexOfFirstLog, indexOfLastLog);
  const totalPages = Math.ceil(filteredLogs.length / logsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getStatusColor = (status: MaintenanceStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "in-progress":
        return "bg-blue-100 text-blue-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: MaintenanceType) => {
    switch (type) {
      case "preventive":
        return <FiCheckCircle className="text-green-500" />;
      case "corrective":
        return <FiSettings className="text-blue-500" />;
      case "predictive":
        return <FiAlertTriangle className="text-yellow-500" />;
      default:
        return <FiArchive className="text-gray-500" />;
    }
  };

  const NavItem: React.FC<{ icon: React.ReactNode; text: string; to: string }> = ({ icon, text, to }) => {
    const active = location.pathname === to;
    return (
      <motion.button
        onClick={() => navigate(to)}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
          ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
        `}
      >
        <span className="text-xl">{icon}</span>
        {sidebarOpen && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-3 text-base">
            {text}
          </motion.span>
        )}
      </motion.button>
    );
  };

  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl mx-auto p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-200 dark:border-gray-700">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h3>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-2xl">
              <FiX />
            </motion.button>
          </div>
          <div>{children}</div>
        </motion.div>
      </motion.div>
    );
  };

  const MaintenanceLogDetail: React.FC<{ log: MaintenanceLog }> = ({ log }) => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Asset ID</p>
            <p className="text-lg font-semibold dark:text-white">{log.assetId}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Asset Name</p>
            <p className="text-lg font-semibold dark:text-white">{log.assetName}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Maintenance Type</p>
            <div className="flex items-center mt-1">
              {getTypeIcon(log.type)}
              <span className="ml-2 font-medium capitalize dark:text-white">{log.type}</span>
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status</p>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(log.status)}`}>{log.status.replace("-", " ")}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Technician</p>
            <p className="flex items-center mt-1 dark:text-white">
              <FiUser className="mr-2" /> {log.technician}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled Date</p>
            <p className="flex items-center mt-1 dark:text-white">
              <FiCalendar className="mr-2" /> {log.scheduledDate}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed Date</p>
            <p className="flex items-center mt-1 dark:text-white">
              <FiCalendar className="mr-2" /> {log.completedDate || "N/A"}
            </p>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Description</p>
          <p className="mt-1 dark:text-white">{log.description}</p>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Parts Used</p>
          <div className="mt-2 space-y-2">
            {log.partsUsed.length > 0 ? (
              log.partsUsed.map((part) => (
                <div key={part.partId} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div>
                    <p className="font-medium dark:text-white">{part.partName}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{part.partId}</p>
                  </div>
                  <span className="font-medium dark:text-white">{part.quantity} pcs</span>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400">No parts used</p>
            )}
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Notes</p>
          <p className="mt-1 dark:text-white">{log.notes || "No notes available"}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration</p>
            <p className="flex items-center mt-1 dark:text-white">
              <FiClock className="mr-2" /> {log.duration}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Cost</p>
            <p className="mt-1 dark:text-white">${log.cost.toFixed(2)}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900 dark:bg-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
            }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
              {sidebarOpen ? (
                <div className="flex items-center space-x-3">
                  <img src={logoWida} alt="Logo" className="h-10 w-auto" />
                  <h1 className="text-sm font-bold text-blue-600 dark:text-blue-400">CMMS</h1>
                </div>
              ) : (
                <img src={logoWida} alt="Logo" className="h-6 w-auto" />
              )}
              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                {sidebarOpen ? <FiChevronLeft /> : <FiChevronRight />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" />
              <NavItem icon={<FiArchive />} text="Maintenance Log" to="/maintenance-log" />
              <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" />
              <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" />
              <NavItem icon={<FiSettings />} text="Settings" to="/settings" />
            </nav>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center space-x-3">
                <img src={`https://ui-avatars.com/api/?name=${user?.name || "Admin"}&background=0078D7&color=fff`} alt="User" className="w-10 h-10 rounded-full border-2 border-blue-500 dark:border-blue-400" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{user?.name || "Admin"}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Technician</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                <FiChevronRight />
              </motion.button>
            )}
            <FiArchive className="text-2xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">Maintenance Log Book</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
              {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
            </motion.button>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Maintenance History</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">Track and manage all maintenance activities in your organization</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddLogModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FiPlus />
                <span>Add Log</span>
              </motion.button>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FiFilter />
                <span>Filters</span>
                {showFilters ? <FiChevronUp /> : <FiChevronDown />}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-white px-4 py-2 rounded-lg transition-all duration-200"
              >
                <FiDownload />
                <span>Export</span>
              </motion.button>
            </div>
          </motion.div>

          {/* Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="mb-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 border border-gray-200 dark:border-gray-700"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Search</label>
                    <div className="relative">
                      <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search logs..."
                        className="pl-10 w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Type</label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as MaintenanceType | "all")}
                    >
                      <option value="all">All Types</option>
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="predictive">Predictive</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                    <select
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as MaintenanceStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="completed">Completed</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Maintenance Log Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Technician</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Scheduled Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentLogs.length > 0 ? (
                    currentLogs.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(59, 130, 246, 0.05)" }}
                        className="hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{log.assetName}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{log.assetId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getTypeIcon(log.type)}
                            <span className="ml-2 text-sm text-gray-900 dark:text-white capitalize">{log.type}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{log.technician}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 dark:text-white">{log.scheduledDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(log.status)}`}>{log.status.replace("-", " ")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => {
                              setSelectedLog(log);
                              setShowDetailModal(true);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 mr-3"
                          >
                            View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
                        No maintenance logs found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {filteredLogs.length > logsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300 mb-4 sm:mb-0">
                Showing <span className="font-medium">{indexOfFirstLog + 1}</span> to <span className="font-medium">{Math.min(indexOfLastLog, filteredLogs.length)}</span> of <span className="font-medium">{filteredLogs.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-md transition-colors ${
                      currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add Maintenance Log Modal */}
      <Modal isOpen={showAddLogModal} onClose={() => setShowAddLogModal(false)} title="Add Maintenance Log">
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset ID</label>
              <input type="text" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Asset Name</label>
              <input type="text" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Maintenance Type</label>
            <select className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white">
              <option value="preventive">Preventive</option>
              <option value="corrective">Corrective</option>
              <option value="predictive">Predictive</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
            <textarea rows={3} className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Scheduled Date</label>
              <input type="date" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Technician</label>
              <input type="text" className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white" />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowAddLogModal(false)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Save Log
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Maintenance Log Detail Modal */}
      {selectedLog && (
        <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Maintenance Log Details">
          <MaintenanceLogDetail log={selectedLog} />
          <div className="flex justify-end mt-6">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowDetailModal(false)} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Close
            </motion.button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default MaintenanceLogBook;
