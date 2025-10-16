import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderData } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import DOMPurify from "dompurify";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PageHeader from "../../PageHeader";
import {
  BarChart2,
  Filter,
  Calendar,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  Printer,
  AlertTriangle,
  UserIcon,
  CheckCircle,
  Clock,
  Wrench,
  ChevronLeft,
  Users,
  BarChart3,
  Eye,
  TrendingUp,
  AlertCircle,
  Target,
  Zap,
  Activity,
  Shield,
  ToolCase,
  FileText,
  GitBranch,
  PlayCircle,
  PauseCircle,
  CheckSquare,
  XCircle,
  Layers,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Pie, Cell, PieChart, LineChart, Line, AreaChart, Area } from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4"];

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

  const StatusTimeline: React.FC<{ workOrder: WorkOrderData }> = ({ workOrder }) => {
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
        date: workOrder.date,
        changed_by: workOrder.requester?.name || "System",
        description: "Work order dibuat",
        duration: "0 days",
        isSystemEvent: true,
      });

      // 2. Process status history dari API - URUTKAN berdasarkan changed_at
      if (workOrder.status_history && workOrder.status_history.length > 0) {
        // Sort status history by date secara ascending (terlama ke terbaru)
        const sortedHistory = [...workOrder.status_history].sort((a, b) => new Date(a.changed_at).getTime() - new Date(b.changed_at).getTime());

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
              assigned_to: workOrder.assigned_to?.name,
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
      if (workOrder.received_by?.name && workOrder.handling_date) {
        const receivedEventExists = timeline.some((event) => event.status === "received" || (event.new_data?.received_by_id && event.new_data?.handling_status === "Resolved"));

        if (!receivedEventExists) {
          const lastEvent = timeline[timeline.length - 1];
          const duration = calculateDuration(lastEvent.date, workOrder.handling_date);

          const receivedEvent: TimelineEvent = {
            id: "received",
            status: "received",
            date: workOrder.handling_date,
            changed_by: workOrder.received_by.name,
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
                  {event.status === "assigned" && workOrder.assigned_to && (
                    <div className="text-xs text-gray-700">
                      <strong>Assigned to:</strong> {workOrder.assigned_to.name}
                      {workOrder.assigned_to.email && ` (${workOrder.assigned_to.email})`}
                    </div>
                  )}

                  {/* Show resolution details for resolved/closed status */}
                  {(event.status === "resolved" || event.status === "closed") && workOrder.action_taken && (
                    <div className="text-xs text-gray-700">
                      <strong>Action taken:</strong> {workOrder.action_taken.substring(0, 100)}...
                    </div>
                  )}
                </div>

                {/* Total duration from start to current status */}
                {isLast && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-semibold text-blue-800">Total duration from creation</span>
                      <span className="font-bold text-blue-600 text-lg">{calculateDuration(workOrder.date, event.date)}</span>
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Created: {formatDateTime(workOrder.date).date} • Current: {datetime.date}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {/* Summary Card */}
        {workOrder.handling_status === "Closed" && workOrder.handling_date && (
          <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-green-800">Work Order Completed</h4>
                <p className="text-sm text-green-600">Total resolution time: {calculateDuration(workOrder.date, workOrder.handling_date)}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-xs text-green-600 mt-2 grid grid-cols-2 gap-2">
              <div>Created: {formatDateTime(workOrder.date).date}</div>
              <div>Completed: {formatDateTime(workOrder.handling_date).date}</div>
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

          <Section title="General Information" icon={<UserIcon className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <DetailItem label="Work Order No" value={workOrder.work_order_no || "-"} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Date" value={formatDate(workOrder.date)} icon={<Calendar className="w-4 h-4" />} priority="high" />
              <DetailItem label="Reception Method" value={workOrder.reception_method || "-"} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Requester" value={workOrder.requester?.name || "-"} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Known By" value={workOrder.known_by?.name || "-"} icon={<Eye className="w-4 h-4" />} />
              <DetailItem label="Department" value={workOrder.department?.name || "-"} icon={<Users className="w-4 h-4" />} />
            </div>
          </Section>

          <Section title="Service Details" icon={<Wrench className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Service Type" value={workOrder.service_type?.group_name || "-"} icon={<Wrench className="w-4 h-4" />} priority="high" />
              <DetailItem label="Service" value={workOrder.service?.service_name || "-"} icon={<Wrench className="w-4 h-4" />} priority="high" />
              <DetailItem label="Asset No" value={workOrder.asset_no || "-"} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Device Info" value={workOrder.device_info || "-"} icon={<Wrench className="w-4 h-4" />} />
              <DetailItemHTML label="Complaint" htmlContent={workOrder.complaint || ""} icon={<AlertTriangle className="w-4 h-4" />} fullWidth />
            </div>
          </Section>

          <Section title="Handling Information" icon={<Clock className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <DetailItem label="Status" value={workOrder.handling_status || "-"} icon={<Clock className="w-4 h-4" />} priority="high" />
              <DetailItem label="Received By" value={workOrder.received_by?.name || "-"} icon={<UserIcon className="w-4 h-4" />} />
              <DetailItem label="Assigned To" value={workOrder.assigned_to?.name || "-"} icon={<UserIcon className="w-4 h-4" />} priority="high" />
              <DetailItem label="Handling Date" value={formatDate(workOrder.handling_date)} icon={<Calendar className="w-4 h-4" />} />
              <DetailItemHTML label="Action Taken" htmlContent={workOrder.action_taken || ""} icon={<CheckCircle className="w-4 h-4" />} fullWidth />
              <DetailItemHTML label="Remarks" htmlContent={workOrder.remarks || ""} icon={<UserIcon className="w-4 h-4" />} fullWidth />
            </div>
          </Section>

          {workOrder.status_history && workOrder.status_history.length > 0 && (
            <Section title="Work Order Timeline" icon={<GitBranch className="w-5 h-5" />}>
              <StatusTimeline workOrder={workOrder} />
            </Section>
          )}

          <Section title="Performance Metrics" icon={<BarChart2 className="w-5 h-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Resolution Time</h4>
                <p className="text-lg font-bold text-blue-600">
                  {workOrder.handling_date && workOrder.date ? `${Math.ceil((new Date(workOrder.handling_date).getTime() - new Date(workOrder.date).getTime()) / (1000 * 60 * 60 * 24))} days` : "Ongoing"}
                </p>
              </div>
              <div className="p-4 bg-green-25 rounded-lg border-l-4 border-l-green-400">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Priority Level</h4>
                <p className="text-lg font-bold text-green-600">{workOrder.service?.priority || "Not Set"}</p>
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
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [serviceTypeFilter, setServiceTypeFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [workOrders, setWorkOrders] = useState<WorkOrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrderData>();
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [timeRange, setTimeRange] = useState<"7days" | "30days" | "90days" | "all">("30days");

  const { user, getWorkOrdersIT, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isRequest = location.pathname === "/workorders/it";
  const isReceiver = location.pathname === "/workorders/it/receiver";
  const isAssignment = location.pathname === "/workorders/it/assignment";
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

  const calculateResolutionTime = (order: WorkOrderData): number => {
    if (!order.handling_date || !order.date) return 0;
    const created = new Date(order.date);
    const resolved = new Date(order.handling_date);
    return Math.ceil((resolved.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
  };

  const getFilteredWorkOrders = useCallback(() => {
    const now = new Date();
    let startDate = new Date();

    switch (timeRange) {
      case "7days":
        startDate.setDate(now.getDate() - 7);
        break;
      case "30days":
        startDate.setDate(now.getDate() - 30);
        break;
      case "90days":
        startDate.setDate(now.getDate() - 90);
        break;
      case "all":
        startDate = new Date(0);
        break;
    }

    return workOrders.filter((order) => {
      const orderDate = new Date(order.date);
      const matchesTimeRange = orderDate >= startDate;
      const matchesSearch =
        order.work_order_no?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.requester?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.complaint?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.service?.service_name?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === "all" || order.handling_status === statusFilter;
      const matchesDepartment = departmentFilter === "all" || order.department?.name === departmentFilter;
      const matchesPriority = priorityFilter === "all" || order.service?.priority === priorityFilter;
      const matchesServiceType = serviceTypeFilter === "all" || order.service_type?.group_name === serviceTypeFilter;

      return matchesTimeRange && matchesSearch && matchesStatus && matchesDepartment && matchesPriority && matchesServiceType;
    });
  }, [workOrders, timeRange, searchQuery, statusFilter, departmentFilter, priorityFilter, serviceTypeFilter]);

  const filteredWorkOrders = getFilteredWorkOrders();

  const getWorkOrderAnalytics = () => {
    const resolvedOrders = filteredWorkOrders.filter((order) => ["Resolved", "Closed"].includes(order.handling_status));
    const activeOrders = filteredWorkOrders.filter((order) => ["New", "Assigned", "In Progress"].includes(order.handling_status));

    const avgResolutionTime = resolvedOrders.length > 0 ? resolvedOrders.reduce((acc, order) => acc + calculateResolutionTime(order), 0) / resolvedOrders.length : 0;

    const statusDistribution = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const status = order.handling_status || "Unknown";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([status, count]) => ({
      status,
      count,
      percentage: (count / filteredWorkOrders.length) * 100,
    }));

    const priorityDistribution = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const priority = order.service?.priority || "Not Set";
        acc[priority] = (acc[priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([priority, count]) => ({
      priority,
      count,
      percentage: (count / filteredWorkOrders.length) * 100,
    }));

    const departmentDistribution = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const dept = order.department?.name || "Unknown";
        acc[dept] = (acc[dept] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    )
      .map(([dept, count]) => ({
        dept,
        count,
        percentage: (count / filteredWorkOrders.length) * 100,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    const serviceTypeDistribution = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const serviceType = order.service_type?.group_name || "Unknown";
        acc[serviceType] = (acc[serviceType] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    ).map(([serviceType, count]) => ({
      serviceType,
      count,
      percentage: (count / filteredWorkOrders.length) * 100,
    }));

    const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (11 - i));
      const monthKey = date.toLocaleDateString("id-ID", { month: "short", year: "numeric" });

      const monthOrders = filteredWorkOrders.filter((order) => {
        const orderDate = new Date(order.date);
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === date.getFullYear();
      });

      const resolvedMonthOrders = monthOrders.filter((order) => ["Resolved", "Closed"].includes(order.handling_status));

      return {
        month: monthKey,
        created: monthOrders.length,
        resolved: resolvedMonthOrders.length,
        resolutionRate: monthOrders.length > 0 ? (resolvedMonthOrders.length / monthOrders.length) * 100 : 0,
      };
    });

    const statusTimingAnalysis = ["New", "Assigned", "In Progress", "Resolved", "Closed", "Cancel"].map((status) => {
      const statusOrders = filteredWorkOrders.filter((order) => order.handling_status === status);
      const avgTimeInStatus =
        statusOrders.length > 0
          ? statusOrders.reduce((acc, order) => {
              const statusHistory = order.status_history || [];
              const statusEntry = statusHistory.find((history) => history.action === status);
              if (statusEntry) {
                const statusDuration = new Date().getTime() - new Date(statusEntry.changed_at).getTime();
                return acc + Math.ceil(statusDuration / (1000 * 60 * 60 * 24));
              }
              return acc;
            }, 0) / statusOrders.length
          : 0;

      return {
        status,
        avgTimeInStatus: Math.round(avgTimeInStatus),
        count: statusOrders.length,
      };
    });

    // NEW: Service Type Performance by Timing
    const serviceTypePerformance = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const serviceType = order.service_type?.group_name || "Unknown";
        if (!acc[serviceType]) acc[serviceType] = [];
        if (order.handling_date && order.date) {
          const resolutionTime = calculateResolutionTime(order);
          acc[serviceType].push(resolutionTime);
        }
        return acc;
      }, {} as Record<string, number[]>)
    ).map(([serviceType, times]) => ({
      serviceType,
      avgResolutionTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      totalRequests: times.length,
      maxResolutionTime: times.length > 0 ? Math.max(...times) : 0,
      minResolutionTime: times.length > 0 ? Math.min(...times) : 0,
    }));

    // NEW: Service Performance by Timing
    const servicePerformance = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const service = order.service?.service_name || "Unknown";
        if (!acc[service]) acc[service] = [];
        if (order.handling_date && order.date) {
          const resolutionTime = calculateResolutionTime(order);
          acc[service].push(resolutionTime);
        }
        return acc;
      }, {} as Record<string, number[]>)
    ).map(([service, times]) => ({
      service,
      avgResolutionTime: times.length > 0 ? Math.round(times.reduce((a, b) => a + b, 0) / times.length) : 0,
      totalRequests: times.length,
    }));

    // NEW: Priority Performance by Timing (bukan persen)
    const priorityTimingAnalysis = ["Critical", "High", "Medium", "Low"].map((priority) => {
      const priorityOrders = filteredWorkOrders.filter((order) => order.service?.priority === priority);
      const resolvedPriorityOrders = priorityOrders.filter((order) => ["Resolved", "Closed"].includes(order.handling_status) && order.handling_date && order.date);

      const avgResolutionTime = resolvedPriorityOrders.length > 0 ? resolvedPriorityOrders.reduce((acc, order) => acc + calculateResolutionTime(order), 0) / resolvedPriorityOrders.length : 0;

      return {
        priority,
        avgResolutionTime: Math.round(avgResolutionTime),
        total: priorityOrders.length,
        resolved: resolvedPriorityOrders.length,
      };
    });

    // NEW: Daily Trends (selain monthly)
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (29 - i));
      return date.toISOString().split("T")[0];
    });

    const dailyTrends = last30Days.map((date) => {
      const dayOrders = filteredWorkOrders.filter((order) => order.date.startsWith(date));
      const resolved = dayOrders.filter((order) => ["Resolved", "Closed"].includes(order.handling_status));

      return {
        date: new Date(date).toLocaleDateString("id-ID", { month: "short", day: "numeric" }),
        created: dayOrders.length,
        resolved: resolved.length,
        backlog: dayOrders.length - resolved.length,
      };
    });

    // NEW: Service Owner & PIC Performance
    const serviceOwnerPerformance = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const owner = order.service?.owner?.name || "Unknown Owner";
        if (!acc[owner]) {
          acc[owner] = {
            workOrders: [],
            totalResolutionTime: 0,
            resolvedCount: 0,
          };
        }

        if (order.handling_date && order.date) {
          const resolutionTime = calculateResolutionTime(order);
          acc[owner].workOrders.push({
            workOrderNo: order.work_order_no,
            priority: order.service?.priority,
            resolutionTime,
            status: order.handling_status,
            service: order.service?.service_name,
          });
          acc[owner].totalResolutionTime += resolutionTime;
          if (["Resolved", "Closed"].includes(order.handling_status)) {
            acc[owner].resolvedCount++;
          }
        }
        return acc;
      }, {} as Record<string, { workOrders: any[]; totalResolutionTime: number; resolvedCount: number }>)
    ).map(([owner, data]) => ({
      owner,
      avgResolutionTime: data.resolvedCount > 0 ? Math.round(data.totalResolutionTime / data.resolvedCount) : 0,
      totalWorkOrders: data.workOrders.length,
      resolvedWorkOrders: data.resolvedCount,
      workOrders: data.workOrders,
    }));

    // NEW: PIC/Assigned Technician Performance
    const picPerformance = Object.entries(
      filteredWorkOrders.reduce((acc, order) => {
        const pic = order.assigned_to?.name || "Unassigned";
        if (!acc[pic]) {
          acc[pic] = {
            workOrders: [],
            totalResolutionTime: 0,
            resolvedCount: 0,
          };
        }

        if (order.handling_date && order.date) {
          const resolutionTime = calculateResolutionTime(order);
          acc[pic].workOrders.push({
            workOrderNo: order.work_order_no,
            priority: order.service?.priority,
            resolutionTime,
            status: order.handling_status,
            service: order.service?.service_name,
          });
          acc[pic].totalResolutionTime += resolutionTime;
          if (["Resolved", "Closed"].includes(order.handling_status)) {
            acc[pic].resolvedCount++;
          }
        }
        return acc;
      }, {} as Record<string, { workOrders: any[]; totalResolutionTime: number; resolvedCount: number }>)
    ).map(([pic, data]) => ({
      pic,
      avgResolutionTime: data.resolvedCount > 0 ? Math.round(data.totalResolutionTime / data.resolvedCount) : 0,
      totalWorkOrders: data.workOrders.length,
      resolvedWorkOrders: data.resolvedCount,
      workOrders: data.workOrders,
    }));

    return {
      total: filteredWorkOrders.length,
      resolved: resolvedOrders.length,
      active: activeOrders.length,
      avgResolutionTime: Math.round(avgResolutionTime),
      resolutionRate: filteredWorkOrders.length > 0 ? (resolvedOrders.length / filteredWorkOrders.length) * 100 : 0,
      statusDistribution,
      priorityDistribution,
      departmentDistribution,
      serviceTypeDistribution,
      monthlyTrends,
      statusTimingAnalysis,

      // NEW ANALYTICS
      serviceTypePerformance,
      servicePerformance,
      priorityTimingAnalysis,
      dailyTrends,
      serviceOwnerPerformance,
      picPerformance,
    };
  };

  const analytics = getWorkOrderAnalytics();

  const kpiCards = [
    {
      title: "Total Work Orders",
      value: analytics.total.toString(),
      change: "+12%",
      icon: <FileText />,
    },
    {
      title: "Avg Resolution Time",
      value: `${analytics.avgResolutionTime} days`,
      change: analytics.avgResolutionTime < 5 ? "-2 days" : "+1 day",
      icon: <Clock />,
    },
    {
      title: "Service Types",
      value: analytics.serviceTypePerformance.length.toString(),
      change: "+3%",
      icon: <Layers />,
    },
    {
      title: "Active Technicians",
      value: analytics.picPerformance.filter((p) => p.pic !== "Unassigned").length.toString(),
      change: "+2%",
      icon: <Users />,
    },
  ];

  // Ganti fungsi handleExportReports dengan yang berikut:
  const handleExportReports = useCallback(() => {
    if (hasPermission("export_reports")) {
      // Create new PDF document
      const doc = new jsPDF();

      // Add company header
      doc.setFontSize(20);
      doc.setTextColor(40, 40, 40);
      doc.text("IT WORK ORDER REPORT", 105, 20, { align: "center" });

      doc.setFontSize(12);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on: ${new Date().toLocaleDateString("id-ID")}`, 105, 30, { align: "center" });
      doc.text(`Time Range: ${timeRange === "7days" ? "Last 7 Days" : timeRange === "30days" ? "Last 30 Days" : timeRange === "90days" ? "Last 90 Days" : "All Time"}`, 105, 37, { align: "center" });

      // Add summary statistics
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("SUMMARY STATISTICS", 20, 55);

      doc.setFontSize(10);
      doc.setTextColor(80, 80, 80);
      doc.text(`Total Work Orders: ${analytics.total}`, 20, 65);
      doc.text(`Resolved: ${analytics.resolved}`, 20, 72);
      doc.text(`Active: ${analytics.active}`, 20, 79);
      doc.text(`Average Resolution Time: ${analytics.avgResolutionTime} days`, 20, 86);
      doc.text(`Resolution Rate: ${analytics.resolutionRate.toFixed(1)}%`, 20, 93);

      // Add work orders table
      doc.setFontSize(14);
      doc.setTextColor(40, 40, 40);
      doc.text("WORK ORDER DETAILS", 20, 110);

      // Prepare table data
      const tableHeaders = ["WO No", "Requester", "Department", "Date", "Status", "Priority", "Service Type", "Assigned To", "Resolution Days"];

      const tableData = filteredWorkOrders.map((order) => [
        order.work_order_no || "-",
        order.requester?.name || "-",
        order.department?.name || "-",
        formatDate(order.date),
        order.handling_status || "-",
        order.service?.priority || "Not Set",
        order.service_type?.group_name || "-",
        order.assigned_to?.name || "-",
        order.handling_date ? calculateResolutionTime(order).toString() : "Ongoing",
      ]);

      // Add table
      autoTable(doc, {
        head: [tableHeaders],
        body: tableData,
        startY: 115,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
        margin: { left: 20, right: 20 },
      });

      // Add status distribution
      const finalY = (doc as any).lastAutoTable.finalY + 15;

      if (finalY < 250) {
        doc.setFontSize(14);
        doc.setTextColor(40, 40, 40);
        doc.text("STATUS DISTRIBUTION", 20, finalY);

        const statusData = analytics.statusDistribution.map((status) => [status.status, status.count.toString(), `${status.percentage.toFixed(1)}%`]);

        autoTable(doc, {
          head: [["Status", "Count", "Percentage"]],
          body: statusData,
          startY: finalY + 5,
          styles: {
            fontSize: 8,
            cellPadding: 2,
          },
          headStyles: {
            fillColor: [16, 185, 129],
            textColor: 255,
            fontStyle: "bold",
          },
          margin: { left: 20, right: 20 },
        });
      }

      // Add page numbers
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${pageCount}`, 105, 290, { align: "center" });
        doc.text("Confidential - IT Department Report", 105, 295, { align: "center" });
      }

      // Save the PDF
      doc.save(`it-workorder-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } else {
      alert("You do not have permission to export reports.");
    }
  }, [hasPermission, filteredWorkOrders, analytics, timeRange]);

  // Tambahkan juga fungsi untuk export PDF yang lebih detail jika diperlukan:
  const handleExportDetailedReport = useCallback(() => {
    if (hasPermission("export_reports")) {
      const doc = new jsPDF();

      // Cover Page
      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 297, "F");

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(24);
      doc.text("IT SERVICE MANAGEMENT", 105, 100, { align: "center" });
      doc.setFontSize(18);
      doc.text("COMPREHENSIVE REPORT", 105, 120, { align: "center" });

      doc.setFontSize(14);
      doc.text(`Period: ${timeRange === "7days" ? "Last 7 Days" : timeRange === "30days" ? "Last 30 Days" : timeRange === "90days" ? "Last 90 Days" : "All Time"}`, 105, 150, { align: "center" });
      doc.text(
        `Generated: ${new Date().toLocaleDateString("id-ID", {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        })}`,
        105,
        160,
        { align: "center" }
      );

      doc.setFontSize(10);
      doc.text("Confidential Business Document - For Internal Use Only", 105, 280, { align: "center" });

      // Executive Summary Page
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("EXECUTIVE SUMMARY", 105, 20, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);

      const summaryY = 50;
      doc.text("Performance Overview:", 20, summaryY);
      doc.setFontSize(10);
      doc.text(`• Total Work Orders Processed: ${analytics.total}`, 25, summaryY + 10);
      doc.text(`• Successfully Resolved: ${analytics.resolved} (${analytics.resolutionRate.toFixed(1)}%)`, 25, summaryY + 17);
      doc.text(`• Average Resolution Time: ${analytics.avgResolutionTime} days`, 25, summaryY + 24);
      doc.text(`• Active/Pending Work Orders: ${analytics.active}`, 25, summaryY + 31);

      doc.text("Key Metrics:", 20, summaryY + 50);
      doc.text(`• Service Types Handled: ${analytics.serviceTypePerformance.length}`, 25, summaryY + 60);
      doc.text(`• Departments Served: ${analytics.departmentDistribution.length}`, 25, summaryY + 67);
      doc.text(`• Active Technicians: ${analytics.picPerformance.filter((p) => p.pic !== "Unassigned").length}`, 25, summaryY + 74);

      // Performance Analysis Page
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("PERFORMANCE ANALYSIS", 105, 20, { align: "center" });

      doc.setTextColor(0, 0, 0);
      doc.setFontSize(12);
      doc.text("Service Type Performance:", 20, 50);

      const serviceTypeData = analytics.serviceTypePerformance.sort((a, b) => b.avgResolutionTime - a.avgResolutionTime).map((service) => [service.serviceType, service.avgResolutionTime.toString(), service.totalRequests.toString()]);

      autoTable(doc, {
        head: [["Service Type", "Avg Resolution (Days)", "Total Requests"]],
        body: serviceTypeData,
        startY: 60,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [16, 185, 129],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      // Technician Performance
      const techY = (doc as any).lastAutoTable.finalY + 15;
      doc.setFontSize(12);
      doc.text("Technician Performance:", 20, techY);

      const techData = analytics.picPerformance
        .filter((tech) => tech.pic !== "Unassigned")
        .sort((a, b) => b.totalWorkOrders - a.totalWorkOrders)
        .map((tech) => [tech.pic, tech.avgResolutionTime.toString(), tech.totalWorkOrders.toString(), tech.resolvedWorkOrders.toString()]);

      autoTable(doc, {
        head: [["Technician", "Avg Resolution (Days)", "Total Assigned", "Resolved"]],
        body: techData,
        startY: techY + 5,
        styles: { fontSize: 8 },
        headStyles: {
          fillColor: [245, 158, 11],
          textColor: 255,
          fontStyle: "bold",
        },
      });

      // Detailed Work Orders Page
      doc.addPage();

      doc.setFillColor(59, 130, 246);
      doc.rect(0, 0, 210, 30, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.text("DETAILED WORK ORDERS", 105, 20, { align: "center" });

      const detailedHeaders = ["Work Order No", "Requester", "Department", "Date", "Status", "Priority", "Service Type", "Assigned To", "Resolution Days"];

      const detailedData = filteredWorkOrders.map((order) => [
        order.work_order_no || "-",
        order.requester?.name || "-",
        order.department?.name || "-",
        formatDate(order.date),
        order.handling_status || "-",
        order.service?.priority || "Not Set",
        order.service_type?.group_name || "-",
        order.assigned_to?.name || "-",
        order.handling_date ? calculateResolutionTime(order).toString() : "Ongoing",
      ]);

      autoTable(doc, {
        head: [detailedHeaders],
        body: detailedData,
        startY: 40,
        styles: {
          fontSize: 6,
          cellPadding: 1.5,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: "bold",
        },
        alternateRowStyles: {
          fillColor: [240, 240, 240],
        },
      });

      // Add page numbers to all pages
      const totalPages = doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.text(`Page ${i} of ${totalPages}`, 105, 290, { align: "center" });
        doc.text("Confidential IT Department Report", 105, 295, { align: "center" });
      }

      doc.save(`it-detailed-report-${new Date().toISOString().split("T")[0]}.pdf`);
    } else {
      alert("You do not have permission to export reports.");
    }
  }, [hasPermission, filteredWorkOrders, analytics, timeRange]);

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

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter, departmentFilter, priorityFilter, serviceTypeFilter, timeRange]);

  const handleViewDetails = (order: WorkOrderData) => {
    setSelectedWorkOrder(order);
    setShowDetailModal(true);
  };

  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedWorkOrder(undefined);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
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
        <PageHeader
          mainTitle="IT Work Order - Advanced Analytics"
          mainTitleHighlight="Dashboard"
          description="Comprehensive performance insights and operational analytics for IT service management."
          icon={<BarChart2 />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

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
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IT Service Performance Analytics</h1>
              <p className="text-gray-600 mt-1">Advanced insights and performance metrics for IT work order management</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as any)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="7days">Last 7 Days</option>
                <option value="30days">Last 30 Days</option>
                <option value="90days">Last 90 Days</option>
                <option value="all">All Time</option>
              </select>
              {hasPermission("export_reports") && (
                <>
                  <motion.button
                    onClick={handleExportReports}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
                  >
                    <Printer className="mr-2" /> Export Summary PDF
                  </motion.button>
                  <motion.button
                    onClick={handleExportDetailedReport}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md hover:bg-green-700 transition-colors duration-200 flex items-center"
                  >
                    <Printer className="mr-2" /> Export Detailed PDF
                  </motion.button>
                </>
              )}
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {kpiCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                    <p className={`mt-2 text-xs font-semibold ${card.change.startsWith("+") ? "text-green-600" : "text-red-600"}`}>{card.change} from previous period</p>
                  </div>
                  <div className={`p-3 rounded-full bg-blue-50 text-blue-600 text-xl`}>{card.icon}</div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="mr-2" /> Monthly Work Order Trends
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.monthlyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="created" stackId="1" stroke="#8884d8" fill="#8884d8" name="Created" />
                  <Area type="monotone" dataKey="resolved" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Resolved" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="mr-2" /> Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={analytics.statusDistribution} cx="50%" cy="50%" labelLine={false} label={({ status, percentage }) => `${status}: ${percentage.toFixed(1)}%`} outerRadius={80} fill="#8884d8" dataKey="count">
                    {analytics.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* GANTI: Priority Performance Analysis */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <AlertCircle className="mr-2" /> Priority Resolution Time (Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.priorityTimingAnalysis}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="priority" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value} days`, "Avg Resolution Time"]} />
                  <Bar dataKey="avgResolutionTime" fill="#ff7300" name="Avg Resolution (Days)" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="mr-2" /> Department Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.departmentDistribution} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="dept" width={100} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0088FE" name="Work Orders" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ToolCase className="mr-2" /> Status Timing Analysis
              </h3>
              <div className="space-y-4">
                {analytics.statusTimingAnalysis
                  .filter((item) => item.count > 0)
                  .map((status, index) => (
                    <div key={status.status} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(status.status).split(" ")[0]}`} />
                        <span className="font-medium text-sm capitalize">{status.status}</span>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{status.avgTimeInStatus}d avg</div>
                        <div className="text-xs text-gray-500">{status.count} tickets</div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* GANTI: Service Type Distribution dengan Performance */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ToolCase className="mr-2" /> Service Type Performance (Days to Resolve)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.serviceTypePerformance.sort((a, b) => b.avgResolutionTime - a.avgResolutionTime).slice(0, 8)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="serviceType" width={120} />
                  <Tooltip formatter={(value) => [`${value} days`, "Avg Resolution Time"]} />
                  <Bar dataKey="avgResolutionTime" fill="#0088FE" name="Avg Days to Resolve">
                    {analytics.serviceTypePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.avgResolutionTime > 10 ? "#FF8042" : entry.avgResolutionTime > 5 ? "#FFBB28" : "#00C49F"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* TAMBAH: Daily Trends */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <TrendingUp className="mr-2" /> Daily Work Order Trends (30 Days)
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics.dailyTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="created" stroke="#8884d8" name="Created" strokeWidth={2} />
                  <Line type="monotone" dataKey="resolved" stroke="#82ca9d" name="Resolved" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* TAMBAH: Service Owner Performance */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="mr-2" /> Service Owner Performance
              </h3>
              <div className="space-y-4 max-h-80 overflow-y-auto">
                {analytics.serviceOwnerPerformance
                  .sort((a, b) => b.totalWorkOrders - a.totalWorkOrders)
                  .map((owner, index) => (
                    <div key={owner.owner} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-900">{owner.owner}</h4>
                          <p className="text-sm text-gray-600">{owner.totalWorkOrders} work orders</p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{owner.avgResolutionTime} days avg</div>
                          <div className="text-sm text-gray-500">{owner.resolvedWorkOrders} resolved</div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 gap-2 text-xs">
                        {owner.workOrders.slice(0, 3).map((wo, idx) => (
                          <div key={idx} className="flex justify-between items-center p-2 bg-white rounded">
                            <span className="font-medium">{wo.workOrderNo}</span>
                            <span className={`px-2 py-1 rounded text-xs ${wo.priority === "Critical" ? "bg-red-100 text-red-800" : wo.priority === "High" ? "bg-orange-100 text-orange-800" : "bg-blue-100 text-blue-800"}`}>
                              {wo.priority}
                            </span>
                            <span>{wo.resolutionTime}d</span>
                          </div>
                        ))}
                        {owner.workOrders.length > 3 && <div className="text-center text-gray-500 text-xs">+{owner.workOrders.length - 3} more work orders</div>}
                      </div>
                    </div>
                  ))}
              </div>
            </div>

            {/* TAMBAH: PIC/Technician Performance */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <Users className="mr-2" /> Technician Performance
              </h3>
              <div className="space-y-3">
                {analytics.picPerformance
                  .filter((pic) => pic.pic !== "Unassigned")
                  .sort((a, b) => b.totalWorkOrders - a.totalWorkOrders)
                  .slice(0, 6)
                  .map((pic, index) => (
                    <div key={pic.pic} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                        <div>
                          <span className="font-medium text-sm">{pic.pic}</span>
                          <div className="text-xs text-gray-500">
                            {pic.totalWorkOrders} orders • {pic.avgResolutionTime}d avg
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {pic.resolvedWorkOrders}/{pic.totalWorkOrders}
                        </div>
                        <div className="text-xs text-gray-500">resolved</div>
                      </div>
                    </div>
                  ))}
              </div>
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
                <div className="relative w-full sm:w-auto">
                  <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)} className="w-full sm:w-48 p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="all">All Priorities</option>
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
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
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Service Type</label>
                      <select value={serviceTypeFilter} onChange={(e) => setServiceTypeFilter(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                        <option value="all">All Service Types</option>
                        {Array.from(new Set(workOrders.map((order) => order.service_type?.group_name).filter(Boolean))).map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Detailed Work Order Analytics</h3>
            {currentOrders.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <FileText className="mx-auto h-12 w-12 text-gray-400" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Resolution Time</th>
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
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${
                              order.service?.priority === "Critical"
                                ? "bg-red-100 text-red-800"
                                : order.service?.priority === "High"
                                ? "bg-orange-100 text-orange-800"
                                : order.service?.priority === "Medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {order.service?.priority || "Not Set"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.handling_status)}`}>{order.handling_status || "Unknown"}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.assigned_to?.name || "-"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.handling_date ? `${calculateResolutionTime(order)} days` : "Ongoing"}</td>
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
