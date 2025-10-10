import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import DOMPurify from "dompurify";
import { useAuth, WorkOrderData, Vendor } from "../../../routes/AuthContext";
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

    // Fungsi untuk menampilkan HTML yang aman
    const displayHTML = (htmlString: string) => {
      if (!htmlString) return "-";

      // Bersihkan HTML dari potensi XSS
      const cleanHTML = DOMPurify.sanitize(htmlString);

      return <div className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center" dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
    };

    const DetailItemHTML: React.FC<{ label: string; htmlContent: string }> = ({ label, htmlContent }) => {
      if (!htmlContent)
        return (
          <div className="flex flex-col">
            <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
            <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">-</p>
          </div>
        );

      // Konfigurasi DOMPurify yang mengizinkan list dan styling
      const cleanHTML = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: [
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "p",
          "br",
          "span",
          "div",
          "ol",
          "ul",
          "li", // Pastikan tag list diizinkan
          "strong",
          "b",
          "em",
          "i",
          "u",
          "s",
          "strike",
          "code",
          "mark",
          "sub",
          "sup",
        ],
        ALLOWED_ATTR: [
          "style",
          "class",
          "data-color",
          "align",
          "type",
          "start", // Izinkan atribut untuk list
        ],
      });

      return (
        <div className="flex flex-col">
          <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
          <div className="rich-text-content w-full bg-blue-50 border border-blue-100 rounded-lg p-4 text-gray-800 min-h-[44px]" dangerouslySetInnerHTML={{ __html: cleanHTML }} />
        </div>
      );
    };

    const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
      <div className="flex flex-col">
        <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
        <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{value}</p>
      </div>
    );

    const SectionTitle: React.FC<{ title: string }> = ({ title }) => <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200 mt-6 first:mt-0">{title}</h3>;

    return (
      <div className="space-y-6">
        <SectionTitle title="General Information" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Work Order No" value={displayValue(order.work_order_no)} />
          <DetailItem label="Date" value={formatDate(order.date)} />
          <DetailItem label="Reception Method" value={displayValue(order.reception_method)} />
          <DetailItem label="Requester" value={displayValue(order.requester?.name)} />
          <DetailItem label="Department" value={displayValue(order.department?.name)} />
          <DetailItem label="Known By" value={displayValue(order.known_by?.name)} />
        </div>

        <SectionTitle title="Service Details" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <DetailItem label="Service Type" value={displayValue(order.service_type.group_name)} />
          <DetailItem label="Service" value={displayValue(order.service.service_name)} />
          <DetailItem label="No Asset" value={displayValue(order.asset_no)} />
        </div>

        <SectionTitle title="Device & Complaint" />
        <div className="grid grid-cols-1 gap-4">
          <DetailItem label="Device Information" value={displayValue(order.device_info)} />
          <DetailItemHTML label="Complaint" htmlContent={order.complaint || ""} />
        </div>

        <SectionTitle title="Handling Information" />
        <div className="grid grid-cols-1 gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Ticket Status" value={displayValue(order.handling_status)} />
            <DetailItem label="Handling Date" value={formatDate(order.handling_date || "-")} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Assigned To" value={displayValue(order.assigned_to?.name)} />
            <DetailItem label="Received By" value={displayValue(order.received_by?.name)} />
          </div>
          <DetailItemHTML label="Action Taken" htmlContent={order.action_taken || ""} />
          <DetailItemHTML label="Remarks" htmlContent={order.remarks || ""} />
        </div>

        {/* Vendor Details Section */}
        <SectionTitle title="Vendor Details" />
        {order.vendor ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <DetailItem label="Vendor Name" value={displayValue(order.vendor.name)} />
            <DetailItem label="Address" value={displayValue(order.vendor.address)} />
            <DetailItem label="Contact Person" value={displayValue(order.vendor.contact_person)} />
            <DetailItem label="Email" value={displayValue(order.vendor.email)} />
            <DetailItem label="No Telp" value={displayValue(order.vendor.telp)} />
            <DetailItem label="No HP" value={displayValue(order.vendor.HP)} />
          </div>
        ) : (
          <div className="text-center py-4 text-gray-500">No vendor assigned to this work order.</div>
        )}

        {order.attachment && (
          <>
            <SectionTitle title="Attachment" />
            <div className="grid grid-cols-1 gap-4">
              <div className="flex items-center space-x-3">
                <a href={order.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                  View Attachment
                </a>
              </div>
            </div>
          </>
        )}

        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
          >
            Close
          </motion.button>
        </div>
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
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Work Order - Request</h2>
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
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">
                            {order.handling_status === "Closed" ? <CheckCircle className="text-green-500" /> : order.handling_status === "Progress" ? <Wrench className="text-blue-500" /> : <AlertTriangle className="text-yellow-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Work Order #{order.id}</p>
                            <p className="text-xs text-gray-600 mt-1">{order.requester?.name}</p>
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
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{currentUser?.name}</span>
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
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{currentUser?.name || "Guest User"}</div>
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

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device Information</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => {
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
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.device_info}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.asset_no}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{order.service_type.group_name || "N/A"}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.handling_status)} shadow-sm`}>{order.handling_status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <span className={`text-sm font-medium ${assignmentType === "vendor" ? "text-purple-600" : assignmentType === "user" ? "text-blue-600" : "text-gray-500"}`}>{assignedToName}</span>
                              {assignmentType === "vendor" && <span className="ml-2 px-1.5 py-0.5 text-xs bg-purple-100 text-purple-800 rounded-full">Vendor</span>}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                            {/* View button always available */}
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openWorkOrderDetails(order.id)}
                              className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                              title="View Details"
                            >
                              <Eye className="text-lg" />
                            </motion.button>

                            {/* Untuk status "New" - Tampilkan Edit dan Cancel */}
                            {order.handling_status === "New" && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => navigate(`/workorders/it/editworkorder/${order.id}`)}
                                  className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                                  title="Edit Work Order"
                                >
                                  <Edit className="text-lg" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleCancelClick(order.id)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center space-x-1"
                                  title="Cancel Work Order"
                                >
                                  <X className="text-lg" />
                                </motion.button>
                              </>
                            )}

                            {/* Untuk status "Resolved" - Tampilkan Complete saja */}
                            {order.handling_status === "Resolved" && (
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={(e) => {
                                  handleCompleteClick(order.id);
                                }}
                                className="text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Mark as Closed"
                              >
                                <CheckCircle className="text-lg" />
                              </motion.button>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No IT work order requests found matching your criteria.
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
