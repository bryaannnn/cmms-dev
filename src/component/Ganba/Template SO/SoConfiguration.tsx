import React, { useState, useCallback, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { X, Calendar, Users, UserPlus, Building, Save, ArrowLeft, Plus, Trash2 } from "lucide-react";
import Select from "react-select";
import Sidebar from "../../Sidebar";
import PageHeader from "../../PageHeader";
import { useAuth, User, Department } from "../../../routes/AuthContext";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

interface OptionType {
  value: string;
  label: string;
}

interface GenbaRole {
  id: number;
  name: string;
  description: string;
}

interface Bridge {
  id: number;
  genba_so_id: number;
  genba_role_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  role: GenbaRole;
  user: User;
}

interface BridgeFormData {
  genba_role_id: number;
  user_ids: number[];
}

interface FormData {
  effective_date: string;
  bridges: BridgeFormData[];
}

interface DepartmentUserSelection {
  departmentId: number | null;
  selectedUsers: OptionType[];
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <X size={24} />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

const SOConfigure: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { 
    getGenbaSOById, 
    updateGenbaSO, 
    getGenbaRoles, 
    getUsers, 
    getDepartment 
  } = useAuth();

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [departmentList, setDepartmentList] = useState<Department[]>([]);
  const [genbaRoles, setGenbaRoles] = useState<GenbaRole[]>([]);
  const [templateData, setTemplateData] = useState<any>(null);

  const [formData, setFormData] = useState<FormData>({
    effective_date: new Date().toISOString().split("T")[0],
    bridges: []
  });

  // State untuk multiple department selection
  const [koordinatorDeptSelections, setKoordinatorDeptSelections] = useState<DepartmentUserSelection[]>([
    { departmentId: null, selectedUsers: [] }
  ]);

  const [komiteDeptSelections, setKomiteDeptSelections] = useState<DepartmentUserSelection[]>([
    { departmentId: null, selectedUsers: [] }
  ]);

  const customSelectStyles = {
    control: (provided: any, state: any) => ({
      ...provided,
      minHeight: "42px",
      borderColor: state.isFocused ? "#3B82F6" : "#D1D5DB",
      boxShadow: state.isFocused ? "0 0 0 1px #3B82F6" : "none",
      "&:hover": {
        borderColor: "#9CA3AF",
      },
      borderRadius: "0.5rem",
      backgroundColor: "#FFFFFF",
      padding: "0 0.5rem",
      transition: "all 0.15s ease-in-out",
    }),
    valueContainer: (provided: any) => ({
      ...provided,
      padding: "0",
    }),
    singleValue: (provided: any) => ({
      ...provided,
      color: "#374151",
    }),
    placeholder: (provided: any) => ({
      ...provided,
      color: "#6B7280",
    }),
    dropdownIndicator: (provided: any) => ({
      ...provided,
      color: "#9CA3AF",
      "&:hover": {
        color: "#6B7280",
      },
    }),
    indicatorSeparator: (provided: any) => ({
      ...provided,
      display: "none",
    }),
    menu: (provided: any) => ({
      ...provided,
      zIndex: 9999,
      borderRadius: "0.5rem",
      border: "1px solid #E5E7EB",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    }),
    option: (provided: any, state: any) => ({
      ...provided,
      backgroundColor: state.isFocused ? "#EFF6FF" : "#FFFFFF",
      color: "#1F2937",
      "&:active": {
        backgroundColor: "#DBEAFE",
      },
      padding: "0.625rem 1rem",
    }),
    multiValue: (provided: any) => ({
      ...provided,
      backgroundColor: "#EFF6FF",
      borderRadius: "0.375rem",
    }),
    multiValueLabel: (provided: any) => ({
      ...provided,
      color: "#1E40AF",
      fontWeight: "500",
    }),
    multiValueRemove: (provided: any) => ({
      ...provided,
      color: "#1E40AF",
      "&:hover": {
        backgroundColor: "#DBEAFE",
        color: "#DC2626",
      },
    }),
  };

  // Fungsi untuk mendapatkan semua user yang sudah dipilih di semua role
  const getAllSelectedUserIds = useCallback((): number[] => {
    const selectedUserIds: number[] = [];
    
    formData.bridges.forEach(bridge => {
      selectedUserIds.push(...bridge.user_ids);
    });

    return selectedUserIds;
  }, [formData.bridges]);

  // Fungsi untuk mendapatkan available users (yang belum dipilih di role manapun)
  const getAvailableUsers = useCallback((currentRoleId?: number): User[] => {
    const selectedUserIds = getAllSelectedUserIds();
    return allUsers.filter(user => 
      !selectedUserIds.includes(parseInt(user.id)) || 
      (currentRoleId && formData.bridges.some(bridge => 
        bridge.genba_role_id === currentRoleId && bridge.user_ids.includes(parseInt(user.id))
      ))
    );
  }, [allUsers, getAllSelectedUserIds, formData.bridges]);

  // Fungsi untuk mendapatkan users by department yang available
  const getAvailableUsersByDepartment = useCallback((departmentId: number, currentRoleId?: number): User[] => {
    const availableUsers = getAvailableUsers(currentRoleId);
    return availableUsers.filter(user => user.department_id === departmentId);
  }, [getAvailableUsers]);

  // Fungsi untuk mendapatkan available departments (yang belum dipilih di selection yang sama)
  const getAvailableDepartments = useCallback((selections: DepartmentUserSelection[], currentIndex: number): Department[] => {
    const selectedDepartmentIds = selections
      .filter((_, index) => index !== currentIndex)
      .map(selection => selection.departmentId)
      .filter(Boolean) as number[];

    return departmentList.filter(dept => !selectedDepartmentIds.includes(dept.id));
  }, [departmentList]);

  // Process existing data from backend
  const processExistingData = useCallback((template: any) => {
    if (!template.bridges || !Array.isArray(template.bridges)) return;

    const bridgesMap = new Map<number, BridgeFormData>();
    
    // Group bridges by role_id
    template.bridges.forEach((bridge: Bridge) => {
      const roleId = bridge.genba_role_id;
      if (!bridgesMap.has(roleId)) {
        bridgesMap.set(roleId, {
          genba_role_id: roleId,
          user_ids: [bridge.user_id]
        });
      } else {
        bridgesMap.get(roleId)!.user_ids.push(bridge.user_id);
      }
    });

    setFormData(prev => ({
      ...prev,
      bridges: Array.from(bridgesMap.values())
    }));

    // Process Koordinator 5S Department selections
    const koordinatorDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && role.name.toLowerCase().includes('department'));
    if (koordinatorDeptRole) {
      const bridge = bridgesMap.get(koordinatorDeptRole.id);
      if (bridge && bridge.user_ids.length > 0) {
        // Group users by department
        const usersByDepartment = new Map<number, number[]>();
        
        bridge.user_ids.forEach((userId: number) => {
          const user = allUsers.find(u => u.id === userId.toString());
          if (user && user.department_id) {
            if (!usersByDepartment.has(user.department_id)) {
              usersByDepartment.set(user.department_id, [userId]);
            } else {
              usersByDepartment.get(user.department_id)!.push(userId);
            }
          }
        });

        const selections: DepartmentUserSelection[] = Array.from(usersByDepartment.entries()).map(([deptId, userIds]) => ({
          departmentId: deptId,
          selectedUsers: userIds.map(userId => {
            const user = allUsers.find(u => u.id === userId.toString());
            return user ? { value: user.id, label: user.name } : { value: '', label: '' };
          }).filter(opt => opt.value !== '')
        }));

        setKoordinatorDeptSelections(selections.length > 0 ? selections : [{ departmentId: null, selectedUsers: [] }]);
      }
    }

    // Process Komite 5S Department selections
    const komiteDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('komite') && role.name.toLowerCase().includes('department'));
    if (komiteDeptRole) {
      const bridge = bridgesMap.get(komiteDeptRole.id);
      if (bridge && bridge.user_ids.length > 0) {
        // Group users by department
        const usersByDepartment = new Map<number, number[]>();
        
        bridge.user_ids.forEach((userId: number) => {
          const user = allUsers.find(u => u.id === userId.toString());
          if (user && user.department_id) {
            if (!usersByDepartment.has(user.department_id)) {
              usersByDepartment.set(user.department_id, [userId]);
            } else {
              usersByDepartment.get(user.department_id)!.push(userId);
            }
          }
        });

        const selections: DepartmentUserSelection[] = Array.from(usersByDepartment.entries()).map(([deptId, userIds]) => ({
          departmentId: deptId,
          selectedUsers: userIds.map(userId => {
            const user = allUsers.find(u => u.id === userId.toString());
            return user ? { value: user.id, label: user.name } : { value: '', label: '' };
          }).filter(opt => opt.value !== '')
        }));

        setKomiteDeptSelections(selections.length > 0 ? selections : [{ departmentId: null, selectedUsers: [] }]);
      }
    }
  }, [genbaRoles, allUsers]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        if (id) {
          const template = await getGenbaSOById(id);
          setTemplateData(template);
          
          if (template.effective_date) {
            const effectiveDate = new Date(template.effective_date).toISOString().split("T")[0];
            setFormData(prev => ({
              ...prev,
              effective_date: effectiveDate
            }));
          }

          // Load master data first
          const [roles, users, departments] = await Promise.all([
            getGenbaRoles(),
            getUsers(),
            getDepartment()
          ]);

          setGenbaRoles(roles);
          setAllUsers(users);
          setDepartmentList(departments);

          // Process existing data after master data is loaded
          processExistingData(template);
        } else {
          // For new template, just load master data
          const [roles, users, departments] = await Promise.all([
            getGenbaRoles(),
            getUsers(),
            getDepartment()
          ]);

          setGenbaRoles(roles);
          setAllUsers(users);
          setDepartmentList(departments);
        }

      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Gagal memuat data template");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, getGenbaSOById, getGenbaRoles, getUsers, getDepartment, processExistingData]);

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
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const handleEffectiveDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      effective_date: e.target.value
    }));
  };

  // Handler untuk Penanggung Jawab 5S
  const handlePenanggungJawabChange = (selectedOption: OptionType | null) => {
    const penanggungJawabRole = genbaRoles.find(role => role.name.toLowerCase().includes('penanggung jawab'));
    if (!penanggungJawabRole) return;

    const existingBridgeIndex = formData.bridges.findIndex(bridge => bridge.genba_role_id === penanggungJawabRole.id);
    
    if (selectedOption) {
      const userId = parseInt(selectedOption.value);
      
      if (existingBridgeIndex >= 0) {
        const updatedBridges = [...formData.bridges];
        updatedBridges[existingBridgeIndex] = {
          ...updatedBridges[existingBridgeIndex],
          user_ids: [userId]
        };
        setFormData(prev => ({ ...prev, bridges: updatedBridges }));
      } else {
        setFormData(prev => ({
          ...prev,
          bridges: [
            ...prev.bridges,
            {
              genba_role_id: penanggungJawabRole.id,
              user_ids: [userId]
            }
          ]
        }));
      }
    } else if (existingBridgeIndex >= 0) {
      const updatedBridges = formData.bridges.filter((_, index) => index !== existingBridgeIndex);
      setFormData(prev => ({ ...prev, bridges: updatedBridges }));
    }
  };

  // Handler untuk Koordinator 5S
  const handleKoordinator5SChange = (selectedOptions: readonly OptionType[] | null) => {
    const koordinatorRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && !role.name.toLowerCase().includes('department'));
    if (!koordinatorRole) return;

    const user_ids = selectedOptions ? selectedOptions.map(option => parseInt(option.value)) : [];

    const existingBridgeIndex = formData.bridges.findIndex(bridge => bridge.genba_role_id === koordinatorRole.id);

    if (existingBridgeIndex >= 0) {
      const updatedBridges = [...formData.bridges];
      updatedBridges[existingBridgeIndex] = {
        ...updatedBridges[existingBridgeIndex],
        user_ids
      };
      setFormData(prev => ({ ...prev, bridges: updatedBridges }));
    } else if (user_ids.length > 0) {
      setFormData(prev => ({
        ...prev,
        bridges: [
          ...prev.bridges,
          {
            genba_role_id: koordinatorRole.id,
            user_ids
          }
        ]
      }));
    } else if (existingBridgeIndex >= 0) {
      const updatedBridges = formData.bridges.filter((_, idx) => idx !== existingBridgeIndex);
      setFormData(prev => ({ ...prev, bridges: updatedBridges }));
    }
  };

  // Handler untuk Koordinator Department
  const handleKoordinatorDeptDepartmentChange = (selectedOption: OptionType | null, index: number) => {
    const departmentId = selectedOption ? parseInt(selectedOption.value) : null;
    
    setKoordinatorDeptSelections(prev => {
      const updated = [...prev];
      updated[index] = {
        departmentId,
        selectedUsers: [] // Reset selected users ketika department berubah
      };
      return updated;
    });

    updateKoordinatorDeptFormData();
  };

  const handleKoordinatorDeptUsersChange = (selectedOptions: readonly OptionType[] | null, index: number) => {
    const selectedUsers = selectedOptions ? [...selectedOptions] : [];
    
    setKoordinatorDeptSelections(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selectedUsers
      };
      return updated;
    });

    updateKoordinatorDeptFormData();
  };

  const updateKoordinatorDeptFormData = () => {
    const koordinatorDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && role.name.toLowerCase().includes('department'));
    if (!koordinatorDeptRole) return;

    const allUserIds: number[] = [];
    koordinatorDeptSelections.forEach(selection => {
      selection.selectedUsers.forEach(user => {
        allUserIds.push(parseInt(user.value));
      });
    });

    const existingBridgeIndex = formData.bridges.findIndex(bridge => bridge.genba_role_id === koordinatorDeptRole.id);

    if (existingBridgeIndex >= 0) {
      const updatedBridges = [...formData.bridges];
      if (allUserIds.length > 0) {
        updatedBridges[existingBridgeIndex] = {
          ...updatedBridges[existingBridgeIndex],
          user_ids: allUserIds
        };
      } else {
        updatedBridges.splice(existingBridgeIndex, 1);
      }
      setFormData(prev => ({ ...prev, bridges: updatedBridges }));
    } else if (allUserIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        bridges: [
          ...prev.bridges,
          {
            genba_role_id: koordinatorDeptRole.id,
            user_ids: allUserIds
          }
        ]
      }));
    }
  };

  // Handler untuk Komite Department
  const handleKomiteDeptDepartmentChange = (selectedOption: OptionType | null, index: number) => {
    const departmentId = selectedOption ? parseInt(selectedOption.value) : null;
    
    setKomiteDeptSelections(prev => {
      const updated = [...prev];
      updated[index] = {
        departmentId,
        selectedUsers: [] // Reset selected users ketika department berubah
      };
      return updated;
    });

    updateKomiteDeptFormData();
  };

  const handleKomiteDeptUsersChange = (selectedOptions: readonly OptionType[] | null, index: number) => {
    const selectedUsers = selectedOptions ? [...selectedOptions] : [];
    
    setKomiteDeptSelections(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        selectedUsers
      };
      return updated;
    });

    updateKomiteDeptFormData();
  };

  const updateKomiteDeptFormData = () => {
    const komiteDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('komite') && role.name.toLowerCase().includes('department'));
    if (!komiteDeptRole) return;

    const allUserIds: number[] = [];
    komiteDeptSelections.forEach(selection => {
      selection.selectedUsers.forEach(user => {
        allUserIds.push(parseInt(user.value));
      });
    });

    const existingBridgeIndex = formData.bridges.findIndex(bridge => bridge.genba_role_id === komiteDeptRole.id);

    if (existingBridgeIndex >= 0) {
      const updatedBridges = [...formData.bridges];
      if (allUserIds.length > 0) {
        updatedBridges[existingBridgeIndex] = {
          ...updatedBridges[existingBridgeIndex],
          user_ids: allUserIds
        };
      } else {
        updatedBridges.splice(existingBridgeIndex, 1);
      }
      setFormData(prev => ({ ...prev, bridges: updatedBridges }));
    } else if (allUserIds.length > 0) {
      setFormData(prev => ({
        ...prev,
        bridges: [
          ...prev.bridges,
          {
            genba_role_id: komiteDeptRole.id,
            user_ids: allUserIds
          }
        ]
      }));
    }
  };

  // Handler untuk menambah kolom department
  const addKoordinatorDeptSelection = () => {
    setKoordinatorDeptSelections(prev => [
      ...prev,
      { departmentId: null, selectedUsers: [] }
    ]);
  };

  const addKomiteDeptSelection = () => {
    setKomiteDeptSelections(prev => [
      ...prev,
      { departmentId: null, selectedUsers: [] }
    ]);
  };

  // Handler untuk menghapus kolom department
  const removeKoordinatorDeptSelection = (index: number) => {
    setKoordinatorDeptSelections(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [{ departmentId: null, selectedUsers: [] }] : updated;
    });
    
    // Update form data setelah menghapus
    setTimeout(updateKoordinatorDeptFormData, 0);
  };

  const removeKomiteDeptSelection = (index: number) => {
    setKomiteDeptSelections(prev => {
      const updated = prev.filter((_, i) => i !== index);
      return updated.length === 0 ? [{ departmentId: null, selectedUsers: [] }] : updated;
    });
    
    // Update form data setelah menghapus
    setTimeout(updateKomiteDeptFormData, 0);
  };

  // Helper functions untuk mendapatkan current values
  const getCurrentPenanggungJawab = (): OptionType | null => {
    const penanggungJawabRole = genbaRoles.find(role => role.name.toLowerCase().includes('penanggung jawab'));
    if (!penanggungJawabRole) return null;

    const bridge = formData.bridges.find(b => b.genba_role_id === penanggungJawabRole.id);
    if (!bridge || bridge.user_ids.length === 0) return null;

    const user = allUsers.find(u => u.id === bridge.user_ids[0].toString());
    return user ? { value: user.id, label: user.name } : null;
  };

  const getCurrentKoordinator5S = (): OptionType[] => {
    const koordinatorRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && !role.name.toLowerCase().includes('department'));
    if (!koordinatorRole) return [];

    const bridge = formData.bridges.find(b => b.genba_role_id === koordinatorRole.id);
    if (!bridge) return [];

    return bridge.user_ids.map(userId => {
      const user = allUsers.find(u => u.id === userId.toString());
      return user ? { value: user.id, label: user.name } : { value: '', label: '' };
    }).filter(option => option.value !== '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccessMessage(null);

    try {
      if (!id) {
        throw new Error("Template ID tidak ditemukan");
      }

      // Validasi minimal 3 koordinator
      const koordinatorRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && !role.name.toLowerCase().includes('department'));
      if (koordinatorRole) {
        const koordinatorBridge = formData.bridges.find(b => b.genba_role_id === koordinatorRole.id);
        if (!koordinatorBridge || koordinatorBridge.user_ids.length < 3) {
          throw new Error("Pilih minimal 3 Koordinator 5S");
        }
      }

      const payload = {
        effective_date: formData.effective_date,
        bridges: formData.bridges
      };

      await updateGenbaSO(id, payload);
      setSuccessMessage("Template berhasil diperbarui");
      
      setTimeout(() => {
        navigate("/genba/so");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Gagal menyimpan template. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const penanggungJawabRole = genbaRoles.find(role => role.name.toLowerCase().includes('penanggung jawab'));
  const koordinatorRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && !role.name.toLowerCase().includes('department'));
  const koordinatorDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('koordinator') && role.name.toLowerCase().includes('department'));
  const komiteDeptRole = genbaRoles.find(role => role.name.toLowerCase().includes('komite') && role.name.toLowerCase().includes('department'));

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader 
          mainTitle="Configure Structure Organization" 
          mainTitleHighlight="Template" 
          description="Configure roles and personnel for structure organization template." 
          icon={<Users />} 
          isMobile={isMobile} 
          toggleSidebar={toggleSidebar} 
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.3 }} 
            className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0"
          >
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Configure Template: {templateData?.name || "Loading..."}
              </h1>
              <p className="text-gray-600 mt-1">
                Assign roles and personnel for this structure organization template
              </p>
            </div>
            <motion.button
              onClick={() => navigate("/genba/so")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ArrowLeft className="text-lg" /> Back to Templates
            </motion.button>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ delay: 0.1 }} 
            className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50"
          >
            {error && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" 
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
                </span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" 
                role="alert"
              >
                <strong className="font-bold">Success!</strong>
                <span className="block sm:inline ml-2">{successMessage}</span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Information */}
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="mr-2 text-blue-500" /> General Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="effective_date" className="block text-sm font-medium text-gray-700 mb-1">
                      Effective Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      id="effective_date"
                      name="effective_date"
                      value={formData.effective_date}
                      onChange={handleEffectiveDateChange}
                      required
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Penanggung Jawab 5S */}
              {penanggungJawabRole && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <Users className="mr-2 text-green-500" /> Penanggung Jawab 5S
                  </h2>
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label htmlFor="penanggung_jawab" className="block text-sm font-medium text-gray-700 mb-1">
                        Penanggung Jawab 5S <span className="text-red-500">*</span>
                      </label>
                      <Select
                        id="penanggung_jawab"
                        name="penanggung_jawab"
                        options={getAvailableUsers(penanggungJawabRole.id).map(user => ({
                          value: user.id,
                          label: user.name
                        }))}
                        value={getCurrentPenanggungJawab()}
                        onChange={handlePenanggungJawabChange}
                        placeholder="Pilih Penanggung Jawab 5S"
                        styles={customSelectStyles}
                        isClearable
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Koordinator 5S Department */}
              {koordinatorDeptRole && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Building className="mr-2 text-orange-500" /> Koordinator 5S Department
                    </h2>
                    <motion.button
                      type="button"
                      onClick={addKoordinatorDeptSelection}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Department</span>
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {koordinatorDeptSelections.map((selection, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Department {index + 1}</h3>
                          {koordinatorDeptSelections.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() => removeKoordinatorDeptSelection(index)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Hapus department"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={getAvailableDepartments(koordinatorDeptSelections, index).map(dept => ({
                                value: String(dept.id),
                                label: dept.name
                              }))}
                              value={selection.departmentId ? {
                                value: String(selection.departmentId),
                                label: departmentList.find(d => d.id === selection.departmentId)?.name || ''
                              } : null}
                              onChange={(selected) => handleKoordinatorDeptDepartmentChange(selected, index)}
                              placeholder="Pilih Department"
                              styles={customSelectStyles}
                              isClearable
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Personnel <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={selection.departmentId ? 
                                getAvailableUsersByDepartment(selection.departmentId, koordinatorDeptRole.id).map(user => ({
                                  value: user.id,
                                  label: user.name
                                })) : []
                              }
                              value={selection.selectedUsers}
                              onChange={(selected) => handleKoordinatorDeptUsersChange(selected, index)}
                              placeholder={selection.departmentId ? "Pilih Personnel" : "Pilih department terlebih dahulu"}
                              styles={customSelectStyles}
                              isMulti
                              isDisabled={!selection.departmentId}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Koordinator 5S Department */}
              {koordinatorDeptRole && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Building className="mr-2 text-orange-500" /> Koordinator 5S Department
                    </h2>
                    <motion.button
                      type="button"
                      onClick={addKoordinatorDeptSelection}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Department</span>
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {koordinatorDeptSelections.map((selection, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Department {index + 1}</h3>
                          {koordinatorDeptSelections.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() => removeKoordinatorDeptSelection(index)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Hapus department"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={getAvailableDepartments(koordinatorDeptSelections, index).map(dept => ({
                                value: String(dept.id),
                                label: dept.name
                              }))}
                              value={selection.departmentId ? {
                                value: String(selection.departmentId),
                                label: departmentList.find(d => d.id === selection.departmentId)?.name || ''
                              } : null}
                              onChange={(selected) => handleKoordinatorDeptDepartmentChange(selected, index)}
                              placeholder="Pilih Department"
                              styles={customSelectStyles}
                              isClearable
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Personnel <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={selection.departmentId ? 
                                getAvailableUsersByDepartment(selection.departmentId, koordinatorDeptRole.id).map(user => ({
                                  value: user.id,
                                  label: user.name
                                })) : []
                              }
                              value={selection.selectedUsers}
                              onChange={(selected) => handleKoordinatorDeptUsersChange(selected, index)}
                              placeholder={selection.departmentId ? "Pilih Personnel" : "Pilih department terlebih dahulu"}
                              styles={customSelectStyles}
                              isMulti
                              isDisabled={!selection.departmentId}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Komite 5S Department */}
              {komiteDeptRole && (
                <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-semibold text-gray-800 flex items-center">
                      <Building className="mr-2 text-red-500" /> Komite 5S Department
                    </h2>
                    <motion.button
                      type="button"
                      onClick={addKomiteDeptSelection}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
                    >
                      <Plus size={16} />
                      <span>Add Department</span>
                    </motion.button>
                  </div>
                  
                  <div className="space-y-4">
                    {komiteDeptSelections.map((selection, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex justify-between items-center mb-3">
                          <h3 className="text-sm font-medium text-gray-700">Department {index + 1}</h3>
                          {komiteDeptSelections.length > 1 && (
                            <motion.button
                              type="button"
                              onClick={() => removeKomiteDeptSelection(index)}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                              title="Hapus department"
                            >
                              <Trash2 size={16} />
                            </motion.button>
                          )}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Department <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={getAvailableDepartments(komiteDeptSelections, index).map(dept => ({
                                value: String(dept.id),
                                label: dept.name
                              }))}
                              value={selection.departmentId ? {
                                value: String(selection.departmentId),
                                label: departmentList.find(d => d.id === selection.departmentId)?.name || ''
                              } : null}
                              onChange={(selected) => handleKomiteDeptDepartmentChange(selected, index)}
                              placeholder="Pilih Department"
                              styles={customSelectStyles}
                              isClearable
                              required
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Personnel <span className="text-red-500">*</span>
                            </label>
                            <Select
                              options={selection.departmentId ? 
                                getAvailableUsersByDepartment(selection.departmentId, komiteDeptRole.id).map(user => ({
                                  value: user.id,
                                  label: user.name
                                })) : []
                              }
                              value={selection.selectedUsers}
                              onChange={(selected) => handleKomiteDeptUsersChange(selected, index)}
                              placeholder={selection.departmentId ? "Pilih Personnel" : "Pilih department terlebih dahulu"}
                              styles={customSelectStyles}
                              isMulti
                              isDisabled={!selection.departmentId}
                              required
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={() => navigate("/genba/so")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                >
                  <ArrowLeft className="mr-2 h-5 w-5" /> Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  disabled={isLoading}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Save className="mr-2 h-5 w-5" /> 
                  {isLoading ? "Menyimpan..." : "Save Template"}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default SOConfigure;