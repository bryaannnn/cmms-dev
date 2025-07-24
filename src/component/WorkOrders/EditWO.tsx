import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ToolCaseIcon,
  XIcon,
  InfoIcon,
  ChevronDownIcon,
  User2Icon,
  SaveIcon,
  Trash2Icon,
  PaperclipIcon,
  UserIcon,
  ArrowLeftIcon, // Added for back button
} from "lucide-react";

// Define the WorkOrderFormData interface, same as in FormWO.tsx
interface WorkOrderFormData {
  id?: string; // Add id for existing work orders
  title: string;
  description: string;
  type: "preventive" | "corrective" | "inspection" | "emergency";
  status: "pending" | "in-progress" | "completed" | "cancelled";
  priority: "low" | "medium" | "high" | "critical";
  assignedTo: string;
  assignedToAvatar: string;
  createdBy: string;
  createdAt: string;
  dueDate: string;
  assetId: string;
  assetName: string;
  assetType: string;
  estimatedHours: number | null;
  attachments: File[];
}

// Mock useAuth hook to simulate context functions
// In a real app, this would be your actual AuthContext or a custom hook
const useAuth = () => {
  // Mock data for existing work orders
  const mockWorkOrders: WorkOrderFormData[] = [
    {
      id: "wo-001",
      title: "Perbaikan Sistem HVAC",
      description: "Sistem HVAC di lantai 3 tidak berfungsi dengan baik, perlu diperiksa dan diperbaiki.",
      type: "corrective",
      status: "in-progress",
      priority: "high",
      assignedTo: "John Doe",
      assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
      createdBy: "System Admin",
      createdAt: "2023-01-15",
      dueDate: "2023-01-20",
      assetId: "HVAC-001",
      assetName: "Unit HVAC Lantai 3",
      assetType: "facility",
      estimatedHours: 12,
      attachments: [],
    },
    {
      id: "wo-002",
      title: "Inspeksi Mingguan Peralatan",
      description: "Inspeksi rutin semua peralatan produksi di area A.",
      type: "inspection",
      status: "pending",
      priority: "medium",
      assignedTo: "Jane Smith",
      assignedToAvatar: "https://placehold.co/40x40/009688/FFFFFF?text=JS",
      createdBy: "System Admin",
      createdAt: "2023-01-10",
      dueDate: "2023-01-17",
      assetId: "PROD-005",
      assetName: "Lini Produksi 1",
      assetType: "machine",
      estimatedHours: 8,
      attachments: [],
    },
  ];

  const getWorkOrderById = async (id: string): Promise<WorkOrderFormData | undefined> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const workOrder = mockWorkOrders.find((wo) => wo.id === id);
        resolve(workOrder);
      }, 500); // Simulate network delay
    });
  };

  const updateWorkOrder = async (workOrderData: WorkOrderFormData) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        console.log("Updating Work Order Data:", workOrderData);
        resolve({ success: true, message: "Work order updated successfully!" });
      }, 1500); // Simulate network delay
    });
  };

  return { getWorkOrderById, updateWorkOrder };
};

