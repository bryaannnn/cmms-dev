import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../routes/AuthContext";

// Import Lucide Icons for consistency with Dashboard.tsx
import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench, // Changed FiTool to Wrench
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
  Edit,
  Eye,
  Key,
  User as UserIcon, // Aliased to avoid conflict with 'type User'
} from "lucide-react";

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
      whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }} // Soft blue hover for non-active
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

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }} // Softer hover effect
      className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
    >
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
          {icon}
        </div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </p>
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100" // Adjusted for consistency
      >
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100"> {/* Changed border-blue-100 to border-gray-100 */}
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <X size={24} /> {/* Using Lucide X icon */}
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200" // Adjusted for consistency
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
        <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" /> {/* Adjusted for consistency */}
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`} // Adjusted for consistency
        />
      </div>

      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200" // Adjusted for consistency
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
  const { user, fetchWithAuth, hasPermission } = useAuth();
  const [data, setData] = useState<User | null>(null); // Type for data consistent with Dashboard.tsx
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // New state for popups (Notifications and Profile)
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Refs for click outside
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click outside handler for popups
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

  const insights = [ // Placeholder for notifications
    {
      id: 1,
      title: "Maintenance Efficiency Improved",
      description: "Preventive maintenance completion rate increased by 15% this month",
      icon: <CheckCircle className="text-green-500" />, // Changed to CheckCircle from TrendingUp for asset context
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
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen)); // Consistent storage update
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
        const result = await fetchWithAuth("/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();

    document.documentElement.classList.toggle("dark", darkMode); // Added dark mode toggle
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, typeFilter, sidebarOpen, darkMode, fetchWithAuth]); // Added darkMode and fetchWithAuth dependency

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : (sidebarOpen ? 280 : 80), opacity: 0 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 280 : 0) : (sidebarOpen ? 280 : 80),
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`bg-white border-r border-gray-100 flex flex-col shadow-xl overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              {sidebarOpen ? (
                <div className="flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-9 w-auto" />
                  <p className="text-blue-600 font-bold text-xl tracking-wide">CMMS</p>
                </div>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-8 w-auto mx-auto" />
              )}

              <button
                onClick={toggleSidebar}
                className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? <ChevronLeft className="text-xl" /> : <ChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto custom-scrollbar">
              {hasPermission("1") && <NavItem icon={<Home />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />}
              {hasPermission("3") && <NavItem icon={<Package />} text="Assets" to="/assets" expanded={sidebarOpen} />}
              {hasPermission("7") && <NavItem icon={<Clipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />}
              {hasPermission("31") && <NavItem icon={<Clipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />}
              {hasPermission("23") && <NavItem icon={<Database />} text="Inventory" to="/inventory" expanded={sidebarOpen} />}
              {hasPermission("11") && <NavItem icon={<BarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />}
              {hasPermission("27") && <NavItem icon={<Users />} text="Team" to="/team" expanded={sidebarOpen} />}
              {hasPermission("13") && <NavItem icon={<Settings />} text="Settings" to="/settings" expanded={sidebarOpen} />}
              {hasPermission("15") && <NavItem icon={<Key />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
            </nav>

            {/* Bagian Bawah Navbar: Informasi Versi & Logout Sidebar */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                />
                {sidebarOpen && (
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Application Version</p>
                    <p className="text-xs text-gray-500">1.0.0</p>
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
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Package className="text-xl text-blue-600" /> {/* Changed FiPackage to Package */}
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Assets</h2> {/* Adjusted font size and color */}
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

            {/* Notifications Pop-up */}
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
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">
                            {notification.icon}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      ))}
                      {insights.length === 0 && (
                        <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>
                      )}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button onClick={() => {alert('View All Notifications clicked'); setShowNotificationsPopup(false);}} className="text-blue-600 hover:underline text-sm font-medium">View All</button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile Menu Pop-up */}
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
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">
                      {user?.name || "Guest User"}
                    </div>
                    <button
                      onClick={() => {navigate('/profile'); setShowProfileMenu(false);}}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <UserIcon size={16} className="mr-2" /> My Profile
                    </button>
                    <button
                      onClick={() => {navigate('/settings'); setShowProfileMenu(false);}}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <Settings size={16} className="mr-2" /> Settings
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {navigate('/logout'); setShowProfileMenu(false);}}
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
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
                <Plus className="text-lg" /> {/* Changed FiPlus to Plus */}
                <span className="font-semibold">Add Asset</span>
              </motion.button>

              <motion.button
                onClick={() => alert("Import functionality is not yet implemented. This would typically involve uploading a file.")} // Changed handleImport to direct alert
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md" // Changed border-blue-200 to border-gray-200
              >
                <Upload className="text-lg" /> {/* Changed FiUpload to Upload */}
                <span className="font-semibold">Import</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md" // Changed border-blue-200 to border-gray-200
              >
                <Filter className="text-lg" /> {/* Changed FiFilter to Filter */}
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />} {/* Changed FiChevronUp/Down to ChevronUp/Down */}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Assets" value={assets.length.toString()} change="+12%" icon={<Package />} /> {/* Changed FiPackage to Package */}
            <StatCard title="Active Assets" value={assets.filter((a) => a.status === "running").length.toString()} change="+5%" icon={<CheckCircle />} /> {/* Changed FiCheckCircle to CheckCircle */}
            <StatCard title="In Maintenance" value={assets.filter((a) => a.status === "maintenance").length.toString()} change="-2%" icon={<Wrench />} /> {/* Changed FiTool to Wrench */}
            <StatCard title="Critical Issues" value={assets.filter((a) => a.status === "breakdown").length.toString()} change="+1" icon={<AlertTriangle />} /> {/* Changed FiAlertTriangle to AlertTriangle */}
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50"> {/* Changed rounded-xl to rounded-2xl, shadow-sm to shadow-md, border-blue-100 to border-blue-50 */}
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" /> {/* Changed FiSearch to Search */}
                <input
                  type="text"
                  placeholder="Search assets by name, ID, or location..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200" // Changed border-blue-200 to border-gray-200
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
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200" // Changed border-blue-200 to border-gray-200
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
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200" // Changed border-blue-200 to border-gray-200
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
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50"> {/* Changed rounded-xl to rounded-2xl, shadow-sm to shadow-md, border-blue-100 to border-blue-50 */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100"> {/* Changed divide-blue-100 to divide-gray-100 */}
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
                <tbody className="bg-white divide-y divide-gray-100"> {/* Changed divide-blue-100 to divide-gray-100 */}
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
                            <Eye className="text-lg" /> {/* Changed FiEye to Eye */}
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openAssetDetails(asset, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Asset"
                          >
                            <Edit className="text-lg" /> {/* Changed FiEdit to Edit */}
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
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" // Changed border-blue-200 to border-gray-200
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
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm" // Changed border-blue-200 to border-gray-200
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