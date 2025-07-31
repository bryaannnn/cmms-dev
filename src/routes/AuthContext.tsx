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
  email: string;
  roleId?: string;
  roles?: string[];
  customPermissions?: string[];
  permissions?: PermissionName[];
  department?: string | null;
  rolePermissions?: string[];
  access_token?: string;
  refresh_token?: string;
  isSuperadmin?: boolean;
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
  duration_minutes: number | null;
}

export interface ERPRecord {
  id: number;
  name: string;
  category: string;
  location: string;
  purchaseDate: string;
  description: string;
  type: string | null;
  make: string | null;
  model: string | null;
  status: string | null;
  lastMaintenance: string | null;
  nextMaintenance: string | null;
  workOrders: string | null;
  health: string | null;
  createdAt: string;
  updateAt: string;
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

// export interface WorkOrder {
//   id: number;
//   issue: string;
//   created_by: number;
//   assigned_to: number | null;
//   status: "open" | "in_progress" | "completed" | "on_hold" | "canceled";
//   priority: "low" | "medium" | "high" | "emergency";
//   due_date: string | null;
//   description: string | null;
//   created_at: string;
//   updated_at: string;
//   creator: User;
//   assigned: User | null;
// }

export interface WorkOrderFormData {
  id: number;
  title: string;
  description: string;
  type: "preventive" | "corrective" | "inspection" | "emergency";
  status: "open" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  assignedToAvatar: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  assetId: string;
  assetName: string;
  assetType: string;
  estimatedHours: number | null;
  attachments: File[];
}

type AssetStatus = "running" | "maintenance" | "breakdown" | "idle";
type AssetType = "mechanical" | "electrical" | "vehicle" | "building";

export interface Asset {
  id: string; // ID dari ERP adalah number, tapi di frontend sering string
  name: string;
  category: string;
  location: string;
  purchase_date: string; // Menggunakan nama properti dari respons ERP
  description: string;
  type: "mechanical" | "electrical" | "vehicle" | "building" | null; // Bisa null dari ERP
  make: string | null; // Bisa null dari ERP
  model: string | null; // Bisa null dari ERP
  status: "running" | "maintenance" | "breakdown" | "idle" | null; // Bisa null dari ERP
  last_maintenance: string | null; // Bisa null dari ERP
  next_maintenance: string | null; // Bisa null dari ERP
  work_orders: number | null; // Bisa null dari ERP
  health: number | null; // Bisa null dari ERP
  created_at?: string; // Opsional, dari ERP
  updated_at?: string; // Opsional, dari ERP
}

// Perbarui interface AssetData untuk payload addAsset, sesuai dengan format yang Anda inginkan
export interface AssetData {
  id: number; // Diperbarui menjadi number
  name: string;
  category: string;
  location: string;
  purchase_date: string;
  description: string;
  type: string | null; // Diperbarui menjadi string | null
  make: string | null;
  model: string | null;
  status: string | null;
  last_maintenance: string | null; // Diperbarui menjadi number | null
  next_maintenance: string | null; // Diperbarui menjadi number | null
  work_orders: string | null; // Diperbarui menjadi string | null
  health: string | null; // Diperbarui menjadi string | null
  created_at: string;
  update_at: string;
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
    itemTrouble: apiData.itemtrouble?.name || "-",
    jenisGangguan: apiData.jenis_gangguan || "",
    bentukTindakan: apiData.bentuk_tindakan || "",
    perbaikanPerawatan: apiData.jenisaktifitas?.name === "Perbaikan" ? "Perbaikan" : "Perawatan",
    rootCause: apiData.root_cause || "",
    jenisAktivitas: apiData.jenisaktifitas?.name || "-",
    kegiatan: apiData.kegiatan?.name || "-",
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
  register: (name: string, email: string, nik: string, password: string, department?: string, position?: string, roleId?: string, customPermissions?: string[]) => Promise<any>;
  logout: () => Promise<void>;
  isLoggingOut: boolean;
  fetchWithAuth: (url: string, options?: RequestInit) => Promise<any>;
  getAllMasterData: () => Promise<AllMasterData>;
  submitMachineHistory: (data: MachineHistoryFormData) => Promise<any>;
  getMachineHistories: (searchQuery?: string) => Promise<MachineHistoryRecord[]>;
  getMachineHistoryById: (id: string) => Promise<any>;
  updateMachineHistory: (id: string, data: MachineHistoryFormData) => Promise<any>;
  deleteMachineHistory: (id: string) => Promise<any>;
  masterData: AllMasterData | null;
  isMasterDataLoading: boolean;
  submitWorkOrder: (data: WorkOrderFormData) => Promise<WorkOrderFormData>;
  getWorkOrders: () => Promise<WorkOrderFormData[]>;
  getWorkOrderById: (id: string | number) => Promise<WorkOrderFormData>;
  updateWorkOrder: (id: string | number, data: WorkOrderFormData) => Promise<WorkOrderFormData>;
  deleteWorkOrder: (id: string | number) => Promise<any>;
  approveWorkOrder: (id: string | number) => Promise<WorkOrderFormData>;
  assignWorkOrder: (id: string | number, assignedToUserId: string) => Promise<WorkOrderFormData>;
  cancelWorkOrder: (id: string | number) => Promise<WorkOrderFormData>;
  getWorkOrdersForUser: (userId: string) => Promise<WorkOrderFormData[]>;
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
  getERPData: () => Promise<ERPRecord[]>;
  addAsset: (assetData: AssetData) => Promise<any>;
  editAsset: (assetData: AssetData) => Promise<any>;
  deleteAsset: (assetId: string) => Promise<any>;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

const mapApiToUser = (apiUser: any): User => {
  return {
    id: String(apiUser.id),
    name: apiUser.name,
    nik: apiUser.nik,
    email: apiUser.email,
    roleId: apiUser.roleId || null,
    roles: apiUser.roles || [],
    customPermissions: apiUser.customPermissions || [],
    permissions: apiUser.permissions || apiUser.allPermissions || [],
    department: apiUser.department || "none",
    access_token: apiUser.access_token,
    refresh_token: apiUser.refresh_token,
    isSuperadmin: apiUser.roles?.includes("superadmin") || false,
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

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    try {
      const currentToken = token || localStorage.getItem("token");
      if (currentToken) {
        await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${currentToken}`,
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${refreshToken}`,
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          await logout();
          return null;
        }
        throw new Error("Token refresh failed");
      }

      const data = await response.json();
      const newAccessToken = data.access_token;
      const newRefreshToken = data.refresh_token || refreshToken;

      localStorage.setItem("token", newAccessToken);
      localStorage.setItem("refreshToken", newRefreshToken);

      setToken(newAccessToken);
      setUser((prev) => {
        if (!prev) return null;
        return {
          ...prev,
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
        };
      });

      return newAccessToken;
    } catch (error) {
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
        if (!tokenToUse) {
          throw new Error("No token found");
        }

        const headers = new Headers(options.headers || {});
        if (headers.get("Content-Type")?.includes("application/json") || !headers.has("Content-Type")) {
          headers.set("Content-Type", "application/json");
        }
        headers.set("Authorization", `Bearer ${tokenToUse}`);

        const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}${url}`, {
          ...options,
          headers,
        });

        if (response.status === 204 || response.statusText === "No Content") {
          return null;
        }

        if (!response.ok) {
          let errorData;
          try {
            errorData = await response.json();
          } catch (e) {
            errorData = await response.text();
          }
          throw new Error(errorData.message || `HTTP error! Status: ${response.status}`);
        }

        let responseText;
        try {
          responseText = await response.text();
          return responseText ? JSON.parse(responseText) : null;
        } catch (e) {
          // It's possible the response is not JSON, like a SOAP response
          return responseText;
        }
      };

      try {
        return await makeRequest(currentToken);
      } catch (error) {
        if (error instanceof Error && error.message.includes("status: 401")) {
          const newAccessToken = await refreshAccessToken();
          if (newAccessToken) {
            return await makeRequest(newAccessToken);
          }
        }
        throw error;
      }
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

  const initializeAuthState = useCallback(async () => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    const storedRefreshToken = localStorage.getItem("refreshToken");

    if (storedToken && storedRefreshToken) {
      setToken(storedToken);
      try {
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(mapApiToUser(parsedUser));
        }
        const freshUser = await fetchUser();
        setUser(freshUser);
      } catch (error) {
        await logout();
      }
    }
  }, [fetchUser, logout]);

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

  const getERPData = useCallback(async (): Promise<ERPRecord[]> => {
    try {
      const erpRecords = await fetchWithAuth("/erp", {
        method: "GET",
      });
      return erpRecords;
    } catch (error) {
      throw error;
    }
  }, [fetchWithAuth]);

  const addAsset = useCallback(async (assetData: AssetData): Promise<any> => {
    const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <AddAsset xmlns="http://tempuri.org/ERPService/AssetManagement">
            <asset>
              <Name>${assetData.name}</Name>
              <Category>${assetData.category}</Category>
              <Location>${assetData.location}</Location>
              <PurchaseDate>${assetData.purchase_date}</PurchaseDate>
              <Description>${assetData.description}</Description>
              <Type>${assetData.type ?? ""}</Type>
              <Make>${assetData.make ?? ""}</Make>
              <Model>${assetData.model ?? ""}</Model>
              <Status>${assetData.status ?? ""}</Status>
              <LastMaintenance>${assetData.last_maintenance ?? ""}</LastMaintenance>
              <NextMaintenance>${assetData.next_maintenance ?? ""}</NextMaintenance>
              <WorkOrders>${assetData.work_orders ?? ""}</WorkOrders>
              <Health>${assetData.health ?? ""}</Health>
            </asset>
          </AddAsset>
        </soap:Body>
      </soap:Envelope>`;

    try {
      const response = await fetchWithAuth(`/erp-endpoint`, {
        method: "POST",
        headers: {
          "Content-Type": "text/xml; charset=utf-8",
          SOAPAction: "http://tempuri.org/ERPService/AssetManagement/AddAsset",
        },
        body: soapBody,
      });

      console.log("ERP SOAP Response:", response);

      if (typeof response === "string" && response.includes("<soap:Fault>")) {
        throw new Error("SOAP Fault detected in response.");
      }

      return response;
    } catch (error) {
      console.error("Error adding asset:", error);
      throw error;
    }
  }, []);

