import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderData } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Clipboard,
  Filter,
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
  User as UserIcon,
  ChevronLeft,
} from "lucide-react";
import Sidebar from "../../../component/Sidebar";

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
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 border border-blue-100 max-h-[90vh] overflow-y-auto">
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

// Add the AssignModal component
interface AssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAssign: (orderId: number, technicianId: string) => void;
  workOrder: any;
  technicians: any[];
}

const AssignModal: React.FC<AssignModalProps> = ({ isOpen, onClose, onAssign, workOrder, technicians }) => {
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  const handleAssignOrder = () => {
    if (workOrder && selectedTechnician) {
      onAssign(workOrder.id, selectedTechnician);
      onClose();
    }
  };

  if (!isOpen || !workOrder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Assign Work Order #${workOrder.work_order_no || workOrder.id}`}>
      <div className="space-y-4">
        <p className="text-gray-700">
          Work Order <strong>#{workOrder.work_order_no || workOrder.id}</strong> from <strong>{workOrder.requester.name}</strong> needs to be assigned.
        </p>
        <div>
          <label htmlFor="technician-select" className="block text-sm font-medium text-gray-700 mb-1">
            Select Technician
          </label>
          <select
            id="technician-select"
            value={selectedTechnician}
            onChange={(e) => setSelectedTechnician(e.target.value)}
            className="mt-1 block w-full pl-3 pr-10 py-2.5 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
          >
            <option value="">Select Technician</option>
            {technicians.map((tech) => (
              <option key={tech.id} value={tech.id}>
                {tech.name} - {tech.department?.name || tech.department_name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex justify-end space-x-3 pt-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm">
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAssignOrder}
            disabled={!selectedTechnician}
            className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${!selectedTechnician ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
          >
            Assign
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

interface WorkOrderDetailsProps {
  workOrder: WorkOrderData;
  onClose?: () => void;
  isNested?: boolean;
}

const WorkOrderDetails: React.FC<WorkOrderDetailsProps> = ({ workOrder, onClose, isNested = false }) => {
  if (!workOrder) return null;

  return (
    <div className="space-y-6">
      <section>
        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">General Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Work Order No</p>
            <p className="font-semibold">{workOrder.work_order_no || workOrder.id}</p>
          </div>
          <div>
            <p className="text-gray-500">Date</p>
            <p className="font-semibold">{new Date(workOrder.date).toLocaleDateString()}</p>
          </div>
          <div>
            <p className="text-gray-500">Reception Method</p>
            <p className="font-semibold">{workOrder.reception_method}</p>
          </div>
          <div>
            <p className="text-gray-500">Requester</p>
            <p className="font-semibold">{workOrder.requester.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Department</p>
            <p className="font-semibold">{workOrder.department_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Known By</p>
            <p className="font-semibold">{workOrder.known_by.name}</p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Service Details</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Service Type</p>
            <p className="font-semibold">{workOrder.service_type.group_name}</p>
          </div>
          <div>
            <p className="text-gray-500">Service</p>
            <p className="font-semibold">{workOrder.service.owner.name}</p>
          </div>
          <div>
            <p className="text-gray-500">No Asset</p>
            <p className="font-semibold">{workOrder.asset_no}</p>
          </div>
          <div>
            <p className="text-gray-500">Device Information</p>
            <p className="font-semibold">{workOrder.device_info}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Complaint</p>
            <p className="font-semibold break-words whitespace-pre-wrap">{workOrder.complaint}</p>
          </div>
        </div>
      </section>

      <section>
        <h4 className="text-lg font-bold text-gray-800 mb-3 border-b pb-2">Handling Information</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Ticket Status</p>
            <p className="font-semibold">{workOrder.handling_status}</p>
          </div>
          <div>
            <p className="text-gray-500">Assigned To</p>
            <p className="font-semibold">{workOrder.assigned_to?.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Handling Date</p>
            <p className="font-semibold">{workOrder.handling_date ? new Date(workOrder.handling_date).toLocaleString() : "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Action Taken</p>
            <p className="font-semibold break-words whitespace-pre-wrap">{workOrder.action_taken || "N/A"}</p>
          </div>
          <div className="md:col-span-2">
            <p className="text-gray-500">Remarks</p>
            <p className="font-semibold break-words whitespace-pre-wrap">{workOrder.remarks || "N/A"}</p>
          </div>
        </div>
      </section>

      {!isNested && (
        <div className="flex justify-end pt-4">
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={onClose}
            className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Close
          </motion.button>
        </div>
      )}
    </div>
  );
};

interface EditAssignmentFormProps {
  workOrder: any;
  onSave: (order: any) => void;
  onCancel: () => void;
  isSaving: boolean;
  technicians: any[];
}

const EditAssignmentForm: React.FC<EditAssignmentFormProps> = ({ workOrder, onSave, onCancel, isSaving, technicians }) => {
  const [formData, setFormData] = useState({
    handling_date: workOrder.handling_date?.substring(0, 16) || "",
    action_taken: workOrder.action_taken || "",
    handling_status: workOrder.handling_status || "",
    remarks: workOrder.remarks || "",
    assigned_to_id: workOrder.assigned_to_id || "",
  });

  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    setFormData({
      handling_date: workOrder.handling_date?.substring(0, 16) || "",
      action_taken: workOrder.action_taken || "",
      handling_status: workOrder.handling_status || "",
      remarks: workOrder.remarks || "",
      assigned_to_id: workOrder.assigned_to_id || "",
    });
  }, [workOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.handling_date || !formData.action_taken || !formData.handling_status) {
      setFormError("Handling Date, Action Taken, and Ticket Status must be filled out.");
      return;
    }
    setFormError(null);
    onSave({ ...workOrder, ...formData });
  };

  const isResolved = workOrder.handling_status === "Resolved" || workOrder.handling_status === "Done" || workOrder.handling_status === "Cancel";

  return (
    <div className="space-y-6">
      <WorkOrderDetails workOrder={workOrder} isNested={true} />

      <h4 className="text-lg font-bold text-gray-800 mb-2 border-b pb-2">Edit Assignment</h4>
      <form onSubmit={handleSubmit} className="space-y-4">
        {formError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{formError}</span>
          </div>
        )}
        <div>
          <label htmlFor="handling_status" className="block text-sm font-medium text-gray-700">
            Ticket Status *
          </label>
          <select
            id="handling_status"
            name="handling_status"
            value={formData.handling_status}
            onChange={handleChange}
            required
            disabled={isResolved || isSaving}
            className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          >
            <option value="">Select Status</option>
            {workOrder.handling_status === "New" && (
              <>
                <option value="In Progress">In Progress</option>
                <option value="Assigned">Assigned</option>
              </>
            )}
            {(workOrder.handling_status === "New" || workOrder.handling_status === "In Progress") && (
              <>
                <option value="Escalated">Escalated</option>
                <option value="Vendor Handled">Vendor Handled</option>
                <option value="Resolved">Resolved</option>
              </>
            )}
            {workOrder.handling_status === "Assigned" && (
              <>
                <option value="In Progress">In Progress</option>
                <option value="Escalated">Escalated</option>
                <option value="Vendor Handled">Vendor Handled</option>
                <option value="Resolved">Resolved</option>
              </>
            )}
          </select>
        </div>
        // Add this condition to show the technician selection for specific statuses
        {(formData.handling_status === "Assigned" || formData.handling_status === "Escalated" || formData.handling_status === "Vendor Handled") && (
          <div>
            <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700">
              Assign To Technician
            </label>
            <select
              id="assigned_to_id"
              name="assigned_to_id"
              value={formData.assigned_to_id}
              onChange={handleChange}
              disabled={isSaving}
              className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
            >
              <option value="">Select Technician</option>
              {technicians.map((tech) => (
                <option key={tech.id} value={tech.id}>
                  {tech.name} - {tech.department?.name || tech.department_name}
                </option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="handling_date" className="block text-sm font-medium text-gray-700">
            Handling Date *
          </label>
          <input
            type="datetime-local"
            id="handling_date"
            name="handling_date"
            value={formData.handling_date}
            onChange={handleChange}
            required
            disabled={isSaving}
            className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          />
        </div>
        <div>
          <label htmlFor="action_taken" className="block text-sm font-medium text-gray-700">
            Action Taken *
          </label>
          <textarea
            id="action_taken"
            name="action_taken"
            value={formData.action_taken}
            onChange={handleChange}
            rows={3}
            required
            disabled={isSaving}
            className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          ></textarea>
        </div>
        <div>
          <label htmlFor="remarks" className="block text-sm font-medium text-gray-700">
            Remarks
          </label>
          <textarea
            id="remarks"
            name="remarks"
            value={formData.remarks}
            onChange={handleChange}
            rows={3}
            disabled={isSaving}
            className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 disabled:opacity-50"
          ></textarea>
        </div>
        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isSaving}
            className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            Cancel
          </motion.button>
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            disabled={isSaving || isResolved}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </motion.button>
        </div>
      </form>
    </div>
  );
};

const ITReceiver: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [showEditAssignmentModal, setShowEditAssignmentModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [technicians, setTechnicians] = useState<any[]>([]);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const { user, getWorkOrdersIT, updateWorkOrderIT, getUsers, hasPermission } = useAuth();

  const isAssignment = location.pathname === "/workorders/it/assignment";
  const isReports = location.pathname === "/workorders/it/reports";
  const isKnowledgeBase = location.pathname === "/workorders/it/knowledgebase";
  const isRequest = location.pathname === "/workorders/it";
  const isReceiver = location.pathname === "/workorders/it/receiver";
  const isApprover = location.pathname === "/workorders/it/approver";

  // Receiver.tsx
  const fetchWorkOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Ambil semua work order
      const allOrders = await getWorkOrdersIT();

      // Filter hanya yang service_owner-nya sesuai dengan user yang login
      const userOrders = allOrders.filter((order) => {
        // Beberapa kemungkinan struktur service owner
        const serviceOwnerId =
          order.service?.owner?.id || // Struktur Service4
          order.service?.service_owner; // Alternatif properti langsung
        return serviceOwnerId === Number(user?.id);
      });

      setWorkOrders(userOrders);
    } catch (err: any) {
      setError(err.message || "Failed to load work orders.");
    } finally {
      setLoading(false);
    }
  }, [getWorkOrdersIT, user?.id]);

  const fetchTechnicians = useCallback(async () => {
    try {
      const users = await getUsers();
      // Filter users who are technicians (you might need to adjust this logic based on your user roles)
      const techUsers = users.filter((user) => user.roles?.includes("technician") || user.department?.name?.toLowerCase().includes("it") || user.position?.toLowerCase().includes("technician"));
      setTechnicians(techUsers);
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
    }
  }, [getUsers]);

  const updateWorkOrder = useCallback(
    async (id: number, patch: any) => {
      setIsSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        const updatedOrder = await updateWorkOrderIT({ ...patch, id });
        setWorkOrders((prev) => prev.map((order) => (order.id === id ? updatedOrder : order)));
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return updatedOrder;
      } catch (err: any) {
        setSaveError(err.message || "Failed to update work order.");
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [updateWorkOrderIT]
  );

  const handleResize = () => {
    setIsMobile(window.innerWidth < 768);
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const handleClickOutside = (event: MouseEvent) => {
    if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
      setShowNotificationsPopup(false);
    }
    if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
      setShowProfileMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);

    fetchWorkOrders();
    fetchTechnicians();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [fetchWorkOrders, fetchTechnicians]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-gray-500 text-white";
      case "Assigned":
        return "bg-blue-600 text-white";
      case "In Progress":
        return "bg-cyan-500 text-white";
      case "Escalated":
        return "bg-purple-500 text-white";
      case "Vendor Handled":
        return "bg-red-500 text-white";
      case "Resolved":
        return "bg-orange-500 text-white";
      case "Cancel":
        return "bg-gray-500 text-white";
      case "Closed":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const openWorkOrderDetails = useCallback(
    (orderId: number) => {
      const order = workOrders.find((o) => o.id === orderId);
      if (order) {
        setSelectedWorkOrder(order);
        setShowWorkOrderDetailsModal(true);
      }
    },
    [workOrders]
  );

  const openEditWorkOrder = useCallback(
    (orderId: number) => {
      const order = workOrders.find((o) => o.id === orderId);
      if (order) {
        setSelectedWorkOrder(order);
        setShowEditAssignmentModal(true);
      }
    },
    [workOrders]
  );

  const handleSaveAssignment = useCallback(
    async (updatedData: any) => {
      try {
        await updateWorkOrder(updatedData.id, updatedData);
        setShowEditAssignmentModal(false);
        setSelectedWorkOrder(null);
      } catch (error) {
        // Error is already handled in updateWorkOrder
      }
    },
    [updateWorkOrder]
  );

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders
    .filter((order) => {
      const matchesSearch =
        order.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.work_order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.complaint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(order.id).includes(searchQuery);
      const matchesStatus = statusFilter === "all" || order.handling_status === statusFilter;

      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const statusOrder = ["New", "Assigned", "In Progress", "Escalated", "Vendor Handled", "Resolved", "Done", "Cancel"];
      const statusA = a.handling_status;
      const statusB = b.handling_status;

      const indexA = statusOrder.indexOf(statusA);
      const indexB = statusOrder.indexOf(statusB);

      if (indexA === -1 && indexB === -1) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (indexA === -1) {
        return 1;
      }
      if (indexB === -1) {
        return -1;
      }

      if (indexA === indexB) {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }

      return indexA - indexB;
    });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleAssignClick = useCallback((order: any) => {
    setSelectedWorkOrder(order);
    setShowAssignModal(true);
  }, []);

  // Add the handleAssignOrder function
  const handleAssignOrder = useCallback(
    async (orderId: number, technicianId: string) => {
      try {
        await updateWorkOrder(orderId, {
          assigned_to_id: parseInt(technicianId),
          handling_status: "Assigned",
          handling_date: new Date().toISOString(),
        });
        setShowAssignModal(false);
        setSelectedWorkOrder(null);
      } catch (error) {
        console.error("Failed to assign work order:", error);
      }
    },
    [updateWorkOrder]
  );

  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, statusFilter, darkMode]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading work orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <AlertTriangle className="text-red-600 text-5xl" />
        <div className="ml-4">
          <p className="text-lg text-red-800">{error}</p>
          <button onClick={fetchWorkOrders} className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50">
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
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Work Order - Receiver</h2>
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
                      {filteredWorkOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{order.handling_status === "New" ? <AlertTriangle className="text-orange-500" /> : <Wrench className="text-blue-500" />}</div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Work Order #{order.id}</p>
                            <p className="text-xs text-gray-600 mt-1">{order.complaint}</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {new Date(order.date).toLocaleDateString()} at {new Date(order.date).toLocaleTimeString()}
                            </p>
                          </div>
                        </div>
                      ))}
                      {filteredWorkOrders.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="isi style mb-6 flex space-x-6 border-b border-gray-200">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isRequest ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Request
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/receiver")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReceiver ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Receiver
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/assignment")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isAssignment ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Assignment
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/reports")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReports ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Reports
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/knowledgebase")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isKnowledgeBase ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Knowledge Base
            </motion.div>
          </motion.div>

          {saveError && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{saveError}</span>
              <button onClick={() => setSaveError(null)} className="absolute top-0 right-0 p-3">
                <X size={16} />
              </button>
            </motion.div>
          )}

          {saveSuccess && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">Work order updated successfully!</span>
              <button onClick={() => setSaveSuccess(false)} className="absolute top-0 right-0 p-3">
                <X size={16} />
              </button>
            </motion.div>
          )}

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">IT Receiver</h1>
              <p className="text-gray-600 mt-1">Manage IT-related work orders as a service owner</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total IT Assignments" value={filteredWorkOrders.length.toString()} change="+8%" icon={<Clipboard />} />
            <StatCard title="In Progress" value={filteredWorkOrders.filter((wo) => ["In Progress", "Escalated", "Vendor Handled"].includes(wo.handling_status)).length.toString()} change="-1" icon={<Wrench />} />
            <StatCard title="Resolved" value={filteredWorkOrders.filter((wo) => ["Resolved", "Done"].includes(wo.handling_status)).length.toString()} change="+1" icon={<CheckCircle />} />
            <StatCard title="Assigned" value={filteredWorkOrders.filter((wo) => wo.handling_status === "Assigned").length.toString()} change="+3" icon={<Clock />} />
          </div>

          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search IT assignments..."
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
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Vendor Handled">Vendor Handled</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Done">Done</option>
                      <option value="Cancel">Cancel</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => {
                      const isResolved = order.handling_status === "Resolved" || order.handling_status === "Done" || order.handling_status === "Cancel";
                      const canEdit = !isResolved && hasPermission("edit_workorders");
                      const isNew = order.handling_status === "New";
                      const isInProgressOrSimilar = ["In Progress", "Escalated", "Vendor Handled"].includes(order.handling_status);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                          className="transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.work_order_no || order.id}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.requester.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.handling_status)} shadow-sm`}>{order.handling_status}</span>
                          </td>
                          {/* Updated Assigned To column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {isInProgressOrSimilar ? (
                              "N/A"
                            ) : isNew ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAssignClick(order)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                Click to Assign
                              </motion.button>
                            ) : (
                              order.assigned_to?.name || "N/A"
                            )}
                          </td>
                          {/* Updated Actions column */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openWorkOrderDetails(order.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye className="text-lg" />
                            </motion.button>

                            {canEdit && !isNew && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openEditWorkOrder(order.id)}
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Edit Assignment"
                              >
                                <Edit className="text-lg" />
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No IT work orders for assignment found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

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

      {selectedWorkOrder && (
        <Modal
          isOpen={showWorkOrderDetailsModal}
          onClose={() => {
            setShowWorkOrderDetailsModal(false);
            setSelectedWorkOrder(null);
          }}
          title="Work Order Details"
        >
          <WorkOrderDetails workOrder={selectedWorkOrder} onClose={() => setShowWorkOrderDetailsModal(false)} />
        </Modal>
      )}

      {selectedWorkOrder && (
        <AssignModal
          isOpen={showAssignModal}
          onClose={() => {
            setShowAssignModal(false);
            setSelectedWorkOrder(null);
          }}
          onAssign={handleAssignOrder}
          workOrder={selectedWorkOrder}
          technicians={technicians}
        />
      )}

      {selectedWorkOrder && (
        <Modal
          isOpen={showEditAssignmentModal}
          onClose={() => {
            setShowEditAssignmentModal(false);
            setSelectedWorkOrder(null);
          }}
          title="Edit Assignment"
        >
          <EditAssignmentForm workOrder={selectedWorkOrder} onSave={handleSaveAssignment} onCancel={() => setShowEditAssignmentModal(false)} isSaving={isSaving} technicians={technicians} />
        </Modal>
      )}
    </div>
  );
};

export default ITReceiver;
