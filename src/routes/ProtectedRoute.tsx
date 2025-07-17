import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext";
import LoadingSpinner from "../component/Loading";

interface ProtectedRouteProps {
  requiredPermissions?: PermissionName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions = [] }) => {
  const { token, user, hasPermission, isAuthLoading } = useAuth(); // Ambil isAuthLoading
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Jika masih loading, jangan lakukan apa-apa dulu
    if (isAuthLoading) {
      return;
    }

    // 2. Jika tidak ada token dan tidak lagi loading, arahkan ke login
    if (!token) {
      navigate("/login", { state: { from: location }, replace: true });
      return;
    }

    // 3. Jika ada token dan tidak lagi loading, baru cek permissions
    //    Pastikan user objek sudah ada sebelum mengecek permission yang spesifik.
    if (user && requiredPermissions.length > 0 && !requiredPermissions.some((perm) => hasPermission(perm))) {
      navigate("/unauthorized", { state: { from: location }, replace: true });
    }
  }, [token, user, requiredPermissions, hasPermission, navigate, location, isAuthLoading]); // Tambahkan isAuthLoading sebagai dependency

  // Tampilkan loading spinner atau null saat isAuthLoading true
  if (isAuthLoading) {
    return <LoadingSpinner />; // Atau komponen loading Anda
  }

  // Setelah loading selesai, baru tentukan apakah akan merender Outlet atau null
  const canRenderContent = token && (requiredPermissions.length === 0 || (user && requiredPermissions.some((perm) => hasPermission(perm))));

  return canRenderContent ? <Outlet /> : null;
};

export default ProtectedRoute;
