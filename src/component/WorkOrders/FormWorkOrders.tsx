// import React, { useState, useEffect } from "react";
// import {
//   FiPlus,
//   FiUpload,
//   FiChevronUp,
//   FiAlertTriangle,
//   FiTool,
//   FiCheckCircle,
//   FiUsers,
//   FiBarChart2,
//   FiDatabase,
//   FiClipboard,
//   FiFilter,
//   FiPackage,
//   FiChevronLeft,
//   FiHome,
//   FiX,
//   FiChevronDown,
//   FiChevronRight,
//   FiSearch,
//   FiLogOut,
//   FiSun,
//   FiMoon,
//   FiSettings,
//   FiBell,
//   FiEdit,
//   FiEye,
//   FiClock,
//   FiUser,
//   FiCalendar,
//   FiFlag,
//   FiStar,
//   FiPrinter,
//   FiMessageSquare,
//   FiBook,
//   FiExternalLink,
//   FiTag,
//   FiLayers,
//   FiTruck,
//   FiPhone,
//   FiMail,
//   FiList,
//   FiGrid,
// } from "react-icons/fi";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../../routes/AuthContext";
// import logoWida from "../../assets/logo-wida.png";
// import { motion, AnimatePresence } from "framer-motion";
// import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

// // Types
// type WorkOrderStatus = "pending" | "in-progress" | "completed" | "cancelled" | "on-hold" | "escalated";
// type WorkOrderPriority = "low" | "medium" | "high" | "critical";
// type WorkOrderType = "preventive" | "corrective" | "inspection" | "emergency";
// type UserRole = "customer" | "helpdesk" | "technician" | "supervisor" | "vendor" | "admin";

// interface User {
//   id: string;
//   name: string;
//   email: string;
//   phone: string;
//   mobile: string;
//   role: UserRole;
//   avatar: string;
//   department: string;
// }

// interface Asset {
//   id: string;
//   name: string;
//   type: string;
//   location: string;
//   model: string;
//   serialNumber: string;
//   purchaseDate: string;
//   warrantyExpiration: string;
//   status: "operational" | "maintenance" | "out-of-service";
// }

// interface KnowledgeBaseArticle {
//   id: string;
//   title: string;
//   content: string;
//   tags: string[];
//   relatedWorkOrders: string[];
//   createdBy: string;
//   createdAt: string;
//   updatedAt: string;
// }

// interface WorkOrder {
//   id: string;
//   title: string;
//   description: string;
//   type: WorkOrderType;
//   status: WorkOrderStatus;
//   priority: WorkOrderPriority;
//   assignedTo: string;
//   assignedToAvatar: string;
//   createdBy: string;
//   createdAt: string;
//   dueDate: string;
//   completedAt: string;
//   assetId: string;
//   assetName: string;
//   assetType: string;
//   estimatedHours: number;
//   actualHours: number;
//   cost: number;
//   checklistItems: { id: string; task: string; completed: boolean }[];
//   notes: string[];
//   customerDetails: {
//     name: string;
//     department: string;
//     phone: string;
//     mobile: string;
//     email: string;
//   };
//   escalationHistory: {
//     level: number;
//     reason: string;
//     escalatedBy: string;
//     escalatedAt: string;
//     resolvedBy?: string;
//   }[];
//   relatedKBArticles: string[];
// }

// interface NavItemProps {
//   icon: React.ReactNode;
//   text: string;
//   to: string;
//   expanded: boolean;
//   badge?: number;
// }

// const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded, badge }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const active = location.pathname === to;

//   return (
//     <motion.button
//       onClick={() => navigate(to)}
//       whileHover={{ scale: 1.02 }}
//       whileTap={{ scale: 0.98 }}
//       className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
//         ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
//       `}
//     >
//       <span className="text-xl relative">
//         {icon}
//         {badge && badge > 0 && <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{badge}</span>}
//       </span>
//       {expanded && (
//         <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
//           {text}
//         </motion.span>
//       )}
//     </motion.button>
//   );
// };

// const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode; onClick?: () => void }> = ({ title, value, change, icon, onClick }) => {
//   const isPositive = change.startsWith("+");

//   return (
//     <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 cursor-pointer" onClick={onClick}>
//       <div className="flex items-center justify-between">
//         <div>
//           <p className="text-sm font-medium text-gray-600">{title}</p>
//           <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
//         </div>
//         <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="p-3 rounded-full bg-blue-50 text-blue-600 text-2xl">
//           {icon}
//         </motion.div>
//       </div>
//       <motion.p animate={{ x: isPositive ? [0, 2, 0] : [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`mt-3 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
//         {change} from last month
//       </motion.p>
//     </motion.div>
//   );
// };

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
//   size?: "sm" | "md" | "lg" | "xl";
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = "md" }) => {
//   if (!isOpen) return null;

//   const sizeClasses = {
//     sm: "max-w-sm",
//     md: "max-w-md",
//     lg: "max-w-lg",
//     xl: "max-w-4xl",
//   };

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//       <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className={`bg-white rounded-xl shadow-2xl w-full mx-auto p-6 ${sizeClasses[size]}`}>
//         <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
//           <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
//           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
//             <FiX />
//           </motion.button>
//         </div>
//         <div className="max-h-[80vh] overflow-y-auto custom-scrollbar">{children}</div>
//       </motion.div>
//     </motion.div>
//   );
// };

// interface AddWorkOrderFormProps {
//   onAddWorkOrder: (workOrder: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "escalationHistory" | "relatedKBArticles">) => void;
//   currentUser: User;
//   assets: Asset[];
//   users: User[];
// }

// const AddWorkOrderForm: React.FC<AddWorkOrderFormProps> = ({ onAddWorkOrder, currentUser, assets, users }) => {
//   const [formData, setFormData] = useState<Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "escalationHistory" | "relatedKBArticles">>({
//     title: "",
//     description: "",
//     type: "preventive",
//     status: "pending",
//     priority: "medium",
//     assignedTo: "",
//     assignedToAvatar: "",
//     createdBy: currentUser.name,
//     createdAt: new Date().toISOString().split("T")[0],
//     dueDate: "",
//     assetId: "",
//     assetName: "",
//     assetType: "",
//     estimatedHours: 0,
//     customerDetails: {
//       name: currentUser.role === "customer" ? currentUser.name : "",
//       department: currentUser.department || "",
//       phone: currentUser.phone || "",
//       mobile: currentUser.mobile || "",
//       email: currentUser.email || "",
//     },
//   });

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;

//     if (name.startsWith("customerDetails.")) {
//       const field = name.split(".")[1];
//       setFormData((prev) => ({
//         ...prev,
//         customerDetails: {
//           ...prev.customerDetails,
//           [field]: value,
//         },
//       }));
//     } else {
//       setFormData((prev) => ({ ...prev, [name]: value }));
//     }
//   };

//   const handleAssetChange = (assetId: string) => {
//     const selectedAsset = assets.find((a) => a.id === assetId);
//     if (selectedAsset) {
//       setFormData((prev) => ({
//         ...prev,
//         assetId: selectedAsset.id,
//         assetName: selectedAsset.name,
//         assetType: selectedAsset.type,
//       }));
//     }
//   };

//   const handleAssigneeChange = (userId: string) => {
//     const selectedUser = users.find((u) => u.id === userId);
//     if (selectedUser) {
//       setFormData((prev) => ({
//         ...prev,
//         assignedTo: selectedUser.name,
//         assignedToAvatar: selectedUser.avatar,
//       }));
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate required fields
//     if (!formData.title || !formData.dueDate) {
//       alert("Please fill in all required fields");
//       return;
//     }

//     // For customers, auto-assign to helpdesk
//     if (currentUser.role === "customer") {
//       const helpdeskUser = users.find((u) => u.role === "helpdesk");
//       if (helpdeskUser) {
//         formData.assignedTo = helpdeskUser.name;
//         formData.assignedToAvatar = helpdeskUser.avatar;
//       }
//     }

//     onAddWorkOrder(formData);
//     setFormData({
//       title: "",
//       description: "",
//       type: "preventive",
//       status: "pending",
//       priority: "medium",
//       assignedTo: "",
//       assignedToAvatar: "",
//       createdBy: currentUser.name,
//       createdAt: new Date().toISOString().split("T")[0],
//       dueDate: "",
//       assetId: "",
//       assetName: "",
//       assetType: "",
//       estimatedHours: 0,
//       customerDetails: {
//         name: currentUser.role === "customer" ? currentUser.name : "",
//         department: currentUser.department || "",
//         phone: currentUser.phone || "",
//         mobile: currentUser.mobile || "",
//         email: currentUser.email || "",
//       },
//     });
//   };

//   return (
//     <form onSubmit={handleSubmit} className="space-y-4">
//       <div>
//         <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//           Work Order Title*
//         </label>
//         <input
//           type="text"
//           id="title"
//           name="title"
//           value={formData.title}
//           onChange={handleChange}
//           required
//           className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//         />
//       </div>

//       <div>
//         <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//           Description*
//         </label>
//         <textarea
//           id="description"
//           name="description"
//           value={formData.description}
//           onChange={handleChange}
//           rows={3}
//           required
//           className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//         />
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="type" className="block text-sm font-medium text-gray-700">
//             Work Order Type*
//           </label>
//           <select
//             id="type"
//             name="type"
//             value={formData.type}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           >
//             <option value="preventive">Preventive Maintenance</option>
//             <option value="corrective">Corrective Maintenance</option>
//             <option value="inspection">Inspection</option>
//             <option value="emergency">Emergency Repair</option>
//           </select>
//         </div>

//         <div>
//           <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
//             Priority*
//           </label>
//           <select
//             id="priority"
//             name="priority"
//             value={formData.priority}
//             onChange={handleChange}
//             required
//             className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           >
//             <option value="low">Low</option>
//             <option value="medium">Medium</option>
//             <option value="high">High</option>
//             <option value="critical">Critical</option>
//           </select>
//         </div>
//       </div>

//       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//         <div>
//           <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
//             Asset
//           </label>
//           <select
//             id="assetId"
//             name="assetId"
//             value={formData.assetId}
//             onChange={(e) => handleAssetChange(e.target.value)}
//             className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           >
//             <option value="">Select an asset</option>
//             {assets.map((asset) => (
//               <option key={asset.id} value={asset.id}>
//                 {asset.name} ({asset.id})
//               </option>
//             ))}
//           </select>
//         </div>

//         <div>
//           <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
//             Estimated Hours
//           </label>
//           <input
//             type="number"
//             id="estimatedHours"
//             name="estimatedHours"
//             value={formData.estimatedHours}
//             onChange={handleChange}
//             min="0"
//             step="0.5"
//             className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           />
//         </div>
//       </div>

//       {currentUser.role !== "customer" && (
//         <div>
//           <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
//             Assign To
//           </label>
//           <select
//             id="assignedTo"
//             name="assignedTo"
//             value={users.find((u) => u.name === formData.assignedTo)?.id || ""}
//             onChange={(e) => handleAssigneeChange(e.target.value)}
//             className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//           >
//             <option value="">Select assignee</option>
//             {users
//               .filter((u) => u.role === "technician" || u.role === "helpdesk")
//               .map((user) => (
//                 <option key={user.id} value={user.id}>
//                   {user.name} ({user.role})
//                 </option>
//               ))}
//           </select>
//         </div>
//       )}

//       <div>
//         <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
//           Due Date*
//         </label>
//         <input
//           type="date"
//           id="dueDate"
//           name="dueDate"
//           value={formData.dueDate}
//           onChange={handleChange}
//           required
//           min={new Date().toISOString().split("T")[0]}
//           className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//         />
//       </div>

//       <div className="border-t border-blue-100 pt-4">
//         <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Details</h3>
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
//               Name*
//             </label>
//             <input
//               type="text"
//               id="customerName"
//               name="customerDetails.name"
//               value={formData.customerDetails.name}
//               onChange={handleChange}
//               required
//               disabled={currentUser.role === "customer"}
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 ${
//                 currentUser.role === "customer" ? "bg-gray-100 cursor-not-allowed" : "bg-white"
//               }`}
//             />
//           </div>

//           <div>
//             <label htmlFor="customerDepartment" className="block text-sm font-medium text-gray-700">
//               Department*
//             </label>
//             <input
//               type="text"
//               id="customerDepartment"
//               name="customerDetails.department"
//               value={formData.customerDetails.department}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//           <div>
//             <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
//               Phone
//             </label>
//             <input
//               type="tel"
//               id="customerPhone"
//               name="customerDetails.phone"
//               value={formData.customerDetails.phone}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             />
//           </div>

//           <div>
//             <label htmlFor="customerMobile" className="block text-sm font-medium text-gray-700">
//               Mobile
//             </label>
//             <input
//               type="tel"
//               id="customerMobile"
//               name="customerDetails.mobile"
//               value={formData.customerDetails.mobile}
//               onChange={handleChange}
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             />
//           </div>

//           <div>
//             <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
//               Email*
//             </label>
//             <input
//               type="email"
//               id="customerEmail"
//               name="customerDetails.email"
//               value={formData.customerDetails.email}
//               onChange={handleChange}
//               required
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//             />
//           </div>
//         </div>
//       </div>

//       <div className="flex justify-end space-x-3 mt-6">
//         <motion.button
//           type="button"
//           onClick={() => {
//             // Reset form
//             setFormData({
//               title: "",
//               description: "",
//               type: "preventive",
//               status: "pending",
//               priority: "medium",
//               assignedTo: "",
//               assignedToAvatar: "",
//               createdBy: currentUser.name,
//               createdAt: new Date().toISOString().split("T")[0],
//               dueDate: "",
//               assetId: "",
//               assetName: "",
//               assetType: "",
//               estimatedHours: 0,
//               customerDetails: {
//                 name: currentUser.role === "customer" ? currentUser.name : "",
//                 department: currentUser.department || "",
//                 phone: currentUser.phone || "",
//                 mobile: currentUser.mobile || "",
//                 email: currentUser.email || "",
//               },
//             });
//           }}
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.97 }}
//           className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//         >
//           Reset
//         </motion.button>
//         <motion.button
//           type="submit"
//           whileHover={{ scale: 1.03 }}
//           whileTap={{ scale: 0.97 }}
//           className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//         >
//           Create Work Order
//         </motion.button>
//       </div>
//     </form>
//   );
// };

