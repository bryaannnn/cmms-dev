import * as React from "react";
import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth, MonitoringSchedule, MesinDetail, ItemMesin, MonitoringInterval, UnitWithMachines, MonitoringScheduleDetail, AllMasterMonitoring } from "../../routes/AuthContext";
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
  Activity,
  Minus,
  Clock,
  Package,
  BarChart2,
} from "lucide-react";
import Sidebar from "../Sidebar";
import PageHeader from "../../component/PageHeader";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

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
  msStatus: "TMS" | "MS" | "N/A";
  notes: string;
  // HAPUS SEMUA STATUS APPROVAL
  perbaikanPerawatan: string;
  description: string;
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
  scheduleId?: number;
  scheduleStatus?: string;
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
  maxWidth?: string;
}

interface DetailItemProps {
  label: string;
  value: string | number | null;
  className?: string;
  valueColorClass?: string;
}

interface SectionTitleProps {
  title: string;
}

interface TrendAnalysisProps {
  records: MaintenanceTaskRecord[];
}

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

export type AddIntervalType = "Weekly" | "Monthly" | "3 Months" | "6 Months" | "1 Year" | "Daily";

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
  selectedItems: SelectedItemForMachine[];
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

interface Step1DateRangeProps {
  formData: AddFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
}

interface Step2UnitsProps {
  formData: AddFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
  availableUnits: Unit[];
}

interface Step3MachinesIntervalsProps {
  formData: AddFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
  availableUnits: Unit[];
  routineSchedules: RoutineSchedule[];
}

interface Step4ItemsPerMachineProps {
  formData: AddFormData;
  setFormData: React.Dispatch<React.SetStateAction<AddFormData>>;
  routineSchedules: RoutineSchedule[];
}

interface DailyScheduleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: MaintenanceTaskRecord[];
  onSelectSchedule: (record: MaintenanceTaskRecord) => void;
  titleDate: string;
}

interface MonitoringActivity {
  id_monitoring_activity?: number;
  id_monitoring_schedule: number;
  tgl_monitoring: string;
  hasil_monitoring?: string;
  hasil_keterangan?: string;
  id_item_mesin: number;
  created_at?: string;
  updated_at?: string;
}

interface DetailViewProps {
  record: MaintenanceTaskRecord;
  onUpdateRecord: (updatedRecord: MaintenanceTaskRecord) => void; // HAPUS parameter id
}

const getWeekOfMonth = (date: Date): number => {
  const startDay = date.getDate();
  const dayOfWeek = date.getDay();
  return Math.ceil((startDay + 6 - dayOfWeek) / 7);
};

