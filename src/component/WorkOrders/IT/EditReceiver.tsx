import React, { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { X, Clock, CheckCircle, ToolCase, ArrowLeft, Save, Trash2, Hourglass, ListPlus, Paperclip, Sun, Moon, Settings, Bell, User as UserIcon, ChevronDown, ChevronRight, ChevronLeft, LogOut, AlertTriangle } from "lucide-react";
import Select from "react-select";
import DOMPurify from "dompurify";
import { useAuth, User as AuthUser, Department, WorkOrderFormDataLocal, ServiceCatalogue, Vendor } from "../../../routes/AuthContext";
import TiptapEditor from "../../RichTextEditor";

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

interface HTMLContentProps {
  content: string;
  className?: string;
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

const EditReceiver: React.FC = () => {
  const { updateWorkOrderIT, user, getUsers, getServices, getDepartment, getServiceGroups, getWorkOrderById, getVendor } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [serviceList, setServiceList] = useState<ServiceCatalogue[]>([]);
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

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [filteredServices, setFilteredServices] = useState<ServiceCatalogue[]>([]);
  const [serviceGroupsList, setServiceGroupsList] = useState<ServiceGroup[]>([]);

  const [showAssignedToField, setShowAssignedToField] = useState(false);

  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [showVendorForm, setShowVendorForm] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorSelect, setShowVendorSelect] = useState(false);

  const HTMLContent: React.FC<HTMLContentProps> = ({ content, className = "" }) => {
    if (!content) {
      return (
        <div className={`p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 ${className}`}>
          <span>-</span>
        </div>
      );
    }

    // Konfigurasi DOMPurify untuk mengizinkan tag HTML yang aman
    const cleanHTML = DOMPurify.sanitize(content, {
      ALLOWED_TAGS: ["h1", "h2", "h3", "h4", "h5", "h6", "p", "br", "span", "div", "ol", "ul", "li", "strong", "b", "em", "i", "u", "s", "strike", "code", "mark", "sub", "sup", "blockquote", "table", "thead", "tbody", "tr", "th", "td"],
      ALLOWED_ATTR: ["style", "class", "align", "type", "start", "colspan", "rowspan"],
    });

    return <div className={`rich-text-content p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 ${className}`} dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
  };

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
    assigned_to_id: null, // Tambahkan field ini
    vendor_id: null,
  };

  const [formData, setFormData] = useState<WorkOrderFormDataLocal>(initialFormData);

  useEffect(() => {
    const shouldShowAssignedTo = formData.handling_status === "Escalated";
    const shouldShowVendorForm = formData.handling_status === "Vendor Handled";

    setShowAssignedToField(shouldShowAssignedTo);
    setShowVendorForm(shouldShowVendorForm);

    // Reset assigned_to_id jika status berubah dari Escalated
    if (!shouldShowAssignedTo && formData.assigned_to_id) {
      setFormData((prev) => ({
        ...prev,
        assigned_to_id: null,
      }));
    }

    // Reset vendor_id jika status berubah dari Vendor Handled
    if (!shouldShowVendorForm) {
      setFormData((prev) => ({
        ...prev,
        vendor_id: null,
      }));
      setSelectedVendor(null);
      setShowVendorSelect(false);
    }
  }, [formData.handling_status]);

  useEffect(() => {
    const fetchWorkOrderData = async () => {
      if (!id) return;

      try {
        setIsDataLoading(true);
        const workOrderData = await getWorkOrderById(parseInt(id));

        // Set form data
        setFormData({
          id: workOrderData.id,
          date: workOrderData.date.split("T")[0],
          reception_method: workOrderData.reception_method,
          requester_id: workOrderData.requester_id,
          known_by_id: workOrderData.known_by_id,
          department_id: workOrderData.department_id,
          service_type_id: String(workOrderData.service_group_id || ""),
          service_id: String(workOrderData.service_catalogue_id || ""),
          asset_no: workOrderData.asset_no,
          device_info: workOrderData.device_info,
          complaint: workOrderData.complaint,
          attachment: workOrderData.attachment,
          received_by_id: workOrderData.received_by_id,
          handling_date: workOrderData.handling_date ? workOrderData.handling_date.split("T")[0] : null,
          action_taken: workOrderData.action_taken,
          handling_status: workOrderData.handling_status,
          remarks: workOrderData.remarks,
          vendor_id: workOrderData.vendor_id || null, // Tambahkan vendor_id
        });

        // Jika ada vendor_id, set selected vendor
        if (workOrderData.vendor_id && vendors.length > 0) {
          const vendor = vendors.find((v) => v.id === workOrderData.vendor_id);
          if (vendor) {
            setSelectedVendor(vendor);
          }
        }
      } catch (err: any) {
        console.error("Failed to fetch work order data:", err);
        setError(err.message || "Gagal memuat data work order. Silakan coba lagi.");
      } finally {
        setIsDataLoading(false);
      }
    };

    if (vendors.length > 0) {
      fetchWorkOrderData();
    }
  }, [id, getWorkOrderById, vendors]); // Tambahkan vendors ke dependency

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch vendors terlebih dahulu
        const vendorsData = await getVendor();
        setVendors(vendorsData);

        // Kemudian fetch data lainnya
        const data = await getServiceGroups(0);
        const mapped = data.map((g) => ({
          id: Number(g.id),
          name: g.group_name ?? "",
          description: g.group_description ?? undefined,
        }));
        setServiceGroupsList(mapped);

        const departmentsResponse = await getDepartment();
        setDepartmentList(departmentsResponse);

        const fetchedUsers = await getUsers();
        setAllUsers(fetchedUsers);

        if (user && user.id) {
          const servicesData = await getServices(parseInt(user.id));
          setServiceList(servicesData);
        }
      } catch (err) {
        console.error("Failed to fetch master data:", err);
      }
    };

    if (user) {
      fetchData();
    }
  }, [user, getUsers, getServices, getDepartment, getServiceGroups, getVendor]);

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

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> | OptionType | null, name?: keyof WorkOrderFormDataLocal) => {
    let fieldName: keyof WorkOrderFormDataLocal;
    let value: string | number | null;

    if (e && "target" in e) {
      fieldName = e.target.name as keyof WorkOrderFormDataLocal;
      value = e.target.value;
    } else if (e && typeof e === "object" && "value" in e && name) {
      fieldName = name;
      // Konversi ke number untuk ID fields
      if (name === "assigned_to_id" || name === "requester_id" || name === "known_by_id") {
        value = e.value ? parseInt(e.value) : null;
      } else {
        value = e.value;
      }
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

  const handleVendorSelect = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    setFormData((prev) => ({
      ...prev,
      vendor_id: vendor.id,
    }));
    setShowVendorSelect(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validasi untuk status Escalated
    if (formData.handling_status === "Escalated" && !formData.assigned_to_id) {
      setError("Assigned To is required for Escalated status");
      setIsLoading(false);
      return;
    }

    // Validasi untuk status Vendor Handled
    if (formData.handling_status === "Vendor Handled" && !formData.vendor_id) {
      setError("Vendor selection is required for Vendor Handled status");
      setIsLoading(false);
      return;
    }

    // Validasi lainnya tetap sama...
    if (!formData.handling_status) {
      setError("Handling status is required");
      setIsLoading(false);
      return;
    }

    if (!formData.handling_date) {
      setError("Handling date is required");
      setIsLoading(false);
      return;
    }

    if (!formData.action_taken || formData.action_taken.length < 5) {
      setError("Action taken must be at least 5 characters");
      setIsLoading(false);
      return;
    }

    const dataToSend: WorkOrderFormDataLocal = {
      ...formData,
      id: formData.id,
      received_by_id: user?.id ? parseInt(user.id) : null,
      handling_date: formData.handling_date,
      action_taken: formData.action_taken,
      handling_status: formData.handling_status,
      remarks: formData.remarks,
      assigned_to_id: formData.assigned_to_id ? parseInt(formData.assigned_to_id as unknown as string) : null,
      vendor_id: formData.vendor_id, // Tambahkan vendor_id
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

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/workorders/it/receiver");
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

  const getRequesterName = () => {
    const requester = allUsers.find((u) => parseInt(u.id) === formData.requester_id);
    return requester?.name || "Unknown";
  };

  const getRequesterDepartment = () => {
    const department = departmentList.find((dept) => dept.id === formData.department_id);
    return department?.name || "No department assigned";
  };

  const getRequesterDepartmentHead = () => {
    const department = departmentList.find((dept) => dept.id === formData.department_id);
    if (department && department.head_id) {
      const headUser = allUsers.find((user) => parseInt(user.id) === department.head_id);
      return headUser?.name || "No department head assigned";
    }
    return "No department head assigned";
  };

  const getServiceTypeName = () => {
    const serviceType = serviceGroupsList.find((g) => String(g.id) === formData.service_type_id);
    return serviceType?.name || "Unknown";
  };

  const getServiceName = () => {
    const service = serviceList.find((s) => String(s.id) === formData.service_id);
    return service?.service_name || "Unknown";
  };

  const getAttachmentFilename = () => {
    if (!formData.attachment) return null;

    try {
      const url = new URL(formData.attachment);
      const pathname = url.pathname;
      return pathname.substring(pathname.lastIndexOf("/") + 1);
    } catch (e) {
      return formData.attachment;
    }
  };

  const handleViewAttachment = () => {
    if (formData.attachment) {
      window.open(formData.attachment, "_blank");
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
            <motion.button onClick={() => navigate("/workorders/it/receiver")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ChevronLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back to Receiver</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Update Work Order</h2>
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
                      <div className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50">
                        <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">
                          <CheckCircle className="text-blue-500" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-800">Work Order Updated</p>
                          <p className="text-xs text-gray-600 mt-1">You have successfully updated a work order</p>
                          <p className="text-xs text-gray-500 mt-1">Just now</p>
                        </div>
                      </div>
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Update Work Order</h1>
              <p className="text-gray-600 mt-1">Perbarui status dan penanganan work order</p>
            </div>
            <motion.button
              onClick={() => navigate("/workorders/it/receiver")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ChevronLeft className="text-lg" /> Back to Receiver
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{formData.date}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Reception Method</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{formData.reception_method}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Requester</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{getRequesterName()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{getRequesterDepartment()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Known By (Head)</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service Type</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{getServiceTypeName()}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Service</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{getServiceName()}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">No. Asset</label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{formData.asset_no}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ListPlus className="mr-2 text-purple-500" /> Device & Complaint Details
                </h2>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Device Information</label>
                    <div className="p-2.5 border border-gray-300 rounded-lg bg-gray-50 text-gray-700">
                      <span>{formData.device_info}</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Complaint</label>
                    <HTMLContent content={formData.complaint} className="min-h-[100px]" />
                  </div>
                </div>
              </div>
              {formData.attachment && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Paperclip className="mr-2 text-gray-500" /> Attachment
                  </h2>
                  <div className="flex items-center justify-between p-2.5 border border-gray-300 rounded-lg bg-gray-50">
                    <span className="text-gray-700">{getAttachmentFilename()}</span>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleViewAttachment} className="ml-4 px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors">
                      View
                    </motion.button>
                  </div>
                </div>
              )}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-blue-500" /> Handling Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="received_by_id" className="block text-sm font-medium text-gray-700 mb-1">
                      Received By
                    </label>
                    <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-blue-50 text-gray-700">
                      <span>{user?.name || "Current User"}</span>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="handling_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Handling Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="handling_date"
                      name="handling_date"
                      value={formData.handling_date || ""}
                      onChange={handleChange}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="handling_status" className="block text-sm font-medium text-gray-700 mb-1">
                      Ticket Status <span className="text-red-500">*</span>
                    </label>
                    <Select
                      id="handling_status"
                      name="handling_status"
                      options={[
                        { value: "New", label: "New" },
                        { value: "In Progress", label: "In Progress" },
                        { value: "Escalated", label: "Escalated" },
                        { value: "Vendor Handled", label: "Vendor Handled" },
                        { value: "Resolved", label: "Resolved" },
                      ]}
                      value={formData.handling_status ? { value: formData.handling_status, label: formData.handling_status } : null}
                      onChange={(selectedOption) => handleChange(selectedOption, "handling_status")}
                      placeholder="Select Handling Status"
                      styles={customSelectStyles}
                      required
                    />
                  </div>

                  {showAssignedToField && (
                    <div>
                      <label htmlFor="assigned_to_id" className="block text-sm font-medium text-gray-700 mb-1">
                        Assigned To <span className="text-red-500">*</span>
                      </label>
                      <Select
                        id="assigned_to_id"
                        name="assigned_to_id"
                        options={allUsers.map((u) => ({
                          value: String(u.id),
                          label: u.name,
                        }))}
                        value={
                          formData.assigned_to_id
                            ? {
                                value: String(formData.assigned_to_id),
                                label: allUsers.find((u) => parseInt(u.id) === formData.assigned_to_id)?.name || "Unknown",
                              }
                            : null
                        }
                        onChange={(selectedOption) => handleChange(selectedOption, "assigned_to_id")}
                        placeholder="Select Assignee"
                        styles={customSelectStyles}
                        required={showAssignedToField}
                      />
                    </div>
                  )}

                  {showVendorForm && (
                    <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <ToolCase className="mr-2 text-gray-600" /> Vendor Information
                      </h3>

                      {!selectedVendor ? (
                        // Pilihan vendor dari daftar existing
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Select Vendor <span className="text-red-500">*</span>
                            </label>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => setShowVendorSelect(!showVendorSelect)}
                              className="px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                            >
                              {showVendorSelect ? "Hide Vendors" : "Select Vendor"}
                            </motion.button>
                          </div>

                          {showVendorSelect && (
                            <div className="border border-gray-200 rounded-lg bg-white max-h-60 overflow-y-auto">
                              {vendors.length > 0 ? (
                                vendors.map((vendor) => (
                                  <motion.div key={vendor.id} whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.05)" }} className="p-3 border-b border-gray-100 cursor-pointer transition-colors" onClick={() => handleVendorSelect(vendor)}>
                                    <div className="font-medium text-gray-900">{vendor.name}</div>
                                    <div className="text-sm text-gray-600">
                                      {vendor.contact_person} • {vendor.email}
                                    </div>
                                    <div className="text-xs text-gray-500">{vendor.address}</div>
                                  </motion.div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-600">
                                  <AlertTriangle className="mx-auto h-6 w-6 mb-2" />
                                  No vendors available
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ) : (
                        // Tampilkan vendor yang dipilih
                        <div className="space-y-4">
                          <div className="flex justify-between items-center">
                            <h4 className="font-semibold text-gray-800">Selected Vendor</h4>
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => {
                                setSelectedVendor(null);
                                setFormData((prev) => ({ ...prev, vendor_id: null }));
                                setShowVendorSelect(false);
                              }}
                              className="px-2 py-1 bg-red-100 text-red-700 text-sm rounded-md hover:bg-red-200 transition-colors"
                            >
                              Change Vendor
                            </motion.button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Vendor Name</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.name}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Contact Person</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.contact_person}</div>
                            </div>

                            <div className="md:col-span-2">
                              <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.address || "-"}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.email}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.telp || "-"}</div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile</label>
                              <div className="p-2.5 border border-gray-300 rounded-lg bg-white text-gray-900">{selectedVendor.HP || "-"}</div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="md:col-span-2">
                    <label htmlFor="action_taken" className="block text-sm font-medium text-gray-700 mb-1">
                      Action Taken <span className="text-red-500">*</span>
                    </label>
                    <TiptapEditor
                      value={formData.action_taken || ""}
                      onChange={(value) => {
                        // Update langsung ke formData
                        setFormData((prev) => ({
                          ...prev,
                          action_taken: value,
                        }));
                      }}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks <span className="text-red-500">*</span>
                    </label>
                    <TiptapEditor
                      value={formData.remarks || ""}
                      onChange={(value) => {
                        // Update langsung ke formData
                        setFormData((prev) => ({
                          ...prev,
                          remarks: value,
                        }));
                      }}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={() => navigate("/workorders/it/receiver")}
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

export default EditReceiver;
