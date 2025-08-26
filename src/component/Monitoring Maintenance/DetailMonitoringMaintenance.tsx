import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, Wrench, ChevronDown, CheckCircle, XCircle, Save, Info, MessageSquare, Clock, UserCog, Plus, ArrowLeft, Hourglass } from "lucide-react";
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
  items: MonitoringItem[];
}

interface UnitDetail {
  id: string;
  name: string;
  machines: MachineDetail[];
}

interface WeeklySchedule {
  period: string;
  units: UnitDetail[];
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

interface MachineResults {
  machineId: string;
  itemResults: ItemResult[];
  approvalStatus: ApprovalRole;
  commentsHistory: CommentEntry[];
  isSaved: boolean;
  submissionDate?: string;
}

interface UnitResults {
  unitId: string;
  machineResults: MachineResults[];
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
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>,
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <XCircle size={24} />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

const DUMMY_SCHEDULE: WeeklySchedule = {
  period: "12 - 18 Agustus 2024",
  units: [
    {
      id: "UNIT-WY01",
      name: "Unit WY01",
      machines: [
        {
          id: "MACH-A01",
          name: "Mesin A01 (Produksi)",
          items: [
            { id: 101, name: "Oil Level", uom: "Level", visual: "Normal" },
            { id: 102, name: "Belt Tension", uom: "Kekencangan", visual: "Baik" },
            { id: 103, name: "Temperature", uom: "°C", min: 20, max: 40 },
            { id: 104, name: "Pressure", uom: "Bar", min: 1.5, max: 3.0 },
          ],
        },
        {
          id: "MACH-A02",
          name: "Mesin A02 (Packaging)",
          items: [
            { id: 201, name: "Motor Sound", uom: "Visual", visual: "Tidak ada suara aneh" },
            { id: 202, name: "Vibration", uom: "mm/s", min: 0.1, max: 1.0 },
          ],
        },
      ],
    },
    {
      id: "UNIT-WY02",
      name: "Unit WY02",
      machines: [
        {
          id: "MACH-B01",
          name: "Mesin B01 (Quality Control)",
          items: [
            { id: 301, name: "pH Level", uom: "pH", min: 6.0, max: 8.0 },
            { id: 302, name: "Filter Condition", uom: "Visual", visual: "Bersih" },
          ],
        },
      ],
    },
  ],
};

let DUMMY_USER_ROLE: UserRoleType = "admin"; // Diubah menjadi 'let' untuk fleksibilitas

const DEFAULT_APPROVAL_FLOW_ORDER: ApprovalRoleKeys[] = ["unitHeadEngineering", "unitHeadProcess", "sectionHeadEngineering", "sectionHeadProcess"];

interface ConfigurableApprovalStep {
  order: number;
  role: ApprovalRoleKeys;
  assignee: string;
}

interface CommentItemProps {
  comment: CommentEntry;
  machineId: string;
  currentUserRole: UserRoleType;
  onAddCommentOrReply: (machineId: string, role: UserRoleType, commentText: string, parentId?: string | null) => void;
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

interface CommentSectionProps {
  machineId: string;
  commentsHistory: CommentEntry[];
  currentUserRole: UserRoleType;
  onAddCommentOrReply: (machineId: string, role: UserRoleType, commentText: string, parentId?: string | null) => void;
}

const CommentSection: React.FC<CommentSectionProps> = ({ machineId, commentsHistory, currentUserRole, onAddCommentOrReply }) => {
  const [newCommentText, setNewCommentText] = useState("");

  const handlePostTopLevelComment = () => {
    if (newCommentText.trim()) {
      onAddCommentOrReply(machineId, currentUserRole, newCommentText, null);
      setNewCommentText("");
    }
  };

  const sortedComments = useMemo(() => {
    if (!commentsHistory) return [];
    const topLevelComments = commentsHistory.filter((c) => c.parentId === null || c.parentId === undefined);
    topLevelComments.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());

    const buildTree = (comments: CommentEntry[], parentId: string | null = null): CommentEntry[] => {
      return comments
        .filter((comment) => comment.parentId === parentId)
        .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        .map((comment) => ({
          ...comment,
          replies: buildTree(comments, comment.id),
        }));
    };

    return buildTree(commentsHistory);
  }, [commentsHistory]);

