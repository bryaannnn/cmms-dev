import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

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
  | "view_reports"
  | "export_reports"
  | "view_settings"
  | "edit_settings"
  | "view_permissions"
  | "edit_permissions"
  | "manage_users";

export interface User {
  id: string;
  name: string;
  email: string;
  roles: string[];
  permissions?: PermissionName[];
  department: string | null;
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
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [masterData, setMasterData] = useState<AllMasterData | null>(null);
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(true);
  const navigate = useNavigate();

  const isAuthenticated = !!token;

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
      const authToken = token || localStorage.getItem("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        Accept: "application/json",
        ...(options.headers as Record<string, string>),
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`;
      }

      const fullUrl = `${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`;

      const fetchOptions: RequestInit = {
        ...options,
        headers: headers,
      };

      const response = await fetch(fullUrl, fetchOptions);

      if (response.status === 401) {
        try {
          await logout();
        } catch (logoutError) {
          console.error("Error during automatic logout after 401:", logoutError);
        }
        throw new Error("Sesi berakhir. Silakan login kembali.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Permintaan gagal dengan status: ${response.status}`);
      }

      return response.json();
    },
    [token, navigate, logout]
  );

  const fetchUser = useCallback(async (): Promise<User> => {
    try {
      const userData = await fetchWithAuth("/user");
      const mappedUser: User = {
        id: String(userData.id),
        name: userData.name,
        email: userData.email,
        roles: userData.roles,
        permissions: userData.permissions,
        department: userData.department,
      };
      setUser(mappedUser);
      localStorage.setItem("user", JSON.stringify(mappedUser));
      return mappedUser;
    } catch (error) {
      console.error("Gagal mengambil data user:", error);
      await logout();
      throw error;
    }
  }, [fetchWithAuth, logout]);

  const getUsers = useCallback(async (): Promise<User[]> => {
    try {
      const response = await fetchWithAuth("/users");

      if (response && Array.isArray(response.data)) {
        return response.data.map((apiUser: any) => ({
          id: String(apiUser.id),
          name: apiUser.name,
          email: apiUser.email,
          roles: apiUser.roles,
          permissions: apiUser.permissions,
          department: apiUser.department,
        }));
      }
      console.error("Format respons untuk daftar pengguna tidak valid:", response);
      return [];
    } catch (error) {
      console.error("Gagal mengambil daftar pengguna:", error);
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

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, Math.min(text.length, 50))}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Pendaftaran gagal");
      }

      if (data.token && data.user) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/dashboard");
      } else {
        throw new Error("Token atau data user tidak diterima setelah pendaftaran.");
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

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Login gagal");
      }

      const data = await response.json();

      if (data.token && data.user) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        navigate("/dashboard");
      } else {
        throw new Error("Token atau data user tidak diterima setelah login.");
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
