// import React, { useState, useEffect, useCallback, useRef } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { useAuth, WorkOrderFormData, User } from "../../../routes/AuthContext";
// import { motion, AnimatePresence } from "framer-motion";
// import Sidebar from "../../Sidebar";
// import {
//   Plus,
//   X,
//   LogOut,
//   AlertTriangle,
//   CheckCircle,
//   Clock,
//   Paperclip,
//   ArrowLeft,
//   Clipboard,
//   Sun,
//   Moon,
//   Settings,
//   Bell,
//   User as UserIcon,
//   ChevronDown,
//   ChevronRight,
//   ToolCase,
//   Info,
//   ListPlus, // For consistency with AddWorkOrderFormIT submit button icon
//   ChevronLeft, // For consistency with AddWorkOrderFormIT back button
//   Save, // For the update button
// } from "lucide-react";

// // Modal component (reused from WorkOrders.tsx for consistency)
// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
//   if (!isOpen) return null;

//   return (
//     <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
//       <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100">
//         <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
//           <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
//           <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
//             <X size={24} />
//           </motion.button>
//         </div>
//         <div>{children}</div>
//       </motion.div>
//     </motion.div>
//   );
// };

// const EditWorkOrderIT: React.FC = () => {
//   const { id } = useParams<{ id: string }>();
//   const { getWorkOrderById, updateWorkOrder, user, getUsers } = useAuth();
//   const navigate = useNavigate();

//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState<string | null>(null);
//   const [successMessage, setSuccessMessage] = useState<string | null>(null);
//   const [users, setUsers] = useState<User[]>([]);
//   const [showSuccessModal, setShowSuccessModal] = useState(false);

//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
//     const stored = localStorage.getItem("sidebarOpen");
//     return stored ? JSON.parse(stored) : false;
//   });
//   const [darkMode, setDarkMode] = useState(false);
//   const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);

//   const notificationsRef = useRef<HTMLDivElement>(null);
//   const profileRef = useRef<HTMLDivElement>(null);

//   const initialFormData: WorkOrderFormData = {
//     id: 0,
//     title: "",
//     description: "",
//     type: "preventive",
//     status: "open",
//     priority: "low",
//     assignedTo: "",
//     assignedToAvatar: "",
//     createdBy: user?.id || "Unknown User",
//     createdAt: new Date().toISOString().split("T")[0],
//     dueDate: "",
//     assetId: "",
//     assetName: "",
//     assetType: "",
//     estimatedHours: null,
//     attachments: [],
//   };

//   const [formData, setFormData] = useState<WorkOrderFormData>(initialFormData);

//   // Dummy insights data for notifications to match AddAsset.tsx
//   const insights = [
//     {
//       id: 1,
//       title: "Maintenance Efficiency Improved",
//       description: "Preventive maintenance completion rate increased by 15% this month",
//       icon: <CheckCircle className="text-green-500" />,
//       date: "Today, 09:30 AM",
//     },
//     {
//       id: 2,
//       title: "3 Assets Requiring Attention",
//       description: "Critical assets showing signs of wear need inspection",
//       icon: <AlertTriangle className="text-yellow-500" />,
//       date: "Yesterday, 02:15 PM",
//     },
//     {
//       id: 3,
//       title: "Monthly Maintenance Completed",
//       description: "All scheduled maintenance tasks completed on time",
//       icon: <CheckCircle className="text-blue-500" />,
//       date: "Jul 28, 2023",
//     },
//   ];

//   // Fetch work order data and users on component mount
//   useEffect(() => {
//     const fetchData = async () => {
//       if (!id) {
//         setError("Work Order ID not provided.");
//         setLoading(false);
//         return;
//       }

//       try {
//         setLoading(true);
//         setError(null);
//         const [workOrderData, fetchedUsers] = await Promise.all([getWorkOrderById(id), getUsers()]);

//         if (workOrderData) {
//           const attachments = workOrderData.attachments || [];
//           setFormData({
//             ...workOrderData,
//             id: Number(id),
//             dueDate: workOrderData.dueDate.split("T")[0],
//             attachments: attachments,
//           });
//         } else {
//           setError(`Work Order with ID "${id}" not found.`);
//         }
//         setUsers(fetchedUsers);
//       } catch (err: any) {
//         setError("Failed to fetch data. Please try again.");
//         console.error("Fetch error:", err);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, [id, getWorkOrderById, getUsers]);

