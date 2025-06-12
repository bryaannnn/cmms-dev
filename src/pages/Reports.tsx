import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiDollarSign,
  FiUpload,
  FiChevronUp,
  FiAlertTriangle,
  FiTool,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiFilter,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiEdit,
  FiEye,
  FiClock,
  FiUser,
  FiCalendar,
  FiFlag,
  FiPrinter,
  FiDownload,
  FiPieChart,
  FiTrendingUp,
  FiActivity,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import { Bar, Pie, Line } from "react-chartjs-2";
import { Chart, registerables } from "chart.js";

Chart.register(...registerables);

type ReportType = "maintenance" | "inventory" | "work-orders" | "cost-analysis";
type TimeRange = "7-days" | "30-days" | "90-days" | "custom";

interface Report {
  id: string;
  title: string;
  type: ReportType;
  generatedAt: string;
  timeRange: TimeRange;
  data: any;
  filters: {
    department?: string;
    assetType?: string;
    priority?: string;
  };
}

interface ChartDataset {
  label?: string;
  data: number[];
  backgroundColor: string | string[];
  borderColor?: string | string[];
  borderWidth?: number;
}

interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

interface ChartOptions {
  responsive: boolean;
  plugins?: {
    legend?: {
      display: boolean;
    };
  };
  scales?: {
    y?: {
      beginAtZero?: boolean;
    };
  };
}

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
        {change} from last period
      </motion.p>
    </motion.div>
  );
};

