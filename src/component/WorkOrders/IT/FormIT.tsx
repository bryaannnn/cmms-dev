import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import TiptapEditor from "../../RichTextEditor";
import Sidebar from "../../Sidebar";
import {
  X,
  Clock,
  CheckCircle,
  ToolCase,
  ArrowLeft,
  Save,
  Trash2,
  Hourglass,
  ListPlus,
  Paperclip,
  Sun,
  Moon,
  Settings,
  Bell,
  User as UserIcon,
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  LogOut,
  AlertTriangle,
  Camera,
  File,
  Clipboard,
} from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import PageHeader from "../../PageHeader";
import { useAuth, User as AuthUser, Department, WorkOrderFormData, ServiceCatalogue } from "../../../routes/AuthContext";

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

// Perbaiki interface di FormIT.tsx
interface WorkOrderFormDataLocal {
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_type_id: string;
  service_group_id?: number;
  service_catalogue_id?: number;
  service_id: string;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null; // ✅ Hapus undefined, hanya string | null
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
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<{ message: string; work_order?: any } | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [filteredServices, setFilteredServices] = useState<ServiceCatalogue[]>([]);
  const [filteredServiceGroups, setFilteredServiceGroups] = useState<ServiceGroup[]>([]);
  const [serviceGroupsList, setServiceGroupsList] = useState<ServiceGroup[]>([]);
  const [isServicesLoading, setIsServicesLoading] = useState(false);

  const [showAttachmentOptions, setShowAttachmentOptions] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleAttachmentClick = (e: React.MouseEvent) => {
  e.preventDefault(); // Tambahkan ini
  e.stopPropagation(); // Dan ini untuk extra safety
  setShowAttachmentOptions(true);
};

