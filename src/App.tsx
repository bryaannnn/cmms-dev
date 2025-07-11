import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
// import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import TermsAndConditions from "./pages/TermsAndCondition";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Logout from "./pages/Logout";
import Assets from "./pages/Assets";
import WorkOrdersDashboard from "./pages/WorkOrders";
// import WorkOrdersDashboard2 from "./component/WorkOrders/WorkOrdersDashboard2";
import InventoryDashboard from "./pages/Inventory";
import ReportsDashboard from "./pages/Reports";
import TeamDashboard from "./pages/Teams";
import SettingsPage from "./pages/Settings";
import MachineHistoryDashboard from "./pages/Maintenance";
import FormMesin from "./component/MachineHistory/FormMesin";
// import FormWorkOrders from "./component/WorkOrders/FormWO";
import MachineHistoryForm from "./component/MachineHistory/EditFormMesin";
import EditFormMesin from "./component/MachineHistory/EditFormMesin";
import PermissionsPage from "./pages/Permission";
import ChangePasswordPage from "./pages/ChangePassword";
import AddUserPage from "./pages/AddUserPage";
import UnauthorizedPage from "./pages/Unauthorized";
import InternetStatusToast from "./component/InternetStatus";

// const envVariables = getProjectEnvVariables();

function App() {
  return (
    
    <Routes>
      {/* <Route path="/register" element={<RegisterForm />} /> */}
      <Route path="/login" element={<LoginForm />} />
      {/* <Route path="/machinehistory/edit" element={<EditFormMesin />} /> */}
      {/* <Route path="/workorders/input" element={<FormWorkOrders />} /> */}
      {/* <Route path="/workorders/dashboard" element={<WorkOrdersDashboard2 />} /> */}
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/workorders" element={<WorkOrdersDashboard />} />
      <Route path="/machinehistory" element={<MachineHistoryDashboard />} />
      <Route path="/machinehistory/input" element={<FormMesin />} />
      <Route path="/machinehistory/edit/:id" element={<EditFormMesin />} />
      <Route path="/inventory" element={<InventoryDashboard />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/reports" element={<ReportsDashboard />} />
      <Route path="/team" element={<TeamDashboard />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/settings/change-password" element={<ChangePasswordPage />} />
      <Route path="/permissions" element={<PermissionsPage />} />
      <Route path="/permissions/adduser" element={<AddUserPage />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
      </Route>

      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
    
    // <>
    // <InternetStatusToast />
    // <Routes>
    //   {/* Public Routes */}
    //   <Route path="/login" element={<LoginForm />} />
      
    //   {/* <Route path="/register" element={<RegisterForm />} /> */}
    //   <Route path="/terms" element={<TermsAndConditions />} />
    //   <Route path="/forgot-password" element={<ForgotPassword />} />
    //   <Route path="/privacy-policy" element={<PrivacyPolicy />} />
    //   <Route path="/unauthorized" element={<UnauthorizedPage />} />

    //   {/* Protected Routes */}
    //   <Route element={<ProtectedRoute />}>
    //     <Route path="/" element={<Dashboard />} />
    //     <Route path="/dashboard" element={<Dashboard />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
    //     <Route path="/assets" element={<Assets />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_workorders"]} />}>
    //     <Route path="/workorders" element={<WorkOrdersDashboard />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_machinehistory"]} />}>
    //     <Route path="/machinehistory" element={<MachineHistoryDashboard />} />
    //     <Route path="/machinehistory/input" element={<FormMesin />} />
    //     <Route path="/machinehistory/edit/:id" element={<EditFormMesin />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_inventory"]} />}>
    //     <Route path="/inventory" element={<InventoryDashboard />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_reports"]} />}>
    //     <Route path="/reports" element={<ReportsDashboard />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_teams"]} />}>
    //     <Route path="/team" element={<TeamDashboard />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_settings"]} />}>
    //     <Route path="/settings" element={<SettingsPage />} />
    //     <Route path="/settings/change-password" element={<ChangePasswordPage />} />
    //   </Route>

    //   <Route element={<ProtectedRoute requiredPermissions={["view_permissions"]} />}>
    //     <Route path="/permissions" element={<PermissionsPage />} />
    //     <Route path="/permissions/adduser" element={<AddUserPage />} />
    //   </Route>

    //   <Route path="/logout" element={<Logout />} />
    //   <Route path="/unauthorized" element={<UnauthorizedPage />} />
    // </Routes>
    // </>
  );
}

export default App;
