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
  FiUser,
  FiCalendar,
  FiFlag,
  FiStar,
  FiPrinter,
  FiCheck,
  FiXCircle,
  FiSave,
  FiTrash2,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type WorkOrderStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold" | "approved" | "rejected";
type WorkOrderPriority = "low" | "medium" | "high" | "critical";
type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency" | "calibration";
type WorkOrderSection = "production" | "facilities" | "utilities" | "lab" | "warehouse";

interface WorkOrder {
  id: string;
  title: string;
  description: string;
  type: WorkOrderType;
  status: WorkOrderStatus;
  priority: WorkOrderPriority;
  assignedTo: string;
  assignedToAvatar: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  completedAt: string;
  assetId: string;
  assetName: string;
  assetType: string;
  estimatedHours: number;
  actualHours: number;
  cost: number;
  checklistItems: { id: string; task: string; completed: boolean }[];
  notes: string[];
  section: WorkOrderSection;
  subSection: string;
  requester: string;
  requesterDepartment: string;
  approvalStatus: "pending" | "approved" | "rejected";
  approvalNotes: string[];
  escalationLevel: number;

  date: string;
  shift: string;
  group: string;
  stopJam: string;
  stopMenit: string;
  startJam: string;
  startMenit: string;
  stopTime: string;
  unit: string;
  mesin: string;
  runningHour: string;
  itemTrouble: string;
  jenisGangguan: string;
  bentukTindakan: string;
  perbaikanPerawatan: string;
  rootCause: string;
  jenisAktivitas: string;
  kegiatan: string;
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: string;
  unitSparePart: string;
}

interface ChecklistItem {
  id: string;
  task: string;
  completed: boolean;
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

interface AddWorkOrderFormProps {
  onAddWorkOrder: (workOrder: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "approvalNotes" | "escalationLevel">) => void;
}

interface WorkOrderDetailsFormProps {
  workOrder: WorkOrder;
  isEditing: boolean;
  onSave: (workOrder: WorkOrder) => void;
  onCancel: () => void;
  onComplete: (workOrder: WorkOrder) => void;
  onPrint: (workOrder: WorkOrder) => void;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-10 py-6 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 30 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-6 md:p-10 border border-gray-200"
      >
        <div className="flex items-center justify-between border-b pb-4 mb-6">
          <h3 className="text-xl md:text-2xl font-semibold text-blue-600">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <FiX />
          </motion.button>
        </div>

        <div className="overflow-y-auto max-h-[70vh]">{children}</div>
      </motion.div>
    </motion.div>
  );
};

