import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, MachineHistoryRecord } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
// import { useDebounce } from "../hooks/useDebounce"; // Commented out as it's now defined locally for self-containment
import Sidebar from "../component/Sidebar";
import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Users,
  BarChart2,
  Database,
  Clipboard,
  Filter,
  Package,
  ChevronLeft,
  Home,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
  Settings,
  Bell,
  Edit,
  Eye,
  Clock,
  Calendar,
  Trash2,
  Key,
  Info,
  Moon,
  Sun,
  UserIcon,
} from "lucide-react";

// Moved useDebounce definition here to resolve "Cannot find module" error
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

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
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
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${className || "max-w-xl w-full"}`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 focus:outline-none transition-colors duration-150" aria-label="Close modal">
                <X className="text-xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

interface HistoryDetailsProps {
  record: MachineHistoryRecord;
  onClose: () => void;
}

const convertDurationInMinutes = (startHour: number | null | undefined, startMinute: number | null | undefined, stopHour: number | null | undefined, stopMinute: number | null | undefined): number | null => {
  if (startHour === null || startHour === undefined || startMinute === null || startMinute === undefined || stopHour === null || stopHour === undefined || stopMinute === null || stopMinute === undefined) {
    return null;
  }

  const startTimeInMinutes = startHour * 60 + startMinute;
  const stopTimeInMinutes = stopHour * 60 + stopMinute;

  let diff = Math.abs(stopTimeInMinutes - startTimeInMinutes);

  if (diff > 720) {
    diff = 1440 - diff;
  }

  return diff;
};

const convertMinutesToHoursAndMinutes = (totalMinutes: number | null | undefined): string => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes) || totalMinutes < 0) {
    return "-";
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (totalMinutes === 0) {
    return "0min";
  }

  if (hours === 0 && minutes > 0) {
    return `${minutes}min`;
  }

  if (hours > 0 && minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes}min`;
};

const HistoryDetails: React.FC<HistoryDetailsProps> = ({ record, onClose }) => {
  const formatTime = (hours: number | null | undefined, minutes: number | null | undefined): string => {
    if (hours === null || hours === undefined || minutes === null || minutes === undefined) return "-";
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };

  const displayValue = (value: any): string => {
    if (value === null || value === undefined) return "-";

    // Jika value adalah objek, coba ambil properti name atau stringify
    if (typeof value === "object") {
      return value.name || JSON.stringify(value);
    }

    if (typeof value === "string") {
      return value.trim() !== "" ? value.trim() : "-";
    }

    if (typeof value === "number") {
      return value.toLocaleString("id-ID");
    }

    return String(value); // Konversi ke string sebagai fallback
  };

  const downtimeMinutes = convertDurationInMinutes(record.stopJam, record.stopMenit, record.startJam, record.startMenit);
  const displayDowntime = convertMinutesToHoursAndMinutes(downtimeMinutes);

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
        <DetailItem label="Date" value={displayValue(record.date)} />
        <DetailItem label="Shift" value={displayValue(record.shift)} />
        <DetailItem label="Group" value={displayValue(record.group)} />
        <DetailItem label="Machine" value={displayValue(record.mesin)} />
        <DetailItem label="Unit" value={displayValue(record.unit)} />
        <DetailItem label="Stop Time" value={formatTime(record.stopJam, record.stopMenit)} />
        <DetailItem label="Start Time" value={formatTime(record.startJam, record.startMenit)} />
        <DetailItem label="Downtime" value={displayValue(displayDowntime)} />
        <DetailItem label="Stop Type" value={displayValue(record.stopTime)} />
        <DetailItem label="Running Hour" value={displayValue(record.runningHour)} />
      </div>

      <SectionTitle title="Issue Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Item Trouble" value={displayValue(record.itemTrouble)} />
        <DetailItem label="Issue Description" value={displayValue(record.jenisGangguan)} />
        <DetailItem label="Action Taken" value={displayValue(record.bentukTindakan)} />
        <DetailItem label="Root Cause" value={displayValue(record.rootCause)} />
      </div>

      <SectionTitle title="Maintenance Details" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DetailItem label="Activity Type" value={displayValue(record.jenisAktivitas)} />
        <DetailItem label="Specific Activity" value={displayValue(record.kegiatan)} />
      </div>

      <SectionTitle title="Spare Parts Used" />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        <DetailItem label="Part Code" value={displayValue(record.kodePart)} />
        <DetailItem label="Part Name" value={displayValue(record.sparePart)} />
        <DetailItem label="ID Part" value={displayValue(record.idPart)} />
        <DetailItem label="Quantity" value={displayValue(record.jumlah)} />
        <DetailItem label="Unit" value={displayValue(record.unitSparePart)} />
      </div>

      <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
        >
          Close
        </motion.button>
      </div>
    </div>
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
    title: "Peringatan Mesin A",
    description: "Suhu mesin A melebihi batas normal.",
    date: "Today, 10:00 AM",
    icon: <AlertTriangle className="text-red-500" />,
  },
  {
    id: 2,
    title: "Jadwal Perawatan Mendatang",
    description: "Perawatan rutin untuk Mesin B akan dilakukan besok.",
    date: "Yesterday, 03:00 PM",
    icon: <Calendar className="text-blue-500" />,
  },
];

