import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TiptapEditor from "../../RichTextEditor";
import Sidebar from "../../Sidebar";
import { X, Clock, CheckCircle, ToolCase, ArrowLeft, Save, Trash2, Hourglass, ListPlus, Paperclip, Camera, File, Clipboard, ChevronLeft } from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import PageHeader from "../../PageHeader";
import { useAuth, User as AuthUser, Department, ServiceCatalogue } from "../../../routes/AuthContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface OptionType {
  value: string;
  label: string;
}

interface ServiceGroup {
  id: number;
  name: string;
  description?: string;
}

interface WorkOrderFormDataLocal {
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_type_id?: string;
  service_group_id: number | null;
  service_catalogue_id: number | null;
  service_id?: string;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null;
  received_by_id: number | null;
  handling_date: string | null;
  action_taken: string | null;
  handling_status: string;
  remarks: string | null;
  assigned_to_id?: number | null;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

const AddWorkOrderFormIT: React.FC = () => {
  const { addWorkOrderIT, user, getUsers, getServices, getDepartment, getServiceGroups } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [serviceList, setServiceList] = useState<ServiceCatalogue[]>([]);
  const [assetOptions, setAssetOptions] = useState<OptionType[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ message: string; work_order?: any } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [filteredServices, setFilteredServices] = useState<ServiceCatalogue[]>([]);
  const [filteredServiceGroups, setFilteredServiceGroups] = useState<ServiceGroup[]>([]);

  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAttachmentClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowAttachmentOptions(true);
  };

  const handleSelectFile = () => {
    const fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = "image/*, .pdf, .doc, .docx, .xls, .xlsx";

    fileInput.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (target.files && target.files.length > 0) {
        const file = target.files[0];
        setSelectedFile(file);
        setFormData((prev) => ({
          ...prev,
          attachment: file.name,
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

  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        const imageDataURL = canvas.toDataURL("image/jpeg", 0.8);

        setFormData((prev) => ({
          ...prev,
          attachment: imageDataURL,
        }));

        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
      }
    }
    setShowAttachmentOptions(false);
  };

  const handleCloseCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setShowAttachmentOptions(false);
  };

  const initialFormData: WorkOrderFormDataLocal = {
    date: new Date().toISOString().split("T")[0],
    reception_method: "Electronic Work Order System",
    requester_id: user?.id ? parseInt(user.id) : 0,
    known_by_id: user?.department?.head_id || null,
    department_id: user?.department_id || 0,
    service_group_id: null,
    service_catalogue_id: null,
    asset_no: "",
    device_info: "",
    complaint: "",
    attachment: null,
    received_by_id: null,
    handling_date: null,
    action_taken: null,
    handling_status: "New",
    remarks: null,
    assigned_to_id: null,
  };

  const [formData, setFormData] = useState<WorkOrderFormDataLocal>(initialFormData);

  const isElectronicMethod = formData.reception_method === "Electronic Work Order System";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServiceGroups(user?.id ? parseInt(user.id) : 0);

        // Debug: Lihat struktur data yang diterima
        console.log("Raw service groups data:", data);

        // Pastikan mapping sesuai dengan struktur response
        const mapped = data.map((g: any) => ({
          id: Number(g.id),
          name: g.group_name || g.name || "",
          description: g.group_description || g.description || undefined,
        }));

        console.log("Mapped service groups:", mapped);
        setFilteredServiceGroups(mapped);

        const departmentsResponse = await getDepartment();
        setDepartmentList(departmentsResponse);

        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);

