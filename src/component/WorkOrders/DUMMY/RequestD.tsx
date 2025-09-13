import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../Sidebar";
import {
  Plus,
  Upload,
  ChevronUp,
  AlertTriangle,
  Wrench,
  CheckCircle,
  Clipboard,
  Filter,
  X,
  ChevronDown,
  ChevronRight,
  Search,
  LogOut,
  Sun,
  Moon,
  Settings,
  Bell,
  Edit,
  Eye,
  Clock,
  Calendar,
  Trash2,
  User as UserIcon,
  Printer,
} from "lucide-react";

type Department = {
  id: number;
  name: string;
};

type User = {
  id: number;
  name: string;
  department?: Department;
  role?: string;
};

type WorkOrder = {
  id: number;
  work_order_no: string;
  date: string;
  complaint: string;
  device_info?: string;
  asset_no?: string;
  service_type?: { id: number; name: string } | null;
  service?: { id: number; name: string } | null;
  reception_method?: string | null;
  requester: User;
  department?: Department | null;
  known_by?: User | null;
  handling_status: string;
  resolved_confirmed?: boolean; // Tambahkan ini
  assigned_to?: User | null;
  assigned_to_id?: string | number | null;
  handling_date?: string | null;
  action_taken?: string | null;
  attachment?: string | null;
  work_order_extra?: Record<string, any> | null;
};

type WorkOrderCreate = {
  complaint: string;
  department: Department;
  requester: User;
  device_info?: string;
  asset_no?: string;
};

const STORAGE_KEY = "workorders.it.v5";

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

const seedData = (): { workOrders: WorkOrder[]; users: User[] } => {
  const users: User[] = [
    { id: 1, name: "Alice Johnson", department: { id: 1, name: "IT" }, role: "staff" },
    { id: 2, name: "Bob Santoso", department: { id: 2, name: "Operations" }, role: "staff" },
  ];
  const now = new Date();
  const workOrders: WorkOrder[] = [
    {
      id: 1,
      work_order_no: "WO-2025-0001",
      date: now.toISOString(),
      complaint: "Laptop not booting",
      device_info: "Dell Latitude 5490",
      asset_no: "AS-0123",
      service_type: { id: 1, name: "Hardware" },
      service: { id: 1, name: "Repair" },
      reception_method: "Electronic Work Order System",
      requester: users[0],
      department: users[0].department,
      known_by: users[1],
      handling_status: "New",
      resolved_confirmed: false, // Tambahkan ini
      assigned_to: null,
      assigned_to_id: null,
      handling_date: null,
      action_taken: null,
      attachment: null,
      work_order_extra: null,
    },
    {
      id: 2,
      work_order_no: "WO-2025-0002",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      complaint: "Email not syncing",
      device_info: "Charger Laptop",
      asset_no: "AS-0456",
      service_type: { id: 2, name: "Software" },
      service: { id: 2, name: "Support" },
      reception_method: "Electronic Work Order System",
      requester: users[1],
      department: users[1].department,
      known_by: users[0],
      handling_status: "In Progress",
      resolved_confirmed: false, // Tambahkan ini
      assigned_to: users[0],
      assigned_to_id: users[0].id,
      handling_date: null,
      action_taken: "Checked IMAP settings",
      attachment: null,
      work_order_extra: null,
    },
    {
      id: 3,
      work_order_no: "WO-2025-0003",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      complaint: "Email not syncing",
      device_info: "Kabel",
      asset_no: "AS-0456",
      service_type: { id: 1, name: "Hardware" },
      service: { id: 2, name: "Support" },
      reception_method: "Electronic Work Order System",
      requester: users[1],
      department: users[1].department,
      known_by: users[0],
      handling_status: "Escalated",
      resolved_confirmed: false, // Tambahkan ini
      assigned_to: users[0],
      assigned_to_id: users[0].id,
      handling_date: null,
      action_taken: "Checked IMAP settings",
      attachment: null,
      work_order_extra: null,
    },
    {
      id: 4,
      work_order_no: "WO-2025-0004",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      complaint: "Email not syncing",
      device_info: "PC",
      asset_no: "AS-0456",
      service_type: { id: 1, name: "Hardware" },
      service: { id: 2, name: "Support" },
      reception_method: "Electronic Work Order System",
      requester: users[1],
      department: users[1].department,
      known_by: users[0],
      handling_status: "Resolved",
      resolved_confirmed: true, // Tambahkan ini
      assigned_to: users[0],
      assigned_to_id: users[0].id,
      handling_date: null,
      action_taken: "Checked IMAP settings",
      attachment: null,
      work_order_extra: null,
    },
    {
      id: 5,
      work_order_no: "WO-2025-0005",
      date: new Date(now.getTime() - 1000 * 60 * 60 * 24).toISOString(),
      complaint: "Email not syncing",
      device_info: "PC",
      asset_no: "AS-0456",
      service_type: { id: 1, name: "Hardware" },
      service: { id: 2, name: "Support" },
      reception_method: "Electronic Work Order System",
      requester: users[1],
      department: users[1].department,
      known_by: users[0],
      handling_status: "Closed",
      resolved_confirmed: true, // Tambahkan ini
      assigned_to: users[0],
      assigned_to_id: users[0].id,
      handling_date: null,
      action_taken: "Checked IMAP settings",
      attachment: null,
      work_order_extra: null,
    },
  ];
  return { workOrders, users };
};

