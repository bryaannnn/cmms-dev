import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

export interface User {
  id: string;
  name: string;
  email: string;
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
  stopJam?: number | null;
  stopMenit?: number | null;
  startJam?: number | null;
  startMenit?: number | null;
  stopTime: string; // This will be the ID on submission, name for display
  unit: string;
  mesin: string;
  runningHour: number;
  itemTrouble: string; // This will be the ID on submission, name for display
  jenisGangguan: string;
  bentukTindakan: string;
  perbaikanPerawatan: string;
  rootCause: string;
  jenisAktivitas: string; // This will be the ID on submission, name for display
  kegiatan: string; // This will be the ID on submission, name for display
  kodePart: string;
  sparePart: string;
  idPart: string;
  jumlah: number;
  unitSparePart: string; // This will be the ID on submission, name for display
}

export interface MachineHistoryRecord extends MachineHistoryFormData {
  id: string;
  startstop?: Startstop | null;
  // Note: For display, `shift`, `group`, `unit`, `mesin`, `itemTrouble`, `jenisAktivitas`, `kegiatan`, `unitSparePart`
  // will hold names, even though `_id` versions exist in raw API data.
  // The mapApiToMachineHistoryRecord handles this.
}

/**
 * Maps raw API data for a machine history record to the MachineHistoryRecord interface.
 * It enriches ID-based fields with their corresponding names from master data where necessary.
 * @param apiData The raw data received from the API.
 * @param masterData All loaded master data (can be null during initial loading).
 * @returns A formatted MachineHistoryRecord.
 */
function mapApiToMachineHistoryRecord(apiData: any, masterData: AllMasterData | null): MachineHistoryRecord {
  // Directly use nested object names if available, otherwise try to map from masterData by ID.
  // Fallback to "-" if no name can be found.

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
    stopTime: stopTimeName, // This specifically relies on masterData if no nested object
    runningHour: apiData.running_hour ?? 0,
    itemTrouble: itemTroubleName,
    jenisGangguan: apiData.jenis_gangguan || "",
    bentukTindakan: apiData.bentuk_tindakan || "",
    perbaikanPerawatan: "", // Assuming this is not from API, or always empty
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
  getMachineHistoryById: (id: string) => Promise<MachineHistoryRecord | null>;
  updateMachineHistory: (id: string, data: Partial<MachineHistoryFormData>) => Promise<any>;
  deleteMachineHistory: (id: string) => Promise<any>;
  masterData: AllMasterData | null;
  isMasterDataLoading: boolean; // <-- NEW: Master data loading state
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [masterData, setMasterData] = useState<AllMasterData | null>(null);
  const [isMasterDataLoading, setIsMasterDataLoading] = useState(true); // <-- NEW: Master data loading state
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
      // If no token, then master data doesn't need to load immediately for an unauthenticated user
      setIsMasterDataLoading(false);
    }
  }, []);

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
    [token, navigate, user]
  );

  // --- getAllMasterData: Fetches all necessary master data ---
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

  // --- Effect to load master data on authentication ---
  useEffect(() => {
    const loadMasterData = async () => {
      // Only load if authenticated AND masterData is not yet loaded
      if (isAuthenticated && !masterData) {
        setIsMasterDataLoading(true); // Set loading to true
        try {
          const data = await getAllMasterData();
          setMasterData(data);
        } catch (error) {
          console.error("Gagal memuat data master:", error);
          // Optionally handle master data loading errors, e.g., show a message
        } finally {
          setIsMasterDataLoading(false); // Set loading to false regardless of success/failure
        }
      } else if (!isAuthenticated && masterData) {
        // If user logs out, clear master data and reset loading state
        setMasterData(null);
        setIsMasterDataLoading(false);
      } else if (!isAuthenticated && !masterData) {
        // If already not authenticated and no master data, ensure loading is false
        setIsMasterDataLoading(false);
      }
    };
    loadMasterData();
  }, [isAuthenticated, masterData, getAllMasterData]); // Dependencies for this effect

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
      setMasterData(null); // Clear master data on logout
      setIsMasterDataLoading(false); // Reset master data loading
      setIsLoggingOut(false);
      navigate("/login");
    }
  }, [token, navigate]);

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
        // Warning only if masterData is truly null, and it's needed (e.g., for stoptime_id)
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
  }, [fetchWithAuth, masterData]); // Ensure masterData is a dependency

  const getMachineHistoryById = useCallback(
    async (id: string): Promise<MachineHistoryRecord | null> => {
      try {
        const data = await fetchWithAuth(`/mhs/${id}`);
        if (!masterData) {
          console.warn("Master data belum dimuat saat mengambil history by ID. Beberapa field mungkin menampilkan '-'.");
        }
        return mapApiToMachineHistoryRecord(data, masterData);
      } catch (error) {
        console.error(`Gagal mengambil history mesin dengan ID ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth, masterData] // Ensure masterData is a dependency
  );

  const updateMachineHistory = useCallback(
    async (id: string, data: Partial<MachineHistoryFormData>): Promise<any> => {
      try {
        const responseData = await fetchWithAuth(`/mhs/${id}`, {
          method: "PUT",
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
        isMasterDataLoading, // <-- Expose the loading state
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
