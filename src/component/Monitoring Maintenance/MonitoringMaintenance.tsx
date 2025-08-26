import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Wrench,
  CheckCircle,
  Calendar,
  Eye,
  Settings,
  Bell,
  ChevronDown,
  ChevronRight,
  Moon,
  Sun,
  UserIcon,
  AlertTriangle,
  Info,
  LogOut,
  Clipboard,
  X,
  Plus,
  Monitor,
  TrendingUp,
  Filter,
  RotateCcw,
  Search,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  ChevronLeft,
} from "lucide-react";
import Sidebar from "../Sidebar";

const getApprovalStatusColor = (status: string) => {
  switch (status) {
    case "Draft":
      return "bg-gray-200 text-gray-800";
    case "Pending Employee":
      return "bg-gray-200 text-gray-800";
    case "Pending Unit Head Engineering":
    case "Pending Unit Head Production Process":
    case "Pending Section Head Engineering":
    case "Pending Section Head Production Process":
      return "bg-yellow-200 text-yellow-800";
    case "Approved":
      return "bg-green-200 text-green-800";
    case "Rejected":
      return "bg-red-200 text-red-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

// New helper function to get display status
const getDisplayStatus = (status: ApprovalStatusType | MaintenanceTaskRecord["status"]) => {
  switch (status) {
    case "Approved":
      return "Selesai";
    case "Pending Employee":
    case "Pending Unit Head Engineering":
    case "Pending Unit Head Production Process":
    case "Pending Section Head Engineering":
    case "Pending Section Head Production Process":
      return "Dalam Proses";
    case "Draft":
    case "Scheduled":
      return "Belum Diproses";
    case "Rejected":
      return "Ditolak";
    case "Missed":
      return "Terlewat";
    case "Emergency":
      return "Darurat";
    case "Completed":
      return "Selesai";
    case "Overdue":
      return "Terlewat"; // Overdue is similar to missed in display context
    case "Pending Review":
      return "Dalam Proses"; // Pending Review is similar to Pending Approval
    case "Reviewed":
      return "Dalam Proses"; // Reviewed might still be in a process of final approval
    default:
      return "N/A";
  }
};

const getWeekOfMonth = (date: Date) => {
  const startDay = date.getDate();
  const dayOfWeek = date.getDay();
  return Math.ceil((startDay + 6 - dayOfWeek) / 7);
};

// Helper function to get ISO week number for a given date
const getISOWeekNumber = (d: Date) => {
  d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  // Set to nearest Thursday: current date + 4 - current day number (0-6)
  // If Sunday is 0, need to convert to 7 if it's Sunday
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  // Get first day of year
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  // Calculate full weeks to nearest Thursday
  const weekNo = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
};

const displayValue = (value: any) => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return value;
};

const APPROVAL_ROLES = ["Employee", "Unit Head Engineering", "Unit Head Production Process", "Section Head Engineering", "Section Head Production Process"] as const;

type ApprovalRole = (typeof APPROVAL_ROLES)[number];

type ApprovalStatusType = "Draft" | `Pending ${ApprovalRole}` | "Approved" | "Rejected";

export interface MaintenanceTaskRecord {
  id: string;
  mesin: string;
  date: string;
  interval: "Weekly" | "Monthly" | "3 Months" | "6 Months" | "1 Year" | "Emergency" | "Harian" | "Per 50 Jam Kerja" | "Daily";
  unitWilayah: string;
  item: string;
  unitOfMeasure: string;
  standardMin: number | null;
  standardMax: number | null;
  standartVisual: string;
  monitoringResult: string;
  msStatus: "OK" | "NG" | "N/A";
  notes: string; // This property is required
  approvalStatus: ApprovalStatusType;
  currentApproverIndex: number;
  rejectionReason?: string;
  feedbackNotes?: string;
  perbaikanPerawatan: string;
  description: string;
  status: "Scheduled" | "Completed" | "Overdue" | "Emergency" | "Pending Review" | "Reviewed" | "Approved" | "Missed";
  pic: string;
  shift: string;
  group: string;
  stopJam: number;
  stopMenit: number;
  startJam: number;
  startMenit: number;
  stopTime: string;
  unit: string;
  runningHour: number;
  itemTrouble: string;
  jenisGangguan: string;
  bentukTindakan: string;
  rootCause: string;
  jenisAktivitas: string;
  kegiatan: string;
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: number;
  unitSparePart: string;
}

export interface RoutineSchedule {
  id: string;
  mesin: string;
  item: string;
  interval: "weekly" | "monthly" | "quarterly" | "semi-annual" | "yearly" | "daily";
  dayOfWeek?: number;
  dayOfMonth?: number;
  monthOfYear?: number;
  unitWilayah: string;
  unitOfMeasure: string;
  standardMin: number | null;
  standardMax: number | null;
  standartVisual: string;
}

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          {" "}
          {/* Changed opacity to bg-opacity-60 */}
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

interface DetailItemProps {
  label: string;
  value: string | number | null;
  className?: string;
  valueColorClass?: string;
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = "", valueColorClass = "text-gray-900" }) => (
  <div className={`p-4 bg-gray-50 rounded-lg shadow-sm ${className}`}>
    <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${valueColorClass}`}>{value ?? "N/A"}</p>
  </div>
);

interface SectionTitleProps {
  title: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200 mt-6 first:mt-0">{title}</h3>;

interface ApprovalFlowProps {
  record: MaintenanceTaskRecord;
  onUpdateApproval: (id: string, newStatus: ApprovalStatusType, newApproverIndex: number, feedback?: string) => void;
  currentUserRole: string;
}

const ApprovalFlow: React.FC<ApprovalFlowProps> = ({ record, onUpdateApproval, currentUserRole }) => {
  const [feedback, setFeedback] = useState("");
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  const currentApprovalStatus = record.approvalStatus;
  const currentApproverRole = APPROVAL_ROLES[record.currentApproverIndex];

  const canApprove = currentApprovalStatus.startsWith("Pending") && currentUserRole === currentApproverRole && currentApprovalStatus !== "Approved" && currentApprovalStatus !== "Rejected";

  const handleApprove = () => {
    let newStatus: ApprovalStatusType;
    let newIndex = record.currentApproverIndex + 1;

    if (newIndex >= APPROVAL_ROLES.length) {
      newStatus = "Approved";
      // Corrected typo here from APPROVAL_ROOLO_ROLES.length to APPROVAL_ROLES.length
      newIndex = APPROVAL_ROLES.length;
    } else {
      newStatus = `Pending ${APPROVAL_ROLES[newIndex]}` as ApprovalStatusType;
    }
    onUpdateApproval(record.id, newStatus, newIndex);
    setShowFeedbackInput(false);
    setFeedback("");
  };

  const handleReject = () => {
    onUpdateApproval(record.id, "Rejected", record.currentApproverIndex, feedback);
    setShowFeedbackInput(false);
    setFeedback("");
  };

  const handleFeedback = () => {
    setShowFeedbackInput(true);
  };

  const submitFeedback = () => {
    onUpdateApproval(record.id, record.approvalStatus, record.currentApproverIndex, feedback);
    setShowFeedbackInput(false);
    setFeedback("");
  };

  return (
    <div className="space-y-4 p-4 border border-blue-100 bg-blue-50 rounded-lg">
      <h3 className="text-lg font-semibold text-gray-800">Alur Persetujuan</h3>
      <div className="flex items-center space-x-2 text-sm">
        <span className="font-medium text-gray-700">Status Saat Ini:</span>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getApprovalStatusColor(currentApprovalStatus)}`}>{getDisplayStatus(currentApprovalStatus)}</span> {/* Updated status display */}
      </div>

      <div className="flex flex-col space-y-2">
        {APPROVAL_ROLES.map((role, index) => (
          <div key={role} className="flex items-center text-sm">
            <motion.div
              className={`w-6 h-6 rounded-full flex items-center justify-center mr-3 transition-colors duration-200
                ${
                  index < record.currentApproverIndex || record.approvalStatus === "Approved"
                    ? "bg-green-500 text-white"
                    : record.approvalStatus === "Rejected" && index === record.currentApproverIndex
                    ? "bg-red-500 text-white"
                    : index === record.currentApproverIndex && currentApprovalStatus.startsWith("Pending")
                    ? "bg-yellow-400 text-gray-800 animate-pulse"
                    : "bg-gray-200 text-gray-600"
                }`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            >
              {index < record.currentApproverIndex || record.approvalStatus === "Approved" ? <CheckCircle size={14} /> : record.approvalStatus === "Rejected" && index === record.currentApproverIndex ? <X size={14} /> : <Info size={14} />}
            </motion.div>
            <span className={`font-medium ${index === record.currentApproverIndex ? "text-blue-700" : "text-gray-700"}`}>{role}</span>
            {record.rejectionReason && index === record.currentApproverIndex && record.approvalStatus === "Rejected" && <span className="ml-2 text-red-600 text-xs italic">Alasan: {record.rejectionReason}</span>}
            {record.feedbackNotes && index === record.currentApproverIndex && record.approvalStatus.includes("Feedback") && <span className="ml-2 text-blue-600 text-xs italic">Umpan Balik: {record.feedbackNotes}</span>}
          </div>
        ))}
      </div>

      {canApprove && (
        <div className="flex space-x-3 mt-4">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleApprove} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center text-sm font-semibold">
            <ThumbsUp size={16} className="mr-2" /> Setujui
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 flex items-center text-sm font-semibold">
            <ThumbsDown size={16} className="mr-2" /> Tolak
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleFeedback} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center text-sm font-semibold">
            <MessageSquare size={16} className="mr-2" /> Umpan Balik
          </motion.button>
        </div>
      )}

      {showFeedbackInput && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-4">
          <label htmlFor="feedback-input" className="block text-sm font-medium text-gray-700 mb-2">
            Berikan Umpan Balik:
          </label>
          <textarea
            id="feedback-input"
            rows={3}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            placeholder="Masukkan umpan balik atau alasan penolakan di sini..."
          ></textarea>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={submitFeedback} className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-semibold">
            Kirim Umpan Balik
          </motion.button>
        </motion.div>
      )}
    </div>
  );
};

