// src/component/PageHeader.tsx
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

import { ChevronRight, Bell, ChevronDown, User as UserIcon, Settings, LogOut, Sun, Moon, AlertTriangle, Calendar, Home } from "lucide-react";

// Interface for notification items
interface NotificationItem {
  id: number;
  title: string;
  description: string;
  icon?: React.ReactNode;
  date: string;
}

// Static notification data for demonstration
const notifications: NotificationItem[] = [
  {
    id: 1,
    title: "Machine A Warning",
    description: "Machine A temperature exceeds normal limits.",
    date: "Today, 10:00 AM",
    icon: <AlertTriangle className="text-red-500" />,
  },
  {
    id: 2,
    title: "Upcoming Maintenance Schedule",
    description: "Routine maintenance for Machine B will be performed tomorrow.",
    date: "Yesterday, 03:00 PM",
    icon: <Calendar className="text-blue-500" />,
  },
];

// Props interface for the PageHeader component
interface PageHeaderProps {
  mainTitle: string;
  mainTitleHighlight: string;
  description: string;
  icon: React.ReactElement<React.SVGProps<SVGSVGElement>>;
  isMobile: boolean;
  toggleSidebar: () => void;
}

// Mapping for breadcrumb based on path
const breadcrumbMap: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/assets": "Assets",
  "/assets/assetsdata": "Assets Data",
  "/assets/assetsdata/addasset": "Add Asset",
  "/assets/assetsdata/editasset": "Edit Asset",
  "/machinehistory": "Machine History",
  "/machinehistory/reports": "Machine History Reports",
  "/machinehistory/addmachinehistory": "Add Machine History",
  "/machinehistory/edit": "Edit Machine History",
  "/workorders": "Work Orders",
  "/workorders/it": "IT Work Orders",
  "/workorders/it/addworkorder": "Add Work Order",
  "/workorders/it/editworkorder": "Edit Work Order",
  "/workorders/it/receiver": "Receiver",
  "/workorders/it/assignment": "Assignment",
  "/workorders/it/reports": "Reports",
  "/workorders/it/knowledgebase": "Knowledge Base",
  "/inventory": "Inventory",
  "/reports": "Reports",
  "/team": "Team",
  "/settings": "Settings",
  "/settings/change-password": "Change Password",
  "/permissions": "Permissions",
  "/permissions/adduser": "Add User",
  "/audittrail": "Audit Trail",
  "/workflowapproval": "Workflow Approval",
  "/workflowapproval/monitoringapproval": "Approval Monitoring",
  "/vendors": "Vendors",
  "/vendors/addvendor": "Add Vendor",
  "/vendors/editvendor": "Edit Vendor",
  "/services": "Services",
  "/services/servicegroups": "Service Groups",
  "/services/servicegroups/addservicegroup": "Add Service Group",
  "/services/servicegroups/editservicegroup": "Edit Service Group",
  "/services/servicecatalogues": "Service Catalogues",
  "/services/servicecatalogues/addservicecatalogue": "Add Service Catalogue",
  "/services/servicecatalogues/editservicecatalogue": "Edit Service Catalogue",
  "/maintenanceactivity": "Maintenance Activity",
  "/maintenanceactivity/stoptimes": "Stop Times",
  "/maintenanceactivity/stoptimes/addstoptime": "Add Stop Time",
  "/maintenanceactivity/stoptimes/editstoptime": "Edit Stop Time",
  "/maintenanceactivity/activitytypes": "Activity Types",
  "/maintenanceactivity/activitytypes/addactivitytype": "Add Activity Type",
  "/maintenanceactivity/activitytypes/editactivitytype": "Edit Activity Type",
  "/maintenanceactivity/activity": "Activity",
  "/maintenanceactivity/activity/addactivity": "Add Activity",
  "/maintenanceactivity/activity/editactivity": "Edit Activity",
  "/maintenanceactivity/troubleitem": "Trouble Item",
  "/maintenanceactivity/troubleitem/addtroubleitem": "Add Trouble Item",
  "/maintenanceactivity/troubleitem/edittroubleitem": "Edit Trouble Item",
  "/worklocation": "Work Location",
  "/worklocation/department": "Department",
  "/worklocation/department/adddepartment": "Add Department",
  "/worklocation/department/editdepartment": "Edit Department",
  "/worklocation/workunit": "Work Unit",
  "/worklocation/workunit/addworkunit": "Add Work Unit",
  "/worklocation/workunit/editworkunit": "Edit Work Unit",
  "/workarrangement": "Work Arrangement",
  "/workarrangement/workshift": "Work Shift",
  "/workarrangement/workshift/addworkshift": "Add Work Shift",
  "/workarrangement/workshift/editworkshift": "Edit Work Shift",
  "/workarrangement/workgroup": "Work Group",
  "/workarrangement/workgroup/addworkgroup": "Add Work Group",
  "/workarrangement/workgroup/editworkgroup": "Edit Work Group",
  "/sparepart": "Spare Part",
  "/monitoringmaintenance": "Maintenance Monitoring",
  "/monitoringmaintenance/detailmonitoringmaintenance": "Monitoring Details",
  "/monitoringmaintenance/formmonitoringmaintenance": "Monitoring Form",
};

