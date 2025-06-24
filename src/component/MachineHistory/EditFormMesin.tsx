import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../routes/AuthContext";
import Select from "react-select";
import { motion } from "framer-motion";
import { FiTool, FiClock, FiCheck, FiX, FiSave, FiTrash2 } from "react-icons/fi";

interface OptionType {
  value: string | number;
  label: string;
}

import { MachineHistoryFormData } from "../../routes/AuthContext";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | OptionType | null, name?: string) => {
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: (e as OptionType)?.value || "",
      }));
    } else if (e && "target" in e) {
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const { name, value, type } = target;

      if (type === "number" || name === "runningHour" || name === "jumlah") {
        let numericValue: number | null = null;
        if (value !== "") {
          const cleanedValue = value.replace(/\./g, "");
          numericValue = Number(cleanedValue);
        }

        if (name === "startJam" || name === "stopJam") {
          if (numericValue !== null && (numericValue < 0 || numericValue > 23)) {
            setError("Jam harus antara 0 dan 23.");
            setSubmitting(false); // Pastikan tidak bisa submit jika ada error
            return;
          } else {
            setError(null); // Clear error jika sudah valid
          }
        } else if (name === "startMenit" || name === "stopMenit") {
          if (numericValue !== null && (numericValue < 0 || numericValue > 59)) {
            setError("Menit harus antara 0 dan 59.");
            setSubmitting(false); // Pastikan tidak bisa submit jika ada error
            return;
          } else {
            setError(null); // Clear error jika sudah valid
          }
        }

        setFormData((prev) => ({
          ...prev,
          [name]: numericValue,
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  const formatNumberWithDot = (num: number | null): string => {
    if (num === null || isNaN(num)) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    const requiredStringFields: Array<keyof MachineHistoryFormData> = ["jenisGangguan", "bentukTindakan", "rootCause", "kodePart", "sparePart", "idPart"];

    for (const field of requiredStringFields) {
      if (!formData[field]) {
        setError(`Kolom '${field}' wajib diisi.`);
        setSubmitting(false);
        return;
      }
    }

    if (formData.runningHour === null || isNaN(formData.runningHour)) {
      setError("Kolom 'Running Hours' wajib diisi dan harus berupa angka.");
      setSubmitting(false);
      return;
    }
    if (formData.jumlah === null || isNaN(formData.jumlah)) {
      setError("Kolom 'Quantity' wajib diisi dan harus berupa angka.");
      setSubmitting(false);
      return;
    }

    // Client-side validation for time inputs before submission
    if (formData.stopJam === null || isNaN(formData.stopJam) || formData.stopJam < 0 || formData.stopJam > 23) {
      setError("Jam Berhenti wajib diisi dan harus antara 0 dan 23.");
      setSubmitting(false);
      return;
    }
    if (formData.stopMenit === null || isNaN(formData.stopMenit) || formData.stopMenit < 0 || formData.stopMenit > 59) {
      setError("Menit Berhenti wajib diisi dan harus antara 0 dan 59.");
      setSubmitting(false);
      return;
    }
    if (formData.startJam === null || isNaN(formData.startJam) || formData.startJam < 0 || formData.startJam > 23) {
      setError("Jam Mulai wajib diisi dan harus antara 0 dan 23.");
      setSubmitting(false);
      return;
    }
    if (formData.startMenit === null || isNaN(formData.startMenit) || formData.startMenit < 0 || formData.startMenit > 59) {
      setError("Menit Mulai wajib diisi dan harus antara 0 dan 59.");
      setSubmitting(false);
      return;
    }

    const dataToSend: MachineHistoryFormData = {
      date: formData.date,
      shift: formData.shift,
      group: formData.group,
      stopJam: formData.stopJam,
      stopMenit: formData.stopMenit,
      startJam: formData.startJam,
      startMenit: formData.startMenit,
      stopTime: formData.stopTime,
      unit: formData.unit,
      mesin: formData.mesin,
      runningHour: formData.runningHour,
      itemTrouble: formData.itemTrouble,
      jenisGangguan: formData.jenisGangguan,
      bentukTindakan: formData.bentukTindakan,
      perbaikanPerawatan: formData.perbaikanPerawatan,
      rootCause: formData.rootCause,
      jenisAktivitas: formData.jenisAktivitas,
      kegiatan: formData.kegiatan,
      kodePart: formData.kodePart,
      sparePart: formData.sparePart,
      idPart: formData.idPart,
      jumlah: formData.jumlah,
      unitSparePart: formData.unitSparePart,
    };

    try {
      const response = await updateMachineHistory(id!, dataToSend);
      setSuccess(response.message || "Machine history updated successfully!");
      setTimeout(() => {
        navigate("/machinehistory");
      }, 1500);
    } catch (error: any) {
      console.error("Error updating machine history:", error);
      setError(error.message || "Failed to update machine history.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = () => {
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
  };

  if (isMasterDataLoading || localLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Loading Data!</strong>
          <span className="block sm:inline"> Sedang memuat data history mesin dan master data...</span>
        </div>
      </div>
    );
  }

  if (error && !formData.date) {
    return (
      <div className="min-h-screen bg-gray-50 p-4 sm:p-6 flex justify-center items-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error!</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
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
                    Group
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

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-18 mb-4">
                <h2 className="text-lg font-semibold text-gray-800 flex items-center justify-start">
                  <FiCheck className="mr-2 text-green-500" /> Start Time
                </h2>
                <h2 className="text-lg font-semibold text-gray-800 flex items-center justify-start">
                  <FiX className="mr-2 text-red-500" /> Stop Time
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-6 mb-4">
                <div className="flex items-end justify-start">
                  <div className="flex-1 max-w-[calc(50%-15px)]">
                    <label htmlFor="startJam" className="block text-sm font-medium text-gray-700 mb-1">
                      Hour (HH)
                    </label>
                    <input
                      type="number"
                      name="startJam"
                      id="startJam"
                      value={formData.startJam === null ? "" : formData.startJam}
                      onChange={handleChange}
                      min="0"
                      max="23"
                      placeholder="e.g., 09"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                      required
                    />
                  </div>
                  <div className="mx-1 text-2xl font-bold text-gray-600 pb-2">:</div>
                  <div className="flex-1 max-w-[calc(50%-15px)]">
                    <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700 mb-1">
                      Minute (MM)
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
                <div className="flex items-end justify-end">
                  <div className="flex-1 max-w-[calc(50%-15px)]">
                    <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700 mb-1">
                      Hour (HH)
                    </label>
                    <input
                      type="number"
                      name="stopJam"
                      id="stopJam"
                      value={formData.stopJam === null ? "" : formData.stopJam}
                      onChange={handleChange}
                      min="0"
                      max="23"
                      placeholder="e.g., 09"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                      required
                    />
                  </div>
                  <div className="mx-1 text-2xl font-bold text-gray-600 pb-2">:</div>
                  <div className="flex-1 max-w-[calc(50%-15px)]">
                    <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700 mb-1">
                      Minute (MM)
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
              </div>

              <div className="mt-4">
                <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Stop Type
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
                    options={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })) || []}
                    value={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })).find((option) => String(option.value) === String(formData.unit)) || null}
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
                    options={masterData?.mesin.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name })) || []}
                    value={masterData?.mesin.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name })).find((option) => String(option.value) === String(formData.mesin)) || null}
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
                  options={masterData?.itemtroubles.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name })) || []}
                  value={masterData?.itemtroubles.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name })).find((option) => String(option.value) === String(formData.itemTrouble)) || null}
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
                    onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
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
                    onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
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
                  onChange={handleChange as React.ChangeEventHandler<HTMLTextAreaElement>}
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
                    options={masterData?.jenisaktivitas.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name })) || []}
                    value={masterData?.jenisaktivitas.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name })).find((option) => String(option.value) === String(formData.jenisAktivitas)) || null}
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
                    options={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })) || []}
                    value={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })).find((option) => String(option.value) === String(formData.kegiatan)) || null}
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
                  options={masterData?.unitspareparts.map((unitSP) => ({ value: unitSP.id, label: unitSP.name })) || []}
                  value={masterData?.unitspareparts.map((unitSP) => ({ value: unitSP.id, label: unitSP.name })).find((option) => String(option.value) === String(formData.unitSparePart)) || null}
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
                onClick={handleClear}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <FiTrash2 className="inline mr-2" /> Clear Form
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Saving...
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