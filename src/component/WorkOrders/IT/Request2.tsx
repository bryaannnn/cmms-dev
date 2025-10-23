import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import DOMPurify from "dompurify";
import { getProjectEnvVariables } from "../../../shared/projectEnvVariables";
import { useAuth, WorkOrderData, Vendor } from "../../../routes/AuthContext";
import PageHeader from "../../PageHeader";
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
  Mail,
  Phone,
  MapPin,
  Paperclip,
  ExternalLink,
  PlayCircle,
  CheckSquare,
  XCircle,
  GitBranch,
  Activity,
} from "lucide-react";

interface Department {
  id: number;
  name: string;
}

interface User {
  id: number;
  name: string;
  department?: Department;
  role?: string;
}

// Ganti komponen StatCard dengan versi yang lebih dinamis
interface StatCardProps {
  title: string;
  currentCount: number;
  lastMonthCount: number;
  icon: React.ReactNode;
  usePercentage?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, currentCount, lastMonthCount, icon, usePercentage = true }) => {
  const change = usePercentage ? calculateChange(currentCount, lastMonthCount) : calculateAbsoluteChange(currentCount, lastMonthCount);
  const isPositive = currentCount >= lastMonthCount;
  const changeText = usePercentage ? `${change} from last month` : `${change} from last month`;

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
          <p className="text-3xl font-bold text-gray-900">{currentCount}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{icon}</div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{changeText}</p>
    </motion.div>
  );
};

// Juga pindahkan helper functions calculation ke luar
const calculateChange = (currentCount: number, lastMonthCount: number): string => {
  if (lastMonthCount === 0) {
    return currentCount > 0 ? "+100%" : "0%";
  }
  const change = ((currentCount - lastMonthCount) / lastMonthCount) * 100;
  const sign = change >= 0 ? "+" : "";
  return `${sign}${Math.round(change)}%`;
};

const calculateAbsoluteChange = (currentCount: number, lastMonthCount: number): string => {
  const change = currentCount - lastMonthCount;
  const sign = change > 0 ? "+" : change < 0 ? "" : "+";
  return `${sign}${change}`;
};

