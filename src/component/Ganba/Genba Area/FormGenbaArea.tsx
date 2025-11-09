import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../component/PageHeader";
import Sidebar from "../../../component/Sidebar";
import { useAuth, User, Department, LayoutInterface } from "../../../routes/AuthContext";
import { X, Save, Trash2, Hourglass, ArrowLeft, MapPin, Building, Upload, CheckCircle, Image, Camera, File, Paperclip } from "lucide-react";

interface WorkAreaItem {
  name: string;
  attachment: File | null;
  is_default: boolean;
}

interface AreaFormData {
  work_areas: WorkAreaItem[];
  department_id: string;
  pic_user_id: string;
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

const FormGenbaArea: React.FC = () => {
  const navigate = useNavigate();
  const areaInputRef = useRef<HTMLInputElement>(null);

  const { createGenbaAreas, user, getUsers, getDepartment } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);

  // Attachment states per area
  const [showAttachmentOptions, setShowAttachmentOptions] = useState<number | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState<AreaFormData>({
    work_areas: [],
    department_id: "",
    pic_user_id: "",
  });

  useEffect(() => {
    loadDepartments();
    loadUsers();
  }, []);

  useEffect(() => {
    if (formData.department_id && users.length > 0) {
      const filtered = users.filter((user) => user.department_id?.toString() === formData.department_id);
      setFilteredUsers(filtered);

      if (formData.pic_user_id && !filtered.some((user) => user.id.toString() === formData.pic_user_id)) {
        setFormData((prev) => ({ ...prev, pic_user_id: "" }));
      }
    } else {
      setFilteredUsers([]);
      setFormData((prev) => ({ ...prev, pic_user_id: "" }));
    }
  }, [formData.department_id, users]);

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

  // Add new work area
  const addWorkArea = () => {
    setFormData((prev) => ({
      ...prev,
      work_areas: [...prev.work_areas, { name: "", attachment: null, is_default: false }],
    }));
  };

