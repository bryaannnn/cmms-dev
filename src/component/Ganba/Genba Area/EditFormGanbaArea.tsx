import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../component/PageHeader";
import Sidebar from "../../../component/Sidebar";
import { useAuth, GenbaWorkAreas, User, Department, LayoutInterface } from "../../../routes/AuthContext";
import { X, Save, Trash2, Hourglass, ArrowLeft, MapPin, Building, User as UserIcon, Upload, CheckCircle, Image, Camera, File, Paperclip } from "lucide-react";

interface AreaFormData {
  name: string;
  department_id: string;
  pic_user_id: string;
  attachment: File | null;
  existingLayouts: LayoutInterface[];
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
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

const EditFormGenbaArea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGenbaAreas, updateGenbaAreas, getUsers, getDepartment } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Attachment states
  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<AreaFormData>({
    name: "",
    department_id: "",
    pic_user_id: "",
    attachment: null,
    existingLayouts: [],
  });

  useEffect(() => {
    if (id) {
      loadAreaData();
    }
    loadUsers();
    loadDepartments();
  }, [id]);

  useEffect(() => {
    if (formData.department_id && users.length > 0) {
      const filtered = users.filter((user) => user.department_id?.toString() === formData.department_id);
      setFilteredUsers(filtered);

      // Reset pic_user_id if current selection is not in filtered list
      if (formData.pic_user_id && !filtered.some((user) => user.id.toString() === formData.pic_user_id)) {
        setFormData((prev) => ({ ...prev, pic_user_id: "" }));
      }
    } else {
      setFilteredUsers([]);
      setFormData((prev) => ({ ...prev, pic_user_id: "" }));
    }
  }, [formData.department_id, users]);

  const loadAreaData = async () => {
    if (!id) return;

    setLoading(true);
    try {
      const genbaAreas = await getGenbaAreas();
      const areaData = genbaAreas.find((area) => area.id.toString() === id);

      if (!areaData) {
        setError("Area not found");
        return;
      }

      // Handle parsing attachment data
      let existingLayouts: LayoutInterface[] = [];

      if (areaData.attachment) {
        if (typeof areaData.attachment === "string") {
          try {
            // Parse JSON string menjadi array of LayoutInterface
            const parsed = JSON.parse(areaData.attachment);
            existingLayouts = Array.isArray(parsed) ? parsed : [parsed];
          } catch (error) {
            console.error("Error parsing attachment JSON:", error);
            // Jika parsing gagal, anggap sebagai single layout object
            existingLayouts = [{ path: areaData.attachment, filename: "Layout Area" }];
          }
        } else if (Array.isArray(areaData.attachment)) {
          existingLayouts = areaData.attachment;
        } else {
          // Jika berupa single object
          existingLayouts = [areaData.attachment];
        }
      }

      setFormData({
        name: areaData.name,
        department_id: areaData.department_id?.toString() || "",
        pic_user_id: areaData.pic_user_id?.toString() || "",
        attachment: null,
        existingLayouts: existingLayouts, // Sekarang bertipe LayoutInterface[]
      });
    } catch (err) {
      setError("Failed to load area data");
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const departmentsData = await getDepartment();
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: string) => {
    if (e && typeof e === "object" && "value" in e && name) {
      setFormData((prev) => ({
        ...prev,
        [name]: e.value,
      }));
    } else if (e && "target" in e) {
      const { name, value } = e.target;
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  }, []);

  // Attachment handlers
  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAttachmentOptions(true);
  };

  const handleSelectFile = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, .pdf, .doc, .docx, .xls, .xlsx";
    fileInput.multiple = false; // Nonaktifkan multiple selection

    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const selectedFile = target.files[0]; // Ambil file pertama saja
        setFormData((prev) => ({
          ...prev,
          attachment: selectedFile,
        }));
      }
      setShowAttachmentOptions(false);
    };

    fileInput.click();
  };

  const handleOpenCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  // Ganti fungsi helper dengan pendekatan yang lebih aman
  const createFileFromBlob = (blob: Blob, fileName: string): File => {
    // Create file dengan cara yang lebih kompatibel
    const file = Object.assign(new Blob([blob], { type: "image/jpeg" }), {
      name: fileName,
      lastModified: Date.now(),
    }) as File;
    return file;
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = createFileFromBlob(blob, `photo-${Date.now()}.jpg`);

              setFormData((prev) => ({
                ...prev,
                attachment: file, // Set single file
              }));
            }
          },
          "image/jpeg",
          0.8
        );

        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
      }
      setShowAttachmentOptions(false);
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowAttachmentOptions(false);
  };

  const removeAttachment = () => {
    setFormData((prev) => ({
      ...prev,
      attachment: null,
    }));
  };

  const removeExistingLayout = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingLayouts: prev.existingLayouts.filter((_, i) => i !== index),
    }));
  };

  // Di EditFormGanbaArea.tsx - perbaiki handleSubmit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.name || !formData.department_id || !formData.pic_user_id) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    try {
      await updateGenbaAreas(
        id!,
        {
          name: formData.name,
          department_id: parseInt(formData.department_id),
          pic_user_id: parseInt(formData.pic_user_id),
        },
        formData.attachment // Kirim single file (bukan array)
      );

      setSuccess("Area berhasil diupdate!");
      setShowSuccessModal(true);
    } catch (err: any) {
      console.error("Update error:", err);
      setError(err.message || "Gagal mengupdate area. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    if (!id) return;
    loadAreaData();
    setError(null);
    setSuccess(null);
  }, [id]);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/genba/genbaarea");
  }, [navigate]);

  const FilePreview: React.FC<{
    attachment: File | null;
    existingLayouts: LayoutInterface[]; // Ubah dari string[] ke LayoutInterface[]
    onRemoveAttachment: () => void;
    onRemoveExisting: (index: number) => void;
  }> = ({ attachment, existingLayouts, onRemoveAttachment, onRemoveExisting }) => {
    // Fungsi untuk mendapatkan URL lengkap dari path
    const getAttachmentFullUrl = (path: string): string => {
      if (path.startsWith("http")) {
        return path;
      } else {
        const baseUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
        return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
      }
    };

    const allItems = [
      ...existingLayouts.map((layout, index) => ({
        type: "existing" as const,
        index,
        name: layout.filename || `Layout ${index + 1}`,
        url: getAttachmentFullUrl(layout.path),
      })),
      ...(attachment
        ? [
            {
              type: "new" as const,
              index: 0,
              name: attachment.name,
              file: attachment,
            },
          ]
        : []),
    ];

    if (allItems.length === 0) return null;

    return (
      <div className="mt-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">Attachments:</p>
        {allItems.map((item) => {
          const isImage = item.type === "existing" ? item.url.startsWith("data:image") || item.url.match(/\.(jpg|jpeg|png|gif)$/i) : item.file.type.startsWith("image/");

          return (
            <div key={`${item.type}-${item.index}`} className={`flex items-center justify-between p-4 rounded-lg border ${item.type === "existing" ? "bg-blue-50 border-blue-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex items-center space-x-3 flex-1">
                {isImage ? <Image className="w-8 h-8 text-blue-600" /> : <File className="w-8 h-8 text-blue-600" />}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                  <p className="text-xs text-gray-500">{item.type === "existing" ? "Existing file" : `${(item.file.size / 1024 / 1024).toFixed(2)} MB`}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => (item.type === "existing" ? onRemoveExisting(item.index) : onRemoveAttachment())}
                className="text-red-600 hover:text-red-800 transition-colors p-1 rounded-lg hover:bg-red-50"
                title="Remove attachment"
              >
                <X size={16} />
              </button>

              {/* Image Preview */}
              {isImage && (
                <div className="mt-3 pt-3 border-t border-gray-200 w-full">
                  <p className="text-xs text-gray-500 mb-2">Preview:</p>
                  <div className="flex justify-center">
                    <img src={item.type === "existing" ? item.url : URL.createObjectURL(item.file)} alt="Preview" className="h-24 w-24 object-cover rounded-lg border shadow-sm" />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900 justify-center items-center">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-6 py-4 rounded-lg flex items-center shadow-lg animate-pulse" role="alert">
          <Hourglass className="animate-spin mr-3 text-2xl" />
          <span className="font-semibold text-lg">Loading Area Data... Please wait.</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Edit Genba Area" mainTitleHighlight="Genba Area" description="Update work area configuration for 5S implementation" icon={<MapPin />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Genba Area {id && `(ID: ${id})`}</h1>
              <p className="text-gray-600 mt-1">Update work area configuration and details</p>
            </div>
            <motion.button
              onClick={() => navigate("/genba/genbaarea")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ArrowLeft size={16} /> Back to Areas
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
                  <Building className="mr-2 text-blue-500" /> Department Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="department_id"
                      id="department_id"
                      options={departments.map((dept) => ({ value: dept.id.toString(), label: dept.name }))}
                      value={departments.map((dept) => ({ value: dept.id.toString(), label: dept.name })).find((option) => option.value === formData.department_id)}
                      onChange={(selectedOption) => handleChange(selectedOption, "department_id")}
                      placeholder="Select Department"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-green-500" /> Area Details
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      id="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., Area Produksi Line A"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="pic_user_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Penanggung Jawab Area <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="pic_user_id"
                      id="pic_user_id"
                      options={filteredUsers.map((user) => ({ value: user.id.toString(), label: user.name }))}
                      value={filteredUsers.map((user) => ({ value: user.id.toString(), label: user.name })).find((option) => option.value === formData.pic_user_id)}
                      onChange={(selectedOption) => handleChange(selectedOption, "pic_user_id")}
                      placeholder={formData.department_id ? "Select Penanggung Jawab" : "Please select department first"}
                      styles={customSelectStyles}
                      isDisabled={!formData.department_id}
                      required
                    />
                    {!formData.department_id && <p className="text-sm text-yellow-500 mt-1">Please select a department first</p>}
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Upload className="mr-2 text-purple-500" /> Layout Ruangan
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Layout Attachments <span className="text-gray-400 font-normal">(Optional, Multiple files allowed)</span>
                    </label>

                    {formData.existingLayouts.length === 0 && !formData.attachment ? (
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        className="w-full p-8 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
                        onClick={handleAttachmentClick}
                      >
                        <div className="space-y-3 text-center">
                          <div className="mx-auto w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                            <Paperclip className="h-6 w-6 text-gray-400 group-hover:text-blue-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Click to select attachment</p>
                            <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, PDF up to 10MB</p>
                          </div>
                        </div>
                      </motion.button>
                    ) : (
                      <div className="w-full p-6 border-2 border-blue-200 border-dashed rounded-xl bg-blue-50/30">
                        <div className="text-center">
                          <div className="mx-auto w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
                            <Paperclip className="h-5 w-5 text-blue-600" />
                          </div>
                          <p className="text-sm font-medium text-blue-900">{formData.existingLayouts.length + (formData.attachment ? 1 : 0)} file(s) attached</p>
                          <p className="text-xs text-blue-600 mt-1">Click to change attachment.</p>
                        </div>
                      </div>
                    )}
                    <FilePreview attachment={formData.attachment} existingLayouts={formData.existingLayouts} onRemoveAttachment={removeAttachment} onRemoveExisting={removeExistingLayout} />
                    <AnimatePresence>
                      {showAttachmentOptions && (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4"
                          onClick={() => setShowAttachmentOptions(false)}
                        >
                          <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                              <h3 className="text-lg font-semibold text-gray-900">Select Attachment</h3>
                              <button type="button" onClick={() => setShowAttachmentOptions(false)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                                <X size={20} />
                              </button>
                            </div>

                            {!cameraStream ? (
                              <div className="p-6 space-y-4">
                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleSelectFile}
                                  className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 flex items-center space-x-4"
                                >
                                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                    <File className="h-6 w-6 text-blue-600" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium text-gray-900">Select Files</div>
                                    <div className="text-sm text-gray-500">From your device (Multiple)</div>
                                  </div>
                                </motion.button>

                                <motion.button
                                  type="button"
                                  whileHover={{ scale: 1.02 }}
                                  whileTap={{ scale: 0.98 }}
                                  onClick={handleOpenCamera}
                                  className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50/50 transition-all duration-200 flex items-center space-x-4"
                                >
                                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Camera className="h-6 w-6 text-purple-600" />
                                  </div>
                                  <div className="text-left">
                                    <div className="font-medium text-gray-900">Take Photo</div>
                                    <div className="text-sm text-gray-500">Use camera</div>
                                  </div>
                                </motion.button>
                              </div>
                            ) : (
                              <div className="p-6 space-y-4">
                                <div className="relative bg-black rounded-lg overflow-hidden">
                                  <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                                  <canvas ref={canvasRef} className="hidden" />
                                </div>
                                <div className="flex gap-3">
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCapturePhoto}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                  >
                                    Take Photo
                                  </motion.button>
                                  <motion.button
                                    type="button"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleCloseCamera}
                                    className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </motion.button>
                                </div>
                              </div>
                            )}
                          </motion.div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={handleClear}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <Trash2 className="mr-2 h-5 w-5" /> Reset Changes
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Update Area
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Genba area has been updated successfully!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Genba Areas
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default EditFormGenbaArea;
