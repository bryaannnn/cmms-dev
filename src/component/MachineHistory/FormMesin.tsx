import React, { useState, useEffect, useCallback } from "react";
import { FiSave, FiTrash2, FiX, FiClock, FiCheck, FiTool, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth, MachineHistoryFormData, Mesin, Shift, Group, StopTime, Unit, ItemTrouble, JenisAktivitas, Kegiatan, UnitSparePart, AllMasterData } from "../../routes/AuthContext";
import { motion } from "framer-motion";

const FormMesin: React.FC = () => {
  const { getAllMasterData, submitMachineHistory } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
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

  const [formData, setFormData] = useState<MachineHistoryFormData>({
    date: "",
    shift: "",
    group: "",
    stopJam: 0,
    stopMenit: 0,
    startJam: 0,
    startMenit: 0,
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    setFormData((prev: MachineHistoryFormData) => {
      let newValue: string | number = value;

      if (name === "stopJam" || name === "startJam") {
        let numValue = parseInt(value, 10);
        newValue = isNaN(numValue) ? 0 : Math.max(0, Math.min(23, numValue));
      } else if (name === "stopMenit" || name === "startMenit") {
        let numValue = parseInt(value, 10);
        newValue = isNaN(numValue) ? 0 : Math.max(0, Math.min(59, numValue));
      } else if (name === "runningHour") {
        const cleanedValue = value.replace(/\./g, "");
        const parsedValue = parseInt(cleanedValue, 10);
        newValue = isNaN(parsedValue) ? 0 : Math.max(0, parsedValue);
      } else if (name === "jumlah") {
        const cleanedValue = value.replace(",", ".");
        const parsedValue = parseFloat(cleanedValue);
        newValue = isNaN(parsedValue) ? 0 : Math.max(0, parsedValue);
      } else {
        newValue = value;
      }

      return { ...prev, [name]: newValue };
    });
  };

  const formatNumberWithDot = (num: number | string): string => {
    const numericValue = typeof num === "string" ? parseFloat(num.replace(",", ".")) : num;
    if (isNaN(numericValue) || numericValue === null) return "";

    if (Number.isInteger(numericValue)) {
      return numericValue.toLocaleString("id-ID").replace(/,/g, ".");
    }
    return numericValue.toString().replace(".", ",");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSend: MachineHistoryFormData = {
      ...formData,
      perbaikanPerawatan: formData.jenisAktivitas === "Perbaikan" ? "Perbaikan" : "Perawatan",
      runningHour: parseInt(String(formData.runningHour).replace(/\./g, ""), 10) || 0,
      jumlah: parseFloat(String(formData.jumlah).replace(",", ".")) || 0,
    };

    try {
      await submitMachineHistory(dataToSend);
      setSuccess("Data history mesin berhasil disimpan!");
      handleClear();
      navigate("/machinehistory");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data history mesin. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      date: "",
      shift: "",
      group: "",
      stopJam: 0,
      stopMenit: 0,
      startJam: 0,
      startMenit: 0,
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
    const fetchAllMasterData = async () => {
      try {
        const data: AllMasterData = await getAllMasterData();
        setMesinList(data.mesin || []);
        setShiftList(data.shifts || []);
        setGroupList(data.groups || []);
        setStopTimeList(data.stoptimes || []);
        setUnitList(data.units || []);
        setItemTroubleList(data.itemtroubles || []);
        setJenisAktivitasList(data.jenisaktivitas || []);
        setKegiatanList(data.kegiatans || []);
        setUnitSparePartList(data.unitspareparts || []);
      } catch (error: any) {
        console.error("Gagal mengambil semua data master:", error);
        setError(error.message || "Gagal memuat daftar data master.");
      }
    };

    fetchAllMasterData();
  }, [getAllMasterData]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <FiTool className="mr-3 text-blue-600" /> Machine History Form
            </h1>
            <p className="text-gray-600 mt-1">Record maintenance activities and machine issues</p>
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

        {/* Notifikasi Status */}
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

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* General Information Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <div className="relative">
                    <select name="shift" value={formData.shift} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Shift</option>
                      {shiftList.map((shift) => (
                        <option key={shift.id} value={shift.name}>
                          {" "}
                          {shift.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <div className="relative">
                    <select name="group" value={formData.group} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Group</option>
                      {groupList.map((group) => (
                        <option key={group.id} value={group.name}>
                          {" "}
                          {group.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Stop Time Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-red-500" /> Stop Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour (HH)</label>
                  <input
                    type="number"
                    name="stopJam"
                    value={formData.stopJam.toString().padStart(2, "0")}
                    onChange={handleChange}
                    placeholder="e.g., 08"
                    min="0"
                    max="23"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="number"
                    name="stopMenit"
                    value={formData.stopMenit.toString().padStart(2, "0")}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    min="0"
                    max="59"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Type</label>
                <div className="relative">
                  <select name="stopTime" value={formData.stopTime} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                    <option value="">Select Stop Type</option>
                    {stopTimeList.map((stopTime) => (
                      <option key={stopTime.id} value={stopTime.name}>
                        {" "}
                        {stopTime.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Start Time Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="mr-2 text-green-500" /> Start Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour (HH)</label>
                  <input
                    type="number"
                    name="startJam"
                    value={formData.startJam.toString().padStart(2, "0")}
                    onChange={handleChange}
                    placeholder="e.g., 09"
                    min="0"
                    max="23"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="number"
                    name="startMenit"
                    value={formData.startMenit.toString().padStart(2, "0")}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="0"
                    max="59"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Machine Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-blue-500" /> Machine Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <div className="relative">
                    <select name="unit" value={formData.unit} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Unit</option>
                      {unitList.map((unit) => (
                        <option key={unit.id} value={unit.name}>
                          {" "}
                          {unit.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                  <div className="relative">
                    <select name="mesin" value={formData.mesin} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option key="default-machine" value="">
                        Select Machine
                      </option>
                      {mesinList.map((mesinItem: Mesin) => (
                        <option key={mesinItem.id} value={mesinItem.name}>
                          {" "}
                          {mesinItem.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Running Hours</label>
                <input
                  type="text"
                  name="runningHour"
                  value={formatNumberWithDot(formData.runningHour)}
                  onChange={handleChange}
                  placeholder="e.g., 15.000"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Problem & Action Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-yellow-500" /> Problem & Action
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Trouble</label>
                <div className="relative">
                  <select name="itemTrouble" value={formData.itemTrouble} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                    <option value="">Select Item Trouble</option>
                    {itemTroubleList.map((itemTrouble) => (
                      <option key={itemTrouble.id} value={itemTrouble.name}>
                        {" "}
                        {itemTrouble.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea
                    name="jenisGangguan"
                    value={formData.jenisGangguan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the issue..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                  <textarea
                    name="bentukTindakan"
                    value={formData.bentukTindakan}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describe the action taken..."
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
                <textarea
                  name="rootCause"
                  value={formData.rootCause}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Identify the root cause..."
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
            </div>

            {/* Activity Details Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="mr-2 text-purple-500" /> Activity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <div className="relative">
                    <select
                      name="jenisAktivitas"
                      value={formData.jenisAktivitas}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                      required
                    >
                      <option value="">Select Activity Type</option>
                      {jenisAktivitasList.map((aktivitas) => (
                        <option key={aktivitas.id} value={aktivitas.name}>
                          {" "}
                          {aktivitas.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Activity</label>
                  <div className="relative">
                    <select name="kegiatan" value={formData.kegiatan} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Activity</option>
                      {kegiatanList.map((kegiatan) => (
                        <option key={kegiatan.id} value={kegiatan.name}>
                          {" "}
                          {kegiatan.name}
                        </option>
                      ))}
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Spare Parts Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-indigo-500" /> Spare Parts (Optional)
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
                  <input type="text" name="kodePart" value={formData.kodePart} onChange={handleChange} placeholder="e.g., KODE123" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <input type="text" name="sparePart" value={formData.sparePart} onChange={handleChange} placeholder="e.g., Bearing XYZ" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part ID</label>
                  <input type="text" name="idPart" value={formData.idPart} onChange={handleChange} placeholder="e.g., ID456" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="any"
                    name="jumlah"
                    value={formData.jumlah.toString().replace(".", ",")}
                    onChange={handleChange}
                    placeholder="e.g., 5,5"
                    min="0"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 no-spin-button"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <div className="relative">
                  <select name="unitSparePart" value={formData.unitSparePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="">Select Unit</option>
                    {unitSparePartList.map((unitSP) => (
                      <option key={unitSP.id} value={unitSP.name}>
                        {" "}
                        {unitSP.name}
                      </option>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Form Actions */}
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
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Saving...
                  </>
                ) : (
                  <>
                    <FiSave className="inline mr-2" /> Save Record
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

export default FormMesin;
