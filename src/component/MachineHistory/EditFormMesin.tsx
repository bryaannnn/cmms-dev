import React, { useState, useEffect, useCallback } from "react";
import { FiSave, FiTrash2, FiX, FiClock, FiCheck, FiTool } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useAuth, AllMasterData, MachineHistoryRecord } from "../../routes/AuthContext";
import { motion } from "framer-motion";

interface FormData {
  date: string;
  shift: string;
  group: string;
  stopJam: number | null;
  stopMenit: number | null;
  startJam: number | null;
  startMenit: number | null;
  stopTime: string;
  unit: string;
  mesin: string;
  runningHour: number;
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
  jumlah: number;
  unitSparePart: string;
}

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { masterData, isMasterDataLoading, getMachineHistoryById, updateMachineHistory } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialData, setInitialData] = useState<MachineHistoryRecord | null>(null);

  const [formData, setFormData] = useState<FormData>({
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

  const findSelectOption = (category: keyof AllMasterData, id: string) => {
    if (!masterData || !masterData[category]) return null;
    const items = masterData[category] as Array<{ id: string; name: string }>;
    const item = items.find((item) => item.id === id);
    return item ? { value: item.id, label: item.name } : null;
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: keyof FormData) => {
    if (e && typeof e === "object" && "value" in e && name) {
      setFormData((prev) => ({ ...prev, [name]: e.value }));
    } else if (e && "target" in e) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name as keyof FormData]: value }));
    }
  }, []);

  const formatNumberWithDot = (num: number | string) => {
    if (num === null || num === undefined || num === "") return "";
    const numValue = typeof num === "string" ? parseFloat(num.replace(/\./g, "")) : num;
    return isNaN(numValue) ? "" : numValue.toLocaleString("id-ID").replace(/,/g, ".");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!id) throw new Error("No record ID provided");

      const dataToSend = {
        ...formData,
        runningHour: parseInt(String(formData.runningHour).replace(/\./g, "")),
        jumlah: parseInt(String(formData.jumlah).replace(/\./g, "")),
      };

      await updateMachineHistory(id, dataToSend);
      setSuccess("Data berhasil diperbarui!");
      setTimeout(() => navigate(`/machinehistory/${id}`), 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memperbarui data");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (initialData) {
      setFormData({
        date: initialData.date,
        shift: initialData.shift,
        group: initialData.group,
        stopJam: initialData.stopJam ?? null,
        stopMenit: initialData.stopMenit ?? null,
        startJam: initialData.startJam ?? null,
        startMenit: initialData.startMenit ?? null,
        stopTime: initialData.stopTime,
        unit: initialData.unit,
        mesin: initialData.mesin,
        runningHour: initialData.runningHour,
        itemTrouble: initialData.itemTrouble,
        jenisGangguan: initialData.jenisGangguan,
        bentukTindakan: initialData.bentukTindakan,
        perbaikanPerawatan: initialData.perbaikanPerawatan,
        rootCause: initialData.rootCause,
        jenisAktivitas: initialData.jenisAktivitas,
        kegiatan: initialData.kegiatan,
        kodePart: initialData.kodePart,
        sparePart: initialData.sparePart,
        idPart: initialData.idPart,
        jumlah: initialData.jumlah,
        unitSparePart: initialData.unitSparePart,
      });
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        if (!id) throw new Error("ID tidak valid");

        const machineData = await getMachineHistoryById(id);
        if (!machineData) throw new Error("Data tidak ditemukan");

        setInitialData(machineData);

        setFormData({
          date: machineData.date,
          shift: machineData.shift,
          group: machineData.group,
          stopJam: machineData.stopJam ?? null,
          stopMenit: machineData.stopMenit ?? null,
          startJam: machineData.startJam ?? null,
          startMenit: machineData.startMenit ?? null,
          stopTime: machineData.stopTime,
          unit: machineData.unit,
          mesin: machineData.mesin,
          runningHour: machineData.runningHour,
          itemTrouble: machineData.itemTrouble,
          jenisGangguan: machineData.jenisGangguan,
          bentukTindakan: machineData.bentukTindakan,
          perbaikanPerawatan: machineData.perbaikanPerawatan,
          rootCause: machineData.rootCause,
          jenisAktivitas: machineData.jenisAktivitas,
          kegiatan: machineData.kegiatan,
          kodePart: machineData.kodePart,
          sparePart: machineData.sparePart,
          idPart: machineData.idPart,
          jumlah: machineData.jumlah,
          unitSparePart: machineData.unitSparePart,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getMachineHistoryById]);

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
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": { color: "#6B7280" },
    }),
    indicatorSeparator: () => ({ display: "none" }),
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
      "&:active": { backgroundColor: "#DBEAFE" },
      padding: "0.625rem 1rem",
    }),
  };

  if (isMasterDataLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-600 text-lg">Memuat data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600 text-lg">{error}</div>
        <button onClick={() => navigate(-1)} className="ml-4 px-4 py-2 bg-gray-200 rounded">
          Kembali
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <FiTool className="mr-3 text-blue-600" /> Edit Machine History
            </h1>
            <p className="text-gray-600 mt-1">Edit maintenance record</p>
          </div>
          <motion.button
            onClick={() => navigate("/machinehistory")}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
          >
            <FiX className="text-xl" />
          </motion.button>
        </div>

        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">{success}</div>}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Shift</label>
                  <Select
                    options={masterData?.shifts?.map((s: any) => ({ value: s.id, label: s.name })) || []}
                    value={findSelectOption("shifts", formData.shift)}
                    onChange={(opt) => handleChange(opt, "shift")}
                    styles={customSelectStyles}
                    placeholder="Select Shift"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <Select
                    options={masterData?.groups?.map((g: any) => ({ value: g.id, label: g.name })) || []}
                    value={findSelectOption("groups", formData.group)}
                    onChange={(opt) => handleChange(opt, "group")}
                    styles={customSelectStyles}
                    placeholder="Select Group"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour (HH)</label>
                  <input
                    type="text"
                    name="stopJam"
                    value={formData.stopJam === null ? "" : String(formData.stopJam)}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="text"
                    name="stopMenit"
                    value={formData.stopMenit === null ? "" : String(formData.stopMenit)}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Type</label>
                <Select
                  options={masterData?.stoptimes?.map((s: any) => ({ value: s.id, label: s.name })) || []}
                  value={findSelectOption("stoptimes", formData.stopTime)}
                  onChange={(opt) => handleChange(opt, "stopTime")}
                  styles={customSelectStyles}
                  placeholder="Select Stop Type"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour (HH)</label>
                  <input
                    type="text"
                    name="startJam"
                    value={formData.startJam === null ? "" : String(formData.startJam)}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="text"
                    name="startMenit"
                    value={formData.startMenit === null ? "" : String(formData.startMenit)}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                  <Select
                    options={masterData?.units?.map((u: any) => ({ value: u.id, label: u.name })) || []}
                    value={findSelectOption("units", formData.unit)}
                    onChange={(opt) => handleChange(opt, "unit")}
                    styles={customSelectStyles}
                    placeholder="Select Unit"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                  <Select
                    options={masterData?.mesin?.map((m: any) => ({ value: m.id, label: m.name })) || []}
                    value={findSelectOption("mesin", formData.mesin)}
                    onChange={(opt) => handleChange(opt, "mesin")}
                    styles={customSelectStyles}
                    placeholder="Select Machine"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Running Hours</label>
                <input type="text" name="runningHour" value={formatNumberWithDot(formData.runningHour)} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiTool className="mr-2 text-yellow-500" /> Problem & Action
              </h2>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Item Trouble</label>
                <Select
                  options={masterData?.itemtroubles?.map((i: any) => ({ value: i.id, label: i.name })) || []}
                  value={findSelectOption("itemtroubles", formData.itemTrouble)}
                  onChange={(opt) => handleChange(opt, "itemTrouble")}
                  styles={customSelectStyles}
                  placeholder="Select Item Trouble"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Issue Description</label>
                  <textarea name="jenisGangguan" value={formData.jenisGangguan} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Action Taken</label>
                  <textarea name="bentukTindakan" value={formData.bentukTindakan} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Root Cause</label>
                <textarea name="rootCause" value={formData.rootCause} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiCheck className="mr-2 text-purple-500" /> Activity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Activity Type</label>
                  <Select
                    options={masterData?.jenisaktivitas?.map((j: any) => ({ value: j.id, label: j.name })) || []}
                    value={findSelectOption("jenisaktivitas", formData.jenisAktivitas)}
                    onChange={(opt) => handleChange(opt, "jenisAktivitas")}
                    styles={customSelectStyles}
                    placeholder="Select Activity Type"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Activity</label>
                  <Select
                    options={masterData?.kegiatans?.map((k: any) => ({ value: k.id, label: k.name })) || []}
                    value={findSelectOption("kegiatans", formData.kegiatan)}
                    onChange={(opt) => handleChange(opt, "kegiatan")}
                    styles={customSelectStyles}
                    placeholder="Select Activity"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Code</label>
                  <input type="text" name="kodePart" value={formData.kodePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part Name</label>
                  <input type="text" name="sparePart" value={formData.sparePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Part ID</label>
                  <input type="text" name="idPart" value={formData.idPart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                  <input type="text" name="jumlah" value={formatNumberWithDot(formData.jumlah)} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" required />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <Select
                  options={masterData?.unitspareparts?.map((u: any) => ({ value: u.id, label: u.name })) || []}
                  value={findSelectOption("unitspareparts", formData.unitSparePart)}
                  onChange={(opt) => handleChange(opt, "unitSparePart")}
                  styles={customSelectStyles}
                  placeholder="Select Unit"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={handleReset}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <FiTrash2 className="inline mr-2" /> Reset Changes
              </motion.button>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? <span className="animate-spin inline-block mr-2">⚙️</span> : <FiSave className="inline mr-2" />}
                {loading ? "Menyimpan..." : "Simpan Perubahan"}
              </motion.button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditMesin;
