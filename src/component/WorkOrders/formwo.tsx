import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, WorkOrderFormData } from "../../routes/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, X, AlertTriangle, CheckCircle, Clock, Paperclip } from "lucide-react"; // Added Paperclip icon

// Modal component (reused from WorkOrders.tsx for consistency)
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

const AddWorkOrderForm: React.FC = () => {
  const { submitWorkOrder, user } = useAuth();
  const navigate = useNavigate();

  const initialFormData: WorkOrderFormData = {
    id: 0,
    title: "",
    description: "",
    type: "preventive",
    status: "pending",
    priority: "low",
    assignedTo: "",
    assignedToAvatar: "",
    createdBy: user?.name || "Unknown User",
    createdAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    assetId: "",
    assetName: "",
    assetType: "",
    estimatedHours: null,
    attachments: [], // Ensure attachments is initialized as an empty array
  };

  const [formData, setFormData] = useState<WorkOrderFormData>(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setFormData((prev) => ({ ...prev, attachments: filesArray }));
    } else {
      setFormData((prev) => ({ ...prev, attachments: [] }));
    }
  }, []);

  const handleRemoveFile = useCallback((fileName: string) => {
    setFormData((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((file) => file.name !== fileName),
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError(null);
      setSuccessMessage(null);

      // Basic validation
      if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate || !formData.assetId) {
        setError("Please fill in all required fields: Title, Description, Assigned To, Due Date, and Asset ID.");
        setIsLoading(false);
        return;
      }

      try {
        await submitWorkOrder(formData);
        setSuccessMessage("Work Order added successfully!");
        setShowSuccessModal(true);
        setFormData(initialFormData); // Reset form after successful submission
      } catch (err: any) {
        console.error("Error submitting work order:", err);
        setError(err.message || "Failed to add work order. Please try again.");
      } finally {
        setIsLoading(false);
      }
    },
    [formData, submitWorkOrder, initialFormData]
  );

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/workorders");
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-blue-50 p-4 sm:p-6 lg:p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-blue-100">
        <div className="flex justify-between items-center mb-6 border-b pb-4 border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center">
            <Plus className="mr-3 text-blue-600" size={28} />
            Create New Work Order
          </h2>
        </div>

        {error && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl relative mb-6" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline ml-2">{error}</span>
            <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
              <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
            </span>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="e.g., Fix leaky faucet in Unit 301"
            />
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              placeholder="Provide a detailed description of the work needed."
            ></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Type */}
            <div>
              <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                Type
              </label>
              <select id="type" name="type" value={formData.type} onChange={handleChange} className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200">
                <option value="preventive">Preventive</option>
                <option value="corrective">Corrective</option>
                <option value="inspection">Inspection</option>
                <option value="emergency">Emergency</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                name="priority"
                value={formData.priority}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            {/* Assigned To */}
            <div>
              <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                Assigned To <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="assignedTo"
                name="assignedTo"
                value={formData.assignedTo}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., John Doe"
              />
            </div>

            {/* Due Date */}
            <div>
              <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="dueDate"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
            </div>

            {/* Asset ID */}
            <div>
              <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                Asset ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="assetId"
                name="assetId"
                value={formData.assetId}
                onChange={handleChange}
                required
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., AST-001"
              />
            </div>

            {/* Asset Name */}
            <div>
              <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Name
              </label>
              <input
                type="text"
                id="assetName"
                name="assetName"
                value={formData.assetName}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., HVAC Unit A"
              />
            </div>

            {/* Asset Type */}
            <div>
              <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-1">
                Asset Type
              </label>
              <input
                type="text"
                id="assetType"
                name="assetType"
                value={formData.assetType}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., Mechanical"
              />
            </div>

            {/* Estimated Hours */}
            <div>
              <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                Estimated Hours
              </label>
              <input
                type="number"
                id="estimatedHours"
                name="estimatedHours"
                value={formData.estimatedHours ?? ""}
                onChange={handleNumericChange}
                className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-3 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                placeholder="e.g., 8"
                min="0"
              />
            </div>
          </div>

          {/* Attachments Input */}
          <div>
            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
              Attachments
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-all duration-200">
              <div className="space-y-1 text-center">
                <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
                  >
                    <span>Upload a file</span>
                    <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
              </div>
            </div>
            {formData.attachments.length > 0 && (
              <ul className="mt-3 border border-gray-200 rounded-md divide-y divide-gray-200">
                {formData.attachments.map((file, index) => (
                  <li key={file.name} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
                    <div className="flex w-0 flex-1 items-center">
                      <Paperclip className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
                      <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <motion.button type="button" onClick={() => handleRemoveFile(file.name)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="font-medium text-red-600 hover:text-red-900 transition-colors duration-200">
                        Remove
                      </motion.button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className={`inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white transition-colors duration-200
                ${isLoading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"}
              `}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Clock className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                  Processing...
                </>
              ) : (
                <>
                  <Plus className="-ml-1 mr-2 h-5 w-5" />
                  Add Work Order
                </>
              )}
            </motion.button>
          </div>
        </form>

        {/* Success Modal */}
        <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
          <div className="flex flex-col items-center justify-center py-4">
            <CheckCircle className="text-green-500 text-6xl mb-4" />
            <p className="text-lg font-medium text-gray-800 text-center">Your work order has been added successfully!</p>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCloseSuccessModal}
              className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
            >
              Go to Work Orders
            </motion.button>
          </div>
        </Modal>
      </motion.div>
    </div>
  );
};

export default AddWorkOrderForm;
