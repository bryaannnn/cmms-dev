import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext"; 

interface ProtectedRouteProps {
  requiredPermissions?: PermissionName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions = [] }) => {
  const { token, user, hasPermission } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!token) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    if (requiredPermissions.length > 0 && !requiredPermissions.some(perm => hasPermission(perm))) {
      navigate("/unauthorized", { state: { from: location }, replace: true });
    }
  }, [token, user, requiredPermissions, hasPermission, navigate, location]);

  const shouldRender = token && (requiredPermissions.length === 0 || requiredPermissions.some(perm => hasPermission(perm)));

  return shouldRender ? <Outlet /> : null;
};

export default ProtectedRoute;