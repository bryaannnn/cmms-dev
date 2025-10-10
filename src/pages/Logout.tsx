import { useState, useEffect } from "react";
import { useAuth } from "../routes/AuthContext";
import { Link } from "react-router-dom";
import logoWida from "../assets/logo-wida.png";
import { FiLogOut, FiArrowLeft, FiHome } from "react-icons/fi";

// Membuat array sapaan untuk konsistensi, meskipun hanya muncul di LoginForm.tsx,
// kita tetap bisa menggunakannya atau membuat elemen header yang sangat mirip.
const greetings = ["Logout", "Sign Out", "Sampai Jumpa", "Au Revoir", "Sayonara"];

const Logout = () => {
  const { logout, isLoggingOut } = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  // State untuk animasi sapaan (hanya untuk konsistensi visual)
  const [currentGreeting] = useState(greetings[0]);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Karena ini adalah Logout, kita bisa membuat animasi transisi satu kali saja
  useEffect(() => {
    setIsMounted(true);

    // Simulasi transisi header/greeting (walau tidak berganti-ganti)
    let timeoutId: number;
    setIsTransitioning(true);
    timeoutId = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // Objek style dasar untuk elemen h1 (sama persis dengan LoginForm.tsx)
  const baseStyle: React.CSSProperties = {
    fontSize: "3rem",
    fontFamily: "sans-serif",
    transition: "opacity 0.5s ease-in-out, transform 0.5s ease-in-out",
  };

  // Objek style dinamis berdasarkan state isTransitioning (sama persis dengan LoginForm.tsx)
  const dynamicStyle: React.CSSProperties = isTransitioning ? { opacity: 0, transform: "translateY(-20px)" } : { opacity: 1, transform: "translateY(0)" };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      setError("Failed to logout. Please try again.");
      console.error("Logout error:", error);
    }
  };

  const handleCancel = () => {
    window.history.back();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-blue-50 p-4 font-sans">
      <div
        className={`flex flex-col lg:flex-row w-full max-w-6xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden
                    transform transition-all duration-700 ease-out ${isMounted ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"}`}
      >
        {/* Left Side - Content (Sama dengan LoginForm.tsx) */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          <div className={`flex items-center space-x-2 mb-8 transition-opacity duration-700 ease-out delay-200 ${isMounted ? "opacity-100" : "opacity-0"}`}>
            <img src={logoWida} alt="Logo Wida" className="h-10 w-auto" />
            <span className="text-xl font-bold text-blue-800 italic">PT WIDATRA BHAKTI</span>
          </div>

          <h1 style={{ ...baseStyle, ...dynamicStyle }} className={`text-3xl font-bold transition-opacity duration-700 ease-out delay-300 ${isMounted ? "opacity-100" : "opacity-0"}`}>
            {currentGreeting}
          </h1>
          <h1 className="text-5xl font-bold mb-2 transition-opacity duration-700 ease-out delay-300 font-sans">See You Soon!</h1>

          <p className={`text-gray-600 mb-8 transition-opacity duration-700 ease-out delay-400 ${isMounted ? "opacity-100" : "opacity-0"}`}>Thank you for your hard work today. We hope to see you back soon.</p>

          {isLoggingOut ? (
            <>
              {/* Loading State - Disesuaikan agar sangat mirip dengan style submit button di LoginForm */}
              <div className={`text-center transition-all duration-500 ease-out delay-500 ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"}`}>
                <button
                  type="button"
                  disabled={true}
                  className={`w-full py-3 px-4 rounded-md text-base font-medium bg-blue-400 text-white cursor-not-allowed
                              transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
                              flex items-center justify-center`}
                >
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Securing Session & Logging Out...
                </button>
              </div>
            </>
          ) : (
            <>
              {error && (
                <div role="alert" className="mb-6 text-sm text-red-700 bg-red-50 border border-red-100 px-4 py-3 rounded-md flex items-start animate-fade-in">
                  <svg className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              {/* Action Buttons - Layout dan Animasi Mirip dengan Input/Button di LoginForm */}
              <div className={`space-y-4 transition-all duration-500 ease-out delay-500 ${isMounted ? "translate-x-0 opacity-100" : "-translate-x-5 opacity-0"}`}>
                <button
                  onClick={handleLogout}
                  className={`w-full py-3 px-4 rounded-md text-base font-medium
                            transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500
                            bg-red-600 text-white hover:bg-red-700 active:bg-red-800 transform hover:-translate-y-0.5
                            flex items-center justify-center`}
                >
                  <FiLogOut className="mr-2" />
                  Yes, Sign Out Now
                </button>

                <div className="flex justify-center transition-all duration-500 ease-out delay-600">
                  <button
                    onClick={handleCancel}
                    className="inline-flex items-center justify-center px-6 py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 
                              transition-all duration-300 ease-in-out font-medium hover:text-gray-800"
                  >
                    <FiArrowLeft className="mr-2" />
                    No, Stay Logged In
                  </button>
                </div>
              </div>

              {/* Back to Dashboard Link - Mirip dengan "Don't have an account?" di LoginForm */}
              <p className={`text-sm text-center mt-6 transition-opacity duration-700 ease-out delay-700 ${isMounted ? "opacity-100" : "opacity-0"}`}>
                Not finished yet?{" "}
                <Link to="/dashboard" className="text-blue-500 hover:text-blue-700 hover:underline transition-all duration-200">
                  <span className="inline-flex items-center">
                    <FiHome className="mr-1 h-4 w-4" /> Back to Dashboard
                  </span>
                </Link>
              </p>
            </>
          )}

          {/* Footer - Consistent Styling and Animation */}
          <div className="mt-8 pt-5 border-t border-gray-100 text-center">
            <p className={`text-xs text-gray-500 transition-opacity duration-700 ease-out delay-800 ${isMounted ? "opacity-100" : "opacity-0"}`}>© {new Date().getFullYear()} PT Widatra Bhakti. All rights reserved.</p>
          </div>
        </div>

        {/* Right Side - Graphics (Sama persis dengan LoginForm.tsx) */}
        <div
          className={`hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-500 to-aqua-800 items-center justify-center relative p-8
                      transform transition-all duration-700 ease-out delay-300 ${isMounted ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
        >
          {/* Animated Background Elements - Consistent Styling */}
          <div className="absolute top-1/4 left-1/4 bg-white opacity-20 w-32 h-16 rounded-full blur-md animate-float"></div>
          <div className="absolute bottom-1/3 right-1/4 bg-white opacity-20 w-48 h-24 rounded-full blur-md animate-float-delay"></div>
          <div className="absolute top-8 right-8 bg-white opacity-20 w-24 h-12 rounded-full blur-md animate-float-fast"></div>

          {/* Main Illustration (Menggunakan style dan warna seperti di LoginForm.tsx) */}
          <div className="relative w-64 h-96 bg-gray-800 rounded-3xl shadow-xl flex items-center justify-center p-4 transform scale-100 hover:scale-105 transition-transform duration-300 ease-in-out">
            <div className="absolute top-0 w-16 h-2 bg-gray-700 rounded-b-lg"></div>

            {/* Ikon Kunci atau Pintu Keluar yang menggunakan warna ungu/biru muda yang sama */}
            <div className="text-purple-300 animate-pulse-light">
              <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 12c0-1.104-.896-2-2-2h-1V7c0-2.757 2.243-5 5-5s5 2.243 5 5v3c0 1.104-.896 2-2 2h-1v2h2c1.104 0 2 .896 2 2v7c0 1.104-.896 2-2 2H6c-1.104 0-2-.896-2-2v-7c0-1.104.896-2 2-2h2v-2h-1c-1.104 0-2-.896-2-2V7c0-2.757 2.243-5 5-5s5 2.243 5 5v3h-1c-1.104 0-2 .896-2 2zM6 14v7h12v-7H6z" />
              </svg>
            </div>

            <div className="absolute bottom-10 left-0 right-0 text-center text-white text-sm">
              <div className="w-3/4 mx-auto bg-gray-700 rounded-full h-1 mb-2">
                <div className="bg-purple-300 h-1 rounded-full w-2/3 animate-progress-fill"></div>
              </div>
              <p>Security check on exit completed</p>
            </div>
          </div>

          {/* Security Badge (Matching LoginForm.tsx structure and scale effect) */}
          <div className="absolute bottom-1/4 right-1/4 bg-white opacity-80 rounded-2xl p-6 shadow-xl transform scale-95 hover:scale-100 transition-transform duration-300 ease-in-out">
            <svg className="w-16 h-16 text-gray-800" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C9.243 2 7 4.243 7 7v4H6c-1.103 0-2 .897-2 2v7c0 1.103.897 2 2 2h12c1.103 0 2-.897 2-2v-7c0-1.103-.897-2-2-2h-1V7c0-2.757-2.243-5-5-5zm0 2c1.654 0 3 1.346 3 3v4h-6V7c0-1.654 1.346-3 3-3zM6 13h12v7H6v-7z" />
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Logout;