  // Update work area name
  const updateWorkAreaName = (index: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      work_areas: prev.work_areas.map((area, i) => (i === index ? { ...area, name } : area)),
    }));
  };

  // Remove work area
  const removeWorkArea = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_areas: prev.work_areas.filter((_, i) => i !== index),
    }));
  };

  // Attachment handlers per area
  const handleAttachmentClick = (index: number) => {
    setShowAttachmentOptions(index);
  };

  const handleSelectFile = (index: number) => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, .pdf, .doc, .docx, .xls, .xlsx";

    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const selectedFile = target.files[0];
        setFormData((prev) => ({
          ...prev,
          work_areas: prev.work_areas.map((area, i) => (i === index ? { ...area, attachment: selectedFile } : area)),
        }));
      }
      setShowAttachmentOptions(null);
    };

    fileInput.click();
  };

  const handleOpenCamera = async (index: number) => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      // Store the index for when we capture the photo
      setShowAttachmentOptions(index);
    } catch (err) {
      console.error("Error accessing camera:", err);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const createFileFromBlob = (blob: Blob, fileName: string): File => {
    const file = Object.assign(new Blob([blob], { type: "image/jpeg" }), {
      name: fileName,
      lastModified: Date.now(),
    }) as File;
    return file;
  };

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current && showAttachmentOptions !== null) {
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
              const index = showAttachmentOptions;

              setFormData((prev) => ({
                ...prev,
                work_areas: prev.work_areas.map((area, i) => (i === index ? { ...area, attachment: file } : area)),
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
      setShowAttachmentOptions(null);
    }
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowAttachmentOptions(null);
  };

  const removeAttachment = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      work_areas: prev.work_areas.map((area, i) => (i === index ? { ...area, attachment: null } : area)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.department_id || !formData.pic_user_id) {
      setError("Please fill in all required fields");
      setLoading(false);
      return;
    }

    if (formData.work_areas.length === 0) {
      setError("Please add at least one work area");
      setLoading(false);
      return;
    }

    // Check if all work areas have names
    const hasEmptyNames = formData.work_areas.some((area) => !area.name.trim());
    if (hasEmptyNames) {
      setError("All work areas must have a name");
      setLoading(false);
      return;
    }

    try {
      await createGenbaAreas({
        work_areas: formData.work_areas,
        department_id: parseInt(formData.department_id),
        pic_user_id: parseInt(formData.pic_user_id),
        attachment: null,
      });

      setSuccess("Area berhasil dibuat!");
      setShowSuccessModal(true);
      handleClear();
    } catch (err: any) {
      console.error("Full submission error:", err);
      setError(err.message || "Gagal membuat area. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      work_areas: [],
      department_id: "",
      pic_user_id: "",
    });
    setError(null);
    setSuccess(null);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/genba/genbaarea");
  }, [navigate]);

  const FilePreview: React.FC<{
    file: File | null;
    onRemove: () => void;
  }> = ({ file, onRemove }) => {
    if (!file) return null;

    const isImage = file.type.startsWith("image/");
    const previewUrl = isImage ? URL.createObjectURL(file) : null;

    return (
      <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 mt-2">
        <div className="flex items-center space-x-3">
          {isImage ? <Image className="w-6 h-6 text-blue-600" /> : <File className="w-6 h-6 text-blue-600" />}
          <p className="text-sm text-gray-800">{file.name}</p>
        </div>
        <button type="button" onClick={onRemove} className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50">
          <X size={16} />
        </button>
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

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Add Genba Area" mainTitleHighlight="Genba Area" description="Create new work area for 5S implementation" icon={<MapPin />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Genba Area</h1>
              <p className="text-gray-600 mt-1">Define a new work area for 5S implementation and maintenance</p>
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
                  <MapPin className="mr-2 text-green-500" /> Work Areas
                </h2>

                {/* Add Area Button */}
                <div className="mb-6">
                  <motion.button
                    type="button"
                    onClick={addWorkArea}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <span>+ Add Work Area</span>
                  </motion.button>
                  <p className="text-sm text-gray-500 mt-2">Each work area can have its own layout attachment</p>
                </div>

                {/* Work Areas List */}
                <div className="space-y-6">
                  {formData.work_areas.map((area, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-medium text-gray-800">Work Area {index + 1}</h3>
                        <button type="button" onClick={() => removeWorkArea(index)} className="text-red-600 hover:text-red-800 p-1 rounded-lg hover:bg-red-50">
                          <X size={16} />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {/* Area Name */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Area Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={area.name}
                            onChange={(e) => updateWorkAreaName(index, e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter area name"
                            required
                          />
                        </div>

                        <div className="mt-4">
                          <label className="flex items-center space-x-3 text-sm font-medium text-gray-700">
                            <input
                              type="checkbox"
                              checked={area.is_default}
                              onChange={(e) =>
                                setFormData((prev) => ({
                                  ...prev,
                                  is_default: e.target.checked,
                                }))
                              }
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span>Daily Reports (jadikan area default)</span>
                          </label>
                        </div>

                        {/* Layout Attachment */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Layout Attachment <span className="text-gray-400 font-normal">(Optional)</span>
                          </label>

                          {!area.attachment ? (
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.01 }}
                              whileTap={{ scale: 0.99 }}
                              className="w-full p-4 border-2 border-dashed border-gray-300 rounded-xl bg-white hover:border-blue-400 hover:bg-blue-50/50 transition-all duration-300 group"
                              onClick={() => handleAttachmentClick(index)}
                            >
                              <div className="space-y-2 text-center">
                                <div className="mx-auto w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                                  <Paperclip className="h-5 w-5 text-gray-400 group-hover:text-blue-500" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">Add layout for this area</p>
                                  <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
                                </div>
                              </div>
                            </motion.button>
                          ) : (
                            <div className="w-full p-4 border-2 border-blue-200 border-dashed rounded-xl bg-blue-50/30">
                              <FilePreview file={area.attachment} onRemove={() => removeAttachment(index)} />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {formData.work_areas.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg">
                    <p className="text-gray-500">No work areas added yet. Click "Add Work Area" to get started.</p>
                  </div>
                )}
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-green-500" /> Area Management
                </h2>
                <div className="grid grid-cols-1 gap-6">
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

              {/* Attachment Options Modal */}
              <AnimatePresence>
                {showAttachmentOptions !== null && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 p-4" onClick={() => setShowAttachmentOptions(null)}>
                    <motion.div
                      initial={{ scale: 0.95, y: 20 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 20 }}
                      className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-auto overflow-hidden"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <div className="flex justify-between items-center p-6 border-b border-gray-100">
                        <h3 className="text-lg font-semibold text-gray-900">Select Attachment</h3>
                        <button type="button" onClick={() => setShowAttachmentOptions(null)} className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-gray-100">
                          <X size={20} />
                        </button>
                      </div>

                      {!cameraStream ? (
                        <div className="p-6 space-y-4">
                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelectFile(showAttachmentOptions)}
                            className="w-full p-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200 flex items-center space-x-4"
                          >
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                              <File className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="text-left">
                              <div className="font-medium text-gray-900">Select File</div>
                              <div className="text-sm text-gray-500">From your device</div>
                            </div>
                          </motion.button>

                          <motion.button
                            type="button"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleOpenCamera(showAttachmentOptions)}
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

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={handleClear}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <Trash2 className="mr-2 h-5 w-5" /> Clear Form
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Create Area
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
          <p className="text-lg font-medium text-gray-800 text-center">Genba area has been created successfully!</p>
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

export default FormGenbaArea;
