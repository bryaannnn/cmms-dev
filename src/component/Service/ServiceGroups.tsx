import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../component/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Folder, Plus, Edit, Trash2, X, Users } from "lucide-react";
import PageHeader from "../../component/PageHeader";
import { useAuth } from "../../routes/AuthContext";

interface ServiceGroup {
  id: number;
  name: string;
  description?: string;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  className?: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children, className }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4"
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

const ServiceGroup: React.FC = () => {
  const [groups, setGroups] = useState<ServiceGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [editing, setEditing] = useState<ServiceGroup | null>(null);
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [saving, setSaving] = useState<boolean>(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const mountedRef = useRef(true);
  const [isMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });

  const navigate = useNavigate();

  const { getServiceGroups, getServiceGroup, hasPermission } = useAuth();

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const loadServiceGroups = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getServiceGroups(0);
      const mapped = data.map((g) => ({
        id: Number(g.id),
        name: g.group_name ?? "",
        description: g.group_description ?? undefined,
      }));
      setGroups(mapped);
    } catch (err) {
      setError("Failed to load service groups");
      console.error("Error loading service groups:", err);
    } finally {
      if (mountedRef.current) {
        setLoading(false);
      }
    }
  }, [getServiceGroups]);

  useEffect(() => {
    mountedRef.current = true;
    loadServiceGroups();

    return () => {
      mountedRef.current = false;
    };
  }, [loadServiceGroups]);

  const openAdd = () => {
    if (!hasPermission("manage_users")) {
      setError("You don't have permission to add service groups");
      return;
    }

    setEditing(null);
    setName("");
    setDescription("");
    setShowModal(true);
    setError(null);
  };

  const openEdit = (g: ServiceGroup) => {
    if (!hasPermission("manage_users")) {
      setError("You don't have permission to edit service groups");
      return;
    }

    setEditing(g);
    setName(g.name);
    setDescription(g.description || "");
    setShowModal(true);
    setError(null);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError("Group Name is required");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // In a real implementation, you would call your API here
      // For now, we'll simulate the API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (editing) {
        // Update existing group
        setGroups((prev) => prev.map((p) => (p.id === editing.id ? { ...p, name: name.trim(), description: description.trim() || undefined } : p)));
      } else {
        // Add new group
        const newGroup: ServiceGroup = {
          id: groups.length > 0 ? Math.max(...groups.map((g) => g.id)) + 1 : 1,
          name: name.trim(),
          description: description.trim() || undefined,
        };
        setGroups((prev) => [...prev, newGroup]);
      }

      setShowModal(false);
      setEditing(null);
      setName("");
      setDescription("");
    } catch (err) {
      setError("Failed to save service group");
      console.error("Error saving service group:", err);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: number) => {
    if (!hasPermission("manage_users")) {
      setError("You don't have permission to delete service groups");
      return;
    }

    setDeletingId(id);
    setShowDeleteConfirm(true);
    setError(null);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;

    setSaving(true);
    setError(null);

    try {
      // In a real implementation, you would call your API here
      await new Promise((resolve) => setTimeout(resolve, 500));

      setGroups((prev) => prev.filter((g) => g.id !== deletingId));
      setShowDeleteConfirm(false);
      setDeletingId(null);
    } catch (err) {
      setError("Failed to delete service group");
      console.error("Error deleting service group:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Service Groups" mainTitleHighlight="Groups" description="Manage service groups used across the service management system." icon={<Users />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Service <span className="text-blue-600">Groups</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Manage service groups used across the service management system.</p>
            </div>

            {hasPermission("manage_users") && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/service/servicegroups/addservicegroup")}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
              >
                <Plus className="text-base" />
                <span>Add Group</span>
              </motion.button>
            )}
          </motion.div>

          {loading ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500 mx-auto mb-5"></div>
              <p className="text-gray-600 text-base font-medium">Loading service groups...</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-md p-8 text-center border border-blue-100">
              <div className="text-blue-500 text-4xl mx-auto mb-4">
                <Folder />
              </div>
              <p className="text-gray-700 text-base font-medium">No service groups available.</p>
              {hasPermission("manage_users") && (
                <button onClick={() => navigate(`/service/servicegroups/`)} className="mt-5 px-5 py-2 bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors duration-200 text-sm">
                  Create first group
                </button>
              )}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">ID</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group Name</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Group Description</th>
                      <th className="px-5 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-100">
                    {groups.map((g) => (
                      <motion.tr
                        key={g.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{g.id}</div>
                        </td>
                        <td className="px-5 py-3 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{g.name}</div>
                        </td>
                        <td className="px-5 py-3">
                          <div className="text-sm text-gray-600 truncate max-w-xs">{g.description || "-"}</div>
                        </td>
                        {hasPermission("manage_users") && (
                          <td className="px-5 py-3 whitespace-nowrap text-sm font-medium space-x-1.5">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => navigate(`/service/servicegroups/editservicegroup/${g.id}`)}
                              className="text-yellow-600 hover:text-yellow-800 transition-colors duration-200 p-1 rounded-full hover:bg-yellow-50"
                              title="Edit"
                            >
                              <Edit className="inline text-base" />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => confirmDelete(g.id)}
                              className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                              title="Delete"
                            >
                              <Trash2 className="inline text-base" />
                            </motion.button>
                          </td>
                        )}
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </main>
      </div>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? "Edit Service Group" : "Add Service Group"} className="max-w-lg">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">Group Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} type="text" className="mt-2 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Group Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm"
              rows={4}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setShowModal(false);
                setEditing(null);
                setName("");
                setDescription("");
                setError(null);
              }}
              className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm"
            >
              {saving ? "Saving..." : "Save"}
            </motion.button>
          </div>
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}
        </div>
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Confirm Deletion">
        <div className="space-y-5 text-center py-3">
          <div className="text-red-500 text-5xl mx-auto animate-pulse">
            <Trash2 />
          </div>
          <p className="text-base text-gray-700 font-medium">Are you sure you want to delete this service group? This action cannot be undone.</p>
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
              onClick={handleDelete}
              disabled={saving}
              className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
            >
              {saving ? "Deleting..." : "Delete"}
            </motion.button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ServiceGroup;
