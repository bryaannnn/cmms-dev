import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Edit, Trash2, X, AlertTriangle, Building, Upload, Filter, ChevronDown, Clipboard, Info, Search, Calendar, Eye, UserIcon, Mail, Users } from "lucide-react";
import PageHeader from "../PageHeader";
import { Department, useAuth, User, Vendor } from "../../routes/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${className || "max-w-xl w-full"}`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 focus:outline-none transition-colors duration-150" aria-label="Close modal">
                <X className="text-xl" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
      className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
    >
      <div className="flex items-center justify-between z-10 relative">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{icon}</div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last month</p>
    </motion.div>
  );
};

const VendorPage: React.FC = () => {
  const location = useLocation();
  const [vendor, setVendor] = useState<Vendor[]>([]);
  const { getVendor, deleteVendor } = useAuth();
  const [filteredRecords, setFilteredRecords] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<Vendor | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Vendor | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<User | null>(null);
  const [showDepartmentDetails, setShowDepartmentDetails] = useState(false);
  const [showUsersDetails, setShowUsersDetails] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const navigate = useNavigate();

  // Di dalam komponen DepartmentPage, setelah mendapatkan data
  useEffect(() => {
    if (vendor.length > 0) {
      const sortedVendor = [...vendor].sort((a, b) => a.id - b.id);
      setVendor(sortedVendor);
    }
  }, [vendor]);

  const searchCategories = useMemo(
    () => [
      { id: "department", name: "Department" },
      { id: "head", name: "Head" },
    ],
    []
  ); // Empty dependency array means it's created once

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const dataVendors = await getVendor();
      setVendor(dataVendors);
    } catch (err) {
      setError("Failed to load vendors");
      console.error("Error loading vendors:", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [getVendor]);

  useEffect(() => {
    loadVendors();
  }, [loadVendors]);

  const toggleSidebar = () => {
    setSidebarOpen((prev: boolean): boolean => !prev);
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented.");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const filteredSearchSuggestions = React.useMemo(() => {
    if (!searchQuery) {
      return searchCategories;
    }
    const lowerCaseQuery = searchQuery.toLowerCase();
    return searchCategories.filter((category) => category.name.toLowerCase().includes(lowerCaseQuery));
  }, [searchQuery, searchCategories]);

  const handleSearchCategorySelect = (categoryName: string) => {
    setSearchQuery(`${categoryName}: `);
    setShowSearchSuggestions(false);
    searchInputRef.current?.focus();
  };

  const openHistoryDetails = (v: Vendor) => {
    setSelectedDepartment(v);
    setShowDepartmentDetails(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteVendor(id);
      setVendor(vendor.filter((vendor) => vendor.id !== id));
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
    } catch (error) {
      console.error("Failed to delete Vendor:", error);
      setError("Failed to delete vendor. Please try again.");
    }
  };

  const handleDeleteClick = useCallback((id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  return (
    <div key={location.pathname} className={"flex h-screen font-sans antialiased bg-blue-50"}>
      <Sidebar />

      <div className="flex-1 flex flex-col ooverflow-hidden">
        <PageHeader mainTitle="Vendor" mainTitleHighlight="Page" description="Manage Vendors to control access and functionality within the system." icon={<Building />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Vendors <span className="text-blue-600">Management</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Organize and manage vendors by specific company .</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {/* {hasPermission("create_machine_history") && ( */}
              <motion.button
                onClick={() => navigate("/vendors/addvendor")}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Add Vendor</span>
              </motion.button>
              {/* )} */}
              <motion.button
                onClick={handleImport}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Upload className="text-base" />
                <span>Import</span>
              </motion.button>
              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Filter className="text-base" />
                <span>Filters</span>
                <motion.span animate={{ rotate: showAdvancedFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown className="text-base" />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards dengan data lebih detail */}
          {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Department" value={vendor.length.toString()} change={`+${Math.floor((vendor.length / 10) * 100)}%`} icon={<Building className="w-6 h-6" />} />
            <StatCard
              title="Head Department"
              value={vendor.filter((d) => d.id !== null).length.toString()}
              change={`+${Math.floor((department.filter((d) => d.head_id !== null).length / department.length) * 100)}%`}
              icon={<UserIcon className="w-6 h-6" />}
            />
            <StatCard
              title="Departments with Email"
              value={department.filter((d) => d.head?.email).length.toString()}
              change={`+${Math.floor((department.filter((d) => d.head?.email).length / department.length) * 100)}%`}
              icon={<Mail className="w-6 h-6" />}
            />
            <StatCard title="Total Employees" value={users.length.toString()} change={`+${Math.floor((users.length / 50) * 100)}%`} icon={<Users className="w-6 h-6" />} />
          </div> */}

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="min-w-full divide-y divide-blue-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Vendor Name</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telp</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Handphone</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-blue-100">
                  {vendor.map((v) => (
                    <motion.tr key={v.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }} className="transition-colors duration-150">
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{v.id}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{v.name}</div>
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{v.address || "-"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{v.contact_person || "-"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{v.email || "-"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{v.telp || "-"}</div>
                      </td>
                      <td className="px-5 py-3">
                        <div className="text-sm text-gray-600 truncate max-w-xs">{v.HP || "-"}</div>
                      </td>

                      <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => navigate(`/vendors/editvendor/${v.id}`)}
                          className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                          title="Edit"
                        >
                          <Edit className="inline text-base" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => {
                            setRecordToDelete(v.id);
                            setShowDeleteConfirm(true);
                          }}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                          title="Delete"
                        >
                          <Trash2 className="inline text-base" />
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </main>
      </div>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-5 text-center py-3">
          <AlertTriangle className="text-red-500 text-5xl mx-auto animate-pulse" />
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this Vendor? This action cannot be undone.</p>
          <div className="flex justify-center space-x-3 mt-5">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowDeleteConfirm(false)}
              className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => recordToDelete && handleDelete(recordToDelete)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VendorPage;
