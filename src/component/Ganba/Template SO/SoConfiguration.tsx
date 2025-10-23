// GenbaSOConfiguration.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Users, Loader, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, GenbaSO, GenbaRole, User, Department } from "../../../routes/AuthContext";
import Sidebar from "../../Sidebar";
import PageHeader from "../../PageHeader";

interface DepartmentAssignment {
  id: number;
  department: string;
  department_id?: number;
  personnel: string;
  personnel_id?: number;
}

interface CoordinatorAssignment {
  id: number;
  name: string;
  user_id?: number;
  department?: string;
}

interface GenbaSOFormData {
  effective_date: string;
  penanggung_jawab: string;
  penanggung_jawab_id?: number;
  penanggung_jawab_department?: string;
  koordinators: CoordinatorAssignment[];
  department_koordinators: DepartmentAssignment[];
  department_komites: DepartmentAssignment[];
}

const SOConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getGenbaSOById, updateGenbaSO, getGenbaRoles, getUsers, getDepartment } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });

  const toggleSidebar = (): void => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const [template, setTemplate] = useState<GenbaSO | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<GenbaRole[]>([]);
  const [formData, setFormData] = useState<GenbaSOFormData>({
    effective_date: new Date().toISOString().split("T")[0],
    penanggung_jawab: "",
    koordinators: [],
    department_koordinators: [],
    department_komites: [],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (id) {
      loadTemplateData();
      loadMasterData();
    }
  }, [id]);

  const loadTemplateData = async () => {
    if (!id) {
      setError("Template ID is missing");
      return;
    }

    try {
      setLoading(true);
      const templateData = await getGenbaSOById(id);
      console.log("Template data loaded:", templateData);

      setTemplate(templateData);

      if (templateData.bridges && templateData.bridges.length > 0) {
        await parseTemplateBridges(templateData.bridges);
      }
    } catch (err) {
      setError("Failed to load template");
      console.error("Error loading template:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadMasterData = async () => {
    try {
      const [usersData, departmentsData, rolesData] = await Promise.all([getUsers(), getDepartment(), getGenbaRoles()]);

      setUsers(usersData);
      setDepartments(departmentsData);
      setRoles(rolesData);
    } catch (err) {
      console.error("Error loading master data:", err);
      setError("Failed to load master data");
    }
  };

  const parseTemplateBridges = (bridges: any[]) => {
    const newFormData: GenbaSOFormData = {
      effective_date: template?.effective_date ? template.effective_date.split("T")[0] : new Date().toISOString().split("T")[0],
      penanggung_jawab: "",
      koordinators: [],
      department_koordinators: [],
      department_komites: [],
    };

    console.log("Parsing bridges:", bridges);

    bridges.forEach((bridge) => {
      const user = bridge.user;
      const roleId = bridge.role.id;
      const roleName = bridge.role.name.toLowerCase();

      console.log(`Processing: Role ${roleId} (${roleName}) - User: ${user.name}`);

      switch (roleId) {
        case 1: // penanggung jawab 5S
          newFormData.penanggung_jawab = user.name;
          newFormData.penanggung_jawab_id = user.id;
          newFormData.penanggung_jawab_department = user.department?.name || "";
          console.log(`✓ Set as Penanggung Jawab: ${user.name}`);
          break;

        case 2: // koordinator 5S
          newFormData.koordinators.push({
            id: bridge.id,
            name: user.name,
            user_id: user.id,
            department: user.department?.name || "",
          });
          console.log(`✓ Added as Koordinator 5S: ${user.name}`);
          break;

        case 3: // koordinator 5S department
          newFormData.department_koordinators.push({
            id: bridge.id,
            department: user.department?.name || "",
            department_id: user.department?.id,
            personnel: user.name,
            personnel_id: user.id,
          });
          console.log(`✓ Added as Koordinator 5S Department: ${user.name}`);
          break;

        case 4: // komite 5S department
          newFormData.department_komites.push({
            id: bridge.id,
            department: user.department?.name || "",
            department_id: user.department?.id,
            personnel: user.name,
            personnel_id: user.id,
          });
          console.log(`✓ Added as Komite 5S Department: ${user.name}`);
          break;

        default:
          console.warn(`Unknown role ID: ${roleId} for user: ${user.name}`);
      }
    });

    console.log("Final parsed form data:", newFormData);
    setFormData(newFormData);
  };

  const handleEffectiveDateChange = (date: string) => {
    setFormData((prev) => ({ ...prev, effective_date: date }));
  };

  const handlePenanggungJawabChange = (userId: number) => {
    const selectedUser = users.find((user) => user.id === userId.toString());
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        penanggung_jawab: selectedUser.name,
        penanggung_jawab_id: userId,
        penanggung_jawab_department: selectedUser.department?.name || "",
      }));
    }
  };

  const handleAddCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      koordinators: [...prev.koordinators, { id: Date.now() + Math.random(), name: "" }],
    }));
  };

  const handleRemoveCoordinator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      koordinators: prev.koordinators.filter((_, i) => i !== index),
    }));
  };

  const handleCoordinatorChange = (index: number, userId: number) => {
    const selectedUser = users.find((user) => user.id === userId.toString());
    if (selectedUser) {
      setFormData((prev) => ({
        ...prev,
        koordinators: prev.koordinators.map((coord, i) =>
          i === index
            ? {
                ...coord,
                name: selectedUser.name,
                user_id: userId,
                department: selectedUser.department?.name || "",
              }
            : coord
        ),
      }));
    }
  };

  const handleAddDepartmentCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      department_koordinators: [
        ...prev.department_koordinators,
        {
          id: Date.now() + Math.random(),
          department: "",
          personnel: "",
        },
      ],
    }));
  };

  const handleRemoveDepartmentCoordinator = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      department_koordinators: prev.department_koordinators.filter((_, i) => i !== index),
    }));
  };

  const handleDepartmentCoordinatorChange = (index: number, field: "department" | "personnel", value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      department_koordinators: prev.department_koordinators.map((item, i) => {
        if (i === index) {
          if (field === "department") {
            const selectedDept = departments.find((dept) => dept.id === value || dept.name === value);
            return {
              ...item,
              department: selectedDept?.name || (value as string),
              department_id: selectedDept?.id,
              personnel: "", // Reset personnel when department changes
              personnel_id: undefined,
            };
          } else if (field === "personnel") {
            const selectedUser = users.find((user) => user.id === value.toString());
            return {
              ...item,
              personnel: selectedUser?.name || "",
              personnel_id: typeof value === "number" ? value : parseInt(value as string),
            };
          }
        }
        return item;
      }),
    }));
  };

  const handleAddDepartmentKomite = () => {
    setFormData((prev) => ({
      ...prev,
      department_komites: [
        ...prev.department_komites,
        {
          id: Date.now() + Math.random(),
          department: "",
          personnel: "",
        },
      ],
    }));
  };

  const handleRemoveDepartmentKomite = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      department_komites: prev.department_komites.filter((_, i) => i !== index),
    }));
  };

  const handleDepartmentKomiteChange = (index: number, field: "department" | "personnel", value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      department_komites: prev.department_komites.map((item, i) => {
        if (i === index) {
          if (field === "department") {
            const selectedDept = departments.find((dept) => dept.id === value || dept.name === value);
            return {
              ...item,
              department: selectedDept?.name || (value as string),
              department_id: selectedDept?.id,
              personnel: "", // Reset personnel when department changes
              personnel_id: undefined,
            };
          } else if (field === "personnel") {
            const selectedUser = users.find((user) => user.id === value.toString());
            return {
              ...item,
              personnel: selectedUser?.name || "",
              personnel_id: typeof value === "number" ? value : parseInt(value as string),
            };
          }
        }
        return item;
      }),
    }));
  };

  // Get users by department
  const getUsersByDepartment = (departmentName: string) => {
    if (!departmentName) return [];
    return users.filter((user) => user.department?.name === departmentName || user.department_name === departmentName);
  };

  // Get available users for selection (prevent duplicates)
  const getAvailableUsers = (currentRole: string, currentDepartment?: string) => {
    const usedUserIds = new Set();

    // Collect all used user IDs from other roles
    if (currentRole !== "penanggung_jawab" && formData.penanggung_jawab_id) {
      usedUserIds.add(formData.penanggung_jawab_id);
    }

    if (currentRole !== "koordinator") {
      formData.koordinators.forEach((coord) => {
        if (coord.user_id) usedUserIds.add(coord.user_id);
      });
    }

    if (currentRole !== "dept_coordinator") {
      formData.department_koordinators.forEach((dept) => {
        if (dept.personnel_id) usedUserIds.add(dept.personnel_id);
      });
    }

    if (currentRole !== "dept_komite") {
      formData.department_komites.forEach((dept) => {
        if (dept.personnel_id) usedUserIds.add(dept.personnel_id);
      });
    }

    let availableUsers = users.filter((user) => !usedUserIds.has(parseInt(user.id)));

    // Filter by department if specified
    if (currentDepartment) {
      availableUsers = availableUsers.filter((user) => user.department?.name === currentDepartment || user.department_name === currentDepartment);
    }

    return availableUsers;
  };

  const validateForm = (): boolean => {
    if (!formData.effective_date) {
      setError("Effective Date is required");
      return false;
    }

    if (!formData.penanggung_jawab) {
      setError("Penanggung Jawab 5S is required");
      return false;
    }

    if (formData.koordinators.length < 3) {
      setError("Minimum 3 Koordinator 5S required");
      return false;
    }

    // Check for duplicate users across roles
    const allUserIds = new Set();

    if (formData.penanggung_jawab_id) {
      allUserIds.add(formData.penanggung_jawab_id);
    }

    for (const coord of formData.koordinators) {
      if (coord.user_id) {
        if (allUserIds.has(coord.user_id)) {
          setError(`User sudah dipilih di role lain: ${coord.name}`);
          return false;
        }
        allUserIds.add(coord.user_id);
      }
      if (!coord.name) {
        setError("All Koordinator 5S must be assigned");
        return false;
      }
    }

    for (const deptCoord of formData.department_koordinators) {
      if (deptCoord.personnel_id) {
        if (allUserIds.has(deptCoord.personnel_id)) {
          setError(`User sudah dipilih di role lain: ${deptCoord.personnel}`);
          return false;
        }
        allUserIds.add(deptCoord.personnel_id);
      }
      if (!deptCoord.department || !deptCoord.personnel) {
        setError("All Department Coordinators must have department and personnel assigned");
        return false;
      }
    }

    for (const deptKomite of formData.department_komites) {
      if (deptKomite.personnel_id) {
        if (allUserIds.has(deptKomite.personnel_id)) {
          setError(`User sudah dipilih di role lain: ${deptKomite.personnel}`);
          return false;
        }
        allUserIds.add(deptKomite.personnel_id);
      }
      if (!deptKomite.department || !deptKomite.personnel) {
        setError("All Department Komites must have department and personnel assigned");
        return false;
      }
    }

    return true;
  };

  const handleSaveTemplate = async () => {
    if (!template || !validateForm()) return;

    try {
      setLoading(true);
      setError("");

      const bridges = [];

      // Role 1: Penanggung Jawab 5S
      if (formData.penanggung_jawab_id) {
        bridges.push({
          genba_role_id: 1,
          user_ids: [formData.penanggung_jawab_id],
        });
      }

      // Role 2: Koordinator 5S
      const koordinatorUserIds = formData.koordinators.map((coord) => coord.user_id).filter(Boolean) as number[];

      if (koordinatorUserIds.length > 0) {
        bridges.push({
          genba_role_id: 2,
          user_ids: koordinatorUserIds,
        });
      }

      // Role 3: Koordinator 5S Department
      const deptKoordinatorUserIds = formData.department_koordinators.map((dept) => dept.personnel_id).filter(Boolean) as number[];

      if (deptKoordinatorUserIds.length > 0) {
        bridges.push({
          genba_role_id: 3,
          user_ids: deptKoordinatorUserIds,
        });
      }

      // Role 4: Komite 5S Department
      const komiteUserIds = formData.department_komites.map((dept) => dept.personnel_id).filter(Boolean) as number[];

      if (komiteUserIds.length > 0) {
        bridges.push({
          genba_role_id: 4,
          user_ids: komiteUserIds,
        });
      }

      const updateData = {
        effective_date: formData.effective_date,
        bridges: bridges,
      };

      console.log("🔄 Saving template with payload:", updateData);
      await updateGenbaSO(template.id, updateData);

      alert(`✅ Structure Organization template "${template.name}" has been successfully saved!`);
      navigate("/genba/soconfiguration");
    } catch (err) {
      console.error("❌ Error saving template:", err);
      setError(err instanceof Error ? err.message : "Failed to save template");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTemplates = () => {
    navigate("/genba/soconfiguration");
  };

  if (loading && !template) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-2">Template not found</h2>
            <p className="text-gray-500 mb-4">ID: {id}</p>
            <button onClick={handleBackToTemplates} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Structure Organization"
          mainTitleHighlight="Configuration"
          description="Manage structure organization templates and configurations within the system."
          icon={<Users />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-2 text-gray-700" size={24} />
                Configure Template: <span className="text-blue-600 ml-2">{template?.name}</span>
              </h1>
              <motion.button
                onClick={handleBackToTemplates}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm flex items-center"
                disabled={loading}
              >
                <ArrowLeft className="mr-2" size={18} /> Back to Templates
              </motion.button>
            </div>

            <p className="text-gray-600 mb-6">Assign roles and personnel for this structure organization template.</p>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="space-y-6">
              {/* General Information */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">General Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Effective Date *</label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.effective_date}
                        onChange={(e) => handleEffectiveDateChange(e.target.value)}
                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                      />
                      <Calendar className="absolute right-3 top-3 text-gray-400" size={16} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Penanggung Jawab 5S */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Penanggung Jawab 5S</h3>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Penanggung Jawab 5S *</label>
                  <select
                    value={formData.penanggung_jawab_id || ""}
                    onChange={(e) => handlePenanggungJawabChange(parseInt(e.target.value))}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                  >
                    <option value="">Select Penanggung Jawab</option>
                    {getAvailableUsers("penanggung_jawab").map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} {user.department_name ? `(${user.department_name})` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Koordinator 5S */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Koordinator 5S</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddCoordinator}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-xs flex items-center"
                    disabled={loading}
                  >
                    <Plus size={14} className="mr-1" /> Add Coordinator
                  </motion.button>
                </div>
                <p className="text-sm text-gray-600 mb-4">Koordinator 5S (Minimal 3)</p>
                <div className="space-y-3">
                  {formData.koordinators.map((coordinator, index) => (
                    <div key={coordinator.id} className="flex items-center space-x-3 p-3 bg-white rounded-lg border border-gray-200">
                      <span className="text-gray-500 font-semibold min-w-6">{index + 1}.</span>
                      <div className="flex-1">
                        <select
                          value={coordinator.user_id || ""}
                          onChange={(e) => handleCoordinatorChange(index, parseInt(e.target.value))}
                          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                        >
                          <option value="">Select Coordinator</option>
                          {getAvailableUsers("koordinator").map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} {user.department_name ? `(${user.department_name})` : ""}
                            </option>
                          ))}
                        </select>
                      </div>
                      {formData.koordinators.length > 3 && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveCoordinator(index)} className="text-red-600 hover:text-red-800 transition-colors p-1" disabled={loading}>
                          <Trash2 size={16} />
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Koordinator 5S Department */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Koordinator 5S Department</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddDepartmentCoordinator}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-xs flex items-center"
                    disabled={loading}
                  >
                    <Plus size={14} className="mr-1" /> Add Department
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {formData.department_koordinators.map((deptCoord, index) => (
                    <div key={deptCoord.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">Department {index + 1}</h4>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveDepartmentCoordinator(index)} className="text-red-600 hover:text-red-800 transition-colors p-1" disabled={loading}>
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                          <select
                            value={deptCoord.department}
                            onChange={(e) => handleDepartmentCoordinatorChange(index, "department", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.name}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personnel *</label>
                          <select
                            value={deptCoord.personnel_id || ""}
                            onChange={(e) => handleDepartmentCoordinatorChange(index, "personnel", parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                            disabled={!deptCoord.department}
                          >
                            <option value="">Select Personnel</option>
                            {deptCoord.department ? (
                              getAvailableUsers("dept_coordinator", deptCoord.department).map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))
                            ) : (
                              <option value="">Select department first</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.department_koordinators.length === 0 && (
                    <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                      <Users size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm">No department coordinators assigned yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Add Department" to assign coordinators for specific departments.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Komite 5S Department */}
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Komite 5S Department</h3>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleAddDepartmentKomite}
                    className="px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-xs flex items-center"
                    disabled={loading}
                  >
                    <Plus size={14} className="mr-1" /> Add Department
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {formData.department_komites.map((deptKomite, index) => (
                    <div key={deptKomite.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-medium text-gray-800">Department {index + 1}</h4>
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveDepartmentKomite(index)} className="text-red-600 hover:text-red-800 transition-colors p-1" disabled={loading}>
                          <Trash2 size={16} />
                        </motion.button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                          <select
                            value={deptKomite.department}
                            onChange={(e) => handleDepartmentKomiteChange(index, "department", e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                          >
                            <option value="">Select Department</option>
                            {departments.map((dept) => (
                              <option key={dept.id} value={dept.name}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personnel *</label>
                          <select
                            value={deptKomite.personnel_id || ""}
                            onChange={(e) => handleDepartmentKomiteChange(index, "personnel", parseInt(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                            disabled={!deptKomite.department}
                          >
                            <option value="">Select Personnel</option>
                            {deptKomite.department ? (
                              getAvailableUsers("dept_komite", deptKomite.department).map((user) => (
                                <option key={user.id} value={user.id}>
                                  {user.name}
                                </option>
                              ))
                            ) : (
                              <option value="">Select department first</option>
                            )}
                          </select>
                        </div>
                      </div>
                    </div>
                  ))}
                  {formData.department_komites.length === 0 && (
                    <div className="text-center text-gray-500 py-6 border-2 border-dashed border-gray-300 rounded-lg bg-white">
                      <Users size={32} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm">No department committees assigned yet.</p>
                      <p className="text-xs text-gray-400 mt-1">Click "Add Department" to assign committees for specific departments.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-8 pt-6 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleBackToTemplates}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-semibold text-sm"
                disabled={loading}
              >
                Cancel
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveTemplate}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? <Loader className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />}
                Save Template
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SOConfiguration;
