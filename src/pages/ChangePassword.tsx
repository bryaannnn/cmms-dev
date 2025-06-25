import React, { useState } from "react";
import { FiArrowLeft, FiSave, FiX, FiCheck, FiUser } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";

const ChangePasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const { changePassword, user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoBack = () => navigate("/settings");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword !== confirmNewPassword) {
      setError("New password and confirmation do not match.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setSuccess("Password updated successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
    } catch (err: any) {
      setError(err.message || "Failed to update password. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const SettingCard: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-blue-100">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">{title}</h3>
      {children}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen font-sans bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-blue-100 p-4 flex items-center justify-between shadow-sm flex-shrink-0">
        <div className="flex items-center space-x-3">
          <button onClick={handleGoBack} className="p-2 rounded-full text-gray-600 hover:bg-blue-50 transition-colors duration-200" aria-label="Go back to settings">
            <FiArrowLeft className="text-xl" />
          </button>
          <h2 className="text-xl md:text-2xl font-semibold text-blue-600">Change Password</h2>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          {user?.avatar ? (
            <img src={user.avatar} alt="User Avatar" className="w-8 h-8 rounded-full border border-blue-200 object-cover" />
          ) : (
            <div className="w-8 h-8 rounded-full border border-blue-200 bg-blue-100 flex items-center justify-center">
              <FiUser className="text-blue-500 text-base" />
            </div>
          )}
          <span className="font-medium text-gray-900 hidden sm:inline">{user?.name || "User"}</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        <div className="w-full max-w-md mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 md:text-4xl">Change Password</h1>
            <p className="text-gray-600 text-base md:text-lg">Update your account password for enhanced security.</p>
          </div>

          <SettingCard title="Update Your Password">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="current-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  id="current-password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div>
                <label htmlFor="new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  id="new-password"
                  autoComplete="new-password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label htmlFor="confirm-new-password" className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  id="confirm-new-password"
                  autoComplete="new-password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  required
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>

              {error && (
                <div className="flex items-center space-x-2 text-red-600 text-sm p-3 bg-red-50 rounded-md border border-red-200">
                  <FiX className="flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}
              {success && (
                <div className="flex items-center space-x-2 text-green-600 text-sm p-3 bg-green-50 rounded-md border border-green-200">
                  <FiCheck className="flex-shrink-0" />
                  <span>{success}</span>
                </div>
              )}

              <div className="flex justify-end space-x-3 mt-6">
                <button type="button" onClick={handleGoBack} className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center space-x-2 transition-colors duration-200">
                  <FiX />
                  <span>Cancel</span>
                </button>
                <button type="submit" disabled={isLoading} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 transition-colors duration-200">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Updating...</span>
                    </>
                  ) : (
                    <>
                      <FiSave />
                      <span>Save Changes</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </SettingCard>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
