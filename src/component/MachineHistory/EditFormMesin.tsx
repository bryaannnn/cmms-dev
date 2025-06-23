import React, { useState, useEffect, useCallback } from "react";
import { FiSave, FiX, FiClock, FiCheck, FiTool } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useAuth, MachineHistoryFormData, Mesin, Shift, Group, StopTime, Unit, ItemTrouble, JenisAktivitas, Kegiatan, UnitSparePart, AllMasterData, MachineHistoryRecord } from "../../routes/AuthContext";
import { motion } from "framer-motion";

interface FormDataState extends Omit<MachineHistoryFormData, "stopJam" | "startJam" | "stopMenit" | "startMenit"> {
  stopJam: number | null;
  startJam: number | null;
  stopMenit: number | null;
  startMenit: number | null;
}

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getAllMasterData, getMachineHistoryById, updateMachineHistory } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [mesinList, setMesinList] = useState<Mesin[]>([]);
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [groupList, setGroupList] = useState<Group[]>([]);
  const [stopTimeList, setStopTimeList] = useState<StopTime[]>([]);
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [itemTroubleList, setItemTroubleList] = useState<ItemTrouble[]>([]);
  const [jenisAktivitasList, setJenisAktivitasList] = useState<JenisAktivitas[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [unitSparePartList, setUnitSparePartList] = useState<UnitSparePart[]>([]);

  const [formData, setFormData] = useState<FormDataState>({
    date: new Date().toISOString().split("T")[0],
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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: string) => {
    if (e && typeof e === "object" && "value" in e && name) {
      setFormData((prev) => ({ ...prev, [name]: e.value }));
    } else if (e && "target" in e) {
      const { name, value } = e.target;

      setFormData((prev) => {
        if (["stopJam", "startJam"].includes(name)) {
          const cleanedValue = value.replace(/[^\d]/g, "");
          return {
            ...prev,
            [name]: cleanedValue === "" ? null : parseInt(cleanedValue, 10),
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
    if (num === null || num === undefined || num === "") return "";

    if (typeof num === "string") {
      const cleanedString = num.replace(/[^\d]/g, "");
      if (cleanedString === "") return "";
      const numericValue = parseInt(cleanedString, 10);
      if (isNaN(numericValue)) return "";
      return numericValue.toLocaleString("id-ID").replace(/,/g, ".");
    }

    if (isNaN(num)) return "";
    return num.toLocaleString("id-ID").replace(/,/g, ".");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!id) {
      setError("Machine history ID is missing.");
      setLoading(false);
      return;
    }

    if ((formData.stopJam !== null && formData.stopJam < 0) || (formData.startJam !== null && formData.startJam < 0) || (formData.stopMenit !== null && formData.stopMenit < 0) || (formData.startMenit !== null && formData.startMenit < 0)) {
      setError("Waktu tidak boleh bernilai negatif");
      setLoading(false);
      return;
    }

    const transformTime = (hour: number | null, minute: number | null) => {
      if (hour === null || minute === null) return null;
      return {
        hour: hour % 24,
        minute: minute % 60,
      };
    };

    const stopTime = transformTime(formData.stopJam, formData.stopMenit);
    const startTime = transformTime(formData.startJam, formData.startMenit);

    const dataToSend: MachineHistoryFormData = {
      ...formData,
      stopJam: stopTime?.hour ?? null,
      stopMenit: stopTime?.minute ?? null,
      startJam: startTime?.hour ?? null,
      startMenit: startTime?.minute ?? null,
      perbaikanPerawatan: formData.jenisAktivitas === "JA1" ? "Perbaikan" : "Perawatan",
      runningHour: formData.runningHour ? parseInt(String(formData.runningHour).replace(/\./g, ""), 10) : 0,
      jumlah: formData.jumlah ? parseInt(String(formData.jumlah).replace(/\./g, ""), 10) : 0,
    };

    try {
      await updateMachineHistory(id, dataToSend);
      setSuccess("Data berhasil diperbarui!");
      setTimeout(() => navigate("/machinehistory"), 1500);
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || "Gagal memperbarui data.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      date: new Date().toISOString().split("T")[0],
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const masterDataResult: AllMasterData = await getAllMasterData();
        setMesinList(masterDataResult.mesin || []);
        setShiftList(masterDataResult.shifts || []);
        setGroupList(masterDataResult.groups || []);
        setStopTimeList(masterDataResult.stoptimes || []);
        setUnitList(masterDataResult.units || []);
        setItemTroubleList(masterDataResult.itemtroubles || []);
        setJenisAktivitasList(masterDataResult.jenisaktivitas || []);
        setKegiatanList(masterDataResult.kegiatans || []);
        setUnitSparePartList(masterDataResult.unitspareparts || []);

        if (id) {
          const machineDataResult: MachineHistoryRecord | null = await getMachineHistoryById(id);
          if (machineDataResult) {
            setFormData({
              date: machineDataResult.date,
              shift: machineDataResult.shift,
              group: machineDataResult.group,
              stopJam: machineDataResult.stopJam ?? null,
              stopMenit: machineDataResult.stopMenit ?? null,
              startJam: machineDataResult.startJam ?? null,
              startMenit: machineDataResult.startMenit ?? null,
              stopTime: machineDataResult.stopTime,
              unit: machineDataResult.unit,
              mesin: machineDataResult.mesin,
              runningHour: machineDataResult.runningHour,
              itemTrouble: machineDataResult.itemTrouble,
              jenisGangguan: machineDataResult.jenisGangguan,
              bentukTindakan: machineDataResult.bentukTindakan,
              perbaikanPerawatan: machineDataResult.perbaikanPerawatan,
              rootCause: machineDataResult.rootCause,
              jenisAktivitas: machineDataResult.jenisAktivitas,
              kegiatan: machineDataResult.kegiatan,
              kodePart: machineDataResult.kodePart,
              sparePart: machineDataResult.sparePart,
              idPart: machineDataResult.idPart,
              jumlah: machineDataResult.jumlah,
              unitSparePart: machineDataResult.unitSparePart,
            });
          } else {
            setError("Data history mesin tidak ditemukan.");
          }
        } else {
          setError("ID history mesin tidak diberikan untuk pengeditan.");
        }
      } catch (error: any) {
        setError(error.message || "Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, getAllMasterData, getMachineHistoryById]);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none",
      "&:hover": {
        borderColor: "#9CA3AF",
      },
      borderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      padding: "0 0.5rem",
      transition: "all 0.15s ease-in-out",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": {
        color: "#6B7280",
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 text-lg font-semibold">Loading data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <FiTool className="mr-3 text-blue-600" /> Edit Machine History Record {id && `(ID: ${id})`}
            </h1>
            <p className="text-gray-600 mt-1">Update maintenance activities and machine issues</p>
          </div>
          <motion.button
            onClick={() => navigate("/machinehistory")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            aria-label="Close form"
          >
            <FiX className="text-xl" />
          </motion.button>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Processing!</strong>
            <span className="block sm:inline"> Sedang menyimpan data...</span>
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Success!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
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
                    Shift
                  </label>
                  <Select
                    name="shift"
                    id="shift"
                    options={shiftList.map((shift) => ({ value: shift.id, label: shift.name }))}
                    value={shiftList.map((shift) => ({ value: shift.id, label: shift.name })).find((option) => option.value === formData.shift)}
                    onChange={(selectedOption) => handleChange(selectedOption, "shift")}
                    placeholder="Select Shift"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  <Select
                    name="group"
                    id="group"
                    options={groupList.map((group) => ({ value: group.id, label: group.name }))}
                    value={groupList.map((group) => ({ value: group.id, label: group.name })).find((option) => option.value === formData.group)}
                    onChange={(selectedOption) => handleChange(selectedOption, "group")}
                    placeholder="Select Group"
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-red-500" /> Stop Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700 mb-1">
                    Hour (HH)
                    {formData.stopJam !== null && formData.stopJam > 23 && <span className="text-xs text-yellow-600 ml-2">Will be saved as: {formData.stopJam % 24}</span>}
                  </label>
                  <input
                    type="number"
                    name="stopJam"
                    id="stopJam"
                    value={formData.stopJam === null ? "" : formData.stopJam}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 09 (leave empty if not applicable)"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM)
                  </label>
                  <input
                    type="number"
                    name="stopMenit"
                    id="stopMenit"
                    value={formData.stopMenit === null ? "" : formData.stopMenit}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    placeholder="e.g., 30"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Stop Type
                </label>
                <Select
                  name="stopTime"
                  id="stopTime"
                  options={stopTimeList.map((stopTime) => ({ value: stopTime.id, label: stopTime.name }))}
                  value={stopTimeList.map((stopTime) => ({ value: stopTime.id, label: stopTime.name })).find((option) => option.value === formData.stopTime)}
                  onChange={(selectedOption) => handleChange(selectedOption, "stopTime")}
                  placeholder="Select Stop Type"
                  styles={customSelectStyles}
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="mr-2 text-green-500" /> Start Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startJam" className="block text-sm font-medium text-gray-700 mb-1">
                    Hour (HH)
                    {formData.startJam !== null && formData.startJam > 23 && <span className="text-xs text-yellow-600 ml-2">Will be saved as: {formData.startJam % 24}</span>}
                  </label>
                  <input
                    type="number"
                    name="startJam"
                    id="startJam"
                    value={formData.startJam === null ? "" : formData.startJam}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 09 (leave empty if not applicable)"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM)
                  </label>
                  <input
                    type="number"
                    name="startMenit"
                    id="startMenit"
                    value={formData.startMenit === null ? "" : formData.startMenit}
                    onChange={handleChange}
                    min="0"
                    max="59"
                    placeholder="e.g., 15"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-blue-500" /> Machine Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <Select
                    name="unit"
                    id="unit"
                    options={unitList.map((unit) => ({ value: unit.id, label: unit.name }))}
                    value={unitList.map((unit) => ({ value: unit.id, label: unit.name })).find((option) => option.value === formData.unit)}
                    onChange={(selectedOption) => handleChange(selectedOption, "unit")}
                    placeholder="Select Unit"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mesin" className="block text-sm font-medium text-gray-700 mb-1">
                    Machine
                  </label>
                  <Select
                    name="mesin"
                    id="mesin"
                    options={mesinList.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name }))}
                    value={mesinList.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name })).find((option) => option.value === formData.mesin)}
                    onChange={(selectedOption) => handleChange(selectedOption, "mesin")}
                    placeholder="Select Machine"
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Running Hours
                </label>
                <input
                  type="text"
                  name="runningHour"
                  id="runningHour"
                  value={formatNumberWithDot(formData.runningHour)}
                  onChange={handleChange}
                  placeholder="e.g., 15.000"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-yellow-500" /> Problem & Action
              </h2>
              <div className="mb-4">
                <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Trouble
                </label>
                <Select
                  name="itemTrouble"
                  id="itemTrouble"
                  options={itemTroubleList.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name }))}
                  value={itemTroubleList.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name })).find((option) => option.value === formData.itemTrouble)}
                  onChange={(selectedOption) => handleChange(selectedOption, "itemTrouble")}
                  placeholder="Select Item Trouble"
                  styles={customSelectStyles}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description
                  </label>
                  <textarea
                    name="jenisGangguan"
                    id="jenisGangguan"
                    value={formData.jenisGangguan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the issue..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700 mb-1">
                    Action Taken
                  </label>
                  <textarea
                    name="bentukTindakan"
                    id="bentukTindakan"
                    value={formData.bentukTindakan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the action taken..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-1">
                  Root Cause
                </label>
                <textarea
                  name="rootCause"
                  id="rootCause"
                  value={formData.rootCause}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Identify the root cause..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="mr-2 text-purple-500" /> Activity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <Select
                    name="jenisAktivitas"
                    id="jenisAktivitas"
                    options={jenisAktivitasList.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name }))}
                    value={jenisAktivitasList.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name })).find((option) => option.value === formData.jenisAktivitas)}
                    onChange={(selectedOption) => handleChange(selectedOption, "jenisAktivitas")}
                    placeholder="Select Activity Type"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Activity
                  </label>
                  <Select
                    name="kegiatan"
                    id="kegiatan"
                    options={kegiatanList.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name }))}
                    value={kegiatanList.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })).find((option) => option.value === formData.kegiatan)}
                    onChange={(selectedOption) => handleChange(selectedOption, "kegiatan")}
                    placeholder="Select Activity"
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-indigo-500" /> Spare Parts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
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
                    placeholder="e.g., KODE123"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700 mb-1">
                    Part Name
                  </label>
                  <input
                    type="text"
                    name="sparePart"
                    id="sparePart"
                    value={formData.sparePart}
                    onChange={handleChange}
                    placeholder="e.g., Bearing XYZ"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
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
                    placeholder="e.g., ID456"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
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
                    placeholder="e.g., 5"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <Select
                  name="unitSparePart"
                  id="unitSparePart"
                  options={unitSparePartList.map((unitSP) => ({ value: unitSP.id, label: unitSP.name }))}
                  value={unitSparePartList.map((unitSP) => ({ value: unitSP.id, label: unitSP.name })).find((option) => option.value === formData.unitSparePart)}
                  onChange={(selectedOption) => handleChange(selectedOption, "unitSparePart")}
                  placeholder="Select Unit"
                  styles={customSelectStyles}
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={() => navigate(`/machinehistory/${id}`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <FiX className="inline mr-2" /> Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Updating...
                  </>
                ) : (
                  <>
                    <FiSave className="inline mr-2" /> Save Changes
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditMesin;
