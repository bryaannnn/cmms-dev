import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../routes/AuthContext"; // Pastikan path ini benar
import Select from "react-select";
import { motion } from "framer-motion";
import { FiTool, FiClock, FiCheck, FiX, FiSave } from "react-icons/fi";

// Asumsi interface OptionType sudah ada atau bisa didefinisikan di sini
interface OptionType {
  value: string | number;
  label: string;
}

// Interface FormData harus sesuai dengan apa yang akan dikirim ke API
// dan apa yang disimpan di state lokal untuk mengisi form.
// Ini adalah *ID* dari relasi, bukan namanya.
interface FormData {
  date: string;
  shift: string; // ID shift
  group: string; // ID group
  stopJam: number | null;
  stopMenit: number | null;
  startJam: number | null;
  startMenit: number | null;
  stopTime: string; // ID stopTime
  unit: string; // ID unit
  mesin: string; // ID mesin
  runningHour: number;
  itemTrouble: string; // ID itemTrouble
  jenisGangguan: string;
  bentukTindakan: string;
  perbaikanPerawatan: string; // Ini mungkin string 'Perbaikan' atau 'Perawatan'
  rootCause: string;
  jenisAktivitas: string; // ID jenisAktivitas
  kegiatan: string; // ID kegiatan
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: number;
  unitSparePart: string; // ID unitSparePart
}

// Custom styles for react-select (contoh, sesuaikan dengan kebutuhan styling Anda)
const customSelectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    minHeight: "42px", // Menyesuaikan tinggi dengan input biasa
    borderRadius: "0.5rem", // rounded-lg
    borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB", // focus:border-blue-500
    boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none", // focus:ring-blue-500
    "&:hover": {
      borderColor: "#3B82F6",
    },
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: "#4B5563", // text-gray-700
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected ? "#3B82F6" : state.isFocused ? "#EFF6FF" : null,
    color: state.isSelected ? "white" : "#4B5563",
    "&:active": {
      backgroundColor: "#2563EB",
    },
  }),
};