const readStorage = (): { workOrders: WorkOrder[]; users: User[] } => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ workOrders: seeded.workOrders, users: seeded.users }));
      return { workOrders: seeded.workOrders, users: seeded.users };
    }
    const parsed = JSON.parse(raw);
    if (!parsed.workOrders || !Array.isArray(parsed.workOrders)) {
      const seeded = seedData();
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ workOrders: seeded.workOrders, users: seeded.users }));
      return { workOrders: seeded.workOrders, users: seeded.users };
    }
    const users = parsed.users && Array.isArray(parsed.users) ? parsed.users : [];
    return { workOrders: parsed.workOrders, users };
  } catch {
    const seeded = seedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ workOrders: seeded.workOrders, users: seeded.users }));
    return { workOrders: seeded.workOrders, users: seeded.users };
  }
};

const persistStorage = (workOrders: WorkOrder[], users: User[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ workOrders, users }));
};

const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
  await delay(250 + Math.floor(Math.random() * 150));
  const { workOrders } = readStorage();
  return workOrders;
};

const fetchUsers = async (): Promise<User[]> => {
  await delay(200 + Math.floor(Math.random() * 200));
  const { users } = readStorage();
  return users;
};

const createWorkOrder = async (payload: WorkOrderCreate): Promise<WorkOrder> => {
  await delay(250 + Math.floor(Math.random() * 150));
  const { workOrders, users } = readStorage();
  const maxId = workOrders.reduce((m, w) => (w.id > m ? w.id : m), 0);
  const id = maxId + 1;
  const now = new Date().toISOString();
  const work_order_no = `WO-${new Date().getFullYear()}-${String(id).padStart(4, "0")}`;
  const newOrder: WorkOrder = {
    id,
    work_order_no,
    date: now,
    complaint: payload.complaint,
    device_info: payload.device_info || "",
    asset_no: payload.asset_no || "",
    service_type: null,
    service: null,
    reception_method: "Electronic Work Order System",
    requester: payload.requester,
    department: payload.department,
    known_by: null,
    handling_status: "New",
    assigned_to: null,
    assigned_to_id: null,
    handling_date: null,
    action_taken: null,
    attachment: null,
    work_order_extra: null,
  };
  const updated = [newOrder, ...workOrders];
  persistStorage(updated, users);
  return newOrder;
};

const updateWorkOrderById = async (id: number, patch: Partial<WorkOrder>): Promise<WorkOrder> => {
  await delay(200 + Math.floor(Math.random() * 200));
  const { workOrders, users } = readStorage();
  const idx = workOrders.findIndex((w) => w.id === id);
  if (idx === -1) {
    throw new Error("Work order not found");
  }
  const updated = { ...workOrders[idx], ...patch };
  const updatedList = [...workOrders];
  updatedList[idx] = updated;
  persistStorage(updatedList, users);
  return updated;
};

