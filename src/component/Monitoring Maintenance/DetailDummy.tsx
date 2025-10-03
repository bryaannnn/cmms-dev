import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar,
  Wrench,
  ChevronDown,
  CheckCircle,
  XCircle,
  Save,
  Info,
  MessageSquare,
  Clock,
  UserCog,
  Plus,
  ArrowLeft,
  Hourglass,
  X,
  History, // Menggunakan ikon untuk riwayat
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

interface MonitoringItem {
  id: number;
  name: string;
  uom: string;
  min?: number;
  max?: number;
  visual?: string;
}

interface MachineDetail {
  id: string;
  name: string;
  interval: string;
  period: string;
  items: MonitoringItem[];
}

interface ItemResult {
  itemId: number;
  result: string | number;
  status: "MS" | "TMS" | "N/A" | "Pending";
  remarks: string;
}

type ApprovalRoleKeys = "unitHeadEngineering" | "unitHeadProcess" | "sectionHeadEngineering" | "sectionHeadProcess";

interface ApprovalRole {
  unitHeadEngineering: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited";
  unitHeadProcess: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited";
  sectionHeadEngineering: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited";
  sectionHeadProcess: "Pending" | "Approved" | "Rejected" | "FeedbackGiven" | "Edited";
}

type UserRoleType = "unitHeadEngineering" | "admin" | "technician" | ApprovalRoleKeys;

interface CommentEntry {
  id: string;
  role: UserRoleType;
  comment: string;
  timestamp: string;
  replies?: CommentEntry[];
  parentId?: string | null;
}

interface ActivityLogEntry {
  type: "submission" | "approval" | "rejection" | "feedback" | "edit";
  timestamp: string;
  actor: UserRoleType;
  description: string;
  details?: string;
}

