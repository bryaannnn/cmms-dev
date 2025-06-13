import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiTrendingUp,
  FiAlertCircle,
  FiMessageSquare,
  FiMoreHorizontal,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import type { User } from "../routes/AuthContext";


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
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
          ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
        `}
    >
      <span className="text-xl">{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = change.startsWith("+");

  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
        </div>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="p-3 rounded-full bg-blue-50 text-blue-600 text-2xl">
          {icon}
        </motion.div>
      </div>
      <motion.p animate={{ x: isPositive ? [0, 2, 0] : [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`mt-3 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
        {change} from last month
      </motion.p>
    </motion.div>
  );
};

const Dashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [currentPage, setCurrentPage] = useState(1);
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState<User | null>(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);

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

  const insights = [
    {
      id: 1,
      title: "Maintenance Efficiency Improved",
      description: "Preventive maintenance completion rate increased by 15% this month",
      icon: <FiTrendingUp className="text-green-500" />,
      date: "Today, 09:30 AM",
    },
    {
      id: 2,
      title: "3 Assets Requiring Attention",
      description: "Critical assets showing signs of wear need inspection",
      icon: <FiAlertCircle className="text-yellow-500" />,
      date: "Yesterday, 02:15 PM",
    },
    {
      id: 3,
      title: "Monthly Maintenance Completed",
      description: "All scheduled maintenance tasks completed on time",
      icon: <FiCheckCircle className="text-blue-500" />,
      date: "Jul 28, 2023",
    },
  ];

  const employeeComments = [
    {
      id: 1,
      name: "Budi Santoso",
      role: "Maintenance Technician",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg  ",
      comment: "The HVAC system in Building A needs calibration. Temperature fluctuations observed.",
      time: "2 hours ago",
    },
    {
      id: 2,
      name: "Ani Wijaya",
      role: "Facility Manager",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg  ",
      comment: "Completed generator maintenance ahead of schedule. All parameters normal.",
      time: "5 hours ago",
    },
    {
      id: 3,
      name: "Rudi Hermawan",
      role: "Operations Supervisor",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg  ",
      comment: "Requesting additional spare parts for conveyor system maintenance next week.",
      time: "1 day ago",
    },
  ];

  const assetStatus = {
    total: 142,
    running: 118,
    maintenance: 15,
    breakdown: 5,
    idle: 4,
  };

  const workOrders = {
    total: 86,
    completed: 72,
    inProgress: 9,
    overdue: 5,
  };

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleImport = () => {
    alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // useEffect(() => {
  //   setCurrentPage(1);

  //   if (user) {
  //     setData(user);
  //   }

  //   document.documentElement.classList.toggle("dark", darkMode);
  //   localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  // }, [sidebarOpen, darkMode, user]);

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
  }, [sidebarOpen, darkMode]);

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
            }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`bg-white border-r border-blue-100 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-blue-100">
              {sidebarOpen ? (
                <>
                  <div className="rounded-lg flex items-center  space-x-3">
                    <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                    <p className="text-blue-600 font-bold">CMMS</p>
                  </div>
                </>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-6 w-auto" />
              )}

              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />
              <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />
              <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />
              <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />
              <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">User</p>
                  </div>
                )}
              </div>

              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/logout")}
                  className="mt-4 w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </button>
            )}
            <FiHome className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Dashboard</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNotifications} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD  " alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
              <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Welcome Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-xl p-6 text-white mb-6 shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <h1 className="text-xl md:text-2xl font-bold mb-2">Welcome back, {user?.name || "Admin"}!</h1>
            <p className="opacity-90">Here's what's happening with your assets today</p>
          </motion.div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6">
            <StatCard title="Total Assets" value={assetStatus.total.toString()} change="+8%" icon={<FiPackage />} />
            <StatCard title="Assets Running" value={assetStatus.running.toString()} change="+5%" icon={<FiCheckCircle />} />
            <StatCard title="Work Orders" value={workOrders.total.toString()} change="-3%" icon={<FiClipboard />} />
            <StatCard title="Overdue Tasks" value={workOrders.overdue.toString()} change="+2%" icon={<FiClock />} />
          </div>

          {/* Main Content Area */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">
            {/* Insights Section */}
            <div className="lg:col-span-2">
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Recent Insights</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-blue-600 text-sm font-medium">
                    View All
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {insights.map((insight) => (
                    <motion.div key={insight.id} whileHover={{ x: 5 }} className="flex items-start p-3 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer">
                      <div className="p-2 mr-3 mt-1 rounded-full bg-blue-50">{insight.icon}</div>
                      <div className="flex-1">
                        <h4 className="font-medium">{insight.title}</h4>
                        <p className="text-sm text-gray-600">{insight.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{insight.date}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Asset Status Chart */}
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Asset Status Distribution</h3>
                <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <FiBarChart2 className="mx-auto text-4xl mb-2" />
                    <p>Asset Status Chart</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 text-center">
                  <div>
                    <div className="h-2 w-full bg-green-500 rounded-full"></div>
                    <p className="text-sm mt-1">Running ({Math.round((assetStatus.running / assetStatus.total) * 100)}%)</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-yellow-500 rounded-full"></div>
                    <p className="text-sm mt-1">Maintenance ({Math.round((assetStatus.maintenance / assetStatus.total) * 100)}%)</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-red-500 rounded-full"></div>
                    <p className="text-sm mt-1">Breakdown ({Math.round((assetStatus.breakdown / assetStatus.total) * 100)}%)</p>
                  </div>
                  <div>
                    <div className="h-2 w-full bg-blue-500 rounded-full"></div>
                    <p className="text-sm mt-1">Idle ({Math.round((assetStatus.idle / assetStatus.total) * 100)}%)</p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Employee Comments Section */}
            <div>
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Team Updates</h3>
                  <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="text-blue-600 text-sm font-medium">
                    View All
                  </motion.button>
                </div>

                <div className="space-y-4">
                  {employeeComments.map((comment) => (
                    <motion.div key={comment.id} whileHover={{ y: -3 }} className="p-3 border border-blue-100 rounded-lg cursor-pointer">
                      <div className="flex items-start">
                        <motion.img whileHover={{ rotate: 5 }} src={comment.avatar} alt={comment.name} className="w-10 h-10 rounded-full mr-3" />
                        <div>
                          <div className="flex items-center flex-wrap">
                            <h4 className="font-medium">{comment.name}</h4>
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full ml-2">{comment.role}</span>
                          </div>
                          <p className="text-sm mt-1">{comment.comment}</p>
                          <p className="text-xs text-gray-500 mt-1">{comment.time}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div whileHover={{ boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)" }} className="bg-white rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  {[
                    {
                      text: "Create Work Order",
                      icon: <FiClipboard className="text-blue-600" />,
                      onClick: () => navigate("/workorders"),
                    },
                    {
                      text: "Add New Asset",
                      icon: <FiPackage className="text-blue-600" />,
                      onClick: () => navigate("/assets"),
                    },
                    {
                      text: "Send Announcement",
                      icon: <FiMessageSquare className="text-blue-600" />,
                      onClick: () => navigate("/dashboard"),
                    },
                    {
                      text: "Generate Report",
                      icon: <FiBarChart2 className="text-blue-600" />,
                      onClick: () => navigate("/reports"),
                    },
                  ].map((action, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ x: 5, backgroundColor: "rgba(239, 246, 255, 1)" }}
                      whileTap={{ scale: 0.98 }}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      onClick={action.onClick}
                    >
                      <span className="font-medium">{action.text}</span>
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

export default Dashboard;