const getISOWeekNumber = (d: Date): number => {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  date.setUTCDate(date.getUTCDate() + 4 - (date.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  return weekNo;
};

const displayValue = (value: string | number | null): string => {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return String(value);
};

const normalizeIntervalType = (interval: AddIntervalType | RoutineSchedule["interval"]): string => {
  const lowerCaseInterval = String(interval).toLowerCase();
  if (lowerCaseInterval === "3 months") return "quarterly";
  if (lowerCaseInterval === "6 months") return "semi-annual";
  if (lowerCaseInterval === "1 year") return "yearly";
  if (lowerCaseInterval === "weekly") return "weekly";
  if (lowerCaseInterval === "monthly") return "monthly";
  if (lowerCaseInterval === "daily") return "daily";
  if (lowerCaseInterval === "quarterly") return "quarterly";
  if (lowerCaseInterval === "semi-annual") return "semi-annual";
  if (lowerCaseInterval === "yearly") return "yearly";
  return lowerCaseInterval;
};

// Components
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, maxWidth = "max-w-xl" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-60 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${maxWidth} ${className || "w-full"}`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-indigo-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-700 focus:outline-none transition-colors duration-150" aria-label="Close modal">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailItem: React.FC<DetailItemProps> = ({ label, value, className = "", valueColorClass = "text-gray-900" }) => (
  <div className={`p-4 bg-gray-50 backdrop-brightness-50 rounded-lg shadow-sm ${className}`}>
    <p className="text-xs font-medium text-gray-500 uppercase">{label}</p>
    <p className={`mt-1 text-sm font-semibold ${valueColorClass}`}>{value ?? "N/A"}</p>
  </div>
);

const SectionTitle: React.FC<SectionTitleProps> = ({ title }) => <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200 mt-6 first:mt-0">{title}</h3>;

const DetailView: React.FC<DetailViewProps> = ({ record, onUpdateRecord }) => {
  return (
    <div className="space-y-6">
      <SectionTitle title="Monitoring Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Monitoring Interval" value={displayValue(record.interval)} />
        <DetailItem label="Unit" value={displayValue(record.unitWilayah)} />
        <DetailItem label="Machine" value={displayValue(record.mesin)} />
        <DetailItem label="Item" value={displayValue(record.item)} />
        <DetailItem label="Unit of Measure" value={displayValue(record.unitOfMeasure)} />
        <DetailItem label="Monitoring Result" value={displayValue(record.monitoringResult)} valueColorClass={record.msStatus === "MS" ? "text-green-600" : record.msStatus === "TMS" ? "text-red-600" : "text-gray-900"} />
        <DetailItem label="MS Status" value={displayValue(record.msStatus)} valueColorClass={record.msStatus === "MS" ? "text-green-600" : record.msStatus === "TMS" ? "text-red-600" : "text-gray-900"} />
      </div>

      <SectionTitle title="Standard" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Standard (Min)" value={displayValue(record.standardMin)} />
        <DetailItem label="Standard (Max)" value={displayValue(record.standardMax)} />
        <DetailItem label="Visual Standard" value={displayValue(record.standartVisual)} className="md:col-span-2" />
      </div>

      <SectionTitle title="Description" />
      <div className="grid grid-cols-1">
        <DetailItem label="Notes" value={displayValue(record.notes)} />
      </div>
    </div>
  );
};

const TrendAnalysis: React.FC<TrendAnalysisProps> = ({ records }) => {
  const [selectedMachine, setSelectedMachine] = useState<string>("");
  const [selectedItem, setSelectedItem] = useState<string>("");

  // Debug: Cek data records
  console.log("Trend Analysis - Total records:", records.length);
  console.log("Trend Analysis - Sample records:", records.slice(0, 3));

  const machines = useMemo(() => {
    if (!records || records.length === 0) {
      console.log("No records available for machines");
      return [""];
    }

    const uniqueMachines = [...new Set(records.filter((r) => r.mesin && r.mesin !== "N/A" && r.mesin.trim() !== "").map((r) => r.mesin))].sort();

    console.log("Available machines:", uniqueMachines);
    return ["", ...uniqueMachines];
  }, [records]);

  const items = useMemo(() => {
    if (!selectedMachine || selectedMachine === "") {
      console.log("No machine selected for items");
      return [""];
    }

    const machineItems = records.filter((r) => r.mesin === selectedMachine && r.item && r.item !== "N/A" && r.item.trim() !== "").map((r) => r.item);

    const uniqueItems = [...new Set(machineItems)].sort();
    console.log(`Available items for ${selectedMachine}:`, uniqueItems);
    return ["", ...uniqueItems];
  }, [records, selectedMachine]);

  const trendData = useMemo(() => {
    if (!selectedMachine || !selectedItem || selectedMachine === "" || selectedItem === "") {
      console.log("Missing selection for trend data");
      return [];
    }

    const filteredData = records
      .filter((r) => {
        const isMachineMatch = r.mesin === selectedMachine;
        const isItemMatch = r.item === selectedItem;

        // PERBAIKAN: Gunakan semua records yang memiliki monitoring activities
        const hasActivity = r.id.startsWith("activity-");

        // PERBAIKAN: Cek apakah hasil monitoring numeric dengan cara yang lebih baik
        const hasNumericResult = r.monitoringResult && r.monitoringResult !== "N/A" && r.monitoringResult !== "MS" && r.monitoringResult !== "TMS" && !isNaN(parseFloat(r.monitoringResult)) && isFinite(parseFloat(r.monitoringResult));

        console.log(`Record ${r.id}:`, {
          machineMatch: isMachineMatch,
          itemMatch: isItemMatch,
          hasActivity,
          monitoringResult: r.monitoringResult,
          isNumeric: hasNumericResult,
          parsedValue: hasNumericResult ? parseFloat(r.monitoringResult) : null,
        });

        return isMachineMatch && isItemMatch && hasActivity && hasNumericResult;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((r) => {
        const resultValue = parseFloat(r.monitoringResult);
        console.log(`Trend data point: ${r.date}, ${r.monitoringResult}, numeric: ${resultValue}`);
        return {
          date: new Date(r.date),
          dateString: new Date(r.date).toLocaleDateString("en-US"),
          result: resultValue,
          msStatus: r.msStatus,
          notes: r.notes,
          machine: r.mesin,
          item: r.item,
          standardMin: r.standardMin,
          standardMax: r.standardMax,
          isActivity: r.id.startsWith("activity-"),
        };
      });

    console.log(`Trend data for ${selectedMachine} - ${selectedItem}:`, filteredData);
    return filteredData;
  }, [records, selectedMachine, selectedItem]);

  // Statistical Analysis dengan error handling yang lebih baik
  const analysis = useMemo(() => {
    if (trendData.length === 0) {
      console.log("No trend data available for analysis");
      return null;
    }

    try {
      const results = trendData.map((d) => d.result);
      console.log("Analysis results:", results);

      // Basic statistics
      const mean = results.reduce((a, b) => a + b, 0) / results.length;
      const sorted = [...results].sort((a, b) => a - b);
      const median = sorted.length % 2 === 0 ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2 : sorted[Math.floor(sorted.length / 2)];

      const variance = results.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / results.length;
      const stdDev = Math.sqrt(variance);
      const min = Math.min(...results);
      const max = Math.max(...results);
      const range = max - min;

      // Trend analysis
      const dates = trendData.map((d) => d.date.getTime());
      const resultsNum = trendData.map((d) => d.result);

      const n = dates.length;
      const sumX = dates.reduce((a, b) => a + b, 0);
      const sumY = resultsNum.reduce((a, b) => a + b, 0);
      const sumXY = dates.reduce((acc, x, i) => acc + x * resultsNum[i], 0);
      const sumX2 = dates.reduce((acc, x) => acc + x * x, 0);

      const denominator = n * sumX2 - sumX * sumX;
      const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
      const intercept = denominator !== 0 ? (sumY - slope * sumX) / n : 0;

      const trendDirection = slope > 0.001 ? "increasing" : slope < -0.001 ? "decreasing" : "stable";
      const trendStrength = stdDev > 0 ? Math.abs(slope) / stdDev : 0;

      const outliers = trendData.filter((d) => Math.abs(d.result - mean) > 2 * stdDev);

      const firstRecord = trendData[0];
      const withinStandard =
        firstRecord.standardMin !== null && firstRecord.standardMax !== null
          ? (trendData.filter((d) => d.result >= (firstRecord.standardMin || 0) && d.result <= (firstRecord.standardMax || Infinity)).length / trendData.length) * 100
          : null;

      return {
        mean,
        median,
        stdDev,
        min,
        max,
        range,
        count: results.length,
        trendDirection,
        trendStrength: trendStrength * 1000,
        slope,
        outliers,
        withinStandard,
        coefficientOfVariation: mean > 0 ? (stdDev / mean) * 100 : 0,
      };
    } catch (error) {
      console.error("Error in statistical analysis:", error);
      return null;
    }
  }, [trendData]);

  // Stat Cards Data - STYLE BARU seperti di luar
  const statCardsData = useMemo(() => {
    const totalRecords = records.length;
    const machinesWithData = new Set(records.map((r) => r.mesin)).size;
    const okStatusCount = records.filter((r) => r.msStatus === "MS").length;
    const okPercentage = totalRecords > 0 ? (okStatusCount / totalRecords) * 100 : 0;

    return [
      {
        title: "Total Monitoring Items",
        value: totalRecords.toLocaleString("id-ID"),
        icon: <Clipboard />,
      },
      {
        title: "Machines Monitored",
        value: machinesWithData.toLocaleString("id-ID"),
        icon: <Monitor />,
      },
      {
        title: "Success Rate",
        value: `${okPercentage.toFixed(1)}%`,
        icon: <CheckCircle />,
      },
    ];
  }, [records]);

  // Most Monitored Machines - STYLE BARU
  const mostMonitoredMachines = useMemo(() => {
    const machineCounts: { [key: string]: number } = {};
    records.forEach((record) => {
      if (record.mesin) {
        machineCounts[record.mesin] = (machineCounts[record.mesin] || 0) + 1;
      }
    });

    return Object.entries(machineCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));
  }, [records]);

  // Monitoring Trend Data - STYLE BARU
  const monitoringTrendData = useMemo(() => {
    const monthlyCounts: { [key: string]: number } = {};

    records.forEach((record) => {
      if (record.date) {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        const key = `${year}-${month}`;
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      }
    });

    return Object.entries(monthlyCounts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, count]) => {
        const [year, month] = dateKey.split("-");
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" });
        return {
          name: `${monthName} ${year}`,
          "Monitoring Events": count,
        };
      });
  }, [records]);

  // Status Distribution Data - STYLE BARU
  const statusDistributionData = useMemo(() => {
    const statusCounts: { [key: string]: number } = {
      MS: 0,
      TMS: 0,
      "N/A": 0,
    };

    records.forEach((record) => {
      const status = record.msStatus || "N/A";
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });

    // PERBAIKAN: Gunakan key yang benar sesuai dengan data
    return [
      { name: "MS", value: statusCounts.MS },
      { name: "TMS", value: statusCounts.TMS },
      { name: "N/A", value: statusCounts["N/A"] },
    ].filter((item) => item.value > 0);
  }, [records]);

  const PIE_COLORS = ["#10B981", "#EF4444", "#6B7280"];

  // Tampilkan debug information
  console.log("Current selection:", { selectedMachine, selectedItem });
  console.log("Trend data length:", trendData.length);
  console.log("Analysis available:", analysis !== null);

  // Jika belum memilih machine dan item, tampilkan dashboard overview
  if (!selectedMachine || !selectedItem) {
    return (
      <div className="space-y-8">
        {/* Stat Cards - STYLE BARU */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {statCardsData.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
              className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
            >
              <div className="flex items-center justify-between z-10 relative">
                <div>
                  <p className="text-sm font-medium text-gray-500 mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{stat.icon}</div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Grid - STYLE BARU */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Monitored Machines */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <BarChart2 className="mr-2 text-blue-600" /> Most Monitored Machines
            </h3>
            <div className="space-y-3">
              {mostMonitoredMachines.map((machine, index) => (
                <div key={machine.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                      <span className="text-blue-600 font-bold text-sm">{index + 1}</span>
                    </div>
                    <span className="font-medium text-gray-800">{machine.name}</span>
                  </div>
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-semibold">{machine.count} events</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Status Distribution */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 flex flex-col items-center justify-center">
            <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CheckCircle className="mr-2 text-blue-600" /> Status Distribution
            </h3>
            {statusDistributionData.length > 0 ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statusDistributionData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" nameKey="name" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e7ff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "10px",
                      }}
                      formatter={(value: number) => [`${value} events`, "Count"]}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-center text-gray-500 mt-4 text-sm">No data for status distribution.</p>
            )}
          </motion.div>
        </div>

        {/* Monitoring Trend - STYLE BARU */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
            <TrendingUp className="mr-2 text-blue-600" /> Monitoring Trend Over Time
          </h3>
          {monitoringTrendData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monitoringTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                  <Tooltip
                    cursor={{ fill: "rgba(239, 246, 255, 0.7)" }}
                    contentStyle={{
                      backgroundColor: "#fff",
                      border: "1px solid #e0e7ff",
                      borderRadius: "8px",
                      boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                      padding: "10px",
                    }}
                  />
                  <Line type="monotone" dataKey="Monitoring Events" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 mt-4 text-sm">No data for monitoring trend.</p>
          )}
        </motion.div>

        {/* Machine Selection for Detailed Analysis */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white rounded-2xl shadow-md p-8 border border-blue-50">
          <div className="text-center">
            <TrendingUp className="mx-auto text-gray-300 mb-4" size={64} />
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Detailed Trend Analysis</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {records.length === 0 ? "No monitoring data available for analysis." : "Select a machine and monitoring item to visualize trends and analyze performance patterns over time."}
            </p>
          </div>

          {records.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Select Machine</label>
                <select
                  value={selectedMachine}
                  onChange={(e) => {
                    console.log("Machine selected:", e.target.value);
                    setSelectedMachine(e.target.value);
                    setSelectedItem(""); // Reset item ketika machine berubah
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900"
                >
                  <option value="">Choose machine...</option>
                  {machines.slice(1).map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {selectedMachine && <p className="text-xs text-gray-500 mt-1">{items.length - 1} item(s) available for this machine</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-900">Select Item</label>
                <select
                  value={selectedItem}
                  onChange={(e) => {
                    console.log("Item selected:", e.target.value);
                    setSelectedItem(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-gray-900 disabled:opacity-50"
                  disabled={!selectedMachine}
                >
                  <option value="">{selectedMachine ? (items.length > 1 ? "Choose item..." : "No items available") : "Select machine first"}</option>
                  {items.slice(1).map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
                {selectedItem && <p className="text-xs text-gray-500 mt-1">{trendData.length} data point(s) available for analysis</p>}
              </div>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  // Jika sudah memilih machine dan item, tapi tidak ada data numerik
  if (trendData.length === 0) {
    return (
      <div className="space-y-6 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Trend Analysis</h3>
        <div className="text-center py-12">
          <Info className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-600 text-lg mb-2">No numeric data available for analysis</p>
          <p className="text-gray-400 text-sm mb-4">
            The selected item "{selectedItem}" for machine "{selectedMachine}" doesn't have numeric monitoring results.
          </p>
          <p className="text-gray-400 text-xs">Monitoring results must be numeric values (numbers) for trend analysis.</p>
          <button
            onClick={() => {
              setSelectedMachine("");
              setSelectedItem("");
            }}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Select Different Machine/Item
          </button>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="space-y-6 bg-white rounded-2xl shadow-sm p-8 border border-gray-100">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Trend Analysis</h3>
        <div className="text-center py-12">
          <AlertTriangle className="mx-auto text-yellow-500 mb-4" size={48} />
          <p className="text-gray-600 text-lg mb-2">Unable to analyze data</p>
          <p className="text-gray-400 text-sm">There was an error processing the data for analysis.</p>
        </div>
      </div>
    );
  }

  // TAMPILAN DETAIL TREND ANALYSIS DENGAN STYLE BARU
  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Trend Analysis</h3>
            <p className="text-gray-600">
              {selectedMachine} • {selectedItem}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={selectedMachine}
              onChange={(e) => {
                setSelectedMachine(e.target.value);
                setSelectedItem("");
              }}
              className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900"
            >
              {machines.slice(1).map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>

            <select value={selectedItem} onChange={(e) => setSelectedItem(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm text-gray-900">
              {items.slice(1).map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics - STYLE BARU */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
        >
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Data Points</p>
              <p className="text-3xl font-bold text-gray-900">{analysis.count}</p>
            </div>
            <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
              <Clipboard className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
        >
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Average Value</p>
              <p className="text-3xl font-bold text-gray-900">{analysis.mean.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-2 rounded-full bg-green-50 text-green-600 text-2xl opacity-90 transition-all duration-200">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
          className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
        >
          <div className="flex items-center justify-between z-10 relative">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Standard Deviation</p>
              <p className="text-3xl font-bold text-gray-900">{analysis.stdDev.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-2 rounded-full bg-purple-50 text-purple-600 text-2xl opacity-90 transition-all duration-200">
              <Activity className="w-6 h-6" />
            </div>
          </div>
        </motion.div>
      </div>

      {/* Trend Visualization - STYLE BARU */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <TrendingUp className="mr-2 text-blue-600" /> Trend Visualization
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis dataKey="dateString" tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
              <YAxis tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
              <Tooltip
                cursor={{ fill: "rgba(239, 246, 255, 0.7)" }}
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e0e7ff",
                  borderRadius: "8px",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                  padding: "10px",
                }}
                formatter={(value: number) => [value, "Value"]}
              />
              <Line type="monotone" dataKey="result" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Statistical Summary - STYLE BARU */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
          <BarChart2 className="mr-2 text-blue-600" /> Statistical Summary
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Minimum</p>
            <p className="text-xl font-bold text-gray-900">{analysis.min.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Maximum</p>
            <p className="text-xl font-bold text-gray-900">{analysis.max.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Median</p>
            <p className="text-xl font-bold text-gray-900">{analysis.median.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-2">Range</p>
            <p className="text-xl font-bold text-gray-900">{analysis.range.toLocaleString(undefined, { maximumFractionDigits: 2 })}</p>
          </div>
        </div>
      </motion.div>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 overflow-hidden">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Raw Data ({trendData.length} records)</h4>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Notes</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {trendData.map((data, index) => (
                <tr key={index} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{data.dateString}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{data.result.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        data.msStatus === "MS" ? "bg-green-100 text-green-800" : data.msStatus === "TMS" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {data.msStatus || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">{data.notes || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export const MaintenanceRecordsContext = React.createContext<
  | {
      records: MaintenanceTaskRecord[];
      setRecords: React.Dispatch<React.SetStateAction<MaintenanceTaskRecord[]>>;
      routineSchedules: RoutineSchedule[];
    }
  | undefined
>(undefined);

const Step1DateRange: React.FC<Step1DateRangeProps> = ({ formData, setFormData }) => (
  <div>
    <label htmlFor="start-date" className="block text-sm font-medium text-gray-700">
      Start Date
    </label>
    <input
      type="date"
      id="start-date"
      value={formData.startDate ? formData.startDate.toISOString().split("T")[0] : ""}
      onChange={(e) => setFormData({ ...formData, startDate: e.target.value ? new Date(e.target.value) : null })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
    />

    <label htmlFor="end-date" className="block text-sm font-medium text-gray-700 mt-4">
      End Date
    </label>
    <input
      type="date"
      id="end-date"
      value={formData.endDate ? formData.endDate.toISOString().split("T")[0] : ""}
      onChange={(e) => setFormData({ ...formData, endDate: e.target.value ? new Date(e.target.value) : null })}
      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm p-2.5"
      min={formData.startDate ? formData.startDate.toISOString().split("T")[0] : undefined}
    />
  </div>
);

const Step2Units: React.FC<Step2UnitsProps> = ({ formData, setFormData, availableUnits }) => {
  const handleUnitSelection = (unitId: string, isSelected: boolean): void => {
    setFormData((prev) => {
      const newSelectedUnits = isSelected ? [...prev.selectedUnits, { id: unitId, name: availableUnits.find((u) => u.id === unitId)?.name || "", machines: [] }] : prev.selectedUnits.filter((u) => u.id !== unitId);
      return { ...prev, selectedUnits: newSelectedUnits };
    });
  };

  return (
    <div>
      <h3 className="text-md font-semibold text-gray-700 mb-4">Select Unit</h3>
      <div className="space-y-2">
        {availableUnits.map((unit) => (
          <div key={unit.id} className="flex items-center">
            <input
              type="checkbox"
              id={`unit-${unit.id}`}
              checked={formData.selectedUnits.some((u) => u.id === unit.id)}
              onChange={(e) => handleUnitSelection(unit.id, e.target.checked)}
              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
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

const Step3MachinesIntervals: React.FC<Step3MachinesIntervalsProps> = ({ formData, setFormData, availableUnits, routineSchedules }) => {
  const handleMachineSelection = (unitId: string, machine: Machine, isSelected: boolean): void => {
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

  const handleIntervalChange = (unitId: string, machineId: string, interval: AddIntervalType): void => {
    setFormData((prev) => {
      const unitIndex = prev.selectedUnits.findIndex((u) => u.id === unitId);
      if (unitIndex === -1) return prev;

      const machineIndex = prev.selectedUnits[unitIndex].machines.findIndex((m) => m.id === machineId);
      if (machineIndex === -1) return prev;

      const updatedUnits = [...prev.selectedUnits];
      const machineToUpdate = updatedUnits[unitIndex].machines[machineIndex];
      machineToUpdate.selectedInterval = interval;

      const normalizedSelectedInterval = normalizeIntervalType(interval);

      const itemsForInterval = routineSchedules
        .filter((s) => s.mesin === machineToUpdate.name && normalizeIntervalType(s.interval) === normalizedSelectedInterval && s.unitWilayah === updatedUnits[unitIndex].name)
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
      {formData.selectedUnits.length === 0 && <p className="text-gray-500 text-center">Select a unit in the previous step.</p>}
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
                    >
                      <option value="">Select Interval</option>
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

const Step4ItemsPerMachine: React.FC<Step4ItemsPerMachineProps> = ({ formData, setFormData, routineSchedules }) => {
  return (
    <div className="space-y-6">
      {formData.selectedUnits.length === 0 && <p className="text-gray-500 text-center">Select units and machines in previous steps.</p>}
      {formData.selectedUnits.map((selectedUnit) => (
        <div key={selectedUnit.id} className="p-4 border rounded-md bg-gray-50">
          <h4 className="text-lg font-bold text-gray-800 mb-4">Unit: {selectedUnit.name}</h4>
          {selectedUnit.machines.length === 0 && <p className="text-gray-500">Select machines for this unit in the previous step.</p>}
          {selectedUnit.machines.map((selectedMachine) => {
            const itemsToDisplay = selectedMachine.selectedItems;

            return (
              <div key={selectedMachine.id} className="mb-6 p-3 border rounded-md bg-white shadow-sm">
                <h5 className="text-md font-bold text-gray-700 mb-3">
                  Machine: {selectedMachine.name} (Interval: {selectedMachine.selectedInterval || "Not Selected"})
                </h5>
                {selectedMachine.selectedInterval === null && <p className="text-red-500 text-sm mb-2">Select an interval for this machine in the previous step.</p>}
                {itemsToDisplay.length === 0 && selectedMachine.selectedInterval !== null && <p className="text-gray-500 text-sm">No matching items for the selected interval.</p>}
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

interface DailyScheduleListModalProps {
  isOpen: boolean;
  onClose: () => void;
  schedules: MaintenanceTaskRecord[];
  onSelectSchedule: (record: MaintenanceTaskRecord) => void;
  titleDate: string;
}

const DailyScheduleListModal: React.FC<DailyScheduleListModalProps> = ({ isOpen, onClose, schedules, onSelectSchedule, titleDate }) => {
  const handleSelectAndClose = (record: MaintenanceTaskRecord): void => {
    onSelectSchedule(record);
  };

  // Kelompokkan schedules berdasarkan scheduleId
  const schedulesByGroup = schedules.reduce(
    (acc, schedule) => {
      const scheduleId = String(schedule.scheduleId || "unknown");
      if (!acc[scheduleId]) {
        acc[scheduleId] = {
          scheduleId: scheduleId,
          machine: schedule.mesin,
          unit: schedule.unitWilayah,
          interval: schedule.interval,
          items: [],
        };
      }
      acc[scheduleId].items.push(schedule);
      return acc;
    },
    {} as Record<
      string,
      {
        scheduleId: string;
        machine: string;
        unit: string;
        interval: string;
        items: MaintenanceTaskRecord[];
      }
    >
  );

  // Komponen Status Badge yang lebih modern
  const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const statusConfig = {
      New: { color: "bg-blue-100 text-blue-800 border-blue-200", icon: "🆕" },
      "On Progress": { color: "bg-yellow-100 text-yellow-800 border-yellow-200", icon: "⏳" },
      Done: { color: "bg-green-100 text-green-800 border-green-200", icon: "✅" },
      Cancelled: { color: "bg-red-100 text-red-800 border-red-200", icon: "❌" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig["New"];

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${config.color}`}>
        <span className="text-xs">{config.icon}</span>
        {status}
      </span>
    );
  };

  // Komponen MS Status Badge
  const MSStatusBadge: React.FC<{ status: string }> = ({ status }) => {
    const config = {
      MS: { color: "bg-green-100 text-green-800 border-green-200", label: "Within Standard" },
      TMS: { color: "bg-red-100 text-red-800 border-red-200", label: "Out of Standard" },
      "N/A": { color: "bg-gray-100 text-gray-800 border-gray-200", label: "Not Applicable" },
    }[status] || { color: "bg-gray-100 text-gray-800 border-gray-200", label: status };

    return <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${config.color}`}>{config.label}</span>;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Schedules for ${new Date(titleDate).toLocaleDateString("en-US", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      })}`}
      className="max-w-4xl"
      maxWidth="max-w-4xl"
    >
      <div className="space-y-6">
        {/* Header Summary */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Daily Overview</h3>
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {schedules.length} total items
                </span>
                <span className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  {Object.keys(schedulesByGroup).length} schedules
                </span>
              </div>
            </div>
            <div className="flex gap-2">
              {Object.values(schedulesByGroup).some((group) => group.items.some((item) => item.scheduleStatus === "Done")) && <StatusBadge status="Done" />}
              {Object.values(schedulesByGroup).some((group) => group.items.some((item) => item.scheduleStatus === "On Progress")) && <StatusBadge status="On Progress" />}
              {Object.values(schedulesByGroup).some((group) => group.items.some((item) => item.scheduleStatus === "New")) && <StatusBadge status="New" />}
            </div>
          </div>
        </div>

        {schedules.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Calendar className="text-gray-400 text-2xl" />
            </div>
            <p className="text-gray-600 text-lg font-medium mb-2">No schedules for this date</p>
            <p className="text-gray-400 text-sm">There are no maintenance schedules scheduled for this day.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {Object.values(schedulesByGroup).map((group) => (
              <motion.div key={group.scheduleId} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
                {/* Group Header */}
                <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-100">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{group.machine}</h4>
                        {/* Overall group status jika semua item memiliki status sama */}
                        {group.items.every((item) => item.scheduleStatus === group.items[0].scheduleStatus) && <StatusBadge status={group.items[0].scheduleStatus || "New"} />}
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <span className="flex items-center gap-1.5">
                          <Clipboard className="w-4 h-4" />
                          {group.items.length} item{group.items.length > 1 ? "s" : ""}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          {group.interval}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Package className="w-4 h-4" />
                          {group.unit}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="divide-y divide-gray-100">
                  {group.items.map((schedule, index) => (
                    <motion.button
                      key={`${schedule.id}-${index}`}
                      whileHover={{
                        backgroundColor: "rgba(239, 246, 255, 0.5)",
                        scale: 1.005,
                      }}
                      whileTap={{ scale: 0.995 }}
                      onClick={() => handleSelectAndClose(schedule)}
                      className="w-full text-left p-6 transition-all duration-200 flex justify-between items-start gap-4"
                    >
                      <div className="flex-1 min-w-0">
                        {/* Item Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h5 className="text-base font-semibold text-gray-900 mb-1">{schedule.item}</h5>
                            <div className="flex flex-wrap gap-2">
                              <StatusBadge status={schedule.scheduleStatus || "New"} />
                              {schedule.monitoringResult && schedule.monitoringResult !== "N/A" && (
                                <span className="inline-flex items-center px-2.5 py-1 bg-purple-100 text-purple-800 rounded-lg text-xs font-medium border border-purple-200">📊 Result: {schedule.monitoringResult}</span>
                              )}
                            </div>
                          </div>
                          <MSStatusBadge status={schedule.msStatus} />
                        </div>

                        {/* Item Details */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                          {schedule.standardMin !== null && schedule.standardMax !== null && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">Standard:</span>
                              <span>
                                {schedule.standardMin} - {schedule.standardMax}
                              </span>
                            </div>
                          )}
                          {schedule.unitOfMeasure && schedule.unitOfMeasure !== "N/A" && (
                            <div className="flex items-center gap-2 text-gray-600">
                              <span className="font-medium">Unit:</span>
                              <span>{schedule.unitOfMeasure}</span>
                            </div>
                          )}
                          {schedule.notes && schedule.notes !== "N/A" && (
                            <div className="md:col-span-2 flex items-start gap-2 text-gray-600">
                              <span className="font-medium mt-0.5">Notes:</span>
                              <span className="flex-1">{schedule.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action Arrow */}
                      <div className="flex-shrink-0">
                        <div className="p-2 rounded-lg bg-blue-50 text-blue-600">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end pt-4 border-t border-gray-100">
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose} className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-semibold text-sm">
            Close
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

// Fungsi untuk mendapatkan badge color berdasarkan status individual
const getStatusBadgeColor = (status: string = "New"): string => {
  switch (status) {
    case "New":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "On Progress":
      return "bg-yellow-100 text-yellow-800 border-yellow-200";
    case "Done":
      return "bg-green-100 text-green-800 border-green-200";
    case "Cancelled":
      return "bg-red-100 text-red-800 border-red-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
  }
};

const MonitoringMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const { getMonitoringSchedules, getAllMasterMonitoring, getMonitoringScheduleById } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceTaskRecord | null>(null);
  const [viewMode, setViewMode] = useState<"calendar" | "table" | "trend">("calendar");
  const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
  const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
  const [selectedUnit, setSelectedUnit] = useState<string[]>([]);
  const [selectedMachine, setSelectedMachine] = useState<string[]>([]);
  const [selectedItem, setSelectedItem] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [schedules, setSchedules] = useState<MonitoringSchedule[]>([]);
  const [masterMonitoringData, setMasterMonitoringData] = useState<UnitWithMachines[]>([]);
  const [intervals, setIntervals] = useState<MonitoringInterval[]>([]);

  const [addForm, setAddForm] = useState<AddFormData>({
    startDate: null,
    endDate: null,
    selectedUnits: [],
  });

  const [showDailyScheduleModal, setShowDailyScheduleModal] = useState<boolean>(false);
  const [dailySchedulesForSelectedDate, setDailySchedulesForSelectedDate] = useState<MaintenanceTaskRecord[]>([]);
  const [selectedDateForDailySchedules, setSelectedDateForDailySchedules] = useState<string>("");

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [selectedStatus, setSelectedStatus] = useState<string[]>([]);
  const [selectedInterval, setSelectedInterval] = useState<string[]>([]);

  const [showIntervalFilterDropdown, setShowIntervalFilterDropdown] = useState(false);

  const [showStatusFilterDropdown, setShowStatusFilterDropdown] = useState(false);
  const statusFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [showMachineFilterDropdown, setShowMachineFilterDropdown] = useState(false);
  const machineFilterDropdownRef = useRef<HTMLDivElement>(null);
  const [showUnitFilterDropdown, setShowUnitFilterDropdown] = useState(false);
  const unitFilterDropdownRef = useRef<HTMLDivElement>(null);

  // Options untuk filter
  const statusOptions = useMemo(
    () => [
      { value: "MS", label: "MS" },
      { value: "TMS", label: "TMS" },
      { value: "N/A", label: "N/A" },
    ],
    []
  );

  const intervalOptions = useMemo(
    () => [
      { value: "Daily", label: "Daily" },
      { value: "Weekly", label: "Weekly" },
      { value: "Monthly", label: "Monthly" },
      { value: "3 Months", label: "3 Months" },
      { value: "6 Months", label: "6 Months" },
      { value: "1 Year", label: "1 Year" },
    ],
    []
  );

  // Convert API schedules to RoutineSchedule format
  const routineSchedules: RoutineSchedule[] = useMemo(() => {
    return schedules.map((schedule): RoutineSchedule => {
      const machine = masterMonitoringData.flatMap((unit) => unit.mesin).find((m) => m.id === schedule.id_mesins);
      const machineName = machine?.name || `Machine ${schedule.id_mesins}`;

      const intervalType = schedule.monitoring_interval?.type_interval || "weekly";

      return {
        id: `schedule-${schedule.id_monitoring_schedule}`,
        mesin: machineName,
        item: "", // This would need to come from item_mesin data
        interval: intervalType as RoutineSchedule["interval"],
        unitWilayah: schedule.unit,
        unitOfMeasure: "N/A",
        standardMin: null,
        standardMax: null,
        standartVisual: "N/A",
      };
    });
  }, [schedules, masterMonitoringData]);

  const convertApiDataToRecords = useCallback((schedulesData: MonitoringSchedule[], activitiesData: MonitoringActivity[], masterData: UnitWithMachines[]): MaintenanceTaskRecord[] => {
    const records: MaintenanceTaskRecord[] = [];

    schedulesData.forEach((schedule) => {
      const machine = masterData.flatMap((unit) => unit.mesin).find((m) => m.id === schedule.id_mesins);
      const machineName = machine?.name || `Machine ${schedule.id_mesins}`;

      const intervalType = schedule.monitoring_interval?.type_interval || "weekly";
      const intervalDisplay =
        intervalType === "weekly" ? "Weekly" : intervalType === "monthly" ? "Monthly" : intervalType === "quarterly" ? "3 Months" : intervalType === "semi-annual" ? "6 Months" : intervalType === "yearly" ? "1 Year" : "Daily";

      // PERBAIKAN: Gunakan item_mesins dari schedule jika ada, jika tidak gunakan dari machine
      const itemsToMonitor = schedule.item_mesins && schedule.item_mesins.length > 0 ? schedule.item_mesins : machine?.item_mesin || [];

      // PERBAIKAN: Jika ada monitoring activities, buat record untuk setiap aktivitas
      if (schedule.monitoring_activities && schedule.monitoring_activities.length > 0) {
        schedule.monitoring_activities.forEach((activity) => {
          // Cari item mesin yang sesuai dengan aktivitas
          const itemMesin = itemsToMonitor.find((item) => item.id === activity.id_item_mesin);

          // Jika itemMesin tidak ditemukan, coba cari di semua mesin dari master data
          let finalItemMesin = itemMesin;
          if (!finalItemMesin) {
            // Cari di semua mesin dari master data
            for (const unit of masterData) {
              for (const m of unit.mesin) {
                const foundItem = m.item_mesin?.find((item) => item.id === activity.id_item_mesin);
                if (foundItem) {
                  finalItemMesin = foundItem;
                  break;
                }
              }
              if (finalItemMesin) break;
            }
          }

          // Jika masih tidak ditemukan, gunakan data default
          if (!finalItemMesin) {
            console.warn(`Item mesin not found for activity ${activity.id_monitoring_activity}, item_mesin_id: ${activity.id_item_mesin}`);
            finalItemMesin = {
              id: activity.id_item_mesin,
              item_mesin: "Unknown Item",
              satuan: "N/A",
              standard_min: null,
              standard_max: null,
              standard_visual: "N/A",
              interval_id: 1,
              mesin_id: schedule.id_mesins,
              created_at: "",
              updated_at: "",
            };
          }

          // Tentukan MS Status berdasarkan hasil_ms_tms
          let msStatus: "MS" | "TMS" | "N/A" = "N/A";
          if (activity.hasil_ms_tms === "ms") {
            msStatus = "MS";
          } else if (activity.hasil_ms_tms === "tms") {
            msStatus = "TMS";
          }

          // PERBAIKAN PENTING: Handle numeric values properly
          let monitoringResultValue = activity.hasil_monitoring || "N/A";

          // Cek jika hasil_monitoring adalah string numerik
          if (activity.hasil_monitoring && activity.hasil_monitoring !== "N/A") {
            // Coba parse sebagai number
            const numericValue = parseFloat(activity.hasil_monitoring);
            if (!isNaN(numericValue) && isFinite(numericValue)) {
              monitoringResultValue = numericValue.toString();
            }
          }

          records.push({
            id: `activity-${activity.id_monitoring_activity}`,
            mesin: machineName,
            date: activity.tgl_monitoring,
            interval: intervalDisplay,
            unitWilayah: schedule.unit,
            item: finalItemMesin.item_mesin || "Unknown Item",
            unitOfMeasure: finalItemMesin.satuan || "N/A",
            standardMin: finalItemMesin.standard_min ? parseFloat(finalItemMesin.standard_min) : null,
            standardMax: finalItemMesin.standard_max ? parseFloat(finalItemMesin.standard_max) : null,
            standartVisual: finalItemMesin.standard_visual || "N/A",
            monitoringResult: monitoringResultValue,
            msStatus: msStatus,
            notes: activity.hasil_keterangan || "N/A",
            perbaikanPerawatan: "Preventive",
            description: `Monitoring activity for ${machineName}`,
            pic: "System",
            shift: "N/A",
            group: "N/A",
            stopJam: 0,
            stopMenit: 0,
            startJam: 0,
            startMenit: 0,
            stopTime: "N/A",
            unit: schedule.unit,
            runningHour: 0,
            itemTrouble: "N/A",
            jenisGangguan: "N/A",
            bentukTindakan: "N/A",
            rootCause: "N/A",
            jenisAktivitas: "Monitoring",
            kegiatan: "Routine inspection",
            kodePart: "N/A",
            sparePart: "N/A",
            idPart: "N/A",
            jumlah: 0,
            unitSparePart: "N/A",
            scheduleId: schedule.id_monitoring_schedule,
            scheduleStatus: schedule.status || "New",
          });
        });
      } else {
        // Untuk schedule tanpa aktivitas, buat record scheduled
        itemsToMonitor.forEach((itemMesin) => {
          records.push({
            id: `schedule-${schedule.id_monitoring_schedule}-scheduled-${itemMesin.id}`,
            mesin: machineName,
            date: schedule.tgl_start,
            interval: intervalDisplay,
            unitWilayah: schedule.unit,
            item: itemMesin.item_mesin || "Unknown Item",
            unitOfMeasure: itemMesin.satuan || "N/A",
            standardMin: itemMesin.standard_min ? parseFloat(itemMesin.standard_min) : null,
            standardMax: itemMesin.standard_max ? parseFloat(itemMesin.standard_max) : null,
            standartVisual: itemMesin.standard_visual || "N/A",
            monitoringResult: "N/A",
            msStatus: "N/A",
            notes: "Scheduled monitoring - Not yet performed",
            perbaikanPerawatan: "Preventive",
            description: `Scheduled monitoring for ${machineName}`,
            pic: "N/A",
            shift: "N/A",
            group: "N/A",
            stopJam: 0,
            stopMenit: 0,
            startJam: 0,
            startMenit: 0,
            stopTime: "N/A",
            unit: schedule.unit,
            runningHour: 0,
            itemTrouble: "N/A",
            jenisGangguan: "N/A",
            bentukTindakan: "N/A",
            rootCause: "N/A",
            jenisAktivitas: "Monitoring",
            kegiatan: "Routine inspection",
            kodePart: "N/A",
            sparePart: "N/A",
            idPart: "N/A",
            jumlah: 0,
            unitSparePart: "N/A",
            scheduleId: schedule.id_monitoring_schedule,
            scheduleStatus: schedule.status || "New",
          });
        });
      }
    });

    console.log("Converted records:", records.length);
    console.log("Sample converted records:", records.slice(0, 5));

    // Debug: Tampilkan records dengan data numerik
    const numericRecords = records.filter((r) => r.monitoringResult && r.monitoringResult !== "N/A" && !isNaN(parseFloat(r.monitoringResult)));
    console.log("Numeric records available:", numericRecords.length);
    console.log("Numeric records sample:", numericRecords.slice(0, 3));

    return records;
  }, []);

  const [records, setRecords] = useState<MaintenanceTaskRecord[]>([]);

  const CACHE_DURATION = 5 * 60 * 1000; // 5 menit

  // Tambahkan state untuk cache
  const [dataCache, setDataCache] = useState<{
    schedules: MonitoringSchedule[];
    masterData: AllMasterMonitoring;
    timestamp: number;
  } | null>(null);

  // Modifikasi useEffect menjadi:
  // Modifikasi useEffect menjadi:
  useEffect(() => {
    let isMounted = true;
    const abortController = new AbortController();

    const fetchData = async (): Promise<void> => {
      if (!isMounted) return;

      // Cek cache terlebih dahulu
      const now = Date.now();
      if (dataCache && now - dataCache.timestamp < CACHE_DURATION) {
        setSchedules(dataCache.schedules);
        setMasterMonitoringData(dataCache.masterData.unitsWithMachines || []);
        setIntervals(dataCache.masterData.intervals || []);

        // Process records langsung dari cache
        const convertedRecords = convertApiDataToRecords(
          dataCache.schedules,
          [], // Tidak perlu activities terpisah
          dataCache.masterData.unitsWithMachines || []
        );
        setRecords(convertedRecords);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const [schedulesData, masterData] = await Promise.all([getMonitoringSchedules(), getAllMasterMonitoring()]);

        if (!isMounted) return;

        // Debug: Lihat struktur data
        console.log("Schedules data:", schedulesData);
        console.log("Master data:", masterData);
        console.log("Units with machines:", masterData.unitsWithMachines);

        if (masterData.unitsWithMachines && masterData.unitsWithMachines.length > 0) {
          console.log("Sample machine items:", masterData.unitsWithMachines[0]?.mesin?.[0]?.item_mesin);
        }

        // Update cache
        setDataCache({
          schedules: schedulesData,
          masterData: masterData,
          timestamp: now,
        });

        setSchedules(schedulesData);
        setMasterMonitoringData(masterData.unitsWithMachines || []);
        setIntervals(masterData.intervals || []);

        // Konversi langsung dari schedulesData tanpa fetch tambahan
        const convertedRecords = convertApiDataToRecords(
          schedulesData,
          [], // Tidak perlu activities terpisah
          masterData.unitsWithMachines || []
        );
        setRecords(convertedRecords);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to fetch data");
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
      abortController.abort();
    };
  }, [getMonitoringSchedules, getAllMasterMonitoring, convertApiDataToRecords, dataCache]);

  const dummyUser = {
    name: "John Doe",
    role: "Unit Head Engineering",
  };

  const uniqueUnits = useMemo(() => ["", ...new Set(records.map((r) => r.unitWilayah))], [records]);
  const uniqueMachines = useMemo(() => ["", ...new Set(records.map((r) => r.mesin))], [records]);
  const uniqueItems = useMemo(() => ["", ...new Set(records.map((r) => r.item))], [records]);

  const filteredRecords = useMemo(() => {
    if (records.length === 0) return [];

    let filtered = records;

    // Search filter
    if (searchTerm) {
      const lowerCaseSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter((record) => record.mesin.toLowerCase().includes(lowerCaseSearchTerm) || record.item.toLowerCase().includes(lowerCaseSearchTerm) || record.unitWilayah.toLowerCase().includes(lowerCaseSearchTerm));
      if (filtered.length === 0) return [];
    }

    // Date filter
    if (filterStartDate && filterEndDate) {
      const start = filterStartDate.toISOString().split("T")[0];
      const end = filterEndDate.toISOString().split("T")[0];
      filtered = filtered.filter((record) => record.date >= start && record.date <= end);
      if (filtered.length === 0) return [];
    }

    // Multi-select filters menggunakan array
    if (selectedStatus.length > 0) {
      const statusSet = new Set(selectedStatus);
      filtered = filtered.filter((record) => statusSet.has(record.msStatus));
      if (filtered.length === 0) return [];
    }

    if (selectedUnit.length > 0) {
      const unitSet = new Set(selectedUnit);
      filtered = filtered.filter((record) => unitSet.has(record.unitWilayah));
      if (filtered.length === 0) return [];
    }

    if (selectedMachine.length > 0) {
      const machineSet = new Set(selectedMachine);
      filtered = filtered.filter((record) => machineSet.has(record.mesin));
      if (filtered.length === 0) return [];
    }

    return filtered;
  }, [records, filterStartDate, filterEndDate, selectedStatus, selectedUnit, selectedMachine, searchTerm]);

  useEffect(() => {
    const handleResize = (): void => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent): void => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      // Close status filter dropdown if clicked outside
      if (statusFilterDropdownRef.current && !statusFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".status-filter-toggle")) {
        setShowStatusFilterDropdown(false);
      }

      // Close machine filter dropdown if clicked outside
      if (machineFilterDropdownRef.current && !machineFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".machine-filter-toggle")) {
        setShowMachineFilterDropdown(false);
      }

      // Close unit filter dropdown if clicked outside
      if (unitFilterDropdownRef.current && !unitFilterDropdownRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".unit-filter-toggle")) {
        setShowUnitFilterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const toggleSidebar = (): void => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleViewRecord = (record: MaintenanceTaskRecord): void => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  const handleAddRecord = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    try {
      // Implementation for adding records would go here
      // This would typically involve API calls to add monitoring schedules/activities
      setShowAddModal(false);
      setAddForm({
        startDate: null,
        endDate: null,
        selectedUnits: [],
      });
      setCurrentStep(1);
    } catch (err) {
      console.error("Failed to add monitoring records:", err);
      setError("Failed to add data. Please try again.");
    }
  };

  const handleUpdateRecord = useCallback((updatedRecord: MaintenanceTaskRecord): void => {
    setRecords((prevRecords) => prevRecords.map((record) => (record.id === updatedRecord.id ? updatedRecord : record)));
  }, []);

  const handleClearFilter = (): void => {
    setFilterStartDate(null);
    setFilterEndDate(null);
    setSelectedUnit([]);
    setSelectedMachine([]);
    setSelectedItem([]);
    setSearchTerm("");
  };

  const getDaysInMonth = (year: number, month: number): number => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number): number => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1;
  };

  const today = useMemo(() => new Date(), []);

  const [currentCalendarDate, setCurrentCalendarDate] = useState<Date>(today);

  const goToPreviousMonth = (): void => {
    setCurrentCalendarDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const goToNextMonth = (): void => {
    setCurrentCalendarDate((prev: Date) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const goToCurrentMonth = (): void => {
    setCurrentCalendarDate(new Date());
  };

  const handleOpenDailyScheduleModal = (schedules: MaintenanceTaskRecord[], date: string): void => {
    setDailySchedulesForSelectedDate(schedules);
    setSelectedDateForDailySchedules(date);
    setShowDailyScheduleModal(true);
  };

  const handleNavigateToEditForm = (record: MaintenanceTaskRecord): void => {
    console.log("Navigating with record:", record);

    let scheduleId;

    // Prioritaskan menggunakan scheduleId jika ada
    if (record.scheduleId) {
      scheduleId = record.scheduleId;
    }
    // Fallback ke parsing ID jika scheduleId tidak ada
    else if (record.id.startsWith("schedule-")) {
      // Extract ID dari format "schedule-{id}-..."
      const idParts = record.id.split("-");
      if (idParts.length >= 2) {
        scheduleId = idParts[1]; // Ambil bagian setelah "schedule-"
      }
    }
    // Untuk activity, coba ambil dari ID
    else if (record.id.startsWith("activity-")) {
      const idParts = record.id.split("-");
      if (idParts.length >= 2) {
        // Cari bagian yang berisi angka (ID schedule)
        for (let part of idParts) {
          if (/^\d+$/.test(part)) {
            scheduleId = part;
            break;
          }
        }
      }
    }

    if (!scheduleId) {
      console.error("Could not extract schedule ID from record:", record);
      alert("Error: Could not determine schedule ID");
      return;
    }

    console.log("Navigating to schedule ID:", scheduleId);
    navigate(`/monitoringmaintenance/detailmonitoringmaintenance/${scheduleId}`);
    setShowDailyScheduleModal(false);
  };

  const renderCalendarDays = (): React.ReactNode[] => {
    const year = currentCalendarDate.getFullYear();
    const month = currentCalendarDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfWeekOfMonth = getFirstDayOfMonth(year, month);

    const calendarRows: React.ReactNode[] = [];
    let dayCounter = 1;
    let weekDays: React.ReactNode[] = [];
    let currentWeekStartDate: Date | null = null;

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDayOfWeekOfMonth; i++) {
      weekDays.push(
        <div key={`empty-pre-${i}`} className="p-3 rounded-xl bg-gray-50 border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
          <span className="text-sm text-gray-400">-</span>
        </div>
      );
    }

    while (dayCounter <= daysInMonth) {
      const date = new Date(year, month, dayCounter);
      if (!currentWeekStartDate) {
        currentWeekStartDate = date;
      }

      const dateString = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayCounter).padStart(2, "0")}`;

      // Filter records untuk hari ini
      const dayRecords = filteredRecords.filter((record) => record.date === dateString);

      // Kelompokkan records berdasarkan scheduleId
      const schedulesByGroup = dayRecords.reduce((acc, record) => {
        const scheduleId = String(record.scheduleId || "unknown");
        if (!acc[scheduleId]) {
          acc[scheduleId] = {
            scheduleId: scheduleId,
            machine: record.mesin,
            items: [record],
          };
        } else {
          acc[scheduleId].items.push(record);
        }
        return acc;
      }, {} as Record<string, { scheduleId: string; machine: string; items: MaintenanceTaskRecord[] }>);

      const scheduleGroups = Object.values(schedulesByGroup);

      // Tentukan styling berdasarkan status dan apakah hari ini
      const isToday = today.toDateString() === date.toDateString();
      const hasSchedules = scheduleGroups.length > 0;

      // Base classes untuk semua hari
      let cellClasses = `p-3 rounded-xl border-2 min-h-[100px] flex flex-col transition-all duration-200 `;

      // Styling berdasarkan status
      if (isToday) {
        cellClasses += `bg-blue-50 border-blue-200 shadow-sm `;
      } else if (hasSchedules) {
        // Tentukan warna berdasarkan status schedule
        const allStatuses = scheduleGroups.flatMap((group) => group.items.map((item) => item.scheduleStatus || "New"));

        if (allStatuses.includes("Done")) {
          cellClasses += `bg-green-50 border-green-200 `;
        } else if (allStatuses.includes("On Progress")) {
          cellClasses += `bg-yellow-50 border-yellow-200 `;
        } else {
          cellClasses += `bg-blue-50 border-blue-200 `;
        }
      } else {
        cellClasses += `bg-white border-gray-100 hover:border-gray-200 `;
      }

      // Hover effect
      cellClasses += `hover:shadow-md hover:scale-[1.02] cursor-pointer `;

      weekDays.push(
        <motion.div key={dateString} className={cellClasses} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => hasSchedules && handleOpenDailyScheduleModal(dayRecords, dateString)}>
          {/* Date Number */}
          <div className="flex justify-between items-start mb-2">
            <span className={`text-sm font-semibold ${isToday ? "text-blue-600" : hasSchedules ? "text-gray-900" : "text-gray-500"}`}>{dayCounter}</span>
            {isToday && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
          </div>

          {/* Schedule Content */}
          <div className="flex-1 flex flex-col gap-1.5">
            {scheduleGroups.slice(0, 2).map((group, index) => (
              <div
                key={group.scheduleId}
                className={`px-2 py-1.5 rounded-lg text-xs font-medium ${
                  group.items[0].scheduleStatus === "Done"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : group.items[0].scheduleStatus === "On Progress"
                    ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                    : "bg-blue-100 text-blue-800 border border-blue-200"
                }`}
              >
                <div className="font-semibold truncate">{group.machine}</div>
                <div className="text-xs opacity-75 mt-0.5">
                  {group.items.length} item{group.items.length > 1 ? "s" : ""}
                </div>
              </div>
            ))}

            {scheduleGroups.length > 2 && <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium text-center">+{scheduleGroups.length - 2} more</div>}
          </div>
        </motion.div>
      );

      // Week number cell
      if (weekDays.length === 7 || dayCounter === daysInMonth) {
        while (weekDays.length < 7) {
          weekDays.push(
            <div key={`empty-post-${weekDays.length}`} className="p-3 rounded-xl bg-gray-50 border border-gray-100 min-h-[100px] flex flex-col items-center justify-center">
              <span className="text-sm text-gray-400">-</span>
            </div>
          );
        }

        const weekNum = currentWeekStartDate ? getISOWeekNumber(currentWeekStartDate) : null;

        calendarRows.push(
          <React.Fragment key={`week-row-${dayCounter}`}>
            {/* Week Number Cell */}
            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
              <span className="text-sm font-bold text-gray-600">{weekNum !== null ? `${String(weekNum).padStart(2, "0")}` : ""}</span>
            </div>

            {/* Days of the week */}
            {weekDays}
          </React.Fragment>
        );

        weekDays = [];
        currentWeekStartDate = null;
      }
      dayCounter++;
    }

    return calendarRows;
  };

  const notifications = useMemo(() => {
    const pendingApprovalTasks = records.filter((task) => task);

    // HAPUS OVERDUE MONITORING KARENA TIDAK ADA STATUS LAGI
    // const overdueMonitoring = records.filter((task) => task.status === "Missed");

    const newNotifications: Array<{ id: string; icon: React.ReactNode; title: string; description: string; date: string }> = [];

    pendingApprovalTasks.forEach((task) => {
      newNotifications.push({
        id: `approval-${task.id}`,
        icon: <Bell className="text-orange-500" />,
        title: `Approval Needed: ${task.mesin} - ${task.item}`,
        description: `Record for ${task.mesin} - ${task.item} is awaiting your approval ().`,
        date: new Date(task.date).toLocaleDateString("en-US"),
      });
    });

    return newNotifications;
  }, [records, dummyUser.role]);

  // Handler untuk Status multi-select
  const handleStatusCheckboxChange = (statusValue: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedStatus((prev) => [...prev, statusValue]);
    } else {
      setSelectedStatus((prev) => prev.filter((value) => value !== statusValue));
    }
  };

  // Handler untuk Machine multi-select
  const handleMachineCheckboxChange = (machineName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedMachine((prev) => [...prev, machineName]);
    } else {
      setSelectedMachine((prev) => prev.filter((name) => name !== machineName));
    }
  };

  // Handler untuk Unit multi-select
  const handleUnitCheckboxChange = (unitName: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedUnit((prev) => [...prev, unitName]);
    } else {
      setSelectedUnit((prev) => prev.filter((name) => name !== unitName));
    }
  };

  // Handler untuk Interval multi-select
  const handleIntervalCheckboxChange = (intervalValue: string, isChecked: boolean) => {
    if (isChecked) {
      setSelectedInterval((prev) => [...prev, intervalValue]);
    } else {
      setSelectedInterval((prev) => prev.filter((value) => value !== intervalValue));
    }
  };

  const isStep1Complete = addForm.startDate !== null && addForm.endDate !== null;
  const isStep2Complete = addForm.selectedUnits.length > 0;
  const isStep3Complete = addForm.selectedUnits.every((unit) => unit.machines.length > 0 && unit.machines.every((machine) => machine.selectedInterval !== null));
  const isStep4Complete = addForm.selectedUnits.every((unit) => unit.machines.every((machine) => machine.selectedInterval === null || (machine.selectedInterval !== null && machine.selectedItems.length > 0)));

  return (
    <MaintenanceRecordsContext.Provider value={{ records, setRecords, routineSchedules }}>
      <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
        <Sidebar />

        <div className="flex-1 flex flex-col overflow-hidden">
          <PageHeader
            mainTitle="Moninoring Maintenance"
            mainTitleHighlight="Management"
            description="Manage user roles and permissions to control access and functionality within the system."
            icon={<Monitor />}
            isMobile={isMobile}
            toggleSidebar={toggleSidebar}
          />

          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                  Monitoring <span className="text-blue-600">Maintenance</span>
                </h1>
                <p className="text-gray-600 mt-2 text-sm max-w-xl">Monitor and schedule preventive maintenance tasks for all machines, and track their approval progress.</p>
              </div>
              <div className="flex items-center space-x-2">
                <motion.button
                  onClick={() => navigate("/monitoringmaintenance/formmonitoringmaintenance")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold shadow-md hover:bg-blue-700 transition-colors duration-200"
                >
                  <Plus className="w-4 h-4 mr-2" /> Add Schedule
                </motion.button>
                <div className="flex space-x-1 p-1 bg-white rounded-full shadow-sm border border-gray-100">
                  <motion.button
                    onClick={() => setViewMode("calendar")}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "calendar" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Calendar className="w-4 h-4 mr-2" /> Calendar
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("table")}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "table" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <Clipboard className="w-4 h-4 mr-2" /> Table
                  </motion.button>
                  <motion.button
                    onClick={() => setViewMode("trend")}
                    whileTap={{ scale: 0.95 }}
                    className={`flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200 ${viewMode === "trend" ? "bg-blue-600 text-white shadow" : "text-gray-700 hover:bg-gray-100"}`}
                  >
                    <TrendingUp className="w-4 h-4 mr-2" /> Trend
                  </motion.button>
                </div>
              </div>
            </motion.div>
            {loading ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
                <p className="text-gray-600 text-base font-medium">Loading maintenance data...</p>
              </div>
            ) : records.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
                <Info className="text-blue-500 text-4xl mx-auto mb-4" />
                <p className="text-gray-700 text-base font-medium">No monitoring data available.</p>
              </div>
            ) : (
              <AnimatePresence mode="wait">
                <motion.div key={viewMode} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                  {/* Filter Section - Tampilkan selalu ketika ada data */}
                  <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
                    <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
                      <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                          type="text"
                          placeholder="Search by Interval, unit, or machine..."
                          className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          aria-label="Search records"
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
                          className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
                        >
                          {/* Date Range Filter */}
                          <div className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                            <Calendar className="text-gray-500 text-base" />
                            <DatePicker
                              selected={filterStartDate}
                              onChange={(date: Date | null) => setFilterStartDate(date)}
                              selectsStart
                              startDate={filterStartDate}
                              endDate={filterEndDate}
                              placeholderText="Start Date"
                              className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                              dateFormat="dd/MM/yyyy"
                              isClearable
                              aria-label="Start Date"
                            />
                            <span className="text-gray-400">-</span>
                            <DatePicker
                              selected={filterEndDate}
                              onChange={(date: Date | null) => setFilterEndDate(date)}
                              selectsEnd
                              startDate={filterStartDate}
                              endDate={filterEndDate}
                              minDate={filterStartDate || undefined}
                              placeholderText="End Date"
                              className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                              dateFormat="dd/MM/yyyy"
                              isClearable
                              aria-label="End Date"
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
                                title="Clear Dates"
                                aria-label="Clear date range"
                              >
                                <X className="text-base" />
                              </motion.button>
                            )}
                          </div>

                          {/* Status Filter Dropdown */}
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
                              aria-label="Filter by Status"
                            >
                              <span>{selectedStatus.length > 0 ? (selectedStatus.length === statusOptions.length ? "All Status" : `Selected (${selectedStatus.length})`) : "All Status"}</span>
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
                                      checked={selectedStatus.length === statusOptions.length && statusOptions.length > 0}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedStatus(statusOptions.map((opt) => opt.value));
                                        } else {
                                          setSelectedStatus([]);
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
                                        checked={selectedStatus.includes(option.value)}
                                        onChange={(e) => handleStatusCheckboxChange(option.value, e.target.checked)}
                                      />
                                      <span className="ml-2 text-gray-800 text-sm">{option.label}</span>
                                    </label>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Unit Filter Dropdown */}
                          <div ref={unitFilterDropdownRef} className="relative w-full">
                            <button
                              type="button"
                              className="unit-filter-toggle w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left flex justify-between items-center transition-all duration-200 shadow-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowUnitFilterDropdown(!showUnitFilterDropdown);
                              }}
                              aria-expanded={showUnitFilterDropdown}
                              aria-haspopup="true"
                              aria-label="Filter by Unit"
                            >
                              <span>{selectedUnit.length > 0 ? (selectedUnit.length === uniqueUnits.length - 1 ? "All Units" : `Selected (${selectedUnit.length})`) : "All Units"}</span>
                              <ChevronDown className={`transform transition-transform ${showUnitFilterDropdown ? "rotate-180" : "rotate-0"} text-gray-500 text-base`} />
                            </button>
                            <AnimatePresence>
                              {showUnitFilterDropdown && (
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
                                      checked={selectedUnit.length === uniqueUnits.length - 1 && uniqueUnits.length > 1}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedUnit(uniqueUnits.slice(1)); // Exclude empty string
                                        } else {
                                          setSelectedUnit([]);
                                        }
                                      }}
                                    />
                                    <span className="ml-2 text-gray-800 font-semibold text-sm">Select All</span>
                                  </label>
                                  {uniqueUnits.slice(1).map((unit) => (
                                    <label key={unit} className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer" role="option">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        checked={selectedUnit.includes(unit)}
                                        onChange={(e) => handleUnitCheckboxChange(unit, e.target.checked)}
                                      />
                                      <span className="ml-2 text-gray-800 text-sm">{unit}</span>
                                    </label>
                                  ))}
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          {/* Machine Filter Dropdown */}
                          <div ref={machineFilterDropdownRef} className="relative w-full">
                            <button
                              type="button"
                              className="machine-filter-toggle w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm text-left flex justify-between items-center transition-all duration-200 shadow-sm cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                setShowMachineFilterDropdown(!showMachineFilterDropdown);
                              }}
                              aria-expanded={showMachineFilterDropdown}
                              aria-haspopup="true"
                              aria-label="Filter by Machine"
                            >
                              <span>{selectedMachine.length > 0 ? (selectedMachine.length === uniqueMachines.length - 1 ? "All Machines" : `Selected (${selectedMachine.length})`) : "All Machines"}</span>
                              <ChevronDown className={`transform transition-transform ${showMachineFilterDropdown ? "rotate-180" : "rotate-0"} text-gray-500 text-base`} />
                            </button>
                            <AnimatePresence>
                              {showMachineFilterDropdown && (
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
                                      checked={selectedMachine.length === uniqueMachines.length - 1 && uniqueMachines.length > 1}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedMachine(uniqueMachines.slice(1)); // Exclude empty string
                                        } else {
                                          setSelectedMachine([]);
                                        }
                                      }}
                                    />
                                    <span className="ml-2 text-gray-800 font-semibold text-sm">Select All</span>
                                  </label>
                                  {uniqueMachines.slice(1).map((machine) => (
                                    <label key={machine} className="flex items-center p-2.5 hover:bg-blue-50 cursor-pointer" role="option">
                                      <input
                                        type="checkbox"
                                        className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                                        checked={selectedMachine.includes(machine)}
                                        onChange={(e) => handleMachineCheckboxChange(machine, e.target.checked)}
                                      />
                                      <span className="ml-2 text-gray-800 text-sm">{machine}</span>
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

                  {/* View Modes */}

                  {viewMode === "calendar" && (
                    <div className="space-y-6">
                      {/* Calendar Header - Modern Design */}
                      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="text-center lg:text-left">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{currentCalendarDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}</h2>
                            <p className="text-gray-600 text-sm">Monitor your maintenance schedules and activities</p>
                          </div>

                          <div className="flex items-center justify-center gap-3">
                            <motion.button
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={goToPreviousMonth}
                              className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-gray-200"
                              aria-label="Previous month"
                            >
                              <ChevronLeft size={20} />
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={goToCurrentMonth}
                              className="px-4 py-3 bg-blue-600 text-white rounded-xl text-sm font-semibold shadow-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                              Today
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05, backgroundColor: "rgba(59, 130, 246, 0.1)" }}
                              whileTap={{ scale: 0.95 }}
                              onClick={goToNextMonth}
                              className="p-3 rounded-xl text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 border border-gray-200"
                              aria-label="Next month"
                            >
                              <ChevronRight size={20} />
                            </motion.button>
                          </div>
                        </div>
                      </div>

                      {/* Calendar Grid - Modern Design */}
                      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        {/* Week Days Header */}
                        <div className="grid grid-cols-8 gap-2 mb-4">
                          <div className="p-3 text-center">
                            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">WN</span>
                          </div>
                          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => (
                            <div key={day} className="p-3 text-center">
                              <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{day}</span>
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div className="grid grid-cols-8 gap-2">{renderCalendarDays()}</div>
                      </div>

                      {/* Legend - Modern Design */}
                      <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Schedule Status</h3>
                        <div className="flex flex-wrap gap-6">
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">New / Not Started</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">On Progress</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">Done / Completed</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-4 h-4 bg-gray-100 border-2 border-gray-300 rounded-full"></div>
                            <span className="text-sm font-medium text-gray-700">No Schedule</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {viewMode === "table" && (
                    <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                      {/* Table content */}
                      <div className="overflow-x-auto bg-white rounded-lg shadow-md mt-6 animate-fade-in">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interval</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Machine</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Monitoring Result</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">MS Status</th>
                              <th className="relative px-6 py-3">
                                <span className="sr-only">Actions</span>
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
                                        record.msStatus === "MS" ? "bg-green-100 text-green-800" : record.msStatus === "TMS" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-800"
                                      }`}
                                    >
                                      {record.msStatus}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <motion.button
                                      whileHover={{ scale: 1.1 }}
                                      whileTap={{ scale: 0.9 }}
                                      onClick={() => handleViewRecord(record)}
                                      className="text-blue-600 hover:text-blue-900 transition-colors duration-200"
                                      title="View Details"
                                    >
                                      <Eye size={18} />
                                    </motion.button>
                                  </td>
                                </motion.tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={8} className="px-6 py-4 text-center text-sm text-gray-500">
                                  No monitoring data found.
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

        <Modal isOpen={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Monitoring Details">
          {selectedRecord && (
            <>
              {/* PERBAIKI DI SINI - HAPUS onUpdateRecord KARENA TIDAK DIPERLUKAN LAGI */}
              <DetailView record={selectedRecord} onUpdateRecord={handleUpdateRecord} />

              <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                <motion.button
                  onClick={() => handleNavigateToEditForm(selectedRecord)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm flex items-center"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Full Details
                </motion.button>
              </div>
            </>
          )}
        </Modal>

        <DailyScheduleListModal
          isOpen={showDailyScheduleModal}
          onClose={() => setShowDailyScheduleModal(false)}
          schedules={dailySchedulesForSelectedDate}
          onSelectSchedule={handleNavigateToEditForm}
          titleDate={selectedDateForDailySchedules}
        />
      </div>
    </MaintenanceRecordsContext.Provider>
  );
};

export default MonitoringMaintenance;
