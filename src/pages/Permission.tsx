import React, { useState, useEffect } from "react";
import {
  FiUsers,
  FiUser,
  FiUserPlus,
  FiKey,
  FiEdit2,
  FiTrash2,
  FiSave,
  FiX,
  FiChevronDown,
  FiChevronUp,
  FiPlus,
  FiCheck,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiClipboard,
  FiDatabase,
  FiBarChart2,
  FiSettings,
  FiLogOut,
  FiBell,
  FiSun,
  FiMoon,
} from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, PermissionName, User } from "../routes/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: PermissionName[];
  isITRole?: boolean;
  isSuperadmin?: boolean;
};

const PermissionsPage: React.FC = () => {
  const { user, logout, fetchWithAuth, getUsers, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const roleMapping: Record<string, { name: string; isDepartmentHead?: boolean; isSuperadmin?: boolean }> = {
    "1": { name: "User", isDepartmentHead: false },
    "2": { name: "Admin", isDepartmentHead: true },
    "3": { name: "Superadmin", isSuperadmin: true },
  };

  const permissionMapping: Record<string, PermissionName> = {
    "1": "view_dashboard",
    "2": "edit_dashboard",
    "3": "view_assets",
    "4": "create_assets",
    "5": "edit_assets",
    "6": "delete_assets",
    "7": "view_workorders",
    "8": "create_workorders",
    "9": "assign_workorders",
    "10": "complete_workorders",
    "11": "view_reports",
    "12": "export_reports",
    "13": "view_settings",
    "14": "edit_settings",
    "15": "view_permissions",
    "16": "edit_permissions",
    "17": "manage_users",
    "18": "view_inventory",
    "19": "view_teams",
    "20": "view_machinehistory",
    "21": "edit_machinehistory",
    "22": "edit_inventory",
    "23": "edit_workorders",
    "24": "edit_reports",
    "25": "edit_teams",
    "26": "create_machine_history",
    "27": "create_inventory",
    "28": "create_reports",
    "29": "create_teams",
    "30": "delete_workorders",
    "31": "delete_machinehistory",
    "32": "delete_inventory",
    "33": "delete_reports",
    "34": "delete_teams",
  };

  const allPermissions: PermissionName[] = [
    "view_dashboard",
    "view_assets",
    "view_workorders",
    "view_reports",
    "view_permissions",
    "view_inventory",
    "view_teams",
    "view_machinehistory",
    "view_settings",
    "edit_dashboard",
    "edit_machinehistory",
    "edit_inventory",
    "edit_workorders",
    "edit_reports",
    "edit_teams",
    "edit_assets",
    "edit_permissions",
    "edit_settings",
    "create_assets",
    "create_workorders",
    "create_machine_history",
    "create_inventory",
    "create_reports",
    "create_teams",
    "delete_assets",
    "delete_workorders",
    "delete_machinehistory",
    "delete_inventory",
    "delete_reports",
    "delete_teams",
    "assign_workorders",
    "complete_workorders",
    "export_reports",
    "manage_users",
  ];

  const getRoleName = (roleId: string): string => {
    return roleMapping[roleId]?.name || "No Role";
  };

  const [allRoles, setAllRoles] = useState<Role[]>(
    Object.entries(roleMapping).map(([id, role]) => ({
      id,
      name: role.name,
      description: `${role.name} role`,
      permissions: role.isSuperadmin ? allPermissions : [],
      isSuperadmin: role.isSuperadmin,
    }))
  );

  const permissionCategories = Array.from(new Set(allPermissions.map((p) => p.split("_")[0])));

  const getPermissionsByCategory = (category: string): PermissionName[] => {
    return allPermissions.filter((p) => p.startsWith(category));
  };

  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>(allRoles);

  const permissionsByCategory = permissionCategories.reduce<Record<string, PermissionName[]>>((acc, category) => {
    acc[category] = getPermissionsByCategory(category);
    return acc;
  }, {});

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
    const fetchUsersData = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (hasPermission("manage_users")) {
      fetchUsersData();
    }
  }, [getUsers, hasPermission]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleRolePermissionToggle = (permissionId: PermissionName) => {
    if (!editingRole || editingRole.isSuperadmin) return;

    setEditingRole((prev) => {
      if (!prev) return null;
      const newPermissions = prev.permissions.includes(permissionId) ? prev.permissions.filter((id) => id !== permissionId) : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleUserPermissionToggle = (permissionId: PermissionName) => {
    if (!editingUser || editingUser.roleId === "3") return;

    setEditingUser((prev) => {
      if (!prev) return null;
      const currentPermissions = prev.customPermissions || [];
      const newPermissions = currentPermissions.includes(permissionId) ? currentPermissions.filter((id) => id !== permissionId) : [...currentPermissions, permissionId];
      return { ...prev, customPermissions: newPermissions };
    });
  };

  const saveRole = async () => {
    if (!editingRole || !hasPermission("edit_permissions")) return;

    try {
      setIsLoading(true);
      if (editingRole.id) {
        setRoles((prev) => prev.map((role) => (role.id === editingRole.id ? editingRole : role)));
      } else {
        const newId = `role-${Date.now()}`;
        setRoles((prev) => [...prev, { ...editingRole, id: newId }]);
      }
      setEditingRole(null);
      setShowNewRoleForm(false);
    } catch (error) {
      console.error("Failed to save role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async () => {
    if (!editingUser) return;

    // Superadmin bisa edit semua user
    if (user?.roleId === "3") {
      try {
        setIsLoading(true);
        const customPermissionIds = editingUser.customPermissions
          ? Object.entries(permissionMapping)
              .filter(([_, name]) => editingUser.customPermissions?.includes(name as PermissionName))
              .map(([id]) => id)
          : [];

        await fetchWithAuth(`/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleId: editingUser.roleId,
            customPermissions: customPermissionIds,
          }),
        });

        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
        setEditingUser(null);
      } catch (error) {
        console.error("Failed to save user:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Admin hanya bisa edit user di departemen yang sama
    if (user?.roleId === "2" && editingUser.department === user.department) {
      try {
        setIsLoading(true);
        const customPermissionIds = editingUser.customPermissions
          ? Object.entries(permissionMapping)
              .filter(([_, name]) => editingUser.customPermissions?.includes(name as PermissionName))
              .map(([id]) => id)
          : [];

        await fetchWithAuth(`/users/${editingUser.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            roleId: editingUser.roleId,
            customPermissions: customPermissionIds,
          }),
        });

        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
        setEditingUser(null);
      } catch (error) {
        console.error("Failed to save user:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    alert("You don't have permission to edit this user");
  };

  const deleteRole = async (id: string) => {
    if (!hasPermission("manage_users") || !window.confirm("Are you sure you want to delete this role?")) return;

    try {
      setIsLoading(true);
      setRoles((prev) => prev.filter((role) => role.id !== id));
    } catch (error) {
      console.error("Failed to delete role:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    const userToDelete = users.find((u) => u.id === id);

    // Superadmin bisa hapus semua user
    if (user?.roleId === "3") {
      if (!window.confirm("Are you sure you want to delete this user?")) return;

      try {
        setIsLoading(true);
        await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Admin hanya bisa hapus user di departemen yang sama
    if (user?.roleId === "2" && userToDelete?.department === user.department) {
      if (!window.confirm("Are you sure you want to delete this user?")) return;

      try {
        setIsLoading(true);
        await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers || []);
      } catch (error) {
        console.error("Failed to delete user:", error);
      } finally {
        setIsLoading(false);
      }
      return;
    }

    alert("You don't have permission to delete this user");
  };

  const getRolePermissions = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.permissions : [];
  };

  const uniqueDepartments = ["all", ...Array.from(new Set(users.map((u) => u.department || "").filter(Boolean)))];

  const filteredUsers = users
    .filter((user) => departmentFilter === "all" || user.department === departmentFilter)
    .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.email.toLowerCase().includes(searchQuery.toLowerCase()));

  const NavItem: React.FC<{
    icon: React.ReactNode;
    text: string;
    to: string;
    expanded: boolean;
  }> = ({ icon, text, to, expanded }) => {
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
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="ml-3 text-base">
            {text}
          </motion.span>
        )}
      </motion.button>
    );
  };

  if (!hasPermission("view_permissions")) {
    return (
      <div className={`flex items-center justify-center h-screen ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
        <div className="text-xl">You don't have permission to access this page</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
            }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} border-r flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className={`p-4 flex items-center justify-between ${darkMode ? "border-gray-700" : "border-blue-100"} border-b`}>
              {sidebarOpen ? (
                <div className="rounded-lg flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                  <p className={`${darkMode ? "text-blue-400" : "text-blue-600"} font-bold`}>CMMS</p>
                </div>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-6 w-auto" />
              )}

              <button
                onClick={toggleSidebar}
                className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200`}
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              {hasPermission("view_dashboard") && <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />}
              {hasPermission("view_assets") && <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />}
              {hasPermission("view_workorders") && <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />}
              {hasPermission("view_machinehistory") && <NavItem icon={<FiClipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />}
              {hasPermission("view_inventory") && <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />}
              {hasPermission("view_reports") && <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />}
              {hasPermission("view_teams") && <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />}
              {hasPermission("view_settings") && <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />}
              {hasPermission("view_permissions") && <NavItem icon={<FiKey />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
            </nav>

            <div className={`p-4 ${darkMode ? "border-gray-700" : "border-blue-100"} border-t`}>
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-blue-400" : "border-blue-500"}`} />
                {sidebarOpen && (
                  <div>
                    <p className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{user?.name}</p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user?.roleId}</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    logout();
                    navigate("/login");
                  }}
                  className={`mt-4 w-full flex items-center justify-center space-x-2 ${darkMode ? "text-red-400 hover:bg-gray-700" : "text-red-600 hover:bg-red-50"} p-2 rounded-lg transition-colors duration-200 font-medium`}
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} border-b p-4 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={toggleSidebar} className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200`}>
                <FiChevronRight className="text-xl" />
              </button>
            )}
            <FiKey className={`text-2xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Permissions</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200 relative`}
              aria-label="Notifications"
            >
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"} transition-colors duration-200`}>
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className={`w-8 h-8 rounded-full ${darkMode ? "border-gray-600" : "border-blue-200"} border`} />
              <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"} hidden sm:inline`}>{user?.name}</span>
              <FiChevronDown className={darkMode ? "text-gray-400" : "text-gray-500"} />
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
              <h1 className={`text-3xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"} mb-2`}>Permission Management</h1>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Manage user roles and permissions</p>
            </motion.div>

            <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm border overflow-hidden mb-6`}>
              <div className={`flex ${darkMode ? "border-gray-700" : "border-blue-100"} border-b`}>
                <button
                  onClick={() => setActiveTab("roles")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "roles" ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-700 border-b-2 border-blue-700") : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <FiKey className="mr-2" />
                    Roles & Permissions
                  </div>
                </button>
                <button
                  onClick={() => setActiveTab("users")}
                  className={`px-6 py-3 font-medium ${
                    activeTab === "users" ? (darkMode ? "text-blue-400 border-b-2 border-blue-400" : "text-blue-700 border-b-2 border-blue-700") : darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  <div className="flex items-center">
                    <FiUsers className="mr-2" />
                    User Permissions
                  </div>
                </button>
              </div>
            </div>

            {activeTab === "roles" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Roles</h2>
                  {hasPermission("edit_permissions") && (
                    <button
                      onClick={() => {
                        setShowNewRoleForm(true);
                        setEditingRole({ id: "", name: "", description: "", permissions: [], isITRole: false });
                      }}
                      className={`flex items-center px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}
                    >
                      <FiPlus className="mr-2" />
                      Add Role
                    </button>
                  )}
                </div>

                {showNewRoleForm && (
                  <motion.div
                    whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                    transition={{ type: "spring", stiffness: 300 }}
                    className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 mb-6 border`}
                  >
                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{editingRole?.id ? "Edit Role" : "Add New Role"}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role Name</label>
                        <input
                          type="text"
                          value={editingRole?.name || ""}
                          onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                          className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="e.g., IT Manager"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Description</label>
                        <input
                          type="text"
                          value={editingRole?.description || ""}
                          onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                          className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                          placeholder="Brief description of the role"
                        />
                      </div>
                      <div>
                        <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role Type</label>
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={editingRole?.isITRole || false}
                              onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, isITRole: e.target.checked } : null))}
                              className={`h-4 w-4 ${darkMode ? "text-blue-400 bg-gray-700 border-gray-600" : "text-blue-600"} rounded focus:ring-blue-500`}
                            />
                            <span className={`ml-2 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>IT Role</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    <h4 className={`font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Permissions</h4>
                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, perms]) => (
                        <div key={category} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border rounded-lg overflow-hidden`}>
                          <button onClick={() => toggleCategory(category)} className={`w-full flex justify-between items-center p-3 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}>
                            <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{category}</span>
                            {expandedCategories[category] ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          <AnimatePresence>
                            {expandedCategories[category] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className={`p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${darkMode ? "bg-gray-800" : "bg-white"}`}
                              >
                                {perms.map((permission) => (
                                  <div key={permission} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`perm-${permission}`}
                                      checked={editingRole?.isSuperadmin || editingRole?.permissions.includes(permission) || false}
                                      onChange={() => handleRolePermissionToggle(permission)}
                                      disabled={editingRole?.isSuperadmin}
                                      className={`h-4 w-4 ${
                                        editingRole?.isSuperadmin ? (darkMode ? "text-blue-400 bg-gray-700 border-gray-600" : "text-blue-600") : darkMode ? "text-blue-400 bg-gray-700 border-gray-600" : "text-blue-600"
                                      } rounded focus:ring-blue-500`}
                                    />
                                    <label htmlFor={`perm-${permission}`} className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                      <div className="font-medium">
                                        {permission}
                                        {editingRole?.isSuperadmin && <span className={`ml-2 text-xs ${darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"} px-2 py-0.5 rounded`}>Superadmin</span>}
                                      </div>
                                    </label>
                                  </div>
                                ))}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-end space-x-3 mt-6">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => {
                          setShowNewRoleForm(false);
                          setEditingRole(null);
                        }}
                        className={`px-4 py-2 ${darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} border rounded-md`}
                      >
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveRole} className={`px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}>
                        Save Role
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <motion.div
                      key={role.id}
                      whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 border h-full`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                          {role.name}
                          {role.isITRole && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Production</span>}
                        </h3>
                        <div className="flex space-x-2">
                          {!role.isSuperadmin && hasPermission("edit_permissions") && (
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setShowNewRoleForm(true);
                              }}
                              className={`p-1 ${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                              title="Edit"
                            >
                              <FiEdit2 />
                            </button>
                          )}
                          {!role.isSuperadmin && hasPermission("manage_users") && (
                            <button onClick={() => deleteRole(role.id)} className={`p-1 ${darkMode ? "text-gray-400 hover:text-red-400" : "text-gray-500 hover:text-red-600"}`} title="Delete">
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mb-4`}>{role.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Permissions:</span>
                          <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{role.permissions.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Users with this role:</span>
                          <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{users.filter((u) => u.roleId === role.id).length}</span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className={`text-xl font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Users</h2>
                  <div className="flex space-x-4">
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={`${darkMode ? "bg-gray-700 border-gray-600 text-gray-100 placeholder-gray-400" : "border-gray-300"} border rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <FiUser className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    <select
                      value={departmentFilter}
                      onChange={(e) => setDepartmentFilter(e.target.value)}
                      className={`${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === "all" ? "All Departments" : dept}
                        </option>
                      ))}
                    </select>
                    {hasPermission("manage_users") && (
                      <Link to="/permissions/adduser" className={`flex items-center px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}>
                        <FiUserPlus className="mr-2" />
                        Add User
                      </Link>
                    )}
                  </div>
                </div>

                <motion.div
                  whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 mb-6 border`}
                >
                  <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>User Permissions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Name
                          </th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Email
                          </th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Department
                          </th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Role
                          </th>
                          <th scope="col" className={`px-6 py-3 text-left text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Custom Permissions
                          </th>
                          <th scope="col" className={`px-6 py-3 text-right text-xs font-medium uppercase tracking-wider ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className={`${darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-blue-100"} divide-y`}>
                        {filteredUsers.map((userItem) => (
                          <tr key={userItem.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"}>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{userItem.name}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{userItem.email}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{userItem.department || "-"}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{getRoleName(userItem.roleId || "")}</td>
                            <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>
                              {userItem.roleId === "3" ? (
                                <span className={`px-2 py-1 text-xs rounded-full ${darkMode ? "bg-blue-900 text-blue-200" : "bg-blue-100 text-blue-800"}`}>All permissions</span>
                              ) : userItem.customPermissions?.length ? (
                                <span className="cursor-help border-b border-dashed border-gray-400" title={userItem.customPermissions.join("\n")}>
                                  {userItem.customPermissions.length} custom permission(s)
                                </span>
                              ) : (
                                <span className="italic text-gray-400">No custom permissions</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {user?.roleId === "3" || (user?.roleId === "2" && userItem.department === user.department) ? (
                                <>
                                  <button onClick={() => setEditingUser(userItem)} className={`${darkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-900"} mr-4`}>
                                    Edit
                                  </button>
                                  {userItem.id !== user?.id && (
                                    <button onClick={() => deleteUser(userItem.id)} className={`${darkMode ? "text-red-400 hover:text-red-300" : "text-red-600 hover:text-red-900"}`}>
                                      Delete
                                    </button>
                                  )}
                                </>
                              ) : null}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </main>
      </div>

      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto`}>
              <div className={`flex justify-between items-center ${darkMode ? "border-gray-700" : "border-blue-100"} border-b p-4 sticky top-0 ${darkMode ? "bg-gray-800" : "bg-white"} z-10`}>
                <h3 className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Edit User Permissions</h3>
                <button onClick={() => setEditingUser(null)} className={darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}>
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Name</label>
                    <div className={`${darkMode ? "text-gray-100" : "text-gray-900"} font-medium`}>{editingUser.name}</div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email</label>
                    <div className={darkMode ? "text-gray-300" : "text-gray-600"}>{editingUser.email}</div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Department</label>
                    <div className={darkMode ? "text-gray-300" : "text-gray-600"}>{editingUser.department || "-"}</div>
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                    <select
                      value={editingUser.roleId || ""}
                      onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, roleId: e.target.value } : null))}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">No Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className={`font-medium mb-3 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Custom Permissions (in addition to role permissions)</h4>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border rounded-lg overflow-hidden`}>
                      <button onClick={() => toggleCategory(category)} className={`w-full flex justify-between items-center p-3 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"}`}>
                        <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{category}</span>
                        {expandedCategories[category] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      <AnimatePresence>
                        {expandedCategories[category] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className={`p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 ${darkMode ? "bg-gray-800" : "bg-white"}`}
                          >
                            {perms.map((permission) => {
                              const roleHasPermission = editingUser.roleId ? roles.find((r) => r.id === editingUser.roleId)?.permissions.includes(permission) || false : false;
                              const isSuperadmin = editingUser.roleId === "3";
                              const userHasPermission = isSuperadmin || editingUser.customPermissions?.includes(permission) || false;
                              const isDisabled = roleHasPermission || isSuperadmin;

                              return (
                                <div key={permission} className={`flex items-center ${isDisabled ? "opacity-50" : ""}`}>
                                  <input
                                    type="checkbox"
                                    id={`user-perm-${permission}`}
                                    checked={userHasPermission}
                                    onChange={() => !isDisabled && handleUserPermissionToggle(permission)}
                                    disabled={isDisabled}
                                    className={`h-4 w-4 rounded focus:ring-blue-500 
                                      ${
                                        isSuperadmin
                                          ? darkMode
                                            ? "text-blue-400 bg-gray-700 border-gray-600"
                                            : "text-blue-600"
                                          : roleHasPermission
                                          ? darkMode
                                            ? "text-purple-400 bg-gray-700 border-gray-600"
                                            : "text-purple-600"
                                          : darkMode
                                          ? "text-blue-400 bg-gray-700 border-gray-600"
                                          : "text-blue-600"
                                      }`}
                                  />
                                  <label htmlFor={`user-perm-${permission}`} className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                    <div className="font-medium flex items-center">
                                      {permission}
                                      {isSuperadmin && <span className={`ml-2 text-xs ${darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-800"} px-2 py-0.5 rounded`}>Superadmin</span>}
                                      {roleHasPermission && !isSuperadmin && <span className={`ml-2 text-xs ${darkMode ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"} px-2 py-0.5 rounded`}>from role</span>}
                                    </div>
                                  </label>
                                </div>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>

              <div className={`flex justify-end space-x-3 p-4 ${darkMode ? "border-gray-700" : "border-blue-100"} border-t sticky bottom-0 ${darkMode ? "bg-gray-800" : "bg-white"}`}>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditingUser(null)}
                  className={`px-4 py-2 ${darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} border rounded-md`}
                >
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveUser} className={`px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}>
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PermissionsPage;