const ITRequest2: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData | null>(null);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [vendor, setVendor] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const projectEnvVariables = getProjectEnvVariables();

  const [lastMonthWorkOrders, setLastMonthWorkOrders] = useState<WorkOrderData[]>([]);

  // State baru untuk konfirmasi Complete dan Cancel
  const [showCompleteConfirm, setShowCompleteConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [recordToComplete, setRecordToComplete] = useState<number | null>(null);
  const [recordToCancel, setRecordToCancel] = useState<number | null>(null);

  const { user: currentUser, getWorkOrdersIT, deleteWorkOrder, hasPermission, fetchWithAuth, getVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  // GANTI fungsi loadWorkOrders yang lama dengan ini:

  // GANTI useEffect loadWorkOrders dengan ini:
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        const allOrders = await getWorkOrdersIT();

        // Prevent state update if component unmounted
        if (!isMounted) return;

        const userOrders = allOrders.filter((order) => order.requester_id === Number(currentUser?.id));
        setWorkOrders(userOrders);

        // Data bulan sebelumnya
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const lastMonthData = userOrders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate < oneMonthAgo;
        });

        setLastMonthWorkOrders(lastMonthData);
      } catch (err) {
        if (!isMounted) return;
        setError("Failed to load work orders. Please try again.");
        console.error("Error loading work orders:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [getWorkOrdersIT, currentUser?.id]); // Hapus loadWorkOrders dari dependencies

  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, statusFilter, darkMode]);

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

  const handleDeleteClick = useCallback((id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        await deleteWorkOrder(id);

        // Reload data setelah delete
        const allOrders = await getWorkOrdersIT();
        const userOrders = allOrders.filter((order) => order.requester_id === Number(currentUser?.id));
        setWorkOrders(userOrders);

        setShowDeleteConfirm(false);
        setRecordToDelete(null);
        setSuccessMessage("Work order deleted successfully.");
        setTimeout(() => setSuccessMessage(null), 2500);
      } catch (err) {
        setError("Failed to delete work order.");
        console.error("Error deleting work order:", err);
      } finally {
        setLoading(false);
      }
    },
    [deleteWorkOrder, getWorkOrdersIT, currentUser?.id]
  );

  const handleCancelClick = useCallback((id: number) => {
    setRecordToCancel(id);
    setShowCancelConfirm(true);
  }, []);

  // Fungsi untuk menampilkan konfirmasi Complete
  const handleCompleteClick = useCallback((id: number) => {
    setRecordToComplete(id);
    setShowCompleteConfirm(true);
  }, []);

  const handleCancelWorkOrder = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);

        // Update status work order menjadi "Cancel"
        await fetchWithAuth(`/ayam/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handling_status: "Cancel",
          }),
        });

        // ✅ GANTI: loadWorkOrders() dengan reload data langsung
        const allOrders = await getWorkOrdersIT();
        const userOrders = allOrders.filter((order) => order.requester_id === Number(currentUser?.id));
        setWorkOrders(userOrders);

        // Update lastMonthWorkOrders
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const lastMonthData = userOrders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate < oneMonthAgo;
        });
        setLastMonthWorkOrders(lastMonthData);

        setShowWorkOrderDetailsModal(false);
        setSelectedWorkOrder(null);
        setShowCancelConfirm(false);
        setRecordToCancel(null);
        setSuccessMessage("Work order cancelled successfully.");
        setTimeout(() => setSuccessMessage(null), 2500);
      } catch (err) {
        setError("Failed to cancel work order.");
        console.error("Error cancelling work order:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, getWorkOrdersIT, currentUser?.id] // ✅ Hapus loadWorkOrders
  );

  const handleCompleteWorkOrder = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);

        // Update status work order menjadi "Closed"
        await fetchWithAuth(`/ayam/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            handling_status: "Closed",
          }),
        });

        // ✅ GANTI: loadWorkOrders() dengan reload data langsung
        const allOrders = await getWorkOrdersIT();
        const userOrders = allOrders.filter((order) => order.requester_id === Number(currentUser?.id));
        setWorkOrders(userOrders);

        // Update lastMonthWorkOrders
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
        const lastMonthData = userOrders.filter((order) => {
          const orderDate = new Date(order.date);
          return orderDate < oneMonthAgo;
        });
        setLastMonthWorkOrders(lastMonthData);

        setShowWorkOrderDetailsModal(false);
        setSelectedWorkOrder(null);
        setShowCompleteConfirm(false);
        setRecordToComplete(null);
        setSuccessMessage("Work order completed successfully.");
        setTimeout(() => setSuccessMessage(null), 2500);
      } catch (err) {
        setError("Failed to complete work order.");
        console.error("Error completing work order:", err);
      } finally {
        setLoading(false);
      }
    },
    [fetchWithAuth, getWorkOrdersIT, currentUser?.id] // ✅ Hapus loadWorkOrders
  );

  // Tambahkan helper functions di dalam komponen ITRequest2, sebelum return
  const getProgressWorkOrders = (orders: WorkOrderData[]) => {
    return orders.filter((wo) => ["Assigned", "In Progress", "Escalated", "Vendor Handled", "Resolved"].includes(wo.handling_status));
  };

  const getClosedWorkOrders = (orders: WorkOrderData[]) => {
    return orders.filter((wo) => ["Closed", "Cancel"].includes(wo.handling_status));
  };

  const getNewWorkOrders = (orders: WorkOrderData[]) => {
    return orders.filter((wo) => wo.handling_status === "New");
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  // mapping prioritas status
  const statusPriority: Record<string, number> = {
    New: 1,
    Assigned: 2,
    "In Progress": 3,
    Escalated: 4,
    "Vendor Handled": 5,
    Resolved: 6,
    Closed: 7,
    Cancel: 7,
  };

  const sortWorkOrders = (orders: WorkOrderData[]) => {
    return [...orders].sort((a, b) => {
      // Utamakan tanggal terbaru di atas
      const dateA = new Date(a.date || "").getTime();
      const dateB = new Date(b.date || "").getTime();

      if (dateA !== dateB) {
        return dateB - dateA; // Terbaru di atas
      }

      // Jika tanggal sama, urutkan berdasarkan status
      const prioA = statusPriority[a.handling_status] ?? 99;
      const prioB = statusPriority[b.handling_status] ?? 99;
      return prioA - prioB;
    });
  };

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
      // Urutkan berdasarkan created_at terbaru di atas (descending)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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

    // Komponen Detail Item yang lebih modern
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

    // Komponen DetailItemHTML yang lebih rapi
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

    // Komponen StatusTimeline - SAMA PERSIS seperti di Reports.tsx
    const StatusTimeline: React.FC<{ order: WorkOrderData }> = ({ order }) => {
      const getStatusIcon = (status: string) => {
        switch (status?.toLowerCase()) {
          case "new":
            return <PlayCircle className="w-4 h-4" />;
          case "assigned":
            return <UserIcon className="w-4 h-4" />;
          case "in progress":
            return <Clock className="w-4 h-4" />;
          case "resolved":
            return <CheckSquare className="w-4 h-4" />;
          case "closed":
            return <CheckCircle className="w-4 h-4" />;
          case "cancel":
            return <XCircle className="w-4 h-4" />;
          case "escalated":
            return <AlertTriangle className="w-4 h-4" />;
          case "vendor handled":
            return <Wrench className="w-4 h-4" />;
          default:
            return <Activity className="w-4 h-4" />;
        }
      };

      const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
          case "new":
            return "bg-blue-500";
          case "assigned":
            return "bg-purple-500";
          case "in progress":
            return "bg-yellow-500";
          case "resolved":
            return "bg-green-500";
          case "closed":
            return "bg-green-600";
          case "cancel":
            return "bg-red-500";
          case "escalated":
            return "bg-orange-500";
          case "vendor handled":
            return "bg-indigo-500";
          default:
            return "bg-gray-500";
        }
      };

      const getStatusDescription = (status: string, data?: any) => {
        const descriptions: Record<string, string> = {
          new: "Work order telah dibuat dan menunggu penanganan",
          assigned: `Telah ditugaskan kepada ${data?.assigned_to || "teknisi"}`,
          "in progress": "Sedang dalam proses pengerjaan",
          resolved: "Masalah telah diselesaikan",
          closed: "Work order telah ditutup",
          cancel: "Work order dibatalkan",
          escalated: "Telah di-escalate ke level yang lebih tinggi",
          "vendor handled": "Ditangani oleh vendor eksternal",
          updated: "Work order diperbarui",
        };
        return descriptions[status.toLowerCase()] || `Status: ${status}`;
      };

      // Define proper types for timeline events
      interface TimelineEvent {
        id: string;
        status: string;
        date: string;
        changed_by: string;
        description: string;
        duration: string;
        isSystemEvent?: boolean;
        isManualEvent?: boolean;
        isStatusChange?: boolean;
        comments?: string;
        old_data?: any;
        new_data?: any;
      }

      // Reconstruct timeline dengan logika yang benar
      const reconstructTimeline = (): TimelineEvent[] => {
        const timeline: TimelineEvent[] = [];

        // 1. Creation event - selalu pertama
        timeline.push({
          id: "created",
          status: "new",
          date: order.date,
          changed_by: order.requester?.name || "System",
          description: "Work order dibuat",
          duration: "0 days",
          isSystemEvent: true,
        });

        // 2. Process status history dari API - URUTKAN berdasarkan changed_at
        if (order.status_history && order.status_history.length > 0) {
          // Sort status history by date secara ascending (terlama ke terbaru)
          const sortedHistory = [...order.status_history].sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());

          sortedHistory.forEach((history, index) => {
            const prevEvent = timeline[timeline.length - 1];
            const duration = calculateDuration(prevEvent.date, history.changed_at);

            // Determine actual status dari new_data atau action
            let actualStatus = history.action;
            let description = getStatusDescription(history.action);

            // Jika action adalah "updated", cek new_data untuk status sebenarnya
            if (history.action === "updated" && history.new_data?.handling_status) {
              actualStatus = history.new_data.handling_status;
              description = getStatusDescription(history.new_data.handling_status, {
                assigned_to: order.assigned_to?.name,
              });
            }

            // Determine who changed it berdasarkan data yang ada
            let changedBy = "System";

            // Gunakan data dari API jika tersedia
            if (history.user_id === 55) changedBy = "DevTest User 1";
            else if (history.user_id === 41) changedBy = "Regular User QC";
            else if (history.user_id === 57) changedBy = "DevTest User 2";
            else if (history.user_id === 36) changedBy = "Super Admin User";
            else if (history.user_id === 37) changedBy = "Admin User One";
            else if (history.user_id === 40) changedBy = "Regular User IT";
            else if (history.user_id === 42) changedBy = "Monitor";
            else if (history.user_id === 56) changedBy = "Monitor";
            else if (history.changed_by) changedBy = history.changed_by;
            else changedBy = `User ${history.user_id}`;

            timeline.push({
              id: history.id.toString(),
              status: actualStatus,
              date: history.changed_at,
              changed_by: changedBy,
              description: description,
              duration: duration,
              comments: history.comments,
              old_data: history.old_data,
              new_data: history.new_data,
              isStatusChange: true,
            });
          });
        }

        // 3. Manual events hanya jika benar-benar ada data yang mendukung
        // Received by event - hanya jika ada received_by dan handling_date
        if (order.received_by?.name && order.handling_date) {
          const receivedEventExists = timeline.some((event) => event.status === "received" || (event.new_data?.received_by_id && event.new_data?.handling_status === "Resolved"));

          if (!receivedEventExists) {
            const lastEvent = timeline[timeline.length - 1];
            const duration = calculateDuration(lastEvent.date, order.handling_date);

            const receivedEvent: TimelineEvent = {
              id: "received",
              status: "received",
              date: order.handling_date,
              changed_by: order.received_by.name,
              description: "Diterima oleh teknisi",
              duration: duration,
              isManualEvent: true,
            };
            timeline.push(receivedEvent);
          }
        }

        // 4. Sort final timeline by date secara ascending
        return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      };

      const calculateDuration = (startDate: string, endDate: string): string => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          const diffHours = Math.ceil(diffTime / (1000 * 60 * 60));
          const diffMinutes = Math.ceil(diffTime / (1000 * 60));

          if (diffMinutes < 60) return `${diffMinutes} minutes`;
          return `${diffHours} hours`;
        }
        return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
      };

      const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return {
          date: date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          time: date.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
      };

      const getActionDetails = (event: TimelineEvent) => {
        if (event.new_data?.handling_status) {
          return `Diubah menjadi: ${event.new_data.handling_status}`;
        }
        if (event.new_data?.assigned_to_id) {
          return `Ditugaskan ke teknisi`;
        }
        if (event.new_data?.action_taken) {
          return `Tindakan diambil: ${event.new_data.action_taken.substring(0, 50)}...`;
        }
        return null;
      };

      const timeline = reconstructTimeline();

      return (
        <div className="space-y-6">
          {timeline.map((event, index) => {
            const datetime = formatDateTime(event.date);
            const isLast = index === timeline.length - 1;
            const actionDetails = getActionDetails(event);

            return (
              <div key={event.id} className="flex items-start space-x-4">
                {/* Timeline line and dot */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(event.status)}`} />
                  {!isLast && <div className="w-0.5 h-16 bg-gray-300 mt-1"></div>}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(event.status)}
                      <div>
                        <span className="font-semibold text-sm capitalize text-gray-900">{event.status}</span>
                        <p className="text-xs text-gray-600 mt-1">{event.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{datetime.date}</div>
                      <div className="text-xs text-gray-500">{datetime.time}</div>
                    </div>
                  </div>

                  {/* Metadata */}
                  <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <div className="flex items-center space-x-4">
                        <span className="text-gray-600">
                          <strong>Changed by:</strong> {event.changed_by}
                        </span>
                        {event.duration && event.duration !== "0 days" && <span className="text-blue-600 font-semibold">⏱️ {event.duration}</span>}
                      </div>

                      {event.duration && event.duration !== "0 days" && index > 0 && (
                        <div className="text-right">
                          <span className="text-gray-500 text-xs">Duration from previous</span>
                        </div>
                      )}
                    </div>

                    {actionDetails && <div className="text-xs text-gray-700 bg-white p-2 rounded border">{actionDetails}</div>}

                    {/* FIXED: Proper type checking for comments */}
                    {event.comments && (
                      <div className="text-xs text-gray-700 bg-white p-2 rounded border">
                        <strong>Comments:</strong> {event.comments}
                      </div>
                    )}

                    {/* Show assignment details for assigned status */}
                    {event.status === "assigned" && order.assigned_to && (
                      <div className="text-xs text-gray-700">
                        <strong>Assigned to:</strong> {order.assigned_to.name}
                        {order.assigned_to.email && ` (${order.assigned_to.email})`}
                      </div>
                    )}

                    {/* Show resolution details for resolved/closed status */}
                    {(event.status === "resolved" || event.status === "closed") && order.action_taken && (
                      <div className="text-xs text-gray-700">
                        <strong>Action taken:</strong> {order.action_taken.substring(0, 100)}...
                      </div>
                    )}
                  </div>

                  {/* Total duration from start to current status */}
                  {isLast && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-semibold text-blue-800">Total duration from creation</span>
                        <span className="font-bold text-blue-600 text-lg">{calculateDuration(order.date, event.date)}</span>
                      </div>
                      <div className="text-xs text-blue-600 mt-1">
                        Created: {formatDateTime(order.date).date} • Current: {datetime.date}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Summary Card */}
          {order.handling_status === "Closed" && order.handling_date && (
            <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-green-800">Work Order Completed</h4>
                  <p className="text-sm text-green-600">Total resolution time: {calculateDuration(order.date, order.handling_date)}</p>
                </div>
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-xs text-green-600 mt-2 grid grid-cols-2 gap-2">
                <div>Created: {formatDateTime(order.date).date}</div>
                <div>Completed: {formatDateTime(order.handling_date).date}</div>
                <div className="col-span-2">
                  <strong>Timeline:</strong> {timeline.length} status changes
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {/* Header dengan informasi utama */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">#{order.work_order_no || order.id}</h2>
                <StatusBadge status={order.handling_status} />
              </div>
              <p className="text-gray-600 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created: {formatDate(order.date)}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <X className="w-4 h-4 mr-2" />
                Close
              </motion.button>
            </div>
          </div>
        </div>
        {/* General Information */}
        <Section title="General Information" icon={<UserIcon className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Work Order No" value={displayValue(order.work_order_no)} icon={<Clipboard className="w-4 h-4" />} priority="high" />
            <DetailItem label="Reception Method" value={displayValue(order.reception_method)} icon={<Upload className="w-4 h-4" />} />
            <DetailItem label="Requester" value={displayValue(order.requester?.name)} icon={<UserIcon className="w-4 h-4" />} priority="high" />
            <DetailItem label="Department" value={displayValue(order.department?.name)} icon={<Settings className="w-4 h-4" />} />
            <DetailItem label="Known By" value={displayValue(order.known_by?.name)} icon={<Eye className="w-4 h-4" />} />
          </div>
        </Section>
        {/* Service Details */}
        <Section title="Service Details" icon={<Wrench className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Service Type" value={displayValue(order.service_type.group_name)} icon={<Settings className="w-4 h-4" />} priority="high" />
            <DetailItem label="Service" value={displayValue(order.service.service_name)} icon={<Wrench className="w-4 h-4" />} priority="high" />
            <DetailItem label="No Asset" value={displayValue(order.asset_no)} icon={<Clipboard className="w-4 h-4" />} />
          </div>
        </Section>
        {/* Device & Complaint */}
        <Section title="Device & Complaint" icon={<AlertTriangle className="w-5 h-5" />}>
          <div className="grid grid-cols-1 gap-4">
            <DetailItem label="Device Information" value={displayValue(order.device_info)} icon={<Settings className="w-4 h-4" />} fullWidth />
            <DetailItemHTML label="Complaint Details" htmlContent={order.complaint || ""} icon={<AlertTriangle className="w-4 h-4" />} fullWidth />
          </div>
        </Section>
        {/* Handling Information */}
        <Section title="Handling Information" icon={<Clock className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <DetailItem label="Ticket Status" value={displayValue(order.handling_status)} icon={<Clock className="w-4 h-4" />} priority="high" />
              <DetailItem label="Handling Date" value={formatDate(order.handling_date || "-")} icon={<Calendar className="w-4 h-4" />} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:col-span-2">
              <DetailItem label="Assigned To" value={displayValue(order.assigned_to?.name)} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Received By" value={displayValue(order.received_by?.name)} icon={<CheckCircle className="w-4 h-4" />} />
            </div>
            <DetailItemHTML label="Action Taken" htmlContent={order.action_taken || ""} icon={<Wrench className="w-4 h-4" />} fullWidth />
            <DetailItemHTML label="Remarks" htmlContent={order.remarks || ""} icon={<Clipboard className="w-4 h-4" />} fullWidth />
          </div>
        </Section>
        {/*  TIMELINE */}
        {order.status_history && order.status_history.length > 0 && (
          <Section title="Work Order Timeline" icon={<GitBranch className="w-5 h-5" />}>
            <StatusTimeline order={order} />
          </Section>
        )}
        {/* Vendor Details */}
        {order.vendor && (
          <Section title="Vendor Details" icon={<UserIcon className="w-5 h-5" />}>
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
        {/* Attachment */}
        {order.attachment && (
          <Section title="Attachment" icon={<Paperclip className="w-5 h-5" />}>
            <div className="space-y-4">
              {/* Preview Gambar */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-3">Preview Attachment:</p>
                <div className="flex justify-center">
                  <img
                    src={`${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}${order.attachment}`}
                    alt="Work order attachment"
                    className="max-w-full max-h-64 rounded-lg shadow-md object-contain"
                    onError={(e) => {
                      // Jika bukan gambar, sembunyikan preview
                      e.currentTarget.style.display = "none";
                    }}
                  />
                </div>
              </div>

              {/* Link Download */}
              <div className="flex items-center justify-between p-3 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
                <div className="flex items-center space-x-3">
                  <Paperclip className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">Attachment File</p>
                    <p className="text-xs text-gray-500">Click to download or view full size</p>
                  </div>
                </div>
                <a
                  href={`${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}${order.attachment}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Open Full Size
                </a>
              </div>
            </div>
          </Section>
        )}
      </div>
    );
  };

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
          {/* ✅ GANTI: onClick={loadWorkOrders} dengan reload langsung */}
          <button
            onClick={() => {
              // Panggil useEffect logic langsung di sini
              const loadData = async () => {
                try {
                  setLoading(true);
                  setError(null);
                  const allOrders = await getWorkOrdersIT();
                  const userOrders = allOrders.filter((order) => order.requester_id === Number(currentUser?.id));
                  setWorkOrders(userOrders);

                  const oneMonthAgo = new Date();
                  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                  const lastMonthData = userOrders.filter((order) => {
                    const orderDate = new Date(order.date);
                    return orderDate < oneMonthAgo;
                  });
                  setLastMonthWorkOrders(lastMonthData);
                } catch (err) {
                  setError("Failed to load work orders. Please try again.");
                } finally {
                  setLoading(false);
                }
              };
              loadData();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
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
        <PageHeader mainTitle="IT Work Orders - Request" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Clipboard />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">IT Request</h1>
              <p className="text-gray-600 mt-1">Submit and track your IT-related maintenance and service requests</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => navigate("/workorders/it/addworkorder")}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Plus className="text-lg" />
                <span className="font-semibold">Create New Work Order</span>
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

          {/* Stat cards dengan helper functions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total IT Requests" currentCount={filteredWorkOrders.length} lastMonthCount={lastMonthWorkOrders.length} icon={<Clipboard />} />
            <StatCard title="IT New WO" currentCount={getNewWorkOrders(filteredWorkOrders).length} lastMonthCount={getNewWorkOrders(lastMonthWorkOrders).length} icon={<Clock />} usePercentage={false} />
            <StatCard title="IT Progress" currentCount={getProgressWorkOrders(filteredWorkOrders).length} lastMonthCount={getProgressWorkOrders(lastMonthWorkOrders).length} icon={<Wrench />} usePercentage={false} />
            <StatCard title="IT Closed" currentCount={getClosedWorkOrders(filteredWorkOrders).length} lastMonthCount={getClosedWorkOrders(lastMonthWorkOrders).length} icon={<CheckCircle />} usePercentage={false} />
          </div>

          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search IT requests by device, ID, or assignee..."
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
                      <option value="Cancel">Cancel</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device Information</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No Asset</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => {
                      const assignedToName = getAssignedToName(order);
                      const assignmentType = getAssignmentType(order);

                      return (
                        <motion.tr
                          key={order.id}
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.15 }}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                          className="transition-colors duration-150"
                        >
                          <td
                            className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline transition-colors duration-200"
                            onClick={() => openWorkOrderDetails(order.id)}
                            title="Click to view details"
                          >
                            {order.work_order_no || "-"}
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</div>
                          </td>
                          <td className="px-5 py-3">
                            <div className="text-sm font-medium text-gray-900">{order.device_info}</div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.asset_no || "-"}</div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.service_type.group_name || "N/A"}</div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStatusColor(order.handling_status)}`}>{order.handling_status}</span>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${assignmentType === "vendor" ? "text-purple-600" : assignmentType === "user" ? "text-blue-600" : "text-gray-500"}`}>{assignedToName}</span>
                              {assignmentType === "vendor" && <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">Vendor</span>}
                            </div>
                          </td>
                          <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                            {/* View button always available */}
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => openWorkOrderDetails(order.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                              title="View Details"
                            >
                              <Eye className="text-base" />
                            </motion.button>

                            {/* Untuk status "New" - Tampilkan Edit dan Cancel */}
                            {order.handling_status === "New" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => navigate(`/workorders/it/editworkorder/${order.id}`)}
                                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 p-1 rounded-full hover:bg-gray-50"
                                  title="Edit Work Order"
                                >
                                  <Edit className="text-base" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleCancelClick(order.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                  title="Cancel Work Order"
                                >
                                  <X className="text-base" />
                                </motion.button>
                              </>
                            )}

                            {/* Untuk status "Resolved" - Tampilkan Complete saja */}
                            {order.handling_status === "Resolved" && (
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={(e) => {
                                  handleCompleteClick(order.id);
                                }}
                                className="text-green-600 hover:text-green-800 transition-colors duration-200 p-1 rounded-full hover:bg-green-50"
                                title="Mark as Closed"
                              >
                                <CheckCircle className="text-base" />
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-5 py-8 text-center text-gray-600 text-base">
                        No IT work order requests found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredWorkOrders.length > ordersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastOrder, filteredWorkOrders.length)}</span> of{" "}
                <span className="font-semibold">{filteredWorkOrders.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Previous page"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-3.5 py-2 rounded-md transition-colors duration-200 shadow-sm font-medium text-sm
            ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
          `}
                    aria-label={`Go to page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Next page"
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
                <h3 className="text-2xl font-bold text-gray-900">Work Order Details #{selectedWorkOrder.id}</h3>
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

              <div className="overflow-y-auto max-h-[80vh]">
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

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 border border-blue-100">
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {successMessage && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {successMessage}
        </motion.div>
      )}

      {/* Modal Konfirmasi Complete */}
      <AnimatePresence>
        {showCompleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 border border-blue-100">
              <div className="space-y-5 text-center py-3">
                <CheckCircle className="text-green-500 text-5xl mx-auto" />
                <p className="text-base text-gray-700 font-medium">Are you sure you want to mark this work order as completed? This action will close the ticket.</p>
                <div className="flex justify-center space-x-3 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCompleteConfirm(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => recordToComplete !== null && handleCompleteWorkOrder(recordToComplete)}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200 font-semibold text-sm"
                  >
                    Yes, Complete
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Konfirmasi Cancel */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 border border-blue-100">
              <div className="space-y-5 text-center py-3">
                <AlertTriangle className="text-orange-500 text-5xl mx-auto" />
                <p className="text-base text-gray-700 font-medium">Are you sure you want to cancel this work order? This action cannot be undone.</p>
                <div className="flex justify-center space-x-3 mt-5">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowCancelConfirm(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
                  >
                    No, Keep It
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => recordToCancel !== null && handleCancelWorkOrder(recordToCancel)}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
                  >
                    Yes, Cancel
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 50 }} className="fixed bottom-6 right-6 bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {error}
          <button onClick={() => setError(null)} className="ml-2 underline">
            Dismiss
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default ITRequest2;
