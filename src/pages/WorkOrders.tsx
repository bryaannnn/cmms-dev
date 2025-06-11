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
  FiClock,
  FiUser,
  FiCalendar,
  FiFlag,
  FiStar,
  FiPrinter,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type WorkOrderStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold";
type WorkOrderPriority = "low" | "medium" | "high" | "critical";
type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assignedTo: string;
  assignedToAvatar: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  completedAt: string;
  assetId: string;
  assetName: string;
  assetType: string;
  estimatedHours: number;
  actualHours: number;
  cost: number;
  checklistItems: { id: string; task: string; completed: boolean }[];
  notes: string[];
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

interface AddWorkOrderFormProps {
  onAddWorkOrder: (workOrder: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost">) => void;
}

const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ onAddWorkOrder }) => {
  const [formData, setFormData] = useState<Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost">>({
    title: "",
    description: "",
    type: "preventive",
    status: "pending",
    priority: "medium",
    assignedTo: "John Doe",
    assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
    createdBy: "System Admin",
    createdAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    assetId: "",
    assetName: "",
    assetType: "",
    estimatedHours: 0,
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
      description: "",
      type: "preventive",
      status: "pending",
      priority: "medium",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "System Admin",
      createdAt: new Date().toISOString().split("T")[0],
      dueDate: "",
      assetId: "",
      assetName: "",
      assetType: "",
      estimatedHours: 0,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Work Order Title*
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
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
          className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Work Order Type*
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="preventive">Preventive Maintenance</option>
            <option value="corrective">Corrective Maintenance</option>
            <option value="inspection">Inspection</option>
            <option value="emergency">Emergency Repair</option>
          </select>
        </div>

        <div>
          <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
            Priority*
          </label>
          <select
            id="priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
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
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
            Assigned To*
          </label>
          <select
            id="assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            required
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          >
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Robert Johnson">Robert Johnson</option>
            <option value="Emily Davis">Emily Davis</option>
          </select>
        </div>

        <div>
          <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            type="number"
            id="estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            min="0"
            step="0.5"
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
          />
        </div>
      </div>

      <div>
        <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
          Due Date*
        </label>
        <input
          type="date"
          id="dueDate"
          name="dueDate"
          value={formData.dueDate}
          onChange={handleChange}
          required
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
          Create Work Order
        </motion.button>
      </div>
    </form>
  );
};

interface WorkOrderDetailsFormProps {
  workOrder: WorkOrder;
  isEditing: boolean;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
  onComplete: (workOrder: WorkOrder) => void;
  onPrint: (workOrder: WorkOrder) => void;
}

