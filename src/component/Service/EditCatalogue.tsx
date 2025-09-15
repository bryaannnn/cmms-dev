import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../../component/Sidebar";
import { useAuth, ServiceGroup, User } from "../../routes/AuthContext";
import { ArrowLeft, Save, X, CheckCircle, Hourglass } from "lucide-react";

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

interface ServiceCatalogueResponse {
  message: string;
  data: {
    id: number;
    service_name: string;
    service_description: string;
    service_type: number;
    priority: "Low" | "Medium" | "High" | "Critical";
    service_owner: number;
    sla: string;
    impact: string;
    pic: null;
    created_at: string;
    updated_at: string;
  };
}

const FormEditServiceCatalogue: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { updateServiceCatalogue, getServiceGroups, getUsers, fetchWithAuth } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  const [formData, setFormData] = useState({
    service_name: "",
    service_description: "",
    service_type: "",
    priority: "Low" as "Low" | "Medium" | "High" | "Critical",
    service_owner: "",
    sla: 24,
    impact: "",
  });

  const fetchData = useCallback(async () => {
    try {
      const [serviceResponse, groups, userList] = await Promise.all([fetchWithAuth(`/service-catalogues/${id}`), getServiceGroups(0), getUsers()]);

      // Handle response format
      const serviceData = (serviceResponse as ServiceCatalogueResponse).data || serviceResponse;

      setServiceGroups(groups);
      setUsers(userList);

      // Populate form with existing data
      if (serviceData) {
        setFormData({
          service_name: serviceData.service_name || "",
          service_description: serviceData.service_description || "",
          service_type: String(serviceData.service_type || ""),
          priority: serviceData.priority || "Low",
          service_owner: String(serviceData.service_owner || ""),
          sla: serviceData.sla ? parseFloat(serviceData.sla) : 24,
          impact: serviceData.impact || "",
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to load service data");
    } finally {
      setInitialLoading(false);
    }
  }, [id, fetchWithAuth, getServiceGroups, getUsers]);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id, fetchData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "sla" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.service_name || !formData.service_type || !formData.priority || !formData.service_owner || !formData.sla) {
      setError("Please fill all required fields");
      setLoading(false);
      return;
    }

    try {
      const payload = {
        service_name: formData.service_name,
        service_description: formData.service_description,
        service_type: Number(formData.service_type),
        priority: formData.priority,
        service_owner: Number(formData.service_owner),
        sla: formData.sla,
        impact: formData.impact,
      };

      await updateServiceCatalogue(id!, payload);
      setSuccess("Service Catalogue updated successfully!");
      setShowSuccessModal(true);
    } catch (err: any) {
      setError(err.message || "Failed to update Service Catalogue");
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    navigate("/services/servicecatalogues");
  };

  if (initialLoading) {
    return (
      <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-blue-500"></div>
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
            <motion.button onClick={() => navigate("/services/servicecatalogues")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
              <ArrowLeft className="text-xl" />
              <span className="font-semibold text-sm hidden md:inline">Back to Service Catalogue</span>
            </motion.button>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Service Catalogue</h2>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Service Catalogue</h1>
              <p className="text-gray-600 mt-1">Update service details</p>
            </div>
            <motion.button
              onClick={() => navigate("/services/servicecatalogues")}
              whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
            >
              <ArrowLeft className="text-lg" /> Back to Catalogue
            </motion.button>
          </motion.div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline ml-2">{error}</span>
                <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                  <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
                </span>
              </motion.div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Service Information</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="service_name" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="service_name"
                      id="service_name"
                      value={formData.service_name}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="service_type" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="service_type"
                      id="service_type"
                      value={formData.service_type}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    >
                      <option value="">Select Service Type</option>
                      {serviceGroups.map((group) => (
                        <option key={group.id} value={group.id}>
                          {group.group_name || group.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                      <option value="Critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="service_owner" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Owner <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="service_owner"
                      id="service_owner"
                      value={formData.service_owner}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    >
                      <option value="">Select Service Owner</option>
                      {users.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="sla" className="block text-sm font-medium text-gray-700 mb-1">
                      SLA (hours) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="sla"
                      id="sla"
                      value={formData.sla}
                      onChange={handleChange}
                      min="1"
                      step="0.01"
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="impact" className="block text-sm font-medium text-gray-700 mb-1">
                      Impact
                    </label>
                    <input
                      type="text"
                      name="impact"
                      id="impact"
                      value={formData.impact}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="service_description" className="block text-sm font-medium text-gray-700 mb-1">
                      Service Description
                    </label>
                    <textarea
                      name="service_description"
                      id="service_description"
                      value={formData.service_description}
                      onChange={handleChange}
                      rows={4}
                      className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 bg-white text-gray-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 mt-8">
                <motion.button
                  type="button"
                  onClick={() => navigate("/services/servicecatalogues")}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  Cancel
                </motion.button>
                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 flex items-center justify-center"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Hourglass className="animate-spin mr-2 h-5 w-5" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-5 w-5" /> Update Service
                    </>
                  )}
                </motion.button>
              </div>
            </form>
          </motion.div>
        </main>
      </div>

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">{success}</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Back to Service Catalogue
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default FormEditServiceCatalogue;
