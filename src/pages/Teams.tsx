import React, { useState, useEffect } from "react";
import {
  FiClock,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiChevronDown,
  FiChevronRight,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiTrendingUp,
  FiAlertCircle,
  FiMessageSquare,
  FiPlus,
  FiEdit2,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiUserPlus,
  FiDownload,
  FiUpload,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type TeamsStatus = "Active" | "On Leave";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
}

const NavItem: React.FC<NavItemProps> = ({ icon, text, to, expanded }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  return (
    <motion.button
      onClick={() => navigate(to)}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`w-full text-left flex items-center p-2 rounded-lg transition-all duration-200
        ${active ? "bg-blue-50 text-blue-700 font-semibold" : "hover:bg-blue-50 text-gray-700"}
      `}
    >
      <span className="text-xl">{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: React.ReactNode }> = ({ title, value, icon }) => {
  return (
    <motion.div whileHover={{ y: -5, boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-5 border border-blue-100 cursor-pointer">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-extrabold mt-1 text-gray-900">{value}</p>
        </div>
        <motion.div whileHover={{ rotate: 10, scale: 1.1 }} className="p-3 rounded-full bg-blue-50 text-blue-600 text-2xl">
          {icon}
        </motion.div>
      </div>
    </motion.div>
  );
};

const TeamDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    name: "",
    email: "",
    role: "technician",
    department: "maintenance",
    phone: "",
  });

  // Sample team data
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: "Budi Santoso",
      email: "budi.santoso@company.com",
      role: "Maintenance Supervisor",
      department: "Facility Management",
      phone: "+62 812-3456-7890",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
      status: "Active",
      joinDate: "2021-03-15",
      lastActive: "2023-08-20 09:45",
    },
    {
      id: 2,
      name: "Ani Wijaya",
      email: "ani.wijaya@company.com",
      role: "Maintenance Technician",
      department: "Mechanical",
      phone: "+62 813-4567-8901",
      avatar: "https://randomuser.me/api/portraits/women/44.jpg",
      status: "Active",
      joinDate: "2021-05-22",
      lastActive: "2023-08-20 14:30",
    },
    {
      id: 3,
      name: "Rudi Hermawan",
      email: "rudi.hermawan@company.com",
      role: "Electrical Engineer",
      department: "Electrical",
      phone: "+62 814-5678-9012",
      avatar: "https://randomuser.me/api/portraits/men/67.jpg",
      status: "Active",
      joinDate: "2021-07-10",
      lastActive: "2023-08-19 11:15",
    },
    {
      id: 4,
      name: "Citra Dewi",
      email: "citra.dewi@company.com",
      role: "Inventory Manager",
      department: "Logistics",
      phone: "+62 815-6789-0123",
      avatar: "https://randomuser.me/api/portraits/women/28.jpg",
      status: "Active",
      joinDate: "2021-09-05",
      lastActive: "2023-08-18 16:20",
    },
    {
      id: 5,
      name: "Dodi Pratama",
      email: "dodi.pratama@company.com",
      role: "Facility Manager",
      department: "Facility Management",
      phone: "+62 816-7890-1234",
      avatar: "https://randomuser.me/api/portraits/men/45.jpg",
      status: "Active",
      joinDate: "2020-11-18",
      lastActive: "2023-08-20 08:00",
    },
    {
      id: 6,
      name: "Eka Putri",
      email: "eka.putri@company.com",
      role: "Maintenance Technician",
      department: "HVAC",
      phone: "+62 817-8901-2345",
      avatar: "https://randomuser.me/api/portraits/women/33.jpg",
      status: "On Leave",
      joinDate: "2022-01-30",
      lastActive: "2023-08-15 10:00",
    },
  ]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleAddUser = () => {
    const newId = Math.max(...teamMembers.map((member) => member.id)) + 1;
    setTeamMembers([
      ...teamMembers,
      {
        id: newId,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        department: newUser.department,
        phone: newUser.phone,
        avatar: `https://randomuser.me/api/portraits/${Math.random() > 0.5 ? "men" : "women"}/${Math.floor(Math.random() * 50)}.jpg`,
        status: "Active",
        joinDate: new Date().toISOString().split("T")[0],
        lastActive: "Just now",
      },
    ]);
    setShowAddModal(false);
    setNewUser({
      name: "",
      email: "",
      role: "technician",
      department: "maintenance",
      phone: "",
    });
  };

  const handleDeleteUser = (id: number) => {
    setTeamMembers(teamMembers.filter((member) => member.id !== id));
    setShowDeleteModal(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-500";
      case "On Leave":
        return "bg-yellow-500";
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) || member.email.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTab = activeTab === "all" || (activeTab === "active" && member.status === "Active") || (activeTab === "on leave" && member.status === "On Leave");

    const matchesDepartment = selectedDepartment === "all" || member.department.toLowerCase() === selectedDepartment.toLowerCase();

    return matchesSearch && matchesTab && matchesDepartment;
  });

  const departments = [...new Set(teamMembers.map((member) => member.department))];
  const roles = [...new Set(teamMembers.map((member) => member.role))];

  return (
    <div className="flex h-screen font-sans bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 256 : 80 }}
            animate={{
              width: isMobile ? (sidebarOpen ? 256 : 0) : sidebarOpen ? 256 : 80,
            }}
            exit={{ width: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={`bg-white border-r border-blue-100 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-blue-100">
              {sidebarOpen ? (
                <>
                  <div className="rounded-lg flex items-center space-x-3">
                    <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
                    <p className="text-blue-600 font-bold">CMMS</p>
                  </div>
                </>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-6 w-auto" />
              )}

              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                {sidebarOpen ? <FiChevronLeft className="text-xl" /> : <FiChevronRight className="text-xl" />}
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
              <NavItem icon={<FiHome />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />
              <NavItem icon={<FiPackage />} text="Assets" to="/assets" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />
              <NavItem icon={<FiClipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />
              <NavItem icon={<FiDatabase />} text="Inventory" to="/inventory" expanded={sidebarOpen} />
              <NavItem icon={<FiBarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />
              <NavItem icon={<FiUsers />} text="Team" to="/team" expanded={sidebarOpen} />
              <NavItem icon={<FiSettings />} text="Settings" to="/settings" expanded={sidebarOpen} />
            </nav>

            <div className="p-4 border-t border-blue-100">
              <div className="flex items-center space-x-3">
                <img src="https://placehold.co/40x40/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-10 h-10 rounded-full border-2 border-blue-500" />
                {sidebarOpen && (
                  <div>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-600">User</p>
                  </div>
                )}
              </div>
              {sidebarOpen && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/logout")}
                  className="mt-4 w-full flex items-center justify-center space-x-2 text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors duration-200 font-medium"
                >
                  <FiLogOut className="text-xl" />
                  <span>Logout</span>
                </motion.button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </button>
            )}
            <FiUsers className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Team Management</h2>
          </div>

          <div className="flex items-center space-x-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {darkMode ? <FiSun className="text-yellow-400 text-xl" /> : <FiMoon className="text-xl" />}
            </motion.button>

            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative" aria-label="Notifications">
              <FiBell className="text-xl" />
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></span>
            </motion.button>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg hover:bg-blue-50 transition-colors duration-200">
              <img src="https://placehold.co/32x32/0078D7/FFFFFF?text=AD" alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200" />
              <span className="font-medium text-gray-900 hidden sm:inline">{user?.name}</span>
              <FiChevronDown className="text-gray-500" />
            </motion.div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {/* Team Management Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Members</h1>
              <p className="text-gray-600">Manage your team members and their permissions</p>
            </div>

            <div className="flex flex-wrap gap-3 w-full md:w-auto">
              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowAddModal(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors">
                <FiUserPlus /> Add Member
              </motion.button>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 px-4 py-2 rounded-lg transition-colors">
                <FiDownload /> Export
              </motion.button>

              <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex items-center gap-2 bg-white border border-blue-200 hover:bg-blue-50 text-blue-600 px-4 py-2 rounded-lg transition-colors">
                <FiUpload /> Import
              </motion.button>
            </div>
          </motion.div>

          {/* Filters and Search */}
          <motion.div layout className="mb-6 bg-white rounded-xl shadow-sm p-4 md:p-6 border border-blue-100">
            <div className="flex flex-col md:flex-row md:items-center md:space-x-4 space-y-4 md:space-y-0">
              <div className="flex-1 relative">
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                <input
                  type="text"
                  placeholder="Search inventory by name, ID, or description..."
                  className="w-full pl-12 pr-4 py-3 border border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-base transition-all duration-200"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-2">
                <FiFilter className="text-gray-400" />
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={activeTab} onChange={(e) => setActiveTab(e.target.value)}>
                  <option value="all">All Members</option>
                  <option value="active">Active</option>
                  <option value="on leave">On Leave</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <FiUsers className="text-gray-400" />
                <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)}>
                  <option value="all">All Departments</option>
                  <option value="facility management">Facility Management</option>
                  <option value="electrical">Electrical</option>
                  <option value="mechanical">Mechanical</option>
                  <option value="hvac">HVAC</option>
                  <option value="logistics">Logistics</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Team Members Table */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-xl overflow-hidden border border-blue-100 shadow-sm mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-blue-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Last Active
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredMembers.length > 0 ? (
                    filteredMembers.map((member) => (
                      <motion.tr
                        key={member.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2 }}
                        whileHover={{ backgroundColor: "rgba(239, 246, 255, 1)" }}
                        className="transition-colors duration-150"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={member.avatar} alt={member.name} />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.role}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.department}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <motion.span whileHover={{ scale: 1.05 }} className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${getStatusColor(member.status)} text-white shadow-sm`}>
                            {member.status
                              .split("-")
                              .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                              .join(" ")}
                          </motion.span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{member.lastActive}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-blue-600 hover:text-blue-900"
                              onClick={() => {
                                setSelectedUser(member);
                                setNewUser({
                                  name: member.name,
                                  email: member.email,
                                  role: member.role.toLowerCase(),
                                  department: member.department.toLowerCase(),
                                  phone: member.phone,
                                });
                                setShowAddModal(true);
                              }}
                            >
                              <FiEdit2 />
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              className="text-red-600 hover:text-red-900"
                              onClick={() => {
                                setSelectedUser(member);
                                setShowDeleteModal(true);
                              }}
                            >
                              <FiTrash2 />
                            </motion.button>
                          </div>
                        </td>
                      </motion.tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        No team members found matching your criteria
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Team Members" value={teamMembers.length} icon={<FiUsers />} />
            <StatCard title="Active Members" value={teamMembers.filter((m) => m.status === "Active").length} icon={<FiCheckCircle />} />
            <StatCard title="On Leave" value={teamMembers.filter((m) => m.status === "On Leave").length} icon={<FiClock />} />
            <StatCard title="Departements" value={departments.length} icon={<FiDatabase />} />
          </div>

          {/* Department Distribution */}
          <div className="bg-white rounded-xl p-4 md:p-6 border border-blue-100 shadow-sm mb-6">
            <h3 className="text-lg font-semibold mb-4">Department Distribution</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-64 bg-gray-50 rounded-lg flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <FiBarChart2 className="mx-auto text-4xl mb-2" />
                  <p>Department Chart Visualization</p>
                </div>
              </div>
              <div>
                <div className="space-y-3">
                  {departments.map((dept) => (
                    <div key={dept} className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">{dept}</span>
                      <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${(teamMembers.filter((m) => m.department === dept).length / teamMembers.length) * 100}%` }}></div>
                      </div>
                      <span className="text-sm text-gray-500">{Math.round((teamMembers.filter((m) => m.department === dept).length / teamMembers.length) * 100)}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add/Edit User Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddModal(false)}>
            <motion.div initial={{ y: -50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }} className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-4">{selectedUser ? "Edit Team Member" : "Add New Team Member"}</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input type="text" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={newUser.name} onChange={(e) => setNewUser({ ...newUser, name: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={newUser.email} onChange={(e) => setNewUser({ ...newUser, email: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input type="tel" className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={newUser.phone} onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })} />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}>
                    <option value="technician">Maintenance Technician</option>
                    <option value="supervisor">Maintenance Supervisor</option>
                    <option value="engineer">Engineer</option>
                    <option value="manager">Facility Manager</option>
                    <option value="inventory">Inventory Manager</option>
                    <option value="admin">Administrator</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select className="w-full p-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500" value={newUser.department} onChange={(e) => setNewUser({ ...newUser, department: e.target.value })}>
                    <option value="maintenance">Maintenance</option>
                    <option value="facility">Facility Management</option>
                    <option value="electrical">Electrical</option>
                    <option value="mechanical">Mechanical</option>
                    <option value="hvac">HVAC</option>
                    <option value="logistics">Logistics</option>
                  </select>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <motion.button
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => {
                    setShowAddModal(false);
                    setSelectedUser(null);
                  }}
                >
                  Cancel
                </motion.button>
                <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" onClick={handleAddUser}>
                  {selectedUser ? "Update Member" : "Add Member"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowDeleteModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
              <div className="text-center">
                <FiAlertCircle className="mx-auto text-red-500 text-5xl mb-4" />
                <h3 className="text-xl font-bold mb-2">Delete Team Member</h3>
                <p className="text-gray-600 mb-6">Are you sure you want to delete {selectedUser?.name}? This action cannot be undone.</p>

                <div className="flex justify-center space-x-4">
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => setShowDeleteModal(false)}>
                    Cancel
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors" onClick={() => handleDeleteUser(selectedUser?.id)}>
                    Delete
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default TeamDashboard;
