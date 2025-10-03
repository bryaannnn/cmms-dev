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
// import ITApprover from "./component/WorkOrders/IT/Approver";
// import ITAssignment from "./component/WorkOrders/IT/Assignment";
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
import WorkflowSelection from "./component/Workflow Approval/WorkflowSelection";
import WorkflowApprovalMonitoring from "./component/Workflow Approval/WorkflowApprovalMonitoring";
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
import DepartmentPage from "./component/WorkLocation/Department/Department";
import FormDepartment from "./component/WorkLocation/Department/FormDepartment";
import EditDepartment from "./component/WorkLocation/Department/EditDepartment";
import StopTimePage from "./component/Maintenance Activity/Stop Times/StopTime";
import FormStopTimes from "./component/Maintenance Activity/Stop Times/FomStopTimes";
import EditStopTimes from "./component/Maintenance Activity/Stop Times/EditStopTimes";
import ActivityTypePage from "./component/Maintenance Activity/Activity Type/AcitvityType";
import FormActivityType from "./component/Maintenance Activity/Activity Type/FomActivityType";
import EditActivityType from "./component/Maintenance Activity/Activity Type/EditActivityType";
import ITRequest2 from "./component/WorkOrders/IT/Request2";
import EditWorkOrderFormIT from "./component/WorkOrders/IT/EditIT";
import EditReceiver from "./component/WorkOrders/IT/EditReceiver";
import ITAssignment from "./component/WorkOrders/IT/Assignment";
import EditAssignment from "./component/WorkOrders/IT/EditAssignment";
import EditActivity from "./component/Maintenance Activity/Activity/EditActivity";
import FormActivity from "./component/Maintenance Activity/Activity/FomActivity";
import ActivityPage from "./component/Maintenance Activity/Activity/Activity";
import TroubleItemPage from "./component/Maintenance Activity/Trouble Item/TroubleItem";
import FormTroubleItem from "./component/Maintenance Activity/Trouble Item/FormTroubleItem";
import FormWorkUnit from "./component/WorkLocation/Work Unit/FormWorkUnit";
import EditWorkUnit from "./component/WorkLocation/Work Unit/EditWorkUnit";
import WorkUnitPage from "./component/WorkLocation/Work Unit/WorkUnit";
import EditWorkGroup from "./component/WorkArrangement/Work Group/EditWorkGroup";
import FormWorkGroup from "./component/WorkArrangement/Work Group/FormWorkGroup";
import WorkGroupPage from "./component/WorkArrangement/Work Group/WorkGroup";
import EditWorkShift from "./component/WorkArrangement/Work Shift/EditWorkShift";
import FormWorkShift from "./component/WorkArrangement/Work Shift/FormWorkShift";
import WorkShiftPage from "./component/WorkArrangement/Work Shift/WorkShift";
import FormMonitoringMaintenance from "./component/Monitoring Maintenance/FormMonitoring";
import FormMonitoringMaintenanceD from "./component/Monitoring Maintenance/FormDummy";
import ITReports from "./component/WorkOrders/IT/Reports";
import MonitoringMaintenance from "./component/Monitoring Maintenance/MonitoringMaintenance";
import VendorPage from "./component/Vendor/Vendor";
import FormVendor from "./component/Vendor/FormVendor";
import EditVendor from "./component/Vendor/EditVendor";
import DetailMonitoringMaintenance from "./component/Monitoring Maintenance/DetailMonitoring";

import DashboardDummy from "./pages/DashboardDummy";
import DetailDummy from "./component/Monitoring Maintenance/DetailDummy";
import WorkflowConfigureMonitoring from "./component/Workflow Approval/WorkflowConfigureMonitoring";

