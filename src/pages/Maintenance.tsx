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
  FiCalendar,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, MachineHistoryRecord, MachineHistoryFormData } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import EditHistoryForm from "../component/MachineHistory/EditFormMesin";

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

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex justify-center items-center z-50 p-4">
      <div className={`bg-white rounded-lg shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto transform transition-all sm:w-full ${className || "max-w-lg"}`}>
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
        </div>
        <div className="p-6">{children}</div>
        <div className="px-6 py-4 border-t flex justify-end">
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 focus:outline-none" aria-label="Tutup modal"></button>
        </div>
      </div>
    </div>
  );
};

interface HistoryDetailsProps {
  record: MachineHistoryRecord;
  onClose: () => void;
}

const HistoryDetails: React.FC<HistoryDetailsProps> = ({ record, onClose }) => {
  const formatTime = (hours: number | null | undefined, minutes: number | null | undefined): string => {
    if (hours === null || hours === undefined || minutes === null || minutes === undefined) return "-";
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };

  const convertMinutesToHoursAndMinutes = (totalMinutes: number | null | undefined): string => {
    if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
      return "-";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) {
      return "0min";
    }

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours}h`); 
    }
    if (minutes > 0) {
      parts.push(`${minutes}min`); 
    }

    return parts.join(" ");
  };

  const calculateDowntime = (record: MachineHistoryRecord): string => {
    const stopHH = record.stopJam;
    const stopMM = record.stopMenit;
    const startHH = record.startJam;
    const startMM = record.startMenit;

    if (stopHH === null || stopHH === undefined || stopMM === null || stopMM === undefined || startHH === null || startHH === undefined || startMM === null || startMM === undefined) {
      return "-";
    }

    const stopTimeInMinutes = stopHH * 60 + stopMM;
    let startTimeInMinutes = startHH * 60 + startMM;

    let downtimeMinutes = startTimeInMinutes - stopTimeInMinutes;
    if (downtimeMinutes < 0) {
      downtimeMinutes = 24 * 60 - stopTimeInMinutes + startTimeInMinutes;
    }

    return convertMinutesToHoursAndMinutes(downtimeMinutes);
  };

  const displayValue = (value: any): string => {
    if (value === null || value === undefined) return "-";

    if (typeof value === "string") {
      return value.trim() !== "" ? value.trim() : "-";
    }

    return value.toString();
  };

  return (
    <div className="space-y-6">
      {/* Section: General Details */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-6 gap-x-4">
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Date</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.date)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Shift</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.shift)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Group</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.group)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Machine</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.mesin)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Unit</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.unit)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Stop Time</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{formatTime(record.stopJam, record.stopMenit)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Start Time</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{formatTime(record.startJam, record.startMenit)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Downtime</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{calculateDowntime(record)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Stop Type</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.stopTime)}</p>
        </div>
        <div>
          <h4 className="text-sm font-medium text-gray-600 mb-1">Running Hour</h4>
          <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.runningHour)}</p>
        </div>
      </div>

      {/* --- */}

      {/* Section: Issue Details */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Issue Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Item Trouble</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.itemTrouble)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Issue Description</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.jenisGangguan)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Action Taken</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.bentukTindakan)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Root Cause</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.rootCause)}</p>
          </div>
        </div>
      </div>

      {/* --- */}

      {/* Section: Maintenance Details */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Maintenance Details</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-6 gap-x-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Activity Type</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.jenisAktivitas)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Specific Activity</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.kegiatan)}</p>
          </div>
        </div>
      </div>

      {/* --- */}

      {/* Section: Spare Parts Used */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <h3 className="text-xl font-bold text-gray-800 mb-4">Spare Parts Used</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-y-6 gap-x-4">
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Part Code</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.kodePart)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Part Name</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.sparePart)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">ID Part</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.idPart)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Quantity</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.jumlah)}</p>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-600 mb-1">Unit</h4>
            <p className="bg-gray-50 border border-gray-300 text-gray-800 text-lg rounded-md p-2 min-h-[40px] flex items-center break-words shadow-sm">{displayValue(record.unitSparePart)}</p>
          </div>
        </div>
      </div>

      {/* --- */}

      {/* Footer: Close Button */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200"
        >
          Close Details
        </motion.button>
      </div>
    </div>
  );
};

const MachineHistoryDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [machineFilter, setMachineFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showHistoryDetails, setShowHistoryDetails] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MachineHistoryRecord | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const { user, fetchWithAuth, getMachineHistories, updateMachineHistory, deleteMachineHistory, isAuthenticated, isMasterDataLoading, masterData } = useAuth();
  const [records, setRecords] = useState<MachineHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [machines, setMachines] = useState<{ id: string; name: string }[]>([]);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<MachineHistoryRecord | null>(null);

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

  const handleEditSubmit = async (updatedData: Partial<MachineHistoryFormData>) => {
    if (!editingRecord || !masterData) return;

    try {
      setLoading(true);
      setError(null);
      const dataToSendToApi: Partial<MachineHistoryFormData> = {
        ...updatedData,
        shift: masterData.shifts.find((s) => s.name === updatedData.shift)?.id || updatedData.shift,
        group: masterData.groups.find((g) => g.name === updatedData.group)?.id || updatedData.group,
        stopTime: masterData.stoptimes.find((st) => st.name === updatedData.stopTime)?.id || updatedData.stopTime,
        unit: masterData.units.find((u) => u.name === updatedData.unit)?.id || updatedData.unit,
        mesin: masterData.mesin.find((m) => m.name === updatedData.mesin)?.id || updatedData.mesin,
        itemTrouble: masterData.itemtroubles.find((it) => it.name === updatedData.itemTrouble)?.id || updatedData.itemTrouble,
        jenisAktivitas: masterData.jenisaktivitas.find((ja) => ja.name === updatedData.jenisAktivitas)?.id || updatedData.jenisAktivitas,
        kegiatan: masterData.kegiatans.find((k) => k.name === updatedData.kegiatan)?.id || updatedData.kegiatan,
        unitSparePart: masterData.unitspareparts.find((usp) => usp.name === updatedData.unitSparePart)?.id || updatedData.unitSparePart,
        // Pastikan bidang angka dikirim sebagai angka, tidak string
        stopJam: updatedData.stopJam !== undefined ? Number(updatedData.stopJam) : undefined,
        stopMenit: updatedData.stopMenit !== undefined ? Number(updatedData.stopMenit) : undefined,
        startJam: updatedData.startJam !== undefined ? Number(updatedData.startJam) : undefined,
        startMenit: updatedData.startMenit !== undefined ? Number(updatedData.startMenit) : undefined,
        runningHour: updatedData.runningHour !== undefined ? Number(updatedData.runningHour) : undefined,
        jumlah: updatedData.jumlah !== undefined ? Number(updatedData.jumlah) : undefined,
      };

      Object.keys(dataToSendToApi).forEach((key) => {
        if ((dataToSendToApi as any)[key] === undefined) {
          delete (dataToSendToApi as any)[key];
        }
      });

      await updateMachineHistory(editingRecord.id, dataToSendToApi);

      const updatedRecordsList = await getMachineHistories();
      setRecords(updatedRecordsList);

      setShowEditModal(false);
      setEditingRecord(null);
    } catch (error) {
      console.error("Gagal memperbarui catatan:", error);
      setError("Gagal memperbarui catatan. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

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
    const fetchData = async () => {
      if (isAuthenticated && !isMasterDataLoading) {
        setLoading(true);
        setError(null);
        try {
          const fetchedRecords = await getMachineHistories();

          if (!Array.isArray(fetchedRecords)) {
            throw new Error("Invalid data format: expected array from getMachineHistories");
          }

          setRecords(fetchedRecords);

          const uniqueMachines = Array.from(new Set(fetchedRecords.map((r) => r.mesin)))
            .filter(Boolean)
            .map((name) => ({ id: name, name }));

          setMachines(uniqueMachines);
          setError(null);
        } catch (err) {
          console.error("Failed to fetch machine histories:", err);
          let errorMessage = "Gagal memuat data riwayat mesin. Silakan coba lagi.";

          if (err instanceof Error) {
            if (err.message.includes("Sesi berakhir")) {
              errorMessage = "Sesi berakhir. Silakan login kembali.";
            } else if (err.message.includes("Invalid data format")) {
              errorMessage = "Server mengembalikan format data tidak valid. Silakan hubungi dukungan.";
            }
          }
          setError(errorMessage);
          setRecords([]);
          setMachines([]);
        } finally {
          setLoading(false);
        }
      } else if (!isAuthenticated) {
        setLoading(false);
        setRecords([]);
        setMachines([]);
        setError("Anda harus login untuk melihat riwayat mesin.");
      }
    };

    fetchData();
  }, [getMachineHistories, isAuthenticated, isMasterDataLoading]);

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
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredRecords = records.filter((record) => {
    const machineName = getDisplayValue(record.mesin);
    const itemTrouble = getDisplayValue(record.itemTrouble);
    const recordId = record.id.toString();

    const matchesSearch = machineName.toLowerCase().includes(searchQuery.toLowerCase()) || recordId.toLowerCase().includes(searchQuery.toLowerCase()) || itemTrouble.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || record.perbaikanPerawatan === statusFilter;
    const matchesMachine = machineFilter === "all" || machineName === machineFilter;

    return matchesSearch && matchesStatus && matchesMachine;
  });

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const getId = (val: string | { id: string }) => (typeof val === "object" ? val.id : val);

  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, machineFilter, sidebarOpen]);

  const getSafeNumber = (value: number | null | undefined, defaultValue = 0): number => {
    return value ?? defaultValue;
  };

  const formatTime = (hours: number | null | undefined, minutes: number | null | undefined): string => {
    if (hours === null || hours === undefined || minutes === null || minutes === undefined) return "-";
    const formattedHours = hours.toString().padStart(2, "0");
    const formattedMinutes = minutes.toString().padStart(2, "0");
    return `${formattedHours}:${formattedMinutes}`;
  };

  const convertMinutesToHoursAndMinutes = (totalMinutes: number | null | undefined): string => {
    if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes)) {
      return "-";
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0 && minutes === 0) {
      return "0min";
    }

    const parts: string[] = [];
    if (hours > 0) {
      parts.push(`${hours}h`);
    }
    if (minutes > 0) {
      parts.push(`${minutes}min`);
    }

    return parts.join(" ");
  };

  const calculateDowntime = (record: MachineHistoryRecord): number => {
    const stopTime = getSafeNumber(record.stopJam) * 60 + getSafeNumber(record.stopMenit);
    const startTime = getSafeNumber(record.startJam) * 60 + getSafeNumber(record.startMenit);
    let downtime = startTime - stopTime;

    if (downtime < 0) {
      downtime = 24 * 60 - stopTime + startTime;
    }
    return downtime;
  };

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
      {/* Sidebar */}
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
                <>
                  <div className="rounded-lg flex items-center space-x-3">
                    <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                    <p className="text-blue-600 font-bold">CMMS</p>
                  </div>
                </>
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

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiClock className="text-2xl text-blue-600" />
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Machine History Records</h1>
              <p className="text-gray-600 mt-1">Track and analyze machine downtime and maintenance activities</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => navigate("/machinehistory/input")}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Add Record</span>
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Records" value={records.length.toString()} change="+8%" icon={<FiClipboard />} />
            <StatCard title="Avg Downtime" value={records.length > 0 ? convertMinutesToHoursAndMinutes(Math.round(records.reduce((sum, r) => sum + calculateDowntime(r), 0) / records.length)) : "0min"} change="-5%" icon={<FiClock />} />
            <StatCard title="Repairs" value={records.filter((r) => r.perbaikanPerawatan === "Perbaikan").length.toString()} change="+3" icon={<FiTool />} />
            <StatCard title="Maintenance" value={records.filter((r) => r.perbaikanPerawatan === "Perawatan").length.toString()} change="+2" icon={<FiCheckCircle />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by machine, ID, or issue..."
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
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Types</option>
                      <option value="Perbaikan">Repairs</option>
                      <option value="Perawatan">Maintenance</option>
                    </select>

                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={machineFilter}
                      onChange={(e) => setMachineFilter(e.target.value)}
                    >
                      <option value="all">All Machines</option>
                      {machines.map((machine) => (
                        <option key={machine.id} value={machine.name}>
                          {machine.name}
                        </option>
                      ))}
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Records Table */}
          {loading ? (
            <div className="bg-white rounded-xl shadow-sm p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">Loading machine history data...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-xl shadow-sm p-8 text-center">
              <FiAlertTriangle className="text-red-500 text-3xl mx-auto mb-4" />
              <p className="text-red-600">{error}</p>
              <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors">
                Retry
              </button>
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Machine</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Shift/Group</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Downtime</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Issue</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                      <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.length > 0 ? (
                      currentRecords.map((record) => (
                        <motion.tr
                          key={record.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.2 }}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                          className="transition-colors duration-150"
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{record.date}</div>
                            <div className="text-xs text-gray-600">
                              {formatTime(record.stopJam, record.stopMenit)} - {formatTime(record.startJam, record.startMenit)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{getDisplayValue(record.mesin)}</div>
                            <div className="text-xs text-gray-600">{getDisplayValue(record.unit)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              Shift {getDisplayValue(record.shift)}, Group {getDisplayValue(record.group)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{calculateDowntime(record)} min</div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">{getDisplayValue(record.itemTrouble)}</div>
                            <div className="text-xs text-gray-600 truncate max-w-xs">{getDisplayValue(record.jenisGangguan)}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${record.perbaikanPerawatan === "Perbaikan" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"} shadow-sm`}
                            >
                              {record.perbaikanPerawatan}
                            </motion.span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setEditingRecord(record);
                                setShowEditModal(true);
                              }}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200"
                              title="Edit"
                            >
                              <FiEdit className="inline mr-1" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setRecordToDelete(record.id);
                                setShowDeleteConfirm(true);
                              }}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200"
                              title="Delete"
                            >
                              <FiTrash2 className="inline mr-1" />
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => openHistoryDetails(record)} className="text-blue-600 hover:text-blue-800 transition-colors duration-200" title="View Details">
                              <FiEye className="inline mr-1" />
                            </motion.button>
                          </td>
                        </motion.tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="px-6 py-10 text-center text-gray-600 text-lg">
                          No records found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {filteredRecords.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredRecords.length)}</span> of{" "}
                <span className="font-semibold">{filteredRecords.length}</span> results
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

      {/* History Details Modal */}
      {selectedRecord && (
        <Modal
          isOpen={showHistoryDetails}
          onClose={() => {
            setShowHistoryDetails(false);
            setSelectedRecord(null);
          }}
          title="Machine History Details"
        >
          <HistoryDetails record={selectedRecord} onClose={() => setShowHistoryDetails(false)} />
        </Modal>
      )}

      {/* Edit Record Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Riwayat Mesin"
        className="max-w-4xl lg:max-w-6xl w-full" // <<< Tambahkan ini
      >
        {editingRecord && masterData ? <EditHistoryForm record={editingRecord} masterData={masterData} onSave={handleEditSubmit} onCancel={() => setShowEditModal(false)} /> : <p className="text-center py-4">Memuat data master...</p>}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-4">
          <p>Are you sure you want to delete this record? This action cannot be undone.</p>
          <div className="flex justify-end space-x-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="px-4 py-2 border rounded hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button onClick={() => recordToDelete && handleDelete(recordToDelete)} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
              Delete
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default MachineHistoryDashboard;