//   // Handle window resize for mobile view
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

//   // Handle clicks outside notification/profile popups
//   useEffect(() => {
//     const handleClickOutside = (event: MouseEvent) => {
//       if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
//         setShowNotificationsPopup(false);
//       }
//       if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
//         setShowProfileMenu(false);
//       }
//     };

//     document.addEventListener("mousedown", handleClickOutside);
//     return () => {
//       document.removeEventListener("mousedown", handleClickOutside);
//     };
//   }, []);

//   useEffect(() => {
//     document.documentElement.classList.toggle("dark", darkMode);
//     localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
//   }, [sidebarOpen, darkMode]);

//   // Toggle sidebar visibility
//   const toggleSidebar = () => {
//     localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
//     setSidebarOpen((prev) => !prev);
//   };

//   const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   }, []);

//   const handleNumericChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value === "" ? null : Number(value) }));
//   }, []);

//   const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       const filesArray = Array.from(e.target.files);
//       setFormData((prev) => ({ ...prev, attachments: filesArray }));
//     } else {
//       setFormData((prev) => ({ ...prev, attachments: [] }));
//     }
//   }, []);

//   const handleRemoveFile = useCallback((fileName: string) => {
//     setFormData((prev) => ({
//       ...prev,
//       attachments: prev.attachments.filter((file) => file.name !== fileName),
//     }));
//   }, []);

//   const handleSubmit = useCallback(
//     async (e: React.FormEvent) => {
//       e.preventDefault();
//       setLoading(true);
//       setError(null);
//       setSuccessMessage(null);

//       if (!formData.title || !formData.description || !formData.assignedTo || !formData.dueDate || !formData.assetId) {
//         setError("Please fill in all required fields: Title, Description, Assigned To, Due Date, and Asset ID.");
//         setLoading(false);
//         return;
//       }

//       try {
//         const selectedAssignedToUser = users.find((u) => u.id === formData.assignedTo);
//         const dataToSend: WorkOrderFormData = {
//           ...formData,
//           estimatedHours: formData.estimatedHours ?? 0,
//           assignedToAvatar: selectedAssignedToUser?.email ? `https://api.dicebear.com/7.x/initials/svg?seed=${selectedAssignedToUser.email}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50` : "",
//           id: Number(id),
//           createdBy: user?.id || "Unknown User",
//         };

//         await updateWorkOrder(Number(id), dataToSend);
//         setSuccessMessage("Work order record successfully updated!");
//         setShowSuccessModal(true);
//       } catch (err: any) {
//         setError(err.message || "Failed to update work order record. Please try again.");
//         console.error("Submission error:", err);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [formData, updateWorkOrder, id, user, users]
//   );

//   const handleCloseSuccessModal = useCallback(() => {
//     setShowSuccessModal(false);
//     navigate("/workorders/it");
//   }, [navigate]);

//   if (loading && !formData.title) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-blue-50">
//         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
//         <p className="ml-4 text-lg text-gray-700">Loading work order data...</p>
//       </div>
//     );
//   }

//   if (error && !formData.title) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-red-50">
//         <AlertTriangle className="text-red-600 text-5xl" />
//         <p className="ml-4 text-lg text-red-800">{error}</p>
//       </div>
//     );
//   }

//   return (
//     <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
//       <Sidebar />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         {/* Header section */}
//         <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
//           <div className="flex items-center space-x-4">
//             {isMobile && (
//               <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
//                 <ChevronRight className="text-xl" />
//               </motion.button>
//             )}
//             <motion.button onClick={() => navigate("/workorders/it")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200">
//               <ChevronLeft className="text-xl" />
//               <span className="font-semibold text-sm hidden md:inline">Back to Work Orders</span>
//             </motion.button>
//             <h2 className="text-lg md:text-xl font-bold text-gray-900 ml-4">Edit Work Order</h2>
//           </div>