function App() {
  return (
    <>
      {/* <InternetStatusToast /> */}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<LoginForm />} />
        <Route path="/terms" element={<TermsAndConditions />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />

        <Route path="/maintenanceactivity/activitytypes/addactivitytype" element={<FormActivityType />} />

        <Route path="/monitoringmaintenance/detailmonitoringmaintenanceD" element={<DetailDummy />} />

        {/* Protected Routes */}
        {/* Dashboard */}
        <Route element={<ProtectedRoute />}>
          <Route index element={<Dashboard />} /> {/* Ren ders Dashboard for "/" */}
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/audittrail" element={<AuditTrail />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/workflowapproval" element={<WorkflowSelection />} />
          <Route path="/workflowapproval/monitoringapproval" element={<WorkflowApprovalMonitoring />} />
          <Route path="/workflowapproval/monitoringapproval/configureapproval/:id" element={<WorkflowConfigureMonitoring />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/worklocation" element={<WorkLocationSelection />} />
          <Route path="/worklocation/department" element={<DepartmentPage />} />
          <Route path="/worklocation/department/adddepartment" element={<FormDepartment />} />
          <Route path="/worklocation/department/editdepartment/:id" element={<EditDepartment />} />
          <Route path="/worklocation/workunit" element={<WorkUnitPage />} />
          <Route path="/worklocation/workunit/addworkunit" element={<FormWorkUnit />} />
          <Route path="/worklocation/workunit/editworkunit/:id" element={<EditWorkUnit />} />
          <Route path="/worklocation/workgroup" element={<WorkGroupPage />} />
          <Route path="/worklocation/workgroup/addworkgroup" element={<FormWorkGroup />} />
          <Route path="/worklocation/workgroup/editworkgroup/:id" element={<EditWorkGroup />} />
        </Route>

        <Route element={<ProtectedRoute requiredPermissions={["view_assets"]} />}>
          <Route path="/workarrangement" element={<WorkArrangementSelection />} />
          <Route path="/workarrangement/workshift" element={<WorkShiftPage />} />
          <Route path="/workarrangement/workshift/addworkshift" element={<FormWorkShift />} />
          <Route path="/workarrangement/workshift/editworkshift/:id" element={<EditWorkShift />} />
          <Route path="/workarrangement/workgroup" element={<WorkGroupPage />} />
          <Route path="/workarrangement/workgroup/addworkgroup" element={<FormWorkGroup />} />
          <Route path="/workarrangement/workgroup/editworkgroup/:id" element={<EditWorkGroup />} />
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
          <Route path="/vendors" element={<VendorPage />} />
          <Route path="/vendors/addvendor" element={<FormVendor />} />
          <Route path="/vendors/editvendor/:id" element={<EditVendor />} />
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
          <Route path="/maintenanceactivity/stoptimes" element={<StopTimePage />} />
          <Route path="/maintenanceactivity/stoptimes/addstoptime" element={<FormStopTimes />} />
          <Route path="/maintenanceactivity/stoptimes/editstoptime/:id" element={<EditStopTimes />} />
          <Route path="/maintenanceactivity/activitytypes" element={<ActivityTypePage />} />
          <Route path="/maintenanceactivity/activitytypes/addactivitytype" element={<FormActivityType />} />
          <Route path="/maintenanceactivity/activitytypes/editactivitytype/:id" element={<EditActivityType />} />
          <Route path="/maintenanceactivity/activity" element={<ActivityPage />} />
          <Route path="/maintenanceactivity/activity/addactivity" element={<FormActivity />} />
          <Route path="/maintenanceactivity/activity/editactivity/:id" element={<EditActivity />} />
          <Route path="/maintenanceactivity/troubleitem" element={<TroubleItemPage />} />
          <Route path="/maintenanceactivity/troubleitem/addtroubleitem" element={<FormTroubleItem />} />
          <Route path="/maintenanceactivity/troubleitem/edittroubleitem/:id" element={<FormTroubleItem />} />
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
          <Route path="/monitoringmaintenance/detailmonitoringmaintenance/:id" element={<DetailMonitoringMaintenance />} />
          <Route path="/monitoringmaintenance/formmonitoringmaintenance" element={<FormMonitoringMaintenance />} />
          <Route path="/monitoringmaintenance" element={<MonitoringMaintenance />} />
        </Route>

        {/* Work Orders */}
        <Route element={<ProtectedRoute requiredPermissions={["view_workorders"]} />}>
          <Route path="/workorders" element={<WorkOrdersSelection />} />
          <Route path="/workorders/it" element={<ITRequest2 />} />
          <Route path="/workorders/it/addworkorder" element={<AddWorkOrderFormIT />} />
          <Route path="/workorders/it/editworkorder/:id" element={<EditWorkOrderFormIT />} />
          <Route path="/workorders/it/receiver" element={<ITReceiver />} />
          <Route path="/workorders/it/receiver/editreceiver/:id" element={<EditReceiver />} />
          <Route path="/workorders/it/assignment" element={<ITAssignment />} />
          <Route path="/workorders/it/assignment/editassignment/:id" element={<EditAssignment />} />
          <Route path="/workorders/it/reports" element={<ITReports />} />
          <Route path="/workorders/it/knowledgebase" element={<ITKnowledgeBase />} />
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
