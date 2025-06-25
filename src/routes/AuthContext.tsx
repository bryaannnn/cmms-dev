// src/routes/AuthContext.ts
import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

// --- Type Definitions ---
type UserRole = "customer" | "helpdesk" | "technician" | "supervisor" | "vendor" | "admin";

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  mobile: string;
  role: UserRole;
  roles: { id: number; name: string }[]; // Assuming roles is an array of objects from API
  avatar: string;
  department: string;
}

// ... (Other interfaces like Mesin, Shift, Group, etc. remain unchanged) ...
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

// --- AuthContextType Interface ---
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
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem("token")); // Initialize from localStorage
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
        // Assume user data from localStorage is complete and correct User type
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.error("Failed to parse user from localStorage", e);
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        setUser(null);
        setToken(null);
      }
    } else {
      setIsMasterDataLoading(false); // No user, no master data to load
    }
  }, []); // Run only once on component mount

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      if (token) {
        const logoutHeaders: Record<string, string> = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        // Attempt to call logout API, but don't block on its success/failure
        // The main goal is to clear local state regardless
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
      setMasterData(null); // Clear master data on logout
      setIsMasterDataLoading(false); // Reset loading state
      setIsLoggingOut(false);
      navigate("/login");
    }
  }, [token, navigate]); // logout depends on token and navigate

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const authToken = token || localStorage.getItem("token"); // Always try current token first

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
        // If 401, session expired. Force logout.
        try {
          await logout(); // Use the memoized logout
        } catch (logoutError) {
          console.error("Error during automatic logout after 401:", logoutError);
        }
        throw new Error("Session expired. Please log in again.");
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Request failed with status: ${response.status}`);
      }

      return response.json();
    },
    [token, logout] // fetchWithAuth depends on token and the memoized logout
  );

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
      console.error("Failed to fetch all master data:", error);
      throw error;
    }
  }, [fetchWithAuth]); // Depends on the memoized fetchWithAuth

  useEffect(() => {
    const loadMasterData = async () => {
      if (isAuthenticated && !masterData && !isMasterDataLoading) {
        // Prevent re-trigger if already loading
        setIsMasterDataLoading(true);
        try {
          const data = await getAllMasterData();
          setMasterData(data);
        } catch (error) {
          console.error("Failed to load master data:", error);
        } finally {
          setIsMasterDataLoading(false);
        }
      } else if (!isAuthenticated && masterData) {
        // Clear master data if user logs out
        setMasterData(null);
        setIsMasterDataLoading(false);
      } else if (!isAuthenticated && !masterData && isMasterDataLoading) {
        // If no user and not already loading, ensure loading state is false.
        setIsMasterDataLoading(false);
      }
    };
    loadMasterData();
  }, [isAuthenticated, masterData, getAllMasterData, isMasterDataLoading]); // Add isMasterDataLoading to dependencies for clarity

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          const text = await response.text();
          throw new Error(`Expected JSON but got: ${text.substring(0, Math.min(text.length, 50))}...`);
        }

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Registration failed");
        }

        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          // Assuming data.user includes the roles structure for consistency
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          navigate("/dashboard");
        } else {
          throw new Error("Token or user data not received after registration.");
        }
      } catch (error) {
        console.error("Registration error:", error);
        throw error;
      }
    },
    [navigate]
  ); // navigate is a dependency

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Login failed");
        }

        const data = await response.json();

        if (data.token && data.user) {
          localStorage.setItem("token", data.token);
          setToken(data.token);
          // Ensure the user object stored includes roles if your API returns them
          // The API response you showed previously had roles at the top level,
          // so you might need to merge them into data.user here before storing.
          // For example: const userWithRoles = { ...data.user, roles: data.roles };
          // localStorage.setItem("user", JSON.stringify(userWithRoles));
          // setUser(userWithRoles);
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          navigate("/dashboard");
        } else {
          throw new Error("Token or user data not received after login.");
        }
      } catch (error) {
        console.error("Login error:", error);
        throw error;
      }
    },
    [navigate]
  ); // navigate is a dependency

  const submitMachineHistory = useCallback(
    async (data: MachineHistoryFormData) => {
      try {
        const responseData = await fetchWithAuth("/mhs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return responseData;
      } catch (error) {
        console.error("Failed to save machine history data:", error);
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
          console.warn("Master data not loaded when fetching history list. Some fields might display '-'.");
        }
        return response.data.map((apiDataItem: any) => mapApiToMachineHistoryRecord(apiDataItem, masterData));
      }

      console.error("Invalid response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch machine history list:", error);
      return [];
    }
  }, [fetchWithAuth, masterData]); // masterData is a dependency

  const getMachineHistoryById = useCallback(
    async (id: string): Promise<any> => {
      try {
        const data = await fetchWithAuth(`/mhs/${id}`);
        return data;
      } catch (error) {
        console.error(`Failed to fetch machine history with ID ${id}:`, error);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return responseData;
      } catch (error) {
        console.error(`Failed to update machine history with ID ${id}:`, error);
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
        console.error(`Failed to delete machine history with ID ${id}:`, error);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return responseData.data;
      } catch (error) {
        console.error("Failed to save Work Order:", error);
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
      console.error("Invalid Work Order response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch Work Order list:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkOrderById = useCallback(
    async (id: string | number): Promise<WorkOrder> => {
      try {
        const responseData = await fetchWithAuth(`/wos/${id}`);
        return responseData.data;
      } catch (error) {
        console.error(`Failed to fetch Work Order with ID ${id}:`, error);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        return responseData.data;
      } catch (error) {
        console.error(`Failed to update Work Order with ID ${id}:`, error);
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
        console.error(`Failed to delete Work Order with ID ${id}:`, error);
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
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            current_password: oldPassword,    
            new_password: newPassword,
            new_password_confirmation: newPassword,
          }),
        });
        console.log("Password changed successfully:", response);
      } catch (error: any) {
        console.error("Failed to change password in context:", error);
        throw new Error(error.message || "An unexpected error occurred during password change.");
      }
    },
    [fetchWithAuth] 
  );

  const contextValue = useMemo(
    () => ({
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
    }),
    [
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
    ]
  );

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === null) {
    // Changed to null because createContext<AuthContextType | null>(null)
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
