import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Department, useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import Sidebar from "../component/Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus,
  Upload,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  Package,
  Clipboard,
  Database,
  BarChart2,
  Users,
  Settings,
  Key,
  LogOut,
  Bell,
  Edit,
  Trash2,
  Save,
  X,
  Search,
  UserPlus,
  User,
  AlertTriangle,
  CheckCircle,
  Eye,
  Calendar,
} from "lucide-react";
import PageHeader from "../component/PageHeader";

interface Permission {
  [key: string]: string;
}

interface PagePermissions {
  [key: string]: Permission;
}

interface RoleApiPayload {
  name: string;
  description: string;
  permissions: string[];
  isSuperadmin?: boolean;
}

interface Role {
  id: string | null;
  name: string;
  description: string;
  permissions: string[];
  isSuperadmin: boolean;
}

interface User {
  id: string;
  name: string;
  nik: string;
  email: string;
  roleId: string | null;
  permissions: string[];
  customPermissions: string[];
  department?: Department | null;
  department_id: number | null;
  rolePermissions?: string[];
}

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

const pagePermissionMapping: PagePermissions = {
  dashboard: { view: "1", edit: "2" },
  assets: { view: "3", create: "4", edit: "5", delete: "6" },
  workorders: { view: "7", create: "8", assign: "9", complete: "10", edit: "18", delete: "19" },
  machinehistory: { view: "31", create: "32", edit: "33", delete: "34" },
  inventory: { view: "23", create: "24", edit: "25", delete: "26" },
  reports: { view: "11", create: "20", edit: "21", export: "12", delete: "22" },
  teams: { view: "27", create: "28", edit: "29", delete: "30" },
  settings: { view: "13", edit: "14" },
  permissions: { view: "15", edit: "16" },
  users: { manage: "17" },
};

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

interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Peringatan Mesin A",
    description: "Suhu mesin A melebihi batas normal.",
    date: "Today, 10:00 AM",
    icon: <AlertTriangle className="text-red-500" />,
  },
  {
    id: 2,
    title: "Jadwal Perawatan Mendatang",
    description: "Perawatan rutin untuk Mesin B akan dilakukan besok.",
    date: "Yesterday, 03:00 PM",
    icon: <Calendar className="text-blue-500" />,
  },
];

