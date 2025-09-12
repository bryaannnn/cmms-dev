import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { X, Clock, CheckCircle, ToolCase, ArrowLeft, Save, Trash2, Hourglass, ListPlus, Paperclip, Sun, Moon, Settings, Bell, User as UserIcon, ChevronDown, ChevronRight, ChevronLeft, LogOut, AlertTriangle } from "lucide-react";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";

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

interface User {
  id: string;
  name: string;
  department_id?: number;
  department_name?: string;
  department?: {
    id: number;
    name: string;
    head_id: number | null;
    head: {
      id: number;
      name: string;
    } | null;
  };
}

interface Department {
  id: number;
  name: string;
  head_id: number | null;
  head: {
    id: number;
    name: string;
  } | null;
}

interface Service4 {
  id: number;
  name: string;
  group_id: number;
  owner: {
    id: number;
    name: string;
  };
  description: string;
  priority: string;
  sla: string;
  impact: string;
  pic?: {
    id: number;
    name: string;
  };
}

interface WorkOrderFormData {
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_group_id: number;
  service_catalogue_id: number;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null;
  received_by_id: number | null;
  handling_date: string | null;
  action_taken: string | null;
  handling_status: string;
  remarks: string | null;
}

// Auth Context Mock
const AuthContext = React.createContext({
  addWorkOrderIT: (formData: WorkOrderFormData, file?: File | null) => Promise.resolve({ work_order_no: "WO-12345" }),
  user: {
    id: "1",
    name: "John Doe",
    department_id: 1,
    department_name: "IT Department",
    department: {
      id: 1,
      name: "IT Department",
      head_id: 2,
      head: {
        id: 2,
        name: "Jane Smith",
      },
    },
  },
  getUsers: () =>
    Promise.resolve([
      {
        id: "1",
        name: "John Doe",
        department_id: 1,
        department_name: "IT Department",
        department: {
          id: 1,
          name: "IT Department",
          head_id: 2,
          head: {
            id: 2,
            name: "Jane Smith",
          },
        },
      },
      {
        id: "2",
        name: "Jane Smith",
        department_id: 1,
        department_name: "IT Department",
        department: {
          id: 1,
          name: "IT Department",
          head_id: 2,
          head: {
            id: 2,
            name: "Jane Smith",
          },
        },
      },
      {
        id: "3",
        name: "Robert Johnson",
        department_id: 2,
        department_name: "Finance",
        department: {
          id: 2,
          name: "Finance",
          head_id: 5,
          head: {
            id: 5,
            name: "Michael Brown",
          },
        },
      },
      {
        id: "4",
        name: "Emily Davis",
        department_id: 3,
        department_name: "Operations",
        department: {
          id: 3,
          name: "Operations",
          head_id: 6,
          head: {
            id: 6,
            name: "Sarah Wilson",
          },
        },
      },
    ]),
  departments: [
    { id: 1, name: "IT Department", head_id: 2, head: { id: 2, name: "Jane Smith" } },
    { id: 2, name: "Finance", head_id: 5, head: { id: 5, name: "Michael Brown" } },
    { id: 3, name: "Operations", head_id: 6, head: { id: 6, name: "Sarah Wilson" } },
  ],
  services: [
    { id: 1, name: "Server Maintenance", group_id: 1, owner: { id: 1, name: "John Doe" }, description: "Server maintenance and troubleshooting", priority: "High", sla: "4 hours", impact: "Critical" },
    { id: 2, name: "Software Installation", group_id: 2, owner: { id: 2, name: "Jane Smith" }, description: "Software installation and configuration", priority: "Medium", sla: "24 hours", impact: "Medium" },
    { id: 3, name: "Network Issues", group_id: 3, owner: { id: 3, name: "Robert Johnson" }, description: "Network connectivity problems", priority: "High", sla: "2 hours", impact: "Critical" },
  ],
  getServices: (userId: number) =>
    Promise.resolve([
      {
        id_service: 1,
        service_name: "Server Maintenance",
        service_type: 1,
        service_owner: { id: 1, name: "John Doe" },
        service_description: "Server maintenance and troubleshooting",
        priority: "High",
        sla: "4 hours",
        impact: "Critical",
        pic: { id: 1, name: "John Doe" },
      },
      {
        id_service: 2,
        service_name: "Software Installation",
        service_type: 2,
        service_owner: { id: 2, name: "Jane Smith" },
        service_description: "Software installation and configuration",
        priority: "Medium",
        sla: "24 hours",
        impact: "Medium",
        pic: { id: 2, name: "Jane Smith" },
      },
      {
        id_service: 3,
        service_name: "Network Issues",
        service_type: 3,
        service_owner: { id: 3, name: "Robert Johnson" },
        service_description: "Network connectivity problems",
        priority: "High",
        sla: "2 hours",
        impact: "Critical",
        pic: { id: 3, name: "Robert Johnson" },
      },
    ]),
  getDepartmentById: (id: number) =>
    Promise.resolve({
      id: id,
      name: "IT Department",
      head_id: 2,
      head: { id: 2, name: "Jane Smith" },
    }),
});

