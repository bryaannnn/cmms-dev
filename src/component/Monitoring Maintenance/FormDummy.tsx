import React, { useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar";
import { X, CheckCircle, ArrowLeft, Save, Hourglass, Plus, ChevronLeft, ChevronRight, Trash2, ArrowRight } from "lucide-react";

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

interface ItemData {
  item: string;
  satuan: string;
}

interface MachineData {
  mesin: string;
  interval: string;
  items: ItemData[];
}

interface UnitData {
  unit: string;
  machines: MachineData[];
}

interface FormState {
  startDate: Date | null;
  endDate: Date | null;
  units: UnitData[];
}

const FormMonitoringMaintenanceD: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Hardcode dummy data for a full dummy frontend
  const dummyUnitList = useMemo(() => [{ nama_unit: "WY01" }, { nama_unit: "Unit Pengemasan B" }, { nama_unit: "Unit Logistik C" }], []);

  const dummyMesinList = useMemo(
    () => [
      { nama_mesin: "Machine A", unit_id: "WY01" },
      { nama_mesin: "Machine B", unit_id: "WY01" },
      { nama_mesin: "Mesin B1", unit_id: "Unit Pengemasan B" },
      { nama_mesin: "Mesin B2", unit_id: "Unit Pengemasan B" },
      { nama_mesin: "Mesin C1", unit_id: "Unit Logistik C" },
    ],
    []
  );

  const dummyItemsWithIntervals = useMemo(
    () => [
      { unit: "WY01", machine: "Machine A", interval: "Weekly", item: "Hydraulic Pressure", satuan: "psi" },
      { unit: "WY01", machine: "Machine A", interval: "Daily", item: "Oil Level", satuan: "L" },
      { unit: "Unit Pengemasan B", machine: "Mesin B1", interval: "Monthly", item: "Temperature", satuan: "°C" },
      { unit: "Unit Logistik C", machine: "Mesin C1", interval: "3 Months", item: "Bearing Condition", satuan: "Visual" },
    ],
    []
  );

  const initialFormData: FormState = {
    startDate: null,
    endDate: null,
    units: [{ unit: "", machines: [] }],
  };

  const [formData, setFormData] = useState<FormState>(initialFormData);
  const [currentStep, setCurrentStep] = useState(1);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none",
      "&:hover": { borderColor: "#9CA3AF" },
      borderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      padding: "0 0.5rem",
      transition: "all 0.15s ease-in-out",
    }),
    valueContainer: (provided: any) => ({ ...provided, padding: "0" }),
    singleValue: (provided: any) => ({ ...provided, color: "#374151" }),
    placeholder: (provided: any) => ({ ...provided, color: "#6B7280" }),
    dropdownIndicator: (provided: any) => ({ ...provided, color: "#9CA3AF" }),
    clearIndicator: (provided: any) => ({ ...provided, color: "#9CA3AF" }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "0.5rem",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF6FF" : "#FFFFFF",
      color: "#1F2937",
      "&:active": {
        backgroundColor: "#DBEAFE",
      },
      padding: "0.625rem 1rem",
    }),
  };

  const intervalOptions = useMemo(
    () => [
      { value: "Weekly", label: "Weekly" },
      { value: "Monthly", label: "Monthly" },
      { value: "3 Months", label: "3 Months" },
      { value: "6 Months", label: "6 Months" },
      { value: "1 Year", label: "1 Year" },
    ],
    []
  );

  const handleUpdate = useCallback((fieldPath: string, value: any) => {
    setFormData((prev) => {
      const newForm = JSON.parse(JSON.stringify(prev));
      const pathParts = fieldPath.split(".");
      let current: any = newForm;

      for (let i = 0; i < pathParts.length - 1; i++) {
        const part = pathParts[i];
        if (part.includes("[")) {
          const key = part.split("[")[0];
          const index = parseInt(part.split("[")[1].replace("]", ""), 10);
          current = current[key][index];
        } else {
          current = current[part];
        }
      }

      const lastPart = pathParts[pathParts.length - 1];
      current[lastPart] = value;
      return newForm;
    });
  }, []);

  const handleAddMachine = useCallback((unitIndex: number) => {
    setFormData((prev) => {
      const newUnits = [...prev.units];
      const newMachines = [...newUnits[unitIndex].machines];

      // Check if the last machine field is empty
      if (newMachines.length > 0) {
        const lastMachine = newMachines[newMachines.length - 1];
        if (!lastMachine.mesin && !lastMachine.interval) {
          // If the last machine has empty fields, do not add a new one.
          return prev;
        }
      }

      newMachines.push({ mesin: "", interval: "", items: [] });
      newUnits[unitIndex].machines = newMachines;
      return { ...prev, units: newUnits };
    });
  }, []);

  const handleRemoveMachine = useCallback((unitIndex: number, machineIndex: number) => {
    setFormData((prev) => {
      const newUnits = [...prev.units];
      newUnits[unitIndex].machines = newUnits[unitIndex].machines.filter((_, i) => i !== machineIndex);
      return { ...prev, units: newUnits };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));
      console.log("Form Data Submitted:", formData);
      setSuccess("Data monitoring berhasil disimpan!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data monitoring. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/monitoringmaintenance");
  }, [navigate]);

  const renderSteps = () => {
    return (
      <div className="flex justify-around items-center mb-8 border-b-2 border-gray-100">
        <button type="button" onClick={() => setCurrentStep(1)} className={`px-4 py-2 font-medium ${currentStep === 1 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"}`}>
          1. Date
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(2)}
          disabled={!formData.startDate || !formData.endDate}
          className={`px-4 py-2 font-medium ${currentStep === 2 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!formData.startDate || !formData.endDate ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          2. Unit
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(3)}
          disabled={!formData.units.some((u) => u.unit)}
          className={`px-4 py-2 font-medium ${currentStep === 3 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!formData.units.some((u) => u.unit) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          3. Machine & Interval
        </button>
        <button
          type="button"
          onClick={() => setCurrentStep(4)}
          disabled={!formData.units.some((u) => u.machines.some((m) => m.mesin))}
          className={`px-4 py-2 font-medium ${currentStep === 4 ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${!formData.units.some((u) => u.machines.some((m) => m.mesin)) ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          4. Item
        </button>
      </div>
    );
  };

  const renderContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Tanggal Monitoring</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData({ ...formData, startDate: date })}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Pilih Tanggal Mulai"
                  isClearable
                />
              </div>
              <div className="text-gray-400 hidden md:block mt-6">
                <ArrowRight size={24} />
              </div>
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <DatePicker
                  selected={formData.endDate}
                  onChange={(date) => setFormData({ ...formData, endDate: date })}
                  dateFormat="dd/MM/yyyy"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholderText="Pilih Tanggal Selesai"
                  isClearable
                />
              </div>
            </div>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Unit</h2>
            <div className="space-y-4">
              {formData.units.map((unitData, unitIndex) => (
                <motion.div key={unitIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center space-x-2">
                  <div className="flex-1">
                    <Select
                      options={dummyUnitList.map((u) => ({ value: u.nama_unit, label: u.nama_unit }))}
                      value={unitData.unit ? { value: unitData.unit, label: unitData.unit } : null}
                      onChange={(option) => handleUpdate(`units[${unitIndex}].unit`, option ? option.value : "")}
                      isClearable
                      placeholder="Pilih Unit"
                      styles={customSelectStyles}
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Mesin & Interval</h2>
            <div className="space-y-6">
              {formData.units.map(
                (unitData, unitIndex) =>
                  unitData.unit && (
                    <div key={unitIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-3">{unitData.unit}</h3>
                      <div className="space-y-4">
                        {unitData.machines.map((machineData, machineIndex) => (
                          <motion.div key={machineIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border border-gray-300 rounded-lg bg-white grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Mesin</label>
                              <Select
                                options={dummyMesinList.filter((m) => m.unit_id === unitData.unit).map((m) => ({ value: m.nama_mesin, label: m.nama_mesin }))}
                                value={machineData.mesin ? { value: machineData.mesin, label: machineData.mesin } : null}
                                onChange={(option) => {
                                  const selectedMachine = option ? option.value : "";
                                  handleUpdate(`units[${unitIndex}].machines[${machineIndex}].mesin`, selectedMachine);
                                  handleUpdate(`units[${unitIndex}].machines[${machineIndex}].items`, []);
                                }}
                                isClearable
                                placeholder="Pilih Mesin"
                                styles={customSelectStyles}
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                              <Select
                                options={intervalOptions}
                                value={machineData.interval ? { value: machineData.interval, label: machineData.interval } : null}
                                onChange={(option) => {
                                  const selectedInterval = option ? option.value : "";
                                  handleUpdate(`units[${unitIndex}].machines[${machineIndex}].interval`, selectedInterval);
                                  // Populate items based on selection
                                  const filteredItems = dummyItemsWithIntervals.filter((item) => item.unit === unitData.unit && item.machine === machineData.mesin && item.interval === selectedInterval);
                                  handleUpdate(`units[${unitIndex}].machines[${machineIndex}].items`, filteredItems);
                                }}
                                isClearable
                                placeholder="Pilih Interval"
                                styles={customSelectStyles}
                              />
                            </div>
                            <div className="md:col-span-2 flex justify-end">
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveMachine(unitIndex, machineIndex)} className="text-red-500 hover:text-red-700">
                                <Trash2 size={20} />
                              </motion.button>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleAddMachine(unitIndex)}
                        className="mt-4 flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors duration-200"
                      >
                        <Plus size={20} className="mr-2" /> Tambah Mesin
                      </motion.button>
                    </div>
                  )
              )}
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Item</h2>
            <div className="space-y-6">
              {formData.units.map(
                (unitData, unitIndex) =>
                  unitData.unit &&
                  unitData.machines.map(
                    (machineData, machineIndex) =>
                      machineData.mesin && (
                        <div key={`${unitIndex}-${machineIndex}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <h3 className="font-semibold text-gray-700 mb-3">
                            {unitData.unit} - {machineData.mesin} ({machineData.interval})
                          </h3>
                          {machineData.items.length > 0 ? (
                            <div className="space-y-4">
                              {machineData.items.map((itemData, itemIndex) => (
                                <motion.div key={itemIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border border-gray-300 rounded-lg bg-white">
                                  <h4 className="font-bold text-gray-800">
                                    Item: {itemData.item} ({itemData.satuan})
                                  </h4>
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic mt-2">No matching items for the selected interval.</p>
                          )}
                        </div>
                      )
                  )
              )}
            </div>
          </motion.div>
        );
      default:
        return null;
    }
  };

  const isNextDisabled = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !formData.startDate || !formData.endDate;
      case 2:
        return !formData.units[0].unit;
      case 3:
        return formData.units.some((u) => u.machines.length === 0 || u.machines.some((m) => !m.mesin || !m.interval));
      case 4:
        return formData.units.some((u) => u.machines.some((m) => m.items.length === 0));
      default:
        return true;
    }
  }, [currentStep, formData]);

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <motion.button onClick={() => navigate("/monitoringmaintenance")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ArrowLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Kembali ke Riwayat Monitoring</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Tambah Data Monitoring</h2>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Tambah Data Monitoring Baru</h1>
              <p className="text-gray-600 mt-1">Lengkapi detail untuk memulai</p>
            </div>
            <motion.button
              onClick={() => navigate("/monitoringmaintenance")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ArrowLeft className="text-lg" /> Kembali ke Riwayat
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
            {renderSteps()}
            <AnimatePresence mode="wait">{renderContent()}</AnimatePresence>
            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" /> Kembali
                </motion.button>
              )}
              {currentStep < 4 ? (
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={isNextDisabled}
                  whileHover={{ scale: isNextDisabled ? 1 : 1.03 }}
                  whileTap={{ scale: isNextDisabled ? 1 : 0.97 }}
                  className={`ml-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center ${
                    isNextDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                >
                  Lanjut <ChevronRight className="ml-2 h-5 w-5" />
                </motion.button>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isNextDisabled || loading}
                  whileHover={{ scale: isNextDisabled ? 1 : 1.03 }}
                  whileTap={{ scale: isNextDisabled ? 1 : 0.97 }}
                  className={`ml-auto px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center ${
                    isNextDisabled || loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
                  }`}
                >
                  {loading ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Simpan Data
                    </>
                  )}
                </motion.button>
              )}
            </div>
          </motion.div>
        </main>
      </div>
      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Data monitoring berhasil disimpan!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Monitoring History
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormMonitoringMaintenanceD;
