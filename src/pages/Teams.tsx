// import React, { useState, useEffect, useRef } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { useAuth } from "../routes/AuthContext";
// import logoWida from "../assets/logo-wida.png";
// import { motion, AnimatePresence } from "framer-motion";
// import Sidebar from "../component/Sidebar";
// import {
//   Plus,
//   Upload,
//   ChevronUp,
//   ChevronDown,
//   ChevronLeft,
//   ChevronRight,
//   Search,
//   LogOut,
//   Settings,
//   Bell,
//   Edit,
//   Eye,
//   Clock,
//   Calendar,
//   Trash2,
//   Key,
//   Info,
//   Moon,
//   Sun,
//   User as UserIcon,
//   Home,
//   Package,
//   Clipboard,
//   Database,
//   BarChart2,
//   Users,
//   Wrench,
//   CheckCircle,
//   Download,
//   Filter,
//   X,
// } from "lucide-react";

// interface TeamMember {
//   id: number;
//   name: string;
//   nik: string;
//   role: string;
//   department: string;
//   phone: string;
//   avatar: string;
//   status: "Active" | "On Leave";
//   joinDate: string;
//   lastActive: string;
// }

// interface NavItemProps {
//   icon: React.ReactNode;
//   text: string;
//   to: string;
//   expanded: boolean;
// }

// const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const active = location.pathname === to;

//   return (
//     <motion.button
//       onClick={() => navigate(to)}
//       whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }}
//       whileTap={{ scale: 0.98 }}
//       className={`relative w-full text-left flex items-center py-3 px-4 rounded-xl transition-all duration-200 ease-in-out group
//         ${active ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-blue-700"}
//       `}
//     >
//       <span className={`text-xl transition-colors duration-200 ${active ? "text-white" : "text-blue-500 group-hover:text-blue-700"}`}>{icon}</span>
//       {expanded && (
//         <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="ml-4 text-base font-medium whitespace-nowrap">
//           {text}
//         </motion.span>
//       )}
//     </motion.button>
//   );
// };

// const StatCard: React.FC<{ title: string; value: number; change?: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
//   const isPositive = change?.startsWith("+");

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 20 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.5, ease: "easeOut" }}
//       whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
//       className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
//     >
//       <div className="flex items-center justify-between z-10 relative">
//         <div>
//           <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
//           <p className="text-3xl font-bold text-gray-900">{value}</p>
//         </div>
//         <div className="p-2 rounded-full bg-blue-50 text-blue-600 text-2xl opacity-90 transition-all duration-200">{icon}</div>
//       </div>
//       {change && <p className={`mt-3 text-xs font-semibold ${isPositive ? "text-green-600" : "text-red-600"}`}>{change} from last month</p>}
//     </motion.div>
//   );
// };

// interface ModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   title: string;
//   children: React.ReactNode;
//   className?: string;
// }

// const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, className }) => {
//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <motion.div
//           initial={{ opacity: 0 }}
//           animate={{ opacity: 1 }}
//           exit={{ opacity: 0 }}
//           transition={{ duration: 0.2 }}
//           className="fixed inset-0 backdrop-brightness-50 bg-opacity-40 flex justify-center items-center z-50 p-4 backdrop-blur-sm"
//         >
//           <motion.div
//             initial={{ y: 50, opacity: 0, scale: 0.95 }}
//             animate={{ y: 0, opacity: 1, scale: 1 }}
//             exit={{ y: 50, opacity: 0, scale: 0.95 }}
//             transition={{ duration: 0.3, type: "spring", damping: 25, stiffness: 300 }}
//             className={`bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col ${className || "max-w-xl w-full"}`}
//           >
//             <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-blue-50">
//               <h2 className="text-xl font-bold text-gray-800">{title}</h2>
//               <button onClick={onClose} className="p-1.5 rounded-full text-gray-500 hover:bg-blue-100 hover:text-gray-700 focus:outline-none transition-colors duration-150" aria-label="Close modal">
//                 <X className="text-xl" />
//               </button>
//             </div>
//             <div className="p-6 overflow-y-auto custom-scrollbar flex-grow">{children}</div>
//           </motion.div>
//         </motion.div>
//       )}
//     </AnimatePresence>
//   );
// };