const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ onAddWorkOrder }) => {
  const { getMesin } = useAuth();
  const [mesinList, setMesinList] = useState([]);
  const [formData, setFormData] = useState<Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "approvalNotes" | "escalationLevel">>({
    title: "",
    description: "",
    type: "preventive",
    status: "pending",
    priority: "medium",
    assignedTo: "",
    assignedToAvatar: "",
    createdBy: "System Admin",
    createdAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    assetId: "",
    assetName: "",
    assetType: "",
    estimatedHours: 0,
    section: "production",
    subSection: "",
    requester: "",
    requesterDepartment: "",
    approvalStatus: "pending",
    date: "",
    shift: "",
    group: "",
    stopJam: "",
    stopMenit: "",
    startJam: "",
    startMenit: "",
    stopTime: "",
    unit: "",
    mesin: "",
    runningHour: "",
    itemTrouble: "",
    jenisGangguan: "",
    bentukTindakan: "",
    perbaikanPerawatan: "",
    rootCause: "",
    jenisAktivitas: "",
    kegiatan: "",
    kodePart: "",
    sparePart: "",
    idPart: "",
    jumlah: "",
    unitSparePart: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "assignedTo") {
      const avatarMap: Record<string, string> = {
        "John Doe": "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
        "Jane Smith": "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
        "Robert Johnson": "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
        "Emily Davis": "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
        "Michael Brown": "https://placehold.co/40x40/0078D7/FFFFFF?text=MB",
      };
      setFormData((prev) => ({
        ...prev,
        assignedToAvatar: avatarMap[value] || "https://placehold.co/40x40/0078D7/FFFFFF?text=US",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddWorkOrder(formData);
    setFormData({
      title: "",
      description: "",
      type: "preventive",
      status: "pending",
      priority: "medium",
      assignedTo: "",
      assignedToAvatar: "",
      createdBy: "System Admin",
      createdAt: new Date().toISOString().split("T")[0],
      dueDate: "",
      assetId: "",
      assetName: "",
      assetType: "",
      estimatedHours: 0,
      section: "production",
      subSection: "",
      requester: "",
      requesterDepartment: "",
      approvalStatus: "pending",

      date: "",
      shift: "",
      group: "",
      stopJam: "",
      stopMenit: "",
      startJam: "",
      startMenit: "",
      stopTime: "",
      unit: "",
      mesin: "",
      runningHour: "",
      itemTrouble: "",
      jenisGangguan: "",
      bentukTindakan: "",
      perbaikanPerawatan: "",
      rootCause: "",
      jenisAktivitas: "",
      kegiatan: "",
      kodePart: "",
      sparePart: "",
      idPart: "",
      jumlah: "",
      unitSparePart: "",
    });
  };

  const handleClear = () => {
    console.log("Filters cleared");
  };

  useEffect(() => {
    const fetchMesin = async () => {
      try {
        const data = await getMesin("nama");
        setMesinList(data);
      } catch (error) {
        console.error("Gagal mengambil data mesin:", error);
      }
    };

    fetchMesin();
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Date (dd/mm/yyyy)</label>
            <input type="date" name="date" value={formData.date} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Shift</label>
            <select name="shift" value={formData.shift} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Shift</option>
              <option value="1">Shift 1</option>
              <option value="2">Shift 2</option>
              <option value="3">Shift 3</option>
              <option value="off">OFF</option>
              <option value="ns">NS</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Group</label>
            <select name="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Group</option>
              <option value="A">Group A</option>
              <option value="B">Group B</option>
              <option value="C">Group C</option>
              <option value="D">Group D</option>
              <option value="off">OFF</option>
              <option value="ns">NS</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg text-blue-600 font-semibold text-center mb-4 flex items-center justify-center">
            <FiClock className="mr-2 text-blue-600" /> STOP
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jam</label>
              <input name="stopJam" value={formData.stopJam} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Menit</label>
              <input name="stopMenit" value={formData.stopMenit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="text-lg font-semibold text-blue-600 text-center mb-4 flex items-center justify-center">
            <FiCheck className="mr-2 text-blue-600" /> START
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Jam</label>
              <input name="startJam" value={formData.startJam} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Menit</label>
              <input name="startMenit" value={formData.startMenit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700">Stop Time</label>
          <select name="stopTime" value={formData.stopTime} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Stop Time</option>
            <option value="PM">PM</option>
            <option value="Harmonisasi">Harmonisasi</option>
            <option value="CIP">CIP</option>
            <option value="Unplanned">Unplanned</option>
            <option value="Standby">Standby</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Unit</option>
              <option value="WF1U1">WF1U1</option>
              <option value="WF1U3">WF1U3</option>
              <option value="WF2U1">WF2U1</option>
              <option value="WF2U2">WF2U2</option>
              <option value="Lain Lain">Lain Lain</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Mesin</label>
            <select name="mesin" value={formData.mesin} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Mesin</option>
              {mesinList.map((mesin: any) => (
                <option key={mesin} value={mesin}>
                  {mesin}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Running Hour</label>
          <input
            type="text"
            name="runningHour"
            value={formData.runningHour}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Item Trouble</label>
          <select name="itemTrouble" value={formData.itemTrouble} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
            <option value="">Select Item Trouble</option>
            <option value="PM">PM</option>
            <option value="Harmonisasi">Harmonisasi</option>
            <option value="CIP">CIP</option>
            <option value="Unplanned">Unplanned</option>
            <option value="Standby">Standby</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Gangguan/Kerusakan</label>
            <textarea
              name="jenisGangguan"
              value={formData.jenisGangguan}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Bentuk Tindakan</label>
            <textarea
              name="bentukTindakan"
              value={formData.bentukTindakan}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Root Cause</label>
          <textarea
            name="rootCause"
            value={formData.rootCause}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jenis Aktifitas</label>
            <select
              name="jenisAktivitas"
              value={formData.jenisAktivitas}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Aktifitas</option>
              <option value="Perbaikan">Perbaikan</option>
              <option value="Perawatan">Perawatan</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Kegiatan</label>
            <select name="kegiatan" value={formData.kegiatan} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500">
              <option value="">Select Kegiatan</option>
              <option value="Replace With Old Part">Replace With New Part</option>
              <option value="Replace With Old Part">Replace With Old Part</option>
              <option value="Cleaning">Cleaning</option>
              <option value="Check">Check</option>
              <option value="Tightening">Tightening</option>
              <option value="Improvement">Improvemenet</option>
              <option value="Modification">Modification</option>
              <option value="Calibration">Calibration</option>
              <option value="Repair by Vendor">Repair by Vendor</option>
              <option value="Monitoring">Monitoring</option>
              <option value="Greasing">Greasing</option>
              <option value="Reset">Reset</option>
              <option value="Fine Tune">Fine Tune</option>
              <option value="Repair Offline Part">Repair Offline Part</option>
              <option value="Trouble Shooting">Trouble Shooting</option>
            </select>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <h2 className="text-lg text-blue-600 font-semibold mb-4 flex items-center">
            <FiTool className="mr-2 text-blue-600" /> Spare Parts Information
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Kode Part</label>
              <input
                type="text"
                name="kodePart"
                value={formData.kodePart}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Spare Part</label>
              <input
                type="text"
                name="sparePart"
                value={formData.sparePart}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">ID Part</label>
              <input
                type="text"
                name="idPart"
                value={formData.idPart}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Jumlah</label>
              <input name="jumlah" value={formData.jumlah} onChange={handleChange} className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500" />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700">Unit</label>
            <select
              name="unitSparePart"
              value={formData.unitSparePart}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Unit</option>
              <option value="PCS">PCS</option>
              <option value="UNIT">UNIT</option>
              <option value="M">M</option>
              <option value="L">L</option>
            </select>
          </div>
        </div>

        <div className="flex justify-between border-t border-gray-200 pt-6">
          <motion.button
            type="button"
            onClick={handleClear}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiTrash2 className="mr-2" /> Clear Data
          </motion.button>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <FiSave className="mr-2" /> Save Kronik
          </motion.button>
        </div>
      </form>
    </div>
  );
};

const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint }) => {
  const [formData, setFormData] = useState<WorkOrder>(workOrder);
  const [newChecklistItem, setNewChecklistItem] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newApprovalNote, setNewApprovalNote] = useState("");

  useEffect(() => {
    setFormData(workOrder);
  }, [workOrder]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleChecklistToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
    }));
  };

  const handleAddChecklistItem = () => {
    if (newChecklistItem.trim()) {
      setFormData((prev) => ({
        ...prev,
        checklistItems: [
          ...prev.checklistItems,
          {
            id: `item-${Date.now()}`,
            task: newChecklistItem,
            completed: false,
          },
        ],
      }));
      setNewChecklistItem("");
    }
  };

  const handleRemoveChecklistItem = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      checklistItems: prev.checklistItems.filter((item) => item.id !== id),
    }));
  };

  const handleAddNote = () => {
    if (newNote.trim()) {
      setFormData((prev) => ({
        ...prev,
        notes: [...prev.notes, newNote],
      }));
      setNewNote("");
    }
  };

  const handleRemoveNote = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      notes: prev.notes.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleCompleteWorkOrder = () => {
    const completedWorkOrder: WorkOrder = {
      ...formData,
      status: "completed",
      completedAt: new Date().toISOString().split("T")[0],
      actualHours: formData.actualHours || formData.estimatedHours,
    };
    onComplete(completedWorkOrder);
  };

  const handleApprove = () => {
    const approvedWorkOrder: WorkOrder = {
      ...formData,
      approvalStatus: "approved",
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, newApprovalNote] : formData.approvalNotes,
      status: "in-progress",
    };
    onSave(approvedWorkOrder);
    setNewApprovalNote("");
  };

  const handleReject = () => {
    const rejectedWorkOrder: WorkOrder = {
      ...formData,
      approvalStatus: "rejected",
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, newApprovalNote] : formData.approvalNotes,
      status: "cancelled",
    };
    onSave(rejectedWorkOrder);
    setNewApprovalNote("");
  };

  const handleEscalate = () => {
    const escalatedWorkOrder: WorkOrder = {
      ...formData,
      escalationLevel: formData.escalationLevel + 1,
      approvalNotes: newApprovalNote ? [...formData.approvalNotes, `Escalated to level ${formData.escalationLevel + 1}: ${newApprovalNote}`] : formData.approvalNotes,
    };
    onSave(escalatedWorkOrder);
    setNewApprovalNote("");
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
            Work Order ID
          </label>
          <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
        </div>
        <div>
          <label htmlFor="detail-status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
          <select
            id="detail-status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="on-hold">On Hold</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="detail-title" className="block text-sm font-medium text-gray-700">
          Title
        </label>
        <input
          type="text"
          id="detail-title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          readOnly={!isEditing}
          required
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label htmlFor="detail-description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="detail-description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          readOnly={!isEditing}
          rows={3}
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-type" className="block text-sm font-medium text-gray-700">
            Type
          </label>
          <select
            id="detail-type"
            name="type"
            value={formData.type}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="preventive">Preventive Maintenance</option>
            <option value="corrective">Corrective Maintenance</option>
            <option value="inspection">Inspection</option>
            <option value="emergency">Emergency Repair</option>
            <option value="calibration">Calibration</option>
          </select>
        </div>
        <div>
          <label htmlFor="detail-priority" className="block text-sm font-medium text-gray-700">
            Priority
          </label>
          <select
            id="detail-priority"
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-section" className="block text-sm font-medium text-gray-700">
            Section
          </label>
          <select
            id="detail-section"
            name="section"
            value={formData.section}
            onChange={handleChange}
            disabled={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="production">Production</option>
            <option value="facilities">Facilities</option>
            <option value="utilities">Utilities</option>
            <option value="lab">Laboratory</option>
            <option value="warehouse">Warehouse</option>
          </select>
        </div>
        <div>
          <label htmlFor="detail-subSection" className="block text-sm font-medium text-gray-700">
            Sub-Section
          </label>
          <input
            type="text"
            id="detail-subSection"
            name="subSection"
            value={formData.subSection}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-requester" className="block text-sm font-medium text-gray-700">
            Requester
          </label>
          <input
            type="text"
            id="detail-requester"
            name="requester"
            value={formData.requester}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
        <div>
          <label htmlFor="detail-requesterDepartment" className="block text-sm font-medium text-gray-700">
            Requester Department
          </label>
          <input
            type="text"
            id="detail-requesterDepartment"
            name="requesterDepartment"
            value={formData.requesterDepartment}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-assignedTo" className="block text-sm font-medium text-gray-700">
            Assigned To
          </label>
          <select
            id="detail-assignedTo"
            name="assignedTo"
            value={formData.assignedTo}
            onChange={handleChange}
            disabled={!isEditing}
            required
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          >
            <option value="John Doe">John Doe</option>
            <option value="Jane Smith">Jane Smith</option>
            <option value="Robert Johnson">Robert Johnson</option>
            <option value="Emily Davis">Emily Davis</option>
            <option value="Michael Brown">Michael Brown</option>
          </select>
        </div>
        <div>
          <label htmlFor="detail-createdBy" className="block text-sm font-medium text-gray-700">
            Created By
          </label>
          <input
            type="text"
            id="detail-createdBy"
            name="createdBy"
            value={formData.createdBy}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-createdAt" className="block text-sm font-medium text-gray-700">
            Created At
          </label>
          <input
            type="date"
            id="detail-createdAt"
            name="createdAt"
            value={formData.createdAt}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
          />
        </div>
        <div>
          <label htmlFor="detail-dueDate" className="block text-sm font-medium text-gray-700">
            Due Date
          </label>
          <input
            type="date"
            id="detail-dueDate"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>
      {formData.completedAt && (
        <div>
          <label htmlFor="detail-completedAt" className="block text-sm font-medium text-gray-700">
            Completed At
          </label>
          <input
            type="date"
            id="detail-completedAt"
            name="completedAt"
            value={formData.completedAt}
            onChange={handleChange}
            readOnly
            className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
          />
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-assetId" className="block text-sm font-medium text-gray-700">
            Asset ID
          </label>
          <input
            type="text"
            id="detail-assetId"
            name="assetId"
            value={formData.assetId}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
        <div>
          <label htmlFor="detail-assetName" className="block text-sm font-medium text-gray-700">
            Asset Name
          </label>
          <input
            type="text"
            id="detail-assetName"
            name="assetName"
            value={formData.assetName}
            onChange={handleChange}
            readOnly={!isEditing}
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="detail-estimatedHours" className="block text-sm font-medium text-gray-700">
            Estimated Hours
          </label>
          <input
            type="number"
            id="detail-estimatedHours"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            readOnly={!isEditing}
            min="0"
            step="0.5"
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
        <div>
          <label htmlFor="detail-actualHours" className="block text-sm font-medium text-gray-700">
            Actual Hours
          </label>
          <input
            type="number"
            id="detail-actualHours"
            name="actualHours"
            value={formData.actualHours || ""}
            onChange={handleChange}
            readOnly={!isEditing}
            min="0"
            step="0.5"
            className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
          />
        </div>
      </div>
      <div>
        <label htmlFor="detail-cost" className="block text-sm font-medium text-gray-700">
          Cost ($)
        </label>
        <input
          type="number"
          id="detail-cost"
          name="cost"
          value={formData.cost || ""}
          onChange={handleChange}
          readOnly={!isEditing}
          min="0"
          step="0.01"
          className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${isEditing ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
        <div className="space-y-2">
          {formData.checklistItems.map((item) => (
            <div key={item.id} className="flex items-center">
              <input type="checkbox" id={`checklist-${item.id}`} checked={item.completed} onChange={() => handleChecklistToggle(item.id)} disabled={!isEditing} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-200 rounded" />
              <label htmlFor={`checklist-${item.id}`} className={`ml-2 ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
                {item.task}
              </label>
              {isEditing && (
                <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="ml-auto text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
        {isEditing && (
          <div className="mt-2 flex">
            <input
              type="text"
              value={newChecklistItem}
              onChange={(e) => setNewChecklistItem(e.target.value)}
              placeholder="Add new checklist item"
              className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button type="button" onClick={handleAddChecklistItem} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
              Add
            </button>
          </div>
        )}
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
        <div className="space-y-3">
          {formData.notes.map((note: string, index: number) => (
            <div key={index} className="bg-blue-50 p-3 rounded-lg relative">
              <p className="text-gray-700">{note}</p>
              {isEditing && (
                <button type="button" onClick={() => handleRemoveNote(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
                  <FiX />
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="mt-2 flex">
          <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add new note" rows={2} className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500" />
          <button type="button" onClick={handleAddNote} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
            Add
          </button>
        </div>
      </div>
      {formData.approvalStatus !== "approved" && (
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <h3 className="text-lg font-medium text-yellow-800 mb-2">Approval Required</h3>
          <div className="space-y-3">
            {formData.approvalNotes.map((note: string, index: number) => (
              <div key={index} className="bg-white p-3 rounded-md border border-yellow-100">
                <p className="text-yellow-700">{note}</p>
              </div>
            ))}
          </div>
          {isEditing && (
            <>
              <textarea
                value={newApprovalNote}
                onChange={(e) => setNewApprovalNote(e.target.value)}
                placeholder="Add approval notes..."
                rows={2}
                className="mt-3 block w-full border border-yellow-300 rounded-md p-2 focus:ring-yellow-500 focus:border-yellow-500"
              />
              <div className="flex space-x-3 mt-3">
                <button type="button" onClick={handleApprove} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700">
                  <FiCheck className="mr-2" /> Approve
                </button>
                <button type="button" onClick={handleReject} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700">
                  <FiXCircle className="mr-2" /> Reject
                </button>
                <button type="button" onClick={handleEscalate} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700">
                  Escalate
                </button>
              </div>
            </>
          )}
        </div>
      )}
      <div className="flex justify-between space-x-3 mt-6">
        <div className="flex space-x-3">
          {formData.status !== "completed" && formData.approvalStatus === "approved" && (
            <motion.button
              type="button"
              onClick={handleCompleteWorkOrder}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
            >
              <FiCheckCircle className="mr-2" />
              Complete
            </motion.button>
          )}
          <motion.button
            type="button"
            onClick={() => onPrint(formData)}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            <FiPrinter className="mr-2" />
            Print
          </motion.button>
        </div>
        <div className="flex space-x-3">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isEditing ? "Cancel" : "Close"}
          </motion.button>
          {isEditing && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Save Changes
            </motion.button>
          )}
        </div>
      </div>
    </form>
  );
};

const WorkOrdersDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | "all">("all");
  const [typeFilter, setTypeFilter] = useState<WorkOrderType | "all">("all");
  const [sectionFilter, setSectionFilter] = useState<WorkOrderSection | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [workOrdersPerPage] = useState(5);
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { getMesin } = useAuth();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    const ambilMesin = async () => {
      try {
        const data = await getMesin("Mesin A");
        console.log("Data Mesin:", data);
      } catch (err) {
        const error = err as Error;
        console.error("Gagal ambil mesin:", error.message);
      }
    };

    ambilMesin();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
  {
    id: "TD-WO-001",
    title: "HVAC System Calibration",
    description: "Quarterly calibration for HVAC system in Production Area",
    type: "calibration",
    status: "in-progress",
    priority: "medium",
    assignedTo: "John Doe",
    assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
    createdBy: "Production Manager",
    createdAt: "2023-10-01",
    dueDate: "2023-10-15",
    completedAt: "",
    assetId: "AST-001",
    assetName: "HVAC System",
    assetType: "mechanical",
    estimatedHours: 4,
    actualHours: 2,
    cost: 0,
    checklistItems: [
      { id: "1", task: "Check calibration standards", completed: true },
      { id: "2", task: "Adjust temperature sensors", completed: true },
      { id: "3", task: "Verify airflow measurements", completed: false },
    ],
    notes: ["Calibration kit #45 used"],
    section: "production",
    subSection: "Area 2",
    requester: "Sarah Johnson",
    requesterDepartment: "Production",
    approvalStatus: "approved",
    approvalNotes: ["Approved by Supervisor on 10/02/2023"],
    escalationLevel: 0,
    // Add the missing properties
    date: "2023-10-01",
    shift: "1",
    group: "A",
    stopJam: "10",
    stopMenit: "30",
    startJam: "11",
    startMenit: "00",
    stopTime: "PM",
    unit: "WF1U1",
    mesin: "HVAC System",
    runningHour: "1200",
    itemTrouble: "Calibration",
    jenisGangguan: "Temperature sensor drift",
    bentukTindakan: "Calibration adjustment",
    perbaikanPerawatan: "Calibration",
    rootCause: "Sensor drift over time",
    jenisAktivitas: "Perawatan",
    kegiatan: "Calibration",
    kodePart: "CAL-001",
    sparePart: "Calibration Kit",
    idPart: "CAL-KIT-45",
    jumlah: "1",
    unitSparePart: "PCS"  
  },
  // Continue for all other work orders
]);

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
  };

  const getStatusColor = (status: WorkOrderStatus) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "pending":
        return "bg-yellow-500";
      case "on-hold":
        return "bg-purple-500";
      case "cancelled":
        return "bg-red-500";
      case "approved":
        return "bg-green-300";
      case "rejected":
        return "bg-red-300";
      default:
        return "bg-gray-500";
    }
  };

  const getPriorityColor = (priority: WorkOrderPriority) => {
    switch (priority) {
      case "low":
        return "bg-gray-200 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityIcon = (priority: WorkOrderPriority) => {
    switch (priority) {
      case "low":
        return <FiFlag className="text-gray-500" />;
      case "medium":
        return <FiFlag className="text-blue-500" />;
      case "high":
        return <FiFlag className="text-orange-500" />;
      case "critical":
        return <FiFlag className="text-red-500" />;
      default:
        return <FiFlag className="text-gray-500" />;
    }
  };

  const openWorkOrderDetails = (workOrder: WorkOrder, editMode: boolean) => {
    setSelectedWorkOrder(workOrder);
    setIsEditing(editMode);
    setShowWorkOrderDetailsModal(true);
  };

  const handleAddWorkOrder = (newWorkOrderData: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "approvalNotes" | "escalationLevel">) => {
    const newWorkOrder: WorkOrder = {
      ...newWorkOrderData,
      id: `TD-WO-${String(workOrders.length + 1).padStart(3, "0")}`,
      checklistItems: [],
      notes: [],
      completedAt: "",
      actualHours: 0,
      cost: 0,
      approvalNotes: [],
      escalationLevel: 0,
    };
    setWorkOrders([...workOrders, newWorkOrder]);
    setShowAddWorkOrderModal(false);
  };

  const handleUpdateWorkOrder = (updatedWorkOrderData: WorkOrder) => {
    setWorkOrders(workOrders.map((wo) => (wo.id === updatedWorkOrderData.id ? updatedWorkOrderData : wo)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    setIsEditing(false);
  };

  const handleCompleteWorkOrder = (completedWorkOrder: WorkOrder) => {
    setWorkOrders(workOrders.map((wo) => (wo.id === completedWorkOrder.id ? completedWorkOrder : wo)));
    setShowWorkOrderDetailsModal(false);
    setSelectedWorkOrder(null);
    setIsEditing(false);
  };

  const handlePrintWorkOrder = (workOrder: WorkOrder) => {
    alert(`Printing work order ${workOrder.id}`);
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((wo) => {
    const matchesSearch = wo.title.toLowerCase().includes(searchQuery.toLowerCase()) || wo.id.toLowerCase().includes(searchQuery.toLowerCase()) || wo.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
    const matchesType = typeFilter === "all" || wo.type === typeFilter;
    const matchesSection = sectionFilter === "all" || wo.section === sectionFilter;

    return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesSection;
  });

  const indexOfLastWorkOrder = currentPage * workOrdersPerPage;
  const indexOfFirstWorkOrder = indexOfLastWorkOrder - workOrdersPerPage;
  const currentWorkOrders = filteredWorkOrders.slice(indexOfFirstWorkOrder, indexOfLastWorkOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / workOrdersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, priorityFilter, typeFilter, sectionFilter, sidebarOpen]);

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
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
                <div className="rounded-lg flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                  <p className="text-blue-600 font-bold">CMMS</p>
                </div>
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

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiClipboard className="text-2xl text-blue-600" />
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Machine History System</h1>
              <p className="text-gray-600 mt-1">Create, track and manage all maintenance work orders</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowAddWorkOrderModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Create Work Order</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Work Orders" value={workOrders.length.toString()} change="+15%" icon={<FiClipboard />} />
            <StatCard title="Completed" value={workOrders.filter((wo) => wo.status === "completed").length.toString()} change="+8%" icon={<FiCheckCircle />} />
            <StatCard title="In Progress" value={workOrders.filter((wo) => wo.status === "in-progress").length.toString()} change="-3%" icon={<FiClock />} />
            <StatCard title="Pending Approval" value={workOrders.filter((wo) => wo.approvalStatus === "pending").length.toString()} change="+2" icon={<FiAlertTriangle />} />
          </div>

          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search work orders by title, ID, or description..."
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
                      onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "all")}
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="on-hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                      <option value="approved">Approved</option>
                      <option value="rejected">Rejected</option>
                    </select>
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as WorkOrderPriority | "all")}
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as WorkOrderType | "all")}
                    >
                      <option value="all">All Types</option>
                      <option value="preventive">Preventive</option>
                      <option value="corrective">Corrective</option>
                      <option value="inspection">Inspection</option>
                      <option value="emergency">Emergency</option>
                      <option value="calibration">Calibration</option>
                    </select>
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={sectionFilter}
                      onChange={(e) => setSectionFilter(e.target.value as WorkOrderSection | "all")}
                    >
                      <option value="all">All Sections</option>
                      <option value="production">Production</option>
                      <option value="facilities">Facilities</option>
                      <option value="utilities">Utilities</option>
                      <option value="lab">Laboratory</option>
                      <option value="warehouse">Warehouse</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Section</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {currentWorkOrders.length > 0 ? (
                    currentWorkOrders.map((workOrder) => (
                      <motion.tr
                        key={workOrder.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
                              <FiClipboard className="text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-base font-medium text-gray-900">{workOrder.title}</div>
                              <div className="text-sm text-gray-600">{workOrder.id}</div>
                              {workOrder.assetName && (
                                <div className="text-xs text-gray-500 mt-1">
                                  Asset: {workOrder.assetName} ({workOrder.assetId})
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm capitalize text-gray-900">
                            {workOrder.type
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {getPriorityIcon(workOrder.priority)}
                            <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(workOrder.status)} text-white shadow-sm`}>
                            {workOrder.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </motion.span>
                          {workOrder.approvalStatus === "pending" && <div className="text-xs text-yellow-600 mt-1">Pending Approval</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm capitalize text-gray-900">
                            {workOrder.section.charAt(0).toUpperCase() + workOrder.section.slice(1)}
                            {workOrder.subSection && <div className="text-xs text-gray-500">({workOrder.subSection})</div>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{new Date(workOrder.dueDate).toLocaleDateString()}</div>
                          <div className={`text-xs ${new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "text-red-600" : "text-gray-500"}`}>
                            {new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "Overdue" : ""}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(workOrder, false)}
                            className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <FiEye className="text-lg" />
                            <span>View</span>
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(workOrder, true)}
                            className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                            title="Edit Work Order"
                          >
                            <FiEdit className="text-lg" />
                            <span>Edit</span>
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No work orders found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredWorkOrders.length > workOrdersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstWorkOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastWorkOrder, filteredWorkOrders.length)}</span> of{" "}
                <span className="font-semibold">{filteredWorkOrders.length}</span> results
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

      <Modal isOpen={showAddWorkOrderModal} onClose={() => setShowAddWorkOrderModal(false)} title="Create Machine History System">
        <AddWorkOrderForm onAddWorkOrder={handleAddWorkOrder} />
      </Modal>

      {selectedWorkOrder && (
        <Modal
          isOpen={showWorkOrderDetailsModal}
          onClose={() => {
            setShowWorkOrderDetailsModal(false);
            setSelectedWorkOrder(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Work Order" : "Work Order Details"}
        >
          <WorkOrderDetailsForm
            workOrder={selectedWorkOrder}
            isEditing={isEditing}
            onSave={handleUpdateWorkOrder}
            onCancel={() => {
              setShowWorkOrderDetailsModal(false);
              setSelectedWorkOrder(null);
              setIsEditing(false);
            }}
            onComplete={handleCompleteWorkOrder}
            onPrint={handlePrintWorkOrder}
          />
        </Modal>
      )}
    </div>
  );
};

export default WorkOrdersDashboard;
