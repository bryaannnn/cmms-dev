import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

// Tambahkan di bagian atas file AuthContext.tsx
export const roleMapping: Record<string, { name: string; isDepartmentHead?: boolean; isSuperadmin?: boolean }> = {
  "1": { name: "admin", isDepartmentHead: true },
  "2": { name: "user", isDepartmentHead: false },
  "3": { name: "superadmin", isSuperadmin: true },
};

export const getPermissionNameById = (id: string): PermissionName | null => {
  const mapping: Record<string, PermissionName> = {
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
    "18": "edit_workorders",
    "19": "delete_workorders",
    "20": "create_reports",
    "21": "edit_reports",
    "22": "delete_reports",
    "23": "view_inventory",
    "24": "create_inventory",
    "25": "edit_inventory",
    "26": "delete_inventory",
    "27": "view_teams",
    "28": "create_teams",
    "29": "edit_teams",
    "30": "delete_teams",
    "31": "view_machinehistory",
    "32": "create_machine_history",
    "33": "edit_machinehistory",
    "34": "delete_machinehistory",
  };
  return mapping[id] || null;
};

export type PermissionName =
  | "view_dashboard"
  | "edit_dashboard"
  | "view_assets"
  | "create_assets"
  | "edit_assets"
  | "delete_assets"
  | "view_workorders"
  | "create_workorders"
  | "assign_workorders"
  | "complete_workorders"
  | "edit_workorders"
  | "delete_workorders"
  | "view_machinehistory"
  | "edit_machinehistory"
  | "create_machine_history"
  | "delete_machinehistory"
  | "view_inventory"
  | "edit_inventory"
  | "create_inventory"
  | "delete_inventory"
  | "view_reports"
  | "edit_reports"
  | "create_reports"
  | "export_reports"
  | "delete_reports"
  | "view_teams"
  | "edit_teams"
  | "create_teams"
  | "delete_teams"
  | "view_settings"
  | "edit_settings"
  | "view_permissions"
  | "edit_permissions"
  | "manage_users";

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  isSuperadmin?: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roleId?: string; // Dari endpoint /users
  roles?: string[]; // Dari endpoint /user
  customPermissions?: string[]; // Dari endpoint /users
  permissions?: PermissionName[]; // Dari endpoint /user
  department?: string | null;
  rolePermissions?: string[];
  allPermissions?: string[];
}

export interface Mesin {
  id: string;
  name: string;
}

export interface Shift {
  id: string;
  name: string;
}

export interface Group {
  id: string;
  name: string;
}

export interface StopTime {
  id: string;
  name: string;
}

export interface Unit {
  id: string;
  name: string;
}

export interface ItemTrouble {
  id: string;
  name: string;
}

export interface JenisAktivitas {
  id: string;
  name: string;
}

export interface Kegiatan {
  id: string;
  name: string;
}

export interface UnitSparePart {
  id: string;
  name: string;
}

export interface Startstop {
  id: number;
  event_name: string | null;
  start_time_hh: number | null;
  start_time_mm: number | null;
  stop_time_hh: number | null;
  stop_time_mm: number | null;
  duration_minutes: number | null;
}

export interface AllMasterData {
  mesin: Mesin[];
  shifts: Shift[];
  groups: Group[];
  stoptimes: StopTime[];
  units: Unit[];
  itemtroubles: ItemTrouble[];
  jenisaktivitas: JenisAktivitas[];
  kegiatans: Kegiatan[];
  unitspareparts: UnitSparePart[];
}

export interface MachineHistoryFormData {
  date: string;
  shift: string;
  group: string;
  stopJam: number | null;
  stopMenit: number | null;
  startJam: number | null;
  startMenit: number | null;
  stopTime: string;
  unit: string;
  mesin: string;
  runningHour: number;
  itemTrouble: string;
  jenisGangguan: string;
  bentukTindakan: string;
  perbaikanPerawatan: string;
  rootCause: string;
  jenisAktivitas: string;
  kegiatan: string;
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: number;
  unitSparePart: string;
}

