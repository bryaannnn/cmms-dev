import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Save, ArrowLeft, UserCog, FolderPlus, List, FileText, CheckCircle, Clock, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";

interface ConfigurableApprovalStep {
  order: number;
  role: ApprovalRoleKeys;
  assignee: string;
}

type ApprovalRoleKeys = "unitHeadEngineering" | "unitHeadProcess" | "sectionHeadEngineering" | "sectionHeadProcess";

interface ApprovalTemplate {
  id: string;
  name: string;
  status: "active" | "non-active";
  flow: ConfigurableApprovalStep[];
}

const ALL_APPROVAL_ROLES: { key: ApprovalRoleKeys; name: string }[] = [
  { key: "unitHeadEngineering", name: "Unit Head Engineering" },
  { key: "unitHeadProcess", name: "Unit Head Process" },
  { key: "sectionHeadEngineering", name: "Section Head Engineering" },
  { key: "sectionHeadProcess", name: "Section Head Process" },
];

const DUMMY_USERS = ["John Doe", "Jane Smith", "Peter Jones", "Alice Brown", "Bob White"];

const DEFAULT_APPROVAL_FLOW: ConfigurableApprovalStep[] = ALL_APPROVAL_ROLES.map((role, index) => ({
  order: index + 1,
  role: role.key,
  assignee: DUMMY_USERS[index] || "",
}));

// Dummy data for existing templates
const DUMMY_TEMPLATES: ApprovalTemplate[] = [
  {
    id: "temp-production-flow",
    name: "Template A",
    status: "non-active",
    flow: [
      { order: 1, role: "unitHeadProcess", assignee: "Jane Smith" },
      { order: 2, role: "sectionHeadProcess", assignee: "Bob White" },
    ],
  },
  {
    id: "temp-engineering-flow",
    name: "Template B",
    status: "active", // This is the default active template
    flow: [
      { order: 1, role: "unitHeadEngineering", assignee: "John Doe" },
      { order: 2, role: "sectionHeadEngineering", assignee: "Peter Jones" },
    ],
  },
];

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

const WorkflowApprovalMonitoring: React.FC = () => {
  const navigate = useNavigate();
  const [view, setView] = useState<"templateSelection" | "configuration">("templateSelection");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templates, setTemplates] = useState<ApprovalTemplate[]>(DUMMY_TEMPLATES);
  const [currentTemplate, setCurrentTemplate] = useState<ApprovalTemplate | null>(null);
  const [customApprovalFlow, setCustomApprovalFlow] = useState<ConfigurableApprovalStep[]>([]);

  const handleCreateTemplate = () => {
    if (!newTemplateName.trim()) {
      alert("Template name must be filled out.");
      return;
    }
    const newTemplate: ApprovalTemplate = {
      id: `temp-${newTemplateName.replace(/\s/g, "-").toLowerCase()}-${Date.now()}`,
      name: newTemplateName,
      status: "non-active",
      flow: DEFAULT_APPROVAL_FLOW,
    };
    setTemplates([...templates, newTemplate]);
    setShowCreateModal(false);
    setNewTemplateName("");
  };

  const handleSelectTemplate = (template: ApprovalTemplate) => {
    setCurrentTemplate(template);
    setCustomApprovalFlow(template.flow);
    setView("configuration");
  };

  const handleActivateTemplate = (templateId: string) => {
    setTemplates((prevTemplates) =>
      prevTemplates.map((t) => ({
        ...t,
        status: t.id === templateId ? "active" : "non-active",
      }))
    );
  };

  const handleBackToTemplates = () => {
    setView("templateSelection");
    setCurrentTemplate(null);
  };

  const handleAddApprovalStep = () => {
    setCustomApprovalFlow((prev) => [...prev, { order: prev.length + 1, role: "unitHeadEngineering", assignee: "" }]);
  };

  const handleRemoveApprovalStep = (index: number) => {
    setCustomApprovalFlow((prev) => prev.filter((_, i) => i !== index).map((step, i) => ({ ...step, order: i + 1 })));
  };

  const handleApprovalStepChange = (index: number, field: "role" | "assignee", value: string) => {
    setCustomApprovalFlow((prev) => prev.map((step, i) => (i === index ? { ...step, [field]: value as ApprovalRoleKeys | string } : step)));
  };

  const handleSaveApprovalFlow = () => {
    if (!currentTemplate) return;
    const isComplete = customApprovalFlow.every((step) => step.role && step.assignee);
    if (!isComplete) {
      alert("Please complete all roles and assignees.");
      return;
    }

    setTemplates((prevTemplates) => prevTemplates.map((template) => (template.id === currentTemplate.id ? { ...template, flow: customApprovalFlow } : template)));
    alert(`Approval flow for template "${currentTemplate.name}" has been successfully saved!`);
  };

  const renderTemplateSelection = () => (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <List className="mr-2 text-gray-700" size={24} /> Select or Create Template
        </h1>
        <motion.button
          onClick={() => setShowCreateModal(true)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center text-sm shadow-md"
        >
          <FolderPlus size={18} className="mr-2" /> Create New Template
        </motion.button>
      </div>

      <div className="space-y-4">
        {templates.length > 0 ? (
          templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.98 }}
              className="p-6 bg-white rounded-lg border border-gray-200 cursor-pointer transition-all duration-200"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-gray-800 flex items-center">
                    <FileText size={20} className="mr-2 text-blue-500" />
                    {template.name}
                  </h3>
                  <div className="mt-2 flex items-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${template.status === "active" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>
                      {template.status === "active" ? "Active" : "Non-active"}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <motion.button
                    onClick={() => handleSelectTemplate(template)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 text-sm font-semibold rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                  >
                    Configure
                  </motion.button>
                  {template.status === "non-active" && (
                    <motion.button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleActivateTemplate(template.id);
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                    >
                      Activate
                    </motion.button>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">No templates yet. Please create the first one.</div>
        )}
      </div>

      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Template">
        <div className="space-y-4">
          <div>
            <label htmlFor="templateName" className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              id="templateName"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="e.g., QC Flow"
              className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
            />
          </div>
          <div className="flex justify-end pt-2">
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCreateTemplate}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Create Template
            </motion.button>
          </div>
        </div>
      </Modal>
    </>
  );

  const renderConfiguration = () => (
    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
          <UserCog className="mr-2 text-gray-700" size={24} />
          Flow Configuration: <span className="text-blue-600 ml-2">{currentTemplate?.name}</span>
        </h1>
        <motion.button
          onClick={handleBackToTemplates}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold text-sm flex items-center"
        >
          <ArrowLeft className="mr-2" size={18} /> Back to Template List
        </motion.button>
      </div>

      <p className="text-gray-600 mb-6">Arrange the order and assignees for each approval step.</p>

      <div className="space-y-4">
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
                placeholder="Assignee Name"
                className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700 text-sm"
              />
            </div>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => handleRemoveApprovalStep(index)} className="text-red-600 hover:text-red-800 transition-colors">
              <Trash2 size={20} />
            </motion.button>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleAddApprovalStep}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-semibold flex items-center text-sm"
        >
          <Plus size={18} className="mr-2" /> Add Step
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleSaveApprovalFlow}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors font-semibold text-sm"
        >
          <Save size={18} className="mr-2" /> Save Flow
        </motion.button>
      </div>
    </motion.div>
  );

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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">{view === "templateSelection" ? renderTemplateSelection() : renderConfiguration()}</main>
      </div>
    </div>
  );
};

export default WorkflowApprovalMonitoring;