const deleteWorkOrderById = async (id: number): Promise<void> => {
  await delay(200 + Math.floor(Math.random() * 200));
  const { workOrders, users } = readStorage();
  const updated = workOrders.filter((w) => w.id !== id);
  persistStorage(updated, users);
};

const WorkOrderDetails: React.FC<{ order: WorkOrder; onClose: () => void }> = ({ order, onClose }) => {
  const displayValue = (value: any): string => {
    if (value === null || value === undefined) return "-";
    if (typeof value === "object" && value !== null) {
      return value.name || value.title || value.id || "-";
    }
    if (typeof value === "string") {
      return value.trim() !== "" ? value.trim() : "-";
    }
    if (typeof value === "number") {
      return value.toString();
    }
    return String(value);
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const DetailItem: React.FC<{ label: string; value: string }> = ({ label, value }) => (
    <div className="flex flex-col">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{label}</h4>
      <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{value}</p>
    </div>
  );

  const SectionTitle: React.FC<{ title: string }> = ({ title }) => <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200 mt-6 first:mt-0">{title}</h3>;

  return (
    <div className="space-y-6">
      <SectionTitle title="General Information" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <DetailItem label="Work Order No" value={displayValue(order.work_order_no)} />
        <DetailItem label="Date" value={formatDate(order.date)} />
        <DetailItem label="Reception Method" value={displayValue(order.reception_method)} />
        <DetailItem label="Requester" value={displayValue(order.requester?.name)} />
        <DetailItem label="Department" value={displayValue(order.department?.name)} />
        <DetailItem label="Known By" value={displayValue(order.known_by?.name)} />
      </div>

      <SectionTitle title="Service Details" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailItem label="Service Type" value={displayValue(order.service_type?.name)} />
        <DetailItem label="Service" value={displayValue(order.service?.name)} />
        <DetailItem label="No Asset" value={displayValue(order.asset_no)} />
      </div>

      <SectionTitle title="Device & Complaint" />
      <div className="grid grid-cols-1 gap-4">
        <DetailItem label="Device Information" value={displayValue(order.device_info)} />
        <DetailItem label="Complaint" value={displayValue(order.complaint)} />
      </div>

      <SectionTitle title="Handling Information" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <DetailItem label="Ticket Status" value={displayValue(order.handling_status)} />
        <DetailItem label="Assigned To" value={displayValue(order.assigned_to?.name)} />
        <DetailItem label="Handling Date" value={formatDate(order.handling_date || "-")} />
        <DetailItem label="Action Taken" value={displayValue(order.action_taken)} />
      </div>

      {order.attachment && (
        <>
          <SectionTitle title="Attachment" />
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center space-x-3">
              <a href={order.attachment} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                View Attachment
              </a>
            </div>
          </div>
        </>
      )}

      <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
        <motion.button
          type="button"
          onClick={onClose}
          whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.97 }}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
        >
          Close
        </motion.button>
      </div>
    </div>
  );
};