// const TeamDashboard: React.FC = () => {
//   const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
//     const stored = localStorage.getItem("sidebarOpen");
//     return stored ? JSON.parse(stored) : false;
//   });
//   const [searchTerm, setSearchTerm] = useState("");
//   const [activeTab, setActiveTab] = useState("all");
//   const [selectedDepartment, setSelectedDepartment] = useState("all");
//   const [showAddModal, setShowAddModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState<TeamMember | null>(null);
//   const { user, hasPermission } = useAuth();
//   const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
//   const [darkMode, setDarkMode] = useState(false);
//   const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
//   const [showProfileMenu, setShowProfileMenu] = useState(false);
//   const notificationsRef = useRef<HTMLDivElement>(null);
//   const profileRef = useRef<HTMLDivElement>(null);
//   const navigate = useNavigate();

//   const [newUser, setNewUser] = useState({
//     name: "",
//     nik: "",
//     role: "technician",
//     department: "maintenance",
//     phone: "",
//   });

//   const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
//     {
//       id: 1,
//       name: "Budi Santoso",
//       nik: "1234567890123456",
//       role: "Maintenance Supervisor",
//       department: "Facility Management",
//       phone: "+62 812-3456-7890",
//       avatar: "https://randomuser.me/api/portraits/men/32.jpg",
//       status: "Active",
//       joinDate: "2021-03-15",
//       lastActive: "2023-08-20 09:45",
//     },
//     {
//       id: 2,
//       name: "Ani Wijaya",
//       nik: "1234567890123456",
//       role: "Maintenance Technician",
//       department: "Mechanical",
//       phone: "+62 813-4567-8901",
//       avatar: "https://randomuser.me/api/portraits/women/44.jpg",
//       status: "Active",
//       joinDate: "2021-05-22",
//       lastActive: "2023-08-20 14:30",
//     },
//     {
//       id: 3,
//       name: "Rudi Hermawan",
//       nik: "1234567890123456",
//       role: "Electrical Engineer",
//       department: "Electrical",
//       phone: "+62 814-5678-9012",
//       avatar: "https://randomuser.me/api/portraits/men/67.jpg",
//       status: "Active",
//       joinDate: "2021-07-10",
//       lastActive: "2023-08-19 11:15",
//     },
//     {
//       id: 4,
//       name: "Citra Dewi",
//       nik: "1234567890123456",
//       role: "Inventory Manager",
//       department: "Logistics",
//       phone: "+62 815-6789-0123",
//       avatar: "https://randomuser.me/api/portraits/women/28.jpg",
//       status: "Active",
//       joinDate: "2021-09-05",
//       lastActive: "2023-08-18 16:20",
//     },
//     {
//       id: 5,
//       name: "Dodi Pratama",
//       nik: "1234567890123456",
//       role: "Facility Manager",
//       department: "Facility Management",
//       phone: "+62 816-7890-1234",
//       avatar: "https://randomuser.me/api/portraits/men/45.jpg",
//       status: "Active",
//       joinDate: "2020-11-18",
//       lastActive: "2023-08-20 08:00",
//     },
//     {
//       id: 6,
//       name: "Eka Putri",
//       nik: "1234567890123456",
//       role: "Maintenance Technician",
//       department: "HVAC",
//       phone: "+62 817-8901-2345",
//       avatar: "https://randomuser.me/api/portraits/women/33.jpg",
//       status: "On Leave",
//       joinDate: "2022-01-30",
//       lastActive: "2023-08-15 10:00",
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

//   const toggleSidebar = () => {
//     localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
//     setSidebarOpen((prev) => !prev);
//   };

//   const handleAddUser = () => {
//     const newId = Math.max(...teamMembers.map((member) => member.id)) + 1;
//     setTeamMembers([
//       ...teamMembers,
//       {
//         id: newId,
//         name: newUser.name,
//         nik: newUser.nik,
//         role: newUser.role,
//         department: newUser.department,
//         phone: newUser.phone,
//         avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 50)}.jpg`,
//         status: "Active",
//         joinDate: new Date().toISOString().split("T")[0],
//         lastActive: "Just now",
//       },
//     ]);
//     setShowAddModal(false);
//     setNewUser({
//       name: "",
//       nik: "",
//       role: "technician",
//       department: "maintenance",
//       phone: "",
//     });
//     setSelectedUser(null);
//   };

//   const handleDeleteUser = () => {
//     if (selectedUser) {
//       setTeamMembers(teamMembers.filter((member) => member.id !== selectedUser.id));
//       setShowDeleteModal(false);
//       setSelectedUser(null);
//     }
//   };

