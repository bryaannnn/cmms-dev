import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderFormData, User } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
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
  Printer,
  ChevronLeft,
} from "lucide-react";

// Interface for navigation items
interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

// NavItem component for sidebar navigation
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

// Interface for statistic cards
interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

// StatCard component to display key metrics
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

// Interface for modal properties
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

// Modal component for displaying pop-up content
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

// WorkOrderDetailsForm component for viewing/editing work order details
interface WorkOrderDetailsFormProps {
  workOrder: WorkOrderFormData;
  isEditing: boolean;
  onSave: (order: WorkOrderFormData) => void;
  onCancel: () => void;
  onComplete: (id: number) => void;
  onPrint: (id: number) => void;
  users?: User[]; // List of users for assignment (though assignment is typically admin only)
}

const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint, users }) => {
  const [formData, setFormData] = useState<WorkOrderFormData>(workOrder);

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
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          name="description"
          value={formData.description || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          rows={3}
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        ></textarea>
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
          <option value="open">Open</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="on_hold">On Hold</option>
          <option value="cancelled">Cancelled</option>
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
          className={`mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>
      <div>
        <label htmlFor="detail-assignedTo" className="block text-sm font-medium text-gray-700">
          Assigned To
        </label>
        <input
          type="text"
          id="detail-assignedTo"
          name="assignedTo"
          value={users?.find((u) => u.id === formData.assignedTo)?.name || "Not Assigned"}
          readOnly
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
        />
      </div>
      <div>
        <label htmlFor="detail-createdBy" className="block text-sm font-medium text-gray-700">
          Created By
        </label>
        <input type="text" id="detail-createdBy" value={formData.createdBy} readOnly className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
      </div>
      <div>
        <label htmlFor="detail-createdAt" className="block text-sm font-medium text-gray-700">
          Created At
        </label>
        <input
          type="text"
          id="detail-createdAt"
          value={new Date(formData.createdAt).toLocaleDateString()}
          readOnly
          className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
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
          value={formData.dueDate || ""}
          onChange={handleChange}
          readOnly={!isEditing}
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

// Main IT Receiver Work Orders component
const ITReceiver: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderFormData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [users, setUsers] = useState<User[]>([]); // State to store users for display

  // Use auth context for data operations and user permissions
  const { user, getWorkOrdersForUser, updateWorkOrder, deleteWorkOrder, getWorkOrderById, getUsers, hasPermission } = useAuth();
  const navigate = useNavigate();
  const [workOrders, setWorkOrders] = useState<WorkOrderFormData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isWorkOrdersIT = location.pathname === "/workorders/it";
  const isWorkOrdersTD = location.pathname === "/workorders/td";
  const isRequest = location.pathname === "/workorders/it";
  const isApprover = location.pathname === "/workorders/it/approver";
  const isAssignment = location.pathname === "/workorders/it/assignment";
  const isReceiver = location.pathname === "/workorders/it/receiver";
  const isReports = location.pathname === "/workorders/it/reports";
  const isKnowledgeBase = location.pathname === "/workorders/it/knowledgebase";

  // Effect for handling window resize
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

  // Effect for handling clicks outside notification/profile popups
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

  // Effect to load work orders from AuthContext for the current user (Receiver)
  useEffect(() => {
    const loadWorkOrders = async () => {
      if (!user?.id) {
        setLoading(false);
        setError("User not logged in or user ID not available.");
        return;
      }
      try {
        setLoading(true);
        setError(null);
        // Fetch work orders assigned to the current user, filtered by IT department
        const allOrders = await getWorkOrdersForUser(user.id);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);

        const filteredOrders = allOrders.filter((order) => order.assignedTo === user.id && order.assetType?.toLowerCase() === "it");
        setWorkOrders(filteredOrders);
      } catch (err) {
        console.error("Error loading work orders for receiver:", err);
        setError("Failed to load work orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkOrders();
  }, [getWorkOrdersForUser, user?.id, getUsers]); // Depend on getWorkOrdersForUser and user.id

  // Helper function to get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-gray-500 text-white";
      case "in_progress":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "on_hold":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
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

  // Open work order details modal
  const openWorkOrderDetails = useCallback(
    async (orderId: number, editMode: boolean) => {
      try {
        setLoading(true);
        setError(null);
        const order = await getWorkOrderById(orderId);
        setSelectedWorkOrder(order);
        setIsEditing(editMode);
        setShowWorkOrderDetailsModal(true);
      } catch (err) {
        console.error("Error fetching work order details:", err);
        setError("Failed to fetch work order details.");
      } finally {
        setLoading(false);
      }
    },
    [getWorkOrderById]
  );

  // Handle updating an existing work order
  const handleUpdateWorkOrder = useCallback(
    async (updatedOrderData: WorkOrderFormData) => {
      try {
        setLoading(true);
        setError(null);
        const updatedOrder = await updateWorkOrder(updatedOrderData.id, updatedOrderData);
        setWorkOrders((prev) => prev.map((order) => (order.id === updatedOrder.id ? updatedOrder : order)));
        setShowWorkOrderDetailsModal(false);
        setSelectedWorkOrder(null);
        setIsEditing(false);
      } catch (err) {
        console.error("Error updating work order:", err);
        setError("Failed to update work order.");
      } finally {
        setLoading(false);
      }
    },
    [updateWorkOrder]
  );

  // Handle marking a work order as completed
  const handleCompleteWorkOrder = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        const order = workOrders.find((o) => o.id === id);
        if (order) {
          const updatedOrder = await updateWorkOrder(id, { ...order, status: "completed" });
          setWorkOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
        }
        setShowWorkOrderDetailsModal(false);
        setSelectedWorkOrder(null);
      } catch (err) {
        console.error("Error completing work order:", err);
        setError("Failed to complete work order.");
      } finally {
        setLoading(false);
      }
    },
    [workOrders, updateWorkOrder]
  );

  // Set record to delete and show confirmation modal
  const handleDeleteClick = useCallback((id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  // Handle actual deletion of work order
  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        await deleteWorkOrder(id);
        setWorkOrders((prev) => prev.filter((order) => order.id !== id));
        setShowDeleteConfirm(false);
        setRecordToDelete(null);
      } catch (err) {
        console.error("Error deleting work order:", err);
        setError("Failed to delete work order.");
      } finally {
        setLoading(false);
      }
    },
    [deleteWorkOrder]
  );

  // Placeholder for print functionality
  const handlePrintWorkOrder = useCallback((id: number) => {
    console.log(`Printing Work Order ${id}... (Functionality not implemented)`);
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // Filter work orders based on search query, status, and priority
  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch =
      order.title.toLowerCase().includes(searchQuery.toLowerCase()) || String(order.id).includes(searchQuery.toLowerCase()) || (users.find((u) => u.id === order.assignedTo)?.name || "").toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || order.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || order.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Effect to reset page and handle dark mode
  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, statusFilter, priorityFilter, sidebarOpen, darkMode]);

  // Loading state UI
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading work orders...</p>
      </div>
    );
  }

  // Error state UI
  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <AlertTriangle className="text-red-600 text-5xl" />
        <p className="ml-4 text-lg text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header section */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Work Orders - Receiver</h2>
          </div>

          <div className="flex items-center space-x-3 relative">
            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>

            {/* Notifications dropdown */}
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
                      <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>
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

            {/* User profile dropdown */}
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

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          {hasPermission("assign_workorders") && (
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="isi style mb-6 flex space-x-6 border-b border-gray-200">
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/workorders/it")}
                className={`cursor-pointer px-4 py-3 text-sm font-medium ${isRequest ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
              >
                Index ini!
              </motion.div>
              <motion.div
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/workorders/it/approver")}
                className={`cursor-pointer px-4 py-3 text-sm font-medium ${isApprover ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
              >
                Approver
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
                onClick={() => navigate("/workorders/it/receiver")}
                className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReceiver ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
              >
                Receiver
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
          )}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Assigned Work Orders (IT)</h1>
              <p className="text-gray-600 mt-1">View and manage work orders assigned to you in the IT department.</p>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3 justify-end">
                <div className="relative w-full sm:w-auto">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-48 p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="all">All Statuses</option>
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="on_hold">On Hold</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full sm:w-48 p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
                <motion.button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Filter className="mr-2" size={20} /> Advanced Filters
                </motion.button>
              </div>
            </div>
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden mt-4 pt-4 border-t border-gray-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Additional filter options can go here */}
                    <p className="text-gray-500 col-span-full">More filter options coming soon!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Work Orders Table */}
          <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Assigned Work Orders</h3>
            {currentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-lg">No work orders found matching your criteria.</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned To
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priority
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {currentOrders.map((order) => (
                      <motion.tr key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.title}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                          <div className="flex items-center">
                            <img
                              src={
                                order.assignedToAvatar ||
                                `https://api.dicebear.com/7.x/initials/svg?seed=${users.find((u) => u.id === order.assignedTo)?.name || "N/A"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`
                              }
                              alt="Avatar"
                              className="w-8 h-8 rounded-full mr-3"
                            />
                            {users.find((u) => u.id === order.assignedTo)?.name || "N/A"}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>{order.status.replace(/_/g, " ")}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(order.priority)}`}>{order.priority}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.dueDate}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openWorkOrderDetails(order.id, true)}
                              className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openWorkOrderDetails(order.id, false)}
                              className="text-gray-600 hover:text-gray-900 p-1 rounded-full hover:bg-gray-50 transition-colors duration-200"
                              title="View Details"
                            >
                              <Eye size={18} />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => handleDeleteClick(order.id)}
                              className="text-red-600 hover:text-red-900 p-1 rounded-full hover:bg-red-50 transition-colors duration-200"
                              title="Delete"
                            >
                              <Trash2 size={18} />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {filteredWorkOrders.length > ordersPerPage && (
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <motion.button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </motion.button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to <span className="font-medium">{Math.min(indexOfLastOrder, filteredWorkOrders.length)}</span> of{" "}
                      <span className="font-medium">{filteredWorkOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <motion.button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </motion.button>
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </motion.button>
                    </nav>
                  </div>
                </div>
              </nav>
            )}
          </div>
        </main>
      </div>

      {/* Work Order Details Modal */}
      {selectedWorkOrder && (
        <Modal isOpen={showWorkOrderDetailsModal} onClose={() => setShowWorkOrderDetailsModal(false)} title={isEditing ? "Edit Work Order" : "Work Order Details"}>
          <WorkOrderDetailsForm
            workOrder={selectedWorkOrder}
            isEditing={isEditing}
            onSave={handleUpdateWorkOrder}
            onCancel={() => setShowWorkOrderDetailsModal(false)}
            onComplete={handleCompleteWorkOrder}
            onPrint={handlePrintWorkOrder}
            users={users} // Pass users to the form for assignedTo dropdown
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
              onClick={() => recordToDelete !== null && handleDelete(recordToDelete)}
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

export default ITReceiver;
