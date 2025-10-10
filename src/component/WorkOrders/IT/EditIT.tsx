import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { X, Clock, CheckCircle, ToolCase, ArrowLeft, Save, Trash2, Hourglass, ListPlus, Paperclip, Sun, Moon, Settings, Bell, User as UserIcon, ChevronDown, ChevronRight, ChevronLeft, LogOut, AlertTriangle } from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import { useAuth, User as AuthUser, Department, WorkOrderFormData, ServiceCatalogue } from "../../../routes/AuthContext";
import TiptapEditor from "../../../component/RichTextEditor";

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
  id?: number;
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_type_id?: string;
  service_group_id?: number;
  service_catalogue_id?: number;
  service_id?: string;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null;
  received_by_id?: number | null;
  handling_date?: string | null;
  action_taken?: string | null;
  handling_status?: string;
  remarks?: string | null;
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

const EditWorkOrderFormIT: React.FC = () => {
  const { updateWorkOrderIT, user, getUsers, getServices, getDepartment, getServiceGroups, getWorkOrderById } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

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
  const [isDataLoading, setIsDataLoading] = useState(true);
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

  const initialFormData: WorkOrderFormDataLocal = {
    date: new Date().toISOString().split("T")[0],
    reception_method: "Electronic Work Order System",
    requester_id: user?.id ? parseInt(user.id) : 0,
    known_by_id: user?.department?.head_id || null,
    department_id: user?.department_id || 0,
    service_type_id: "",
    service_id: "",
    asset_no: "",
    device_info: "",
    complaint: "",
    attachment: null,
    received_by_id: null,
    handling_date: null,
    action_taken: null,
    handling_status: "New",
    remarks: null,
  };

  const [formData, setFormData] = useState<WorkOrderFormDataLocal>(initialFormData);

  const isElectronicMethod = formData.reception_method === "Electronic Work Order System";

  // Fetch existing work order data
  // Fetch existing work order data
  useEffect(() => {
    const fetchWorkOrderData = async () => {
      if (!id) return;

      try {
        setIsDataLoading(true);
        const workOrderData = await getWorkOrderById(parseInt(id));

        console.log("Work Order Data:", workOrderData); // Debug log

        // Format data untuk form - PERBAIKAN DI SINI
        setFormData({
          id: workOrderData.id,
          date: workOrderData.date.split("T")[0],
          reception_method: workOrderData.reception_method,
          requester_id: workOrderData.requester_id,
          known_by_id: workOrderData.known_by_id,
          department_id: workOrderData.department_id,
          service_type_id: String(workOrderData.service_group_id || ""), // PERBAIKAN
          service_id: String(workOrderData.service_catalogue_id || ""), // PERBAIKAN
          asset_no: workOrderData.asset_no,
          device_info: workOrderData.device_info,
          complaint: workOrderData.complaint,
          attachment: workOrderData.attachment,
          received_by_id: workOrderData.received_by_id,
          handling_date: workOrderData.handling_date ? workOrderData.handling_date.split("T")[0] : null,
          action_taken: workOrderData.action_taken,
          handling_status: workOrderData.handling_status,
          remarks: workOrderData.remarks,
        });
      } catch (err: any) {
        console.error("Failed to fetch work order data:", err);
        setError(err.message || "Gagal memuat data work order. Silakan coba lagi.");
      } finally {
        setIsDataLoading(false);
      }
    };

    fetchWorkOrderData();
  }, [id, getWorkOrderById]);

  // Fetch master data
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
        setServiceGroupsList(mapped);

        const departmentsResponse = await getDepartment();
        setDepartmentList(departmentsResponse);

        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);

        if (user && user.id) {
          const servicesData = await getServices(parseInt(user.id));
          const transformedServices = servicesData;
          setServiceList(transformedServices);
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
    if (formData.reception_method === "Electronic Work Order System" && user) {
      const headId = user.department?.head_id || null;

      setFormData((prev) => ({
        ...prev,
        requester_id: parseInt(user.id),
        department_id: user.department_id || 0,
        known_by_id: headId,
      }));
    }
  }, [formData.reception_method, user]);

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
      const filtered = serviceList.filter((service) => String(service.service_type) === formData.service_type_id);
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

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFormData((prev) => ({
        ...prev,
        attachment: e.target.files![0].name,
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
      attachment: null,
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // PERBAIKAN: Mapping field untuk backend
    const dataToSend: WorkOrderFormDataLocal = {
      id: formData.id,
      date: formData.date,
      reception_method: formData.reception_method,
      requester_id: formData.requester_id,
      known_by_id: formData.known_by_id,
      department_id: formData.department_id,
      service_group_id: Number(formData.service_type_id), // PERBAIKAN
      service_catalogue_id: Number(formData.service_id), // PERBAIKAN
      asset_no: formData.asset_no,
      device_info: formData.device_info,
      complaint: formData.complaint,
      attachment: formData.attachment,
    };

    try {
      await updateWorkOrderIT(dataToSend);
      setSuccessMessage({
        message: "Work Order berhasil diperbarui!",
        work_order: { work_order_no: `WO-IT-${formData.id}` },
      });
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui work order. Silakan coba lagi.");
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
        const headUser = allUsers.find((user) => parseInt(user.id) === userDepartment.head_id);
        return headUser?.name || "No department head assigned";
      }
      return "No department head assigned";
    }

    const department = departmentList.find((dept) => dept.id === formData.department_id);

    if (department && department.head_id) {
      const headUser = allUsers.find((user) => parseInt(user.id) === department.head_id);
      return headUser?.name || "No department head assigned";
    }

    return "No department head assigned";
  };

  // Get current attachment filename from URL
  const getAttachmentFilename = () => {
    if (!formData.attachment) return null;

    try {
      const url = new URL(formData.attachment);
      const pathname = url.pathname;
      return pathname.substring(pathname.lastIndexOf("/") + 1);
    } catch (e) {
      return formData.attachment; // Return as is if it's not a valid URL
    }
  };

  if (isDataLoading) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Hourglass className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Memuat data work order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <motion.button onClick={() => navigate("/workorders/it")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ChevronLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back to Work Orders</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Work Order</h2>
          </div>

          <div className="flex items-center space-x-3 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>

            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
                className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <Bell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse border border-white"></span>
              </motion.button>

              <AnimatePresence>
                {showNotificationsPopup && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                  >
                    <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
                      <h4 className="font-semibold text-gray-800">Notifications</h4>
                      <button onClick={() => setShowNotificationsPopup(false)} className="text-gray-500 hover:text-gray-700">
                        <X size={18} />
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto custom-scrollbar">
                      {insights.slice(0, 3).map((notification) => (
                        <div key={notification.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{notification.icon}</div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      ))}
                      {insights.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotificationsPopup(false);
                        }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        View All
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
                <ChevronDown className="text-gray-500 text-base" />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                  >
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Signed in as</div>
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{user?.name || "Guest User"}</div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <UserIcon size={16} className="mr-2" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <Settings size={16} className="mr-2" /> Settings
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        navigate("/logout");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Work Order</h1>
              <p className="text-gray-600 mt-1">Perbarui detail work order yang sudah ada</p>
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
                      options={serviceGroupsList.map((group) => ({
                        value: String(group.id),
                        label: group.name,
                      }))}
                      value={
                        formData.service_type_id
                          ? {
                              value: formData.service_type_id,
                              label: serviceGroupsList.find((g) => String(g.id) === formData.service_type_id)?.name || "",
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
                        value: String(service.id),
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
                      value={formData.complaint} // Langsung dari formData
                      onChange={(value) => {
                        // Update langsung ke formData
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
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-all duration-200">
                  <div className="space-y-1 text-center">
                    <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label
                        htmlFor="file-upload"
                        className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                      >
                        <span>Upload a file</span>
                        <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
                  </div>
                </div>
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
                {formData.attachment && !selectedFile && (
                  <div className="mt-3">
                    <p className="text-sm text-gray-600">Current attachment: {getAttachmentFilename()}</p>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={() => navigate("/workorders/it")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Cancel
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
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Update Work Order
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

export default EditWorkOrderFormIT;