//   const getStatusColor = (status: string) => {
//     switch (status) {
//       case "Active":
//         return "bg-green-100 text-green-800 border border-green-200";
//       case "On Leave":
//         return "bg-yellow-100 text-yellow-800 border border-yellow-200";
//       default:
//         return "bg-gray-100 text-gray-800 border border-gray-200";
//     }
//   };

//   const filteredMembers = teamMembers.filter((member) => {
//     const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.nik.toLowerCase().includes(searchTerm.toLowerCase());

//     const matchesTab = activeTab === "all" || (activeTab === "active" && member.status === "Active") || (activeTab === "on leave" && member.status === "On Leave");

//     const matchesDepartment = selectedDepartment === "all" || member.department.toLowerCase() === selectedDepartment.toLowerCase();

//     return matchesSearch && matchesTab && matchesDepartment;
//   });

//   const departments = [...new Set(teamMembers.map((member) => member.department))];
//   const roles = [...new Set(teamMembers.map((member) => member.role))];

//   return (
//     <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
//       <Sidebar />

//       <div className="flex-1 flex flex-col overflow-hidden">
//         <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
//           <div className="flex items-center space-x-4">
//             {isMobile && (
//               <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
//                 <ChevronRight className="text-xl" />
//               </motion.button>
//             )}
//             <Users className="text-xl text-blue-600" />
//             <h2 className="text-lg md:text-xl font-bold text-gray-900">Team Management</h2>
//           </div>

//           <div className="flex items-center space-x-3 relative">
//             <motion.button
//               whileHover={{ scale: 1.05 }}
//               whileTap={{ scale: 0.95 }}
//               onClick={() => setDarkMode(!darkMode)}
//               className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
//               aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
//             >
//               {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
//             </motion.button>

//             <div className="relative" ref={notificationsRef}>
//               <motion.button
//                 whileHover={{ scale: 1.05 }}
//                 whileTap={{ scale: 0.95 }}
//                 onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
//                 className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
//                 aria-label="Notifications"
//               >
//                 <Bell className="text-xl" />
//                 <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
//               </motion.button>

//               <AnimatePresence>
//                 {showNotificationsPopup && (
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     exit={{ opacity: 0, y: 20 }}
//                     transition={{ duration: 0.2 }}
//                     className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
//                   >
//                     <div className="p-4 border-b border-gray-100">
//                       <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
//                     </div>
//                     <div className="max-h-80 overflow-y-auto custom-scrollbar">
//                       <div className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
//                         <div className="flex-shrink-0 mr-3">
//                           <CheckCircle className="text-green-500" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-semibold text-gray-800">New team member added</p>
//                           <p className="text-xs text-gray-600 mt-1">John Doe has joined the maintenance team</p>
//                           <p className="text-xs text-gray-400 mt-1">Today, 10:00 AM</p>
//                         </div>
//                       </div>
//                       <div className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
//                         <div className="flex-shrink-0 mr-3">
//                           <Clock className="text-yellow-500" />
//                         </div>
//                         <div>
//                           <p className="text-sm font-semibold text-gray-800">Leave request</p>
//                           <p className="text-xs text-gray-600 mt-1">Jane Smith has requested time off</p>
//                           <p className="text-xs text-gray-400 mt-1">Yesterday, 03:00 PM</p>
//                         </div>
//                       </div>
//                     </div>
//                     <div className="p-4 border-t border-gray-100 text-center">
//                       <button
//                         onClick={() => {
//                           setShowNotificationsPopup(false);
//                         }}
//                         className="text-blue-600 hover:text-blue-800 text-sm font-medium"
//                       >
//                         Mark all as read
//                       </button>
//                     </div>
//                   </motion.div>
//                 )}
//               </AnimatePresence>
//             </div>

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

