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

export interface MachineHistoryFormData {
  date: string;
  shift: string;
  group: string;
  stopJam: number;
  stopMenit: number;
  startJam: number;
  startMenit: number;
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

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<any>;
  getMesin: () => Promise<Mesin[]>;
  submitMachineHistory: (data: MachineHistoryFormData) => Promise<any>;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!user;

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
    }
  }, []);

  const fetchWithAuth = useCallback(
    async (url: string, options: RequestInit = {}) => {
      const authToken = token || localStorage.getItem("token");

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>), 
      };

      if (authToken) {
        headers.Authorization = `Bearer ${authToken}`; 
      }

      const fullUrl = `${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`;

      const fetchOptions: RequestInit = {
        ...options,
        credentials: "include",
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
    [token, user, navigate]
  );

  const register = async (name: string, email: string, password: string) => {
    try {
      await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/sanctum/csrf-cookie`, { credentials: "include" });

      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
        method: "POST",
        credentials: "include",
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

      if (data.token) {
        setToken(data.token);
        localStorage.setItem("token", data.token);
      }
      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (error) {
      console.error("Error pendaftaran:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/sanctum/csrf-cookie`, {
        method: "GET",
        credentials: "include",
      });

      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/login`, {
        method: "POST",
        credentials: "include",
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

      if (data.token) {
        localStorage.setItem("token", data.token);
        setToken(data.token);
      }

      localStorage.setItem("user", JSON.stringify(data.user));
      setUser(data.user);

      navigate("/dashboard");
    } catch (error) {
      console.error("Error login:", error);
      throw error;
    }
  };

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      if (user || token) {
        const logoutHeaders: HeadersInit = {
          "Content-Type": "application/json",
        };
        if (token) {
          (logoutHeaders as Record<string, string>).Authorization = `Bearer ${token}`;
        }

        await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/logout`, {
          method: "POST",
          credentials: "include",
          headers: logoutHeaders,
        });
      }
    } catch (error) {
      console.error("Error API logout:", error);
    } finally {
      console.log("Menghapus token dan user dari localStorage...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setIsLoggingOut(false);
      navigate("/login");
    }
  }, [token, user, navigate]);

  const getMesin = useCallback(async (): Promise<Mesin[]> => {
    try {
      const data: Mesin[] = await fetchWithAuth("/mesin");
      return data;
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error);
      throw error;
    }
  }, [fetchWithAuth]);

  const submitMachineHistory = useCallback(
    async (data: MachineHistoryFormData) => {
      try {
        const responseData = await fetchWithAuth("/machinehistory", {
          method: "POST",
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
        getMesin,
        submitMachineHistory,
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