  const editAsset = useCallback(
    async (assetData: AssetData): Promise<any> => {
      // Perbaikan: Hapus tag <asset> dan sesuaikan nama elemen sesuai contoh yang berhasil
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
                    xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <EditAsset xmlns="http://tempuri.org/ERPService/AssetManagement">
            <assetId>${assetData.id}</assetId>
            <assetName>${assetData.name}</assetName>
            <assetCategory>${assetData.category}</assetCategory>
            <assetLocation>${assetData.location}</assetLocation>
            <purchaseDate>${assetData.purchase_date}</purchaseDate>
            <description>${assetData.description}</description>
            <assetType>${assetData.type ?? ""}</assetType>
            <assetMake>${assetData.make ?? ""}</assetMake>
            <assetModel>${assetData.model ?? ""}</assetModel>
            <assetStatus>${assetData.status ?? ""}</assetStatus>
            <lastMaintenance>${assetData.last_maintenance ?? ""}</lastMaintenance>
            <nextMaintenance>${assetData.next_maintenance ?? ""}</nextMaintenance>
            <workOrders>${assetData.work_orders ?? ""}</workOrders>
            <health>${assetData.health ?? ""}</health>
          </EditAsset>
        </soap:Body>
      </soap:Envelope>`;

      try {
        const response = await fetchWithAuth(`/erp-endpoint`, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/ERPService/AssetManagement/EditAsset",
          },
          body: soapBody,
        });

        // For XML responses, we might just want to return the raw response
        return response;
      } catch (error) {
        console.error("Error editing asset:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const deleteAsset = useCallback(
    async (assetId: string): Promise<any> => {
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
    <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
      <soap:Body>
        <DeleteAsset xmlns="http://tempuri.org/ERPService/AssetManagement">
          <assetId>${assetId}</assetId>
        </DeleteAsset>
      </soap:Body>
    </soap:Envelope>`;

      try {
        const response = await fetchWithAuth(`/erp-endpoint`, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/ERPService/AssetManagement/DeleteAsset",
          },
          body: soapBody,
        });

        console.log("ERP SOAP Delete Response:", response);

        if (typeof response === "string" && response.includes("<soap:Fault>")) {
          throw new Error("SOAP Fault detected in response.");
        }

        return response;
      } catch (error) {
        console.error("Error deleting asset:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

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
    const loadInitialData = async () => {
      setIsAuthLoading(true);
      try {
        await initializeAuthState();
        if (token) {
          const data = await getAllMasterData();
          setMasterData(data);
        }
      } catch (error) {
        await logout();
      } finally {
        setIsAuthLoading(false);
        setIsMasterDataLoading(false);
      }
    };

    loadInitialData();
  }, [token, initializeAuthState, getAllMasterData, logout]);

