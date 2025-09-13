import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Sidebar from "../../component/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Upload, Filter, ChevronDown, Search, X, Bell, Moon, Sun, UserIcon, ChevronRight, Edit, Trash2, Info } from "lucide-react";

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

interface Service {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  groupId?: string | null;
  priority: "Low" | "Medium" | "High" | "Critical";
  owners: string[];
  slaHours: number;
  impact?: string;
  createdAt: string;
}

interface ServiceGroup {
  id: string;
  name: string;
}

const STORAGE_KEY = "service.catalogue.v1";
const GROUPS_KEY = "service.groups.v1";

const dummyUsers = ["User 1", "User 2", "User 3"];

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; className?: string; children?: React.ReactNode }> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.18 }} className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 backdrop-blur-sm">
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

const StatCard: React.FC<{ title: string; value: string; change?: string; icon?: React.ReactNode }> = ({ title, value, change, icon }) => {
  const isPositive = (change || "").startsWith("+");
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0,0,0,0.08)", scale: 1.01 }}
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

const ServiceCatalogue: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [darkMode, setDarkMode] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [groupFilter, setGroupFilter] = useState<string | "">("");
  const [priorityFilter, setPriorityFilter] = useState<string | "">("");
  const [loading, setLoading] = useState(true);
  const [services, setServices] = useState<Service[]>([]);
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [importing, setImporting] = useState(false);
  const debouncedSearch = useDebounce(searchQuery, 300);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" } | null>({ key: "createdAt", direction: "descending" });

  const artificialDelay = (min = 200, max = 400) =>
    new Promise((res) => {
      const t = Math.floor(Math.random() * (max - min + 1)) + min;
      setTimeout(res, t);
    });

  const readGroupsFromStorage = useCallback((): ServiceGroup[] => {
    try {
      const raw = localStorage.getItem(GROUPS_KEY);
      if (!raw) {
        const seeded = [
          { id: "grp-1", name: "IT Services" },
          { id: "grp-2", name: "Facilities" },
          { id: "grp-3", name: "HR Services" },
        ];
        localStorage.setItem(GROUPS_KEY, JSON.stringify(seeded));
        return seeded;
      }
      return JSON.parse(raw) as ServiceGroup[];
    } catch {
      return [];
    }
  }, []);

  const seedServicesIfEmpty = useCallback(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        const seeded: Service[] = [
          {
            id: `${Date.now()}-1`,
            serviceId: "SRV-001",
            name: "Network Setup",
            description: "Setup office LAN and Wi-Fi",
            groupId: "grp-1",
            priority: "High",
            owners: ["User 1"],
            slaHours: 24,
            impact: "Medium",
            createdAt: new Date().toISOString(),
          },
          {
            id: `${Date.now()}-2`,
            serviceId: "SRV-002",
            name: "Printer Maintenance",
            description: "Repair and maintain printers",
            groupId: "grp-2",
            priority: "Medium",
            owners: ["User 2"],
            slaHours: 48,
            impact: "Low",
            createdAt: new Date().toISOString(),
          },
          {
            id: `${Date.now()}-3`,
            serviceId: "SRV-003",
            name: "Account Provisioning",
            description: "Create and manage user accounts",
            groupId: "grp-1",
            priority: "Critical",
            owners: ["User 1", "User 3"],
            slaHours: 4,
            impact: "High",
            createdAt: new Date().toISOString(),
          },
          {
            id: `${Date.now()}-4`,
            serviceId: "SRV-004",
            name: "Office Relocation",
            description: "Coordinate office moving services",
            groupId: "grp-2",
            priority: "Low",
            owners: ["User 3"],
            slaHours: 168,
            impact: "Low",
            createdAt: new Date().toISOString(),
          },
          {
            id: `${Date.now()}-5`,
            serviceId: "SRV-005",
            name: "Payroll Query",
            description: "Resolve payroll inquiries",
            groupId: "grp-3",
            priority: "High",
            owners: ["User 2"],
            slaHours: 48,
            impact: "Medium",
            createdAt: new Date().toISOString(),
          },
        ];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      }
    } catch {}
  }, []);

  const fetchServiceCatalogue = useCallback(async (): Promise<Service[]> => {
    await artificialDelay();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw) as Service[];
      return parsed.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    } catch {
      return [];
    }
  }, []);

  const persistServices = useCallback((data: Service[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, []);

  const createService = useCallback(
    async (payload: Omit<Service, "id" | "createdAt">) => {
      await artificialDelay();
      const now = new Date().toISOString();
      const id = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
      const newItem: Service = { ...payload, id, createdAt: now };
      const current = (await fetchServiceCatalogue()) || [];
      const updated = [newItem, ...current];
      persistServices(updated);
      setServices(updated);
      return newItem;
    },
    [fetchServiceCatalogue, persistServices]
  );

  const updateService = useCallback(
    async (id: string, patch: Partial<Service>) => {
      await artificialDelay();
      const current = (await fetchServiceCatalogue()) || [];
      const updated = current.map((s) => (s.id === id ? { ...s, ...patch } : s));
      persistServices(updated);
      setServices(updated);
      return updated.find((s) => s.id === id) || null;
    },
    [fetchServiceCatalogue, persistServices]
  );

  const deleteService = useCallback(
    async (id: string) => {
      await artificialDelay();
      const current = (await fetchServiceCatalogue()) || [];
      const updated = current.filter((s) => s.id !== id);
      persistServices(updated);
      setServices(updated);
      return true;
    },
    [fetchServiceCatalogue, persistServices]
  );

  useEffect(() => {
    seedServicesIfEmpty();
    const g = readGroupsFromStorage();
    setGroups(g);
    let mounted = true;
    setLoading(true);
    fetchServiceCatalogue()
      .then((res) => {
        if (mounted) setServices(res);
      })
      .catch(() => {
        if (mounted) setServices([]);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [fetchServiceCatalogue, readGroupsFromStorage, seedServicesIfEmpty]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const openAddModal = () => {
    setEditingService(null);
    setShowFormModal(true);
  };

  const openEditModal = (s: Service) => {
    setEditingService(s);
    setShowFormModal(true);
  };

  const handleDelete = (id: string) => {
    setServiceToDelete(id);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!serviceToDelete) return;
    try {
      await deleteService(serviceToDelete);
      setShowDeleteConfirm(false);
      setServiceToDelete(null);
      showToast("success", "Service deleted");
    } catch {
      showToast("error", "Failed to delete service");
    }
  };

  const filteredServices = useMemo(() => {
    let list = [...services];
    if (debouncedSearch.trim()) {
      const q = debouncedSearch.toLowerCase().trim();
      list = list.filter((s) => s.name.toLowerCase().includes(q) || s.serviceId.toLowerCase().includes(q) || (s.description || "").toLowerCase().includes(q));
    }
    if (groupFilter) {
      list = list.filter((s) => s.groupId === groupFilter);
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

  const totalServices = filteredServices.length;
  const priorityCounts = useMemo(() => {
    const map = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    services.forEach((s) => {
      map[s.priority] = (map[s.priority] || 0) + 1;
    });
    return map;
  }, [services]);

  const averageSLA = useMemo(() => {
    if (services.length === 0) return 0;
    const sum = services.reduce((acc, s) => acc + (s.slaHours || 0), 0);
    return Math.round((sum / services.length) * 100) / 100;
  }, [services]);

  const totalOwners = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => s.owners.forEach((o) => set.add(o)));
    return set.size;
  }, [services]);

  const clearFilters = () => {
    setGroupFilter("");
    setPriorityFilter("");
    setSearchQuery("");
  };

  const requestSort = (key: string) => {
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
      const parsed: Service[] = [];
      for (let i = 0; i < rows.length; i++) {
        const cols = rows[i].split(",").map((c) => c.trim());
        const serviceId = cols[0] || `IMP-${Date.now()}-${i}`;
        const name = cols[1] || `Imported Service ${i + 1}`;
        const description = cols[2] || "";
        const groupName = cols[3] || groups[0]?.name || "Imported Group";
        let group = groups.find((g) => g.name.toLowerCase() === groupName.toLowerCase());
        if (!group) {
          group = { id: `grp-${Date.now()}-${i}`, name: groupName };
          const updatedGroups = [...groups, group];
          setGroups(updatedGroups);
          localStorage.setItem(GROUPS_KEY, JSON.stringify(updatedGroups));
        }
        const priority = (cols[4] as any) || "Low";
        const owners = (cols[5] &&
          cols[5]
            .split(";")
            .map((s) => s.trim())
            .filter(Boolean)) || ["User 1"];
        const slaHours = Number(cols[6]) || 24;
        const item: Service = {
          id: `${Date.now()}-imp-${i}`,
          serviceId,
          name,
          description,
          groupId: group.id,
          priority: priority === "Critical" ? "Critical" : priority === "High" ? "High" : priority === "Medium" ? "Medium" : "Low",
          owners,
          slaHours,
          impact: cols[7] || "",
          createdAt: new Date().toISOString(),
        };
        parsed.push(item);
      }
      const current = await fetchServiceCatalogue();
      const updated = [...parsed, ...current];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      setServices(updated);
      showToast("success", `Imported ${parsed.length} services`);
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

  const Form: React.FC = () => {
    const [serviceName, setServiceName] = useState(editingService?.name || "");
    const [serviceId, setServiceId] = useState(editingService?.serviceId || `SRV-${Math.floor(100 + Math.random() * 900)}`);
    const [description, setDescription] = useState(editingService?.description || "");
    const [groupId, setGroupId] = useState<string | "">((editingService?.groupId as string) || "");
    const [priority, setPriority] = useState<Service["priority"]>(editingService?.priority || "Low");
    const [ownersState, setOwnersState] = useState<string[]>(editingService?.owners || []);
    const [slaHours, setSlaHours] = useState<number>(editingService?.slaHours || 24);
    const [impact, setImpact] = useState(editingService?.impact || "");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<{ name?: string }>({});

    const toggleOwner = (owner: string) => {
      if (ownersState.includes(owner)) {
        setOwnersState((p) => p.filter((o) => o !== owner));
      } else {
        setOwnersState((p) => [...p, owner]);
      }
    };

    const handleSave = async () => {
      setErrors({});
      if (!serviceName.trim()) {
        setErrors({ name: "Service Name is required" });
        return;
      }
      setSaving(true);
      try {
        if (editingService) {
          await updateService(editingService.id, {
            name: serviceName.trim(),
            description: description.trim(),
            groupId: groupId || null,
            priority,
            owners: ownersState.length ? ownersState : ["User 1"],
            slaHours: Number(slaHours) || 0,
            impact: impact.trim(),
            serviceId: serviceId.trim(),
          });
          showToast("success", "Service updated");
        } else {
          await createService({
            serviceId: serviceId.trim(),
            name: serviceName.trim(),
            description: description.trim(),
            groupId: groupId || null,
            priority,
            owners: ownersState.length ? ownersState : ["User 1"],
            slaHours: Number(slaHours) || 0,
            impact: impact.trim(),
          });
          showToast("success", "Service created");
        }
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
            {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service ID</label>
            <input value={serviceId} onChange={(e) => setServiceId(e.target.value)} className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30" />
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
            <label className="text-sm font-medium text-gray-700">Service Type</label>
            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30">
              <option value="">-- Select Group --</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as Service["priority"])}
                className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Critical">Critical</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">SLA (hours)</label>
              <input
                type="number"
                value={slaHours}
                onChange={(e) => setSlaHours(Number(e.target.value))}
                className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Service Owner(s)</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {dummyUsers.map((u) => (
                <label key={u} className="inline-flex items-center space-x-2 bg-white border border-blue-100 rounded-md px-3 py-1 text-sm cursor-pointer">
                  <input type="checkbox" checked={ownersState.includes(u)} onChange={() => toggleOwner(u)} className="form-checkbox h-4 w-4 text-blue-600" />
                  <span className="text-gray-700">{u}</span>
                </label>
              ))}
            </div>
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
            className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm"
          >
            {saving ? "Saving..." : "Save"}
          </motion.button>
        </div>
      </div>
    );
  };

  const indexOfLastRecord = currentPage * recordsPerPage;
  const indexOfFirstRecord = indexOfLastRecord - recordsPerPage;
  const currentRecords = filteredServices.slice(indexOfFirstRecord, indexOfLastRecord);
  const totalPages = Math.ceil(filteredServices.length / recordsPerPage);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (!(target as HTMLElement)?.closest?.(".profile-menu")) {
        setShowProfileMenu(false);
      }
      if (!(target as HTMLElement)?.closest?.(".notifications-popup")) {
        setShowNotificationsPopup(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <motion.div className="flex items-center space-x-3">
              <motion.div className="text-xl text-blue-600">
                <Search />
              </motion.div>
              <h2 className="text-lg md:text-xl font-bold text-gray-900">Service Catalogue</h2>
            </motion.div>
          </div>
          <div className="flex items-center space-x-3 relative">
            <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label="Toggle theme">
              {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
            </motion.button>
            <div className="relative notifications-popup">
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
            <div className="relative profile-menu">
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
                Service Catalogue <span className="text-blue-600">Services</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Browse and manage the list of available services.</p>
            </div>
            <div className="flex flex-wrap gap-3 items-center">
              <motion.button
                onClick={openAddModal}
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
            <StatCard title="Total Services" value={totalServices.toLocaleString()} change="+2%" icon={<Info />} />
            <StatCard title="Critical" value={String(priorityCounts.Critical)} change={priorityCounts.Critical > 0 ? "+1" : "-"} icon={<Info />} />
            <StatCard title="Average SLA (hrs)" value={String(averageSLA)} change="-1%" icon={<Info />} />
            <StatCard title="Total Owners" value={String(totalOwners)} change="+0" icon={<UserIcon />} />
          </div>

          <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0 relative">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by service name, ID, or description..."
                  className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
                >
                  <div>
                    <label className="text-sm font-medium text-gray-700">By Service Group</label>
                    <select
                      value={groupFilter}
                      onChange={(e) => setGroupFilter(e.target.value as any)}
                      className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="">All Groups</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700">By Priority</label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value as any)}
                      className="w-full mt-2 px-4 py-2 border border-blue-200 rounded-lg bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                      <option value="">All Priorities</option>
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                  <div className="flex items-end space-x-2">
                    <button onClick={clearFilters} className="w-full px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 text-sm">
                      Clear Filters
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading service catalogue...</p>
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
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">No</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" onClick={() => requestSort("serviceId")}>
                        Service ID
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" onClick={() => requestSort("name")}>
                        Service Name
                      </th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Group</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service Owner(s)</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">SLA (hrs)</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {currentRecords.map((s, idx) => (
                      <motion.tr key={s.id} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.15 }} whileHover={{ backgroundColor: "rgba(239,246,255,0.5)" }}>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">{indexOfFirstRecord + idx + 1}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-900">{s.serviceId}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{s.name}</td>
                        <td className="px-5 py-3 text-sm text-gray-600 max-w-xs truncate">{s.description || "-"}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm text-gray-700">{groups.find((g) => g.id === s.groupId)?.name || "-"}</td>
                        <td className="px-5 py-3 whitespace-nowrap text-sm">
                          <span
                            className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full shadow-sm ${
                              s.priority === "Critical"
                                ? "bg-red-100 text-red-800 border border-red-200"
                                : s.priority === "High"
                                ? "bg-yellow-100 text-yellow-800 border border-yellow-200"
                                : s.priority === "Medium"
                                ? "bg-blue-100 text-blue-800 border border-blue-200"
                                : "bg-gray-100 text-gray-800 border border-gray-200"
                            }`}
                          >
                            {s.priority}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-sm text-gray-700">{s.owners.join(", ") || "-"}</td>
                        <td className="px-5 py-3 text-sm text-gray-700">{s.slaHours}</td>

                        <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => openEditModal(s)}
                            className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                            title="Edit"
                          >
                            <Edit className="inline text-base" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleDelete(s.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="inline text-base" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {filteredServices.length > recordsPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
              <div className="text-sm text-gray-600">
                Showing <span className="font-semibold">{indexOfFirstRecord + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastRecord, filteredServices.length)}</span> of{" "}
                <span className="font-semibold">{filteredServices.length}</span> results
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                >
                  Previous
                </motion.button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <motion.button
                    key={i + 1}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setCurrentPage(i + 1)}
                    className={`px-3.5 py-2 rounded-md transition-colors duration-200 shadow-sm font-medium text-sm ${
                      currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"
                    }`}
                  >
                    {i + 1}
                  </motion.button>
                ))}
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-blue-200 rounded-md bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm font-medium text-sm"
                >
                  Next
                </motion.button>
              </div>
            </motion.div>
          )}
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
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
            >
              Delete
            </motion.button>
          </div>
        </div>
      </Modal>

      {/* Modal Read Details
      <Modal isOpen={showReadModal} onClose={() => setShowReadModal(false)} title="Service Details" className="max-w-2xl">
        {readingService && (
          <div className="space-y-4 text-sm">
            <p><span className="font-semibold">Service ID:</span> {readingService.serviceId}</p>
            <p><span className="font-semibold">Service Name:</span> {readingService.name}</p>
            <p><span className="font-semibold">Description:</span> {readingService.description || "-"}</p>
            <p><span className="font-semibold">Group:</span> {groups.find((g) => g.id === readingService.groupId)?.name || "-"}</p>
            <p><span className="font-semibold">Priority:</span> {readingService.priority}</p>
            <p><span className="font-semibold">Owners:</span> {readingService.owners.join(", ")}</p>
            <p><span className="font-semibold">SLA:</span> {readingService.slaHours} hrs</p>
            <p><span className="font-semibold">Impact:</span> {readingService.impact || "-"}</p>
          </div>
        )}
      </Modal> */}

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

export default ServiceCatalogue;
