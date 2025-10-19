import { motion, AnimatePresence } from "framer-motion";
import React, { useEffect, useState, useRef } from "react";
import {
  Users,
  BarChart2,
  Database,
  Clipboard,
  Package,
  ChevronLeft,
  Home,
  ChevronRight,
  Settings,
  Key,
  ListCheck,
  History,
  MapPin,
  Wrench,
  BookOpen,
  ToolCase,
  ChartBar,
  Monitor,
  Component,
  ShoppingCart,
  Receipt,
  Archive,
  LifeBuoy,
  X,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";
import { useAuth } from "../routes/AuthContext";

interface NavItemProps {
  icon: React.ReactNode;
  text: string;
  to: string;
  expanded: boolean;
  onNavigate?: () => void;
}

const NavItem: React.FC<NavItemProps> = React.memo(({ icon, text, to, expanded, onNavigate }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const active = location.pathname === to;

  const handleClick = () => {
    navigate(to);
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <motion.button
      onClick={handleClick}
      whileHover={{ backgroundColor: active ? undefined : "rgba(239, 246, 255, 0.6)" }}
      whileTap={{ scale: 0.98 }}
      className={`relative w-full text-left flex items-center py-3 px-4 rounded-xl transition-all duration-200 ease-in-out group
        ${active ? "bg-blue-600 text-white shadow-lg" : "text-gray-700 hover:text-blue-700"}
        ${expanded ? "justify-start" : "justify-center"}
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
});

const Sidebar: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, hasPermission } = useAuth();

  const scrollContainerRef = useRef<HTMLElement>(null);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-close sidebar on mobile when resizing to desktop
      if (!mobile && sidebarOpen) {
        setSidebarOpen(true);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [sidebarOpen]);

  // Scroll position persistence
  useEffect(() => {
    const navElement = scrollContainerRef.current;

    if (navElement) {
      const savedScrollPos = sessionStorage.getItem("sidebarScrollPos");
      if (savedScrollPos) {
        navElement.scrollTop = parseInt(savedScrollPos, 10);
      }

      const saveScrollPosition = () => {
        sessionStorage.setItem("sidebarScrollPos", navElement.scrollTop.toString());
      };

      navElement.addEventListener("scroll", saveScrollPosition);
      return () => {
        navElement.removeEventListener("scroll", saveScrollPosition);
      };
    }
  }, []);

  const toggleSidebar = () => {
    const newState = !sidebarOpen;
    localStorage.setItem("sidebarOpen", JSON.stringify(newState));
    setSidebarOpen(newState);
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleMobileNavigate = () => {
    setMobileMenuOpen(false);
  };

  // Mobile Bottom Navigation Component
  const MobileBottomNav = () => (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden">
      <div className="flex justify-around items-center py-2">
        <button onClick={toggleMobileMenu} className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${mobileMenuOpen ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}>
          <Home className="text-xl" />
          <span className="text-xs mt-1">Menu</span>
        </button>

        <button onClick={() => navigate("/dashboard")} className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${location.pathname === "/dashboard" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}>
          <BarChart2 className="text-xl" />
          <span className="text-xs mt-1">Dashboard</span>
        </button>

        <button onClick={() => navigate("/workorders")} className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${location.pathname === "/workorders" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}>
          <Clipboard className="text-xl" />
          <span className="text-xs mt-1">Work Orders</span>
        </button>

        <button
          onClick={() => navigate("/monitoringmaintenance")}
          className={`flex flex-col items-center p-2 rounded-lg transition-colors duration-200 ${location.pathname === "/monitoringmaintenance" ? "text-blue-600 bg-blue-50" : "text-gray-600"}`}
        >
          <Monitor className="text-xl" />
          <span className="text-xs mt-1">Monitoring</span>
        </button>
      </div>
    </div>
  );

  // Mobile Fullscreen Menu
  const MobileFullscreenMenu = () => (
    <AnimatePresence>
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={toggleMobileMenu} />

          {/* Menu Panel */}
          <motion.div initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }} transition={{ duration: 0.3, ease: "easeOut" }} className="fixed inset-y-0 left-0 w-80 bg-white z-50 md:hidden shadow-xl">
            {/* Header */}
            <div className="p-4 flex items-center justify-between border-b border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <img src={logoWida} alt="Logo Wida" className="h-8 w-auto" />
                <p className="text-blue-600 font-bold text-lg">CMMS</p>
              </div>
              <button onClick={toggleMobileMenu} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
                <X className="text-xl" />
              </button>
            </div>

            {/* Navigation Content */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto h-[calc(100vh-140px)]">
              {/* Group navigation items */}
              {hasPermission("1") && <NavItem icon={<Home />} text="Dashboard" to="/dashboard" expanded={true} onNavigate={handleMobileNavigate} />}

              <div className="pt-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 px-2 pb-2 tracking-wider">5S</h3>
                {hasPermission("7") && <NavItem icon={<Clipboard />} text="Ganba" to="/ganba" expanded={true} onNavigate={handleMobileNavigate} />}
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 px-2 pb-2 tracking-wider">System</h3>
                {hasPermission("23") && (
                  <>
                    <NavItem icon={<ListCheck />} text="Audit Trail" to="/audittrail" expanded={true} onNavigate={handleMobileNavigate} />
                    <NavItem icon={<History />} text="Backup & Restore" to="/backupandrestore" expanded={true} onNavigate={handleMobileNavigate} />
                  </>
                )}
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 px-2 pb-2 tracking-wider">Master</h3>
                {hasPermission("3") && <NavItem icon={<Package />} text="Assets" to="/assets" expanded={true} onNavigate={handleMobileNavigate} />}
                {hasPermission("15") && <NavItem icon={<Key />} text="User Management" to="/permissions" expanded={true} onNavigate={handleMobileNavigate} />}
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 px-2 pb-2 tracking-wider">Maintenance</h3>
                {hasPermission("31") && (
                  <>
                    <NavItem icon={<ChartBar />} text="Machine History" to="/machinehistory" expanded={true} onNavigate={handleMobileNavigate} />
                    <NavItem icon={<Monitor />} text="Monitoring Maintenance" to="/monitoringmaintenance" expanded={true} onNavigate={handleMobileNavigate} />
                  </>
                )}
              </div>

              <div className="pt-4">
                <h3 className="text-xs font-semibold uppercase text-gray-400 px-2 pb-2 tracking-wider">Work Orders</h3>
                {hasPermission("7") && <NavItem icon={<Clipboard />} text="Work Orders" to="/workorders" expanded={true} onNavigate={handleMobileNavigate} />}
              </div>
            </nav>

            {/* User Info Footer */}
            <div className="p-4 border-t border-gray-100 bg-white">
              <div className="flex items-center space-x-3">
                <img
                  src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                  alt="User Avatar"
                  className="w-10 h-10 rounded-full border-2 border-blue-400 object-cover"
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm">{user?.name || "User"}</p>
                  <p className="text-xs text-gray-500">Version 1.0.0</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden md:flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
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
              className="bg-white border-r border-gray-100 flex flex-col shadow-xl overflow-hidden"
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

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">5S</h3>}
                {hasPermission("7") && <NavItem icon={<Clipboard />} text="Ganba" to="/ganba" expanded={sidebarOpen} />}

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">System</h3>}
                {hasPermission("23") && <NavItem icon={<ListCheck />} text="Audit Trail" to="/audittrail" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<History />} text="Backup & Restore" to="/backupandrestore" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<History />} text="Workflow Approval" to="/workflowapproval" expanded={sidebarOpen} />}

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">Master</h3>}
                {hasPermission("23") && <NavItem icon={<MapPin />} text="Work Location" to="/worklocation" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<Users />} text="Work Arrangement" to="/workarrangement" expanded={sidebarOpen} />}
                {hasPermission("15") && <NavItem icon={<Key />} text="User Management" to="/permissions" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<Wrench />} text="Spare Part" to="/sparepart" expanded={sidebarOpen} />}
                {hasPermission("3") && <NavItem icon={<Package />} text="Assets" to="/assets" expanded={sidebarOpen} />}
                {hasPermission("3") && <NavItem icon={<Package />} text="Vendors" to="/vendors" expanded={sidebarOpen} />}
                {hasPermission("3") && <NavItem icon={<LifeBuoy />} text="Services" to="/services" expanded={sidebarOpen} />}
                {hasPermission("3") && <NavItem icon={<ToolCase />} text="Maintenance Activity" to="/maintenanceactivity" expanded={sidebarOpen} />}

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">Maintenance</h3>}
                {hasPermission("31") && <NavItem icon={<ChartBar />} text="Machine History" to="/machinehistory" expanded={sidebarOpen} />}
                {hasPermission("31") && <NavItem icon={<Monitor />} text="Monitoring Maintenance" to="/monitoringmaintenance" expanded={sidebarOpen} />}

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">Work Orders</h3>}
                {hasPermission("7") && <NavItem icon={<Clipboard />} text="Work Orders" to="/workorders" expanded={sidebarOpen} />}

                {sidebarOpen && <h3 className="text-xs font-semibold uppercase text-gray-400 px-4 pt-4 pb-1 tracking-wider">Spare Parts</h3>}
                {hasPermission("23") && <NavItem icon={<Component />} text="Sparepart Detail" to="/sparepartdetail" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<ShoppingCart />} text="Purchase Order Realization" to="/purchaseorderrealization" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<Receipt />} text="Transaction by Item" to="/transactionbyitem" expanded={sidebarOpen} />}
                {hasPermission("23") && <NavItem icon={<Archive />} text="Spare Part Management" to="/sparepartmanagement" expanded={sidebarOpen} />}
              </nav>

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
                      <p className="text-xs text-gray-500">1.0.0</p>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Components */}
      <MobileBottomNav />
      <MobileFullscreenMenu />
    </>
  );
};

export default React.memo(Sidebar);
