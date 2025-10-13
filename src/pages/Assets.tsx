import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, PermissionName, ERPRecord } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../component/PageHeader";
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
  Calendar,
  Clock,
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
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

  // Komponen Section dengan header yang lebih jelas
  const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-blue-600">{icon}</div>}
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  // Komponen Detail Item yang lebih modern untuk Assets
  const DetailItem: React.FC<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    priority?: "high" | "medium" | "low";
  }> = ({ label, value, icon, fullWidth = false, priority = "medium" }) => {
    const priorityStyles = {
      high: "border-l-4 border-l-blue-500 bg-blue-25",
      medium: "border-l-2 border-l-gray-200",
      low: "border-l border-l-gray-100",
    };

    return (
      <div className={`${fullWidth ? "col-span-full" : ""}`}>
        <div className={`p-4 rounded-lg ${priorityStyles[priority]} transition-all duration-200 hover:shadow-sm`}>
          <div className="flex items-start space-x-3">
            {icon && <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">{value}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
      {/* Header Information */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{formData.name}</h2>
              <span
                className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                  formData.status === "running"
                    ? "bg-green-100 text-green-800 border border-green-300"
                    : formData.status === "maintenance"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                    : formData.status === "breakdown"
                    ? "bg-red-100 text-red-800 border border-red-300"
                    : "bg-blue-100 text-blue-800 border border-blue-300"
                }`}
              >
                {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </span>
            </div>
            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-2">
                <Package className="w-4 h-4" />
                Asset ID: {formData.id}
              </span>
              <span className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Type: {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Section title="Basic Information" icon={<Package className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Asset ID" value={formData.id} icon={<Key className="w-4 h-4" />} priority="high" />
          <DetailItem label="Asset Name" value={formData.name} icon={<Package className="w-4 h-4" />} priority="high" />
          <DetailItem label="Asset Type" value={formData.type.charAt(0).toUpperCase() + formData.type.slice(1)} icon={<Settings className="w-4 h-4" />} priority="high" />
          <DetailItem label="Make" value={formData.make} icon={<Wrench className="w-4 h-4" />} />
          <DetailItem label="Model" value={formData.model} icon={<Settings className="w-4 h-4" />} />
          <DetailItem label="Location" value={formData.location} icon={<Home className="w-4 h-4" />} />
        </div>
      </Section>

      {/* Status & Maintenance */}
      <Section title="Status & Maintenance" icon={<Clipboard className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Current Status" value={formData.status.charAt(0).toUpperCase() + formData.status.slice(1)} icon={<CheckCircle className="w-4 h-4" />} priority="high" />
          <DetailItem label="Last Maintenance" value={formData.lastMaintenance} icon={<Calendar className="w-4 h-4" />} />
          <DetailItem label="Next Maintenance" value={formData.nextMaintenance} icon={<Clock className="w-4 h-4" />} priority="high" />
          <DetailItem label="Work Orders" value={formData.workOrders.toString()} icon={<Clipboard className="w-4 h-4" />} />
          <DetailItem label="Health Status" value={`${formData.health}%`} icon={<BarChart2 className="w-4 h-4" />} priority="high" />
        </div>
      </Section>

      {/* Technical Details */}
      <Section title="Technical Details" icon={<Wrench className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Asset Specifications</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Make:</span> {formData.make}
              </p>
              <p>
                <span className="font-medium">Model:</span> {formData.model}
              </p>
              <p>
                <span className="font-medium">Type:</span> {formData.type.charAt(0).toUpperCase() + formData.type.slice(1)}
              </p>
            </div>
          </div>
          <div className="p-4 bg-green-25 rounded-lg border-l-4 border-l-green-400">
            <h4 className="text-sm font-semibold text-gray-700 mb-2">Performance Metrics</h4>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <span className="font-medium">Health Score:</span> {formData.health}%
              </p>
              <p>
                <span className="font-medium">Work Orders:</span> {formData.workOrders}
              </p>
              <p>
                <span className="font-medium">Status:</span> {formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* Maintenance Timeline */}
      <Section title="Maintenance Timeline" icon={<Clock className="w-5 h-5" />}>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
            <span className="text-sm font-medium text-green-800">Last Maintenance</span>
            <span className="text-sm text-green-600">{formData.lastMaintenance}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
            <span className="text-sm font-medium text-blue-800">Next Scheduled Maintenance</span>
            <span className="text-sm text-blue-600">{formData.nextMaintenance}</span>
          </div>

          <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
            <span className="text-sm font-medium text-yellow-800">Current Status</span>
            <span className="text-sm text-yellow-600">{formData.status.charAt(0).toUpperCase() + formData.status.slice(1)}</span>
          </div>
        </div>
      </Section>

      {/* Action Buttons */}
      <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
        >
          {isEditing ? "Cancel" : "Close Details"}
        </motion.button>
        {isEditing && (
          <motion.button
            type="submit"
            onClick={handleSubmit}
            whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            className="ml-4 inline-flex items-center px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 font-semibold"
          >
            Save Changes
          </motion.button>
        )}
      </div>
    </div>
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
        <PageHeader mainTitle="Assets Data" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Package />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
          <motion.div
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto border border-blue-100 max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4 bg-blue-50">
              <h3 className="text-2xl font-bold text-gray-900">{isEditing ? "Edit Asset" : "Asset Details"}</h3>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => {
                  setShowAssetDetailsModal(false);
                  setSelectedAsset(null);
                  setIsEditing(false);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl p-1 rounded-full hover:bg-blue-100 transition-colors duration-200"
              >
                <X size={24} />
              </motion.button>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-6 flex-grow">
              <AssetDetailsForm
                asset={selectedAsset as unknown as Asset}
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default AssetsDashboard;