const FormEditMesin: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Ambil fungsi dan data dari AuthContext
  const {
    getMachineHistoryById,
    getAllMasterData,
    updateMachineHistory,
    masterData, // Gunakan masterData yang sudah dimuat di AuthContext
    isMasterDataLoading, // Gunakan isMasterDataLoading dari AuthContext
  } = useAuth();

  const [formData, setFormData] = useState<FormData>({
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
    perbaikanPerawatan: "", // Default value, will be set from API
    rootCause: "",
    jenisAktivitas: "",
    kegiatan: "",
    kodePart: "",
    sparePart: "",
    idPart: "",
    jumlah: 0,
    unitSparePart: "",
  });

  // States for dropdown options will now be derived from `masterData`
  // We'll use local loading state for this component to differentiate from global master data loading
  const [localLoading, setLocalLoading] = useState<boolean>(true); // For fetching the specific record
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // --- useEffect untuk mengambil data awal (master data & data record yang diedit) ---
  useEffect(() => {
    const fetchData = async () => {
      // Tunggu hingga masterData selesai dimuat di AuthProvider
      if (isMasterDataLoading || !masterData) {
        setLocalLoading(true); // Pastikan loading masih aktif jika master data belum siap
        return;
      }

      try {
        setLocalLoading(true); // Set local loading true for fetching the specific record

        // 1. Ambil data history mesin berdasarkan ID
        if (id) {
          // getMachineHistoryById dari AuthContext sekarang mengembalikan MachineHistoryRecord
          // Yang sudah dipetakan nama-namanya untuk tampilan, tapi kita butuh ID untuk form.
          // JADI, KITA AKAN PANGGIL API MENTAH ATAU PASTIKAN FUNGSI API ANDA BISA MEMBERIKAN MENTAHNYA.

          // **PENTING**: Jika `getMachineHistoryById` di `AuthContext` sudah mengembalikan
          // objek yang *sudah dipetakan namanya* (seperti `shift: "Shift Pagi"`),
          // maka kita perlu menyesuaikannya di sini untuk mendapatkan ID kembali.
          // Solusi terbaik adalah `getMachineHistoryById` mengembalikan data mentah
          // dari API, lalu kita petakan untuk FORM.

          // ASUMSI: `getMachineHistoryById` MENGEMBALIKAN DATA MENTAH DARI API SEPERTI INI:
          // { ..., shift: { id: "1", name: "Shift Pagi" }, stoptime: { id: "2", name: "Maintenance" }, ... }
          // BUKAN { ..., shift: "Shift Pagi", stopTime: "Maintenance", ... }

          const apiDataRaw: any = await getMachineHistoryById(id); // Ini harusnya mengembalikan data MENTAH dari API

          if (apiDataRaw) {
            // Kita akan memetakan data mentah API ke struktur FormData yang membutuhkan ID
            setFormData({
              date: apiDataRaw.date || "",
              shift: apiDataRaw.shift?.id || "",
              group: apiDataRaw.group?.id || "",
              stopJam: apiDataRaw.startstop?.stop_time_hh ?? null,
              stopMenit: apiDataRaw.startstop?.stop_time_mm ?? null,
              startJam: apiDataRaw.startstop?.start_time_hh ?? null,
              startMenit: apiDataRaw.startstop?.start_time_mm ?? null,
              stopTime: apiDataRaw.stoptime?.id || "",
              unit: apiDataRaw.unit?.id || "",
              mesin: apiDataRaw.mesin?.id || "",
              runningHour: apiDataRaw.running_hour ?? 0,
              itemTrouble: apiDataRaw.itemtrouble?.id || "",
              jenisGangguan: apiDataRaw.jenis_gangguan || "",
              bentukTindakan: apiDataRaw.bentuk_tindakan || "",
              // Logika ini harus sesuai dengan bagaimana Anda menentukan di API
              perbaikanPerawatan: apiDataRaw.jenisaktifitas?.name === "Perbaikan" ? "Perbaikan" : "Perawatan",
              rootCause: apiDataRaw.root_cause || "",
              jenisAktivitas: apiDataRaw.jenisaktifitas?.id || "",
              kegiatan: apiDataRaw.kegiatan?.id || "",
              kodePart: apiDataRaw.kode_part || "",
              sparePart: apiDataRaw.spare_part || "",
              idPart: apiDataRaw.id_part || "",
              jumlah: apiDataRaw.jumlah ?? 0,
              unitSparePart: apiDataRaw.unitsp?.id || "",
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
        setLocalLoading(false); // Selesai memuat data record spesifik
      }
    };
    fetchData();
  }, [id, masterData, isMasterDataLoading, getMachineHistoryById]); // Dependensi penting: masterData dan isMasterDataLoading

  // --- Fungsi handleChange untuk input form ---
  // ... (bagian atas kode lainnya tetap sama)

  // --- Fungsi handleChange untuk input form ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | OptionType | null, name?: string) => {
    // Case 1: Untuk React-Select (karena ada 'name' yang diberikan secara eksplisit)
    if (name) {
      setFormData((prev) => ({
        ...prev,
        [name]: (e as OptionType)?.value || "", // Casting 'e' ke OptionType di sini
      }));
    }
    // Case 2: Untuk input dan textarea biasa (punya 'target')
    else if (e && "target" in e) {
      // <-- Perubahan ada di sini: Gunakan 'in' operator
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      const { name, value, type } = target;

      if (type === "number" || name === "runningHour" || name === "jumlah") {
        const cleanedValue = value.replace(/\./g, "");
        setFormData((prev) => ({
          ...prev,
          [name]: cleanedValue === "" ? null : Number(cleanedValue),
        }));
      } else {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    }
  };

  // ... (bagian bawah kode lainnya tetap sama)

  // --- Fungsi formatNumberWithDot (pastikan ini ada) ---
  const formatNumberWithDot = (num: number | null): string => {
    if (num === null || isNaN(num)) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // --- Fungsi handleSubmit untuk pengiriman form ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validasi dasar (bisa diperluas)
    if (
      !formData.date ||
      !formData.shift ||
      !formData.group ||
      !formData.stopTime ||
      !formData.unit ||
      !formData.mesin ||
      formData.runningHour === null ||
      formData.runningHour < 0 ||
      !formData.itemTrouble ||
      !formData.jenisGangguan ||
      !formData.bentukTindakan ||
      !formData.rootCause ||
      !formData.jenisAktivitas ||
      !formData.kegiatan ||
      !formData.kodePart ||
      !formData.sparePart ||
      !formData.idPart ||
      formData.jumlah === null ||
      formData.jumlah < 0 ||
      !formData.unitSparePart ||
      formData.stopJam === null ||
      formData.stopMenit === null ||
      formData.startJam === null ||
      formData.startMenit === null
    ) {
      setError("Please fill in all required fields and ensure numeric values are valid.");
      setSubmitting(false);
      return;
    }

    // Siapkan data untuk dikirim ke API (sesuaikan dengan snake_case API)
    const dataToSend = {
      date: formData.date,
      shift_id: formData.shift,
      group_id: formData.group,
      stop_time_hh: formData.stopJam,
      stop_time_mm: formData.stopMenit,
      start_time_hh: formData.startJam,
      start_time_mm: formData.startMenit, // BUG FIX: ini sudah benar
      stoptime_id: formData.stopTime,
      unit_id: formData.unit,
      mesin_id: formData.mesin,
      running_hour: formData.runningHour,
      itemtrouble_id: formData.itemTrouble,
      jenis_gangguan: formData.jenisGangguan,
      bentuk_tindakan: formData.bentukTindakan,
      root_cause: formData.rootCause,
      jenisaktifitas_id: formData.jenisAktivitas,
      kegiatan_id: formData.kegiatan,
      kode_part: formData.kodePart,
      spare_part: formData.sparePart,
      id_part: formData.idPart,
      jumlah: formData.jumlah,
      unitsp_id: formData.unitSparePart,
    };

    try {
      const response = await updateMachineHistory(id!, dataToSend);
      setSuccess(response.message || "Machine history updated successfully!");
      // navigate(`/machinehistory/${id}`); // Uncomment if you want to navigate back on success
    } catch (error: any) {
      console.error("Error updating machine history:", error);
      setError(error.message || "Failed to update machine history.");
    } finally {
      setSubmitting(false);
    }
  };

  // Render formulir hanya jika data sudah selesai dimuat
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

  // Jika ada error saat memuat data awal
  if (error && !formData.date) {
    // Cek formData.date sebagai indikator apakah data sudah berhasil dimuat atau belum
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

        {error && ( // Tampilkan error saat submit
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
                    value={masterData?.shifts.map((shift) => ({ value: shift.id, label: shift.name })).find((option) => option.value === formData.shift) || null}
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
                    value={masterData?.groups.map((group) => ({ value: group.id, label: group.name })).find((option) => option.value === formData.group) || null}
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
                    Hour (HH) <span className="text-red-500">*</span>
                    {formData.stopJam !== null && formData.stopJam > 23 && <span className="text-xs text-yellow-600 ml-2">Will be saved as: {formData.stopJam % 24}</span>}
                  </label>
                  <input
                    type="number"
                    name="stopJam"
                    id="stopJam"
                    value={formData.stopJam === null ? "" : formData.stopJam}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 09"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM) <span className="text-red-500">*</span>
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
                  Stop Type <span className="text-red-500">*</span>
                </label>
                <Select
                  name="stopTime"
                  id="stopTime"
                  options={masterData?.stoptimes.map((stopTime) => ({ value: stopTime.id, label: stopTime.name })) || []}
                  value={masterData?.stoptimes.map((stopTime) => ({ value: stopTime.id, label: stopTime.name })).find((option) => option.value === formData.stopTime) || null}
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
                    Hour (HH) <span className="text-red-500">*</span>
                    {formData.startJam !== null && formData.startJam > 23 && <span className="text-xs text-yellow-600 ml-2">Will be saved as: {formData.startJam % 24}</span>}
                  </label>
                  <input
                    type="number"
                    name="startJam"
                    id="startJam"
                    value={formData.startJam === null ? "" : formData.startJam}
                    onChange={handleChange}
                    min="0"
                    placeholder="e.g., 09"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button bg-white text-gray-700"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700 mb-1">
                    Minutes (MM) <span className="text-red-500">*</span>
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
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="unit"
                    id="unit"
                    options={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })) || []}
                    value={masterData?.units.map((unit) => ({ value: unit.id, label: unit.name })).find((option) => option.value === formData.unit) || null}
                    onChange={(selectedOption) => handleChange(selectedOption, "unit")}
                    placeholder="Select Unit"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="mesin" className="block text-sm font-medium text-gray-700 mb-1">
                    Machine <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="mesin"
                    id="mesin"
                    options={masterData?.mesin.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name })) || []}
                    value={masterData?.mesin.map((mesinItem) => ({ value: mesinItem.id, label: mesinItem.name })).find((option) => option.value === formData.mesin) || null}
                    onChange={(selectedOption) => handleChange(selectedOption, "mesin")}
                    placeholder="Select Machine"
                    styles={customSelectStyles}
                    required
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700 mb-1">
                  Running Hours <span className="text-red-500">*</span>
                </label>
                <input
                  type="text" // Menggunakan type="text" untuk format titik
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
                  Item Trouble <span className="text-red-500">*</span>
                </label>
                <Select
                  name="itemTrouble"
                  id="itemTrouble"
                  options={masterData?.itemtroubles.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name })) || []}
                  value={masterData?.itemtroubles.map((itemTrouble) => ({ value: itemTrouble.id, label: itemTrouble.name })).find((option) => option.value === formData.itemTrouble) || null}
                  onChange={(selectedOption) => handleChange(selectedOption, "itemTrouble")}
                  placeholder="Select Item Trouble"
                  styles={customSelectStyles}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700 mb-1">
                    Issue Description <span className="text-red-500">*</span>
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
                    Action Taken <span className="text-red-500">*</span>
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
                  Root Cause <span className="text-red-500">*</span>
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
                    Activity Type <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="jenisAktivitas"
                    id="jenisAktivitas"
                    options={masterData?.jenisaktivitas.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name })) || []}
                    value={masterData?.jenisaktivitas.map((aktivitas) => ({ value: aktivitas.id, label: aktivitas.name })).find((option) => option.value === formData.jenisAktivitas) || null}
                    onChange={(selectedOption) => handleChange(selectedOption, "jenisAktivitas")}
                    placeholder="Select Activity Type"
                    styles={customSelectStyles}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700 mb-1">
                    Specific Activity <span className="text-red-500">*</span>
                  </label>
                  <Select
                    name="kegiatan"
                    id="kegiatan"
                    options={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })) || []}
                    value={masterData?.kegiatans.map((kegiatan) => ({ value: kegiatan.id, label: kegiatan.name })).find((option) => option.value === formData.kegiatan) || null}
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
                    Part Code <span className="text-red-500">*</span>
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
                    Part Name <span className="text-red-500">*</span>
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
                    Part ID <span className="text-red-500">*</span>
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
                    Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text" // Menggunakan type="text" untuk format titik
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
                  Unit <span className="text-red-500">*</span>
                </label>
                <Select
                  name="unitSparePart"
                  id="unitSparePart"
                  options={masterData?.unitspareparts.map((unitSP) => ({ value: unitSP.id, label: unitSP.name })) || []}
                  value={masterData?.unitspareparts.map((unitSP) => ({ value: unitSP.id, label: unitSP.name })).find((option) => option.value === formData.unitSparePart) || null}
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
                disabled={submitting}
              >
                {submitting ? (
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
