import React, { useState, useEffect } from "react";
import { useAuth } from "../routes/AuthContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

const greetings = ["Hello", "Bonjour", "Holla", "こんにちは ", "Salam", "안녕하세요", "Hallo", "Namaste", "早上好"];

const LoginForm: React.FC = () => {
  const [nik, setNik] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Deklarasi state untuk sapaan hanya SATU KALI di sini
  const [currentGreeting, setGreeting] = useState(greetings[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Timer untuk animasi mount komponen
    setIsMounted(true);

    // Perbaikan: Tambahkan tipe data number untuk timeoutId agar tidak ada error TypeScript
    let timeoutId: number;

    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      timeoutId = setTimeout(() => {
        setGreeting((current) => {
          const currentIndex = greetings.indexOf(current);
          const nextIndex = (currentIndex + 1) % greetings.length;
          return greetings[nextIndex];
        });
        setIsTransitioning(false);
      }, 500);
    }, 3000);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Objek style dasar untuk elemen h1
  const baseStyle: React.CSSProperties = {
    fontSize: "3rem",
    fontFamily: "sans-serif",
    // color: "#333",
    transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
  };

  // Objek style dinamis berdasarkan state isTransitioning
  const dynamicStyle: React.CSSProperties = isTransitioning ? { opacity: 0, transform: "translateY(-20px)" } : { opacity: 1, transform: "translateY(0)" };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(nik, password);
      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4 font-sans">
      <div
        className={`flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden
                    transform transition-all duration-700 ease-out ${isMounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className={`flex items-center space-x-2 mb-8 transition-opacity duration-700 ease-out delay-200 ${isMounted ? "opacity-100" : "opacity-0"}`}>
            <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
            <span className="text-xl font-bold text-blue-800 italic">PT WIDATRA BHAKTI</span>
          </div>

          <h1 style={{ ...baseStyle, ...dynamicStyle }} className={`text-3xl font-bold transition-opacity duration-700 ease-out delay-300 ${isMounted ? "opacity-100" : "opacity-0"}`}>
            {currentGreeting}
          </h1>
          <h1 className="text-5xl font-bold mb-2 transition-opacity duration-700 ease-out delay-300 font-sans">Welcome Back</h1>

          <p className={`text-gray-600 mb-8 transition-opacity duration-700 ease-out delay-400 ${isMounted ? "opacity-100" : "opacity-0"}`}>Hey, welcome back to your special place</p>

          {error && (
            <div role="alert" className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-md flex items-start animate-fade-in">
              <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6" aria-label="Login Form">
            <div className={`transition-all duration-500 ease-out delay-500 ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"}`}>
              <label htmlFor="nik" className="block text-sm font-medium text-gray-700 mb-1">
                NIK
              </label>
              <input
                id="nik"
                type="text"
                placeholder="Masukkan NIK Anda (16 digit)"
                value={nik}
                onChange={(e) => setNik(e.target.value)}
                required
                autoComplete="off"
                className="w-full px-4 py-3 text-base rounded-md border border-gray-300
                          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md
                          transition-all duration-300 ease-in-out"
              />
            </div>

            <div className={`transition-all duration-500 ease-out delay-600 ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"}`}>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-3 text-base rounded-md border border-gray-300
                            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:shadow-md
                            transition-all duration-300 ease-in-out pr-10"
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700 transition-colors duration-200"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <a href="/forgot-password" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-all duration-200">
                  Forgot Password?
                </a>
              </div>
            </div>

            <div className={`flex items-center transition-all duration-500 ease-out delay-700 ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"}`}>
              <input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-all duration-200" />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 px-4 rounded-md text-base font-medium
                          transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                          ${isSubmitting ? "bg-blue-400 text-white cursor-not-allowed" : "bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transform hover:-translate-y-0.5"}
                          flex items-center justify-center
                          ${isMounted ? "translate-y-0 opacity-100 delay-800" : "translate-y-5 opacity-0"}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </button>
          </form>

          <p className={`text-sm text-center mt-6 transition-opacity duration-700 ease-out delay-900 ${isMounted ? "opacity-100" : "opacity-0"}`}>
            Don't have an account?{" "}
            <Link to="#" className="text-blue-500 hover:text-blue-700 hover:underline transition-all duration-200">
              Report to IT Department
            </Link>
          </p>

          <div className="mt-8 pt-5 border-t border-gray-100 text-center">
            <p className={`text-xs text-gray-500 transition-opacity duration-700 ease-out delay-1000 ${isMounted ? "opacity-100" : "opacity-0"}`}>© {new Date().getFullYear()} PT Widatra Bhakti. All rights reserved.</p>
          </div>
        </div>

        <div
          className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-aqua-800 items-center justify-center relative p-8
                      transform transition-all duration-700 ease-out delay-300 ${isMounted ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          <div className="absolute top-1/4 left-1/4 bg-white opacity-20 w-32 h-16 rounded-full blur-md animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 bg-white opacity-20 w-48 h-24 rounded-full blur-md animate-float-delay"></div>
          <div className="absolute top-8 right-8 bg-white opacity-20 w-24 h-12 rounded-full blur-md animate-float-fast"></div>

          <div className="relative w-64 h-96 bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center p-4 transform scale-100 hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="absolute top-0 w-16 h-2 bg-gray-700 rounded-b-lg"></div>
            <div className="text-purple-300 animate-pulse-light">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 1C5.925 1 1 5.925 1 12s4.925 11 11 11 11-4.925 11-11S18.075 1 12 1zm0 20c-4.963 0-9-4.037-9-9s4.037-9 9-9 9 4.037 9 9-4.037 9-9 9zM10.5 7h3v3h-3V7zm-2 2h3v3h-3V9zm4 0h3v3h-3V9zm-2 2h3v3h-3v-3zm-2 2h3v3h-3v-3zm4 0h3v3h-3v-3zm-2 2h3v3h-3v-3z" />
              </svg>
            </div>
            <div className="absolute bottom-10 left-0 right-0 text-center text-white text-sm">
              <div className="w-3/4 mx-auto bg-gray-700 rounded-full h-1 mb-2">
                <div className="bg-purple-300 h-1 rounded-full w-2/3 animate-progress-fill"></div>
              </div>
              <p>Please enter your fingerprint to continue</p>
            </div>
          </div>

          <div className="absolute bottom-1/4 right-1 /4 bg-white opacity-80 rounded-2xl p-6 shadow-xl transform scale-95 hover:scale-100 transition-transform duration-300 ease-in-out">
            <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.243 2 7 4.243 7 7v4H6c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v4h-6V7c0-1.654 1.346-3 3-3zM6 13h12v7H6v-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