        if (user && user.id) {
          const servicesData = await getServices(parseInt(user.id));
          console.log("Services data:", servicesData); // Debug services
          setServiceList(servicesData);
        }
      } catch (err) {
        console.error("Failed to fetch master data:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUsers, getServices, getDepartment, getServiceGroups]);

  useEffect(() => {
    if (formData.reception_method === "Electronic Work Order System" && user && departmentList.length > 0) {
      const userDepartment = departmentList.find((dept) => dept.id === user.department_id);
      const headId = userDepartment?.head_id || null;

      setFormData((prev) => ({
        ...prev,
        requester_id: parseInt(user.id),
        department_id: user.department_id || 0,
        known_by_id: headId,
      }));
    }
  }, [formData.reception_method, user, departmentList]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (formData.service_group_id !== null && serviceList.length > 0) {
      const filtered = serviceList.filter((service) => {
        // Pastikan service.group ada dan bandingkan ID-nya
        return service.service_group && service.service_group.id === formData.service_group_id;
      });
      setFilteredServices(filtered);
      console.log("Filtered services for group", formData.service_group_id, ":", filtered);
    } else {
      setFilteredServices([]);
    }
  }, [formData.service_group_id, serviceList]);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | OptionType | null, name?: string) => {
    let fieldName: string;
    let value: string | number | null;

    if (e && "target" in e) {
      fieldName = e.target.name;
      value = e.target.value;
    } else if (e && typeof e === "object" && "value" in e && name) {
      fieldName = name;
      value = e.value;
    } else if (e === null && name) {
      fieldName = name;
      value = null;
    } else {
      return;
    }

    setFormData((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  }, []);

  const handleReceptionMethodChange = (selectedOption: OptionType | null) => {
    const method = selectedOption?.value || "";

    setFormData((prev) => {
      const newData = { ...prev, reception_method: method };

      if (method === "Electronic Work Order System" && user) {
        return {
          ...newData,
          requester_id: parseInt(user.id),
          department_id: user.department?.id || 0,
          known_by_id: user.department?.head_id || null,
        };
      }
      return newData;
    });
  };

  const handleAssetNoChange = (newValue: OptionType | null) => {
    setFormData((prev) => ({
      ...prev,
      asset_no: newValue ? newValue.value : "",
    }));
  };

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFormData((prev) => ({
      ...prev,
      attachment: null,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi
    if (!formData.service_group_id) {
      setError("Service Type is required");
      setIsLoading(false);
      return;
    }

    if (!formData.service_catalogue_id) {
      setError("Service is required");
      setIsLoading(false);
      return;
    }

    // Pastikan service yang dipilih sesuai dengan service group
    const selectedService = filteredServices.find((service) => service.id === formData.service_catalogue_id);

    if (!selectedService) {
      setError("Selected service is not available for the chosen service type");
      setIsLoading(false);
      return;
    }

    const dataToSend = {
      ...formData,
      service_group_id: formData.service_group_id,
      service_catalogue_id: formData.service_catalogue_id,
    };

    console.log("Submitting data:", dataToSend); // Debug

    try {
      const result = await addWorkOrderIT(dataToSend);
      setSuccessMessage({
        message: "Work Order created successfully!",
        work_order: result.work_order || result,
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan work order. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceGroupChange = (selectedOption: OptionType | null) => {
    const serviceGroupId = selectedOption ? parseInt(selectedOption.value) : null;

    setFormData((prev) => ({
      ...prev,
      service_group_id: serviceGroupId,
      service_catalogue_id: null, // Reset service ketika group berubah
    }));
  };

  const handleServiceCatalogueChange = (selectedOption: OptionType | null) => {
    const serviceCatalogueId = selectedOption ? parseInt(selectedOption.value) : null;

    setFormData((prev) => ({
      ...prev,
      service_catalogue_id: serviceCatalogueId,
    }));
  };

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/workorders/it");
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showAttachmentOptions) {
        setShowAttachmentOptions(false);
      }
    };

    if (showAttachmentOptions) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showAttachmentOptions]);

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

  const handleRequesterChange = useCallback(
    (selectedOption: OptionType | null) => {
      if (!selectedOption) return;

      const selectedUserId = parseInt(selectedOption.value);
      const selectedUser = allUsers.find((user) => parseInt(user.id) === selectedUserId);

      if (selectedUser) {
        const userDepartment = departmentList.find((dept) => dept.id === selectedUser.department_id);

        setFormData((prev) => ({
          ...prev,
          requester_id: selectedUserId,
          department_id: selectedUser.department_id || 0,
          known_by_id: userDepartment?.head_id || null,
        }));
      }
    },
    [allUsers, departmentList]
  );

  const getRequesterDepartment = () => {
    if (isElectronicMethod) {
      const userDepartment = departmentList.find((dept) => dept.id === user?.department_id);
      return userDepartment?.name || "No department assigned";
    }

    const department = departmentList.find((dept) => dept.id === formData.department_id);
    return department?.name || "No department assigned";
  };

  const getRequesterDepartmentHead = () => {
    if (isElectronicMethod) {
      const userDepartment = departmentList.find((dept) => dept.id === user?.department_id);

      if (userDepartment && userDepartment.head_id) {
        const headUser = allUsers.find((u) => parseInt(u.id) === userDepartment.head_id);
        return headUser?.name || "No department head assigned";
      }
      return "No department head assigned";
    }

    const department = departmentList.find((dept) => dept.id === formData.department_id);

    if (department && department.head_id) {
      const headUser = allUsers.find((u) => parseInt(u.id) === department.head_id);
      return headUser?.name || "No department head assigned";
    }

    return "No department head assigned";
  };

  const FilePreview: React.FC<{
    selectedFile: File | null;
    attachment: string | null;
    onRemove: () => void;
  }> = ({ selectedFile, attachment, onRemove }) => {
    if (!selectedFile && !attachment) return null;

    return (
      <div className="mt-4 p-4 border border-gray-200 rounded-xl bg-white shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${selectedFile ? "bg-blue-50" : "bg-purple-50"}`}>{selectedFile ? <File className="h-6 w-6 text-blue-600" /> : <Camera className="h-6 w-6 text-purple-600" />}</div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">{selectedFile ? selectedFile.name : "Photo from camera"}</p>
              <div className="flex items-center space-x-4 mt-1">
                <p className="text-xs text-gray-500">{selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "JPEG Image"}</p>
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Ready to upload</span>
              </div>
            </div>
          </div>
          <motion.button
            type="button"
            onClick={onRemove}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title="Remove attachment"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Preview untuk gambar dari kamera */}
        {attachment && attachment.startsWith("data:image") && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-2">Preview:</p>
            <div className="flex justify-center">
              <img src={attachment} alt="Captured" className="h-32 w-32 object-cover rounded-lg border shadow-sm" />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Add Work Order" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Clipboard />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Create New Work Order</h1>
              <p className="text-gray-600 mt-1">Fill in the details to create a new maintenance or service request</p>
            </div>
            <motion.button
              onClick={() => navigate("/workorders/it")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ChevronLeft className="text-lg" /> Back to Work Orders
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
                  <Clock className="mr-2 text-blue-500" /> General Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
                      Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                    />
                  </div>
                  <div>
                    <label htmlFor="reception_method" className="block text-sm font-medium text-gray-700 mb-1">
                      Reception Method <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="reception_method"
                      name="reception_method"
                      options={[
                        { value: "Electronic Work Order System", label: "Electronic Work Order System" },
                        { value: "Direct Information", label: "Direct Information" },
                        { value: "Phone", label: "Phone" },
                        { value: "Whatsapp", label: "Whatsapp" },
                        { value: "Email", label: "Email" },
                      ]}
                      value={{ value: formData.reception_method, label: formData.reception_method }}
                      onChange={handleReceptionMethodChange}
                      placeholder="Select Reception Method"
                      styles={customSelectStyles}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="requester_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Requester <span className="text-red-500">*</span>
                    </label>
                    {isElectronicMethod ? (
                      <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                        <span>{user?.name || "Current User"}</span>
                      </div>
                    ) : (
                      <Select
                        id="requester_id"
                        name="requester_id"
                        options={allUsers.map((u) => ({
                          value: String(u.id),
                          label: u.name,
                        }))}
                        value={
                          allUsers.find((u) => parseInt(u.id) === formData.requester_id)
                            ? {
                                value: String(formData.requester_id),
                                label: allUsers.find((u) => parseInt(u.id) === formData.requester_id)?.name || "",
                              }
                            : null
                        }
                        onChange={handleRequesterChange}
                        placeholder="Select Requester"
                        styles={customSelectStyles}
                        required
                      />
                    )}
                  </div>
                  <div>
                    <label htmlFor="department_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Department <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                      <span>{getRequesterDepartment()}</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="known_by_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Known By (Head)
                    </label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                      <span>{getRequesterDepartmentHead()}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ToolCase className="mr-2 text-green-500" /> Service Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="service_group_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="service_group_id"
                      name="service_group_id"
                      options={filteredServiceGroups.map((group) => ({
                        value: String(group.id),
                        label: group.name,
                      }))}
                      value={
                        formData.service_group_id !== null
                          ? {
                              value: String(formData.service_group_id),
                              label: filteredServiceGroups.find((g) => g.id === formData.service_group_id)?.name || "",
                            }
                          : null
                      }
                      onChange={handleServiceGroupChange}
                      placeholder="Select Service Type"
                      styles={customSelectStyles}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="service_catalogue_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Service <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="service_catalogue_id"
                      name="service_catalogue_id"
                      options={filteredServices.map((service) => ({
                        value: String(service.id),
                        label: service.service_name,
                      }))}
                      value={
                        formData.service_catalogue_id !== null
                          ? {
                              value: String(formData.service_catalogue_id),
                              label: filteredServices.find((s) => s.id === formData.service_catalogue_id)?.service_name || "",
                            }
                          : null
                      }
                      onChange={handleServiceCatalogueChange}
                      placeholder={formData.service_group_id !== null ? (filteredServices.length === 0 ? "No services available for selected type" : "Select Service") : "Please select Service Type first"}
                      styles={customSelectStyles}
                      isDisabled={formData.service_group_id === null || filteredServices.length === 0}
                      required
                    />

                    {filteredServices.length === 0 && formData.service_group_id && <p className="text-sm text-yellow-500 mt-1">No services available for selected type</p>}
                  </div>
                  <div>
                    <label htmlFor="asset_no" className="block text-sm font-medium text-gray-700 mb-1">
                      No. Asset {/* Hapus <span className="text-red-500">*</span> */}
                    </label>
                    <CreatableSelect<OptionType>
                      name="asset_no"
                      id="asset_no"
                      options={assetOptions}
                      value={formData.asset_no ? { value: formData.asset_no, label: formData.asset_no } : null}
                      onChange={handleAssetNoChange}
                      onCreateOption={(inputValue) => {
                        const newOption: OptionType = { value: inputValue, label: inputValue };
                        setAssetOptions((prev) => [...prev, newOption]);
                        handleAssetNoChange(newOption);
                      }}
                      placeholder="Type or select Asset No."
                      styles={customSelectStyles}
                      isClearable // Tambahkan ini agar user bisa clear field
                      required={false} // Tambahkan ini untuk disable HTML5 validation
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ListPlus className="mr-2 text-purple-500" /> Device & Complaint Details
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="device_info" className="block text-sm font-medium text-gray-700 mb-1">
                      Device Information <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="device_info"
                      name="device_info"
                      value={formData.device_info}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="Provide details about the device (e.g., model, serial number)."
                    ></textarea>
                  </div>
                  <div>
                    <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-1">
                      Complaint <span className="text-red-500">*</span>
                    </label>

                    <TiptapEditor
                      value={formData.complaint}
                      onChange={(value) => {
                        setFormData((prev) => ({
                          ...prev,
                          complaint: value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-gray-200">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Attachment <span className="text-gray-400 font-normal">(Optional)</span>
                </label>

                {!selectedFile && !formData.attachment ? (
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
                      <p className="text-sm font-medium text-blue-900">{selectedFile ? `File selected: ${selectedFile.name}` : "Photo captured from camera"}</p>
                      <p className="text-xs text-blue-600 mt-1">File ready for upload. Click to change.</p>
                    </div>
                  </div>
                )}

                <FilePreview selectedFile={selectedFile} attachment={formData.attachment} onRemove={handleRemoveFile} />

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
                                <div className="font-medium text-gray-900">Select File</div>
                                <div className="text-sm text-gray-500">From your device</div>
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

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={() => {
                    setFormData(initialFormData);
                    setSelectedFile(null);
                    setError(null);
                    setSuccessMessage(null);
                  }}
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
                  disabled={isLoading}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Add Work Order
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
          <p className="text-lg font-medium text-gray-800 text-center mb-2">{successMessage?.message}</p>
          <p className="text-sm text-gray-600 mb-4">Work Order Number: {successMessage?.work_order?.work_order_no}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
          >
            Go to Work Orders
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default AddWorkOrderFormIT;
