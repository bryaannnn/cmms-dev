import React, { useState, useEffect } from "react";
import { FiSave, FiTrash2, FiX, FiClock, FiCheck, FiTool, FiChevronDown } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../routes/AuthContext";
import { motion } from "framer-motion";

interface MachineHistoryFormData {
  date: string;
  shift: string;
  group: string;
  stopJam: number;
  stopMenit: number;
  startJam: number;
  startMenit: number;
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

const FormMesin: React.FC = () => {
  const { getMesin, submitMachineHistory } = useAuth();
  const navigate = useNavigate();
  const [mesinList, setMesinList] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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

    // KELOMPOKKAN FIELD YANG BUTUH KONVERSI KE NUMBER
    const numericFields = ["stopJam", "stopMenit", "startJam", "startMenit", "runningHour", "jumlah"];

    if (numericFields.includes(name)) {
      // Untuk runningHour, gunakan parseFloat (mungkin desimal)
      // Untuk lainnya (jam, menit, jumlah), gunakan parseInt (bilangan bulat)
      const numValue = name === "runningHour" ? parseFloat(value) : parseInt(value, 10);
      setFormData((prev) => ({
        ...prev,
        [name]: isNaN(numValue) ? 0 : numValue, // Jika NaN (bukan angka), set ke 0
      }));
    } else {
      // Untuk field lain (string), simpan langsung
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const dataToSend: MachineHistoryFormData = {
      ...formData,
      // perbaikanPerawatan harus diisi, jika tidak ada inputnya
      perbaikanPerawatan: formData.jenisAktivitas === "Perbaikan" ? "Perbaikan" : "Perawatan",
    };

    try {
      await submitMachineHistory(dataToSend);
      setSuccess("Data history mesin berhasil disimpan!");
      handleClear();
      setTimeout(() => {
        navigate("/machinehistory");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data history mesin. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      date: "",
      shift: "",
      group: "",
      stopJam: 0,
      stopMenit: 0,
      startJam: 0,
      startMenit: 0,
      stopTime: "", // <-- Kembali ke string
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

  useEffect(() => {
    const fetchMesin = async () => {
      try {
        // Asumsikan getMesin di AuthContext mengembalikan string[] atau MesinItem[]
        // Jika mengembalikan MesinItem[] dan Anda hanya butuh nama, lakukan map seperti sebelumnya:
        // const data = await getMesin(); // tanpa argumen 'nama' jika tidak digunakan di getMesin
        // setMesinList(data.map((item: any) => item.nama));

        // Jika getMesin sudah mengembalikan string[] seperti yang Anda harapkan
        const data = await getMesin("nama"); // Argumen "nama" ini tidak dipakai di getMesin yang Anda tunjukkan sebelumnya.
        // Jika getMesin di AuthContext tidak memakainya, Anda bisa menghapusnya.
        setMesinList(data);
      } catch (error) {
        console.error("Gagal mengambil data mesin:", error);
      }
    };

    fetchMesin();
  }, [getMesin]);

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <FiTool className="mr-3 text-blue-600" />
              Machine History Form
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
                      <option value="1">Shift 1</option>
                      <option value="2">Shift 2</option>
                      <option value="3">Shift 3</option>
                      <option value="off">OFF</option>
                      <option value="ns">NS</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Group</label>
                  <div className="relative">
                    <select name="group" value={formData.group} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Group</option>
                      <option value="A">Group A</option>
                      <option value="B">Group B</option>
                      <option value="C">Group C</option>
                      <option value="D">Group D</option>
                      <option value="off">OFF</option>
                      <option value="ns">NS</option>
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
                    value={formData.stopJam}
                    onChange={handleChange}
                    placeholder="e.g., 08"
                    min="0"
                    max="23"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="number"
                    name="stopMenit"
                    value={formData.stopMenit}
                    onChange={handleChange}
                    placeholder="e.g., 30"
                    min="0"
                    max="59"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Stop Type</label>
                <div className="relative">
                  <select name="stopTime" value={formData.stopTime} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                    <option value="">Select Stop Type</option>
                    <option value="PM">PM (Preventive Maintenance)</option>
                    <option value="Harmonisasi">Harmonisasi</option>
                    <option value="CIP">CIP (Clean-in-Place)</option>
                    <option value="Unplanned">Unplanned</option>
                    <option value="Standby">Standby</option>
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
                    value={formData.startJam}
                    onChange={handleChange}
                    placeholder="e.g., 09"
                    min="0"
                    max="23"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minute (MM)</label>
                  <input
                    type="number"
                    name="startMenit"
                    value={formData.startMenit}
                    onChange={handleChange}
                    placeholder="e.g., 15"
                    min="0"
                    max="59"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
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
                      <option value="WF1U1">WF1U1</option>
                      <option value="WF1U3">WF1U3</option>
                      <option value="WF2U1">WF2U1</option>
                      <option value="WF2U2">WF2U2</option>
                      <option value="Lain Lain">Lain Lain</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Machine</label>
                  <div className="relative">
                    <select name="mesin" value={formData.mesin} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Machine</option>
                      <option value="WF1U3">WF1U3</option>
                      {mesinList.map((mesin: string) => (
                        <option key={mesin} value={mesin}>
                          {mesin}
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
                  type="number" 
                  step="0.01" 
                  name="runningHour"
                  value={formData.runningHour}
                  onChange={handleChange}
                  placeholder="e.g., 12345.67"
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
                    <option value="PM">PM (Preventive Maintenance)</option>
                    <option value="Harmonisasi">Harmonisasi</option>
                    <option value="CIP">CIP (Clean-in-Place)</option>
                    <option value="Unplanned">Unplanned</option>
                    <option value="Standby">Standby</option>
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
                      <option value="Perbaikan">Repair</option>
                      <option value="Perawatan">Maintenance</option>
                    </select>
                    <FiChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Specific Activity</label>
                  <div className="relative">
                    <select name="kegiatan" value={formData.kegiatan} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      <option value="">Select Activity</option>
                      <option value="Replace With New Part">Replace With New Part</option>
                      <option value="Replace With Old Part">Replace With Old Part</option>
                      <option value="Cleaning">Cleaning</option>
                      <option value="Check">Check</option>
                      <option value="Tightening">Tightening</option>
                      <option value="Improvement">Improvement</option>
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
                  <input type="number" name="jumlah" value={formData.jumlah} onChange={handleChange} placeholder="e.g., 5" min="0" className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Unit</label>
                <div className="relative">
                  <select name="unitSparePart" value={formData.unitSparePart} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="">Select Unit</option>
                    <option value="PCS">PCS (Pieces)</option>
                    <option value="UNIT">UNIT</option>
                    <option value="M">M (Meter)</option>
                    <option value="L">L (Liter)</option>
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
