import { Routes, Route } from "react-router-dom";
import LoginForm from "./pages/LoginForm";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import TermsAndConditions from "./pages/TermsAndCondition";
import ForgotPassword from "./pages/ForgotPassword";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Logout from "./pages/Logout";
import Assets from "./pages/Assets"; // This is AssetsPage
// import WorkOrdersDashboard from "./pages/WorkOrders";
import InventoryDashboard from "./pages/Inventory";
import ReportsDashboard from "./pages/Reports";
import TeamDashboard from "./pages/Teams";
import SettingsPage from "./pages/Settings";
import MachineHistoryDashboard from "./pages/Maintenance";
import FormMesin from "./component/MachineHistory/FormMesin";
import EditFormMesin from "./component/MachineHistory/EditFormMesin";
import PermissionsPage from "./pages/Permission";
import ChangePasswordPage from "./pages/ChangePassword";
import AddUserPage from "./pages/AddUserPage";
import UnauthorizedPage from "./pages/Unauthorized";
import InternetStatusToast from "./component/InternetStatus";
import AddAsset from "./pages/AddAssets";
import EditAssetPage from "./pages/EditAssets";
// import FormWorkOrders from "./component/WorkOrders/FormWO";
// import EditWorkOrder from "./component/WorkOrders/EditWO";
// import WorkOrderAdminDashboard from "./pages/WorkOrdersAdmin";
import ITRequest from "./component/WorkOrders/IT/Request";
// import ITApprover from "./component/WorkOrders/IT/Approver";
import ITAssignment from "./component/WorkOrders/IT/Assignment";
import ITReceiver from "./component/WorkOrders/IT/Receiver";
// import ITReports from "./component/WorkOrders/IT/Reports";
import ITKnowledgeBase from "./component/WorkOrders/IT/KnowladgeBase";
// import AddWorkOrderForm from "./component/WorkOrders/TD/FormWO";
// import EditWorkOrder from "./component/WorkOrders/IT/EditIT";
import AddWorkOrderFormIT from "./component/WorkOrders/IT/FormIT";
// import EditWorkOrderIT from "./component/WorkOrders/IT/EditIT";
import WorkOrdersSelection from "./component/WorkOrders/WorkOrdersSelection";
import WorkLocationSelection from "./component/WorkLocation/WorkLocationSelection";
import WorkArrangementSelection from "./component/WorkArrangement/WorkArrangementSelection";
import SparePartSelection from "./component/SparePart/SparePartSelection";
import AssetsSelection from "./component/Assets/AssetsSelection";
import ServiceSelection from "./component/Service/ServiceSelection";
import MaintenanceActivitySelection from "./component/Maintenance Activity/MaintenanceActivitySelection";
import MachineHistoryReports from "./component/MachineHistory/MaintenanceReports";
import AuditTrail from "./component/Audit Trail/AuditTrail";
import MonitoringMaintenance from "./component/Monitoring Maintenance/MonitoringMaintenance";
import DetailMonitoringMaintenance from "./component/Monitoring Maintenance/DetailMonitoringMaintenance";
import FormMonitoringMaintenance from "./component/Monitoring Maintenance/FormMonitoringMaintenance";
import WorkflowSelection from "./component/Workflow Approval/WorkflowSelection";
import WorkflowApprovalMonitoring from "./component/Workflow Approval/WorkflowApprovalMonitoring";
import WorkOrderApproval from "./component/Workflow Approval/WorkOrderApproval";
import AddWorkOrderFormITDummy from "./component/WorkOrders/DUMMY/FormITDummy";
import RequestD from "./component/WorkOrders/DUMMY/RequestD";
import ITReceiverD from "./component/WorkOrders/DUMMY/ReceiverD";
import ITAssignmentD from "./component/WorkOrders/DUMMY/AssignmentD";
import ITReportsD from "./component/WorkOrders/DUMMY/ReportsD";
import AddWorkOrderFormITD from "./component/WorkOrders/DUMMY/FormITDummy";
import ServiceGroup from "./component/Service/ServiceGroups";
import ServiceCatalogue from "./component/Service/ServiceCatalogue";
import FormServiceGroup from "./component/Service/FormGroup";
import FormEditServiceGroup from "./component/Service/EditGroup";
import FormEditServiceCatalogue from "./component/Service/EditCatalogue";
import FormServiceCatalogue from "./component/Service/FormCatalogue";

