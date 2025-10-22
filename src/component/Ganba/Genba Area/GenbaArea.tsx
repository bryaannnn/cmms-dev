import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import QRCode from "qrcode";
import { Plus, Upload, ChevronUp, AlertTriangle, X, CheckCircle, Filter, ChevronLeft, ChevronDown, ChevronRight, Search, Edit, Eye, Trash2, Download, Share2, QrCode, MapPin, Users, Building } from "lucide-react";
import Sidebar from "../../../component/Sidebar";
import PageHeader from "../../../component/PageHeader";
import { useAuth } from "../../../routes/AuthContext";

interface Area {
  id: string;
  nama: string;
  department: string;
  penanggungJawab: string;
  pengawas: string;
  layoutRuangan: string;
  createdAt: string;
  updatedAt: string;
}

interface Department {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  department: string;
}

// Modal component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className, maxWidth = "max-w-xl" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${maxWidth} ${className || "w-full"}`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 focus:outline-none transition-colors duration-150">
                <X size={20} />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// QR Modal Component
interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: Area | null;
  onDownload: () => void;
  onShare: () => void;
}

const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, area, onDownload, onShare }) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (area && isOpen) {
      generateQRCode();
    }
  }, [area, isOpen]);

  const generateQRCode = async () => {
    if (!area) return;

    try {
      const qrData = JSON.stringify({
        type: "genba_area",
        areaId: area.id,
        areaName: area.nama,
        department: area.department,
        penanggungJawab: area.penanggungJawab,
        layoutUrl: area.layoutRuangan,
        timestamp: new Date().toISOString(),
      });

      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: "#1E40AF",
          light: "#FFFFFF",
        },
      });
      setQrCodeUrl(url);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleDownload = () => {
    if (!qrCodeUrl) return;

    const link = document.createElement("a");
    link.download = `QR_${area?.nama.replace(/\s+/g, "_")}_${Date.now()}.png`;
    link.href = qrCodeUrl;
    link.click();
    onDownload();
  };

  const handleShare = async () => {
    if (!qrCodeUrl) return;

    try {
      if (navigator.share) {
        const response = await fetch(qrCodeUrl);
        const blob = await response.blob();
        const file = new File([blob], `QR_${area?.nama}.png`, { type: "image/png" });

        await navigator.share({
          title: `QR Code Area - ${area?.nama}`,
          text: `QR Code untuk area ${area?.nama}, Department: ${area?.department}`,
          files: [file],
        });
        onShare();
      } else {
        // Fallback: copy to clipboard or show download
        await navigator.clipboard.writeText(`Area: ${area?.nama}\nDepartment: ${area?.department}\nPenanggung Jawab: ${area?.penanggungJawab}`);
        alert("Informasi area telah disalin ke clipboard!");
        onShare();
      }
    } catch (error) {
      console.error("Error sharing:", error);
      // Fallback to download
      handleDownload();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="QR Code Area" maxWidth="max-w-md">
      <div className="text-center space-y-6">
        <div className="bg-blue-50 rounded-2xl p-6">
          {qrCodeUrl ? (
            <img src={qrCodeUrl} alt="QR Code" className="w-64 h-64 mx-auto rounded-lg shadow-md" />
          ) : (
            <div className="w-64 h-64 mx-auto flex items-center justify-center bg-gray-100 rounded-lg">
              <QrCode className="text-gray-400 w-16 h-16" />
            </div>
          )}
        </div>

        <div className="text-left bg-white rounded-lg p-4 border border-gray-200">
          <h4 className="font-semibold text-gray-900 mb-2">Informasi Area</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex justify-between">
              <span>Nama Area:</span>
              <span className="font-medium text-gray-900">{area?.nama}</span>
            </div>
            <div className="flex justify-between">
              <span>Department:</span>
              <span className="font-medium text-gray-900">{area?.department}</span>
            </div>
            <div className="flex justify-between">
              <span>Penanggung Jawab:</span>
              <span className="font-medium text-gray-900">{area?.penanggungJawab}</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 justify-center">
          <motion.button onClick={handleDownload} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
            <Download size={16} />
            Download QR
          </motion.button>
          <motion.button onClick={handleShare} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium">
            <Share2 size={16} />
            Share
          </motion.button>
        </div>

        <p className="text-xs text-gray-500">QR code berisi informasi lengkap area kerja untuk keperluan 5S dan maintenance</p>
      </div>
    </Modal>
  );
};

// Confirm Modal
const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Delete", cancelText = "Cancel" }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="max-w-md">
      <div className="text-center space-y-4">
        <AlertTriangle className="text-red-500 text-5xl mx-auto" />
        <p className="text-gray-700">{message}</p>
        <div className="flex gap-3 justify-center pt-4">
          <motion.button onClick={onClose} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium transition-colors">
            {cancelText}
          </motion.button>
          <motion.button onClick={onConfirm} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition-colors">
            {confirmText}
          </motion.button>
        </div>
      </div>
    </Modal>
  );
};

