// WorkflowConfigureMonitoring.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, UserCog, Loader } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth, Approver } from "../../routes/AuthContext";
import Sidebar from "../Sidebar";

interface ConfigurableApprovalStep {
  order: number;
  role: string;
  assignee: string;
  approver_user_id?: number;
}

interface LocalUser {
  id: number;
  name: string;
  email: string;
  position?: string;
  department?: string;
}

const WorkflowConfigureMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { getUsers, getTemplateApprovers, addApproverToTemplate, updateApprover, deleteApprover, getApprovalTemplateById } = useAuth();

  const [users, setUsers] = useState<LocalUser[]>([]);
  const [template, setTemplate] = useState<any>(null);
  const [customApprovalFlow, setCustomApprovalFlow] = useState<ConfigurableApprovalStep[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (id) {
      loadTemplate();
      loadUsers();
    }
  }, [id]);

  const loadTemplate = async () => {
    if (!id) {
      setError("Template ID is missing");
      return;
    }

    try {
      setLoading(true);
      const templateData = await getApprovalTemplateById(id);
      console.log("Template data loaded:", templateData);

      setTemplate(templateData);

      // Load approvers dari template data
      if (templateData.approvers && templateData.approvers.length > 0) {
        await loadTemplateApproversFromData(templateData.approvers);
      } else {
        setCustomApprovalFlow([{ order: 1, role: "Select Position", assignee: "" }]);
      }
    } catch (err) {
      setError("Failed to load template");
      console.error("Error loading template:", err);
    } finally {
      setLoading(false);
    }
  };

  // Hapus fungsi loadTemplateApproversFromAPI karena tidak ada endpoint GET

  const loadTemplateApproversFromData = async (approvers: Approver[]) => {
    try {
      const flowSteps: ConfigurableApprovalStep[] = approvers.map((approver: Approver) => ({
        order: approver.step,
        role: approver.approver?.position || `Approval Step ${approver.step}`,
        assignee: approver.approver?.name || "",
        approver_user_id: approver.approver_user_id,
      }));
      setCustomApprovalFlow(flowSteps);
    } catch (err) {
      console.error("Error loading template approvers from data:", err);
      setCustomApprovalFlow([{ order: 1, role: "Select Position", assignee: "" }]);
    }
  };

  const loadUsers = async () => {
    try {
      const usersData = await getUsers();
      const transformedUsers: LocalUser[] = usersData.map((user: any) => ({
        id: parseInt(user.id),
        name: user.name,
        email: user.email,
        position: user.position || "No Position",
        department: user.department?.name || user.department_name,
      }));
      setUsers(transformedUsers);
    } catch (err) {
      console.error("Error loading users:", err);
    }
  };

  const getAvailablePositions = (): string[] => {
    const positions = users.map((user) => user.position).filter((position): position is string => position !== undefined && position !== null && position !== "No Position");
    return [...new Set(positions)];
  };

  const getUsersByPosition = (position: string): LocalUser[] => {
    return users.filter((user) => user.position === position);
  };

  const handleAddApprovalStep = () => {
    const newOrder = customApprovalFlow.length > 0 ? Math.max(...customApprovalFlow.map((step) => step.order)) + 1 : 1;
    setCustomApprovalFlow((prev) => [...prev, { order: newOrder, role: "Select Position", assignee: "" }]);
  };

  const handleRemoveApprovalStep = (index: number) => {
    setCustomApprovalFlow((prev) => prev.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 })));
  };

  const handleRoleChange = (index: number, position: string) => {
    setCustomApprovalFlow((prev) => prev.map((step, i) => (i === index ? { ...step, role: position, assignee: "" } : step)));
  };

  const handleUserSelection = (index: number, userId: number) => {
    const selectedUser = users.find((user) => user.id === userId);
    if (selectedUser) {
      setCustomApprovalFlow((prev) =>
        prev.map((step, i) =>
          i === index
            ? {
                ...step,
                assignee: selectedUser.name,
                approver_user_id: selectedUser.id,
              }
            : step
        )
      );
    }
  };

  const handleSaveApprovalFlow = async () => {
    if (!template) return;

    const isComplete = customApprovalFlow.every((step) => step.role && step.assignee && step.approver_user_id && step.role !== "Select Position");

    if (!isComplete) {
      setError("Please complete all roles and assignees.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Saving approval flow with smart update/post logic...");
      console.log("Template ID:", template.id);
      console.log("Existing approvers:", template.approvers);
      console.log("New approval flow:", customApprovalFlow);

      // 1. Identifikasi approvers yang perlu diupdate, ditambahkan, atau dihapus
      const existingApprovers: Approver[] = template.approvers || [];
      const newApprovers = customApprovalFlow.map((step) => ({
        approver_user_id: step.approver_user_id!,
        step: step.order,
      }));

      console.log("Existing approvers:", existingApprovers);
      console.log("New approvers:", newApprovers);

      // 2. Proses setiap step dalam custom approval flow
      const processedSteps: number[] = [];

      for (const step of customApprovalFlow) {
        const approverData = {
          approver_user_id: step.approver_user_id!,
          step: step.order,
        };

        // Cari apakah ada approver yang sudah ada untuk step ini - PERBAIKAN DI SINI
        const existingApprover = existingApprovers.find((approver: Approver) => approver.step === step.order);

        if (existingApprover) {
          // Jika approver sudah ada dan data berubah, UPDATE
          if (existingApprover.approver_user_id !== step.approver_user_id) {
            console.log(`Updating approver for step ${step.order} (ID: ${existingApprover.id})`);
            try {
              await updateApprover(template.id, existingApprover.id, approverData);
              console.log(`✓ Updated approver for step ${step.order}`);
            } catch (updateError) {
              console.error(`✗ Failed to update approver for step ${step.order}:`, updateError);
              throw new Error(`Failed to update approver for step ${step.order}`);
            }
          } else {
            console.log(`✓ Approver for step ${step.order} unchanged, skipping`);
          }
        } else {
          // Jika approver belum ada, POST baru
          console.log(`Adding new approver for step ${step.order}`);
          try {
            await addApproverToTemplate(template.id, approverData);
            console.log(`✓ Added new approver for step ${step.order}`);
          } catch (addError) {
            console.error(`✗ Failed to add approver for step ${step.order}:`, addError);
            throw new Error(`Failed to add approver for step ${step.order}`);
          }
        }

        processedSteps.push(step.order);
      }

      // 3. Hapus approvers yang tidak lagi digunakan (jika ada step yang dihapus)
      const stepsToDelete = existingApprovers.filter((approver: Approver) => !processedSteps.includes(approver.step)).map((approver: Approver) => ({ id: approver.id, step: approver.step }));

      console.log("Steps to delete:", stepsToDelete);

      for (const approverToDelete of stepsToDelete) {
        try {
          await deleteApprover(template.id, approverToDelete.id);
          console.log(`✓ Deleted unused approver for step ${approverToDelete.step}`);
        } catch (deleteError) {
          console.warn(`⚠ Could not delete approver for step ${approverToDelete.step}:`, deleteError);
        }
      }

      // 4. Tampilkan pesan sukses
      alert(`✅ Approval flow for template "${template.name}" has been successfully saved!`);

      // 5. Reload template untuk mendapatkan data terbaru
      await loadTemplate();
    } catch (err) {
      console.error("❌ Error saving approval flow:", err);
      setError(err instanceof Error ? err.message : "Failed to save approval flow");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToTemplates = () => {
    navigate("/workflowapproval/monitoringapproval");
  };

  // Debug: tambahkan console log untuk melihat state
  console.log("Template state:", template);
  console.log("Custom approval flow:", customApprovalFlow);

  if (loading && !template) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <Loader className="animate-spin text-blue-600" size={32} />
        </div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-700 mb-2">Template not found</h2>
            <p className="text-gray-500 mb-4">ID: {id}</p>
            <button onClick={handleBackToTemplates} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Back to Templates
            </button>
          </div>
        </div>
      </div>
    );
  }

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
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Approval Monitoring Flow Management</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <UserCog className="mr-2 text-gray-700" size={24} />
                Flow Configuration: <span className="text-blue-600 ml-2">{template?.name}</span>
              </h1>
              <motion.button
                onClick={handleBackToTemplates}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm flex items-center"
                disabled={loading}
              >
                <ArrowLeft className="mr-2" size={18} /> Back to Template List
              </motion.button>
            </div>

            <p className="text-gray-600 mb-6">Configure the approval flow by selecting positions and assigning approvers.</p>

            {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

            <div className="space-y-4">
              {customApprovalFlow.map((step, index) => {
                const availablePositions = getAvailablePositions();
                const usersForSelectedPosition = step.role && step.role !== "Select Position" ? getUsersByPosition(step.role) : [];

                return (
                  <div key={index} className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-gray-500 font-semibold min-w-8">{step.order}.</span>
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                        <select
                          value={step.role}
                          onChange={(e) => handleRoleChange(index, e.target.value)}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                        >
                          <option value="Select Position">Select Position</option>
                          {availablePositions.map((position) => (
                            <option key={position} value={position}>
                              {position}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Assignee</label>
                        <select
                          value={step.approver_user_id || ""}
                          onChange={(e) => handleUserSelection(index, parseInt(e.target.value))}
                          className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
                          disabled={!step.role || step.role === "Select Position" || usersForSelectedPosition.length === 0}
                        >
                          <option value="">Select User</option>
                          {usersForSelectedPosition.map((user) => (
                            <option key={user.id} value={user.id}>
                              {user.name} ({user.email})
                            </option>
                          ))}
                        </select>
                        {step.role && step.role !== "Select Position" && usersForSelectedPosition.length === 0 && <p className="text-xs text-red-500 mt-1">No users found for this position</p>}
                      </div>
                    </div>
                    {customApprovalFlow.length > 1 && (
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveApprovalStep(index)} className="text-red-600 hover:text-red-800 transition-colors p-2" disabled={loading}>
                        <Trash2 size={20} />
                      </motion.button>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex justify-between items-center mt-6">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAddApprovalStep}
                className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center text-sm disabled:opacity-50"
                disabled={loading}
              >
                <Plus size={18} className="mr-2" /> Add Step
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={handleSaveApprovalFlow}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold text-sm disabled:opacity-50 flex items-center"
                disabled={loading}
              >
                {loading ? <Loader className="animate-spin mr-2" size={16} /> : <Save size={18} className="mr-2" />}
                Save Flow
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default WorkflowConfigureMonitoring;
