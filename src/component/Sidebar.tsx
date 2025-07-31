import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import { Users, BarChart2, Database, Clipboard, Package, ChevronLeft, Home, ChevronRight, Settings, Key, } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";
import { useAuth } from "../routes/AuthContext";

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

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { user, hasPermission } = useAuth();

  // 1. Tambahkan useRef untuk elemen nav
  const scrollContainerRef = useRef<HTMLElement>(null);

  // 2. useEffect untuk menyimpan dan mengembalikan posisi scroll
  useEffect(() => {
    const navElement = scrollContainerRef.current;

    if (navElement) {
      // Memulihkan posisi scroll saat komponen dimuat
      const savedScrollPos = sessionStorage.getItem("sidebarScrollPos");
      if (savedScrollPos) {
        navElement.scrollTop = parseInt(savedScrollPos, 10);
      }

      // Fungsi untuk menyimpan posisi scroll
      const saveScrollPosition = () => {
        sessionStorage.setItem("sidebarScrollPos", navElement.scrollTop.toString());
      };

      // Tambahkan event listener untuk menyimpan posisi saat menggulir
      navElement.addEventListener("scroll", saveScrollPosition);

      // Cleanup function: hapus event listener saat komponen di-unmount
      return () => {
        navElement.removeEventListener("scroll", saveScrollPosition);
      };
    }
  }, []); // [] agar hanya berjalan saat mount dan unmount

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      {/* Sidebar */}
      <AnimatePresence>
        {(!isMobile || sidebarOpen) && (
          <motion.div
            initial={{ width: isMobile ? 0 : sidebarOpen ? 280 : 80, opacity: 0 }}
            animate={{
              width: sidebarOpen ? 280 : 80,
              opacity: 1,
            }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className={`bg-white border-r border-gray-100 flex flex-col shadow-xl overflow-hidden ${isMobile ? "fixed z-50 h-full" : ""}`}
          >
            <div className="p-4 flex items-center justify-between border-b border-gray-100">
              {sidebarOpen ? (
                <div className="flex items-center space-x-3">
                  <img src={logoWida} alt="Logo Wida" className="h-9 w-auto" />
                  <p className="text-blue-600 font-bold text-xl tracking-wide">CMMS</p>
                </div>
              ) : (
                <img src={logoWida} alt="Logo Wida" className="h-8 w-auto mx-auto" />
              )}

              <button onClick={toggleSidebar} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
                {sidebarOpen ? <ChevronLeft className="text-xl" /> : <ChevronRight className="text-xl" />}
              </button>
            </div>

            <nav ref={scrollContainerRef} className="flex-1 p-3 space-y-1.5 overflow-y-auto sidebar-nav">
              {hasPermission("1") && <NavItem icon={<Home />} text="Dashboard" to="/dashboard" expanded={sidebarOpen} />}

              {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">System</h3>}
              {hasPermission("23") && <NavItem icon={<Database />} text="Audit Trail" to="/audittrail" expanded={sidebarOpen} />}
              {hasPermission("23") && <NavItem icon={<Database />} text="Backup & Restore" to="/backupandrestore" expanded={sidebarOpen} />}

              {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">Master</h3>}
              {hasPermission("23") && <NavItem icon={<Database />} text="Work Location" to="/worklocation" expanded={sidebarOpen} />}
              {hasPermission("23") && <NavItem icon={<Database />} text="Work Arrangement" to="/workarrangement" expanded={sidebarOpen} />}
              {hasPermission("3") && <NavItem icon={<Package />} text="Assets" to="/assets" expanded={sidebarOpen} />}
              {hasPermission("11") && <NavItem icon={<BarChart2 />} text="Reports" to="/reports" expanded={sidebarOpen} />}
              {hasPermission("23") && <NavItem icon={<Database />} text="Inventory" to="/inventory" expanded={sidebarOpen} />}
              {hasPermission("7") && <NavItem icon={<Clipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />}
              {hasPermission("31") && <NavItem icon={<Clipboard />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />}
              {hasPermission("27") && <NavItem icon={<Users />} text="Team" to="/team" expanded={sidebarOpen} />}
              {hasPermission("15") && <NavItem icon={<Key />} text="Permissions" to="/permissions" expanded={sidebarOpen} />}
              {hasPermission("13") && <NavItem icon={<Settings />} text="General Settings" to="/settings" expanded={sidebarOpen} />}
            </nav>

            {/* Bagian Bawah Navbar: Informasi Versi & Logout Sidebar */}
            <div className="p-4 border-t border-gray-100">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                />
                {sidebarOpen && (
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">Application Version</p>
                    <p className="text-xs text-gray-500">1.0.0</p> {/* Contoh informasi versi */}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
