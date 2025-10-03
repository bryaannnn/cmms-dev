import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Wrench, ChevronDown, CheckCircle, XCircle, Save, Info, MessageSquare, Clock, UserCog, Plus, ArrowLeft, Hourglass, X, History, AlertTriangle, RefreshCw, Monitor } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useAuth, ApprovalTemplate, Approver, MonitoringSchedule, ScheduleApproval } from "../../routes/AuthContext";
import PageHeader from "../PageHeader";

interface MonitoringItem {
  id: number;
  name: string;
  uom: string;
  min?: number;
  max?: number;
  visual?: string;
  standard_min?: string;
  standard_max?: string;
  standard_visual?: string;
  satuan?: string;
}

interface MachineDetail {
  id: string;
  name: string;
  interval: string;
  period: string;
  items: MonitoringItem[];
  unit?: string;
  mesin?: string;
  tahun?: string;
  bulan?: string;
  tgl_start?: string;
  tgl_end?: string;
}

interface ItemResult {
  itemId: number;
  result: string | number;
  status: "MS" | "TMS" | "N/A" | "Pending";
  remarks: string;
}

interface ApprovalRole {
  [key: string]: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited";
}

type ApprovalAction = "Approved" | "Rejected" | "FeedbackGiven" | "Edited";

interface UserRoleType {
  id: string;
  name: string;
  isDepartmentHead?: boolean;
  isSuperadmin?: boolean;
}

interface CommentEntry {
  id: string;
  role: string;
  comment: string;
  timestamp: string;
  replies?: CommentEntry[];
  parentId?: string | null;
}

interface ActivityLogEntry {
  type: "submission" | "approval" | "rejection" | "feedback" | "edit";
  timestamp: string;
  actor: string;
  description: string;
  details?: string;
}

interface MachineResults {
  machineId: string;
  itemResults: ItemResult[];
  approvalStatus: ApprovalRole;
  commentsHistory: CommentEntry[];
  activityHistory: ActivityLogEntry[];
  isSaved: boolean;
  submissionDate?: string;
  currentApprovalStep?: number;
}

interface CommentItemProps {
  comment: CommentEntry;
  machineId: string;
  currentUserRole: UserRoleType;
  onAddCommentOrReply: (machineId: string, role: string, commentText: string, parentId: string | null) => void;
  depth: number;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
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

const CommentItem: React.FC<CommentItemProps> = ({ comment, machineId, currentUserRole, onAddCommentOrReply, depth }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handlePostReply = () => {
    if (replyText.trim()) {
      onAddCommentOrReply(machineId, currentUserRole.name, replyText, comment.id);
      setReplyText("");
      setShowReplyInput(false);
    }
  };

  const paddingLeft = depth * 4;

  return (
    <div className={`p-4 bg-gray-50 border border-gray-200 rounded-lg shadow-sm mb-2 ${depth > 0 ? `ml-${paddingLeft} border-l-4 border-l-blue-200` : ""}`}>
      <p className="text-sm font-semibold text-gray-700 mb-1 flex items-center">{comment.role.replace(/([A-Z])/g, " $1").replace(/^./, (str: string) => str.toUpperCase())}</p>
      <p className="text-gray-800 text-base mb-2">{comment.comment}</p>
      <p className="text-xs text-gray-500 flex items-center">
        <Clock size={14} className="mr-1" /> {comment.timestamp}
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowReplyInput(!showReplyInput)} className="ml-3 text-blue-600 hover:text-blue-800 text-xs font-semibold">
          Balas
        </motion.button>
      </p>

      <AnimatePresence>
        {showReplyInput && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="mt-3">
            <textarea
              rows={1}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder={`Balas sebagai ${currentUserRole.name}...`}
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
            ></textarea>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handlePostReply}
              disabled={!replyText.trim()}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Kirim Balasan
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-3 border-t border-gray-100 pt-3">
          {comment.replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} machineId={machineId} currentUserRole={currentUserRole} onAddCommentOrReply={onAddCommentOrReply} depth={depth + 1} />
          ))}
        </div>
      )}
    </div>
  );
};

