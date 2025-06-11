import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUpload,
  FiChevronUp,
  FiAlertTriangle,
  FiTool,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiFilter,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiEdit,
  FiEye,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

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

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
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
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
        </div>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="p-3 rounded-full bg-blue-50 text-blue-600 text-2xl">
          {icon}
        </motion.div>
      </div>
      <motion.p animate={{ x: isPositive ? [0, 2, 0] : [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`mt-3 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </motion.p>
    </motion.div>
  );
};

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
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <FiX />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

interface AddAssetFormProps {
  onAddAsset: (asset: Omit<Asset, "id" | "health" | "workOrders">) => void;
}

const AddAssetForm: React.FC<AddAssetFormProps> = ({ onAddAsset }) => {
  const [formData, setFormData] = useState<Omit<Asset, "id" | "health" | "workOrders">>({
    name: "",
    type: "mechanical",
    make: "",
    model: "",
    status: "running",
    lastMaintenance: "",
    nextMaintenance: "",
    location: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddAsset(formData);
    setFormData({
      name: "",
      type: "mechanical",
      make: "",
      model: "",
      status: "running",
      lastMaintenance: "",
      nextMaintenance: "",
      location: "",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Asset Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="mechanical">Mechanical</option>
          <option value="electrical">Electrical</option>
          <option value="vehicle">Vehicle</option>
          <option value="building">Building</option>
        </select>
      </div>
      <div>
        <label htmlFor="make" className="block text-sm font-medium text-gray-700">
          Make
        </label>
        <input
          type="text"
          id="make"
          name="make"
          value={formData.make}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="model" className="block text-sm font-medium text-gray-700">
          Model
        </label>
        <input
          type="text"
          id="model"
          name="model"
          value={formData.model}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="lastMaintenance" className="block text-sm font-medium text-gray-700">
          Last Maintenance Date
        </label>
        <input
          type="date"
          id="lastMaintenance"
          name="lastMaintenance"
          value={formData.lastMaintenance}
          onChange={handleChange}
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="nextMaintenance" className="block text-sm font-medium text-gray-700">
          Next Maintenance Date
        </label>
        <input
          type="date"
          id="nextMaintenance"
          name="nextMaintenance"
          value={formData.nextMaintenance}
          onChange={handleChange}
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Add Asset
        </motion.button>
      </div>
    </form>
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
          Asset ID
        </label>
        <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-workOrders" className="block text-sm font-medium text-gray-700">
          Work Orders
        </label>
        <input
          type="number"
          id="detail-workOrders"
          name="workOrders"
          value={formData.workOrders}
          onChange={handleChange}
          readOnly={!isEditing}
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-health" className="block text-sm font-medium text-gray-700">
          Health (%)
        </label>
        <input
          type="number"
          id="detail-health"
          name="health"
          value={formData.health}
          onChange={handleHealthChange}
          readOnly={!isEditing}
          min="0"
          max="100"
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
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

  const [showAddAssetModal, setShowAddAssetModal] = useState(false);
  const [showAssetDetailsModal, setShowAssetDetailsModal] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage] = useState(5);
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
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

  const [assets, setAssets] = useState<Asset[]>([
    {
      id: "AST-001",
      name: "HVAC System",
      type: "mechanical",
      make: "Trane",
      model: "XR15",
      status: "running",
      lastMaintenance: "2023-05-15",
      nextMaintenance: "2023-11-15",
      location: "Building A, Floor 3",
      workOrders: 2,
      health: 85,
    },
    {
      id: "AST-002",
      name: "Forklift",
      type: "vehicle",
      make: "Toyota",
      model: "8FGCU25",
      status: "maintenance",
      lastMaintenance: "2023-06-20",
      nextMaintenance: "2023-09-20",
      location: "Warehouse",
      workOrders: 1,
      health: 65,
    },
    {
      id: "AST-003",
      name: "Conveyor Belt Motor",
      type: "mechanical",
      make: "Siemens",
      model: "1LE1001",
      status: "running",
      lastMaintenance: "2023-07-01",
      nextMaintenance: "2024-01-01",
      location: "Production Line 2",
      workOrders: 0,
      health: 92,
    },
    {
      id: "AST-004",
      name: "Solar Inverter",
      type: "electrical",
      make: "SolarEdge",
      model: "SE5000H",
      status: "idle",
      lastMaintenance: "2023-04-10",
      nextMaintenance: "2023-10-10",
      location: "Roof Top",
      workOrders: 3,
      health: 78,
    },
    {
      id: "AST-005",
      name: "Emergency Generator",
      type: "electrical",
      make: "Cummins",
      model: "C60D5",
      status: "breakdown",
      lastMaintenance: "2023-03-05",
      nextMaintenance: "2023-09-05",
      location: "Basement",
      workOrders: 5,
      health: 42,
    },
    {
      id: "AST-006",
      name: "Water Pump",
      type: "mechanical",
      make: "Grundfos",
      model: "CRN 32",
      status: "running",
      lastMaintenance: "2023-08-01",
      nextMaintenance: "2024-02-01",
      location: "Pump House",
      workOrders: 1,
      health: 90,
    },
    {
      id: "AST-007",
      name: "Server Rack",
      type: "electrical",
      make: "Dell",
      model: "PowerEdge R740",
      status: "running",
      lastMaintenance: "2023-07-20",
      nextMaintenance: "2024-01-20",
      location: "Data Center",
      workOrders: 0,
      health: 95,
    },
    {
      id: "AST-008",
      name: "Company Car",
      type: "vehicle",
      make: "Honda",
      model: "Civic",
      status: "running",
      lastMaintenance: "2023-09-10",
      nextMaintenance: "2024-03-10",
      location: "Parking Lot",
      workOrders: 0,
      health: 88,
    },
    {
      id: "AST-009",
      name: "Office Building A",
      type: "building",
      make: "N/A",
      model: "N/A",
      status: "running",
      lastMaintenance: "2023-01-01",
      nextMaintenance: "2024-01-01",
      location: "Main Campus",
      workOrders: 2,
      health: 98,
    },
    {
      id: "AST-010",
      name: "Industrial Robot",
      type: "mechanical",
      make: "KUKA",
      model: "KR 6 R900",
      status: "maintenance",
      lastMaintenance: "2023-10-01",
      nextMaintenance: "2023-12-01",
      location: "Assembly Line",
      workOrders: 1,
      health: 70,
    },
  ]);

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
  };

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
        return "📋";
    }
  };

  const openAssetDetails = (asset: Asset, editMode: boolean) => {
    setSelectedAsset(asset);
    setIsEditing(editMode);
    setShowAssetDetailsModal(true);
  };

  const handleAddAsset = (newAssetData: Omit<Asset, "id" | "health" | "workOrders">) => {
    const newAsset: Asset = {
      ...newAssetData,
      id: `AST-${String(assets.length + 1).padStart(3, "0")}`,
      health: 100,
      workOrders: 0,
    };
    setAssets([...assets, newAsset]);
    setShowAddAssetModal(false);
  };

  const handleUpdateAsset = (updatedAssetData: Asset) => {
    setAssets(assets.map((asset) => (asset.id === updatedAssetData.id ? updatedAssetData : asset)));
    setShowAssetDetailsModal(false);
    setSelectedAsset(null);
    setIsEditing(false);
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch = asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || asset.id.toLowerCase().includes(searchQuery.toLowerCase()) || asset.location.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || asset.status === statusFilter;
    const matchesType = typeFilter === "all" || asset.type === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const indexOfLastAsset = currentPage * assetsPerPage;
  const indexOfFirstAsset = indexOfLastAsset - assetsPerPage;
  const currentAssets = filteredAssets.slice(indexOfFirstAsset, indexOfLastAsset);
  const totalPages = Math.ceil(filteredAssets.length / assetsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/api/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();

    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, typeFilter, sidebarOpen]);

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
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
            className={`bg-white border-r border-blue-100 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-blue-100">
              {sidebarOpen ? (
                <>
                  <div className="rounded-lg flex items-center space-x-3">
                    <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                    <p className="text-blue-600 font-bold">CMMS</p>
                  </div>
                </>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-6 w-auto" />
              )}

              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />
              <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />
              <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />
              <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />
              <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">User</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/logout")}
                  className="mt-4 w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiPackage className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Assets</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNotifications} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
              <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Assets Overview</h1>
              <p className="text-gray-600 mt-1">Manage and monitor your physical assets efficiently</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddAssetModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Add Asset</span>
              </motion.button>

              <motion.button
                onClick={handleImport}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiUpload className="text-lg" />
                <span className="font-semibold">Import</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiFilter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Assets" value={assets.length.toString()} change="+12%" icon={<FiPackage />} />
            <StatCard title="Active Assets" value={assets.filter((a) => a.status === "running").length.toString()} change="+5%" icon={<FiCheckCircle />} />
            <StatCard title="In Maintenance" value={assets.filter((a) => a.status === "maintenance").length.toString()} change="-2%" icon={<FiTool />} />
            <StatCard title="Critical Issues" value={assets.filter((a) => a.status === "breakdown").length.toString()} change="+1" icon={<FiAlertTriangle />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search assets by name, ID, or location..."
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
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
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
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

                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
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

          {/* Assets Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Health</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Location</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Orders</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {currentAssets.length > 0 ? (
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
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">{getTypeIcon(asset.type)}</div>
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-900">{asset.name}</div>
                              <div className="text-sm text-gray-600">{asset.id}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm capitalize text-gray-900">{asset.type}</div>
                          <div className="text-xs text-gray-600">
                            {asset.make} {asset.model}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(asset.status)} text-white shadow-sm`}>
                            {asset.status.charAt(0).toUpperCase() + asset.status.slice(1)}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-24 h-2.5 bg-blue-100 rounded-full mr-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${asset.health}%` }}
                                transition={{ duration: 0.8, type: "spring" }}
                                className={`h-2.5 rounded-full ${asset.health > 70 ? "bg-green-500" : asset.health > 40 ? "bg-yellow-500" : "bg-red-500"}`}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-900">{asset.health}%</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{asset.location}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${asset.workOrders > 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"} shadow-sm`}>
                            {asset.workOrders} {asset.workOrders === 1 ? "order" : "orders"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openAssetDetails(asset, false)}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openAssetDetails(asset, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Asset"
                          >
                            <FiEdit className="text-lg" />
                            <span>Edit</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No assets found matching your criteria.
                      </td>
                    </tr>
                  )}
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
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                      ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
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
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Add Asset Modal */}
      <Modal isOpen={showAddAssetModal} onClose={() => setShowAddAssetModal(false)} title="Add New Asset">
        <AddAssetForm onAddAsset={handleAddAsset} />
      </Modal>

      {/* View/Edit Asset Modal */}
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
          <AssetDetailsForm
            asset={selectedAsset}
            isEditing={isEditing}
            onSave={handleUpdateAsset}
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