const ITRequest: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
  const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formComplaint, setFormComplaint] = useState("");
  const [formDepartment, setFormDepartment] = useState<Department | null>(null);
  const [formDeviceInfo, setFormDeviceInfo] = useState("");
  const [formAssetNo, setFormAssetNo] = useState("");
  const [formRequester, setFormRequester] = useState<User | null>(null);

  const navigate = useNavigate();
  const location = useLocation();
  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const currentUser: User = { id: 99, name: "Current User", department: { id: 1, name: "IT" }, role: "staff" };

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
    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const [fetchedOrders, fetchedUsers] = await Promise.all([fetchWorkOrders(), fetchUsers()]);
        const usersWithCurrent = fetchedUsers.find((u) => u.id === currentUser.id) ? fetchedUsers : [currentUser, ...fetchedUsers];
        setUsers(usersWithCurrent);
        setWorkOrders(fetchedOrders);
      } catch (err) {
        setError("Failed to load work orders. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    setFormRequester(currentUser);
    setFormDepartment(currentUser.department || { id: 0, name: "Unknown" });
  }, []);

  useEffect(() => {
    setCurrentPage(1);
    document.documentElement.classList.toggle("dark", darkMode);
  }, [searchQuery, statusFilter, priorityFilter, sidebarOpen, darkMode]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New":
        return "bg-gray-500 text-white";
      case "Assigned":
        return "bg-blue-600 text-white";
      case "In Progress":
        return "bg-cyan-500 text-white";
      case "Escalated":
        return "bg-purple-500 text-white";
      case "Vendor Handled":
        return "bg-red-500 text-white";
      case "Resolved":
        return "bg-orange-500 text-white";
      case "Cancel":
        return "bg-gray-500 text-white";
      case "Closed":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const openWorkOrderDetails = useCallback(
    (orderId: number) => {
      const order = workOrders.find((o) => o.id === orderId);
      if (order) {
        setSelectedWorkOrder(order);
        setShowWorkOrderDetailsModal(true);
      }
    },
    [workOrders]
  );

  const handleUpdateWorkOrder = useCallback(async (id: number, patch: Partial<WorkOrder>) => {
    try {
      setLoading(true);
      setError(null);
      const updated = await updateWorkOrderById(id, patch);
      setWorkOrders((prev) => prev.map((order) => (order.id === updated.id ? updated : order)));
      // Jika Anda ingin menutup modal setelah update, Anda bisa tambahkan ini
      setShowWorkOrderDetailsModal(false);
      setSelectedWorkOrder(null);
      setIsEditing(false);
    } catch {
      setError("Failed to update work order.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCompleteWorkOrder = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        setError(null);
        const order = workOrders.find((o) => o.id === id);
        if (order) {
          const updatedOrder = await updateWorkOrderById(id, { ...order, handling_status: "Closed" });
          setWorkOrders((prev) => prev.map((o) => (o.id === id ? updatedOrder : o)));
        }
        setShowWorkOrderDetailsModal(false);
        setSelectedWorkOrder(null);
      } catch {
        setError("Failed to complete work order.");
      } finally {
        setLoading(false);
      }
    },
    [workOrders]
  );

  const handleDeleteClick = useCallback((id: number) => {
    setRecordToDelete(id);
    setShowDeleteConfirm(true);
  }, []);

  const handleDelete = useCallback(async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await deleteWorkOrderById(id);
      setWorkOrders((prev) => prev.filter((order) => order.id !== id));
      setShowDeleteConfirm(false);
      setRecordToDelete(null);
      setSuccessMessage("Work order deleted successfully.");
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch {
      setError("Failed to delete work order.");
    } finally {
      setLoading(false);
    }
  }, []);

  const handlePrintWorkOrder = useCallback((id: number) => {
    console.log(`Printing Work Order ${id}`);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const filteredWorkOrders = workOrders.filter((order: WorkOrder) => {
    const matchesSearch =
      (order.service_type?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      String(order.id).includes(searchQuery.toLowerCase()) ||
      (users.find((u) => u.id === Number(order.assigned_to_id) || u.id === order.assigned_to_id)?.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (order.device_info || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (order.complaint || "").toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.handling_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredWorkOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredWorkOrders.length / ordersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const submitCreate = async () => {
    if (!formComplaint.trim() || !formDepartment || !formRequester) return;
    try {
      setSaving(true);
      setError(null);
      const payload: WorkOrderCreate = {
        complaint: formComplaint.trim(),
        department: formDepartment,
        requester: formRequester,
        device_info: formDeviceInfo.trim(),
        asset_no: formAssetNo.trim(),
      };
      const created = await createWorkOrder(payload);
      setWorkOrders((prev) => [created, ...prev]);
      setSuccessMessage("Work order created successfully.");
      setFormComplaint("");
      setFormDeviceInfo("");
      setFormAssetNo("");
      setFormDepartment(currentUser.department || { id: 0, name: "IT" });
      setFormRequester(currentUser);
      setCreateModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 2500);
    } catch {
      setError("Failed to create work order.");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    if (successMessage) {
      const t = setTimeout(() => setSuccessMessage(null), 3000);
      return () => clearTimeout(t);
    }
  }, [successMessage]);

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
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Clipboard className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">IT Work Order - Request</h2>
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
                      {filteredWorkOrders.slice(0, 3).map((order) => (
                        <div key={order.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
                          <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">
                            {order.handling_status === "Closed" ? <CheckCircle className="text-green-500" /> : order.handling_status === "Progress" ? <Wrench className="text-blue-500" /> : <AlertTriangle className="text-yellow-500" />}
                          </div>
                          <div>
                            <p className="font-medium text-sm text-gray-800">Work Order #{order.id}</p>
                            <p className="text-xs text-gray-600 mt-1">{order.requester?.name}</p>
                          </div>
                        </div>
                      ))}
                      {filteredWorkOrders.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
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
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${currentUser.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
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
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${location.pathname === "/workorders/it" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Request
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/receiver")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${location.pathname === "/workorders/it/receiver" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Receiver
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/assignment")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${location.pathname === "/workorders/it/assignment" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Assignment
            </motion.div>
            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/reports")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${location.pathname === "/workorders/it/reports" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"} transition-colors duration-200`}
            >
              Reports
            </motion.div>

            <motion.div
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/workorders/it/knowledgebase")}
              className={`cursor-pointer px-4 py-3 text-sm font-medium ${
                location.pathname === "/workorders/it/knowledgebase" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-700 hover:text-gray-900"
              } transition-colors duration-200`}
            >
              Knowledge Base
            </motion.div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">IT Request</h1>
              <p className="text-gray-600 mt-1">Submit and track your IT-related maintenance and service requests</p>
            </div>

            <div className="flex flex-wrap gap-3">
              <motion.button
                onClick={() => setCreateModalOpen(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Plus className="text-lg" />
                <span className="font-semibold">Create New Work Order</span>
              </motion.button>

              <motion.button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <Filter className="text-lg" />
                <span className="font-semibold">Filters</span>
                {showAdvancedFilters ? <ChevronUp /> : <ChevronDown />}
              </motion.button>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
              >
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Total IT Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredWorkOrders.length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
                    <Clipboard />
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-green-600">+8% from last month</p>
              </motion.div>
            </div>

            <div>
              <motion.div
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">Pending IT</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredWorkOrders.filter((wo) => wo.handling_status === "New").length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
                    <Clock />
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-green-600">+3 from last month</p>
              </motion.div>
            </div>

            <div>
              <motion.div
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">IT Progress</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredWorkOrders.filter((wo) => wo.handling_status === "Progress").length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
                    <Wrench />
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-red-600">-1 from last month</p>
              </motion.div>
            </div>

            <div>
              <motion.div
                className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex items-center justify-between z-10 relative">
                  <div>
                    <p className="text-sm font-medium text-gray-500 mb-1">IT Closed</p>
                    <p className="text-3xl font-bold text-gray-900">{filteredWorkOrders.filter((wo) => wo.handling_status === "Closed").length}</p>
                  </div>
                  <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">
                    <CheckCircle />
                  </div>
                </div>
                <p className="mt-3 text-xs font-semibold text-green-600">+5 from last month</p>
              </motion.div>
            </div>
          </div>

          <motion.div layout className="mb-6 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search IT requests by device, ID, or assignee..."
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
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
                      className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
                        backgroundSize: "1.2rem",
                      }}
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="all">All Statuses</option>
                      <option value="New">New</option>
                      <option value="Assigned">Assigned</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Escalated">Escalated</option>
                      <option value="Vendor Handled">Vendor Handled</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Cancel">Cancel</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-100">
                <thead className="bg-blue-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Device Information</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No Asset</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Type</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Ticket Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <motion.tr
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{order.id}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{new Date(order.date).toLocaleDateString()}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.device_info}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.asset_no}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{order.service_type?.name || "N/A"}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(order.handling_status)} shadow-sm`}>{order.handling_status}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.assigned_to?.name || "Unassigned"}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                          {/* Tombol View (Eye) selalu tersedia untuk semua status */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openWorkOrderDetails(order.id)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                            title="View Details"
                          >
                            <Eye className="text-lg" />
                          </motion.button>

                          {/* Kondisi untuk tombol Edit dan Delete - hanya jika status 'New' */}
                          {order.handling_status === "New" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/workorders/editworkorder/${order.id}`)}
                                className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Edit Work Order"
                              >
                                <Edit className="text-lg" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDeleteClick(order.id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Delete Work Order"
                              >
                                <Trash2 className="text-lg" />
                              </motion.button>
                            </>
                          )}

                          {/* Kondisi untuk tombol "Mark as Closed" atau "Cancel" - hanya jika status "Resolved" */}
                          {order.handling_status === "Resolved" && (
                            <>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdateWorkOrder(order.id, { handling_status: "Closed" })} // Gunakan fungsi untuk update status
                                className="text-green-600 hover:text-green-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Mark as Closed"
                              >
                                <CheckCircle className="text-lg" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleUpdateWorkOrder(order.id, { handling_status: "Cancel" })} // Gunakan fungsi untuk update status
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Cancel Work Order"
                              >
                                <X className="text-lg" />
                              </motion.button>
                            </>
                          )}
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="px-6 py-10 text-center text-gray-600 text-lg">
                        No IT work order requests found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {filteredWorkOrders.length > ordersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                Showing <span className="font-semibold">{indexOfFirstOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastOrder, filteredWorkOrders.length)}</span> of{" "}
                <span className="font-semibold">{filteredWorkOrders.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                          ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-gray-200"}
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
                  className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
        </main>
      </div>

      {selectedWorkOrder && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-auto p-6 border border-blue-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Work Order Details #{selectedWorkOrder.id}</h3>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => {
                    setShowWorkOrderDetailsModal(false);
                    setSelectedWorkOrder(null);
                    setIsEditing(false);
                  }}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  <X size={24} />
                </motion.button>
              </div>
              <div className="overflow-y-auto max-h-[70vh]">
                <WorkOrderDetails
                  order={selectedWorkOrder}
                  onClose={() => {
                    setShowWorkOrderDetailsModal(false);
                    setSelectedWorkOrder(null);
                    setIsEditing(false);
                  }}
                />
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto p-6 border border-blue-100">
              <div className="space-y-5 text-center py-3">
                <AlertTriangle className="text-red-500 text-5xl mx-auto animate-pulse" />
                <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this record? This action cannot be undone.</p>
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {createModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div initial={{ scale: 0.98, y: 10 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.98, y: 10 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl mx-auto p-6 border border-blue-100">
              <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900">Create Work Order</h3>
                <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setCreateModalOpen(false)} className="text-gray-500 hover:text-gray-700 text-2xl">
                  <X size={24} />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Complaint</label>
                  <textarea value={formComplaint} onChange={(e) => setFormComplaint(e.target.value)} className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" rows={3} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Department</label>
                    <select
                      value={formDepartment?.id || ""}
                      onChange={(e) => {
                        const opt = users.find((u) => u.department && String(u.department.id) === e.target.value);
                        if (opt && opt.department) setFormDepartment(opt.department);
                      }}
                      className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value={formDepartment?.id || ""}>{formDepartment?.name || "Select department"}</option>
                      {Array.from(new Map(users.map((u) => [u.department?.id, u.department])).values()).map(
                        (d) =>
                          d && (
                            <option key={d.id} value={d.id}>
                              {d.name}
                            </option>
                          )
                      )}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700">Requester</label>
                    <select
                      value={formRequester?.id || ""}
                      onChange={(e) => {
                        const u = users.find((u) => String(u.id) === e.target.value);
                        if (u) setFormRequester(u);
                      }}
                      className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {users.map((u) => (
                        <option key={u.id} value={u.id}>
                          {u.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700">Device Information</label>
                    <input value={formDeviceInfo} onChange={(e) => setFormDeviceInfo(e.target.value)} className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">Asset No</label>
                    <input value={formAssetNo} onChange={(e) => setFormAssetNo(e.target.value)} className="w-full mt-2 p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCreateModalOpen(false)}
                    className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={submitCreate}
                    disabled={!formComplaint.trim() || !formDepartment || !formRequester || saving}
                    className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? "Saving..." : "Submit Work Order"}
                  </motion.button>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}
                {successMessage && <p className="text-sm text-green-600">{successMessage}</p>}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {successMessage && <div className="fixed bottom-6 right-6 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">{successMessage}</div>}
    </div>
  );
};

export default ITRequest;