const ReportCard: React.FC<{ report: Report; onView: (id: string) => void; onExport: (id: string) => void }> = ({ report, onView, onExport }) => {
  const getReportIcon = () => {
    switch (report.type) {
      case "maintenance":
        return <FiTool className="text-blue-500 text-2xl" />;
      case "inventory":
        return <FiPackage className="text-green-500 text-2xl" />;
      case "work-orders":
        return <FiClipboard className="text-orange-500 text-2xl" />;
      case "cost-analysis":
        return <FiDollarSign className="text-purple-500 text-2xl" />;
      default:
        return <FiBarChart2 className="text-gray-500 text-2xl" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-full bg-blue-50">{getReportIcon()}</div>
          <div>
            <h3 className="font-bold text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-600">{new Date(report.generatedAt).toLocaleDateString()}</p>
            <span className="inline-block mt-1 px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {report.type
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onView(report.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="View Report">
            <FiEye />
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => onExport(report.id)} className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg" title="Export Report">
            <FiDownload />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ReportsDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ReportType | "all">("all");
  const [timeFilter, setTimeFilter] = useState<TimeRange | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showGenerateReportModal, setShowGenerateReportModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [reportTitle, setReportTitle] = useState("");
  const [reportType, setReportType] = useState<ReportType>("maintenance");
  const [reportTimeRange, setReportTimeRange] = useState<TimeRange>("30-days");
  const [currentPage, setCurrentPage] = useState(1);
  const [reportsPerPage] = useState(5);
  const { user, fetchWithAuth } = useAuth();
  const [data, setData] = useState(null);
  const navigate = useNavigate();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  // Sample report data
  const [reports, setReports] = useState<Report[]>([
    {
      id: "REP-001",
      title: "Monthly Maintenance Summary",
      type: "maintenance",
      generatedAt: new Date().toISOString(),
      timeRange: "30-days",
      data: {
        totalWorkOrders: 42,
        completed: 35,
        inProgress: 5,
        overdue: 2,
        byDepartment: {
          maintenance: 28,
          production: 10,
          facilities: 4,
        },
        byPriority: {
          high: 8,
          medium: 25,
          low: 9,
        },
      },
      filters: {
        department: "all",
        priority: "all",
      },
    },
    {
      id: "REP-002",
      title: "Inventory Status Report",
      type: "inventory",
      generatedAt: new Date(Date.now() - 86400000).toISOString(),
      timeRange: "7-days",
      data: {
        totalItems: 156,
        inStock: 120,
        lowStock: 25,
        outOfStock: 11,
        byCategory: {
          "spare-parts": 65,
          consumables: 45,
          tools: 30,
          safety: 16,
        },
        inventoryValue: 28456.78,
      },
      filters: {
        department: "maintenance",
      },
    },
    {
      id: "REP-003",
      title: "Quarterly Cost Analysis",
      type: "cost-analysis",
      generatedAt: new Date(Date.now() - 2592000000).toISOString(),
      timeRange: "90-days",
      data: {
        totalCost: 125487.32,
        byCategory: {
          maintenance: 65432.1,
          inventory: 32587.45,
          labor: 27467.77,
        },
        byMonth: {
          "Month 1": 42156.32,
          "Month 2": 39874.21,
          "Month 3": 43456.79,
        },
      },
      filters: {},
    },
    {
      id: "REP-004",
      title: "Work Order Performance",
      type: "work-orders",
      generatedAt: new Date(Date.now() - 172800000).toISOString(),
      timeRange: "30-days",
      data: {
        avgCompletionTime: "2.5 days",
        onTimeCompletion: "82%",
        byTechnician: {
          "John Doe": 18,
          "Jane Smith": 12,
          "Mike Johnson": 8,
          "Sarah Williams": 4,
        },
        byAssetType: {
          mechanical: 22,
          electrical: 12,
          vehicle: 5,
          building: 3,
        },
      },
      filters: {
        assetType: "all",
      },
    },
    {
      id: "REP-005",
      title: "Preventive Maintenance Compliance",
      type: "maintenance",
      generatedAt: new Date(Date.now() - 604800000).toISOString(),
      timeRange: "30-days",
      data: {
        scheduled: 45,
        completed: 38,
        complianceRate: "84%",
        byEquipment: {
          "HVAC Systems": 12,
          "Production Machines": 18,
          Vehicles: 8,
          Other: 7,
        },
      },
      filters: {},
    },
  ]);

  const handleNotifications = () => {
    alert("Showing notifications...");
  };

  const handleViewReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      setSelectedReport(report);
    }
  };

  const handleExportReport = (id: string) => {
    const report = reports.find((r) => r.id === id);
    if (report) {
      alert(`Exporting report: ${report.title}`);
      // In a real app, this would generate a PDF or CSV
    }
  };

  const handleGenerateReport = () => {
    const newReport: Report = {
      id: `REP-${String(reports.length + 1).padStart(3, "0")}`,
      title:
        reportTitle ||
        `${reportType
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ")} Report`,
      type: reportType,
      generatedAt: new Date().toISOString(),
      timeRange: reportTimeRange,
      data: generateSampleReportData(reportType, reportTimeRange),
      filters: {},
    };
    setReports([newReport, ...reports]);
    setShowGenerateReportModal(false);
    setReportTitle("");
  };

  const generateSampleReportData = (type: ReportType, range: TimeRange) => {
    // This would be replaced with actual data fetching in a real app
    switch (type) {
      case "maintenance":
        return {
          totalWorkOrders: Math.floor(Math.random() * 50) + 20,
          completed: Math.floor(Math.random() * 40) + 15,
          inProgress: Math.floor(Math.random() * 10) + 2,
          overdue: Math.floor(Math.random() * 5),
          byDepartment: {
            maintenance: Math.floor(Math.random() * 30) + 10,
            production: Math.floor(Math.random() * 20) + 5,
            facilities: Math.floor(Math.random() * 10) + 2,
          },
        };
      case "inventory":
        return {
          totalItems: Math.floor(Math.random() * 200) + 100,
          inStock: Math.floor(Math.random() * 150) + 80,
          lowStock: Math.floor(Math.random() * 30) + 5,
          outOfStock: Math.floor(Math.random() * 20) + 2,
          byCategory: {
            "spare-parts": Math.floor(Math.random() * 80) + 30,
            consumables: Math.floor(Math.random() * 60) + 20,
            tools: Math.floor(Math.random() * 40) + 10,
            safety: Math.floor(Math.random() * 20) + 5,
          },
        };
      case "work-orders":
        return {
          avgCompletionTime: `${Math.floor(Math.random() * 5) + 1} days`,
          onTimeCompletion: `${Math.floor(Math.random() * 30) + 70}%`,
          byTechnician: {
            "John Doe": Math.floor(Math.random() * 20) + 5,
            "Jane Smith": Math.floor(Math.random() * 15) + 5,
            "Mike Johnson": Math.floor(Math.random() * 10) + 2,
            "Sarah Williams": Math.floor(Math.random() * 8) + 1,
          },
        };
      case "cost-analysis":
        return {
          totalCost: Math.floor(Math.random() * 200000) + 50000,
          byCategory: {
            maintenance: Math.floor(Math.random() * 100000) + 30000,
            inventory: Math.floor(Math.random() * 80000) + 20000,
            labor: Math.floor(Math.random() * 70000) + 15000,
          },
        };
      default:
        return {};
    }
  };

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const filteredReports = reports.filter((report) => {
    const matchesSearch = report.title.toLowerCase().includes(searchQuery.toLowerCase()) || report.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === "all" || report.type === typeFilter;
    const matchesTime = timeFilter === "all" || report.timeRange === timeFilter;

    return matchesSearch && matchesType && matchesTime;
  });

  const indexOfLastReport = currentPage * reportsPerPage;
  const indexOfFirstReport = indexOfLastReport - reportsPerPage;
  const currentReports = filteredReports.slice(indexOfFirstReport, indexOfLastReport);
  const totalPages = Math.ceil(filteredReports.length / reportsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);

    const fetchData = async () => {
      try {
        const result = await fetchWithAuth("/api/protected-data");
        setData(result);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();

    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, typeFilter, timeFilter, sidebarOpen]);

  const renderReportVisualization = (report: Report) => {
    // Base chart options that can be extended
    const baseChartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    // Helper function to transform object values to numbers
    const toNumberArray = (obj: Record<string, unknown>): number[] => Object.values(obj).map((value) => Number(value));

    // Helper function to format labels
    const formatLabel = (str: string): string =>
      str
        .split("-")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");

    switch (report.type) {
      case "maintenance": {
        const statusData: ChartData = {
          labels: ["Completed", "In Progress", "Overdue"],
          datasets: [
            {
              label: "Work Orders",
              data: [Number(report.data.completed), Number(report.data.inProgress), Number(report.data.overdue)],
              backgroundColor: ["#10B981", "#3B82F6", "#EF4444"],
            },
          ],
        };

        const deptData: ChartData = {
          labels: Object.keys(report.data.byDepartment),
          datasets: [
            {
              data: toNumberArray(report.data.byDepartment),
              backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
            },
          ],
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Work Orders by Status">
              <Bar data={statusData} options={baseChartOptions} />
            </ChartCard>
            <ChartCard title="Work Orders by Department">
              <Pie data={deptData} options={baseChartOptions} />
            </ChartCard>
          </div>
        );
      }

      case "inventory": {
        const statusData: ChartData = {
          labels: ["In Stock", "Low Stock", "Out of Stock"],
          datasets: [
            {
              data: [Number(report.data.inStock), Number(report.data.lowStock), Number(report.data.outOfStock)],
              backgroundColor: ["#10B981", "#F59E0B", "#EF4444"],
            },
          ],
        };

        const categoryData: ChartData = {
          labels: Object.keys(report.data.byCategory).map(formatLabel),
          datasets: [
            {
              label: "Items",
              data: toNumberArray(report.data.byCategory),
              backgroundColor: "#3B82F6",
            },
          ],
        };

        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ChartCard title="Inventory Status">
              <Pie data={statusData} options={baseChartOptions} />
            </ChartCard>
            <ChartCard title="Inventory by Category">
              <Bar data={categoryData} options={baseChartOptions} />
            </ChartCard>
          </div>
        );
      }

      case "work-orders": {
        const technicianData: ChartData = {
          labels: Object.keys(report.data.byTechnician),
          datasets: [
            {
              label: "Work Orders Completed",
              data: toNumberArray(report.data.byTechnician),
              backgroundColor: "#3B82F6",
            },
          ],
        };

        return (
          <div className="grid grid-cols-1 gap-6">
            <ChartCard title="Work Orders by Technician">
              <Bar data={technicianData} options={baseChartOptions} />
            </ChartCard>
          </div>
        );
      }

      case "cost-analysis": {
        const costData: ChartData = {
          labels: Object.keys(report.data.byCategory).map(formatLabel),
          datasets: [
            {
              label: "Cost ($)",
              data: toNumberArray(report.data.byCategory),
              backgroundColor: ["#3B82F6", "#10B981", "#F59E0B"],
            },
          ],
        };

        const costOptions: ChartOptions = {
          ...baseChartOptions,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        };

        return (
          <div className="grid grid-cols-1 gap-6">
            <ChartCard title="Costs by Category">
              <Bar data={costData} options={costOptions} />
            </ChartCard>
          </div>
        );
      }

      default:
        return null;
    }
  };

  // Add this reusable ChartCard component
  const ChartCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
      <h3 className="font-bold text-lg mb-4">{title}</h3>
      {children}
    </div>
  );

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
                  <div className="rounded-lg flex items-center space-x-3">
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
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiBarChart2 className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Reports</h2>
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
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
              <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {/* Header and Actions */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports Dashboard</h1>
              <p className="text-gray-600 mt-1">Generate, view and analyze maintenance reports</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setShowGenerateReportModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiPlus className="text-lg" />
                <span className="font-semibold">Generate Report</span>
              </motion.button>

              <motion.button
                onClick={() => alert("Export all reports functionality")}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiDownload className="text-lg" />
                <span className="font-semibold">Export All</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <FiFilter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
              </motion.button>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Reports" value={reports.length.toString()} change="+12%" icon={<FiBarChart2 />} />
            <StatCard title="Maintenance" value={reports.filter((r) => r.type === "maintenance").length.toString()} change="+5%" icon={<FiTool />} />
            <StatCard title="Inventory" value={reports.filter((r) => r.type === "inventory").length.toString()} change="+3%" icon={<FiPackage />} />
            <StatCard title="Cost Analysis" value={reports.filter((r) => r.type === "cost-analysis").length.toString()} change="+2" icon={<FiDollarSign />} />
          </div>

          {/* Search and Filters */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search reports by title or ID..."
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <AnimatePresence>
                {showAdvancedFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto"
                  >
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value as ReportType | "all")}
                    >
                      <option value="all">All Types</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="inventory">Inventory</option>
                      <option value="work-orders">Work Orders</option>
                      <option value="cost-analysis">Cost Analysis</option>
                    </select>

                    <select
                      className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value as TimeRange | "all")}
                    >
                      <option value="all">All Time Ranges</option>
                      <option value="7-days">Last 7 Days</option>
                      <option value="30-days">Last 30 Days</option>
                      <option value="90-days">Last 90 Days</option>
                      <option value="custom">Custom</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* Reports Grid */}
          {filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentReports.map((report) => (
                <ReportCard key={report.id} report={report} onView={handleViewReport} onExport={handleExportReport} />
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm p-10 text-center border border-blue-100">
              <FiBarChart2 className="mx-auto text-4xl text-gray-400 mb-4" />
              <h3 className="text-xl font-medium text-gray-900 mb-2">No reports found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your search or filters</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowGenerateReportModal(true)}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <FiPlus className="mr-2" />
                Generate New Report
              </motion.button>
            </div>
          )}

          {/* Pagination */}
          {filteredReports.length > reportsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstReport + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastReport, filteredReports.length)}</span> of{" "}
                <span className="font-semibold">{filteredReports.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => paginate(i + 1)}
                    className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm
                      ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
                    `}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {/* Generate Report Modal */}
      {showGenerateReportModal && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
              <h3 className="text-2xl font-bold text-gray-900">Generate New Report</h3>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowGenerateReportModal(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                <FiX />
              </motion.button>
            </div>

            <div className="space-y-4">
              <div>
                <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Title
                </label>
                <input
                  type="text"
                  id="report-title"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={reportTitle}
                  onChange={(e) => setReportTitle(e.target.value)}
                  placeholder="Monthly Maintenance Summary"
                />
              </div>

              <div>
                <label htmlFor="report-type" className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  id="report-type"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                >
                  <option value="maintenance">Maintenance</option>
                  <option value="inventory">Inventory</option>
                  <option value="work-orders">Work Orders</option>
                  <option value="cost-analysis">Cost Analysis</option>
                </select>
              </div>

              <div>
                <label htmlFor="time-range" className="block text-sm font-medium text-gray-700 mb-1">
                  Time Range
                </label>
                <select
                  id="time-range"
                  className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
                  value={reportTimeRange}
                  onChange={(e) => setReportTimeRange(e.target.value as TimeRange)}
                >
                  <option value="7-days">Last 7 Days</option>
                  <option value="30-days">Last 30 Days</option>
                  <option value="90-days">Last 90 Days</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowGenerateReportModal(false)}
                className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleGenerateReport}
                className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Generate Report
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-auto p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">{selectedReport.title}</h3>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(selectedReport.generatedAt).toLocaleString()} | Time Range:{" "}
                  {selectedReport.timeRange
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setSelectedReport(null)} className="text-gray-500 hover:text-gray-700 text-2xl">
                <FiX />
              </motion.button>
            </div>

            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <h4 className="text-lg font-semibold text-gray-900">Report Summary</h4>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleExportReport(selectedReport.id)}
                    className="flex items-center space-x-1 px-3 py-1.5 border border-blue-200 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <FiDownload className="text-sm" />
                    <span>Export</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => alert("Print functionality would go here")}
                    className="flex items-center space-x-1 px-3 py-1.5 border border-blue-200 rounded-lg bg-white text-gray-600 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <FiPrinter className="text-sm" />
                    <span>Print</span>
                  </motion.button>
                </div>
              </div>

              {renderReportVisualization(selectedReport)}

              <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Key Metrics</h4>
                  <div className="space-y-3">
                    {Object.entries(selectedReport.data).map(([key, value]) => {
                      if (typeof value !== "object" || value === null) {
                        return (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">
                              {key
                                .split("-")
                                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                                .join(" ")}
                              :
                            </span>
                            <span className="font-medium">{typeof value === "number" && key.toLowerCase().includes("cost") ? `$${value.toFixed(2)}` : String(value)}</span>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow border border-blue-100">
                  <h4 className="font-semibold text-gray-900 mb-3">Report Details</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Report ID:</span>
                      <span className="font-medium">{selectedReport.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium">
                        {selectedReport.type
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Generated:</span>
                      <span className="font-medium">{new Date(selectedReport.generatedAt).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time Range:</span>
                      <span className="font-medium">
                        {selectedReport.timeRange
                          .split("-")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedReport(null)}
                className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                Close
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

export default ReportsDashboard;