const EditWorkOrder: React.FC = () => {
  const { id } = useParams<{ id: string }>(); // Get ID from URL params
  const { getWorkOrderById, updateWorkOrder } = useAuth(); // Use mock auth context
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [initialLoad, setInitialLoad] = useState(true); // To prevent immediate error message

  const [formData, setFormData] = useState<WorkOrderFormData>({
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

  // Fetch work order data on component mount
  useEffect(() => {
    const fetchWorkOrder = async () => {
      if (!id) {
        setError("Work Order ID not provided.");
        setInitialLoad(false);
        return;
      }

      setLoading(true);
      try {
        const data = await getWorkOrderById(id);
        if (data) {
          // Ensure attachments are File objects if they were serialized
          const attachments = data.attachments || [];
          setFormData({
            ...data,
            // Ensure dueDate is in YYYY-MM-DD format for input type="date"
            dueDate: data.dueDate.split("T")[0],
            attachments: attachments,
          });
        } else {
          setError(`Work Order with ID "${id}" not found.`);
        }
      } catch (err: any) {
        setError("Failed to fetch work order data. Please try again.");
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
        setInitialLoad(false);
      }
    };

    fetchWorkOrder();
  }, [id, getWorkOrderById]);

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
        id: id, // Ensure ID is included for update
      };

      await updateWorkOrder(dataToSend); // Call updateWorkOrder
      setSuccess("Catatan perintah kerja berhasil diperbarui!");
      navigate("/workorders"); // Redirect after successful update
    } catch (err: any) {
      setError(err.message || "Gagal memperbarui catatan perintah kerja. Silakan coba lagi.");
      console.error("Submission error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate("/workorders");
  };

  // Show loading indicator or error message if initial data is not loaded
  if (initialLoad) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center font-inter">
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative shadow-sm flex items-center">
          <span className="animate-spin inline-block mr-3 text-xl">⚙️</span>
          <strong className="font-bold">Memuat!</strong>
          <span className="block sm:inline"> Memuat data perintah kerja...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 font-inter">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center">
              <ToolCaseIcon className="mr-3 text-blue-600" /> Edit Perintah Kerja
            </h1>
            <p className="text-gray-600 mt-1">Perbarui detail perintah kerja yang ada</p>
          </div>
          <button onClick={handleBack} className="px-4 py-2 rounded-lg bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors duration-200 shadow-sm flex items-center" aria-label="Kembali ke daftar perintah kerja">
            <ArrowLeftIcon className="mr-2" /> Kembali
          </button>
        </div>

        {loading && (
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg relative mb-4 shadow-sm" role="alert">
            <strong className="font-bold">Memproses!</strong>
            <span className="block sm:inline"> Memperbarui data perintah kerja...</span>
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
            <strong className="font-bold">Berhasil!</strong>
            <span className="block sm:inline"> {success}</span>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <InfoIcon className="mr-2 text-blue-500" /> Detail Perintah Kerja
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                    Judul Perintah Kerja<span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    id="title"
                    value={formData.title}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: Perbaikan Sistem HVAC"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    id="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Berikan deskripsi detail tentang pekerjaan yang dibutuhkan..."
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Perintah Kerja<span className="text-red-500">*</span>
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
                    Prioritas<span className="text-red-500">*</span>
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
                <ToolCaseIcon className="mr-2 text-green-500" /> Informasi Aset
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assetId" className="block text-sm font-medium text-gray-700 mb-1">
                    ID Aset
                  </label>
                  <input
                    type="text"
                    name="assetId"
                    id="assetId"
                    value={formData.assetId}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: AST-001"
                  />
                </div>
                <div>
                  <label htmlFor="assetName" className="block text-sm font-medium text-gray-700 mb-1">
                    Nama Aset
                  </label>
                  <input
                    type="text"
                    name="assetName"
                    id="assetName"
                    value={formData.assetName}
                    onChange={handleChange}
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150"
                    placeholder="Contoh: Kompresor #3"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="assetType" className="block text-sm font-medium text-gray-700 mb-1">
                  Jenis Aset
                </label>
                <div className="relative">
                  <select name="assetType" id="assetType" value={formData.assetType} onChange={handleChange} className="w-full p-2.5 border border-gray-300 rounded-lg appearance-none focus:ring-blue-500 focus:border-blue-500 pr-8 bg-white">
                    <option value="">Pilih Jenis Aset</option>
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

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <UserIcon className="mr-2 text-purple-500" /> Penugasan & Estimasi
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-1">
                    Ditugaskan Kepada<span className="text-red-500">*</span>
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
                    Estimasi Jam
                  </label>
                  <input
                    type="number"
                    name="estimatedHours"
                    id="estimatedHours"
                    value={formData.estimatedHours ?? ""}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 transition duration-150 no-spin-button"
                    placeholder="Contoh: 8"
                  />
                </div>
              </div>
              <div className="mt-4">
                <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Jatuh Tempo<span className="text-red-500">*</span>
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

            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                <PaperclipIcon className="mr-2 text-orange-500" /> Lampiran
              </h2>
              <div>
                <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
                  Unggah File (Gambar, PDF, Excel)
                </label>
                <input
                  type="file"
                  name="attachments"
                  id="attachments"
                  multiple
                  accept="image/*, application/pdf, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, .csv" // MIME types for images, PDF, XLSX, CSV
                  onChange={handleChange}
                  className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                {formData.attachments.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    <p>File terpilih:</p>
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

            <div className="flex flex-col sm:flex-row justify-end gap-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleBack} // Back button
                className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
              >
                <ArrowLeftIcon className="inline mr-2" /> Kembali
              </button>
              <button
                type="submit"
                className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="animate-spin inline-block mr-2">⚙️</span> Memperbarui...
                  </>
                ) : (
                  <>
                    <SaveIcon className="inline mr-2" /> Perbarui Perintah Kerja
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

export default EditWorkOrder;
