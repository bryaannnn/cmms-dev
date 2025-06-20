import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Replaced react-icons/fi imports with inline SVG equivalents.
// For example, FiSave becomes a SVG element representing a save icon.
// The actual paths (d attributes) for these SVGs would need to be accurate.
// For demonstration purposes, I will use simplified or placeholder SVG paths.
// In a real application, you'd get the precise SVG paths from icon libraries or assets.

// --- Mock Types and useAuth for demonstration ---
// In your actual application, these would come from your existing AuthContext.
interface WorkOrderFormData {
  title: string;
  description: string;
  type: "preventive" | "corrective" | "inspection" | "emergency";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  assignedToAvatar: string;
  createdBy: string;
  createdAt: string; // Date string (YYYY-MM-DD)
  dueDate: string; // Date string (YYYY-MM-DD)
  assetId: string;
  assetName: string;
  assetType: string;
  estimatedHours: number | null; // Use null for empty number inputs
  attachments: File[]; // Added for file uploads
}

// Mock useAuth for standalone testing. Replace with your actual useAuth.
const useAuth = () => {
  // Simulate an async function for submitting work order data
  const submitWorkOrder = async (workOrderData: WorkOrderFormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Submitting Work Order Data:", workOrderData);
        // In a real scenario, you'd handle file uploads here (e.g., to Firebase Storage)
        // and then save the file URLs/references with the work order data in Firestore.
        console.log(
          "Attachments:",
          workOrderData.attachments.map((file) => file.name)
        );
        // Simulate success
        resolve({ success: true, message: "Work order submitted successfully!" });
      }, 1500); // Simulate network delay
    });
  };

  return { submitWorkOrder };
};
// --- End Mock Types and useAuth ---