// interface WorkOrderDetailsFormProps {
//   workOrder: WorkOrder;
//   isEditing: boolean;
//   onSave: (workOrder: WorkOrder) => void;
//   onCancel: () => void;
//   onComplete: (workOrder: WorkOrder) => void;
//   onPrint: (workOrder: WorkOrder) => void;
//   onEscalate: (workOrder: WorkOrder, level: number, reason: string) => void;
//   currentUser: User;
//   users: User[];
//   knowledgeBase: KnowledgeBaseArticle[];
//   assets: Asset[];
// }

// const WorkOrderDetailsForm: React.FC<WorkOrderDetailsFormProps> = ({ workOrder, isEditing, onSave, onCancel, onComplete, onPrint, onEscalate, currentUser, users, knowledgeBase, assets }) => {
//   const [formData, setFormData] = useState<WorkOrder>(workOrder);
//   const [newChecklistItem, setNewChecklistItem] = useState("");
//   const [newNote, setNewNote] = useState("");
//   const [showEscalateForm, setShowEscalateForm] = useState(false);
//   const [escalationReason, setEscalationReason] = useState("");
//   const [escalationLevel, setEscalationLevel] = useState(1);
//   const [showKBModal, setShowKBModal] = useState(false);
//   const [selectedKBArticle, setSelectedKBArticle] = useState<KnowledgeBaseArticle | null>(null);

//   useEffect(() => {
//     setFormData(workOrder);
//   }, [workOrder]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleChecklistToggle = (id: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       checklistItems: prev.checklistItems.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)),
//     }));
//   };

//   const handleAddChecklistItem = () => {
//     if (newChecklistItem.trim()) {
//       setFormData((prev) => ({
//         ...prev,
//         checklistItems: [
//           ...prev.checklistItems,
//           {
//             id: `item-${Date.now()}`,
//             task: newChecklistItem,
//             completed: false,
//           },
//         ],
//       }));
//       setNewChecklistItem("");
//     }
//   };

//   const handleRemoveChecklistItem = (id: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       checklistItems: prev.checklistItems.filter((item) => item.id !== id),
//     }));
//   };

//   const handleAddNote = () => {
//     if (newNote.trim()) {
//       setFormData((prev) => ({
//         ...prev,
//         notes: [...prev.notes, newNote],
//       }));
//       setNewNote("");
//     }
//   };

//   const handleRemoveNote = (index: number) => {
//     setFormData((prev) => ({
//       ...prev,
//       notes: prev.notes.filter((_, i) => i !== index),
//     }));
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     onSave(formData);
//   };

//   const handleCompleteWorkOrder = () => {
//     const completedWorkOrder: WorkOrder = {
//       ...formData,
//       status: "completed",
//       completedAt: new Date().toISOString().split("T")[0],
//       actualHours: formData.actualHours || formData.estimatedHours,
//     };
//     onComplete(completedWorkOrder);
//   };

//   const handleEscalate = () => {
//     if (!escalationReason) {
//       alert("Please provide a reason for escalation");
//       return;
//     }

//     const escalatedWorkOrder: WorkOrder = {
//       ...formData,
//       status: "escalated",
//       escalationHistory: [
//         ...formData.escalationHistory,
//         {
//           level: escalationLevel,
//           reason: escalationReason,
//           escalatedBy: currentUser.name,
//           escalatedAt: new Date().toISOString().split("T")[0],
//         },
//       ],
//     };

//     // Auto-assign to supervisor or vendor based on escalation level
//     if (escalationLevel === 1) {
//       const supervisor = users.find((u) => u.role === "supervisor");
//       if (supervisor) {
//         escalatedWorkOrder.assignedTo = supervisor.name;
//         escalatedWorkOrder.assignedToAvatar = supervisor.avatar;
//       }
//     } else if (escalationLevel === 2) {
//       const vendor = users.find((u) => u.role === "vendor");
//       if (vendor) {
//         escalatedWorkOrder.assignedTo = vendor.name;
//         escalatedWorkOrder.assignedToAvatar = vendor.avatar;
//       }
//     }

//     onEscalate(escalatedWorkOrder, escalationLevel, escalationReason);
//     setShowEscalateForm(false);
//     setEscalationReason("");
//   };

//   const handleAddKBReference = (articleId: string) => {
//     if (!formData.relatedKBArticles.includes(articleId)) {
//       setFormData((prev) => ({
//         ...prev,
//         relatedKBArticles: [...prev.relatedKBArticles, articleId],
//       }));
//     }
//     setShowKBModal(false);
//   };

//   const handleRemoveKBReference = (articleId: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       relatedKBArticles: prev.relatedKBArticles.filter((id) => id !== articleId),
//     }));
//   };

//   const handleAssetChange = (assetId: string) => {
//     const selectedAsset = assets.find((a) => a.id === assetId);
//     if (selectedAsset) {
//       setFormData((prev) => ({
//         ...prev,
//         assetId: selectedAsset.id,
//         assetName: selectedAsset.name,
//         assetType: selectedAsset.type,
//       }));
//     }
//   };

//   const handleAssigneeChange = (userId: string) => {
//     const selectedUser = users.find((u) => u.id === userId);
//     if (selectedUser) {
//       setFormData((prev) => ({
//         ...prev,
//         assignedTo: selectedUser.name,
//         assignedToAvatar: selectedUser.avatar,
//       }));
//     }
//   };

//   const canEdit =
//     isEditing &&
//     (currentUser.role === "admin" ||
//       currentUser.role === "helpdesk" ||
//       (currentUser.role === "technician" && formData.assignedTo === currentUser.name) ||
//       (currentUser.role === "supervisor" && formData.status === "escalated" && formData.escalationHistory.some((e) => e.level === 1)) ||
//       (currentUser.role === "vendor" && formData.status === "escalated" && formData.escalationHistory.some((e) => e.level === 2)));

//   const canEscalate =
//     !isEditing && ((currentUser.role === "technician" && formData.assignedTo === currentUser.name) || (currentUser.role === "supervisor" && formData.status === "escalated" && formData.escalationHistory.some((e) => e.level === 1)));

//   const canComplete =
//     !isEditing &&
//     (currentUser.role === "admin" ||
//       (currentUser.role === "technician" && formData.assignedTo === currentUser.name) ||
//       (currentUser.role === "supervisor" && formData.status === "escalated" && formData.escalationHistory.some((e) => e.level === 1)) ||
//       (currentUser.role === "vendor" && formData.status === "escalated" && formData.escalationHistory.some((e) => e.level === 2)));

//   return (
//     <div className="space-y-6">
//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-id" className="block text-sm font-medium text-gray-700">
//               Work Order ID
//             </label>
//             <input type="text" id="detail-id" value={formData.id} readOnly className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200" />
//           </div>

//           <div>
//             <label htmlFor="detail-status" className="block text-sm font-medium text-gray-700">
//               Status
//             </label>
//             <select
//               id="detail-status"
//               name="status"
//               value={formData.status}
//               onChange={handleChange}
//               disabled={!canEdit}
//               required
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             >
//               <option value="pending">Pending</option>
//               <option value="in-progress">In Progress</option>
//               <option value="on-hold">On Hold</option>
//               <option value="completed">Completed</option>
//               <option value="cancelled">Cancelled</option>
//               <option value="escalated">Escalated</option>
//             </select>
//           </div>
//         </div>

//         <div>
//           <label htmlFor="detail-title" className="block text-sm font-medium text-gray-700">
//             Title
//           </label>
//           <input
//             type="text"
//             id="detail-title"
//             name="title"
//             value={formData.title}
//             onChange={handleChange}
//             readOnly={!canEdit}
//             required
//             className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//           />
//         </div>

//         <div>
//           <label htmlFor="detail-description" className="block text-sm font-medium text-gray-700">
//             Description
//           </label>
//           <textarea
//             id="detail-description"
//             name="description"
//             value={formData.description}
//             onChange={handleChange}
//             readOnly={!canEdit}
//             rows={3}
//             className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//           />
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-type" className="block text-sm font-medium text-gray-700">
//               Type
//             </label>
//             <select
//               id="detail-type"
//               name="type"
//               value={formData.type}
//               onChange={handleChange}
//               disabled={!canEdit}
//               required
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             >
//               <option value="preventive">Preventive Maintenance</option>
//               <option value="corrective">Corrective Maintenance</option>
//               <option value="inspection">Inspection</option>
//               <option value="emergency">Emergency Repair</option>
//             </select>
//           </div>

//           <div>
//             <label htmlFor="detail-priority" className="block text-sm font-medium text-gray-700">
//               Priority
//             </label>
//             <select
//               id="detail-priority"
//               name="priority"
//               value={formData.priority}
//               onChange={handleChange}
//               disabled={!canEdit}
//               required
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             >
//               <option value="low">Low</option>
//               <option value="medium">Medium</option>
//               <option value="high">High</option>
//               <option value="critical">Critical</option>
//             </select>
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-assignedTo" className="block text-sm font-medium text-gray-700">
//               Assigned To
//             </label>
//             <select
//               id="detail-assignedTo"
//               name="assignedTo"
//               value={users.find((u) => u.name === formData.assignedTo)?.id || ""}
//               onChange={(e) => handleAssigneeChange(e.target.value)}
//               disabled={!canEdit}
//               required
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             >
//               <option value="">Select assignee</option>
//               {users
//                 .filter((u) => u.role === "technician" || u.role === "helpdesk" || u.role === "supervisor" || u.role === "vendor")
//                 .map((user) => (
//                   <option key={user.id} value={user.id}>
//                     {user.name} ({user.role})
//                   </option>
//                 ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="detail-createdBy" className="block text-sm font-medium text-gray-700">
//               Created By
//             </label>
//             <input
//               type="text"
//               id="detail-createdBy"
//               name="createdBy"
//               value={formData.createdBy}
//               onChange={handleChange}
//               readOnly
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-createdAt" className="block text-sm font-medium text-gray-700">
//               Created At
//             </label>
//             <input
//               type="date"
//               id="detail-createdAt"
//               name="createdAt"
//               value={formData.createdAt}
//               onChange={handleChange}
//               readOnly
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//             />
//           </div>