//           <div className="flex items-center space-x-3 relative">
//             {/* Dark mode toggle */}
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
//               aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
//             </motion.button>

//             {/* Notifications dropdown */}
//             <div className="relative" ref={notificationsRef}>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
//                 className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
//                 aria-label="Notifications"
//               >
//                 <Bell className="text-xl" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full animate-pulse border border-white"></span>
//               </motion.button>

//               <AnimatePresence>
//                 {showNotificationsPopup && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
//                   >
//                     <div className="flex justify-between items-center px-4 py-2 border-b border-gray-100">
//                       <h4 className="font-semibold text-gray-800">Notifications</h4>
//                       <button onClick={() => setShowNotificationsPopup(false)} className="text-gray-500 hover:text-gray-700">
//                         <X size={18} />
//                       </button>
//                     </div>
//                     <div className="max-h-64 overflow-y-auto custom-scrollbar">
//                       {insights.slice(0, 3).map((notification) => (
//                         <div key={notification.id} className="flex items-start px-4 py-3 hover:bg-blue-50 cursor-pointer border-b border-gray-50 last:border-b-0">
//                           <div className="p-2 mr-3 mt-0.5 rounded-full bg-blue-50 text-blue-600">{notification.icon}</div>
//                           <div>
//                             <p className="font-medium text-sm text-gray-800">{notification.title}</p>
//                             <p className="text-xs text-gray-600 mt-1">{notification.description}</p>
//                             <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
//                           </div>
//                         </div>
//                       ))}
//                       {insights.length === 0 && <p className="text-gray-500 text-sm px-4 py-3">No new notifications.</p>}
//                     </div>
//                     <div className="px-4 py-2 border-t border-gray-100 text-center">
//                       <button
//                         onClick={() => {
//                           console.log("View All Notifications clicked");
//                           setShowNotificationsPopup(false);
//                         }}
//                         className="text-blue-600 hover:underline text-sm font-medium"
//                       >
//                         View All
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

//             {/* User profile dropdown */}
//             <div className="relative" ref={profileRef}>
//               <motion.button
//                 whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
//                 whileTap={{ scale: 0.98 }}
//                 onClick={() => setShowProfileMenu(!showProfileMenu)}
//                 className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
//               >
//                 <img
//                   src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
//                   alt="User Avatar"
//                   className="w-8 h-8 rounded-full border border-blue-200 object-cover"
//                 />
//                 <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
//                 <ChevronDown className="text-gray-500 text-base" />
//               </motion.button>

//               <AnimatePresence>
//                 {showProfileMenu && (
//                   <motion.div
//                     initial={{ opacity: 0, y: -10, scale: 0.95 }}
//                     animate={{ opacity: 1, y: 0, scale: 1 }}
//                     exit={{ opacity: 0, y: -10, scale: 0.95 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
//                   >
//                     <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Signed in as</div>
//                     <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{user?.name || "Guest User"}</div>
//                     <button
//                       onClick={() => {
//                         navigate("/profile");
//                         setShowProfileMenu(false);
//                       }}
//                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
//                     >
//                       <UserIcon size={16} className="mr-2" /> My Profile
//                     </button>
//                     <button
//                       onClick={() => {
//                         navigate("/settings");
//                         setShowProfileMenu(false);
//                       }}
//                       className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
//                     >
//                       <Settings size={16} className="mr-2" /> Settings
//                     </button>
//                     <hr className="my-1 border-gray-100" />
//                     <button
//                       onClick={() => {
//                         navigate("/logout");
//                         setShowProfileMenu(false);
//                       }}
//                       className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
//                     >
//                       <LogOut size={16} className="mr-2" /> Logout
//                     </button>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>
//           </div>
//         </header>

//         {/* Main content area */}
//         <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Edit Work Order</h1>
//               <p className="text-gray-600 mt-1">Update details of the existing maintenance or service request</p>
//             </div>
//             <motion.button
//               onClick={() => navigate("/workorders/it")}
//               whileHover={{ scale: 1.05, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
//               whileTap={{ scale: 0.95 }}
//               className="flex items-center space-x-2 bg-white border border-gray-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md"
//             >
//               <ChevronLeft className="text-lg" /> Back to Work Orders
//             </motion.button>
//           </motion.div>

