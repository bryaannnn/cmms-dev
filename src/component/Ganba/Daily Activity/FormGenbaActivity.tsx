import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../component/PageHeader";
import Sidebar from "../../../component/Sidebar";
import { useAuth, User, Department, GenbaWorkAreas } from "../../../routes/AuthContext";
import { X, Save, Trash2, Hourglass, ArrowLeft, Building, CheckCircle, Camera, FileText, MapPin } from "lucide-react";

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
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

const FormGenbaActivity: React.FC = () => {
  const navigate = useNavigate();
  const { createGenbaActivity, getGenbaAreas, user } = useAuth();
  const [searchParams] = useSearchParams();
  const initialDateString = searchParams.get("date");
  const initialAreaId = searchParams.get("area");
  const [selectedDate, setSelectedDate] = useState<string>(
    initialDateString
      ? new Date(initialDateString).toLocaleDateString("id-ID") // Gunakan tanggal dari URL (tampilkan format ID)
      : new Date().toLocaleDateString("id-ID") // Fallback ke hari ini
  );
  const submissionDate = initialDateString || new Date().toLocaleDateString("en-CA");
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [areas, setAreas] = useState<GenbaWorkAreas[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<{ genba_work_area_id: string; keterangan: string; attachments: File[] }>({
    genba_work_area_id: initialAreaId || "",
    keterangan: "",
    attachments: [],
  });

  useEffect(() => {
    loadAreas();
  }, []);

  const loadAreas = async () => {
    try {
      const data = await getGenbaAreas();
      if (user && user.id) {
        const filtered = data.filter((area) => area.pic_user_id.toString() === user.id.toString());
        setAreas(filtered);
      } else {
        setAreas([]);
      }
    } catch (error) {
      console.error("Failed to load areas:", error);
    }
  };

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: string) => {
    if (e && typeof e === "object" && "value" in e && name) {
      setFormData((prev) => ({ ...prev, [name]: e.value }));
    } else if (e && "target" in e) {
      const { name, value } = e.target;
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      setCameraStream(stream);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err) {
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera diaktifkan.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        ctx.drawImage(videoRef.current, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const file = new File([blob], `photo-${Date.now()}.jpg`, { type: "image/jpeg" });
            setFormData((prev) => ({ ...prev, attachments: [...prev.attachments, file] }));
          }
        }, "image/jpeg");
      }
    }
  };

  const closeCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({ ...prev, attachments: prev.attachments.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    if (!formData.genba_work_area_id) {
      setError("Silakan pilih area kerja terlebih dahulu.");
      setLoading(false);
      return;
    }
    try {
      await createGenbaActivity({ date: new Date().toLocaleDateString("en-CA"), genba_work_area_id: parseInt(formData.genba_work_area_id), keterangan: formData.keterangan }, formData.attachments);
      setSuccess("Laporan Genba berhasil dikirim!");
      setShowSuccessModal(true);
      setFormData({ genba_work_area_id: "", keterangan: "", attachments: [] });
    } catch (err: any) {
      setError(err.message || "Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/genba/genbaactivity");
  };

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
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Add Genba Activity" mainTitleHighlight="Genba Activity" description="Create new daily report for Genba activity" icon={<MapPin />} isMobile={isMobile} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Genba Activity</h1>
              <p className="text-gray-600 mt-1">Fill in daily Genba report with optional attachments</p>
            </div>
            <motion.button
              onClick={() => navigate("/genba/genbaactivity")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg shadow-md"
            >
              <ArrowLeft size={16} /> Back to Activities
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

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="mr-2 text-blue-500" /> Activity Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
                    <input type="text" value={selectedDate} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>

                  {/* Nama */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Nama</label>
                    <input type="text" value={user?.name ?? "-"} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>

                  {/* NIK */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                    <input type="text" value={user?.nik ?? "-"} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>

                  {/* Department */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <input type="text" value={user?.department?.name ?? "-"} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>

                  {/* Komite 5S */}
                  {/* <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Komite 5S</label>
                    <input type="text" value={`Komite5s ${user?.ge ?? "-"}`} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div> */}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Area Kerja <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="genba_work_area_id"
                      options={areas.map((a) => ({ value: a.id.toString(), label: a.name }))}
                      value={areas.map((a) => ({ value: a.id.toString(), label: a.name })).find((option) => option.value === formData.genba_work_area_id)}
                      onChange={(selectedOption) => handleChange(selectedOption, "genba_work_area_id")}
                      placeholder="Select Work Area"
                      styles={customSelectStyles}
                      required
                    />
                  </div>

                  {/* Penanggung Jawab Area */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab Area</label>
                    <input type="text" value={areas.find((a) => a.id.toString() === formData.genba_work_area_id)?.pic?.name ?? "-"} disabled className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan Aktivitas <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="keterangan"
                      value={formData.keterangan}
                      onChange={handleChange}
                      placeholder="Masukkan keterangan aktivitas harian Anda"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-2 focus:outline-none focus:border-blue-500 focus:ring-0 h-28"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Lampiran Foto</label>
                    <div className="flex flex-wrap gap-3 mb-3">
                      {formData.attachments.map((file, index) => (
                        <div key={index} className="relative w-24 h-24 border rounded-lg overflow-hidden">
                          <img src={URL.createObjectURL(file)} alt="attachment" className="w-full h-full object-cover" />
                          <button type="button" onClick={() => removeAttachment(index)} className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <motion.button
                      type="button"
                      onClick={startCamera}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      <Camera size={18} /> <span>Open Camera</span>
                    </motion.button>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="reset"
                  onClick={() => setFormData({ genba_work_area_id: "", keterangan: "", attachments: [] })}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center"
                >
                  <Trash2 className="mr-2 h-5 w-5" /> Clear Form
                </motion.button>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                >
                  {loading ? <Hourglass className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />} Submit Report
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
        {cameraStream && (
          <motion.div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50">
            <video ref={videoRef} autoPlay playsInline muted className="w-full max-w-md h-[400px] rounded-lg bg-black" />
            <div className="mt-6 flex gap-4">
              <button onClick={capturePhoto} className="px-6 py-3 bg-green-600 text-white rounded-lg flex items-center gap-2">
                <Camera size={20} /> Capture
              </button>
              <button onClick={closeCamera} className="px-6 py-3 bg-red-600 text-white rounded-lg flex items-center gap-2">
                <X size={20} /> Close
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Laporan Genba berhasil dikirim!</p>
          <motion.button onClick={handleCloseSuccessModal} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="mt-6 px-6 py-3 rounded-lg text-white bg-blue-600 hover:bg-blue-700">
            Back to Activity
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormGenbaActivity;
