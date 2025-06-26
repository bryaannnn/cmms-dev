import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../routes/AuthContext";
import { FiLock, FiCheck, FiX, FiArrowLeft, FiEye, FiEyeOff, FiAlertCircle, FiInfo } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

const ChangePasswordPage: React.FC = () => {
  const { changePassword } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
    general: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
        general: "",
      }));
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPassword) => {
    setShowPassword((prev) => ({
      ...prev,
      [field]: !prev[field],
    }));
  };

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
      general: "",
    };

    if (!formData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
      valid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = "New password is required";
      valid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
      valid = false;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSuccessMessage("");

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setSuccessMessage("Your password has been changed successfully!");

      // Reset form on success
      setFormData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      // Clear any previous errors
      setErrors({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
        general: "",
      });
    } catch (error: any) {
      console.error("Password change error:", error);
      setErrors((prev) => ({
        ...prev,
        general: error.message || "Failed to change password. Please try again.",
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex items-center">
        <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-gray-100 mr-4">
          <FiArrowLeft className="text-xl text-gray-700" />
        </motion.button>
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Change Password</h1>
          <p className="text-sm text-gray-500">Update your account password</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="bg-white rounded-xl shadow-sm p-6 border border-blue-100">
          <div className="mb-6">
            <div className="flex items-center mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                <FiLock className="text-blue-600 text-lg" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Password Update</h2>
            </div>
            <p className="text-gray-600 text-sm">Please enter your current password and set a new one.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {errors.general && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-red-50 border-l-4 border-red-500 p-4 rounded flex items-start">
                  <FiAlertCircle className="text-red-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-red-700 font-medium">Error</p>
                    <p className="text-red-600 text-sm">{errors.general}</p>
                  </div>
                </motion.div>
              )}

              {successMessage && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="bg-green-50 border-l-4 border-green-500 p-4 rounded flex items-start">
                  <FiCheck className="text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-green-700 font-medium">Success</p>
                    <p className="text-green-600 text-sm">{successMessage}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Current Password */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.current ? "text" : "password"}
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${errors.currentPassword ? "border-red-300" : "border-gray-300"} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("current")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.current ? "Hide password" : "Show password"}
                >
                  {showPassword.current ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.currentPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.currentPassword}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.new ? "text" : "password"}
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${errors.newPassword ? "border-red-300" : "border-gray-300"} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.new ? "Hide password" : "Show password"}
                >
                  {showPassword.new ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>

              {/* Simple Password Requirement */}
              <div className="mt-3 bg-blue-50 p-3 rounded-md">
                <p className="text-xs font-medium text-gray-700 mb-1 flex items-center">
                  <FiInfo className="mr-1 text-blue-500" /> Password requirement:
                </p>
                <p className="text-xs text-gray-600">Must be at least 8 characters long</p>
              </div>

              {errors.newPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.newPassword}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword.confirm ? "text" : "password"}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full border ${errors.confirmPassword ? "border-red-300" : "border-gray-300"} rounded-md px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility("confirm")}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                  aria-label={showPassword.confirm ? "Hide password" : "Show password"}
                >
                  {showPassword.confirm ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FiAlertCircle className="mr-1" /> {errors.confirmPassword}
                </p>
              )}
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
              <motion.button
                type="button"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate(-1)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={isSubmitting || formData.newPassword.length < 8 || formData.newPassword !== formData.confirmPassword}
                className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:hover:bg-blue-600 flex items-center ${isSubmitting ? "opacity-75" : ""}`}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  <>
                    <FiLock className="mr-2" />
                    Update Password
                  </>
                )}
              </motion.button>
            </div>
          </form>
        </motion.div>

        {/* Simple Security Tips */}
        <div className="mt-6 bg-white rounded-xl shadow-sm p-6 border border-blue-100">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <FiInfo className="text-blue-500 mr-2" /> Security Tip
          </h3>
          <p className="text-sm text-gray-600">Choose a password that's easy for you to remember but hard for others to guess. Avoid using common words or personal information.</p>
        </div>
      </main>
    </div>
  );
};

export default ChangePasswordPage;