//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden p-4 md:p-6 border border-blue-50">
//             {error && (
//               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-6" role="alert">
//                 <strong className="font-bold">Error!</strong>
//                 <span className="block sm:inline ml-2">{error}</span>
//                 <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
//                   <X className="fill-current h-6 w-6 text-red-500 cursor-pointer" onClick={() => setError(null)} />
//                 </span>
//               </motion.div>
//             )}
//             {successMessage && (
//               <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-6" role="alert">
//                 <strong className="font-bold">Success!</strong>
//                 <span className="block sm:inline ml-2">{successMessage}</span>
//                 <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
//                   <X className="fill-current h-6 w-6 text-green-500 cursor-pointer" onClick={() => setSuccessMessage(null)} />
//                 </span>
//               </motion.div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Work Order Details */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <div>
//                   <label htmlFor="title" className="block text-sm font-medium text-gray-700">
//                     Title <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="title"
//                     name="title"
//                     value={formData.title}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="e.g., Fix leaky faucet in Unit 301"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="type" className="block text-sm font-medium text-gray-700">
//                     Type
//                   </label>
//                   <select
//                     id="type"
//                     name="type"
//                     value={formData.type}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                   >
//                     <option value="preventive">Preventive</option>
//                     <option value="corrective">Corrective</option>
//                     <option value="inspection">Inspection</option>
//                     <option value="emergency">Emergency</option>
//                   </select>
//                 </div>
//                 <div className="md:col-span-2">
//                   <label htmlFor="description" className="block text-sm font-medium text-gray-700">
//                     Description <span className="text-red-500">*</span>
//                   </label>
//                   <textarea
//                     id="description"
//                     name="description"
//                     value={formData.description || ""}
//                     onChange={handleChange}
//                     required
//                     rows={3}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="Provide a detailed description of the work needed."
//                   ></textarea>
//                 </div>
//               </div>

//               {/* Asset Information */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
//                 <div>
//                   <label htmlFor="assetId" className="block text-sm font-medium text-gray-700">
//                     Asset ID <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="text"
//                     id="assetId"
//                     name="assetId"
//                     value={formData.assetId}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="e.g., AST-001"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="assetName" className="block text-sm font-medium text-gray-700">
//                     Asset Name
//                   </label>
//                   <input
//                     type="text"
//                     id="assetName"
//                     name="assetName"
//                     value={formData.assetName}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="e.g., HVAC Unit A"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="assetType" className="block text-sm font-medium text-gray-700">
//                     Asset Type
//                   </label>
//                   <input
//                     type="text"
//                     id="assetType"
//                     name="assetType"
//                     value={formData.assetType}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="e.g., Mechanical"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
//                     Priority
//                   </label>
//                   <select
//                     id="priority"
//                     name="priority"
//                     value={formData.priority}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                   >
//                     <option value="low">Low</option>
//                     <option value="medium">Medium</option>
//                     <option value="high">High</option>
//                     <option value="critical">Critical</option>
//                   </select>
//                 </div>
//                 <div>
//                   <label htmlFor="status" className="block text-sm font-medium text-gray-700">
//                     Status<span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     id="status"
//                     name="status"
//                     value={formData.status}
//                     onChange={handleChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     required
//                   >
//                     <option value="open">Open</option>
//                     <option value="in_progress">In Progress</option>
//                     <option value="completed">Completed</option>
//                     <option value="on_hold">On Hold</option>
//                     <option value="canceled">Canceled</option>
//                   </select>
//                 </div>
//               </div>

