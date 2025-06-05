import { Routes, Route } from "react-router-dom";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import ProtectedRoute from "./routes/ProtectedRoute";
import TermsAndConditions from "./components/TermsAndCondition";
import ForgotPassword from "./components/ForgotPassword";
import PrivacyPolicy from "./components/PrivacyPolicy";
import Logout from "./components/Logout";
import Assets from "./components/Assets";

// const envVariables = getProjectEnvVariables();

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterForm />} />
      <Route path="/login" element={<LoginForm />} />
      <Route path="/assets" element={<Assets />} />
      <Route path="/dashboard" element={<Dashboard />} />
     
      <Route element={<ProtectedRoute />}>
        
        <Route path="/" element={<Dashboard />} />
      </Route>

       <Route path="/terms" element={<TermsAndConditions />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/logout" element={<Logout />} />
    </Routes>
  );
}

export default App;
