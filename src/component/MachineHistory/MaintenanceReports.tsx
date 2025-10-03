import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth, MachineHistoryRecord } from "../../routes/AuthContext";
import Sidebar from "../../component/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Clipboard, Clock, Wrench, CheckCircle, BarChart2, TrendingUp, Settings, Bell, ChevronDown, ChevronRight, Moon, Sun, UserIcon, Info, AlertTriangle, Calendar, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";

// Utility function to convert duration in minutes, copied from Maintenance.tsx
const convertDurationInMinutes = (startHour: number | null | undefined, startMinute: number | null | undefined, stopHour: number | null | undefined, stopMinute: number | null | undefined): number | null => {
  if (startHour === null || startHour === undefined || startMinute === null || startMinute === undefined || stopHour === null || stopHour === undefined || stopMinute === null || stopMinute === undefined) {
    return null;
  }

  const startTimeInMinutes = startHour * 60 + startMinute;
  const stopTimeInMinutes = stopHour * 60 + stopMinute;

  let diff = Math.abs(stopTimeInMinutes - startTimeInMinutes);

  if (diff > 720) {
    // If difference is more than 12 hours, assume it spans across midnight
    diff = 1440 - diff; // 1440 minutes in 24 hours
  }

  return diff;
};

// Utility function to convert minutes to hours and minutes, copied from Maintenance.tsx
const convertMinutesToHoursAndMinutes = (totalMinutes: number | null | undefined): string => {
  if (totalMinutes === null || totalMinutes === undefined || isNaN(totalMinutes) || totalMinutes < 0) {
    return "-";
  }

  // Round to 2 decimal places
  const roundedMinutes = Math.round(totalMinutes * 100) / 100;

  const hours = Math.floor(roundedMinutes / 60);
  const minutes = roundedMinutes % 60;

  if (roundedMinutes === 0) {
    return "0min";
  }

  if (hours === 0 && minutes > 0) {
    return `${minutes.toFixed(2)}min`;
  }

  if (hours > 0 && minutes === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${minutes.toFixed(2)}min`;
};
// StatCard component, copied from Maintenance.tsx
interface StatCardProps {
  title: string;
  value: string;
  change?: string; // Made optional as not all stats might have a 'change'
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
  const isPositive = change?.startsWith("+");

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
      {change && <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last month</p>}
    </motion.div>
  );
};

// NotificationItem interface and dummy data, copied from Maintenance.tsx
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Peringatan Mesin A",
    description: "Suhu mesin A melebihi batas normal.",
    date: "Today, 10:00 AM",
    icon: <AlertTriangle className="text-red-500" />,
  },
  {
    id: 2,
    title: "Jadwal Perawatan Mendatang",
    description: "Perawatan rutin untuk Mesin B akan dilakukan besok.",
    date: "Yesterday, 03:00 PM",
    icon: <Calendar className="text-blue-500" />,
  },
];

const MachineHistoryReports: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [records, setRecords] = useState<MachineHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, getMachineHistories } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Refs for closing dropdowns on outside click
  const notificationsRef = React.useRef<HTMLDivElement>(null);
  const profileRef = React.useRef<HTMLDivElement>(null);

  const isRecord = location.pathname === "/machinehistory";
  const isReports = location.pathname === "/machinehistory/reports";

  // Fetch machine history data
  useEffect(() => {
    const fetchRecords = async () => {
      setLoading(true);
      try {
        const data = await getMachineHistories();
        setRecords(data || []);
      } catch (err) {
        console.error("Failed to fetch machine history for reports:", err);
        setError("Failed to load machine history data for reports.");
        setRecords([]);
      } finally {
        setLoading(false);
      }
    };
    fetchRecords();
  }, [getMachineHistories]);

  // Handle window resize for mobile responsiveness
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

  // Handle clicks outside notification and profile menus to close them
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

  // Toggle sidebar for mobile
  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  // --- Analytics Calculations ---

  // 1. Total Maintenance Events
  const totalMaintenanceEvents = useMemo(() => {
    return records.length;
  }, [records]);

  // 2. Most Frequently Maintained Machines (top 3)
  const mostFrequentMachines = useMemo(() => {
    const machineCounts: { [key: string]: number } = {};
    records.forEach((record) => {
      if (record.mesin) {
        machineCounts[record.mesin] = (machineCounts[record.mesin] || 0) + 1;
      }
    });

    return Object.entries(machineCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 3)
      .map(([name, count]) => ({ name, count }));
  }, [records]);

  // 3. Average Downtime per Machine
  // 3. Average Downtime per Machine
  const averageDowntimePerMachine = useMemo(() => {
    const machineDowntimes: { [key: string]: { totalMinutes: number; count: number } } = {};

    records.forEach((record) => {
      if (record.mesin) {
        const downtime = convertDurationInMinutes(record.stopJam, record.stopMenit, record.startJam, record.startMenit);
        if (downtime !== null) {
          if (!machineDowntimes[record.mesin]) {
            machineDowntimes[record.mesin] = { totalMinutes: 0, count: 0 };
          }
          machineDowntimes[record.mesin].totalMinutes += downtime;
          machineDowntimes[record.mesin].count += 1;
        }
      }
    });

    return Object.entries(machineDowntimes).map(([name, data]) => {
      const average = data.count > 0 ? data.totalMinutes / data.count : 0;
      const roundedAverage = Math.round(average * 100) / 100; // Round to 2 decimal places

      return {
        name,
        averageDowntimeMinutes: roundedAverage,
        displayDowntime: convertMinutesToHoursAndMinutes(roundedAverage),
      };
    });
  }, [records]);

  // 4. Trend of Maintenance per Month (BarChart or LineChart)
  const maintenanceTrendData = useMemo(() => {
    const monthlyCounts: { [key: string]: number } = {}; // Format: YYYY-MM

    records.forEach((record) => {
      if (record.date) {
        const date = new Date(record.date);
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0"); // getMonth is 0-indexed
        const key = `${year}-${month}`;
        monthlyCounts[key] = (monthlyCounts[key] || 0) + 1;
      }
    });

    // Sort by date and format for chart
    return Object.entries(monthlyCounts)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([dateKey, count]) => {
        const [year, month] = dateKey.split("-");
        const monthName = new Date(Number(year), Number(month) - 1, 1).toLocaleString("en-US", { month: "short" });
        return {
          name: `${monthName} ${year}`,
          "Maintenance Events": count,
        };
      });
  }, [records]);

  // Pie chart data for maintenance types (Perbaikan vs Perawatan)
  const maintenanceTypeData = useMemo(() => {
    const typeCounts: { [key: string]: number } = {
      Perbaikan: 0,
      Perawatan: 0,
    };
    records.forEach((record) => {
      if (record.perbaikanPerawatan === "Perbaikan") {
        typeCounts.Perbaikan += 1;
      } else if (record.perbaikanPerawatan === "Perawatan") {
        typeCounts.Perawatan += 1;
      }
    });

    return [
      { name: "Repairs", value: typeCounts.Perbaikan },
      { name: "Maintenance", value: typeCounts.Perawatan },
    ].filter((item) => item.value > 0); // Filter out types with zero events
  }, [records]);

  const PIE_COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300"]; // Colors for Pie Chart

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
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Machine History Reports</h2>
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
                      {notifications.length > 0 ? (
                        notifications.map((notif) => (
                          <div key={notif.id} className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                            {notif.icon && <div className="flex-shrink-0 mr-3">{notif.icon}</div>}
                            <div>
                              <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                              <p className="text-xs text-gray-600 mt-1">{notif.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                      )}
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="isi style mb-6 flex space-x-6 border-b border-gray-200">
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/machinehistory")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isRecord ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Record
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/machinehistory/reports")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${isReports ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Reports
            </motion.div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              Machine History <span className="text-blue-600">Reports & Analytics</span>
            </h1>
            <p className="text-gray-600 mt-2 text-sm max-w-xl">Gain insights into machine maintenance trends, downtime, and performance.</p>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading analytics data...</p>
            </div>
          ) : records.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <Info className="text-blue-500 text-4xl mx-auto mb-4" />
              <p className="text-gray-700 text-base font-medium">No machine history records available to generate reports.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Stat Cards */}
              <StatCard title="Total Maintenance Events" value={totalMaintenanceEvents.toLocaleString("id-ID")} icon={<Clipboard />} />
              <StatCard
                title="Avg. Downtime (All Machines)"
                value={convertMinutesToHoursAndMinutes(
                  // Round to 2 decimal places
                  Math.round((records.reduce((sum, r) => sum + (convertDurationInMinutes(r.stopJam, r.stopMenit, r.startJam, r.startMenit) || 0), 0) / records.length) * 100) / 100
                )}
                icon={<Clock />}
              />
              <StatCard title="Machines Maintained" value={new Set(records.map((r) => r.mesin)).size.toLocaleString("id-ID")} icon={<Wrench />} />

              {/* Most Frequently Maintained Machines */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }} className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-blue-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <BarChart2 className="mr-2 text-blue-600" /> Most Frequently Maintained Machines
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={mostFrequentMachines} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <Tooltip
                      cursor={{ fill: "rgba(239, 246, 255, 0.7)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e7ff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "10px",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#374151" }}
                      itemStyle={{ color: "#4B5563" }}
                    />
                    <Bar dataKey="count" fill="#3B82F6" barSize={30} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {mostFrequentMachines.length === 0 && <p className="text-center text-gray-500 mt-4 text-sm">No data for most frequently maintained machines.</p>}
              </motion.div>

              {/* Maintenance Type Distribution (Pie Chart) */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 flex flex-col items-center justify-center"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <CheckCircle className="mr-2 text-blue-600" /> Maintenance Type Distribution
                </h3>
                {maintenanceTypeData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie data={maintenanceTypeData} cx="50%" cy="50%" labelLine={false} outerRadius={100} fill="#8884d8" dataKey="value" nameKey="name">
                        {maintenanceTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#fff",
                          border: "1px solid #e0e7ff",
                          borderRadius: "8px",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                          padding: "10px",
                        }}
                        labelStyle={{ fontWeight: "bold", color: "#374151" }}
                        itemStyle={{ color: "#4B5563" }}
                        formatter={(value: number, name: string) => [`${value} events`, name]}
                      />
                      <Legend layout="vertical" align="right" verticalAlign="middle" wrapperStyle={{ fontSize: "12px", color: "#6B7280" }} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-center text-gray-500 mt-4 text-sm">No data for maintenance types.</p>
                )}
              </motion.div>

              {/* Average Downtime per Machine */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }} className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 border border-blue-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Clock className="mr-2 text-blue-600" /> Average Downtime per Machine
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <BarChart data={averageDowntimePerMachine} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <YAxis tickFormatter={(value) => convertMinutesToHoursAndMinutes(value)} tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <Tooltip
                      cursor={{ fill: "rgba(239, 246, 255, 0.7)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e7ff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "10px",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#374151" }}
                      itemStyle={{ color: "#4B5563" }}
                      formatter={(value: number) => convertMinutesToHoursAndMinutes(value)}
                    />
                    <Bar dataKey="averageDowntimeMinutes" fill="#82ca9d" barSize={30} radius={[10, 10, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
                {averageDowntimePerMachine.length === 0 && <p className="text-center text-gray-500 mt-4 text-sm">No data for average downtime per machine.</p>}
              </motion.div>

              {/* Trend of Maintenance per Month */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }} className="lg:col-span-3 bg-white rounded-2xl shadow-md p-6 border border-blue-50">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="mr-2 text-blue-600" /> Maintenance Trend Over Time
                </h3>
                <ResponsiveContainer width="100%" height={350}>
                  <LineChart data={maintenanceTrendData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <YAxis allowDecimals={false} tickLine={false} axisLine={false} style={{ fontSize: "12px", fill: "#6B7280" }} />
                    <Tooltip
                      cursor={{ fill: "rgba(239, 246, 255, 0.7)" }}
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "1px solid #e0e7ff",
                        borderRadius: "8px",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        padding: "10px",
                      }}
                      labelStyle={{ fontWeight: "bold", color: "#374151" }}
                      itemStyle={{ color: "#4B5563" }}
                    />
                    <Legend wrapperStyle={{ fontSize: "12px", color: "#6B7280" }} />
                    <Line type="monotone" dataKey="Maintenance Events" stroke="#3B82F6" strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
                {maintenanceTrendData.length === 0 && <p className="text-center text-gray-500 mt-4 text-sm">No data for maintenance trend over time.</p>}
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default MachineHistoryReports;
