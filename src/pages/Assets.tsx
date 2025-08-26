import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, PermissionName, ERPRecord } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../routes/AuthContext";
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
  Sun,
  Moon,
  Settings,
  Bell,
  Eye,
  Key,
  User as UserIcon,
  Edit, // Added for Edit button
  Trash2, // Added for Delete button
} from "lucide-react";

// Re-defining Asset types for clarity, though they might be in AuthContext
type AssetStatus = "running" | "maintenance" | "breakdown" | "idle";
type AssetType = "mechanical" | "electrical" | "vehicle" | "building";
interface Asset {
  id: string;
  name: string;
  type: AssetType;
  make: string;
  model: string;
  status: AssetStatus;
  lastMaintenance: string;
  nextMaintenance: string;
  location: string;
  workOrders: number;
  health: number;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

// NavItem component (unchanged, assuming it's consistent)
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

// StatCard component (unchanged, assuming it's consistent)
const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
      className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
    >
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{icon}</div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last month</p>
    </motion.div>
  );
};

// Modal component (unchanged, assuming it's consistent)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <X size={24} />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

// AssetDetailsForm component (unchanged, assuming it's consistent)
interface AssetDetailsFormProps {
  asset: Asset;
  isEditing: boolean;
  onSave: (asset: Asset) => void;
  onCancel: () => void;
}
const AssetDetailsForm: React.FC<AssetDetailsFormProps> = ({ asset, isEditing, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Asset>(asset);
  useEffect(() => {
    setFormData(asset);
  }, [asset]);
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleHealthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value, 10);
    setFormData((prev) => ({ ...prev, health: isNaN(value) ? 0 : Math.max(0, Math.min(100, value)) }));
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
          Asset ID
        </label>
        <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
      </div>
      <div>
        <label htmlFor="detail-name" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          type="text"
          id="detail-name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-type" className="block text-sm font-medium text-gray-700">
          Asset Type
        </label>
        <select
          id="detail-type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          disabled={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        >
          <option value="mechanical">Mechanical</option>
          <option value="electrical">Electrical</option>
          <option value="vehicle">Vehicle</option>
          <option value="building">Building</option>
        </select>
      </div>
      <div>
        <label htmlFor="detail-make" className="block text-sm font-medium text-gray-700">
          Make
        </label>
        <input
          type="text"
          id="detail-make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-model" className="block text-sm font-medium text-gray-700">
          Model
        </label>
        <input
          type="text"
          id="detail-model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-status" className="block text-sm font-medium text-gray-700">
          Status
        </label>
        <select
          id="detail-status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          disabled={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        >
          <option value="running">Running</option>
          <option value="maintenance">Maintenance</option>
          <option value="breakdown">Breakdown</option>
          <option value="idle">Idle</option>
        </select>
      </div>
      <div>
        <label htmlFor="detail-lastMaintenance" className="block text-sm font-medium text-gray-700">
          Last Maintenance Date
        </label>
        <input
          type="date"
          id="detail-lastMaintenance"
          name="lastMaintenance"
          value={formData.lastMaintenance}
          onChange={handleChange}
          readOnly={!isEditing}
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-nextMaintenance" className="block text-sm font-medium text-gray-700">
          Next Maintenance Date
        </label>
        <input
          type="date"
          id="detail-nextMaintenance"
          name="nextMaintenance"
          value={formData.nextMaintenance}
          onChange={handleChange}
          readOnly={!isEditing}
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="detail-location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-workOrders" className="block text-sm font-medium text-gray-700">
          Work Orders
        </label>
        <input
          type="text"
          id="detail-workOrders"
          name="workOrders"
          value={formData.workOrders}
          onChange={handleChange}
          readOnly={!isEditing}
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-health" className="block text-sm font-medium text-gray-700">
          Health (%)
        </label>
        <input
          type="text"
          id="detail-health"
          name="health"
          value={formData.health}
          onChange={handleHealthChange}
          readOnly={!isEditing}
          min="0"
          max="100"
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          {isEditing ? "Cancel" : "Close"}
        </motion.button>
        {isEditing && (
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Save Changes
          </motion.button>
        )}
      </div>
    </form>
  );
};

const AssetsDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [typeFilter, setTypeFilter] = useState<AssetType | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showAddAssetModal, setShowAddAssetModal] = useState(false); // Not used in this file, but kept for consistency
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ERPRecord | null>(null); // Changed to ERPRecord
  const [isEditing, setIsEditing] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage] = useState(5);
  const { user, fetchWithAuth, hasPermission, getERPData, deleteAsset } = useAuth();
  const [data, setData] = useState<User | null>(null); // Not directly used for assets, but kept for consistency
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false); // Not directly used, but kept for consistency
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [dataERP, setDataERP] = useState<ERPRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

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

  const handleLoadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedData = await getERPData();
      setDataERP(fetchedData);
    } catch (err) {
      setError("Failed to load data from ERP.");
      console.error("Error fetching ERP data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Dummy insights data, replace with actual data if available
  const insights = [
    {
      id: 1,
      title: "Maintenance Efficiency Improved",
      description: "Preventive maintenance completion rate increased by 15% this month",
      icon: <CheckCircle className="text-green-500" />,
      date: "Today, 09:30 AM",
    },
    {
      id: 2,
      title: "3 Assets Requiring Attention",
      description: "Critical assets showing signs of wear need inspection",
      icon: <AlertTriangle className="text-yellow-500" />,
      date: "Yesterday, 02:15 PM",
    },
    {
      id: 3,
      title: "Monthly Maintenance Completed",
      description: "All scheduled maintenance tasks completed on time",
      icon: <CheckCircle className="text-blue-500" />,
      date: "Jul 28, 2023",
    },
  ];

  // Functions to get status color and type icon (kept for consistency, though not directly used in the table now)
  const getStatusColor = (status: AssetStatus) => {
    switch (status) {
      case "running":
        return "bg-green-500";
      case "maintenance":
        return "bg-yellow-500";
      case "breakdown":
        return "bg-red-500";
      case "idle":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  const getTypeIcon = (type: AssetType) => {
    switch (type) {
      case "mechanical":
        return "⚙️";
      case "electrical":
        return "⚡";
      case "vehicle":
        return "🚗";
      case "building":
        return "🏢";
      default:
        return "�";
    }
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const filteredAssets = dataERP.filter((asset) => {
    // Explicitly convert asset.id to string for comparison
    const assetIdString = String(asset.id);
    const searchQueryLower = searchQuery.toLowerCase();

    const matchesSearch =
      asset.name.toLowerCase().includes(searchQueryLower) || assetIdString.toLowerCase().includes(searchQueryLower) || asset.category.toLowerCase().includes(searchQueryLower) || asset.location.toLowerCase().includes(searchQueryLower);
    // Add status and type filters if these fields are available in ERPRecord and you want to filter
    // const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    // const matchesType = typeFilter === "all" || asset.type === typeFilter;
    return matchesSearch; // && matchesStatus && matchesType;
  });

  const indexOfLastAsset = currentPage * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter/search change
    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };
    fetchData();
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, typeFilter, sidebarOpen, darkMode, fetchWithAuth]);

  // Function to handle viewing asset details
  const handleViewDetails = (asset: ERPRecord) => {
    setSelectedAsset(asset);
    setShowAssetDetailsModal(true);
    setIsEditing(false); // Ensure it's in view mode
  };

  // Function to handle editing asset
  const handleEditAsset = (asset: ERPRecord) => {
    setSelectedAsset(asset);
    setShowAssetDetailsModal(true);
    setIsEditing(true); // Ensure it's in edit mode
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (window.confirm(`Are you sure you want to delete asset with ID: ${assetId}?`)) {
      console.log("Attempting to delete asset with ID:", assetId); // Tambahkan ini
      if (!assetId) {
        console.error("Asset ID is empty or invalid.");
        alert("Cannot delete: Asset ID is missing.");
        return; // Hentikan eksekusi jika ID tidak ada
      }
      try {
        await deleteAsset(assetId);
        setDataERP(dataERP.filter((asset) => String(asset.id) !== assetId));
        console.log(`Asset with ID: ${assetId} deleted successfully.`);
      } catch (error) {
        console.error("Failed to delete asset:", error);
        alert("Failed to delete asset.");
      }
    }
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Package className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Assets Data</h2>
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
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                  >
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800">Notifications</h4>
                      <button onClick={() => setShowNotificationsPopup(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {insights.slice(0, 3).map((notification) => (
                        <div key={notification.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{notification.icon}</div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      ))}
                      {insights.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          // In a real application, you might navigate to a notifications page
                          // Removed alert
                          setShowNotificationsPopup(false);
                        }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View All
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assets Data Overview</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your physical assets efficiently</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={handleLoadData}
                disabled={isLoading}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md ${isLoading ? "bg-gray-400 text-gray-700 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
              >
                <Database className="text-lg" />
                <span className="font-semibold">{isLoading ? "Loading..." : "Load Data from ERP"}</span>
              </motion.button>
              <motion.button
                onClick={() => navigate("/assets/addasset")}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Add Asset</span>
              </motion.button>
              <motion.button
                onClick={() => {
                  /* Placeholder for import functionality */
                }}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Upload className="text-lg" />
                <span className="font-semibold">Import</span>
              </motion.button>
              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Filter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />}
              </motion.button>
            </div>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Assets" value={dataERP.length.toString()} change="+12%" icon={<Package />} />
            <StatCard title="Active Assets" value={"N/A"} change="+5%" icon={<CheckCircle />} />
            <StatCard title="In Maintenance" value={"N/A"} change="-2%" icon={<Wrench />} />
            <StatCard title="Critical Issues" value={"N/A"} change="+1" icon={<AlertTriangle />} />
          </div>
          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search assets by name or ID..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto"
                  >
                    {/* Status Filter - Assuming ERPRecord has a 'status' field */}
                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as AssetStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="running">Running</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="idle">Idle</option>
                    </select>
                    {/* Type Filter - Assuming ERPRecord has a 'type' field */}
                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as AssetType | "all")}
                    >
                      <option value="all">All Types</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="building">Building</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Table Card Container */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Purchase Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {isLoading && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-gray-600 text-lg">
                        <div className="flex items-center justify-center">
                          <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading data...
                        </div>
                      </td>
                    </tr>
                  )}
                  {error && (
                    <tr>
                      <td colSpan={5} className="text-center py-10 text-red-500 text-lg">
                        <div className="flex items-center justify-center">
                          <AlertTriangle className="text-red-500 mr-2" />
                          {error}
                        </div>
                      </td>
                    </tr>
                  )}
                  {!isLoading && dataERP.length === 0 && !error && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-gray-600 text-lg">
                        <div className="flex flex-col items-center justify-center">
                          <Package className="text-gray-400 mb-3" size={48} />
                          No assets found. Please click "Load Data from ERP".
                        </div>
                      </td>
                    </tr>
                  )}
                  {currentAssets.length > 0 &&
                    currentAssets.map((asset) => (
                      <motion.tr
                        key={asset.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="ml-0">
                              {" "}
                              {/* Adjusted ml-4 to ml-0 for consistency with Maintenance.tsx */}
                              <div className="text-base font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-600">{asset.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{asset.location}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{asset.purchaseDate}</div> {/* Corrected to purchaseDate */}
                        </td>
                        <td className="px-6 py-4">
                          {" "}
                          {/* Removed whitespace-nowrap to allow description to wrap */}
                          <div className="text-sm text-gray-900 max-w-xs truncate">{asset.description}</div> {/* Added truncate for long descriptions */}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex items-center space-x-3">
                            <motion.button
                              whileHover={{ scale: 1.1, color: "#2563eb" }} // Darker blue on hover
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/assets/editasset/${asset.id}`)}
                              className="text-yellow-600 hover:text-blue-600 transition-colors duration-200"
                              title="Edit Asset"
                            >
                              <Edit className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1, color: "#dc2626" }} // Red on hover
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteAsset(String(asset.id))} // Assuming ID is string for deletion
                              className="text-red-600 hover:text-red-600 transition-colors duration-200"
                              title="Delete Asset"
                            >
                              <Trash2 className="w-5 h-5" />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.1, color: "#2563eb" }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleViewDetails(asset)}
                              className="text-blue-600 hover:text-blue-600 transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye className="w-5 h-5" />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {filteredAssets.length > assetsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstAsset + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastAsset, filteredAssets.length)}</span> of{" "}
                <span className="font-semibold">{filteredAssets.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm
                          ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"}
                        `}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>
      {selectedAsset && (
        <Modal
          isOpen={showAssetDetailsModal}
          onClose={() => {
            setShowAssetDetailsModal(false);
            setSelectedAsset(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Asset" : "Asset Details"}
        >
          {/* Note: AssetDetailsForm expects 'Asset' type, but selectedAsset is ERPRecord.
              You might need to map ERPRecord to Asset or adjust AssetDetailsForm to accept ERPRecord
              For this refactor, I'm casting it for demonstration, but a proper type conversion
              or form update would be ideal. */}
          <AssetDetailsForm
            asset={selectedAsset as unknown as Asset} // Casting for now, proper type handling needed
            isEditing={isEditing}
            onSave={() => {
              /* Implement save logic for asset details */
            }}
            onCancel={() => {
              setShowAssetDetailsModal(false);
              setSelectedAsset(null);
              setIsEditing(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default AssetsDashboard;
