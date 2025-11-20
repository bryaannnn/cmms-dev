import { useEffect } from "react";
import { useNavigate, Outlet, useLocation } from "react-router-dom";
import { useAuth, PermissionName } from "../routes/AuthContext";
import LoadingSpinner from "../component/Loading";

interface ProtectedRouteProps {
  requiredPermissions?: PermissionName[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ requiredPermissions = [] }) => {
  const { token, user, hasPermission, isAuthLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // 1. Jika masih loading, jangan lakukan apa-apa dulu
    if (isAuthLoading) {
      return;
    }

    // 2. Jika tidak ada token dan tidak lagi loading, arahkan ke login
    if (!token) {
      // --- LOGIKA BARU: SIMPAN INTENDED PATH KE LOCAL STORAGE ---
      // Ambil path lengkap (pathname + query string) dari URL yang sedang dicoba diakses.
      const intendedPath = location.pathname + location.search;

      // Simpan path ini agar bisa dibaca setelah login berhasil.
      localStorage.setItem("intendedPath", intendedPath);

      // Lakukan redirect ke login (state: { from: location } tidak lagi diperlukan)
      navigate("/login", { replace: true });
      return;
    }

    // 3. Jika ada token dan tidak lagi loading, baru cek permissions
    //    Pastikan user objek sudah ada sebelum mengecek permission yang spesifik.
    if (user && requiredPermissions.length > 0 && !requiredPermissions.some((perm) => hasPermission(perm))) {
      navigate("/unauthorized", { state: { from: location }, replace: true });
    }
  }, [token, user, requiredPermissions, hasPermission, navigate, location, isAuthLoading]);

  // Tampilkan loading spinner atau null saat isAuthLoading true
  if (isAuthLoading) {
    return <LoadingSpinner />; // Atau komponen loading Anda
  }

  // Setelah loading selesai, baru tentukan apakah akan merender Outlet atau null
  const canRenderContent = token && (requiredPermissions.length === 0 || (user && requiredPermissions.some((perm) => hasPermission(perm))));

  return canRenderContent ? <Outlet /> : null;
};

export default ProtectedRoute;
