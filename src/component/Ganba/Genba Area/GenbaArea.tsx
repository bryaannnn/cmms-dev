import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Filter, ChevronDown, Search, Edit, QrCode, Trash2, MapPin, Building, Users, CheckCircle, X, AlertTriangle, Download, Share2 } from "lucide-react";
import Sidebar from "../../../component/Sidebar";
import PageHeader from "../../../component/PageHeader";
import { useAuth, GenbaWorkAreas, Department } from "../../../routes/AuthContext";

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

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  area: GenbaWorkAreas | null;
  onDownload: () => void;
  onShare: () => void;
}

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
  const { getGenbaAreas, deleteGenbaAreas, getUsers, getDepartment } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [areas, setAreas] = useState<GenbaWorkAreas[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState<string[]>([]);
  const [showFilters, setShowFilters] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [areaToDelete, setAreaToDelete] = useState<string | null>(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [selectedArea, setSelectedArea] = useState<GenbaWorkAreas | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  const QRModal: React.FC<QRModalProps> = ({ isOpen, onClose, area, onDownload, onShare }) => {
    const handleDownload = () => {
      if (!area?.qr_code_base64) return;

      const link = document.createElement("a");
      link.download = `QR_${area?.name.replace(/\s+/g, "_")}_${Date.now()}.png`;
      link.href = area.qr_code_base64;
      link.click();
      onDownload();
    };

    const handleShare = async () => {
      if (!area?.qr_code_base64) return;

      try {
        if (navigator.share) {
          const response = await fetch(area.qr_code_base64);
          const blob = await response.blob();
          const file = new File([blob], `QR_${area?.name}.png`, { type: "image/png" });

          await navigator.share({
            title: `QR Code Area - ${area?.name}`,
            text: `QR Code untuk area ${area?.name}, Department: ${area?.department.name}`,
            files: [file],
          });
          onShare();
        } else {
          await navigator.clipboard.writeText(`Area: ${area?.name}\nDepartment: ${area?.department.name}\nPenanggung Jawab: ${area?.pic.name}`);
          alert("Informasi area telah disalin ke clipboard!");
          onShare();
        }
      } catch (error) {
        console.error("Error sharing:", error);
        handleDownload();
      }
    };

    // Fungsi untuk mendapatkan URL attachment yang benar
    const getAttachmentFullUrl = (attachmentPath: string | null): string | null => {
      if (!attachmentPath) return null;

      if (attachmentPath.startsWith("http")) {
        return attachmentPath;
      } else {
        // Gunakan base URL dari environment variables atau fallback
        const baseUrl = import.meta.env.VITE_BACKEND_API_URL || "http://localhost:8000";
        return `${baseUrl}${attachmentPath.startsWith("/") ? "" : "/"}${attachmentPath}`;
      }
    };

    // Fungsi untuk menampilkan attachment
    const renderAttachments = () => {
      if (!area?.attachment || (Array.isArray(area.attachment) && area.attachment.length === 0)) {
        return null;
      }

      let attachments: Array<{ path: string; filename: string }> = [];

      // Handle berbagai format attachment
      if (typeof area.attachment === "string") {
        try {
          // Coba parse jika berupa JSON string
          const parsed = JSON.parse(area.attachment);
          attachments = Array.isArray(parsed) ? parsed : [parsed];
        } catch (error) {
          console.error("Error parsing attachment JSON:", error);
          // Jika gagal parse, anggap sebagai single path string
          attachments = [{ path: area.attachment, filename: "Layout Area" }];
        }
      } else if (Array.isArray(area.attachment)) {
        attachments = area.attachment;
      } else {
        // Jika berupa object single
        attachments = [area.attachment];
      }

      return (
        <div className="mt-4">
          <h4 className="font-semibold text-gray-900 mb-3">Layout Area</h4>
          <div className="grid grid-cols-1 gap-3">
            {attachments.map((attachment, index) => {
              const imageUrl = getAttachmentFullUrl(attachment.path);
              if (!imageUrl) return null;

              return (
                <div key={index} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                  <img
                    src={imageUrl}
                    alt={attachment.filename || `Layout ${index + 1}`}
                    className="w-full h-auto max-h-48 object-contain rounded-md"
                    onError={(e) => {
                      // Fallback jika gambar gagal dimuat
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                    }}
                  />
                  <p className="text-xs text-gray-500 mt-2 text-center truncate">{attachment.filename || `Layout ${index + 1}`}</p>
                </div>
              );
            })}
          </div>
        </div>
      );
    };

    return (
      <Modal isOpen={isOpen} onClose={onClose} title="QR Code Area" maxWidth="max-w-md">
        <div className="text-center space-y-6">
          <div className="bg-blue-50 rounded-2xl p-6">
            {area?.qr_code_base64 ? (
              <img src={area.qr_code_base64} alt="QR Code" className="w-64 h-64 mx-auto rounded-lg shadow-md" />
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
                <span className="font-medium text-gray-900">{area?.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-medium text-gray-900">{area?.department.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Penanggung Jawab:</span>
                <span className="font-medium text-gray-900">{area?.pic.name}</span>
              </div>
              <div className="flex justify-between">
                <span>Tipe Area:</span>
                <span className="font-medium text-gray-900">{area?.is_default ? "Daily Reports" : ""}</span>
              </div>
            </div>

            {/* Menampilkan attachment gambar */}
            {renderAttachments()}
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

  useEffect(() => {
    loadAreas();
    loadDepartments();
    loadUsers();
  }, []);

  const loadAreas = async () => {
    try {
      setLoading(true);
      const genbaAreas = await getGenbaAreas();
      setAreas(genbaAreas);
    } catch (error) {
      console.error("Failed to load areas:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDepartments = async () => {
    try {
      const departmentsData = await getDepartment();
      setDepartments(departmentsData);
    } catch (error) {
      console.error("Failed to load departments:", error);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error("Failed to load users:", error);
    }
  };

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

  const filteredAreas = useMemo(() => {
    return areas.filter((area) => {
      const matchesSearch = area.name.toLowerCase().includes(searchQuery.toLowerCase()) || area.department.name.toLowerCase().includes(searchQuery.toLowerCase()) || area.pic.name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesDepartment = departmentFilter.length === 0 || departmentFilter.includes(area.department.name);

      return matchesSearch && matchesDepartment;
    });
  }, [areas, searchQuery, departmentFilter]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDelete = async (id: string) => {
    try {
      await deleteGenbaAreas(parseInt(id));
      setAreas((prev) => prev.filter((area) => area.id.toString() !== id));
      setShowDeleteConfirm(false);
      setAreaToDelete(null);
    } catch (error) {
      console.error("Failed to delete area:", error);
    }
  };

  const handleQRCode = (area: GenbaWorkAreas) => {
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Areas" value={areas.length.toString()} change="+12%" icon={<MapPin />} />
            <StatCard title="Active Departments" value={new Set(areas.map((a) => a.department.name)).size.toString()} change="+2" icon={<Building />} />
            <StatCard title="Assigned PIC" value={new Set(areas.map((a) => a.pic.name)).size.toString()} change="+5" icon={<Users />} />
            <StatCard title="This Month" value="3" change="+1" icon={<CheckCircle />} />
          </div>

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
                          <div className="text-sm font-medium text-gray-900">{area.name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">{area.department.name}</span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-900">{area.pic.name}</div>
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
                              setAreaToDelete(area.id.toString());
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

      <QRModal isOpen={showQRModal} onClose={() => setShowQRModal(false)} area={selectedArea} onDownload={() => console.log("QR Downloaded")} onShare={() => console.log("QR Shared")} />

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
