import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useAuth, PermissionName, AssetData, ERPRecord } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../routes/AuthContext";
import Sidebar from "../component/Sidebar";

import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Users,
  BarChart2,
  Database,
  Clipboard,
  Filter,
  Package,
  ChevronLeft,
  Home,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
  Sun,
  Moon,
  Settings,
  Bell,
  Eye,
  Key,
  User as UserIcon,
  Save, // Icon for Save button
} from "lucide-react";

// NavItem component (unchanged)
interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;
  return (
    <motion.button
      onClick={() => navigate(to)}
      whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left flex items-center py-3 px-4 rounded-xl transition-all duration-200 ease-in-out group
        ${active ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-blue-700"}
      `}
    >
      <span className={`text-xl transition-colors duration-200 ${active ? "text-white" : "text-blue-500 group-hover:text-blue-700"}`}>{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="ml-4 text-base font-medium whitespace-nowrap">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const EditAssetPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>(); // Get asset ID from URL parameters (string type)
  const { user, hasPermission, getERPData, editAsset } = useAuth(); // Assuming editAsset function exists in AuthContext

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState<AssetData>({
    id: 0, // Initialize id in formData as number to match ERP data
    name: "",
    category: "",
    location: "",
    purchase_date: "",
    description: "",
    type: null,
    make: null,
    model: null,
    status: null,
    last_maintenance: null,
    next_maintenance: null,
    work_orders: null,
    health: null,
    created_at: "",
    update_at: "",
  });
  const [loading, setLoading] = useState(true); // Start as loading to fetch data
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch asset data when component mounts or ID changes
  useEffect(() => {
    const fetchAsset = async () => {
      setLoading(true);
      setError(null);

      if (!id) {
        setError("Asset ID not provided.");
        setLoading(false);
        return;
      }

      try {
        const assetIdNum = Number(id); // Use Number instead of parseInt for stricter conversion
        if (isNaN(assetIdNum)) {
          setError("Invalid asset ID format.");
          setLoading(false);
          return;
        }

        const allAssets = await getERPData();
        console.log("Fetched assets:", allAssets); // Debug log

        const assetToEdit = allAssets.find(
          (asset) => asset.id === assetIdNum || String(asset.id) === String(id) // Check both number and string representations
        );

        if (!assetToEdit) {
          setError(`Asset with ID ${id} not found. Available IDs: ${allAssets.map((a) => a.id).join(", ")}`);
          setLoading(false);
          return;
        }

        // Convert ERP data to form data format
        setFormData({
          id: assetToEdit.id,
          name: assetToEdit.name || "",
          category: assetToEdit.category || "",
          location: assetToEdit.location || "",
          purchase_date: assetToEdit.purchaseDate || "",
          description: assetToEdit.description || "",
          type: assetToEdit.type || null,
          make: assetToEdit.make || null,
          model: assetToEdit.model || null,
          status: assetToEdit.status || null,
          last_maintenance: assetToEdit.lastMaintenance || null,
          next_maintenance: assetToEdit.nextMaintenance || null,
          work_orders: assetToEdit.workOrders || null,
          health: assetToEdit.health || null,
          created_at: assetToEdit.createdAt || "",
          update_at: assetToEdit.updateAt || "",
        });
      } catch (err) {
        console.error("Error fetching asset:", err);
        setError("Failed to load asset data. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchAsset();
  }, [id, getERPData]);

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
    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen, darkMode]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Handle ID field specifically if it's meant to be a number input,
    // though it's currently readOnly.
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateAsset = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    if (!id) {
      setError("Asset ID is missing for update.");
      setLoading(false);
      return;
    }

    try {
      // Call the editAsset function from AuthContext with formData directly
      // Assuming editAsset expects an AssetData object that already contains the ID
      const response = await editAsset(formData);
      console.log("Asset updated successfully:", response);
      setSuccessMessage("Asset successfully updated!");
      navigate("/assets"); // Navigate back to asset list after successful update
    } catch (err: any) {
      console.error("Error updating asset:", err);
      setError(err.message || "Failed to update asset. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const insights = [
    {
      id: 1,
      title: "Efisiensi Pemeliharaan Meningkat",
      description: "Tingkat penyelesaian pemeliharaan preventif meningkat 15% bulan ini",
      icon: <CheckCircle className="text-green-500" />,
      date: "Hari Ini, 09:30 AM",
    },
    {
      id: 2,
      title: "3 Aset Membutuhkan Perhatian",
      description: "Aset kritis menunjukkan tanda-tanda keausan perlu diperiksa",
      icon: <AlertTriangle className="text-yellow-500" />,
      date: "Kemarin, 02:15 PM",
    },
    {
      id: 3,
      title: "Pemeliharaan Bulanan Selesai",
      description: "Semua tugas pemeliharaan terjadwal selesai tepat waktu",
      icon: <CheckCircle className="text-blue-500" />,
      date: "28 Jul 2023",
    },
  ];

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
            <motion.button onClick={() => navigate("/assets")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ChevronLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Kembali ke Aset</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Aset</h2>
          </div>
          <div className="flex items-center space-x-3 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Beralih ke mode terang" : "Beralih ke mode gelap"}
            >
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>
            <div className="relative" ref={notificationsRef}>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
                className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
                aria-label="Notifikasi"
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
                      <h4 className="font-semibold text-gray-800">Notifikasi</h4>
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
                      {insights.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">Tidak ada notifikasi baru.</p>}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          console.log("Lihat Semua Notifikasi diklik");
                          setShowNotificationsPopup(false);
                        }}
                        className="text-blue-600 hover:underline text-sm font-medium"
                      >
                        Lihat Semua
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
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Logged in as</div>
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Asset</h1>
              <p className="text-gray-600 mt-1">Update your asset details.</p>
            </div>
            <motion.button
              onClick={() => navigate("/assets")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ChevronLeft className="text-lg" />
              <span className="font-semibold">Back to Assets</span>
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
            {loading ? (
              <div className="flex items-center justify-center py-10 text-gray-600 text-lg">
                <svg className="animate-spin h-5 w-5 mr-3 text-blue-600" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Loading asset data...
              </div>
            ) : error ? (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            ) : (
              <form onSubmit={handleUpdateAsset} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="id" className="block text-sm font-medium text-gray-700">
                      Asset ID
                    </label>
                    <input
                      type="text" // Keep as text for display, but value is number
                      id="id"
                      name="id"
                      value={formData.id} // Display the number ID
                      readOnly
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                      Asset Name
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                      Asset Category
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                      Location
                    </label>
                    <input
                      type="text"
                      id="location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="purchase_date" className="block text-sm font-medium text-gray-700">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      id="purchase_date"
                      name="purchase_date"
                      value={formData.purchase_date}
                      onChange={handleChange}
                      required
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      id="description"
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={3}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                      Type
                    </label>
                    <select
                      id="type"
                      name="type"
                      value={formData.type || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Type</option>
                      <option value="mechanical">Mechanical</option>
                      <option value="electrical">Electrical</option>
                      <option value="vehicle">Vehicle</option>
                      <option value="building">Building</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="make" className="block text-sm font-medium text-gray-700">
                      Make
                    </label>
                    <input
                      type="text"
                      id="make"
                      name="make"
                      value={formData.make || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="model" className="block text-sm font-medium text-gray-700">
                      Model
                    </label>
                    <input
                      type="text"
                      id="model"
                      name="model"
                      value={formData.model || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <select
                      id="status"
                      name="status"
                      value={formData.status || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    >
                      <option value="">Select Status</option>
                      <option value="running">Running</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="breakdown">Breakdown</option>
                      <option value="idle">Idle</option>
                    </select>
                  </div>
                  <div>
                    <label htmlFor="last_maintenance" className="block text-sm font-medium text-gray-700">
                      Last Maintenance Date
                    </label>
                    <input
                      type="date"
                      id="last_maintenance"
                      name="last_maintenance"
                      value={formData.last_maintenance || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="next_maintenance" className="block text-sm font-medium text-gray-700">
                      Next Maintenance Date
                    </label>
                    <input
                      type="date"
                      id="next_maintenance"
                      name="next_maintenance"
                      value={formData.next_maintenance || ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="work_orders" className="block text-sm font-medium text-gray-700">
                      Work Orders
                    </label>
                    <input
                      type="text"
                      id="work_orders"
                      name="work_orders"
                      value={formData.work_orders ?? ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                  <div>
                    <label htmlFor="health" className="block text-sm font-medium text-gray-700">
                      Health (%)
                    </label>
                    <input
                      type="text"
                      id="health"
                      name="health"
                      value={formData.health ?? ""}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    />
                  </div>
                </div>

                {successMessage && (
                  <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative" role="alert">
                    <strong className="font-bold">Success!</strong>
                    <span className="block sm:inline"> {successMessage}</span>
                  </div>
                )}

                <div className="flex justify-end space-x-3 mt-6">
                  <motion.button
                    type="button"
                    onClick={() => navigate("/assets")}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    disabled={loading}
                    className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-5 w-5" />
                        Save Changes
                      </>
                    )}
                  </motion.button>
                </div>
              </form>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default EditAssetPage;
