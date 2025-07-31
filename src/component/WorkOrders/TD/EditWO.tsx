import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, WorkOrderFormData, User } from "../../../routes/AuthContext"; // Import User
import Sidebar from "../../Sidebar"; // Assuming Sidebar is in ../component/Sidebar
import { motion, AnimatePresence } from "framer-motion";
import {
  ToolCase, // Changed from ToolCaseIcon to ToolCase for consistency with other icons
  X, // Changed from XIcon to X
  Info, // Changed from InfoIcon to Info
  ChevronDown, // Changed from ChevronDownIcon to ChevronDown
  User as UserIcon, // Renamed from User2Icon to UserIcon for consistency
  Save, // Changed from SaveIcon to Save
  Paperclip, // Changed from PaperclipIcon to Paperclip
  ArrowLeft, // Changed from ArrowLeftIcon to ArrowLeft
  Clipboard,
  Sun,
  Moon,
  Settings,
  Bell,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  LogOut,
} from "lucide-react";

// Modal component (reused from WorkOrders.tsx for consistency)
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

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

const EditWorkOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from URL params
  const { getWorkOrderById, updateWorkOrder, user, getUsers } = useAuth(); // Use actual auth context
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true); // Set to true initially for data fetch
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]); // State to store users for assignment

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<WorkOrderFormData>({
    id: 0, // Placeholder, will be overwritten by fetched data
    title: "",
    description: "",
    type: "preventive",
    status: "open", // Default status, will be overwritten
    priority: "low",
    assignedTo: "",
    assignedToAvatar: "",
    createdBy: "",
    createdAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    assetId: "",
    assetName: "",
    assetType: "",
    estimatedHours: null,
    attachments: [],
  });

  // Fetch work order data and users on component mount
  useEffect(() => {
    const fetchData = async () => {
      if (!id) {
        setError("Work Order ID not provided.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const [workOrderData, fetchedUsers] = await Promise.all([getWorkOrderById(id), getUsers()]);

        if (workOrderData) {
          // Ensure attachments are File objects if they were serialized
          const attachments = workOrderData.attachments || [];
          setFormData({
            ...workOrderData,
            id: Number(id), // Ensure ID is a number
            // Ensure dueDate is in YYYY-MM-DD format for input type="date"
            dueDate: workOrderData.dueDate.split("T")[0],
            attachments: attachments,
          });
        } else {
          setError(`Work Order with ID "${id}" not found.`);
        }
        setUsers(fetchedUsers);
        // } catch (err: any) {
        //   setError("Failed to fetch data. Please try again.");
        //   console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, getWorkOrderById, getUsers]);

  // Handle window resize for mobile view
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

  // Handle clicks outside notification/profile popups
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

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const workOrderTypes = [
    { id: "preventive", name: "Preventive Maintenance" },
    { id: "corrective", name: "Corrective Maintenance" },
    { id: "inspection", name: "Inspection" },
    { id: "emergency", name: "Emergency Repair" },
  ];

  const statuses = [
    { id: "open", name: "Open" },
    { id: "in_progress", name: "In Progress" },
    { id: "completed", name: "Completed" },
    { id: "on_hold", name: "On Hold" },
    { id: "canceled", name: "Canceled" },
  ];

  const priorities = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
    { id: "critical", name: "Critical" },
  ];

  const assetTypes = [
    { id: "machine", name: "Machine" },
    { id: "vehicle", name: "Vehicle" },
    { id: "facility", name: "Facility" },
    { id: "tool", name: "Tool" },
  ];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, attachments: filesArray }));
    } else {
      setFormData((prev) => ({ ...prev, attachments: [] }));
    }
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((file) => file.name !== fileName),
    }));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.title || !formData.type || !formData.priority || !formData.assignedTo || !formData.dueDate) {
        throw new Error("Please fill in all required fields.");
      }

      const selectedAssignedToUser = users.find((u) => u.id === formData.assignedTo);

      const dataToSend: WorkOrderFormData = {
        ...formData,
        estimatedHours: formData.estimatedHours ?? 0,
        assignedToAvatar: selectedAssignedToUser?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAssignedToUser.email}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50` : "",
        id: Number(id), // Ensure ID is included for update and is a number
      };

      await updateWorkOrder(Number(id), dataToSend); // Call updateWorkOrder with id and data
      setSuccess("Work order record successfully updated!");
      // Optionally navigate back to work orders list or details page
      navigate("/workorders");
    } catch (err: any) {
      setError(err.message || "Failed to update work order record. Please try again.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/workorders");
  };

  // Show loading indicator or error message if initial data is not loaded
  if (loading && !formData.title) {
    // Only show full loading screen on initial data fetch
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading work order data...</p>
      </div>
    );
  }

  if (error && !formData.title) {
    // Only show full error screen on initial data fetch failure
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <AlertTriangle className="text-red-600 text-5xl" />
        <p className="ml-4 text-lg text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header section */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Edit Work Order</h2>
          </div>

          <div className="flex items-center space-x-3 relative">
            {/* Dark mode toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>

            {/* Notifications dropdown */}
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
                className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
                aria-label="Notifications"
              >
                <Bell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
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
                      <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>
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

            {/* User profile dropdown */}
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

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Work Order</h1>
              <p className="text-gray-600 mt-1">Update details of the existing work order</p>
            </div>
            <button onClick={handleBack} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center" aria-label="Back to Work Orders">
              <ArrowLeft className="mr-2" /> Back to Work Orders
            </button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
            {loading && (
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
                <strong className="font-bold">Processing!</strong>
                <span className="block sm:inline"> Updating work order data...</span>
              </div>
            )}
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            {success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline"> {success}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Work Order Details */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Info className="mr-2 text-blue-500" /> Work Order Details
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      id="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                      placeholder="e.g., Perbaikan Sistem HVAC"
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      name="description"
                      id="description"
                      value={formData.description || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                      placeholder="Provide a detailed description of the work needed..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                      Work Order Type <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                        {workOrderTypes.map((type) => (
                          <option key={type.id} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="priority"
                        id="priority"
                        value={formData.priority}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                        required
                      >
                        {priorities.map((priority) => (
                          <option key={priority.id} value={priority.id}>
                            {priority.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                      Status<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="status"
                        id="status"
                        value={formData.status}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                        required
                      >
                        {statuses.map((status) => (
                          <option key={status.id} value={status.id}>
                            {status.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Asset Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <ToolCase className="mr-2 text-green-500" /> Asset Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                      Asset ID
                    </label>
                    <input
                      type="text"
                      name="assetId"
                      id="assetId"
                      value={formData.assetId}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                      placeholder="e.g., AST-001"
                    />
                  </div>
                  <div>
                    <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      name="assetName"
                      id="assetName"
                      value={formData.assetName}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                      placeholder="e.g., Compressor #3"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Type
                  </label>
                  <div className="relative">
                    <select
                      name="assetType"
                      id="assetType"
                      value={formData.assetType}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                    >
                      <option value="">Select Asset Type</option>
                      {assetTypes.map((assetType) => (
                        <option key={assetType.id} value={assetType.id}>
                          {assetType.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <UserIcon className="mr-2 text-purple-500" /> Assignment & Estimation
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                      Assigned To<span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        name="assignedTo"
                        id="assignedTo"
                        value={formData.assignedTo}
                        onChange={handleChange}
                        className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                        required
                      >
                        <option value="">Select User</option>
                        {users.map((person) => (
                          <option key={person.id} value={person.id}>
                            {person.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-3.5 text-gray-400" />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                      Estimated Hours
                    </label>
                    <input
                      type="number"
                      name="estimatedHours"
                      id="estimatedHours"
                      value={formData.estimatedHours ?? ""}
                      onChange={handleNumericChange}
                      min="0"
                      step="0.5"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                      placeholder="e.g., 8"
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Due Date<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="dueDate"
                    id="dueDate"
                    value={formData.dueDate}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    required
                  />
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Paperclip className="mr-2 text-orange-500" /> Attachments
                </h2>
                <div>
                  <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                    Upload Files (Images, PDFs, Spreadsheets)
                  </label>
                  <input
                    type="file"
                    name="attachments"
                    id="attachments"
                    multiple
                    accept="image/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv" // MIME types for images, PDF, XLSX, CSV
                    onChange={handleFileChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                  />
                  {formData.attachments.length > 0 && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Selected files:</p>
                      <ul className="list-disc list-inside ml-4">
                        {formData.attachments.map((file, index) => (
                          <li key={index}>
                            {file.name} ({Math.round(file.size / 1024)} KB)
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={handleBack} // Back button
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <ArrowLeft className="inline mr-2" /> Back
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="animate-spin inline-block mr-2">⚙️</span> Updating...
                    </>
                  ) : (
                    <>
                      <Save className="inline mr-2" /> Update Work Order
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EditWorkOrder;