const PageHeader: React.FC<PageHeaderProps> = ({ mainTitle, mainTitleHighlight, description, icon, isMobile, toggleSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [showNotificationsPopup, setShowNotificationsPopup] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const notificationsRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotificationsPopup(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split("/").filter((segment) => segment !== "");

    const breadcrumbs = [];

    // Always add Home/Dashboard as first breadcrumb
    breadcrumbs.push({
      label: "Dashboard",
      path: "/dashboard",
      isClickable: true,
    });

    // Build breadcrumbs based on path segments
    let currentPath = "";
    for (let i = 0; i < pathSegments.length; i++) {
      const segment = pathSegments[i];
      currentPath += `/${segment}`;

      // Skip if it's an ID parameter (numeric or UUID)
      if (/^\d+$/.test(segment) || /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(segment)) {
        continue;
      }

      const label = breadcrumbMap[currentPath] || segment.charAt(0).toUpperCase() + segment.slice(1).replace(/([A-Z])/g, " $1");

      breadcrumbs.push({
        label,
        path: currentPath,
        isClickable: i < pathSegments.length - 1 && breadcrumbMap[currentPath] !== undefined,
      });
    }

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();
  const existingIconClassName = icon.props.className || "";

  return (
    <>
      {/* Main header section */}
      <header className="bg-white border-b border-gray-100 p-4 flex items-center justify-between shadow-sm sticky top-0 z-30">
        {/* Left section: Sidebar toggle, icon, and page title */}
        <div className="flex items-center space-x-4">
          {/* Mobile sidebar toggle button */}
          {isMobile && (
            <motion.button onClick={toggleSidebar} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200">
              <ChevronRight className="text-xl" />
            </motion.button>
          )}
          {/* Page icon */}
          {React.cloneElement(icon, { className: `text-xl text-blue-600 ${existingIconClassName}` })}
          {/* Main page title */}
          <h2 className="text-lg md:text-xl font-bold text-gray-900">{mainTitle}</h2>
        </div>

        {/* Right section: Dark mode toggle, notifications, and user profile */}
        <div className="flex items-center space-x-3 relative">
          {/* Dark mode toggle button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <Sun className="text-yellow-400 text-xl" /> : <Moon className="text-xl" />}
          </motion.button>

          {/* Notifications dropdown */}
          <div className="relative" ref={notificationsRef}>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowNotificationsPopup(!showNotificationsPopup)}
              className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200 relative"
              aria-label="Notifications"
            >
              <Bell className="text-xl" />
              {/* Notification indicator */}
              <span className="absolute top-1 right-1 w-2 h-2 bg-orange-500 rounded-full animate-pulse border border-white"></span>
            </motion.button>

            {/* Notification popup content */}
            <AnimatePresence>
              {showNotificationsPopup && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl overflow-hidden z-50 border border-gray-100"
                >
                  <div className="p-4 border-b border-gray-100">
                    <h3 className="text-lg font-semibold text-gray-800">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div key={notif.id} className="flex items-start p-4 border-b border-gray-50 last:border-b-0 hover:bg-blue-50 transition-colors cursor-pointer">
                          {notif.icon && <div className="flex-shrink-0 mr-3">{notif.icon}</div>}
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{notif.title}</p>
                            <p className="text-xs text-gray-600 mt-1">{notif.description}</p>
                            <p className="text-xs text-gray-400 mt-1">{notif.date}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="p-4 text-center text-gray-500 text-sm">No new notifications.</p>
                    )}
                  </div>
                  <div className="p-4 border-t border-gray-100 text-center">
                    <button
                      onClick={() => {
                        setShowNotificationsPopup(false);
                      }}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Mark all as read
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User profile dropdown */}
          <div className="relative" ref={profileRef}>
            <motion.button
              whileHover={{ backgroundColor: "rgba(239, 246, 255, 0.7)" }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center space-x-2 cursor-pointer p-2 rounded-lg transition-colors duration-200"
            >
              {/* User avatar */}
              <img
                src={`https://api.dicebear.com/7.x/initials/svg?seed=${user?.name || "User"}&backgroundColor=0081ff,3d5a80,ffc300,e0b589&backgroundType=gradientLinear&radius=50`}
                alt="User Avatar"
                className="w-8 h-8 rounded-full border border-blue-200 object-cover"
              />
              {/* User name */}
              <span className="font-medium text-gray-900 text-sm hidden sm:inline">{user?.name}</span>
              {/* Dropdown arrow */}
              <ChevronDown className="text-gray-500 text-base" />
            </motion.button>

            {/* User profile menu content */}
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
                      logout();
                      navigate("/login");
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

      {/* Breadcrumb section */}
      <div className="bg-gray-50 border-b border-gray-100 px-4 py-3">
        <div className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <div key={breadcrumb.path} className="flex items-center space-x-2">
              {index === 0 ? <Home size={16} className="text-gray-400" /> : <ChevronRight size={16} className="text-gray-400" />}

              {breadcrumb.isClickable ? (
                <button onClick={() => navigate(breadcrumb.path)} className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200">
                  {breadcrumb.label}
                </button>
              ) : (
                <span className="text-gray-600 font-medium">{breadcrumb.label}</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PageHeader;
