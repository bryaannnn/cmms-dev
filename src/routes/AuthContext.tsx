import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";
import { fetchWithAuth } from "./api";

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

interface RootObject {
  success: boolean;
  message: string;
  data: Datum[];
}

interface Datum {
  id: number;
  name: string;
  nik: string;
  email: string;
  avatar: string;
  department: Department2 | null;
  position: null | string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  department_id: null | number;
}

interface Department2 {
  id: number;
  name: string;
  head_id: number;
  created_at: string;
  updated_at: string;
  head: Head2;
}

interface Head2 {
  id: number;
  name: string;
  nik: string;
  email: string;
  avatar: string;
  department: string;
  position: string;
  email_verified_at: null;
  created_at: string;
  updated_at: string;
  department_id: number;
}

export interface User {
  id: string;
  name: string;
  nip?: string;
  nik: string;
  email: string;
  roleId?: string | null;
  role: {
    id: number;
    name: string;
  };
  customPermissions?: string[];
  permissions?: PermissionName[];
  department: Department | null;
  rolePermissions?: string[];
  access_token?: string;
  refresh_token?: string;
  isSuperadmin?: boolean;
  department_id: number | null;
  department_name: string | null;
  avatar_url?: string;
  position?: string | null;
  avatar?: string;
  email_verified_at?: string | null;
  created_at?: string;
  roles: string[]; // dari backend: ["superadmin"]

  updated_at?: string;
  genbaSoRole?: {
    genba_so_id: string;
    genba_so_name: string;
    role_id: string;
    role_name: string;
  };
}