//           <div>
//             <label htmlFor="detail-dueDate" className="block text-sm font-medium text-gray-700">
//               Due Date
//             </label>
//             <input
//               type="date"
//               id="detail-dueDate"
//               name="dueDate"
//               value={formData.dueDate}
//               onChange={handleChange}
//               readOnly={!canEdit}
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             />
//           </div>
//         </div>

//         {formData.completedAt && (
//           <div>
//             <label htmlFor="detail-completedAt" className="block text-sm font-medium text-gray-700">
//               Completed At
//             </label>
//             <input
//               type="date"
//               id="detail-completedAt"
//               name="completedAt"
//               value={formData.completedAt}
//               onChange={handleChange}
//               readOnly
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//             />
//           </div>
//         )}

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-assetId" className="block text-sm font-medium text-gray-700">
//               Asset
//             </label>
//             <select
//               id="detail-assetId"
//               name="assetId"
//               value={formData.assetId}
//               onChange={(e) => handleAssetChange(e.target.value)}
//               disabled={!canEdit}
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             >
//               <option value="">Select an asset</option>
//               {assets.map((asset) => (
//                 <option key={asset.id} value={asset.id}>
//                   {asset.name} ({asset.id})
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div>
//             <label htmlFor="detail-assetName" className="block text-sm font-medium text-gray-700">
//               Asset Name
//             </label>
//             <input
//               type="text"
//               id="detail-assetName"
//               name="assetName"
//               value={formData.assetName}
//               onChange={handleChange}
//               readOnly
//               className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//             />
//           </div>
//         </div>

//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label htmlFor="detail-estimatedHours" className="block text-sm font-medium text-gray-700">
//               Estimated Hours
//             </label>
//             <input
//               type="number"
//               id="detail-estimatedHours"
//               name="estimatedHours"
//               value={formData.estimatedHours}
//               onChange={handleChange}
//               readOnly={!canEdit}
//               min="0"
//               step="0.5"
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             />
//           </div>

//           <div>
//             <label htmlFor="detail-actualHours" className="block text-sm font-medium text-gray-700">
//               Actual Hours
//             </label>
//             <input
//               type="number"
//               id="detail-actualHours"
//               name="actualHours"
//               value={formData.actualHours || ""}
//               onChange={handleChange}
//               readOnly={!canEdit}
//               min="0"
//               step="0.5"
//               className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//             />
//           </div>
//         </div>

//         <div>
//           <label htmlFor="detail-cost" className="block text-sm font-medium text-gray-700">
//             Cost ($)
//           </label>
//           <input
//             type="number"
//             id="detail-cost"
//             name="cost"
//             value={formData.cost || ""}
//             onChange={handleChange}
//             readOnly={!canEdit}
//             min="0"
//             step="0.01"
//             className={`mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 transition-all duration-200 ${canEdit ? "bg-white focus:ring-blue-500 focus:border-blue-500" : "bg-blue-50 cursor-not-allowed"}`}
//           />
//         </div>

//         <div className="border-t border-blue-100 pt-4">
//           <h3 className="text-lg font-medium text-gray-900 mb-3">Customer Details</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
//                 Name
//               </label>
//               <input
//                 type="text"
//                 id="customerName"
//                 name="customerDetails.name"
//                 value={formData.customerDetails.name}
//                 onChange={handleChange}
//                 readOnly
//                 className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label htmlFor="customerDepartment" className="block text-sm font-medium text-gray-700">
//                 Department
//               </label>
//               <input
//                 type="text"
//                 id="customerDepartment"
//                 name="customerDetails.department"
//                 value={formData.customerDetails.department}
//                 onChange={handleChange}
//                 readOnly
//                 className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//               />
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
//             <div>
//               <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
//                 Phone
//               </label>
//               <input
//                 type="tel"
//                 id="customerPhone"
//                 name="customerDetails.phone"
//                 value={formData.customerDetails.phone}
//                 onChange={handleChange}
//                 readOnly
//                 className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label htmlFor="customerMobile" className="block text-sm font-medium text-gray-700">
//                 Mobile
//               </label>
//               <input
//                 type="tel"
//                 id="customerMobile"
//                 name="customerDetails.mobile"
//                 value={formData.customerDetails.mobile}
//                 onChange={handleChange}
//                 readOnly
//                 className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//               />
//             </div>

//             <div>
//               <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
//                 Email
//               </label>
//               <input
//                 type="email"
//                 id="customerEmail"
//                 name="customerDetails.email"
//                 value={formData.customerDetails.email}
//                 onChange={handleChange}
//                 readOnly
//                 className="mt-1 block w-full border border-blue-200 rounded-md shadow-sm p-2.5 bg-blue-50 cursor-not-allowed transition-all duration-200"
//               />
//             </div>
//           </div>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Checklist Items</label>
//           <div className="space-y-2">
//             {formData.checklistItems.map((item) => (
//               <div key={item.id} className="flex items-center">
//                 <input type="checkbox" id={`checklist-${item.id}`} checked={item.completed} onChange={() => handleChecklistToggle(item.id)} disabled={!canEdit} className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-blue-200 rounded" />
//                 <label htmlFor={`checklist-${item.id}`} className={`ml-2 ${item.completed ? "line-through text-gray-500" : "text-gray-700"}`}>
//                   {item.task}
//                 </label>
//                 {canEdit && (
//                   <button type="button" onClick={() => handleRemoveChecklistItem(item.id)} className="ml-auto text-red-500 hover:text-red-700">
//                     <FiX />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           {canEdit && (
//             <div className="mt-2 flex">
//               <input
//                 type="text"
//                 value={newChecklistItem}
//                 onChange={(e) => setNewChecklistItem(e.target.value)}
//                 placeholder="Add new checklist item"
//                 className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500"
//               />
//               <button type="button" onClick={handleAddChecklistItem} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700">
//                 Add
//               </button>
//             </div>
//           )}
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
//           <div className="space-y-3">
//             {formData.notes.map((note, index) => (
//               <div key={index} className="bg-blue-50 p-3 rounded-lg relative">
//                 <p className="text-gray-700">{note}</p>
//                 {canEdit && (
//                   <button type="button" onClick={() => handleRemoveNote(index)} className="absolute top-2 right-2 text-red-500 hover:text-red-700">
//                     <FiX />
//                   </button>
//                 )}
//               </div>
//             ))}
//           </div>
//           <div className="mt-2 flex">
//             <textarea value={newNote} onChange={(e) => setNewNote(e.target.value)} placeholder="Add new note" rows={2} className="flex-1 border border-blue-200 rounded-l-md p-2 focus:ring-blue-500 focus:border-blue-500" />
//             <button type="button" onClick={handleAddNote} className="bg-blue-600 text-white px-3 rounded-r-md hover:bg-blue-700" disabled={!canEdit}>
//               Add
//             </button>
//           </div>
//         </div>

//         {formData.escalationHistory.length > 0 && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Escalation History</label>
//             <div className="space-y-3">
//               {formData.escalationHistory.map((escalation, index) => (
//                 <div key={index} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100">
//                   <div className="flex justify-between items-start">
//                     <div>
//                       <p className="font-medium text-yellow-800">Escalation Level {escalation.level}</p>
//                       <p className="text-sm text-yellow-700">{escalation.reason}</p>
//                     </div>
//                     <div className="text-xs text-yellow-600">
//                       <p>Escalated by: {escalation.escalatedBy}</p>
//                       <p>Date: {new Date(escalation.escalatedAt).toLocaleString()}</p>
//                       {escalation.resolvedBy && <p>Resolved by: {escalation.resolvedBy}</p>}
//                     </div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {formData.relatedKBArticles.length > 0 && (
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">Related Knowledge Base Articles</label>
//             <div className="space-y-2">
//               {formData.relatedKBArticles.map((articleId) => {
//                 const article = knowledgeBase.find((a) => a.id === articleId);
//                 if (!article) return null;

//                 return (
//                   <div key={articleId} className="bg-blue-50 p-3 rounded-lg flex justify-between items-center">
//                     <div>
//                       <p className="font-medium text-blue-800">{article.title}</p>
//                       <p className="text-sm text-blue-700 truncate">{article.content.substring(0, 100)}...</p>
//                     </div>
//                     <div className="flex space-x-2">
//                       <button type="button" onClick={() => setSelectedKBArticle(article)} className="text-blue-600 hover:text-blue-800">
//                         <FiEye />
//                       </button>
//                       {canEdit && (
//                         <button type="button" onClick={() => handleRemoveKBReference(articleId)} className="text-red-500 hover:text-red-700">
//                           <FiX />
//                         </button>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {canEdit && (
//           <div className="flex justify-end space-x-3 mt-6">
//             <motion.button
//               type="button"
//               onClick={onCancel}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//             >
//               Cancel
//             </motion.button>
//             <motion.button
//               type="submit"
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//             >
//               Save Changes
//             </motion.button>
//           </div>
//         )}
//       </form>

//       {!isEditing && (
//         <div className="flex justify-between space-x-3 mt-6">
//           <div className="flex space-x-3">
//             {canComplete && (
//               <motion.button
//                 type="button"
//                 onClick={handleCompleteWorkOrder}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-200"
//               >
//                 <FiCheckCircle className="mr-2" />
//                 Complete
//               </motion.button>
//             )}

//             {canEscalate && (
//               <motion.button
//                 type="button"
//                 onClick={() => setShowEscalateForm(true)}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors duration-200"
//               >
//                 <FiAlertTriangle className="mr-2" />
//                 Escalate
//               </motion.button>
//             )}

//             {canEdit && (
//               <motion.button
//                 type="button"
//                 onClick={() => setShowKBModal(true)}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//               >
//                 <FiBook className="mr-2" />
//                 Add KB Reference
//               </motion.button>
//             )}

//             <motion.button
//               type="button"
//               onClick={() => onPrint(formData)}
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//             >
//               <FiPrinter className="mr-2" />
//               Print
//             </motion.button>
//           </div>

//           <motion.button
//             type="button"
//             onClick={onCancel}
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//           >
//             Close
//           </motion.button>
//         </div>
//       )}

//       {showEscalateForm && (
//         <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
//           <h3 className="text-lg font-medium text-yellow-800 mb-3">Escalate Work Order</h3>
//           <div className="space-y-4">
//             <div>
//               <label htmlFor="escalationLevel" className="block text-sm font-medium text-yellow-700">
//                 Escalation Level
//               </label>
//               <select
//                 id="escalationLevel"
//                 value={escalationLevel}
//                 onChange={(e) => setEscalationLevel(Number(e.target.value))}
//                 className="mt-1 block w-full border border-yellow-300 rounded-md shadow-sm p-2.5 bg-white focus:ring-yellow-500 focus:border-yellow-500"
//               >
//                 <option value="1">Level 1 (Supervisor)</option>
//                 <option value="2">Level 2 (Vendor)</option>
//               </select>
//             </div>

//             <div>
//               <label htmlFor="escalationReason" className="block text-sm font-medium text-yellow-700">
//                 Reason for Escalation*
//               </label>
//               <textarea
//                 id="escalationReason"
//                 value={escalationReason}
//                 onChange={(e) => setEscalationReason(e.target.value)}
//                 rows={3}
//                 required
//                 className="mt-1 block w-full border border-yellow-300 rounded-md shadow-sm p-2.5 bg-white focus:ring-yellow-500 focus:border-yellow-500"
//                 placeholder="Explain why you're escalating this work order..."
//               />
//             </div>

//             <div className="flex justify-end space-x-3">
//               <motion.button
//                 type="button"
//                 onClick={() => setShowEscalateForm(false)}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="inline-flex items-center px-4 py-2 border border-yellow-300 text-sm font-medium rounded-md shadow-sm text-yellow-700 bg-white hover:bg-yellow-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
//               >
//                 Cancel
//               </motion.button>
//               <motion.button
//                 type="button"
//                 onClick={handleEscalate}
//                 whileHover={{ scale: 1.03 }}
//                 whileTap={{ scale: 0.97 }}
//                 className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
//               >
//                 Submit Escalation
//               </motion.button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Knowledge Base Modal */}
//       <Modal isOpen={showKBModal} onClose={() => setShowKBModal(false)} title="Knowledge Base Articles" size="lg">
//         <div className="space-y-4">
//           <div className="relative">
//             <FiSearch className="absolute left-3 top-3 text-gray-400" />
//             <input type="text" placeholder="Search knowledge base..." className="w-full pl-10 pr-4 py-2 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
//           </div>