export interface MachineHistoryRecord extends MachineHistoryFormData {
  id: string;
  startstop?: Startstop | null;
}

export interface WorkOrder {
  id: number;
  issue: string;
  created_by: number;
  assigned_to: number | null;
  status: "open" | "in_progress" | "completed" | "on_hold" | "canceled";
  priority: "low" | "medium" | "high" | "emergency";
  due_date: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
  creator: User;
  assigned: User | null;
}

export interface WorkOrderFormData {
  issue: string;
  created_by: number;
  assigned_to?: number | null;
  status?: "open" | "in_progress" | "completed" | "on_hold" | "canceled";
  priority?: "low" | "medium" | "high" | "emergency";
  due_date?: string | null;
  description?: string | null;
}

interface EditingUser extends User {
  department?: string;
}

function mapApiToMachineHistoryRecord(apiData: any, masterData: AllMasterData | null): MachineHistoryRecord {
  const stopTimeName = apiData.stoptime?.name || masterData?.stoptimes?.find((st) => String(st.id) === String(apiData.stoptime_id))?.name || "-";
  const itemTroubleName = apiData.itemtrouble?.name || masterData?.itemtroubles?.find((it) => String(it.id) === String(apiData.itemtrouble_id))?.name || "-";
  const jenisAktivitasName = apiData.jenisaktifitas?.name || masterData?.jenisaktivitas?.find((ja) => String(ja.id) === String(apiData.jenisaktifitas_id))?.name || "-";
  const kegiatanName = apiData.kegiatan?.name || masterData?.kegiatans?.find((keg) => String(keg.id) === String(apiData.kegiatan_id))?.name || "-";
  const unitSparePartName = apiData.unitsp?.name || masterData?.unitspareparts?.find((usp) => String(usp.id) === String(apiData.unitsp_id))?.name || "-";

  return {
    id: String(apiData.id),
    date: apiData.date,
    shift: apiData.shift?.name || "-",
    group: apiData.group?.name || "-",
    unit: apiData.unit?.name || "-",
    mesin: apiData.mesin?.name || "-",
    stopJam: apiData.startstop?.stop_time_hh ?? null,
    stopMenit: apiData.startstop?.stop_time_mm ?? null,
    startJam: apiData.startstop?.start_time_hh ?? null,
    startMenit: apiData.startstop?.start_time_mm ?? null,
    stopTime: stopTimeName,
    runningHour: apiData.running_hour ?? 0,
    itemTrouble: itemTroubleName,
    jenisGangguan: apiData.jenis_gangguan || "",
    bentukTindakan: apiData.bentuk_tindakan || "",
    perbaikanPerawatan: apiData.jenisaktifitas?.name === "Perbaikan" ? "Perbaikan" : "Perawatan",
    rootCause: apiData.root_cause || "",
    jenisAktivitas: jenisAktivitasName,
    kegiatan: kegiatanName,
    kodePart: apiData.kode_part || "",
    sparePart: apiData.spare_part || "",
    idPart: apiData.id_part || "",
    jumlah: apiData.jumlah ?? 0,
    unitSparePart: unitSparePartName,
    startstop: apiData.startstop ?? null,
  };
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<any>;
  getAllMasterData: () => Promise<AllMasterData>;
  submitMachineHistory: (data: MachineHistoryFormData) => Promise<any>;
  getMachineHistories: () => Promise<MachineHistoryRecord[]>;
  getMachineHistoryById: (id: string) => Promise<any>;
  updateMachineHistory: (id: string, data: MachineHistoryFormData) => Promise<any>;
  deleteMachineHistory: (id: string) => Promise<any>;
  masterData: AllMasterData | null;
  isMasterDataLoading: boolean;
  submitWorkOrder: (data: WorkOrderFormData) => Promise<WorkOrder>;
  getWorkOrders: () => Promise<WorkOrder[]>;
  getWorkOrderById: (id: string | number) => Promise<WorkOrder>;
  updateWorkOrder: (id: string | number, data: WorkOrderFormData) => Promise<WorkOrder>;
  deleteWorkOrder: (id: string | number) => Promise<any>;
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  fetchUser: () => Promise<User>;
  getUsers: () => Promise<User[]>;
  hasPermission: (permission: string | PermissionName) => boolean;
  setEditingUser: (user: EditingUser | null) => void;
  getRoles: () => Promise<Role[]>;
  createRole: (role: Omit<Role, "id">) => Promise<Role>;
  updateRole: (id: string, role: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  updateUserPermissions: (userId: string, data: { roleId?: string | null; customPermissions?: string[] }) => Promise<User>;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);
const mapApiToUser = (apiUser: any): User => {
  const mappedCustomPermissions = apiUser.customPermissions || [];
  const mappedPermissions = apiUser.permissions || [];

  return {
    id: String(apiUser.id),
    name: apiUser.name,
    email: apiUser.email,
    roleId: apiUser.roleId || "",
    roles: apiUser.roles || [],
    allPermissions: apiUser.allPermissions || [],
    permissions: apiUser.permissions || [],
    department: apiUser.department || "none",
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [masterData, setMasterData] = useState<AllMasterData | null>(null);
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<EditingUser | null>(null);
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  const hasPermission = useCallback(
    (permission: string | PermissionName): boolean => {
      if (!user) return false;

      // Jika permission adalah ID (string angka), convert ke PermissionName
      const permissionName = /^\d+$/.test(permission as string) ? getPermissionNameById(permission as string) : (permission as PermissionName);

      if (!permissionName) return false;

      if (user.roleId === "3") return true; // Superadmin
      return user.permissions?.includes(permissionName) || false;
    },
    [user]
  );

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    } else {
      setIsMasterDataLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      if (token) {
        const logoutHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/logout`, {
          method: "POST",
          headers: logoutHeaders,
        });
      }
    } catch (error) {
      console.error("Error API logout:", error);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setMasterData(null);
      setIsMasterDataLoading(false);
      setIsLoggingOut(false);
      navigate("/login");
    }
  }, [token, navigate]);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      try {
        const authToken = token || localStorage.getItem("token");

        if (!authToken) {
          throw new Error("No authentication token found");
        }

        const headers: Record<string, string> = {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(options.headers as Record<string, string>),
          Authorization: `Bearer ${authToken}`,
        };

        const fullUrl = `${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`;

        const response = await fetch(fullUrl, {
          ...options,
          headers,
        });

        if (response.status === 401) {
          await logout();
          throw new Error("Session expired. Please login again.");
        }

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || `Request failed with status ${response.status}`);
        }

        return response.json();
      } catch (error) {
        console.error("Fetch error:", error);
        throw error;
      }
    },
    [token, logout]
  );

  const fetchUser = useCallback(async (): Promise<User> => {
    try {
      const userData = await fetchWithAuth("/user/profile");
      const mappedUser: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.email,
        roles: userData.roles, // Directly use the string array
        permissions: userData.permissions || [],
      };
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      console.error("Failed to fetch user:", error);
      await logout();
      throw error;
    }
  }, [fetchWithAuth, logout]);

  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      const response = await fetchWithAuth("/users");
      return response.map((apiUser: any) => mapApiToUser(apiUser));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      throw error;
    }
  }, [fetchWithAuth]);

  const getAllMasterData = useCallback(async (): Promise<AllMasterData> => {
    try {
      const [mesins, groups, shifts, units, unitspareparts, itemtroubles, jenisaktivitas, kegiatans, stoptimes] = await Promise.all([
        fetchWithAuth("/mesin"),
        fetchWithAuth("/group"),
        fetchWithAuth("/shift"),
        fetchWithAuth("/unit"),
        fetchWithAuth("/unitsp"),
        fetchWithAuth("/itemtrouble"),
        fetchWithAuth("/jenisaktifitas"),
        fetchWithAuth("/kegiatan"),
        fetchWithAuth("/stoptime"),
      ]);

      return {
        mesin: mesins,
        shifts: shifts,
        groups: groups,
        stoptimes: stoptimes,
        units: units,
        itemtroubles: itemtroubles,
        jenisaktivitas: jenisaktivitas,
        kegiatans: kegiatans,
        unitspareparts: unitspareparts,
      };
    } catch (error) {
      console.error("Gagal mengambil semua data master:", error);
      throw error;
    }
  }, [fetchWithAuth]);

  useEffect(() => {
    const loadMasterData = async () => {
      if (isAuthenticated && !masterData) {
        setIsMasterDataLoading(true);
        try {
          const data = await getAllMasterData();
          setMasterData(data);
        } catch (error) {
          console.error("Gagal memuat data master:", error);
        } finally {
          setIsMasterDataLoading(false);
        }
      } else if (!isAuthenticated && masterData) {
        setMasterData(null);
        setIsMasterDataLoading(false);
      } else if (!isAuthenticated && !masterData) {
        setIsMasterDataLoading(false);
      }
    };
    loadMasterData();
  }, [isAuthenticated, masterData, getAllMasterData]);

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Pendaftaran gagal");

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);

        const freshUser = await fetchUser();
        setUser(freshUser);

        navigate("/dashboard");
      } else {
        throw new Error("Token tidak diterima setelah pendaftaran.");
      }
    } catch (error) {
      console.error("Error pendaftaran:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Login gagal");

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);

        const freshUser = await fetchUser();
        setUser(freshUser);

        navigate("/dashboard");
      } else {
        throw new Error("Token tidak diterima setelah login.");
      }
    } catch (error) {
      console.error("Error login:", error);
      throw error;
    }
  };

  const submitMachineHistory = useCallback(
    async (data: MachineHistoryFormData) => {
      try {
        const responseData = await fetchWithAuth("/mhs", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return responseData;
      } catch (error) {
        console.error("Gagal menyimpan data history mesin:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const getMachineHistories = useCallback(async (): Promise<MachineHistoryRecord[]> => {
    try {
      const response = await fetchWithAuth("/mhs");

      if (response && response.data && Array.isArray(response.data)) {
        if (!masterData) {
          console.warn("Master data belum dimuat saat mengambil daftar history. Beberapa field mungkin menampilkan '-'.");
        }
        return response.data.map((apiDataItem: any) => mapApiToMachineHistoryRecord(apiDataItem, masterData));
      }

      console.error("Invalid response format:", response);
      return [];
    } catch (error) {
      console.error("Gagal mengambil daftar history mesin:", error);
      return [];
    }
  }, [fetchWithAuth, masterData]);

  const getMachineHistoryById = useCallback(
    async (id: string): Promise<any> => {
      try {
        const data = await fetchWithAuth(`/mhs/${id}`);
        return data;
      } catch (error) {
        console.error(`Gagal mengambil history mesin dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const updateMachineHistory = useCallback(
    async (id: string, data: MachineHistoryFormData): Promise<any> => {
      try {
        const responseData = await fetchWithAuth(`/mhs/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return responseData;
      } catch (error) {
        console.error(`Gagal mengupdate history mesin dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const deleteMachineHistory = useCallback(
    async (id: string): Promise<any> => {
      try {
        const responseData = await fetchWithAuth(`/mhs/${id}`, {
          method: "DELETE",
        });
        return responseData;
      } catch (error) {
        console.error(`Gagal menghapus history mesin dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const submitWorkOrder = useCallback(
    async (data: WorkOrderFormData): Promise<WorkOrder> => {
      try {
        const responseData = await fetchWithAuth("/wos", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return responseData.data;
      } catch (error) {
        console.error("Gagal menyimpan Work Order:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const getWorkOrders = useCallback(async (): Promise<WorkOrder[]> => {
    try {
      const response = await fetchWithAuth("/wos");
      if (response && response.data && Array.isArray(response.data)) {
        return response.data;
      }
      console.error("Format respons Work Order tidak valid:", response);
      return [];
    } catch (error) {
      console.error("Gagal mengambil daftar Work Order:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkOrderById = useCallback(
    async (id: string | number): Promise<WorkOrder> => {
      try {
        const responseData = await fetchWithAuth(`/wos/${id}`);
        return responseData.data;
      } catch (error) {
        console.error(`Gagal mengambil Work Order dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const updateWorkOrder = useCallback(
    async (id: string | number, data: WorkOrderFormData): Promise<WorkOrder> => {
      try {
        const responseData = await fetchWithAuth(`/wos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });
        return responseData.data;
      } catch (error) {
        console.error(`Gagal mengupdate Work Order dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const deleteWorkOrder = useCallback(
    async (id: string | number): Promise<any> => {
      try {
        const responseData = await fetchWithAuth(`/wos/${id}`, {
          method: "DELETE",
        });
        return responseData;
      } catch (error) {
        console.error(`Gagal menghapus Work Order dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      try {
        const response = await fetchWithAuth("/user/password-update", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            current_password: oldPassword,
            new_password: newPassword,
            new_password_confirmation: newPassword,
          }),
        });

        console.log("Password changed successfully:", response);
      } catch (error: any) {
        console.error("Failed to change password:", error);
        throw new Error(error.message || "An unexpected error occurred during password change.");
      }
    },
    [fetchWithAuth]
  );

  const getRoles = useCallback(async (): Promise<Role[]> => {
    try {
      const response = await fetchWithAuth("/roles");
      return response.map((role: any) => ({
        id: String(role.id),
        name: role.name,
        description: role.description || `${role.name} role`,
        permissions: role.permissions.map(String),
        isSuperadmin: role.name === "superadmin",
      }));
    } catch (error) {
      console.error("Failed to fetch roles:", error);
      throw error;
    }
  }, [fetchWithAuth]);

  const createRole = useCallback(
    async (role: Omit<Role, "id">): Promise<Role> => {
      try {
        const response = await fetchWithAuth("/roles", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: role.name,
            description: role.description,
            permissions: role.permissions.map(Number),
          }),
        });
        return {
          id: String(response.id),
          name: response.name,
          description: response.description,
          permissions: response.permissions.map(String),
        };
      } catch (error) {
        console.error("Failed to create role:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const updateRole = useCallback(
    async (id: string, role: Partial<Role>): Promise<Role> => {
      try {
        const response = await fetchWithAuth(`/roles/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: role.name,
            description: role.description,
            permissions: role.permissions?.map(Number),
          }),
        });
        return {
          id: String(response.id),
          name: response.name,
          description: response.description,
          permissions: response.permissions.map(String),
        };
      } catch (error) {
        console.error("Failed to update role:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const deleteRole = useCallback(
    async (id: string): Promise<void> => {
      try {
        await fetchWithAuth(`/roles/${id}`, { method: "DELETE" });
      } catch (error) {
        console.error("Failed to delete role:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const updateUserPermissions = useCallback(
    async (userId: string, data: { roleId?: string | null; customPermissions?: string[] }): Promise<User> => {
      try {
        const currentUser = await fetchWithAuth(`/users/${userId}`);

        const response = await fetchWithAuth(`/users/${userId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: currentUser.name,
            email: currentUser.email,
            department: currentUser.department,
            roleId: data.roleId || null,
            allPermissions: data.customPermissions || [],
          }),
        });

        return mapApiToUser(response);
      } catch (error) {
        throw error;
      }
    },
    [fetchWithAuth]
  );

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated,
        login,
        register,
        logout,
        isLoggingOut,
        fetchWithAuth,
        getAllMasterData,
        submitMachineHistory,
        getMachineHistories,
        getMachineHistoryById,
        updateMachineHistory,
        deleteMachineHistory,
        masterData,
        isMasterDataLoading,
        submitWorkOrder,
        getWorkOrders,
        getWorkOrderById,
        updateWorkOrder,
        deleteWorkOrder,
        changePassword,
        fetchUser,
        getUsers,
        hasPermission,
        setEditingUser,
        getRoles,
        createRole,
        updateRole,
        deleteRole,
        updateUserPermissions,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