//         <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
//           <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
//             <div>
//               <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
//                 Team <span className="text-blue-600">Management</span>
//               </h1>
//               <p className="text-gray-600 mt-2 text-sm max-w-xl">Manage your team members and their permissions to optimize maintenance operations.</p>
//             </div>
//             <div className="flex flex-wrap gap-3 items-center">
//               <motion.button
//                 onClick={() => setShowAddModal(true)}
//                 whileHover={{ scale: 1.02, boxShadow: "0 4px 12px rgba(37, 99, 235, 0.3)" }}
//                 whileTap={{ scale: 0.98 }}
//                 className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-md font-semibold text-sm"
//               >
//                 <Plus className="text-base" />
//                 <span>Add Member</span>
//               </motion.button>
//               <motion.button
//                 onClick={() => alert("Export functionality")}
//                 whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
//                 whileTap={{ scale: 0.98 }}
//                 className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
//               >
//                 <Download className="text-base" />
//                 <span>Export</span>
//               </motion.button>
//               <motion.button
//                 onClick={() => alert("Import functionality")}
//                 whileHover={{ scale: 1.02, boxShadow: "0 4px 10px rgba(0, 0, 0, 0.08)" }}
//                 whileTap={{ scale: 0.98 }}
//                 className="flex items-center space-x-2 bg-white border border-blue-200 text-gray-800 px-5 py-2.5 rounded-lg transition-all duration-200 ease-in-out shadow-sm font-semibold text-sm hover:bg-gray-50"
//               >
//                 <Upload className="text-base" />
//                 <span>Import</span>
//               </motion.button>
//             </div>
//           </motion.div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
//             <StatCard title="Total Members" value={teamMembers.length} icon={<Users />} />
//             <StatCard title="Active Members" value={teamMembers.filter((m) => m.status === "Active").length} icon={<CheckCircle />} />
//             <StatCard title="On Leave" value={teamMembers.filter((m) => m.status === "On Leave").length} icon={<Clock />} />
//             <StatCard title="Departments" value={departments.length} icon={<Database />} />
//           </div>

//           <motion.div layout className="mb-8 bg-white rounded-2xl shadow-md p-5 border border-blue-100">
//             <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
//               <div className="flex-1 relative">
//                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
//                 <input
//                   type="text"
//                   placeholder="Search by name, NIK, or department..."
//                   className="w-full pl-11 pr-4 py-2.5 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm transition-all duration-200 shadow-sm placeholder-gray-400"
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                 />
//               </div>

//               <select
//                 className="border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm appearance-none transition-all duration-200 shadow-sm cursor-pointer"
//                 style={{
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
//                   backgroundSize: "1rem",
//                   backgroundRepeat: "no-repeat",
//                   backgroundPosition: "right 0.75rem center",
//                 }}
//                 value={activeTab}
//                 onChange={(e) => setActiveTab(e.target.value)}
//               >
//                 <option value="all">All Members</option>
//                 <option value="active">Active</option>
//                 <option value="on leave">On Leave</option>
//               </select>

//               <select
//                 className="border border-blue-200 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500/50 bg-white text-sm appearance-none transition-all duration-200 shadow-sm cursor-pointer"
//                 style={{
//                   backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='currentColor'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
//                   backgroundSize: "1rem",
//                   backgroundRepeat: "no-repeat",
//                   backgroundPosition: "right 0.75rem center",
//                 }}
//                 value={selectedDepartment}
//                 onChange={(e) => setSelectedDepartment(e.target.value)}
//               >
//                 <option value="all">All Departments</option>
//                 {departments.map((dept) => (
//                   <option key={dept} value={dept.toLowerCase()}>
//                     {dept}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </motion.div>

//           <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md overflow-hidden border border-blue-100">
//             <div className="overflow-x-auto">
//               <table className="min-w-full divide-y divide-blue-100">
//                 <thead className="bg-blue-50">
//                   <tr>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Member
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Role
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Department
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Status
//                     </th>
//                     <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
//                       Last Active
//                     </th>
//                   </tr>
//                 </thead>
//                 <tbody className="bg-white divide-y divide-blue-100">
//                   {filteredMembers.length > 0 ? (
//                     filteredMembers.map((member) => (
//                       <motion.tr
//                         key={member.id}
//                         initial={{ opacity: 0, y: 5 }}
//                         animate={{ opacity: 1, y: 0 }}
//                         transition={{ duration: 0.15 }}
//                         whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.5)" }}
//                         className="transition-colors duration-150"
//                       >
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="flex items-center">
//                             <div className="flex-shrink-0 h-10 w-10">
//                               <img className="h-10 w-10 rounded-full" src={member.avatar} alt={member.name} />
//                             </div>
//                             <div className="ml-4">
//                               <div className="text-sm font-medium text-gray-900">{member.name}</div>
//                               <div className="text-sm text-gray-500">{member.nik}</div>
//                             </div>
//                           </div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{member.role}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <div className="text-sm text-gray-900">{member.department}</div>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap">
//                           <motion.span whileHover={{ scale: 1.03 }} className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(member.status)}`}>
//                             {member.status}
//                           </motion.span>
//                         </td>
//                         <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.lastActive}</td>
//                       </motion.tr>
//                     ))
//                   ) : (
//                     <tr>
//                       <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
//                         No team members found matching your criteria
//                       </td>
//                     </tr>
//                   )}
//                 </tbody>
//               </table>
//             </div>
//           </motion.div>