  return (
    <div className="mt-8 pt-6 border-t border-gray-200">
      <h4 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <MessageSquare className="mr-2 text-gray-600" size={20} />
        Komentar
      </h4>
      <div className="mt-6 space-y-4">
        {sortedComments.length > 0 ? (
          sortedComments.map((comment) => <CommentItem key={comment.id} comment={comment} machineId={machineId} currentUserRole={currentUserRole} onAddCommentOrReply={onAddCommentOrReply} depth={0} />)
        ) : (
          <p className="text-gray-500 text-sm">Belum ada komentar.</p>
        )}
      </div>
    </div>
  );
};

const DetailMonitoringMaintenance: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const initialSchedule = (location.state as { schedule: WeeklySchedule })?.schedule || DUMMY_SCHEDULE;

  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [expandedMachines, setExpandedMachines] = useState<string[]>([]);
  const [monitoringResults, setMonitoringResults] = useState<UnitResults[]>([]);
  const [allMachinesMonitoringSaved, setAllMachinesMonitoringSaved] = useState<boolean>(false);
  const [isApprovalFlowConfigured, setIsApprovalFlowConfigured] = useState<boolean>(false);
  const [feedbackState, setFeedbackState] = useState<Record<string, Record<ApprovalRoleKeys, { showInput: boolean; text: string }>>>({});
  const [customApprovalFlow, setCustomApprovalFlow] = useState<ConfigurableApprovalStep[]>(() => DEFAULT_APPROVAL_FLOW_ORDER.map((role, index) => ({ order: index + 1, role, assignee: "" })));
  const [showApprovalConfigModal, setShowApprovalConfigModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { record } = location.state || {};

  const ALL_APPROVAL_ROLES: { key: ApprovalRoleKeys; name: string }[] = [
    { key: "unitHeadEngineering", name: "Unit Head Engineering" },
    { key: "unitHeadProcess", name: "Unit Head Process" },
    { key: "sectionHeadEngineering", name: "Section Head Engineering" },
    { key: "sectionHeadProcess", name: "Section Head Process" },
  ];

  const DUMMY_USERS = ["John Doe", "Jane Smith", "Peter Jones", "Alice Brown", "Bob White"];

  useEffect(() => {
    const initialResults: UnitResults[] = initialSchedule.units.map((unit) => ({
      unitId: unit.id,
      machineResults: unit.machines.map((machine) => ({
        machineId: machine.id,
        itemResults: machine.items.map((item) => ({
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
        isSaved: false,
      })),
    }));
    setMonitoringResults(initialResults);

    const initialFeedbackState: Record<string, Record<ApprovalRoleKeys, { showInput: boolean; text: string }>> = {};
    initialSchedule.units.forEach((unit) => {
      unit.machines.forEach((machine) => {
        initialFeedbackState[machine.id] = {
          unitHeadEngineering: { showInput: false, text: "" },
          unitHeadProcess: { showInput: false, text: "" },
          sectionHeadEngineering: { showInput: false, text: "" },
          sectionHeadProcess: { showInput: false, text: "" },
        };
      });
    });
    setFeedbackState(initialFeedbackState);

    if (initialSchedule.units.length > 0) {
      setExpandedUnits([initialSchedule.units[0].id]);
      if (initialSchedule.units[0].machines.length > 0) {
        setExpandedMachines([initialSchedule.units[0].machines[0].id]);
      }
    }
  }, [initialSchedule]);

  const toggleUnit = (unitId: string) => {
    setExpandedUnits((prev) => (prev.includes(unitId) ? prev.filter((id) => id !== unitId) : [...prev, unitId]));
  };

  const toggleMachine = (machineId: string) => {
    setExpandedMachines((prev) => (prev.includes(machineId) ? prev.filter((id) => id !== machineId) : [...prev, machineId]));
  };

  const handleResultChange = (unitId: string, machineId: string, itemId: number, value: string | number, itemType: "numeric" | "visual", min?: number, max?: number) => {
    setMonitoringResults((prevResults) =>
      prevResults.map((unit) =>
        unit.unitId === unitId
          ? {
              ...unit,
              machineResults: unit.machineResults.map((machine) =>
                machine.machineId === machineId
                  ? {
                      ...machine,
                      itemResults: machine.itemResults.map((item) =>
                        item.itemId === itemId
                          ? {
                              ...item,
                              result: value,
                              status: itemType === "numeric" ? determineNumericStatus(Number(value), min, max) : value === "N/A" ? "N/A" : value === "Keras" ? "TMS" : "MS",
                            }
                          : item
                      ),
                    }
                  : machine
              ),
            }
          : unit
      )
    );
  };

  const handleRemarksChange = (unitId: string, machineId: string, itemId: number, value: string) => {
    setMonitoringResults((prevResults) =>
      prevResults.map((unit) =>
        unit.unitId === unitId
          ? {
              ...unit,
              machineResults: unit.machineResults.map((machine) =>
                machine.machineId === machineId
                  ? {
                      ...machine,
                      itemResults: machine.itemResults.map((item) => (item.itemId === itemId ? { ...item, remarks: value } : item)),
                    }
                  : machine
              ),
            }
          : unit
      )
    );
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
    setMonitoringResults((prevResults) =>
      prevResults.map((unit) => ({
        ...unit,
        machineResults: unit.machineResults.map((machine) => {
          if (machine.machineId === machineId) {
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

            const currentCommentsHistory = machine.commentsHistory || [];
            return {
              ...machine,
              commentsHistory: addRecursive(currentCommentsHistory, newComment),
            };
          }
          return machine;
        }),
      }))
    );
  }, []);

  const handleApproval = (unitId: string, machineId: string, role: ApprovalRoleKeys, action: "Approved" | "Rejected" | "FeedbackGiven", feedbackReason?: string) => {
    setMonitoringResults((prevResults) =>
      prevResults.map((unit) =>
        unit.unitId === unitId
          ? {
              ...unit,
              machineResults: unit.machineResults.map((machine) => {
                if (machine.machineId === machineId) {
                  let updatedCommentsHistory = machine.commentsHistory || [];

                  if ((action === "FeedbackGiven" || action === "Rejected") && feedbackReason) {
                    const newComment: CommentEntry = {
                      id: crypto.randomUUID(),
                      role,
                      comment: feedbackReason,
                      timestamp: new Date().toLocaleString(),
                      replies: [],
                      parentId: null,
                    };
                    updatedCommentsHistory = [...updatedCommentsHistory, newComment];
                  } else if (action === "Approved") {
                    updatedCommentsHistory = updatedCommentsHistory.filter((c) => !(c.role === role && (c.parentId === null || c.parentId === undefined))) || [];
                  }

                  const updatedMachine = {
                    ...machine,
                    approvalStatus: {
                      ...machine.approvalStatus,
                      [role]: action,
                    },
                    commentsHistory: updatedCommentsHistory,
                  };

                  return updatedMachine;
                }
                return machine;
              }),
            }
          : unit
      )
    );

    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[machineId] && newFeedbackState[machineId][typedRole]) {
        newFeedbackState[machineId][typedRole] = { showInput: false, text: "" };
      }
      return newFeedbackState;
    });
  };

