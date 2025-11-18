import React, { useState, useCallback, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Select from "react-select";
import { motion, AnimatePresence } from "framer-motion";
import PageHeader from "../../../component/PageHeader";
import Sidebar from "../../../component/Sidebar";
import { useAuth, GenbaWorkAreas, User, Department, LayoutInterface } from "../../../routes/AuthContext";
import { X, Save, Trash2, Hourglass, ArrowLeft, MapPin, Building, User as UserIcon, CheckCircle, Image, Paperclip, FilePlus2 } from "lucide-react";
import { getProjectEnvVariables } from "../../../shared/projectEnvVariables";

interface AreaFormData {
  name: string;
  department_id: string;
  pic_user_id: string;
  attachment: File | null;
  is_default: boolean;
  existingLayouts: LayoutInterface[];
}

type AreaDetail = GenbaWorkAreas & {
  existingLayouts: LayoutInterface[];
};

const getFotoUrl = (filePath: string): string => {
  const projectEnvVariables = getProjectEnvVariables();
  if (!filePath.startsWith("http")) {
    return `${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}/${filePath}`;
  }
  return filePath;
};

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: -50 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: -50 }} className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6">
        <div className="flex justify-between items-center border-b pb-3 mb-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
};

interface ImagePublicContentProps {
  areaData: AreaDetail | null;
  loading: boolean;
  error: string | null;
  navigate: ReturnType<typeof useNavigate>;
  sidebarOpen: boolean;
  isMobile: boolean;
  toggleSidebar: () => void;
}

