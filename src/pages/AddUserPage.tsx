import React, { useState, useEffect } from "react";
import { FiUser, FiUserPlus, FiKey, FiSave, FiX, FiChevronDown, FiChevronUp, FiArrowLeft, FiSun, FiMoon } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

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
  const { user, register, getRoles, getUsers } = useAuth();
  const [darkMode, setDarkMode] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);

  const [newUser, setNewUser] = useState({
    name: "",
    nik: "",
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
        const fetchedRoles = await getRoles();
        setRoles(fetchedRoles);

        // Fetch departments from your API or define them statically
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
  }, [getRoles]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await register(
        newUser.name,
        newUser.nik,
        newUser.password,
        newUser.department,
        newUser.position,
        newUser.roleId, // Pass roleId
        newUser.customPermissions // Pass customPermissions
      );

      navigate("/permissions", { state: { userAdded: true } });
    } catch (error) {
      console.error("Failed to create user:", error);
      setErrors({ form: "Failed to create user. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getRolePermissions = (roleId: string): string[] => {
    return roles.find((r) => r.id === roleId)?.permissions || [];
  };

  return (
    <div className={`flex h-screen font-sans ${darkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} border-b p-4 flex items-center justify-between shadow-sm`}>
          <div className="flex items-center space-x-3">
            <button onClick={() => navigate("/permissions")} className={`p-2 rounded-full ${darkMode ? "text-gray-300 hover:bg-gray-700" : "text-gray-600 hover:bg-blue-50"} transition-colors duration-200`}>
              <FiArrowLeft className="text-xl" />
            </button>
            <FiUserPlus className={`text-2xl ${darkMode ? "text-blue-400" : "text-blue-600"}`} />
            <h2 className={`text-xl md:text-2xl font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>Add New User</h2>
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

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className={`flex items-center space-x-2 cursor-pointer p-2 rounded-lg ${darkMode ? "hover:bg-gray-700" : "hover:bg-blue-50"} transition-colors duration-200`}>
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className={`w-8 h-8 rounded-full ${darkMode ? "border-gray-600" : "border-blue-200"} border`} />
              <span className={`font-medium ${darkMode ? "text-gray-100" : "text-gray-900"} hidden sm:inline`}>{user?.name}</span>
              <FiChevronDown className={darkMode ? "text-gray-400" : "text-gray-500"} />
            </motion.div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
              <h1 className={`text-2xl font-bold ${darkMode ? "text-gray-100" : "text-gray-900"} mb-2`}>Create New User</h1>
              <p className={darkMode ? "text-gray-400" : "text-gray-600"}>Add a new user to the system with appropriate permissions</p>
            </motion.div>

            <form onSubmit={handleSubmit}>
              <motion.div
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 mb-6 border`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>User Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Full Name*</label>
                    <input
                      type="text"
                      name="name"
                      value={newUser.name}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter full name"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>NIK (Employee ID)*</label>
                    <input
                      type="text"
                      name="nik"
                      value={newUser.nik}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter NIK (numeric only)"
                    />
                    {errors.nik && <p className="mt-1 text-sm text-red-600">{errors.nik}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Department*</label>
                    <select
                      name="department"
                      value={newUser.department}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Position</label>
                    <input
                      type="text"
                      name="position"
                      value={newUser.position}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter position"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Password*</label>
                    <input
                      type="password"
                      name="password"
                      value={newUser.password}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Enter password (min 6 chars)"
                    />
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Confirm Password*</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={newUser.confirmPassword}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Confirm password"
                    />
                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-1 ${darkMode ? "text-gray-300" : "text-gray-700"}`}>Role*</label>
                    <select
                      name="roleId"
                      value={newUser.roleId}
                      onChange={handleInputChange}
                      className={`w-full ${darkMode ? "bg-gray-700 border-gray-600 text-gray-100" : "border-gray-300"} border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500`}
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
                whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }}
                transition={{ type: "spring", stiffness: 300 }}
                className={`${darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-blue-100"} rounded-xl shadow-sm p-6 mb-6 border`}
              >
                <h3 className={`text-lg font-semibold mb-4 ${darkMode ? "text-gray-100" : "text-gray-900"}`}>Custom Permissions</h3>
                <p className={`text-sm mb-4 ${darkMode ? "text-gray-400" : "text-gray-600"}`}>Select additional permissions beyond the user's role. Permissions already included in the role are disabled.</p>

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
                              const roleHasPermission = getRolePermissions(newUser.roleId).includes(permission.id);
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
                                      ${roleHasPermission ? (darkMode ? "text-purple-400 bg-gray-700 border-gray-600" : "text-purple-600") : darkMode ? "text-blue-400 bg-gray-700 border-gray-600" : "text-blue-600"}`}
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

              <div className="flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="button"
                  onClick={() => navigate("/permissions")}
                  className={`px-4 py-2 ${darkMode ? "border-gray-600 text-gray-200 hover:bg-gray-700" : "border-gray-300 text-gray-700 hover:bg-gray-50"} border rounded-md`}
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-4 py-2 ${darkMode ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-600 hover:bg-blue-700"} text-white rounded-md flex items-center`}
                >
                  {isSubmitting ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <>
                      <FiUserPlus className="mr-2" />
                      Create User
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AddUserPage;