//           <div className="space-y-3 max-h-[60vh] overflow-y-auto">
//             {knowledgeBase.map((article) => (
//               <div key={article.id} className="p-4 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors duration-200">
//                 <div className="flex justify-between items-start">
//                   <div>
//                     <h4 className="font-medium text-blue-800">{article.title}</h4>
//                     <p className="text-sm text-gray-600 mt-1">{article.content.substring(0, 150)}...</p>
//                     <div className="flex flex-wrap gap-2 mt-2">
//                       {article.tags.map((tag) => (
//                         <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                           {tag}
//                         </span>
//                       ))}
//                     </div>
//                   </div>
//                   <div className="flex space-x-2">
//                     <button type="button" onClick={() => setSelectedKBArticle(article)} className="text-blue-600 hover:text-blue-800 p-1" title="View details">
//                       <FiEye />
//                     </button>
//                     {!formData.relatedKBArticles.includes(article.id) && (
//                       <button type="button" onClick={() => handleAddKBReference(article.id)} className="text-green-600 hover:text-green-800 p-1" title="Add reference">
//                         <FiPlus />
//                       </button>
//                     )}
//                   </div>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </div>
//       </Modal>

//       {/* KB Article Details Modal */}
//       <Modal isOpen={!!selectedKBArticle} onClose={() => setSelectedKBArticle(null)} title={selectedKBArticle?.title || ""} size="lg">
//         {selectedKBArticle && (
//           <div className="space-y-4">
//             <div className="prose max-w-none">
//               <p>{selectedKBArticle.content}</p>
//             </div>

//             <div className="flex flex-wrap gap-2">
//               {selectedKBArticle.tags.map((tag) => (
//                 <span key={tag} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
//                   {tag}
//                 </span>
//               ))}
//             </div>

//             <div className="text-sm text-gray-500 mt-4">
//               <p>Created by: {selectedKBArticle.createdBy}</p>
//               <p>Created at: {new Date(selectedKBArticle.createdAt).toLocaleDateString()}</p>
//               <p>Last updated: {new Date(selectedKBArticle.updatedAt).toLocaleDateString()}</p>
//             </div>

//             <div className="pt-4 border-t border-blue-100">
//               <h4 className="font-medium text-gray-900 mb-2">Related Work Orders</h4>
//               {selectedKBArticle.relatedWorkOrders.length > 0 ? (
//                 <ul className="space-y-2">
//                   {selectedKBArticle.relatedWorkOrders.map((woId) => {
//                     const wo = workOrders.find((w: WorkOrder) => w.id === woId); 
//                     if (!wo) return null;

//                     return (
//                       <li key={woId} className="flex items-center justify-between p-2 bg-blue-50 rounded">
//                         <span className="font-medium">{wo.title}</span>
//                         <span className="text-sm text-blue-600">{wo.id}</span>
//                       </li>
//                     );
//                   })}
//                 </ul>
//               ) : (
//                 <p className="text-gray-500">No related work orders</p>
//               )}
//             </div>
//           </div>
//         )}
//       </Modal>
//     </div>
//   );
// };

// const WorkOrdersDashboard: React.FC = () => {
//   const [darkMode, setDarkMode] = useState(false);
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
//     const stored = localStorage.getItem("sidebarOpen");
//     return stored ? JSON.parse(stored) : false;
//   });
//   const [searchQuery, setSearchQuery] = useState("");
//   const [statusFilter, setStatusFilter] = useState<WorkOrderStatus | "all">("all");
//   const [priorityFilter, setPriorityFilter] = useState<WorkOrderPriority | "all">("all");
//   const [typeFilter, setTypeFilter] = useState<WorkOrderType | "all">("all");
//   const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
//   const [showAddWorkOrderModal, setShowAddWorkOrderModal] = useState(false);
//   const [showWorkOrderDetailsModal, setShowWorkOrderDetailsModal] = useState(false);
//   const [selectedWorkOrder, setSelectedWorkOrder] = useState<WorkOrder | null>(null);
//   const [isEditing, setIsEditing] = useState(false);
//   const [currentPage, setCurrentPage] = useState(1);
//   const [workOrdersPerPage] = useState(10);
//   const { user, fetchWithAuth } = useAuth();
//   const [data, setData] = useState(null);
//   const navigate = useNavigate();
//   const [hasInteracted, setHasInteracted] = useState(false);
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [viewMode, setViewMode] = useState<"list" | "kanban">("list");
//   const [selectedTab, setSelectedTab] = useState<"all" | "assigned" | "created">("all");

//   // Sample data - in a real app, this would come from an API
//   const [users, setUsers] = useState<User[]>([
//     {
//       id: "user-001",
//       name: "John Doe",
//       email: "john.doe@example.com",
//       phone: "+1 555-123-4567",
//       mobile: "+1 555-765-4321",
//       role: "technician",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
//       department: "Maintenance",
//     },
//     {
//       id: "user-002",
//       name: "Jane Smith",
//       email: "jane.smith@example.com",
//       phone: "+1 555-234-5678",
//       mobile: "+1 555-876-5432",
//       role: "helpdesk",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
//       department: "IT Support",
//     },
//     {
//       id: "user-003",
//       name: "Robert Johnson",
//       email: "robert.johnson@example.com",
//       phone: "+1 555-345-6789",
//       mobile: "+1 555-987-6543",
//       role: "supervisor",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
//       department: "Facilities",
//     },
//     {
//       id: "user-004",
//       name: "Emily Davis",
//       email: "emily.davis@example.com",
//       phone: "+1 555-456-7890",
//       mobile: "+1 555-098-7654",
//       role: "vendor",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
//       department: "ACME Corp",
//     },
//     {
//       id: "user-005",
//       name: "Michael Brown",
//       email: "michael.brown@example.com",
//       phone: "+1 555-567-8901",
//       mobile: "+1 555-109-8765",
//       role: "customer",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=MB",
//       department: "Operations",
//     },
//     {
//       id: "user-006",
//       name: "Sarah Wilson",
//       email: "sarah.wilson@example.com",
//       phone: "+1 555-678-9012",
//       mobile: "+1 555-210-9876",
//       role: "admin",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=SW",
//       department: "IT",
//     },
//     {
//       id: "user-007",
//       name: "David Taylor",
//       email: "david.taylor@example.com",
//       phone: "+1 555-789-0123",
//       mobile: "+1 555-321-0987",
//       role: "technician",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=DT",
//       department: "Maintenance",
//     },
//     {
//       id: "user-008",
//       name: "Lisa Anderson",
//       email: "lisa.anderson@example.com",
//       phone: "+1 555-890-1234",
//       mobile: "+1 555-432-1098",
//       role: "customer",
//       avatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=LA",
//       department: "HR",
//     },
//   ]);

//   const [assets, setAssets] = useState<Asset[]>([
//     {
//       id: "AST-001",
//       name: "HVAC System",
//       type: "mechanical",
//       location: "Building A, Floor 3",
//       model: "ACME HVAC-5000",
//       serialNumber: "HV2023001",
//       purchaseDate: "2020-05-15",
//       warrantyExpiration: "2025-05-15",
//       status: "operational",
//     },
//     {
//       id: "AST-002",
//       name: "Forklift",
//       type: "vehicle",
//       location: "Warehouse 1",
//       model: "Toyota 8FGCU25",
//       serialNumber: "FL2023002",
//       purchaseDate: "2019-11-20",
//       warrantyExpiration: "2024-11-20",
//       status: "operational",
//     },
//     {
//       id: "AST-003",
//       name: "Conveyor Belt Motor",
//       type: "mechanical",
//       location: "Production Line 2",
//       model: "Siemens 1LE0001",
//       serialNumber: "CB2023003",
//       purchaseDate: "2021-03-10",
//       warrantyExpiration: "2026-03-10",
//       status: "maintenance",
//     },
//     {
//       id: "AST-004",
//       name: "Solar Inverter",
//       type: "electrical",
//       location: "Roof Top",
//       model: "SolarEdge SE5000",
//       serialNumber: "SI2023004",
//       purchaseDate: "2022-01-05",
//       warrantyExpiration: "2027-01-05",
//       status: "operational",
//     },
//     {
//       id: "AST-005",
//       name: "Emergency Generator",
//       type: "electrical",
//       location: "Basement",
//       model: "Generac RG027",
//       serialNumber: "EG2023005",
//       purchaseDate: "2018-07-30",
//       warrantyExpiration: "2023-07-30",
//       status: "operational",
//     },
//     {
//       id: "AST-006",
//       name: "Water Pump",
//       type: "mechanical",
//       location: "Utility Room",
//       model: "Grundfos CR45",
//       serialNumber: "WP2023006",
//       purchaseDate: "2020-09-12",
//       warrantyExpiration: "2025-09-12",
//       status: "operational",
//     },
//     {
//       id: "AST-007",
//       name: "Server Rack",
//       type: "IT",
//       location: "Data Center",
//       model: "APC Netshelter SX",
//       serialNumber: "SR2023007",
//       purchaseDate: "2021-11-25",
//       warrantyExpiration: "2026-11-25",
//       status: "operational",
//     },
//     {
//       id: "AST-008",
//       name: "Company Car",
//       type: "vehicle",
//       location: "Parking Lot",
//       model: "Toyota Camry",
//       serialNumber: "CC2023008",
//       purchaseDate: "2022-02-18",
//       warrantyExpiration: "2027-02-18",
//       status: "operational",
//     },
//     {
//       id: "AST-009",
//       name: "Office Building A",
//       type: "building",
//       location: "Main Campus",
//       model: "N/A",
//       serialNumber: "OB2023009",
//       purchaseDate: "2015-04-22",
//       warrantyExpiration: "N/A",
//       status: "operational",
//     },
//     {
//       id: "AST-010",
//       name: "Industrial Robot",
//       type: "mechanical",
//       location: "Assembly Line 3",
//       model: "Fanuc M-710iC",
//       serialNumber: "IR2023010",
//       purchaseDate: "2021-08-15",
//       warrantyExpiration: "2026-08-15",
//       status: "operational",
//     },
//   ]);

//   const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeBaseArticle[]>([
//     {
//       id: "KB-001",
//       title: "HVAC System Preventive Maintenance Checklist",
//       content: "1. Check refrigerant levels\n2. Clean condenser coils\n3. Inspect electrical connections\n4. Lubricate moving parts\n5. Test thermostat operation\n6. Check drain lines\n7. Inspect ductwork for leaks",
//       tags: ["HVAC", "preventive", "maintenance"],
//       relatedWorkOrders: ["WO-001", "WO-011"],
//       createdBy: "John Doe",
//       createdAt: "2023-01-15",
//       updatedAt: "2023-06-20",
//     },
//     {
//       id: "KB-002",
//       title: "Forklift Hydraulic System Repair",
//       content:
//         "Common issues with forklift hydraulic systems:\n1. Leaking hoses - replace immediately\n2. Low hydraulic fluid - check for leaks and refill\n3. Contaminated fluid - drain and replace\n4. Worn seals - replace pump seals\n5. Air in system - bleed hydraulic lines",
//       tags: ["forklift", "hydraulic", "repair"],
//       relatedWorkOrders: ["WO-002", "WO-012"],
//       createdBy: "Jane Smith",
//       createdAt: "2023-02-10",
//       updatedAt: "2023-05-15",
//     },
//     {
//       id: "KB-003",
//       title: "Emergency Generator Testing Procedure",
//       content:
//         "Monthly testing procedure:\n1. Check oil level\n2. Inspect battery terminals\n3. Test automatic transfer switch\n4. Run generator under load for 30 minutes\n5. Record voltage and frequency\n6. Check for unusual noises or vibrations\n7. Verify fuel levels",
//       tags: ["generator", "emergency", "testing"],
//       relatedWorkOrders: ["WO-003", "WO-013"],
//       createdBy: "Robert Johnson",
//       createdAt: "2023-03-05",
//       updatedAt: "2023-07-10",
//     },
//     {
//       id: "KB-004",
//       title: "Conveyor Belt Motor Replacement Guide",
//       content:
//         "Steps to replace conveyor belt motor:\n1. Lock out/tag out power\n2. Remove belt tension\n3. Disconnect electrical connections\n4. Unbolt motor from mount\n5. Install new motor and align properly\n6. Reconnect electrical\n7. Adjust belt tension\n8. Test operation",
//       tags: ["conveyor", "motor", "replacement"],
//       relatedWorkOrders: ["WO-004", "WO-014"],
//       createdBy: "Emily Davis",
//       createdAt: "2023-04-20",
//       updatedAt: "2023-08-05",
//     },
//     {
//       id: "KB-005",
//       title: "Server Room AC Troubleshooting",
//       content:
//         "Common AC issues in server rooms:\n1. Failed capacitor - replace\n2. Dirty condenser coils - clean\n3. Refrigerant leak - locate and repair\n4. Faulty thermostat - recalibrate or replace\n5. Clogged drain line - clear blockage\n6. Frozen evaporator coil - check airflow and refrigerant",
//       tags: ["AC", "server", "troubleshooting"],
//       relatedWorkOrders: ["WO-007", "WO-015"],
//       createdBy: "David Taylor",
//       createdAt: "2023-05-12",
//       updatedAt: "2023-09-01",
//     },
//   ]);