const GenbaArea: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [areas, setAreas] = useState<Area[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<Area | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sample data - in real app, this would come from API
  const departments: Department[] = [
    { id: "1", name: "Produksi" },
    { id: "2", name: "Gudang" },
    { id: "3", name: "Administrasi" },
    { id: "4", name: "Engineering" },
    { id: "5", name: "Quality" },
  ];

  const users: User[] = [
    { id: "1", name: "Budi Santoso", department: "Produksi" },
    { id: "2", name: "Siti Rahayu", department: "Gudang" },
    { id: "3", name: "Ari Wibowo", department: "Administrasi" },
    { id: "4", name: "Hendra Gunawan", department: "Engineering" },
    { id: "5", name: "Fitri Handayani", department: "Quality" },
  ];

  useEffect(() => {
    // Load sample data
    const sampleAreas: Area[] = [
      {
        id: "1",
        nama: "Area Produksi Line A",
        department: "Produksi",
        penanggungJawab: "Budi Santoso",
        pengawas: "Ahmad Wijaya",
        layoutRuangan: "/api/placeholder/400/300",
        createdAt: "2024-01-15",
        updatedAt: "2024-01-15",
      },
      {
        id: "2",
        nama: "Area Gudang Bahan Baku",
        department: "Gudang",
        penanggungJawab: "Siti Rahayu",
        pengawas: "Dewi Sartika",
        layoutRuangan: "/api/placeholder/400/300",
        createdAt: "2024-01-10",
        updatedAt: "2024-01-10",
      },
      {
        id: "3",
        nama: "Area Kantor HRD",
        department: "Administrasi",
        penanggungJawab: "Ari Wibowo",
        pengawas: "Maya Sari",
        layoutRuangan: "/api/placeholder/400/300",
        createdAt: "2024-01-08",
        updatedAt: "2024-01-08",
      },
    ];

    setAreas(sampleAreas);
    setLoading(false);
  }, []);

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

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  // Filter areas based on search and department filter
  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesSearch = area.nama.toLowerCase().includes(searchQuery.toLowerCase()) || area.department.toLowerCase().includes(searchQuery.toLowerCase()) || area.penanggungJawab.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = departmentFilter.length === 0 || departmentFilter.includes(area.department);

      return matchesSearch && matchesDepartment;
    });
  }, [areas, searchQuery, departmentFilter]);

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = (id: string) => {
    setAreas((prev) => prev.filter((area) => area.id !== id));
    setShowDeleteConfirm(false);
    setAreaToDelete(null);
  };

  const handleQRCode = (area: Area) => {
    setSelectedArea(area);
    setShowQRModal(true);
  };

  const handleDepartmentFilter = (department: string) => {
    setDepartmentFilter((prev) => (prev.includes(department) ? prev.filter((d) => d !== department) : [...prev, department]));
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter([]);
    setCurrentPage(1);
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

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Genba Area" mainTitleHighlight="Management" description="Manage work areas and their configurations for 5S implementation" icon={<MapPin />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Genba <span className="text-blue-600">Area Management</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Manage and organize work areas for efficient 5S implementation and maintenance tracking.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                onClick={() => navigate("/genba/genbaarea/addgenbaarea")}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus size={16} />
                <span>Add Area</span>
              </motion.button>
              <motion.button
                onClick={() => setShowFilters(!showFilters)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Filter size={16} />
                <span>Filters</span>
                <motion.span animate={{ rotate: showFilters ? 180 : 0 }} transition={{ duration: 0.2 }}>
                  <ChevronDown size={16} />
                </motion.span>
              </motion.button>
            </div>
          </motion.div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Areas" value={areas.length.toString()} change="+12%" icon={<MapPin />} />
            <StatCard title="Active Departments" value={new Set(areas.map((a) => a.department)).size.toString()} change="+2" icon={<Building />} />
            <StatCard title="Assigned PIC" value={new Set(areas.map((a) => a.penanggungJawab)).size.toString()} change="+5" icon={<Users />} />
            <StatCard title="This Month" value="3" change="+1" icon={<CheckCircle />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search by area name, department, or PIC..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-5 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <div className="flex flex-wrap gap-2">
                      {departments.map((dept) => (
                        <button
                          key={dept.id}
                          onClick={() => handleDepartmentFilter(dept.name)}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${departmentFilter.includes(dept.name) ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"}`}
                        >
                          {dept.name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(searchQuery || departmentFilter.length > 0) && (
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">{filteredAreas.length} areas found</span>
                      <button onClick={clearFilters} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                        Clear all filters
                      </button>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Areas Table */}
          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading areas data...</p>
            </div>
          ) : filteredAreas.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <MapPin className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">{searchQuery || departmentFilter.length > 0 ? "No areas found matching your filters." : "No areas available. Create your first area to get started."}</p>
              {(searchQuery || departmentFilter.length > 0) && (
                <button onClick={clearFilters} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
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
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Area Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Penanggung Jawab</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Pengawas</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created Date</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentAreas.map((area) => (
                      <motion.tr
                        key={area.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3">
                          <div className="text-sm font-medium text-gray-900">{area.nama}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{area.department}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-900">{area.penanggungJawab}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-900">{area.pengawas}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm text-gray-500">{area.createdAt}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => navigate(`/genba/genbaarea/editgenbaarea/${area.id}`)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleQRCode(area)}
                            className="text-purple-600 hover:text-purple-800 transition-colors duration-200 p-1 rounded-full hover:bg-purple-50"
                            title="QR Code"
                          >
                            <QrCode size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setAreaToDelete(area.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {/* Pagination */}
          {filteredAreas.length > itemsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstItem + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastItem, filteredAreas.length)}</span> of{" "}
                <span className="font-semibold">{filteredAreas.length}</span> areas
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
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
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* QR Modal */}
      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} area={selectedArea} onDownload={() => console.log("QR Downloaded")} onShare={() => console.log("QR Shared")} />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => areaToDelete && handleDelete(areaToDelete)}
        title="Delete Area"
        message="Are you sure you want to delete this area? This action cannot be undone."
      />
    </div>
  );
};

export default GenbaArea;
