import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiUser,
  FiLock,
  FiBell,
  FiMoon,
  FiSun,
  FiDatabase,
  FiGlobe,
  FiCreditCard,
  FiUsers,
  FiLogOut,
  FiChevronLeft,
  FiChevronRight,
  FiHome,
  FiPackage,
  FiClipboard,
  FiBarChart2,
  FiX,
  FiCheck,
  FiEdit2,
  FiSave,
  FiTrash2,
  FiChevronDown,
} from "react-icons/fi";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";

type NavItemProps = {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
};

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

const SettingsPage: React.FC = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "Admin User",
    email: "admin@company.com",
    language: "en",
    notifications: true,
    billingEmail: "billing@company.com",
  });

  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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

  const toggleSidebar = () => {
    setSidebarOpen((prev) => !prev);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target as HTMLInputElement;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically send the updated data to your backend
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
      <motion.div whileHover={{ y: -2, boxShadow: "0 4px 6px rgba(0, 0, 0, 0.05)" }} transition={{ type: "spring", stiffness: 300 }} className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
        {children}
      </motion.div>
    );
  };

  const SettingItem: React.FC<{
    label: string;
    value?: string | boolean;
    children?: React.ReactNode;
    editable?: boolean;
    onEdit?: () => void;
  }> = ({ label, value, children, editable = true, onEdit }) => {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-blue-100">
        <div className="mb-2 sm:mb-0">
          <p className="font-medium text-gray-700">{label}</p>
          {value !== undefined && <p className="text-gray-600">{typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value}</p>}
        </div>
        {editable && (
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onEdit} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
            Edit
          </motion.button>
        )}
        {children}
      </div>
    );
  };

  const Modal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
  }> = ({ isOpen, onClose, title, children, actions }) => {
    if (!isOpen) return null;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-auto">
          <div className="flex justify-between items-center border-b border-blue-100 p-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <FiX className="text-xl" />
            </motion.button>
          </div>
          <div className="p-6">{children}</div>
          {actions && <div className="flex justify-end space-x-3 p-4 border-t border-blue-100">{actions}</div>}
        </motion.div>
      </motion.div>
    );
  };

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
            <FiSettings className="text-2xl text-blue-600" />
            <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Settings</h2>
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
          <div className="max-w-6xl mx-auto">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
              <p className="text-gray-600">Manage your account settings and preferences</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-6">
              {/* Settings Navigation */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-xl shadow-sm border border-blue-100 overflow-hidden">
                  <div className="space-y-1 p-2">
                    {[
                      { id: "profile", icon: <FiUser />, label: "Profile" },
                      { id: "security", icon: <FiLock />, label: "Security" },
                      { id: "notifications", icon: <FiBell />, label: "Notifications" },
                      { id: "preferences", icon: <FiMoon />, label: "Preferences" },
                      { id: "billing", icon: <FiCreditCard />, label: "Billing" },
                      { id: "team", icon: <FiUsers />, label: "Team Settings" },
                      { id: "integrations", icon: <FiGlobe />, label: "Integrations" },
                      { id: "data", icon: <FiDatabase />, label: "Data Management" },
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ x: 5 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left flex items-center p-3 rounded-md transition-colors duration-200 ${activeTab === item.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-blue-50"}`}
                      >
                        <span className="text-lg mr-3">{item.icon}</span>
                        <span>{item.label}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>

              {/* Settings Content */}
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex-1">
                {activeTab === "profile" && (
                  <SettingCard title="Profile Information">
                    {isEditing ? (
                      <>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="email" name="email" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
                            Cancel
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                            Save Changes
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <>
                        <SettingItem label="Name" value={formData.name} onEdit={() => setIsEditing(true)} />
                        <SettingItem label="Email" value={formData.email} onEdit={() => setIsEditing(true)} />
                        <SettingItem label="Role" value="Administrator" editable={false} />
                        <SettingItem label="Member since" value="January 15, 2022" editable={false} />
                      </>
                    )}
                  </SettingCard>
                )}

                {activeTab === "security" && (
                  <SettingCard title="Security Settings">
                    <SettingItem label="Password" value="••••••••" onEdit={() => navigate("/settings/change-password")} />
                    <SettingItem label="Two-factor authentication" value={false} onEdit={() => navigate("/settings/two-factor")} />
                    <SettingItem label="Active sessions" value="3 devices" onEdit={() => navigate("/settings/sessions")} />
                  </SettingCard>
                )}

                {activeTab === "notifications" && (
                  <SettingCard title="Notification Preferences">
                    <div className="flex items-center justify-between py-4 border-b border-blue-100">
                      <div>
                        <p className="font-medium text-gray-700">Email notifications</p>
                        <p className="text-gray-600">Receive email notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <SettingItem label="Push notifications" value={false} onEdit={() => {}} />
                    <SettingItem label="SMS alerts" value={false} onEdit={() => {}} />
                  </SettingCard>
                )}

                {activeTab === "preferences" && (
                  <SettingCard title="Preferences">
                    <div className="flex items-center justify-between py-4 border-b border-blue-100">
                      <div>
                        <p className="font-medium text-gray-700">Dark mode</p>
                        <p className="text-gray-600">Toggle dark theme</p>
                      </div>
                      <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full bg-gray-200">
                        {darkMode ? <FiSun className="text-yellow-400" /> : <FiMoon />}
                      </motion.button>
                    </div>
                    <SettingItem label="Language" value="English" onEdit={() => {}} />
                    <SettingItem label="Timezone" value="UTC+07:00" onEdit={() => {}} />
                  </SettingCard>
                )}

                {activeTab === "billing" && (
                  <SettingCard title="Billing Information">
                    <SettingItem label="Billing email" value={formData.billingEmail} onEdit={() => {}} />
                    <SettingItem label="Payment method" value="Visa ending in 4242" onEdit={() => {}} />
                    <SettingItem label="Plan" value="Premium ($29/month)" onEdit={() => {}} />
                  </SettingCard>
                )}

                {activeTab === "team" && (
                  <SettingCard title="Team Settings">
                    <SettingItem label="Team members" value="5 active" onEdit={() => navigate("/team")} />
                    <SettingItem label="Team roles" value="Custom roles" onEdit={() => navigate("/settings/roles")} />
                    <SettingItem label="Team permissions" value="Custom permissions" onEdit={() => navigate("/settings/permissions")} />
                  </SettingCard>
                )}

                {activeTab === "integrations" && (
                  <SettingCard title="Integrations">
                    <SettingItem label="Google Workspace" value="Connected" onEdit={() => {}} />
                    <SettingItem label="Slack" value="Not connected" onEdit={() => {}} />
                    <SettingItem label="Microsoft 365" value="Not connected" onEdit={() => {}} />
                  </SettingCard>
                )}

                {activeTab === "data" && (
                  <SettingCard title="Data Management">
                    <SettingItem label="Export data" value="JSON, CSV formats" onEdit={() => {}} />
                    <SettingItem label="Delete account" value="Permanently remove all data" onEdit={() => setShowConfirmModal(true)} />
                  </SettingCard>
                )}
              </motion.div>
            </div>
          </div>
        </main>
      </div>

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title={activeTab === "data" ? "Delete Account" : "Logout Confirmation"}>
        <div className="text-gray-700 mb-6">{activeTab === "data" ? <p>Are you sure you want to delete your account? This action cannot be undone.</p> : <p>Are you sure you want to logout?</p>}</div>
        <div className="flex justify-end space-x-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={activeTab === "data" ? () => {} : handleLogout}
            className={`px-4 py-2 rounded-md text-white ${activeTab === "data" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {activeTab === "data" ? "Delete Account" : "Logout"}
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
