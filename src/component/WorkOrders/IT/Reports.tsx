import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderData } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import DOMPurify from "dompurify";
import PageHeader from "../../PageHeader";
import {
  BarChart2,
  Filter,
  Calendar,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
  Sun,
  Moon,
  Settings,
  Bell,
  Clipboard,
  Printer,
  AlertTriangle,
  UserIcon,
  CheckCircle,
  Clock,
  Wrench,
  ChevronLeft,
  Users,
  BarChart3,
  PieChart as PieChartt,
  Eye,
  ChartPie,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, PieChart } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D"];

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

const WorkOrderDetailModal: React.FC<{
  isOpen: boolean;
  workOrder: WorkOrderData | undefined;
  onClose: () => void;
}> = ({ isOpen, workOrder, onClose }) => {
  if (!isOpen || !workOrder) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
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

  // Komponen Detail Item yang lebih modern untuk Reports
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

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto border border-blue-100 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center border-b border-gray-100 px-6 py-4 bg-blue-50">
          <h3 className="text-2xl font-bold text-gray-900">Work Order Details</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl p-1 rounded-full hover:bg-blue-100 transition-colors duration-200">
            <X size={24} />
          </motion.button>
        </div>

        <div className="overflow-y-auto custom-scrollbar p-6 space-y-6 flex-grow">
          {/* Header Information */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-gray-900">{workOrder.work_order_no || "No Work Order Number"}</h2>
                  <span
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                      workOrder.handling_status === "New"
                        ? "bg-gray-100 text-gray-800 border border-gray-300"
                        : workOrder.handling_status === "Assigned"
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : workOrder.handling_status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                        : workOrder.handling_status === "Resolved"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : workOrder.handling_status === "Closed"
                        ? "bg-green-100 text-green-800 border border-green-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}
                  >
                    {workOrder.handling_status || "Unknown Status"}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Created: {formatDate(workOrder.date)}
                  </span>
                  {workOrder.handling_date && (
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" />
                      Handled: {formatDate(workOrder.handling_date)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* General Information */}
          <Section title="General Information" icon={<Clipboard className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Work Order No" value={workOrder.work_order_no || "-"} icon={<Clipboard className="w-4 h-4" />} priority="high" />
              <DetailItem label="Date" value={formatDate(workOrder.date)} icon={<Calendar className="w-4 h-4" />} priority="high" />
              <DetailItem label="Reception Method" value={workOrder.reception_method || "-"} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Requester" value={workOrder.requester?.name || "-"} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Known By" value={workOrder.known_by?.name || "-"} icon={<Eye className="w-4 h-4" />} />
              <DetailItem label="Department" value={workOrder.department?.name || "-"} icon={<Users className="w-4 h-4" />} />
            </div>
          </Section>

          {/* Service Details */}
          <Section title="Service Details" icon={<Settings className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Service Type" value={workOrder.service_type?.group_name || "-"} icon={<Settings className="w-4 h-4" />} priority="high" />
              <DetailItem label="Service" value={workOrder.service?.service_name || "-"} icon={<Wrench className="w-4 h-4" />} priority="high" />
              <DetailItem label="Asset No" value={workOrder.asset_no || "-"} icon={<Clipboard className="w-4 h-4" />} />
              <DetailItem label="Device Info" value={workOrder.device_info || "-"} icon={<Settings className="w-4 h-4" />} />
              <DetailItemHTML label="Complaint" htmlContent={workOrder.complaint || ""} icon={<AlertTriangle className="w-4 h-4" />} fullWidth />
            </div>
          </Section>

          {/* Handling Information */}
          <Section title="Handling Information" icon={<Clock className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Status" value={workOrder.handling_status || "-"} icon={<Clock className="w-4 h-4" />} priority="high" />
              <DetailItem label="Received By" value={workOrder.received_by?.name || "-"} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Assigned To" value={workOrder.assigned_to?.name || "-"} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Handling Date" value={formatDate(workOrder.handling_date)} icon={<Calendar className="w-4 h-4" />} />
              <DetailItemHTML label="Action Taken" htmlContent={workOrder.action_taken || ""} icon={<CheckCircle className="w-4 h-4" />} fullWidth />
              <DetailItemHTML label="Remarks" htmlContent={workOrder.remarks || ""} icon={<Clipboard className="w-4 h-4" />} fullWidth />
            </div>
          </Section>

          {/* Summary Section */}
          <Section title="Report Summary" icon={<BarChart2 className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Current Status</h4>
                <p className="text-lg font-bold text-blue-600">{workOrder.handling_status || "Unknown"}</p>
              </div>
              <div className="p-4 bg-green-25 rounded-lg border-l-4 border-l-green-400">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Timeline</h4>
                <p className="text-sm text-green-600">
                  Created: {formatDate(workOrder.date)}
                  {workOrder.handling_date && ` • Handled: ${formatDate(workOrder.handling_date)}`}
                </p>
              </div>
            </div>
          </Section>
        </div>

        <div className="flex justify-end pt-4 border-t border-gray-100 px-6 py-4 bg-gray-50">
          <motion.button
            type="button"
            onClick={onClose}
            whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
          >
            Close Details
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ITReports: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData>();
  const [showDetailModal, setShowDetailModal] = useState(false);

  const { user, getWorkOrdersIT, hasPermission } = useAuth();
  const navigate = useNavigate();
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

  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      const orders = await getWorkOrdersIT();
      setWorkOrders(orders);
    } catch (err) {
      setError("Failed to load work orders data");
      console.error("Error loading work orders:", err);
    } finally {
      setLoading(false);
    }
  }, [getWorkOrdersIT]);

  useEffect(() => {
    fetchWorkOrders();
  }, [fetchWorkOrders]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "new":
        return "bg-gray-500 text-white";
      case "assigned":
        return "bg-blue-500 text-white";
      case "in progress":
        return "bg-yellow-500 text-white";
      case "escalated":
        return "bg-orange-500 text-white";
      case "vendor handled":
        return "bg-purple-500 text-white";
      case "resolved":
        return "bg-green-500 text-white";
      case "cancel":
        return "bg-red-500 text-white";
      case "closed":
        return "bg-green-700 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((order) => {
    const matchesSearch =
      order.work_order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.complaint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.service?.service_name?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.handling_status === statusFilter;
    const matchesDepartment = departmentFilter === "all" || order.department?.name === departmentFilter;

    return matchesSearch && matchesStatus && matchesDepartment;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, departmentFilter]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  // Calculate statistics
  const totalRequests = filteredWorkOrders.length;
  const resolvedWorkOrders = filteredWorkOrders.filter((order) => ["resolved", "closed"].includes(order.handling_status?.toLowerCase())).length;

  const openWorkOrders = filteredWorkOrders.filter((order) => !["cancel"].includes(order.handling_status?.toLowerCase())).length;

  const escalatedWorkOrders = filteredWorkOrders.filter((order) => order.handling_status?.toLowerCase() === "escalated").length;

  const assignedWorkOrders = filteredWorkOrders.filter((order) => order.assigned_to !== null).length;

  const completionRate = totalRequests > 0 ? Math.round((resolvedWorkOrders / totalRequests) * 100) : 0;

  // Calculate average resolution time
  const avgResolutionTime =
    filteredWorkOrders
      .filter((order) => order.handling_date && order.date && ["resolved", "closed"].includes(order.handling_status?.toLowerCase()))
      .reduce((acc, order) => {
        const created = new Date(order.date);
        const resolved = new Date(order.handling_date!); // Add ! since we filtered out nulls
        const diffTime = Math.abs(resolved.getTime() - created.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return acc + diffDays;
      }, 0) / (resolvedWorkOrders || 1);

  // Chart data
  const departmentChartData = Object.entries(
    filteredWorkOrders.reduce((acc, order) => {
      const deptName = order.department?.name || "Unknown";
      acc[deptName] = (acc[deptName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const statusChartData = Object.entries(
    filteredWorkOrders.reduce((acc, order) => {
      const status = order.handling_status || "Unknown";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const handleExportReports = useCallback(() => {
    if (hasPermission("export_reports")) {
      // Simple CSV export implementation
      const headers = ["Work Order No", "Requester", "Department", "Date", "Status", "Assigned To", "Handling Date"];
      const csvData = filteredWorkOrders.map((order) => [order.work_order_no, order.requester?.name || "", order.department?.name || "", order.date, order.handling_status, order.assigned_to?.name || "", order.handling_date || ""]);

      const csvContent = [headers.join(","), ...csvData.map((row) => row.map((field) => `"${field}"`).join(","))].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `it-reports-${new Date().toISOString().split("T")[0]}.csv`;
      link.click();
      window.URL.revokeObjectURL(url);
    } else {
      alert("You do not have permission to export reports.");
    }
  }, [hasPermission, filteredWorkOrders]);

  const handleViewDetails = (order: any) => {
    setSelectedWorkOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWorkOrder(undefined); // Reset selected work order
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";

    // Add null check and handle invalid dates
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (error) {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading reports data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <AlertTriangle className="text-red-600 text-5xl" />
        <p className="ml-4 text-lg text-red-800">{error}</p>
        <button onClick={() => window.location.reload()} className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="IT Work Order - Reports" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<BarChart2 />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IT Work Order Reports</h1>
              <p className="text-gray-600 mt-1">Comprehensive overview of work orders in the IT department.</p>
            </div>
            {hasPermission("export_reports") && (
              <motion.button
                onClick={handleExportReports}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Printer className="mr-2" /> Export Report
              </motion.button>
            )}
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            <StatCard title="Total Requests" value={totalRequests.toString()} change="+10% " icon={<Clipboard />} />
            <StatCard title="Resolved" value={resolvedWorkOrders.toString()} change="+15% " icon={<CheckCircle />} />
            <StatCard title="Cancel" value={openWorkOrders.toString()} change="-5% " icon={<Clock />} />
            <StatCard title="Escalated" value={escalatedWorkOrders.toString()} change="+8% " icon={<Users />} />
            <StatCard title="Completion Rate" value={`${completionRate}%`} change={completionRate > 70 ? "+12% " : "-5% "} icon={<BarChart3 />} />
            <StatCard title="Avg Resolution Time" value={`${Math.round(avgResolutionTime)} days`} change={avgResolutionTime < 5 ? "-2 days " : "+3 days "} icon={<Clock />} />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <BarChart3 className="mr-2" /> Work Orders by Department
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={departmentChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#0081ff" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PieChartt className="mr-2" /> Work Orders by Status
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={statusChartData} cx="50%" cy="50%" labelLine={false} label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`} outerRadius={80} fill="#8884d8" dataKey="value">
                    {statusChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

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
                    <option value="New">New</option>
                    <option value="Assigned">Assigned</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Escalated">Escalated</option>
                    <option value="Vendor Handled">Vendor Handled</option>
                    <option value="Resolved">Resolved</option>
                    <option value="Cancel">Cancel</option>
                    <option value="Closed">Closed</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
                <div className="relative w-full sm:w-auto">
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full sm:w-48 p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                  >
                    <option value="all">All Departments</option>
                    {Array.from(new Set(workOrders.map((order) => order.department?.name).filter(Boolean))).map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
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
                    <p className="text-gray-500 col-span-full">More filter options coming soon!</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Work Order List</h3>
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Work Order No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Handling Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  <AnimatePresence>
                    {currentOrders.map((order, index) => (
                      <motion.tr key={order.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{indexOfFirstOrder + index + 1}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">{order.work_order_no}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.requester?.name || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.department?.name || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.handling_status)}`}>{order.handling_status || "Unknown"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.assigned_to?.name || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{formatDate(order.handling_date)}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button onClick={() => handleViewDetails(order)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-blue-600 hover:text-blue-900 transition-colors duration-200 flex items-center">
                            <Eye className="mr-1" size={16} /> View
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>
            )}

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

      <WorkOrderDetailModal isOpen={showDetailModal} onClose={handleCloseDetailModal} workOrder={selectedWorkOrder} />
    </div>
  );
};

export default ITReports;
