import React, { useState } from "react";
import { useAuth } from "../routes/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try { 
      await login(email, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4">
      <div className="w-full max-w-md">
        <form
          onSubmit={handleSubmit}
          className="relative w-full bg-white rounded-lg shadow-sm border border-gray-100 p-8
                     sm:p-10 md:p-12"
          aria-label="Login Form"
        >
          {/* Logo */}
          <div className="flex justify-center mb-8">
            <div className="flex items-center space-x-2">
              <div className="rounded-lg flex items-center justify-center">
                <img src={logoWida} alt="Logo Wida" className="h-20 w-auto" />
              </div>
              <span className="text-2xl font-bold text-blue-800 italic">
                PT WIDATRA BHAKTI
              </span>
            </div>
          </div>

          <h2 className="text-2xl font-semibold text-gray-800 mb-2 text-center">
            Secure Portal Login
          </h2>
          <p className="text-sm text-gray-500 text-center mb-8">
            Restricted access for authorized personnel only
          </p>

          {error && (
            <div
              role="alert"
              className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-md flex items-start"
            >
              <svg
                className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Work Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300
                           focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                           transition-colors"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Password
                </label>
                <a
                  href="/forgot-password"
                  className="text-xs text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Forgot password?
                </a>
              </div>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full px-4 py-2.5 text-sm rounded-md border border-gray-300
                           focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500
                           transition-colors"
              />
            </div>

            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="remember-me"
                className="ml-2 block text-sm text-gray-700"
              >
                Remember this device
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2.5 px-4 rounded-md text-sm font-medium
                         transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                         ${
                           isSubmitting
                             ? "bg-blue-400 text-white cursor-not-allowed"
                             : "bg-blue-600 text-white hover:bg-blue-700"
                         }
                         flex items-center justify-center`}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Log In"
              )}
            </button>
            <p className="text-sm text-center mt-4">
              Belum punya akun?{" "}
              <Link to="/register" className="text-blue-500 hover:underline">
                Daftar di sini
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-5 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              © {new Date().getFullYear()} PT Widatra Bhakti. All rights
              reserved.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginForm;