const FormWorkOrders: React.FC = () => {
  const { submitWorkOrder } = useAuth(); // Use your actual useAuth
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Initial form data based on the provided AddWorkOrderForm structure
  const [formData, setFormData] = useState<WorkOrderFormData>({
    title: "",
    description: "",
    type: "preventive",
    status: "pending",
    priority: "medium",
    assignedTo: "John Doe", // Example default
    assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD", // Example default
    createdBy: "System Admin", // Example default
    createdAt: new Date().toISOString().split("T")[0],
    dueDate: "",
    assetId: "",
    assetName: "",
    assetType: "",
    estimatedHours: null,
    attachments: [], // Initialize attachments as an empty array
  });

  // Master data options (hardcoded for now, could be fetched from API if needed)
  const workOrderTypes = [
    { id: "preventive", name: "Preventive Maintenance" },
    { id: "corrective", name: "Corrective Maintenance" },
    { id: "inspection", name: "Inspection" },
    { id: "emergency", name: "Emergency Repair" },
  ];

  const priorities = [
    { id: "low", name: "Low" },
    { id: "medium", name: "Medium" },
    { id: "high", name: "High" },
    { id: "critical", name: "Critical" },
  ];

  const assignedToList = [
    { id: "John Doe", name: "John Doe", avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD" },
    { id: "Jane Smith", name: "Jane Smith", avatar: "https://placehold.co/40x40/009688/FFFFFF?text=JS" },
    { id: "Robert Johnson", name: "Robert Johnson", avatar: "https://placehold.co/40x40/FF5722/FFFFFF?text=RJ" },
    { id: "Emily Davis", name: "Emily Davis", avatar: "https://placehold.co/40x40/4CAF50/FFFFFF?text=ED" },
  ];

  const assetTypes = [
    { id: "machine", name: "Machine" },
    { id: "vehicle", name: "Vehicle" },
    { id: "facility", name: "Facility" },
    { id: "tool", name: "Tool" },
  ];

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, files } = e.target as HTMLInputElement;
    setFormData((prev) => {
      if (name === "attachments" && files) {
        return {
          ...prev,
          attachments: Array.from(files),
        };
      }

      if (name === "estimatedHours") {
        const numValue = parseFloat(value);
        return {
          ...prev,
          [name]: isNaN(numValue) ? null : numValue,
        };
      }
      return {
        ...prev,
        [name]: value,
      };
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (!formData.title || !formData.type || !formData.priority || !formData.assignedTo || !formData.dueDate) {
        throw new Error("Please fill in all required fields.");
      }

      const selectedAssignedTo = assignedToList.find((tech) => tech.id === formData.assignedTo);

      const dataToSend: WorkOrderFormData = {
        ...formData,
        estimatedHours: formData.estimatedHours ?? 0,
        assignedToAvatar: selectedAssignedTo?.avatar || "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      };

      await submitWorkOrder(dataToSend);
      setSuccess("Catatan perintah kerja berhasil disimpan!");
      handleClear();
      navigate("/workorders/dashboard");
    } catch (err: any) {
      setError(err.message || "Gagal menyimpan catatan perintah kerja. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = useCallback(() => {
    setFormData({
      title: "",
      description: "",
      type: "preventive",
      status: "pending",
      priority: "medium",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "System Admin",
      createdAt: new Date().toISOString().split("T")[0],
      dueDate: "",
      assetId: "",
      assetName: "",
      assetType: "",
      estimatedHours: null,
      attachments: [],
    });
    setError(null);
    setSuccess(null);
  }, []);

  // Inline SVG for icons to replace react-icons/fi
  const ToolIcon = ({ className = "mr-3 text-blue-600", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1 0 8.49V20H2v-2.77a6 6 0 0 1 0-8.49l3.77-3.77a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0L1.47 4.54a2 2 0 0 0 0 2.83l12.7 12.7a2 2 0 0 0 2.83 0L22.56 9.47a2 2 0 0 0 0-2.83l-1.6-1.6a1 1 0 0 0-1.4 0z" />
    </svg>
  );

  const XIcon = ({ className = "text-xl", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"></line>
      <line x1="6" y1="6" x2="18" y2="18"></line>
    </svg>
  );

  const InfoIcon = ({ className = "mr-2 text-blue-500", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="12" y1="16" x2="12" y2="12"></line>
      <line x1="12" y1="8" x2="12.01" y2="8"></line>
    </svg>
  );

  const ChevronDownIcon = ({ className = "absolute right-3 top-3.5 text-gray-400", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  const UserIcon = ({ className = "mr-2 text-purple-500", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
      <circle cx="12" cy="7" r="4"></circle>
    </svg>
  );

  const SaveIcon = ({ className = "inline mr-2", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
      <polyline points="17 21 17 13 7 13 7 21"></polyline>
      <polyline points="7 3 7 8 15 8"></polyline>
    </svg>
  );

  const Trash2Icon = ({ className = "inline mr-2", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="3 6 5 6 21 6"></polyline>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
      <line x1="10" y1="11" x2="10" y2="17"></line>
      <line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
  );

  const PaperclipIcon = ({ className = "mr-2 text-orange-500", size = "1em" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.2a2 2 0 1 1-2.83-2.83l8.49-8.48"></path>
    </svg>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-inter">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <ToolIcon className="mr-3 text-blue-600" /> Perintah Kerja Baru {/* New Work Order */}
            </h1>
            <p className="text-gray-600 mt-1">Buat perintah kerja perawatan baru</p> {/* Create a new maintenance work order */}
          </div>
          <button
            onClick={() => navigate("/workorders/dashboard")}
            className="p-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm"
            aria-label="Tutup formulir" // Close form
          >
            <XIcon className="text-xl" />
          </button>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
            <strong className="font-bold">Memproses!</strong> {/* Processing! */}
            <span className="block sm:inline"> Menyimpan data perintah kerja...</span> {/* Saving work order data... */}
          </div>
        )}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
            <strong className="font-bold">Error!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
            <strong className="font-bold">Berhasil!</strong> {/* Success! */}
            <span className="block sm:inline"> {success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {/* Work Order Details */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <InfoIcon className="mr-2 text-blue-500" /> Detail Perintah Kerja {/* Work Order Details */}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Perintah Kerja<span className="text-red-500">*</span> {/* Work Order Title */}
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: Perbaikan Sistem HVAC" // e.g., HVAC System Repair
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi {/* Description */}
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Berikan deskripsi detail tentang pekerjaan yang dibutuhkan..." // Provide a detailed description of the work needed...
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Perintah Kerja<span className="text-red-500">*</span> {/* Work Order Type */}
                  </label>
                  <div className="relative">
                    <select name="type" id="type" value={formData.type} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white" required>
                      {workOrderTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                    Prioritas<span className="text-red-500">*</span> {/* Priority */}
                  </label>
                  <div className="relative">
                    <select
                      name="priority"
                      id="priority"
                      value={formData.priority}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                      required
                    >
                      {priorities.map((priority) => (
                        <option key={priority.id} value={priority.id}>
                          {priority.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Information */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <ToolIcon className="mr-2 text-green-500" /> Informasi Aset {/* Asset Information */}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Aset {/* Asset ID */}
                  </label>
                  <input
                    type="text"
                    name="assetId"
                    id="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: AST-001" // e.g., AST-001
                  />
                </div>
                <div>
                  <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Aset {/* Asset Name */}
                  </label>
                  <input
                    type="text"
                    name="assetName"
                    id="assetName"
                    value={formData.assetName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: Kompresor #3" // e.g., Compressor #3
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Aset {/* Asset Type */}
                </label>
                <div className="relative">
                  <select name="assetType" id="assetType" value={formData.assetType} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="">Pilih Jenis Aset</option> {/* Select Asset Type */}
                    {assetTypes.map((assetType) => (
                      <option key={assetType.id} value={assetType.id}>
                        {assetType.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Assignment & Estimates */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="mr-2 text-purple-500" /> Penugasan & Estimasi {/* Assignment & Estimates */}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                    Ditugaskan Kepada<span className="text-red-500">*</span> {/* Assigned To */}
                  </label>
                  <div className="relative">
                    <select
                      name="assignedTo"
                      id="assignedTo"
                      value={formData.assignedTo}
                      onChange={handleChange}
                      className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white"
                      required
                    >
                      {assignedToList.map((person) => (
                        <option key={person.id} value={person.id}>
                          {person.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDownIcon className="absolute right-3 top-3.5 text-gray-400" />
                  </div>
                </div>
                <div>
                  <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700 mb-1">
                    Estimasi Jam {/* Estimated Hours */}
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    id="estimatedHours"
                    value={formData.estimatedHours ?? ""} // Handle null for empty input
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    placeholder="Contoh: 8" // e.g., 8
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Jatuh Tempo<span className="text-red-500">*</span> {/* Due Date */}
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                  required
                />
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PaperclipIcon className="mr-2 text-orange-500" /> Lampiran {/* Attachments */}
              </h2>
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                  Unggah File (Gambar, PDF, Excel) {/* Upload Files (Images, PDF, Excel) */}
                </label>
                <input
                  type="file"
                  name="attachments"
                  id="attachments"
                  multiple // Allow multiple files
                  accept="image/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv" // MIME types for images, PDF, XLSX, CSV
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {formData.attachments.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>File terpilih:</p> {/* Selected files: */}
                    <ul className="list-disc list-inside ml-4">
                      {formData.attachments.map((file, index) => (
                        <li key={index}>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClear}
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <Trash2Icon className="inline mr-2" /> Hapus Formulir {/* Clear Form */}
              </button>
              <button
                type="submit"
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Membuat... {/* Creating... */}
                  </>
                ) : (
                  <>
                    <SaveIcon className="inline mr-2" /> Buat Perintah Kerja {/* Create Work Order */}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default FormWorkOrders;