interface MachineResults {
  machineId: string;
  itemResults: ItemResult[];
  approvalStatus: ApprovalRole;
  commentsHistory: CommentEntry[];
  activityHistory: ActivityLogEntry[]; // Menambahkan riwayat aktivitas
  isSaved: boolean;
  submissionDate?: string;
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

// DUMMY DATA FOR A SINGLE MACHINE
const DUMMY_MACHINE_DETAIL: MachineDetail = {
  id: "MACH-A01",
  name: "Mesin A01 (Produksi) - Unit WY01",
  interval: "Weekly",
  period: "01 Sep 2025 - 07 Sep 2025",
  items: [
    { id: 101, name: "Oil Level", uom: "Level", visual: "Normal" },
    { id: 102, name: "Belt Tension", uom: "Kekencangan", visual: "Baik" },
    { id: 103, name: "Temperature", uom: "°C", min: 20, max: 40 },
    { id: 104, name: "Pressure", uom: "Bar", min: 1.5, max: 3.0 },
    { id: 105, name: "Motor Sound", uom: "Visual", visual: "Tidak ada suara aneh" },
    { id: 106, name: "Vibration", uom: "mm/s", min: 0.1, max: 1.0 },
    { id: 107, name: "pH Level", uom: "pH", min: 6.0, max: 8.0 },
    { id: 108, name: "Filter Condition", uom: "Visual", visual: "Bersih" },
  ],
};

let DUMMY_USER_ROLE: UserRoleType = "technician";
// Dummy dynamic approval flow. In a real app, this would be fetched from a global state or API.
const DUMMY_APPROVAL_FLOW_ORDER: ApprovalRoleKeys[] = ["unitHeadEngineering", "unitHeadProcess", "sectionHeadEngineering", "sectionHeadProcess"];

interface CommentItemProps {
  comment: CommentEntry;
  machineId: string;
  currentUserRole: UserRoleType;
  onAddCommentOrReply: (machineId: string, role: UserRoleType, commentText: string, parentId: string | null) => void;
  depth: number;
}

const CommentItem: React.FC<CommentItemProps> = ({ comment, machineId, currentUserRole, onAddCommentOrReply, depth }) => {
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [replyText, setReplyText] = useState("");

  const handlePostReply = () => {
    if (replyText.trim()) {
      onAddCommentOrReply(machineId, currentUserRole, replyText, comment.id);
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
              placeholder={`Balas sebagai ${currentUserRole.replace(/([A-Z])/g, " $1").replace(/^./, (str: string) => str.toUpperCase())}...`}
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

const DetailDummy: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const singleMachine: MachineDetail | null = (location.state as { machine: MachineDetail })?.machine || DUMMY_MACHINE_DETAIL;

  const [monitoringResults, setMonitoringResults] = useState<MachineResults | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<"approval" | "history">("approval"); // State untuk tab
  const [feedbackState, setFeedbackState] = useState<Record<ApprovalRoleKeys, { showInput: boolean; text: string }>>({
    unitHeadEngineering: { showInput: false, text: "" },
    unitHeadProcess: { showInput: false, text: "" },
    sectionHeadEngineering: { showInput: false, text: "" },
    sectionHeadProcess: { showInput: false, text: "" },
  });

  useEffect(() => {
    if (singleMachine) {
      const initialResults: MachineResults = {
        machineId: singleMachine.id,
        itemResults: singleMachine.items.map((item) => ({
          itemId: item.id,
          result: "",
          status: "Pending",
          remarks: "",
        })),
        approvalStatus: {
          unitHeadEngineering: "Pending",
          unitHeadProcess: "Pending",
          sectionHeadEngineering: "Pending",
          sectionHeadProcess: "Pending",
        },
        commentsHistory: [],
        activityHistory: [], // Inisialisasi riwayat aktivitas
        isSaved: false,
      };
      setMonitoringResults(initialResults);
    }
  }, [singleMachine]);

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

  const getRoleName = (role: UserRoleType): string => {
    const roleMap: { [key in UserRoleType]: string } = {
      admin: "Admin",
      technician: "Teknisi",
      unitHeadEngineering: "Unit Head Engineering",
      unitHeadProcess: "Unit Head Process",
      sectionHeadEngineering: "Section Head Engineering",
      sectionHeadProcess: "Section Head Process",
    };
    return roleMap[role] || role;
  };

  const handleAddCommentOrReply = useCallback((machineId: string, role: UserRoleType, commentText: string, parentId: string | null = null) => {
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

  const handleApproval = (role: ApprovalRoleKeys, action: "Approved" | "Rejected" | "FeedbackGiven", feedbackReason?: string) => {
    if (!monitoringResults) return;

    setMonitoringResults((prevResults) => {
      if (!prevResults) return null;
      let updatedCommentsHistory = prevResults.commentsHistory || [];
      let updatedActivityHistory = [...prevResults.activityHistory];
      const timestamp = new Date().toLocaleString();

      if ((action === "FeedbackGiven" || action === "Rejected") && feedbackReason) {
        const newComment: CommentEntry = {
          id: crypto.randomUUID(),
          role,
          comment: feedbackReason,
          timestamp,
          replies: [],
          parentId: null,
        };
        updatedCommentsHistory = [...updatedCommentsHistory, newComment];

        const activityDescription = action === "FeedbackGiven" ? "Memberi feedback." : "Menolak laporan.";
        updatedActivityHistory.push({
          type: action === "FeedbackGiven" ? "feedback" : "rejection",
          timestamp,
          actor: role,
          description: `${getRoleName(role)} ${activityDescription}`,
          details: feedbackReason,
        });
      } else if (action === "Approved") {
        updatedCommentsHistory = updatedCommentsHistory.filter((c) => !(c.role === role && (c.parentId === null || c.parentId === undefined))) || [];

        updatedActivityHistory.push({
          type: "approval",
          timestamp,
          actor: role,
          description: `${getRoleName(role)} menyetujui laporan.`,
        });
      }

      const updatedMachine = {
        ...prevResults,
        approvalStatus: {
          ...prevResults.approvalStatus,
          [role]: action,
        },
        commentsHistory: updatedCommentsHistory,
        activityHistory: updatedActivityHistory,
      };

      return updatedMachine;
    });

    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[typedRole]) {
        newFeedbackState[typedRole] = { showInput: false, text: "" };
      }
      return newFeedbackState;
    });
  };

  const toggleFeedbackInput = (role: ApprovalRoleKeys) => {
    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[typedRole]) {
        newFeedbackState[typedRole] = {
          ...newFeedbackState[typedRole],
          showInput: !newFeedbackState[typedRole].showInput,
        };
      }
      return newFeedbackState;
    });
  };

  const updateFeedbackText = (role: ApprovalRoleKeys, text: string) => {
    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[typedRole]) {
        newFeedbackState[typedRole] = {
          ...newFeedbackState[typedRole],
          text: text,
        };
      }
      return newFeedbackState;
    });
  };

  const handleSaveMachineResults = () => {
    if (!singleMachine || !monitoringResults) return;
    setIsSaving(true);
    let isValid = true;
    const pendingItems: { item: string }[] = [];

    monitoringResults.itemResults.forEach((itemResult) => {
      const originalItem = singleMachine.items.find((i) => i.id === itemResult.itemId);
      if (originalItem && (itemResult.result === "" || itemResult.status === "Pending")) {
        isValid = false;
        pendingItems.push({ item: originalItem.name });
      }
    });

    if (isValid) {
      setMonitoringResults((prevResults) => {
        if (!prevResults) return null;
        let updatedApprovalStatus = { ...prevResults.approvalStatus };
        let updatedCommentsHistory = prevResults.commentsHistory || [];
        let updatedActivityHistory = [...prevResults.activityHistory];
        const timestamp = new Date().toLocaleString();
        const firstApproverRole = DUMMY_APPROVAL_FLOW_ORDER[0];

        if (DUMMY_USER_ROLE === "technician") {
          updatedApprovalStatus = {
            ...updatedApprovalStatus,
            [firstApproverRole]: "Pending",
          };
          updatedActivityHistory.push({
            type: "submission",
            timestamp,
            actor: DUMMY_USER_ROLE,
            description: `${getRoleName(DUMMY_USER_ROLE)} mengisi dan mengajukan laporan.`,
          });
        } else if (DUMMY_USER_ROLE === "admin") {
          updatedApprovalStatus = {
            ...updatedApprovalStatus,
            [firstApproverRole]: "Edited",
          };
          updatedCommentsHistory.push({
            id: crypto.randomUUID(),
            role: DUMMY_USER_ROLE,
            comment: `Data diedit oleh ${getRoleName(DUMMY_USER_ROLE)}.`,
            timestamp,
            replies: [],
            parentId: null,
          });
          updatedActivityHistory.push({
            type: "edit",
            timestamp,
            actor: DUMMY_USER_ROLE,
            description: `${getRoleName(DUMMY_USER_ROLE)} mengedit dan mengajukan laporan.`,
          });
        }

        return {
          ...prevResults,
          isSaved: true,
          submissionDate: new Date().toISOString(),
          approvalStatus: updatedApprovalStatus,
          commentsHistory: updatedCommentsHistory,
          activityHistory: updatedActivityHistory,
        };
      });
      alert(`Hasil monitoring untuk ${singleMachine.name} berhasil disimpan!`);
    } else {
      alert(`Harap isi semua hasil monitoring yang diperlukan untuk ${singleMachine.name}. Item yang belum diisi: ` + pendingItems.map((p) => p.item).join(", "));
    }
    setIsSaving(false);
  };

  const calculateShouldShowActionButtons = (
    currentUserRole: UserRoleType,
    currentTypedRole: ApprovalRoleKeys,
    currentStatus: string | undefined,
    currentMachineApprovalStatus: ApprovalRole | undefined,
    approvalFlowOrder: ApprovalRoleKeys[],
    isSaved: boolean
  ): boolean => {
    if (currentUserRole === "technician") {
      return false;
    }

    if (currentUserRole === "admin" && isSaved && (currentStatus === "Pending" || currentStatus === "FeedbackGiven" || currentStatus === "Rejected")) {
      return true;
    }

    if (currentUserRole !== currentTypedRole) {
      return false;
    }

    const isThisRolePendingOrNeedsAction = isSaved && (currentStatus === "Pending" || currentStatus === "FeedbackGiven" || currentStatus === "Rejected");
    if (!isThisRolePendingOrNeedsAction) {
      return false;
    }

    const currentRoleIndex = approvalFlowOrder.indexOf(currentTypedRole);
    if (currentRoleIndex === -1) {
      return false;
    }

    for (let i = 0; i < currentRoleIndex; i++) {
      const prevRoleInFlow = approvalFlowOrder[i];
      if (currentMachineApprovalStatus?.[prevRoleInFlow] !== "Approved") {
        return false;
      }
    }

    return true;
  };

  const groupedComments = useMemo(() => {
    if (!monitoringResults?.commentsHistory)
      return {
        unitHeadEngineering: [],
        unitHeadProcess: [],
        sectionHeadEngineering: [],
        sectionHeadProcess: [],
      };

    const buildTree = (comments: CommentEntry[], parentId: string | null = null): CommentEntry[] => {
      return comments
        .filter((comment: CommentEntry) => comment.parentId === parentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((comment) => ({
          ...comment,
          replies: buildTree(comments, comment.id),
        }));
    };

    const commentsByRole: Record<ApprovalRoleKeys, CommentEntry[]> = {
      unitHeadEngineering: [],
      unitHeadProcess: [],
      sectionHeadEngineering: [],
      sectionHeadProcess: [],
    };

    DUMMY_APPROVAL_FLOW_ORDER.forEach((role) => {
      const commentsForRole = monitoringResults.commentsHistory.filter((c: CommentEntry) => c.role === role);
      commentsByRole[role] = buildTree(commentsForRole);
    });
    return commentsByRole;
  }, [monitoringResults?.commentsHistory]);

  if (!singleMachine || !monitoringResults) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <p className="text-gray-600">Loading machine details...</p>
      </div>
    );
  }

  const isEditable = !monitoringResults.isSaved && ((DUMMY_USER_ROLE as string) === "technician" || (DUMMY_USER_ROLE as string) === "admin");

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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detail Monitoring & Maintenance</h1>
              <p className="text-gray-600 mt-1">
                Machine: <span className="font-semibold text-gray-800">{singleMachine.name}</span>
              </p>
              <p className="text-gray-600 mt-1">
                Interval: <span className="font-semibold text-gray-800">{singleMachine.interval}</span>
              </p>
              <p className="text-gray-600 mt-1">
                Periode: <span className="font-semibold text-gray-800">{singleMachine.period}</span>
              </p>
              <div className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
                <p>
                  <span className="font-semibold">{singleMachine.items.length}</span> Items
                </p>
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
                    {singleMachine.items.map((item) => {
                      const currentResult = monitoringResults.itemResults.find((i) => i.itemId === item.id);
                      return (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.visual ? `${item.visual} (${item.uom})` : `${item.min} - ${item.max} ${item.uom}`}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.uom === "Visual" || item.uom === "Level" || item.uom === "Kekencangan" ? (
                              <select
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
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
                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm disabled:bg-gray-50 disabled:cursor-not-allowed"
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
                  onClick={handleSaveMachineResults}
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
                      Save Monitoring
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
                    <motion.div key="approval-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(monitoringResults.approvalStatus).map(([roleKey, status]) => {
                        const typedRole = roleKey as ApprovalRoleKeys;
                        const shouldShowActionButtons = calculateShouldShowActionButtons(DUMMY_USER_ROLE, typedRole, status, monitoringResults.approvalStatus, DUMMY_APPROVAL_FLOW_ORDER, monitoringResults.isSaved);
                        const commentsForThisRole = groupedComments[typedRole] || [];

                        return (
                          <div key={roleKey} className="p-3 rounded-lg border border-gray-200">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium text-gray-700">{getRoleName(typedRole)}</span>
                              <div className="flex items-center space-x-2">
                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getApprovalStatusColors(status)}`}>{status === "Edited" ? `Edited by ${getRoleName(typedRole)}` : status}</span>
                                {shouldShowActionButtons && (
                                  <div className="flex space-x-1">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleApproval(roleKey as ApprovalRoleKeys, "Approved")}
                                      className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                    >
                                      <CheckCircle size={20} />
                                    </motion.button>
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => toggleFeedbackInput(roleKey as ApprovalRoleKeys)}
                                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                    >
                                      <MessageSquare size={20} />
                                    </motion.button>
                                  </div>
                                )}
                              </div>
                            </div>

                            <AnimatePresence>
                              {feedbackState[typedRole]?.showInput && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: "auto" }}
                                  exit={{ opacity: 0, height: 0 }}
                                  transition={{ duration: 0.2 }}
                                  className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200"
                                >
                                  <h5 className="text-sm font-semibold text-gray-800 mb-2">Alasan untuk Feedback ({getRoleName(typedRole)})</h5>
                                  <textarea
                                    rows={2}
                                    value={feedbackState[typedRole]?.text}
                                    onChange={(e) => updateFeedbackText(typedRole, e.target.value)}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                                    placeholder="Tulis alasan feedback atau penolakan..."
                                  ></textarea>
                                  <div className="flex justify-end space-x-2 mt-2">
                                    <motion.button
                                      whileHover={{ scale: 1.05 }}
                                      whileTap={{ scale: 0.95 }}
                                      onClick={() => handleApproval(typedRole, "FeedbackGiven", feedbackState[typedRole].text)}
                                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
                                    >
                                      Kirim Feedback
                                    </motion.button>
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>

                            <div className="mt-4">
                              {commentsForThisRole.length > 0 ? (
                                commentsForThisRole.map((comment) => <CommentItem key={comment.id} comment={comment} machineId={singleMachine.id} currentUserRole={DUMMY_USER_ROLE} onAddCommentOrReply={handleAddCommentOrReply} depth={0} />)
                              ) : (
                                <p className="text-gray-500 text-sm">Belum ada komentar.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  </AnimatePresence>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div key="history-tab" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.2 }} className="space-y-4">
                      {monitoringResults.activityHistory.length > 0 ? (
                        monitoringResults.activityHistory.map((activity, index) => (
                          <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 shadow-sm"
                          >
                            <div className="mt-1 flex-shrink-0">
                              <History size={20} className="text-blue-500" />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm font-semibold text-gray-800">{activity.description}</p>
                              <p className="text-xs text-gray-500 mt-1">
                                <span className="font-medium text-gray-600">Oleh: {getRoleName(activity.actor)}</span> - {activity.timestamp}
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
    </div>
  );
};

export default DetailDummy;
