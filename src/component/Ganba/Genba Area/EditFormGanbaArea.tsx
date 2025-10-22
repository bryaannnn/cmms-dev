import React, { useState, useCallback, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../component/PageHeader";
import Sidebar from "../../../component/Sidebar";
import { X, Save, Trash2, Hourglass, ArrowLeft, MapPin, Building, User, Upload, CheckCircle } from "lucide-react";

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  department: string;
}

interface AreaFormData {
  department: string;
  nama: string;
  penanggungJawab: string;
  layoutRuangan: File | null;
  existingLayout?: string;
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

  const [formData, setFormData] = useState<AreaFormData>({
    department: "",
    nama: "",
    penanggungJawab: "",
    layoutRuangan: null,
    existingLayout: "",
  });

  // Sample data - in real app, this would come from API
  const departments: Department[] = [
    { id: "1", name: "Produksi" },
    { id: "2", name: "Gudang" },
    { id: "3", name: "Administrasi" },
    { id: "4", name: "Engineering" },
    { id: "5", name: "Quality" },
  ];

  const users: User[] = [
    { id: "1", name: "Budi Santoso", department: "Produksi" },
    { id: "2", name: "Siti Rahayu", department: "Gudang" },
    { id: "3", name: "Ari Wibowo", department: "Administrasi" },
    { id: "4", name: "Hendra Gunawan", department: "Engineering" },
    { id: "5", name: "Fitri Handayani", department: "Quality" },
  ];

  // Sample area data - in real app, this would come from API based on ID
  const sampleArea = {
    id: "1",
    nama: "Area Produksi Line A",
    department: "1",
    penanggungJawab: "1",
    layoutRuangan: "/api/placeholder/400/300",
  };

  useEffect(() => {
    // Simulate loading area data
    const loadAreaData = async () => {
      setLoading(true);
      try {
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (id === sampleArea.id) {
          setFormData({
            department: sampleArea.department,
            nama: sampleArea.nama,
            penanggungJawab: sampleArea.penanggungJawab,
            layoutRuangan: null,
            existingLayout: sampleArea.layoutRuangan,
          });
        } else {
          setError("Area not found");
        }
      } catch (err) {
        setError("Failed to load area data");
      } finally {
        setLoading(false);
      }
    };

    loadAreaData();
  }, [id]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { value: string; label: string } | null, name?: string) => {
    if (e && typeof e === "object" && "value" in e && name) {
      // For react-select
      setFormData((prev) => ({
        ...prev,
        [name]: e.value,
      }));
    } else if (e && "target" in e) {
      // For native input/textarea
      const { name, value } = e.target;

      // Handle file input
      if (name === "layoutRuangan") {
        const fileInput = e.target as HTMLInputElement;
        const selectedFile = fileInput.files?.[0] || null;

        setFormData((prev) => ({
          ...prev,
          layoutRuangan: selectedFile,
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }));
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setSuccess(null);

    // Validation
    if (!formData.department || !formData.nama || !formData.penanggungJawab) {
      setError("Please fill in all required fields");
      setSubmitting(false);
      return;
    }

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess("Area berhasil diperbarui!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui area. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      department: sampleArea.department,
      nama: sampleArea.nama,
      penanggungJawab: sampleArea.penanggungJawab,
      layoutRuangan: null,
      existingLayout: sampleArea.layoutRuangan,
    });
    setError(null);
    setSuccess(null);
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/genba/genbaarea");
  }, [navigate]);

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
              {/* Department Selection */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Building className="mr-2 text-blue-500" /> Department Information
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="department"
                      id="department"
                      options={departments.map((dept) => ({ value: dept.id, label: dept.name }))}
                      value={departments.map((dept) => ({ value: dept.id, label: dept.name })).find((option) => option.value === formData.department)}
                      onChange={(selectedOption) => handleChange(selectedOption, "department")}
                      placeholder="Select Department"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Area Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <MapPin className="mr-2 text-green-500" /> Area Details
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="nama" className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Area <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="nama"
                      id="nama"
                      value={formData.nama}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="e.g., Area Produksi Line A"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="penanggungJawab" className="block text-sm font-medium text-gray-700 mb-1">
                      Penanggung Jawab Area <span className="text-red-500">*</span>
                    </label>
                    <Select
                      name="penanggungJawab"
                      id="penanggungJawab"
                      options={users.map((user) => ({ value: user.id, label: user.name }))}
                      value={users.map((user) => ({ value: user.id, label: user.name })).find((option) => option.value === formData.penanggungJawab)}
                      onChange={(selectedOption) => handleChange(selectedOption, "penanggungJawab")}
                      placeholder="Select Penanggung Jawab"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Layout Ruangan */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Upload className="mr-2 text-purple-500" /> Layout Ruangan
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="layoutRuangan" className="block text-sm font-medium text-gray-700 mb-1">
                      Upload Layout Ruangan
                    </label>

                    {formData.existingLayout && !formData.layoutRuangan && (
                      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800 mb-2">Current layout:</p>
                        <div className="flex items-center space-x-3">
                          <img src={formData.existingLayout} alt="Current layout" className="w-20 h-20 object-cover rounded-lg border border-gray-200" />
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Existing Layout</p>
                            <p className="text-xs text-gray-600">Click upload to replace current layout</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-center w-full">
                      <label htmlFor="layoutRuangan" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-3 text-gray-400" />
                          <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-gray-500">PNG, JPG, PDF (MAX. 10MB)</p>
                        </div>
                        <input id="layoutRuangan" name="layoutRuangan" type="file" className="hidden" accept=".png,.jpg,.jpeg,.pdf" onChange={handleChange} />
                      </label>
                    </div>

                    {formData.layoutRuangan && (
                      <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                        <p className="text-sm text-green-800 flex items-center">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          New file selected: {formData.layoutRuangan.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Form Actions */}
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

      {/* Success Modal */}
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

export default EditFormGenbaArea;
