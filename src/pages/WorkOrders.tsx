import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../component/Sidebar";

// Import Lucide Icons for consistency
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
  Edit,
  Eye,
  Clock,
  Calendar,
  Trash2,
  Key,
  Info,
  User as UserIcon, // Aliased to avoid conflict with 'type User'
  Flag,
  Star,
  Printer,
} from "lucide-react";

type WorkOrderStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold";
type WorkOrderPriority = "low" | "medium" | "high" | "critical";
type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency";
type WorkOrderCategory = "mechanical" | "electrical" | "plumbing" | "structural" | "safety" | "it"; // New category type

interface WorkOrder {
  id: string;
  title: string;
  assetId: string;
  assetName: string;
  priority: WorkOrderPriority;
  status: WorkOrderStatus;
  assignedTo: string;
  dueDate: string;
  completionDate?: string;
  description: string;
  type: WorkOrderType;
  category: WorkOrderCategory; // Added category
  reportedBy: string;
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

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
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

interface AddWorkOrderFormProps {
  onAddWorkOrder: (order: Omit<WorkOrder, "id" | "completionDate">) => void;
}

const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ onAddWorkOrder }) => {
  const [formData, setFormData] = useState<Omit<WorkOrder, "id" | "completionDate">>({
    title: "",
    assetId: "",
    assetName: "",
    priority: "medium",
    status: "pending",
    assignedTo: "",
    dueDate: "",
    description: "",
    type: "corrective",
    category: "mechanical", // Default category
    reportedBy: "Admin", // Default or user's name
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkOrder(formData);
    setFormData({
      title: "",
      assetId: "",
      assetName: "",
      priority: "medium",
      status: "pending",
      assignedTo: "",
      dueDate: "",
      description: "",
      type: "corrective",
      category: "mechanical",
      reportedBy: "Admin",
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Work Order Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          type="text"
          id="assetName"
          name="assetName"
          value={formData.assetName}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
          Asset ID
        </label>
        <input
          type="text"
          id="assetId"
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
          Assigned To
        </label>
        <input
          type="text"
          id="assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700">
          Work Order Type
        </label>
        <select
          id="type"
          name="type"
          value={formData.type}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
      {/* New Category Field */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        >
          <option value="mechanical">Mechanical</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="structural">Structural</option>
          <option value="safety">Safety</option>
          <option value="it">IT</option>
        </select>
      </div>
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        ></textarea>
      </div>
      <div className="flex justify-end space-x-3 mt-6">
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Create Work Order
        </motion.button>
      </div>
    </form>
  );
};

interface WorkOrderDetailsFormProps {
  workOrder: WorkOrder;
  isEditing: boolean;
  onSave: (order: WorkOrder) => void;
  onCancel: () => void;
  onComplete: (id: string) => void;
  onPrint: (id: string) => void;
}

const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint }) => {
  const [formData, setFormData] = useState<WorkOrder>(workOrder);

  useEffect(() => {
    setFormData(workOrder);
  }, [workOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
          Work Order ID
        </label>
        <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
      </div>
      <div>
        <label htmlFor="detail-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="detail-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-assetName" className="block text-sm font-medium text-gray-700">
          Asset Name
        </label>
        <input
          type="text"
          id="detail-assetName"
          name="assetName"
          value={formData.assetName}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-assetId" className="block text-sm font-medium text-gray-700">
          Asset ID
        </label>
        <input
          type="text"
          id="detail-assetId"
          name="assetId"
          value={formData.assetId}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-assignedTo" className="block text-sm font-medium text-gray-700">
          Assigned To
        </label>
        <input
          type="text"
          id="detail-assignedTo"
          name="assignedTo"
          value={formData.assignedTo}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-dueDate" className="block text-sm font-medium text-gray-700">
          Due Date
        </label>
        <input
          type="date"
          id="detail-dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      {formData.completionDate && (
        <div>
          <label htmlFor="detail-completionDate" className="block text-sm font-medium text-gray-700">
            Completion Date
          </label>
          <input
            type="date"
            id="detail-completionDate"
            name="completionDate"
            value={formData.completionDate}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      )}
      <div>
        <label htmlFor="detail-priority" className="block text-sm font-medium text-gray-700">
          Priority
        </label>
        <select
          id="detail-priority"
          name="priority"
          value={formData.priority}
          onChange={handleChange}
          disabled={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
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
          <option value="pending">Pending</option>
          <option value="in-progress">In-Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="on-hold">On-Hold</option>
        </select>
      </div>
      <div>
        <label htmlFor="detail-type" className="block text-sm font-medium text-gray-700">
          Type
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
          <option value="preventive">Preventive</option>
          <option value="corrective">Corrective</option>
          <option value="inspection">Inspection</option>
          <option value="emergency">Emergency</option>
        </select>
      </div>
      {/* New Category Field for Details */}
      <div>
        <label htmlFor="detail-category" className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          id="detail-category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          disabled={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        >
          <option value="mechanical">Mechanical</option>
          <option value="electrical">Electrical</option>
          <option value="plumbing">Plumbing</option>
          <option value="structural">Structural</option>
          <option value="safety">Safety</option>
          <option value="it">IT</option>
        </select>
      </div>
      <div>
        <label htmlFor="detail-reportedBy" className="block text-sm font-medium text-gray-700">
          Reported By
        </label>
        <input
          type="text"
          id="detail-reportedBy"
          name="reportedBy"
          value={formData.reportedBy}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="detail-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          readOnly={!isEditing}
          rows={3}
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        ></textarea>
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
        {!isEditing && formData.status !== "completed" && formData.status !== "cancelled" && (
          <motion.button
            type="button"
            onClick={() => onComplete(formData.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
          >
            <CheckCircle size={18} className="mr-2" /> Mark as Completed
          </motion.button>
        )}
        {!isEditing && (
          <motion.button
            type="button"
            onClick={() => onPrint(formData.id)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition-colors duration-200"
          >
            <Printer size={18} className="mr-2" /> Print
          </motion.button>
        )}
      </div>
    </form>
  );
};

const WorkOrdersDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | "all">("all");
  const [typeFilter, setTypeFilter] = useState<WorkOrderType | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<WorkOrderCategory | "all">("all"); // New category filter state
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const { user, fetchWithAuth, hasPermission } = useAuth();
  const navigate = useNavigate();
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

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "WO-001",
      title: "HVAC System Inspection",
      assetId: "AST-001",
      assetName: "HVAC System",
      priority: "high",
      status: "in-progress",
      assignedTo: "John Doe",
      dueDate: "2023-08-15",
      description: "Perform quarterly inspection of all HVAC units in Building A.",
      type: "preventive",
      category: "mechanical", // Added category
      reportedBy: "Facilities Team",
    },
    {
      id: "WO-002",
      title: "Forklift Tire Replacement",
      assetId: "AST-002",
      assetName: "Forklift",
      priority: "critical",
      status: "pending",
      assignedTo: "Jane Smith",
      dueDate: "2023-08-10",
      description: "Replace worn-out tires on Forklift AST-002. Prioritize immediately.",
      type: "corrective",
      category: "mechanical", // Added category
      reportedBy: "Warehouse Manager",
    },
    {
      id: "WO-003",
      title: "Conveyor Belt Motor Repair",
      assetId: "AST-003",
      assetName: "Conveyor Belt Motor",
      priority: "medium",
      status: "completed",
      assignedTo: "David Lee",
      dueDate: "2023-07-25",
      completionDate: "2023-07-24",
      description: "Investigate and repair abnormal noise from conveyor belt motor.",
      type: "corrective",
      category: "electrical", // Added category
      reportedBy: "Production Lead",
    },
    {
      id: "WO-004",
      title: "Emergency Generator Fuel Check",
      assetId: "AST-005",
      assetName: "Emergency Generator",
      priority: "low",
      status: "on-hold",
      assignedTo: "Sarah Chen",
      dueDate: "2023-09-01",
      description: "Check fuel levels and general condition of emergency generator.",
      type: "inspection",
      category: "electrical", // Added category
      reportedBy: "Security Team",
    },
    {
      id: "WO-005",
      title: "Water Pump Leak Fix",
      assetId: "AST-006",
      assetName: "Water Pump",
      priority: "high",
      status: "pending",
      assignedTo: "John Doe",
      dueDate: "2023-08-20",
      description: "Fix significant water leak from the main water pump in Pump House.",
      type: "emergency",
      category: "plumbing", // Added category
      reportedBy: "Building Supervisor",
    },
    {
      id: "WO-006",
      title: "Server Room Cooling System Maintenance",
      assetId: "AST-010",
      assetName: "Server Room Cooling",
      priority: "high",
      status: "in-progress",
      assignedTo: "IT Team",
      dueDate: "2023-08-22",
      description: "Perform routine maintenance on server room cooling units to prevent overheating.",
      type: "preventive",
      category: "it", // Added category
      reportedBy: "IT Manager",
    },
    {
      id: "WO-007",
      title: "Fire Alarm System Test",
      assetId: "AST-008",
      assetName: "Fire Alarm System",
      priority: "medium",
      status: "pending",
      assignedTo: "Safety Officer",
      dueDate: "2023-09-05",
      description: "Monthly test of all fire alarm sensors and emergency exit lights.",
      type: "inspection",
      category: "safety", // Added category
      reportedBy: "Compliance Department",
    },
  ]);

  const insights = [
    {
      id: 1,
      title: "New Critical Work Order",
      description: "Forklift Tire Replacement (WO-002) is critical and pending.",
      icon: <AlertTriangle className="text-red-500" />,
      date: "Today, 10:00 AM",
    },
    {
      id: 2,
      title: "Work Order Completed",
      description: "Conveyor Belt Motor Repair (WO-003) has been completed.",
      icon: <CheckCircle className="text-green-500" />,
      date: "Yesterday, 03:00 PM",
    },
    {
      id: 3,
      title: "Upcoming Maintenance",
      description: "HVAC System Inspection (WO-001) due soon.",
      icon: <Clock className="text-blue-500" />,
      date: "Tomorrow, 09:00 AM",
    },
  ];

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case "pending":
        return "bg-gray-500 text-white";
      case "in-progress":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "on-hold":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-green-100 text-green-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const openWorkOrderDetails = (order: WorkOrder, editMode: boolean) => {
    setSelectedWorkOrder(order);
    setIsEditing(editMode);
    setShowWorkOrderDetailsModal(true);
  };

  const handleAddWorkOrder = (newOrderData: Omit<WorkOrder, "id" | "completionDate">) => {
    const newOrder: WorkOrder = {
      ...newOrderData,
      id: `WO-${String(workOrders.length + 1).padStart(3, "0")}`,
    };
    setWorkOrders([...workOrders, newOrder]);
    setShowAddWorkOrderModal(false);
  };

  const handleUpdateWorkOrder = (updatedOrderData: WorkOrder) => {
    setWorkOrders(workOrders.map((order) => (order.id === updatedOrderData.id ? updatedOrderData : order)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    setIsEditing(false);
  };

  const handleCompleteWorkOrder = (id: string) => {
    setWorkOrders(workOrders.map((order) => (order.id === id ? { ...order, status: "completed", completionDate: new Date().toISOString().split("T")[0] } : order)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    alert(`Work Order ${id} marked as completed!`);
  };

  const handleDeleteClick = (id: string) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleDelete = (id: string) => {
    setWorkOrders(workOrders.filter((order) => order.id !== id));
    setShowDeleteConfirm(false);
    setRecordToDelete(null);
    alert(`Work Order ${id} deleted.`);
  };

  const handlePrintWorkOrder = (id: string) => {
    alert(`Printing Work Order ${id}... (Not implemented)`);
  };

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.assignedTo.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    const matchesType = typeFilter === "all" || order.type === typeFilter;
    const matchesCategory = categoryFilter === "all" || order.category === categoryFilter; // New category filter logic

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesCategory; // Include category in filter
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1); // Reset to first page on filter/search change
    document.documentElement.classList.toggle("dark", darkMode); // Added dark mode toggle
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, categoryFilter, sidebarOpen, darkMode]); // Added categoryFilter to dependencies

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

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
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Work Orders</h2>
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
                          alert("View All Notifications clicked");
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Work Orders Overview</h1>
              <p className="text-gray-600 mt-1">Manage and track all maintenance and service requests</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddWorkOrderModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Plus className="text-lg" />
                <span className="font-semibold">Create Work Order</span>
              </motion.button>

              <motion.button
                onClick={() => alert("Import functionality is not yet implemented. This would typically involve uploading a file.")}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Upload className="text-lg" />
                <span className="font-semibold">Import</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Filter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Work Orders" value={filteredWorkOrders.length.toString()} change="+8%" icon={<Clipboard />} />
            <StatCard title="Pending" value={filteredWorkOrders.filter((wo) => wo.status === "pending").length.toString()} change="+3" icon={<Clock />} />
            <StatCard title="In Progress" value={filteredWorkOrders.filter((wo) => wo.status === "in-progress").length.toString()} change="-1" icon={<Wrench />} />
            <StatCard
              title="Completed Last Month"
              value={filteredWorkOrders.filter((wo) => wo.status === "completed" && wo.completionDate && new Date(wo.completionDate).getMonth() === new Date().getMonth() - 1).length.toString()}
              change="+5"
              icon={<CheckCircle />}
            />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search work orders by title, ID, asset name, or assignee..."
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
                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In-Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="on-hold">On-Hold</option>
                    </select>

                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as WorkOrderPriority | "all")}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>

                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as WorkOrderType | "all")}
                    >
                      <option value="all">All Types</option>
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="inspection">Inspection</option>
                      <option value="emergency">Emergency</option>
                    </select>

                    {/* New Category Filter */}
                    <select
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value as WorkOrderCategory | "all")}
                    >
                      <option value="all">All Categories</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                      <option value="plumbing">Plumbing</option>
                      <option value="structural">Structural</option>
                      <option value="safety">Safety</option>
                      <option value="it">IT</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Work Orders Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Category</th> {/* New Category column header */}
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-base font-medium text-gray-900">{order.title}</div>
                          <div className="text-sm text-gray-600">{order.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{order.assetName}</div>
                          <div className="text-xs text-gray-600">{order.assetId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assignedTo}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getPriorityColor(order.priority)} shadow-sm`}>{order.priority.charAt(0).toUpperCase() + order.priority.slice(1)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.status)} shadow-sm`}>{order.status.charAt(0).toUpperCase() + order.status.slice(1)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.category.charAt(0).toUpperCase() + order.category.slice(1)}</td> {/* New Category column data */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(order, false)}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <Eye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(order, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Work Order"
                          >
                            <Edit className="text-lg" />
                            <span>Edit</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDeleteClick(order.id)}
                            className="text-red-600 hover:text-red-800 ml-3 transition-colors duration-200 flex items-center space-x-1"
                            title="Delete Work Order"
                          >
                            <Trash2 className="text-lg" />
                            <span>Delete</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No work orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {filteredWorkOrders.length > ordersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastOrder, filteredWorkOrders.length)}</span> of{" "}
                <span className="font-semibold">{filteredWorkOrders.length}</span> results
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

      {/* Add Work Order Modal */}
      <Modal isOpen={showAddWorkOrderModal} onClose={() => setShowAddWorkOrderModal(false)} title="Create New Work Order">
        <AddWorkOrderForm onAddWorkOrder={handleAddWorkOrder} />
      </Modal>

      {/* View/Edit Work Order Modal */}
      {selectedWorkOrder && (
        <Modal
          isOpen={showWorkOrderDetailsModal}
          onClose={() => {
            setShowWorkOrderDetailsModal(false);
            setSelectedWorkOrder(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Work Order" : "Work Order Details"}
        >
          <WorkOrderDetailsForm
            workOrder={selectedWorkOrder}
            isEditing={isEditing}
            onSave={handleUpdateWorkOrder}
            onCancel={() => {
              setShowWorkOrderDetailsModal(false);
              setSelectedWorkOrder(null);
              setIsEditing(false);
            }}
            onComplete={handleCompleteWorkOrder}
            onPrint={handlePrintWorkOrder}
          />
        </Modal>
      )}
  
      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-5 text-center py-3">
          <AlertTriangle className="text-red-500 text-5xl mx-auto animate-pulse" />
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this record? This action cannot be undone.</p>
          <div className="flex justify-center space-x-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => recordToDelete && handleDelete(recordToDelete)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default WorkOrdersDashboard;
