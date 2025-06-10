import React, { useState, useEffect } from "react";
import {
  FiPlus,
  FiUpload,
  FiChevronUp,
  FiAlertTriangle,
  FiCheckCircle,
  FiUsers,
  FiBarChart2,
  FiDatabase,
  FiClipboard,
  FiFilter,
  FiPackage,
  FiChevronLeft,
  FiHome,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiSearch,
  FiLogOut,
  FiSun,
  FiMoon,
  FiSettings,
  FiBell,
  FiEdit,
  FiEye,
  FiUser,
  FiUserCheck,
  FiUserX,
  FiUserPlus,
  FiMail,
  FiPhone,
  FiCalendar,
  FiClock,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type TeamMemberStatus = "active" | "inactive" | "on leave";
type TeamMemberRole = "admin" | "manager" | "supervisor" | "technician" | "operator";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: TeamMemberRole;
  department: string;
  status: TeamMemberStatus;
  joinDate: string;
  lastActive: string;
  avatar: string;
}

const TeamDashboard: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<TeamMemberStatus | "all">("all");
  const [roleFilter, setRoleFilter] = useState<TeamMemberRole | "all">("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [showMemberDetailsModal, setShowMemberDetailsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [membersPerPage] = useState(5);
  const { user, fetchWithAuth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [hasInteracted, setHasInteracted] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

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

  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([
    {
      id: "TM-001",
      name: "Budi Santoso",
      email: "budi.santoso@company.com",
      phone: "+62 812-3456-7890",
      role: "supervisor",
      department: "Maintenance",
      status: "active",
      joinDate: "2021-03-15",
      lastActive: "Today, 09:45",
      avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    },
    // ... other team members data
  ]);

  const toggleSidebar = () => {
    setHasInteracted(true);
    setSidebarOpen((prev) => !prev);
  };

  const handleAddMember = (newMemberData: Omit<TeamMember, "id" | "avatar">) => {
    const newMember: TeamMember = {
      ...newMemberData,
      id: `TM-${String(teamMembers.length + 1).padStart(3, "0")}`,
      avatar: `https://ui-avatars.com/api/?name=${newMemberData.name}&background=0078D7&color=fff`,
    };
    setTeamMembers([...teamMembers, newMember]);
    setShowAddMemberModal(false);
  };

  const handleUpdateMember = (updatedMemberData: TeamMember) => {
    setTeamMembers(teamMembers.map((member) => (member.id === updatedMemberData.id ? updatedMemberData : member)));
    setShowMemberDetailsModal(false);
    setSelectedMember(null);
    setIsEditing(false);
  };

  const getStatusColor = (status: TeamMemberStatus) => {
    switch (status) {
      case "active":
        return "bg-green-500";
      case "inactive":
        return "bg-red-500";
      case "on leave":
        return "bg-yellow-500";
      default:
        return "bg-gray-500";
    }
  };

  const getRoleBadgeColor = (role: TeamMemberRole) => {
    switch (role) {
      case "admin":
        return "bg-purple-100 text-purple-800";
      case "manager":
        return "bg-blue-100 text-blue-800";
      case "supervisor":
        return "bg-teal-100 text-teal-800";
      case "technician":
        return "bg-orange-100 text-orange-800";
      case "operator":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredMembers = teamMembers.filter((member) => {
    const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) || member.id.toLowerCase().includes(searchQuery.toLowerCase()) || member.department.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || member.status === statusFilter;
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesStatus && matchesRole;
  });

  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  useEffect(() => {
    setCurrentPage(1);
    localStorage.setItem("sidebarOpen", JSON.stringify(sidebarOpen));
  }, [searchQuery, statusFilter, roleFilter, sidebarOpen]);

  const NavItem: React.FC<{ icon: React.ReactNode; text: string; to: string }> = ({ icon, text, to }) => {
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
        {sidebarOpen && (
          <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} className="ml-3 text-base">
            {text}
          </motion.span>
        )}
      </motion.button>
    );
  };

  const StatCard: React.FC<{ title: string; value: string; change: string; icon: React.ReactNode }> = ({ title, value, change, icon }) => {
    const isPositive = change.startsWith("+");
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
        <motion.p animate={{ x: isPositive ? [0, 2, 0] : [0, -2, 0] }} transition={{ repeat: Infinity, duration: 2 }} className={`mt-3 text-sm font-medium ${isPositive ? "text-green-600" : "text-red-600"}`}>
          {change} from last month
        </motion.p>
      </motion.div>
    );
  };

  const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-lg mx-auto p-6">
          <div className="flex justify-between items-center border-b pb-3 mb-4 border-blue-100">
            <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
              <FiX />
            </motion.button>
          </div>
          <div>{children}</div>
        </motion.div>
      </motion.div>
    );
  };

  const AddTeamMemberForm: React.FC<{ onAddMember: (member: Omit<TeamMember, "id" | "avatar">) => void }> = ({ onAddMember }) => {
    const [formData, setFormData] = useState<Omit<TeamMember, "id" | "avatar">>({
      name: "",
      email: "",
      phone: "",
      role: "technician",
      department: "Maintenance",
      status: "active",
      joinDate: new Date().toISOString().split("T")[0],
      lastActive: "Just now",
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onAddMember(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields with consistent styling */}
        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            type="submit"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Add Member
          </motion.button>
        </div>
      </form>
    );
  };

  const TeamMemberDetailsForm: React.FC<{
    member: TeamMember;
    isEditing: boolean;
    onSave: (member: TeamMember) => void;
    onCancel: () => void;
  }> = ({ member, isEditing, onSave, onCancel }) => {
    const [formData, setFormData] = useState<TeamMember>(member);

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Form fields with consistent styling */}
        <div className="flex justify-end space-x-3 mt-6">
          <motion.button
            type="button"
            onClick={onCancel}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="inline-flex items-center px-5 py-2.5 border border-blue-200 text-base font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            {isEditing ? "Cancel" : "Close"}
          </motion.button>
          {isEditing && (
            <motion.button
              type="submit"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              Save Changes
            </motion.button>
          )}
        </div>
      </form>
    );
  };

  return (
    <div className={`flex h-screen font-sans ${darkMode ? "dark bg-gray-900" : "bg-gray-50"}`}>
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
            className={`bg-white dark:bg-gray-800 border-r border-blue-100 dark:border-gray-700 flex flex-col shadow-md overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            {/* Sidebar content */}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white dark:bg-gray-800 border-b border-blue-100 dark:border-gray-700 p-4 flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-3">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors duration-200">
                <FiChevronRight className="text-xl" />
              </motion.button>
            )}
            <FiUsers className="text-2xl text-blue-600 dark:text-blue-400" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600 dark:text-blue-400">Team</h2>
          </div>

          <div className="flex items-center space-x-4">{/* Theme toggle and user menu with animations */}</div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar">
          {/* Header and Actions with animations */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Content header */}
          </motion.div>

          {/* Stats Cards with animations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <StatCard title="Total Members" value={teamMembers.length.toString()} change="+8%" icon={<FiUsers />} />
            {/* Other stat cards */}
          </div>

          {/* Search and Filters with animations */}
          <motion.div layout className="mb-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 md:p-6 border border-blue-100 dark:border-gray-700">
            {/* Search and filter components */}
          </motion.div>

          {/* Team Members Table with animations */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-blue-100 dark:border-gray-700">
            {/* Table with animated rows */}
          </motion.div>

          {/* Pagination with animations */}
          {filteredMembers.length > membersPerPage && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="mt-8 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              {/* Pagination controls */}
            </motion.div>
          )}
        </main>
      </div>

      {/* Modals with animations */}
      <Modal isOpen={showAddMemberModal} onClose={() => setShowAddMemberModal(false)} title="Add New Team Member">
        <AddTeamMemberForm onAddMember={handleAddMember} />
      </Modal>

      {selectedMember && (
        <Modal
          isOpen={showMemberDetailsModal}
          onClose={() => {
            setShowMemberDetailsModal(false);
            setSelectedMember(null);
            setIsEditing(false);
          }}
          title={isEditing ? "Edit Team Member" : "Team Member Details"}
        >
          <TeamMemberDetailsForm
            member={selectedMember}
            isEditing={isEditing}
            onSave={handleUpdateMember}
            onCancel={() => {
              setShowMemberDetailsModal(false);
              setSelectedMember(null);
              setIsEditing(false);
            }}
          />
        </Modal>
      )}
    </div>
  );
};

export default TeamDashboard;