//   const [workOrders, setWorkOrders] = useState<WorkOrder[]>([
//     {
//       id: "WO-001",
//       title: "HVAC System Preventive Maintenance",
//       description: "Quarterly preventive maintenance for HVAC system in Building A",
//       type: "preventive",
//       status: "completed",
//       priority: "medium",
//       assignedTo: "John Doe",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
//       createdBy: "System Admin",
//       createdAt: "2023-10-01",
//       dueDate: "2023-10-15",
//       completedAt: "2023-10-14",
//       assetId: "AST-001",
//       assetName: "HVAC System",
//       assetType: "mechanical",
//       estimatedHours: 4,
//       actualHours: 3.5,
//       cost: 350,
//       checklistItems: [
//         { id: "1", task: "Check refrigerant levels", completed: true },
//         { id: "2", task: "Clean condenser coils", completed: true },
//         { id: "3", task: "Inspect electrical connections", completed: true },
//         { id: "4", task: "Lubricate moving parts", completed: true },
//       ],
//       notes: ["Found minor leak in refrigerant line - repaired", "System running efficiently after maintenance"],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-001"],
//     },
//     {
//       id: "WO-002",
//       title: "Forklift Repair",
//       description: "Repair hydraulic leak in forklift #3",
//       type: "corrective",
//       status: "in-progress",
//       priority: "high",
//       assignedTo: "Jane Smith",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
//       createdBy: "Warehouse Manager",
//       createdAt: "2023-10-05",
//       dueDate: "2023-10-10",
//       completedAt: "",
//       assetId: "AST-002",
//       assetName: "Forklift",
//       assetType: "vehicle",
//       estimatedHours: 2,
//       actualHours: 1.5,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Identify leak source", completed: true },
//         { id: "2", task: "Replace damaged hose", completed: true },
//         { id: "3", task: "Refill hydraulic fluid", completed: false },
//         { id: "4", task: "Test operation", completed: false },
//       ],
//       notes: ["Leak identified in main hydraulic hose", "Waiting for replacement part to arrive"],
//       customerDetails: {
//         name: "Lisa Anderson",
//         department: "HR",
//         phone: "+1 555-890-1234",
//         mobile: "+1 555-432-1098",
//         email: "lisa.anderson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-002"],
//     },
//     {
//       id: "WO-003",
//       title: "Emergency Generator Inspection",
//       description: "Monthly inspection of emergency generator",
//       type: "inspection",
//       status: "pending",
//       priority: "medium",
//       assignedTo: "Robert Johnson",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
//       createdBy: "Facility Manager",
//       createdAt: "2023-10-10",
//       dueDate: "2023-10-12",
//       completedAt: "",
//       assetId: "AST-005",
//       assetName: "Emergency Generator",
//       assetType: "electrical",
//       estimatedHours: 1,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Check oil level", completed: false },
//         { id: "2", task: "Inspect battery", completed: false },
//         { id: "3", task: "Test run", completed: false },
//       ],
//       notes: [],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-003"],
//     },
//     {
//       id: "WO-004",
//       title: "Conveyor Belt Motor Replacement",
//       description: "Replace failed motor on production line 2 conveyor",
//       type: "corrective",
//       status: "pending",
//       priority: "critical",
//       assignedTo: "Emily Davis",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
//       createdBy: "Production Supervisor",
//       createdAt: "2023-10-11",
//       dueDate: "2023-10-11",
//       completedAt: "",
//       assetId: "AST-003",
//       assetName: "Conveyor Belt Motor",
//       assetType: "mechanical",
//       estimatedHours: 3,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Shut down power", completed: false },
//         { id: "2", task: "Remove old motor", completed: false },
//         { id: "3", task: "Install new motor", completed: false },
//         { id: "4", task: "Test operation", completed: false },
//       ],
//       notes: ["Production line 2 is currently down", "New motor is in stock"],
//       customerDetails: {
//         name: "David Taylor",
//         department: "Maintenance",
//         phone: "+1 555-789-0123",
//         mobile: "+1 555-321-0987",
//         email: "david.taylor@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-004"],
//     },
//     {
//       id: "WO-005",
//       title: "Office Building Safety Inspection",
//       description: "Quarterly safety inspection for Office Building A",
//       type: "inspection",
//       status: "on-hold",
//       priority: "low",
//       assignedTo: "John Doe",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
//       createdBy: "Safety Officer",
//       createdAt: "2023-10-01",
//       dueDate: "2023-10-31",
//       completedAt: "",
//       assetId: "AST-009",
//       assetName: "Office Building A",
//       assetType: "building",
//       estimatedHours: 8,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Inspect fire extinguishers", completed: false },
//         { id: "2", task: "Test emergency lighting", completed: false },
//         { id: "3", task: "Check exit signs", completed: false },
//         { id: "4", task: "Inspect stairwells", completed: false },
//       ],
//       notes: ["Waiting for safety inspection checklist from HQ"],
//       customerDetails: {
//         name: "Lisa Anderson",
//         department: "HR",
//         phone: "+1 555-890-1234",
//         mobile: "+1 555-432-1098",
//         email: "lisa.anderson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: [],
//     },
//     {
//       id: "WO-006",
//       title: "Water Pump Bearing Replacement",
//       description: "Replace worn bearings in main water pump",
//       type: "corrective",
//       status: "completed",
//       priority: "high",
//       assignedTo: "Robert Johnson",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
//       createdBy: "Maintenance Supervisor",
//       createdAt: "2023-09-25",
//       dueDate: "2023-09-28",
//       completedAt: "2023-09-27",
//       assetId: "AST-006",
//       assetName: "Water Pump",
//       assetType: "mechanical",
//       estimatedHours: 2.5,
//       actualHours: 3,
//       cost: 420,
//       checklistItems: [
//         { id: "1", task: "Drain pump", completed: true },
//         { id: "2", task: "Disassemble pump housing", completed: true },
//         { id: "3", task: "Replace bearings", completed: true },
//         { id: "4", task: "Reassemble and test", completed: true },
//       ],
//       notes: ["Bearings were severely worn", "Pump now operating quietly"],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: [],
//     },
//     {
//       id: "WO-007",
//       title: "Server Room AC Repair",
//       description: "Repair AC unit in server room - not cooling properly",
//       type: "emergency",
//       status: "completed",
//       priority: "critical",
//       assignedTo: "Emily Davis",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
//       createdBy: "IT Manager",
//       createdAt: "2023-10-08",
//       dueDate: "2023-10-08",
//       completedAt: "2023-10-08",
//       assetId: "",
//       assetName: "Server Room AC Unit",
//       assetType: "",
//       estimatedHours: 1.5,
//       actualHours: 2,
//       cost: 275,
//       checklistItems: [
//         { id: "1", task: "Diagnose issue", completed: true },
//         { id: "2", task: "Replace capacitor", completed: true },
//         { id: "3", task: "Clean condenser", completed: true },
//         { id: "4", task: "Monitor temperature", completed: true },
//       ],
//       notes: ["Failed capacitor was the issue", "Temperatures now stable"],
//       customerDetails: {
//         name: "Sarah Wilson",
//         department: "IT",
//         phone: "+1 555-678-9012",
//         mobile: "+1 555-210-9876",
//         email: "sarah.wilson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-005"],
//     },
//     {
//       id: "WO-008",
//       title: "Company Car Oil Change",
//       description: "Regular oil change for company car #2",
//       type: "preventive",
//       status: "pending",
//       priority: "low",
//       assignedTo: "John Doe",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
//       createdBy: "Fleet Manager",
//       createdAt: "2023-10-12",
//       dueDate: "2023-10-20",
//       completedAt: "",
//       assetId: "AST-008",
//       assetName: "Company Car",
//       assetType: "vehicle",
//       estimatedHours: 0.5,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Change oil", completed: false },
//         { id: "2", task: "Replace oil filter", completed: false },
//         { id: "3", task: "Check fluid levels", completed: false },
//       ],
//       notes: [],
//       customerDetails: {
//         name: "Lisa Anderson",
//         department: "HR",
//         phone: "+1 555-890-1234",
//         mobile: "+1 555-432-1098",
//         email: "lisa.anderson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: [],
//     },
//     {
//       id: "WO-009",
//       title: "Industrial Robot Calibration",
//       description: "Monthly calibration for assembly line robot",
//       type: "preventive",
//       status: "in-progress",
//       priority: "medium",
//       assignedTo: "Jane Smith",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
//       createdBy: "Production Manager",
//       createdAt: "2023-10-10",
//       dueDate: "2023-10-12",
//       completedAt: "",
//       assetId: "AST-010",
//       assetName: "Industrial Robot",
//       assetType: "mechanical",
//       estimatedHours: 1,
//       actualHours: 0.5,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Check positioning accuracy", completed: true },
//         { id: "2", task: "Calibrate sensors", completed: false },
//         { id: "3", task: "Test operation", completed: false },
//       ],
//       notes: ["Initial accuracy check passed"],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: [],
//     },
//     {
//       id: "WO-010",
//       title: "Solar Inverter Diagnostic",
//       description: "Diagnose intermittent power output issues",
//       type: "corrective",
//       status: "pending",
//       priority: "high",
//       assignedTo: "Robert Johnson",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
//       createdBy: "Facility Manager",
//       createdAt: "2023-10-12",
//       dueDate: "2023-10-15",
//       completedAt: "",
//       assetId: "AST-004",
//       assetName: "Solar Inverter",
//       assetType: "electrical",
//       estimatedHours: 2,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Check DC input", completed: false },
//         { id: "2", task: "Inspect AC output", completed: false },
//         { id: "3", task: "Review error logs", completed: false },
//       ],
//       notes: [],
//       customerDetails: {
//         name: "Sarah Wilson",
//         department: "IT",
//         phone: "+1 555-678-9012",
//         mobile: "+1 555-210-9876",
//         email: "sarah.wilson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: [],
//     },
//     {
//       id: "WO-011",
//       title: "HVAC Filter Replacement",
//       description: "Monthly filter replacement for Building A HVAC",
//       type: "preventive",
//       status: "pending",
//       priority: "low",
//       assignedTo: "John Doe",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JD",
//       createdBy: "Facility Manager",
//       createdAt: "2023-10-15",
//       dueDate: "2023-10-16",
//       completedAt: "",
//       assetId: "AST-001",
//       assetName: "HVAC System",
//       assetType: "mechanical",
//       estimatedHours: 0.5,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Turn off system", completed: false },
//         { id: "2", task: "Remove old filters", completed: false },
//         { id: "3", task: "Install new filters", completed: false },
//         { id: "4", task: "Turn system back on", completed: false },
//       ],
//       notes: [],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-001"],
//     },
//     {
//       id: "WO-012",
//       title: "Forklift Battery Replacement",
//       description: "Replace battery in forklift #2",
//       type: "corrective",
//       status: "pending",
//       priority: "medium",
//       assignedTo: "Jane Smith",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=JS",
//       createdBy: "Warehouse Manager",
//       createdAt: "2023-10-14",
//       dueDate: "2023-10-17",
//       completedAt: "",
//       assetId: "AST-002",
//       assetName: "Forklift",
//       assetType: "vehicle",
//       estimatedHours: 1,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Remove old battery", completed: false },
//         { id: "2", task: "Install new battery", completed: false },
//         { id: "3", task: "Test operation", completed: false },
//       ],
//       notes: ["New battery is in stock"],
//       customerDetails: {
//         name: "Lisa Anderson",
//         department: "HR",
//         phone: "+1 555-890-1234",
//         mobile: "+1 555-432-1098",
//         email: "lisa.anderson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-002"],
//     },
//     {
//       id: "WO-013",
//       title: "Generator Fuel System Inspection",
//       description: "Inspect fuel system for leaks and proper operation",
//       type: "inspection",
//       status: "pending",
//       priority: "medium",
//       assignedTo: "Robert Johnson",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=RJ",
//       createdBy: "Facility Manager",
//       createdAt: "2023-10-16",
//       dueDate: "2023-10-18",
//       completedAt: "",
//       assetId: "AST-005",
//       assetName: "Emergency Generator",
//       assetType: "electrical",
//       estimatedHours: 1.5,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Inspect fuel lines", completed: false },
//         { id: "2", task: "Check fuel filter", completed: false },
//         { id: "3", task: "Test fuel pump", completed: false },
//       ],
//       notes: [],
//       customerDetails: {
//         name: "Michael Brown",
//         department: "Operations",
//         phone: "+1 555-567-8901",
//         mobile: "+1 555-109-8765",
//         email: "michael.brown@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-003"],
//     },
//     {
//       id: "WO-014",
//       title: "Conveyor Belt Alignment",
//       description: "Align conveyor belt on production line 1",
//       type: "corrective",
//       status: "pending",
//       priority: "medium",
//       assignedTo: "Emily Davis",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
//       createdBy: "Production Supervisor",
//       createdAt: "2023-10-15",
//       dueDate: "2023-10-17",
//       completedAt: "",
//       assetId: "AST-003",
//       assetName: "Conveyor Belt Motor",
//       assetType: "mechanical",
//       estimatedHours: 2,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Check current alignment", completed: false },
//         { id: "2", task: "Adjust tension rollers", completed: false },
//         { id: "3", task: "Test operation", completed: false },
//       ],
//       notes: ["Belt is tracking to one side"],
//       customerDetails: {
//         name: "David Taylor",
//         department: "Maintenance",
//         phone: "+1 555-789-0123",
//         mobile: "+1 555-321-0987",
//         email: "david.taylor@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-004"],
//     },
//     {
//       id: "WO-015",
//       title: "Server Room Temperature Monitoring",
//       description: "Install additional temperature sensors in server room",
//       type: "corrective",
//       status: "pending",
//       priority: "high",
//       assignedTo: "Emily Davis",
//       assignedToAvatar: "https://placehold.co/40x40/0078D7/FFFFFF?text=ED",
//       createdBy: "IT Manager",
//       createdAt: "2023-10-17",
//       dueDate: "2023-10-19",
//       completedAt: "",
//       assetId: "AST-007",
//       assetName: "Server Rack",
//       assetType: "IT",
//       estimatedHours: 3,
//       actualHours: 0,
//       cost: 0,
//       checklistItems: [
//         { id: "1", task: "Install sensors", completed: false },
//         { id: "2", task: "Connect to monitoring system", completed: false },
//         { id: "3", task: "Test alerts", completed: false },
//       ],
//       notes: ["Following recent AC failure"],
//       customerDetails: {
//         name: "Sarah Wilson",
//         department: "IT",
//         phone: "+1 555-678-9012",
//         mobile: "+1 555-210-9876",
//         email: "sarah.wilson@example.com",
//       },
//       escalationHistory: [],
//       relatedKBArticles: ["KB-005"],
//     },
//   ]);

