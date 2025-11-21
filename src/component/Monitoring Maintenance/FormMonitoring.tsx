import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../Sidebar";
import PageHeader from "../PageHeader";
import { X, CheckCircle, ArrowLeft, Save, Hourglass, Plus, ChevronLeft, ChevronRight, Trash2, ArrowRight, Monitor } from "lucide-react";
import { useAuth, AllMasterMonitoring, UnitWithMachines, MesinDetail, ItemMesin } from "../../routes/AuthContext";

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

interface FormUnit {
  id: number;
  name: string;
  machines: FormMachine[];
}

interface FormMachine {
  id: number;
  name: string;
  intervalId: number | null; // Tambahkan intervalId
  intervalType?: string; // Opsional: untuk display
  items: FormItem[];
  masterItems: FormItem[];
}

interface FormItem extends ItemMesin {
  hasil_monitoring?: string;
  hasil_keterangan?: string;
  interval_type?: string;
  uom: string;
}

interface FormState {
  startDate: Date | null;
  endDate: Date | null;
  units: FormUnit[];
}

const FormMonitoringMaintenance: React.FC = () => {
  const navigate = useNavigate();
  const { getAllMasterMonitoring, addMonitoringSchedule, addMonitoringActivities, getMesinDetail } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });
  const toggleSidebar = (): void => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [masterData, setMasterData] = useState<AllMasterMonitoring | null>(null);
  const [isLoadingMasterData, setIsLoadingMasterData] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);

  const [formData, setFormData] = useState<FormState>({
    startDate: null,
    endDate: null,
    units: [],
  });

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

  // Fetch master data on component mount
  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setIsLoadingMasterData(true);
        const data = await getAllMasterMonitoring();
        console.log("Master Data intervals ready to set:", data.intervals);
        setMasterData(data);
      } catch (err) {
        setError("Gagal memuat data master");
      } finally {
        setIsLoadingMasterData(false);
      }
    };

    fetchMasterData();
  }, [getAllMasterMonitoring]);

  // Form handlers
  const handleAddUnit = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      units: [...prev.units, { id: 0, name: "", machines: [] }],
    }));
  }, []);

  const handleRemoveUnit = useCallback((unitIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      units: prev.units.filter((_, i) => i !== unitIndex),
    }));
  }, []);

  const handleUnitSelect = useCallback(
    (unitIndex: number, selectedOption: any) => {
      if (selectedOption) {
        const selectedUnit = masterData?.unitsWithMachines?.find((u) => u.id === selectedOption.value);

        if (selectedUnit) {
          setFormData((prev) => {
            const newUnits = [...prev.units];
            newUnits[unitIndex] = {
              id: selectedUnit.id,
              name: selectedUnit.name,
              machines: [],
            };
            return { ...prev, units: newUnits };
          });
        }
      } else {
        setFormData((prev) => {
          const newUnits = [...prev.units];
          newUnits[unitIndex] = { id: 0, name: "", machines: [] };
          return { ...prev, units: newUnits };
        });
      }
    },
    [masterData]
  );

  const handleAddMachine = useCallback((unitIndex: number) => {
    setFormData((prev) => {
      const newUnits = [...prev.units];
      newUnits[unitIndex].machines = [
        ...newUnits[unitIndex].machines,
        {
          id: 0,
          name: "",
          intervalId: null, // Add this required property
          items: [],
          masterItems: [],
        },
      ];
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

  const handleMachineSelect = useCallback(
    async (unitIndex: number, machineIndex: number, selectedOption: any) => {
      if (selectedOption) {
        try {
          // 💡 SOLUSI 1: Hapus .data jika getMesinDetail mengembalikan MesinDetail
          const selectedMachineDetail = await getMesinDetail(selectedOption.value);

          if (selectedMachineDetail) {
            // 💡 SOLUSI 2: Eksplisitkan tipe parameter 'item'
            const masterItems: FormItem[] = selectedMachineDetail.item_mesin.map(
              (item: ItemMesin): FormItem => ({
                // Properti dari ItemMesin (termasuk interval_id)
                ...item,
                item_mesin: item.item_mesin,
                uom: item.satuan,

                // Properti frontend tambahan
                hasil_monitoring: "",
                hasil_keterangan: "",
                interval_type: "",
              })
            );

            setFormData((prev) => {
              const newUnits = [...prev.units];

              // 💡 SOLUSI 3: masterItems sekarang properti yang valid di FormMachine
              newUnits[unitIndex].machines[machineIndex] = {
                id: selectedMachineDetail.id,
                name: selectedMachineDetail.name,
                intervalId: null,
                intervalType: undefined,
                masterItems: masterItems, // ✅ Valid setelah interface diperbarui
                items: [],
              };
              return { ...prev, units: newUnits };
            });
          }
        } catch (error) {
          console.error("Error fetching machine detail:", error);
          setError("Gagal memuat detail mesin");
        }
      } else {
        setFormData((prev) => {
          const newUnits = [...prev.units];
          newUnits[unitIndex].machines[machineIndex] = {
            id: 0,
            name: "",
            intervalId: null,
            intervalType: undefined,
            masterItems: [], // ✅ Valid setelah interface diperbarui
            items: [],
          };
          return { ...prev, units: newUnits };
        });
      }
    },
    [getMesinDetail]
  );

  const handleIntervalSelect = useCallback(
    (unitIndex: number, machineIndex: number, selectedOption: any) => {
      console.log("1. Selected Option:", selectedOption);
      console.log("1. Machine ID:", formData.units[unitIndex]?.machines[machineIndex]?.id);

      if (selectedOption && formData.units[unitIndex]?.machines[machineIndex]?.id) {
        const selectedInterval = masterData?.intervals?.find((interval) => {
          // 💡 DEBUG PENTING: Bandingkan tipe data
          console.log(`2. Comparing value: ${selectedOption.value} (Type: ${typeof selectedOption.value}) === ${interval.id_interval} (Type: ${typeof interval.id_interval})`);

          // Gunakan perbandingan yang sensitif terhadap tipe data jika Anda mencurigai ada perbedaan tipe.
          // Jika id_interval adalah number dan value adalah string:
          return interval.id_interval === Number(selectedOption.value);
        });

        console.log("2. Found Interval:", selectedInterval);

        if (selectedInterval) {
          setFormData((prev) => {
            const newUnits = [...prev.units];
            const currentMachine = newUnits[unitIndex].machines[machineIndex];

            const filteredItems = currentMachine.masterItems.filter((item) => item.interval_id === selectedInterval.id_interval);

            newUnits[unitIndex].machines[machineIndex] = {
              ...currentMachine,
              intervalId: selectedInterval.id_interval,
              intervalType: selectedInterval.type_interval,
              items: filteredItems.map((item) => ({
                // items diisi dengan hasil filter dari masterItems
                ...item,
                interval_type: selectedInterval.type_interval,
              })),
            };
            return { ...prev, units: newUnits };
          });
        } else {
          console.error("Interval not found in masterData, possible ID mismatch.");
        }
      } else {
        // Logika clear/reset interval
        setFormData((prev) => {
          const newUnits = [...prev.units];
          const currentMachine = newUnits[unitIndex].machines[machineIndex];

          newUnits[unitIndex].machines[machineIndex] = {
            ...currentMachine,
            intervalId: null,
            intervalType: undefined,
            // 💡 Perbaiki: Kosongkan items (agar tidak ada item yang dikirim saat interval dihapus)
            items: [],
            // Tidak perlu memetakan currentMachine.items karena sudah di-reset di sini
          };
          return { ...prev, units: newUnits };
        });

        console.log("1. Skipping filter: Selected Option is null/clear or Machine ID is missing.");
      }
    },
    [masterData, formData.units]
  );

  const handleItemChange = useCallback((unitIndex: number, machineIndex: number, itemIndex: number, field: string, value: string) => {
    setFormData((prev) => {
      const newUnits = [...prev.units];
      newUnits[unitIndex].machines[machineIndex].items[itemIndex] = {
        ...newUnits[unitIndex].machines[machineIndex].items[itemIndex],
        [field]: value,
      };
      return { ...prev, units: newUnits };
    });
  }, []);

  // Untuk nama bulan dalam bahasa Inggris
  const namaBulan = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validation
      if (!formData.startDate || !formData.endDate) {
        throw new Error("Tanggal mulai dan selesai harus diisi");
      }

      if (formData.units.length === 0 || formData.units.some((unit) => !unit.id)) {
        throw new Error("Pilih setidaknya satu unit");
      }

      // FIX: Format tanggal tanpa timezone conversion
      const formatDateWithoutTimezone = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        return `${year}-${month}-${day}`;
      };

      const monitoringSchedules = [];
      const monitoringActivities = [];

      // Create monitoring schedules and activities
      for (const unit of formData.units) {
        for (const machine of unit.machines) {
          if (machine.id && machine.items.length > 0) {
            const itemMesinIds = machine.items.map((item) => item.id);

            const scheduleData = {
              tahun: formData.startDate.getFullYear(),
              bulan: namaBulan[formData.startDate.getMonth()],
              tgl_start: formatDateWithoutTimezone(formData.startDate),
              tgl_end: formatDateWithoutTimezone(formData.endDate),
              unit: unit.name,
              id_mesins: machine.id,
              id_interval: machine.intervalId || 1,
              item_mesin_ids: itemMesinIds, // PERBAIKAN: Kirim array ID item mesin
            };

            const scheduleResponse = await addMonitoringSchedule(scheduleData);
            monitoringSchedules.push(scheduleResponse);
          }
        }
      }

      if (monitoringSchedules.length === 0) {
        throw new Error("Tidak ada data monitoring yang valid untuk disimpan");
      }

      setSuccess("Data monitoring berhasil disimpan!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data monitoring");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/monitoringmaintenance");
  }, [navigate]);

  // Step validation
  const isNextDisabled = useMemo(() => {
    switch (currentStep) {
      case 1:
        return !formData.startDate || !formData.endDate;
      case 2:
        return formData.units.length === 0 || formData.units.every((u) => !u.id);
      case 3:
        // Validasi: minimal ada satu mesin yang sudah dipilih mesin DAN interval-nya
        return formData.units.every((u) => u.machines.length === 0 || u.machines.every((m) => !m.id || !m.intervalId || m.items.length === 0));
      case 4:
        // PERBAIKAN: Untuk step 4, tidak perlu validasi hasil monitoring
        // Cukup pastikan ada minimal satu mesin dengan items
        const hasValidMachines = formData.units.some((u) => u.machines.some((m) => m.id && m.intervalId && m.items.length > 0));
        return !hasValidMachines;
      default:
        return true;
    }
  }, [currentStep, formData]);

  // Render steps navigation
  const renderSteps = () => (
    <div className="flex justify-around items-center mb-8 border-b-2 border-gray-100">
      {[1, 2, 3, 4].map((step) => (
        <button
          key={step}
          type="button"
          onClick={() => setCurrentStep(step)}
          disabled={
            (step === 2 && (!formData.startDate || !formData.endDate)) ||
            (step === 3 && (formData.units.length === 0 || formData.units.every((u) => !u.id))) ||
            (step === 4 && formData.units.every((u) => u.machines.every((m) => !m.id || !m.intervalId)))
          }
          className={`px-4 py-2 font-medium ${currentStep === step ? "border-b-2 border-blue-500 text-blue-600" : "text-gray-500"} ${
            (step === 2 && (!formData.startDate || !formData.endDate)) ||
            (step === 3 && (formData.units.length === 0 || formData.units.every((u) => !u.id))) ||
            (step === 4 && formData.units.every((u) => u.machines.every((m) => !m.id || !m.intervalId)))
              ? "opacity-50 cursor-not-allowed"
              : ""
          }`}
        >
          {step}. {["Date", "Unit", "Machine & Interval", "Item"][step - 1]}
        </button>
      ))}
    </div>
  );

  // Render step content
  const renderStepContent = () => {
    if (isLoadingMasterData) {
      return (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    switch (currentStep) {
      case 1:
        return (
          <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Monitoring Schedule</h2>
            <div className="flex flex-col md:flex-row md:items-center gap-6 md:gap-8">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <DatePicker
                  selected={formData.startDate}
                  onChange={(date) => setFormData((prev) => ({ ...prev, startDate: date }))}
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
                  onChange={(date) => setFormData((prev) => ({ ...prev, endDate: date }))}
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
          <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Unit</h2>
            <div className="space-y-4">
              {formData.units.map((unit, unitIndex) => (
                <motion.div key={unitIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-gray-200 rounded-lg bg-gray-50 flex items-center space-x-2">
                  <div className="flex-1">
                    <Select
                      options={masterData?.unitsWithMachines?.map((u) => ({ value: u.id, label: u.name })) || []}
                      value={unit.id ? { value: unit.id, label: unit.name } : null}
                      onChange={(option) => handleUnitSelect(unitIndex, option)}
                      isClearable
                      placeholder="Pilih Unit"
                      styles={customSelectStyles}
                      noOptionsMessage={() => "Tidak ada unit tersedia"}
                    />
                  </div>
                  {formData.units.length > 1 && (
                    <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveUnit(unitIndex)} className="text-red-500 hover:text-red-700 p-1" type="button">
                      <Trash2 size={20} />
                    </motion.button>
                  )}
                </motion.div>
              ))}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddUnit}
                className="flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                type="button"
              >
                <Plus size={20} className="mr-2" /> Add Unit
              </motion.button>
            </div>
          </motion.div>
        );

      case 3:
        return (
          <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Machine & Interval</h2>
            <div className="space-y-6">
              {formData.units.map(
                (unit, unitIndex) =>
                  unit.id && (
                    <div key={unitIndex} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <h3 className="font-semibold text-gray-700 mb-3">{unit.name}</h3>
                      <div className="space-y-4">
                        {unit.machines.map((machine, machineIndex) => (
                          <motion.div key={machineIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 border border-gray-300 rounded-lg bg-white space-y-4">
                            {/* Pilihan Mesin */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                                <Select
                                  options={
                                    masterData?.unitsWithMachines
                                      ?.find((u) => u.id === unit.id)
                                      ?.mesin?.map((m) => ({
                                        value: m.id,
                                        label: m.name,
                                      })) || []
                                  }
                                  value={machine.id ? { value: machine.id, label: machine.name } : null}
                                  onChange={(option) => handleMachineSelect(unitIndex, machineIndex, option)}
                                  isClearable
                                  placeholder="Select Machine"
                                  styles={customSelectStyles}
                                />
                              </div>

                              {/* Pilihan Interval */}
                              <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Interval</label>
                                <Select
                                  options={
                                    masterData && masterData.intervals
                                      ? masterData.intervals.map((interval) => ({
                                          value: interval.id_interval,
                                          label: interval.type_interval,
                                        }))
                                      : []
                                  }
                                  value={
                                    machine.intervalId
                                      ? {
                                          value: machine.intervalId,
                                          label: machine.intervalType,
                                        }
                                      : null
                                  }
                                  onChange={(option) => handleIntervalSelect(unitIndex, machineIndex, option)}
                                  isClearable
                                  placeholder={machine.id ? "Select Interval" : "Please Select Machine"}
                                  isDisabled={!machine.id || machine.masterItems.length === 0}
                                  styles={customSelectStyles}
                                />
                              </div>
                            </div>

                            {/* Info Items */}
                            {machine.id && (
                              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                <div className="flex items-center justify-between">
                                  {/* 🛑 PERBAIKAN: Gunakan masterItems.length untuk Total item yang tersedia */}
                                  <span className="text-sm font-medium text-blue-800">Total {machine.masterItems.length} item monitoring tersedia</span>
                                  {machine.intervalId && (
                                    <span className="text-sm text-green-600">
                                      {/* 🛑 PERBAIKAN: Filter masterItems untuk menghitung item yang cocok */}
                                      {machine.masterItems.filter((item) => item.interval_id === machine.intervalId).length} item untuk interval {machine.intervalType}
                                    </span>
                                  )}
                                </div>
                                {/* 🛑 PERBAIKAN: Cek item kosong juga dari masterItems */}
                                {machine.masterItems.length === 0 && <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded mt-2 inline-block">Mesin ini belum memiliki item monitoring</span>}
                              </div>
                            )}

                            <div className="flex justify-end">
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
                        className="mt-4 flex items-center justify-center w-full px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-100"
                      >
                        <Plus size={20} className="mr-2" /> Add Machine
                      </motion.button>
                    </div>
                  )
              )}
            </div>
          </motion.div>
        );

      case 4:
        return (
          <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Item Monitoring</h2>
            <div className="space-y-6">
              {formData.units.map(
                (unit, unitIndex) =>
                  unit.id &&
                  unit.machines.map(
                    (machine, machineIndex) =>
                      machine.id && (
                        <div key={`${unitIndex}-${machineIndex}`} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                          <h3 className="font-semibold text-gray-700 mb-3">
                            {unit.name} - {machine.name}
                          </h3>
                          {machine.items.length > 0 ? (
                            <div className="space-y-4">
                              {machine.items.map((item, itemIndex) => (
                                <motion.div key={itemIndex} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-3 border border-gray-300 rounded-lg bg-white">
                                  <h4 className="font-bold text-gray-800 mb-2">
                                    {item.item_mesin} ({item.satuan})
                                  </h4>
                                  {item.interval_type && <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">{item.interval_type}</span>}
                                  {item.standard_min && item.standard_max && (
                                    <p className="text-sm text-gray-600 mb-2">
                                      Standar: {item.standard_min} - {item.standard_max}
                                    </p>
                                  )}
                                  {item.standard_visual && <p className="text-sm text-gray-600 mb-2">Standar Visual: {item.standard_visual}</p>}
                                </motion.div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-500 italic mt-2">Tidak ada item monitoring untuk mesin ini.</p>
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

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Create Monitoring Schedule"
          mainTitleHighlight="Create Monitoring Schedule"
          description="Manage user roles and permissions to control access and functionality within the system."
          icon={<Monitor />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create Monitoring Schedule</h1>
              <p className="text-gray-600 mt-1">All create detail for monitoring schedule</p>
            </div>
            <motion.button
              onClick={() => navigate("/monitoringmaintenance")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg shadow-md"
            >
              <ArrowLeft className="text-lg" /> Back To Monitoring Maintenance
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
                </span>
              </motion.div>
            )}

            {renderSteps()}
            <AnimatePresence mode="wait">{renderStepContent()}</AnimatePresence>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-100">
              {currentStep > 1 && (
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 flex items-center"
                >
                  <ChevronLeft className="mr-2 h-5 w-5" /> Back
                </motion.button>
              )}

              {currentStep < 4 ? (
                <motion.button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev + 1)}
                  disabled={isNextDisabled}
                  whileHover={{ scale: isNextDisabled ? 1 : 1.03 }}
                  whileTap={{ scale: isNextDisabled ? 1 : 0.97 }}
                  className={`ml-auto px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 focus:ring-2 focus:ring-blue-500 flex items-center ${
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
                  className={`ml-auto px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 focus:ring-2 focus:ring-blue-500 flex items-center ${
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
                      <Save className="mr-2 h-5 w-5" /> Save Monitoring
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
          <p className="text-lg font-medium text-gray-800 text-center">Data monitoring schedule berhasil disimpan!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Go to Monitoring Mainteannce
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormMonitoringMaintenance;
