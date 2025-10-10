import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, WorkOrderData } from "../../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import DOMPurify from "dompurify";
import { BookOpen, Search, X, ChevronDown, ChevronRight, LogOut, Sun, Moon, Settings, Bell, User as UserIcon, Info, ChevronLeft, FileText, Calendar, UserCheck } from "lucide-react";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface KnowledgeArticle {
  id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  lastUpdated: string;
  workOrderNo: string;
  technician: string;
  completionDate: string;
}

// Tambahkan komponen ini setelah interface ModalProps
interface RichTextContentProps {
  content: string;
  className?: string;
}

const RichTextContent: React.FC<RichTextContentProps> = ({ content, className = "" }) => {
  if (!content) {
    return <div className={`w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center ${className}`}>-</div>;
  }

  // Konfigurasi DOMPurify yang mengizinkan list dan styling
  const cleanHTML = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "p",
      "br",
      "span",
      "div",
      "ol",
      "ul",
      "li", // Pastikan tag list diizinkan
      "strong",
      "b",
      "em",
      "i",
      "u",
      "s",
      "strike",
      "code",
      "mark",
      "sub",
      "sup",
    ],
    ALLOWED_ATTR: [
      "style",
      "class",
      "data-color",
      "align",
      "type",
      "start", // Izinkan atribut untuk list
    ],
  });

  return <div className={`rich-text-content w-full bg-blue-50 border border-blue-100 rounded-lg p-4 text-gray-800 min-h-[44px] ${className}`} dangerouslySetInnerHTML={{ __html: cleanHTML }} />;
};

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

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 border border-blue-100 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100 sticky top-0 bg-white">
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