//   useEffect(() => {
//     const handleResize = () => {
//       setIsMobile(window.innerWidth < 768);
//       if (window.innerWidth < 768) {
//         setSidebarOpen(false);
//       }
//     };

//     window.addEventListener("resize", handleResize);
//     return () => window.removeEventListener("resize", handleResize);
//   }, []);

//   const handleNotifications = () => {
//     alert("Showing notifications...");
//   };

//   const handleImport = () => {
//     alert("Import functionality is not yet implemented. This would typically involve uploading a file.");
//   };

//   const getStatusColor = (status: WorkOrderStatus) => {
//     switch (status) {
//       case "completed":
//         return "bg-green-500";
//       case "in-progress":
//         return "bg-blue-500";
//       case "pending":
//         return "bg-yellow-500";
//       case "on-hold":
//         return "bg-purple-500";
//       case "cancelled":
//         return "bg-red-500";
//       case "escalated":
//         return "bg-orange-500";
//       default:
//         return "bg-gray-500";
//     }
//   };

//   const getPriorityColor = (priority: WorkOrderPriority) => {
//     switch (priority) {
//       case "low":
//         return "bg-gray-200 text-gray-800";
//       case "medium":
//         return "bg-blue-100 text-blue-800";
//       case "high":
//         return "bg-orange-100 text-orange-800";
//       case "critical":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   const getPriorityIcon = (priority: WorkOrderPriority) => {
//     switch (priority) {
//       case "low":
//         return <FiFlag className="text-gray-500" />;
//       case "medium":
//         return <FiFlag className="text-blue-500" />;
//       case "high":
//         return <FiFlag className="text-orange-500" />;
//       case "critical":
//         return <FiFlag className="text-red-500" />;
//       default:
//         return <FiFlag className="text-gray-500" />;
//     }
//   };

//   const openWorkOrderDetails = (workOrder: WorkOrder, editMode: boolean) => {
//     setSelectedWorkOrder(workOrder);
//     setIsEditing(editMode);
//     setShowWorkOrderDetailsModal(true);
//   };

//   const handleAddWorkOrder = (newWorkOrderData: Omit<WorkOrder, "id" | "checklistItems" | "notes" | "completedAt" | "actualHours" | "cost" | "escalationHistory" | "relatedKBArticles">) => {
//     const newWorkOrder: WorkOrder = {
//       ...newWorkOrderData,
//       id: `WO-${String(workOrders.length + 1).padStart(3, "0")}`,
//       checklistItems: [],
//       notes: [],
//       completedAt: "",
//       actualHours: 0,
//       cost: 0,
//       escalationHistory: [],
//       relatedKBArticles: [],
//     };
//     setWorkOrders([...workOrders, newWorkOrder]);
//     setShowAddWorkOrderModal(false);
//   };

//   const handleUpdateWorkOrder = (updatedWorkOrderData: WorkOrder) => {
//     setWorkOrders(workOrders.map((wo) => (wo.id === updatedWorkOrderData.id ? updatedWorkOrderData : wo)));
//     setShowWorkOrderDetailsModal(false);
//     setSelectedWorkOrder(null);
//     setIsEditing(false);
//   };

//   const handleCompleteWorkOrder = (completedWorkOrder: WorkOrder) => {
//     setWorkOrders(workOrders.map((wo) => (wo.id === completedWorkOrder.id ? completedWorkOrder : wo)));
//     setShowWorkOrderDetailsModal(false);
//     setSelectedWorkOrder(null);
//     setIsEditing(false);
//   };

//   const handleEscalateWorkOrder = (escalatedWorkOrder: WorkOrder, level: number, reason: string) => {
//     setWorkOrders(workOrders.map((wo) => (wo.id === escalatedWorkOrder.id ? escalatedWorkOrder : wo)));
//     setShowWorkOrderDetailsModal(false);
//     setSelectedWorkOrder(null);
//     setIsEditing(false);
//   };

//   const handlePrintWorkOrder = (workOrder: WorkOrder) => {
//     alert(`Printing work order ${workOrder.id}`);
//     // In a real app, this would generate a PDF or open a print dialog
//   };

//   const toggleSidebar = () => {
//     setHasInteracted(true);
//     setSidebarOpen((prev) => !prev);
//   };

//   // Filter work orders based on search query and filters
//   const filteredWorkOrders = workOrders.filter((wo) => {
//     const matchesSearch =
//       wo.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       wo.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       wo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       wo.assetName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       wo.assetId?.toLowerCase().includes(searchQuery.toLowerCase());

//     const matchesStatus = statusFilter === "all" || wo.status === statusFilter;
//     const matchesPriority = priorityFilter === "all" || wo.priority === priorityFilter;
//     const matchesType = typeFilter === "all" || wo.type === typeFilter;

//     // Additional filters based on user role and selected tab
//     let matchesUser = true;
//     if (selectedTab === "assigned") {
//       matchesUser = wo.assignedTo === user?.name;
//     } else if (selectedTab === "created") {
//       matchesUser = wo.createdBy === user?.name || wo.customerDetails.name === user?.name;
//     }

//     return matchesSearch && matchesStatus && matchesPriority && matchesType && matchesUser;
//   });

//   // Pagination
//   const indexOfLastWorkOrder = currentPage * workOrdersPerPage;
//   const indexOfFirstWorkOrder = indexOfLastWorkOrder - workOrdersPerPage;
//   const currentWorkOrders = filteredWorkOrders.slice(indexOfFirstWorkOrder, indexOfLastWorkOrder);
//   const totalPages = Math.ceil(filteredWorkOrders.length / workOrdersPerPage);

//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   // Charts data
//   const statusData = [
//     { name: "Completed", value: workOrders.filter((wo) => wo.status === "completed").length, color: "#10B981" },
//     { name: "In Progress", value: workOrders.filter((wo) => wo.status === "in-progress").length, color: "#3B82F6" },
//     { name: "Pending", value: workOrders.filter((wo) => wo.status === "pending").length, color: "#F59E0B" },
//     { name: "On Hold", value: workOrders.filter((wo) => wo.status === "on-hold").length, color: "#8B5CF6" },
//     { name: "Escalated", value: workOrders.filter((wo) => wo.status === "escalated").length, color: "#F97316" },
//     { name: "Cancelled", value: workOrders.filter((wo) => wo.status === "cancelled").length, color: "#EF4444" },
//   ];

//   const priorityData = [
//     { name: "Critical", value: workOrders.filter((wo) => wo.priority === "critical").length, color: "#EF4444" },
//     { name: "High", value: workOrders.filter((wo) => wo.priority === "high").length, color: "#F97316" },
//     { name: "Medium", value: workOrders.filter((wo) => wo.priority === "medium").length, color: "#3B82F6" },
//     { name: "Low", value: workOrders.filter((wo) => wo.priority === "low").length, color: "#9CA3AF" },
//   ];

//   const typeData = [
//     { name: "Preventive", value: workOrders.filter((wo) => wo.type === "preventive").length, color: "#3B82F6" },
//     { name: "Corrective", value: workOrders.filter((wo) => wo.type === "corrective").length, color: "#10B981" },
//     { name: "Inspection", value: workOrders.filter((wo) => wo.type === "inspection").length, color: "#F59E0B" },
//     { name: "Emergency", value: workOrders.filter((wo) => wo.type === "emergency").length, color: "#EF4444" },
//   ];

//   const overdueWorkOrders = workOrders.filter((wo) => new Date(wo.dueDate) < new Date() && wo.status !== "completed").length;

//   const completedThisMonth = workOrders.filter((wo) => wo.status === "completed" && new Date(wo.completedAt).getMonth() === new Date().getMonth() && new Date(wo.completedAt).getFullYear() === new Date().getFullYear()).length;

//   const avgCompletionTime = workOrders.filter((wo) => wo.status === "completed" && wo.actualHours).reduce((acc, wo) => acc + (wo.actualHours || 0), 0) / workOrders.filter((wo) => wo.status === "completed" && wo.actualHours).length || 0;

//   const totalCost = workOrders.filter((wo) => wo.status === "completed" && wo.cost).reduce((acc, wo) => acc + (wo.cost || 0), 0);

//   useEffect(() => {
//     setCurrentPage(1);