const MachineHistoryDashboard: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string[]>([]); // Changed to array
  const [machineFilter, setMachineFilter] = useState<string[]>([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showHistoryDetails, setShowHistoryDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MachineHistoryRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const { user, getMachineHistories, deleteMachineHistory, isAuthenticated, isMasterDataLoading, hasPermission } = useAuth();
  const [records, setRecords] = useState<MachineHistoryRecord[]>([]); // This holds ALL records
  const [filteredRecords, setFilteredRecords] = useState<MachineHistoryRecord[]>([]); // This holds filtered records
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [shiftFilter, setShiftFilter] = useState<string[]>([]); // Changed to array
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>({ key: "date", direction: "descending" });
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const machineFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [showMachineFilterDropdown, setShowMachineFilterDropdown] = useState(false);

  // New state and ref for Status and Shift dropdowns
  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
  const statusFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [showShiftFilterDropdown, setShowShiftFilterDropdown] = useState(false);
  const shiftFilterDropdownRef = useRef<HTMLDivElement>(null);

  // Apply useDebounce to searchQuery
  const debouncedSearchQuery = useDebounce(searchQuery, 300); // Debounce for 300ms

  // MEMOIZE searchCategories to make it stable
  const searchCategories = useMemo(
    () => [
      { id: "machine", name: "Machine Name" },
      { id: "issue", name: "Issue Description" },
      { id: "recordId", name: "Record ID" },
      { id: "itemTrouble", name: "Item Trouble" },
    ],
    []
  ); // Empty dependency array means it's created once

  // Define available status/type options
  const statusOptions = useMemo(
    () => [
      { value: "Perbaikan", label: "Repairs" },
      { value: "Perawatan", label: "Maintenance" },
    ],
    []
  );

  // Define available shift options
  const shiftOptions = useMemo(
    () => [
      { value: "1", label: "Shift 1" },
      { value: "2", label: "Shift 2" },
      { value: "3", label: "Shift 3" },
    ],
    []
  );

  const loadInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getMachineHistories();

      setRecords(data || []); // Store all fetched records
      setFilteredRecords(data || []); // Initially, filtered records are all records

      const uniqueMachines = Array.from(new Set(data.map((r) => r.mesin)))
        .filter(Boolean)
        .map((name) => ({ id: name, name }));

      setMachines(uniqueMachines);
    } catch (err) {
      console.error("Failed to load data:", err);
      setRecords([]);
      setMachines([]);
      // You might want to set an error here if the initial load fails critically
      // setError("Failed to load machine history data.");
    } finally {
      setLoading(false);
    }
  }, [getMachineHistories]);

  // Corrected type for the event parameter
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  // useEffect untuk mengatur currentPage ke 1 hanya sekali saat komponen dimuat
  useEffect(() => {
    setCurrentPage(1);
  }, []); // Dependency array kosong `[]` artinya hanya berjalan saat mount

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // useEffect for applying all filters, now reacting to debouncedSearchQuery
  useEffect(() => {
    let currentFilteredRecords = [...records]; // Start with all records

    // Apply search filter using the debounced query
    if (debouncedSearchQuery.trim()) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase().trim();
      currentFilteredRecords = currentFilteredRecords.filter((record) => {
        const searchParts = lowerCaseQuery.split(":");
        let category = "all";
        let actualQuery = lowerCaseQuery;

        if (searchParts.length > 1 && searchCategories.some((cat) => cat.name.toLowerCase() === searchParts[0].trim())) {
          category = searchParts[0].trim();
          actualQuery = searchParts.slice(1).join(":").trim();
        }

        const matchesMachine = record.mesin?.toLowerCase().includes(actualQuery);
        const matchesIssue = record.jenisGangguan?.toLowerCase().includes(actualQuery);
        const matchesRecordId = record.id?.toLowerCase().includes(actualQuery);
        const matchesItemTrouble = record.itemTrouble?.toLowerCase().includes(actualQuery);

        if (category === "machine name") return matchesMachine;
        if (category === "issue description") return matchesIssue;
        if (category === "record id") return matchesRecordId;
        if (category === "item trouble") return matchesItemTrouble;

        return matchesMachine || matchesIssue || matchesRecordId || matchesItemTrouble;
      });
    }

    // Apply date range filter
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      currentFilteredRecords = currentFilteredRecords.filter((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate >= startOfDay;
      });
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      currentFilteredRecords = currentFilteredRecords.filter((record) => {
        const recordDate = new Date(record.date);
        recordDate.setHours(0, 0, 0, 0);
        return recordDate <= endOfDay;
      });
    }

    // Apply status (type) filter - UPDATED FOR MULTI-SELECT
    if (statusFilter.length > 0) {
      currentFilteredRecords = currentFilteredRecords.filter((record) => statusFilter.includes(record.perbaikanPerawatan));
    }

    // Apply machine filter
    if (machineFilter.length > 0) {
      currentFilteredRecords = currentFilteredRecords.filter((record) => machineFilter.includes(record.mesin));
    }

    // Apply shift filter - UPDATED FOR MULTI-SELECT
    if (shiftFilter.length > 0) {
      currentFilteredRecords = currentFilteredRecords.filter((record) => shiftFilter.includes(record.shift));
    }

    // Apply sorting
    if (sortConfig !== null) {
      currentFilteredRecords.sort((a, b) => {
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
    }

    setFilteredRecords(currentFilteredRecords);
    // setCurrentPage(1); // Baris ini sudah dihapus/dikomentari sesuai diskusi sebelumnya
  }, [
    records,
    debouncedSearchQuery,
    startDate,
    endDate,
    statusFilter, // Now an array
    machineFilter,
    shiftFilter, // Now an array
    sortConfig,
    searchCategories,
    statusOptions, // Add if statusOptions are dynamic, otherwise not strictly needed
    shiftOptions, // Add if shiftOptions are dynamic, otherwise not strictly needed
  ]);

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
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".search-suggestions")) {
        setShowSearchSuggestions(false);
      }
      if (machineFilterDropdownRef.current && !machineFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".machine-filter-toggle")) {
        setShowMachineFilterDropdown(false);
      }
      // Close status filter dropdown if clicked outside
      if (statusFilterDropdownRef.current && !statusFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".status-filter-toggle")) {
        setShowStatusFilterDropdown(false);
      }
      // Close shift filter dropdown if clicked outside
      if (shiftFilterDropdownRef.current && !shiftFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".shift-filter-toggle")) {
        setShowShiftFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredSearchSuggestions = React.useMemo(() => {
    if (!searchQuery) {
      return searchCategories;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return searchCategories.filter((category) => category.name.toLowerCase().includes(lowerCaseQuery));
  }, [searchQuery, searchCategories]);

  const handleSearchCategorySelect = (categoryName: string) => {
    setSearchQuery(`${categoryName}: `);
    setShowSearchSuggestions(false);
    searchInputRef.current?.focus();
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

  const handleDelete = async (id: string) => {
    try {
      await deleteMachineHistory(id);
      setRecords(records.filter((record) => record.id !== id));
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Failed to delete record:", error);
      setError("Failed to delete record. Please try again.");
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const formatTime = (hours: number | null | undefined, minutes: number | null | undefined): string => {
    if (hours === null || hours === undefined || minutes === null || minutes === undefined) return "-";
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };

  const calculateDowntime = (record: MachineHistoryRecord): string => {
    const downtimeMinutes = convertDurationInMinutes(record.stopJam, record.stopMenit, record.startJam, record.startMenit);
    return convertMinutesToHoursAndMinutes(downtimeMinutes);
  };

  const getStopTimeColorClass = (stopTime: string | null | undefined): string => {
    const normalizedStopTime = (stopTime || "").toLowerCase().trim();
    switch (normalizedStopTime) {
      case "pm":
        return "bg-blue-100 text-blue-800 border border-blue-200";
      case "harmonisasi":
        return "bg-green-100 text-green-800 border border-green-200";
      case "cip":
        return "bg-purple-100 text-purple-800 border border-purple-200";
      case "unplanned":
        return "bg-red-100 text-red-800 border border-red-200";
      case "standby":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  const handleMachineCheckboxChange = (machineName: string, isChecked: boolean) => {
    if (isChecked) {
      setMachineFilter((prev) => [...prev, machineName]);
    } else {
      setMachineFilter((prev) => prev.filter((name) => name !== machineName));
    }
  };

  // New handler for Status/Type multi-select
  const handleStatusCheckboxChange = (statusValue: string, isChecked: boolean) => {
    if (isChecked) {
      setStatusFilter((prev) => [...prev, statusValue]);
    } else {
      setStatusFilter((prev) => prev.filter((value) => value !== statusValue));
    }
  };

  // New handler for Shift multi-select
  const handleShiftCheckboxChange = (shiftValue: string, isChecked: boolean) => {
    if (isChecked) {
      setShiftFilter((prev) => [...prev, shiftValue]);
    } else {
      setShiftFilter((prev) => prev.filter((value) => value !== shiftValue));
    }
  };

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented.");
  };

  const openHistoryDetails = (record: MachineHistoryRecord) => {
    setSelectedRecord(record);
    setShowHistoryDetails(true);
  };

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
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
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Machine History</h2>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                            {notif.icon && <div className="flex-shrink-0 mr-3">{notif.icon}</div>}
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                      )}
                    </div>
                    <div className="p-4 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotificationsPopup(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark all as read
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Machine History <span className="text-blue-600">Records</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Effortlessly track, analyze, and manage machine downtime and maintenance activities to optimize factory operations.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {hasPermission("create_machine_history") && (
                <motion.button
                  onClick={() => navigate("/machinehistory/addmachinehistory")}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
                >
                  <Plus className="text-base" />
                  <span>Add Record</span>
                </motion.button>
              )}
              <motion.button
                onClick={handleImport}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Upload className="text-base" />
                <span>Import</span>
              </motion.button>
              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Filter className="text-base" />
                <span>Filters</span>
                <motion.span animate={{ rotate: showAdvancedFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="text-base" />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Records" value={filteredRecords.length.toLocaleString("id-ID")} change="+8%" icon={<Clipboard />} />
            <StatCard
              title="Avg Downtime"
              value={
                filteredRecords.length > 0
                  ? convertMinutesToHoursAndMinutes(
                      Math.round(
                        filteredRecords.reduce((sum, r) => {
                          const downtime = convertDurationInMinutes(r.stopJam, r.stopMenit, r.startJam, r.startMenit) || 0;
                          return sum + downtime;
                        }, 0) / filteredRecords.length
                      )
                    )
                  : "0min"
              }
              change="-5%"
              icon={<Clock />}
            />
            <StatCard title="Repairs" value={filteredRecords.filter((r) => r.perbaikanPerawatan === "Perbaikan").length.toLocaleString("id-ID")} change="+3" icon={<Wrench />} />
            <StatCard title="Maintenance" value={filteredRecords.filter((r) => r.perbaikanPerawatan === "Perawatan").length.toLocaleString("id-ID")} change="+2" icon={<CheckCircle />} />
          </div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by machine, ID, or issue..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchSuggestions(true)}
                  aria-label="Search records"
                />
                <AnimatePresence>
                  {showSearchSuggestions && filteredSearchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="search-suggestions absolute left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto custom-scrollbar"
                    >
                      {filteredSearchSuggestions.map((category) => (
                        <motion.button
                          key={category.id}
                          onClick={() => handleSearchCategorySelect(category.name)}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                          className="w-full text-left p-3 text-gray-700 hover:text-blue-700 transition-colors duration-150 text-sm"
                          role="option"
                        >
                          <span className="font-semibold">{category.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
                >
                  <div className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                    <Calendar className="text-gray-500 text-base" />
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      aria-label="Start Date"
                    />
                    <span className="text-gray-400">-</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined}
                      placeholderText="End Date"
                      className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      aria-label="End Date"
                    />
                    {(startDate || endDate) && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                        title="Clear Dates"
                        aria-label="Clear date range"
                      >
                        <X className="text-base" />
                      </motion.button>
                    )}
                  </div>

                  {/* Status/Type Multi-select Dropdown */}
                  <div ref={statusFilterDropdownRef} className="relative w-full">
                    <button
                      type="button"
                      className="status-filter-toggle w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left flex justify-between items-center transition-all duration-200 shadow-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowStatusFilterDropdown(!showStatusFilterDropdown);
                      }}
                      aria-expanded={showStatusFilterDropdown}
                      aria-haspopup="true"
                      aria-label="Filter by Type"
                    >
                      <span>{statusFilter.length > 0 ? (statusFilter.length === statusOptions.length ? "All Types" : `Selected (${statusFilter.length})`) : "All Types"}</span>
                      <ChevronDown className={`transform transition-transform ${showStatusFilterDropdown ? "rotate-180" : "rotate-0"} text-gray-500 text-base`} />
                    </button>
                    <AnimatePresence>
                      {showStatusFilterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: 5, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto custom-scrollbar"
                          role="listbox"
                        >
                          <label className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer border-b border-blue-50" role="option">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                              checked={statusFilter.length === statusOptions.length && statusOptions.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStatusFilter(statusOptions.map((opt) => opt.value));
                                } else {
                                  setStatusFilter([]);
                                }
                              }}
                            />
                            <span className="ml-2 text-gray-800 font-semibold text-sm">Select All</span>
                          </label>
                          {statusOptions.map((option) => (
                            <label key={option.value} className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer" role="option">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                checked={statusFilter.includes(option.value)}
                                onChange={(e) => handleStatusCheckboxChange(option.value, e.target.checked)}
                              />
                              <span className="ml-2 text-gray-800 text-sm">{option.label}</span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Machine Multi-select Dropdown (already exists) */}
                  <div ref={machineFilterDropdownRef} className="relative w-full">
                    <button
                      type="button"
                      className="machine-filter-toggle w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left flex justify-between items-center transition-all duration-200 shadow-sm cursor-pointer"
                      onClick={() => setShowMachineFilterDropdown(!showMachineFilterDropdown)}
                      aria-expanded={showMachineFilterDropdown}
                      aria-haspopup="true"
                      aria-label="Filter by Machine"
                    >
                      <span>{machineFilter.length > 0 ? (machineFilter.length === machines.length && machines.length > 0 ? "All Machines" : `Selected (${machineFilter.length})`) : "All Machines"}</span>
                      <ChevronDown className={`transform transition-transform ${showMachineFilterDropdown ? "rotate-180" : "rotate-0"} text-gray-500 text-base`} />
                    </button>
                    <AnimatePresence>
                      {showMachineFilterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: 5, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg z-20 max-h-56 overflow-y-auto custom-scrollbar"
                          role="listbox"
                        >
                          <label className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer border-b border-blue-50" role="option">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                              checked={machineFilter.length === machines.length && machines.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setMachineFilter(machines.map((m) => m.name));
                                } else {
                                  setMachineFilter([]);
                                }
                              }}
                            />
                            <span className="ml-2 text-gray-800 font-semibold text-sm">Select All</span>
                          </label>
                          {machines.map((machine) => (
                            <label key={machine.id} className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer" role="option">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                checked={machineFilter.includes(machine.name)}
                                onChange={(e) => handleMachineCheckboxChange(machine.name, e.target.checked)}
                              />
                              <span className="ml-2 text-gray-800 text-sm">{machine.name}</span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Shift Multi-select Dropdown */}
                  <div ref={shiftFilterDropdownRef} className="relative w-full">
                    <button
                      type="button"
                      className="shift-filter-toggle w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left flex justify-between items-center transition-all duration-200 shadow-sm cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowShiftFilterDropdown(!showShiftFilterDropdown);
                      }}
                      aria-expanded={showShiftFilterDropdown}
                      aria-haspopup="true"
                      aria-label="Filter by Shift"
                    >
                      <span>{shiftFilter.length > 0 ? (shiftFilter.length === shiftOptions.length ? "All Shifts" : `Selected (${shiftFilter.length})`) : "All Shifts"}</span>
                      <ChevronDown className={`transform transition-transform ${showShiftFilterDropdown ? "rotate-180" : "rotate-0"} text-gray-500 text-base`} />
                    </button>
                    <AnimatePresence>
                      {showShiftFilterDropdown && (
                        <motion.div
                          initial={{ opacity: 0, y: 5, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: "auto" }}
                          exit={{ opacity: 0, y: 5, height: 0 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg z-50 max-h-56 overflow-y-auto custom-scrollbar"
                          role="listbox"
                        >
                          <label className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer border-b border-blue-50" role="option">
                            <input
                              type="checkbox"
                              className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                              checked={shiftFilter.length === shiftOptions.length && shiftOptions.length > 0}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setShiftFilter(shiftOptions.map((opt) => opt.value));
                                } else {
                                  setShiftFilter([]);
                                }
                              }}
                            />
                            <span className="ml-2 text-gray-800 font-semibold text-sm">Select All</span>
                          </label>
                          {shiftOptions.map((option) => (
                            <label key={option.value} className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer" role="option">
                              <input
                                type="checkbox"
                                className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                checked={shiftFilter.includes(option.value)}
                                onChange={(e) => handleShiftCheckboxChange(option.value, e.target.checked)}
                              />
                              <span className="ml-2 text-gray-800 text-sm">{option.label}</span>
                            </label>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading machine history data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">
                {debouncedSearchQuery || statusFilter.length > 0 || machineFilter.length > 0 || startDate || endDate || shiftFilter.length > 0 ? "No records found matching your filters." : "No records available."}
              </p>
              {(debouncedSearchQuery || statusFilter.length > 0 || machineFilter.length > 0 || startDate || endDate || shiftFilter.length > 0) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter([]); // Reset to empty array
                    setMachineFilter([]);
                    setStartDate(null);
                    setEndDate(null);
                    setShiftFilter([]); // Reset to empty array
                  }}
                  className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("date")}>
                        Date
                        {sortConfig?.key === "date" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Machine</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shift/Group</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Downtime</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.map((record) => (
                      <motion.tr
                        key={record.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.date}</div>
                          <div className="text-xs text-gray-600">
                            {formatTime(record.stopJam, record.stopMenit)} - {formatTime(record.startJam, record.startMenit)}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{record.mesin}</div>
                          <div className="text-xs text-gray-600">{record.unit}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            Shift {record.shift}, Group {record.group}
                          </div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{calculateDowntime(record)}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900">{record.itemTrouble}</div>
                          <div className="text-xs text-gray-600 truncate max-w-xs">{record.jenisGangguan}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.03 }} className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${getStopTimeColorClass(record.stopTime)}`}>
                            {record.stopTime}
                          </motion.span>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/machinehistory/edit/${record.id}`)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                            title="Edit"
                            aria-label={`Edit record for machine ${record.mesin} on ${record.date}`}
                          >
                            <Edit className="inline text-base" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setRecordToDelete(record.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                            aria-label={`Delete record for machine ${record.mesin} on ${record.date}`}
                          >
                            <Trash2 className="inline text-base" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openHistoryDetails(record)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                            title="View Details"
                            aria-label={`View details for record for machine ${record.mesin} on ${record.date}`}
                          >
                            <Eye className="inline text-base" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {filteredRecords.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredRecords.length)}</span> of{" "}
                <span className="font-semibold">{filteredRecords.length}</span> results
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

      {selectedRecord && (
        <Modal
          isOpen={showHistoryDetails}
          onClose={() => {
            setShowHistoryDetails(false);
            setSelectedRecord(null);
          }}
          title="Machine History Details"
          className="max-w-3xl"
        >
          <HistoryDetails record={selectedRecord} onClose={() => setShowHistoryDetails(false)} />
        </Modal>
      )}

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
              onClick={() => recordToDelete && handleDelete(recordToDelete)}
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

export default MachineHistoryDashboard;
