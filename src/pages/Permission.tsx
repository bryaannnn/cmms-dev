import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiUser,
  FiLock,
  FiBell,
  FiMoon,
  FiSun,
  FiDatabase,
  FiGlobe,
  FiCreditCard,
  FiUsers,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiClipboard,
  FiBarChart2,
  FiX,
  FiCheck,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiChevronDown,
  FiKey, // Icon baru untuk permissions
  FiPlus, // Untuk menambah permission
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext"; // Pastikan path ini benar
import logoWida from "../assets/logo-wida.png"; // Pastikan path ini benar
import { motion, AnimatePresence } from "framer-motion";

// --- Components Reusable (dari SettingsPage, agar konsisten) ---

type NavItemProps = {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
};

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

// --- Modal Component (dari SettingsPage) ---
type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
};

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
        <div className="flex justify-between items-center border-b border-blue-100 p-4">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FiX className="text-xl" />
          </motion.button>
        </div>
        <div className="p-6">{children}</div>
        {actions && <div className="flex justify-end space-x-3 p-4 border-t border-blue-100">{actions}</div>}
      </motion.div>
    </motion.div>
  );
};

// --- Halaman Utama PermissionsPage ---

type Permission = {
  id: number;
  name: string;
  guard_name: string;
  created_at: string;
  updated_at: string;
};

const PermissionsPage: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [darkMode, setDarkMode] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State untuk data permission
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk modal tambah/edit permission
  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [currentPermission, setCurrentPermission] = useState<Permission | null>(null); // Untuk edit
  const [newPermissionName, setNewPermissionName] = useState("");

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
    // Fungsi untuk mengambil data permission dari backend
    const fetchPermissions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Ganti dengan endpoint API backend Anda untuk permission
        // Contoh: const response = await fetch('/api/permissions', {
        //   headers: {
        //     'Authorization': `Bearer ${localStorage.getItem('token')}` // Sesuaikan dengan cara Anda menyimpan token
        //   }
        // });

        // Simulasi data dari backend
        const dummyPermissions: Permission[] = [
          { id: 1, name: "create user", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 2, name: "edit user", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 3, name: "delete user", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 4, name: "view reports", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 5, name: "manage assets", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 6, name: "manage roles", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          { id: 7, name: "view team", guard_name: "web", created_at: "2023-01-01", updated_at: "2023-01-01" },
          // Tambahkan permission lain sesuai kebutuhan
        ];

        // if (!response.ok) {
        //   throw new Error(`HTTP error! status: ${response.status}`);
        // }
        // const data = await response.json();
        // setPermissions(data.permissions); // Sesuaikan dengan struktur respons backend Anda

        await new Promise((resolve) => setTimeout(resolve, 500)); // Simulasi loading
        setPermissions(dummyPermissions);
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPermissions();
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleAddPermission = () => {
    setCurrentPermission(null); // Reset untuk mode tambah
    setNewPermissionName("");
    setShowAddEditModal(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setCurrentPermission(permission); // Set untuk mode edit
    setNewPermissionName(permission.name);
    setShowAddEditModal(true);
  };

  const handleDeletePermission = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this permission?")) {
      return;
    }
    // Implementasi delete ke backend
    // Contoh: await fetch(`/api/permissions/${id}`, { method: 'DELETE', headers: { ... } });
    setPermissions(permissions.filter((p) => p.id !== id));
    alert("Permission deleted (simulated)");
  };

  const handleSavePermission = async () => {
    if (!newPermissionName.trim()) {
      alert("Permission name cannot be empty.");
      return;
    }

    // Implementasi save (add/edit) ke backend
    setLoading(true);
    try {
      if (currentPermission) {
        // Edit existing permission
        // Contoh: await fetch(`/api/permissions/${currentPermission.id}`, { method: 'PUT', body: JSON.stringify({ name: newPermissionName }), headers: { ... } });
        setPermissions(permissions.map((p) => (p.id === currentPermission.id ? { ...p, name: newPermissionName } : p)));
        alert("Permission updated (simulated)");
      } else {
        // Add new permission
        // Contoh: await fetch('/api/permissions', { method: 'POST', body: JSON.stringify({ name: newPermissionName, guard_name: 'web' }), headers: { ... } });
        const newId = Math.max(...permissions.map((p) => p.id)) + 1; // ID sementara
        setPermissions([...permissions, { id: newId, name: newPermissionName, guard_name: "web", created_at: new Date().toISOString(), updated_at: new Date().toISOString() }]);
        alert("Permission added (simulated)");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An error occurred during save.");
      }
    } finally {
      setLoading(false);
      setShowAddEditModal(false);
      setNewPermissionName("");
      setCurrentPermission(null);
    }
  };

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
              {user?.roles.some((role) => role === "admin") && <NavItem icon={<FiKey />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.roles?.[0]}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleLogout} // Langsung panggil handleLogout
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

      {/* Overlay for mobile sidebar */}
      {isMobile && sidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="fixed inset-0 bg-black bg-opacity-40 z-40"></motion.div>}

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
            <FiKey className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Permissions Management</h2>
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

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Manage System Permissions</h1>
              <p className="text-gray-600">View and manage all available system permissions. Only visible to Admin users.</p>
            </motion.div>

            {/* Filter dan Add Permission */}
            <div className="flex justify-between items-center mb-6">
              <input type="text" placeholder="Search permissions..." className="w-full max-w-sm border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
              {user?.roles?.includes("admin") && ( // Hanya admin yang bisa menambah permission
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleAddPermission} className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
                  <FiPlus className="mr-2" /> Add Permission
                </motion.button>
              )}
            </div>

            {loading && <p className="text-center text-blue-600">Loading permissions...</p>}
            {error && <p className="text-center text-red-600">Error: {error}</p>}

            {!loading && !error && permissions.length === 0 && <p className="text-center text-gray-600">No permissions found.</p>}

            {!loading && !error && permissions.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                <table className="min-w-full divide-y divide-blue-100">
                  <thead className="bg-blue-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Permission Name
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Guard
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">
                        Created At
                      </th>
                      {user?.roles?.includes("admin") && ( // Hanya admin yang bisa melakukan tindakan
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-blue-700 uppercase tracking-wider">
                          Actions
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-blue-50">
                    {permissions.map((permission) => (
                      <tr key={permission.id} className="hover:bg-gray-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{permission.name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{permission.guard_name}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(permission.created_at).toLocaleDateString("id-ID")}</td>
                        {user?.roles?.includes("admin") && ( // Hanya admin yang bisa melihat tindakan
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-3">
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleEditPermission(permission)} className="text-blue-600 hover:text-blue-800" aria-label={`Edit ${permission.name}`}>
                                <FiEdit2 className="text-lg" />
                              </motion.button>
                              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleDeletePermission(permission.id)} className="text-red-600 hover:text-red-800" aria-label={`Delete ${permission.name}`}>
                                <FiTrash2 className="text-lg" />
                              </motion.button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Add/Edit Permission Modal */}
      <Modal
        isOpen={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        title={currentPermission ? "Edit Permission" : "Add New Permission"}
        actions={
          <>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddEditModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSavePermission} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FiSave className="inline-block mr-2" /> {currentPermission ? "Save Changes" : "Add Permission"}
            </motion.button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label htmlFor="permissionName" className="block text-sm font-medium text-gray-700 mb-1">
              Permission Name
            </label>
            <input
              type="text"
              id="permissionName"
              name="name"
              value={newPermissionName}
              onChange={(e) => setNewPermissionName(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              placeholder="e.g., create article, delete user"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default PermissionsPage;
