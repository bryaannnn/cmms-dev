import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, MapPin, User, Calendar, ChevronLeft, ChevronRight, X, Save, Trash2, CheckCircle, AlertCircle, Users, BarChart3, Eye, Download, Filter, Search, ArrowLeft } from "lucide-react";
import Sidebar from "../../../component/Sidebar";
import PageHeader from "../../../component/PageHeader";
import { useAuth } from "../../../routes/AuthContext";

interface DailyActivity {
  id: string;
  nama: string;
  nip: string;
  department: string;
  komite5s: string;
  tanggal: string;
  area: string;
  penanggungJawabArea: string;
  keterangan: string;
  fotoLampiran: string[];
  createdAt: string;
  status: "completed" | "pending" | "rejected";
  score?: number;
}

interface AreaKerja {
  id: string;
  nama: string;
  penanggungJawab: string;
  pengawas: string;
  gambar3d: string;
  department: string;
}

interface UserRole {
  id: string;
  name: string;
  level: number;
}

interface ExtendedUser {
  id?: string;
  name?: string;
  nip?: string;
  department?: string;
  department_name?: string;
  role?: string;
  level?: number;
}

const GenbaAction: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const extendedUser = user as ExtendedUser | null;

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState<DailyActivity[]>([]);
  const [areas, setAreas] = useState<AreaKerja[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [fotoLampiran, setFotoLampiran] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"karyawan" | "komite" | "penanggungjawab" | "management">("management");
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [detailView, setDetailView] = useState<{ type: "karyawan" | "area"; data: any } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const userRoles: UserRole[] = [
    { id: "karyawan", name: "Karyawan", level: 1 },
    { id: "komite", name: "Komite Department", level: 2 },
    { id: "penanggungjawab", name: "Penanggung Jawab Area", level: 3 },
    { id: "management", name: "Management", level: 4 },
  ];

  // Data Dummy Areas
  const dummyAreas: AreaKerja[] = [
    {
      id: "1",
      nama: "Area Produksi Line A",
      penanggungJawab: "Budi Santoso",
      pengawas: "Ahmad Wijaya",
      gambar3d: "/api/placeholder/400/300",
      department: "Produksi",
    },
    {
      id: "2",
      nama: "Area Produksi Line B",
      penanggungJawab: "Joko Widodo",
      pengawas: "Ahmad Wijaya",
      gambar3d: "/api/placeholder/400/300",
      department: "Produksi",
    },
    {
      id: "3",
      nama: "Area Gudang Bahan Baku",
      penanggungJawab: "Siti Rahayu",
      pengawas: "Dewi Sartika",
      gambar3d: "/api/placeholder/400/300",
      department: "Gudang",
    },
    {
      id: "4",
      nama: "Area Gudang Finished Goods",
      penanggungJawab: "Rina Melati",
      pengawas: "Dewi Sartika",
      gambar3d: "/api/placeholder/400/300",
      department: "Gudang",
    },
    {
      id: "5",
      nama: "Area Kantor HRD",
      penanggungJawab: "Ari Wibowo",
      pengawas: "Maya Sari",
      gambar3d: "/api/placeholder/400/300",
      department: "Administrasi",
    },
    {
      id: "6",
      nama: "Area Kantor Accounting",
      penanggungJawab: "Dian Pertiwi",
      pengawas: "Maya Sari",
      gambar3d: "/api/placeholder/400/300",
      department: "Administrasi",
    },
    {
      id: "7",
      nama: "Area Maintenance",
      penanggungJawab: "Hendra Gunawan",
      pengawas: "Ahmad Wijaya",
      gambar3d: "/api/placeholder/400/300",
      department: "Engineering",
    },
    {
      id: "8",
      nama: "Area Quality Control",
      penanggungJawab: "Fitri Handayani",
      pengawas: "Dewi Sartika",
      gambar3d: "/api/placeholder/400/300",
      department: "Quality",
    },
  ];

  // Generate comprehensive dummy activities
  const generateDummyActivities = (): DailyActivity[] => {
    const activities: DailyActivity[] = [];
    const departments = ["Produksi", "Gudang", "Administrasi", "Engineering", "Quality"];
    const areas = dummyAreas;
    const employees = [
      { nama: "Budi Santoso", nip: "12345", department: "Produksi" },
      { nama: "Joko Widodo", nip: "12346", department: "Produksi" },
      { nama: "Siti Rahayu", nip: "12347", department: "Gudang" },
      { nama: "Rina Melati", nip: "12348", department: "Gudang" },
      { nama: "Ari Wibowo", nip: "12349", department: "Administrasi" },
      { nama: "Dian Pertiwi", nip: "12350", department: "Administrasi" },
      { nama: "Hendra Gunawan", nip: "12351", department: "Engineering" },
      { nama: "Fitri Handayani", nip: "12352", department: "Quality" },
      { nama: "Andi Pratama", nip: "12353", department: "Produksi" },
      { nama: "Maya Sari", nip: "12354", department: "Administrasi" },
    ];

    const startDate = new Date(2024, 0, 1); // 1 Januari 2024
    const endDate = new Date(); // Hari ini

    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      // Skip weekends (50% probability)
      if (date.getDay() === 0 || date.getDay() === 6 || Math.random() > 0.7) continue;

      const dailyEmployees = employees.filter(() => Math.random() > 0.3); // 70% employees work each day

      dailyEmployees.forEach((employee) => {
        const employeeAreas = areas.filter((area) => area.department === employee.department);
        if (employeeAreas.length === 0) return;

        const randomArea = employeeAreas[Math.floor(Math.random() * employeeAreas.length)];
        const status = Math.random() > 0.1 ? "completed" : "pending";
        const score = status === "completed" ? Math.floor(Math.random() * 30) + 70 : undefined;

        activities.push({
          id: `activity-${date.getTime()}-${employee.nip}`,
          nama: employee.nama,
          nip: employee.nip,
          department: employee.department,
          komite5s: `Komite5s ${employee.department}`,
          tanggal: date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
          }),
          area: randomArea.nama,
          penanggungJawabArea: randomArea.penanggungJawab,
          keterangan: Math.random() > 0.5 ? "Area sudah dibersihkan dan ditata sesuai standar 5S" : "Pengecekan rutin area kerja",
          fotoLampiran: ["/api/placeholder/300/200"],
          createdAt: date.toISOString(),
          status,
          score,
        });
      });
    }

    return activities;
  };

  useEffect(() => {
    // Set dummy data
    setAreas(dummyAreas);
    const dummyActivities = generateDummyActivities();
    setActivities(dummyActivities);

    // Simpan ke localStorage untuk persistensi
    localStorage.setItem("dailyActivities", JSON.stringify(dummyActivities));
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    localStorage.setItem("sidebarOpen", JSON.stringify(!sidebarOpen));
    setSidebarOpen((prev) => !prev);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const getCurrentArea = () => {
    return areas.find((area) => area.id === selectedArea);
  };

  const getFilteredActivities = () => {
    let filtered = activities;

    if (viewMode === "komite" && extendedUser?.department) {
      filtered = filtered.filter((activity) => activity.department === extendedUser.department);
    } else if (viewMode === "penanggungjawab") {
      const userAreas = areas.filter((area) => area.penanggungJawab === extendedUser?.name);
      filtered = filtered.filter((activity) => userAreas.some((area) => area.nama === activity.area));
    } else if (viewMode === "karyawan") {
      filtered = filtered.filter((activity) => activity.nip === extendedUser?.nip);
    }

    if (selectedDepartment) {
      filtered = filtered.filter((activity) => activity.department === selectedDepartment);
    }

    // Filter search
    if (searchTerm) {
      filtered = filtered.filter((activity) => activity.nama.toLowerCase().includes(searchTerm.toLowerCase()) || activity.area.toLowerCase().includes(searchTerm.toLowerCase()) || activity.nip.includes(searchTerm));
    }

    return filtered;
  };

  const getDepartmentScore = (department: string, month: number, year: number) => {
    const departmentActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.createdAt);
      return activity.department === department && activityDate.getMonth() === month && activityDate.getFullYear() === year;
    });

    const totalDays = new Date(year, month + 1, 0).getDate();
    const uniqueDays = new Set(departmentActivities.map((activity) => activity.tanggal)).size;
    const score = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0;
    return Math.min(score, 100);
  };

  const getMonthlyScore = (month: number, year: number) => {
    const monthActivities = getFilteredActivities().filter((activity) => {
      const activityDate = new Date(activity.createdAt);
      return activityDate.getMonth() === month && activityDate.getFullYear() === year;
    });

    const totalDays = new Date(year, month + 1, 0).getDate();
    const uniqueDays = new Set(monthActivities.map((activity) => activity.tanggal)).size;
    const score = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0;
    return Math.min(score, 100);
  };

  const getCurrentMonthScore = () => {
    const now = new Date();
    return getMonthlyScore(now.getMonth(), now.getFullYear());
  };

  const getEmployeeMonthlyScore = (nip: string, month: number, year: number) => {
    const employeeActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.createdAt);
      return activity.nip === nip && activityDate.getMonth() === month && activityDate.getFullYear() === year;
    });

    const totalDays = new Date(year, month + 1, 0).getDate();
    const uniqueDays = new Set(employeeActivities.map((activity) => activity.tanggal)).size;
    const score = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0;
    return Math.min(score, 100);
  };

  const getCalendarDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const filteredActivities = getFilteredActivities();

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      const dateStr = formatDate(date);
      const hasReport = filteredActivities.some((activity) => activity.tanggal === dateStr);
      days.push({
        date: i,
        hasReport,
        isToday: date.toDateString() === new Date().toDateString(),
      });
    }

    return days;
  };

  const initializeCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraOpen(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      alert("Tidak dapat mengakses kamera. Pastikan izin kamera telah diberikan.");
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0);
        const photoData = canvas.toDataURL("image/jpeg");
        setFotoLampiran((prev) => [...prev, photoData]);
      }
    }
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const removePhoto = (index: number) => {
    setFotoLampiran((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!selectedArea || fotoLampiran.length === 0) {
      alert("Area dan Lampiran Foto wajib diisi!");
      return;
    }

    const selectedAreaData = areas.find((area) => area.id === selectedArea);
    const newActivity: DailyActivity = {
      id: Date.now().toString(),
      nama: extendedUser?.name || "User",
      nip: extendedUser?.nip || "N/A",
      department: extendedUser?.department_name || extendedUser?.department || "Department",
      komite5s: `Komite5s ${extendedUser?.department || "Dept"}`,
      tanggal: formatDate(currentDate),
      area: selectedAreaData?.nama || "",
      penanggungJawabArea: selectedAreaData?.penanggungJawab || "",
      keterangan,
      fotoLampiran,
      createdAt: new Date().toISOString(),
      status: "completed",
      score: Math.floor(Math.random() * 30) + 70,
    };

    const updatedActivities = [...activities, newActivity];
    setActivities(updatedActivities);
    localStorage.setItem("dailyActivities", JSON.stringify(updatedActivities));

    setSelectedArea("");
    setKeterangan("");
    setFotoLampiran([]);
    setShowForm(false);

    alert("Laporan berhasil disimpan!");
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      rejected: "bg-red-100 text-red-800",
    };

    const labels = {
      completed: "Selesai",
      pending: "Menunggu",
      rejected: "Ditolak",
    };

    return <span className={`px-2 py-1 rounded-full text-xs font-medium ${styles[status as keyof typeof styles]}`}>{labels[status as keyof typeof labels]}</span>;
  };

  const getTodaysStatus = (nip: string) => {
    const today = formatDate(new Date());
    const todaysActivity = activities.find((activity) => activity.nip === nip && activity.tanggal === today);

    if (todaysActivity) {
      return getStatusBadge(todaysActivity.status);
    }

    return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Belum Lapor</span>;
  };

  const renderEmployeeDetail = (employee: any) => {
    const employeeActivities = activities.filter((a) => a.nip === employee.nip && new Date(a.createdAt).getMonth() === selectedMonth).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    const monthlyScore = getEmployeeMonthlyScore(employee.nip, selectedMonth, selectedYear);

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detail Laporan - {employee.nama}</h3>
            <p className="text-gray-600">
              NIP: {employee.nip} | Department: {employee.department}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Score Bulan Ini</p>
            <p className="text-2xl font-bold text-blue-900">{monthlyScore.toFixed(0)}%</p>
          </div>
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <p className="text-sm text-green-600 font-medium">Total Laporan</p>
            <p className="text-2xl font-bold text-green-900">{employeeActivities.length}</p>
          </div>
          <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
            <p className="text-sm text-orange-600 font-medium">Status Hari Ini</p>
            <div className="mt-1">{getTodaysStatus(employee.nip)}</div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Tanggal</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Area</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Keterangan</th>
              </tr>
            </thead>
            <tbody>
              {employeeActivities.map((activity) => (
                <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 text-sm">{activity.tanggal}</td>
                  <td className="py-3 text-sm">{activity.area}</td>

                  <td className="py-3">{getStatusBadge(activity.status)}</td>
                  <td className="py-3 text-sm max-w-xs truncate">{activity.keterangan}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    );
  };

  const renderKaryawanView = () => (
    <>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">{currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</h3>
          <div className="flex gap-2">
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
              <ChevronLeft size={16} className="text-gray-700" />
            </button>
            <button onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow">
              <ChevronRight size={16} className="text-gray-700" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 mb-4">
          {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
            <div key={day} className="text-center text-xs text-gray-500 font-medium">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-2">
          {getCalendarDays().map((day, index) => {
            const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).getDay();
            const colStart = index === 0 ? dayOfWeek + 1 : undefined;

            return (
              <motion.button
                key={day.date}
                onClick={() => {
                  const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
                  setCurrentDate(newDate);
                  setShowForm(true);
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all ${
                  day.isToday ? "bg-blue-600 text-white shadow-md" : day.hasReport ? "bg-green-100 text-green-800 border border-green-200" : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
                style={colStart ? { gridColumnStart: colStart } : undefined}
              >
                <span className="text-sm font-medium">{day.date}</span>
                {day.hasReport && <CheckCircle size={12} className="mt-1" />}
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Score Bulan Ini</p>
              <p className="text-2xl font-bold text-gray-900">{getCurrentMonthScore().toFixed(0)}%</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CheckCircle className="text-blue-600" size={24} />
            </div>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${getCurrentMonthScore()}%` }}></div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-md p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Laporan</p>
              <p className="text-2xl font-bold text-gray-900">{getFilteredActivities().length}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Calendar className="text-green-600" size={24} />
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-md p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Area Bertanggung Jawab</p>
              <p className="text-lg font-bold text-gray-900">{areas.filter((area) => area.penanggungJawab === extendedUser?.name).length} Area</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <MapPin className="text-purple-600" size={24} />
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );

  const renderKomiteView = () => {
    const departments = Array.from(new Set(areas.map((area) => area.department)));
    const currentDepartment = "Produksi";

    const departmentEmployees = Array.from(new Set(activities.filter((a) => a.department === currentDepartment).map((a) => ({ nama: a.nama, nip: a.nip, department: a.department }))));

    const filteredEmployees = departmentEmployees.filter((employee) => employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nip.includes(searchTerm));

    if (detailView && detailView.type === "karyawan") {
      return renderEmployeeDetail(detailView.data);
    }

    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Laporan Department {currentDepartment}</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i).toLocaleDateString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <p className="text-sm text-blue-600 font-medium">Score Department</p>
              <p className="text-2xl font-bold text-blue-900">{getDepartmentScore(currentDepartment, selectedMonth, selectedYear).toFixed(0)}%</p>
            </div>
            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <p className="text-sm text-green-600 font-medium">Total Karyawan</p>
              <p className="text-2xl font-bold text-green-900">{filteredEmployees.length}</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <p className="text-sm text-purple-600 font-medium">Karyawan Aktif</p>
              <p className="text-2xl font-bold text-purple-900">
                {
                  filteredEmployees.filter((emp) => {
                    const today = formatDate(new Date());
                    return activities.some((a) => a.nip === emp.nip && a.tanggal === today);
                  }).length
                }
              </p>
            </div>
            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <p className="text-sm text-orange-600 font-medium">Rata-rata Score</p>
              <p className="text-2xl font-bold text-orange-900">
                {filteredEmployees.length > 0 ? (filteredEmployees.reduce((sum, emp) => sum + getEmployeeMonthlyScore(emp.nip, selectedMonth, selectedYear), 0) / filteredEmployees.length).toFixed(0) : 0}%
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NIP</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status Hari Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Total Laporan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredEmployees.map((employee) => {
                  const monthlyScore = getEmployeeMonthlyScore(employee.nip, selectedMonth, selectedYear);
                  const employeeActivities = activities.filter((a) => a.nip === employee.nip && new Date(a.createdAt).getMonth() === selectedMonth);

                  return (
                    <tr key={employee.nip} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium">{employee.nama}</td>
                      <td className="py-3 text-sm">{employee.nip}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{monthlyScore.toFixed(0)}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${monthlyScore >= 80 ? "bg-green-500" : monthlyScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${monthlyScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{getTodaysStatus(employee.nip)}</td>
                      <td className="py-3 text-sm">{employeeActivities.length}</td>
                      <td className="py-3">
                        <button onClick={() => setDetailView({ type: "karyawan", data: employee })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderPenanggungJawabView = () => {
    const years = [2023, 2024, 2025];
    const userAreas = areas.filter((area) => area.penanggungJawab === "Budi Santoso");
    const areaEmployees = Array.from(new Set(activities.filter((a) => userAreas.some((area) => area.nama === a.area)).map((a) => ({ nama: a.nama, nip: a.nip, department: a.department }))));

    if (detailView && detailView.type === "karyawan") {
      return renderEmployeeDetail(detailView.data);
    }

    return (
      <div className="space-y-6">
        {/* Score Overview Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Score Overview Area Bertanggung Jawab</h3>
            <div className="flex gap-3">
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {years.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>
                    {new Date(2024, i).toLocaleDateString("id-ID", { month: "long" })}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {userAreas.map((area) => {
              const areaActivities = activities.filter((a) => a.area === area.nama && new Date(a.createdAt).getMonth() === selectedMonth);
              const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
              const score = totalDays > 0 ? (areaActivities.length / totalDays) * 100 : 0;

              return (
                <div key={area.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{area.nama}</h4>
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">{area.department}</span>
                  </div>

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-2xl font-bold text-blue-600">{Math.min(score, 100).toFixed(0)}%</span>
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <BarChart3 size={20} className="text-blue-600" />
                    </div>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div className="bg-green-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(score, 100)}%` }}></div>
                  </div>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{areaActivities.length} laporan</span>
                    <span>{Math.round(score)}% tercover</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        {/* Laporan Per Karyawan */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Laporan Per Karyawan</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NIP</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status Hari Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Total Laporan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {areaEmployees.map((employee) => {
                  const monthlyScore = getEmployeeMonthlyScore(employee.nip, selectedMonth, selectedYear);
                  const employeeActivities = activities.filter((a) => a.nip === employee.nip && new Date(a.createdAt).getMonth() === selectedMonth);

                  return (
                    <tr key={employee.nip} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm font-medium">{employee.nama}</td>
                      <td className="py-3 text-sm">{employee.nip}</td>
                      <td className="py-3 text-sm">{employee.department}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold">{monthlyScore.toFixed(0)}%</span>
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div className={`h-2 rounded-full ${monthlyScore >= 80 ? "bg-green-500" : monthlyScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${monthlyScore}%` }}></div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">{getTodaysStatus(employee.nip)}</td>
                      <td className="py-3 text-sm">{employeeActivities.length}</td>
                      <td className="py-3">
                        <button onClick={() => setDetailView({ type: "karyawan", data: employee })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                          Lihat Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderManagementView = () => {
    const departments = Array.from(new Set(areas.map((area) => area.department)));
    const allEmployees = Array.from(new Set(activities.map((a) => ({ nama: a.nama, nip: a.nip, department: a.department }))));

    if (detailView && detailView.type === "karyawan") {
      return renderEmployeeDetail(detailView.data);
    }

    return (
      <div className="space-y-6">
        {/* Executive Dashboard */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Executive Dashboard 5S</h3>
            <div className="flex gap-3">
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium">Total Department</p>
              <p className="text-2xl font-bold">{departments.length}</p>
              <p className="text-xs opacity-90 mt-1">Active departments</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium">Total Karyawan</p>
              <p className="text-2xl font-bold">{allEmployees.length}</p>
              <p className="text-xs opacity-90 mt-1">Registered employees</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium">Total Laporan</p>
              <p className="text-2xl font-bold">{activities.length}</p>
              <p className="text-xs opacity-90 mt-1">This year</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium">Rata-rata Score</p>
              <p className="text-2xl font-bold">{departments.length > 0 ? (departments.reduce((acc, dept) => acc + getDepartmentScore(dept, selectedMonth, selectedYear), 0) / departments.length).toFixed(0) : 0}%</p>
              <p className="text-xs opacity-90 mt-1">Company wide</p>
            </div>
          </div>

          {/* Department Performance */}
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-4">Performance Department</h4>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Department</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Total Karyawan</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Karyawan Aktif</th>
                    <th className="text-left py-3 text-sm font-medium text-gray-500">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept) => {
                    const score = getDepartmentScore(dept, selectedMonth, selectedYear);
                    const deptEmployees = allEmployees.filter((emp) => emp.department === dept);
                    const activeEmployees = deptEmployees.filter((emp) => {
                      const today = formatDate(new Date());
                      return activities.some((a) => a.nip === emp.nip && a.tanggal === today);
                    }).length;

                    return (
                      <tr key={dept} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{dept}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{score.toFixed(0)}%</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 text-sm">{deptEmployees.length}</td>
                        <td className="py-3 text-sm">{activeEmployees}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${score >= 80 ? "bg-green-100 text-green-800" : score >= 60 ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"}`}>
                            {score >= 80 ? "↑ Excellent" : score >= 60 ? "→ Good" : "↓ Need Improvement"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>

        {/* Detail Karyawan All Company */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Laporan Semua Karyawan</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Department</option>
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Nama</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NIP</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status Hari Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Total Laporan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {allEmployees
                  .filter((employee) => !selectedDepartment || employee.department === selectedDepartment)
                  .filter((employee) => employee.nama.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nip.includes(searchTerm))
                  .map((employee) => {
                    const monthlyScore = getEmployeeMonthlyScore(employee.nip, selectedMonth, selectedYear);
                    const employeeActivities = activities.filter((a) => a.nip === employee.nip && new Date(a.createdAt).getMonth() === selectedMonth);

                    return (
                      <tr key={employee.nip} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{employee.nama}</td>
                        <td className="py-3 text-sm">{employee.nip}</td>
                        <td className="py-3 text-sm">{employee.department}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{monthlyScore.toFixed(0)}%</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${monthlyScore >= 80 ? "bg-green-500" : monthlyScore >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${monthlyScore}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{getTodaysStatus(employee.nip)}</td>
                        <td className="py-3 text-sm">{employeeActivities.length}</td>
                        <td className="py-3">
                          <button onClick={() => setDetailView({ type: "karyawan", data: employee })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Lihat Detail
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    );
  };

  const renderViewContent = () => {
    if (detailView) {
      return renderEmployeeDetail(detailView.data);
    }

    switch (viewMode) {
      case "karyawan":
        return renderKaryawanView();
      case "komite":
        return renderKomiteView();
      case "penanggungjawab":
        return renderPenanggungJawabView();
      case "management":
        return renderManagementView();
      default:
        return renderManagementView();
    }
  };

  const currentArea = getCurrentArea();
  const calendarDays = getCalendarDays();

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Genba Action"
          mainTitleHighlight="Management"
          description={`Laporan ${
            viewMode === "karyawan" ? "harian penanggung jawab area kerja" : viewMode === "komite" ? "department untuk komite 5S" : viewMode === "penanggungjawab" ? "overview area bertanggung jawab" : "executive dashboard management"
          }`}
          icon={<Calendar />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          {detailView && (
            <div className="mb-4">
              <button onClick={() => setDetailView(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                <ArrowLeft size={16} />
                Kembali ke {viewMode === "komite" ? "Komite" : viewMode === "penanggungjawab" ? "PJ Area" : "Management"}
              </button>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Genba <span className="text-blue-600">Action</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">
                {viewMode === "karyawan"
                  ? "Effortlessly track, manage, and complete your daily tasks and activities to optimize productivity."
                  : viewMode === "komite"
                  ? "Monitor and manage 5S activities across your department with comprehensive reporting."
                  : viewMode === "penanggungjawab"
                  ? "Oversee area performance and compliance with monthly score tracking."
                  : "Executive overview of all 5S activities across departments and areas."}
              </p>
            </div>

            {!detailView && (
              <div className="flex items-center gap-3">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-4 py-2">
                  <span className="text-sm font-medium text-gray-700">{userRoles.find((role) => role.id === viewMode)?.name}</span>
                </div>

                {/* Debug Mode - Tampilkan semua tombol view mode */}
                <div className="flex gap-2">
                  <button onClick={() => setViewMode("karyawan")} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">
                    Karyawan
                  </button>
                  <button onClick={() => setViewMode("komite")} className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">
                    Komite
                  </button>
                  <button onClick={() => setViewMode("penanggungjawab")} className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors">
                    PJ Area
                  </button>
                  <button onClick={() => setViewMode("management")} className="px-3 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 transition-colors">
                    Management
                  </button>
                </div>
              </div>
            )}
          </motion.div>

          {renderViewContent()}

          {viewMode === "karyawan" && (
            <>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 mb-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Pelapor</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="text-blue-600" size={20} />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{extendedUser?.name || "Budi Santoso"}</p>
                          <p className="text-sm text-gray-500">NIP: {extendedUser?.nip || "12345"}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">Department:</span>
                          <span className="font-medium">{extendedUser?.department_name || extendedUser?.department || "Produksi"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Pengawas Area:</span>
                          <span className="font-medium">{currentArea?.pengawas || "Ahmad Wijaya"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Komite 5S:</span>
                          <span className="font-medium">{`Komite5s ${extendedUser?.department || "Produksi"}`}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">Map of the Path</h3>
                    <div className="bg-gray-100 rounded-xl p-4 h-48 flex items-center justify-center">
                      <div className="text-center">
                        <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                        <p className="text-gray-500 text-sm">Peta denah area {currentArea?.nama || "Produksi Line A"}</p>
                        <button className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors">Lihat Denah Lengkap</button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">3D Area Map</h3>
                  <div className="bg-gray-100 rounded-xl p-4 h-64 flex items-center justify-center">
                    <div className="text-center">
                      <MapPin size={32} className="text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 text-sm">Gambar 3D area {currentArea?.nama || "Produksi Line A"}</p>
                      <button className="mt-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors">Lihat 3D Model</button>
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Laporan Bulanan</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
                  {calendarDays.map((day) => (
                    <div key={day.date} className={`h-12 rounded-lg flex items-center justify-center ${day.hasReport ? "bg-green-100 text-green-800 border border-green-200" : "bg-red-100 text-red-800 border border-red-200"}`}>
                      <span className="text-sm font-medium">{day.date}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </>
          )}
        </main>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-gray-900">Form Laporan Harian</h2>
                  <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-gray-600 text-sm mt-1">Tanggal: {formatDate(currentDate)}</p>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                  <input type="text" value={extendedUser?.name || "Budi Santoso"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIP</label>
                  <input type="text" value={extendedUser?.nip || "12345"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input type="text" value={extendedUser?.department_name || extendedUser?.department || "Produksi"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Komite 5S</label>
                  <input type="text" value={`Komite5s ${extendedUser?.department || "Produksi"}`} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
                  <input type="text" value={formatDate(currentDate)} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                  <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Pilih Area Kerja ...</option>
                    {areas.map((area) => (
                      <option key={area.id} value={area.id}>
                        {area.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Penanggung Jawab Area</label>
                  <input type="text" value={currentArea?.penanggungJawab || ""} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                  <textarea
                    value={keterangan}
                    onChange={(e) => setKeterangan(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Tambahkan keterangan jika diperlukan..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Foto * {fotoLampiran.length > 0 && `(${fotoLampiran.length} foto)`}</label>

                  {fotoLampiran.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                      {fotoLampiran.map((foto, index) => (
                        <div key={index} className="relative">
                          <img src={foto} alt={`Lampiran ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button onClick={() => removePhoto(index)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors">
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button onClick={initializeCamera} className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                      <Camera size={20} />
                      Buka Kamera
                    </button>

                    {fotoLampiran.length > 0 && (
                      <button onClick={() => setFotoLampiran([])} className="px-4 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2">
                        <Trash2 size={20} />
                        Hapus Semua
                      </button>
                    )}  
                  </div>

                  <p className="text-xs text-gray-500 mt-2">* Photo Gallery Not Allowed - Hanya foto dari kamera yang diperbolehkan</p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex gap-3">
                <button onClick={() => setShowForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedArea || fotoLampiran.length === 0}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {cameraOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black flex flex-col items-center justify-center z-50">
            <div className="relative w-full max-w-2xl">
              <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />

              <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-4">
                <button onClick={capturePhoto} className="w-16 h-16 bg-white rounded-full border-4 border-gray-300 hover:border-gray-400 transition-colors" />

                <button onClick={closeCamera} className="w-16 h-16 bg-red-600 text-white rounded-full flex items-center justify-center hover:bg-red-700 transition-colors">
                  <X size={24} />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GenbaAction;