//               {/* Assignment & Estimation */}
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-gray-100">
//                 <div>
//                   <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700">
//                     Assigned To <span className="text-red-500">*</span>
//                   </label>
//                   <select
//                     id="assignedTo"
//                     name="assignedTo"
//                     value={formData.assignedTo}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                   >
//                     <option value="">Select User</option>
//                     {users.map((u) => (
//                       <option key={u.id} value={u.id}>
//                         {u.name}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700">
//                     Due Date <span className="text-red-500">*</span>
//                   </label>
//                   <input
//                     type="date"
//                     id="dueDate"
//                     name="dueDate"
//                     value={formData.dueDate}
//                     onChange={handleChange}
//                     required
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                   />
//                 </div>
//                 <div>
//                   <label htmlFor="estimatedHours" className="block text-sm font-medium text-gray-700">
//                     Estimated Hours
//                   </label>
//                   <input
//                     type="number"
//                     id="estimatedHours"
//                     name="estimatedHours"
//                     value={formData.estimatedHours ?? ""}
//                     onChange={handleNumericChange}
//                     className="mt-1 block w-full border border-gray-200 rounded-lg shadow-sm p-2.5 bg-white focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
//                     placeholder="e.g., 8"
//                     min="0"
//                   />
//                 </div>
//               </div>

//               {/* Attachments Input */}
//               <div className="mt-6 pt-6 border-t border-gray-100">
//                 <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-1">
//                   Upload Files (Images, PDFs, Spreadsheets)
//                 </label>
//                 <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-200 border-dashed rounded-lg cursor-pointer hover:border-blue-400 transition-all duration-200">
//                   <div className="space-y-1 text-center">
//                     <Paperclip className="mx-auto h-12 w-12 text-gray-400" />
//                     <div className="flex text-sm text-gray-600">
//                       <label
//                         htmlFor="file-upload"
//                         className="relative cursor-pointer rounded-md bg-white font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500 focus-within:ring-offset-2"
//                       >
//                         <span>Upload a file</span>
//                         <input id="file-upload" name="file-upload" type="file" className="sr-only" multiple onChange={handleFileChange} />
//                       </label>
//                       <p className="pl-1">or drag and drop</p>
//                     </div>
//                     <p className="text-xs text-gray-500">PNG, JPG, GIF, PDF up to 10MB</p>
//                   </div>
//                 </div>
//                 {formData.attachments.length > 0 && (
//                   <ul className="mt-3 border border-gray-200 rounded-md divide-y divide-gray-200">
//                     {formData.attachments.map((file, index) => (
//                       <li key={file.name} className="flex items-center justify-between py-2 pl-3 pr-4 text-sm">
//                         <div className="flex w-0 flex-1 items-center">
//                           <Paperclip className="h-5 w-5 flex-shrink-0 text-gray-400" aria-hidden="true" />
//                           <span className="ml-2 w-0 flex-1 truncate">{file.name}</span>
//                         </div>
//                         <div className="ml-4 flex-shrink-0">
//                           <motion.button type="button" onClick={() => handleRemoveFile(file.name)} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="font-medium text-red-600 hover:text-red-900 transition-colors duration-200">
//                             Remove
//                           </motion.button>
//                         </div>
//                       </li>
//                     ))}
//                   </ul>
//                 )}
//               </div>

//               <div className="flex justify-end space-x-3 mt-6">
//                 <motion.button
//                   type="button"
//                   onClick={() => navigate("/workorders/it")}
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   className="inline-flex items-center px-5 py-2.5 border border-gray-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
//                 >
//                   Cancel
//                 </motion.button>
//                 <motion.button
//                   type="submit"
//                   whileHover={{ scale: 1.03 }}
//                   whileTap={{ scale: 0.97 }}
//                   disabled={loading}
//                   className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//                 >
//                   {loading ? (
//                     <>
//                       <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                         <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                         <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                       </svg>
//                       Updating...
//                     </>
//                   ) : (
//                     <>
//                       <Save className="mr-2 h-5 w-5" />
//                       Update Work Order
//                     </>
//                   )}
//                 </motion.button>
//               </div>
//             </form>
//           </motion.div>
//         </main>
//       </div>

//       {/* Success Modal */}
//       <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
//         <div className="flex flex-col items-center justify-center py-4">
//           <CheckCircle className="text-green-500 text-6xl mb-4" />
//           <p className="text-lg font-medium text-gray-800 text-center">{successMessage}</p>
//           <motion.button
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.97 }}
//             onClick={handleCloseSuccessModal}
//             className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200 font-semibold"
//           >
//             Go to Work Orders
//           </motion.button>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default EditWorkOrderIT;
