import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, MachineHistoryFormData, Mesin, Shift, Group, StopTime, Unit, ItemTrouble, JenisAktivitas, Kegiatan, UnitSparePart } from "../../routes/AuthContext";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar"; // Assuming Sidebar is in ../component/Sidebar
import {
  X,
  Clock,
  CheckCircle,
  ToolCase,
  ArrowLeft,
  Save,
  Trash2,
  Hourglass,
  ListPlus, // Used for 'Add Work Order' in FormIT, not directly used here but kept for consistency in imports if needed later.
} from "lucide-react";

// Modal component (reused from FormIT.tsx and FormMesin.tsx for consistency)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getMachineHistoryById, updateMachineHistory, masterData, isMasterDataLoading } = useAuth();

  const [formData, setFormData] = useState<MachineHistoryFormData>({
    date: "",
    shift: "",
    group: "",
    stopJam: null,
    stopMenit: null,
    startJam: null,
    startMenit: null,
    stopTime: "",
    unit: "",
    mesin: "",
    runningHour: 0,
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
    jumlah: 0,
    unitSparePart: "",
  });

  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      if (isMasterDataLoading || !masterData) {
        setLocalLoading(true);
        return;
      }

      try {
        setLocalLoading(true);
        if (id) {
          const responseData: any = await getMachineHistoryById(id);
          const apiDataRaw = responseData.data;

          if (apiDataRaw) {
            setFormData({
              date: apiDataRaw.date || "",
              shift: String(apiDataRaw.shift_id) || "",
              group: String(apiDataRaw.group_id) || "",
              stopJam: apiDataRaw.startstop?.stop_time_hh ?? null,
              stopMenit: apiDataRaw.startstop?.stop_time_mm ?? null,
              startJam: apiDataRaw.startstop?.start_time_hh ?? null,
              startMenit: apiDataRaw.startstop?.start_time_mm ?? null,
              stopTime: String(apiDataRaw.stoptime_id) || "",
              unit: String(apiDataRaw.unit_id) || "",
              mesin: String(apiDataRaw.mesin_id) || "",
              runningHour: apiDataRaw.running_hour ?? 0,
              itemTrouble: String(apiDataRaw.itemtrouble_id) || "",
              jenisGangguan: apiDataRaw.jenis_gangguan || "",
              bentukTindakan: apiDataRaw.bentuk_tindakan || "",
              perbaikanPerawatan: apiDataRaw.jenisaktifitas?.name === "Perbaikan" ? "Perbaikan" : "Perawatan",
              rootCause: apiDataRaw.root_cause || "",
              jenisAktivitas: String(apiDataRaw.jenisaktifitas_id) || "",
              kegiatan: String(apiDataRaw.kegiatan_id) || "",
              kodePart: apiDataRaw.kode_part || "",
              sparePart: apiDataRaw.spare_part || "",
              idPart: apiDataRaw.id_part || "",
              jumlah: apiDataRaw.jumlah ?? 0,
              unitSparePart: String(apiDataRaw.unitsp_id) || "",
            });
          } else {
            setError("Data history mesin tidak ditemukan.");
          }
        } else {
          setError("ID history mesin tidak diberikan untuk pengeditan.");
        }
      } catch (error: any) {
        console.error("Error fetching machine history:", error);
        setError(error.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLocalLoading(false);
      }
    };
    fetchData();
  }, [id, masterData, isMasterDataLoading, getMachineHistoryById]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: string) => {
    if (e && typeof e === "object" && "value" in e && name) {
      // For react-select
      setFormData((prev) => ({
        ...prev,
        [name]: e.value,
      }));
    } else if (e && "target" in e) {
      // For native input/textarea
      const { name, value, type } = e.target;

      setFormData((prev) => {
        if (["stopJam", "startJam"].includes(name)) {
          const cleanedValue = value.replace(/[^\d]/g, "");
          const numValue = parseInt(cleanedValue, 10);
          return {
            ...prev,
            [name]: cleanedValue === "" ? null : Math.max(0, Math.min(23, isNaN(numValue) ? 0 : numValue)),
          };
        }

        if (["stopMenit", "startMenit"].includes(name)) {
          const cleanedValue = value.replace(/[^\d]/g, "");
          const numValue = parseInt(cleanedValue, 10);
          return {
            ...prev,
            [name]: cleanedValue === "" ? null : Math.max(0, Math.min(59, isNaN(numValue) ? 0 : numValue)),
          };
        }

        if (name === "runningHour" || name === "jumlah") {
          return {
            ...prev,
            [name]: value.replace(/[^\d.]/g, ""),
          };
        }

        return {
          ...prev,
          [name]: value,
        };
      });
    }
  }, []);

  const formatNumberWithDot = useCallback((num: number | string | null): string => {
    if (num === null || isNaN(Number(num))) return "";
    if (typeof num === "string") {
      const cleanedString = num.replace(/[^\d]/g, "");
      const numericValue = parseInt(cleanedString, 10);
      if (isNaN(numericValue)) return "";
      return numericValue.toLocaleString("id-ID").replace(/,/g, ".");
    }
    return num.toLocaleString("id-ID").replace(/,/g, ".");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const dataToSend: MachineHistoryFormData = {
      ...formData,
      perbaikanPerawatan: formData.jenisAktivitas === "Perbaikan" ? "Perbaikan" : "Perawatan", // This logic might need refinement based on masterData `name` if `id` is stored.
      runningHour: formData.runningHour ? parseInt(String(formData.runningHour).replace(/\./g, ""), 10) : 0,
      jumlah: formData.jumlah ? parseInt(String(formData.jumlah).replace(/\./g, ""), 10) : 0,
    };

    try {
      const response = await updateMachineHistory(id!, dataToSend);
      setSuccess(response.message || "Machine history updated successfully!");
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Error updating machine history:", error);
      setError(error.message || "Failed to update machine history.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      date: "",
      shift: "",
      group: "",
      stopJam: null,
      stopMenit: null,
      startJam: null,
      startMenit: null,
      stopTime: "",
      unit: "",
      mesin: "",
      runningHour: 0,
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
      jumlah: 0,
      unitSparePart: "",
    });
    setError(null);
    setSuccess(null);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/machinehistory");
  }, [navigate]);

  // Define custom styles for react-select to match Tailwind input styles in FormMesin.tsx
  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "42px", // Matches input height
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB", // Focus ring color for blue
      boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none", // Focus ring shadow
      "&:hover": {
        borderColor: "#9CA3AF", // Slightly darker border on hover
      },
      borderRadius: "0.5rem", // rounded-lg
      backgroundColor: "#FFFFFF", // bg-white
      padding: "0 0.5rem", // Padding inside the control
      transition: "all 0.15s ease-in-out", // transition duration-150
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0", // Remove default padding
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151", // text-gray-700
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280", // text-gray-500
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF", // text-gray-400
      "&:hover": {
        color: "#6B7280", // Darker on hover
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: "none", // Remove the vertical line
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown is above other elements
      borderRadius: "0.5rem", // rounded-lg
      border: "1px solid #E5E7EB", // border-gray-200
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)", // shadow-md
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF6FF" : "#FFFFFF", // bg-blue-50 on focus
      color: "#1F2937", // text-gray-900
      "&:active": {
        backgroundColor: "#DBEAFE", // bg-blue-100 on active
      },
      padding: "0.625rem 1rem", // py-2.5 px-4
    }),
  };

  if (isMasterDataLoading || localLoading) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900 justify-center items-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg flex items-center shadow-lg animate-pulse" role="alert">
          <Hourglass className="animate-spin mr-3 text-2xl" />
          <span className="font-semibold text-lg">Loading Data... Please wait.</span>
        </div>
      </div>
    );
  }

  if (error && !formData.date) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900 justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg flex items-center shadow-lg" role="alert">
          <X className="mr-3 text-2xl" />
          <span className="font-semibold text-lg">Error: {error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header section */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <motion.button onClick={() => navigate("/machinehistory")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ArrowLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back to Machine History</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Machine History Record</h2>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Machine History Record {id && `(ID: ${id})`}</h1>
              <p className="text-gray-600 mt-1">Update maintenance activities and machine issues</p>
            </div>
            <motion.button
              onClick={() => navigate("/machinehistory")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ArrowLeft className="text-lg" /> Back to History
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
                </span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="mr-2 text-blue-500" /> General Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                      Shift <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="shift"
                      id="shift"
                      options={masterData?.shifts.map((shift) => ({ value: shift.id, label: shift.name })) || []}
                      value={masterData?.shifts.map((shift) => ({ value: shift.id, label: shift.name })).find((option) => String(option.value) === String(formData.shift)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "shift")}
                      placeholder="Select Shift"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                      Group <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="group"
                      id="group"
                      options={masterData?.groups.map((group) => ({ value: group.id, label: group.name })) || []}
                      value={masterData?.groups.map((group) => ({ value: group.id, label: group.name })).find((option) => String(option.value) === String(formData.group)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "group")}
                      placeholder="Select Group"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Time Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Clock className="mr-2 text-indigo-500" /> Time Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Start Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        name="startJam"
                        id="startJam"
                        value={formData.startJam === null ? "" : formData.startJam}
                        onChange={handleChange}
                        min="0"
                        max="23"
                        placeholder="HH"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                        required
                      />
                      <span className="text-gray-500 text-lg">:</span>
                      <input
                        type="number"
                        name="startMenit"
                        id="startMenit"
                        value={formData.startMenit === null ? "" : formData.startMenit}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        placeholder="MM"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                        required
                      />
                    </div>
                  </div>
                  {/* Stop Time */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Time <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        name="stopJam"
                        id="stopJam"
                        value={formData.stopJam === null ? "" : formData.stopJam}
                        onChange={handleChange}
                        min="0"
                        max="23"
                        placeholder="HH"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                        required
                      />
                      <span className="text-gray-500 text-lg">:</span>
                      <input
                        type="number"
                        name="stopMenit"
                        id="stopMenit"
                        value={formData.stopMenit === null ? "" : formData.stopMenit}
                        onChange={handleChange}
                        min="0"
                        max="59"
                        placeholder="MM"
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700 mb-1">
                      Stop Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="stopTime"
                      id="stopTime"
                      options={masterData?.stoptimes.map((stopTime) => ({ value: stopTime.id, label: stopTime.name })) || []}
                      value={masterData?.stoptimes.map((stopTime) => ({ value: stopTime.id, label: stopTime.name })).find((option) => String(option.value) === String(formData.stopTime)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "stopTime")}
                      placeholder="Select Stop Type"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Machine Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ToolCase className="mr-2 text-green-500" /> Machine Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="mesin" className="block text-sm font-medium text-gray-700 mb-1">
                      Machine <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="mesin"
                      id="mesin"
                      options={masterData?.mesin.map((mesin) => ({ value: mesin.id, label: mesin.name })) || []}
                      value={masterData?.mesin.map((mesin) => ({ value: mesin.id, label: mesin.name })).find((option) => String(option.value) === String(formData.mesin)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "mesin")}
                      placeholder="Select Machine"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700 mb-1">
                      Running Hour <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="runningHour"
                      id="runningHour"
                      value={formatNumberWithDot(formData.runningHour)}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., 12.500"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                      Unit <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="unit"
                      id="unit"
                      options={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })) || []}
                      value={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })).find((option) => String(option.value) === String(formData.unit)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "unit")}
                      placeholder="Select Unit"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700 mb-1">
                      Item Trouble <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="itemTrouble"
                      id="itemTrouble"
                      options={masterData?.itemtroubles.map((item) => ({ value: item.id, label: item.name })) || []}
                      value={masterData?.itemtroubles.map((item) => ({ value: item.id, label: item.name })).find((option) => String(option.value) === String(formData.itemTrouble)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "itemTrouble")}
                      placeholder="Select Item Trouble"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Disturbance <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="jenisGangguan"
                      id="jenisGangguan"
                      value={formData.jenisGangguan}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., Electrical Issue"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="bentukTindakan"
                      id="bentukTindakan"
                      value={formData.bentukTindakan}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="Describe the action taken..."
                      required
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-1">
                      Root Cause <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="rootCause"
                      id="rootCause"
                      value={formData.rootCause}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="Identify the root cause..."
                      required
                    ></textarea>
                  </div>
                </div>
              </div>

              {/* Activity Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ListPlus className="mr-2 text-purple-500" /> Activity Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700 mb-1">
                      Type of Activity <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="jenisAktivitas"
                      id="jenisAktivitas"
                      options={masterData?.jenisaktivitas.map((jenis) => ({ value: jenis.id, label: jenis.name })) || []}
                      value={masterData?.jenisaktivitas.map((jenis) => ({ value: jenis.id, label: jenis.name })).find((option) => String(option.value) === String(formData.jenisAktivitas)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "jenisAktivitas")}
                      placeholder="Select Type of Activity"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700 mb-1">
                      Activity <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="kegiatan"
                      id="kegiatan"
                      options={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })) || []}
                      value={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })).find((option) => String(option.value) === String(formData.kegiatan)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "kegiatan")}
                      placeholder="Select Activity"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="kodePart" className="block text-sm font-medium text-gray-700 mb-1">
                      Part Code
                    </label>
                    <input
                      type="text"
                      name="kodePart"
                      id="kodePart"
                      value={formData.kodePart}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., P001"
                    />
                  </div>
                  <div>
                    <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700 mb-1">
                      Spare Part
                    </label>
                    <input
                      type="text"
                      name="sparePart"
                      id="sparePart"
                      value={formData.sparePart}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., Oil Filter"
                    />
                  </div>
                  <div>
                    <label htmlFor="idPart" className="block text-sm font-medium text-gray-700 mb-1">
                      Part ID
                    </label>
                    <input
                      type="text"
                      name="idPart"
                      id="idPart"
                      value={formData.idPart}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., SPU-005"
                    />
                  </div>
                  <div>
                    <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700 mb-1">
                      Quantity
                    </label>
                    <input
                      type="text"
                      name="jumlah"
                      id="jumlah"
                      value={formatNumberWithDot(formData.jumlah)}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., 5"
                    />
                  </div>
                  <div>
                    <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700 mb-1">
                      Spare Part Unit
                    </label>
                    <Select
                      name="unitSparePart"
                      id="unitSparePart"
                      options={masterData?.unitspareparts.map((unit) => ({ value: unit.id, label: unit.name })) || []}
                      value={masterData?.unitspareparts.map((unit) => ({ value: unit.id, label: unit.name })).find((option) => String(option.value) === String(formData.unitSparePart)) || null}
                      onChange={(selectedOption) => handleChange(selectedOption, "unitSparePart")}
                      placeholder="Select Unit"
                      styles={customSelectStyles}
                    />
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={handleClear}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <Trash2 className="mr-2 h-5 w-5" /> Clear Form
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Save Changes
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>

      {/* Success Modal */}
      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Your machine history record has been updated successfully!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Machine History
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormEditMesin;
