import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, MapPin, Star, Plus, Clock, Calendar, AlertTriangle, ClipboardList, Home, CheckSquare, BarChart3, User, ChevronLeft, ChevronRight, X, Search, Filter, ChevronDown, Eye, Edit, Trash2, Users, Package } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import Sidebar from "../../../component/Sidebar";
import PageHeader from "../../../component/PageHeader";
import { useAuth } from "../../../routes/AuthContext";

// Define useDebounce locally for self-containment
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

interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "all" | "active" | "scheduled" | "overdue";
  scheduledTime?: string;
  priority?: "low" | "medium" | "high";
  assignedTo?: string;
}

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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${maxWidth} ${className || "w-full"}`}
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

const DailyActivityDummy: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState(15);
  const [currentMonth, setCurrentMonth] = useState("July 2025");
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTab, setActiveTab] = useState<"all" | "active" | "scheduled" | "overdue">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTask, setNewTask] = useState<Omit<Task, "id">>({
    title: "",
    description: "",
    dueDate: "",
    status: "active",
    scheduledTime: "",
    priority: "medium",
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string[]>([]);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // Filter options
  const statusOptions = useMemo(
    () => [
      { value: "active", label: "Active" },
      { value: "scheduled", label: "Scheduled" },
      { value: "overdue", label: "Overdue" },
    ],
    []
  );

  const priorityOptions = useMemo(
    () => [
      { value: "high", label: "High" },
      { value: "medium", label: "Medium" },
      { value: "low", label: "Low" },
    ],
    []
  );

  // Load tasks from localStorage
  useEffect(() => {
    const stored = localStorage.getItem("ganba.todo.v1");
    if (stored) {
      setTasks(JSON.parse(stored));
    } else {
      const initialTasks: Task[] = [
        {
          id: "1",
          title: "Complete React Module",
          description: "Finish the advanced React patterns and component architecture",
          dueDate: "2025-07-15",
          status: "scheduled",
          scheduledTime: "15:00",
          priority: "high",
        },
        {
          id: "2",
          title: "Review TypeScript Basics",
          description: "Go through TypeScript fundamentals and best practices",
          dueDate: "2025-07-15",
          status: "active",
          priority: "medium",
        },
        {
          id: "3",
          title: "Submit Project Proposal",
          description: "Final project submission with all requirements",
          dueDate: "2025-07-14",
          status: "overdue",
          priority: "high",
        },
        {
          id: "4",
          title: "Team Meeting Preparation",
          description: "Prepare agenda and materials for weekly team meeting",
          dueDate: "2025-07-16",
          status: "scheduled",
          scheduledTime: "10:00",
          priority: "medium",
        },
      ];
      setTasks(initialTasks);
      localStorage.setItem("ganba.todo.v1", JSON.stringify(initialTasks));
    }
  }, []);

  // Handle window resize
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

  const saveTasks = (updatedTasks: Task[]) => {
    setTasks(updatedTasks);
    localStorage.setItem("ganba.todo.v1", JSON.stringify(updatedTasks));
  };

  const addTask = () => {
    if (!newTask.title.trim()) return;

    const task: Task = {
      ...newTask,
      id: Date.now().toString(),
    };

    saveTasks([...tasks, task]);
    setIsModalOpen(false);
    setNewTask({
      title: "",
      description: "",
      dueDate: "",
      status: "active",
      scheduledTime: "",
      priority: "medium",
    });
  };

  const deleteTask = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    saveTasks(updatedTasks);
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Filter tasks based on search, status, and priority
  const filteredTasks = useMemo(() => {
    let result = tasks.filter((task) => (activeTab === "all" ? true : task.status === activeTab));

    // Apply search filter
    if (debouncedSearchQuery.trim()) {
      const query = debouncedSearchQuery.toLowerCase();
      result = result.filter((task) => task.title.toLowerCase().includes(query) || task.description.toLowerCase().includes(query));
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((task) => statusFilter.includes(task.status));
    }

    // Apply priority filter
    if (priorityFilter.length > 0) {
      result = result.filter((task) => task.priority && priorityFilter.includes(task.priority));
    }

    return result;
  }, [tasks, activeTab, debouncedSearchQuery, statusFilter, priorityFilter]);

  const activityData = [
    { name: "Completed", value: 40, color: "#000000" },
    { name: "Learning Time", value: 25, color: "#E5E7EB" },
    { name: "Tests Passed", value: 20, color: "#FB923C" },
    { name: "Achievements", value: 15, color: "#93C5FD" },
  ];

  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const getStatusCounts = () => {
    return {
      all: tasks.length,
      active: tasks.filter((t) => t.status === "active").length,
      scheduled: tasks.filter((t) => t.status === "scheduled").length,
      overdue: tasks.filter((t) => t.status === "overdue").length,
    };
  };

  const statusCounts = getStatusCounts();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "active":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "overdue":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleStatusCheckboxChange = (statusValue: string, isChecked: boolean) => {
    if (isChecked) {
      setStatusFilter((prev) => [...prev, statusValue]);
    } else {
      setStatusFilter((prev) => prev.filter((value) => value !== statusValue));
    }
  };

  const handlePriorityCheckboxChange = (priorityValue: string, isChecked: boolean) => {
    if (isChecked) {
      setPriorityFilter((prev) => [...prev, priorityValue]);
    } else {
      setPriorityFilter((prev) => prev.filter((value) => value !== priorityValue));
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Daily Activity" mainTitleHighlight="Management" description="Manage your daily tasks and activities efficiently." icon={<ClipboardList />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Daily Activity <span className="text-blue-600">Tracker</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Effortlessly track, manage, and complete your daily tasks and activities to optimize productivity.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                onClick={() => setIsModalOpen(true)}
                whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Add Task</span>
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
            <StatCard title="Total Tasks" value={tasks.length.toString()} change="+12%" icon={<ClipboardList />} />
            <StatCard title="Active Tasks" value={statusCounts.active.toString()} change="+3" icon={<Clock />} />
            <StatCard title="Scheduled" value={statusCounts.scheduled.toString()} change="+5" icon={<Calendar />} />
            <StatCard title="Completed Today" value="8" change="+2" icon={<CheckSquare />} />
          </div>

          {/* Calendar Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8 bg-white rounded-2xl shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">{currentMonth}</h3>
              <div className="flex gap-2">
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                  <ChevronLeft size={16} className="text-gray-700" />
                </motion.button>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
                  <ChevronRight size={16} className="text-gray-700" />
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-2 mb-4">
              {daysOfWeek.map((day) => (
                <div key={day} className="text-center text-xs text-gray-500 font-medium">
                  {day}
                </div>
              ))}
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {dates.map((date) => (
                <motion.button
                  key={date}
                  onClick={() => setSelectedDate(date)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`min-w-[44px] h-12 rounded-full flex flex-col items-center justify-center transition-all ${selectedDate === date ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                >
                  <span className="text-sm font-medium">{date}</span>
                  {date === 15 && <div className="w-1 h-1 rounded-full bg-blue-400 mt-1" />}
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                    <div className="space-y-2">
                      {statusOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                            checked={statusFilter.includes(option.value)}
                            onChange={(e) => handleStatusCheckboxChange(option.value, e.target.checked)}
                          />
                          <span className="ml-2 text-gray-800 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Priority Filter */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                    <div className="space-y-2">
                      {priorityOptions.map((option) => (
                        <label key={option.value} className="flex items-center">
                          <input
                            type="checkbox"
                            className="form-checkbox h-4 w-4 text-blue-600 rounded focus:ring-blue-500 transition duration-150 ease-in-out"
                            checked={priorityFilter.includes(option.value)}
                            onChange={(e) => handlePriorityCheckboxChange(option.value, e.target.checked)}
                          />
                          <span className="ml-2 text-gray-800 text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Activity Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Activity Overview</h3>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={activityData} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={2} dataKey="value">
                        {activityData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-2">
                  {activityData.map((item, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-xs text-gray-600">{item.value}%</span>
                      <span className="text-xs text-gray-900 font-medium">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Productivity</span>
                  <span className="text-sm font-bold text-gray-900">84%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "84%" }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Focus Time</span>
                  <span className="text-sm font-bold text-gray-900">5h 22m</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "72%" }}></div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Task Completion</span>
                  <span className="text-sm font-bold text-gray-900">68%</span>
                </div>
                <div className="w-full h-2 bg-gray-200 rounded-full">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: "68%" }}></div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Task Tabs */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-gray-900">Task Management</h3>
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded-full border-2 border-white"
                    style={{
                      background: `linear-gradient(135deg, ${["#FF6B9D", "#C084FC", "#60A5FA", "#34D399"][i - 1]}, ${["#FF8FAB", "#D8B4FE", "#93C5FD", "#6EE7B7"][i - 1]})`,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("all")}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${activeTab === "all" ? "bg-blue-100 text-blue-900 border border-blue-200" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                <ClipboardList size={20} />
                <span className="text-xs font-medium mt-1">All</span>
                <span className="text-lg font-bold">{statusCounts.all}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("scheduled")}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${
                  activeTab === "scheduled" ? "bg-yellow-100 text-yellow-900 border border-yellow-200" : "bg-white text-gray-600 border border-gray-200"
                }`}
              >
                <Calendar size={20} />
                <span className="text-xs font-medium mt-1">Scheduled</span>
                <span className="text-lg font-bold">{statusCounts.scheduled}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("active")}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${activeTab === "active" ? "bg-green-100 text-green-900 border border-green-200" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                <Clock size={20} />
                <span className="text-xs font-medium mt-1">Active</span>
                <span className="text-lg font-bold">{statusCounts.active}</span>
              </motion.button>

              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setActiveTab("overdue")}
                className={`h-16 rounded-2xl flex flex-col items-center justify-center transition-all ${activeTab === "overdue" ? "bg-red-100 text-red-900 border border-red-200" : "bg-white text-gray-600 border border-gray-200"}`}
              >
                <AlertTriangle size={20} />
                <span className="text-xs font-medium mt-1">Overdue</span>
                <span className="text-lg font-bold">{statusCounts.overdue}</span>
              </motion.button>
            </div>

            {/* Task List */}
            <div className="space-y-3">
              <AnimatePresence>
                {filteredTasks.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardList className="mx-auto text-gray-400 mb-4" size={48} />
                    <p className="text-gray-500">No tasks found matching your criteria.</p>
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <motion.div
                      key={task.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="bg-white rounded-2xl p-4 border border-gray-200 hover:border-blue-200 transition-colors duration-200"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={`w-12 h-12 rounded-xl ${getStatusColor(task.status)} flex items-center justify-center flex-shrink-0`}>
                            {task.status === "scheduled" && <Calendar size={20} />}
                            {task.status === "active" && <Clock size={20} />}
                            {task.status === "overdue" && <AlertTriangle size={20} />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{task.title}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                            </div>
                            <p className="text-xs text-gray-500 mb-2">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar size={12} />
                                {task.dueDate}
                              </span>
                              {task.scheduledTime && (
                                <span className="flex items-center gap-1">
                                  <Clock size={12} />
                                  {task.scheduledTime}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50" title="View Details">
                            <Eye size={16} />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50" title="Edit">
                            <Edit size={16} />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => {
                              setTaskToDelete(task.id);
                              setShowDeleteConfirm(true);
                            }}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </main>
      </div>

      {/* Add Task Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Task" maxWidth="max-w-md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              placeholder="Enter task description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Due Date</label>
            <input
              type="date"
              value={newTask.dueDate}
              onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Scheduled Time (Optional)</label>
            <input
              type="time"
              value={newTask.scheduledTime}
              onChange={(e) => setNewTask({ ...newTask, scheduledTime: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
            <div className="grid grid-cols-3 gap-2">
              {(["high", "medium", "low"] as const).map((priority) => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, priority })}
                  className={`py-2 px-4 rounded-xl text-sm font-medium capitalize transition-all ${newTask.priority === priority ? getPriorityColor(priority) + " border-2 border-blue-500" : "bg-gray-100 text-gray-600"}`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="grid grid-cols-3 gap-2">
              {(["active", "scheduled", "overdue"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, status })}
                  className={`py-2 px-4 rounded-xl text-sm font-medium capitalize transition-all ${newTask.status === status ? getStatusColor(status) + " border-2 border-blue-500" : "bg-gray-100 text-gray-600"}`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors">
              Cancel
            </button>
            <button onClick={addTask} className="flex-1 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors">
              Save Task
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion" maxWidth="max-w-sm">
        <div className="space-y-5 text-center py-3">
          <AlertTriangle className="text-red-500 text-5xl mx-auto" />
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this task? This action cannot be undone.</p>
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
              onClick={() => taskToDelete && deleteTask(taskToDelete)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors duration-200 font-semibold text-sm"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DailyActivityDummy;