interface DetailViewProps {
  record: MaintenanceTaskRecord;
  onUpdateApproval: (id: string, newStatus: ApprovalStatusType, newApproverIndex: number, feedback?: string) => void;
  currentUserRole: string;
}

const DetailView: React.FC<DetailViewProps> = ({ record, onUpdateApproval, currentUserRole }) => {
  return (
    <div className="space-y-6">
      <SectionTitle title="Detail Pemantauan" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Interval Pemantauan" value={displayValue(record.interval)} />
        <DetailItem label="Unit" value={displayValue(record.unitWilayah)} />
        <DetailItem label="Mesin" value={displayValue(record.mesin)} />
        <DetailItem label="Item" value={displayValue(record.item)} />
        <DetailItem label="Satuan" value={displayValue(record.unitOfMeasure)} />
        <DetailItem label="Hasil Pemantauan" value={displayValue(record.monitoringResult)} valueColorClass={record.msStatus === "OK" ? "text-green-600" : record.msStatus === "NG" ? "text-red-600" : "text-gray-900"} />
        <DetailItem label="Status MS" value={displayValue(record.msStatus)} valueColorClass={record.msStatus === "OK" ? "text-green-600" : record.msStatus === "NG" ? "text-red-600" : "text-gray-900"} />
      </div>

      <SectionTitle title="Standar" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Standar (Min)" value={displayValue(record.standardMin)} />
        <DetailItem label="Standar (Max)" value={displayValue(record.standardMax)} />
        <DetailItem label="Standar (Visual)" value={displayValue(record.standartVisual)} className="md:col-span-2" />
      </div>

      <SectionTitle title="Keterangan" />
      <div className="grid grid-cols-1">
        <DetailItem label="Catatan" value={displayValue(record.notes)} />
      </div>

      <ApprovalFlow record={record} onUpdateApproval={onUpdateApproval} currentUserRole={currentUserRole} />
    </div>
  );
};

