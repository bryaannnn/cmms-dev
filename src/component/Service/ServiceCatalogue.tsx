import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../component/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Filter, ChevronDown, Search, X, Bell, Moon, Sun, UserIcon, ChevronRight, Edit, Trash2, Info, Folder, Eye } from "lucide-react";
import { useAuth } from "../../routes/AuthContext";
import { useNavigate } from "react-router-dom";

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

type PriorityType = "Low" | "Medium" | "High" | "Critical";

interface ServiceCatalogue {
  id: number;
  service_name: string;
  service_description: string;
  service_type: number;
  priority: PriorityType;
  service_owner: number;
  sla: number;
  impact: string;
  created_at: string;
  updated_at: string;
}

interface ServiceGroup {
  id: number | string;
  name?: string | null;
  group_name?: string | null;
  group_description?: string | null;
}

interface User {
  id: number;
  name: string;
}

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; className?: string; children?: React.ReactNode }> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.28, type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${className || "max-w-xl w-full"}`}
          >
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
              <h2 className="text-xl font-bold text-gray-800">{title}</h2>
              <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 focus:outline-none transition-colors duration-150">
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

const StatCard: React.FC<{ title: string; currentCount: number; lastMonthCount: number; icon: React.ReactNode; usePercentage?: boolean }> = ({ title, currentCount, lastMonthCount, icon, usePercentage = true }) => {
  const calculateChange = (current: number, last: number): string => {
    if (last === 0) {
      return current > 0 ? "+100%" : "0%";
    }
    const change = ((current - last) / last) * 100;
    const sign = change >= 0 ? "+" : "";
    return `${sign}${Math.round(change)}%`;
  };

  const calculateAbsoluteChange = (current: number, last: number): string => {
    const change = current - last;
    const sign = change > 0 ? "+" : change < 0 ? "" : "+";
    return `${sign}${change}`;
  };

  const change = usePercentage ? calculateChange(currentCount, lastMonthCount) : calculateAbsoluteChange(currentCount, lastMonthCount);
  const isPositive = currentCount >= lastMonthCount;
  const changeText = usePercentage ? `${change} from last month` : `${change} from last month`;

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
          <p className="text-3xl font-bold text-gray-900">{currentCount}</p>
        </div>
        <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{icon}</div>
      </div>
      <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{changeText}</p>
    </motion.div>
  );
};

const ServiceCataloguePage: React.FC = () => {
  const auth = useAuth();
  const [sidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const navigate = useNavigate();
  const [selectedService, setSelectedService] = useState<ServiceCatalogue | null>(null);
  const openDetailModal = (s: ServiceCatalogue) => {
    setSelectedService(s);
    setShowDetailModal(true);
  };
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string | "">("");
  const [priorityFilter, setPriorityFilter] = useState<string | "">("");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<ServiceCatalogue[]>([]);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<ServiceCatalogue | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<number | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{ key: keyof ServiceCatalogue; direction: "ascending" | "descending" } | null>({
    key: "created_at",
    direction: "descending",
  });
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const loadServiceGroups = useCallback(async () => {
    try {
      const res = await auth.getServiceGroups(0);
      const normalized = (res || []).map((g: any) => {
        if (g.group_name || g.group_description) return { id: g.id, group_name: g.group_name, group_description: g.group_description, name: g.group_name || g.name };
        return { id: g.id, name: (g as any).name || null };
      });
      setGroups(normalized);
    } catch (e) {
      setGroups([]);
    }
  }, [auth]);

  const loadUsers = useCallback(async () => {
    try {
      const res = await auth.getUsers();
      const mapped = (res || []).map((u: any) => ({ id: Number(u.id), name: u.name }));
      setUsers(mapped);
    } catch {
      setUsers([]);
    }
  }, [auth]);

  const mapApiToLocal = useCallback((api: any): ServiceCatalogue => {
    return {
      id: api.id ?? 0,
      service_name: api.service_name ?? api.name ?? "",
      service_description: api.service_description ?? api.description ?? "",
      service_type: Number(api.service_type ?? api.service_type ?? 0),
      priority: (api.priority as PriorityType) ?? "Low",
      service_owner: Number(api.service_owner ?? api.service_owner ?? api.owner ?? 0),
      sla: Number(api.sla ?? api.sla ?? 0),
      impact: api.impact ?? "",
      created_at: api.created_at ?? api.createdAt ?? new Date().toISOString(),
      updated_at: api.updated_at ?? api.updatedAt ?? new Date().toISOString(),
    };
  }, []);

  const loadServices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await auth.getServices(0);
      const list = (res || []).map(mapApiToLocal);
      list.sort((a, b) => (a.created_at < b.created_at ? 1 : -1));
      setServices(list);
    } catch (e) {
      setError("Failed to load service catalogue.");
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [auth, mapApiToLocal]);

  useEffect(() => {
    let mounted = true;
    if (mounted) {
      loadServices();
      loadServiceGroups();
      loadUsers();
    }
    return () => {
      mounted = false;
    };
  }, [loadServices, loadServiceGroups, loadUsers]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
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

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const totalServices = services.length;
  const priorityCounts = useMemo(() => {
    const map: Record<PriorityType, number> = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    services.forEach((s) => {
      const p = (s.priority || "Low") as PriorityType;
      map[p] = (map[p] || 0) + 1;
    });
    return map;
  }, [services]);

  const averageSLA = useMemo(() => {
    if (services.length === 0) return 0;
    const sum = services.reduce((acc, s) => acc + (s.sla || 0), 0);
    return Math.round((sum / services.length) * 100) / 100;
  }, [services]);

  const totalOwners = useMemo(() => {
    const set = new Set<number>();
    services.forEach((s) => set.add(s.service_owner));
    return set.size;
  }, [services]);

  const lastMonthServices = useMemo(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    return services.filter((service) => {
      const serviceDate = new Date(service.created_at);
      return serviceDate < oneMonthAgo;
    });
  }, [services]);

  const clearFilters = () => {
    setGroupFilter("");
    setPriorityFilter("");
    setSearchQuery("");
  };

  const requestSort = (key: keyof ServiceCatalogue) => {
    let direction: "ascending" | "descending" = "ascending";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  const handleImportCSV = async (file: File | null) => {
    if (!file) return;
    setImporting(true);
    try {
      const text = await file.text();
      const rows = text
        .split("\n")
        .map((r) => r.trim())
        .filter(Boolean);
      const payloads: any[] = [];
      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(",").map((c) => c.trim());
        const payload = {
          service_name: cols[1] || `Imported Service ${i + 1}`,
          service_description: cols[2] || "",
          service_type: groups[0] ? Number(groups[0].id) : 0,
          priority: (cols[4] as PriorityType) || "Low",
          service_owner: users[0] ? users[0].id : 0,
          sla: Number(cols[6]) || 24,
          impact: cols[7] || "",
        };
        payloads.push(payload);
      }
      for (const p of payloads) {
        await auth.fetchWithAuth("/service-catalogues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(p),
        });
      }
      await loadServices();
      showToast("success", `Imported ${payloads.length} services`);
    } catch {
      showToast("error", "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) handleImportCSV(file);
    e.target.value = "";
  };

  const openAddModal = () => {
    setEditingService(null);
    setShowFormModal(true);
  };

  const openEditModal = (s: ServiceCatalogue) => {
    setEditingService(s);
    setShowFormModal(true);
  };

  const handleDelete = (id: number) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    setSaving(true);
    try {
      await auth.fetchWithAuth(`/service-catalogues/${serviceToDelete}`, { method: "DELETE" });
      await loadServices();
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      showToast("success", "Service deleted");
    } catch {
      showToast("error", "Failed to delete service");
    } finally {
      setSaving(false);
    }
  };

  const filteredServices = useMemo(() => {
    let list = [...services];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((s) => s.service_name.toLowerCase().includes(q) || (s.service_description || "").toLowerCase().includes(q));
    }
    if (groupFilter) {
      list = list.filter((s) => String(s.service_type) === String(groupFilter));
    }
    if (priorityFilter) {
      list = list.filter((s) => s.priority === priorityFilter);
    }
    if (sortConfig) {
      list.sort((a, b) => {
        const aVal = (a as any)[sortConfig.key];
        const bVal = (b as any)[sortConfig.key];
        if (aVal < bVal) return sortConfig.direction === "ascending" ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === "ascending" ? 1 : -1;
        return 0;
      });
    }
    return list;
  }, [services, debouncedSearch, groupFilter, priorityFilter, sortConfig]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "Critical":
        return "bg-red-500 text-white";
      case "High":
        return "bg-orange-500 text-white";
      case "Medium":
        return "bg-yellow-500 text-white";
      case "Low":
        return "bg-gray-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredServices.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.max(1, Math.ceil(filteredServices.length / recordsPerPage));

  const Form: React.FC = () => {
    const [serviceName, setServiceName] = useState(editingService?.service_name || "");
    const [description, setDescription] = useState(editingService?.service_description || "");
    const [groupId, setGroupId] = useState<number | "">((editingService?.service_type as number) || "");
    const [priority, setPriority] = useState<PriorityType>(editingService?.priority || "Low");
    const [ownerId, setOwnerId] = useState<number | "">((editingService?.service_owner as number) || (users[0] ? users[0].id : ""));
    const [slaHours, setSlaHours] = useState<number>(editingService?.sla || 24);
    const [impact, setImpact] = useState(editingService?.impact || "");
    const [formErrors, setFormErrors] = useState<{ service_name?: string; service_type?: string; priority?: string; sla?: string }>({});

    const handleSave = async () => {
      setFormErrors({});
      if (!serviceName.trim()) {
        setFormErrors({ service_name: "Service Name is required" });
        return;
      }
      if (!groupId) {
        setFormErrors((p) => ({ ...p, service_type: "Service Type is required" }));
        return;
      }
      if (!priority) {
        setFormErrors((p) => ({ ...p, priority: "Priority is required" }));
        return;
      }
      if (isNaN(Number(slaHours))) {
        setFormErrors((p) => ({ ...p, sla: "SLA must be a number" }));
        return;
      }
      setSaving(true);
      try {
        const payload = {
          service_name: serviceName.trim(),
          service_description: description.trim(),
          service_type: Number(groupId),
          priority,
          service_owner: Number(ownerId) || 0,
          sla: Number(slaHours) || 0,
          impact: impact.trim(),
        };
        if (editingService) {
          await auth.fetchWithAuth(`/service-catalogues/${editingService.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          showToast("success", "Service updated");
        } else {
          await auth.fetchWithAuth("/service-catalogues", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });
          showToast("success", "Service created");
        }
        await loadServices();
        setShowFormModal(false);
      } catch {
        showToast("error", "Save failed");
      } finally {
        setSaving(false);
      }
    };

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Service Name *</label>
            <input value={serviceName} onChange={(e) => setServiceName(e.target.value)} className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
            {formErrors.service_name && <p className="text-xs text-red-600 mt-1">{formErrors.service_name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service Type *</label>
            <select
              value={groupId}
              onChange={(e) => setGroupId(e.target.value ? Number(e.target.value) : "")}
              className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={String(g.id)} value={String(g.id)}>
                  {g.group_name ?? (g as any).name ?? String(g.id)}
                </option>
              ))}
            </select>
            {formErrors.service_type && <p className="text-xs text-red-600 mt-1">{formErrors.service_type}</p>}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Priority *</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityType)}
                className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
              {formErrors.priority && <p className="text-xs text-red-600 mt-1">{formErrors.priority}</p>}
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">SLA (hours) *</label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
              {formErrors.sla && <p className="text-xs text-red-600 mt-1">{formErrors.sla}</p>}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service Owner</label>
            <select
              value={ownerId}
              onChange={(e) => setOwnerId(e.target.value ? Number(e.target.value) : "")}
              className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
              <option value="">-- Select Owner --</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Impact</label>
            <textarea value={impact} onChange={(e) => setImpact(e.target.value)} rows={2} className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
          </div>
        </div>
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 mt-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowFormModal(false)}
            className="px-5 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </div>
    );
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <motion.div className="flex items-center space-x-3">
              <motion.div className="text-xl text-blue-600">
                <Folder />
              </motion.div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Service Catalogue</h2>
            </motion.div>
          </div>
          <div className="flex items-center space-x-3 relative">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label="Toggle theme">
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>
            <div className="relative" ref={notificationsRef}>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowNotificationsPopup((s) => !s)} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <Bell className="text-xl" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
              </motion.button>
              <AnimatePresence>
                {showNotificationsPopup && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100">
                    <div className="p-4 border-b border-gray-100">
                      <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                    </div>
                    <div className="p-4 text-sm text-gray-600">No new notifications</div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ backgroundColor: "rgba(239,246,255,0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu((s) => !s)}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=Service&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">Admin</span>
                <ChevronDown className="text-gray-500 text-base" />
              </motion.button>
              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100">
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Signed in as</div>
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">Admin</div>
                    <button className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left">
                      <UserIcon size={16} className="mr-2" /> My Profile
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Service <span className="text-blue-600">Catalogue</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Browse and manage the list of available services.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                onClick={() => navigate(`/services/servicecatalogues/addservicecatalogue`)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Add Service</span>
              </motion.button>
              <label className="flex items-center cursor-pointer">
                <input type="file" accept=".csv" onChange={handleFileInput} className="hidden" />
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
                >
                  <Upload className="text-base" />
                  <span>{importing ? "Importing..." : "Import"}</span>
                </motion.div>
              </label>
              <motion.button
                onClick={() => setShowAdvancedFilters((s) => !s)}
                whileHover={{ scale: 1.02 }}
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
            <StatCard title="Total Services" currentCount={totalServices} lastMonthCount={lastMonthServices.length} icon={<Info />} />
            <StatCard title="Critical" currentCount={priorityCounts.Critical} lastMonthCount={lastMonthServices.filter((s) => s.priority === "Critical").length} icon={<Info />} usePercentage={false} />
            <StatCard
              title="Average SLA (hrs)"
              currentCount={averageSLA}
              lastMonthCount={lastMonthServices.length > 0 ? Math.round((lastMonthServices.reduce((acc, s) => acc + (s.sla || 0), 0) / lastMonthServices.length) * 100) / 100 : 0}
              icon={<Info />}
              usePercentage={false}
            />
            <StatCard title="Total Owners" currentCount={totalOwners} lastMonthCount={new Set(lastMonthServices.map((s) => s.service_owner)).size} icon={<UserIcon />} usePercentage={false} />
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <div className="mb-4 bg-white rounded-2xl shadow-md p-4 md:p-6 border border-blue-50">
              <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                  <input
                    ref={searchInputRef}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search services by name or description..."
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
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
                        value={groupFilter}
                        onChange={(e) => setGroupFilter(e.target.value)}
                        className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
                          backgroundSize: "1.2rem",
                        }}
                      >
                        <option value="">All Groups</option>
                        {groups.map((g) => (
                          <option key={String(g.id)} value={String(g.id)}>
                            {g.group_name ?? (g as any).name ?? String(g.id)}
                          </option>
                        ))}
                      </select>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value as any)}
                        className="border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
                        style={{
                          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/svg%3E")`,
                          backgroundSize: "1.2rem",
                        }}
                      >
                        <option value="">All Priorities</option>
                        <option value="Critical">Critical</option>
                        <option value="High">High</option>
                        <option value="Medium">Medium</option>
                        <option value="Low">Low</option>
                      </select>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {loading ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
                <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
                <p className="text-gray-600 text-base font-medium">Loading service catalogue...</p>
              </div>
            ) : error ? (
              <div className="bg-white rounded-2xl shadow-md p-6 text-center border border-yellow-100">
                <Info className="text-yellow-500 text-4xl mx-auto mb-4" />
                <p className="text-gray-700 text-base font-medium">{error}</p>
                <div className="mt-4">
                  <button onClick={loadServices} className="px-4 py-2 bg-blue-600 text-white rounded-md">
                    Retry
                  </button>
                </div>
              </div>
            ) : filteredServices.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
                <Info className="text-blue-500 text-4xl mx-auto mb-4" />
                <p className="text-gray-700 text-base font-medium">{debouncedSearch || groupFilter || priorityFilter ? "No services found matching your filters." : "No services available."}</p>
                {(debouncedSearch || groupFilter || priorityFilter) && (
                  <button onClick={clearFilters} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-100">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" onClick={() => requestSort("service_name")}>
                          Service Name
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Owner</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SLA (hrs)</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Impact</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-100">
                      {currentRecords.map((s, idx) => {
                        const ownerName = users.find((u) => u.id === Number(s.service_owner))?.name ?? String(s.service_owner);
                        const groupName = groups.find((g) => String(g.id) === String(s.service_type))?.group_name ?? (groups.find((g) => String(g.id) === String(s.service_type)) as any)?.name ?? String(s.service_type);
                        return (
                          <motion.tr
                            key={s.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.2 }}
                            whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                            className="transition-colors duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{indexOfFirstRecord + idx + 1}</td>
                            <td className="px-6 py-4 text-sm font-medium text-gray-900">{s.service_name}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{groupName}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getPriorityColor(s.priority)} shadow-sm`}>{s.priority}</span>
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-700">{ownerName}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{s.sla}</td>
                            <td className="px-6 py-4 text-sm text-gray-700">{s.impact || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center space-x-2">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => openDetailModal(s)}
                                className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1"
                                title="View Details"
                              >
                                <Eye className="text-lg" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => navigate(`/services/servicecatalogues/editservicecatalogue/${s.id}`)}
                                className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Edit"
                              >
                                <Edit className="text-lg" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleDelete(s.id)}
                                className="text-red-600 hover:text-red-800 transition-colors duration-200 flex items-center space-x-1"
                                title="Delete"
                              >
                                <Trash2 className="text-lg" />
                              </motion.button>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {filteredServices.length > recordsPerPage && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div className="text-sm text-gray-600 mb-4 sm:mb-0">
                  Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredServices.length)}</span> of{" "}
                  <span className="font-semibold">{filteredServices.length}</span> results
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
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
                      onClick={() => setCurrentPage(i + 1)}
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
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                  >
                    Next
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>

      <Modal isOpen={showFormModal} onClose={() => setShowFormModal(false)} title={editingService ? "Edit Service" : "Add Service"} className="max-w-3xl">
        <Form />
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-5 text-center py-3">
          <Info className="text-red-500 text-5xl mx-auto animate-pulse" />
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this service? This action cannot be undone.</p>
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
              onClick={handleConfirmDelete}
              disabled={saving}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm disabled:opacity-60"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>

      <Modal isOpen={showDetailModal} onClose={() => setShowDetailModal(false)} title="Service Details" className="max-w-4xl">
        {selectedService && (
          <div className="space-y-6">
            {/* General Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200">General Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Service Name</h4>
                  <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{selectedService.service_name}</p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Service Type</h4>
                  <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">
                    {groups.find((g) => String(g.id) === String(selectedService.service_type))?.group_name ?? (groups.find((g) => String(g.id) === String(selectedService.service_type)) as any)?.name ?? selectedService.service_type}
                  </p>
                </div>
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Priority</h4>
                  <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-base font-medium min-h-[44px] flex items-center">
                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getPriorityColor(selectedService.priority)} shadow-sm`}>{selectedService.priority}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Service Details Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200">Service Details</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Description</h4>
                  <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{selectedService.service_description || "-"}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Service Owner</h4>
                    <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">
                      {users.find((u) => u.id === Number(selectedService.service_owner))?.name ?? selectedService.service_owner}
                    </p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">SLA (hours)</h4>
                    <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{selectedService.sla}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200">Additional Information</h3>
              <div className="grid grid-cols-1 gap-4">
                <div className="flex flex-col">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Impact</h4>
                  <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{selectedService.impact || "-"}</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Created At</h4>
                    <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{new Date(selectedService.created_at).toLocaleString()}</p>
                  </div>
                  <div className="flex flex-col">
                    <h4 className="text-sm font-medium text-gray-500 mb-1">Updated At</h4>
                    <p className="w-full bg-blue-50 border border-blue-100 rounded-lg p-3 text-gray-800 text-base font-medium min-h-[44px] flex items-center">{new Date(selectedService.updated_at).toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-6 border-t border-gray-100 mt-8">
              <motion.button
                type="button"
                onClick={() => setShowDetailModal(false)}
                whileHover={{ scale: 1.03, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
              >
                Close
              </motion.button>
            </div>
          </div>
        )}
      </Modal>

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50`}>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className={`px-5 py-3 rounded-lg shadow-md ${toast.type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
          >
            {toast.message}
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default ServiceCataloguePage;
