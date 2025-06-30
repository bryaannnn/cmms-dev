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
  FiLock,
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
};

const PermissionsPage: React.FC = () => {
  const { user, logout, fetchWithAuth, getUsers } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const allPermissions: PermissionName[] = [
    "view_dashboard",
    "edit_dashboard",
    "view_assets",
    "create_assets",
    "edit_assets",
    "delete_assets",
    "view_workorders",
    "create_workorders",
    "assign_workorders",
    "complete_workorders",
    "view_reports",
    "export_reports",
    "view_settings",
    "edit_settings",
    "view_permissions",
    "edit_permissions",
    "manage_users",
  ];

  const [allRoles, setAllRoles] = useState<Role[]>([
    { id: "1", name: "admin", description: "Admin role", permissions: allPermissions.filter((p) => !["edit_permissions"].includes(p)), isITRole: true },
    { id: "2", name: "technician", description: "Technician role", permissions: ["view_workorders", "complete_workorders"], isITRole: false },
    { id: "3", name: "superadmin", description: "Super Admin role", permissions: allPermissions, isITRole: true },
  ]);

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

  const hasPermission = (permission: PermissionName): boolean => {
    if (user?.permissions?.includes(permission)) return true;
    if (user?.roles?.includes("superadmin")) return true;
    if (user?.roles?.includes("admin") && !["edit_permissions"].includes(permission)) return true;
    return false;
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        setIsLoading(true);
        const fetchedUsers = await getUsers();
        setUsers(fetchedUsers);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      } finally {
        setIsLoading(false);
      }
    };
    if (hasPermission("manage_users")) fetchUsersData();
  }, [getUsers]);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    setSidebarOpen(newState);
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
  };

  const handleRolePermissionToggle = (permissionId: PermissionName) => {
    if (!editingRole) return;
    setEditingRole((prev) =>
      prev
        ? {
            ...prev,
            permissions: prev.permissions.includes(permissionId) ? prev.permissions.filter((id) => id !== permissionId) : [...prev.permissions, permissionId],
          }
        : null
    );
  };

  const saveRole = async () => {
    if (!editingRole) return;
    try {
      setIsLoading(true);
      if (editingRole.id) {
        setRoles((prev) => prev.map((role) => (role.id === editingRole.id ? editingRole : role)));
      } else {
        setRoles((prev) => [...prev, { ...editingRole, id: `role-${Date.now()}` }]);
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
    try {
      setIsLoading(true);
      await fetchWithAuth(`/users/${editingUser.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roleId: editingUser.roleId,
          customPermissions: editingUser.customPermissions,
        }),
      });
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const deleteUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      setIsLoading(true);
      await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
      const fetchedUsers = await getUsers();
      setUsers(fetchedUsers);
    } catch (error) {
      console.error("Failed to delete user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUsers =
    departmentFilter === "all"
      ? users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase()))
      : users.filter((u) => u.department === departmentFilter && (u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.email.toLowerCase().includes(searchQuery.toLowerCase())));

  return (
    <div className={`flex h-screen font-sans ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{ width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80 }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3 }}
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
              <button onClick={toggleSidebar} className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"}`}>
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />
              {hasPermission("manage_users") && <NavItem icon={<FiKey />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
            </nav>

            <div className={`p-4 ${darkMode ? "border-gray-700" : "border-blue-100"} border-t`}>
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className={`w-10 h-10 rounded-full border-2 ${darkMode ? "border-blue-400" : "border-blue-500"}`} />
                {sidebarOpen && (
                  <div>
                    <p className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{user?.name}</p>
                    <p className={`text-sm ${darkMode ? "text-gray-400" : "text-gray-600"}`}>{user?.roles?.[0] || user?.roleId}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} border-b p-4 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={toggleSidebar} className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"}`}>
                <FiChevronRight className="text-xl" />
              </button>
            )}
            <FiKey className={`text-2xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Permissions</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-6xl mx-auto">
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
                        setEditingRole({ id: "", name: "", description: "", permissions: [] });
                      }}
                      className={`flex items-center px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}
                    >
                      <FiPlus className="mr-2" />
                      Add Role
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {roles.map((role) => (
                    <motion.div key={role.id} whileHover={{ y: -2 }} className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 border h-full`}>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className={`text-lg font-semibold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>
                          {role.name}
                          {role.isITRole && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">IT Role</span>}
                        </h3>
                        {hasPermission("edit_permissions") && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => {
                                setEditingRole(role);
                                setShowNewRoleForm(true);
                              }}
                              className={`p-1 ${darkMode ? "text-gray-400 hover:text-blue-400" : "text-gray-500 hover:text-blue-600"}`}
                            >
                              <FiEdit2 />
                            </button>
                          </div>
                        )}
                      </div>
                      <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} text-sm mb-4`}>{role.description}</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>Permissions:</span>
                          <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-900"}`}>{role.permissions.length}</span>
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
                        className={`${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      />
                      <FiUser className={`absolute left-3 top-3 ${darkMode ? "text-gray-400" : "text-gray-500"}`} />
                    </div>
                    {hasPermission("manage_users") && (
                      <Link to="/permissions/adduser" className={`flex items-center px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}>
                        <FiUserPlus className="mr-2" />
                        Add User
                      </Link>
                    )}
                  </div>
                </div>

                <div className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 mb-6 border`}>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-blue-100">
                      <thead className={darkMode ? "bg-gray-700" : "bg-gray-50"}>
                        <tr>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Name</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Email</th>
                          <th className={`px-6 py-3 text-left text-xs font-medium uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Role</th>
                          <th className={`px-6 py-3 text-right text-xs font-medium uppercase ${darkMode ? "text-gray-300" : "text-gray-500"}`}>Actions</th>
                        </tr>
                      </thead>
                      <tbody className={`${darkMode ? "bg-gray-800 divide-gray-700" : "bg-white divide-blue-100"} divide-y`}>
                        {filteredUsers.map((userItem) => {
                          const role = roles.find((r) => r.id === userItem.roleId);
                          return (
                            <tr key={userItem.id} className={darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className={`flex-shrink-0 h-10 w-10 rounded-full ${darkMode ? "bg-gray-600" : "bg-blue-100"} flex items-center justify-center ${darkMode ? "text-blue-400" : "text-blue-600"}`}>
                                    <FiUser className="text-xl" />
                                  </div>
                                  <div className="ml-4">
                                    <div className={`text-sm font-medium ${darkMode ? "text-gray-100" : "text-gray-900"}`}>{userItem.name}</div>
                                  </div>
                                </div>
                              </td>
                              <td className={`px-6 py-4 whitespace-nowrap text-sm ${darkMode ? "text-gray-300" : "text-gray-500"}`}>{userItem.email}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span
                                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                  ${
                                    role?.name === "superadmin"
                                      ? darkMode
                                        ? "bg-purple-900 text-purple-300"
                                        : "bg-purple-100 text-purple-800"
                                      : role?.name === "admin"
                                      ? darkMode
                                        ? "bg-green-900 text-green-300"
                                        : "bg-green-100 text-green-800"
                                      : darkMode
                                      ? "bg-blue-900 text-blue-300"
                                      : "bg-blue-100 text-blue-800"
                                  }`}
                                >
                                  {role?.name || "No Role"}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {hasPermission("manage_users") && (
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
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {editingUser && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} className={`${darkMode ? "bg-gray-800" : "bg-white"} rounded-xl shadow-2xl w-full max-w-2xl`}>
            <div className={`flex justify-between items-center ${darkMode ? "border-gray-700" : "border-blue-100"} border-b p-4`}>
              <h3 className={`text-xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Edit User</h3>
              <button onClick={() => setEditingUser(null)} className={darkMode ? "text-gray-400 hover:text-gray-200" : "text-gray-500 hover:text-gray-700"}>
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role</label>
                  <select
                    value={editingUser.roleId || ""}
                    onChange={(e) => setEditingUser((prev) => (prev ? { ...prev, roleId: e.target.value } : null))}
                    className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id} disabled={role.name === "superadmin" && !user?.roles?.includes("superadmin")}>
                        {role.name}
                        {role.name === "superadmin" && <FiLock className="inline ml-2" size={12} />}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={`flex justify-end space-x-3 p-4 ${darkMode ? "border-gray-700" : "border-blue-100"} border-t`}>
              <button onClick={() => setEditingUser(null)} className={`px-4 py-2 ${darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} border rounded-md`}>
                Cancel
              </button>
              <button onClick={saveUser} className={`px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md`}>
                Save Changes
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
};

const NavItem: React.FC<{
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();

  const active = location.pathname === to;

  return (
    <button
      onClick={() => navigate(to)}
      className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
        ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
      `}
    >
      <span className="text-xl">{icon}</span>
      {expanded && <span className="ml-3 text-base">{text}</span>}
    </button>
  );
};

export default PermissionsPage;
