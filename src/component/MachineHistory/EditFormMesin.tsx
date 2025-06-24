import React, { useState, useEffect, useCallback } from "react";
import { FiSave, FiEdit, FiX, FiClock, FiCheck, FiTool } from "react-icons/fi";
import { useNavigate, useParams } from "react-router-dom";
import Select from "react-select";
import { useAuth, MachineHistoryFormData, Mesin, Shift, Group, StopTime, Unit, ItemTrouble, JenisAktivitas, Kegiatan, UnitSparePart } from "../../routes/AuthContext";
import { motion } from "framer-motion";

interface FormDataState extends Omit<MachineHistoryFormData, "stopJam" | "startJam" | "stopMenit" | "startMenit"> {
  stopJam: number | null;
  startJam: number | null;
  stopMenit: number | null;
  startMenit: number | null;
}

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { getMachineHistoryById, updateMachineHistory, masterData, isMasterDataLoading } = useAuth();

  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

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
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  const formatNumber = (num: number | string | null): string => {
    if (num === null || num === undefined) return "";
    const numValue = typeof num === "string" ? parseFloat(num.replace(/[^\d]/g, "")) : num;
    return isNaN(numValue) ? "" : numValue.toString();
  };

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

    try {
      await updateMachineHistory(id, {
        ...formData,
        runningHour: parseFloat(formatNumber(formData.runningHour)) || 0,
        jumlah: parseFloat(formatNumber(formData.jumlah)) || 0,
      });
      setSuccess("Data updated successfully!");
      setIsEditing(false);
    } catch (err: any) {
      setError(err.message || "Failed to update data");
    } finally {
      setLoading(false);
    }
  };

  const findLabelById = (list: Array<{ id: string; name: string }> | undefined, id: string) => {
    if (!list) return id;
    const found = list.find((item) => item.id === id);
    return found ? found.name : id;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const historyData = await getMachineHistoryById(id!);

        if (historyData) {
          setFormData({
            date: historyData.date,
            shift: historyData.shift,
            group: historyData.group,
            stopJam: historyData.stopJam ?? null,
            stopMenit: historyData.stopMenit ?? null,
            startJam: historyData.startJam ?? null,
            startMenit: historyData.startMenit ?? null,
            stopTime: historyData.stopTime,
            unit: historyData.unit,
            mesin: historyData.mesin,
            runningHour: historyData.runningHour,
            itemTrouble: historyData.itemTrouble,
            jenisGangguan: historyData.jenisGangguan,
            bentukTindakan: historyData.bentukTindakan,
            perbaikanPerawatan: historyData.perbaikanPerawatan,
            rootCause: historyData.rootCause,
            jenisAktivitas: historyData.jenisAktivitas,
            kegiatan: historyData.kegiatan,
            kodePart: historyData.kodePart,
            sparePart: historyData.sparePart,
            idPart: historyData.idPart,
            jumlah: historyData.jumlah,
            unitSparePart: historyData.unitSparePart,
          });
        }
      } catch (error: any) {
        setError(error.message || "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (id && !isMasterDataLoading) {
      fetchData();
    }
  }, [id, getMachineHistoryById, isMasterDataLoading]);

  if (loading || isMasterDataLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-blue-600 text-lg font-semibold">Loading data...</div>
      </div>
    );
  }

  if (!masterData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-red-600 text-lg font-semibold">Failed to load required data</div>
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
            {/* General Information Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <FiClock className="mr-2 text-blue-500" /> General Information
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  {isEditing ? (
                    <input
                      type="date"
                      name="date"
                      id="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{new Date(formData.date).toLocaleDateString()}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="shift" className="block text-sm font-medium text-gray-700 mb-1">
                    Shift
                  </label>
                  {isEditing ? (
                    <Select
                      options={masterData.shifts.map((s) => ({ value: s.id, label: s.name }))}
                      value={masterData.shifts.map((s) => ({ value: s.id, label: s.name })).find((o) => o.value === formData.shift)}
                      onChange={(selected) => handleChange(selected, "shift")}
                      className="basic-single"
                      classNamePrefix="select"
                      required
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{findLabelById(masterData.shifts, formData.shift)}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="group" className="block text-sm font-medium text-gray-700 mb-1">
                    Group
                  </label>
                  {isEditing ? (
                    <Select
                      options={masterData.groups.map((g) => ({ value: g.id, label: g.name }))}
                      value={masterData.groups.map((g) => ({ value: g.id, label: g.name })).find((o) => o.value === formData.group)}
                      onChange={(selected) => handleChange(selected, "group")}
                      className="basic-single"
                      classNamePrefix="select"
                      required
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{findLabelById(masterData.groups, formData.group)}</div>
                  )}
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
                  <label htmlFor="unit" className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  {isEditing ? (
                    <Select
                      options={masterData.units.map((u) => ({ value: u.id, label: u.name }))}
                      value={masterData.units.map((u) => ({ value: u.id, label: u.name })).find((o) => o.value === formData.unit)}
                      onChange={(selected) => handleChange(selected, "unit")}
                      className="basic-single"
                      classNamePrefix="select"
                      required
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{findLabelById(masterData.units, formData.unit)}</div>
                  )}
                </div>
                <div>
                  <label htmlFor="mesin" className="block text-sm font-medium text-gray-700 mb-1">
                    Machine
                  </label>
                  {isEditing ? (
                    <Select
                      options={masterData.mesin.map((m) => ({ value: m.id, label: m.name }))}
                      value={masterData.mesin.map((m) => ({ value: m.id, label: m.name })).find((o) => o.value === formData.mesin)}
                      onChange={(selected) => handleChange(selected, "mesin")}
                      className="basic-single"
                      classNamePrefix="select"
                      required
                    />
                  ) : (
                    <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{findLabelById(masterData.mesin, formData.mesin)}</div>
                  )}
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Running Hours
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="runningHour"
                    id="runningHour"
                    value={formatNumber(formData.runningHour)}
                    onChange={handleChange}
                    placeholder="e.g., 15000"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    required
                  />
                ) : (
                  <div className="p-2.5 bg-gray-100 rounded-lg text-gray-800">{formData.runningHour}</div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              {isEditing ? (
                <>
                  <motion.button
                    type="button"
                    onClick={() => setIsEditing(false)}
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
                </>
              ) : (
                <motion.button
                  onClick={() => setIsEditing(true)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <FiEdit className="inline mr-2" /> Edit
                </motion.button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormEditMesin;