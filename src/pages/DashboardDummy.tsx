import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../routes/AuthContext";
import Sidebar from "../component/Sidebar";

// Import Lucide Icons for consistency with Maintenance.tsx
import {
  Clock,
  CheckCircle,
  Users,
  BarChart2,
  Database,
  Clipboard,
  Package,
  ChevronLeft,
  Home,
  ChevronDown,
  ChevronRight,
  LogOut,
  Sun,
  Moon,
  Settings,
  Bell,
  TrendingUp,
  AlertTriangle,
  MessageSquare,
  Wrench,
  User as UserIcon,
  X,
  Key,
  DollarSign,
  ShoppingCart,
  CreditCard,
  ArrowUpRight,
  ArrowDownLeft,
} from "lucide-react";

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

// New component for sales metrics cards
const SalesMetricCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
      className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 cursor-pointer overflow-hidden transform transition-transform duration-200"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-xl">{icon}</div>
      </div>
      <p className={`mt-2 text-xs font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {isPositive ? <ArrowUpRight className="inline w-3 h-3 mr-1" /> : <ArrowDownLeft className="inline w-3 h-3 mr-1" />}
        {change} from last month
      </p>
    </motion.div>
  );
};

const DashboardDummy: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { user, fetchWithAuth, hasPermission } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // New state for popups
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Refs for click outside
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click outside handler for popups
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

  // Sales data based on the image
  const salesData = {
    totalRevenue: "$734,241",
    totalCustomers: "8,421",
    totalTransactions: "734",
    totalProducts: "142",
  };

  const salesInsights = [
    {
      id: 1,
      title: "Revenue Increased",
      description: "Total revenue increased by 12% compared to last month",
      icon: <TrendingUp className="text-green-500" />,
      date: "Today, 09:30 AM",
    },
    {
      id: 2,
      title: "High Performing Products",
      description: "Product 01 and Product 02 showing exceptional sales growth",
      icon: <BarChart2 className="text-blue-500" />,
      date: "Yesterday, 02:15 PM",
    },
    {
      id: 3,
      title: "Payment Processing Complete",
      description: "All pending payments have been successfully processed",
      icon: <CheckCircle className="text-green-500" />,
      date: "Jul 28, 2023",
    },
  ];

  const teamUpdates = [
    {
      id: 1,
      name: "John D.",
      role: "Sales Manager",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      comment: "The new product line is performing exceptionally well in the market.",
      time: "2 hours ago",
    },
    {
      id: 2,
      name: "Sarah M.",
      role: "Sales Executive",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      comment: "Closed a major deal with a corporate client ahead of schedule.",
      time: "5 hours ago",
    },
    {
      id: 3,
      name: "Michael T.",
      role: "Customer Success",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      comment: "Customer satisfaction ratings have improved by 15% this quarter.",
      time: "1 day ago",
    },
  ];

  const productPerformance = {
    product01: 65,
    product02: 35,
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    setCurrentPage(1);

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();

    document.documentElement.classList.toggle("dark", darkMode);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen, darkMode, fetchWithAuth]);

  return (
    <div className="flex h-screen font-sans antialiased bg-gray-50 text-gray-900">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Home className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Sales Dashboard</h2>
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

            {/* Notifications Pop-up */}
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
                      {salesInsights.slice(0, 3).map((notification) => (
                        <div key={notification.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{notification.icon}</div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
                            <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                          </div>
                        </div>
                      ))}
                      {salesInsights.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
                    </div>
                    <div className="px-4 py-2 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          alert("View All Notifications clicked");
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

            {/* Profile Menu Pop-up */}
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

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, {user?.name || user?.role.name}!</h1>
            <p className="opacity-90 text-sm">Here's what's happening with your sales today</p>
          </motion.div>

          {/* Sales Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <SalesMetricCard title="Total Revenue" value={salesData.totalRevenue} change="+12%" icon={<DollarSign />} />
            <SalesMetricCard title="Total Customers" value={salesData.totalCustomers} change="+8%" icon={<Users />} />
            <SalesMetricCard title="Total Transactions" value={salesData.totalTransactions} change="+5%" icon={<CreditCard />} />
            <SalesMetricCard title="Total Products" value={salesData.totalProducts} change="+3%" icon={<Package />} />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Insights Section */}
            <div className="lg:col-span-2">
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Sales Insights</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-blue-600 text-sm font-medium">
                    View All
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {salesInsights.map((insight) => (
                    <motion.div key={insight.id} whileHover={{ x: 5, backgroundColor: "rgba(239, 246, 255, 0.5)" }} className="flex items-start p-3 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer">
                      <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{insight.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-800">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{insight.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Product Performance Chart */}
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Product Performance</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
                  <div className="text-center text-gray-500">
                    <BarChart2 className="mx-auto text-4xl mb-2" />
                    <p>Product Sales Chart</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                  <div>
                    <div className="h-2 w-full bg-blue-500 rounded-full"></div>
                    <p className="text-sm mt-1 text-gray-700">Product 01 ({productPerformance.product01}%)</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-green-500 rounded-full"></div>
                    <p className="text-sm mt-1 text-gray-700">Product 02 ({productPerformance.product02}%)</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Team Updates Section */}
            <div>
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">Team Updates</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-blue-600 text-sm font-medium">
                    View All
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {teamUpdates.map((comment) => (
                    <motion.div key={comment.id} whileHover={{ y: -3, boxShadow: "0 2px 10px rgba(0,0,0,0.05)" }} className="p-3 border border-gray-200 rounded-xl cursor-pointer bg-white">
                      <div className="flex items-start">
                        <motion.img whileHover={{ rotate: 5 }} src={comment.avatar} alt={comment.name} className="w-10 h-10 rounded-full mr-3 object-cover" />
                        <div>
                          <div className="flex items-center flex-wrap">
                            <h4 className="font-medium text-gray-900">{comment.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">{comment.role}</span>
                          </div>
                          <p className="text-sm mt-1 text-gray-700">{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">{comment.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    {
                      text: "Create Sales Report",
                      icon: <BarChart2 className="text-blue-600 text-lg" />,
                      onClick: () => navigate("/reports"),
                    },
                    {
                      text: "Add New Product",
                      icon: <Package className="text-blue-600 text-lg" />,
                      onClick: () => navigate("/products"),
                    },
                    {
                      text: "View Customer Insights",
                      icon: <Users className="text-blue-600 text-lg" />,
                      onClick: () => navigate("/customers"),
                    },
                    {
                      text: "Process Payments",
                      icon: <CreditCard className="text-blue-600 text-lg" />,
                      onClick: () => navigate("/payments"),
                    },
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ x: 5, backgroundColor: "rgba(239, 246, 255, 1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors text-gray-800 font-semibold text-sm"
                      onClick={action.onClick}
                    >
                      <span>{action.text}</span>
                      {action.icon}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardDummy;