const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint }) => {
  const [formData, setFormData] = useState<WorkOrder>(workOrder);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newNote, setNewNote] = useState("");

  useEffect(() => {
    setFormData(workOrder);
  }, [workOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    }));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklistItems: [
          ...prev.checklistItems,
          {
            id: `item-${Date.now()}`,
            task: newChecklistItem,
            completed: false,
          },
        ],
      }));
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((item) => item.id !== id),
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFormData((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote],
      }));
      setNewNote("");
    }
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCompleteWorkOrder = (workOrder: WorkOrder) => {
    const completedWorkOrder: WorkOrder = {
      ...workOrder,
      status: "completed", // This must match the WorkOrderStatus type
      completedAt: new Date().toISOString().split("T")[0],
      actualHours: workOrder.actualHours || workOrder.estimatedHours,
    };
    onComplete(completedWorkOrder);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
            Work Order ID
          </label>
          <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
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
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="preventive">Preventive Maintenance</option>
            <option value="corrective">Corrective Maintenance</option>
            <option value="inspection">Inspection</option>
            <option value="emergency">Emergency Repair</option>
          </select>
        </div>

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
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-assignedTo" className="block text-sm font-medium text-gray-700">
            Assigned To
          </label>
          <select
            id="detail-assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Robert Johnson">Robert Johnson</option>
            <option value="Emily Davis">Emily Davis</option>
          </select>
        </div>

        <div>
          <label htmlFor="detail-createdBy" className="block text-sm font-medium text-gray-700">
            Created By
          </label>
          <input
            type="text"
            id="detail-createdBy"
            name="createdBy"
            value={formData.createdBy}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-createdAt" className="block text-sm font-medium text-gray-700">
            Created At
          </label>
          <input
            type="date"
            id="detail-createdAt"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
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
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      {formData.completedAt && (
        <div>
          <label htmlFor="detail-completedAt" className="block text-sm font-medium text-gray-700">
            Completed At
          </label>
          <input
            type="date"
            id="detail-completedAt"
            name="completedAt"
            value={formData.completedAt}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
          />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
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
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-estimatedHours" className="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            type="number"
            id="detail-estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            readOnly={!isEditing}
            min="0"
            step="0.5"
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div>
          <label htmlFor="detail-actualHours" className="block text-sm font-medium text-gray-700">
            Actual Hours
          </label>
          <input
            type="number"
            id="detail-actualHours"
            name="actualHours"
            value={formData.actualHours || ""}
            onChange={handleChange}
            readOnly={!isEditing}
            min="0"
            step="0.5"
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="detail-cost" className="block text-sm font-medium text-gray-700">
          Cost ($)
        </label>
        <input
          type="number"
          id="detail-cost"
          name="cost"
          value={formData.cost || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          min="0"
          step="0.01"
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
        <div className="space-y-2">
          {formData.checklistItems.map((item) => (
            <div key={item.id} className="flex items-center">
              <input type="checkbox" id={`checklist-${item.id}`} checked={item.completed} onChange={() => handleChecklistToggle(item.id)} disabled={!isEditing} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-200 rounded" />
              <label htmlFor={`checklist-${item.id}`} className={`ml-2 ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
                {item.task}
              </label>
              {isEditing && (
                <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="ml-auto text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="mt-2 flex">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="Add new checklist item"
              className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="button" onClick={handleAddChecklistItem} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
              Add
            </button>
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <div className="space-y-3">
          {formData.notes.map((note, index) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg relative">
              <p className="text-gray-700">{note}</p>
              {isEditing && (
                <button type="button" onClick={() => handleRemoveNote(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add new note" rows={2} className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          <button type="button" onClick={handleAddNote} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <div className="flex space-x-3">
          {formData.status !== "completed" && (
            <motion.button
              type="button"
              onClick={() => handleCompleteWorkOrder(formData)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FiCheckCircle className="mr-2" />
              Complete
            </motion.button>
          )}

          <motion.button
            type="button"
            onClick={() => onPrint(formData)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FiPrinter className="mr-2" />
            Print
          </motion.button>
        </div>

        <div className="flex space-x-3">
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
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [workOrdersPerPage] = useState(5);
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

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
    {
      id: "WO-001",
      title: "HVAC System Preventive Maintenance",
      description: "Quarterly preventive maintenance for HVAC system in Building A",
      type: "preventive",
      status: "completed",
      priority: "medium",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "System Admin",
      createdAt: "2023-10-01",
      dueDate: "2023-10-15",
      completedAt: "2023-10-14",
      assetId: "AST-001",
      assetName: "HVAC System",
      assetType: "mechanical",
      estimatedHours: 4,
      actualHours: 3.5,
      cost: 350,
      checklistItems: [
        { id: "1", task: "Check refrigerant levels", completed: true },
        { id: "2", task: "Clean condenser coils", completed: true },
        { id: "3", task: "Inspect electrical connections", completed: true },
        { id: "4", task: "Lubricate moving parts", completed: true },
      ],
      notes: ["Found minor leak in refrigerant line - repaired", "System running efficiently after maintenance"],
    },
    {
      id: "WO-002",
      title: "Forklift Repair",
      description: "Repair hydraulic leak in forklift #3",
      type: "corrective",
      status: "in-progress",
      priority: "high",
      assignedTo: "Jane Smith",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
      createdBy: "Warehouse Manager",
      createdAt: "2023-10-05",
      dueDate: "2023-10-10",
      completedAt: "",
      assetId: "AST-002",
      assetName: "Forklift",
      assetType: "vehicle",
      estimatedHours: 2,
      actualHours: 1.5,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Identify leak source", completed: true },
        { id: "2", task: "Replace damaged hose", completed: true },
        { id: "3", task: "Refill hydraulic fluid", completed: false },
        { id: "4", task: "Test operation", completed: false },
      ],
      notes: ["Leak identified in main hydraulic hose", "Waiting for replacement part to arrive"],
    },
    {
      id: "WO-003",
      title: "Emergency Generator Inspection",
      description: "Monthly inspection of emergency generator",
      type: "inspection",
      status: "pending",
      priority: "medium",
      assignedTo: "Robert Johnson",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
      createdBy: "Facility Manager",
      createdAt: "2023-10-10",
      dueDate: "2023-10-12",
      completedAt: "",
      assetId: "AST-005",
      assetName: "Emergency Generator",
      assetType: "electrical",
      estimatedHours: 1,
      actualHours: 0,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Check oil level", completed: false },
        { id: "2", task: "Inspect battery", completed: false },
        { id: "3", task: "Test run", completed: false },
      ],
      notes: [],
    },
    {
      id: "WO-004",
      title: "Conveyor Belt Motor Replacement",
      description: "Replace failed motor on production line 2 conveyor",
      type: "corrective",
      status: "pending",
      priority: "critical",
      assignedTo: "Emily Davis",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
      createdBy: "Production Supervisor",
      createdAt: "2023-10-11",
      dueDate: "2023-10-11",
      completedAt: "",
      assetId: "AST-003",
      assetName: "Conveyor Belt Motor",
      assetType: "mechanical",
      estimatedHours: 3,
      actualHours: 0,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Shut down power", completed: false },
        { id: "2", task: "Remove old motor", completed: false },
        { id: "3", task: "Install new motor", completed: false },
        { id: "4", task: "Test operation", completed: false },
      ],
      notes: ["Production line 2 is currently down", "New motor is in stock"],
    },
    {
      id: "WO-005",
      title: "Office Building Safety Inspection",
      description: "Quarterly safety inspection for Office Building A",
      type: "inspection",
      status: "on-hold",
      priority: "low",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "Safety Officer",
      createdAt: "2023-10-01",
      dueDate: "2023-10-31",
      completedAt: "",
      assetId: "AST-009",
      assetName: "Office Building A",
      assetType: "building",
      estimatedHours: 8,
      actualHours: 0,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Inspect fire extinguishers", completed: false },
        { id: "2", task: "Test emergency lighting", completed: false },
        { id: "3", task: "Check exit signs", completed: false },
        { id: "4", task: "Inspect stairwells", completed: false },
      ],
      notes: ["Waiting for safety inspection checklist from HQ"],
    },
    {
      id: "WO-006",
      title: "Water Pump Bearing Replacement",
      description: "Replace worn bearings in main water pump",
      type: "corrective",
      status: "completed",
      priority: "high",
      assignedTo: "Robert Johnson",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
      createdBy: "Maintenance Supervisor",
      createdAt: "2023-09-25",
      dueDate: "2023-09-28",
      completedAt: "2023-09-27",
      assetId: "AST-006",
      assetName: "Water Pump",
      assetType: "mechanical",
      estimatedHours: 2.5,
      actualHours: 3,
      cost: 420,
      checklistItems: [
        { id: "1", task: "Drain pump", completed: true },
        { id: "2", task: "Disassemble pump housing", completed: true },
        { id: "3", task: "Replace bearings", completed: true },
        { id: "4", task: "Reassemble and test", completed: true },
      ],
      notes: ["Bearings were severely worn", "Pump now operating quietly"],
    },
    {
      id: "WO-007",
      title: "Server Room AC Repair",
      description: "Repair AC unit in server room - not cooling properly",
      type: "emergency",
      status: "completed",
      priority: "critical",
      assignedTo: "Emily Davis",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
      createdBy: "IT Manager",
      createdAt: "2023-10-08",
      dueDate: "2023-10-08",
      completedAt: "2023-10-08",
      assetId: "",
      assetName: "Server Room AC Unit",
      assetType: "",
      estimatedHours: 1.5,
      actualHours: 2,
      cost: 275,
      checklistItems: [
        { id: "1", task: "Diagnose issue", completed: true },
        { id: "2", task: "Replace capacitor", completed: true },
        { id: "3", task: "Clean condenser", completed: true },
        { id: "4", task: "Monitor temperature", completed: true },
      ],
      notes: ["Failed capacitor was the issue", "Temperatures now stable"],
    },
    {
      id: "WO-008",
      title: "Company Car Oil Change",
      description: "Regular oil change for company car #2",
      type: "preventive",
      status: "pending",
      priority: "low",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "Fleet Manager",
      createdAt: "2023-10-12",
      dueDate: "2023-10-20",
      completedAt: "",
      assetId: "AST-008",
      assetName: "Company Car",
      assetType: "vehicle",
      estimatedHours: 0.5,
      actualHours: 0,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Change oil", completed: false },
        { id: "2", task: "Replace oil filter", completed: false },
        { id: "3", task: "Check fluid levels", completed: false },
      ],
      notes: [],
    },
    {
      id: "WO-009",
      title: "Industrial Robot Calibration",
      description: "Monthly calibration for assembly line robot",
      type: "preventive",
      status: "in-progress",
      priority: "medium",
      assignedTo: "Jane Smith",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
      createdBy: "Production Manager",
      createdAt: "2023-10-10",
      dueDate: "2023-10-12",
      completedAt: "",
      assetId: "AST-010",
      assetName: "Industrial Robot",
      assetType: "mechanical",
      estimatedHours: 1,
      actualHours: 0.5,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Check positioning accuracy", completed: true },
        { id: "2", task: "Calibrate sensors", completed: false },
        { id: "3", task: "Test operation", completed: false },
      ],
      notes: ["Initial accuracy check passed"],
    },
    {
      id: "WO-010",
      title: "Solar Inverter Diagnostic",
      description: "Diagnose intermittent power output issues",
      type: "corrective",
      status: "pending",
      priority: "high",
      assignedTo: "Robert Johnson",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
      createdBy: "Facility Manager",
      createdAt: "2023-10-12",
      dueDate: "2023-10-15",
      completedAt: "",
      assetId: "AST-004",
      assetName: "Solar Inverter",
      assetType: "electrical",
      estimatedHours: 2,
      actualHours: 0,
      cost: 0,
      checklistItems: [
        { id: "1", task: "Check DC input", completed: false },
        { id: "2", task: "Inspect AC output", completed: false },
        { id: "3", task: "Review error logs", completed: false },
      ],
      notes: [],
    },
  ]);

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "on-hold":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case "low":
        return "bg-gray-200 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: WorkOrderPriority) => {
    switch (priority) {
      case "low":
        return <FiFlag className="text-gray-500" />;
      case "medium":
        return <FiFlag className="text-blue-500" />;
      case "high":
        return <FiFlag className="text-orange-500" />;
      case "critical":
        return <FiFlag className="text-red-500" />;
      default:
        return <FiFlag className="text-gray-500" />;
    }
  };

  const openWorkOrderDetails = (workOrder: WorkOrder, editMode: boolean) => {
    setSelectedWorkOrder(workOrder);
    setIsEditing(editMode);
    setShowWorkOrderDetailsModal(true);
  };

  const handleAddWorkOrder = (newWorkOrderData: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost">) => {
    const newWorkOrder: WorkOrder = {
      ...newWorkOrderData,
      id: `WO-${String(workOrders.length + 1).padStart(3, "0")}`,
      checklistItems: [],
      notes: [],
      completedAt: "",
      actualHours: 0,
      cost: 0,
    };
    setWorkOrders([...workOrders, newWorkOrder]);
    setShowAddWorkOrderModal(false);
  };

  const handleUpdateWorkOrder = (updatedWorkOrderData: WorkOrder) => {
    setWorkOrders(workOrders.map((wo) => (wo.id === updatedWorkOrderData.id ? updatedWorkOrderData : wo)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    setIsEditing(false);
  };

  const handleCompleteWorkOrder = (completedWorkOrder: WorkOrder) => {
    setWorkOrders(workOrders.map((wo) => (wo.id === completedWorkOrder.id ? completedWorkOrder : wo)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    setIsEditing(false);
  };

  const handlePrintWorkOrder = (workOrder: WorkOrder) => {
    alert(`Printing work order ${workOrder.id}`);
    // In a real app, this would generate a PDF or open a print dialog
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = wo.title.toLowerCase().includes(searchQuery.toLowerCase()) || wo.id.toLowerCase().includes(searchQuery.toLowerCase()) || wo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    const matchesType = typeFilter === "all" || wo.type === typeFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType;
  });

  const indexOfLastWorkOrder = currentPage * workOrdersPerPage;
  const indexOfFirstWorkOrder = indexOfLastWorkOrder - workOrdersPerPage;
  const currentWorkOrders = filteredWorkOrders.slice(indexOfFirstWorkOrder, indexOfLastWorkOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / workOrdersPerPage);

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
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, sidebarOpen]);

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
            <FiClipboard className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Work Orders</h2>
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Work Orders Management</h1>
              <p className="text-gray-600 mt-1">Create, track and manage all maintenance work orders</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddWorkOrderModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Create Work Order</span>
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
            <StatCard title="Total Work Orders" value={workOrders.length.toString()} change="+15%" icon={<FiClipboard />} />
            <StatCard title="Completed" value={workOrders.filter((wo) => wo.status === "completed").length.toString()} change="+8%" icon={<FiCheckCircle />} />
            <StatCard title="In Progress" value={workOrders.filter((wo) => wo.status === "in-progress").length.toString()} change="-3%" icon={<FiClock />} />
            <StatCard title="Overdue" value={workOrders.filter((wo) => new Date(wo.dueDate) < new Date() && wo.status !== "completed").length.toString()} change="+2" icon={<FiAlertTriangle />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search work orders by title, ID, or description..."
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
                      onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>

                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
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
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
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
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Work Orders Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {currentWorkOrders.length > 0 ? (
                    currentWorkOrders.map((workOrder) => (
                      <motion.tr
                        key={workOrder.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                              <FiClipboard className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-900">{workOrder.title}</div>
                              <div className="text-sm text-gray-600">{workOrder.id}</div>
                              {workOrder.assetName && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Asset: {workOrder.assetName} ({workOrder.assetId})
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm capitalize text-gray-900">
                            {workOrder.type
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPriorityIcon(workOrder.priority)}
                            <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(workOrder.status)} text-white shadow-sm`}>
                            {workOrder.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img src={workOrder.assignedToAvatar} alt={workOrder.assignedTo} className="w-8 h-8 rounded-full border border-blue-200" />
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{workOrder.assignedTo}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(workOrder.dueDate).toLocaleDateString()}</div>
                          <div className={`text-xs ${new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "text-red-600" : "text-gray-500"}`}>
                            {new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "Overdue" : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(workOrder, false)}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(workOrder, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Work Order"
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
                        No work orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Pagination */}
          {filteredWorkOrders.length > workOrdersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstWorkOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastWorkOrder, filteredWorkOrders.length)}</span> of{" "}
                <span className="font-semibold">{filteredWorkOrders.length}</span> results
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
    </div>
  );
};

export default WorkOrdersDashboard;
