import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";

interface User {
  id: string;
  name: string;
  email: string;
}

interface Mesin {
  id: string;
  name: string;
}

interface MachineHistoryFormData {
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

export type { User };

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<any>;
  getMesin: (field: string) => Promise<string[]>;
  submitMachineHistory: (data: MachineHistoryFormData) => Promise<any>;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mesinList, setMesinList] = useState([]);
  const [selectedMesin, setSelectedMesin] = useState("");
  const navigate = useNavigate();

  const isAuthenticated = !!token;

  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      setToken(token);
      setUser(JSON.parse(user));
    }
  }, []);

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const authToken = token || localStorage.getItem("token");
    if (!authToken) throw new Error("No authentication token found");

    const fullUrl = `${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`;
    const response = await fetch(fullUrl, {
      ...options,
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      await logout();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Request failed");
    }

    return response.json();
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const contentType = response.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        const text = await response.text();
        throw new Error(`Expected JSON but got: ${text.substring(0, 50)}...`);
      }

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Registration failed");
      }

      setToken(data.token);
      setUser(data.user);

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      navigate("/dashboard");

      return data;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Login failed");
      }

      const data = await response.json();
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);

      navigate("/dashboard");
      return data;
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const logout = async () => {
    setIsLoggingOut(true);
    try {
      if (token) {
        await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/logout`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
      }
    } catch (error) {
      console.error("Logout API error:", error);
    } finally {
      console.log("Removing token and user from localStorage...");
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setToken(null);
      setUser(null);
      setIsLoggingOut(false);

      setTimeout(() => {
        navigate("/login");
      }, 100);
    }
  };

  const getMesin = async (): Promise<string[]> => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/mesin`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Mesin[] = await response.json();
      return data.map((item) => item.name);
    } catch (error) {
      console.error("Gagal mengambil data mesin:", error);
      throw error;
    }
  };

  const submitMachineHistory = async (data: MachineHistoryFormData) => {
    try {
      const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/machinehistory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Gagal menyimpan data dengan status: ${response.status}`);
      }

      const responseData = await response.json();
      return responseData;
    } catch (error) {
      console.error("Gagal menyimpan data history mesin:", error);
      throw error;
    }
  };

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
