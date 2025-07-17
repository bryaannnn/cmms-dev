import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import logoWida from "../assets/logo-wida.png";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../component/Sidebar";

// Import Lucide Icons for consistency with Dashboard.tsx
import { Settings, User as UserIcon, Lock, Bell, Moon, Sun, Database, Globe, CreditCard, Users, LogOut, ChevronLeft, ChevronRight, Home, Package, Clipboard, BarChart2, X, Key, ChevronDown } from "lucide-react";

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
      whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left flex items-center py-3 px-4 rounded-xl transition-all duration-200 ease-in-out group
        ${active ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-blue-700"}
      `}
    >
      <span className={`text-xl transition-colors duration-200 ${active ? "text-white" : "text-blue-500 group-hover:text-blue-700"}`}>{icon}</span>
      {expanded && (
        <motion.span initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }} className="ml-4 text-base font-medium whitespace-nowrap">
          {text}
        </motion.span>
      )}
    </motion.button>
  );
};

const SettingsPage: React.FC = () => {
  const { user, hasPermission, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Refs for click outside
  const profileRef = useRef<HTMLDivElement>(null);

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

  // Click outside handler for popups
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [formData, setFormData] = useState({
    name: user?.name,
    nik: user?.nik,
    email: user?.email,
    language: "en",
    notifications: true,
    billingEmail: "haloo@company.com",
  });

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
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
    // Logic untuk menyimpan data ke backend
  };

  const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)", scale: 1.01 }}
        className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 cursor-pointer overflow-hidden transform transition-transform duration-200"
      >
        <h3 className="text-xl font-bold mb-4 text-gray-900">{title}</h3>
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
        <div className="mb-2 sm:mb-0">
          <p className="font-medium text-gray-700">{label}</p>
          {value !== undefined && <p className="text-sm text-gray-600">{typeof value === "boolean" ? (value ? "Enabled" : "Disabled") : value}</p>}
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
        <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-auto">
          <div className="flex justify-between items-center border-b border-gray-100 p-4">
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
            <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </motion.button>
          </div>
          <div className="p-6">{children}</div>
          {actions && <div className="flex justify-end space-x-3 p-4 border-t border-gray-100">{actions}</div>}
        </motion.div>
      </motion.div>
    );
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation */}
        <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
          <div className="flex items-center space-x-4">
            {isMobile && (
              <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <ChevronRight className="text-xl" />
              </motion.button>
            )}
            <Settings className="text-xl text-blue-600" />
            <h2 className="text-lg md:text-xl font-bold text-gray-900">Settings</h2>
          </div>
          <div className="flex items-center space-x-3 relative">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
              aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
            >
              {/* === PERBAIKAN DI SINI === */}
              <AnimatePresence mode="wait">
                <motion.div key={darkMode ? "sun" : "moon"} initial={{ rotate: 180, opacity: 0 }} animate={{ rotate: 360, opacity: 1 }} exit={{ rotate: 0, opacity: 0 }} transition={{ duration: 0.2 }}>
                  {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
                </motion.div>
              </AnimatePresence>
            </motion.button>
            {/* Profile Menu Pop-up */}
            <div className="relative" ref={profileRef}>
              <motion.button
                whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
              >
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-8 h-8 rounded-full border border-blue-200 object-cover"
                />
                <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
                <ChevronDown className="text-gray-500 text-base" />
              </motion.button>

              <AnimatePresence>
                {showProfileMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-2 z-40 border border-gray-100"
                  >
                    <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">Signed in as</div>
                    <div className="px-4 py-2 font-semibold text-gray-800 border-b border-gray-100">{user?.name || "Guest User"}</div>
                    <button
                      onClick={() => {
                        navigate("/profile");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <UserIcon size={16} className="mr-2" /> My Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/settings");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 w-full text-left"
                    >
                      <Settings size={16} className="mr-2" /> Settings
                    </button>
                    <hr className="my-1 border-gray-100" />
                    <button
                      onClick={() => {
                        navigate("/logout");
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut size={16} className="mr-2" /> Logout
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <h1 className="text-2xl md:text-3xl font-bold mb-2">Account Settings</h1>
              <p className="opacity-90 text-sm">Manage your profile, security, and preferences</p>
            </motion.div>

            <div className="flex flex-col lg:flex-row gap-4 md:gap-6">
              {/* Settings Navigation */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:w-64 flex-shrink-0">
                <div className="bg-white rounded-2xl shadow-md border border-blue-50 overflow-hidden">
                  <div className="space-y-1 p-2">
                    {[
                      { id: "profile", icon: <UserIcon />, label: "Profile" },
                      { id: "security", icon: <Lock />, label: "Security" },
                      { id: "notifications", icon: <Bell />, label: "Notifications" },
                      { id: "preferences", icon: <Sun />, label: "Preferences" },
                      { id: "billing", icon: <CreditCard />, label: "Billing" },
                      { id: "team", icon: <Users />, label: "Team Settings" },
                      { id: "integrations", icon: <Globe />, label: "Integrations" },
                      { id: "data", icon: <Database />, label: "Data Management" },
                    ].map((item) => (
                      <motion.button
                        key={item.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full text-left flex items-center p-3 rounded-xl transition-colors duration-200 ${activeTab === item.id ? "bg-blue-50 text-blue-700 font-medium" : "text-gray-700 hover:bg-blue-50"}`}
                      >
                        <span className="text-xl mr-3 text-blue-500">{item.icon}</span>
                        <span className="text-base">{item.label}</span>
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
                            <label className="block text-sm font-medium text-gray-700 mb-1">NIK</label>
                            <input type="text" name="nik" value={formData.nik} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input type="text" name="nik" value={formData.email} onChange={handleInputChange} className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white" />
                          </div>
                        </div>
                        <div className="flex justify-end space-x-3 mt-6">
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setIsEditing(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
                            Cancel
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={handleSave} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow">
                            Save Changes
                          </motion.button>
                        </div>
                      </>
                    ) : (
                      <>
                        <SettingItem label="Name" value={user?.name} editable={false} />
                        <SettingItem label="NIK" value={user?.nik} editable={false} />
                        <SettingItem label="Role" value={user?.roles?.[0]} editable={false} />
                        <SettingItem label="Email" value={user?.email} editable={false} />
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
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-700">Email notifications</p>
                        <p className="text-sm text-gray-600">Receive email notifications</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" name="notifications" checked={formData.notifications} onChange={handleInputChange} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <SettingItem label="Push notifications" value={false} onEdit={() => {}} />
                  </SettingCard>
                )}

                {activeTab === "preferences" && (
                  <SettingCard title="Preferences">
                    <div className="flex items-center justify-between py-4 border-b border-gray-100">
                      <div>
                        <p className="font-medium text-gray-700">Dark mode</p>
                        <p className="text-sm text-gray-600">Toggle dark theme</p>
                      </div>
                      <AnimatePresence mode="wait">
                        <motion.button
                          key={darkMode ? "sun-card" : "moon-card"}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => setDarkMode(!darkMode)}
                          className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
                        >
                          {darkMode ? <Sun className="text-yellow-400" /> : <Moon />}
                        </motion.button>
                      </AnimatePresence>
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
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Delete Account">
        <div className="text-gray-700 mb-6">
          <p>Are you sure you want to delete your account? This action cannot be undone.</p>
        </div>
        <div className="flex justify-end space-x-3">
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => setShowConfirmModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">
            Cancel
          </motion.button>
          <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} onClick={() => {}} className="px-4 py-2 rounded-lg text-white bg-red-600 hover:bg-red-700">
            Delete Account
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default SettingsPage;
