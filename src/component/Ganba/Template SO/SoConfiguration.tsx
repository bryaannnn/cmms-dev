import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, Users, Loader, Calendar } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../routes/AuthContext";
import Sidebar from "../../Sidebar";
import PageHeader from "../../PageHeader";

interface Coordinator {
  id: number;
  name: string;
  personnel_id?: number;
}

interface DepartmentCoordinator {
  id: number;
  department: string;
  personnel_id?: number;
  personnel_name?: string;
}

interface SOConfigurationData {
  effective_date: string;
  penanggung_jawab: string;
  penanggung_jawab_id?: number;
  coordinators: Coordinator[];
  department_coordinators: DepartmentCoordinator[];
  is_active: boolean;
}

const SOConfiguration: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getUsers, getDepartment } = useAuth();

  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });
  const toggleSidebar = (): void => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const [users, setUsers] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>("");

  const [formData, setFormData] = useState<SOConfigurationData>({
    effective_date: new Date().toISOString().split("T")[0],
    penanggung_jawab: "",
    coordinators: [
      { id: 1, name: "" },
      { id: 2, name: "" },
      { id: 3, name: "" },
    ],
    department_coordinators: [
      { id: 1, department: "", personnel_name: "" },
      { id: 2, department: "", personnel_name: "" },
      { id: 3, department: "", personnel_name: "" },
    ],
    is_active: false,
  });

  useEffect(() => {
    loadData();
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, departmentsData] = await Promise.all([getUsers(), getDepartment?.() || Promise.resolve([])]);

      setUsers(usersData || []);
      setDepartments(departmentsData || []);
    } catch (err) {
      console.error("Error loading data:", err);
    } finally {
      setLoading(false);
    }
  };

  const handlePenanggungJawabChange = (personnelId: number) => {
    const selectedUser = users.find((user) => user.id === personnelId);
    setFormData((prev) => ({
      ...prev,
      penanggung_jawab: selectedUser?.name || "",
      penanggung_jawab_id: personnelId,
    }));
  };

  const handleCoordinatorChange = (index: number, personnelId: number) => {
    const selectedUser = users.find((user) => user.id === personnelId);
    setFormData((prev) => ({
      ...prev,
      coordinators: prev.coordinators.map((coord, i) => (i === index ? { ...coord, name: selectedUser?.name || "", personnel_id: personnelId } : coord)),
    }));
  };

  const handleDepartmentCoordinatorChange = (index: number, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      department_coordinators: prev.department_coordinators.map((deptCoord, i) => (i === index ? { ...deptCoord, [field]: value } : deptCoord)),
    }));
  };

  const handleDepartmentPersonnelChange = (index: number, personnelId: number) => {
    const selectedUser = users.find((user) => user.id === personnelId);
    setFormData((prev) => ({
      ...prev,
      department_coordinators: prev.department_coordinators.map((deptCoord, i) => (i === index ? { ...deptCoord, personnel_name: selectedUser?.name || "", personnel_id: personnelId } : deptCoord)),
    }));
  };

  const addCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      coordinators: [...prev.coordinators, { id: Date.now(), name: "" }],
    }));
  };

  const removeCoordinator = (index: number) => {
    if (formData.coordinators.length > 1) {
      setFormData((prev) => ({
        ...prev,
        coordinators: prev.coordinators.filter((_, i) => i !== index),
      }));
    }
  };

  const addDepartmentCoordinator = () => {
    setFormData((prev) => ({
      ...prev,
      department_coordinators: [...prev.department_coordinators, { id: Date.now(), department: "", personnel_name: "" }],
    }));
  };

  const removeDepartmentCoordinator = (index: number) => {
    if (formData.department_coordinators.length > 1) {
      setFormData((prev) => ({
        ...prev,
        department_coordinators: prev.department_coordinators.filter((_, i) => i !== index),
      }));
    }
  };

  const handleStatusChange = (is_active: boolean) => {
    setFormData((prev) => ({ ...prev, is_active }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      // Validation
      if (!formData.penanggung_jawab) {
        setError("Penanggung Jawab 5S must be selected");
        return;
      }

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      alert("Structure Organization configuration saved successfully!");
    } catch (err) {
      setError("Failed to save configuration");
      console.error("Error saving configuration:", err);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate("/ganba/soconfiguration");
  };

  if (loading) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={32} />
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
          description="Configure structure organization template with 5S personnel assignments."
          icon={<Users />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Users className="mr-2 text-gray-700" size={24} />
                Structure Organization Configuration
              </h1>
              <motion.button
                onClick={handleCancel}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm flex items-center"
                disabled={saving}
              >
                <ArrowLeft className="mr-2" size={18} /> Back to Templates
              </motion.button>
            </div>

            {error && <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="space-y-6">
              {/* Effective Date */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Effective Date</label>
                  <div className="flex items-center p-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-500">
                    <Calendar size={18} className="mr-2" />
                    <span>{formData.effective_date}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Automatically set to today's date</p>
                </div>
              </div>

              {/* Penanggung Jawab 5S */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Penanggung Jawab 5S <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.penanggung_jawab_id || ""}
                  onChange={(e) => handlePenanggungJawabChange(Number(e.target.value))}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                >
                  <option value="">Select Penanggung Jawab</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.position || "No Position"})
                    </option>
                  ))}
                </select>
              </div>

              {/* Koordinator 5S */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Koordinator 5S</label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addCoordinator}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {formData.coordinators.map((coordinator, index) => (
                    <div key={coordinator.id} className="flex items-center space-x-3">
                      <select
                        value={coordinator.personnel_id || ""}
                        onChange={(e) => handleCoordinatorChange(index, Number(e.target.value))}
                        className="flex-1 p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      >
                        <option value="">Select Coordinator</option>
                        {users.map((user) => (
                          <option key={user.id} value={user.id}>
                            {user.name} ({user.position || "No Position"})
                          </option>
                        ))}
                      </select>
                      {formData.coordinators.length > 1 && (
                        <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeCoordinator(index)} className="text-red-600 hover:text-red-800 transition-colors p-2">
                          <Trash2 size={20} />
                        </motion.button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Koordinator 5S Department */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-medium text-gray-700">Koordinator 5S Department</label>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={addDepartmentCoordinator}
                    className="px-3 py-1 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold text-sm flex items-center"
                  >
                    <Plus size={16} className="mr-1" /> Add
                  </motion.button>
                </div>
                <div className="space-y-4">
                  {formData.department_coordinators.map((deptCoord, index) => (
                    <div key={deptCoord.id} className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <select
                          value={deptCoord.department}
                          onChange={(e) => handleDepartmentCoordinatorChange(index, "department", e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                        >
                          <option value="">Select Department</option>
                          {departments.map((dept) => (
                            <option key={dept.id} value={dept.name}>
                              {dept.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-end space-x-3">
                        <div className="flex-1">
                          <label className="block text-sm font-medium text-gray-700 mb-1">Personnel</label>
                          <select
                            value={deptCoord.personnel_id || ""}
                            onChange={(e) => handleDepartmentPersonnelChange(index, Number(e.target.value))}
                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                          >
                            <option value="">Select Personnel</option>
                            {users.map((user) => (
                              <option key={user.id} value={user.id}>
                                {user.name} ({user.position || "No Position"})
                              </option>
                            ))}
                          </select>
                        </div>
                        {formData.department_coordinators.length > 1 && (
                          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => removeDepartmentCoordinator(index)} className="text-red-600 hover:text-red-800 transition-colors p-2 mb-2.5">
                            <Trash2 size={20} />
                          </motion.button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
                <div className="flex space-x-6">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="status" checked={formData.is_active} onChange={() => handleStatusChange(true)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input type="radio" name="status" checked={!formData.is_active} onChange={() => handleStatusChange(false)} className="text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Not Active</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleCancel} className="px-6 py-2.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors font-semibold" disabled={saving}>
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleSave}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold disabled:opacity-50 flex items-center"
                  disabled={saving}
                >
                  {saving ? <Loader className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />}
                  Save Configuration
                </motion.button>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SOConfiguration;