function App() {
  return (
    <>
      <InternetStatusToast />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
        {/* <Route path="/permissions" element={<PermissionsPage />} /> */}
        {/* <Route path="/workorders" element={<WorkOrdersDashboard />} />
        <Route path="/workordersadmin" element={<WorkOrderAdminDashboard />} />
        <Route path="/workorders/addworkorder" element={<FormWorkOrders />} />
        <Route path="/workorders/editworkorder/:id" element={<EditWorkOrder />} /> */}
        {/* <Route path="/assets/addasset" element={<AddAsset />} />
        <Route path="/assets/editasset/:id" element={<EditAssetPage />} /> */}

        {/* <Route path="/workorders/td/request" element={<RequestTD />} />
        <Route path="/workorders/td/approver" element={<ApproverTD />} />
        <Route path="/workorders/td/assignment" element={<AssignmentTD />} />
        <Route path="/workorders/td/receiver" element={<ReceiverTD />} />
        <Route path="/workorders/td/reports" element={<ReportsTD />} />
        <Route path="/workorders/td/knowledge-base" element={<KnowledgeBaseTD />} /> */}

        {/* DUMMY Work Order IT */}
        <Route path="/workorders/itD" element={<RequestD />} />
        <Route path="/workorders/it/addworkorderD" element={<AddWorkOrderFormITD />} />
        {/* <Route path="/workorders/it/editworkorder/:id" element={<EditWorkOrderIT />} /> */}
        {/* <Route path="/workorders/it/approver" element={<ITApprover />} /> */}
        <Route path="/workorders/it/assignmentD" element={<ITAssignmentD />} />
        <Route path="/workorders/it/receiverD" element={<ITReceiverD />} />
        <Route path="/workorders/it/reportsD" element={<ITReportsD />} />
        <Route path="/workorders/it/knowledgebased" element={<ITKnowledgeBase />} />

        <Route path="/workorders/it" element={<ITRequest />} />
        {/* <Route path="/workorders/it/addworkorder" element={<AddWorkOrderFormIT />} /> */}
        <Route path="/workorders/it/addworkorderdummy" element={<AddWorkOrderFormITDummy />} />
        {/* <Route path="/workorders/it/editworkorder/:id" element={<EditWorkOrderIT />} /> */}
        {/* <Route path="/workorders/it/approver" element={<ITApprover />} /> */}
        <Route path="/workorders/it/assignment" element={<ITAssignment />} />
        <Route path="/workorders/it/receiver" element={<ITReceiver />} />
        {/* <Route path="/workorders/it/reports" element={<ITReports />} /> */}
        <Route path="/workorders/it/knowledgebase" element={<ITKnowledgeBase />} />
        <Route path="/permissions/adduser" element={<AddUserPage />} />
        {/* <Route path="/machinehistory/addmachinehistory" element={<FormMesin />} />  
        <Route path="/machinehistory/edit/:id" element={<EditFormMesin />} /> */}
        <Route path="/workorders" element={<WorkOrdersSelection />} />
        <Route path="/monitoringmaintenance/detailmonitoringmaintenance" element={<DetailMonitoringMaintenance />} />
        <Route path="/monitoringmaintenance/formmonitoringmaintenance" element={<FormMonitoringMaintenance />} />
        <Route path="/monitoringmaintenance" element={<MonitoringMaintenance />} />
        <Route path="/workflowapproval" element={<WorkflowSelection />} />
        <Route path="/workflowapproval/monitoringapproval" element={<WorkflowApprovalMonitoring />} />
        <Route path="/workflowapproval/workorderapproval" element={<WorkOrderApproval />} />

        <Route path="/services/servicecatalogues" element={<ServiceCatalogue />} />

        {/* Protected Routes */}
        {/* Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} /> {/* Renders Dashboard for "/" */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/audittrail" element={<AuditTrail />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/workflowapproval" element={<WorkflowSelection />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/worklocation" element={<WorkLocationSelection />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/workarrangement" element={<WorkArrangementSelection />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/sparepart" element={<SparePartSelection />} />
        </Route>

        {/* Assets Management */}
        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/assets" element={<AssetsSelection />} />
          {/* <Route path="/assets/assetsgroup" element={<Assets />} /> */}
          <Route path="/assets/assetsdata" element={<Assets />} />
          <Route path="/assets/assetsdata/addasset" element={<AddAsset />} />
          <Route path="/assets/assetsdata/editasset/:id" element={<EditAssetPage />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/services" element={<ServiceSelection />} />
          <Route path="/services/servicegroups" element={<ServiceGroup />} />
          <Route path="/services/servicegroups/addservicegroup" element={<FormServiceGroup />} />
          <Route path="/services/servicegroups/editservicegroup/:id" element={<FormEditServiceGroup />} />
          <Route path="/services/servicecatalogues" element={<ServiceCatalogue />} />
          <Route path="/services/servicecatalogues/addservicecatalogue" element={<FormServiceCatalogue />} />
          <Route path="/services/servicecatalogues/editservicecatalogue/:id" element={<FormEditServiceCatalogue />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/maintenanceactivity" element={<MaintenanceActivitySelection />} />
        </Route>

        {/* Machine History */}
        <Route element={<ProtectedRoute requiredPermissions={["view_machinehistory"]} />}>
          <Route path="/machinehistory" element={<MachineHistoryDashboard />} />
          <Route path="/machinehistory/reports" element={<MachineHistoryReports />} />
          <Route path="/machinehistory/addmachinehistory" element={<FormMesin />} />
          <Route path="/machinehistory/edit/:id" element={<EditFormMesin />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/monitoringmaintenance" element={<MonitoringMaintenance />} />
        </Route>

        {/* Work Orders */}
        <Route element={<ProtectedRoute requiredPermissions={["view_workorders"]} />}>
          <Route path="/workorders" element={<WorkOrdersSelection />} />
          <Route path="/workorders/it" element={<ITRequest />} />
          <Route path="/workorders/it/addworkorder" element={<AddWorkOrderFormIT />} />
          {/* <Route path="/workorders/it/editworkorder/:id" element={<EditWorkOrderIT />} /> */}
          {/* <Route path="/workorders/it/approver" element={<ITApprover />} /> */}
          <Route path="/workorders/it/assignment" element={<ITAssignment />} />
          <Route path="/workorders/it/receiver" element={<ITReceiver />} />
          {/* <Route path="/workorders/it/reports" element={<ITReports />} /> */}
          <Route path="/workorders/it/knowledgebase" element={<ITKnowledgeBase />} />
          {/* <Route path="/workorders" element={<WorkOrdersDashboard />} />
          <Route path="/workordersadmin" element={<WorkOrderAdminDashboard />} />
          <Route path="/workorders/addworkorder" element={<FormWorkOrders />} />
          <Route path="/workorders/editworkorder/:id" element={<EditWorkOrder />} /> */}
        </Route>

        {/* Inventory */}
        <Route element={<ProtectedRoute requiredPermissions={["view_inventory"]} />}>
          <Route path="/inventory" element={<InventoryDashboard />} />
        </Route>

        {/* Reports */}
        <Route element={<ProtectedRoute requiredPermissions={["view_reports"]} />}>
          <Route path="/reports" element={<ReportsDashboard />} />
        </Route>

        {/* Team */}
        <Route element={<ProtectedRoute requiredPermissions={["view_teams"]} />}>
          <Route path="/team" element={<TeamDashboard />} />
        </Route>

        {/* Settings */}
        <Route element={<ProtectedRoute requiredPermissions={["view_settings"]} />}>
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/settings/change-password" element={<ChangePasswordPage />} />
        </Route>

        {/* Permissions */}
        <Route element={<ProtectedRoute requiredPermissions={["view_permissions"]} />}>
          <Route path="/permissions" element={<PermissionsPage />} />
          <Route path="/permissions/adduser" element={<AddUserPage />} />
        </Route>

        {/* Logout */}
        <Route path="/logout" element={<Logout />} />
        {/* Unauthorized (already defined above, but good to have a dedicated one for direct access) */}
        {/* <Route path="/unauthorized" element={<UnauthorizedPage />} /> */}
      </Routes>
    </>
  );
}

export default App;