const TrendAnalysis: React.FC<{ records: MaintenanceTaskRecord[] }> = ({ records }) => {
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedItem, setSelectedItem] = useState("");

  const machines = useMemo(() => ["", ...new Set(records.map((r) => r.mesin))], [records]);
  const items = useMemo(() => {
    if (!selectedMachine) return [""];
    return ["", ...new Set(records.filter((r) => r.mesin === selectedMachine).map((r) => r.item))];
  }, [records, selectedMachine]);

  const trendData = useMemo(() => {
    if (!selectedMachine || !selectedItem) return [];
    return records
      .filter((r) => r.mesin === selectedMachine && r.item === selectedItem && !isNaN(parseFloat(r.monitoringResult)))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => ({
        date: new Date(r.date).toLocaleDateString("id-ID"),
        result: parseFloat(r.monitoringResult),
        msStatus: r.msStatus,
        notes: r.notes,
      }));
  }, [records, selectedMachine, selectedItem]);

  return (
    <div className="space-y-6 bg-white rounded-2xl shadow-md p-6 border border-gray-100">
      <h3 className="text-xl font-bold text-gray-800">Analisis Tren</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="machine-select" className="block text-sm font-medium text-gray-700">
            Pilih Mesin
          </label>
          <select
            id="machine-select"
            value={selectedMachine}
            onChange={(e) => {
              setSelectedMachine(e.target.value);
              setSelectedItem("");
            }}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
          >
            {machines.map((m) => (
              <option key={m} value={m}>
                {m || "Pilih Mesin"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="item-select" className="block text-sm font-medium text-gray-700">
            Pilih Item
          </label>
          <select
            id="item-select"
            value={selectedItem}
            onChange={(e) => setSelectedItem(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
            disabled={!selectedMachine}
          >
            {items.map((i) => (
              <option key={i} value={i}>
                {i || "Pilih Item"}
              </option>
            ))}
          </select>
        </div>
      </div>

      {trendData.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">
            Data Historis untuk {selectedItem} pada {selectedMachine}
          </h4>
          <div className="overflow-x-auto custom-scrollbar">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasil</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status MS</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catatan</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {trendData.map((data, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{data.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.result}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${data.msStatus === "OK" ? "bg-green-100 text-green-800" : data.msStatus === "NG" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"}`}>
                        {data.msStatus}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{data.notes || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
      {selectedMachine && selectedItem && trendData.length === 0 && <div className="bg-white rounded-xl shadow-md p-6 border border-gray-100 text-center text-gray-500">Tidak ada data numerik yang tersedia untuk item ini.</div>}
    </div>
  );
};

// Removed WeeklyView Component entirely

const normalizeIntervalType = (interval: AddIntervalType | RoutineSchedule["interval"]): string => {
  const lowerCaseInterval = interval.toLowerCase();
  if (lowerCaseInterval === "3 months") return "quarterly";
  if (lowerCaseInterval === "6 months") return "semi-annual";
  if (lowerCaseInterval === "1 year") return "yearly";
  if (lowerCaseInterval === "weekly") return "weekly";
  if (lowerCaseInterval === "monthly") return "monthly";
  if (lowerCaseInterval === "daily") return "daily";
  if (lowerCaseInterval === "quarterly") return "quarterly";
  if (lowerCaseInterval === "semi-annual") return "semi-annual";
  if (lowerCaseInterval === "yearly") return "yearly";
  return lowerCaseInterval; // Fallback for other potential interval types
};

const generateTasksFromSchedules = (schedules: RoutineSchedule[], startDate: Date, endDate: Date): MaintenanceTaskRecord[] => {
  const generatedTasks: MaintenanceTaskRecord[] = [];
  const oneDay = 24 * 60 * 60 * 1000;

  schedules.forEach((schedule) => {
    let currentProcessDate = new Date(startDate.getTime());

    while (currentProcessDate.getTime() <= endDate.getTime()) {
      let shouldAddTask = false;
      let taskDate: Date | null = null;

      if (schedule.interval === "weekly" && schedule.dayOfWeek !== undefined) {
        if (currentProcessDate.getDay() === schedule.dayOfWeek) {
          taskDate = new Date(currentProcessDate.getTime());
          shouldAddTask = true;
        }
      } else if (schedule.interval === "monthly" && schedule.dayOfMonth !== undefined) {
        if (currentProcessDate.getDate() === schedule.dayOfMonth) {
          taskDate = new Date(currentProcessDate.getTime());
          shouldAddTask = true;
        }
      } else if (schedule.interval === "quarterly" && schedule.monthOfYear !== undefined && schedule.dayOfMonth !== undefined) {
        if (currentProcessDate.getDate() === schedule.dayOfMonth && (currentProcessDate.getMonth() - schedule.monthOfYear) % 3 === 0) {
          taskDate = new Date(currentProcessDate.getTime());
          shouldAddTask = true;
        }
      } else if (schedule.interval === "semi-annual" && schedule.monthOfYear !== undefined && schedule.dayOfMonth !== undefined) {
        if (currentProcessDate.getDate() === schedule.dayOfMonth && (currentProcessDate.getMonth() - schedule.monthOfYear) % 6 === 0) {
          taskDate = new Date(currentProcessDate.getTime());
          shouldAddTask = true;
        }
      } else if (schedule.interval === "yearly" && schedule.monthOfYear !== undefined && schedule.dayOfMonth !== undefined) {
        if (currentProcessDate.getDate() === schedule.dayOfMonth && currentProcessDate.getMonth() === schedule.monthOfYear) {
          taskDate = new Date(currentProcessDate.getTime());
          shouldAddTask = true;
        }
      } else if (schedule.interval === "daily") {
        // Added daily interval
        taskDate = new Date(currentProcessDate.getTime());
        shouldAddTask = true;
      }

      if (shouldAddTask && taskDate) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const taskDayOnly = new Date(taskDate.getFullYear(), taskDate.getMonth(), taskDate.getDate());

        let status: "Scheduled" | "Completed" | "Overdue" | "Emergency" | "Missed" = "Scheduled";
        if (taskDayOnly.getTime() < today.getTime()) {
          status = "Missed";
        }

        generatedTasks.push({
          id: `routine-${schedule.id}-${taskDate.getTime()}`,
          mesin: schedule.mesin,
          date: taskDate.toISOString().split("T")[0],
          perbaikanPerawatan: "Preventif",
          description: `Pemeriksaan rutin terjadwal untuk ${schedule.mesin} - ${schedule.item}`,
          status: status,
          pic: "N/A",
          shift: "N/A",
          group: "N/A",
          stopJam: 0,
          stopMenit: 0,
          startJam: 0,
          startMenit: 0,
          stopTime: "N/A",
          unit: schedule.unitWilayah,
          runningHour: 0,
          itemTrouble: "N/A",
          jenisGangguan: "N/A",
          bentukTindakan: "N/A",
          rootCause: "N/A",
          jenisAktivitas: "Pemeliharaan",
          kegiatan: "Pemeriksaan rutin",
          kodePart: "N/A",
          sparePart: "N/A",
          idPart: "N/A",
          jumlah: 0,
          unitSparePart: "N/A",
          interval:
            schedule.interval === "weekly"
              ? "Weekly"
              : schedule.interval === "monthly"
              ? "Monthly"
              : schedule.interval === "quarterly"
              ? "3 Months"
              : schedule.interval === "semi-annual"
              ? "6 Months"
              : schedule.interval === "yearly"
              ? "1 Year"
              : "Daily", // Corrected interval type mapping
          unitWilayah: schedule.unitWilayah,
          item: schedule.item,
          unitOfMeasure: schedule.unitOfMeasure,
          standardMin: schedule.standardMin,
          standardMax: schedule.standardMax,
          standartVisual: schedule.standartVisual,
          monitoringResult: "N/A",
          msStatus: "N/A",
          approvalStatus: "Pending Employee",
          currentApproverIndex: 0,
          notes: "N/A", // Added missing notes property
        });
      }

      currentProcessDate.setTime(currentProcessDate.getTime() + oneDay);
    }
  });
  return generatedTasks;
};

interface MonitoringItem {
  id: string;
  name: string;
  unitOfMeasure: string;
  standardMin: number | null;
  standardMax: number | null;
  standartVisual: string;
}

interface Machine {
  id: string;
  name: string;
  items: MonitoringItem[];
}

interface Unit {
  id: string;
  name: string;
  machines: Machine[];
}

// New interfaces for the AddFormData structure
type AddIntervalType = "Weekly" | "Monthly" | "3 Months" | "6 Months" | "1 Year" | "Daily";

interface SelectedItemForMachine {
  id: string;
  name: string;
  unitOfMeasure: string;
  standardMin: number | null;
  standardMax: number | null;
  standartVisual: string;
}

interface SelectedMachineInForm {
  id: string;
  name: string;
  selectedInterval: AddIntervalType | null;
  selectedItems: SelectedItemForMachine[]; // This will now be auto-populated
}

interface SelectedUnitInForm {
  id: string;
  name: string;
  machines: SelectedMachineInForm[];
}

interface AddFormData {
  startDate: Date | null;
  endDate: Date | null;
  selectedUnits: SelectedUnitInForm[];
}

// Global static data for units and machines (expanded)
const STATIC_UNITS: Unit[] = [
  {
    id: "unit-WY01",
    name: "WY01",
    machines: [
      { id: "machine-A", name: "Mesin A", items: [] },
      { id: "machine-B", name: "Mesin B", items: [] },
      { id: "machine-C", name: "Mesin C", items: [] },
    ],
  },
  {
    id: "unit-WY02",
    name: "WY02",
    machines: [
      { id: "machine-D", name: "Mesin D", items: [] },
      { id: "machine-E", name: "Mesin E", items: [] },
    ],
  },
  {
    id: "unit-WY03",
    name: "WY03",
    machines: [{ id: "machine-F", name: "Mesin F", items: [] }],
  },
];

const MonitoringMaintenance: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  // State baru untuk modal edit/isi formulir
  const [showEditFormModal, setShowEditFormModal] = useState(false);
  const [selectedRecordForEdit, setSelectedRecordForEdit] = useState<MaintenanceTaskRecord | null>(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceTaskRecord | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "trend">("calendar"); // Default to 'calendar'
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string[]>([]); // Keep this state
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const navigate = useNavigate();

  const [addForm, setAddForm] = useState<AddFormData>({
    startDate: null,
    endDate: null,
    selectedUnits: [],
  });

  // State baru untuk modal daftar jadwal harian
  const [showDailyScheduleModal, setShowDailyScheduleModal] = useState(false);
  const [dailySchedulesForSelectedDate, setDailySchedulesForSelectedDate] = useState<MaintenanceTaskRecord[]>([]);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const dummyUser = {
    name: "John Doe",
    role: "Unit Head Engineering",
  };

  const staticRecords: MaintenanceTaskRecord[] = useMemo(() => {
    const today = new Date();
    const mockData: MaintenanceTaskRecord[] = [
      {
        id: "mock-1",
        mesin: "Mesin A",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2).toISOString().split("T")[0],
        perbaikanPerawatan: "Preventif",
        description: "Inspeksi terjadwal untuk Mesin A.",
        status: "Scheduled",
        pic: "Jane Doe",
        shift: "Shift A",
        group: "Grup 1",
        stopJam: 8,
        stopMenit: 0,
        startJam: 9,
        startMenit: 30,
        stopTime: "N/A",
        unit: "Unit 1",
        runningHour: 1500,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemeliharaan",
        kegiatan: "Pemeriksaan rutin",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "Weekly",
        unitWilayah: "WY01",
        item: "Tingkat Oli",
        unitOfMeasure: "L",
        standardMin: 5,
        standardMax: 7,
        standartVisual: "Tidak ada kebocoran yang terlihat",
        monitoringResult: "6.2",
        msStatus: "OK",
        approvalStatus: "Approved",
        currentApproverIndex: APPROVAL_ROLES.length,
        notes: "Tidak ada masalah terdeteksi.", // Ensure notes property is present
      },
      {
        id: "mock-2",
        mesin: "Mesin B",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 5).toISOString().split("T")[0],
        perbaikanPerawatan: "Preventif",
        description: "Pemeliharaan yang terlambat untuk Mesin B.",
        status: "Missed",
        pic: "John Smith",
        shift: "Shift B",
        group: "Grup 2",
        stopJam: 10,
        stopMenit: 0,
        startJam: 11,
        startMenit: 0,
        stopTime: "N/A",
        unit: "Unit 2",
        runningHour: 2000,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemeliharaan",
        kegiatan: "Perbaikan besar",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "Monthly",
        unitWilayah: "WY02",
        item: "Ketegangan Sabuk",
        unitOfMeasure: "mm",
        standardMin: 2,
        standardMax: 4,
        standartVisual: "Ketegangan baik",
        monitoringResult: "N/A",
        msStatus: "N/A",
        approvalStatus: "Pending Unit Head Engineering",
        currentApproverIndex: 1,
        notes: "Tugas belum dilakukan.", // Ensure notes property is present
      },
      {
        id: "mock-3",
        mesin: "Mesin C",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1).toISOString().split("T")[0],
        perbaikanPerawatan: "Preventif",
        description: "Perbaikan selesai pada Mesin C.",
        status: "Completed",
        pic: "Jane Doe",
        shift: "Shift C",
        group: "Grup 3",
        stopJam: 14,
        stopMenit: 30,
        startJam: 15,
        startMenit: 0,
        stopTime: "N/A",
        unit: "Unit 3",
        runningHour: 3000,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemeliharaan",
        kegiatan: "Tindakan korektif",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "3 Months",
        unitWilayah: "WY03",
        item: "Kebisingan Bantalan",
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "Tidak ada suara yang tidak biasa",
        monitoringResult: "OK",
        msStatus: "OK",
        approvalStatus: "Approved",
        currentApproverIndex: APPROVAL_ROLES.length,
        notes: "Bantalan diganti, fungsi normal.", // Ensure notes property is present
      },
      {
        id: "mock-4",
        mesin: "Mesin A",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split("T")[0],
        perbaikanPerawatan: "Preventif",
        description: "Perbaikan darurat pada Mesin A.",
        status: "Emergency",
        pic: "John Smith",
        shift: "Shift A",
        group: "Grup 1",
        stopJam: 14,
        stopMenit: 30,
        startJam: 15,
        startMenit: 0,
        stopTime: "N/A",
        unit: "Unit 1",
        runningHour: 3000,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemeliharaan",
        kegiatan: "Perbaikan darurat",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "Emergency",
        unitWilayah: "WY01",
        item: "Integritas Sekering",
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "Sekering utuh",
        monitoringResult: "OK",
        msStatus: "OK",
        approvalStatus: "Pending Section Head Production Process",
        currentApproverIndex: 4,
        notes: "Sekering diganti. Mesin kembali online.", // Ensure notes property is present
      },
      {
        id: "mock-5",
        mesin: "Mesin A",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 10).toISOString().split("T")[0],
        perbaikanPerawatan: "Pemantauan",
        description: "Pemantauan untuk Mesin A - Tingkat Oli",
        status: "Completed",
        pic: "Jane Doe",
        shift: "Shift A",
        group: "Grup 1",
        stopJam: 0,
        stopMenit: 0,
        startJam: 0,
        startMenit: 0,
        stopTime: "N/A",
        unit: "Unit 1",
        runningHour: 0,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemantauan",
        kegiatan: "Pembacaan",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "Daily",
        unitWilayah: "WY01",
        item: "Tingkat Oli",
        unitOfMeasure: "L",
        standardMin: 5,
        standardMax: 7,
        standartVisual: "Tidak ada kebocoran yang terlihat",
        monitoringResult: "5.5",
        msStatus: "OK",
        approvalStatus: "Approved",
        currentApproverIndex: APPROVAL_ROLES.length,
        notes: "Tingkat oli stabil.", // Ensure notes property is present
      },
      {
        id: "mock-6",
        mesin: "Mesin A",
        date: new Date(today.getFullYear(), today.getMonth(), today.getDate() - 20).toISOString().split("T")[0],
        perbaikanPerawatan: "Pemantauan",
        description: "Pemantauan untuk Mesin A - Tingkat Oli",
        status: "Completed",
        pic: "Jane Doe",
        shift: "Shift A",
        group: "Grup 1",
        stopJam: 0,
        stopMenit: 0,
        startJam: 0,
        startMenit: 0,
        stopTime: "N/A",
        unit: "Unit 1",
        runningHour: 0,
        itemTrouble: "N/A",
        jenisGangguan: "N/A",
        bentukTindakan: "N/A",
        rootCause: "N/A",
        jenisAktivitas: "Pemantauan",
        kegiatan: "Pembacaan",
        kodePart: "N/A",
        sparePart: "N/A",
        idPart: "N/A",
        jumlah: 0,
        unitSparePart: "N/A",
        interval: "Daily",
        unitWilayah: "WY01",
        item: "Tingkat Oli",
        unitOfMeasure: "L",
        standardMin: 5,
        standardMax: 7,
        standartVisual: "Tidak ada kebocoran yang terlihat",
        monitoringResult: "7.1",
        msStatus: "NG",
        approvalStatus: "Approved",
        currentApproverIndex: APPROVAL_ROLES.length,
        notes: "Tingkat oli sedikit tinggi, periksa pengisian berlebih.", // Ensure notes property is present
      },
    ];
    return mockData;
  }, []);

  const routineSchedules: RoutineSchedule[] = useMemo(
    () => [
      {
        id: "routine-1",
        mesin: "Mesin D",
        item: "Suhu Motor",
        interval: "weekly",
        dayOfWeek: 1,
        unitWilayah: "WY04",
        unitOfMeasure: "°C",
        standardMin: 35,
        standardMax: 50,
        standartVisual: "Tidak ada panas atau getaran berlebihan",
      },
      {
        id: "routine-2",
        mesin: "Mesin E",
        item: "Tekanan Oli",
        interval: "weekly",
        dayOfWeek: 5,
        unitWilayah: "WY05",
        unitOfMeasure: "Bar",
        standardMin: 2,
        standardMax: 3,
        standartVisual: "Pengukur tekanan stabil",
      },
      {
        id: "routine-3",
        mesin: "Mesin F",
        item: "Kebersihan Filter Udara",
        interval: "monthly",
        dayOfMonth: 15,
        unitWilayah: "WY06",
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "Tidak ada penumpukan debu yang terlihat",
      },
      {
        id: "routine-4",
        mesin: "Mesin G",
        item: "Tingkat Cairan Hidraulik",
        interval: "quarterly",
        dayOfMonth: 10,
        monthOfYear: 0,
        unitWilayah: "WY07",
        unitOfMeasure: "L",
        standardMin: 10,
        standardMax: 12,
        standartVisual: "Tingkat cairan dalam kaca penglihatan",
      },
      {
        id: "routine-5",
        mesin: "Mesin H",
        item: "Getaran Kompresor",
        interval: "semi-annual",
        dayOfMonth: 20,
        monthOfYear: 1,
        unitWilayah: "WY08",
        unitOfMeasure: "%",
        standardMin: 0,
        standardMax: 5,
        standartVisual: "Pengoperasian lancar, tidak ada getaran abnormal",
      },
      {
        id: "routine-6",
        mesin: "Mesin I",
        item: "Pelumasan Bantalan",
        interval: "yearly",
        dayOfMonth: 1,
        monthOfYear: 6,
        unitWilayah: "WY09",
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "Titik gemuk terlumasi penuh",
      },
      {
        id: "routine-7",
        mesin: "Mesin A",
        item: "Tingkat Oli",
        interval: "daily",
        unitWilayah: "WY01",
        unitOfMeasure: "L",
        standardMin: 5,
        standardMax: 7,
        standartVisual: "Tidak ada kebocoran yang terlihat",
      },
      {
        id: "routine-8",
        mesin: "Mesin A",
        item: "Tekanan Hidraulik",
        interval: "weekly",
        dayOfWeek: 2, // Tuesday
        unitWilayah: "WY01",
        unitOfMeasure: "psi",
        standardMin: 1500,
        standardMax: 2000,
        standartVisual: "Pembacaan pengukur stabil",
      },
      {
        id: "routine-9",
        mesin: "Mesin A",
        item: "Kebersihan Filter Udara",
        interval: "monthly",
        dayOfMonth: 1,
        unitWilayah: "WY01",
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "Tidak ada debu",
      },
    ],
    []
  );

  const generatedRecords = useMemo(() => {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setMonth(today.getMonth() + 7);
    return generateTasksFromSchedules(routineSchedules, today, futureDate);
  }, [routineSchedules]);

  const [records, setRecords] = useState<MaintenanceTaskRecord[]>(() => [...staticRecords, ...generatedRecords]);

  const uniqueUnits = useMemo(() => ["", ...new Set(records.map((r) => r.unitWilayah))], [records]);
  const uniqueMachines = useMemo(() => ["", ...new Set(records.map((r) => r.mesin))], [records]);
  const uniqueItems = useMemo(() => ["", ...new Set(records.map((r) => r.item))], [records]);
  const uniqueIntervals = useMemo(() => ["", ...new Set(records.map((r) => r.interval))], [records]);
  const uniqueMsStatus = useMemo(() => ["", ...new Set(records.map((r) => r.msStatus))], [records]);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (filterStartDate && filterEndDate) {
      const start = filterStartDate.toISOString().split("T")[0];
      const end = filterEndDate.toISOString().split("T")[0];
      filtered = filtered.filter((record) => record.date >= start && record.date <= end);
    }

    if (selectedUnit.length > 0) {
      filtered = filtered.filter((record) => selectedUnit.includes(record.unitWilayah));
    }
    // New filter for machines
    if (selectedMachine.length > 0) {
      filtered = filtered.filter((record) => selectedMachine.includes(record.mesin));
    }
    if (selectedItem.length > 0) {
      filtered = filtered.filter((record) => selectedItem.includes(record.item));
    }

    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          record.mesin.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.item.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.unitWilayah.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.notes.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.interval.toLowerCase().includes(lowerCaseSearchTerm) ||
          record.msStatus.toLowerCase().includes(lowerCaseSearchTerm)
      );
    }

    return filtered;
  }, [records, filterStartDate, filterEndDate, selectedUnit, selectedMachine, selectedItem, searchTerm]); // Added selectedMachine to dependency array

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

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleViewRecord = (record: MaintenanceTaskRecord) => {
    // Memeriksa apakah ID catatan dimulai dengan "mock-" untuk mengidentifikasi catatan statis.
    // Catatan yang berasal dari jadwal rutin ("routine-") atau yang baru ditambahkan melalui modal ("mon-")
    // dianggap sebagai "data yang ada di tambah data" atau dihasilkan secara rutin.
    if (record.id.startsWith("mock-")) {
      alert("Detail untuk data ini hanya tersedia jika ditambahkan melalui fitur 'Tambah Data' atau dihasilkan secara rutin.");
      return;
    }
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  // Step 1: Choose Date Range
  interface Step1DateRangeProps {
    formData: AddFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
    isEditMode: boolean; // New prop
  }

  const Step1DateRange: React.FC<Step1DateRangeProps> = ({ formData, setFormData, isEditMode }) => (
    <div>
      <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
        Tanggal Mulai
      </label>
      <input
        type="date"
        id="start-date"
        value={formData.startDate ? formData.startDate.toISOString().split("T")[0] : ""}
        onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
        disabled={isEditMode} // Disable in edit mode
      />

      <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mt-4">
        Tanggal Berakhir
      </label>
      <input
        type="date"
        id="end-date"
        value={formData.endDate ? formData.endDate.toISOString().split("T")[0] : ""}
        onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
        min={formData.startDate ? formData.startDate.toISOString().split("T")[0] : undefined}
        disabled={isEditMode} // Disable in edit mode
      />
    </div>
  );

  // Step 2: Choose Units
  interface Step2UnitsProps {
    formData: AddFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
    availableUnits: Unit[];
    isEditMode: boolean; // New prop
  }

  const Step2Units: React.FC<Step2UnitsProps> = ({ formData, setFormData, availableUnits, isEditMode }) => {
    const handleUnitSelection = (unitId: string, isSelected: boolean) => {
      if (isEditMode) return; // Prevent changes in edit mode
      setFormData((prev) => {
        const newSelectedUnits = isSelected ? [...prev.selectedUnits, { id: unitId, name: availableUnits.find((u) => u.id === unitId)?.name || "", machines: [] }] : prev.selectedUnits.filter((u) => u.id !== unitId);
        return { ...prev, selectedUnits: newSelectedUnits };
      });
    };

    return (
      <div>
        <h3 className="text-md font-semibold text-gray-700 mb-4">Pilih Unit</h3>
        <div className="space-y-2">
          {availableUnits.map((unit) => (
            <div key={unit.id} className="flex items-center">
              <input
                type="checkbox"
                id={`unit-${unit.id}`}
                checked={formData.selectedUnits.some((u) => u.id === unit.id)}
                onChange={(e) => handleUnitSelection(unit.id, e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                disabled={isEditMode} // Disable in edit mode
              />
              <label htmlFor={`unit-${unit.id}`} className="ml-3 text-sm font-medium text-gray-700">
                {unit.name}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Step 3: Choose Machines & Intervals per Machine
  interface Step3MachinesIntervalsProps {
    formData: AddFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
    availableUnits: Unit[];
    routineSchedules: RoutineSchedule[]; // Pass routineSchedules here
    isEditMode: boolean; // New prop
  }

  const Step3MachinesIntervals: React.FC<Step3MachinesIntervalsProps> = ({ formData, setFormData, availableUnits, routineSchedules, isEditMode }) => {
    const handleMachineSelection = (unitId: string, machine: Machine, isSelected: boolean) => {
      if (isEditMode) return; // Prevent changes in edit mode
      setFormData((prev) => {
        const unitIndex = prev.selectedUnits.findIndex((u) => u.id === unitId);
        if (unitIndex === -1) return prev;

        const updatedUnits = [...prev.selectedUnits];
        let updatedMachines = [...updatedUnits[unitIndex].machines];

        if (isSelected) {
          updatedMachines.push({ id: machine.id, name: machine.name, selectedInterval: null, selectedItems: [] });
        } else {
          updatedMachines = updatedMachines.filter((m) => m.id !== machine.id);
        }

        updatedUnits[unitIndex] = {
          ...updatedUnits[unitIndex],
          machines: updatedMachines,
        };
        return { ...prev, selectedUnits: updatedUnits };
      });
    };

    const handleIntervalChange = (unitId: string, machineId: string, interval: AddIntervalType) => {
      if (isEditMode) return; // Prevent changes in edit mode
      setFormData((prev) => {
        const unitIndex = prev.selectedUnits.findIndex((u) => u.id === unitId);
        if (unitIndex === -1) return prev;

        const machineIndex = prev.selectedUnits[unitIndex].machines.findIndex((m) => m.id === machineId);
        if (machineIndex === -1) return prev;

        const updatedUnits = [...prev.selectedUnits];
        const machineToUpdate = updatedUnits[unitIndex].machines[machineIndex];
        machineToUpdate.selectedInterval = interval;

        // Apply normalization to both the selected interval and the routine schedule intervals
        const normalizedSelectedInterval = normalizeIntervalType(interval);

        // Automatically populate selectedItems based on the new interval
        const itemsForInterval = routineSchedules
          .filter(
            (s) =>
              s.mesin === machineToUpdate.name &&
              normalizeIntervalType(s.interval) === normalizedSelectedInterval && // Use normalized interval for matching
              s.unitWilayah === updatedUnits[unitIndex].name // Ensure unit also matches
          )
          .map((s) => ({
            id: `${machineToUpdate.id}-${s.id}`,
            name: s.item,
            unitOfMeasure: s.unitOfMeasure,
            standardMin: s.standardMin,
            standardMax: s.standardMax,
            standartVisual: s.standartVisual,
          }));

        machineToUpdate.selectedItems = itemsForInterval;

        return { ...prev, selectedUnits: updatedUnits };
      });
    };

    return (
      <div className="space-y-6">
        {formData.selectedUnits.length === 0 && <p className="text-gray-500 text-center">Pilih unit di langkah sebelumnya.</p>}
        {formData.selectedUnits.map((selectedUnit) => {
          const fullUnit = availableUnits.find((u) => u.id === selectedUnit.id);
          const availableMachinesForUnit = fullUnit?.machines || [];

          return (
            <div key={selectedUnit.id} className="p-4 border rounded-md bg-gray-50">
              <h4 className="text-lg font-bold text-gray-800 mb-4">Unit: {selectedUnit.name}</h4>
              <div className="space-y-3">
                {availableMachinesForUnit.map((machine) => (
                  <div key={machine.id} className="flex items-center justify-between p-2 border rounded-md bg-white shadow-sm">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id={`machine-${machine.id}`}
                        checked={selectedUnit.machines.some((m) => m.id === machine.id)}
                        onChange={(e) => handleMachineSelection(selectedUnit.id, machine, e.target.checked)}
                        className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        disabled={isEditMode} // Disable in edit mode
                      />
                      <label htmlFor={`machine-${machine.id}`} className="ml-3 text-sm font-medium text-gray-700">
                        {machine.name}
                      </label>
                    </div>
                    {selectedUnit.machines.some((m) => m.id === machine.id) && (
                      <select
                        value={selectedUnit.machines.find((m) => m.id === machine.id)?.selectedInterval || ""}
                        onChange={(e) => handleIntervalChange(selectedUnit.id, machine.id, e.target.value as AddIntervalType)}
                        className="ml-4 p-1.5 border border-gray-300 rounded-md text-sm"
                        disabled={isEditMode} // Disable in edit mode
                      >
                        <option value="">Pilih Interval</option>
                        {["Daily", "Weekly", "Monthly", "3 Months", "6 Months", "1 Year"].map((interval) => (
                          <option key={interval} value={interval}>
                            {interval}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Step 4: Display Items per Machine (automatically populated by interval)
  interface Step4ItemsPerMachineProps {
    formData: AddFormData;
    setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
    routineSchedules: RoutineSchedule[];
    isEditMode: boolean;
    // Buat onUpdateRecord opsional
    onUpdateRecord?: (updatedRecord: MaintenanceTaskRecord) => void;
    recordForEdit?: MaintenanceTaskRecord | null;
  }

  const Step4ItemsPerMachine: React.FC<Step4ItemsPerMachineProps> = ({ formData, setFormData, routineSchedules, isEditMode, recordForEdit, onUpdateRecord }) => {
    // If in edit mode, we'll use the recordForEdit to display and modify.
    // Otherwise, it's the normal add flow
    const [localRecord, setLocalRecord] = useState<MaintenanceTaskRecord | null>(recordForEdit || null);

    useEffect(() => {
      setLocalRecord(recordForEdit || null);
    }, [recordForEdit]);

    const handleMonitoringResultChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!localRecord) return;
      setLocalRecord({ ...localRecord, monitoringResult: e.target.value });
    };

    const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (!localRecord) return;
      setLocalRecord({ ...localRecord, notes: e.target.value });
    };

    const handleMsStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      if (!localRecord) return;
      setLocalRecord({ ...localRecord, msStatus: e.target.value as "OK" | "NG" | "N/A" });
    };

    // This function will be called by the "Simpan Semua" button in the modal footer

    if (isEditMode && localRecord) {
      return (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Isi Data Monitoring</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DetailItem label="Tanggal" value={localRecord.date} />
            <DetailItem label="Unit" value={localRecord.unitWilayah} />
            <DetailItem label="Mesin" value={localRecord.mesin} />
            <DetailItem label="Interval" value={localRecord.interval} />
            <DetailItem label="Item" value={localRecord.item} />
            <DetailItem label="Satuan" value={localRecord.unitOfMeasure} />
            <DetailItem label="Standar Min" value={localRecord.standardMin} />
            <DetailItem label="Standar Max" value={localRecord.standardMax} />
            <DetailItem label="Standar Visual" value={localRecord.standartVisual} className="md:col-span-2" />
          </div>

          <div className="mt-4 p-4 border border-blue-200 rounded-lg bg-blue-50 space-y-3">
            <div>
              <label htmlFor="monitoring-result" className="block text-sm font-medium text-gray-700 mb-1">
                Hasil Pemantauan
              </label>
              <input
                type="text"
                id="monitoring-result"
                value={localRecord.monitoringResult === "N/A" ? "" : localRecord.monitoringResult}
                onChange={handleMonitoringResultChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Masukkan hasil pemantauan"
              />
            </div>
            <div>
              <label htmlFor="ms-status" className="block text-sm font-medium text-gray-700 mb-1">
                Status MS
              </label>
              <select id="ms-status" value={localRecord.msStatus} onChange={handleMsStatusChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
                <option value="N/A">Pilih Status</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
              </select>
            </div>
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                Catatan
              </label>
              <textarea
                id="notes"
                rows={3}
                value={localRecord.notes === "N/A" ? "" : localRecord.notes}
                onChange={handleNotesChange}
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tambahkan catatan..."
              ></textarea>
            </div>
          </div>
          {/* We'll handle the save button in the modal footer */}
        </div>
      );
    }

    // Original flow for adding new records
    return (
      <div className="space-y-6">
        {formData.selectedUnits.length === 0 && <p className="text-gray-500 text-center">Pilih unit dan mesin di langkah sebelumnya.</p>}
        {formData.selectedUnits.map((selectedUnit) => (
          <div key={selectedUnit.id} className="p-4 border rounded-md bg-gray-50">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Unit: {selectedUnit.name}</h4>
            {selectedUnit.machines.length === 0 && <p className="text-gray-500">Pilih mesin untuk unit ini di langkah sebelumnya.</p>}
            {selectedUnit.machines.map((selectedMachine) => {
              // The items are already populated in selectedMachine.selectedItems from Step 3
              const itemsToDisplay = selectedMachine.selectedItems;

              return (
                <div key={selectedMachine.id} className="mb-6 p-3 border rounded-md bg-white shadow-sm">
                  <h5 className="text-md font-bold text-gray-700 mb-3">
                    Mesin: {selectedMachine.name} (Interval: {selectedMachine.selectedInterval || "Belum Dipilih"})
                  </h5>
                  {selectedMachine.selectedInterval === null && <p className="text-red-500 text-sm mb-2">Pilih interval untuk mesin ini di langkah sebelumnya.</p>}
                  {itemsToDisplay.length === 0 && selectedMachine.selectedInterval !== null && <p className="text-gray-500 text-sm">Tidak ada item yang sesuai untuk interval yang dipilih.</p>}
                  <div className="space-y-2">
                    {itemsToDisplay.map((item) => (
                      <p key={item.id} className="ml-3 text-sm font-medium text-gray-700">
                        {item.name} ({item.unitOfMeasure || "N/A"})
                      </p>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  };

  const handleAddRecord = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newRecords: MaintenanceTaskRecord[] = [];

      if (!addForm.startDate || !addForm.endDate) {
        alert("Tanggal mulai dan tanggal berakhir harus dipilih.");
        return;
      }

      const oneDay = 24 * 60 * 60 * 1000;
      let currentDate = new Date(addForm.startDate.getTime());

      while (currentDate.getTime() <= addForm.endDate.getTime()) {
        const todayDate = currentDate.toISOString().split("T")[0];

        addForm.selectedUnits.forEach((unit) => {
          unit.machines.forEach((machine) => {
            if (machine.selectedInterval && machine.selectedItems.length > 0) {
              // Check if the current date matches the interval criteria for routine schedules
              const currentDayOfWeek = currentDate.getDay(); // 0 for Sunday, 1 for Monday
              const currentDayOfMonth = currentDate.getDate();
              const currentMonth = currentDate.getMonth();

              const intervalMatches = (intervalType: AddIntervalType, schedule: RoutineSchedule) => {
                const normalizedScheduleInterval = normalizeIntervalType(schedule.interval);
                const normalizedSelectedInterval = normalizeIntervalType(intervalType);

                if (normalizedScheduleInterval !== normalizedSelectedInterval) return false;

                switch (intervalType) {
                  case "Daily":
                    return true;
                  case "Weekly":
                    // getDay() returns 0 for Sunday, 1 for Monday, ..., 6 for Saturday
                    // Our schedule.dayOfWeek should match this (e.g., 1 for Monday)
                    return schedule.dayOfWeek !== undefined && schedule.dayOfWeek === currentDayOfWeek;
                  case "Monthly":
                    return schedule.dayOfMonth !== undefined && schedule.dayOfMonth === currentDayOfMonth;
                  case "3 Months": // Quarterly
                    // MonthOfYear should be 0 (Jan), 3 (Apr), 6 (Jul), 9 (Oct) if dayOfMonth is set
                    return schedule.dayOfMonth !== undefined && schedule.dayOfMonth === currentDayOfMonth && schedule.monthOfYear !== undefined && (currentMonth - schedule.monthOfYear) % 3 === 0;
                  case "6 Months": // Semi-annual
                    // MonthOfYear should be 0 (Jan), 6 (Jul) if dayOfMonth is set
                    return schedule.dayOfMonth !== undefined && schedule.dayOfMonth === currentDayOfMonth && schedule.monthOfYear !== undefined && (currentMonth - schedule.monthOfYear) % 6 === 0;
                  case "1 Year": // Yearly
                    return schedule.dayOfMonth !== undefined && schedule.dayOfMonth === currentDayOfMonth && schedule.monthOfYear !== undefined && schedule.monthOfYear === currentMonth;
                  default:
                    return false;
                }
              };

              // Explicitly refine the type of machine.selectedInterval within this block
              const currentMachineInterval: AddIntervalType = machine.selectedInterval;

              // Get relevant routine schedules to get standard details for items
              // Ensure unitWilayah also matches for a stricter filter
              const relevantSchedules = routineSchedules.filter(
                (s) =>
                  s.mesin === machine.name &&
                  s.unitWilayah === unit.name && // Ensure unit also matches
                  intervalMatches(currentMachineInterval, s)
              );

              machine.selectedItems.forEach((item) => {
                const newId = `mon-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // Find matching schedule to get standard values
                const matchedSchedule = relevantSchedules.find((s) => s.item === item.name);

                // Only add task if it matches a relevant schedule for the current date
                if (matchedSchedule) {
                  newRecords.push({
                    id: newId,
                    mesin: machine.name,
                    date: todayDate,
                    perbaikanPerawatan: "Preventif",
                    description: `Pemantauan terjadwal untuk ${machine.name} - ${item.name}`,
                    status: "Scheduled",
                    pic: "N/A",
                    shift: "N/A",
                    group: "N/A",
                    stopJam: 0,
                    stopMenit: 0,
                    startJam: 0,
                    startMenit: 0,
                    stopTime: "N/A",
                    unit: unit.name,
                    runningHour: 0,
                    itemTrouble: "N/A",
                    jenisGangguan: "N/A",
                    bentukTindakan: "N/A",
                    rootCause: "N/A",
                    jenisAktivitas: "Pemeliharaan",
                    kegiatan: "Pemeriksaan rutin",
                    kodePart: "N/A",
                    sparePart: "N/A",
                    idPart: "N/A",
                    jumlah: 0,
                    unitSparePart: "N/A",
                    interval: currentMachineInterval, // Use the refined type here
                    unitWilayah: unit.name,
                    item: item.name,
                    unitOfMeasure: item.unitOfMeasure,
                    standardMin: matchedSchedule?.standardMin || null,
                    standardMax: matchedSchedule?.standardMax || null,
                    standartVisual: matchedSchedule?.standartVisual || "",
                    monitoringResult: "N/A",
                    msStatus: "N/A",
                    approvalStatus: "Pending Employee",
                    currentApproverIndex: 0,
                    notes: "N/A", // Added missing notes property
                  });
                }
              });
            }
          });
        });
        currentDate.setDate(currentDate.getDate() + 1); // Move to the next day
      }

      setRecords((prev: MaintenanceTaskRecord[]) => [...prev, ...newRecords]);
      setShowAddModal(false);

      setAddForm({
        startDate: null,
        endDate: null,
        selectedUnits: [],
      });
      setCurrentStep(1);

      alert(`Berhasil menambahkan ${newRecords.length} catatan pemantauan.`);
    } catch (err) {
      console.error("Gagal menambahkan catatan pemantauan:", err);
      setError("Gagal menambahkan data. Silakan coba lagi.");
    }
  };

  const handleUpdateRecord = useCallback((updatedRecord: MaintenanceTaskRecord) => {
    setRecords((prevRecords) => prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)));
    setSelectedRecordForEdit(updatedRecord); // Update the record in the edit modal if it's still open
    setShowEditFormModal(false); // Close the edit modal after saving
    alert("Catatan monitoring berhasil diperbarui!");
  }, []);

  const handleUpdateApprovalStatus = useCallback(
    (id: string, newStatus: ApprovalStatusType, newApproverIndex: number, feedback?: string) => {
      setRecords((prevRecords) =>
        prevRecords.map((record) => {
          if (record.id === id) {
            return {
              ...record,
              approvalStatus: newStatus,
              currentApproverIndex: newApproverIndex,
              feedbackNotes: feedback || record.feedbackNotes,
              rejectionReason: newStatus === "Rejected" ? feedback : record.rejectionReason,
            };
          }
          return record;
        })
      );
      if (selectedRecord && selectedRecord.id === id) {
        setSelectedRecord((prev) =>
          prev
            ? {
                ...prev,
                approvalStatus: newStatus,
                currentApproverIndex: newApproverIndex,
                feedbackNotes: feedback || prev.feedbackNotes,
                rejectionReason: newStatus === "Rejected" ? feedback : prev.rejectionReason,
              }
            : null
        );
      }
    },
    [selectedRecord]
  );

  const handleClearFilter = () => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setSelectedUnit([]);
    setSelectedMachine([]); // Clear selected machine filter
    setSelectedItem([]);
    setSearchTerm("");
  };

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    // getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday to be the start of the week for display, so adjust if it's Sunday
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6 (end of week if Monday is 0), otherwise day-1
  };

  const today = useMemo(() => new Date(), []);

  const [currentCalendarDate, setCurrentCalendarDate] = useState(today);

  const goToPreviousMonth = () => {
    setCurrentCalendarDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentCalendarDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentCalendarDate(new Date());
  };

  // Fungsi baru untuk membuka modal daftar jadwal harian
  const handleOpenDailyScheduleModal = (schedules: MaintenanceTaskRecord[], date: string) => {
    // Pass date to the handler
    setDailySchedulesForSelectedDate(schedules);
    // Store the date string for the modal title
    setSelectedDateForDailySchedules(date);
    setShowDailyScheduleModal(true);
  };
  // New state to store the date for the daily schedules modal title
  const [selectedDateForDailySchedules, setSelectedDateForDailySchedules] = useState<string>("");

  // Function to open the FormMonitoringMaintenance as a modal for editing
  const handleEditRecordFromDailySchedule = (record: MaintenanceTaskRecord) => {
    // Navigasi ke halaman detail dengan membawa data record sebagai state
    navigate("/monitoringmaintenance/detailmonitoringmaintenance", {
      state: { record },
    });
  };

  const renderCalendarDays = () => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeekOfMonth = getFirstDayOfMonth(year, month); // 0 (Mon) - 6 (Sun)

    const calendarRows = [];
    let dayCounter = 1;
    let weekDays: React.ReactNode[] = [];
    let currentWeekStartDate: Date | null = null;

    // Fill leading empty cells for the first week
    for (let i = 0; i < firstDayOfWeekOfMonth; i++) {
      weekDays.push(<div key={`empty-pre-${i}`} className="p-3 md:p-4 text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-md min-h-[80px] md:min-h-[100px] flex items-center justify-center"></div>);
    }

    // Populate days
    while (dayCounter <= daysInMonth) {
      const date = new Date(year, month, dayCounter);
      if (!currentWeekStartDate) {
        currentWeekStartDate = date; // Set the start date for the current week
      }

      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;
      const dayRecords = filteredRecords.filter((record) => record.date === dateString);
      const isToday = today.toDateString() === date.toDateString();

      let cellClasses = "p-3 md:p-4 text-center border border-gray-100 rounded-md flex flex-col justify-between relative min-h-[80px] md:min-h-[100px]";
      if (isToday) {
        cellClasses += " bg-blue-100 border-blue-400 font-bold";
      } else {
        cellClasses += " bg-white";
      }

      // Collect unique machine names for this day
      const uniqueMachinesOnDay = Array.from(new Set(dayRecords.map((r) => r.mesin)));

      weekDays.push(
        <div key={dateString} className={cellClasses}>
          <span className={`text-sm font-semibold ${isToday ? "text-blue-700" : "text-gray-800"}`}>{dayCounter}</span>
          <div className="flex flex-col items-center justify-center mt-1 space-y-0.5">
            {dayRecords.length > 0 && ( // Tampilkan tombol hanya jika ada jadwal
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="w-full text-center text-xs px-2 py-1 rounded-full overflow-hidden truncate bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors"
                onClick={() => handleOpenDailyScheduleModal(dayRecords, dateString)} // Pass dateString
                title={uniqueMachinesOnDay.join(", ")}
              >
                {uniqueMachinesOnDay[0]} {uniqueMachinesOnDay.length > 1 ? `+${uniqueMachinesOnDay.length - 1} lainnya` : ""}
                {dayRecords.length > 0 && <span className="ml-1">({dayRecords.length} jadwal)</span>}
              </motion.button>
            )}
          </div>
        </div>
      );

      // Check if it's the end of a 7-day week (Sunday, or day 6 if Monday is 0) or the last day of the month
      if (weekDays.length === 7 || dayCounter === daysInMonth) {
        // If it's the end of the month but the week isn't full, fill with empty cells
        while (weekDays.length < 7) {
          weekDays.push(<div key={`empty-post-${weekDays.length}`} className="p-3 md:p-4 text-center text-gray-400 bg-gray-50 border border-gray-100 rounded-md min-h-[80px] md:min-h-[100px] flex items-center justify-center"></div>);
        }

        const weekNum = currentWeekStartDate ? getISOWeekNumber(currentWeekStartDate) : null;
        calendarRows.push(
          <React.Fragment key={`week-row-${dayCounter}`}>
            <div className="p-2 text-center font-bold text-gray-700 bg-gray-100 rounded-md border border-gray-200">{weekNum !== null ? ` ${String(weekNum).padStart(2, "0")}` : ""}</div>
            {weekDays}
          </React.Fragment>
        );
        weekDays = []; // Reset for next week
        currentWeekStartDate = null; // Reset for next week
      }
      dayCounter++;
    }

    return calendarRows;
  };

  const calendarEvents = useMemo(() => {
    return filteredRecords.map((record) => ({
      id: record.id,
      title: `${record.mesin}: ${record.item}`,
      date: record.date,
      allDay: true,
      color: record.msStatus === "OK" ? "#10B981" : record.msStatus === "NG" ? "#EF4444" : "#3B82F6",
      extendedProps: {
        ...record,
      },
    }));
  }, [filteredRecords]);

  const notifications: any[] = useMemo(() => {
    const pendingApprovalTasks = records.filter((task) => task.approvalStatus.startsWith("Pending") && task.currentApproverIndex > 0 && APPROVAL_ROLES[task.currentApproverIndex] === dummyUser.role);
    const overdueMonitoring = records.filter((task) => task.status === "Missed");

    const newNotifications: any[] = [];
    pendingApprovalTasks.forEach((task) => {
      newNotifications.push({
        id: `approval-${task.id}`,
        icon: <Bell className="text-orange-500" />,
        title: `Persetujuan Dibutuhkan: ${task.mesin} - ${task.item}`,
        description: `Catatan untuk ${task.mesin} - ${task.item} menunggu persetujuan Anda (${task.approvalStatus}).`,
        date: new Date(task.date).toLocaleDateString("id-ID"),
      });
    });

    overdueMonitoring.forEach((task) => {
      newNotifications.push({
        id: `overdue-${task.id}`,
        icon: <AlertTriangle className="text-red-500" />,
        title: `Pemantauan Terlambat: ${task.mesin}`,
        description: `Pemantauan untuk ${task.item} pada ${task.mesin} yang dijadwalkan pada ${new Date(task.date).toLocaleDateString("id-ID")} telah terlambat.`,
        date: new Date(task.date).toLocaleDateString("id-ID"),
      });
    });

    return newNotifications;
  }, [records, dummyUser.role]);

  const handleSetFilterByInterval = (interval: "weekly" | "monthly" | "3months" | "6months" | "1year") => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (interval) {
      case "weekly":
        startDate = new Date(today);
        startDate.setDate(today.getDate() - today.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case "monthly":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        break;
      case "3months":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 3, 0);
        break;
      case "6months":
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = new Date(today.getFullYear(), today.getMonth() + 6, 0);
        break;
      case "1year":
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = new Date(today.getFullYear(), 11, 31);
        break;
      default:
        startDate = new Date(0);
        endDate = new Date(8640000000000000);
        break;
    }
    setFilterStartDate(startDate);
    setFilterEndDate(endDate);
  };

  const isStep1Complete = addForm.startDate !== null && addForm.endDate !== null;
  const isStep2Complete = addForm.selectedUnits.length > 0;
  const isStep3Complete = addForm.selectedUnits.every((unit) => unit.machines.length > 0 && unit.machines.every((machine) => machine.selectedInterval !== null));
  // Step 4 completion now checks if for every selected machine, there are items associated with its selected interval.
  const isStep4Complete = addForm.selectedUnits.every((unit) =>
    unit.machines.every(
      (machine) =>
        machine.selectedInterval === null || // If no interval is selected, it's not complete for this machine
        (machine.selectedInterval !== null && machine.selectedItems.length > 0) // If interval is selected, there must be items
    )
  );

  // Komponen modal baru untuk menampilkan daftar jadwal harian
  interface DailyScheduleListModalProps {
    isOpen: boolean;
    onClose: () => void;
    schedules: MaintenanceTaskRecord[];
    onSelectSchedule: (record: MaintenanceTaskRecord) => void; // Pastikan tipe ini sesuai
    titleDate: string;
  }

  const DailyScheduleListModal: React.FC<DailyScheduleListModalProps> = ({
    isOpen,
    onClose,
    schedules,
    onSelectSchedule, // Pastikan prop ini ada
    titleDate,
  }) => {
    const handleSelectAndClose = (record: MaintenanceTaskRecord) => {
      onSelectSchedule(record);
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title={`Jadwal Harian untuk ${new Date(titleDate).toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}`} className="max-w-md">
        {" "}
        {/* Dynamic title */}
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <p className="text-gray-600">Tidak ada jadwal untuk tanggal ini.</p>
          ) : (
            schedules.map((schedule, index) => (
              <motion.button
                key={schedule.id}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleSelectAndClose(schedule)} // This now triggers edit form
                className="w-full text-left p-4 border border-gray-200 rounded-lg shadow-sm bg-white hover:bg-blue-50 transition-colors duration-150 flex flex-col items-start" // Increased padding to p-4
              >
                <p className="font-semibold text-gray-800 text-base">
                  Schedule {index + 1}: {schedule.mesin} - {schedule.item}
                </p>{" "}
                {/* Changed to "Schedule X: Mesin - Item" */}
                <p className="text-sm text-gray-600">
                  Interval: {schedule.interval} | Unit: {schedule.unitWilayah}
                </p>{" "}
                {/* Adjusted font size */}
                <p className={`mt-2 px-3 py-1 rounded-full text-sm font-semibold ${getApprovalStatusColor(schedule.approvalStatus)}`}>
                  {" "}
                  {/* Increased padding and font size */}
                  {getDisplayStatus(schedule.approvalStatus)} {/* Updated status display */}
                </p>
              </motion.button>
            ))
          )}
        </div>
      </Modal>
    );
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
            <Monitor className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Pemantauan Pemeliharaan</h2>
          </div>

          <div className="flex items-center space-x-3 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            >
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>

            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
                className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
                aria-label="Notifikasi"
              >
                <Bell className="text-xl" />
                {notifications.length > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>}
              </motion.button>

              <AnimatePresence>
                {showNotificationsPopup && (
                  <motion.div
                    ref={notificationsRef}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifikasi</h3>
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
                        <p className="p-4 text-center text-gray-500 text-sm">Tidak ada notifikasi baru.</p>
                      )}
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
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${dummyUser.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="Avatar Pengguna"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{dummyUser.name}</span>
                <ChevronDown className="text-gray-500 text-base" />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    ref={profileRef}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                  >
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Masuk sebagai</div>
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{dummyUser.name || "Pengguna Tamu"}</div>
                    <button onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left">
                      <UserIcon size={16} className="mr-2" /> Profil Saya
                    </button>
                    <button onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left">
                      <Settings size={16} className="mr-2" /> Pengaturan
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <motion.button onClick={() => setShowProfileMenu(false)} className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left">
                      <LogOut size={16} className="mr-2" /> Keluar
                    </motion.button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Pemantauan <span className="text-blue-600">Pemeliharaan</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Memantau dan menjadwalkan tugas pemeliharaan preventif untuk semua mesin, dan melacak kemajuan persetujuannya.</p>
            </div>
            <div className="flex items-center space-x-2">
              <motion.button
                onClick={() => {
                  setShowAddModal(true);
                  setAddForm({ startDate: null, endDate: null, selectedUnits: [] }); // Reset form on open
                  setCurrentStep(1); // Start at step 1
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
              >
                <Plus className="w-4 h-4 mr-2" /> Tambah Data
              </motion.button>
              <div className="flex space-x-1 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                {/* Removed Weekly Button */}
                <motion.button
                  onClick={() => setViewMode("calendar")}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "calendar" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <Calendar className="w-4 h-4 mr-2" /> Kalender
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("table")}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "table" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <Clipboard className="w-4 h-4 mr-2" /> Tabel
                </motion.button>
                <motion.button
                  onClick={() => setViewMode("trend")}
                  whileTap={{ scale: 0.95 }}
                  className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "trend" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                >
                  <TrendingUp className="w-4 h-4 mr-2" /> Tren
                </motion.button>
              </div>
            </div>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Memuat data pemeliharaan...</p>
            </div>
          ) : records.length === 0 && viewMode !== "trend" ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">Tidak ada data pemeliharaan yang tersedia.</p>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div key={viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                <div className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
                  <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
                    <div className="flex-1 relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                      <input
                        type="text"
                        placeholder="Cari berdasarkan tanggal, interval, atau catatan..."
                        className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        aria-label="Cari catatan"
                      />
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                      className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
                    >
                      <Filter className="text-base" />
                      <span>Filter</span>
                      <motion.span animate={{ rotate: showAdvancedFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown className="text-base" />
                      </motion.span>
                    </motion.button>
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
                          {/* Replaced DatePicker with standard input type="date" */}
                          <input
                            type="date"
                            value={filterStartDate ? filterStartDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => setFilterStartDate(e.target.value ? new Date(e.target.value) : null)}
                            placeholder="Tanggal Mulai"
                            className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                            aria-label="Tanggal Mulai"
                          />
                          <span className="text-gray-400">-</span>
                          <input
                            type="date"
                            value={filterEndDate ? filterEndDate.toISOString().split("T")[0] : ""}
                            onChange={(e) => setFilterEndDate(e.target.value ? new Date(e.target.value) : null)}
                            placeholder="Tanggal Berakhir"
                            className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                            aria-label="Tanggal Berakhir"
                            min={filterStartDate ? filterStartDate.toISOString().split("T")[0] : undefined}
                          />
                          {(filterStartDate || filterEndDate) && (
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => {
                                setFilterStartDate(null);
                                setFilterEndDate(null);
                              }}
                              className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                              title="Hapus Tanggal"
                              aria-label="Hapus rentang tanggal"
                            >
                              <X className="text-base" />
                            </motion.button>
                          )}
                        </div>

                        <div className="relative w-full">
                          <select
                            value={selectedUnit}
                            onChange={(e) => setSelectedUnit(e.target.value ? [e.target.value] : [])}
                            className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left transition-all duration-200 shadow-sm cursor-pointer"
                          >
                            <option value="">Semua Unit</option>
                            {uniqueUnits.map((unit) => (
                              <option key={unit} value={unit}>
                                {unit}
                              </option>
                            ))}
                          </select>
                        </div>
                        {/* New filter for 'Mesin' (Machine) */}
                        <div className="relative w-full">
                          <select
                            value={selectedMachine}
                            onChange={(e) => setSelectedMachine(e.target.value ? [e.target.value] : [])}
                            className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left transition-all duration-200 shadow-sm cursor-pointer"
                          >
                            <option value="">Semua Mesin</option>
                            {uniqueMachines.map((machine) => (
                              <option key={machine} value={machine}>
                                {machine}
                              </option>
                            ))}
                          </select>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Removed WeeklyView Component */}
                {viewMode === "calendar" && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                    <div className="flex justify-between items-center mb-4">
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goToPreviousMonth} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                        <ChevronLeft size={20} />
                      </motion.button>
                      <h3 className="text-lg font-bold text-gray-800">{currentCalendarDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</h3>
                      <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={goToNextMonth} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                        <ChevronRight size={20} />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={goToCurrentMonth}
                        className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                      >
                        Hari Ini
                      </motion.button>
                    </div>
                    {/* Calendar Header with WN */}
                    <div className="grid grid-cols-8 gap-2 text-center text-sm font-semibold text-gray-600 mb-2">
                      <div className="text-center font-bold">WN</div>
                      <div>Sen</div>
                      <div>Sel</div>
                      <div>Rab</div>
                      <div>Kam</div>
                      <div>Jum</div>
                      <div>Sab</div>
                      <div>Min</div>
                    </div>
                    {/* Calendar Days with WN */}
                    <div className="grid grid-cols-8 gap-2">{renderCalendarDays()}</div>
                  </div>
                )}
                {viewMode === "table" && (
                  <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                    <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6 animate-fade-in">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mesin</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hasil Pemantauan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status MS</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Persetujuan</th>
                            <th className="relative px-6 py-3">
                              <span className="sr-only">Tindakan</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {filteredRecords.length > 0 ? (
                            filteredRecords.map((record) => (
                              <motion.tr key={record.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.date}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.interval}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.unitWilayah}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.mesin}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{record.item}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{record.monitoringResult}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span
                                    className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                      record.msStatus === "OK" ? "bg-green-100 text-green-800" : record.msStatus === "NG" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                    }`}
                                  >
                                    {record.msStatus}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getApprovalStatusColor(record.approvalStatus)}`}>{getDisplayStatus(record.approvalStatus)}</span> {/* Updated status display */}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleViewRecord(record)}
                                    className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                    title="Lihat Detail"
                                  >
                                    <Eye size={18} />
                                  </motion.button>
                                </td>
                              </motion.tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan={9} className="px-6 py-4 text-center text-sm text-gray-500">
                                Tidak ada data pemantauan yang ditemukan.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
                {viewMode === "trend" && <TrendAnalysis records={filteredRecords} />}
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Detail Pemantauan">
        {selectedRecord && (
          <>
            <DetailView record={selectedRecord} onUpdateApproval={handleUpdateApprovalStatus} currentUserRole={dummyUser.role} />

            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
              <motion.a
                href="/detailmonitoring"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm flex items-center"
              >
                <Eye className="w-4 h-4 mr-2" />
                Lihat Detail Lengkap
              </motion.a>
            </div>
          </>
        )}
      </Modal>

      {/* Modal for Adding New Data */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Tambah Data Pemantauan Baru" className="max-w-3xl">
        <div className="mb-4 flex border-b">
          <button type="button" onClick={() => setCurrentStep(1)} className={`px-4 py-2 font-medium ${currentStep === 1 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
            1. Tanggal
          </button>
          <button
            type="button"
            onClick={() => isStep1Complete && setCurrentStep(2)}
            className={`px-4 py-2 font-medium ${currentStep === 2 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!isStep1Complete ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isStep1Complete}
          >
            2. Unit
          </button>
          <button
            type="button"
            onClick={() => isStep2Complete && setCurrentStep(3)}
            className={`px-4 py-2 font-medium ${currentStep === 3 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!isStep2Complete ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isStep2Complete}
          >
            3. Mesin & Interval
          </button>
          <button
            type="button"
            onClick={() => isStep3Complete && setCurrentStep(4)}
            className={`px-4 py-2 font-medium ${currentStep === 4 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!isStep3Complete ? "opacity-50 cursor-not-allowed" : ""}`}
            disabled={!isStep3Complete}
          >
            4. Item
          </button>
        </div>

        <div className="min-h-[300px]">
          {currentStep === 1 && <Step1DateRange formData={addForm} setFormData={setAddForm} isEditMode={false} />}
          {currentStep === 2 && <Step2Units formData={addForm} setFormData={setAddForm} availableUnits={STATIC_UNITS} isEditMode={false} />}
          {currentStep === 3 && <Step3MachinesIntervals formData={addForm} setFormData={setAddForm} availableUnits={STATIC_UNITS} routineSchedules={routineSchedules} isEditMode={false} />}
          {currentStep === 4 && (
            <Step4ItemsPerMachine
              formData={addForm}
              setFormData={setAddForm}
              routineSchedules={routineSchedules}
              isEditMode={false}
              onUpdateRecord={() => {}} // Berikan fungsi kosong
            />
          )}
        </div>

        <div className="flex justify-between mt-6 pt-4 border-t">
          {currentStep > 1 ? (
            <button type="button" onClick={() => setCurrentStep(currentStep - 1)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300">
              Kembali
            </button>
          ) : (
            <div></div>
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep + 1)}
              className={`px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 ${
                (currentStep === 1 && !isStep1Complete) || (currentStep === 2 && !isStep2Complete) || (currentStep === 3 && !isStep3Complete) ? "opacity-50 cursor-not-allowed" : ""
              }`}
              disabled={(currentStep === 1 && !isStep1Complete) || (currentStep === 2 && !isStep2Complete) || (currentStep === 3 && !isStep3Complete)}
            >
              Lanjut
            </button>
          ) : (
            <button type="button" onClick={handleAddRecord} className={`px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 ${!isStep4Complete ? "opacity-50 cursor-not-allowed" : ""}`} disabled={!isStep4Complete}>
              Simpan Semua
            </button>
          )}
        </div>
      </Modal>

      {/* Modal untuk menampilkan daftar jadwal harian */}
      <DailyScheduleListModal
        isOpen={showDailyScheduleModal}
        onClose={() => setShowDailyScheduleModal(false)}
        schedules={dailySchedulesForSelectedDate}
        onSelectSchedule={handleEditRecordFromDailySchedule} // Pastikan ini di-set dengan benar
        titleDate={selectedDateForDailySchedules}
      />

      {/* NEW: Modal for Editing/Filling Monitoring Data from Daily Schedule */}
      <Modal isOpen={showEditFormModal} onClose={() => setShowEditFormModal(false)} title="Isi / Edit Data Monitoring" className="max-w-3xl">
        {selectedRecordForEdit && (
          <Step4ItemsPerMachine
            formData={addForm} // dummy formData, not directly used in edit mode
            setFormData={setAddForm} // dummy setFormData
            routineSchedules={routineSchedules} // passed for context if needed, but not directly used for item population in edit
            isEditMode={true}
            recordForEdit={selectedRecordForEdit}
            onUpdateRecord={handleUpdateRecord}
          />
        )}
        <div className="flex justify-end mt-6 pt-4 border-t">
          <button
            type="button"
            onClick={() => {
              if (selectedRecordForEdit) {
                handleUpdateRecord(selectedRecordForEdit); // Use the state from Step4ItemsPerMachine
              }
            }}
            className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600"
            disabled={!selectedRecordForEdit || selectedRecordForEdit.monitoringResult === "N/A" || selectedRecordForEdit.msStatus === "N/A"}
          >
            Simpan Perubahan
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default MonitoringMaintenance;