const ITKnowledgeBase: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [showArticleDetailsModal, setShowArticleDetailsModal] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrderData | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [articlesPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { user, hasPermission, getWorkOrdersIT } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const isWorkOrdersIT = location.pathname === "/workorders/it";
  const isWorkOrdersTD = location.pathname === "/workorders/td";
  const isRequest = location.pathname === "/workorders/it";
  const isApprover = location.pathname === "/workorders/it/approver";
  const isAssignment = location.pathname === "/workorders/it/assignment";
  const isReceiver = location.pathname === "/workorders/it/receiver";
  const isReports = location.pathname === "/workorders/it/reports";
  const isKnowledgeBase = location.pathname === "/workorders/it/knowledgebase";

  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);

  const loadWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const workOrders = await getWorkOrdersIT();

      const articles: KnowledgeArticle[] = workOrders
        .filter((order) => order.action_taken && order.handling_status === "Closed")
        .map((order) => {
          const complaintWords = order.complaint.split(" ").slice(0, 5).join(" ");
          const title = `Solution for: ${complaintWords}${complaintWords.length < order.complaint.length ? "..." : ""}`;

          return {
            id: order.id,
            title: title,
            content: order.action_taken || "No action taken details available.",
            category: order.service?.service_name || "General",
            tags: [order.service_type?.group_name || "General", order.handling_status || "Completed", ...(order.asset_no ? [`Asset: ${order.asset_no}`] : [])],
            lastUpdated: order.handling_date || order.updated_at || order.created_at,
            workOrderNo: order.work_order_no,
            technician: order.assigned_to?.name || "Unknown Technician",
            completionDate: order.handling_date || order.updated_at,
          };
        });

      setKnowledgeArticles(articles);
    } catch (err) {
      setError("Failed to load knowledge base articles");
      console.error("Error loading work orders:", err);
    } finally {
      setLoading(false);
    }
  }, [getWorkOrdersIT]);

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
    loadWorkOrders();
  }, [loadWorkOrders]);

  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, categoryFilter, sidebarOpen, darkMode]);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const openArticleDetails = useCallback((article: KnowledgeArticle) => {
    setSelectedArticle(article);
    setShowArticleDetailsModal(true);
  }, []);

  const filteredArticles = knowledgeArticles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) || article.content.toLowerCase().includes(searchQuery.toLowerCase()) || article.tags.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const uniqueCategories = Array.from(new Set(knowledgeArticles.map((article) => article.category)));

  const indexOfLastArticle = currentPage * articlesPerPage;
  const indexOfFirstArticle = indexOfLastArticle - articlesPerPage;
  const currentArticles = filteredArticles.slice(indexOfFirstArticle, indexOfLastArticle);
  const totalPages = Math.ceil(filteredArticles.length / articlesPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
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
            <BookOpen className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Knowledge Base</h2>
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

            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user.name}</span>
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
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{user.name || "Guest User"}</div>
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="isi style mb-6 flex space-x-6 border-b border-gray-200">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isRequest ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Request
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/receiver")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReceiver ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Receiver
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/assignment")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isAssignment ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Assignment
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/reports")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReports ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Reports
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/knowledgebase")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isKnowledgeBase ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Knowledge Base
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">IT Knowledge Base</h1>
              <p className="text-gray-600 mt-1">Find solutions and information from completed work orders.</p>
            </div>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-2/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search articles by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="relative w-full md:w-1/3">
                <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                  <option value="all">All Categories</option>
                  {uniqueCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-800">Knowledge Articles</h3>
              <div className="text-sm text-gray-500">{filteredArticles.length} articles found</div>
            </div>

            {loading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading knowledge base...</p>
              </div>
            ) : error ? (
              <div className="text-center py-10 text-red-500">
                <Info className="mx-auto h-12 w-12 text-red-400 mb-2" />
                <p className="text-lg font-medium">{error}</p>
                <button onClick={loadWorkOrders} className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  Retry
                </button>
              </div>
            ) : currentArticles.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                <Info className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-lg">No articles found matching your criteria.</p>
                <p className="text-sm">Try adjusting your filters or search query.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                <AnimatePresence>
                  {currentArticles.map((article) => (
                    <motion.div
                      key={article.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 p-5 rounded-xl border border-gray-200 shadow-sm cursor-pointer hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
                      onClick={() => openArticleDetails(article)}
                    >
                      <h4 className="text-lg font-semibold text-gray-900 mb-2">{article.title}</h4>

                      {/* Ganti ini: */}
                      {/* <p className="text-gray-700 text-sm line-clamp-2 mb-3">{article.content}</p> */}

                      {/* Menjadi ini: */}
                      <div className="text-gray-700 text-sm line-clamp-2 mb-3">
                        <RichTextContent content={article.content} className="line-clamp-2 bg-transparent border-none p-0" />
                      </div>

                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">{article.category}</span>
                        {article.tags.map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span className="flex items-center">
                            <FileText size={12} className="mr-1" />
                            {article.workOrderNo}
                          </span>
                          <span className="flex items-center">
                            <UserCheck size={12} className="mr-1" />
                            {article.technician}
                          </span>
                        </div>
                        <span className="flex items-center">
                          <Calendar size={12} className="mr-1" />
                          {new Date(article.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {filteredArticles.length > articlesPerPage && (
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 mt-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <motion.button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </motion.button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstArticle + 1}</span> to <span className="font-medium">{Math.min(indexOfLastArticle, filteredArticles.length)}</span> of{" "}
                      <span className="font-medium">{filteredArticles.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <motion.button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Previous</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </motion.button>
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="sr-only">Next</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </motion.button>
                    </nav>
                  </div>
                </div>
              </nav>
            )}
          </div>
        </main>
      </div>

      {selectedArticle && (
        <Modal isOpen={showArticleDetailsModal} onClose={() => setShowArticleDetailsModal(false)} title={selectedArticle.title}>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
              <div className="flex items-center">
                <FileText size={16} className="mr-2 text-blue-600" />
                <span className="font-medium">Work Order:</span>
                <span className="ml-2">{selectedArticle.workOrderNo}</span>
              </div>
              <div className="flex items-center">
                <UserCheck size={16} className="mr-2 text-green-600" />
                <span className="font-medium">Technician:</span>
                <span className="ml-2">{selectedArticle.technician}</span>
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-2 text-purple-600" />
                <span className="font-medium">Completed:</span>
                <span className="ml-2">{new Date(selectedArticle.completionDate).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center">
                <BookOpen size={16} className="mr-2 text-orange-600" />
                <span className="font-medium">Category:</span>
                <span className="ml-2">{selectedArticle.category}</span>
              </div>
            </div>

            {/* Action Taken Section */}
            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Solution Details</h4>
              <RichTextContent content={selectedArticle.content} />
            </div>

            <div className="border-t border-gray-200 pt-4">
              <h4 className="font-semibold text-gray-800 mb-2">Tags</h4>
              <div className="flex flex-wrap gap-2">
                {selectedArticle.tags.map((tag) => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-4 text-xs text-gray-500">
              Last updated: {new Date(selectedArticle.lastUpdated).toLocaleDateString()} at {new Date(selectedArticle.lastUpdated).toLocaleTimeString()}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ITKnowledgeBase;
