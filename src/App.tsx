import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import RegisterForm from "./pages/RegisterForm";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import TermsAndConditions from "./pages/TermsAndCondition";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Logout from "./pages/Logout";
import Assets from "./pages/Assets";
import WorkOrdersDashboard from "./pages/WorkOrders";
import InventoryDashboard from "./pages/Inventory";
import ReportsDashboard from "./pages/Reports";
import TeamDashboard from "./pages/Teams";
import SettingsPage from "./pages/Settings";
import MachineHistoryDashboard from "./pages/Maintenance";
import FormMesin from "./component/MachineHistory/FormMesin";
import FormWorkOrders from "./component/WorkOrders/formwo";
import WorkOrders from "./component/WorkOrders/FormWorkOrders";
import MachineHistoryForm from "./component/MachineHistory/EditFormMesin";

// const envVariables = getProjectEnvVariables();

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/workorders/input" element={<FormWorkOrders />} />
      <Route path="/workorders/dashboard" element={<WorkOrders />} />
      {/* <Route path="/machinehistory/edit" element={<MachineHistoryForm />} /> */}
      <Route path="/machinehistory/input" element={<FormMesin />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/workorders" element={<WorkOrdersDashboard />} />
        <Route path="/machinehistory" element={<MachineHistoryDashboard />} />

        <Route path="/inventory" element={<InventoryDashboard />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/reports" element={<ReportsDashboard />} />
        <Route path="/team" element={<TeamDashboard />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}

export default App;
