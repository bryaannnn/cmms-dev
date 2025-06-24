import React, { useState, useEffect, useCallback } from "react";
import { FiSave, FiX, FiClock, FiCheck, FiTool } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useAuth, MachineHistoryFormData, AllMasterData, MachineHistoryRecord } from "../../routes/AuthContext";
import { motion } from "framer-motion";

interface FormDataState extends Omit<MachineHistoryFormData, "stopJam" | "startJam" | "stopMenit" | "startMenit"> {
  stopJam: number | null;
  startJam: number | null;
  stopMenit: number | null;
  startMenit: number | null;
}

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getAllMasterData, getMachineHistoryById, updateMachineHistory, masterData } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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

  const formatNumberWithDot = useCallback((num: number | string | null): string => {
    if (num === null || num === undefined || num === "") return "";
    const numValue = typeof num === "string" ? parseFloat(num.replace(/\./g, "")) : num;
    return numValue.toLocaleString("id-ID");
  }, []);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label?: string } | null, name?: string) => {
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

    const dataToSend: MachineHistoryFormData = {
      ...formData,
      stopJam: formData.stopJam !== null ? formData.stopJam % 24 : null,
      stopMenit: formData.stopMenit !== null ? formData.stopMenit % 60 : null,
      startJam: formData.startJam !== null ? formData.startJam % 24 : null,
      startMenit: formData.startMenit !== null ? formData.startMenit % 60 : null,
      perbaikanPerawatan: formData.jenisAktivitas === "JA1" ? "Perbaikan" : "Perawatan",
      runningHour: formData.runningHour ? parseInt(String(formData.runningHour).replace(/\./g, ""), 10) : 0,
      jumlah: formData.jumlah ? parseInt(String(formData.jumlah).replace(/\./g, ""), 10) : 0,
    };

    try {
      await updateMachineHistory(id, dataToSend);
      setSuccess("Data berhasil diperbarui!");
      setTimeout(() => navigate("/machinehistory"), 1500);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        if (id) {
          const machineData = await getMachineHistoryById(id);
          if (machineData) {
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
          }
        }
      } catch (error: any) {
        setError(error.message || "Gagal memuat data.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getMachineHistoryById]);

  const customSelectStyles = {
    control: (provided: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: "#D1D5DB",
      borderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const getSelectOptions = (items: Array<{ id: string; name?: string }> | undefined) => {
    return (
      items?.map((item) => ({
        value: item.id,
        label: item.name || "",
      })) || []
    );
  };

  if (loading && !formData.date) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-blue-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">
              <FiTool className="inline mr-3 text-blue-600" />
              Edit Machine History {id && `(ID: ${id})`}
            </h1>
          </div>
          <button onClick={() => navigate("/machinehistory")} className="p-2 rounded-lg bg-white border border-gray-200">
            <FiX className="text-xl" />
          </button>
        </div>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiClock className="inline mr-2 text-blue-500" />
                General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input type="date" name="date" id="date" value={formData.date} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                    Shift
                  </label>
                  <Select
                    name="shift"
                    options={getSelectOptions(masterData?.shifts)}
                    value={getSelectOptions(masterData?.shifts).find((opt) => opt.value === formData.shift)}
                    onChange={(selectedOption) => handleChange(selectedOption, "shift")}
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
                    options={getSelectOptions(masterData?.groups)}
                    value={getSelectOptions(masterData?.groups).find((opt) => opt.value === formData.group)}
                    onChange={(selectedOption) => handleChange(selectedOption, "group")}
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiClock className="inline mr-2 text-red-500" />
                Stop Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700 mb-1">
                    Hour (HH)
                  </label>
                  <input type="number" name="stopJam" id="stopJam" value={formData.stopJam ?? ""} onChange={handleChange} min="0" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM)
                  </label>
                  <input type="number" name="stopMenit" id="stopMenit" value={formData.stopMenit ?? ""} onChange={handleChange} min="0" max="59" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700 mb-1">
                  Stop Type
                </label>
                <Select
                  name="stopTime"
                  options={getSelectOptions(masterData?.stoptimes)}
                  value={getSelectOptions(masterData?.stoptimes).find((opt) => opt.value === formData.stopTime)}
                  onChange={(selectedOption) => handleChange(selectedOption, "stopTime")}
                  styles={customSelectStyles}
                  required
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiCheck className="inline mr-2 text-green-500" />
                Start Time
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startJam" className="block text-sm font-medium text-gray-700 mb-1">
                    Hour (HH)
                  </label>
                  <input type="number" name="startJam" id="startJam" value={formData.startJam ?? ""} onChange={handleChange} min="0" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM)
                  </label>
                  <input type="number" name="startMenit" id="startMenit" value={formData.startMenit ?? ""} onChange={handleChange} min="0" max="59" className="w-full p-2.5 border border-gray-300 rounded-lg" />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiTool className="inline mr-2 text-blue-500" />
                Machine Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <Select
                    name="unit"
                    options={getSelectOptions(masterData?.units)}
                    value={getSelectOptions(masterData?.units).find((opt) => opt.value === formData.unit)}
                    onChange={(selectedOption) => handleChange(selectedOption, "unit")}
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
                    options={getSelectOptions(masterData?.mesin)}
                    value={getSelectOptions(masterData?.mesin).find((opt) => opt.value === formData.mesin)}
                    onChange={(selectedOption) => handleChange(selectedOption, "mesin")}
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Running Hours
                </label>
                <input type="text" name="runningHour" id="runningHour" value={formatNumberWithDot(formData.runningHour)} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiTool className="inline mr-2 text-yellow-500" />
                Problem & Action
              </h2>
              <div className="mb-4">
                <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700 mb-1">
                  Item Trouble
                </label>
                <Select
                  name="itemTrouble"
                  options={getSelectOptions(masterData?.itemtroubles)}
                  value={getSelectOptions(masterData?.itemtroubles).find((opt) => opt.value === formData.itemTrouble)}
                  onChange={(selectedOption) => handleChange(selectedOption, "itemTrouble")}
                  styles={customSelectStyles}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description
                  </label>
                  <textarea name="jenisGangguan" id="jenisGangguan" value={formData.jenisGangguan} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700 mb-1">
                    Action Taken
                  </label>
                  <textarea name="bentukTindakan" id="bentukTindakan" value={formData.bentukTindakan} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <div>
                <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700 mb-1">
                  Root Cause
                </label>
                <textarea name="rootCause" id="rootCause" value={formData.rootCause} onChange={handleChange} rows={3} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiCheck className="inline mr-2 text-purple-500" />
                Activity Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700 mb-1">
                    Activity Type
                  </label>
                  <Select
                    name="jenisAktivitas"
                    options={getSelectOptions(masterData?.jenisaktivitas)}
                    value={getSelectOptions(masterData?.jenisaktivitas).find((opt) => opt.value === formData.jenisAktivitas)}
                    onChange={(selectedOption) => handleChange(selectedOption, "jenisAktivitas")}
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
                    options={getSelectOptions(masterData?.kegiatans)}
                    value={getSelectOptions(masterData?.kegiatans).find((opt) => opt.value === formData.kegiatan)}
                    onChange={(selectedOption) => handleChange(selectedOption, "kegiatan")}
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                <FiTool className="inline mr-2 text-indigo-500" />
                Spare Parts
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label htmlFor="kodePart" className="block text-sm font-medium text-gray-700 mb-1">
                    Part Code
                  </label>
                  <input type="text" name="kodePart" id="kodePart" value={formData.kodePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700 mb-1">
                    Part Name
                  </label>
                  <input type="text" name="sparePart" id="sparePart" value={formData.sparePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="idPart" className="block text-sm font-medium text-gray-700 mb-1">
                    Part ID
                  </label>
                  <input type="text" name="idPart" id="idPart" value={formData.idPart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
                <div>
                  <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity
                  </label>
                  <input type="text" name="jumlah" id="jumlah" value={formatNumberWithDot(formData.jumlah)} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <Select
                  name="unitSparePart"
                  options={getSelectOptions(masterData?.unitspareparts)}
                  value={getSelectOptions(masterData?.unitspareparts).find((opt) => opt.value === formData.unitSparePart)}
                  onChange={(selectedOption) => handleChange(selectedOption, "unitSparePart")}
                  styles={customSelectStyles}
                  required
                />
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-6">
              <button type="button" onClick={() => navigate("/machinehistory")} className="px-6 py-3 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <FiX className="inline mr-2" /> Cancel
              </button>
              <button type="submit" className="px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700" disabled={loading}>
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Updating...
                  </>
                ) : (
                  <>
                    <FiSave className="inline mr-2" /> Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditMesin;
