import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Building, Plus, Edit, Trash2, X, AlertTriangle, Eye, Upload, Filter, Calendar, ChevronDown, Search, Users, Mail, Phone, MapPin, UserIcon, ChevronRight, Bell, Moon, Sun, Settings, LogOut, Clipboard, Info, Box } from "lucide-react";
import PageHeader from "../PageHeader";
import { useAuth, User, Vendor } from "../../routes/AuthContext";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

// Moved useDebounce definition here to resolve "Cannot find module" error
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4">
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

interface VendorDetailsProps {
  vendor: Vendor;
  onClose: () => void;
}

const VendorDetails: React.FC<VendorDetailsProps> = ({ vendor, onClose }) => {
  const displayValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object" && value !== null) {
      return value.name || value.title || value.id || "-";
    }
    if (typeof value === "string") {
      return value.trim() !== "" ? value.trim() : "-";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return String(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Komponen untuk status badge (jika ada status di vendor)
  const StatusBadge: React.FC<{ status?: string }> = ({ status }) => {
    if (!status) return null;

    const statusColors = {
      Active: "bg-green-100 text-green-800 border-green-300",
      Inactive: "bg-gray-100 text-gray-800 border-gray-300",
      Pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
    };

    return <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${statusColors[status as keyof typeof statusColors] || statusColors.Active}`}>{status}</span>;
  };

  // Komponen Section dengan header yang lebih jelas
  const Section: React.FC<{ title: string; children: React.ReactNode; icon?: React.ReactNode }> = ({ title, children, icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center">
          {icon && <div className="mr-3 text-blue-600">{icon}</div>}
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );

  // Komponen Detail Item yang lebih modern
  const DetailItem: React.FC<{
    label: string;
    value: string;
    icon?: React.ReactNode;
    fullWidth?: boolean;
    priority?: "high" | "medium" | "low";
  }> = ({ label, value, icon, fullWidth = false, priority = "medium" }) => {
    const priorityStyles = {
      high: "border-l-4 border-l-blue-500 bg-blue-25",
      medium: "border-l-2 border-l-gray-200",
      low: "border-l border-l-gray-100",
    };

    return (
      <div className={`${fullWidth ? "col-span-full" : ""}`}>
        <div className={`p-4 rounded-lg ${priorityStyles[priority]} transition-all duration-200 hover:shadow-sm`}>
          <div className="flex items-start space-x-3">
            {icon && <div className="text-gray-400 mt-0.5 flex-shrink-0">{icon}</div>}
            <div className="flex-1 min-w-0">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</label>
              <p className="text-sm font-medium text-gray-900 leading-relaxed">{value}</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar pr-2">
      {/* Header dengan informasi utama */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h2 className="text-2xl font-bold text-gray-900">{vendor.name}</h2>
            </div>
            <p className="text-gray-600 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Vendor ID: {vendor.id} • Created: {formatDate(vendor.created_at)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <X className="w-4 h-4 mr-2" />
              Close
            </motion.button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <Section title="Basic Information" icon={<UserIcon className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Vendor ID" value={displayValue(vendor.id)} icon={<Clipboard className="w-4 h-4" />} priority="high" />
          <DetailItem label="Vendor Name" value={displayValue(vendor.name)} icon={<Building className="w-4 h-4" />} priority="high" />
          <DetailItem label="Contact Person" value={displayValue(vendor.contact_person)} icon={<UserIcon className="w-4 h-4" />} priority="high" />
        </div>
      </Section>

      {/* Contact Information */}
      <Section title="Contact Information" icon={<Phone className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <DetailItem label="Email" value={displayValue(vendor.email)} icon={<Mail className="w-4 h-4" />} priority="high" />
          <DetailItem label="Telephone" value={displayValue(vendor.telp)} icon={<Phone className="w-4 h-4" />} />
          <DetailItem label="Mobile Phone" value={displayValue(vendor.HP)} icon={<Phone className="w-4 h-4" />} />
        </div>
      </Section>

      {/* Address Information */}
      <Section title="Address Information" icon={<MapPin className="w-5 h-5" />}>
        <div className="grid grid-cols-1 gap-4">
          <DetailItem label="Full Address" value={displayValue(vendor.address)} icon={<MapPin className="w-4 h-4" />} fullWidth />
        </div>
      </Section>

      {/* Additional Information */}
      <Section title="Additional Information" icon={<Info className="w-5 h-5" />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <DetailItem label="Created At" value={formatDate(vendor.created_at)} icon={<Calendar className="w-4 h-4" />} />
          <DetailItem label="Updated At" value={formatDate(vendor.updated_at)} icon={<Calendar className="w-4 h-4" />} />
        </div>
      </Section>
    </div>
  );
};

const VendorPage: React.FC = () => {
  const location = useLocation();
  const [vendor, setVendor] = useState<Vendor[]>([]);
  const { getVendor, deleteVendor, user, hasPermission } = useAuth();
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
  const [endDate, setEndDate] = useState<Date | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [showSearchSuggestions, setShowSearchSuggestions] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [recordsPerPage] = useState(10);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>({ key: "name", direction: "ascending" });

  // Apply useDebounce to searchQuery
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const searchCategories = useMemo(
    () => [
      { id: "name", name: "Vendor Name" },
      { id: "contact", name: "Contact Person" },
      { id: "email", name: "Email" },
      { id: "id", name: "Vendor ID" },
    ],
    []
  );

  const loadVendors = useCallback(async () => {
    try {
      setLoading(true);
      const dataVendors = await getVendor();
      const sortedVendors = [...dataVendors].sort((a, b) => a.id - b.id);
      setVendor(sortedVendors);
      setFilteredRecords(sortedVendors);
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

  useEffect(() => {
    let currentFilteredRecords = [...vendor];

    // Apply search filter using the debounced query
    if (debouncedSearchQuery.trim()) {
      const lowerCaseQuery = debouncedSearchQuery.toLowerCase().trim();
      currentFilteredRecords = currentFilteredRecords.filter((vendor) => {
        const searchParts = lowerCaseQuery.split(":");
        let category = "all";
        let actualQuery = lowerCaseQuery;

        if (searchParts.length > 1 && searchCategories.some((cat) => cat.name.toLowerCase() === searchParts[0].trim())) {
          category = searchParts[0].trim();
          actualQuery = searchParts.slice(1).join(":").trim();
        }

        const matchesName = vendor.name?.toLowerCase().includes(actualQuery);
        const matchesContact = vendor.contact_person?.toLowerCase().includes(actualQuery);
        const matchesEmail = vendor.email?.toLowerCase().includes(actualQuery);
        const matchesId = vendor.id.toString().includes(actualQuery);

        if (category === "vendor name") return matchesName;
        if (category === "contact person") return matchesContact;
        if (category === "email") return matchesEmail;
        if (category === "vendor id") return matchesId;

        return matchesName || matchesContact || matchesEmail || matchesId;
      });
    }

    // Apply date range filter
    if (startDate) {
      const startOfDay = new Date(startDate);
      startOfDay.setHours(0, 0, 0, 0);
      currentFilteredRecords = currentFilteredRecords.filter((vendor) => {
        if (!vendor.created_at) return true;
        const vendorDate = new Date(vendor.created_at);
        vendorDate.setHours(0, 0, 0, 0);
        return vendorDate >= startOfDay;
      });
    }

    if (endDate) {
      const endOfDay = new Date(endDate);
      endOfDay.setHours(23, 59, 59, 999);
      currentFilteredRecords = currentFilteredRecords.filter((vendor) => {
        if (!vendor.created_at) return true;
        const vendorDate = new Date(vendor.created_at);
        vendorDate.setHours(0, 0, 0, 0);
        return vendorDate <= endOfDay;
      });
    }

    // Apply sorting
    if (sortConfig !== null) {
      currentFilteredRecords.sort((a, b) => {
        const aValue = getDisplayValue((a as Record<string, any>)[sortConfig.key]);
        const bValue = getDisplayValue((b as Record<string, any>)[sortConfig.key]);

        if (aValue < bValue) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }

    setFilteredRecords(currentFilteredRecords);
  }, [vendor, debouncedSearchQuery, startDate, endDate, sortConfig, searchCategories]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
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

  const openVendorDetails = (v: Vendor) => {
    setSelectedVendor(v);
    setShowVendorDetails(true);
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

  const requestSort = (key: string) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const getDisplayValue = (value: any): string => {
    if (typeof value === "object" && value !== null) {
      return value.name || value.toString();
    }
    return value?.toString() || "";
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredRecords.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
      if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node) && !(event.target as HTMLElement).closest(".search-suggestions")) {
        setShowSearchSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const notifications: any[] = [
    {
      id: 1,
      title: "New Vendor Added",
      description: "A new vendor has been registered in the system.",
      date: "Today, 10:00 AM",
    },
  ];

  return (
    <div className={"flex h-screen font-sans antialiased bg-blue-50"}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Vendor" mainTitleHighlight="Groups" description="Manage service groups used across the service management system." icon={<Box />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Vendors <span className="text-blue-600">Management</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Organize and manage vendors by specific company.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              {hasPermission("view_vendors") && (
                <motion.button
                  onClick={() => navigate("/vendors/addvendor")}
                  whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
                >
                  <Plus className="text-base" />
                  <span>Add Vendor</span>
                </motion.button>
              )}
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

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Vendors" value={vendor.length.toString()} change={`+${Math.floor((vendor.length / 10) * 100)}%`} icon={<Building className="w-6 h-6" />} />
            <StatCard title="Vendors with Email" value={vendor.filter((v) => v.email).length.toString()} change={`+${Math.floor((vendor.filter((v) => v.email).length / vendor.length) * 100)}%`} icon={<Mail className="w-6 h-6" />} />
            <StatCard
              title="Vendors with Contact"
              value={vendor.filter((v) => v.contact_person).length.toString()}
              change={`+${Math.floor((vendor.filter((v) => v.contact_person).length / vendor.length) * 100)}%`}
              icon={<Users className="w-6 h-6" />}
            />
            <StatCard
              title="Vendors with Phone"
              value={vendor.filter((v) => v.telp || v.HP).length.toString()}
              change={`+${Math.floor((vendor.filter((v) => v.telp || v.HP).length / vendor.length) * 100)}%`}
              icon={<Phone className="w-6 h-6" />}
            />
          </div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by vendor name, contact, email, or ID..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  onFocus={() => setShowSearchSuggestions(true)}
                  aria-label="Search vendors"
                />
                <AnimatePresence>
                  {showSearchSuggestions && filteredSearchSuggestions.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      transition={{ duration: 0.15 }}
                      className="search-suggestions absolute left-0 right-0 mt-2 bg-white border border-blue-200 rounded-lg shadow-lg z-10 max-h-56 overflow-y-auto custom-scrollbar"
                    >
                      {filteredSearchSuggestions.map((category) => (
                        <motion.button
                          key={category.id}
                          onClick={() => handleSearchCategorySelect(category.name)}
                          whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                          className="w-full text-left p-3 text-gray-700 hover:text-blue-700 transition-colors duration-150 text-sm"
                          role="option"
                        >
                          <span className="font-semibold">{category.name}</span>
                        </motion.button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
                >
                  <div className="flex items-center space-x-2 bg-white p-2.5 rounded-lg border border-blue-200 shadow-sm">
                    <Calendar className="text-gray-500 text-base" />
                    <DatePicker
                      selected={startDate}
                      onChange={(date: Date | null) => setStartDate(date)}
                      selectsStart
                      startDate={startDate}
                      endDate={endDate}
                      placeholderText="Start Date"
                      className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      aria-label="Start Date"
                    />
                    <span className="text-gray-400">-</span>
                    <DatePicker
                      selected={endDate}
                      onChange={(date: Date | null) => setEndDate(date)}
                      selectsEnd
                      startDate={startDate}
                      endDate={endDate}
                      minDate={startDate || undefined}
                      placeholderText="End Date"
                      className="w-24 focus:outline-none bg-transparent text-sm text-gray-800 placeholder-gray-400"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                      aria-label="End Date"
                    />
                    {(startDate || endDate) && (
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => {
                          setStartDate(null);
                          setEndDate(null);
                        }}
                        className="p-1 rounded-full text-gray-400 hover:bg-gray-100 transition-colors"
                        title="Clear Dates"
                        aria-label="Clear date range"
                      >
                        <X className="text-base" />
                      </motion.button>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading vendor data...</p>
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">{debouncedSearchQuery || startDate || endDate ? "No vendors found matching your filters." : "No vendors available."}</p>
              {(debouncedSearchQuery || startDate || endDate) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStartDate(null);
                    setEndDate(null);
                  }}
                  className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm"
                >
                  Clear All Filters
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("id")}>
                        No
                        {sortConfig?.key === "id" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider cursor-pointer" onClick={() => requestSort("name")}>
                        Vendor Name
                        {sortConfig?.key === "name" && <span className="ml-1">{sortConfig.direction === "ascending" ? "↑" : "↓"}</span>}
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Address</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact Person</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Telp</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Handphone</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.map((v, index) => (
                      <motion.tr
                        key={v.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{index + 1}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{v.name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-600 truncate max-w-xs">{v.address || "-"}</div>
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
                            onClick={() => openVendorDetails(v)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                            title="View Details"
                            aria-label={`View details for vendor ${v.name}`}
                          >
                            <Eye className="inline text-base" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/vendors/editvendor/${v.id}`)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                            title="Edit"
                            aria-label={`Edit vendor ${v.name}`}
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
                            aria-label={`Delete vendor ${v.name}`}
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
          )}

          {filteredRecords.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredRecords.length)}</span> of{" "}
                <span className="font-semibold">{filteredRecords.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Previous page"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-3.5 py-2 rounded-md transition-colors duration-200 shadow-sm font-medium text-sm
                      ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
                    `}
                    aria-label={`Go to page ${i + 1}`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                  aria-label="Next page"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {selectedVendor && (
        <Modal
          isOpen={showVendorDetails}
          onClose={() => {
            setShowVendorDetails(false);
            setSelectedVendor(null);
          }}
          title="Vendor Details"
          className="max-w-3xl"
        >
          <VendorDetails vendor={selectedVendor} onClose={() => setShowVendorDetails(false)} />
        </Modal>
      )}

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