  const register = async (name: string, email: string, nik: string, password: string, department?: string, position?: string, roleId?: string, customPermissions?: string[]) => {
    const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nik,
        email,
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
        const loggedInUser = mapApiToUser({
          ...data.user,
          access_token: data.access_token,
          refresh_token: data.refresh_token,
          permissions: data.user.permissions || data.user.allPermissions || [],
        });

        localStorage.setItem("token", data.access_token);
        localStorage.setItem("refreshToken", data.refresh_token);
        localStorage.setItem("user", JSON.stringify(loggedInUser));

        setToken(data.access_token);
        setUser(loggedInUser);

        try {
          const masterData = await getAllMasterData();
          setMasterData(masterData);
        } catch (error) {}

        navigate("/dashboard");
      } catch (error) {
        throw error;
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

  const getMachineHistories = useCallback(
    async (searchQuery: string = ""): Promise<MachineHistoryRecord[]> => {
      try {
        const response = await fetchWithAuth(searchQuery ? `/mhs?search=${encodeURIComponent(searchQuery)}` : "/mhs");
        const masterData = await getAllMasterData();
        const data = response.data || response;
        if (!Array.isArray(data)) {
          throw new Error("Invalid response format");
        }
        return data.map((item) => mapApiToMachineHistoryRecord(item, masterData));
      } catch (error) {
        return [];
      }
    },
    [fetchWithAuth, getAllMasterData]
  );

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
    async (data: WorkOrderFormData): Promise<WorkOrderFormData> => {
      const responseData = await fetchWithAuth("/wos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const getWorkOrders = useCallback(async (): Promise<WorkOrderFormData[]> => {
    const response = await fetchWithAuth("/wos");
    if (response && response.data && Array.isArray(response.data)) {
      return response.data;
    }
    return [];
  }, [fetchWithAuth]);

  const getWorkOrderById = useCallback(
    async (id: string | number): Promise<WorkOrderFormData> => {
      const responseData = await fetchWithAuth(`/wos/${id}`);
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const updateWorkOrder = useCallback(
    async (id: string | number, data: WorkOrderFormData): Promise<WorkOrderFormData> => {
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

  const approveWorkOrder = useCallback(
    async (id: string | number): Promise<WorkOrderFormData> => {
      // Fetch the current work order to get its existing data
      const currentOrder = await getWorkOrderById(id);
      // Update the status to 'in-progress' (assuming this signifies 'approved')
      const updatedData: WorkOrderFormData = { ...currentOrder, status: "in_progress" };
      const responseData = await updateWorkOrder(id, updatedData);
      return responseData;
    },
    [getWorkOrderById, updateWorkOrder]
  );

  const assignWorkOrder = useCallback(
    async (id: string | number, assignedToUserId: string): Promise<WorkOrderFormData> => {
      const currentOrder = await getWorkOrderById(id);
      // Explicitly cast status to the literal type
      const updatedData: WorkOrderFormData = { ...currentOrder, assignedTo: assignedToUserId, status: "in_progress" }; // Automatically set to in-progress when assigned
      const responseData = await updateWorkOrder(id, updatedData);
      return responseData;
    },
    [getWorkOrderById, updateWorkOrder]
  );

  const cancelWorkOrder = useCallback(
    async (id: string | number): Promise<WorkOrderFormData> => {
      const currentOrder = await getWorkOrderById(id);
      const updatedData: WorkOrderFormData = { ...currentOrder, status: "cancelled" };
      const responseData = await updateWorkOrder(id, updatedData);
      return responseData;
    },
    [getWorkOrderById, updateWorkOrder]
  );

  const getWorkOrdersForUser = useCallback(
    async (userId: string): Promise<WorkOrderFormData[]> => {
      const allOrders = await getWorkOrders(); // Fetch all orders using the existing function
      // Filter client-side: only orders created by or assigned to the user, and that are approved (in-progress or completed)
      return allOrders.filter((order) => (order.createdBy === userId || order.assignedTo === userId) && (order.status === "in_progress" || order.status === "completed"));
    },
    [getWorkOrders]
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
          email: currentUser.email,
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
        getERPData,
        addAsset,
        editAsset,
        deleteAsset,
        approveWorkOrder,
        assignWorkOrder,
        cancelWorkOrder,
        getWorkOrdersForUser,
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