const DetailMonitoringMaintenance: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, getMonitoringScheduleById, addMonitoringActivities, hasPermission, approveSchedule, getApprovalTemplates } = useAuth();
  const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth < 768);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return JSON.parse(stored || "false");
  });
  const toggleSidebar = (): void => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };
  const [machineDetail, setMachineDetail] = useState<MachineDetail | null>(null);
  const [monitoringResults, setMonitoringResults] = useState<MachineResults | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"approval" | "history">("approval");
  const [feedbackState, setFeedbackState] = useState<Record<string, { showInput: boolean; text: string }>>({});
  const [approvalTemplates, setApprovalTemplates] = useState<ApprovalTemplate[]>([]);
  const [activeTemplate, setActiveTemplate] = useState<ApprovalTemplate | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<MonitoringSchedule | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  // Load approval templates sekali saja saat komponen mount
  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setIsTemplateLoading(true);
        const templates = await getApprovalTemplates();
        setApprovalTemplates(templates);

        // Cari template yang aktif
        const active = templates.find((template) => template.is_active);
        setActiveTemplate(active || null);

        console.log("Loaded templates:", templates);
        console.log("Active template:", active);
      } catch (err) {
        console.error("Error loading approval templates:", err);
      } finally {
        setIsTemplateLoading(false);
      }
    };

    loadTemplates();
  }, [getApprovalTemplates]);

  // Load machine detail setelah templates siap
  useEffect(() => {
    const loadData = async () => {
      if (!id) return; // Hanya butuh id, tidak perlu menunggu template

      try {
        setIsLoading(true);
        setError(null);

        const scheduleData = await getMonitoringScheduleById(parseInt(id));
        setScheduleData(scheduleData);

        if (!scheduleData) {
          throw new Error("Data monitoring schedule tidak ditemukan");
        }

        console.log("Schedule data dengan approvals:", scheduleData);

        // Map data dari backend ke frontend structure
        const machineDetailData: MachineDetail = {
          id: scheduleData.id_monitoring_schedule.toString(),
          name: `${scheduleData.data_mesin?.name || "Mesin"} - ${scheduleData.unit}`,
          interval: scheduleData.monitoring_interval?.type_interval || "Weekly",
          period: `${scheduleData.tgl_start} - ${scheduleData.tgl_end}`,
          unit: scheduleData.unit,
          mesin: scheduleData.data_mesin?.name,
          tahun: scheduleData.tahun,
          bulan: scheduleData.bulan,
          tgl_start: scheduleData.tgl_start,
          tgl_end: scheduleData.tgl_end,
          items:
            scheduleData.item_mesins?.map((item: any) => ({
              id: item.id,
              name: item.item_mesin,
              uom: item.satuan,
              min: item.standard_min ? parseFloat(item.standard_min) : undefined,
              max: item.standard_max ? parseFloat(item.standard_max) : undefined,
              visual: item.standard_visual,
              standard_min: item.standard_min,
              standard_max: item.standard_max,
              standard_visual: item.standard_visual,
              satuan: item.satuan,
            })) || [],
        };

        setMachineDetail(machineDetailData);

        // Process existing monitoring activities
        const existingActivities = scheduleData.monitoring_activities || [];
        const scheduleApprovals = scheduleData.schedule_approvals || [];

        // Inisialisasi approval status - gunakan activeTemplate jika sudah tersedia
        const initialApprovalStatus: ApprovalRole = {};

        if (activeTemplate && activeTemplate.approvers) {
          activeTemplate.approvers.forEach((approver) => {
            const stepKey = `step_${approver.step}`;
            const existingApproval = scheduleApprovals.find((approval: ScheduleApproval) => approval.approval_step === approver.step && approval.approver_id === approver.approver_user_id);

            if (existingApproval) {
              let status: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited" = "Pending";
              switch (existingApproval.status) {
                case "approved":
                  status = "Approved";
                  break;
                case "rejected":
                  status = "Rejected";
                  break;
                case "feedback_given":
                  status = "FeedbackGiven";
                  break;
                default:
                  status = "Pending";
              }
              initialApprovalStatus[stepKey] = status;
            } else {
              initialApprovalStatus[stepKey] = "Pending";
            }
          });
        } else {
          // Fallback: jika template belum loaded, gunakan data dari schedule approvals
          scheduleApprovals.forEach((approval: ScheduleApproval) => {
            const stepKey = `step_${approval.approval_step}`;
            let status: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited" = "Pending";
            switch (approval.status) {
              case "approved":
                status = "Approved";
                break;
              case "rejected":
                status = "Rejected";
                break;
              case "feedback_given":
                status = "FeedbackGiven";
                break;
              default:
                status = "Pending";
            }
            initialApprovalStatus[stepKey] = status;
          });
        }

        // Process activity history dari schedule_approvals
        const activityHistory: ActivityLogEntry[] = scheduleApprovals.map((approval: ScheduleApproval) => {
          let type: "submission" | "approval" | "rejection" | "feedback" | "edit" = "approval";
          let description = "";

          switch (approval.status) {
            case "approved":
              type = "approval";
              description = `Menyetujui laporan pada step ${approval.approval_step}`;
              break;
            case "rejected":
              type = "rejection";
              description = `Menolak laporan pada step ${approval.approval_step}`;
              break;
            case "feedback_given":
              type = "feedback";
              description = `Memberikan feedback pada step ${approval.approval_step}`;
              break;
            default:
              type = "submission";
              description = `Mengajukan approval pada step ${approval.approval_step}`;
          }

          // Pastikan timestamp selalu ada string
          const timestamp = approval.approved_at || approval.created_at;

          return {
            type,
            timestamp: timestamp || new Date().toISOString(),
            actor: `Approver Step ${approval.approval_step}`,
            description,
            details: approval.comments || undefined,
          };
        });

        // Tambahkan activity untuk submission data monitoring
        if (existingActivities.length > 0) {
          const submissionTimestamp = existingActivities[0].created_at;
          activityHistory.unshift({
            type: "submission",
            timestamp: submissionTimestamp || new Date().toISOString(),
            actor: "Technician",
            description: "Mengisi hasil monitoring",
          });
        }

        const initialResults: MachineResults = {
          machineId: machineDetailData.id,
          itemResults: machineDetailData.items.map((item) => {
            const existingActivity = existingActivities.find((activity: any) => activity.id_item_mesin === item.id);

            let status: "MS" | "TMS" | "N/A" | "Pending" = "Pending";
            if (existingActivity?.hasil_ms_tms) {
              const backendStatus = existingActivity.hasil_ms_tms.toLowerCase();
              if (backendStatus === "ms") status = "MS";
              else if (backendStatus === "tms") status = "TMS";
              else status = "N/A";
            }

            return {
              itemId: item.id,
              result: existingActivity?.hasil_monitoring || "",
              status: status,
              remarks: existingActivity?.hasil_keterangan || "",
            };
          }),
          approvalStatus: initialApprovalStatus,
          commentsHistory: [],
          activityHistory: activityHistory,
          isSaved: existingActivities.length > 0,
          submissionDate: existingActivities.length > 0 ? new Date().toISOString() : undefined,
          currentApprovalStep: getCurrentApprovalStepFromApprovals(scheduleApprovals, activeTemplate),
        };

        setMonitoringResults(initialResults);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat data monitoring");
        console.error("Error loading machine detail:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [id, getMonitoringScheduleById]);

  const currentUserRole: UserRoleType = useMemo(() => {
    if (!user) return { id: "guest", name: "Guest" };

    // Gunakan position dari user jika ada
    if (user.position) {
      return {
        id: user.id,
        name: user.position,
        isDepartmentHead: user.position.toLowerCase().includes("head") || user.position.toLowerCase().includes("manager"),
        isSuperadmin: user.roleId === "3",
      };
    }

    // Fallback ke sistem lama jika position tidak ada
    if (user.roleId === "1") return { id: "1", name: "admin", isDepartmentHead: true };
    if (user.roleId === "3") return { id: "3", name: "superadmin", isSuperadmin: true };

    if (user.department?.name?.toLowerCase().includes("engineering")) {
      if (user.position?.toLowerCase().includes("head")) {
        return { id: "unitHeadEngineering", name: "Unit Head Engineering", isDepartmentHead: true };
      }
      return { id: "technician", name: "Technician" };
    }

    if (user.department?.name?.toLowerCase().includes("process")) {
      if (user.position?.toLowerCase().includes("head")) {
        return { id: "unitHeadProcess", name: "Unit Head Process", isDepartmentHead: true };
      }
      return { id: "technician", name: "Technician" };
    }

    return { id: "technician", name: "Technician" };
  }, [user]);

  // Fungsi untuk mengecek apakah user adalah approver untuk step tertentu
  // Fungsi untuk mengecek apakah user adalah approver untuk step tertentu
  const isUserApproverForStep = useCallback(
    (step: number): boolean => {
      if (!activeTemplate || !activeTemplate.approvers || !user) return false;

      const approver = activeTemplate.approvers.find((approver) => approver.step === step && approver.approver_user_id.toString() === user.id);

      console.log(`Checking if user is approver for step ${step}:`, {
        userID: user.id,
        approverUserID: approver?.approver_user_id,
        match: !!approver,
      });

      return !!approver;
    },
    [activeTemplate, user]
  );

  const getCurrentApprovalStep = useCallback((): number => {
    if (!monitoringResults || !activeTemplate?.approvers) {
      return 1;
    }

    // Urutkan approver berdasarkan step
    const sortedApprovers = [...activeTemplate.approvers].sort((a, b) => a.step - b.step);

    console.log("=== GET CURRENT APPROVAL STEP ===");
    console.log("All approvers status:", monitoringResults.approvalStatus);

    // Cari step pertama yang statusnya bukan "Approved"
    for (let i = 0; i < sortedApprovers.length; i++) {
      const approver = sortedApprovers[i];
      const stepKey = `step_${approver.step}`;
      const status = monitoringResults.approvalStatus[stepKey];

      console.log(`Checking step ${approver.step}:`, {
        stepKey,
        status,
        isApproved: status === "Approved",
        isPending: status === "Pending",
        isOther: status !== "Approved" && status !== "Pending",
      });

      // Jika status bukan "Approved", maka step ini sedang aktif
      if (status !== "Approved") {
        console.log(`✅ Current active step found: ${approver.step}`);
        return approver.step;
      }
    }

    // Jika semua sudah approved, return step terakhir + 1
    const nextStep = sortedApprovers.length + 1;
    console.log(`✅ All steps approved, next step would be: ${nextStep}`);
    return nextStep;
  }, [monitoringResults, activeTemplate]);

  const getCurrentApprovalStepFromApprovals = (approvals: ScheduleApproval[], template: ApprovalTemplate | null): number => {
    if (!template || !template.approvers) return 1;

    // Urutkan approver berdasarkan step
    const sortedApprovers = [...template.approvers].sort((a, b) => a.step - b.step);

    console.log("Getting current step from approvals:", {
      approvalsCount: approvals.length,
      approversCount: sortedApprovers.length,
    });

    // Cari step pertama yang statusnya bukan "approved"
    for (let i = 0; i < sortedApprovers.length; i++) {
      const approver = sortedApprovers[i];
      const approvalForStep = approvals.find((approval) => approval.approval_step === approver.step && approval.approver_id === approver.approver_user_id);

      console.log(`Step ${approver.step}:`, {
        hasApproval: !!approvalForStep,
        status: approvalForStep?.status,
        isApproved: approvalForStep?.status === "approved",
      });

      if (!approvalForStep || approvalForStep.status !== "approved") {
        console.log(`Current step from approvals: ${approver.step}`);
        return approver.step;
      }
    }

    // Jika semua sudah approved, return step terakhir + 1
    const nextStep = sortedApprovers.length + 1;
    console.log(`All steps approved from approvals, next step: ${nextStep}`);
    return nextStep;
  };

  const getApprovalInfoForStep = (step: number, approver: Approver) => {
    if (!scheduleData) return null;

    const approvals = scheduleData.schedule_approvals || [];
    return approvals.find((approval: ScheduleApproval) => approval.approval_step === step && approval.approver_id === approver.approver_user_id);
  };

  const loadMachineDetail = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const scheduleData = await getMonitoringScheduleById(parseInt(id));
      setScheduleData(scheduleData); // Simpan di state

      if (!scheduleData) {
        throw new Error("Data monitoring schedule tidak ditemukan");
      }

      console.log("Schedule data dengan approvals:", scheduleData);

      // Map data dari backend ke frontend structure
      const machineDetailData: MachineDetail = {
        id: scheduleData.id_monitoring_schedule.toString(),
        name: `${scheduleData.data_mesin?.name || "Mesin"} - ${scheduleData.unit}`,
        interval: scheduleData.monitoring_interval?.type_interval || "Weekly",
        period: `${scheduleData.tgl_start} - ${scheduleData.tgl_end}`,
        unit: scheduleData.unit,
        mesin: scheduleData.data_mesin?.name,
        tahun: scheduleData.tahun,
        bulan: scheduleData.bulan,
        tgl_start: scheduleData.tgl_start,
        tgl_end: scheduleData.tgl_end,
        items:
          scheduleData.item_mesins?.map((item: any) => ({
            id: item.id,
            name: item.item_mesin,
            uom: item.satuan,
            min: item.standard_min ? parseFloat(item.standard_min) : undefined,
            max: item.standard_max ? parseFloat(item.standard_max) : undefined,
            visual: item.standard_visual,
            standard_min: item.standard_min,
            standard_max: item.standard_max,
            standard_visual: item.standard_visual,
            satuan: item.satuan,
          })) || [],
      };

      setMachineDetail(machineDetailData);

      // Process existing monitoring activities
      const existingActivities = scheduleData.monitoring_activities || [];
      const scheduleApprovals = scheduleData.schedule_approvals || [];

      // Inisialisasi approval status berdasarkan schedule_approvals
      const initialApprovalStatus: ApprovalRole = {};

      // Di dalam useEffect loadData, perbaiki bagian inisialisasi approvalStatus
      if (activeTemplate && activeTemplate.approvers) {
        activeTemplate.approvers.forEach((approver) => {
          const stepKey = `step_${approver.step}`;
          const existingApproval = scheduleApprovals.find((approval: ScheduleApproval) => approval.approval_step === approver.step && approval.approver_id === approver.approver_user_id);

          if (existingApproval) {
            let status: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited" = "Pending";
            switch (existingApproval.status) {
              case "approved":
                status = "Approved";
                break;
              case "rejected":
                status = "Rejected";
                break;
              case "feedback_given":
                status = "FeedbackGiven";
                break;
              default:
                status = "Pending";
            }
            initialApprovalStatus[stepKey] = status;

            console.log(`Step ${approver.step} status:`, status);
          } else {
            initialApprovalStatus[stepKey] = "Pending";
            console.log(`Step ${approver.step} status: Pending (no approval found)`);
          }
        });
      }

      // Di dalam fungsi loadMachineDetail, perbaiki bagian activityHistory:
      // Process activity history dari schedule_approvals
      const activityHistory: ActivityLogEntry[] = scheduleApprovals.map((approval: ScheduleApproval) => {
        let type: "submission" | "approval" | "rejection" | "feedback" | "edit" = "approval";
        let description = "";

        switch (approval.status) {
          case "approved":
            type = "approval";
            description = `Menyetujui laporan pada step ${approval.approval_step}`;
            break;
          case "rejected":
            type = "rejection";
            description = `Menolak laporan pada step ${approval.approval_step}`;
            break;
          case "feedback_given":
            type = "feedback";
            description = `Memberikan feedback pada step ${approval.approval_step}`;
            break;
          default:
            type = "submission";
            description = `Mengajukan approval pada step ${approval.approval_step}`;
        }

        // Pastikan timestamp selalu ada string
        const timestamp = approval.approved_at || approval.created_at;
        if (!timestamp) {
          console.warn(`No timestamp found for approval ${approval.id}, using current time`);
        }

        return {
          type,
          timestamp: timestamp || new Date().toISOString(), // Fallback ke current time jika tidak ada
          actor: `Approver Step ${approval.approval_step}`,
          description,
          details: approval.comments || undefined,
        };
      });

      // Tambahkan activity untuk submission data monitoring
      if (existingActivities.length > 0) {
        const submissionTimestamp = existingActivities[0].created_at;
        activityHistory.unshift({
          type: "submission",
          timestamp: submissionTimestamp || new Date().toISOString(), // Pastikan selalu ada string
          actor: "Technician",
          description: "Mengisi hasil monitoring",
        });
      }

      const initialResults: MachineResults = {
        machineId: machineDetailData.id,
        itemResults: machineDetailData.items.map((item) => {
          const existingActivity = existingActivities.find((activity: any) => activity.id_item_mesin === item.id);

          let status: "MS" | "TMS" | "N/A" | "Pending" = "Pending";
          if (existingActivity?.hasil_ms_tms) {
            const backendStatus = existingActivity.hasil_ms_tms.toLowerCase();
            if (backendStatus === "ms") status = "MS";
            else if (backendStatus === "tms") status = "TMS";
            else status = "N/A";
          }

          return {
            itemId: item.id,
            result: existingActivity?.hasil_monitoring || "",
            status: status,
            remarks: existingActivity?.hasil_keterangan || "",
          };
        }),
        approvalStatus: initialApprovalStatus,
        commentsHistory: [],
        activityHistory: activityHistory,
        isSaved: existingActivities.length > 0,
        submissionDate: existingActivities.length > 0 ? new Date().toISOString() : undefined,
        currentApprovalStep: getCurrentApprovalStepFromApprovals(scheduleApprovals, activeTemplate),
      };

      setMonitoringResults(initialResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data monitoring");
      console.error("Error loading machine detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, getMonitoringScheduleById, activeTemplate]);

  const handleResultChange = (itemId: number, value: string | number, itemType: "numeric" | "visual", min?: number, max?: number) => {
    setMonitoringResults((prevResults) => {
      if (!prevResults) return null;
      return {
        ...prevResults,
        itemResults: prevResults.itemResults.map((item) =>
          item.itemId === itemId
            ? {
                ...item,
                result: value,
                status: itemType === "numeric" ? determineNumericStatus(Number(value), min, max) : value === "MS" ? "MS" : value === "TMS" ? "TMS" : "Pending",
              }
            : item
        ),
      };
    });
  };

  const handleRemarksChange = (itemId: number, value: string) => {
    setMonitoringResults((prevResults) => {
      if (!prevResults) return null;
      return {
        ...prevResults,
        itemResults: prevResults.itemResults.map((item) => (item.itemId === itemId ? { ...item, remarks: value } : item)),
      };
    });
  };

  const determineNumericStatus = (result: number, min?: number, max?: number): "MS" | "TMS" | "N/A" | "Pending" => {
    if (isNaN(result) || result === null || result === undefined) {
      return min === undefined || max === undefined ? "N/A" : "Pending";
    }
    if (min !== undefined && max !== undefined) {
      return result >= min && result <= max ? "MS" : "TMS";
    }
    return "N/A";
  };

  const getStatusColors = (status: string) => {
    switch (status) {
      case "MS":
        return "bg-green-100 text-green-800 border-green-200";
      case "TMS":
        return "bg-red-100 text-red-800 border-red-200";
      case "Pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "N/A":
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getApprovalStatusColors = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "FeedbackGiven":
        return "bg-blue-100 text-blue-800";
      case "Edited":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleName = (userId: string): string => {
    if (!activeTemplate || !activeTemplate.approvers) return "Unknown Role";

    const approver = activeTemplate.approvers.find((approver) => approver.approver_user_id.toString() === userId);

    return approver?.approver.position || "Unknown Position";
  };

  const handleAddCommentOrReply = useCallback((machineId: string, role: string, commentText: string, parentId: string | null = null) => {
    setMonitoringResults((prevResults) => {
      if (!prevResults || prevResults.machineId !== machineId) return prevResults;
      const newComment: CommentEntry = {
        id: crypto.randomUUID(),
        role,
        comment: commentText,
        timestamp: new Date().toLocaleString(),
        replies: [],
        parentId: parentId,
      };

      const addRecursive = (comments: CommentEntry[], newComment: CommentEntry): CommentEntry[] => {
        if (newComment.parentId === null) {
          return [...comments, newComment];
        }
        return comments.map((c) => (c.id === newComment.parentId ? { ...c, replies: c.replies ? [...c.replies, newComment] : [newComment] } : { ...c, replies: c.replies ? addRecursive(c.replies, newComment) : c.replies }));
      };

      const currentCommentsHistory = prevResults.commentsHistory || [];
      return {
        ...prevResults,
        commentsHistory: addRecursive(currentCommentsHistory, newComment),
      };
    });
  }, []);

  const handleApproval = async (step: number, action: ApprovalAction, feedbackReason?: string) => {
    if (!monitoringResults || !id || !user) return;

    try {
      let comments = "";

      if (action === "FeedbackGiven" && feedbackReason) {
        comments = feedbackReason;
      } else if (action === "Rejected" && feedbackReason) {
        comments = feedbackReason;
      }

      console.log(`Sending approval for step ${step}, action: ${action}`);

      const response = await approveSchedule(parseInt(id), comments);

      if (response.success) {
        // Update monitoringResults dengan status approval yang baru
        setMonitoringResults((prevResults) => {
          if (!prevResults) return null;

          const updatedApprovalStatus: ApprovalRole = {
            ...prevResults.approvalStatus,
            [`step_${step}`]: action,
          };

          const updatedActivityHistory = [...prevResults.activityHistory];
          const timestamp = new Date().toLocaleString();

          // Tambahkan activity history berdasarkan action
          let activityDescription = "";
          switch (action) {
            case "Approved":
              activityDescription = `Menyetujui laporan pada step ${step}`;
              break;
            case "FeedbackGiven":
              activityDescription = `Memberikan feedback pada step ${step}`;
              break;
            case "Rejected":
              activityDescription = `Menolak laporan pada step ${step}`;
              break;
            default:
              activityDescription = `Melakukan aksi ${action} pada step ${step}`;
          }

          updatedActivityHistory.push({
            type: action === "Approved" ? "approval" : action === "Rejected" ? "rejection" : action === "FeedbackGiven" ? "feedback" : "edit",
            timestamp,
            actor: currentUserRole.name,
            description: `${currentUserRole.name} ${activityDescription}`,
            details: comments || undefined,
          });

          // Reset feedback state
          if (action !== "Edited") {
            setFeedbackState((prev) => ({
              ...prev,
              [`step_${step}`]: { showInput: false, text: "" },
            }));
          }

          return {
            ...prevResults,
            approvalStatus: updatedApprovalStatus,
            activityHistory: updatedActivityHistory,
          };
        });

        // Tampilkan modal sukses
        let successMessage = "";
        switch (action) {
          case "Approved":
            successMessage = "Berhasil menyetujui laporan.";
            break;
          case "FeedbackGiven":
            successMessage = "Berhasil mengirim feedback.";
            break;
          case "Rejected":
            successMessage = "Berhasil menolak laporan.";
            break;
          case "Edited":
            successMessage = "Berhasil menyimpan perubahan.";
            break;
        }
        showModal("Success!", successMessage, true);
      } else {
        throw new Error(response.message || "Approval failed");
      }
    } catch (error) {
      console.error("Error during approval:", error);
      showModal("Error!", "Gagal melakukan approval. Silakan coba lagi.", false);
    }
  };

  const toggleFeedbackInput = (step: number) => {
    setFeedbackState((prev) => ({
      ...prev,
      [`step_${step}`]: {
        ...prev[`step_${step}`],
        showInput: !prev[`step_${step}`]?.showInput,
      },
    }));
  };

  const updateFeedbackText = (step: number, text: string) => {
    setFeedbackState((prev) => ({
      ...prev,
      [`step_${step}`]: {
        ...prev[`step_${step}`],
        text: text,
      },
    }));
  };

  const handleSaveMachineResults = async () => {
    if (!machineDetail || !monitoringResults || !id) return;

    setIsSaving(true);
    try {
      let isValid = true;
      const pendingItems: { item: string }[] = [];

      monitoringResults.itemResults.forEach((itemResult) => {
        const originalItem = machineDetail.items.find((i) => i.id === itemResult.itemId);
        if (originalItem && (itemResult.result === "" || itemResult.status === "Pending")) {
          isValid = false;
          pendingItems.push({ item: originalItem.name });
        }
      });

      if (!isValid) {
        showModal("Validation Error", `Harap isi semua hasil monitoring yang diperlukan untuk ${machineDetail.name}. Item yang belum diisi: ` + pendingItems.map((p) => p.item).join(", "), false);
        return;
      }

      // Prepare data for backend
      const activitiesToSave = monitoringResults.itemResults.map((itemResult) => ({
        id_monitoring_schedule: parseInt(id),
        id_item_mesin: itemResult.itemId,
        tgl_monitoring: machineDetail.tgl_start || new Date().toISOString().split("T")[0],
        hasil_monitoring: itemResult.result.toString(),
        hasil_keterangan: itemResult.remarks,
        hasil_ms_tms: itemResult.status === "MS" ? "ms" : itemResult.status === "TMS" ? "tms" : "na",
      }));

      await addMonitoringActivities(activitiesToSave);

      setMonitoringResults((prevResults) => {
        if (!prevResults) return null;
        let updatedCommentsHistory = prevResults.commentsHistory || [];
        let updatedActivityHistory = [...prevResults.activityHistory];
        const timestamp = new Date().toLocaleString();

        if (isStep1Approver) {
          updatedActivityHistory.push({
            type: "edit",
            timestamp,
            actor: currentUserRole.name,
            description: `${currentUserRole.name} (Approver Step 1) mengedit hasil monitoring.`,
          });
        } else {
          updatedActivityHistory.push({
            type: "submission",
            timestamp,
            actor: currentUserRole.name,
            description: `${currentUserRole.name} mengisi hasil monitoring.`,
          });
        }

        return {
          ...prevResults,
          isSaved: true,
          submissionDate: new Date().toISOString(),
          commentsHistory: updatedCommentsHistory,
          activityHistory: updatedActivityHistory,
        };
      });

      showModal("Success!", `Hasil monitoring untuk ${machineDetail.name} berhasil disimpan!`, true);
    } catch (err) {
      showModal("Error!", "Gagal menyimpan hasil monitoring. Silakan coba lagi.", false);
      console.error("Error saving monitoring results:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateShouldShowActionButtons = (step: number, approver: Approver, currentStatus: string | undefined): boolean => {
    if (!user || !monitoringResults?.isSaved || isTemplateLoading) {
      return false;
    }

    // Cek apakah user adalah approver untuk step ini
    const isCurrentApprover = approver.approver_user_id.toString() === user.id;

    // Cek apakah status masih membutuhkan action (bukan "Approved")
    const needsAction = currentStatus !== "Approved";

    // Cek apakah ini step yang sedang aktif
    const currentStep = getCurrentApprovalStep();
    const isCurrentStep = currentStep === step;

    // Cek apakah step sebelumnya sudah approved
    const previousStep = step - 1;
    const previousStepKey = `step_${previousStep}`;
    const previousStepStatus = monitoringResults.approvalStatus[previousStepKey];

    // Untuk step 1, tidak ada step sebelumnya
    const isPreviousStepApproved = step === 1 || previousStepStatus === "Approved";

    console.log(`Step ${step} Action Check:`, {
      isCurrentApprover,
      needsAction,
      isCurrentStep,
      isPreviousStepApproved,
      currentStatus,
      currentStep,
      previousStepStatus,
    });

    return isCurrentApprover && needsAction && isCurrentStep && isPreviousStepApproved;
  };

  // Fungsi terpisah untuk handle edit oleh approver step 1
  // Fungsi terpisah untuk handle edit oleh approver step 1
  const handleEditByApprover = async (step: number) => {
    if (!monitoringResults || !id || step !== 1) return;

    try {
      // Simpan perubahan data monitoring terlebih dahulu
      await handleSaveMachineResults();

      // Set approval status menjadi Edited hanya untuk step 1
      setMonitoringResults((prevResults) => {
        if (!prevResults) return null;

        const updatedApprovalStatus: ApprovalRole = {
          ...prevResults.approvalStatus,
          [`step_1`]: "Edited",
        };

        const updatedActivityHistory = [...prevResults.activityHistory];
        const timestamp = new Date().toLocaleString();

        updatedActivityHistory.push({
          type: "edit",
          timestamp,
          actor: currentUserRole.name,
          description: `${currentUserRole.name} (Approver Step 1) mengedit hasil monitoring.`,
        });

        return {
          ...prevResults,
          approvalStatus: updatedApprovalStatus,
          activityHistory: updatedActivityHistory,
        };
      });

      showModal("Success!", "Berhasil menyimpan perubahan dan menandai sebagai edited oleh Approver Step 1.", true);
    } catch (error) {
      console.error("Error during edit by approver:", error);
      showModal("Error!", "Gagal menyimpan perubahan. Silakan coba lagi.", false);
    }
  };

  const groupedComments = useMemo(() => {
    if (!monitoringResults?.commentsHistory) return {};

    const buildTree = (comments: CommentEntry[], parentId: string | null = null): CommentEntry[] => {
      return comments
        .filter((comment: CommentEntry) => comment.parentId === parentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((comment) => ({
          ...comment,
          replies: buildTree(comments, comment.id),
        }));
    };

    const commentsByStep: Record<string, CommentEntry[]> = {};

    if (activeTemplate?.approvers) {
      activeTemplate.approvers.forEach((approver) => {
        const commentsForStep = monitoringResults.commentsHistory.filter((c: CommentEntry) => c.role === getRoleName(approver.approver_user_id.toString()));
        commentsByStep[`step_${approver.step}`] = buildTree(commentsForStep);
      });
    }

    return commentsByStep;
  }, [monitoringResults?.commentsHistory, activeTemplate]);

  // Tambahkan fungsi ini untuk debugging
  const debugApprovalStatus = useCallback(() => {
    if (!monitoringResults || !activeTemplate) return;

    console.log("=== DEBUG APPROVAL STATUS ===");
    console.log("Active Template:", activeTemplate.name);
    console.log("Approvers:", activeTemplate.approvers);

    activeTemplate.approvers?.forEach((approver) => {
      const stepKey = `step_${approver.step}`;
      const status = monitoringResults.approvalStatus[stepKey];
      const isCurrentUser = approver.approver_user_id.toString() === user?.id;

      console.log(`Step ${approver.step}:`, {
        approver: approver.approver.name,
        status,
        isCurrentUser,
        stepKey,
      });
    });

    console.log("Current Step:", getCurrentApprovalStep());
    console.log("User ID:", user?.id);
  }, [monitoringResults, activeTemplate, user, getCurrentApprovalStep]);

  // Panggil fungsi debug saat komponen mount atau data berubah
  useEffect(() => {
    if (monitoringResults && activeTemplate) {
      debugApprovalStatus();
    }
  }, [monitoringResults, activeTemplate, debugApprovalStatus]);

  // Fungsi untuk menentukan jenis input berdasarkan data item
  const getInputType = (item: MonitoringItem): "numeric" | "visual" => {
    if (item.satuan && item.satuan !== "Visual" && item.satuan !== "Level" && item.satuan !== "Kekencangan") {
      return "numeric";
    }
    return "visual";
  };

  // Hanya approver step 1 yang bisa mengedit hasil monitoring
  const isEditable = useMemo(() => {
    if (!monitoringResults?.isSaved) {
      // Jika belum disimpan, semua user bisa mengedit
      return true;
    }

    // Jika sudah disimpan, hanya approver step 1 yang bisa mengedit
    return isUserApproverForStep(1);
  }, [monitoringResults?.isSaved, isUserApproverForStep]);

  // User adalah approver untuk step yang sedang aktif
  const isCurrentApprover = isUserApproverForStep(getCurrentApprovalStep());

  const isStep1Approver = isUserApproverForStep(1);

  const showModal = useCallback((title: string, message: string, success: boolean = true) => {
    setModalTitle(title);
    setModalMessage(message);
    setIsSuccess(success);
    if (success) {
      setShowSuccessModal(true);
    } else {
      setShowErrorModal(true);
    }
  }, []);

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    setShowErrorModal(false);
    // Refresh data setelah modal ditutup
    loadMachineDetail();
  }, [loadMachineDetail]);

  if (isLoading) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <ArrowLeft className="text-xl" />
                <span className="font-semibold text-sm hidden md:inline">Back</span>
              </motion.button>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Monitoring & Maintenance</h2>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500"></div>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <ArrowLeft className="text-xl" />
                <span className="font-semibold text-sm hidden md:inline">Back</span>
              </motion.button>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Monitoring & Maintenance</h2>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <AlertTriangle className="text-red-500 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-red-800 mb-2">Gagal Memuat Data</h3>
              <p className="text-red-600 mb-4">{error}</p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={loadMachineDetail}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold flex items-center justify-center mx-auto"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Coba Lagi
              </motion.button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (!machineDetail || !monitoringResults) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
            <div className="flex items-center space-x-4">
              <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
                <ArrowLeft className="text-xl" />
                <span className="font-semibold text-sm hidden md:inline">Back</span>
              </motion.button>
              <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Monitoring & Maintenance</h2>
            </div>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <AlertTriangle className="text-yellow-500 text-4xl mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">Data Tidak Ditemukan</h3>
              <p className="text-yellow-600">Data monitoring schedule tidak tersedia.</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Monitoring Maintenance"
          mainTitleHighlight="Management"
          description="Manage user roles and permissions to control access and functionality within the system."
          icon={<Monitor />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detail Monitoring & Maintenance</h1>
              <p className="text-gray-600 mt-1">
                Machine: <span className="font-semibold text-gray-800">{machineDetail.name}</span>
              </p>
              <p className="text-gray-600 mt-1">
                Interval: <span className="font-semibold text-gray-800">{machineDetail.interval}</span>
              </p>
              <p className="text-gray-600 mt-1">
                Periode: <span className="font-semibold text-gray-800">{machineDetail.period}</span>
              </p>
              <div className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
                <p>
                  <span className="font-semibold">{machineDetail.items.length}</span> Items
                </p>
                {isTemplateLoading ? (
                  <p>Memuat template...</p>
                ) : activeTemplate ? (
                  <p>
                    Template: <span className="font-semibold">{activeTemplate.name}</span>
                  </p>
                ) : (
                  <p>
                    Template: <span className="font-semibold text-yellow-600">Tidak ada template aktif</span>
                  </p>
                )}
                {!isTemplateLoading && isStep1Approver && <p className="text-blue-600 font-semibold">(Anda adalah Approver Step 1 - Dapat mengedit)</p>}
                {!isTemplateLoading && isCurrentApprover && !isStep1Approver && <p className="text-green-600 font-semibold">(Anda adalah approver untuk step {getCurrentApprovalStep()})</p>}
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nama Item
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Standar
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Hasil
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Catatan
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {machineDetail.items.map((item) => {
                      const currentResult = monitoringResults.itemResults.find((i) => i.itemId === item.id);
                      const inputType = getInputType(item);

                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {item.name}
                            {!isEditable && monitoringResults?.isSaved && <span className="ml-2 text-xs text-gray-500">(Terkunci)</span>}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.standard_visual ? `${item.standard_visual} (${item.satuan})` : `${item.standard_min} - ${item.standard_max} ${item.satuan}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {inputType === "visual" ? (
                              <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                value={currentResult?.result || ""}
                                onChange={(e) => handleResultChange(item.id, e.target.value, "visual")}
                                disabled={!isEditable}
                              >
                                <option value="">Pilih</option>
                                <option value="MS">MS</option>
                                <option value="TMS">TMS</option>
                              </select>
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                value={currentResult?.result as string}
                                onChange={(e) => handleResultChange(item.id, e.target.value, "numeric", item.min, item.max)}
                                disabled={!isEditable}
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                                placeholder="Input result"
                              />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${getStatusColors(currentResult?.status || "Pending")}`}>{currentResult?.status}</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <textarea
                              rows={1}
                              value={currentResult?.remarks}
                              onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                              disabled={!isEditable}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="Tambahkan catatan..."
                            />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex justify-end mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={isStep1Approver ? () => handleEditByApprover(1) : handleSaveMachineResults}
                  disabled={!isEditable || isSaving}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" />
                      {isStep1Approver ? "Save & Mark as Edited" : "Save Monitoring"}
                    </>
                  )}
                </motion.button>
              </div>
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm mt-8">
                <div className="flex items-center space-x-4 mb-4 border-b border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setActiveTab("approval")}
                    className={`pb-3 px-2 font-semibold text-gray-700 transition-colors flex items-center space-x-2 ${activeTab === "approval" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <Info className="h-5 w-5" />
                    <span>Approval Status</span>
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    onClick={() => setActiveTab("history")}
                    className={`pb-3 px-2 font-semibold text-gray-700 transition-colors flex items-center space-x-2 ${activeTab === "history" ? "border-b-2 border-blue-600 text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
                  >
                    <History className="h-5 w-5" />
                    <span>History Activity</span>
                  </motion.button>
                </div>
                {activeTab === "approval" ? (
                  <AnimatePresence mode="wait">
                    <motion.div key="approval-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                      {/* Tampilkan loading state untuk template */}
                      {isTemplateLoading ? (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                          <p className="text-gray-500 mt-2">Memuat template approval...</p>
                        </div>
                      ) : !activeTemplate ? (
                        <div className="text-center py-8 text-gray-500">
                          <Info className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                          <p>Tidak ada template approval yang aktif.</p>
                        </div>
                      ) : (
                        activeTemplate.approvers?.map((approver) => {
                          const stepKey = `step_${approver.step}`;
                          const status = monitoringResults?.approvalStatus[stepKey] || "Pending";
                          const shouldShowActionButtons = calculateShouldShowActionButtons(approver.step, approver, status);
                          const approvalInfo = getApprovalInfoForStep(approver.step, approver);
                          const currentStep = getCurrentApprovalStep();
                          const isCurrentUserApprover = approver.approver_user_id.toString() === user?.id;

                          // Tampilkan status step sebelumnya untuk debugging
                          const previousStep = approver.step - 1;
                          const previousStepKey = `step_${previousStep}`;
                          const previousStepStatus = monitoringResults?.approvalStatus[previousStepKey];

                          console.log(`Rendering Step ${approver.step}:`, {
                            status,
                            shouldShowActionButtons,
                            currentStep,
                            isCurrentUserApprover,
                            previousStepStatus,
                            userId: user?.id,
                            approverId: approver.approver_user_id,
                          });

                          return (
                            <div key={stepKey} className="p-4 rounded-lg border border-gray-200 bg-white">
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex-1">
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <span className="text-sm font-medium text-gray-700">
                                        Step {approver.step}: {approver.approver.name} ({approver.approver.position})
                                      </span>
                                      <p className="text-xs text-gray-500">{approver.approver.department}</p>
                                      {approvalInfo && (
                                        <p className="text-xs text-gray-500 mt-1">
                                          {approvalInfo.approved_at && `Disetujui: ${new Date(approvalInfo.approved_at).toLocaleString()}`}
                                          {approvalInfo.status === "feedback_given" && ` | Feedback diberikan`}
                                        </p>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <span className={`text-xs font-medium px-3 py-1 rounded-full ${getApprovalStatusColors(status)}`}>{status}</span>
                                      {isCurrentUserApprover && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Anda</span>}
                                    </div>
                                  </div>

                                  {/* Tampilkan komentar dari approval jika ada */}
                                  {approvalInfo?.comments && (
                                    <div className="mt-2 p-2 bg-gray-50 rounded border">
                                      <p className="text-xs text-gray-400">
                                        <strong>Komentar:</strong> {approvalInfo.comments}
                                      </p>
                                    </div>
                                  )}

                                  {/* Status informasi untuk step yang sedang menunggu */}
                                  {currentStep === approver.step && status !== "Approved" && !shouldShowActionButtons && (
                                    <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
                                      <p className="text-yellow-700">
                                        <strong>Menunggu:</strong> Step {approver.step} sedang menunggu approval dari {approver.approver.name}
                                        {previousStep > 0 && previousStepStatus !== "Approved" && <span> (Step {previousStep} perlu disetujui terlebih dahulu)</span>}
                                      </p>
                                    </div>
                                  )}

                                  {/* Status informasi untuk step yang sudah selesai */}
                                  {status === "Approved" && (
                                    <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs">
                                      <p className="text-green-700">
                                        <strong>Selesai:</strong> Step {approver.step} telah disetujui
                                      </p>
                                    </div>
                                  )}

                                  {/* Tombol actions */}
                                  {!isTemplateLoading && shouldShowActionButtons && (
                                    <div className="flex space-x-2 mt-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApproval(approver.step, "Approved")}
                                        className="px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-semibold transition-colors flex items-center"
                                      >
                                        <CheckCircle size={16} className="mr-1" />
                                        Approve
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleFeedbackInput(approver.step)}
                                        className="px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center"
                                      >
                                        <MessageSquare size={16} className="mr-1" />
                                        Feedback
                                      </motion.button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Feedback Input */}
                              <AnimatePresence>
                                {feedbackState[stepKey]?.showInput && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200"
                                  >
                                    <h5 className="text-sm font-semibold text-gray-800 mb-2">Berikan Feedback</h5>
                                    <textarea
                                      rows={3}
                                      value={feedbackState[stepKey]?.text || ""}
                                      onChange={(e) => updateFeedbackText(approver.step, e.target.value)}
                                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                                      placeholder="Tulis feedback atau alasan penolakan..."
                                    />
                                    <div className="flex justify-end space-x-2 mt-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApproval(approver.step, "FeedbackGiven", feedbackState[stepKey]?.text)}
                                        disabled={!feedbackState[stepKey]?.text?.trim()}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        <MessageSquare size={16} className="mr-1" />
                                        Kirim Feedback
                                      </motion.button>

                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => toggleFeedbackInput(approver.step)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm font-semibold transition-colors"
                                      >
                                        Batal
                                      </motion.button>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                          );
                        })
                      )}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div key="history-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                      {monitoringResults.activityHistory.length > 0 ? (
                        // URUTKAN DARI TERBARU KE TERLAMA (descending)
                        monitoringResults.activityHistory
                          .slice() // Buat copy array untuk menghindari mutasi original
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) // Descending: terbaru -> terlama
                          .map((activity, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: index * 0.05 }}
                              className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                            >
                              <div className="mt-1 flex-shrink-0">
                                {activity.type === "approval" && <CheckCircle size={20} className="text-green-500" />}
                                {activity.type === "rejection" && <XCircle size={20} className="text-red-500" />}
                                {activity.type === "feedback" && <MessageSquare size={20} className="text-blue-500" />}
                                {activity.type === "submission" && <History size={20} className="text-blue-500" />}
                                {activity.type === "edit" && <Save size={20} className="text-purple-500" />}
                              </div>
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-800">{activity.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  <span className="font-medium text-gray-600">Oleh: {activity.actor}</span> - {new Date(activity.timestamp).toLocaleString()}
                                </p>
                                {activity.details && <p className="text-sm text-gray-700 italic mt-2">"{activity.details}"</p>}
                              </div>
                            </motion.div>
                          ))
                      ) : (
                        <p className="text-gray-500 text-sm">Belum ada aktivitas yang tercatat.</p>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </motion.div>
          </div>
        </main>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Data detail hasil monitoring berhasil disimpan!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
          >
            Back To Detail Monitoring
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default DetailMonitoringMaintenance;
