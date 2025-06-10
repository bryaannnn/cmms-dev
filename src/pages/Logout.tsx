import { useState } from 'react';
import { useAuth } from '../routes/AuthContext';
import logoWida from '../assets/logo-wida.png';

const Logout = () => {
  const { logout, isLoggingOut } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError('Failed to logout. Please try again.');
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <div className="relative w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8 sm:p-10 md:p-12 text-center">
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg flex items-center justify-center">
                <img src={logoWida} alt="Logo Wida" className="h-20 w-auto" />
              </div>
              <span className="text-2xl font-bold text-blue-800 italic">PT WIDATRA BHAKTI</span>
            </div>
          </div>

          {isLoggingOut ? (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Logging Out...</h2>
              <div className="flex justify-center mb-6">
                <svg className="animate-spin h-10 w-10 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <p className="text-gray-600 mb-8">
                You're being securely logged out. Please wait...
              </p>
            </>
          ) : (
            <>
              <h2 className="text-2xl font-semibold text-gray-800 mb-4">Sign Out</h2>
              <p className="text-gray-600 mb-6">
                Are you sure you want to sign out?
              </p>

              {error && (
                <div className="mb-4 p-2 bg-red-50 text-red-600 rounded text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-center space-x-4 mt-6">
                <button
                  onClick={() => window.history.back()}
                  className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isLoggingOut}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  disabled={isLoggingOut}
                >
                  Sign Out
                </button>
              </div>
            </>
          )}

          <div className="mt-8 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              © {new Date().getFullYear()} PT Widatra Bhakti. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;