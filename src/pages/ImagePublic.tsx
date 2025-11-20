import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../component/Sidebar";
import PageHeader from "../component/PageHeader";
import { getProjectEnvVariables } from "../shared/projectEnvVariables";
import { Image, FilePlus2, User as UserIcon, Building, Hourglass, MapPin } from "lucide-react";
import { useAuth, GenbaWorkAreas, LayoutInterface } from "../routes/AuthContext";

type AreaDetail = GenbaWorkAreas & {
  existingLayouts: LayoutInterface[];
};

const getFotoUrl = (filePath: string): string => {
  const projectEnvVariables = getProjectEnvVariables();

  if (!filePath.startsWith("http")) {
    return `${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}/${filePath}`;
  }
  return filePath;
};

const ImagePublic: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getGenbaAreas2 } = useAuth();

  const [areaData, setAreaData] = useState<AreaDetail | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const loadAreaData = useCallback(async () => {
    if (!id) {
      setError("Area ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const genbaAreas = await getGenbaAreas2();
      const area = genbaAreas.find((area) => area.id.toString() === id);

      if (!area) {
        setError("Area not found.");
        setLoading(false);
        return;
      }

      const layouts: LayoutInterface[] = area.attachment || [];

      setAreaData({
        ...area,
        existingLayouts: layouts,
      });
    } catch (err) {
      setError("Failed to load area data.");
      setAreaData(null);
    } finally {
      setLoading(false);
    }
  }, [id, getGenbaAreas2]);

  useEffect(() => {
    loadAreaData();
  }, [loadAreaData]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) setSidebarOpen(false);
    };
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const areaName = areaData?.name || "-";
  const department = areaData?.department?.name || "-";
  const picName = areaData?.pic?.name || "-";
  const picAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(picName)}`;

  const isDefault = areaData?.is_default ?? false;
  const typeLabel = isDefault ? "Daily Reports" : "Bebas Lapor";

  const layouts = areaData?.existingLayouts.map((l) => getFotoUrl(l.path)).filter(Boolean) || [];

  const handleCreateReport = () => {
    if (areaData?.id) {
      navigate(`/genba/genbaactivity/formgenbaactivity?area=${areaData.id}`);
    } else {
      console.error("Area ID is not available for report creation.");
      navigate("/genba/genbaactivity/formgenbaactivity");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-50">
        <Hourglass className="animate-spin mr-2 h-10 w-10 text-blue-500" />
        <p className="text-xl text-gray-700">Loading data area...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gray-50 p-4">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Error</h1>
        <p className="text-lg text-gray-700">{error}</p>
        <motion.button
          onClick={() => navigate("/genba/genbaarea")}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-6 flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all"
        >
          Back to Areas
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />

      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <PageHeader mainTitle="Genba" mainTitleHighlight="Area Information" description="View public Genba area details" icon={<Image />} isMobile={isMobile} toggleSidebar={toggleSidebar} />

        <main>
          <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Image size={28} className="text-blue-600" />
                Detail Area: {areaName}
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-xl overflow-hidden p-6 md:p-8 border border-blue-50">
              <div className="flex items-start space-x-6 mb-8">
                <div className="flex-shrink-0">
                  <img
                    src={picAvatar}
                    alt={picName}
                    className="w-24 h-24 object-cover rounded-full border-4 border-blue-100 shadow-md"
                    onError={(e) => {
                      (e.target as HTMLImageElement).onerror = null;
                      (e.target as HTMLImageElement).src = "https://ui-avatars.com/api/?name=" + encodeURIComponent(picName);
                    }}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="h-6 w-6 text-red-500" />
                    {areaName}
                  </h2>
                  <div className="text-gray-600 flex items-center gap-2 text-lg">
                    <Building className="h-5 w-5 text-gray-500" />
                    <span className="font-semibold">{department}</span>
                  </div>
                  <div className="text-gray-600 flex items-center gap-2 text-lg">
                    <UserIcon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium">{picName} (PIC)</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4 mb-6">
                <div className="text-gray-600 flex items-center gap-2 text-md">
                  <FilePlus2 className="h-4 w-4 text-gray-500" />
                  <span className="font-medium">Tipe Pelaporan:</span>
                  <span className="font-semibold">{typeLabel}</span>
                </div>
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              <h3 className="text-lg font-bold text-gray-800 mb-3">Layout Area</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {layouts.length > 0 ? (
                  layouts.map((img, i) => (
                    <div key={i} className="bg-gray-50 p-3 rounded-xl border border-gray-200 shadow-sm">
                      <img
                        src={img}
                        alt={`Layout ${i + 1}`}
                        className="w-full h-auto rounded-lg" // Menggunakan h-auto untuk mempertahankan rasio aspek
                      />
                      <p className="mt-2 text-sm text-gray-600 text-center">{`Layout Area ${i + 1}`}</p>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 bg-gray-50 rounded-lg border border-dashed border-gray-300 text-gray-500">No layout image available.</div>
                )}
              </div>

              <div className="border-t border-gray-200 my-6"></div>

              <div className="flex justify-center">
                <motion.button
                  onClick={handleCreateReport}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white text-lg rounded-xl shadow-md hover:bg-blue-700 transition-all"
                  disabled={!areaData}
                >
                  <FilePlus2 size={20} />
                  Buat Laporan Genba
                </motion.button>
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default ImagePublic;