  const toggleFeedbackInput = (machineId: string, role: ApprovalRoleKeys) => {
    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      if (!newFeedbackState[machineId]) {
        newFeedbackState[machineId] = {
          unitHeadEngineering: { showInput: false, text: "" },
          unitHeadProcess: { showInput: false, text: "" },
          sectionHeadEngineering: { showInput: false, text: "" },
          sectionHeadProcess: { showInput: false, text: "" },
        };
      } else {
        newFeedbackState[machineId] = { ...newFeedbackState[machineId] };
      }
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[machineId][typedRole]) {
        newFeedbackState[machineId][typedRole] = {
          ...newFeedbackState[machineId][typedRole],
          showInput: !newFeedbackState[machineId][typedRole].showInput,
        };
      }
      return newFeedbackState;
    });
  };

  const updateFeedbackText = (machineId: string, role: ApprovalRoleKeys, text: string) => {
    setFeedbackState((prev) => {
      const newFeedbackState = { ...prev };
      const typedRole = role as ApprovalRoleKeys;
      if (newFeedbackState[machineId]) {
        newFeedbackState[machineId] = { ...newFeedbackState[machineId] };
        if (newFeedbackState[machineId][typedRole]) {
          newFeedbackState[machineId][typedRole] = {
            ...newFeedbackState[machineId][typedRole],
            text: text,
          };
        }
      }
      return newFeedbackState;
    });
  };

  const handleSaveMachineResults = (unitId: string, machineId: string) => {
    setIsSaving(true);
    let isValid = true;
    const pendingItems: { item: string }[] = [];
    const currentMachineResult = monitoringResults.find((u) => u.unitId === unitId)?.machineResults.find((m) => m.machineId === machineId);
    const firstApproverRole = getCurrentApprovalFlowOrder()[0];

    if (currentMachineResult) {
      currentMachineResult.itemResults.forEach((itemResult) => {
        const originalItem = initialSchedule.units
          .find((u) => u.id === unitId)
          ?.machines.find((m) => m.id === machineId)
          ?.items.find((i) => i.id === itemResult.itemId);
        if (originalItem && (itemResult.result === "" || itemResult.status === "Pending")) {
          isValid = false;
          pendingItems.push({ item: originalItem.name });
        }
      });
    }

    if (isValid) {
      setMonitoringResults((prevResults) =>
        prevResults.map((unit) =>
          unit.unitId === unitId
            ? {
                ...unit,
                machineResults: unit.machineResults.map((machineResult) => {
                  if (machineResult.machineId === machineId) {
                    let updatedApprovalStatus = { ...machineResult.approvalStatus };
                    let updatedCommentsHistory = machineResult.commentsHistory || [];

                    // Case 1: Saving for the first time by a technician
                    if (DUMMY_USER_ROLE === "technician") {
                      updatedApprovalStatus = {
                        ...updatedApprovalStatus,
                        [firstApproverRole]: "Pending",
                      };
                    } else if (DUMMY_USER_ROLE === "unitHeadEngineering") {
                      // Case 2: Editing by the first approver
                      updatedApprovalStatus = {
                        ...updatedApprovalStatus,
                        [firstApproverRole]: "Edited", // Set status to 'Edited'
                      };

                      // Tambahkan entri ke commentsHistory
                      const editedComment: CommentEntry = {
                        id: crypto.randomUUID(),
                        role: DUMMY_USER_ROLE,
                        comment: `Data diedit oleh ${getRoleName(DUMMY_USER_ROLE)}.`,
                        timestamp: new Date().toLocaleString(),
                        replies: [],
                        parentId: null,
                      };
                      updatedCommentsHistory = [...updatedCommentsHistory, editedComment];
                    }

                    return {
                      ...machineResult,
                      isSaved: true,
                      submissionDate: new Date().toISOString(),
                      approvalStatus: updatedApprovalStatus,
                      commentsHistory: updatedCommentsHistory,
                    };
                  }
                  return machineResult;
                }),
              }
            : unit
        )
      );
      const currentMachineName = initialSchedule.units.find((u) => u.id === unitId)?.machines.find((m) => m.id === machineId)?.name || machineId;
      alert(`Hasil monitoring untuk ${currentMachineName} berhasil disimpan!`);
    } else {
      const currentMachineName = initialSchedule.units.find((u) => u.id === unitId)?.machines.find((m) => m.id === machineId)?.name || machineId;
      alert(`Harap isi semua hasil monitoring yang diperlukan untuk ${currentMachineName}. Item yang belum diisi: ` + pendingItems.map((p) => p.item).join(", "));
    }
    setIsSaving(false);
  };

  const totalUnits = initialSchedule.units.length;
  const totalMachines = initialSchedule.units.reduce((acc, unit) => acc + unit.machines.length, 0);
  const totalItems = initialSchedule.units.reduce((acc, unit) => acc + unit.machines.reduce((machineAcc, machine) => machineAcc + machine.items.length, 0), 0);

  const handleAddApprovalStep = () => {
    setCustomApprovalFlow((prev) => [...prev, { order: prev.length + 1, role: "unitHeadEngineering", assignee: "" }]);
  };

  const handleRemoveApprovalStep = (index: number) => {
    setCustomApprovalFlow((prev) => prev.filter((_, i) => i !== index));
  };

  const handleApprovalStepChange = (index: number, field: "role" | "assignee", value: string) => {
    setCustomApprovalFlow((prev) => prev.map((step, i) => (i === index ? { ...step, [field]: value as ApprovalRoleKeys | string } : step)));
  };

  const handleSaveApprovalFlow = () => {
    const isComplete = customApprovalFlow.every((step) => step.role && step.assignee);
    if (!isComplete) {
      alert("Harap lengkapi semua peran dan penanggung jawab.");
      return;
    }
    setIsApprovalFlowConfigured(true);
    setShowApprovalConfigModal(false);
    alert("Alur persetujuan berhasil disimpan!");
  };

  const getCurrentApprovalFlowOrder = (): ApprovalRoleKeys[] => {
    const sortedFlow = [...customApprovalFlow].sort((a, b) => a.order - b.order);
    if (sortedFlow.length > 0 && sortedFlow.every((step) => step.role && step.assignee)) {
      return sortedFlow.map((step) => step.role);
    }
    return DEFAULT_APPROVAL_FLOW_ORDER;
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

    if (currentRoleIndex === 0) {
      return true;
    }

    for (let i = 0; i < currentRoleIndex; i++) {
      const prevRoleInFlow = approvalFlowOrder[i];
      if (currentMachineApprovalStatus?.[prevRoleInFlow] !== "Approved") {
        return false;
      }
    }

    return true;
  };

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
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Monitoring Maintenance</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Detail Monitoring Maintenance</h1>
              <p className="text-gray-600 mt-1">
                Period: <span className="font-semibold text-gray-800">{initialSchedule.period}</span>
              </p>
              <div className="text-sm text-gray-500 mt-2 flex items-center space-x-4">
                <p>
                  <span className="font-semibold">{totalUnits}</span> Units
                </p>
                <p>
                  <span className="font-semibold">{totalMachines}</span> Machines
                </p>
                <p>
                  <span className="font-semibold">{totalItems}</span> Items
                </p>
              </div>
            </div>
            {DUMMY_USER_ROLE === "admin" && (
              <motion.button
                onClick={() => setShowApprovalConfigModal(true)}
                whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
              >
                <UserCog className="text-lg" />
                Configure Approval Flow
              </motion.button>
            )}
          </motion.div>

          <div className="space-y-6">
            {initialSchedule.units.map((unit, unitIndex) => (
              <motion.div key={unit.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: unitIndex * 0.1, duration: 0.3 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-50">
                <button onClick={() => toggleUnit(unit.id)} className="w-full text-left p-6 flex justify-between items-center text-lg font-bold text-gray-900 focus:outline-none bg-white hover:bg-gray-50 transition-colors">
                  <span>{unit.name}</span>
                  <motion.div initial={false} animate={{ rotate: expandedUnits.includes(unit.id) ? 180 : 0 }}>
                    <ChevronDown className="text-gray-500" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {expandedUnits.includes(unit.id) && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="p-4 bg-gray-50">
                      <div className="space-y-6">
                        {unit.machines.map((machine, machineIndex) => {
                          const machineResult = monitoringResults.find((u) => u.unitId === unit.id)?.machineResults.find((m) => m.machineId === machine.id);
                          const firstApproverRole = getCurrentApprovalFlowOrder()[0];
                          const isEditable = !machineResult?.isSaved && ((DUMMY_USER_ROLE as string) === "technician" || (DUMMY_USER_ROLE as string) === "admin");

                          return (
                            <motion.div
                              key={machine.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: machineIndex * 0.1 + 0.1, duration: 0.2 }}
                              className="bg-white rounded-lg border border-gray-200 shadow-sm"
                            >
                              <button onClick={() => toggleMachine(machine.id)} className="w-full text-left p-4 flex justify-between items-center text-base font-semibold text-gray-800 focus:outline-none hover:bg-gray-100 transition-colors">
                                <span>{machine.name}</span>
                                <motion.div initial={false} animate={{ rotate: expandedMachines.includes(machine.id) ? 180 : 0 }}>
                                  <ChevronDown className="text-gray-400" size={20} />
                                </motion.div>
                              </button>

                              <AnimatePresence>
                                {expandedMachines.includes(machine.id) && (
                                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="p-4 border-t border-gray-200">
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
                                          {machine.items.map((item) => {
                                            const currentResult = machineResult?.itemResults.find((i) => i.itemId === item.id);
                                            return (
                                              <tr key={item.id}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.visual ? `${item.visual} (${item.uom})` : `${item.min} - ${item.max} ${item.uom}`}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                  {item.uom === "Visual" || item.uom === "Level" || item.uom === "Kekencangan" ? (
                                                    <select
                                                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                      value={currentResult?.result || ""}
                                                      onChange={(e) => handleResultChange(unit.id, machine.id, item.id, e.target.value, "visual")}
                                                      disabled={!isEditable}
                                                    >
                                                      <option value="">Select</option>
                                                      <option value="N/A">N/A</option>
                                                      <option value="Fungsi Normal">Fungsi Normal</option>
                                                      <option value="Fungsi Bersih">Fungsi Bersih</option>
                                                      <option value="Tidak Bocor">Tidak Bocor</option>
                                                      <option value="Baik">Baik</option>
                                                      <option value="Tidak Bersuara">Tidak Bersuara</option>
                                                      <option value="Keras">Keras</option>
                                                    </select>
                                                  ) : (
                                                    <input
                                                      type="number"
                                                      step="0.01"
                                                      value={currentResult?.result as string}
                                                      onChange={(e) => handleResultChange(unit.id, machine.id, item.id, e.target.value, "numeric", item.min, item.max)}
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
                                                    onChange={(e) => handleRemarksChange(unit.id, machine.id, item.id, e.target.value)}
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
                                        onClick={() => handleSaveMachineResults(unit.id, machine.id)}
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
                                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                        <Info className="mr-2 text-blue-500" />
                                        Approval Status
                                      </h3>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {Object.entries(machineResult?.approvalStatus || {}).map(([roleKey, status]) => {
                                          const typedRole = roleKey as ApprovalRoleKeys;
                                          const shouldShowActionButtons = calculateShouldShowActionButtons(DUMMY_USER_ROLE, typedRole, status, machineResult?.approvalStatus, getCurrentApprovalFlowOrder(), machineResult?.isSaved || false);

                                          return (
                                            <div key={roleKey} className="flex items-center justify-between p-3 rounded-lg border border-gray-200">
                                              <span className="text-sm font-medium text-gray-700">{getRoleName(typedRole)}</span>
                                              <div className="flex items-center space-x-2">
                                                <span className={`text-xs font-medium px-3 py-1 rounded-full ${getApprovalStatusColors(status)}`}>{status === "Edited" ? `Edited by ${getRoleName(typedRole)}` : status}</span>
                                                {shouldShowActionButtons && (
                                                  <div className="flex space-x-1">
                                                    <motion.button
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={() => handleApproval(unit.id, machine.id, roleKey as ApprovalRoleKeys, "Approved")}
                                                      className="p-1 rounded-full text-green-600 hover:bg-green-100 transition-colors"
                                                    >
                                                      <CheckCircle size={20} />
                                                    </motion.button>
                                                    <motion.button
                                                      whileHover={{ scale: 1.05 }}
                                                      whileTap={{ scale: 0.95 }}
                                                      onClick={() => toggleFeedbackInput(machine.id, roleKey as ApprovalRoleKeys)}
                                                      className="p-1 rounded-full text-blue-600 hover:bg-blue-100 transition-colors"
                                                    >
                                                      <MessageSquare size={20} />
                                                    </motion.button>
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    </div>

                                    {Object.entries(feedbackState[machine.id] || {}).map(
                                      ([roleKey, state]) =>
                                        state.showInput && (
                                          <AnimatePresence key={roleKey}>
                                            <motion.div
                                              initial={{ opacity: 0, height: 0 }}
                                              animate={{ opacity: 1, height: "auto" }}
                                              exit={{ opacity: 0, height: 0 }}
                                              transition={{ duration: 0.2 }}
                                              className="mt-4 p-4 bg-gray-100 rounded-lg border border-gray-200"
                                            >
                                              <h5 className="text-sm font-semibold text-gray-800 mb-2">Alasan untuk Feedback ({getRoleName(roleKey as ApprovalRoleKeys)})</h5>
                                              <textarea
                                                rows={2}
                                                value={state.text}
                                                onChange={(e) => updateFeedbackText(machine.id, roleKey as ApprovalRoleKeys, e.target.value)}
                                                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                                                placeholder="Tulis alasan feedback atau penolakan..."
                                              ></textarea>
                                              <div className="flex justify-end space-x-2 mt-2">
                                                <motion.button
                                                  whileHover={{ scale: 1.05 }}
                                                  whileTap={{ scale: 0.95 }}
                                                  onClick={() => handleApproval(unit.id, machine.id, roleKey as ApprovalRoleKeys, "FeedbackGiven", state.text)}
                                                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-semibold transition-colors"
                                                >
                                                  Kirim Feedback
                                                </motion.button>
                                              </div>
                                            </motion.div>
                                            <motion.div>
                                              <div className="flex justify-center space-x-0.5 mt-0.5">Input</div>
                                            </motion.div>
                                          </AnimatePresence>
                                        )
                                    )}

                                    <CommentSection machineId={machine.id} commentsHistory={machineResult?.commentsHistory || []} currentUserRole={DUMMY_USER_ROLE} onAddCommentOrReply={handleAddCommentOrReply} />
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.div>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </main>
      </div>

      <Modal isOpen={showApprovalConfigModal} onClose={() => setShowApprovalConfigModal(false)} title="Konfigurasi Alur Persetujuan">
        <div className="space-y-4">
          <p className="text-sm text-gray-600">Atur urutan dan penanggung jawab untuk setiap langkah persetujuan.</p>
          {customApprovalFlow.map((step, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-100 rounded-lg border border-gray-200">
              <span className="text-gray-500 font-semibold">{index + 1}.</span>
              <div className="flex-1 space-y-2">
                <select
                  value={step.role}
                  onChange={(e) => handleApprovalStepChange(index, "role", e.target.value)}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                >
                  {ALL_APPROVAL_ROLES.map((role) => (
                    <option key={role.key} value={role.key}>
                      {role.name}
                    </option>
                  ))}
                </select>
                <input
                  type="text"
                  value={step.assignee}
                  onChange={(e) => handleApprovalStepChange(index, "assignee", e.target.value)}
                  placeholder="Nama Penanggung Jawab"
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                />
              </div>
              <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveApprovalStep(index)} className="text-red-600 hover:text-red-800 transition-colors">
                <XCircle size={20} />
              </motion.button>
            </div>
          ))}
          <div className="flex justify-between items-center mt-6">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleAddApprovalStep}
              className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center text-sm"
            >
              <Plus size={18} className="mr-2" /> Tambah Langkah
            </motion.button>
            <div className="flex space-x-3">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowApprovalConfigModal(false)}
                className="px-5 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
              >
                Batal
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveApprovalFlow}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold text-sm"
              >
                Simpan Alur
              </motion.button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DetailMonitoringMaintenance;