//     const fetchData = async () => {
//       try {
//         const result = await fetchWithAuth("/api/protected-data");
//         setData(result);
//       } catch (error) {
//         console.error("Failed to fetch data:", error);
//       }
//     };

//     fetchData();

//     localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
//   }, [searchQuery, statusFilter, priorityFilter, typeFilter, sidebarOpen, selectedTab]);

//   return (
//     <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
//       {/* Sidebar */}
//       <AnimatePresence>
//         {(!isMobile || sidebarOpen) && (
//           <motion.div
//             initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
//             animate={{
//               width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
//             }}
//             exit={{ width: 0 }}
//             transition={{ duration: 0.3, ease: "easeInOut" }}
//             className={`bg-white border-r border-blue-100 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
//           >
//             <div className="p-4 flex items-center justify-between border-b border-blue-100">
//               {sidebarOpen ? (
//                 <>
//                   <div className="rounded-lg flex items-center space-x-3">
//                     <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
//                     <p className="text-blue-600 font-bold">CMMS</p>
//                   </div>
//                 </>
//               ) : (
//                 <img src={logoWida} alt="Logo Wida" className="h-6 w-auto" />
//               )}

//               <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
//                 {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
//               </button>
//             </div>

//             <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
//               <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
//               <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
//               <NavItem
//                 icon={<FiClipboard />}
//                 text="Work Orders"
//                 to="/workorders"
//                 expanded={sidebarOpen}
//                 badge={
//                   workOrders.filter(
//                     (wo) =>
//                       (user?.role === "technician" && wo.assignedTo === user?.name && wo.status === "pending") ||
//                       (user?.role === "supervisor" && wo.status === "escalated" && wo.escalationHistory.some((e) => e.level === 1)) ||
//                       (user?.role === "vendor" && wo.status === "escalated" && wo.escalationHistory.some((e) => e.level === 2))
//                   ).length
//                 }
//               />
//               <NavItem icon={<FiClipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />
//               <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />
//               <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />
//               <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />
//               <NavItem icon={<FiBook />} text="Knowledge Base" to="/knowledgebase" expanded={sidebarOpen} />
//               <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />
//             </nav>

//             <div className="p-4 border-t border-blue-100">
//               <div className="flex items-center space-x-3">
//                 <img src={user?.avatar || "https://placehold.co/40x40/0078D7/FFFFFF?text=AD"} alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
//                 {sidebarOpen && (
//                   <div>
//                     <p className="font-medium text-gray-900">{user?.name}</p>
//                     <p className="text-sm text-gray-600 capitalize">{user?.role}</p>
//                   </div>
//                 )}
//               </div>
//               {sidebarOpen && (
//                 <motion.button
//                   whileHover={{ scale: 1.02 }}
//                   whileTap={{ scale: 0.98 }}
//                   onClick={() => navigate("/logout")}
//                   className="mt-4 w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 font-medium"
//                 >
//                   <FiLogOut className="text-xl" />
//                   <span>Logout</span>
//                 </motion.button>
//               )}
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Top Navigation */}
//         <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
//           <div className="flex items-center space-x-3">
//             {isMobile && (
//               <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
//                 <FiChevronRight className="text-xl" />
//               </motion.button>
//             )}
//             <FiClipboard className="text-2xl text-blue-600" />
//             <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Work Orders</h2>
//           </div>

//           <div className="flex items-center space-x-4">
//             <motion.button
//               whileHover={{ scale: 1.1 }}
//               whileTap={{ scale: 0.9 }}
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
//               aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
//             </motion.button>

//             <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleNotifications} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
//               <FiBell className="text-xl" />
//               <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
//             </motion.button>

//             <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
//               <img src={user?.avatar || "https://placehold.co/32x32/0078D7/FFFFFF?text=AD"} alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
//               <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
//               <FiChevronDown className="text-gray-500" />
//             </motion.div>
//           </div>
//         </header>

//         {/* Content Area */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
//           {/* Header and Actions */}
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Work Orders Management</h1>
//               <p className="text-gray-600 mt-1">Create, track and manage all maintenance work orders</p>
//             </div>

//             <div className="flex flex-wrap gap-3">
//               {(user?.role === "customer" || user?.role === "helpdesk" || user?.role === "admin") && (
//                 <motion.button
//                   onClick={() => setShowAddWorkOrderModal(true)}
//                   whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
//                   whileTap={{ scale: 0.95 }}
//                   className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
//                 >
//                   <FiPlus className="text-lg" />
//                   <span className="font-semibold">Create Work Order</span>
//                 </motion.button>
//               )}

//               {user?.role === "admin" && (
//                 <motion.button
//                   onClick={handleImport}
//                   whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
//                   whileTap={{ scale: 0.95 }}
//                   className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
//                 >
//                   <FiUpload className="text-lg" />
//                   <span className="font-semibold">Import</span>
//                 </motion.button>
//               )}

//               <motion.button
//                 onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
//                 whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
//                 whileTap={{ scale: 0.95 }}
//                 className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
//               >
//                 <FiFilter className="text-lg" />
//                 <span className="font-semibold">Filters</span>
//                 {showAdvancedFilters ? <FiChevronUp /> : <FiChevronDown />}
//               </motion.button>

//               <div className="flex items-center bg-white border border-blue-200 rounded-lg shadow-sm overflow-hidden">
//                 <button onClick={() => setViewMode("list")} className={`px-3 py-2 ${viewMode === "list" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"}`}>
//                   <FiList className="text-lg" />
//                 </button>
//                 <button onClick={() => setViewMode("kanban")} className={`px-3 py-2 ${viewMode === "kanban" ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-blue-50"}`}>
//                   <FiGrid className="text-lg" />
//                 </button>
//               </div>
//             </div>
//           </motion.div>

//           {/* Tabs */}
//           <div className="flex border-b border-blue-100 mb-6">
//             <button onClick={() => setSelectedTab("all")} className={`px-4 py-2 font-medium text-sm ${selectedTab === "all" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"}`}>
//               All Work Orders
//             </button>
//             <button onClick={() => setSelectedTab("assigned")} className={`px-4 py-2 font-medium text-sm ${selectedTab === "assigned" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"}`}>
//               Assigned to Me
//             </button>
//             <button onClick={() => setSelectedTab("created")} className={`px-4 py-2 font-medium text-sm ${selectedTab === "created" ? "text-blue-600 border-b-2 border-blue-600" : "text-gray-600 hover:text-blue-500"}`}>
//               Created by Me
//             </button>
//           </div>

//           {/* Stats Cards */}
//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//             <StatCard
//               title="Total Work Orders"
//               value={workOrders.length.toString()}
//               change="+15%"
//               icon={<FiClipboard />}
//               onClick={() => {
//                 setStatusFilter("all");
//                 setPriorityFilter("all");
//                 setTypeFilter("all");
//                 setSelectedTab("all");
//               }}
//             />
//             <StatCard title="Completed" value={workOrders.filter((wo) => wo.status === "completed").length.toString()} change="+8%" icon={<FiCheckCircle />} onClick={() => setStatusFilter("completed")} />
//             <StatCard title="In Progress" value={workOrders.filter((wo) => wo.status === "in-progress").length.toString()} change="-3%" icon={<FiClock />} onClick={() => setStatusFilter("in-progress")} />
//             <StatCard
//               title="Overdue"
//               value={overdueWorkOrders.toString()}
//               change="+2"
//               icon={<FiAlertTriangle />}
//               onClick={() => {
//                 setStatusFilter("all");
//                 setSearchQuery("overdue");
//               }}
//             />
//           </div>

//           {/* Charts */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-4">Work Orders by Status</h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <PieChart>
//                     <Pie data={statusData} cx="50%" cy="50%" labelLine={false} outerRadius={80} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
//                       {statusData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-4">Work Orders by Priority</h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={priorityData}
//                     margin={{
//                       top: 5,
//                       right: 30,
//                       left: 20,
//                       bottom: 5,
//                     }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="value" name="Work Orders">
//                       {priorityData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-4">Work Orders by Type</h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <BarChart
//                     data={typeData}
//                     margin={{
//                       top: 5,
//                       right: 30,
//                       left: 20,
//                       bottom: 5,
//                     }}
//                   >
//                     <CartesianGrid strokeDasharray="3 3" />
//                     <XAxis dataKey="name" />
//                     <YAxis />
//                     <Tooltip />
//                     <Bar dataKey="value" name="Work Orders">
//                       {typeData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Bar>
//                   </BarChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>
//           </div>

//           {/* Performance Metrics */}
//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-2">Completed This Month</h3>
//               <p className="text-3xl font-bold text-green-600">{completedThisMonth}</p>
//               <p className="text-sm text-gray-600 mt-1">+2 from last month</p>
//             </div>

//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-2">Avg. Completion Time</h3>
//               <p className="text-3xl font-bold text-blue-600">{avgCompletionTime.toFixed(1)} hours</p>
//               <p className="text-sm text-gray-600 mt-1">-0.5 hours from last month</p>
//             </div>

//             <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
//               <h3 className="font-medium text-gray-900 mb-2">Total Maintenance Cost</h3>
//               <p className="text-3xl font-bold text-purple-600">${totalCost.toFixed(2)}</p>
//               <p className="text-sm text-gray-600 mt-1">+$1,245 from last month</p>
//             </div>
//           </div>

//           {/* Search and Filters */}
//           <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//               <div className="flex-1 relative">
//                 <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
//                 <input
//                   type="text"
//                   placeholder="Search work orders by title, ID, description, or asset..."
//                   className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
//                   value={searchQuery}
//                   onChange={(e) => setSearchQuery(e.target.value)}
//                 />
//               </div>

//               <AnimatePresence>
//                 {showAdvancedFilters && (
//                   <motion.div
//                     initial={{ opacity: 0, height: 0 }}
//                     animate={{ opacity: 1, height: "auto" }}
//                     exit={{ opacity: 0, height: 0 }}
//                     transition={{ duration: 0.2 }}
//                     className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 w-full md:w-auto"
//                   >
//                     <select
//                       className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
//                       style={{
//                         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
//                         backgroundSize: "1.2rem",
//                       }}
//                       value={statusFilter}
//                       onChange={(e) => setStatusFilter(e.target.value as WorkOrderStatus | "all")}
//                     >
//                       <option value="all">All Statuses</option>
//                       <option value="pending">Pending</option>
//                       <option value="in-progress">In Progress</option>
//                       <option value="on-hold">On Hold</option>
//                       <option value="completed">Completed</option>
//                       <option value="cancelled">Cancelled</option>
//                       <option value="escalated">Escalated</option>
//                     </select>

//                     <select
//                       className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
//                       style={{
//                         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
//                         backgroundSize: "1.2rem",
//                       }}
//                       value={priorityFilter}
//                       onChange={(e) => setPriorityFilter(e.target.value as WorkOrderPriority | "all")}
//                     >
//                       <option value="all">All Priorities</option>
//                       <option value="low">Low</option>
//                       <option value="medium">Medium</option>
//                       <option value="high">High</option>
//                       <option value="critical">Critical</option>
//                     </select>

//                     <select
//                       className="border border-blue-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base appearance-none bg-no-repeat bg-right-12 bg-center-y transition-all duration-200"
//                       style={{
//                         backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
//                         backgroundSize: "1.2rem",
//                       }}
//                       value={typeFilter}
//                       onChange={(e) => setTypeFilter(e.target.value as WorkOrderType | "all")}
//                     >
//                       <option value="all">All Types</option>
//                       <option value="preventive">Preventive</option>
//                       <option value="corrective">Corrective</option>
//                       <option value="inspection">Inspection</option>
//                       <option value="emergency">Emergency</option>
//                     </select>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </motion.div>

