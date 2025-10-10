import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../component/Sidebar";
import {
  Plus,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  LogOut,
  Settings,
  Bell,
  Edit,
  Eye,
  Clock,
  Calendar,
  Trash2,
  Key,
  Info,
  Moon,
  Sun,
  User as UserIcon,
  Home,
  Package,
  Clipboard,
  Database,
  BarChart2,
  Users,
  Wrench,
  CheckCircle,
  DollarSign,
  Download,
  Printer,
  PieChart,
  Filter,
  X,
  AlertTriangle,
} from "lucide-react";
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
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last period</p>
    </motion.div>
  );
};

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
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
        >
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

const ReportCard: React.FC<{ report: Report; onView: (id: string) => void; onExport: (id: string) => void }> = ({ report, onView, onExport }) => {
  const getReportIcon = () => {
    switch (report.type) {
      case "maintenance":
        return <Wrench className="text-blue-500" />;
      case "inventory":
        return <Package className="text-green-500" />;
      case "work-orders":
        return <Clipboard className="text-orange-500" />;
      case "cost-analysis":
        return <DollarSign className="text-purple-500" />;
      default:
        return <BarChart2 className="text-gray-500" />;
    }
  };

  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 rounded-full bg-blue-50 text-blue-600">{getReportIcon()}</div>
          <div>
            <h3 className="font-bold text-gray-900">{report.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{new Date(report.generatedAt).toLocaleDateString()}</p>
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
              {report.type
                .split("-")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onView(report.id)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="View Report">
            <Eye className="text-lg" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => onExport(report.id)} className="p-2 text-gray-600 hover:bg-blue-50 rounded-lg transition-colors duration-200" title="Export Report">
            <Download className="text-lg" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

const ReportsDashboard: React.FC = () => {
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
  const { user, hasPermission } = useAuth();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

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
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
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

  const renderReportVisualization = (report: Report) => {
    const baseChartOptions: ChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          display: false,
        },
      },
    };

    const toNumberArray = (obj: Record<string, unknown>): number[] => Object.values(obj).map((value) => Number(value));

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
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Work Orders by Status</h3>
              <Bar data={statusData} options={baseChartOptions} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Work Orders by Department</h3>
              <Pie data={deptData} options={baseChartOptions} />
            </div>
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
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Inventory Status</h3>
              <Pie data={statusData} options={baseChartOptions} />
            </div>
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Inventory by Category</h3>
              <Bar data={categoryData} options={baseChartOptions} />
            </div>
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
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Work Orders by Technician</h3>
              <Bar data={technicianData} options={baseChartOptions} />
            </div>
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
            <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="font-bold text-lg mb-4">Costs by Category</h3>
              <Bar data={costData} options={costOptions} />
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <BarChart2 className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Reports</h2>
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
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
                  >
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="max-h-80 overflow-y-auto custom-scrollbar">
                      <div className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mr-3">
                          <AlertTriangle className="text-red-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Maintenance Alert</p>
                          <p className="text-xs text-gray-600 mt-1">Machine A requires preventive maintenance</p>
                          <p className="text-xs text-gray-400 mt-1">Today, 10:00 AM</p>
                        </div>
                      </div>
                      <div className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                        <div className="flex-shrink-0 mr-3">
                          <Calendar className="text-blue-500" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">Scheduled Report</p>
                          <p className="text-xs text-gray-600 mt-1">Monthly maintenance report generated</p>
                          <p className="text-xs text-gray-400 mt-1">Yesterday, 03:00 PM</p>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 border-t border-gray-100 text-center">
                      <button
                        onClick={() => {
                          setShowNotificationsPopup(false);
                        }}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Mark all as read
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Reports <span className="text-blue-600">Dashboard</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Generate, view and analyze maintenance reports to optimize factory operations.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                onClick={() => setShowGenerateReportModal(true)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Generate Report</span>
              </motion.button>
              <motion.button
                onClick={() => alert("Export all reports functionality")}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
              >
                <Download className="text-base" />
                <span>Export All</span>
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Reports" value={reports.length.toString()} change="+12%" icon={<BarChart2 />} />
            <StatCard title="Maintenance" value={reports.filter((r) => r.type === "maintenance").length.toString()} change="+5%" icon={<Wrench />} />
            <StatCard title="Inventory" value={reports.filter((r) => r.type === "inventory").length.toString()} change="+3%" icon={<Package />} />
            <StatCard title="Cost Analysis" value={reports.filter((r) => r.type === "cost-analysis").length.toString()} change="+2" icon={<DollarSign />} />
          </div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search reports by title or ID..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
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
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full overflow-hidden"
                  >
                    <select
                      className="border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm appearance-none transition-all duration-200 shadow-sm cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1rem",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
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
                      className="border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm appearance-none transition-all duration-200 shadow-sm cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundSize: "1rem",
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 0.75rem center",
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

          {filteredReports.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">{searchQuery ? "No reports found matching your search." : "No reports available."}</p>
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
                  Clear Search
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentReports.map((report) => (
                <ReportCard key={report.id} report={report} onView={handleViewReport} onExport={handleExportReport} />
              ))}
            </div>
          )}

          {filteredReports.length > reportsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstReport + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastReport, filteredReports.length)}</span> of{" "}
                <span className="font-semibold">{filteredReports.length}</span> results
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

      <Modal isOpen={showGenerateReportModal} onClose={() => setShowGenerateReportModal(false)} title="Generate New Report" className="max-w-xl">
        <div className="space-y-4">
          <div>
            <label htmlFor="report-title" className="block text-sm font-medium text-gray-700 mb-1">
              Report Title
            </label>
            <input
              type="text"
              id="report-title"
              className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm transition-all duration-200"
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
              className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm transition-all duration-200"
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
              className="w-full border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm transition-all duration-200"
              value={reportTimeRange}
              onChange={(e) => setReportTimeRange(e.target.value as TimeRange)}
            >
              <option value="7-days">Last 7 Days</option>
              <option value="30-days">Last 30 Days</option>
              <option value="90-days">Last 90 Days</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-100 mt-6">
            <motion.button
              type="button"
              onClick={() => setShowGenerateReportModal(false)}
              whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-6 py-2.5 border border-gray-300 text-base font-semibold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            >
              Cancel
            </motion.button>
            <motion.button
              type="button"
              onClick={handleGenerateReport}
              whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
            >
              Generate Report
            </motion.button>
          </div>
        </div>
      </Modal>

      {selectedReport && (
        <Modal isOpen={!!selectedReport} onClose={() => setSelectedReport(null)} title={selectedReport.title} className="max-w-5xl">
          <div className="space-y-6">
            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
              <div>
                <p className="text-sm text-gray-600">
                  Generated: {new Date(selectedReport.generatedAt).toLocaleString()} | Time Range:{" "}
                  {selectedReport.timeRange
                    .split("-")
                    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                    .join(" ")}
                </p>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleExportReport(selectedReport.id)}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-blue-200 rounded-lg bg-white text-blue-600 hover:bg-blue-50 transition-colors duration-200 text-sm"
                >
                  <Download size={16} />
                  <span>Export</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => alert("Print functionality would go here")}
                  className="flex items-center space-x-1 px-3 py-1.5 border border-blue-200 rounded-lg bg-white text-gray-600 hover:bg-blue-50 transition-colors duration-200 text-sm"
                >
                  <Printer size={16} />
                  <span>Print</span>
                </motion.button>
              </div>
            </div>

            {renderReportVisualization(selectedReport)}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                <h3 className="font-bold text-lg mb-4">Key Metrics</h3>
                <div className="space-y-3">
                  {Object.entries(selectedReport.data).map(([key, value]) => {
                    if (typeof value !== "object" || value === null) {
                      return (
                        <div key={key} className="flex justify-between">
                          <span className="text-sm text-gray-600">
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

              <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                <h3 className="font-bold text-lg mb-4">Report Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Report ID:</span>
                    <span className="font-medium">{selectedReport.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Type:</span>
                    <span className="font-medium">
                      {selectedReport.type
                        .split("-")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Generated:</span>
                    <span className="font-medium">{new Date(selectedReport.generatedAt).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Time Range:</span>
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

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
              <motion.button
                type="button"
                onClick={() => setSelectedReport(null)}
                whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
              >
                Close
              </motion.button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ReportsDashboard;
