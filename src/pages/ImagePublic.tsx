import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../component/Sidebar";
import PageHeader from "../component/PageHeader";
import { Image, FilePlus2 } from "lucide-react";

const ImagePublic: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

  const areaName = "Ruang 1";
  const department = "Information and Technology";
  const picName = "My Name";
  const picAvatar = "https://randomuser.me/api/portraits/men/12.jpg";

  const isDefault = true;
  const typeLabel = isDefault ? "Daily Reports" : "Bebas Lapor";

  const layouts = ["https://via.placeholder.com/800x500?text=Layout+Area+1", "https://via.placeholder.com/800x500?text=Layout+Area+2"];

  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  return (
    <div className="flex h-screen font-sans antialiased bg-blue-50 text-gray-900">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader mainTitle="Genba" mainTitleHighlight="Area Information" description="View public Genba area details" icon={<Image />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Informasi Area</h1>
            <p className="opacity-90 text-sm">Detail area dan visual layout</p>
          </motion.div>

          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: "easeOut" }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-50">
            <h2 className="text-xl font-bold text-gray-800 mb-6">Penanggung Jawab</h2>

            <div className="w-full flex flex-col items-center mb-8">
              <img src={picAvatar} alt="PIC" className="w-32 h-44 object-cover rounded-xl shadow" />
              <p className="mt-3 text-lg font-semibold text-gray-800">{picName}</p>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <h2 className="text-xl font-bold text-gray-800 mb-4">Informasi Area</h2>

            <div className="space-y-4 text-gray-700 text-base">
              <div className="flex justify-between">
                <span>Nama Area:</span>
                <span className="font-semibold">{areaName}</span>
              </div>

              <div className="flex justify-between">
                <span>Department:</span>
                <span className="font-semibold">{department}</span>
              </div>

              <div className="flex justify-between">
                <span>Tipe Area:</span>
                <span className="font-semibold">{typeLabel}</span>
              </div>
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <h3 className="text-lg font-bold text-gray-800 mb-3">Layout Area</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {layouts.map((img, i) => (
                <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
                  <img src={img} alt={`Layout ${i + 1}`} className="w-full h-56 object-cover rounded-lg" />
                  <p className="mt-2 text-sm text-gray-600 text-center">{`Layout Area ${i + 1}`}</p>
                </div>
              ))}
            </div>

            <div className="border-t border-gray-200 my-6"></div>

            <div className="flex justify-center">
              <motion.button
                onClick={() => navigate("/genba/genbaactivity/formgenbaactivity")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all"
              >
                <FilePlus2 size={20} />
                Go to Form Genba Activity
              </motion.button>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default ImagePublic;