//           {/* Work Orders Table */}
//           {viewMode === "list" && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100">
//               <div className="overflow-x-auto">
//                 <table className="min-w-full divide-y divide-blue-100">
//                   <thead className="bg-blue-50">
//                     <tr>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Work Order</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Type</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Priority</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Assigned To</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Date</th>
//                       <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
//                     </tr>
//                   </thead>
//                   <tbody className="bg-white divide-y divide-blue-100">
//                     {currentWorkOrders.length > 0 ? (
//                       currentWorkOrders.map((workOrder) => (
//                         <motion.tr
//                           key={workOrder.id}
//                           initial={{ opacity: 0, y: 10 }}
//                           animate={{ opacity: 1, y: 0 }}
//                           transition={{ duration: 0.2 }}
//                           whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
//                           className="transition-colors duration-150"
//                         >
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <div className="flex-shrink-0 h-12 w-12 rounded-full bg-blue-50 flex items-center justify-center text-2xl">
//                                 <FiClipboard className="text-blue-600" />
//                               </div>
//                               <div className="ml-4">
//                                 <div className="text-base font-medium text-gray-900">{workOrder.title}</div>
//                                 <div className="text-sm text-gray-600">{workOrder.id}</div>
//                                 {workOrder.assetName && (
//                                   <div className="text-xs text-gray-500 mt-1">
//                                     Asset: {workOrder.assetName} ({workOrder.assetId})
//                                   </div>
//                                 )}
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm capitalize text-gray-900">
//                               {workOrder.type
//                                 .split("-")
//                                 .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                                 .join(" ")}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               {getPriorityIcon(workOrder.priority)}
//                               <span className={`ml-2 px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(workOrder.status)} text-white shadow-sm`}>
//                               {workOrder.status
//                                 .split("-")
//                                 .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
//                                 .join(" ")}
//                             </motion.span>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="flex items-center">
//                               <img src={workOrder.assignedToAvatar} alt={workOrder.assignedTo} className="w-8 h-8 rounded-full border border-blue-200" />
//                               <div className="ml-3">
//                                 <div className="text-sm font-medium text-gray-900">{workOrder.assignedTo}</div>
//                               </div>
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap">
//                             <div className="text-sm text-gray-900">{new Date(workOrder.dueDate).toLocaleDateString()}</div>
//                             <div className={`text-xs ${new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "text-red-600" : "text-gray-500"}`}>
//                               {new Date(workOrder.dueDate) < new Date() && workOrder.status !== "completed" ? "Overdue" : ""}
//                             </div>
//                           </td>
//                           <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
//                             <motion.button
//                               whileHover={{ scale: 1.05 }}
//                               whileTap={{ scale: 0.95 }}
//                               onClick={() => openWorkOrderDetails(workOrder, false)}
//                               className="text-blue-600 hover:text-blue-800 mr-3 transition-colors duration-200 flex items-center space-x-1"
//                               title="View Details"
//                             >
//                               <FiEye className="text-lg" />
//                               <span>View</span>
//                             </motion.button>
//                             {(user?.role === "admin" ||
//                               user?.role === "helpdesk" ||
//                               (user?.role === "technician" && workOrder.assignedTo === user?.name) ||
//                               (user?.role === "supervisor" && workOrder.status === "escalated" && workOrder.escalationHistory.some((e) => e.level === 1)) ||
//                               (user?.role === "vendor" && workOrder.status === "escalated" && workOrder.escalationHistory.some((e) => e.level === 2))) && (
//                               <motion.button
//                                 whileHover={{ scale: 1.05 }}
//                                 whileTap={{ scale: 0.95 }}
//                                 onClick={() => openWorkOrderDetails(workOrder, true)}
//                                 className="text-gray-600 hover:text-gray-800 transition-colors duration-200 flex items-center space-x-1"
//                                 title="Edit Work Order"
//                               >
//                                 <FiEdit className="text-lg" />
//                                 <span>Edit</span>
//                               </motion.button>
//                             )}
//                           </td>
//                         </motion.tr>
//                       ))
//                     ) : (
//                       <tr>
//                         <td colSpan={7} className="px-6 py-10 text-center text-gray-600 text-lg">
//                           No work orders found matching your criteria.
//                         </td>
//                       </tr>
//                     )}
//                   </tbody>
//                 </table>
//               </div>
//             </motion.div>
//           )}

//           {/* Kanban View */}
//           {viewMode === "kanban" && (
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
//               {/* Pending Column */}
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <h3 className="font-medium text-gray-900 mb-4 flex items-center">
//                   <span className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></span>
//                   Pending ({filteredWorkOrders.filter((wo) => wo.status === "pending").length})
//                 </h3>
//                 <div className="space-y-3">
//                   {filteredWorkOrders
//                     .filter((wo) => wo.status === "pending")
//                     .map((workOrder) => (
//                       <motion.div
//                         key={workOrder.id}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 cursor-pointer"
//                         onClick={() => openWorkOrderDetails(workOrder, false)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h4 className="font-medium text-gray-900">{workOrder.title}</h4>
//                             <p className="text-sm text-gray-600">{workOrder.id}</p>
//                           </div>
//                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
//                         </div>
//                         {workOrder.assetName && (
//                           <p className="text-xs text-gray-500 mt-2">
//                             <FiPackage className="inline mr-1" />
//                             {workOrder.assetName}
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-2">
//                           <FiCalendar className="inline mr-1" />
//                           Due: {new Date(workOrder.dueDate).toLocaleDateString()}
//                           {new Date(workOrder.dueDate) < new Date() && <span className="text-red-500 ml-2">Overdue</span>}
//                         </p>
//                         <div className="flex items-center mt-3">
//                           <img src={workOrder.assignedToAvatar} alt={workOrder.assignedTo} className="w-6 h-6 rounded-full border border-blue-200" />
//                           <span className="text-xs text-gray-600 ml-2">{workOrder.assignedTo}</span>
//                         </div>
//                       </motion.div>
//                     ))}
//                 </div>
//               </div>

//               {/* In Progress Column */}
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <h3 className="font-medium text-gray-900 mb-4 flex items-center">
//                   <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
//                   In Progress ({filteredWorkOrders.filter((wo) => wo.status === "in-progress").length})
//                 </h3>
//                 <div className="space-y-3">
//                   {filteredWorkOrders
//                     .filter((wo) => wo.status === "in-progress")
//                     .map((workOrder) => (
//                       <motion.div
//                         key={workOrder.id}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 cursor-pointer"
//                         onClick={() => openWorkOrderDetails(workOrder, false)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h4 className="font-medium text-gray-900">{workOrder.title}</h4>
//                             <p className="text-sm text-gray-600">{workOrder.id}</p>
//                           </div>
//                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
//                         </div>
//                         {workOrder.assetName && (
//                           <p className="text-xs text-gray-500 mt-2">
//                             <FiPackage className="inline mr-1" />
//                             {workOrder.assetName}
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-2">
//                           <FiCalendar className="inline mr-1" />
//                           Due: {new Date(workOrder.dueDate).toLocaleDateString()}
//                           {new Date(workOrder.dueDate) < new Date() && <span className="text-red-500 ml-2">Overdue</span>}
//                         </p>
//                         <div className="flex items-center mt-3">
//                           <img src={workOrder.assignedToAvatar} alt={workOrder.assignedTo} className="w-6 h-6 rounded-full border border-blue-200" />
//                           <span className="text-xs text-gray-600 ml-2">{workOrder.assignedTo}</span>
//                         </div>
//                       </motion.div>
//                     ))}
//                 </div>
//               </div>

//               {/* Completed Column */}
//               <div className="bg-blue-50 rounded-lg p-4">
//                 <h3 className="font-medium text-gray-900 mb-4 flex items-center">
//                   <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
//                   Completed ({filteredWorkOrders.filter((wo) => wo.status === "completed").length})
//                 </h3>
//                 <div className="space-y-3">
//                   {filteredWorkOrders
//                     .filter((wo) => wo.status === "completed")
//                     .map((workOrder) => (
//                       <motion.div
//                         key={workOrder.id}
//                         whileHover={{ scale: 1.02 }}
//                         whileTap={{ scale: 0.98 }}
//                         className="bg-white p-4 rounded-lg shadow-sm border border-blue-100 cursor-pointer"
//                         onClick={() => openWorkOrderDetails(workOrder, false)}
//                       >
//                         <div className="flex justify-between items-start">
//                           <div>
//                             <h4 className="font-medium text-gray-900">{workOrder.title}</h4>
//                             <p className="text-sm text-gray-600">{workOrder.id}</p>
//                           </div>
//                           <span className={`px-2 py-1 text-xs font-bold rounded-full ${getPriorityColor(workOrder.priority)}`}>{workOrder.priority.charAt(0).toUpperCase() + workOrder.priority.slice(1)}</span>
//                         </div>
//                         {workOrder.assetName && (
//                           <p className="text-xs text-gray-500 mt-2">
//                             <FiPackage className="inline mr-1" />
//                             {workOrder.assetName}
//                           </p>
//                         )}
//                         <p className="text-xs text-gray-500 mt-2">
//                           <FiCheckCircle className="inline mr-1 text-green-500" />
//                           Completed: {new Date(workOrder.completedAt).toLocaleDateString()}
//                         </p>
//                         <div className="flex items-center mt-3">
//                           <img src={workOrder.assignedToAvatar} alt={workOrder.assignedTo} className="w-6 h-6 rounded-full border border-blue-200" />
//                           <span className="text-xs text-gray-600 ml-2">{workOrder.assignedTo}</span>
//                         </div>
//                       </motion.div>
//                     ))}
//                 </div>
//               </div>
//             </div>
//           )}

//           {/* Pagination */}
//           {filteredWorkOrders.length > workOrdersPerPage && (
//             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} exit={{ opacity: 0 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
//               <div className="text-sm text-gray-600 mb-4 sm:mb-0">
//                 Showing <span className="font-semibold">{indexOfFirstWorkOrder + 1}</span> to <span className="font-semibold">{Math.min(indexOfLastWorkOrder, filteredWorkOrders.length)}</span> of{" "}
//                 <span className="font-semibold">{filteredWorkOrders.length}</span> results
//               </div>
//               <div className="flex space-x-2">
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   Previous
//                 </motion.button>
//                 {Array.from({ length: totalPages }, (_, i) => (
//                   <motion.button
//                     key={i + 1}
//                     whileHover={{ scale: 1.05 }}
//                     whileTap={{ scale: 0.95 }}
//                     onClick={() => paginate(i + 1)}
//                     className={`px-4 py-2 rounded-lg transition-colors duration-200 shadow-sm
//                       ${currentPage === i + 1 ? "bg-blue-600 text-white shadow-md" : "bg-white text-gray-700 hover:bg-blue-50 border border-blue-200"}
//                     `}
//                   >
//                     {i + 1}
//                   </motion.button>
//                 ))}
//                 <motion.button
//                   whileHover={{ scale: 1.05 }}
//                   whileTap={{ scale: 0.95 }}
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-4 py-2 border border-blue-200 rounded-lg bg-white text-gray-700 hover:bg-blue-50 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                 >
//                   Next
//                 </motion.button>
//               </div>
//             </motion.div>
//           )}
//         </main>
//       </div>

//       {/* Add Work Order Modal */}
//       <Modal isOpen={showAddWorkOrderModal} onClose={() => setShowAddWorkOrderModal(false)} title="Create New Work Order">
//         <AddWorkOrderForm onAddWorkOrder={handleAddWorkOrder} currentUser={user || users[0]} assets={assets} users={users} />
//       </Modal>

//       {/* View/Edit Work Order Modal */}
//       {selectedWorkOrder && (
//         <Modal
//           isOpen={showWorkOrderDetailsModal}
//           onClose={() => {
//             setShowWorkOrderDetailsModal(false);
//             setSelectedWorkOrder(null);
//             setIsEditing(false);
//           }}
//           title={isEditing ? "Edit Work Order" : "Work Order Details"}
//           size="xl"
//         >
//           <WorkOrderDetailsForm
//             workOrder={selectedWorkOrder}
//             isEditing={isEditing}
//             onSave={handleUpdateWorkOrder}
//             onCancel={() => {
//               setShowWorkOrderDetailsModal(false);
//               setSelectedWorkOrder(null);
//               setIsEditing(false);
//             }}
//             onComplete={handleCompleteWorkOrder}
//             onPrint={handlePrintWorkOrder}
//             onEscalate={handleEscalateWorkOrder}
//             currentUser={user || users[0]}
//             users={users}
//             knowledgeBase={knowledgeBase}
//             assets={assets}
//           />
//         </Modal>
//       )}
//     </div>
//   );
// };

// export default WorkOrdersDashboard;
