import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

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
  nik: string;
  roleId?: string;
  roles?: string[];
  customPermissions?: string[];
  permissions?: PermissionName[];
  department?: string | null;
  rolePermissions?: string[];
  access_token?: string;
  refresh_token?: string;
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
  login: (nik: string, password: string) => Promise<void>;
  register: (name: string, nik: string, password: string, department?: string, position?: string, roleId?: string, customPermissions?: string[]) => Promise<any>;
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
  deleteUser: (id: string) => Promise<void>;
  isAuthLoading: boolean;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

const mapApiToUser = (apiUser: any): User => {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    nik: apiUser.nik,
    roleId: apiUser.roleId || null,
    roles: apiUser.roles || [],
    customPermissions: apiUser.customPermissions || [],
    permissions: apiUser.allPermissions || [],
    department: apiUser.department || "none",
    refresh_token: apiUser.refresh_token || undefined,
  };
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [masterData, setMasterData] = useState<AllMasterData | null>(null);
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [editingUser, _setEditingUser] = useState<EditingUser | null>(null);
  const navigate = useNavigate();
  const isRefreshingToken = useRef(false);

  const initializeAuthState = useCallback(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken) {
      setToken(storedToken);
      if (storedUser) {
        try {
          setUser(JSON.parse(storedUser));
        } catch {
          localStorage.removeItem("user");
        }
      }
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      if (token) {
        await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setMasterData(null);
      setIsLoggingOut(false);
      navigate("/login");
    }
  }, [token, navigate]);

  const refreshAccessToken = useCallback(async (): Promise<string | null> => {
    if (isRefreshingToken.current) {
      return new Promise((resolve) => {
        const checkInterval = setInterval(() => {
          if (!isRefreshingToken.current) {
            clearInterval(checkInterval);
            resolve(localStorage.getItem("token"));
          }
        }, 100);
      });
    }

    isRefreshingToken.current = true;
    const refreshToken = localStorage.getItem("refreshToken");

    if (!refreshToken) {
      await logout();
      return null;
    }

    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) throw new Error("Token refresh failed");

      const data = await response.json();
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token || refreshToken;

      localStorage.setItem("token", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);
      setToken(newAccessToken);
      setUser((prev) => (prev ? { ...prev, access_token: newAccessToken, refresh_token: newRefreshToken } : null));

      return newAccessToken;
    } catch {
      await logout();
      return null;
    } finally {
      isRefreshingToken.current = false;
    }
  }, [logout]);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      let currentToken = token || localStorage.getItem("token");

      const makeRequest = async (tokenToUse: string | null) => {
        if (!tokenToUse) throw new Error("No authentication token available");

        const headers = new Headers(options.headers);
        headers.set("Content-Type", "application/json");
        headers.set("Authorization", `Bearer ${tokenToUse}`);

        try {
          const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`, {
            ...options,
            headers,
          });

          if (response.status === 401) {
            const newToken = await refreshAccessToken();
            if (newToken) return makeRequest(newToken);
            throw new Error("Session expired");
          }

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || "Request failed");
          }

          return response.json();
        } catch (error) {
          throw error;
        }
      };

      return makeRequest(currentToken);
    },
    [token, refreshAccessToken]
  );

  const fetchUser = useCallback(async (): Promise<User> => {
    const userData = await fetchWithAuth("/user/profile");
    const mappedUser = mapApiToUser(userData);
    setUser(mappedUser);
    localStorage.setItem("user", JSON.stringify(mappedUser));
    return mappedUser;
  }, [fetchWithAuth]);

  const getAllMasterData = useCallback(async (): Promise<AllMasterData> => {
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
  }, [fetchWithAuth]);

  const hasPermission = useCallback(
    (permission: string | PermissionName | string[]): boolean => {
      if (!user) return false;
      if (user.roleId === "3") return true;

      if (Array.isArray(permission)) {
        return permission.some((p) => {
          const permName = /^\d+$/.test(p) ? getPermissionNameById(p) : (p as PermissionName);
          return permName ? user.permissions?.includes(permName) : false;
        });
      }

      const permissionName = /^\d+$/.test(permission as string) ? getPermissionNameById(permission as string) : (permission as PermissionName);
      return permissionName ? user.permissions?.includes(permissionName) || false : false;
    },
    [user]
  );

  useEffect(() => {
    initializeAuthState();

    const loadInitialData = async () => {
      if (token) {
        try {
          await fetchUser();
          const data = await getAllMasterData();
          setMasterData(data);
        } catch (error) {
        } finally {
          setIsAuthLoading(false);
          setIsMasterDataLoading(false);
        }
      } else {
        setIsAuthLoading(false);
        setIsMasterDataLoading(false);
      }
    };

    loadInitialData();
  }, [token, initializeAuthState, fetchUser, getAllMasterData, refreshAccessToken, logout]);

  const register = async (name: string, nik: string, password: string, department?: string, position?: string, roleId?: string, customPermissions?: string[]) => {
    const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nik,
        password,
        department,
        position,
        role_id: roleId || null,
        customPermissions: customPermissions ? customPermissions.map(Number) : [],
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "User creation failed");
    return data;
  };

  const login = useCallback(
    async (nik: string, password: string) => {
      setIsAuthLoading(true);
      try {
        const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nik, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();
        const loggedInUser = mapApiToUser(data.user);

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setToken(data.access_token);
        setUser(loggedInUser);

        try {
          const masterData = await getAllMasterData();
          setMasterData(masterData);
        } catch (error) {
          console.error("Failed to load master data:", error);
        }

        navigate("/dashboard");
      } finally {
        setIsAuthLoading(false);
      }
    },
    [navigate, getAllMasterData]
  );

  const submitMachineHistory = useCallback(
    async (data: MachineHistoryFormData) => {
      const responseData = await fetchWithAuth("/mhs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const getMachineHistories = useCallback(async (): Promise<MachineHistoryRecord[]> => {
    const response = await fetchWithAuth("/mhs");

    if (response && response.data && Array.isArray(response.data)) {
      return response.data.map((apiDataItem: any) => mapApiToMachineHistoryRecord(apiDataItem, masterData));
    }

    return [];
  }, [fetchWithAuth, masterData]);

  const getMachineHistoryById = useCallback(
    async (id: string): Promise<any> => {
      const data = await fetchWithAuth(`/mhs/${id}`);
      return data;
    },
    [fetchWithAuth]
  );

  const updateMachineHistory = useCallback(
    async (id: string, data: MachineHistoryFormData): Promise<any> => {
      const responseData = await fetchWithAuth(`/mhs/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const deleteMachineHistory = useCallback(
    async (id: string): Promise<any> => {
      const responseData = await fetchWithAuth(`/mhs/${id}`, {
        method: "DELETE",
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const submitWorkOrder = useCallback(
    async (data: WorkOrderFormData): Promise<WorkOrder> => {
      const responseData = await fetchWithAuth("/wos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const getWorkOrders = useCallback(async (): Promise<WorkOrder[]> => {
    const response = await fetchWithAuth("/wos");
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }, [fetchWithAuth]);

  const getWorkOrderById = useCallback(
    async (id: string | number): Promise<WorkOrder> => {
      const responseData = await fetchWithAuth(`/wos/${id}`);
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const updateWorkOrder = useCallback(
    async (id: string | number, data: WorkOrderFormData): Promise<WorkOrder> => {
      const responseData = await fetchWithAuth(`/wos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const deleteWorkOrder = useCallback(
    async (id: string | number): Promise<any> => {
      const responseData = await fetchWithAuth(`/wos/${id}`, {
        method: "DELETE",
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await fetchWithAuth("/user/password-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          current_password: oldPassword,
          new_password: newPassword,
          new_password_confirmation: newPassword,
        }),
      });
    },
    [fetchWithAuth]
  );

  const getUsers = useCallback(async (): Promise<User[]> => {
    const response = await fetchWithAuth("/users");
    return response.map((apiUser: any) => mapApiToUser(apiUser));
  }, [fetchWithAuth]);

  const getRoles = useCallback(async (): Promise<Role[]> => {
    const response = await fetchWithAuth("/roles");
    return response.map((role: any) => ({
      id: String(role.id),
      name: role.name,
      description: role.description || `${role.name} role`,
      permissions: role.permissions.map(String),
      isSuperadmin: role.name === "superadmin",
    }));
  }, [fetchWithAuth]);

  const createRole = useCallback(
    async (role: Omit<Role, "id">): Promise<Role> => {
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
    },
    [fetchWithAuth]
  );

  const updateRole = useCallback(
    async (id: string, role: Partial<Role>): Promise<Role> => {
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
    },
    [fetchWithAuth]
  );

  const deleteRole = useCallback(
    async (id: string): Promise<void> => {
      await fetchWithAuth(`/roles/${id}`, { method: "DELETE" });
    },
    [fetchWithAuth]
  );

  const updateUserPermissions = useCallback(
    async (userId: string, data: { roleId?: string | null; customPermissions?: string[] }): Promise<User> => {
      const currentUser = await fetchWithAuth(`/users/${userId}`);
      const response = await fetchWithAuth(`/users/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: currentUser.name,
          nik: currentUser.nik,
          department: currentUser.department,
          roleId: data.roleId || null,
          customPermissions: data.customPermissions || [],
        }),
      });
      return mapApiToUser(response);
    },
    [fetchWithAuth]
  );

  const deleteUser = useCallback(
    async (id: string): Promise<void> => {
      await fetchWithAuth(`/users/${id}`, { method: "DELETE" });
    },
    [fetchWithAuth]
  );

  const setEditingUser = useCallback((user: EditingUser | null) => {
    _setEditingUser(user);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
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
        deleteUser,
        isAuthLoading,
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
