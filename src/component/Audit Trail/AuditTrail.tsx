import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, AuditLog, User } from "../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../component/Sidebar";
import PageHeader from "../PageHeader";
import {
  Clipboard,
  Search,
  ChevronDown,
  ChevronRight,
  LogOut,
  Settings,
  Bell,
  Info,
  Moon,
  Sun,
  UserIcon,
  Clock,
  User as UserLucide,
  Activity,
  MapPin,
  AlertTriangle,
  Eye,
  X,
  FileText,
  Plus,
  Trash2,
  CheckCircle,
  ListCheck,
  Key,
  Database,
  BarChart2,
} from "lucide-react";
import DOMPurify from "dompurify";

// useDebounce function
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
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

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "New Audit Entry",
    description: "User 'admin' created a new asset.",
    date: "Today, 10:00 AM",
    icon: <Activity className="text-blue-500" />,
  },
  {
    id: 2,
    title: "System Update",
    description: "Audit trail system updated to latest version.",
    date: "Yesterday, 03:00 PM",
    icon: <Info className="text-green-500" />,
  },
];

const AuditTrail: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const { user, getAuditTrail, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  // Di dalam useState untuk sortConfig - pastikan defaultnya descending:
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>({
    key: "changed_at",
    direction: "descending", // Pastikan ini descending untuk newest first
  });
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 300);
  const [showAuditDetailsModal, setShowAuditDetailsModal] = useState(false);
  const [selectedAuditLog, setSelectedAuditLog] = useState<AuditLog | null>(null);

  const loadAuditTrail = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAuditTrail();
      setAuditLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit trail:", err);
      setError("Failed to load audit trail data. Please try again.");
      setAuditLogs([]);
    } finally {
      setLoading(false);
    }
  }, [getAuditTrail]);

  useEffect(() => {
    loadAuditTrail();
  }, [loadAuditTrail]);

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

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getDisplayValue = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return value.name || value.toString();
    }
    return value?.toString() || "";
  };

  const openAuditDetails = useCallback((log: AuditLog) => {
    setSelectedAuditLog(log);
    setShowAuditDetailsModal(true);
  }, []);

  const getActionIcon = (action: string) => {
    switch (action) {
      case "created":
        return <Plus className="w-4 h-4 text-green-500" />;
      case "updated":
        return <Activity className="w-4 h-4 text-blue-500" />;
      case "deleted":
        return <Trash2 className="w-4 h-4 text-red-500" />;
      default:
        return <FileText className="w-4 h-4 text-gray-500" />;
    }
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case "created":
        return "bg-green-500 text-white";
      case "updated":
        return "bg-blue-600 text-white";
      case "deleted":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const getRecordableTypeDisplay = (recordableType: string) => {
    if (!recordableType) return "Unknown";
    return recordableType.replace("App\\Models\\", "");
  };

  // Di dalam filteredAndSortedLogs - GANTI bagian ini:
  const filteredAndSortedLogs = React.useMemo(() => {
    let currentLogs = [...(auditLogs || [])];

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase().trim();
      currentLogs = currentLogs.filter((log) => {
        const searchableFields = [
          log.changed_by?.toLowerCase() || "",
          log.action?.toLowerCase() || "",
          log.recordable_type?.toLowerCase() || "",
          JSON.stringify(log.old_data_snapshot || {}).toLowerCase(),
          JSON.stringify(log.new_data_snapshot || {}).toLowerCase(),
        ];
        return searchableFields.some((field) => field.includes(lowerCaseQuery));
      });
    }

    // Apply sorting - FIX: Default sort by timestamp descending (newest first)
    if (sortConfig !== null) {
      currentLogs.sort((a, b) => {
        // Special handling for timestamp field
        if (sortConfig.key === "changed_at") {
          const aTime = new Date(a.changed_at).getTime();
          const bTime = new Date(b.changed_at).getTime();
          return sortConfig.direction === "ascending" ? aTime - bTime : bTime - aTime;
        }

        // For other fields
        const aValue = getDisplayValue((a as Record<string, any>)[sortConfig.key]);
        const bValue = getDisplayValue((b as Record<string, any>)[sortConfig.key]);

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: newest first by timestamp
      currentLogs.sort((a, b) => {
        const aTime = new Date(a.changed_at).getTime();
        const bTime = new Date(b.changed_at).getTime();
        return bTime - aTime;
      });
    }

    return currentLogs;
  }, [auditLogs, debouncedSearchQuery, sortConfig]);

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredAndSortedLogs.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredAndSortedLogs.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const formatTimestamp = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString();
    } catch (e) {
      return timestamp;
    }
  };

  const AuditDetails: React.FC<{ log: AuditLog; onClose: () => void }> = ({ log, onClose }) => {
    const displayValue = (value: any): string => {
      if (value === null || value === undefined) return "-";
      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }
      if (typeof value === "string") {
        return value.trim() !== "" ? value.trim() : "-";
      }
      if (typeof value === "number") {
        return value.toString();
      }
      if (typeof value === "boolean") {
        return value ? "Yes" : "No";
      }
      return String(value);
    };

    const displayHTMLContent = (htmlContent: string): string => {
      if (!htmlContent || htmlContent.trim() === "") return "-";

      const cleanHTML = DOMPurify.sanitize(htmlContent, {
        ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "span", "div", "ol", "ul", "li", "strong", "b", "em", "i", "u", "s", "strike", "code", "mark", "sub", "sup", "blockquote", "pre"],
        ALLOWED_ATTR: ["style", "class", "data-color", "align", "type", "start"],
      });

      return cleanHTML;
    };

    const formatTimestamp = (timestamp: string) => {
      try {
        const date = new Date(timestamp);
        return date.toLocaleString();
      } catch (e) {
        return timestamp;
      }
    };

    const getRecordableTypeDisplay = (recordableType: string) => {
      if (!recordableType) return "Unknown";
      return recordableType.replace("App\\Models\\", "");
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

    // Komponen Detail Item yang lebih modern untuk Audit Trail
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

    // Komponen DetailItemHTML yang lebih rapi untuk Audit Trail
    const DetailItemHTML: React.FC<{
      label: string;
      htmlContent: string;
      icon?: React.ReactNode;
      fullWidth?: boolean;
    }> = ({ label, htmlContent, icon, fullWidth = false }) => {
      if (!htmlContent || htmlContent.trim() === "") {
        return <DetailItem label={label} value="-" icon={icon} fullWidth={fullWidth} priority="low" />;
      }

      const cleanHTML = displayHTMLContent(htmlContent);

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

    // Fungsi untuk mendapatkan semua keys yang unik dari old dan new data
    const getAllFieldKeys = () => {
      const oldKeys = log.old_data_snapshot ? Object.keys(log.old_data_snapshot) : [];
      const newKeys = log.new_data_snapshot ? Object.keys(log.new_data_snapshot) : [];
      const allKeys = [...new Set([...oldKeys, ...newKeys])];

      // Filter out fields yang tidak perlu
      return allKeys.filter((key) => !["id", "created_at", "updated_at", "deleted_at"].includes(key));
    };

    const areValuesEqual = (val1: any, val2: any): boolean => {
      // Handle undefined/null cases
      if (val1 === undefined && val2 === undefined) return true;
      if (val1 === null && val2 === null) return true;
      if (val1 === undefined && val2 === null) return false;
      if (val1 === null && val2 === undefined) return false;

      // Kasus dasar: sama persis
      if (val1 === val2) return true;

      // Handle number comparisons - termasuk konversi string ke number
      if (!isNaN(Number(val1)) && !isNaN(Number(val2))) {
        return Number(val1) === Number(val2);
      }

      // Handle boolean comparisons
      if (typeof val1 === "boolean" && typeof val2 === "boolean") {
        return val1 === val2;
      }

      // Handle string comparisons (case insensitive)
      if (typeof val1 === "string" && typeof val2 === "string") {
        return val1.trim().toLowerCase() === val2.trim().toLowerCase();
      }

      // Untuk objects/arrays, gunakan JSON comparison
      if (typeof val1 === "object" && typeof val2 === "object" && val1 !== null && val2 !== null) {
        try {
          return JSON.stringify(val1) === JSON.stringify(val2);
        } catch {
          return String(val1) === String(val2);
        }
      }

      // Fallback: convert to string and compare
      const str1 = String(val1 || "").trim();
      const str2 = String(val2 || "").trim();

      // Consider empty strings and null/undefined as equal for comparison purposes
      if ((str1 === "" || str1 === "null" || str1 === "undefined") && (str2 === "" || str2 === "null" || str2 === "undefined")) {
        return true;
      }

      return str1 === str2;
    };

    const renderDataComparison = () => {
      const fieldKeys = getAllFieldKeys();

      if (fieldKeys.length === 0) {
        return <div className="text-center py-8 text-gray-500">No data changes recorded</div>;
      }

      // Bangun rows untuk semua field (termasuk unchanged)
      const rows = fieldKeys.map((key) => {
        const oldSnapshot = log.old_data_snapshot ?? {};
        const newSnapshot = log.new_data_snapshot ?? {};

        const oldHasKey = Object.prototype.hasOwnProperty.call(oldSnapshot, key);
        const newHasKey = Object.prototype.hasOwnProperty.call(newSnapshot, key);

        const oldValue = oldHasKey ? oldSnapshot[key] : undefined;
        let newValue = newHasKey ? newSnapshot[key] : undefined;

        // Jika action = 'updated' dan new snapshot TIDAK menyertakan key,
        // anggap field tersebut unchanged (partial update case).
        if (log.action === "updated" && oldHasKey && !newHasKey) {
          newValue = oldValue;
        }

        // Tentukan status dengan aturan yang benar:
        let status: "added" | "removed" | "updated" | "unchanged";
        if (!oldHasKey && newHasKey) {
          status = "added";
        } else if (oldHasKey && !newHasKey) {
          // Hanya treat sebagai removed kalau aksi memang delete; untuk updated treat sebagai unchanged
          status = log.action === "deleted" ? "removed" : "unchanged";
        } else if (!areValuesEqual(oldValue, newValue)) {
          status = "updated";
        } else {
          status = "unchanged";
        }

        return { key, oldValue, newValue, status };
      });

      const changedCount = rows.filter((r) => r.status !== "unchanged").length;
      const unchangedCount = rows.length - changedCount;

      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Field</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Old Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Value</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {rows.map(({ key, oldValue, newValue, status }) => {
                const formattedKey = key
                  .split("_")
                  .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                  .join(" ");

                // GUNAKAN displayValue untuk teks biasa dan displayHTMLContent untuk HTML
                const isHTMLField = key.toLowerCase().includes("complaint") || key.toLowerCase().includes("action_taken") || key.toLowerCase().includes("remarks");

                const oldDisplay = isHTMLField ? displayHTMLContent(String(oldValue || "")) : displayValue(oldValue);
                const newDisplay = isHTMLField ? displayHTMLContent(String(newValue || "")) : displayValue(newValue);

                const rowBg = status === "updated" ? "bg-yellow-50" : status === "added" ? "bg-green-50" : status === "removed" ? "bg-red-50" : "";

                return (
                  <tr key={key} className={rowBg}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{formattedKey}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {isHTMLField ? (
                        <div
                          className={`p-2 rounded rich-text-content prose prose-sm max-w-none ${
                            status === "removed" ? "bg-red-100 text-red-800 border border-red-200" : status === "updated" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                          dangerouslySetInnerHTML={{ __html: oldDisplay }}
                        />
                      ) : (
                        <div
                          className={`p-2 rounded ${
                            status === "removed" ? "bg-red-100 text-red-800 border border-red-200" : status === "updated" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {oldDisplay}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      {isHTMLField ? (
                        <div
                          className={`p-2 rounded rich-text-content prose prose-sm max-w-none ${
                            status === "added" ? "bg-green-100 text-green-800 border border-green-200" : status === "updated" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                          dangerouslySetInnerHTML={{ __html: newDisplay }}
                        />
                      ) : (
                        <div
                          className={`p-2 rounded ${
                            status === "added" ? "bg-green-100 text-green-800 border border-green-200" : status === "updated" ? "bg-yellow-100 text-yellow-800 border border-yellow-200" : "bg-gray-100 text-gray-800 border border-gray-200"
                          }`}
                        >
                          {newDisplay}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {status === "added" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <Plus className="w-3 h-3 mr-1" />
                          Added
                        </span>
                      ) : status === "removed" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Trash2 className="w-3 h-3 mr-1" />
                          Removed
                        </span>
                      ) : status === "updated" ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          <Activity className="w-3 h-3 mr-1" />
                          Updated
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Unchanged
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Ringkasan kecil */}
          <div className="mt-4 text-sm text-gray-600">
            <span className="font-medium">{changedCount}</span> field(s) changed • <span className="font-medium">{unchangedCount}</span> field(s) unchanged
          </div>
        </div>
      );
    };

    // Fungsi untuk render complete data fields
    const renderCompleteDataFields = (data: any, type: "old" | "new") => {
      if (!data || Object.keys(data).length === 0) {
        return <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">No {type} data available</div>;
      }

      const filteredData = Object.entries(data).filter(([key]) => {
        // Skip fields yang tidak perlu
        return !["id", "created_at", "updated_at", "deleted_at"].includes(key);
      });

      if (filteredData.length === 0) {
        return <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">No {type} data available</div>;
      }

      return (
        <div className="space-y-4">
          {filteredData.map(([key, value]) => {
            // Format key untuk display (ubah snake_case ke Title Case)
            const formattedKey = key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            // Deteksi field yang berisi HTML
            const isHTMLField = key.toLowerCase().includes("complaint") || key.toLowerCase().includes("action_taken") || key.toLowerCase().includes("remarks");

            return (
              <div key={key} className="flex flex-col md:flex-row md:items-start gap-3 p-4 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="md:w-1/3 lg:w-1/4">
                  <h4 className="text-sm font-semibold text-gray-700 break-words">{formattedKey}</h4>
                </div>
                <div className="md:w-2/3 lg:w-3/4">
                  {isHTMLField ? (
                    <div
                      className="rich-text-content bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-sm break-words prose prose-sm max-w-none
                          prose-headings:font-semibold prose-p:my-2 prose-ul:my-2 prose-ol:my-2
                          prose-li:my-1 prose-strong:font-semibold prose-em:italic"
                      dangerouslySetInnerHTML={{ __html: displayHTMLContent(String(value || "")) }}
                    />
                  ) : (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-sm break-words">{displayValue(value)}</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      );
    };

    // Fungsi untuk render data individual (untuk bagian selain comparison)
    const renderDataFields = (data: any, title: string) => {
      if (!data || Object.keys(data).length === 0) {
        return <div className="text-center py-4 text-gray-500">No {title.toLowerCase()} available</div>;
      }

      const filteredData = Object.entries(data).filter(([key, value]) => {
        // Skip fields yang tidak perlu
        if (["id", "created_at", "updated_at", "deleted_at"].includes(key)) return false;
        // Skip nilai yang kosong
        if (value === null || value === undefined || value === "") return false;
        return true;
      });

      if (filteredData.length === 0) {
        return <div className="text-center py-4 text-gray-500">No {title.toLowerCase()} available</div>;
      }

      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredData.map(([key, value]) => {
            // Format key untuk display (ubah snake_case ke Title Case)
            const formattedKey = key
              .split("_")
              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
              .join(" ");

            return <DetailItem key={key} label={formattedKey} value={displayValue(value)} />;
          })}
        </div>
      );
    };

    return (
      <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
        {/* Header Information */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Audit Log #{log.id}</h2>
                <span
                  className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                    log.action === "created"
                      ? "bg-green-100 text-green-800 border border-green-300"
                      : log.action === "updated"
                      ? "bg-blue-100 text-blue-800 border border-blue-300"
                      : log.action === "deleted"
                      ? "bg-red-100 text-red-800 border border-red-300"
                      : "bg-gray-100 text-gray-800 border border-gray-300"
                  }`}
                >
                  {log.action.charAt(0).toUpperCase() + log.action.slice(1)}
                </span>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Timestamp: {formatTimestamp(log.changed_at)}
                </span>
                <span className="flex items-center gap-2">
                  <UserLucide className="w-4 h-4" />
                  User: {log.changed_by || "N/A"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* General Information */}
        <Section title="General Information" icon={<Clipboard className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <DetailItem label="Audit ID" value={displayValue(log.id)} icon={<Key className="w-4 h-4" />} priority="high" />
            <DetailItem label="Timestamp" value={formatTimestamp(log.changed_at)} icon={<Clock className="w-4 h-4" />} priority="high" />
            <DetailItem label="User" value={displayValue(log.changed_by)} icon={<UserLucide className="w-4 h-4" />} priority="high" />
            <DetailItem label="Action" value={displayValue(log.action)} icon={<Activity className="w-4 h-4" />} priority="high" />
            <DetailItem label="Record Type" value={getRecordableTypeDisplay(log.recordable_type)} icon={<FileText className="w-4 h-4" />} />
            <DetailItem label="Record ID" value={displayValue(log.recordable_id)} icon={<ListCheck className="w-4 h-4" />} />
          </div>
        </Section>

        {/* Record Details */}
        {log.recordable_details && Object.keys(log.recordable_details).length > 0 && (
          <Section title="Record Details" icon={<FileText className="w-5 h-5" />}>
            {renderDataFields(log.recordable_details, "Record Details")}
          </Section>
        )}

        {/* Data Changes Comparison */}
        <Section title="Data Changes Comparison" icon={<Activity className="w-5 h-5" />}>
          {renderDataComparison()}
        </Section>

        {/* Complete Data Snapshots */}
        <Section title="Complete Data Snapshots" icon={<Database className="w-5 h-5" />}>
          <div className="space-y-8">
            {/* Old Data Snapshot */}
            {log.old_data_snapshot && Object.keys(log.old_data_snapshot).length > 0 && (
              <div className="w-full">
                <h4 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">Old Data Snapshot</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">{renderCompleteDataFields(log.old_data_snapshot, "old")}</div>
              </div>
            )}

            {/* New Data Snapshot */}
            {log.new_data_snapshot && Object.keys(log.new_data_snapshot).length > 0 && (
              <div className="w-full">
                <h4 className="text-md font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-200">New Data Snapshot</h4>
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">{renderCompleteDataFields(log.new_data_snapshot, "new")}</div>
              </div>
            )}
          </div>
        </Section>

        {/* Summary Section */}
        <Section title="Audit Summary" icon={<BarChart2 className="w-5 h-5" />}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-25 rounded-lg border-l-4 border-l-blue-400">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Action Type</h4>
              <p className="text-lg font-bold text-blue-600">{log.action.charAt(0).toUpperCase() + log.action.slice(1)}</p>
            </div>
            <div className="p-4 bg-green-25 rounded-lg border-l-4 border-l-green-400">
              <h4 className="text-sm font-semibold text-gray-700 mb-2">Record Information</h4>
              <p className="text-sm text-green-600">
                {getRecordableTypeDisplay(log.recordable_type)} • ID: {log.recordable_id}
              </p>
            </div>
          </div>
        </Section>

        {/* Action Buttons */}
        <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
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
      </div>
    );
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Audit Trail" mainTitleHighlight="Trail" description="Manage activities and their configurations within the system." icon={<ListCheck />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Audit <span className="text-blue-600">Trail</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm max-w-xl">Track all user activities and system changes for enhanced security and accountability.</p>
          </motion.div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by user, action, or details..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  aria-label="Search audit logs"
                />
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading audit trail data...</p>
            </div>
          ) : error ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <AlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
              <p className="text-red-700 text-base font-medium">{error}</p>
              <button onClick={loadAuditTrail} className="mt-5 px-5 py-2 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors duration-200 text-sm">
                Retry
              </button>
            </div>
          ) : filteredAndSortedLogs.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">{debouncedSearchQuery ? "No audit entries found matching your search." : "No audit entries available."}</p>
              {debouncedSearchQuery && (
                <button onClick={() => setSearchQuery("")} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("changed_at")}>
                        <div className="flex items-center">
                          <Clock className="mr-2 text-sm" /> Timestamp
                          {sortConfig?.key === "changed_at" ? <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span> : <span className="ml-1 text-gray-400">↓</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("changed_by")}>
                        <div className="flex items-center">
                          <UserLucide className="mr-2 text-sm" /> User
                          {sortConfig?.key === "changed_by" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("action")}>
                        <div className="flex items-center">
                          <Activity className="mr-2 text-sm" /> Action
                          {sortConfig?.key === "action" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("recordable_type")}>
                        <div className="flex items-center">
                          <FileText className="mr-2 text-sm" /> Record Type
                          {sortConfig?.key === "recordable_type" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                        </div>
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.map((log) => (
                      <motion.tr
                        key={log.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{formatTimestamp(log.changed_at)}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{log.changed_by || "N/A"}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getActionColor(log.action)} shadow-sm`}>{log.action.charAt(0).toUpperCase() + log.action.slice(1)}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900">{getRecordableTypeDisplay(log.recordable_type)}</div>
                          {log.recordable_id && <div className="text-xs text-gray-500">ID: {log.recordable_id}</div>}
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openAuditDetails(log)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <Eye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {filteredAndSortedLogs.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredAndSortedLogs.length)}</span> of{" "}
                <span className="font-semibold">{filteredAndSortedLogs.length}</span> results
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

      {/* Modal untuk Audit Details */}
      {selectedAuditLog && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-6 border border-blue-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Audit Details #{selectedAuditLog.id}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowAuditDetailsModal(false);
                    setSelectedAuditLog(null);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <X size={24} />
                </motion.button>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                <AuditDetails
                  log={selectedAuditLog}
                  onClose={() => {
                    setShowAuditDetailsModal(false);
                    setSelectedAuditLog(null);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AuditTrail;