const useAuth = () => React.useContext(AuthContext);

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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

const AddWorkOrderFormITD: React.FC = () => {
  const { addWorkOrderIT, user, getUsers, departments, services, getServices, getDepartmentById } = useAuth();
  const navigate = useNavigate();

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [serviceTypeList, setServiceTypeList] = useState<Service4[]>([]);
  const [serviceList, setServiceList] = useState<Service4[]>([]);
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

  const SERVICE_GROUPS = [
    { id: 1, name: "Hardware" },
    { id: 2, name: "Software" },
    { id: 3, name: "Network" },
    { id: 4, name: "Infrastructure" },
    { id: 5, name: "Industrial Support" },
  ];

  const SERVICE_CATALOGUES = [
    { id: 1, name: "Server", group_id: 1 },
    { id: 2, name: "Software", group_id: 2 },
    { id: 3, name: "Widapro", group_id: 2 },
    { id: 4, name: "Audit OFF", group_id: 2 },
  ];

  const initialFormData: WorkOrderFormData = {
    date: new Date().toISOString().split("T")[0],
    reception_method: "Electronic Work Order System",
    requester_id: user?.id ? parseInt(user.id) : 0,
    known_by_id: user?.department?.head_id || null,
    department_id: user?.department?.id || 0,
    service_group_id: 0,
    service_catalogue_id: 0,
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

  const [formData, setFormData] = useState<WorkOrderFormData>(initialFormData);

  const isElectronicMethod = formData.reception_method === "Electronic Work Order System";

  const transformServiceData = (services: any[]): Service4[] => {
    return services.map((service) => ({
      id: service.id_service,
      name: service.service_name,
      group_id: service.service_type,
      owner: {
        id: service.service_owner?.id || 0,
        name: service.service_owner?.name || `User ${service.service_owner}`,
      },
      description: service.service_description,
      priority: service.priority,
      sla: service.sla,
      impact: service.impact,
      pic: service.pic
        ? {
            id: service.pic.id || 0,
            name: service.pic.name || `User ${service.pic}`,
          }
        : undefined,
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);

        const departmentsMap = new Map<number, Department>();
        fetchedUsers.forEach((user) => {
          if (user.department) {
            departmentsMap.set(user.department.id, {
              id: user.department.id,
              name: user.department.name,
              head_id: user.department.head_id,
              head: user.department.head,
            });
          }
        });
        setDepartmentList(Array.from(departmentsMap.values()));

        if (user && user.id) {
          const servicesData = await getServices(parseInt(user.id));
          const transformedServices = transformServiceData(servicesData);
          setServiceList(transformedServices);
          setServiceTypeList(transformedServices);
        }
      } catch (err) {
        console.error("Failed to fetch master data:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUsers, getServices]);

  useEffect(() => {
    if (formData.reception_method === "Electronic Work Order System" && user) {
      const userDept = departmentList.find((d) => d.id === user.department_id);
      const headId = userDept?.head_id || null;

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
    if (formData.service_group_id) {
      const filteredServices = services.filter((service) => service.group_id === formData.service_group_id);
      setServiceList(filteredServices);
    } else {
      setServiceList([]);
      setFormData((prev) => ({ ...prev, service_catalogue_id: 0 }));
    }
  }, [formData.service_group_id, services]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen, darkMode]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | OptionType | null, actionMeta?: { name?: keyof WorkOrderFormData }) => {
    let name: keyof WorkOrderFormData;
    let value: string | number | null;

    if (e && "target" in e) {
      name = e.target.name as keyof WorkOrderFormData;
      value = e.target.value;
    } else if (e && typeof e === "object" && "value" in e && actionMeta?.name) {
      name = actionMeta.name;
      value = e.value;
    } else if (e === null && actionMeta?.name) {
      name = actionMeta.name;
      value = null;
    } else {
      return;
    }

    setFormData((prev) => {
      const newFormData = { ...prev };

      if (name === "known_by_id" || name === "received_by_id") {
        return {
          ...newFormData,
          [name]: value !== null ? parseInt(String(value), 10) || null : null,
        };
      }

      if (["requester_id", "department_id", "service_group_id", "service_catalogue_id"].includes(name)) {
        return {
          ...newFormData,
          [name]: parseInt(String(value), 10) || 0,
        };
      }

      return {
        ...newFormData,
        [name]: value,
      };
    });
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

  const handleAssetNoChange = useCallback((newValue: OptionType | null) => {
    setFormData((prev) => ({
      ...prev,
      asset_no: newValue ? newValue.value : "",
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
      setFormData((prev) => ({ ...prev, attachment: e.target.files![0].name }));
    } else {
      setSelectedFile(null);
      setFormData((prev) => ({ ...prev, attachment: null }));
    }
  }, []);

  const handleRemoveFile = useCallback(() => {
    setSelectedFile(null);
    setFormData((prev) => ({ ...prev, attachment: null }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);

      if (!formData.department_id || formData.department_id === 0) {
        setError("Please select a valid department before submitting");
        setIsLoading(false);
        return;
      }

      if (
        !formData.date ||
        !formData.reception_method ||
        !formData.requester_id ||
        !formData.department_id ||
        !formData.service_group_id ||
        !formData.service_catalogue_id ||
        !formData.asset_no ||
        !formData.device_info ||
        !formData.complaint
      ) {
        setError("Please fill in all required fields.");
        setIsLoading(false);
        return;
      }

      try {
        const createdOrder = await addWorkOrderIT(formData, selectedFile);
        setSuccessMessage({
          message: "Work Order created successfully!",
          work_order: createdOrder,
        });
        setShowSuccessModal(true);
        setFormData(initialFormData);
        setSelectedFile(null);
      } catch (err: any) {
        setError(err.message || "Failed to create work order");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, selectedFile, addWorkOrderIT]
  );

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

  const getCurrentDepartmentHead = () => {
    if (!user || !user.department || !user.department.head) return "No department head assigned";
    return user.department.head.name || "No department head assigned";
  };

  const getCurrentUserDepartment = () => {
    if (!user || !user.department) return "No department assigned";
    return user.department.name || "No department assigned";
  };

  const handleRequesterChange = useCallback(
    (selectedOption: OptionType | null) => {
      if (!selectedOption) return;

      const selectedUserId = parseInt(selectedOption.value);
      const selectedUser = allUsers.find((user) => parseInt(user.id) === selectedUserId);

      if (selectedUser) {
        setFormData((prev) => ({
          ...prev,
          requester_id: selectedUserId,
          department_id: selectedUser.department?.id || 0,
          known_by_id: selectedUser.department?.head_id || null,
        }));
      }
    },
    [allUsers]
  );

  const getRequesterDepartment = () => {
    if (isElectronicMethod) {
      return user?.department_name || "No department assigned";
    }

    const selectedUser = allUsers.find((u) => parseInt(u.id) === formData.requester_id);
    return selectedUser?.department?.name || "No department assigned";
  };

  const getRequesterDepartmentHead = () => {
    if (isElectronicMethod) {
      return user?.department?.head?.name || "No department head assigned";
    }

    const selectedUser = allUsers.find((u) => parseInt(u.id) === formData.requester_id);
    return selectedUser?.department?.head?.name || "No department head assigned";
  };

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
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Add Work Order</h2>
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
                      options={SERVICE_GROUPS.map((group) => ({
                        value: String(group.id),
                        label: group.name,
                      }))}
                      value={
                        SERVICE_GROUPS.find((group) => group.id === formData.service_group_id)
                          ? {
                              value: String(formData.service_group_id),
                              label: SERVICE_GROUPS.find((group) => group.id === formData.service_group_id)?.name || "",
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        setFormData((prev) => ({
                          ...prev,
                          service_group_id: selectedOption ? parseInt(selectedOption.value) : 0,
                        }))
                      }
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
                      options={SERVICE_CATALOGUES.map((catalogue) => ({
                        value: String(catalogue.id),
                        label: catalogue.name,
                      }))}
                      value={
                        SERVICE_CATALOGUES.find((catalogue) => catalogue.id === formData.service_catalogue_id)
                          ? {
                              value: String(formData.service_catalogue_id),
                              label: SERVICE_CATALOGUES.find((catalogue) => catalogue.id === formData.service_catalogue_id)?.name || "",
                            }
                          : null
                      }
                      onChange={(selectedOption) =>
                        setFormData((prev) => ({
                          ...prev,
                          service_catalogue_id: selectedOption ? parseInt(selectedOption.value) : 0,
                        }))
                      }
                      placeholder="Select Service "
                      styles={customSelectStyles}
                      required
                    />
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
                    <textarea
                      id="complaint"
                      name="complaint"
                      value={formData.complaint}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      placeholder="Describe the complaint in detail."
                    ></textarea>
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

export default AddWorkOrderFormITD;