const PermissionsPage: React.FC = () => {
  const { user, logout, fetchWithAuth, getUsers, hasPermission, updateUserPermissions, deleteUser, createRole, updateRole } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [activeTab, setActiveTab] = useState<"roles" | "users">("roles");
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [showNewRoleForm, setShowNewRoleForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [fetchedUsers, fetchedRoles] = await Promise.all([getUsers(), fetchWithAuth("/roles")]);

        const mappedUsers = fetchedUsers.map((user: any) => ({
          id: String(user.id),
          name: user.name,
          nik: user.nik,
          email: user.email,
          roleId: user.roleId ? String(user.roleId) : null,
          customPermissions: user.customPermissions || [],
          department: user.department.name || "none",
          department_id: user.department_id || null,
          permissions: user.allPermissions,
        }));

        const mappedRoles = fetchedRoles.map((role: any) => ({
          id: String(role.id),
          name: role.name,
          description: role.description || `${role.name} role`,
          permissions: role.permissions.map(String),
          isSuperadmin: role.name === "superadmin",
        }));

        setUsers(mappedUsers);
        setRoles(mappedRoles);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    if (hasPermission("view_permissions")) fetchData();
  }, [getUsers, fetchWithAuth, hasPermission]);

  const toggleSidebar = () => {
    setSidebarOpen((prev: boolean): boolean => !prev);
  };

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handleRolePermissionToggle = (permissionId: string) => {
    if (!editingRole || editingRole.isSuperadmin) return;

    setEditingRole((prev) => ({
      ...prev!,
      permissions: prev!.permissions.includes(permissionId) ? prev!.permissions.filter((id) => id !== permissionId) : [...prev!.permissions, permissionId],
    }));
  };

  const handleUserPermissionToggle = (permissionId: string) => {
    if (!editingUser || editingUser.roleId === "3") return;

    setEditingUser((prev) => {
      if (!prev) return null;

      const newCustomPermissions = prev.customPermissions.includes(permissionId) ? prev.customPermissions.filter((id) => id !== permissionId) : [...prev.customPermissions, permissionId];

      return {
        ...prev,
        customPermissions: newCustomPermissions,
        permissions: [...new Set([...(prev.rolePermissions || []), ...newCustomPermissions])],
      };
    });
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setShowNewRoleForm(true);
  };

  const saveRole = useCallback(async () => {
    if (!editingRole || !hasPermission("edit_permissions")) {
      alert("You don't have permission or role data is incomplete.");
      return;
    }

    if (!editingRole.name.trim()) {
      alert("Role name cannot be empty!");
      return;
    }

    try {
      const roleDataToSend: RoleApiPayload = {
        name: editingRole.name,
        description: editingRole.description,
        permissions: editingRole.permissions,
      };

      if (editingRole.id) {
        await updateRole(editingRole.id, roleDataToSend);
      } else {
        await createRole(roleDataToSend);
      }

      const fetchedRoles = await fetchWithAuth("/roles");
      const mappedRoles = fetchedRoles.map((role: any) => ({
        id: String(role.id),
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(String),
        isSuperadmin: role.name === "superadmin",
      }));
      setRoles(mappedRoles);

      setShowNewRoleForm(false);
      setEditingRole(null);
    } catch (error) {
      console.error("Failed to save role:", error);
    }
  }, [editingRole, hasPermission, updateRole, createRole, fetchWithAuth]);

  const handleEditUser = (user: User) => {
    const userRole = roles.find((r) => String(r.id) === String(user.roleId));
    setEditingUser({
      ...user,
      rolePermissions: userRole?.permissions || [],
      customPermissions: user.customPermissions || [],
      permissions: user.permissions || [],
    });
  };

  const saveUser = async () => {
    if (!editingUser) return;

    try {
      const updatedUser = await updateUserPermissions(editingUser.id, {
        roleId: editingUser.roleId || null,
        customPermissions: editingUser.customPermissions || [],
      });

      setUsers(
        users.map((u) => {
          if (u.id === updatedUser.id) {
            const newRoleId = updatedUser.roleId || null;
            const newRole = roles.find((r) => String(r.id) === String(newRoleId));
            const newRolePermissions = newRole?.permissions || [];
            const newCustomPermissions = updatedUser.customPermissions || [];
            const combinedPermissions = [...new Set([...newRolePermissions, ...newCustomPermissions])];

            return {
              ...updatedUser,
              roleId: newRoleId,
              customPermissions: newCustomPermissions,
              rolePermissions: newRolePermissions,
              permissions: combinedPermissions,
            };
          }
          return u;
        })
      );

      setEditingUser(null);
    } catch (error) {
      console.error("Failed to save user:", error);
    }
  };

  const deleteRole = async (id: string | null) => {
    if (!hasPermission("manage_users") || !window.confirm("Are you sure you want to delete this role?")) return;

    try {
      await fetchWithAuth(`/roles/${id}`, { method: "DELETE" });
      const fetchedRoles = await fetchWithAuth("/roles");
      const mappedRoles = fetchedRoles.map((role: any) => ({
        id: String(role.id),
        name: role.name,
        description: role.description,
        permissions: role.permissions.map(String),
        isSuperadmin: role.name === "superadmin",
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error("Failed to delete role:", error);
    }
  };

  const handleDeleteUser = useCallback(
    async (userId: string) => {
      if (window.confirm("Are you sure you want to delete this user?")) {
        setIsDeleting(true);
        try {
          await deleteUser(userId);
          const updatedUsers = await getUsers();
          setUsers(updatedUsers as User[]);
        } catch (error) {
          console.error("Failed to delete user:", error);
        } finally {
          setIsDeleting(false);
        }
      }
    },
    [deleteUser, getUsers]
  );

  const getRoleName = (roleId: string | null) => {
    if (!roleId) return "No Role";
    const role = roles.find((r) => String(r.id) === String(roleId));
    return role ? role.name : "No Role";
  };

  const uniqueDepartments = ["all", ...new Set(users.map((u) => u.department?.name || "").filter(Boolean))];
  const filteredUsers = users
    .filter((user) => departmentFilter === "all" || user.department?.name === departmentFilter)
    .filter((user) => user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.nik.toLowerCase().includes(searchQuery.toLowerCase()));

  if (!hasPermission("15")) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 font-sans">
        <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-red-200">
          <AlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-xl text-red-600 font-semibold">You don't have permission to access this page</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Permission"
          mainTitleHighlight="Management"
          description="Manage user roles and permissions to control access and functionality within the system."
          icon={<Key />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Permission <span className="text-blue-600">Management</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">Manage user roles and permissions to control access and functionality within the system.</p>
            </div>
          </motion.div>

          <div className="bg-white rounded-2xl shadow-md p-5 border border-blue-100 mb-6">
            <div className="flex border-b border-gray-100">
              <button onClick={() => setActiveTab("roles")} className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === "roles" ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
                <Key className="mr-2 text-base" />
                Roles & Permissions
              </button>
              <button onClick={() => setActiveTab("users")} className={`px-6 py-3 font-medium text-sm flex items-center ${activeTab === "users" ? "text-blue-700 border-b-2 border-blue-700" : "text-gray-600 hover:text-gray-900"}`}>
                <Users className="mr-2 text-base" />
                User Permissions
              </button>
            </div>
          </div>

          {activeTab === "roles" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Roles</h2>
                {hasPermission("16") && (
                  <motion.button
                    onClick={() => {
                      setShowNewRoleForm(true);
                      setEditingRole({
                        id: null,
                        name: "",
                        description: "",
                        permissions: [],
                        isSuperadmin: false,
                      });
                    }}
                    whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
                  >
                    <Plus className="text-base" />
                    <span>Add Role</span>
                  </motion.button>
                )}
              </div>

              {showNewRoleForm && (
                <motion.div whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-2xl shadow-md p-6 mb-6 border border-blue-100">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">{editingRole?.id ? "Edit Role" : "Add New Role"}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Role Name</label>
                      <input
                        type="text"
                        value={editingRole?.name || ""}
                        onChange={(e) => setEditingRole((prev) => ({ ...prev!, name: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="e.g., Maintenance Manager"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <input
                        type="text"
                        value={editingRole?.description || ""}
                        onChange={(e) => setEditingRole((prev) => ({ ...prev!, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Brief description of the role"
                      />
                    </div>
                  </div>

                  <h4 className="font-medium text-gray-700 mb-3">Permissions</h4>
                  <div className="space-y-4">
                    {Object.entries(pagePermissionMapping).map(([page, permissions]) => (
                      <div key={page} className="border border-gray-200 rounded-lg overflow-hidden">
                        <button onClick={() => toggleCategory(page)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                          <span className="font-medium text-gray-700 capitalize">{page.replace(/([A-Z])/g, " $1").trim()}</span>
                          {expandedCategories[page] ? <ChevronUp /> : <ChevronDown />}
                        </button>
                        <AnimatePresence>
                          {expandedCategories[page] && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white"
                            >
                              {Object.entries(permissions).map(([action, permissionId]) => (
                                <div key={permissionId} className="flex items-center">
                                  <input
                                    type="checkbox"
                                    id={`perm-${permissionId}`}
                                    checked={editingRole?.isSuperadmin || editingRole?.permissions.includes(permissionId) || false}
                                    onChange={() => handleRolePermissionToggle(permissionId)}
                                    disabled={editingRole?.isSuperadmin}
                                    className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                                  />
                                  <label htmlFor={`perm-${permissionId}`} className="ml-2 text-sm text-gray-700">
                                    <div className="font-medium">
                                      {action} {page.replace(/([A-Z])/g, " $1").trim()}
                                      {editingRole?.isSuperadmin && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Superadmin</span>}
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
                      className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-sm"
                    >
                      Cancel
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveRole} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm">
                      Save Role
                    </motion.button>
                  </div>
                </motion.div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roles.map((role) => (
                  <motion.div key={role.id} whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-2xl shadow-sm p-6 border border-blue-100 h-full">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {role.name}
                        {role.isSuperadmin && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Superadmin</span>}
                      </h3>
                      <div className="flex space-x-2">
                        {!role.isSuperadmin && hasPermission("16") && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleEditRole(role)}
                            className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                            title="Edit"
                          >
                            <Edit className="text-base" />
                          </motion.button>
                        )}
                        {!role.isSuperadmin && hasPermission("17") && (
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => deleteRole(role.id)}
                            className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                            title="Delete"
                          >
                            <Trash2 className="text-base" />
                          </motion.button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">{role.description}</p>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Permissions:</span>
                        <span className="font-medium text-gray-900">{role.permissions.length}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">Users with this role:</span>
                        <span className="font-medium text-gray-900">{users.filter((u) => u.roleId === role.id).length}</span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Users</h2>
                <div className="flex flex-col md:flex-row space-y-3 md:space-y-0 md:space-x-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="border border-gray-300 rounded-lg px-3 py-2 pl-10 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
                    />
                  </div>
                  <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    {uniqueDepartments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept === "all" ? "All Departments" : dept}
                      </option>
                    ))}
                  </select>
                  {hasPermission("17") && (
                    <motion.button
                      whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate("/permissions/adduser")}
                      className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
                    >
                      <UserPlus className="text-base" />
                      <span>Add User</span>
                    </motion.button>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="min-w-full divide-y divide-blue-100">
                    <thead className="bg-blue-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">NIK</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Department</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Permissions</th>
                        <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-blue-100">
                      {filteredUsers.map((userItem) => (
                        <tr key={userItem.id} className="hover:bg-blue-50 transition-colors duration-150">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{userItem.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{userItem.nik}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{userItem.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{userItem.department?.name || "-"}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{getRoleName(userItem.roleId)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {userItem.roleId === "3" ? (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">All permissions</span>
                            ) : userItem.customPermissions?.length ? (
                              <span className="cursor-help border-b border-dashed border-gray-400" title={userItem.customPermissions.join(", ")}>
                                {userItem.customPermissions.length} custom
                              </span>
                            ) : (
                              <span className="italic text-gray-400">None</span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                            {hasPermission("edit_permissions") && (
                              <>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleEditUser(userItem)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 p-1 rounded-full hover:bg-blue-50"
                                  title="Edit"
                                >
                                  <Edit className="text-base" />
                                </motion.button>
                                {userItem.id !== user?.id && hasPermission("manage_users") && (
                                  <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => handleDeleteUser(userItem.id)}
                                    className="text-red-600 hover:text-red-800 transition-colors duration-200 p-1 rounded-full hover:bg-red-50"
                                    title="Delete"
                                  >
                                    <Trash2 className="text-base" />
                                  </motion.button>
                                )}
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {editingUser && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-gray-100 p-4 sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-gray-900">Edit User Permissions</h3>
                <button onClick={() => setEditingUser(null)} className="text-gray-500 hover:text-gray-700">
                  <X className="text-xl" />
                </button>
              </div>

              <div className="p-6">
                {!editingUser.roleId && (
                  <div className="p-3 bg-yellow-50 rounded-md mb-4">
                    <p className="text-yellow-700">⚠️ This user has no role assigned. Permissions will come only from custom permissions.</p>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                    <div className="font-medium text-gray-900">{editingUser.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                    <div className="text-gray-600">{editingUser.nik}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="text-gray-600">{editingUser.email}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                    <div className="text-gray-600">{editingUser.department?.name || "-"}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                    <select
                      value={editingUser.roleId || ""}
                      onChange={(e) => {
                        const newRoleId = e.target.value || null;
                        const newRole = roles.find((r) => String(r.id) === String(newRoleId));
                        setEditingUser({
                          ...editingUser,
                          roleId: newRoleId,
                          rolePermissions: newRole?.permissions || [],
                        });
                      }}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">No Role</option>
                      {roles.map((role) => (
                        <option key={role.id} value={String(role.id)}>
                          {role.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <h4 className="font-medium text-gray-700 mb-3">Custom Permissions</h4>
                <div className="space-y-4">
                  {Object.entries(pagePermissionMapping).map(([page, permissions]) => (
                    <div key={page} className="border border-gray-200 rounded-lg overflow-hidden">
                      <button onClick={() => toggleCategory(page)} className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200">
                        <span className="font-medium text-gray-700 capitalize">{page.replace(/([A-Z])/g, " $1").trim()}</span>
                        {expandedCategories[page] ? <ChevronUp /> : <ChevronDown />}
                      </button>
                      <AnimatePresence>
                        {expandedCategories[page] && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 bg-white"
                          >
                            {Object.entries(permissions).map(([action, permissionId]) => {
                              const roleHasPermission = editingUser.rolePermissions?.includes(permissionId) || false;
                              const isSuperadmin = editingUser.roleId === "3";
                              const isChecked = isSuperadmin || roleHasPermission || editingUser.customPermissions?.includes(permissionId);
                              const isDisabled = isSuperadmin || roleHasPermission;

                              return (
                                <div key={permissionId} className={`flex items-center ${isDisabled ? "opacity-50" : ""}`}>
                                  <input
                                    type="checkbox"
                                    id={`user-perm-${permissionId}`}
                                    checked={isChecked}
                                    onChange={() => !isDisabled && handleUserPermissionToggle(permissionId)}
                                    disabled={isDisabled}
                                    className={`h-4 w-4 rounded focus:ring-blue-500 ${isSuperadmin ? "text-blue-600" : roleHasPermission ? "text-purple-600" : "text-blue-600"}`}
                                  />
                                  <label htmlFor={`user-perm-${permissionId}`} className="ml-2 text-sm text-gray-700">
                                    <div className="font-medium flex items-center">
                                      {action} {page.replace(/([A-Z])/g, " $1").trim()}
                                      {isSuperadmin && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded">Superadmin</span>}
                                      {roleHasPermission && !isSuperadmin && <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded">from role</span>}
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

              <div className="flex justify-end space-x-3 p-4 border-t border-gray-100 sticky bottom-0 bg-white">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-lg transition-colors duration-200 font-medium text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={saveUser} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200 font-medium text-sm">
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
