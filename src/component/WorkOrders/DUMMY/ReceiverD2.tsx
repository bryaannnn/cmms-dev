import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import { Plus, ChevronUp, AlertTriangle, Wrench, CheckCircle, Clipboard, Filter, X, ChevronDown, ChevronRight, Search, LogOut, Sun, Moon, Settings, Bell, Edit, Eye, Clock, Trash2, User as UserIcon, ChevronLeft } from "lucide-react";

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

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon }) => {
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
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
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

type UserLite = {
  id: number | string;
  name: string;
};

type Department = {
  name?: string;
};

export type WorkOrder = {
  id: number;
  work_order_no: string;
  applicant?: string;
  requester?: UserLite | null;
  complaint?: string;
  device_info?: string;
  department?: Department | null;
  handling_date?: string | null;
  handling_status: string;
  action_taken?: string | null;
  assigned_to?: UserLite | null;
  assigned_to_id?: number | string | null;
  received_by?: string | null;
};

const STORAGE_KEY = "workorders.it.v1";
const delay = (ms = 300) => new Promise((res) => setTimeout(res, ms));

async function fetchWorkOrders(): Promise<WorkOrder[]> {
  await delay(250);
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];

    const parsedData = JSON.parse(raw);

    // Validasi bahwa data adalah array
    if (!Array.isArray(parsedData)) {
      console.error("Data in localStorage is not an array:", parsedData);
      return [];
    }

    return parsedData;
  } catch (error) {
    console.error("Error parsing work orders from localStorage:", error);
    return [];
  }
}

async function updateWorkOrder(id: number, patch: Partial<WorkOrder>): Promise<WorkOrder> {
  await delay(250);
  const raw = localStorage.getItem(STORAGE_KEY);
  const list: WorkOrder[] = raw ? JSON.parse(raw) : [];
  const idx = list.findIndex((w) => w.id === id);
  if (idx === -1) throw new Error("Work order not found");
  const updated = { ...list[idx], ...patch };
  list[idx] = updated;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  return updated;
}

async function deleteWorkOrderLocal(id: number): Promise<void> {
  await delay(200);
  const raw = localStorage.getItem(STORAGE_KEY);
  const list: WorkOrder[] = raw ? JSON.parse(raw) : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list.filter((w) => w.id !== id)));
}

async function seedDummyData(): Promise<WorkOrder[]> {
  try {
    await delay(200);
    const seed: WorkOrder[] = [
      {
        id: 1,
        work_order_no: "IT-2025-101",
        applicant: "Dewi",
        requester: { id: 201, name: "Dewi" },
        complaint: "Monitor tidak menyala",
        device_info: 'Monitor LG 24"',
        department: { name: "IT Support" },
        handling_date: null,
        handling_status: "New",
        action_taken: null,
        assigned_to: null,
        assigned_to_id: null,
        received_by: null,
      },
      {
        id: 2,
        work_order_no: "IT-2025-102",
        applicant: "Rudi",
        requester: { id: 202, name: "Rudi" },
        complaint: "WiFi lambat",
        device_info: "Router TP-Link",
        department: { name: "Finance - IT" },
        handling_date: null,
        handling_status: "New",
        action_taken: null,
        assigned_to: null,
        assigned_to_id: null,
        received_by: null,
      },
      {
        id: 3,
        work_order_no: "IT-2025-103",
        applicant: "Sinta",
        requester: { id: 203, name: "Sinta" },
        complaint: "Laptop overheating",
        device_info: "HP EliteBook",
        department: { name: "Accounting - IT" },
        handling_date: new Date().toISOString(),
        handling_status: "New",
        action_taken: "Technician assigned",
        assigned_to: { id: 2, name: "" },
        assigned_to_id: 2,
        received_by: "Receiver User",
      },
    ];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  } catch (error) {
    console.error("Error seeding dummy data:", error);
    throw new Error("Failed to seed dummy data");
  }
}

const formatDate = (dateString: string | null | undefined) => {
  if (!dateString) return "-";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return new Intl.DateTimeFormat("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return "Invalid Date";
  }
};

