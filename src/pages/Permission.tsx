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
  FiLock,
  FiUnlock,
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
import { useAuth } from "../routes/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";

type Permission = {
  id: string;
  name: string;
  description: string;
  category: string;
};

type Role = {
  id: string;
  name: string;
  description: string;
  permissions: string[];
};

type User = {
  id: string;
  name: string;
  email: string;
  roleId: string;
  customPermissions: string[];
  department?: string;
};

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

const PermissionsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [permissions, setPermissions] = useState<Permission[]>([
    { id: "p1", name: "view_dashboard", description: "View dashboard page", category: "General" },
    { id: "p2", name: "edit_dashboard", description: "Edit dashboard widgets", category: "General" },
    { id: "p3", name: "view_assets", description: "View assets page", category: "Assets" },
    { id: "p4", name: "create_assets", description: "Create new assets", category: "Assets" },
    { id: "p5", name: "edit_assets", description: "Edit existing assets", category: "Assets" },
    { id: "p6", name: "delete_assets", description: "Delete assets", category: "Assets" },
    { id: "p7", name: "view_workorders", description: "View work orders", category: "Work Orders" },
    { id: "p8", name: "create_workorders", description: "Create work orders", category: "Work Orders" },
    { id: "p9", name: "assign_workorders", description: "Assign work orders", category: "Work Orders" },
    { id: "p10", name: "complete_workorders", description: "Mark work orders as complete", category: "Work Orders" },
    { id: "p11", name: "view_reports", description: "View reports", category: "Reports" },
    { id: "p12", name: "export_reports", description: "Export reports", category: "Reports" },
    { id: "p13", name: "view_settings", description: "View settings page", category: "Settings" },
    { id: "p14", name: "edit_settings", description: "Edit system settings", category: "Settings" },
    { id: "p15", name: "view_permissions", description: "View permissions page", category: "Permissions" },
    { id: "p16", name: "edit_permissions", description: "Edit permissions", category: "Permissions" },
    { id: "p17", name: "manage_users", description: "Create/edit/delete users", category: "Users" },
  ]);

  const [roles, setRoles] = useState<Role[]>([
    {
      id: "r1",
      name: "user",
      description: "Basic user with limited access",
      permissions: ["p1", "p3", "p7", "p11"],
    },
    {
      id: "r2",
      name: "admin",
      description: "Administrator with most permissions",
      permissions: ["p1", "p2", "p3", "p4", "p5", "p7", "p8", "p9", "p10", "p11", "p12", "p13", "p17"],
    },
    {
      id: "r3",
      name: "superadmin",
      description: "Full system access",
      permissions: permissions.map((p) => p.id),
    },
  ]);

  const [users, setUsers] = useState<User[]>([
    { id: "u1", name: "John Doe", email: "john@example.com", roleId: "r1", customPermissions: [], department: "Operations" },
    { id: "u2", name: "Jane Smith", email: "jane@example.com", roleId: "r2", customPermissions: [], department: "IT" },
    { id: "u3", name: "Admin User", email: "admin@example.com", roleId: "r3", customPermissions: [], department: "Management" },
    { id: "u4", name: "Bob Johnson", email: "bob@example.com", roleId: "r1", customPermissions: ["p8", "p9"], department: "Maintenance" },
  ]);

  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [departmentFilter, setDepartmentFilter] = useState<string>("all");

  // Group permissions by category
  const permissionsByCategory = permissions.reduce<Record<string, Permission[]>>((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
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

  const handleRolePermissionToggle = (permissionId: string) => {
    if (!editingRole) return;

    setEditingRole((prev) => {
      if (!prev) return null;
      const newPermissions = prev.permissions.includes(permissionId) ? prev.permissions.filter((id) => id !== permissionId) : [...prev.permissions, permissionId];
      return { ...prev, permissions: newPermissions };
    });
  };

  const handleUserPermissionToggle = (permissionId: string) => {
    if (!editingUser) return;

    setEditingUser((prev) => {
      if (!prev) return null;
      const newPermissions = prev.customPermissions.includes(permissionId) ? prev.customPermissions.filter((id) => id !== permissionId) : [...prev.customPermissions, permissionId];
      return { ...prev, customPermissions: newPermissions };
    });
  };

  const saveRole = () => {
    if (!editingRole) return;

    if (editingRole.id) {
      setRoles((prev) => prev.map((role) => (role.id === editingRole.id ? editingRole : role)));
    } else {
      setRoles((prev) => [...prev, { ...editingRole, id: `r${prev.length + 1}` }]);
    }

    setEditingRole(null);
    setShowNewRoleForm(false);
  };

  const saveUser = () => {
    if (!editingUser) return;
    setUsers((prev) => prev.map((u) => (u.id === editingUser.id ? editingUser : u)));
    setEditingUser(null);
  };

  const deleteRole = (id: string) => {
    if (window.confirm("Are you sure you want to delete this role? Users with this role will be left without a role.")) {
      setRoles((prev) => prev.filter((role) => role.id !== id));
    }
  };

  const deleteUser = (id: string) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      setUsers((prev) => prev.filter((user) => user.id !== id));
    }
  };

  const getRolePermissions = (roleId: string) => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.permissions : [];
  };

  const getUserPermissions = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return [];
    const rolePermissions = getRolePermissions(user.roleId);
    return [...rolePermissions, ...user.customPermissions];
  };

  const uniqueDepartments = ["all", ...Array.from(new Set(users.map((u) => u.department).filter(Boolean)))] as string[];
  const filteredUsers = departmentFilter === "all" ? users : users.filter((u) => u.department === departmentFilter);

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
                <div className="rounded-lg flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                  <p className="text-blue-600 font-bold">CMMS</p>
                </div>
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
              {user?.roles.some((r) => r.name === "admin") && <NavItem icon={<FiKey />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">{user?.roles?.[0]?.name}</p>
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
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Permissions</h2>
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Permission Management</h1>
              <p className="text-gray-600">Manage user roles and permissions</p>
            </motion.div>

            {/* Tab Navigation */}
            <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden mb-6">
              <div className="flex border-b border-blue-100">
                <button onClick={() => setActiveTab("roles")} className={`px-6 py-3 font-medium ${activeTab === "roles" ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
                  <div className="flex items-center">
                    <FiKey className="mr-2" />
                    Roles & Permissions
                  </div>
                </button>
                <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-medium ${activeTab === "users" ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
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
                  <h2 className="text-xl font-semibold">Roles</h2>
                  <button
                    onClick={() => {
                      setShowNewRoleForm(true);
                      setEditingRole({ id: "", name: "", description: "", permissions: [] });
                    }}
                    className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    <FiPlus className="mr-2" />
                    Add Role
                  </button>
                </div>

                {showNewRoleForm && (
                  <motion.div whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
                    <h3 className="text-lg font-semibold mb-4 text-gray-900">{editingRole?.id ? "Edit Role" : "Add New Role"}</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                        <input
                          type="text"
                          value={editingRole?.name || ""}
                          onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, name: e.target.value } : null))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="e.g., IT Manager"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        <input
                          type="text"
                          value={editingRole?.description || ""}
                          onChange={(e) => setEditingRole((prev) => (prev ? { ...prev, description: e.target.value } : null))}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                          placeholder="Brief description of the role"
                        />
                      </div>
                    </div>

                    <h4 className="font-medium text-gray-700 mb-3">Permissions</h4>
                    <div className="space-y-4">
                      {Object.entries(permissionsByCategory).map(([category, perms]) => (
                        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                          <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                            <span className="font-medium">{category}</span>
                            {expandedCategories[category] ? <FiChevronUp /> : <FiChevronDown />}
                          </button>
                          <AnimatePresence>
                            {expandedCategories[category] && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                transition={{ duration: 0.2 }}
                                className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                              >
                                {perms.map((permission) => (
                                  <div key={permission.id} className="flex items-center">
                                    <input
                                      type="checkbox"
                                      id={`perm-${permission.id}`}
                                      checked={editingRole?.permissions.includes(permission.id) || false}
                                      onChange={() => handleRolePermissionToggle(permission.id)}
                                      className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500"
                                    />
                                    <label htmlFor={`perm-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                      <div className="font-medium">{permission.name}</div>
                                      <div className="text-gray-500 text-xs">{permission.description}</div>
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
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                      >
                        Cancel
                      </motion.button>
                      <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveRole} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                        Save Role
                      </motion.button>
                    </div>
                  </motion.div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <motion.div key={role.id} whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-6 border border-blue-100 h-full">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setEditingRole(role);
                              setShowNewRoleForm(true);
                            }}
                            className="p-1 text-gray-500 hover:text-blue-600"
                            title="Edit"
                          >
                            <FiEdit2 />
                          </button>
                          {role.name !== "superadmin" && (
                            <button onClick={() => deleteRole(role.id)} className="p-1 text-gray-500 hover:text-red-600" title="Delete">
                              <FiTrash2 />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 text-sm mb-4">{role.description}</p>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Permissions:</span>
                          <span className="font-medium">{role.permissions.length}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">Users with this role:</span>
                          <span className="font-medium">{users.filter((u) => u.roleId === role.id).length}</span>
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
                  <h2 className="text-xl font-semibold">Users</h2>
                  <div className="flex space-x-4">
                    <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                      {uniqueDepartments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept === "all" ? "All Departments" : dept}
                        </option>
                      ))}
                    </select>
                    <button onClick={() => navigate("/users/new")} className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                      <FiUserPlus className="mr-2" />
                      Add User
                    </button>
                  </div>
                </div>

                <motion.div whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
                  <h3 className="text-lg font-semibold mb-4 text-gray-900">User Permissions</h3>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Name
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Email
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Department
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Role
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Custom Permissions
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-blue-100">
                        {filteredUsers.map((userItem) => (
                          <tr key={userItem.id} className="hover:bg-blue-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                  <FiUser className="text-xl" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{userItem.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.email}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{userItem.department || "-"}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${userItem.roleId === "r3" ? "bg-purple-100 text-purple-800" : userItem.roleId === "r2" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}
                              >
                                {roles.find((r) => r.id === userItem.roleId)?.name || "Unknown"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {userItem.customPermissions.length > 0 ? <span className="text-blue-600 font-medium">{userItem.customPermissions.length} added</span> : <span className="text-gray-400">None</span>}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button onClick={() => setEditingUser(userItem)} className="text-blue-600 hover:text-blue-900 mr-4">
                                Edit
                              </button>
                              {userItem.id !== user?.id && (
                                <button onClick={() => deleteUser(userItem.id)} className="text-red-600 hover:text-red-900">
                                  Delete
                                </button>
                              )}
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

      {/* Edit User Modal */}
      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-blue-100 p-4 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">Edit User Permissions</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                  <FiX className="text-xl" />
                </button>
              </div>

              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="text-gray-900 font-medium">{editingUser.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-600">{editingUser.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="text-gray-600">{editingUser.department || "-"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editingUser.roleId}
                      onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, roleId: e.target.value } : null))}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {roles.map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="font-medium text-gray-700 mb-3">Custom Permissions (in addition to role permissions)</h4>
                <div className="space-y-4">
                  {Object.entries(permissionsByCategory).map(([category, perms]) => (
                    <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(category)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100">
                        <span className="font-medium">{category}</span>
                        {expandedCategories[category] ? <FiChevronUp /> : <FiChevronDown />}
                      </button>
                      <AnimatePresence>
                        {expandedCategories[category] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3"
                          >
                            {perms.map((permission) => {
                              const roleHasPermission = getRolePermissions(editingUser.roleId).includes(permission.id);
                              const userHasPermission = editingUser.customPermissions.includes(permission.id);
                              const isDisabled = roleHasPermission;

                              return (
                                <div key={permission.id} className={`flex items-center ${isDisabled ? "opacity-50" : ""}`}>
                                  <input
                                    type="checkbox"
                                    id={`user-perm-${permission.id}`}
                                    checked={userHasPermission || roleHasPermission}
                                    onChange={() => !isDisabled && handleUserPermissionToggle(permission.id)}
                                    disabled={isDisabled}
                                    className={`h-4 w-4 rounded focus:ring-blue-500 
                                      ${roleHasPermission ? "text-purple-600" : "text-blue-600"}`}
                                  />
                                  <label htmlFor={`user-perm-${permission.id}`} className="ml-2 text-sm text-gray-700">
                                    <div className="font-medium flex items-center">
                                      {permission.name}
                                      {roleHasPermission && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">from role</span>}
                                    </div>
                                    <div className="text-gray-500 text-xs">{permission.description}</div>
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

              <div className="flex justify-end space-x-3 p-4 border-t border-blue-100 sticky bottom-0 bg-white">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setEditingUser(null)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveUser} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
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
