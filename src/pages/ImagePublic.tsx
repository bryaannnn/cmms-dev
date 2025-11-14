import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../component/Sidebar";
import PageHeader from "../component/PageHeader";
import { Image, FilePlus2 } from "lucide-react";

const ImagePage: React.FC = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = React.useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = React.useState(window.innerWidth < 768);

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
        <PageHeader mainTitle="Genba" mainTitleHighlight="Image" description="View related image and navigate to Genba Activity Form" icon={<Image />} isMobile={isMobile} toggleSidebar={toggleSidebar} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-gradient-to-r from-blue-600 to-blue-800 rounded-2xl p-6 text-white mb-6 shadow-lg">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome to Genba Area ****</h1>
            <p className="opacity-90 text-sm">Access your Genba form and visualize activity areas</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-white rounded-2xl shadow-md p-6 border border-blue-50 flex flex-col items-center justify-center text-center"
          >
            <motion.img
              src="https://images.unsplash.com/photo-1503387762-592deb58ef4e"
              alt="Genba Illustration"
              className="w-full max-w-xl rounded-2xl shadow-md mb-8 object-cover"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
            <motion.button
              onClick={() => navigate("/genba/genbaactivity/formgenbaactivity")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all"
            >
              <FilePlus2 size={20} />
              Go to Form Genba Activity
            </motion.button>
          </motion.div>
        </main>
      </div>
    </div>
  );    
};

export default ImagePage;