const ImagePublicContent: React.FC<ImagePublicContentProps> = ({ areaData, loading, error, navigate, sidebarOpen, isMobile, toggleSidebar }) => {
  const areaName = areaData?.name || "-";
  const department = areaData?.department?.name || "-";
  const picName = areaData?.pic?.name || "-";
  const picAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(picName)}`;

  const isDefault = areaData?.is_default ?? false;
  const typeLabel = isDefault ? "Daily Reports" : "Bebas Lapor";

  const layouts = areaData?.existingLayouts.map((l) => getFotoUrl(l.path)).filter(Boolean) || [];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Hourglass className="animate-spin mr-2 h-10 w-10 text-blue-500" />
        <p className="text-xl text-gray-700">Loading data area...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700">{error}</p>
        <motion.button
          onClick={() => navigate("/genba/genbaarea")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all"
        >
          Back to Areas
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <PageHeader mainTitle="Genba" mainTitleHighlight="Area Information" description="View public Genba area details" icon={<Image />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Image size={28} className="text-blue-600" />
                Detail Area: {areaName}
              </h1>
              <motion.button
                onClick={() => navigate("/genba/genbaarea")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-5 py-2.5 bg-gray-200 text-gray-800 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Back to Genba Area
              </motion.button>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 border border-blue-50">
              <div className="flex items-start space-x-6 mb-8">
                <div className="flex-shrink-0">
                  <img
                    src={picAvatar}
                    alt={picName}
                    className="w-24 h-24 object-cover rounded-full border-4 border-blue-100 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(picName)}`;
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-red-500" />
                    {areaName}
                  </h2>
                  <div className="text-gray-600 flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-semibold">{department}</span>
                  </div>
                  <div className="text-gray-600 flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{picName} (PIC)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="text-gray-600 flex items-center gap-2 text-md">
                  <FilePlus2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tipe Pelaporan:</span>
                  <span className="font-semibold">{typeLabel}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              <h3 className="text-lg font-bold text-gray-800 mb-3">Layout Area</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {layouts.length > 0 ? (
                  layouts.map((img, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
                      <img src={img} alt={`Layout ${i + 1}`} className="w-full h-56 object-cover rounded-lg" />
                      <p className="mt-2 text-sm text-gray-600 text-center">{`Layout Area ${i + 1}`}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">No layout image available.</div>
                )}
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              <div className="flex justify-center">
                <motion.button
                  onClick={() => navigate("/genba/genbaactivity/formgenbaactivity")}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all"
                >
                  <FilePlus2 size={20} />
                  Buat Laporan Genba
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

const EditFormGenbaArea: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, getGenbaAreas, updateGenbaAreas, getDepartment, getUsers, getWorkAreaById, deleteGenbaAreas } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const [isFormLoading, setIsFormLoading] = useState(true);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [formData, setFormData] = useState<AreaFormData>({
    name: "",
    department_id: "",
    pic_user_id: "",
    attachment: null,
    is_default: false,
    existingLayouts: [],
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [areaPublicData, setAreaPublicData] = useState<AreaDetail | null>(null);
  const [isPublicLoading, setIsPublicLoading] = useState(false);
  const [publicError, setPublicError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      if (!id) {
        setError("Area ID is missing.");
        setIsFormLoading(false);
        setPublicError("Area ID is missing.");
        return;
      }

      if (user) {
        setIsFormLoading(true);
        try {
          const areaResponse = await getWorkAreaById(id);
          // PERBAIKAN ERROR 1: Menggunakan respons langsung dari API tanpa properti .data
          const area = areaResponse as unknown as GenbaWorkAreas | null;

          if (!area) {
            throw new Error("Area not found for editing.");
          }

          const [departmentsResponse, usersResponse] = await Promise.all([getDepartment(), getUsers()]);

          setDepartments(departmentsResponse || []);
          setUsers(usersResponse || []);

          const existingLayouts: LayoutInterface[] = area.attachment || [];

          setFormData({
            name: area.name,
            department_id: area.department_id.toString(),
            pic_user_id: area.pic_user_id.toString(),
            attachment: null,
            is_default: area.is_default,
            existingLayouts: existingLayouts,
          });
        } catch (err) {
          setError("Failed to load area data for editing.");
        } finally {
          setIsFormLoading(false);
        }
      } else {
        setIsPublicLoading(true);
        try {
          const genbaAreas = await getGenbaAreas();
          const area = genbaAreas.find((area) => area.id.toString() === id);

          if (!area) {
            setPublicError("Area not found.");
            return;
          }

          const layouts: LayoutInterface[] = area.attachment || [];

          setAreaPublicData({ ...area, existingLayouts: layouts } as AreaDetail);
        } catch (err) {
          setPublicError("Failed to load area data for public view.");
        } finally {
          setIsPublicLoading(false);
        }
      }
    };

    loadData();
  }, [id, user, getGenbaAreas, getDepartment, getUsers, getWorkAreaById]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSelectChange = (field: "department_id" | "pic_user_id", selectedOption: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, attachment: e.target.files![0] }));
    }
  };

  const handleRemoveExistingLayout = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      existingLayouts: prev.existingLayouts.filter((_, i) => i !== index),
    }));
  };

  const handleOpenSuccessModal = () => setShowSuccessModal(true);
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/genba/genbaarea");
  };

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;

      setSubmitting(true);
      try {
        const form = new FormData();
        form.append("name", formData.name);
        form.append("department_id", formData.department_id);
        form.append("pic_user_id", formData.pic_user_id);
        form.append("is_default", formData.is_default ? "1" : "0");

        if (formData.attachment) {
          form.append("attachment", formData.attachment);
        } else if (formData.existingLayouts.length === 0) {
          form.append("attachment", "null");
        } else {
          form.append("existing_attachment_paths", JSON.stringify(formData.existingLayouts.map((l) => l.path)));
        }

        // PERBAIKAN ERROR 2: Menggunakan null sebagai argumen ketiga untuk memenuhi signature 3 argumen (kemungkinan untuk file optional/options)
        await updateGenbaAreas(id, form, null);

        handleOpenSuccessModal();
      } catch (err) {
        alert("Failed to update area. Check console for details.");
      } finally {
        setSubmitting(false);
      }
    },
    [id, formData, updateGenbaAreas]
  );

  const handleDeleteArea = async () => {
    if (!window.confirm("Are you sure you want to delete this Genba Area? This action cannot be undone.")) {
      return;
    }
    try {
      await deleteGenbaAreas(id!);
      alert("Genba Area deleted successfully.");
      navigate("/genba/genbaarea");
    } catch (error) {
      alert("Failed to delete area.");
    }
  };

  if (!user) {
    return <ImagePublicContent areaData={areaPublicData} loading={isPublicLoading} error={publicError} navigate={navigate} sidebarOpen={sidebarOpen} isMobile={isMobile} toggleSidebar={toggleSidebar} />;
  }

  if (isFormLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Hourglass className="animate-spin mr-2 h-10 w-10 text-blue-500" />
        <p className="text-xl text-gray-700">Loading edit form...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700">{error}</p>
      </div>
    );
  }

  const departmentOptions = departments.map((dept) => ({
    value: dept.id.toString(),
    label: dept.name,
  }));

  const userOptions = users.map((u) => ({
    value: u.id.toString(),
    label: u.name,
  }));

  const currentDepartment = departmentOptions.find((opt) => opt.value === formData.department_id);
  const currentPic = userOptions.find((opt) => opt.value === formData.pic_user_id);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <PageHeader mainTitle="Genba" mainTitleHighlight="Area Information" description="View public Genba area details" icon={<Image />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mx-auto max-w-4xl p-4 md:p-6 2xl:p-10">
            <div className="flex items-center justify-between mb-6">
              <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-700 transition-colors font-medium">
                <ArrowLeft size={20} className="mr-2" /> Back
              </motion.button>
              <button onClick={handleDeleteArea} className="flex items-center text-red-600 hover:text-red-700 transition-colors font-medium">
                <Trash2 size={20} className="mr-2" /> Delete Area
              </button>
            </div>

            <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Genba Area ({formData.name})</h1>

            <form onSubmit={handleSubmit}>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-lg p-6 space-y-6">
                <div className="space-y-1">
                  <label htmlFor="name" className="text-sm font-medium text-gray-700 flex items-center">
                    <MapPin size={16} className="mr-2 text-red-500" /> Area Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="department_id" className="text-sm font-medium text-gray-700 flex items-center">
                    <Building size={16} className="mr-2 text-blue-500" /> Department
                  </label>
                  <Select
                    id="department_id"
                    name="department_id"
                    options={departmentOptions}
                    value={currentDepartment}
                    onChange={(opt) => handleSelectChange("department_id", opt)}
                    required
                    className="mt-1"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "0.5rem",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        padding: "2px",
                      }),
                    }}
                  />
                </div>

                <div className="space-y-1">
                  <label htmlFor="pic_user_id" className="text-sm font-medium text-gray-700 flex items-center">
                    <UserIcon size={16} className="mr-2 text-green-500" /> Person In Charge (PIC)
                  </label>
                  <Select
                    id="pic_user_id"
                    name="pic_user_id"
                    options={userOptions}
                    value={currentPic}
                    onChange={(opt) => handleSelectChange("pic_user_id", opt)}
                    required
                    className="mt-1"
                    styles={{
                      control: (provided) => ({
                        ...provided,
                        borderRadius: "0.5rem",
                        boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
                        padding: "2px",
                      }),
                    }}
                  />
                </div>

                <div className="flex items-center pt-2">
                  <input id="is_default" name="is_default" type="checkbox" checked={formData.is_default} onChange={handleChange} className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
                  <label htmlFor="is_default" className="ml-2 block text-sm font-medium text-gray-700">
                    Set as Daily Report Area (Is Default)
                  </label>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <h3 className="text-md font-medium text-gray-800 flex items-center gap-2">
                    <Image size={18} className="text-purple-500" /> Existing Layouts
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    {formData.existingLayouts.map((layout, index) => (
                      <div key={index} className="relative group bg-gray-50 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={getFotoUrl(layout.path)} alt={`Layout ${index + 1}`} className="w-full h-32 object-cover" />
                        <motion.button type="button" onClick={() => handleRemoveExistingLayout(index)} className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                          <X size={16} />
                        </motion.button>
                        <p className="text-xs text-center p-1 text-gray-600 truncate">{layout.filename || `Layout ${index + 1}`}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-1">
                  <label htmlFor="attachment" className="text-sm font-medium text-gray-700 flex items-center">
                    <Paperclip size={16} className="mr-2 text-gray-500" /> Upload New Layout (Optional)
                  </label>
                  <input
                    type="file"
                    id="attachment"
                    name="attachment"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept="image/*,application/pdf"
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  {formData.attachment && <p className="text-xs text-green-600 mt-1">New file selected: {formData.attachment.name}</p>}
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-6 w-full flex items-center justify-center bg-blue-600 text-white font-semibold py-2.5 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
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
              </motion.div>
            </form>
          </motion.div>
        </main>
      </div>

      <AnimatePresence>
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
      </AnimatePresence>
    </div>
  );
};

export default EditFormGenbaArea;
