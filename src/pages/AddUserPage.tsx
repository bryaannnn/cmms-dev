import React, { useState, useEffect } from "react";
import { FiUser, FiUserPlus, FiKey, FiSave, FiX, FiChevronDown, FiChevronUp, FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import Sidebar from "../component/Sidebar"; // Assuming Sidebar is in ../component/Sidebar

interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSuperadmin?: boolean;
}

interface Department {
  id: string;
  name: string;
}

const permissionCategories = ["Dashboard", "Assets", "Work Orders", "Machine History", "Inventory", "Reports", "Team", "Settings", "Permissions", "Users"];

const permissions: Permission[] = [
  { id: "1", name: "View Dashboard", description: "Can view dashboard", category: "Dashboard" },
  { id: "2", name: "Edit Dashboard", description: "Can edit dashboard", category: "Dashboard" },
  { id: "3", name: "View Assets", description: "Can view assets", category: "Assets" },
  { id: "4", name: "Create Assets", description: "Can create assets", category: "Assets" },
  { id: "5", name: "Edit Assets", description: "Can edit assets", category: "Assets" },
  { id: "6", name: "Delete Assets", description: "Can delete assets", category: "Assets" },
  { id: "7", name: "View Work Orders", description: "Can view work orders", category: "Work Orders" },
  { id: "8", name: "Create Work Orders", description: "Can create work orders", category: "Work Orders" },
  { id: "9", name: "Assign Work Orders", description: "Can assign work orders", category: "Work Orders" },
  { id: "10", name: "Complete Work Orders", description: "Can complete work orders", category: "Work Orders" },
  { id: "18", name: "Edit Work Orders", description: "Can edit work orders", category: "Work Orders" },
  { id: "19", name: "Delete Work Orders", description: "Can delete work orders", category: "Work Orders" },
  { id: "31", name: "View Machine History", description: "Can view machine history", category: "Machine History" },
  { id: "32", name: "Create Machine History", description: "Can create machine history", category: "Machine History" },
  { id: "33", name: "Edit Machine History", description: "Can edit machine history", category: "Machine History" },
  { id: "34", name: "Delete Machine History", description: "Can delete machine history", category: "Machine History" },
  { id: "23", name: "View Inventory", description: "Can view inventory", category: "Inventory" },
  { id: "24", name: "Create Inventory", description: "Can create inventory", category: "Inventory" },
  { id: "25", name: "Edit Inventory", description: "Can edit inventory", category: "Inventory" },
  { id: "26", name: "Delete Inventory", description: "Can delete inventory", category: "Inventory" },
  { id: "11", name: "View Reports", description: "Can view reports", category: "Reports" },
  { id: "12", name: "Export Reports", description: "Can export reports", category: "Reports" },
  { id: "20", name: "Create Reports", description: "Can create reports", category: "Reports" },
  { id: "21", name: "Edit Reports", description: "Can edit reports", category: "Reports" },
  { id: "22", name: "Delete Reports", description: "Can delete reports", category: "Reports" },
  { id: "27", name: "View Team", description: "Can view team", category: "Team" },
  { id: "28", name: "Create Team", description: "Can create team", category: "Team" },
  { id: "29", name: "Edit Team", description: "Can edit team", category: "Team" },
  { id: "30", name: "Delete Team", description: "Can delete team", category: "Team" },
  { id: "13", name: "View Settings", description: "Can view settings", category: "Settings" },
  { id: "14", name: "Edit Settings", description: "Can edit settings", category: "Settings" },
  { id: "15", name: "View Permissions", description: "Can view permissions", category: "Permissions" },
  { id: "16", name: "Edit Permissions", description: "Can edit permissions", category: "Permissions" },
  { id: "17", name: "Manage Users", description: "Can manage users", category: "Users" },
];

const AddUserPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, register, getRoles, hasPermission } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [newUser, setNewUser] = useState({
    name: "",
    nik: "",
    email: "",
    roleId: "",
    customPermissions: [] as string[],
    department: "",
    position: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Check for 'manage_users' permission
        // if (!hasPermission("manage_users")) {
        //   navigate("/unauthorized"); // Redirect if not authorized
        //   return;
        // }

        const fetchedRoles = await getRoles();
        setRoles(fetchedRoles);

        const fetchedDepartments = [
          { id: "1", name: "IT" },
          { id: "2", name: "HR" },
          { id: "3", name: "Finance" },
          { id: "4", name: "Operations" },
          { id: "5", name: "Maintenance" },
        ];
        setDepartments(fetchedDepartments);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      }
    };

    fetchData();
  }, [getRoles, hasPermission, navigate]);

  const permissionsByCategory = permissionCategories.reduce<Record<string, Permission[]>>((acc, category) => {
    acc[category] = permissions.filter((p) => p.category === category);
    return acc;
  }, {});

  const toggleCategory = (category: string) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const handlePermissionToggle = (permissionId: string) => {
    setNewUser((prev) => ({
      ...prev,
      customPermissions: prev.customPermissions.includes(permissionId) ? prev.customPermissions.filter((id) => id !== permissionId) : [...prev.customPermissions, permissionId],
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewUser((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!newUser.name.trim()) newErrors.name = "Name is required";
    if (!newUser.nik.trim()) newErrors.nik = "NIK is required";
    else if (!/^\d+$/.test(newUser.nik)) newErrors.nik = "NIK must be numeric";
    if (!newUser.password) newErrors.password = "Password is required";
    else if (newUser.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (newUser.password !== newUser.confirmPassword) newErrors.confirmPassword = "Passwords do not match";
    if (!newUser.department) newErrors.department = "Department is required";
    if (!newUser.roleId) newErrors.roleId = "Role is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getRolePermissions = (roleId: string): string[] => {
    const role = roles.find((r) => r.id === roleId);
    return role ? role.permissions : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(newUser.name, newUser.email, newUser.nik, newUser.password, newUser.department, newUser.position, newUser.roleId, newUser.customPermissions);

      navigate("/permissions", { state: { success: "User created successfully" } });
    } catch (error: any) {
      console.error("Failed to create user:", error);
      setErrors({
        form: error.message || "Failed to create user. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // If unauthorized, render a simple message
  if (!hasPermission("manage_users")) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
        <div className="text-xl">You don't have permission to access this page</div>
      </div>
    );
  }

  return (
    <div className={`flex h-screen font-sans antialiased ${darkMode ? "dark bg-gray-900" : "bg-blue-50"} text-gray-900`}>
      <Sidebar /> {/* Sidebar component */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-100"} border-b p-4 flex items-center justify-between shadow-sm sticky top-0 z-30`}>
          <div className="flex items-center space-x-4">
            <motion.button
              onClick={() => navigate("/permissions")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-blue-600 hover:text-blue-800"} flex items-center transition-colors duration-200`}
            >
              <FiArrowLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline ml-2">Back to Permissions</span>
            </motion.button>
            <h2 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-lg md:text-xl font-bold ml-4`}>Add New User</h2>
          </div>

          <div className="flex items-center space-x-3 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200`}
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button
              whileHover={{ backgroundColor: darkMode ? "rgba(55, 65, 81, 0.7)" : "rgba(239, 246, 255, 0.7)" }}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200 ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"}`}
            >
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                alt="User Avatar"
                className={`w-8 h-8 rounded-full ${darkMode ? "border-gray-600" : "border-blue-200"} border`}
              />
              <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"} text-sm hidden sm:inline`}>{user?.name}</span>
              <FiChevronDown className={darkMode ? "text-gray-400" : "text-gray-500"} />
            </motion.button>
          </div>
        </header>

        <main className={`flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar ${darkMode ? "bg-gray-900" : "bg-gray-50"}`}>
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className={`${darkMode ? "text-gray-100" : "text-gray-900"} text-2xl md:text-3xl font-bold`}>Add New User</h1>
              <p className={`${darkMode ? "text-gray-400" : "text-gray-600"} mt-1`}>Fill out the form below to add a new user to the system.</p>
            </div>
            <motion.button
              onClick={() => navigate("/permissions")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className={`${
                darkMode ? "bg-gray-800 border-gray-700 text-gray-200 hover:bg-gray-700" : "bg-white border-gray-200 text-gray-800 hover:bg-blue-50"
              } flex items-center space-x-2 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md border`}
            >
              <FiArrowLeft className="text-lg" />
              <span className="font-semibold">Back to Permissions</span>
            </motion.button>
          </motion.div>

          {errors.form && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${darkMode ? "bg-red-900 border-red-700 text-red-200" : "bg-red-100 border-red-400 text-red-700"} px-4 py-3 rounded relative border mb-6`}
              role="alert"
            >
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {errors.form}</span>
            </motion.div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-50"} rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border mb-6`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>User Information</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Full Name*</label>
                  <input
                    type="text"
                    name="name"
                    value={newUser.name}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter full name"
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>NIK (Employee ID)*</label>
                  <input
                    type="text"
                    name="nik"
                    value={newUser.nik}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter NIK (numeric only)"
                  />
                  {errors.nik && <p className="mt-1 text-sm text-red-600">{errors.nik}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Email*</label>
                  <input
                    type="text"
                    name="email"
                    value={newUser.email}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter Email"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Department*</label>
                  <select
                    name="department"
                    value={newUser.department}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.name}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department && <p className="mt-1 text-sm text-red-600">{errors.department}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Position</label>
                  <input
                    type="text"
                    name="position"
                    value={newUser.position}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter position"
                  />
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Password*</label>
                  <input
                    type="password"
                    name="password"
                    value={newUser.password}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Enter password (min 6 chars)"
                  />
                  {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Confirm Password*</label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={newUser.confirmPassword}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                </div>
                <div>
                  <label className={`block text-sm font-medium ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role*</label>
                  <select
                    name="roleId"
                    value={newUser.roleId}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full border ${
                      darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-200 bg-white text-gray-900"
                    } rounded-lg shadow-sm p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200`}
                  >
                    <option value="">Select Role</option>
                    {roles.map((role) => (
                      <option key={role.id} value={role.id}>
                        {role.name}
                      </option>
                    ))}
                  </select>
                  {errors.roleId && <p className="mt-1 text-sm text-red-600">{errors.roleId}</p>}
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-50"} rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border mb-6`}
            >
              <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Custom Permissions</h3>
              <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Select additional permissions beyond the user's role. Permissions already included in the role are disabled.</p>

              <div className="space-y-4">
                {Object.entries(permissionsByCategory).map(([category, perms]) => (
                  <div key={category} className={`${darkMode ? "border-gray-700" : "border-gray-200"} border rounded-lg overflow-hidden`}>
                    <button
                      type="button"
                      onClick={() => toggleCategory(category)}
                      className={`w-full flex justify-between items-center p-3 ${darkMode ? "bg-gray-700 hover:bg-gray-600" : "bg-gray-50 hover:bg-gray-100"} transition-colors duration-200`}
                    >
                      <span className={`font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>{category}</span>
                      {expandedCategories[category] ? <FiChevronUp className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} /> : <FiChevronDown className={`${darkMode ? "text-gray-400" : "text-gray-500"}`} />}
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
                            const roleHasPermission = newUser.roleId ? getRolePermissions(newUser.roleId).includes(permission.id) : false;
                            const userHasPermission = newUser.customPermissions.includes(permission.id);
                            const isDisabled = roleHasPermission;

                            return (
                              <div key={permission.id} className={`flex items-center ${isDisabled ? "opacity-50" : ""}`}>
                                <input
                                  type="checkbox"
                                  id={`perm-${permission.id}`}
                                  checked={userHasPermission || roleHasPermission}
                                  onChange={() => !isDisabled && handlePermissionToggle(permission.id)}
                                  disabled={isDisabled}
                                  className={`h-4 w-4 rounded focus:ring-blue-500
                                  ${roleHasPermission ? (darkMode ? "text-purple-400 bg-gray-700 border-gray-600" : "text-purple-600") : darkMode ? "text-blue-400 bg-gray-700 border-gray-600" : "text-blue-600"} border-gray-300`}
                                />
                                <label htmlFor={`perm-${permission.id}`} className={`ml-2 text-sm ${darkMode ? "text-gray-300" : "text-gray-700"}`}>
                                  <div className="font-medium flex items-center">
                                    {permission.name}
                                    {roleHasPermission && <span className={`ml-2 text-xs ${darkMode ? "bg-purple-900 text-purple-300" : "bg-purple-100 text-purple-800"} px-2 py-0.5 rounded`}>from role</span>}
                                  </div>
                                  <div className={`${darkMode ? "text-gray-500" : "text-gray-500"} text-xs`}>{permission.description}</div>
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
            </motion.div>

            <div className="flex justify-end space-x-3 mt-6">
              <motion.button
                type="button"
                onClick={() => navigate("/permissions")}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`${
                  darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-200 text-gray-700 hover:bg-blue-50"
                } inline-flex items-center px-5 py-2.5 border text-base font-medium rounded-md shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200`}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting}
                className={`inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white ${
                  darkMode ? "bg-blue-700 hover:bg-blue-800" : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  <>
                    <FiUserPlus className="mr-2 h-5 w-5" />
                    Create User
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </main>
      </div>
    </div>
  );
};

export default AddUserPage;
