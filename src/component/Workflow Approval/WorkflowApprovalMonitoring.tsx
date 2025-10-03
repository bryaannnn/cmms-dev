// WorkflowApprovalMonitoring.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FolderPlus, List, FileText, X, Loader } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../Sidebar";
import { useAuth } from "../../routes/AuthContext";

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
  const { getApprovalTemplates, createApprovalTemplate, deleteApprovalTemplate, setApprovalTemplateActive } = useAuth();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const templatesData = await getApprovalTemplates();
      setTemplates(templatesData || []);
    } catch (err) {
      setError("Failed to load approval templates");
      console.error("Error loading templates:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) {
      setError("Template name must be filled out.");
      return;
    }

    try {
      setLoading(true);
      const newTemplate = await createApprovalTemplate({
        name: newTemplateName,
        is_active: false,
      });

      setTemplates((prev) => [...prev, newTemplate]);
      setShowCreateModal(false);
      setNewTemplateName("");
      setError("");
    } catch (err) {
      setError("Failed to create template");
      console.error("Error creating template:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfigureTemplate = (template: any) => {
    navigate(`/workflowapproval/monitoringapproval/configureapproval/${template.id}`);
  };

  const handleActivateTemplate = async (templateId: number) => {
    try {
      setLoading(true);
      await setApprovalTemplateActive(templateId);

      setTemplates((prev) =>
        prev.map((t) => ({
          ...t,
          is_active: t.id === templateId,
        }))
      );
    } catch (err) {
      setError("Failed to activate template");
      console.error("Error activating template:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (templateId: number, templateName: string) => {
    if (window.confirm(`Are you sure you want to delete template "${templateName}"?`)) {
      try {
        setLoading(true);
        await deleteApprovalTemplate(templateId);
        await loadTemplates();
      } catch (err) {
        setError("Failed to delete template");
        console.error("Error deleting template:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <motion.button onClick={() => navigate(-1)} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <List className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Approval Monitoring Flow Management</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <List className="mr-2 text-gray-700" size={24} /> Select or Create Template
            </h1>
            <motion.button
              onClick={() => setShowCreateModal(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center text-sm shadow-md disabled:opacity-50"
              disabled={loading}
            >
              <FolderPlus size={18} className="mr-2" /> Create New Template
            </motion.button>
          </div>

          {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <Loader className="animate-spin text-blue-600" size={32} />
            </div>
          ) : (
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
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-800 flex items-center">
                          <FileText size={20} className="mr-2 text-blue-500" />
                          {template.name}
                        </h3>
                        <div className="mt-2 flex items-center space-x-2">
                          <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${template.is_active ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}>{template.is_active ? "Active" : "Inactive"}</span>
                          {template.approvers && <span className="text-xs text-gray-500">{template.approvers.length} approver(s)</span>}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <motion.button
                          onClick={() => handleConfigureTemplate(template)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 text-sm font-semibold rounded-lg text-blue-600 hover:bg-blue-100 transition-colors"
                          disabled={loading}
                        >
                          Configure
                        </motion.button>
                        {!template.is_active && (
                          <motion.button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleActivateTemplate(template.id);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 text-sm font-semibold rounded-lg bg-green-500 text-white hover:bg-green-600 transition-colors"
                            disabled={loading}
                          >
                            Activate
                          </motion.button>
                        )}
                        <motion.button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTemplate(template.id, template.name);
                          }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="px-4 py-2 text-sm font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors"
                          disabled={loading}
                        >
                          Delete
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="p-6 text-center text-gray-500 border border-dashed border-gray-300 rounded-lg">No templates found. Create the first template to get started.</div>
              )}
            </div>
          )}

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
                  placeholder="e.g., Production Approval Flow"
                  className="mt-1 block w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                />
              </div>
              {error && <div className="p-2 bg-red-100 border border-red-400 text-red-700 rounded text-sm">{error}</div>}
              <div className="flex justify-end pt-2 space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setShowCreateModal(false);
                    setNewTemplateName("");
                    setError("");
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 font-semibold text-sm"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={handleCreateTemplate}
                  className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  disabled={loading || !newTemplateName.trim()}
                >
                  {loading ? <Loader className="animate-spin mr-2" size={16} /> : null}
                  Create Template
                </motion.button>
              </div>
            </div>
          </Modal>
        </main>
      </div>
    </div>
  );
};

export default WorkflowApprovalMonitoring;