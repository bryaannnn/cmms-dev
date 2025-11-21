import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Wrench, ChevronDown, CheckCircle, XCircle, Save, Info, MessageSquare, Edit, Clock, UserCog, Plus, ArrowLeft, Hourglass, X, History, AlertTriangle, RefreshCw, Monitor } from "lucide-react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useAuth, ApprovalTemplate, Approver, MonitoringSchedule, ScheduleApproval, MonitoringActivityPost } from "../../routes/AuthContext";
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
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
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

// Tambahkan komponen ini di dalam file DetailMonitoring.tsx

const ConfirmModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "approve" | "feedback" | "reject" | "edit";
}> = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirm", cancelText = "Cancel", type = "approve" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4">
          <motion.div
            initial={{ y: 50, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 50, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full border border-blue-100"
          >
            <div className="p-6 text-center">
              <div className="flex justify-center mb-4">
                {type === "approve" && <CheckCircle className="text-green-500 text-5xl" />}
                {type === "feedback" && <MessageSquare className="text-blue-500 text-5xl" />}
                {type === "reject" && <AlertTriangle className="text-red-500 text-5xl" />}
                {type === "edit" && <Edit className="text-purple-500 text-5xl" />}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
              <p className="text-gray-600 mb-6">{message}</p>

              <div className="flex justify-center space-x-3">
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={onClose} className="px-5 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-semibold transition-colors duration-200">
                  {cancelText}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onConfirm}
                  className={`px-5 py-2.5 text-white rounded-lg font-semibold transition-colors duration-200 ${
                    type === "approve" ? "bg-green-600 hover:bg-green-700" : type === "feedback" ? "bg-blue-600 hover:bg-blue-700" : type === "reject" ? "bg-red-600 hover:bg-red-700" : "bg-purple-600 hover:bg-purple-700"
                  }`}
                >
                  {confirmText}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const DetailMonitoringMaintenance: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { user, getMonitoringScheduleById, addMonitoringActivities, hasPermission, approveSchedule, getApprovalTemplates, updateMonitoringActivity } = useAuth();
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
  const [activeTemplate, setActiveTemplate] = useState<ApprovalTemplate | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [scheduleData, setScheduleData] = useState<MonitoringSchedule | null>(null);

  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [modalTitle, setModalTitle] = useState("");
  const [isSuccess, setIsSuccess] = useState(true);

  const [searchTerm, setSearchTerm] = useState<string>("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmAction, setConfirmAction] = useState<{
    type: "approve" | "feedback" | "reject" | "edit";
    step: number;
    title: string;
    message: string;
    feedbackText?: string;
  } | null>(null);

  // Ganti useEffect pertama dengan ini - YANG INI YANG MASIH SALAH
  useEffect(() => {
    const loadData = async () => {
      if (!id) return;

      try {
        setIsLoading(true);
        setError(null);

        const scheduleData = await getMonitoringScheduleById(parseInt(id));
        setScheduleData(scheduleData);

        if (!scheduleData) {
          throw new Error("Data monitoring schedule tidak ditemukan");
        }

        console.log("Schedule data dengan approvals:", scheduleData);

        // SET ACTIVE TEMPLATE DARI RESPONSE - TAMBAHKAN INI
        if (scheduleData.approval_template) {
          setActiveTemplate(scheduleData.approval_template);
          console.log("Active template set in first useEffect:", scheduleData.approval_template);
        }

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

        // Inisialisasi approval status - gunakan template dari response
        const initialApprovalStatus: ApprovalRole = {};

        // GUNAKAN scheduleData.approval_template, BUKAN activeTemplate
        if (scheduleData.approval_template && scheduleData.approval_template.approvers) {
          scheduleData.approval_template.approvers.forEach((approver) => {
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
            actor: approval.approver?.name || `Approver Step ${approval.approval_step}`,
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
          currentApprovalStep: getCurrentApprovalStepFromApprovals(scheduleApprovals, scheduleData.approval_template), // GUNAKAN scheduleData.approval_template
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
      if (!activeTemplate || !activeTemplate.approvers || !user) {
        console.log(`❌ isUserApproverForStep ${step}: Missing data`);
        return false;
      }

      const approver = activeTemplate.approvers.find((approver) => approver.step === step && approver.approver_user_id.toString() === user.id);

      const result = !!approver;

      console.log(`🔍 IS USER APPROVER STEP ${step}:`, {
        step,
        userID: user.id,
        userName: user.name,
        approverUserID: approver?.approver_user_id,
        approverName: approver?.approver.name,
        MATCH: result,
      });

      return result;
    },
    [activeTemplate, user]
  );

  const getCurrentApprovalStep = useCallback((): number => {
    if (!monitoringResults || !activeTemplate?.approvers) {
      console.log("❌ GET CURRENT STEP: No monitoringResults or approvers");
      return 1;
    }

    const sortedApprovers = [...activeTemplate.approvers].sort((a, b) => a.step - b.step);

    console.log("🔍 GET CURRENT STEP - All approvers status:", monitoringResults.approvalStatus);

    // Cari step pertama yang statusnya "Pending"
    for (let i = 0; i < sortedApprovers.length; i++) {
      const approver = sortedApprovers[i];
      const stepKey = `step_${approver.step}`;
      const status = monitoringResults.approvalStatus[stepKey] || "Pending";

      console.log(`🔍 Checking step ${approver.step}:`, {
        stepKey,
        status,
        isPending: status === "Pending",
      });

      if (status === "Pending") {
        console.log(`✅ CURRENT ACTIVE STEP FOUND: ${approver.step}`);
        return approver.step;
      }
    }

    // Jika semua approved, kembalikan step setelah terakhir
    const nextStep = sortedApprovers.length + 1;
    console.log(`✅ ALL STEPS APPROVED, NEXT STEP: ${nextStep}`);
    return nextStep;
  }, [monitoringResults, activeTemplate]);

  // Tambahkan useEffect debug
  useEffect(() => {
    if (monitoringResults && activeTemplate && user) {
      console.log("=== 🎯 DEBUG ACTIONS VISIBILITY ===");
      console.log("User:", { id: user.id, name: user.name });
      console.log("Template:", activeTemplate.name);
      console.log("Is Saved:", monitoringResults.isSaved);

      activeTemplate.approvers?.forEach((approver) => {
        const stepKey = `step_${approver.step}`;
        const status = monitoringResults.approvalStatus[stepKey];
        const shouldShow = calculateShouldShowActionButtons(approver.step, approver, status);

        console.log(`🎯 Step ${approver.step} - ${approver.approver.name}:`, {
          status,
          shouldShowActions: shouldShow,
          isCurrentUser: approver.approver_user_id.toString() === user.id,
          conditions: {
            isCurrentApprover: approver.approver_user_id.toString() === user.id,
            needsAction: status === "Pending",
            isCurrentStep: getCurrentApprovalStep() === approver.step,
            isPreviousStepApproved: approver.step === 1 ? true : monitoringResults.approvalStatus[`step_${approver.step - 1}`] === "Approved",
          },
        });
      });
    }
  }, [monitoringResults, activeTemplate, user]);

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
      setScheduleData(scheduleData);

      if (!scheduleData) {
        throw new Error("Data monitoring schedule tidak ditemukan");
      }

      console.log("Schedule data dengan approvals:", scheduleData);

      // SET ACTIVE TEMPLATE DARI RESPONSE - INI YANG PERLU DIPERBAIKI
      if (scheduleData.approval_template) {
        setActiveTemplate(scheduleData.approval_template);
        console.log("Active template set:", scheduleData.approval_template);
      }

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

      // Gunakan template dari response untuk inisialisasi status
      // Dalam useEffect pertama & loadMachineDetail:
      if (scheduleData.approval_template && scheduleData.approval_template.approvers) {
        scheduleData.approval_template.approvers.forEach((approver) => {
          const stepKey = `step_${approver.step}`;
          const existingApproval = scheduleApprovals.find((approval: ScheduleApproval) => approval.approval_step === approver.step && approval.approver_id === approver.approver_user_id);

          if (existingApproval) {
            // Ada history approval - gunakan status dari history
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
            // TIDAK ADA HISTORY - BERARTI MASIH "Pending"
            initialApprovalStatus[stepKey] = "Pending";
            console.log(`✅ Step ${approver.step} di-set ke Pending (no approval history)`);
          }
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

        const timestamp = approval.approved_at || approval.created_at;

        return {
          type,
          timestamp: timestamp || new Date().toISOString(),
          actor: approval.approver?.name || `Approver Step ${approval.approval_step}`,
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
        currentApprovalStep: getCurrentApprovalStepFromApprovals(scheduleApprovals, scheduleData.approval_template),
      };

      setMonitoringResults(initialResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal memuat data monitoring");
      console.error("Error loading machine detail:", err);
    } finally {
      setIsLoading(false);
    }
  }, [id, getMonitoringScheduleById]);

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

  const handleApprovalWithConfirm = (step: number, action: ApprovalAction, feedbackReason?: string) => {
    let title = "";
    let message = "";
    let type: "approve" | "feedback" | "reject" | "edit" = "approve";

    switch (action) {
      case "Approved":
        title = "Confirm Approval";
        message = `Are you sure you want to approve this monitoring report for step ${step}?`;
        type = "approve";
        break;
      case "FeedbackGiven":
        title = "Confirm Feedback";
        message = `Are you sure you want to send feedback for step ${step}?`;
        type = "feedback";
        break;
      case "Rejected":
        title = "Confirm Rejection";
        message = `Are you sure you want to reject this monitoring report for step ${step}?`;
        type = "reject";
        break;
      case "Edited":
        title = "Confirm Edit";
        message = `Are you sure you want to mark this as edited for step ${step}?`;
        type = "edit";
        break;
    }

    setConfirmAction({
      type,
      step,
      title,
      message,
      feedbackText: feedbackReason,
    });
    setShowConfirmModal(true);
  };

  const handleConfirmAction = async () => {
    if (!confirmAction) return;

    try {
      await handleApproval(confirmAction.step, confirmAction.type === "approve" ? "Approved" : confirmAction.type === "feedback" ? "FeedbackGiven" : confirmAction.type === "reject" ? "Rejected" : "Edited", confirmAction.feedbackText);

      setShowConfirmModal(false);
      setConfirmAction(null);

      await loadMachineDetail();
    } catch (error) {
      console.error("Error during confirmation:", error);
      setShowConfirmModal(false);
      setConfirmAction(null);
    }
  };

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

  // Fungsi untuk mengecek apakah semua step approval template sudah selesai
  const isAllApprovalStepsCompleted = useCallback((): boolean => {
    if (!activeTemplate || !activeTemplate.approvers || !monitoringResults) {
      return false;
    }

    const sortedApprovers = [...activeTemplate.approvers].sort((a, b) => a.step - b.step);

    // Cek apakah semua step memiliki status "Approved"
    const allApproved = sortedApprovers.every((approver) => {
      const stepKey = `step_${approver.step}`;
      const status = monitoringResults.approvalStatus[stepKey];
      return status === "Approved";
    });

    console.log("🔍 CHECK ALL STEPS COMPLETED:", {
      totalSteps: sortedApprovers.length,
      allApproved,
      approvalStatus: monitoringResults.approvalStatus,
    });

    return allApproved;
  }, [activeTemplate, monitoringResults]);

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

  const handleSaveMachineResults = async (itemIdToSave?: number) => {
    // ... (kode awal tetap sama untuk validasi awal)
    if (!machineDetail || !monitoringResults || !id) return;

    setIsSaving(true);
    try {
      let isValid = true;
      const pendingItems: { item: string }[] = [];

      // 📝 Validasi: Periksa hanya item yang akan disimpan (atau semua jika itemIdToSave tidak ada)
      const itemsToValidate = itemIdToSave ? monitoringResults.itemResults.filter((r) => r.itemId === itemIdToSave) : monitoringResults.itemResults;

      itemsToValidate.forEach((itemResult) => {
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

      // 📝 Filter item yang akan diproses: hanya item yang ditentukan atau semua item
      const resultsToSave = itemIdToSave ? monitoringResults.itemResults.filter((r) => r.itemId === itemIdToSave) : monitoringResults.itemResults;

      // Prepare data for backend - INCLUDE id_monitoring_activities
      const activitiesToSave = resultsToSave.map((itemResult) => {
        // Cari activity yang sudah ada berdasarkan id_item_mesin
        const existingActivity = scheduleData?.monitoring_activities?.find((act: any) => act.id_item_mesin === itemResult.itemId);

        const activityData: MonitoringActivityPost = {
          id_monitoring_schedule: parseInt(id),
          id_item_mesin: itemResult.itemId,
          tgl_monitoring: machineDetail.tgl_start || new Date().toISOString().split("T")[0],
          hasil_monitoring: itemResult.result.toString(),
          hasil_keterangan: itemResult.remarks,
          hasil_ms_tms: itemResult.status === "MS" ? "ms" : itemResult.status === "TMS" ? "tms" : "na",
        };

        // Jika ada existing activity, kita akan update
        if (existingActivity && existingActivity.id_monitoring_activity) {
          return {
            id: existingActivity.id_monitoring_activity,
            data: activityData,
          };
        } else {
          // CREATE activity baru jika belum ada
          return {
            id: 0, // 0 menandakan create baru
            data: activityData,
          };
        }
      });

      // ... (Logika pemisahan CREATE dan UPDATE tetap sama)
      console.log("📦 Data yang akan dikirim ke backend:", activitiesToSave);

      // Pisahkan antara CREATE dan UPDATE
      const activitiesToCreate = activitiesToSave.filter((activity) => activity.id === 0);
      const activitiesToUpdate = activitiesToSave.filter((activity) => activity.id > 0);

      console.log("🆕 Activities to CREATE:", activitiesToCreate.length);
      console.log("🔄 Activities to UPDATE:", activitiesToUpdate.length);

      // Handle CREATE operations
      if (activitiesToCreate.length > 0) {
        const createPayload = activitiesToCreate.map((activity) => activity.data);
        console.log("🆕 CREATE new monitoring activities:", createPayload);
        await addMonitoringActivities(createPayload);
      }

      // Handle UPDATE operations
      if (activitiesToUpdate.length > 0) {
        console.log("🔄 UPDATE existing monitoring activities:", activitiesToUpdate);
        await updateMonitoringActivity(activitiesToUpdate);
      }

      // ... (Logika update state lokal tetap sama)
      setMonitoringResults((prevResults) => {
        // ... (logika history dan isSaved tetap sama)
        if (!prevResults) return null;

        const updatedActivityHistory = [...prevResults.activityHistory];
        const timestamp = new Date().toLocaleString();

        // Tentukan jenis aksi berdasarkan isSaved
        // Catatan: isSaved akan berubah menjadi true jika ini adalah submission pertama.
        // Jika Anda hanya menyimpan satu item, isSaved mungkin menjadi true meskipun item lain belum diisi.
        const actionType = prevResults.isSaved ? "edit" : "submission";
        const actionDescription = itemIdToSave
          ? `${currentUserRole.name} ${prevResults.isSaved ? "mengedit" : "mengisi"} hasil monitoring item ${machineDetail.items.find((i) => i.id === itemIdToSave)?.name}`
          : `${currentUserRole.name} ${prevResults.isSaved ? "mengedit" : "mengisi"} semua hasil monitoring.`;

        updatedActivityHistory.push({
          type: actionType,
          timestamp,
          actor: currentUserRole.name,
          description: actionDescription,
        });

        return {
          ...prevResults,
          isSaved: true,
          submissionDate: new Date().toISOString(),
          activityHistory: updatedActivityHistory,
        };
      });

      // ... (Kode untuk loadMachineDetail dan showModal tetap sama)
      // await loadMachineDetail();

      const actionMessage = itemIdToSave
        ? `Hasil monitoring item ${machineDetail.items.find((i) => i.id === itemIdToSave)?.name} berhasil disimpan/diupdate!`
        : monitoringResults.isSaved
        ? `Hasil monitoring untuk ${machineDetail.name} berhasil diupdate!`
        : `Hasil monitoring untuk ${machineDetail.name} berhasil disimpan!`;

      showModal("Success!", actionMessage, true);
    } catch (err) {
      // ... (Penanganan Error tetap sama)
      const actionMessage = monitoringResults.isSaved ? "Gagal mengupdate hasil monitoring. Silakan coba lagi." : "Gagal menyimpan hasil monitoring. Silakan coba lagi.";

      showModal("Error!", actionMessage, false);
      console.error("Error saving monitoring results:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const calculateShouldShowActionButtons = (step: number, approver: Approver, currentStatus: string | undefined): boolean => {
    if (!user || !monitoringResults?.isSaved) {
      console.log(`❌ Button step ${step}: User atau monitoringResults tidak siap`, {
        user: !!user,
        monitoringResults: !!monitoringResults,
        isSaved: monitoringResults?.isSaved,
      });
      return false;
    }

    // 1. Cek apakah user adalah approver untuk step ini
    const isCurrentApprover = approver.approver_user_id.toString() === user.id;

    // 2. Cek apakah status masih "Pending" (butuh action)
    const needsAction = currentStatus === "Pending";

    // 3. Cek apakah ini step yang sedang aktif
    const currentStep = getCurrentApprovalStep();
    const isCurrentStep = currentStep === step;

    // 4. Untuk step 1, selalu eligible (tidak ada step sebelumnya)
    let isPreviousStepApproved = true;
    if (step > 1) {
      const previousStepKey = `step_${step - 1}`;
      const previousStepStatus = monitoringResults.approvalStatus[previousStepKey];
      isPreviousStepApproved = previousStepStatus === "Approved";
    }

    const result = isCurrentApprover && needsAction && isCurrentStep && isPreviousStepApproved;

    console.log(`🎯 CALCULATE BUTTON STEP ${step}:`, {
      step,
      isCurrentApprover,
      needsAction,
      isCurrentStep,
      isPreviousStepApproved,
      currentStatus,
      currentStep,
      userID: user.id,
      approverID: approver.approver_user_id,
      userPosition: user.position,
      approverPosition: approver.approver.position,
      FINAL_RESULT: result,
    });

    return result;
  };

  // Fungsi terpisah untuk handle edit oleh approver step 1
  // Fungsi terpisah untuk handle edit oleh approver step 1
  const handleEditByApprover = async (step: number) => {
    if (!monitoringResults || !id || step !== 1) return;

    if (isAllApprovalStepsCompleted()) {
      showModal("Info", "Tidak dapat mengedit karena semua step approval sudah selesai.", false);
      return;
    }

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

      await loadMachineDetail();

      showModal("Success!", "Berhasil menyimpan perubahan dan menandai sebagai edited oleh Approver Step 1.", true);
    } catch (error) {
      console.error("Error during edit by approver:", error);
      showModal("Error!", "Gagal menyimpan perubahan. Silakan coba lagi.", false);
    }
  };

  const handleEditWithConfirm = (step: number) => {
    setConfirmAction({
      type: "edit",
      step,
      title: "Confirm Edit",
      message: "Are you sure you want to save and mark this monitoring as edited? This action cannot be undone.",
    });
    setShowConfirmModal(true);
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

  // Tambahkan useMemo ini untuk mendeteksi technician
  const isTechnicianUser = useMemo(() => {
    return currentUserRole.name.toLowerCase().includes("technician") && !isUserApproverForStep(1); // Pastikan bukan approver step 1
  }, [currentUserRole, isUserApproverForStep]);

  const isStep1Approver = isUserApproverForStep(1);

  // Hanya approver step 1 yang bisa mengedit hasil monitoring, dan hanya jika belum semua step selesai
  const isEditable = useMemo(() => {
    if (!monitoringResults?.isSaved) return true;

    const step1Status = monitoringResults.approvalStatus["step_1"];

    // Simple rule: Jika step 1 masih Pending, semua orang kecuali approver step 2+ bisa edit
    if (step1Status === "Pending") {
      return true; // Sementara izinkan semua orang edit selama step 1 pending
    }

    // Setelah step 1 diproses, hanya approver step 1 yang bisa edit
    return isUserApproverForStep(1) && !isAllApprovalStepsCompleted();
  }, [monitoringResults?.isSaved, monitoringResults?.approvalStatus, isUserApproverForStep, isAllApprovalStepsCompleted]);

  // User adalah approver untuk step yang sedang aktif
  const isCurrentApprover = isUserApproverForStep(getCurrentApprovalStep());

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

  const filteredMachineItems = useMemo(() => {
    // Pastikan machineDetail dan items sudah terisi
    if (!machineDetail || !machineDetail.items) {
      return [];
    }

    const query = searchTerm.toLowerCase().trim();

    if (!query) {
      // Jika kolom pencarian kosong, tampilkan semua item
      return machineDetail.items;
    }

    // Filter array items di dalam machineDetail
    return machineDetail.items.filter((item) => {
      // Hanya mencari berdasarkan item.name (item_mesin)
      return item.name.toLowerCase().includes(query);
    });
  }, [machineDetail, searchTerm]); // Dependensi: machineDetail dan searchTerm

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
                {activeTemplate && activeTemplate.approvers && activeTemplate.approvers.length > 0 ? (
                  <p>
                    Template: <span className="font-semibold">{activeTemplate.name}</span>
                    {activeTemplate.is_active && <span className="ml-1 text-green-600">(Aktif)</span>}
                    {isAllApprovalStepsCompleted() && <span className="ml-2 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">All Steps Completed</span>}
                  </p>
                ) : (
                  <p>
                    Template: <span className="font-semibold text-yellow-600">Tidak ada template</span>
                  </p>
                )}
                {activeTemplate && isStep1Approver && (
                  <p className={`font-semibold ${isAllApprovalStepsCompleted() ? "text-gray-500" : "text-blue-600"}`}>
                    {isAllApprovalStepsCompleted() ? "(Semua step approval selesai - tidak dapat edit)" : "(Anda adalah Approver Step 1 - Dapat mengedit)"}
                  </p>
                )}
                {activeTemplate && isCurrentApprover && !isStep1Approver && <p className="text-green-600 font-semibold">(Anda adalah approver untuk step {getCurrentApprovalStep()})</p>}
              </div>
            </div>
          </motion.div>

          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.2 }} className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Cari item monitoring berdasarkan nama..."
                  value={searchTerm} // ⬅️ Gunakan state searchTerm
                  onChange={(e) => setSearchTerm(e.target.value)} // ⬅️ Update state
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </div>

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
                      {/* 🆕 KOLOM BARU UNTUK AKSI */}
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredMachineItems.map((item) => {
                      const currentResult = monitoringResults.itemResults.find((i) => i.itemId === item.id);
                      const inputType = getInputType(item);

                      const isItemReadyToSave = currentResult && currentResult.result !== "" && currentResult.status !== "Pending";

                      const isStep1ActionTaken = monitoringResults?.approvalStatus?.step_1 && monitoringResults.approvalStatus.step_1 !== "Pending";

                      const isItemDisabled =
                        !isEditable ||
                        isSaving ||
                        !isItemReadyToSave || // Tambahan validasi item
                        (isStep1Approver && isAllApprovalStepsCompleted());

                      const approverCompletedText = "All Steps Completed";

                      const globalDisabledCondition = !isEditable || isStep1ActionTaken;

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
                                disabled={globalDisabledCondition}
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
                                disabled={globalDisabledCondition}
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
                              disabled={globalDisabledCondition}
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
                              placeholder="Tambahkan catatan..."
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm relative">
                            <motion.button
                             
                              whileHover={{ scale: isEditable ? 1.05 : 1 }}
                              whileTap={{ scale: isEditable ? 0.95 : 1 }}                   
                              onClick={
                                isStep1Approver ? () => handleEditByApprover(1) : () => handleSaveMachineResults(item.id) 
                              }
                              disabled={!isEditable || isSaving || isStep1ActionTaken || (isStep1Approver && isAllApprovalStepsCompleted())}
                              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center disabled:opacity-50 disabled:cursor-not-allowed relative group"
                            >
                              {isSaving ? (
                                <>
                                  <Hourglass className="animate-spin mr-1 h-4 w-4" />
                                  Saving...
                                </>
                              ) : (
                                <>
                                  <Save className="mr-1 h-4 w-4" />
                                  {isStep1Approver ? (isAllApprovalStepsCompleted() ? approverCompletedText : "Save & Edit") : "Simpan Item"}
                                </>
                              )}
                            </motion.button>

                            {isStep1Approver && isAllApprovalStepsCompleted() && (
                              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-gray-800 text-white text-xs rounded py-1 px-2 whitespace-nowrap z-10">Semua step approval sudah selesai. Tidak dapat melakukan edit.</div>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {filteredMachineItems.length === 0 && searchTerm && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Tidak ada item mesin yang cocok dengan kata kunci "{searchTerm}".
                        </td>
                      </tr>
                    )}
                    {filteredMachineItems.length === 0 && !searchTerm && (
                      <tr>
                        <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                          Tidak ada data item monitoring yang tersedia.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
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

                      {!activeTemplate || !activeTemplate.approvers || activeTemplate.approvers.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                          <Info className="mx-auto h-12 w-12 mb-4 text-gray-400" />
                          <p>Tidak ada template approval yang aktif untuk schedule ini.</p>
                          <p className="text-sm mt-2">Silakan hubungi administrator untuk mengatur template approval.</p>
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
                                  {shouldShowActionButtons && (
                                    <div className="flex space-x-2 mt-3">
                                      <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleApprovalWithConfirm(approver.step, "Approved")}
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
                                        onClick={() => handleApprovalWithConfirm(approver.step, "FeedbackGiven", feedbackState[stepKey]?.text)}
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

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => {
          setShowConfirmModal(false);
          setConfirmAction(null);
        }}
        onConfirm={handleConfirmAction}
        title={confirmAction?.title || "Confirm Action"}
        message={confirmAction?.message || "Are you sure you want to proceed?"}
        confirmText={confirmAction?.type === "approve" ? "Approve" : confirmAction?.type === "feedback" ? "Send Feedback" : confirmAction?.type === "reject" ? "Reject" : confirmAction?.type === "edit" ? "Save & Mark as Edited" : "Confirm"}
        type={confirmAction?.type}
      />

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