//           <div className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 mt-8">
//             <h3 className="text-lg font-bold text-gray-900 mb-4">Department Distribution</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-center">
//                 <div className="text-center text-gray-500">
//                   <BarChart2 className="mx-auto text-4xl mb-2 text-blue-400" />
//                   <p>Department chart visualization</p>
//                 </div>
//               </div>
//               <div className="space-y-4">
//                 {departments.map((dept) => (
//                   <div key={dept} className="flex items-center">
//                     <div className="w-1/3 text-sm font-medium text-gray-700">{dept}</div>
//                     <div className="w-1/2 bg-gray-200 rounded-full h-2.5 mx-2">
//                       <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(teamMembers.filter((m) => m.department === dept).length / teamMembers.length) * 100}%` }}></div>
//                     </div>
//                     <div className="w-1/6 text-right text-sm text-gray-500">{Math.round((teamMembers.filter((m) => m.department === dept).length / teamMembers.length) * 100)}%</div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </main>
//       </div>

//       <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title={selectedUser ? "Edit Team Member" : "Add New Team Member"}>
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
//             <input
//               type="text"
//               className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newUser.name}
//               onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
//             <input
//               type="text"
//               className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newUser.nik}
//               onChange={(e) => setNewUser({ ...newUser, nik: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
//             <input
//               type="tel"
//               className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newUser.phone}
//               onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
//             <select
//               className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newUser.role}
//               onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
//             >
//               <option value="technician">Maintenance Technician</option>
//               <option value="supervisor">Maintenance Supervisor</option>
//               <option value="engineer">Engineer</option>
//               <option value="manager">Facility Manager</option>
//               <option value="inventory">Inventory Manager</option>
//               <option value="admin">Administrator</option>
//             </select>
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
//             <select
//               className="w-full bg-blue-50 border border-blue-200 rounded-lg p-3 text-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
//               value={newUser.department}
//               onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}
//             >
//               <option value="maintenance">Maintenance</option>
//               <option value="facility">Facility Management</option>
//               <option value="electrical">Electrical</option>
//               <option value="mechanical">Mechanical</option>
//               <option value="hvac">HVAC</option>
//               <option value="logistics">Logistics</option>
//             </select>
//           </div>

//           <div className="flex justify-end pt-6 border-t border-gray-100 mt-6">
//             <motion.button
//               type="button"
//               onClick={() => {
//                 setShowAddModal(false);
//                 setSelectedUser(null);
//               }}
//               whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
//               whileTap={{ scale: 0.98 }}
//               className="inline-flex items-center px-6 py-2.5 border border-gray-300 text-base font-semibold rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out"
//             >
//               Cancel
//             </motion.button>
//             <motion.button
//               type="button"
//               onClick={handleAddUser}
//               whileHover={{ scale: 1.02, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)" }}
//               whileTap={{ scale: 0.98 }}
//               className="inline-flex items-center px-6 py-2.5 border border-transparent text-base font-semibold rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all duration-200 ease-in-out ml-3"
//             >
//               {selectedUser ? "Update Member" : "Add Member"}
//             </motion.button>
//           </div>
//         </div>
//       </Modal>

//       <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Confirm Deletion">
//         <div className="space-y-5 text-center py-3">
//           <CheckCircle className="text-red-500 text-5xl mx-auto animate-pulse" />
//           <p className="text-base text-gray-700 font-medium">Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.</p>
//           <div className="flex justify-center space-x-3 mt-5">
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={() => setShowDeleteModal(false)}
//               className="px-5 py-2.5 border border-gray-300 rounded-md hover:bg-gray-100 text-gray-700 transition-colors duration-200 font-semibold text-sm"
//             >
//               Cancel
//             </motion.button>
//             <motion.button
//               whileHover={{ scale: 1.03 }}
//               whileTap={{ scale: 0.97 }}
//               onClick={handleDeleteUser}
//               className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-200 font-semibold text-sm"
//             >
//               Delete
//             </motion.button>
//           </div>
//         </div>
//       </Modal>
//     </div>
//   );
// };

// export default TeamDashboard;
