import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Save, Hourglass, CheckCircle, X } from "lucide-react";
import Sidebar from "../../component/Sidebar";
import { useAuth } from "../../routes/AuthContext";

interface ServiceGroup {
  id: number;
  group_name: string;
  group_description?: string | null;
  created_at?: string;
  updated_at?: string;
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

const FormEditServiceGroup: React.FC = () => {
  const params = useParams<{ id: string }>();
  const idParam = params.id;
  const navigate = useNavigate();
  const auth = useAuth();

  type AuthSubset = {
    getServiceGroup: (id: string | number) => Promise<{
      id: number | string;
      group_name: string;
      group_description?: string | null;
      created_at?: string;
      updated_at?: string;
    }>;
    updateServiceGroup: (id: number, payload: { group_name: string; group_description?: string | null }) => Promise<any>;
  };

  const { getServiceGroup, updateServiceGroup } = auth as unknown as AuthSubset;

  const [groupName, setGroupName] = useState<string>("");
  const [groupDescription, setGroupDescription] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [fetching, setFetching] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState<boolean>(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setFetching(true);
      setError(null);
      try {
        if (!idParam) {
          setError("Missing service group id");
          return;
        }
        const data = await getServiceGroup(idParam);
        if (!mounted) return;
        setGroupName(String(data.group_name ?? ""));
        setGroupDescription(String(data.group_description ?? "") || "");
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : "Failed to load service group";
        setError(message);
      } finally {
        if (mounted) setFetching(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [getServiceGroup, idParam]);

  const handleBack = () => {
    navigate("/servicegroups");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!groupName.trim()) {
      setError("Group Name is required");
      return;
    }
    setLoading(true);
    try {
      const numericId = Number(idParam);
      await updateServiceGroup(numericId, {
        group_name: groupName.trim(),
        group_description: groupDescription.trim() || null,
      });
      setShowSuccessModal(true);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update service group";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
    setShowSuccessModal(false);
    navigate("/servicegroups");
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            <motion.button onClick={handleBack} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ArrowLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back to Service Groups</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Service Group</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="mb-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Service Group</h1>
              <p className="text-gray-600 mt-1">Update the service group details below.</p>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.08 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
            {fetching ? (
              <div className="text-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-500 mx-auto mb-4" />
                <p className="text-gray-600">Loading service group...</p>
              </div>
            ) : (
              <>
                {error && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                    <strong className="font-semibold">Error: </strong>
                    <span className="ml-2">{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Group Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        name="group_name"
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        type="text"
                        className="mt-2 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Group Description</label>
                      <textarea
                        name="group_description"
                        value={groupDescription}
                        onChange={(e) => setGroupDescription(e.target.value)}
                        rows={4}
                        className="mt-2 w-full px-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => navigate("/servicegroups")}
                      className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
                    >
                      Cancel
                    </motion.button>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.97 }}
                      disabled={loading}
                      className="px-5 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold text-sm flex items-center"
                    >
                      {loading ? (
                        <>
                          <Hourglass className="animate-spin mr-2 h-5 w-5" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="mr-2 h-5 w-5" />
                          Save Changes
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </>
            )}
          </motion.div>
        </main>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccess} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Service group has been updated successfully.</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccess}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Service Groups
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormEditServiceGroup;
