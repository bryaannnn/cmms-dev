import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderData, Vendor } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import DOMPurify from "dompurify";
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
  Mail,
  Phone,
  MapPin,
  Paperclip,
  ExternalLink,
} from "lucide-react";
import Sidebar from "../../../component/Sidebar";
import PageHeader from "../../PageHeader";

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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
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
  const { user, getWorkOrdersIT, updateWorkOrderIT, getUsers, hasPermission, getVendor } = useAuth();

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
        return "bg-red-500 text-white";
      case "Closed":
        return "bg-gray-900 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Tambahkan setelah fungsi getStatusColor
  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "high":
        return "bg-red-500 text-white";
      case "medium":
        return "bg-yellow-500 text-white";
      case "low":
        return "bg-green-500 text-white";
      case "critical":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  // Tambahkan fungsi untuk menentukan urutan sorting
  const getStatusOrder = (status: string) => {
    switch (status) {
      case "New":
        return 1;
      case "Assigned":
        return 2;
      case "In Progress":
        return 3;
      case "Escalated":
        return 4;
      case "Vendor Handled":
        return 5;
      case "Resolved":
        return 6;
      case "Cancel":
        return 7;
      case "Closed":
        return 8;
      default:
        return 9;
    }
  };

  const getPriorityOrder = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case "critical":
        return 1;
      case "high":
        return 2;
      case "medium":
        return 3;
      case "low":
        return 4;
      default:
        return 5;
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

  // Ganti dengan kode ini:
  // Ganti dengan kode ini:
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
      // Urutkan berdasarkan status terlebih dahulu
      const statusOrderA = getStatusOrder(a.handling_status);
      const statusOrderB = getStatusOrder(b.handling_status);

      if (statusOrderA !== statusOrderB) {
        return statusOrderA - statusOrderB;
      }

      // Jika status sama, urutkan berdasarkan priority
      const priorityOrderA = getPriorityOrder(a.service?.priority || "Medium");
      const priorityOrderB = getPriorityOrder(b.service?.priority || "Medium");

      if (priorityOrderA !== priorityOrderB) {
        return priorityOrderA - priorityOrderB;
      }

      // Jika status dan priority sama, urutkan berdasarkan created_at terbaru
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
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

  // Fungsi untuk mendapatkan nama assigned to (user atau vendor)
  const getAssignedToName = (order: WorkOrderData): string => {
    // Jika ada vendor, tampilkan nama vendor
    if (order.vendor) {
      return `${order.vendor.name}`;
    }

    // Jika tidak ada vendor, tampilkan assigned_to user atau "Unassigned"
    return order.assigned_to?.name || "Unassigned";
  };

  // Fungsi untuk mendapatkan tipe assignment
  const getAssignmentType = (order: WorkOrderData): string => {
    if (order.vendor) return "vendor";
    if (order.assigned_to) return "user";
    return "unassigned";
  };

  const WorkOrderDetails: React.FC<{ order: WorkOrderData; onClose: () => void }> = ({ order, onClose }) => {
    const displayValue = (value: any): string => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "object" && value !== null) {
        return value.name || value.title || value.id || "-";
      }
      if (typeof value === "string") {
        return value.trim() !== "" ? value.trim() : "-";
      }
      if (typeof value === "number") {
        return value.toString();
      }
      return String(value);
    };

    const formatDate = (dateString?: string | null) => {
      if (!dateString) return "-";
      const date = new Date(dateString);
      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Komponen untuk status badge yang lebih menonjol
    const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
      const statusColors = {
        New: "bg-gray-100 text-gray-800 border-gray-300",
        Assigned: "bg-blue-100 text-blue-800 border-blue-300",
        "In Progress": "bg-cyan-100 text-cyan-800 border-cyan-300",
        Escalated: "bg-purple-100 text-purple-800 border-purple-300",
        "Vendor Handled": "bg-red-100 text-red-800 border-red-300",
        Resolved: "bg-orange-100 text-orange-800 border-orange-300",
        Cancel: "bg-gray-100 text-gray-800 border-gray-300",
        Closed: "bg-green-100 text-green-800 border-green-300",
      };

      return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[status as keyof typeof statusColors] || statusColors.New}`}>{status}</span>;
    };

    const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
      const priorityColors = {
        Critical: "bg-purple-100 text-purple-800 border-purple-300",
        High: "bg-red-100 text-red-800 border-red-300",
        Medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
        Low: "bg-green-100 text-green-800 border-green-300",
      };

      return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${priorityColors[priority as keyof typeof priorityColors] || priorityColors.Medium}`}>{priority || "Medium"}</span>;
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

    // Komponen Detail Item yang lebih modern untuk Receiver
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

    // Komponen DetailItemHTML yang lebih rapi untuk Receiver
    const DetailItemHTML: React.FC<{
      label: string;
      htmlContent: string;
      icon?: React.ReactNode;
      fullWidth?: boolean;
    }> = ({ label, htmlContent, icon, fullWidth = false }) => {
      if (!htmlContent) {
        return <DetailItem label={label} value="-" icon={icon} fullWidth={fullWidth} priority="low" />;
      }

      const cleanHTML = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "span", "div", "ol", "ul", "li", "strong", "b", "em", "i", "u", "s", "strike", "code", "mark", "sub", "sup", "blockquote", "pre"],
        ALLOWED_ATTR: ["style", "class", "data-color", "align", "type", "start"],
      });

      return (
        <div className={`${fullWidth ? "col-span-full" : ""}`}>
          <div className="p-4 rounded-lg border-l-2 border-l-blue-200 bg-blue-25 transition-all duration-200 hover:shadow-sm">
            <div className="flex items-start space-x-3">
              {icon && <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>}
              <div className="flex-1 min-w-0">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">{label}</label>
                <div
                  className="rich-text-content text-sm text-gray-900 leading-relaxed prose prose-sm max-w-none
                          prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2
                          prose-li:my-1 prose-strong:font-semibold prose-em:italic"
                  dangerouslySetInnerHTML={{ __html: cleanHTML }}
                />
              </div>
            </div>
          </div>
        </div>
      );
    };

    // Action buttons khusus untuk Receiver
    const ActionButtons: React.FC<{ order: WorkOrderData }> = ({ order }) => {
      const isNew = order.handling_status === "New";
      const isAssigned = order.handling_status === "Assigned";
      const canAssign = isNew && hasPermission("assign_workorders");

      return (
        <div className="flex flex-wrap gap-3 mt-6 pt-6 border-t border-gray-200">
          {canAssign && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setShowAssignModal(true);
              }}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm"
            >
              <UserIcon className="w-4 h-4 mr-2" />
              Assign Technician
            </motion.button>
          )}

          {isAssigned && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/workorders/it/receiver/editreceiver/${order.id}`)}
              className="inline-flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-semibold text-sm"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit Assignment
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClose}
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200 font-semibold text-sm"
          >
            <X className="w-4 h-4 mr-2" />
            Close
          </motion.button>
        </div>
      );
    };

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {/* Header dengan informasi utama untuk Receiver */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">#{order.work_order_no || order.id}</h2>
                <StatusBadge status={order.handling_status} />
                <PriorityBadge priority={order.service?.priority} />
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Created: {formatDate(order.date)}
                </span>
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {order.handling_date ? `Handling: ${formatDate(order.handling_date)}` : "Not yet handled"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Service Owner Information - Khusus Receiver */}
        <Section title="Service Owner Information" icon={<UserIcon className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="Service Owner" value={displayValue(order.service?.owner?.name || user?.name)} icon={<UserIcon className="w-4 h-4" />} priority="high" />
            <DetailItem label="Service Department" value={displayValue(user?.department?.name)} icon={<Settings className="w-4 h-4" />} />
            <DetailItem label="Service Type" value={displayValue(order.service_type?.group_name)} icon={<Wrench className="w-4 h-4" />} priority="high" />
            <DetailItem label="Service Name" value={displayValue(order.service?.service_name)} icon={<Clipboard className="w-4 h-4" />} priority="high" />
          </div>
        </Section>

        {/* Request Information */}
        <Section title="Request Information" icon={<Clipboard className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Requester" value={displayValue(order.requester?.name)} icon={<UserIcon className="w-4 h-4" />} priority="high" />
            <DetailItem label="Requester Department" value={displayValue(order.department_name || order.department?.name)} icon={<Settings className="w-4 h-4" />} />
            <DetailItem label="Reception Method" value={displayValue(order.reception_method)} icon={<Upload className="w-4 h-4" />} />
            <DetailItem label="Known By" value={displayValue(order.known_by?.name)} icon={<Eye className="w-4 h-4" />} />
            <DetailItem label="Asset Number" value={displayValue(order.asset_no)} icon={<Clipboard className="w-4 h-4" />} />
          </div>
        </Section>

        {/* Technical Details - Fokus untuk Receiver */}
        <Section title="Technical Details" icon={<Wrench className="w-5 h-5" />}>
          <div className="grid grid-cols-1 gap-4">
            <DetailItem label="Device Information" value={displayValue(order.device_info)} icon={<Settings className="w-4 h-4" />} fullWidth />
            <DetailItemHTML label="Complaint Details" htmlContent={order.complaint || ""} icon={<AlertTriangle className="w-4 h-4" />} fullWidth />
          </div>
        </Section>

        {/* Assignment & Handling Information - Sangat Relevan untuk Receiver */}
        <Section title="Assignment & Handling" icon={<Clock className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <DetailItem label="Current Status" value={displayValue(order.handling_status)} icon={<Clock className="w-4 h-4" />} priority="high" />
              <DetailItem label="Priority Level" value={displayValue(order.service?.priority || "Medium")} icon={<AlertTriangle className="w-4 h-4" />} priority="high" />
            </div>

            <DetailItem label="Assigned To" value={displayValue(order.assigned_to?.name || "Unassigned")} icon={<UserIcon className="w-4 h-4" />} />
            <DetailItem label="Assignment Type" value={order.vendor ? "Vendor" : order.assigned_to ? "Internal Technician" : "Not Assigned"} icon={<Settings className="w-4 h-4" />} />

            <DetailItem label="Handling Start Date" value={formatDate(order.handling_date || "-")} icon={<Calendar className="w-4 h-4" />} />
            <DetailItem label="Received By" value={displayValue(order.received_by?.name || "-")} icon={<CheckCircle className="w-4 h-4" />} />

            <DetailItemHTML label="Action Taken" htmlContent={order.action_taken || ""} icon={<Wrench className="w-4 h-4" />} fullWidth />
            <DetailItemHTML label="Technical Remarks" htmlContent={order.remarks || ""} icon={<Clipboard className="w-4 h-4" />} fullWidth />
          </div>
        </Section>

        {/* Vendor Details - Jika ada */}
        {order.vendor && (
          <Section title="Vendor Assignment" icon={<UserIcon className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Vendor Name" value={displayValue(order.vendor.name)} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Contact Person" value={displayValue(order.vendor.contact_person)} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Email" value={displayValue(order.vendor.email)} icon={<Mail className="w-4 h-4" />} />
              <DetailItem label="Phone" value={displayValue(order.vendor.telp)} icon={<Phone className="w-4 h-4" />} />
              <DetailItem label="Mobile" value={displayValue(order.vendor.HP)} icon={<Phone className="w-4 h-4" />} />
              <DetailItem label="Address" value={displayValue(order.vendor.address)} icon={<MapPin className="w-4 h-4" />} fullWidth />
            </div>
          </Section>
        )}

        {/* Timeline Information - Penting untuk Receiver */}
        <Section title="Timeline" icon={<Clock className="w-5 h-5" />}>
          <div className="space-y-3">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <span className="text-sm font-medium text-green-800">Request Created</span>
              <span className="text-sm text-green-600">{formatDate(order.date)}</span>
            </div>

            {order.handling_date && (
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-blue-800">Handling Started</span>
                <span className="text-sm text-blue-600">{formatDate(order.handling_date)}</span>
              </div>
            )}

            {order.assigned_to && (
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg border border-purple-200">
                <span className="text-sm font-medium text-purple-800">Assigned to Technician</span>
                <span className="text-sm text-purple-600">{displayValue(order.assigned_to.name)}</span>
              </div>
            )}
          </div>
        </Section>

        {/* Attachment */}
        {order.attachment && (
          <Section title="Attachment" icon={<Paperclip className="w-5 h-5" />}>
            <div className="flex items-center space-x-3 p-4 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
              <Paperclip className="w-5 h-5 text-blue-600 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 mb-1">Supporting Document</p>
                <a href={order.attachment} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium text-sm transition-colors duration-200">
                  <ExternalLink className="w-4 h-4 mr-1" />
                  View Attachment
                </a>
              </div>
            </div>
          </Section>
        )}

        {/* Action Buttons */}
        <ActionButtons order={order} />
      </div>
    );
  };

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
        <PageHeader mainTitle="IT Work Orders - Receiver" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Clipboard />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

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
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Handling Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => {
                      const isResolved = order.handling_status === "Resolved" || order.handling_status === "Done" || order.handling_status === "Cancel" || order.handling_status === "Closed";
                      const canEdit = !isResolved && hasPermission("edit_workorders");
                      const isNew = order.handling_status === "New";
                      const isInProgressOrSimilar = ["In Progress", "Escalated", "Vendor Handled"].includes(order.handling_status);

                      const assignedToName = getAssignedToName(order);
                      const assignmentType = getAssignmentType(order);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                          className="transition-colors duration-150"
                        >
                          <td
                            className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200"
                            onClick={() => openWorkOrderDetails(order.id)}
                            title="Click to view details"
                          >
                            {order.work_order_no || "-"}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.requester.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{order.handling_date ? new Date(order.handling_date).toLocaleDateString() : "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getPriorityColor(order.service?.priority)} shadow-sm`}>{order.service?.priority || "Medium"}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.handling_status)} shadow-sm`}>{order.handling_status}</span>
                          </td>
                          {/* Perbaikan Kolom Assigned To */}
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {isNew ? (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleAssignClick(order)}
                                className="px-3 py-1.5 text-xs font-semibold rounded-full text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200"
                              >
                                Click to Assign
                              </motion.button>
                            ) : (
                              <div className="flex items-center">
                                <span className={`text-sm font-medium ${assignmentType === "vendor" ? "text-purple-600" : assignmentType === "user" ? "text-blue-600" : "text-gray-500"}`}>{assignedToName}</span>
                                {assignmentType === "vendor" && <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">Vendor</span>}
                              </div>
                            )}
                          </td>
                          {/* Perbaikan Kolom Actions */}
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

                            {canEdit && (order.handling_status !== "In Progress" || !order.assigned_to?.name || order.assigned_to?.name === "N/A") && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/workorders/it/receiver/editreceiver/${order.id}`)}
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-6 border border-blue-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Work Order Details #{selectedWorkOrder.work_order_no || selectedWorkOrder.id}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowWorkOrderDetailsModal(false);
                    setSelectedWorkOrder(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <X size={24} />
                </motion.button>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                <WorkOrderDetails
                  order={selectedWorkOrder}
                  onClose={() => {
                    setShowWorkOrderDetailsModal(false);
                    setSelectedWorkOrder(null);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
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
    </div>
  );
};

export default ITReceiver;