const ITReceiverD: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [users, setUsers] = useState<UserLite[]>([]);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const profileRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = { id: 99, name: "Receiver User", role: "user" as "user" | "admin" | "superadmin" };
  const isRequest = location.pathname === "/workorders/it";
  const isReceiver = location.pathname === "/workorders/it/receiver";
  const isAssignment = location.pathname === "/workorders/it/assignment";
  const isReports = location.pathname === "/workorders/it/reports";
  const isKnowledgeBase = location.pathname === "/workorders/it/knowledgebase";

  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [orderToAssign, setOrderToAssign] = useState<WorkOrder | null>(null);
  const [selectedTechnician, setSelectedTechnician] = useState<string>("");

  const technicians = [
    { id: 1, name: "John Doe", department: "IT Support" },
    { id: 2, name: "Jane Smith", department: "Network Engineering" },
    { id: 3, name: "Robert Johnson", department: "Hardware Support" },
    { id: 4, name: "Sarah Wilson", department: "Software Support" },
  ];

  // Fungsi untuk mengurutkan work orders - DIPERBAIKI
  const sortWorkOrders = useCallback((orders: WorkOrder[]) => {
    return orders.sort((a, b) => {
      // Prioritas status: New > Open > Assignment > lainnya
      const statusPriority: Record<string, number> = {
        New: 1,
        Assignment: 2,
      };

      const aPriority = statusPriority[a.handling_status] || 99;
      const bPriority = statusPriority[b.handling_status] || 99;

      // Urutkan berdasarkan prioritas status (lebih kecil = lebih tinggi)
      if (aPriority !== bPriority) {
        return aPriority - bPriority;
      }

      // Jika status sama, urutkan berdasarkan ID (yang lebih baru/lebih besar di atas)
      return b.id - a.id;
    });
  }, []);

  // Fungsi untuk membuka modal assignment
  const openAssignmentModal = useCallback((order: WorkOrder) => {
    setOrderToAssign(order);
    setSelectedTechnician(order.assigned_to?.name || "");
    setShowAssignmentModal(true);
  }, []);

  // Modifikasi fungsi handleAssignOrder untuk mengurutkan ulang setelah assignment
  const handleAssignOrder = useCallback(async () => {
    if (!orderToAssign || !selectedTechnician) return;

    try {
      setLoading(true);
      const technician = technicians.find((t) => t.name === selectedTechnician);
      const updated = await updateWorkOrder(orderToAssign.id, {
        assigned_to: technician ? { id: technician.id, name: technician.name } : null,
        assigned_to_id: technician ? technician.id : null,
        handling_status: "Assignment",
      });

      // Update work orders dan urutkan ulang
      setWorkOrders((prev) => {
        const updatedOrders = prev.map((o) => (o.id === updated.id ? updated : o));
        return sortWorkOrders(updatedOrders);
      });

      setShowAssignmentModal(false);
      setFeedbackMessage("Work order assigned successfully");
    } catch {
      setError("Failed to assign work order");
    } finally {
      setLoading(false);
    }
  }, [orderToAssign, selectedTechnician, technicians, sortWorkOrders]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    // Load data
    reloadOrders();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Modifikasi fungsi reloadOrders untuk mengurutkan work orders - DIPERBAIKI
  const reloadOrders = async () => {
    try {
      setLoading(true);
      setError(null); // Reset error state

      const allOrders = await fetchWorkOrders();
      console.log("Fetched orders:", allOrders); // Debug log

      const filteredOrders = allOrders.filter((order) => {
        // Pastikan order memiliki struktur yang benar
        if (!order || typeof order !== "object") return false;

        const isITDepartment = (order.department?.name || "").toLowerCase().includes("it");
        const receiverStatus = ["New", "Assignment"].includes(order.handling_status);

        return isITDepartment && receiverStatus;
      });

      console.log("Filtered orders:", filteredOrders); // Debug log

      // Urutkan work orders
      const sortedOrders = sortWorkOrders(filteredOrders);
      setWorkOrders(sortedOrders);

      // Extract users dari data yang valid saja
      const derivedUsers: UserLite[] = [];
      allOrders.forEach((o) => {
        if (o && typeof o === "object") {
          if (o.requester && typeof o.requester === "object" && o.requester.name) {
            const existingUser = derivedUsers.find((u) => u.id === o.requester?.id);
            if (!existingUser) {
              derivedUsers.push({ id: o.requester.id, name: o.requester.name });
            }
          }
          if (o.assigned_to && typeof o.assigned_to === "object" && o.assigned_to.name) {
            const existingUser = derivedUsers.find((u) => u.id === o.assigned_to?.id);
            if (!existingUser) {
              derivedUsers.push({ id: o.assigned_to.id, name: o.assigned_to.name });
            }
          }
        }
      });

      setUsers(derivedUsers);
    } catch (error) {
      console.error("Error loading work orders:", error);
      setError("Failed to load work orders. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Cek jika localStorage tersedia
    try {
      localStorage.getItem("test");
    } catch (error) {
      setError("LocalStorage is not available in this environment.");
      return;
    }

    // Load data pertama kali
    reloadOrders();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-gray-500 text-white";
      case "Assignment":
        return "bg-blue-500 text-white";
      case "Progress":
        return "bg-yellow-500 text-white";
      case "Done":
        return "bg-green-500 text-white";
      case "Cancel":
        return "bg-red-500 text-white";
      case "Waiting Part":
        return "bg-orange-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const openWorkOrderDetails = useCallback(async (orderId: number) => {
    try {
      setLoading(true);
      const all = await fetchWorkOrders();
      const order = all.find((w) => w.id === orderId) || null;
      setSelectedWorkOrder(order);
      setShowWorkOrderDetailsModal(true);
    } catch {
      setError("Failed to fetch work order details.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Modifikasi fungsi handleReceiveOrder untuk mengurutkan ulang setelah receive
  const handleReceiveOrder = useCallback(
    async (orderId: number) => {
      try {
        setLoading(true);
        const updated = await updateWorkOrder(orderId, {
          handling_status: "New",
          received_by: currentUser.name,
          handling_date: new Date().toISOString(),
        });

        // Update work orders dan urutkan ulang
        setWorkOrders((prev) => {
          const updatedOrders = prev.map((o) => (o.id === updated.id ? updated : o));
          return sortWorkOrders(updatedOrders);
        });
      } catch {
        setError("Failed to receive order.");
      } finally {
        setLoading(false);
      }
    },
    [sortWorkOrders]
  );

  const handleDeleteClick = useCallback((id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      setLoading(true);
      await deleteWorkOrderLocal(id);
      setWorkOrders((prev) => prev.filter((o) => o.id !== id));
      setShowDeleteConfirm(false);
    } catch {
      setError("Failed to delete work order.");
    } finally {
      setLoading(false);
    }
  }, []);

  const filteredWorkOrders = workOrders.filter((order: WorkOrder) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (order.device_info || "").toLowerCase().includes(q) ||
      String(order.id).includes(q) ||
      (users.find((u) => String(u.id) === String(order.assigned_to_id))?.name || "").toLowerCase().includes(q) ||
      (order.requester?.name || "").toLowerCase().includes(q);
    const matchesStatus = statusFilter === "all" || order.handling_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.max(1, Math.ceil(filteredWorkOrders.length / ordersPerPage));
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, statusFilter, darkMode]);

  const [formState, setFormState] = useState({
    handling_date: "",
    handling_status: "Progress",
    assigned_to: "",
    action_taken: "",
  });

  useEffect(() => {
    if (selectedWorkOrder) {
      setFormState({
        handling_date: selectedWorkOrder.handling_date ? new Date(selectedWorkOrder.handling_date).toISOString().slice(0, 16) : "",
        handling_status: selectedWorkOrder.handling_status || "Progress",
        assigned_to: selectedWorkOrder.assigned_to?.name || "",
        action_taken: selectedWorkOrder.action_taken || "",
      });
      setFeedbackMessage(null);
    }
  }, [selectedWorkOrder]);

  const isFormValid = () => {
    return formState.handling_date.trim() !== "" && formState.handling_status.trim() !== "" && formState.action_taken.trim() !== "";
  };

  // Modifikasi fungsi submitForm untuk mengurutkan ulang setelah update
  const submitForm = async () => {
    if (!selectedWorkOrder) return;
    if (!isFormValid()) {
      setFeedbackMessage("Please fill required fields.");
      return;
    }
    try {
      setSaving(true);
      setFeedbackMessage(null);
      const patch: Partial<WorkOrder> = {
        handling_date: new Date(formState.handling_date).toISOString(),
        handling_status: formState.handling_status,
        action_taken: formState.action_taken,
        assigned_to: formState.assigned_to ? { id: formState.assigned_to, name: formState.assigned_to } : null,
        assigned_to_id: formState.assigned_to || null,
        received_by: selectedWorkOrder.received_by || currentUser.name,
      };
      const updated = await updateWorkOrder(selectedWorkOrder.id, patch);

      // Update work orders dan urutkan ulang
      setWorkOrders((prev) => {
        const updatedOrders = prev.map((o) => (o.id === updated.id ? updated : o));
        return sortWorkOrders(updatedOrders);
      });

      setSelectedWorkOrder(updated);
      setFeedbackMessage("Saved successfully.");
      setTimeout(() => {
        setShowWorkOrderDetailsModal(false);
      }, 600);
    } catch {
      setFeedbackMessage("Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleSeedData = async () => {
    try {
      setLoading(true);
      await seedDummyData();
      await reloadOrders();
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-blue-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-lg text-gray-700">Loading work orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-red-50">
        <AlertTriangle className="text-red-600 text-5xl" />
        <p className="ml-4 text-lg text-red-800">{error}</p>
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
              <motion.button onClick={() => setSidebarOpen(!sidebarOpen)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Work Orders - Receiver</h2>
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

            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
              >
                <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name || "User"}`} alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200 object-cover" />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{currentUser.name}</span>
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
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{currentUser.name || "Guest User"}</div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <UserIcon size={16} className="mr-2" /> Profile
                    </button>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex space-x-6 border-b border-gray-200">
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
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">IT Receiver</h1>
              <p className="text-gray-600 mt-1">Submit and track your IT-related maintenance and service requests</p>
            </div>
            <div className="flex items-center space-x-3">
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={handleSeedData} className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-semibold">
                Seed Dummy Data
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Requests" value={filteredWorkOrders.length.toString()} change="+8%" icon={<Clipboard />} />
            <StatCard title="Pending" value={filteredWorkOrders.filter((wo) => wo.handling_status === "New").length.toString()} change="+3" icon={<Clock />} />
            <StatCard title="In Progress" value={filteredWorkOrders.filter((wo) => wo.handling_status === "Progress").length.toString()} change="-1" icon={<Wrench />} />
            <StatCard title="Completed" value={filteredWorkOrders.filter((wo) => wo.handling_status === "Done").length.toString()} change="+5" icon={<CheckCircle />} />
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="relative w-full md:w-1/3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search work orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-4 w-full md:w-2/3 justify-end">
                <div className="relative w-full sm:w-auto">
                  <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="w-full sm:w-48 p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="all">All Statuses</option>
                    <option value="New">New</option>
                    <option value="Assignment">Assignment</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-3.5 text-gray-400" size={18} />
                </div>
                <motion.button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <Filter className="mr-2" size={20} /> Filters
                </motion.button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 overflow-x-auto">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Assigned Work Orders</h3>

            {currentOrders.length > 0 ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requester</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Device Info</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Handling Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.requester?.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.device_info}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.department?.name || "IT"}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.handling_status)}`}>{order.handling_status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 cursor-pointer hover:text-blue-600 hover:underline" onClick={() => openAssignmentModal(order)}>
                        {order.assigned_to?.name || "Click to assign"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => openWorkOrderDetails(order.id)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded-full hover:bg-blue-50 transition-colors duration-200"
                            title="View Details"
                          >
                            <Eye size={18} />
                          </motion.button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-10 text-gray-500">
                <Wrench className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-lg">No work orders found matching your criteria.</p>
              </div>
            )}

            {filteredWorkOrders.length > ordersPerPage && (
              <nav className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <motion.button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Previous
                  </motion.button>
                  <motion.button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Next
                  </motion.button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700">
                      Showing <span className="font-medium">{indexOfFirstOrder + 1}</span> to <span className="font-medium">{Math.min(indexOfLastOrder, filteredWorkOrders.length)}</span> of{" "}
                      <span className="font-medium">{filteredWorkOrders.length}</span> results
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <motion.button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </motion.button>
                      {[...Array(totalPages)].map((_, i) => (
                        <motion.button
                          key={i}
                          onClick={() => paginate(i + 1)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === i + 1 ? "bg-blue-600 text-white" : "bg-white text-gray-700 hover:bg-gray-50"}`}
                        >
                          {i + 1}
                        </motion.button>
                      ))}
                      <motion.button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                      >
                        <ChevronRight className="h-5 w-5" />
                      </motion.button>
                    </nav>
                  </div>
                </div>
              </nav>
            )}
          </div>
        </main>
      </div>
      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-5 text-center py-3">
          <AlertTriangle className="text-red-500 text-5xl mx-auto animate-pulse" />
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this work order?</p>
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
              onClick={() => recordToDelete !== null && handleDelete(recordToDelete)}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showWorkOrderDetailsModal} onClose={() => setShowWorkOrderDetailsModal(false)} title={`Work Order Details #${selectedWorkOrder?.id || ""}`}>
        <div>
          {selectedWorkOrder ? (
            <div className="space-y-4 max-h-[70vh] overflow-y-auto">
              {/* Grid layout untuk informasi */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* General Information */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">General Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Work Order No</span>
                      <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.work_order_no}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Date</span>
                      <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedWorkOrder.handling_date)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Reception Method</span>
                      <span className="font-semibold text-gray-800 text-sm">Electronic System</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Requester</span>
                      <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.requester?.name || selectedWorkOrder.applicant || "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Department</span>
                      <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.department?.name || "IT"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Known By</span>
                      <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.received_by || "-"}</span>
                    </div>
                  </div>
                </div>

                {/* Service Details */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Service Details</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Service Type</span>
                      <span className="font-semibold text-gray-800 text-sm">Hardware</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">Service</span>
                      <span className="font-semibold text-gray-800 text-sm">Repair</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-500">No Asset</span>
                      <span className="font-semibold text-gray-800 text-sm">AS-0123</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Device & Complaint - Full width */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Device & Complaint</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Device Information</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.device_info || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Complaint</p>
                    <p className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.complaint || "-"}</p>
                  </div>
                </div>
              </div>

              {/* Handling Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-md font-semibold text-gray-800 mb-3 border-b pb-2">Handling Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Ticket Status</span>
                    <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.handling_status || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Assigned To</span>
                    <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.assigned_to?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Handling Date</span>
                    <span className="font-semibold text-gray-800 text-sm">{formatDate(selectedWorkOrder.handling_date)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">Action Taken</span>
                    <span className="font-semibold text-gray-800 text-sm">{selectedWorkOrder.action_taken || "-"}</span>
                  </div>
                </div>
              </div>

              {/* Tombol Close untuk status selain New */}
              {selectedWorkOrder.handling_status !== "New" && (
                <div className="flex justify-end pt-2">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowWorkOrderDetailsModal(false)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 font-semibold text-sm"
                  >
                    Close
                  </motion.button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-6">
              <p className="text-gray-500">No work order selected.</p>
            </div>
          )}
        </div>
      </Modal>
      {/* Modal untuk Assignment */}
      <Modal isOpen={showAssignmentModal} onClose={() => setShowAssignmentModal(false)} title="Assign Work Order">
        <div className="space-y-4">
          {orderToAssign && (
            <>
              <div>
                <p className="text-sm text-gray-500">Work Order</p>
                <p className="font-semibold text-gray-800">{orderToAssign.work_order_no}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Device</p>
                <p className="font-semibold text-gray-800">{orderToAssign.device_info}</p>
              </div>

              <div className="flex flex-col">
                <label className="text-sm text-gray-600 mb-2">Assign to Technician</label>
                <select value={selectedTechnician} onChange={(e) => setSelectedTechnician(e.target.value)} className="p-2 border border-gray-300 rounded-md">
                  <option value="">Select Technician</option>
                  {technicians.map((tech) => (
                    <option key={tech.id} value={tech.name}>
                      {tech.name} - {tech.department}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-4">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowAssignmentModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleAssignOrder}
                  disabled={!selectedTechnician}
                  className={`px-4 py-2 rounded-md text-sm font-semibold transition-colors duration-200 ${!selectedTechnician ? "bg-gray-300 text-gray-600 cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700"}`}
                >
                  Assign
                </motion.button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default ITReceiverD;