export interface Mesin {
  id: string;
  name: string;
  interval: string;
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
  is_production: string;
  description: string;
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
  mesin: {
    success: boolean;
    message: string;
    data: Mesin[];
  };
  shifts: {
    success: boolean;
    message: string;
    data: Shift[];
  };
  groups: {
    success: boolean;
    message: string;
    data: Group[];
  };
  stoptimes: {
    success: boolean;
    message: string;
    data: StopTime[];
  };
  units: {
    success: boolean;
    message: string;
    data: Unit[];
  };
  itemtroubles: {
    success: boolean;
    message: string;
    data: ItemTrouble[];
  };
  jenisaktivitas: {
    success: boolean;
    message: string;
    data: JenisAktivitas[];
  };
  kegiatans: {
    success: boolean;
    message: string;
    data: Kegiatan[];
  };
  unitspareparts: {
    success: boolean;
    message: string;
    data: UnitSparePart[];
  };
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

// tanda ini wo baru

export interface SimpleUser {
  id: number;
  name: string;
  email?: string;
}

export interface Head {
  id: number;
  name: string;
  email: string;
  avatar: string;
  department: string;
  position: string;
  department_id: number;
}

// Di dalam komponen atau file terpisah
export interface Department {
  id: number;
  name: string;
  head_id: number | null;
  created_at?: string;
  updated_at?: string;
  head?: {
    // Opsional, jika ingin menambahkan data kepala department
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface UserWithDepartment extends SimpleUser {
  email?: string;
  department?: Department;
  department_id: number;
  department_name: string;
}

export interface ServiceCatalogue {
  id: number;
  service_name: string;
  service_description: string;
  service_group: {
    id: number;
    group_name: string;
    group_description: string;
    created_at: string | null;
    updated_at: string | null;
  };
  priority: string;
  service_owner: number;
  sla: string;
  impact: string;
  pic?: any;
  created_at: string;
  updated_at: string;
  owner?: {
    id: number;
    name: string;
    nik: string;
    email: string;
    avatar: string;
    position: string | null;
    email_verified_at: string | null;
    created_at: string;
    updated_at: string;
    department_id: number;
  };
  pic_user?: any;
}

export interface Service4 {
  id: number;
  service_name: string;
  service_description: string;
  service_type: number;
  priority: string;
  service_owner: number;
  sla: string;
  impact: string;
  pic: number;
  owner: {
    id: number;
    name: string;
    nik: string;
    email: string;
    avatar: string;
    department: string;
    position: string | null;
    department_id: number | null;
  };
}

export interface ServiceType3 {
  id: number;
  name: string;
}

type ServiceType2 = "Lain-lain" | "Manufacturing Support" | "Network" | "OSS" | "Project" | "QAD" | "Server" | "Software";
type Service2 = "Server" | "Software" | "Widapro" | "Audit OFF";

export interface StatusHistory {
  id: number;
  recordable_type: string;
  recordable_id: number;
  user_id: number;
  action: string;
  batch: number | null;
  old_data: any;
  new_data: any;
  changed_at: string;
  // Opsional properties
  comments?: string;
  changed_by?: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface WorkOrderData {
  id: number;
  work_order_no: string;
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number;
  department_id: number;
  service_catalogue_id: number;
  service_type_id: number;
  service_group_id: number;
  service_id: number;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null;
  received_by_id: number;
  assigned_to_id: number | null;
  handling_date: string | null;
  action_taken: string | null;
  handling_status: string;
  remarks: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;

  requester: UserWithDepartment;
  known_by: SimpleUser;
  department: Department;
  department_name: string;
  service_type: ServiceGroup;
  service: Service4;
  received_by: SimpleUser;
  assigned_to: SimpleUser | null;
  vendor_id?: number;
  vendor: Vendor | null;
  status_history: StatusHistory[];
}

export interface WorkOrderFormData {
  id?: number;
  work_order_no?: string;
  date: string;
  reception_method: string;
  assigned_to_id?: number | null;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_group_id: number; // ✅ ini yang dikirim
  service_id: number; // ✅ ini yang dikirim
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null;
  received_by_id: number | null;
  handling_date: string | null;
  action_taken: string | null;
  handling_status: string;
  remarks: string | null;
  // relasi opsional
  requester?: UserWithDepartment;
  attachment_filename?: string;
  known_by?: SimpleUser | null;
  department?: Department;
  service_type?: SimpleUser | null;
  service?: Service4 | null;
  received_by?: SimpleUser | null;
  assigned_to?: SimpleUser | null;
  service_catalogue_id?: number;
}

export interface WorkOrderFormDataLocal {
  id?: number;
  date: string;
  reception_method: string;
  requester_id: number;
  known_by_id: number | null;
  department_id: number;
  service_group_id: number | null;
  service_catalogue_id: number | null;
  asset_no: string;
  device_info: string;
  complaint: string;
  attachment: string | null; // ✅ Hapus undefined, hanya string | null
  received_by_id?: number | null;
  handling_date?: string | null;
  action_taken?: string | null;
  handling_status?: string;
  remarks?: string | null;
  assigned_to_id?: number | null;
  vendor_id?: number | null;
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

// export interface WorkOrderFormData {
//   id: string | number;
//   date: string;
//   applicant: "open" | "in_progress" | "completed" | "on_hold" | "cancelled";
//   diketahuioleh: string;
//   department: string;
//   tipeLayanan: string;
//   layanan: "Server" | "Software" | "Widapro" | "Audit OFF" ;
//   noAsset: string;
//   informasiPerangkat: string;
//   keluhan: string;
//   lampiran: string;
//   diterimaOleh: string;
//   attachments: File[];
// }

// type HandlingStatus = "New" | "Assignment" | "Progress" | "Waiting Part" | "Vendor Escalation" | "Waiting Appproval" | "Cancel" | "Done";
// type ReceptionMethod = "Electronic Work Order System" | "Direct Information" | "Phone" | "Whatsapp" | "Email";
type ServiceType = "Lain-lain" | "Manufacturing Support" | "Network" | "OSS" | "Project" | "QAD" | "Server" | "Software";
// type Service = "Server" | "Software" | "Widapro" | "Audit OFF";

// export interface contoh {
//   // for table request
//   id: number;
//   date: string;
//   workorder_acceptance: "Electronic Work Order System" | "Direct Information" | "Phone" | "Whatsapp" | "Email"; // Default Field Electronic Work Order System
//   applicant: string; // (*Diperoleh dari Login User, jika Electronic Work Order System by default id user login, jika Selain Work Order system applicant dapat ditentukan sesuai kemauan user)
//   known_by: string; // (Default as Dept.Head)
//   department: string; // Default as Department Applicant
//   service_type: "Lain-lain" | "Manufacturing Support" | "Network" | "OSS" | "Project" | "QAD" | "Server" | "Software";
//   service: "Server" | "Software" | "Widapro" | "Audit OFF";
//   no_asset: number;
//   device_information: string; // tetap input text biasa tetapi bisa muncul device information format (Pxxxxxxx) sebelumnya apa saja contoh ( jika saya mengetik P1 saja) maka nanti muncul rekomendasi P1 untuk
//   complaint: string; //
//   received_by: string; //
//   attachments: File[];
//   // for table receiver
//   assigned_to: string;
//   assigned_to_avatar: string;
//   handling_date: string;
//   handling_status: "New" | "Assignment" | "Progress" | "Waiting Part" | "Vendor Escalation" | "Waiting Appproval" | "Cancel" | "Done";
//   actions_taken: string;
//   information: string;
// }

// export interface Requester {
//   id: number;
//   name: string;
//   email: string;
//   department: string;

// }

// export interface KnownBy {
//   id: number;
//   name: string;
// }

// export interface Department{
//   id: number;
//   name: string;
// }

// export interface ServiceType {
//   id: number
//   name: string;
// }

// export interface Service {
//   id: number;
//   name: string;
// }

// export interface ReceivedBy{
//   id: number;
//   name: string;
// }

// export interface WorkOrderFormData {
//   // for table request
//   id: number;
//   work_order_no: string;
//   date: string;
//   reception_method: string; // Default Field Electronic Work Order System
//   requester_id: number; // (*Diperoleh dari Login User, jika Electronic Work Order System by default id user login, jika Selain Work Order system applicant dapat ditentukan sesuai kemauan user)
//   known_by_id: number; // (Default as Dept.Head)
//   department_id: number; // Default as Department Applicant
//   service_type_id: number;
//   service_id: number;
//   asset_no: number;
//   device_info: string; // tetap input text biasa tetapi bisa muncul device information format (Pxxxxxxx) sebelumnya apa saja contoh ( jika saya mengetik P1 saja) maka nanti muncul rekomendasi P1 untuk
//   complaint: string; //
//   received_by_id: string; //
//   attachments: File[];
//   // for table receiver
//   assigned_to: string;
//   assigned_to_avatar: string;
//   handling_date: string;
//   handling_status: "New" | "Assignment" | "Progress" | "Waiting Part" | "Vendor Escalation" | "Waiting Appproval" | "Cancel" | "Done";
//   actions_taken: string;
//   information: string;
//   requester: Requester;
//   known_by: string[];
//   department: string;
//   service_type: string[];
// }

export interface ServiceCatalogue1 {
  id: string | number;
  service_description: string;
  service_type: string;
  priority: "low" | "medium" | "high" | "critical";
  service_owner: number;
  sla: number;
  impact: string;
  pic: string[];
}

export interface ServiceGroup {
  id: string | number;
  group_name: string;
  group_description: string | null;
  name?: string;
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
  id: number;
  name: string;
  category: string;
  location: string;
  purchase_date: string;
  description: string;
  type: string | null;
  make: string | null;
  model: string | null;
  status: string | null;
  last_maintenance: string | null;
  next_maintenance: string | null;
  work_orders: string | null;
  health: string | null;
  created_at: string;
  update_at: string;
}

export interface AuditLog {
  id: number;
  recordable_type: string;
  recordable_id: number;
  recordable_details: any | null;
  action: string;
  batch: number | null;
  changed_at: string;
  changed_by: string;
  old_data_snapshot: Record<string, any> | null;
  new_data_snapshot: Record<string, any> | null;
  // Field tambahan untuk kompatibilitas
  history_id?: number;
  mhs_id?: number;
  mhs_details?: any | null;
}

//monitoring maintenance section

type TypeInterval = "weekly" | "monthly" | "3 months" | "6 months" | "1 year";

export interface MonitoringActivity {
  id_monitoring_activity?: number;
  id_monitoring_schedule: number;
  id_item_mesin: number;
  tgl_monitoring: string;
  hasil_monitoring: string;
  hasil_ms_tms: string;
  hasil_keterangan: string;
  created_at?: string;
  updated_at?: string;
}

export interface MonitoringInterval {
  id: number;
  type_interval: string;
}

export interface MachineData {
  id: number;
  unit: number;
  machine: string;
}

export interface MachineItem {
  id: number;
  id_machine_data: number;
  machine_item: string;
  unit: string;
}

export interface MonitoringSchedule {
  id_monitoring_schedule: number;
  tahun: string;
  bulan: string;
  tgl_start: string;
  tgl_end: string;
  unit: string;
  id_mesins: number;
  id_interval: number;
  status: string;
  approval_template_id: number;
  created_at: string;
  updated_at: string;
  data_mesin: {
    id: number;
    name: string;
    unit_id: string;
    created_at?: string | null;
    updated_at?: string | null;
    deleted_at?: string | null;
  };
  monitoring_interval: {
    id_interval: number;
    type_interval: string;
    created_at: string;
    updated_at: string;
  };
  monitoring_activities: MonitoringActivity[];
  item_mesins: ItemMesin[];
  schedule_approvals: ScheduleApproval[];
  approval_template: ApprovalTemplate;
}

// Tambahkan di bagian interface yang sesuai
export interface MonitoringScheduleRequest {
  tahun: number;
  bulan: string;
  tgl_start: string;
  tgl_end: string;
  unit: string;
  id_mesins: number;
  id_interval: number;
  item_mesin_ids: number[];
}

export interface MonitoringScheduleResponse {
  id_monitoring_schedule: number;
  tahun: string;
  bulan: string;
  tgl_start: string;
  tgl_end: string;
  unit: string;
  id_mesins: number;
  id_interval: number;
  created_at: string;
  updated_at: string;
  data_mesin?: any;
  monitoring_interval?: {
    id_interval: number;
    type_interval: string;
    created_at: string;
    updated_at: string;
  };
}

// Interface untuk POST /monitoring-activities
export interface MonitoringActivityPost {
  id_monitoring_schedule: number;
  id_item_mesin: number;
  tgl_monitoring: string;
  hasil_monitoring: string;
  hasil_keterangan: string;
  hasil_ms_tms: string;
}

export interface MonitoringActivityUpdate {
  id_monitoring_activities: number;
  id_monitoring_schedule: number;
  id_item_mesin: number;
  tgl_monitoring: string;
  hasil_monitoring: string;
  hasil_keterangan: string;
  hasil_ms_tms: string;
}

export interface MonitoringActivityUpdateRequest {
  id: number;
  data: MonitoringActivityPost;
}

export interface MonitoringActivityResponse {
  id_monitoring_activity?: number;
  id_monitoring_schedule: number;
  id_item_mesin: number;
  tgl_monitoring: string;
  hasil_monitoring: string;
  hasil_keterangan: string;
  created_at?: string;
  updated_at?: string;
}

export interface StopTimes {
  id: number;
  name: string;
  description: string | null;
}

export interface ActivityType {
  id: number;
  name: string;
}

export interface Activity {
  id: number;
  name: string;
  description: string;
}

export interface TroubleItem {
  id: number;
  name: string;
  description: string;
}

export interface WorkUnit {
  id: number;
  name: string;
  is_production: string;
  description: string;
}

export interface WorkGroup {
  id: number;
  name: string;
  description: string;
}

export interface WorkShift {
  id: number;
  name: string;
  description: string;
}

// Tambahkan interface ini di bagian Monitoring Maintenance section
export interface MonitoringActivityDetail {
  id_monitoring_activity: number;
  id_monitoring_schedule: number;
  id_item_mesin: number;
  tgl_monitoring: string;
  hasil_monitoring: string;
  hasil_ms_tms: string;
  hasil_keterangan: string;
  created_at: string;
  updated_at: string;
}

export interface MonitoringScheduleDetail {
  id_monitoring_schedule: number;
  tahun: string;
  bulan: string;
  tgl_start: string;
  tgl_end: string;
  unit: string;
  id_mesins: number;
  id_interval: number;
  created_at: string;
  updated_at: string;
  data_mesin: any | null;
  monitoring_interval: {
    id_interval: number;
    type_interval: string;
    created_at: string;
    updated_at: string;
  };
  monitoring_activities: MonitoringActivityDetail[];
}

export interface MonitoringScheduleByIdResponse {
  success?: boolean;
  message?: string;
  data?: MonitoringScheduleDetail;
}

export interface Units {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  mesin: Machine[];
}

// Tambahkan di AuthContext.tsx
export interface MesinDetailResponse {
  success: boolean;
  message: string;
  data: MesinDetail;
}

export interface Machine {
  id: number;
  name: string;
  unit_id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  item_mesin?: ItemMesin[];
}

// Pastikan interface UnitWithMachines sesuai
export interface UnitWithMachines {
  id: number;
  name: string;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  mesin: MesinDetail[];
}

export interface MesinDetail {
  id: number;
  name: string;
  unit_id: number;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
  item_mesin: ItemMesin[];
}

export interface MonitoringInterval {
  id_interval: number;
  type_interval: string;
  created_at: string;
  updated_at: string;
}

export interface ItemMesin {
  id: number;
  mesin_id: number;
  item_mesin: string;
  satuan: string;
  standard_min: string | null;
  standard_max: string | null;
  standard_visual: string;
  created_at: string;
  updated_at: string;
  interval_id: number;
  pivot?: {
    monitoring_schedule_id: number;
    item_mesin_id: number;
  };
}

export interface AllMasterMonitoring {
  unit: Units[];
  mesin: Machine[];
  // Pastikan properti ini ada dan sesuai
  unitsWithMachines?: UnitWithMachines[];
  mesinDetails?: MesinDetail[];
  intervals?: MonitoringInterval[]; // Tambahkan ini
}

export interface Vendor {
  id: number;
  name: string;
  address: string;
  contact_person: string;
  email: string;
  telp: string;
  HP: string;
  created_at?: string | null;
  updated_at?: string | null;
}

// Tambahkan di bagian interface yang sesuai (setelah interface Vendor)
export interface ApprovalTemplate {
  id: number;
  name: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  approvers?: Approver[];
}

export interface Approver {
  id: number;
  template_id: number;
  approver_user_id: number;
  step: number;
  created_at?: string;
  updated_at?: string;
  user?: User;
  approver: {
    id: number;
    name: string;
    nik: string;
    email: string;
    avatar: string;
    department: string;
    position: string;
    email_verified_at: string | null;
    created_at?: string;
    updated_at?: string;
    department_id: number;
  };
}

export interface ApprovalResponse {
  success: boolean;
  message: string;
  data?: any;
}

export interface ScheduleApproval {
  id: number;
  schedule_id: number;
  approver_id: number;
  approval_step: number;
  status: "pending" | "approved" | "rejected" | "feedback_given";
  comments: string | null;
  approved_at: string;
  created_at: string;
  updated_at: string;
  approver?: {
    id: number;
    name: string;
    position: string;
    department: string;
  };
}

export interface WorkArea {
  id: number;
  work_area: string;
}

// Genba Auth
// Tambahkan interface berikut di bagian interface yang sesuai

export interface CreateGenbaActivityPayload {
  date: string;
  genba_work_area_id: number;
  keterangan: string;
  attachments?: File[];
}

export interface GenbaActivityResponse {
  success: boolean;
  data: GenbaActivity;
}

export interface GenbaActivity {
  id: number;
  reporter_user_id: number;
  genba_role_id: number;
  date: string;
  genba_work_area_id: number;
  pic_area_user_id: number;
  keterangan: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
  reporter: {
    id: number;
    name: string;
    nik: string;
    email: string;
    avatar: string;
    position: string;
    email_verified_at: string | null;
    created_at: string | null;
    updated_at: string | null;
    department_id: number | null;
    department: {
      id: number;
      name: string;
      head_id: number;
      created_at: string | null;
      updated_at: string | null;
    };
  };
  work_area: {
    id: number;
    name: string;
    department_id: number;
    pic_user_id: number;
    attachments: LayoutInterface[] | null;
    qrcode_path: string | null;
    qr_code_base64: string;
    is_default: boolean;
    created_at: string | null;
    updated_at: string | null;
    department: {
      id: number;
      name: string;
      head_id: number;
      created_at: string | null;
      updated_at: string | null;
    };
    pic: {
      id: number;
      name: string;
      nik: string;
      email: string;
      avatar: string;
      position: string;
      email_verified_at: string | null;
      created_at: string | null;
      updated_at: string | null;
      department_id: number;
    };
  };
  committee_role: {
    id: number;
    name: string;
    description: string | null;
    created_at: string | null;
    updated_at: string | null;
    current_committee_users: {
      id: number;
      genba_so_id: number;
      genba_role_id: number;
      user_id: number;
      created_at: string | null;
      updated_at: string | null;
      user: {
        id: number;
        name: string;
        nik: string;
        email: string;
        avatar: string;
        position: string | null;
        email_verified_at: string | null;
        created_at: string | null;
        updated_at: string | null;
        department_id: number;
      };
    } | null;
  };
  attachment: {
    id: number;
    genba_activity_id: number;
    file_path: string;
    file_name: string;
    notes: string | null;
  }[];
}

export interface GenbaWorkAreas {
  id: number;
  name: string;
  department_id: number;
  pic_user_id: number;
  created_at: string | null;
  attachment: LayoutInterface[] | null;
  qrcode_path: string | null;
  is_default: boolean;
  qr_code_base64: string;
  updated_at: string | null;
  department: {
    id: number;
    name: string;
    head_id: number;
    created_at: string | null;
    updated_at: string | null;
  };
  pic: {
    id: number;
    name: string;
    email: string;
    nik: string;
  };
}

export interface LayoutInterface {
  path: string;
  filename: string;
}

export interface WorkAreas {
  name: string;
  attachment: File | null;
  is_default: boolean;
}

export interface CreateGenbaAreasPayload {
  work_areas: WorkAreas[];
  department_id: number;
  pic_user_id: number;
  attachment: LayoutInterface | null;
}

export interface UpdateGenbaAreasPayload {
  name: string;
  department_id: number;
  pic_user_id: number;
  is_default: boolean;
  attachment?: LayoutInterface | File | null;
}

export interface GenbaSO {
  id: number;
  name: string;
  effective_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  bridges: GenbaSOBridge[];
}

export interface GenbaRole {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface GenbaSOBridge {
  id: number;
  genba_so_id: number;
  genba_role_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
  role: GenbaRole;
  user: User;
}

export interface CreateGenbaSOPayload {
  name: string;
  effective_date: string;
  is_active?: boolean;
  bridges: {
    genba_role_id: number;
    user_ids: number[];
  }[];
}

export interface UpdateGenbaSOPayload {
  name?: string;
  effective_date?: string;
  is_active?: boolean;
  bridges?: {
    genba_role_id: number;
    user_ids: number[];
  }[];
}

// monitoring maintenance stop

interface EditingUser extends User {
  department: Department;
}

function mapApiToMachineHistoryRecord(apiData: any, masterData: AllMasterData | null): MachineHistoryRecord {
  const stopTimeName = apiData.stoptime?.name || masterData?.stoptimes?.data.find((st) => String(st.id) === String(apiData.stoptime_id))?.name || "-";
  const itemTroubleName = apiData.itemtrouble?.name || masterData?.itemtroubles?.data.find((it) => String(it.id) === String(apiData.itemtrouble_id))?.name || "-";
  const jenisAktivitasName = apiData.jenisaktifitas?.name || masterData?.jenisaktivitas?.data.find((ja) => String(ja.id) === String(apiData.jenisaktifitas_id))?.name || "-";
  const kegiatanName = apiData.kegiatan?.name || masterData?.kegiatans?.data.find((keg) => String(keg.id) === String(apiData.kegiatan_id))?.name || "-";
  const unitSparePartName = apiData.unitsp?.name || masterData?.unitspareparts?.data.find((usp) => String(usp.id) === String(apiData.unitsp_id))?.name || "-";

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
  register: (name: string, email: string, nik: string, password: string, department_id?: string, roleId?: string, customPermissions?: string[]) => Promise<any>;
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
  getWorkOrdersIT: () => Promise<WorkOrderData[]>;
  addWorkOrderIT: (data: WorkOrderFormDataLocal, file?: File | null) => Promise<any>;
  updateWorkOrderIT: (data: WorkOrderFormDataLocal, file?: File | null) => Promise<any>;
  deleteWorkOrder: (id: number) => Promise<any>;
  getWorkOrdersForUser: (userId: string) => Promise<WorkOrderData[]>;
  getWorkOrderById: (id: string | number) => Promise<WorkOrderData>;
  departments: Department[];
  services: ServiceCatalogue[];
  serviceGroups: ServiceGroup[];
  changePassword: (oldPassword: string, newPassword: string) => Promise<void>;
  fetchUser: () => Promise<User>;
  fetchedUsers: () => Promise<User[]>;
  getUsers: () => Promise<User[]>;
  hasPermission: (permission: string | PermissionName) => boolean;
  setEditingUser: (user: EditingUser | null) => void;
  getRoles: () => Promise<Role[]>;
  createRole: (role: Omit<Role, "id">) => Promise<Role>;
  updateRole: (id: string, role: Partial<Role>) => Promise<Role>;
  deleteRole: (id: string) => Promise<void>;
  updateUserPermissions: (id: string, data: { roleId?: string | null; customPermissions?: string[] }) => Promise<User>;
  deleteUser: (id: string) => Promise<void>;
  isAuthLoading: boolean;

  getAssetsData: () => Promise<ERPRecord[]>;
  addAsset: (assetData: AssetData) => Promise<any>;
  editAsset: (assetData: AssetData) => Promise<any>;
  deleteAsset: (assetId: string) => Promise<any>;

  getAuditTrail: () => Promise<AuditLog[]>;
  // getService: (id: number) => Promise<Service>;S
  getServices: (id: number) => Promise<ServiceCatalogue[]>;
  getServicesByOwner: (service_owner: number) => Promise<ServiceCatalogue[]>;
  addServiceCatalogue: (data: { service_name: string; service_description: string; service_group: number; priority: string; service_owner: number; sla: number; impact: string }) => Promise<ServiceCatalogue>;
  updateServiceCatalogue: (id: string | number, data: { service_name: string; service_description: string; service_group: number; priority: string; service_owner: number; sla: number; impact: string }) => Promise<ServiceCatalogue>;
  deleteServiceCatalogue: (id: string | number) => Promise<void>;
  getServiceGroups: (id: number) => Promise<ServiceGroup[]>;
  getServiceGroup: (id: string | number) => Promise<ServiceGroup>;
  addServiceGroup: (data: { group_name: string; group_description?: string | null }) => Promise<ServiceGroup>;
  updateServiceGroup: (id: string | number, data: { group_name: string; group_description?: string | null }) => Promise<ServiceGroup>;
  deleteServiceGroup: (id: string | number) => Promise<void>;
  getDepartment: () => Promise<Department[]>;
  getDepartmentById: (id: string | number) => Promise<Department>;
  addDepartment: (data: { name: string; head_id: number }) => Promise<Department>;
  updateDepartment: (id: string | number, data: { name: string; head_id: number }) => Promise<Department>;
  deleteDepartment: (id: string | number) => Promise<void>;
  getMonitoringSchedules: () => Promise<MonitoringSchedule[]>;
  getMonitoringScheduleById: (id: string | number) => Promise<MonitoringSchedule>;
  addMonitoringSchedule: (data: MonitoringScheduleRequest) => Promise<MonitoringScheduleResponse>;
  addMonitoringActivities: (activities: MonitoringActivityPost[]) => Promise<MonitoringActivityResponse[]>;
  updateMonitoringActivity: (activities: MonitoringActivityUpdateRequest[]) => Promise<MonitoringActivityResponse[]>;
  getStopTimes: () => Promise<StopTimes[]>;
  getStopTimesById: (id: string | number) => Promise<StopTimes>;
  addStopTimes: (data: { name: string; description: string }) => Promise<StopTimes>;
  updateStopTimes: (id: string | number, data: { name: string; description: string }) => Promise<StopTimes>;
  deleteStopTimes: (id: string | number) => Promise<void>;
  getActivityTypes: () => Promise<ActivityType[]>;
  getActivityTypesById: (id: string | number) => Promise<ActivityType>;
  addActivityTypes: (data: { name: string }) => Promise<ActivityType>;
  updateActivityTypes: (id: string | number, data: { name: string }) => Promise<ActivityType>;
  deleteActivityTypes: (id: string | number) => Promise<void>;
  getActivity: () => Promise<Activity[]>;
  getActivityById: (id: string | number) => Promise<Activity>;
  addActivity: (data: { name: string; description: string }) => Promise<Activity>;
  updateActivity: (id: string | number, data: { name: string; description: string }) => Promise<Activity>;
  deleteActivity: (id: string | number) => Promise<void>;
  getTroubleItem: () => Promise<TroubleItem[]>;
  getTroubleItemById: (id: string | number) => Promise<TroubleItem>;
  addTroubleItem: (data: { name: string; description: string }) => Promise<TroubleItem>;
  updateTroubleItem: (id: string | number, data: { name: string; description: string }) => Promise<TroubleItem>;
  deleteTroubleItem: (id: string | number) => Promise<void>;
  getWorkUnit: () => Promise<WorkUnit[]>;
  getWorkUnitById: (id: string | number) => Promise<WorkUnit>;
  addWorkUnit: (data: { name: string; is_production: string; description: string }) => Promise<WorkUnit>;
  updateWorkUnit: (id: string | number, data: { name: string; is_production: string; description: string }) => Promise<WorkUnit>;
  deleteWorkUnit: (id: string | number) => Promise<void>;
  getWorkGroup: () => Promise<WorkGroup[]>;
  getWorkGroupById: (id: string | number) => Promise<WorkGroup>;
  addWorkGroup: (data: { name: string; description: string }) => Promise<WorkGroup>;
  updateWorkGroup: (id: string | number, data: { name: string; description: string }) => Promise<WorkGroup>;
  deleteWorkGroup: (id: string | number) => Promise<void>;
  getWorkShift: () => Promise<WorkShift[]>;
  getWorkShiftById: (id: string | number) => Promise<WorkShift>;
  addWorkShift: (data: { name: string; description: string }) => Promise<WorkShift>;
  updateWorkShift: (id: string | number, data: { name: string; description: string }) => Promise<WorkShift>;
  deleteWorkShift: (id: string | number) => Promise<void>;
  getAllMasterMonitoring: () => Promise<AllMasterMonitoring>;
  getUnit: (id: string | number) => Promise<UnitWithMachines>;
  getMesin: (id: string | number) => Promise<MesinDetail>;
  getUnitsWithMachines: () => Promise<UnitWithMachines[]>;
  getMesinDetail: (id: string | number) => Promise<MesinDetail>;
  getVendor: () => Promise<Vendor[]>;
  getVendorById: (id: string | number) => Promise<Vendor>;
  addVendor: (data: { name: string; address: string; contact_person: string; email: string; telp: string; HP: string }) => Promise<Vendor>;
  updateVendor: (id: string | number, data: { name: string; address: string; contact_person: string; email: string; telp: string; HP: string }) => Promise<Vendor>;
  deleteVendor: (id: string | number) => Promise<void>;
  // Approval Template Functions
  getApprovalTemplates: () => Promise<ApprovalTemplate[]>;
  getApprovalTemplateById: (id: string | number) => Promise<ApprovalTemplate>;
  createApprovalTemplate: (data: { name: string; is_active?: boolean }) => Promise<ApprovalTemplate>;
  updateApprovalTemplate: (id: string | number, data: { name?: string; is_active?: boolean }) => Promise<ApprovalTemplate>;
  deleteApprovalTemplate: (id: string | number) => Promise<void>;

  // Approver Management Functions
  addApproverToTemplate: (templateId: string | number, data: { approver_user_id: number; step: number }) => Promise<Approver>;
  updateApprover: (templateId: string | number, approverId: string | number, data: { approver_user_id?: number; step?: number }) => Promise<Approver>;
  deleteApprover: (templateId: string | number, approverId: string | number) => Promise<void>;
  getTemplateApprovers: (templateId: string | number) => Promise<Approver[]>;

  // Template Activation
  setApprovalTemplateActive: (templateId: string | number) => Promise<ApprovalTemplate>;

  // Schedule Approval
  approveSchedule: (scheduleId: string | number, comments: string) => Promise<ApprovalResponse>;

  getWorkArea: () => Promise<WorkArea[]>;
  getWorkAreaById: (id: string | number) => Promise<WorkArea>;
  addWorkArea: (data: { work_area: string }) => Promise<WorkArea>;
  updateWorkArea: (id: string | number, data: { work_area: string }) => Promise<WorkArea>;
  deleteWorkArea: (id: string | number) => Promise<void>;

  // Di dalam AuthContextType interface, tambahkan fungsi-fungsi berikut:
  getGenbaRoles: () => Promise<GenbaRole[]>;
  getGenbaSOs: () => Promise<GenbaSO[]>;
  getGenbaSOById: (id: string | number) => Promise<GenbaSO>;
  getGenbaAreas: () => Promise<GenbaWorkAreas[]>;
  createGenbaSO: (data: CreateGenbaSOPayload) => Promise<GenbaSO>;
  createGenbaAreas: (data: CreateGenbaAreasPayload, attachment?: File[]) => Promise<any>;
  updateGenbaSO: (id: string | number, data: UpdateGenbaSOPayload) => Promise<GenbaSO>;
  updateGenbaAreas: (id: string | number, data: UpdateGenbaAreasPayload, files: File | null) => Promise<GenbaWorkAreas>;
  deleteGenbaSO: (id: string | number) => Promise<void>;
  deleteGenbaAreas: (id: string | number) => Promise<void>;
  setGenbaSOActive: (id: string | number) => Promise<GenbaSO>;
  getGenbaActivities: () => Promise<GenbaActivity[]>;
  getGenbaActivityById: (id: string | number) => Promise<GenbaActivity>;
  createGenbaActivity: (data: CreateGenbaActivityPayload, files?: File[]) => Promise<GenbaActivityResponse>;
  updateGenbaActivity: (id: string | number, data: Partial<CreateGenbaActivityPayload>, files?: File[]) => Promise<GenbaActivityResponse>;
  deleteGenbaActivity: (id: string | number) => Promise<void>;
}

const projectEnvVariables = getProjectEnvVariables();
const AuthContext = createContext<AuthContextType | null>(null);

const mapApiToUser = (apiUser: any): User => {
  const department = apiUser.department
    ? {
        id: apiUser.department.id,
        name: apiUser.department.name,
        head_id: apiUser.department.head_id,
        head: apiUser.department.head
          ? {
              id: apiUser.department.head.id,
              name: apiUser.department.head.name,
              email: apiUser.department.head.email,
            }
          : null,
      }
    : null;

  return {
    id: String(apiUser.id),
    name: apiUser.name,
    nik: apiUser.nik,
    email: apiUser.email,
    roleId: apiUser.role_id ? String(apiUser.role_id) : null, // Perhatikan field name
    role: apiUser.role,
    roles: apiUser.roles || [],
    isSuperadmin: Array.isArray(apiUser.roles) ? apiUser.roles.includes("superadmin") : false,
    customPermissions: apiUser.customPermissions || [],
    permissions: apiUser.permissions || apiUser.allPermissions || [],
    department: department,
    department_id: apiUser.department_id || apiUser.department?.id || null,
    department_name: apiUser.department?.name || null,
    genbaSoRole: apiUser.genbaSoRole
      ? {
          genba_so_id: apiUser.genbaSoRole.genba_so_id,
          genba_so_name: apiUser.genbaSoRole.genba_so_name,
          role_id: apiUser.genbaSoRole.role_id,
          role_name: apiUser.genbaSoRole.role_name,
        }
      : undefined,
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
        if (!(options.body instanceof FormData)) {
          // Hanya set Content-Type untuk non-FormData
          if (headers.get("Content-Type")?.includes("application/json") || !headers.has("Content-Type")) {
            headers.set("Content-Type", "application/json");
          }
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
    const userData = await fetchWithAuth("/user/profile?includes_trashed=true");
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
      fetchWithAuth("/mesin?includes_trashed=true"),
      fetchWithAuth("/group?includes_trashed=true"),
      fetchWithAuth("/shift?includes_trashed=true"),
      fetchWithAuth("/unit?includes_trashed=true"),
      fetchWithAuth("/unitsp?includes_trashed=true"),
      fetchWithAuth("/itemtrouble?includes_trashed=true"),
      fetchWithAuth("/jenisaktifitas?includes_trashed=true"),
      fetchWithAuth("/kegiatan?includes_trashed=true"),
      fetchWithAuth("/stoptime?includes_trashed=true"),
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

  const getAssetsData = useCallback(async (): Promise<ERPRecord[]> => {
    try {
      const erpRecords = await fetchWithAuth("/erp?includes_trashed=true", {
        method: "GET",
      });
      return erpRecords;
    } catch (error) {
      throw error;
    }
  }, [fetchWithAuth]);

  // Tambahkan fungsi-fungsi berikut di dalam AuthProvider:

  const addAsset = useCallback(
    async (assetData: AssetData): Promise<any> => {
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
                    xmlns:tem="http://tempuri.org/" 
                    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
                    xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <soap:Body>
              <AddAsset xmlns="http://tempuri.org/">
                  <asset>
                      <Name>${assetData.name}</Name>
                      <Category>${assetData.category}</Category>
                      <Location>${assetData.location}</Location>
                      <PurchaseDate>${assetData.purchase_date}</PurchaseDate>
                      <Description>${assetData.description}</Description>
                      <Type>${assetData.type || ""}</Type>
                      <Make>${assetData.make || ""}</Make>
                      <Model>${assetData.model || ""}</Model>
                      <Status>${assetData.status || ""}</Status>
                      <LastMaintenance ${!assetData.last_maintenance ? 'xsi:nil="true"' : ""}>${assetData.last_maintenance || ""}</LastMaintenance>
                      <NextMaintenance>${assetData.next_maintenance || ""}</NextMaintenance>
                      <WorkOrders>${assetData.work_orders || ""}</WorkOrders>
                      <Health>${assetData.health || ""}</Health>
                  </asset>
              </AddAsset>
          </soap:Body>
      </soap:Envelope>`;

      try {
        const response = await fetchWithAuth(`/erp-endpoint?includes_trashed=true`, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/AddAsset",
          },
          body: soapBody,
        });

        console.log("ERP SOAP Add Asset Response:", response);

        if (typeof response === "string" && response.includes("<soap:Fault>")) {
          throw new Error("SOAP Fault detected in response.");
        }

        return response;
      } catch (error) {
        console.error("Error adding asset:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const editAsset = useCallback(
    async (assetData: AssetData): Promise<any> => {
      const soapBody = `<?xml version="1.0" encoding="utf-8"?>
      <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">
        <soap:Body>
          <EditAsset xmlns="http://tempuri.org/ERPService/AssetManagement">
            <assetId>${assetData.id}</assetId>
            <assetName>${assetData.name}</assetName>
            <assetCategory>${assetData.category}</assetCategory>
            <assetLocation>${assetData.location}</assetLocation>
            <purchaseDate>${assetData.purchase_date}</purchaseDate>
            <description>${assetData.description}</description>
            <assetType>${assetData.type || ""}</assetType>
            <assetMake>${assetData.make || ""}</assetMake>
            <assetModel>${assetData.model || ""}</assetModel>
            <assetStatus>${assetData.status || ""}</assetStatus>
            <lastMaintenance>${assetData.last_maintenance || ""}</lastMaintenance>
            <nextMaintenance>${assetData.next_maintenance || ""}</nextMaintenance>
            <workOrders>${assetData.work_orders || ""}</workOrders>
            <health>${assetData.health || ""}</health>
          </EditAsset>
        </soap:Body>
      </soap:Envelope>`;

      try {
        const response = await fetchWithAuth(`/erp-endpoint?includes_trashed=true`, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/EditAsset",
          },
          body: soapBody,
        });

        console.log("ERP SOAP Edit Asset Response:", response);

        if (typeof response === "string" && response.includes("<soap:Fault>")) {
          throw new Error("SOAP Fault detected in response.");
        }

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
        <soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" 
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
               xmlns:xsd="http://www.w3.org/2001/XMLSchema">
          <soap:Body>
            <DeleteAsset xmlns="http://tempuri.org/ERPService/AssetManagement">
             <assetId>${assetId}</assetId>
            </DeleteAsset>
          </soap:Body>
        </soap:Envelope>`;

      try {
        const response = await fetchWithAuth(`/erp-endpoint?includes_trashed=true`, {
          method: "POST",
          headers: {
            "Content-Type": "text/xml; charset=utf-8",
            SOAPAction: "http://tempuri.org/DeleteAsset",
          },
          body: soapBody,
        });

        console.log("ERP SOAP Delete Asset Response:", response);

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

  const getAuditTrail = useCallback(async (): Promise<AuditLog[]> => {
    try {
      const response = await fetchWithAuth("/history?includes_trashed=true");

      // Return the history array from the response
      if (response && response.history && Array.isArray(response.history)) {
        return response.history;
      }

      // Fallback jika struktur berbeda
      if (Array.isArray(response)) {
        return response;
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected audit trail response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch audit trail:", error);
      return [];
    }
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

  const register = async (name: string, email: string, nik: string, password: string, department_id?: string, roleId?: string, customPermissions?: string[]) => {
    const response = await fetch(`${projectEnvVariables.envVariables.VITE_REACT_API_URL}/register?includes_trashed=true`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        nik,
        email,
        password,
        department_id,
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
      const responseData = await fetchWithAuth("/mhs?includes_trashed=true", {
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
        const response = await fetchWithAuth(searchQuery ? `/mhs?search=${encodeURIComponent(searchQuery)}?includes_trashed=true` : "/mhs?includes_trashed=true");
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
      const data = await fetchWithAuth(`/mhs/${id}?includes_trashed=true`);
      return data;
    },
    [fetchWithAuth]
  );

  const updateMachineHistory = useCallback(
    async (id: string, data: MachineHistoryFormData): Promise<any> => {
      const responseData = await fetchWithAuth(`/mhs/${id}?includes_trashed=true`, {
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
      const responseData = await fetchWithAuth(`/mhs/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  // Di AuthContext.tsx, tambahkan fungsi:
  const getAttachmentUrl = (attachmentPath: string | null): string | null => {
    if (!attachmentPath) return null;

    if (attachmentPath.startsWith("http")) {
      return attachmentPath;
    } else {
      // Sesuaikan dengan base URL Anda
      return `${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}${attachmentPath}`;
    }
  };

  // Di AuthContext.tsx - perbaiki fungsi addWorkOrderIT
  const addWorkOrderIT = useCallback(
    async (data: WorkOrderFormDataLocal, file?: File | null): Promise<any> => {
      const formData = new FormData();

      // Append semua field data
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof WorkOrderFormDataLocal];
        if (value !== null && value !== undefined) {
          formData.append(key, String(value));
        }
      });

      // Append file jika ada
      if (file) {
        formData.append("attachment", file);
      }

      const response = await fetchWithAuth("/ayam?includes_trashed=true", {
        method: "POST",
        body: formData, // Tidak perlu headers Content-Type, browser akan set otomatis
      });
      return response;
    },
    [fetchWithAuth]
  );

  const getWorkOrdersIT = useCallback(async (): Promise<WorkOrderData[]> => {
    try {
      const response = await fetchWithAuth("/ayam?includes_trashed=true");

      // Debug: lihat struktur response
      console.log("Raw work orders response:", response);

      // Handle berbagai kemungkinan struktur response
      if (response && response.success === true) {
        // Jika response memiliki properti success dan data
        if (Array.isArray(response.data)) {
          return response.data;
        }
      }

      // Fallback: jika response langsung array
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback lain: jika ada properti data yang berisi array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected work orders response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch work orders:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkOrderById = useCallback(
    async (id: string | number): Promise<WorkOrderData> => {
      const response = await fetchWithAuth(`/ayam/${id}?includes_trashed=true`, {
        method: "GET",
      });

      console.log("API raw response:", response);

      // Pastikan ambil .data kalau struktur JSON nya begitu
      return response;
    },
    [fetchWithAuth]
  );

  // Di AuthContext.tsx - perbaiki fungsi updateWorkOrderIT
  const updateWorkOrderIT = useCallback(
    async (data: WorkOrderFormDataLocal, file?: File | null): Promise<any> => {
      if (!data.id) {
        throw new Error("Work order ID is required for update.");
      }

      const formData = new FormData();

      // Tambahkan _method: PUT untuk override method
      formData.append("_method", "PUT");

      // Append semua field data
      Object.keys(data).forEach((key) => {
        const value = data[key as keyof WorkOrderFormDataLocal];
        if (value !== null && value !== undefined) {
          // Untuk field number, konversi ke string
          formData.append(key, String(value));
        }
      });

      // Append file jika ada
      if (file) {
        formData.append("attachment", file);
      }

      // Gunakan method POST dengan _method=PUT dalam formData
      const response = await fetchWithAuth(`/ayam/${data.id}?includes_trashed=true`, {
        method: "POST", // Gunakan POST karena kita pakai _method override
        body: formData, // Tidak perlu headers Content-Type, browser akan set otomatis
      });
      return response;
    },
    [fetchWithAuth]
  );

  const deleteWorkOrder = useCallback(
    async (id: number): Promise<any> => {
      const responseData = await fetchWithAuth(`/ayam/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const getWorkOrdersForUser = useCallback(
    async (userId: string): Promise<WorkOrderData[]> => {
      const allOrders = await getWorkOrdersIT();
      return allOrders.filter((order) => (order.requester_id === parseInt(userId) || order.assigned_to_id === parseInt(userId)) && (order.handling_status === "New" || order.handling_status === "Progress"));
    },
    [getWorkOrdersIT]
  );

  const changePassword = useCallback(
    async (oldPassword: string, newPassword: string) => {
      await fetchWithAuth("/user/password-update?includes_trashed=true", {
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
    try {
      const response = await fetchWithAuth("/users?includes_trashed=true");

      // Handle response format dari backend { success, message, data }
      let usersData;
      if (response && response.success !== undefined) {
        usersData = response.data || [];
      } else if (Array.isArray(response)) {
        usersData = response;
      } else {
        usersData = [];
      }

      return usersData.map((apiUser: any) => mapApiToUser(apiUser));
    } catch (error) {
      console.error("Failed to fetch users:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getUserById = useCallback(
    async (userId: string | number): Promise<User> => {
      const response = await fetchWithAuth(`/users/${userId}?includes_trashed=true`);
      return mapApiToUser(response);
    },
    [fetchWithAuth]
  );

  const fetchedUsers = useCallback(async (): Promise<User[]> => {
    const response = await fetchWithAuth("/user/profile?includes_trashed=true");
    return response.map((apiUser: any) => mapApiToUser(apiUser));
  }, [fetchWithAuth]);

  const getRoles = useCallback(async (): Promise<Role[]> => {
    const response = await fetchWithAuth("/roles?includes_trashed=true");
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
      const response = await fetchWithAuth("/roles?includes_trashed=true", {
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
      const response = await fetchWithAuth(`/roles/${id}?includes_trashed=true`, {
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
      await fetchWithAuth(`/roles/${id}?includes_trashed=true`, { method: "DELETE" });
    },
    [fetchWithAuth]
  );

  const updateUserPermissions = useCallback(
    async (userId: string, data: { roleId?: string | null; customPermissions?: string[] }): Promise<User> => {
      const currentUser = await fetchWithAuth(`/users/${userId}?includes_trashed=true`);
      const response = await fetchWithAuth(`/users/${userId}?includes_trashed=true`, {
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
      await fetchWithAuth(`/users/${id}?includes_trashed=true`, { method: "DELETE" });
    },
    [fetchWithAuth]
  );

  const getServiceGroups = useCallback(async (): Promise<ServiceGroup[]> => {
    try {
      const response = await fetchWithAuth("/service-groups?includes_trashed=true");
      return response.data || [];
    } catch (error) {
      console.error("Failed to fetch service groups:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getServiceGroup = useCallback(
    async (id: string | number): Promise<ServiceGroup> => {
      try {
        const response = await fetchWithAuth(`/service-groups/${id}?includes_trashed=true`);
        return response.data;
      } catch (error) {
        console.error(`Failed to fetch service group with id ${id}:`, error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  const addServiceGroup = useCallback(
    async (data: { group_name: string; group_description?: string | null }): Promise<ServiceGroup> => {
      try {
        const response = await fetchWithAuth("/service-groups?includes_trashed=true", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response) {
          throw new Error("No response from server");
        }

        if (response.success === false) {
          throw new Error(response.message || "Failed to create service group");
        }

        // Biasanya backend kirim data di response.data, tapi kita fallback ke response langsung
        const responseData = response.data || response;

        return {
          id: responseData.id,
          group_name: responseData.group_name,
          group_description: responseData.group_description,
        };
      } catch (error) {
        console.error("Error adding service group:", error);
        throw new Error(`Failed to add service group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateServiceGroup = useCallback(
    async (id: string | number, data: { group_name: string; group_description?: string | null }): Promise<ServiceGroup> => {
      try {
        const response = await fetchWithAuth(`/service-groups/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          group_name: responseData.group_name,
          group_description: responseData.group_description,
        };
      } catch (error) {
        console.error(`Failed to update service group with id ${id}:`, error);
        throw new Error(`Failed to update service group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteServiceGroup = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/service-groups/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete service group with id ${id}:`, error);
        throw new Error(`Failed to delete service group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getServices = useCallback(
    async (id: number): Promise<ServiceCatalogue[]> => {
      try {
        const responseData = await fetchWithAuth("/service-catalogues?includes_trashed=true");

        console.log("Raw services response:", responseData); // Debug

        // Handle response structure yang benar
        let servicesData;
        if (responseData && responseData.data && Array.isArray(responseData.data)) {
          servicesData = responseData.data; // Ambil dari responseData.data
        } else if (Array.isArray(responseData)) {
          servicesData = responseData;
        } else {
          console.warn("Unexpected services response format:", responseData);
          servicesData = [];
        }

        console.log("Processed services data:", servicesData); // Debug
        return servicesData;
      } catch (error) {
        console.error("Failed to fetch services:", error);
        return [];
      }
    },
    [fetchWithAuth]
  );

  const getServicesByOwner = useCallback(
    async (ownerId: number): Promise<ServiceCatalogue[]> => {
      try {
        const response = await fetchWithAuth(`/service-catalogues?owner=${ownerId}&includes_trashed=true`);
        return response.data || response;
      } catch (error) {
        console.error("Failed to fetch services by owner:", error);
        return [];
      }
    },
    [fetchWithAuth]
  );

  const addServiceCatalogue = useCallback(
    async (data: { service_name: string; service_description: string; service_group: number; priority: string; service_owner: number; sla: number; impact: string }): Promise<ServiceCatalogue> => {
      try {
        const response = await fetchWithAuth("/service-catalogues", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          service_name: responseData.service_name,
          service_description: responseData.service_description,
          service_group: responseData.service_group,
          priority: responseData.priority,
          service_owner: responseData.service_owner,
          sla: responseData.sla,
          impact: responseData.impact,
          created_at: responseData.created_at,
          updated_at: responseData.updated_at,
        };
      } catch (error) {
        console.error("Error adding service catalogue:", error);
        throw new Error(`Failed to add service catalogue: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateServiceCatalogue = useCallback(
    async (
      id: string | number,
      data: {
        service_name: string;
        service_description: string;
        service_group: number;
        priority: string;
        service_owner: number;
        sla: number;
        impact: string;
      }
    ): Promise<ServiceCatalogue> => {
      try {
        const response = await fetchWithAuth(`/service-catalogues/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          service_name: responseData.service_name,
          service_description: responseData.service_description,
          service_group: responseData.service_group,
          priority: responseData.priority,
          service_owner: responseData.service_owner,
          sla: responseData.sla,
          impact: responseData.impact,
          created_at: responseData.created_at,
          updated_at: responseData.updated_at,
        };
      } catch (error) {
        console.error(`Failed to update service catalogue with id ${id}:`, error);
        throw new Error(`Failed to update service catalogue: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteServiceCatalogue = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/service-catalogues/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete service catalogue with id ${id}:`, error);
        throw new Error(`Failed to delete service catalogue: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const setEditingUser = useCallback((user: EditingUser | null) => {
    _setEditingUser(user);
  }, []);

  const getDepartment = useCallback(async (): Promise<Department[]> => {
    try {
      const response = await fetchWithAuth("/department?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch departments:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getDepartmentById = useCallback(
    async (id: string | number): Promise<Department> => {
      const responseData = await fetchWithAuth(`/department/${id}?includes_trashed=true`);
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const addDepartment = useCallback(
    async (data: { name: string; head_id: number }) => {
      const responseData = await fetchWithAuth("/department?includes_trashed=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const updateDepartment = useCallback(
    async (id: string | number, data: { name: string; head_id: number }): Promise<Department> => {
      try {
        const response = await fetchWithAuth(`/department/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          name: responseData.name,
          head_id: responseData.head_id,
        };
      } catch (error) {
        console.error(`Failed to update service group with id ${id}:`, error);
        throw new Error(`Failed to update service group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteDepartment = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/department/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete service catalogue with id ${id}:`, error);
        throw new Error(`Failed to delete service catalogue: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getStopTimes = useCallback(async (): Promise<StopTimes[]> => {
    try {
      const response = await fetchWithAuth("/stoptime?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected stop times response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch stop times:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getStopTimesById = useCallback(
    async (id: string | number): Promise<StopTimes> => {
      try {
        const response = await fetchWithAuth(`/stoptime/${id}`);

        // Debug: log response untuk melihat struktur
        console.log("StopTimes by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch stop time with id ${id}:`, error);
        throw new Error(`Failed to fetch stop time: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addStopTimes = useCallback(
    async (data: { name: string; description: string }): Promise<StopTimes> => {
      try {
        const response = await fetchWithAuth("/stoptime?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding stop time:", error);
        throw new Error(`Failed to add stop time: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateStopTimes = useCallback(
    async (id: string | number, data: { name: string; description: string }): Promise<StopTimes> => {
      try {
        const response = await fetchWithAuth(`/stoptime/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update stop time response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update stop time with id ${id}:`, error);
        throw new Error(`Failed to update stop time: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteStopTimes = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/stoptime/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete stop time with id ${id}:`, error);
        throw new Error(`Failed to delete stop time: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getActivityTypes = useCallback(async (): Promise<ActivityType[]> => {
    try {
      const response = await fetchWithAuth("/jenisaktifitas?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected jenis aktifitas response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch jenis aktifitas:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getActivityTypesById = useCallback(
    async (id: string | number): Promise<ActivityType> => {
      try {
        const response = await fetchWithAuth(`/jenisaktifitas/${id}`);

        // Debug: log response untuk melihat struktur
        console.log("Jenis Aktifitas by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch jenis aktifitas with id ${id}:`, error);
        throw new Error(`Failed to fetch jenis aktifitas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addActivityTypes = useCallback(
    async (data: { name: string }): Promise<ActivityType> => {
      try {
        const response = await fetchWithAuth("/jenisaktifitas?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding jenis aktifitas:", error);
        throw new Error(`Failed to add jenis aktifitas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateActivityTypes = useCallback(
    async (id: string | number, data: { name: string }): Promise<ActivityType> => {
      try {
        const response = await fetchWithAuth(`/jenisaktifitas/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update jenis aktifitas response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update jenis aktifitas with id ${id}:`, error);
        throw new Error(`Failed to update jenis aktifitas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteActivityTypes = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/jenisaktifitas/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete jenis aktifitas with id ${id}:`, error);
        throw new Error(`Failed to delete jenis aktifitas: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getActivity = useCallback(async (): Promise<Activity[]> => {
    try {
      const response = await fetchWithAuth("/kegiatan?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected activity response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch activity:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getActivityById = useCallback(
    async (id: string | number): Promise<Activity> => {
      try {
        const response = await fetchWithAuth(`/kegiatan/${id}?includes_trashed=true`);

        // Debug: log response untuk melihat struktur
        console.log("Activity by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch activity with id ${id}:`, error);
        throw new Error(`Failed to fetch activity: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addActivity = useCallback(
    async (data: { name: string; description: string }): Promise<Activity> => {
      try {
        const response = await fetchWithAuth("/kegiatan?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding activity:", error);
        throw new Error(`Failed to add activity: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateActivity = useCallback(
    async (id: string | number, data: { name: string; description: string }): Promise<Activity> => {
      try {
        const response = await fetchWithAuth(`/kegiatan/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update activity response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update activity with id ${id}:`, error);
        throw new Error(`Failed to update activity: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteActivity = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/kegiatan/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete activity with id ${id}:`, error);
        throw new Error(`Failed to delete activity: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getTroubleItem = useCallback(async (): Promise<TroubleItem[]> => {
    try {
      const response = await fetchWithAuth("/itemtrouble?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected trouble item response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch trouble item:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getTroubleItemById = useCallback(
    async (id: string | number): Promise<TroubleItem> => {
      try {
        const response = await fetchWithAuth(`/itemtrouble/${id}?includes_trashed=true`);

        // Debug: log response untuk melihat struktur
        console.log("Trouble Item by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch trouble item with id ${id}:`, error);
        throw new Error(`Failed to fetch trouble item: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addTroubleItem = useCallback(
    async (data: { name: string; description: string }): Promise<TroubleItem> => {
      try {
        const response = await fetchWithAuth("/itemtrouble?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding trouble item:", error);
        throw new Error(`Failed to add trouble item: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateTroubleItem = useCallback(
    async (id: string | number, data: { name: string; description: string }): Promise<TroubleItem> => {
      try {
        const response = await fetchWithAuth(`/itemtrouble/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update trouble item response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update trouble item with id ${id}:`, error);
        throw new Error(`Failed to update trouble item: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteTroubleItem = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/itemtrouble/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete trouble item with id ${id}:`, error);
        throw new Error(`Failed to delete trouble item: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getWorkUnit = useCallback(async (): Promise<WorkUnit[]> => {
    try {
      const response = await fetchWithAuth("/unit?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected Work Unit response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch Work Unit:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkUnitById = useCallback(
    async (id: string | number): Promise<WorkUnit> => {
      try {
        const response = await fetchWithAuth(`/unit/${id}?includes_trashed=true`);

        // Debug: log response untuk melihat struktur
        console.log("Work Unit by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch work unit with id ${id}:`, error);
        throw new Error(`Failed to fetch work unit: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addWorkUnit = useCallback(
    async (data: { name: string; is_production: string; description: string }): Promise<WorkUnit> => {
      try {
        const response = await fetchWithAuth("/unit?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding work unit:", error);
        throw new Error(`Failed to add work unit: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateWorkUnit = useCallback(
    async (id: string | number, data: { name: string; is_production: string; description: string }): Promise<WorkUnit> => {
      try {
        const response = await fetchWithAuth(`/unit/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update work unit response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update work unit with id ${id}:`, error);
        throw new Error(`Failed to update work unit: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteWorkUnit = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/unit/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete work unit with id ${id}:`, error);
        throw new Error(`Failed to delete work unit: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getWorkGroup = useCallback(async (): Promise<WorkGroup[]> => {
    try {
      const response = await fetchWithAuth("/group?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected Work Group response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch Work Group:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkGroupById = useCallback(
    async (id: string | number): Promise<WorkGroup> => {
      try {
        const response = await fetchWithAuth(`/group/${id}?includes_trashed=true`);

        // Debug: log response untuk melihat struktur
        console.log("Work Group by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch work group with id ${id}:`, error);
        throw new Error(`Failed to fetch work group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addWorkGroup = useCallback(
    async (data: { name: string; description: string }): Promise<WorkGroup> => {
      try {
        const response = await fetchWithAuth("/group?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding work group:", error);
        throw new Error(`Failed to add work group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateWorkGroup = useCallback(
    async (id: string | number, data: { name: string; description: string }): Promise<WorkGroup> => {
      try {
        const response = await fetchWithAuth(`/group/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update work group response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update work group with id ${id}:`, error);
        throw new Error(`Failed to update work group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteWorkGroup = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/group/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete work group with id ${id}:`, error);
        throw new Error(`Failed to delete work group: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getWorkShift = useCallback(async (): Promise<WorkShift[]> => {
    try {
      const response = await fetchWithAuth("/shift?includes_trashed=true");

      // The API returns an array directly
      if (Array.isArray(response)) {
        return response;
      }

      // Fallback: if response has data array
      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      console.warn("Unexpected Work Shift response format:", response);
      return [];
    } catch (error) {
      console.error("Failed to fetch Work Shift:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkShiftById = useCallback(
    async (id: string | number): Promise<WorkShift> => {
      try {
        const response = await fetchWithAuth(`/shift/${id}?includes_trashed=true`);

        // Debug: log response untuk melihat struktur
        console.log("Work Shift by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          // Jika response memiliki properti data
          if (response.data) {
            return response.data;
          }
          // Jika response adalah object langsung (tanpa properti data)
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch work shift with id ${id}:`, error);
        throw new Error(`Failed to fetch work shift: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addWorkShift = useCallback(
    async (data: { name: string; description: string }): Promise<WorkShift> => {
      try {
        const response = await fetchWithAuth("/shift?includes_trashed=true", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // API returns the created object directly
        return response;
      } catch (error) {
        console.error("Error adding work shift:", error);
        throw new Error(`Failed to add work shift: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const updateWorkShift = useCallback(
    async (id: string | number, data: { name: string; description: string }): Promise<WorkShift> => {
      try {
        const response = await fetchWithAuth(`/shift/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        // Debug response
        console.log("Update work shift response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.data) {
            return response.data;
          }
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to update work shift with id ${id}:`, error);
        throw new Error(`Failed to update work shift: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteWorkShift = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/shift/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete work shift with id ${id}:`, error);
        throw new Error(`Failed to delete work shift: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  // Tambahkan fungsi-fungsi ini di dalam AuthProvider, setelah fungsi getAllMasterMonitoring

  const getUnit = useCallback(
    async (id: string | number): Promise<UnitWithMachines> => {
      try {
        const response = await fetchWithAuth(`/unit/${id}?includes_trashed=true`);

        // Debug response
        console.log("Unit by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.success !== undefined && response.data) {
            return response.data;
          }
          // Jika response langsung berisi data unit
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch unit with id ${id}:`, error);
        throw new Error(`Failed to fetch unit: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getMesin = useCallback(
    async (id: string | number): Promise<MesinDetail> => {
      try {
        const response = await fetchWithAuth(`/mesin/${id}?includes_trashed=true`);

        // Debug response
        console.log("Mesin by ID response:", response);

        // Handle berbagai format response
        if (response && typeof response === "object") {
          if (response.success !== undefined && response.data) {
            return response.data;
          }
          // Jika response langsung berisi data mesin
          return response;
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch mesin with id ${id}:`, error);
        throw new Error(`Failed to fetch mesin: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getUnitsWithMachines = useCallback(async (): Promise<UnitWithMachines[]> => {
    try {
      // Ambil semua unit
      const unitsResponse = await fetchWithAuth("/unit?includes_trashed=true");

      let units: any[] = [];
      if (Array.isArray(unitsResponse)) {
        units = unitsResponse;
      } else if (unitsResponse && Array.isArray(unitsResponse.data)) {
        units = unitsResponse.data;
      }

      // Untuk setiap unit, ambil detail lengkap dengan mesin
      const unitsWithMachines = await Promise.all(
        units.map(async (unit) => {
          try {
            // Gunakan endpoint yang memberikan detail unit dengan mesin
            const unitDetail = await fetchWithAuth(`/unit/${unit.id}?includes_trashed=true`);

            // Handle berbagai format response
            let unitData = unitDetail;
            if (unitDetail && unitDetail.success !== undefined && unitDetail.data) {
              unitData = unitDetail.data;
            }

            return {
              id: unitData.id,
              name: unitData.name,
              created_at: unitData.created_at,
              updated_at: unitData.updated_at,
              deleted_at: unitData.deleted_at,
              mesin: unitData.mesin || [], // Pastikan mesin ada, default ke array kosong
            };
          } catch (error) {
            console.error(`Failed to get detail for unit ${unit.id}:`, error);
            return {
              id: unit.id,
              name: unit.name,
              created_at: unit.created_at,
              updated_at: unit.updated_at,
              deleted_at: unit.deleted_at,
              mesin: [], // Default ke array kosong jika gagal
            };
          }
        })
      );

      return unitsWithMachines;
    } catch (error) {
      console.error("Failed to fetch units with machines:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getAllMasterMonitoring = useCallback(async (): Promise<AllMasterMonitoring> => {
    try {
      // Ambil data intervals terlebih dahulu
      const intervalsResponse = await fetchWithAuth("/interval?includes_trashed=true");

      let intervals: MonitoringInterval[] = [];
      if (Array.isArray(intervalsResponse)) {
        intervals = intervalsResponse;
      } else if (intervalsResponse && Array.isArray(intervalsResponse.data)) {
        intervals = intervalsResponse.data;
      }

      // Ambil data units dengan mesin secara langsung
      const unitsWithMachines = await getUnitsWithMachines();

      // Ambil data mesin terpisah jika diperlukan
      const mesinResponse = await fetchWithAuth("/mesin?includes_trashed=true");

      let mesin = [];
      if (Array.isArray(mesinResponse)) {
        mesin = mesinResponse;
      } else if (mesinResponse && Array.isArray(mesinResponse.data)) {
        mesin = mesinResponse.data;
      }

      return {
        unit: unitsWithMachines,
        mesin: mesin,
        unitsWithMachines: unitsWithMachines,
        intervals: intervals, // Sertakan intervals
      };
    } catch (error) {
      console.error("Error fetching master monitoring data:", error);
      return {
        unit: [],
        mesin: [],
        unitsWithMachines: [],
        intervals: [], // Default array kosong
      };
    }
  }, [fetchWithAuth, getUnitsWithMachines]);

  const getMonitoringSchedules = useCallback(async (): Promise<MonitoringSchedule[]> => {
    try {
      const response = await fetchWithAuth("/monitoring-schedules?includes_trashed=true");

      // Handle berbagai format response
      if (Array.isArray(response)) {
        return response;
      }

      if (response && response.success !== undefined) {
        if (response.success && Array.isArray(response.data)) {
          return response.data;
        }
        if (response.success && Array.isArray(response.result)) {
          return response.result;
        }
      }

      if (response && Array.isArray(response.data)) {
        return response.data;
      }

      if (response && Array.isArray(response.result)) {
        return response.result;
      }

      console.warn("Unexpected monitoring schedule response format:", response);
      return [];
    } catch (error) {
      console.error("Error fetching monitoring schedule:", error);
      throw new Error(`Failed to fetch monitoring schedule: ${error instanceof Error ? error.message : String(error)}`);
    }
  }, [fetchWithAuth]);

  const getMonitoringScheduleById = useCallback(
    async (id: string | number): Promise<MonitoringSchedule> => {
      try {
        const response = await fetchWithAuth(`/monitoring-schedules/${id}?includes_trashed=true`);

        // Debug response
        console.log("Monitoring schedule by ID response:", response);

        // Handle berbagai format response
        if (response && response.success !== undefined) {
          if (response.success && response.data) {
            return response.data;
          }
          if (!response.success) {
            throw new Error(response.message || "Failed to fetch monitoring schedule");
          }
        }

        // Jika response langsung berisi data
        if (response && response.id_monitoring_schedule) {
          return response;
        }

        // Jika response adalah array (seharusnya tidak)
        if (Array.isArray(response) && response.length > 0) {
          return response[0];
        }

        throw new Error("Invalid response format");
      } catch (error) {
        console.error(`Failed to fetch monitoring schedule with id ${id}:`, error);

        if (error instanceof Error) {
          if (error.message.includes("404")) {
            throw new Error(`Monitoring schedule with id ${id} not found`);
          }
          if (error.message.includes("401")) {
            throw new Error("Unauthorized - Please login again");
          }
        }

        throw new Error(`Failed to fetch monitoring schedule: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addMonitoringSchedule = useCallback(
    async (data: MonitoringScheduleRequest): Promise<MonitoringScheduleResponse> => {
      try {
        const response = await fetchWithAuth("/monitoring-schedules", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(data),
        });

        if (!response) {
          throw new Error("No response from server");
        }

        // Handle success false response
        if (response.success === false) {
          throw new Error(response.message || "Failed to create monitoring schedule");
        }

        // Extract data based on common response patterns
        const responseData = response.data || response.result || response;

        if (!responseData) {
          throw new Error("Invalid response format");
        }

        return responseData;
      } catch (error) {
        console.error("Error adding monitoring schedule:", error);

        if (error instanceof Error) {
          if (error.message.includes("401")) {
            throw new Error("Unauthorized - Please login again");
          }
          if (error.message.includes("404")) {
            throw new Error("Endpoint not found");
          }
          if (error.message.includes("500")) {
            throw new Error("Server error - Please try again later");
          }
        }

        throw new Error(`Failed to add monitoring schedule: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const addMonitoringActivities = useCallback(
    async (activities: MonitoringActivityPost[]): Promise<MonitoringActivityResponse[]> => {
      try {
        const response = await fetchWithAuth("/monitoring-activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activities),
        });

        // Handle response format
        if (Array.isArray(response)) {
          return response;
        }

        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        // Jika response tidak sesuai format yang diharapkan
        console.warn("Unexpected response format from monitoring-activities POST:", response);
        return [];
      } catch (error) {
        console.error("Error adding monitoring activities:", error);
        throw new Error(`Failed to add monitoring activities: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  // Di AuthContext.tsx - perbaiki updateMonitoringActivity
  // Di AuthContext.tsx - perbaiki updateMonitoringActivity
  const updateMonitoringActivity = useCallback(
    async (activities: MonitoringActivityUpdateRequest[]): Promise<MonitoringActivityResponse[]> => {
      try {
        // Konversi ke format yang diharapkan backend
        const activitiesToUpdate = activities.map((activity) => ({
          id_monitoring_activity: activity.id,
          ...activity.data,
        }));

        const response = await fetchWithAuth(`/monitoring-activities-batch`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(activitiesToUpdate), // Kirim array dalam format yang benar
        });

        // Handle response format
        if (Array.isArray(response)) {
          return response;
        }

        if (response && Array.isArray(response.data)) {
          return response.data;
        }

        console.warn("Unexpected response format from monitoring-activities-batch PATCH:", response);
        return [];
      } catch (error) {
        console.error("Error updating monitoring activities:", error);
        throw new Error(`Failed to update monitoring activities: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const getMesinDetail = useCallback(
    async (id: string | number): Promise<MesinDetail> => {
      try {
        const response = await fetchWithAuth(`/mesin/${id}?includes_trashed=true`);

        // Debug response
        console.log("Mesin detail response:", response);

        // Handle response format
        if (response && response.success !== undefined) {
          return response.data;
        }

        // Jika response langsung berisi data mesin
        return response;
      } catch (error) {
        console.error(`Failed to fetch mesin detail with id ${id}:`, error);
        throw new Error(`Failed to fetch mesin detail: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );
  const getVendor = useCallback(async (): Promise<Vendor[]> => {
    try {
      const response = await fetchWithAuth("/vendor?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch vendor:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getVendorById = useCallback(
    async (id: string | number): Promise<Vendor> => {
      const responseData = await fetchWithAuth(`/vendor/${id}?includes_trashed=true`);
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const addVendor = useCallback(
    async (data: { name: string; address: string; contact_person: string; email: string; telp: string; HP: string }) => {
      const responseData = await fetchWithAuth("/vendor?includes_trashed=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const updateVendor = useCallback(
    async (id: string | number, data: { name: string; address: string; contact_person: string; email: string; telp: string; HP: string }): Promise<Vendor> => {
      try {
        const response = await fetchWithAuth(`/vendor/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          name: responseData.name,
          address: responseData.address,
          contact_person: responseData.contact_person,
          email: responseData.email,
          telp: responseData.telp,
          HP: responseData.HP,
        };
      } catch (error) {
        console.error(`Failed to update vendor with id ${id}:`, error);
        throw new Error(`Failed to update vendor: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteVendor = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/vendor/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete vendor with id ${id}:`, error);
        throw new Error(`Failed to delete vendor: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  // Approval Template Functions - menggunakan approval-templates
  const getApprovalTemplates = useCallback(async (): Promise<ApprovalTemplate[]> => {
    try {
      const response = await fetchWithAuth("/approval-templates?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch approval templates:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getApprovalTemplateById = useCallback(
    async (id: string | number): Promise<ApprovalTemplate> => {
      const response = await fetchWithAuth(`/approval-templates/${id}?includes_trashed=true`);
      return response;
    },
    [fetchWithAuth]
  );

  const createApprovalTemplate = useCallback(
    async (data: { name: string; is_active?: boolean }): Promise<ApprovalTemplate> => {
      const response = await fetchWithAuth("/approval-templates?includes_trashed=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const updateApprovalTemplate = useCallback(
    async (id: string | number, data: { name?: string; is_active?: boolean }): Promise<ApprovalTemplate> => {
      const response = await fetchWithAuth(`/approval-templates/${id}?includes_trashed=true`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const deleteApprovalTemplate = useCallback(
    async (id: string | number): Promise<void> => {
      await fetchWithAuth(`/approval-templates/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
    },
    [fetchWithAuth]
  );

  // Approver Management Functions
  const addApproverToTemplate = useCallback(
    async (templateId: string | number, data: { approver_user_id: number; step: number }): Promise<Approver> => {
      // POST approval-templates/{template}/approvers
      const response = await fetchWithAuth(`/approval-templates/${templateId}/approvers?includes_trashed=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const updateApprover = useCallback(
    async (templateId: string | number, approverId: string | number, data: { approver_user_id?: number; step?: number }): Promise<Approver> => {
      // PUT template-approvers/{id}
      const response = await fetchWithAuth(`/template-approvers/${approverId}?includes_trashed=true`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const deleteApprover = useCallback(
    async (templateId: string | number, approverId: string | number): Promise<void> => {
      // DELETE template-approvers/{id}
      await fetchWithAuth(`/template-approvers/${approverId}?includes_trashed=true`, {
        method: "DELETE",
      });
    },
    [fetchWithAuth]
  );

  const getTemplateApprovers = useCallback(
    async (templateId: string | number): Promise<Approver[]> => {
      // Tidak ada route GET untuk approvers, ambil dari template detail
      const template = await fetchWithAuth(`/approval-templates/${templateId}?includes_trashed=true`);
      return template.approvers || [];
    },
    [fetchWithAuth]
  );

  // Template Activation
  const setApprovalTemplateActive = useCallback(
    async (templateId: string | number): Promise<ApprovalTemplate> => {
      // PUT approval-templates/{template}/set-active
      const response = await fetchWithAuth(`/approval-templates/${templateId}/set-active?includes_trashed=true`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  // Di AuthContext.tsx - pastikan approveSchedule mengembalikan response yang konsisten
  const approveSchedule = useCallback(
    async (scheduleId: string | number, comments: string): Promise<ApprovalResponse> => {
      const response = await fetchWithAuth(`/schedules/${scheduleId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comments }),
      });

      // Pastikan response memiliki properti success
      if (response && response.message) {
        return {
          success: true,
          message: response.message,
          data: response.data || response,
        };
      }

      return response;
    },
    [fetchWithAuth]
  );

  const getWorkArea = useCallback(async (): Promise<WorkArea[]> => {
    try {
      const response = await fetchWithAuth("/workarea?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch workarea:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getWorkAreaById = useCallback(
    async (id: string | number): Promise<WorkArea> => {
      const responseData = await fetchWithAuth(`/workarea/${id}?includes_trashed=true`);
      return responseData.data;
    },
    [fetchWithAuth]
  );

  const addWorkArea = useCallback(
    async (data: { work_area: string }) => {
      const responseData = await fetchWithAuth("/workarea?includes_trashed=true", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return responseData;
    },
    [fetchWithAuth]
  );

  const updateWorkArea = useCallback(
    async (id: string | number, data: { work_area: string }): Promise<WorkArea> => {
      try {
        const response = await fetchWithAuth(`/workarea/${id}?includes_trashed=true`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });

        const responseData = response.data || response;

        return {
          id: responseData.id,
          work_area: responseData.work_area,
        };
      } catch (error) {
        console.error(`Failed to update work area with id ${id}:`, error);
        throw new Error(`Failed to update work area: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  const deleteWorkArea = useCallback(
    async (id: string | number): Promise<void> => {
      try {
        await fetchWithAuth(`/workarea/${id}?includes_trashed=true`, {
          method: "DELETE",
        });
      } catch (error) {
        console.error(`Failed to delete work area with id ${id}:`, error);
        throw new Error(`Failed to delete work area: ${error instanceof Error ? error.message : String(error)}`);
      }
    },
    [fetchWithAuth]
  );

  // Tambahkan fungsi-fungsi berikut di dalam AuthProvider:

  const getGenbaRoles = useCallback(async (): Promise<GenbaRole[]> => {
    try {
      const response = await fetchWithAuth("/genba-roles?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch genba roles:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getGenbaSOs = useCallback(async (): Promise<GenbaSO[]> => {
    try {
      const response = await fetchWithAuth("/genba-sos?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch genba SOs:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getGenbaSOById = useCallback(
    async (id: string | number): Promise<GenbaSO> => {
      const response = await fetchWithAuth(`/genba-sos/${id}?includes_trashed=true`);
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const createGenbaSO = useCallback(
    async (data: CreateGenbaSOPayload): Promise<GenbaSO> => {
      const response = await fetchWithAuth("/genba-sos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const updateGenbaSO = useCallback(
    async (id: string | number, data: UpdateGenbaSOPayload): Promise<GenbaSO> => {
      const response = await fetchWithAuth(`/genba-sos/${id}?includes_trashed=true`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const deleteGenbaSO = useCallback(
    async (id: string | number): Promise<void> => {
      await fetchWithAuth(`/genba-sos/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
    },
    [fetchWithAuth]
  );

  const setGenbaSOActive = useCallback(
    async (id: string | number): Promise<GenbaSO> => {
      const response = await fetchWithAuth(`/genba-sos/${id}/activate?includes_trashed=true`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const getGenbaAreas = useCallback(async (): Promise<GenbaWorkAreas[]> => {
    try {
      const response = await fetchWithAuth("/genba-work-areas?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch genba SOs:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const createGenbaAreas = useCallback(
    async (data: CreateGenbaAreasPayload): Promise<any> => {
      const formData = new FormData();

      formData.append("department_id", data.department_id.toString());
      formData.append("pic_user_id", data.pic_user_id.toString());

      data.work_areas.forEach((area, index) => {
        formData.append(`work_areas[${index}][name]`, area.name);

        // ✅ selalu kirim is_default, walau false
        formData.append(`work_areas[${index}][is_default]`, area.is_default ? "1" : "0");

        if (area.attachment) {
          formData.append(`work_areas[${index}][attachment]`, area.attachment);
        }
      });

      try {
        const response = await fetchWithAuth("/genba-work-areas", {
          method: "POST",
          body: formData,
        });
        return response;
      } catch (error) {
        console.error("Error creating genba area:", error);
        throw error;
      }
    },
    [fetchWithAuth]
  );

  // Di AuthContext.tsx - perbaiki fungsi updateGenbaAreas
  const updateGenbaAreas = useCallback(
    async (id: string | number, data: UpdateGenbaAreasPayload, file?: File | null): Promise<GenbaWorkAreas> => {
      const formData = new FormData();

      // Append basic data
      if (Array.isArray(data.name)) {
        formData.append("name", JSON.stringify(data.name));
      } else {
        formData.append("name", data.name);
      }

      formData.append("department_id", data.department_id.toString());
      formData.append("is_default", data.is_default ? "1" : "0"); // kirim boolean sebagai string
      formData.append("pic_user_id", data.pic_user_id.toString());
      formData.append("_method", "POST");

      // Append file jika ada
      if (file) {
        formData.append("attachment", file);
      }

      const response = await fetchWithAuth(`/genba-work-areas/${id}`, {
        method: "POST",
        body: formData,
      });
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const deleteGenbaAreas = useCallback(
    async (id: string | number): Promise<void> => {
      await fetchWithAuth(`/genba-work-areas/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
    },
    [fetchWithAuth]
  );

  // Di dalam AuthProvider, tambahkan fungsi-fungsi berikut:

  const getGenbaActivities = useCallback(async (): Promise<GenbaActivity[]> => {
    try {
      const response = await fetchWithAuth("/genba-activities?includes_trashed=true");
      return response.data || response;
    } catch (error) {
      console.error("Failed to fetch genba activities:", error);
      return [];
    }
  }, [fetchWithAuth]);

  const getGenbaActivityById = useCallback(
    async (id: string | number): Promise<GenbaActivity> => {
      const response = await fetchWithAuth(`/genba-activities/${id}?includes_trashed=true`);
      return response.data || response;
    },
    [fetchWithAuth]
  );

  const createGenbaActivity = useCallback(
    async (data: CreateGenbaActivityPayload, files?: File[]): Promise<GenbaActivityResponse> => {
      const formData = new FormData();

      // Append basic data
      formData.append("date", data.date);
      formData.append("genba_work_area_id", data.genba_work_area_id.toString());
      formData.append("keterangan", data.keterangan);

      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments[]", file);
        });
      } else {
        // 🔹 jika tidak ada file, tetap kirim field kosong agar field attachment tetap eksis di backend
        formData.append("attachments", "");
      }

      console.log("Creating genba activity with data:", {
        date: data.date,
        genba_work_area_id: data.genba_work_area_id,
        keterangan: data.keterangan,
        fileCount: files?.length || 0,
      });

      const response = await fetchWithAuth("/genba-activities", {
        method: "POST",
        body: formData,
      });

      return response;
    },
    [fetchWithAuth]
  );

  const updateGenbaActivity = useCallback(
    async (id: string | number, data: Partial<CreateGenbaActivityPayload>, files?: File[]): Promise<GenbaActivityResponse> => {
      const formData = new FormData();

      // Append basic data
      if (data.date) formData.append("date", data.date);
      if (data.genba_work_area_id) formData.append("genba_work_area_id", data.genba_work_area_id.toString());
      if (data.keterangan) formData.append("keterangan", data.keterangan);

      formData.append("_method", "PUT");

      // Append files jika ada
      if (files && files.length > 0) {
        files.forEach((file) => {
          formData.append("attachments[]", file);
        });
      }

      console.log("Updating genba activity:", {
        id,
        date: data.date,
        genba_work_area_id: data.genba_work_area_id,
        keterangan: data.keterangan,
        fileCount: files?.length || 0,
      });

      const response = await fetchWithAuth(`/genba-activities/${id}`, {
        method: "POST",
        body: formData,
      });

      return response;
    },
    [fetchWithAuth]
  );

  const deleteGenbaActivity = useCallback(
    async (id: string | number): Promise<void> => {
      await fetchWithAuth(`/genba-activities/${id}?includes_trashed=true`, {
        method: "DELETE",
      });
    },
    [fetchWithAuth]
  );

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
        addWorkOrderIT,
        getWorkOrdersIT,
        updateWorkOrderIT,
        deleteWorkOrder,
        getWorkOrderById,
        departments: [],
        services: [],
        serviceGroups: [],
        getServices,
        getServicesByOwner,
        addServiceCatalogue,
        updateServiceCatalogue,
        deleteServiceCatalogue,
        getServiceGroups,
        getServiceGroup,
        addServiceGroup,
        updateServiceGroup,
        deleteServiceGroup,
        changePassword,
        fetchUser,
        fetchedUsers,
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
        getAssetsData,
        addAsset,
        editAsset,
        deleteAsset,
        getWorkOrdersForUser,
        getAuditTrail,
        getDepartment,
        getDepartmentById,
        addDepartment,
        updateDepartment,
        deleteDepartment,
        getMonitoringSchedules,
        addMonitoringSchedule,
        addMonitoringActivities,
        updateMonitoringActivity,
        getStopTimes,
        getStopTimesById,
        addStopTimes,
        updateStopTimes,
        deleteStopTimes,
        getActivityTypes,
        getActivityTypesById,
        addActivityTypes,
        updateActivityTypes,
        deleteActivityTypes,
        getActivity,
        getActivityById,
        addActivity,
        updateActivity,
        deleteActivity,
        getTroubleItem,
        getTroubleItemById,
        addTroubleItem,
        updateTroubleItem,
        deleteTroubleItem,
        getWorkUnit,
        getWorkUnitById,
        addWorkUnit,
        updateWorkUnit,
        deleteWorkUnit,
        getWorkGroup,
        getWorkGroupById,
        addWorkGroup,
        updateWorkGroup,
        deleteWorkGroup,
        getWorkShift,
        getWorkShiftById,
        addWorkShift,
        updateWorkShift,
        deleteWorkShift,
        getUnit,
        getMesin,
        getUnitsWithMachines,
        getAllMasterMonitoring,
        getMesinDetail,
        getMonitoringScheduleById,
        getVendor,
        getVendorById,
        addVendor,
        updateVendor,
        deleteVendor,
        getApprovalTemplates,
        getApprovalTemplateById,
        createApprovalTemplate,
        updateApprovalTemplate,
        deleteApprovalTemplate,
        addApproverToTemplate,
        updateApprover,
        deleteApprover,
        getTemplateApprovers,
        setApprovalTemplateActive,
        approveSchedule,
        getWorkArea,
        getWorkAreaById,
        addWorkArea,
        updateWorkArea,
        deleteWorkArea,
        getGenbaRoles,
        getGenbaSOs,
        getGenbaAreas,
        getGenbaSOById,
        createGenbaSO,
        createGenbaAreas,
        updateGenbaSO,
        updateGenbaAreas,
        deleteGenbaAreas,
        deleteGenbaSO,
        setGenbaSOActive,
        getGenbaActivities,
        getGenbaActivityById,
        createGenbaActivity,
        updateGenbaActivity,
        deleteGenbaActivity,
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
