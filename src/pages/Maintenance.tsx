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
  FiCheck,
  FiXCircle,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import FormMesin from "@/component/MachineHistory/FormMesin";

type WorkOrderStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold" | "approved" | "rejected";
type WorkOrderPriority = "low" | "medium" | "high" | "critical";
type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency" | "calibration";
type WorkOrderSection = "production" | "facilities" | "utilities" | "lab" | "warehouse";

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
  section: WorkOrderSection;
  subSection: string;
  requester: string;
  requesterDepartment: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNotes: string[];
  escalationLevel: number;

  // Machine History specific fields
  date: string;
  shift: string;
  group: string;
  stopJam: string;
  stopMenit: string;
  startJam: string;
  startMenit: string;
  stopTime: string;
  unit: string;
  mesin: string;
  runningHour: string;
  itemTrouble: string;
  jenisGangguan: string;
  bentukTindakan: string;
  perbaikanPerawatan: string;
  rootCause: string;
  jenisAktivitas: string;
  kegiatan: string;
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: string;
  unitSparePart: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

interface AddWorkOrderFormProps {
  onAddWorkOrder: (workOrder: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "approvalNotes" | "escalationLevel">) => void;
}

interface WorkOrderDetailsFormProps {
  workOrder: WorkOrder;
  isEditing: boolean;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
  onComplete: (workOrder: WorkOrder) => void;
  onPrint: (workOrder: WorkOrder) => void;
  onDelete: (id: string) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-10 py-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-600">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <FiX />
          </motion.button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint, onDelete }) => {
  const [formData, setFormData] = useState<WorkOrder>(workOrder);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newApprovalNote, setNewApprovalNote] = useState("");
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const handleCompleteWorkOrder = () => {
    const completedWorkOrder: WorkOrder = {
      ...formData,
      status: "completed",
      completedAt: new Date().toISOString().split("T")[0],
      actualHours: formData.actualHours || formData.estimatedHours,
    };
    onComplete(completedWorkOrder);
  };

  const handleApprove = () => {
    const approvedWorkOrder: WorkOrder = {
      ...formData,
      approvalStatus: "approved",
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, newApprovalNote] : formData.approvalNotes,
      status: "in-progress",
    };
    onSave(approvedWorkOrder);
    setNewApprovalNote("");
  };

  const handleReject = () => {
    const rejectedWorkOrder: WorkOrder = {
      ...formData,
      approvalStatus: "rejected",
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, newApprovalNote] : formData.approvalNotes,
      status: "cancelled",
    };
    onSave(rejectedWorkOrder);
    setNewApprovalNote("");
  };

  const handleEscalate = () => {
    const escalatedWorkOrder: WorkOrder = {
      ...formData,
      escalationLevel: formData.escalationLevel + 1,
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, `Escalated to level ${formData.escalationLevel + 1}: ${newApprovalNote}`] : formData.approvalNotes,
    };
    onSave(escalatedWorkOrder);
    setNewApprovalNote("");
  };

  const handleDelete = () => {
    onDelete(formData.id);
    setShowDeleteConfirm(false);
    onCancel();
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
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Machine History Specific Fields */}
      <div className="border-t border-gray-200 pt-4">
        <h3 className="text-lg font-medium text-blue-600 mb-4">Machine History Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="detail-date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              id="detail-date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
          <div>
            <label htmlFor="detail-shift" className="block text-sm font-medium text-gray-700">
              Shift
            </label>
            <input
              type="text"
              id="detail-shift"
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="detail-unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <input
              type="text"
              id="detail-unit"
              name="unit"
              value={formData.unit}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
          <div>
            <label htmlFor="detail-mesin" className="block text-sm font-medium text-gray-700">
              Mesin
            </label>
            <input
              type="text"
              id="detail-mesin"
              name="mesin"
              value={formData.mesin}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
        </div>

        <div className="mt-4">
          <label htmlFor="detail-jenisGangguan" className="block text-sm font-medium text-gray-700">
            Jenis Gangguan/Kerusakan
          </label>
          <textarea
            id="detail-jenisGangguan"
            name="jenisGangguan"
            value={formData.jenisGangguan}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={3}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="detail-bentukTindakan" className="block text-sm font-medium text-gray-700">
            Bentuk Tindakan
          </label>
          <textarea
            id="detail-bentukTindakan"
            name="bentukTindakan"
            value={formData.bentukTindakan}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={3}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div className="mt-4">
          <label htmlFor="detail-rootCause" className="block text-sm font-medium text-gray-700">
            Root Cause
          </label>
          <textarea
            id="detail-rootCause"
            name="rootCause"
            value={formData.rootCause}
            onChange={handleChange}
            readOnly={!isEditing}
            rows={3}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
          <div>
            <label htmlFor="detail-jenisAktivitas" className="block text-sm font-medium text-gray-700">
              Jenis Aktivitas
            </label>
            <input
              type="text"
              id="detail-jenisAktivitas"
              name="jenisAktivitas"
              value={formData.jenisAktivitas}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
          <div>
            <label htmlFor="detail-kegiatan" className="block text-sm font-medium text-gray-700">
              Kegiatan
            </label>
            <input
              type="text"
              id="detail-kegiatan"
              name="kegiatan"
              value={formData.kegiatan}
              onChange={handleChange}
              readOnly={!isEditing}
              className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
            />
          </div>
        </div>

        {/* Spare Parts Information */}
        <div className="border-t border-gray-200 pt-4 mt-4">
          <h4 className="text-md font-medium text-blue-600 mb-4">Spare Parts Information</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label htmlFor="detail-kodePart" className="block text-sm font-medium text-gray-700">
                Kode Part
              </label>
              <input
                type="text"
                id="detail-kodePart"
                name="kodePart"
                value={formData.kodePart}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
              />
            </div>
            <div>
              <label htmlFor="detail-sparePart" className="block text-sm font-medium text-gray-700">
                Spare Part
              </label>
              <input
                type="text"
                id="detail-sparePart"
                name="sparePart"
                value={formData.sparePart}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
              />
            </div>
            <div>
              <label htmlFor="detail-jumlah" className="block text-sm font-medium text-gray-700">
                Jumlah
              </label>
              <input
                type="text"
                id="detail-jumlah"
                name="jumlah"
                value={formData.jumlah}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
              />
            </div>
            <div>
              <label htmlFor="detail-unitSparePart" className="block text-sm font-medium text-gray-700">
                Unit
              </label>
              <input
                type="text"
                id="detail-unitSparePart"
                name="unitSparePart"
                value={formData.unitSparePart}
                onChange={handleChange}
                readOnly={!isEditing}
                className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between space-x-3 mt-6">
        <div className="flex space-x-3">
          {isEditing && (
            <motion.button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200"
            >
              <FiTrash2 className="mr-2" />
              Delete
            </motion.button>
          )}
          {formData.status !== "completed" && formData.approvalStatus === "approved" && (
            <motion.button
              type="button"
              onClick={handleCompleteWorkOrder}
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-700 mb-6">Are you sure you want to delete this work order? This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
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
  const [sectionFilter, setSectionFilter] = useState<WorkOrderSection | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [workOrdersPerPage] = useState(5);
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);

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
      case "approved":
        return "bg-green-300";
      case "rejected":
        return "bg-red-300";
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

  const handleAddWorkOrder = (newWorkOrderData: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "approvalNotes" | "escalationLevel">) => {
    const newWorkOrder: WorkOrder = {
      ...newWorkOrderData,
      id: `TD-WO-${String(workOrders.length + 1).padStart(3, "0")}`,
      checklistItems: [],
      notes: [],
      completedAt: "",
      actualHours: 0,
      cost: 0,
      approvalNotes: [],
      escalationLevel: 0,
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

  const handleDeleteWorkOrder = (id: string) => {
    setWorkOrders(workOrders.filter((wo) => wo.id !== id));
  };

  const handlePrintWorkOrder = (workOrder: WorkOrder) => {
    alert(`Printing work order ${workOrder.id}`);
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch =
      wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      wo.mesin.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    const matchesType = typeFilter === "all" || wo.type === typeFilter;
    const matchesSection = sectionFilter === "all" || wo.section === sectionFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesSection;
  });

  const indexOfLastWorkOrder = currentPage * workOrdersPerPage;
  const indexOfFirstWorkOrder = indexOfLastWorkOrder - workOrdersPerPage;
  const currentWorkOrders = filteredWorkOrders.slice(indexOfFirstWorkOrder, indexOfLastWorkOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / workOrdersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, sectionFilter, sidebarOpen]);

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

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
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
                <div className="rounded-lg flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                  <p className="text-blue-600 font-bold">CMMS</p>
                </div>
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
              <NavItem icon={<FiClipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiClipboard className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Machine History</h2>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Machine History System</h1>
              <p className="text-gray-600 mt-1">Track and manage all machine maintenance history</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => navigate("/machinehistory/input")}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Create New Record</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Records" value={workOrders.length.toString()} change="+15%" icon={<FiClipboard />} />
            <StatCard title="Completed" value={workOrders.filter((wo) => wo.status === "completed").length.toString()} change="+8%" icon={<FiCheckCircle />} />
            <StatCard title="In Progress" value={workOrders.filter((wo) => wo.status === "in-progress").length.toString()} change="-3%" icon={<FiClock />} />
            <StatCard title="Pending Approval" value={workOrders.filter((wo) => wo.approvalStatus === "pending").length.toString()} change="+2" icon={<FiAlertTriangle />} />
          </div>

          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search records by machine, ID, or description..."
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
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
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
                      <option value="calibration">Calibration</option>
                    </select>
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value as WorkOrderSection | "all")}
                    >
                      <option value="all">All Sections</option>
                      <option value="production">Production</option>
                      <option value="facilities">Facilities</option>
                      <option value="utilities">Utilities</option>
                      <option value="lab">Laboratory</option>
                      <option value="warehouse">Warehouse</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Machine</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shift/Group</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
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
                          <div className="text-sm font-medium text-gray-900">{workOrder.id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(workOrder.date).toLocaleDateString()}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{workOrder.mesin}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{workOrder.unit}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Shift {workOrder.shift} / Group {workOrder.group}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900 line-clamp-2">{workOrder.jenisGangguan}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(workOrder.status)} text-white shadow-sm`}>
                            {workOrder.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </motion.span>
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
                            title="Edit Record"
                          >
                            <FiEdit className="text-lg" />
                            <span>Edit</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No machine history records found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredWorkOrders.length > workOrdersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
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

      {selectedWorkOrder && (
        <Modal
          isOpen={showWorkOrderDetailsModal}
          onClose={() => {
            setShowWorkOrderDetailsModal(false);
            setSelectedWorkOrder(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Machine History Record" : "Machine History Details"}
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
            onDelete={handleDeleteWorkOrder}
          />
        </Modal>
      )}
    </div>
  );
};

export default WorkOrdersDashboard;