  // Fungsi untuk memilih file
  // Fungsi untuk memilih file (simplified version)
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
        setShowAttachmentOptions(false);
      }
    };
    fileInput.click();
  };

  // Fungsi untuk membuka kamera
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

  // Fungsi untuk mengambil foto dari kamera
  // Ganti bagian handleCapturePhoto dengan ini:
  const handleCapturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext("2d");
      if (context) {
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        context.drawImage(videoRef.current, 0, 0);

        // Konversi canvas ke data URL dan simpan sebagai string
        const imageDataURL = canvas.toDataURL("image/jpeg", 0.8);

        // Simpan data URL ke state atau langsung ke formData
        setFormData((prev) => ({
          ...prev,
          attachment: imageDataURL, // atau simpan sebagai base64 string
        }));

        // Stop kamera
        if (cameraStream) {
          cameraStream.getTracks().forEach((track) => track.stop());
          setCameraStream(null);
        }
        setShowAttachmentOptions(false);
      }
    }
  };
  // Fungsi untuk menutup kamera
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
    service_type_id: "", // Changed from service_group_id
    service_id: "", // Changed from service_catalogue_id
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

  // Di useEffect untuk fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getServiceGroups(0);
        const mapped = data.map((g) => ({
          id: Number(g.id),
          name: g.group_name ?? "",
          description: g.group_description ?? undefined,
        }));
        setFilteredServiceGroups(mapped);

        const departmentsResponse = await getDepartment();
        setDepartmentList(departmentsResponse);

        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);

        if (user && user.id) {
          const servicesData = await getServices(parseInt(user.id));
          const transformedServices = servicesData;
          setServiceList(transformedServices); // ✅ Simpan semua services
          console.log("Services loaded:", transformedServices);
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
      // Cari department user dari departmentList yang sudah di-fetch
      const userDepartment = departmentList.find((dept) => dept.id === user.department_id);
      const headId = userDepartment?.head_id || null;

      setFormData((prev) => ({
        ...prev,
        requester_id: parseInt(user.id),
        department_id: user.department_id || 0,
        known_by_id: headId,
      }));
    }
  }, [formData.reception_method, user, departmentList]); // Tambahkan departmentList ke dependencies

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
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (formData.service_type_id && serviceList.length > 0) {
      const filtered = serviceList.filter((service) => String(service.id) === formData.service_type_id);

      setFilteredServices(filtered);
    } else {
      setFilteredServices([]);
    }
  }, [formData.service_type_id, serviceList]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen, darkMode]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  // Di FormIT.tsx - perbaiki handleChange
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | OptionType | null, name?: keyof WorkOrderFormData) => {
    let fieldName: keyof WorkOrderFormData;
    let value: string | number | null;

    if (e && "target" in e) {
      fieldName = e.target.name as keyof WorkOrderFormData;
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement> | { target: { files: FileList | null } }) => {
    const files = "nativeEvent" in e ? e.target.files : e.target.files;

    if (files && files.length > 0) {
      setSelectedFile(files[0]);
      setFormData((prev) => ({
        ...prev,
        attachment: files[0].name,
      }));
    } else {
      setSelectedFile(null);
      setFormData((prev) => ({
        ...prev,
        attachment: null,
      }));
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFormData((prev) => ({
      ...prev,
      attachment: null, // ✅ Explicitly set to null
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const dataToSend: WorkOrderFormDataLocal = {
      ...formData,
      date: formData.date,
      reception_method: formData.reception_method,
      requester_id: formData.requester_id,
      known_by_id: formData.known_by_id,
      department_id: formData.department_id,
      service_group_id: Number(formData.service_type_id),
      service_catalogue_id: Number(formData.service_id),
      asset_no: formData.asset_no,
      device_info: formData.device_info,
      complaint: formData.complaint,
      attachment: formData.attachment,
    };

    try {
      await addWorkOrderIT(dataToSend);
      setShowSuccessModal(true); // Show success modal
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan data history mesin. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceGroupChange = (selectedOption: OptionType | null) => {
    setFormData((prev) => ({
      ...prev,
      service_type_id: selectedOption ? selectedOption.value : "",
      service_id: "",
    }));
  };

  const handleServiceCatalogueChange = (selectedOption: OptionType | null) => {
    setFormData((prev) => ({
      ...prev,
      service_id: selectedOption ? selectedOption.value : "",
    }));
  };

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/workorders/it");
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

  const insights = [
    {
      id: 1,
      title: "Maintenance Efficiency Improved",
      description: "Preventive maintenance completion rate increased by 15% this month",
      icon: <CheckCircle className="text-green-500" />,
      date: "Today, 09:30 AM",
    },
    {
      id: 2,
      title: "3 Assets Requiring Attention",
      description: "Critical assets showing signs of wear need inspection",
      icon: <AlertTriangle className="text-yellow-500" />,
      date: "Yesterday, 02:15 PM",
    },
    {
      id: 3,
      title: "Monthly Maintenance Completed",
      description: "All scheduled maintenance tasks completed on time",
      icon: <CheckCircle className="text-blue-500" />,
      date: "Jul 28, 2023",
    },
  ];

  const handleRequesterChange = useCallback(
    (selectedOption: OptionType | null) => {
      if (!selectedOption) return;

      const selectedUserId = parseInt(selectedOption.value);
      const selectedUser = allUsers.find((user) => parseInt(user.id) === selectedUserId);

      if (selectedUser) {
        // Gunakan departmentList yang sudah diambil dari API
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
      // Untuk electronic method, gunakan department user yang login
      const userDepartment = departmentList.find((dept) => dept.id === user?.department_id);
      return userDepartment?.name || "No department assigned";
    }

    // Untuk metode lainnya, gunakan department dari form data
    const department = departmentList.find((dept) => dept.id === formData.department_id);
    return department?.name || "No department assigned";
  };

  const getRequesterDepartmentHead = () => {
    if (isElectronicMethod) {
      // Untuk electronic method, cari kepala department dari department user
      const userDepartment = departmentList.find((dept) => dept.id === user?.department_id);

      if (userDepartment && userDepartment.head_id) {
        const headUser = allUsers.find((u) => parseInt(u.id) === userDepartment.head_id);
        return headUser?.name || "No department head assigned";
      }
      return "No department head assigned";
    }

    // Untuk metode lainnya, cari kepala department dari department yang dipilih
    const department = departmentList.find((dept) => dept.id === formData.department_id);

    if (department && department.head_id) {
      const headUser = allUsers.find((u) => parseInt(u.id) === department.head_id);
      return headUser?.name || "No department head assigned";
    }

    return "No department head assigned";
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Work Unit" mainTitleHighlight="Page" description="Manage work units and their configurations within the system." icon={<Clipboard />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

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
                    <label htmlFor="service_type_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="service_type_id"
                      name="service_type_id"
                      options={filteredServiceGroups.map((group) => ({
                        value: String(group.id),
                        label: group.name,
                      }))}
                      value={
                        formData.service_type_id
                          ? {
                              value: formData.service_type_id,
                              label: filteredServiceGroups.find((g) => String(g.id) === formData.service_type_id)?.name || "",
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
                    <label htmlFor="service_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Service <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="service_id"
                      name="service_id"
                      options={filteredServices.map((service) => ({
                        value: String(service.id), // penting
                        label: service.service_name,
                      }))}
                      value={
                        formData.service_id
                          ? {
                              value: formData.service_id,
                              label: filteredServices.find((s) => String(s.id) === formData.service_id)?.service_name || "",
                            }
                          : null
                      }
                      onChange={handleServiceCatalogueChange}
                      placeholder="Select Service"
                      styles={customSelectStyles}
                    />

                    {filteredServices.length === 0 && formData.service_type_id && <p className="text-sm text-yellow-500 mt-1">No services available for selected type</p>}
                  </div>
                  <div>
                    <label htmlFor="asset_no" className="block text-sm font-medium text-gray-700 mb-1">
                      No. Asset <span className="text-red-500">*</span>
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
                      required
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

              <div className="mt-6 pt-6 border-t border-gray-100">
                <label htmlFor="attachment" className="block text-sm font-medium text-gray-700 mb-1">
                  Attachment (Optional)
                </label>

                <button
                  type="button"
                  className="mt-1 w-full flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-all duration-200 bg-transparent"
                  onClick={handleAttachmentClick}
                >
                  <div className="space-y-1 text-center">
                    <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600 justify-center">
                      <span>Klik untuk memilih attachment</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
                  </div>
                </button>

                {/* Modal pilihan attachment */}
                <AnimatePresence>
                  {showAttachmentOptions && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
                      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-lg font-semibold text-gray-900">Pilih Attachment</h3>
                          <button onClick={handleCloseCamera} className="text-gray-500 hover:text-gray-700">
                            <X size={24} />
                          </button>
                        </div>

                        {!cameraStream ? (
                          <div className="grid grid-cols-1 gap-4">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleSelectFile}
                              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                            >
                              <File className="h-8 w-8 text-gray-400 mr-3" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Pilih File</div>
                                <div className="text-sm text-gray-500">Dari perangkat Anda</div>
                              </div>
                            </motion.button>

                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={handleOpenCamera}
                              className="flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 transition-colors"
                            >
                              <Camera className="h-8 w-8 text-gray-400 mr-3" />
                              <div className="text-left">
                                <div className="font-medium text-gray-900">Ambil Foto</div>
                                <div className="text-sm text-gray-500">Gunakan kamera</div>
                              </div>
                            </motion.button>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden">
                              <video ref={videoRef} autoPlay playsInline className="w-full h-64 object-cover" />
                              <canvas ref={canvasRef} className="hidden" />
                            </div>
                            <div className="flex gap-3">
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCapturePhoto} className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium">
                                Ambil Foto
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleCloseCamera} className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium">
                                Batal
                              </motion.button>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Tampilkan file yang dipilih */}
                {selectedFile && (
                  <ul className="mt-3 border border-gray-200 rounded-md divide-y divide-gray-200">
                    <li key={selectedFile.name} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                      <div className="flex w-0 flex-1 items-center">
                        <Paperclip className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                        <span className="ml-2 w-0 flex-1 truncate">{selectedFile.name}</span>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <motion.button type="button" onClick={handleRemoveFile} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="font-medium text-red-600 hover:text-red-900 transition-colors duration-200">
                          Remove
                        </motion.button>
                      </div>
                    </li>
                  </ul>
                )}
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
