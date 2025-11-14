import React, { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Image, decode } from "image-js";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import {
  Camera,
  MapPin,
  User as User1,
  Calendar,
  ChevronLeft,
  Paperclip,
  ChevronRight,
  X,
  Activity,
  Clock,
  Save,
  Building2,
  FileText,
  Trash2,
  CheckCircle,
  AlertCircle,
  Users,
  BarChart3,
  Eye,
  Download,
  Filter,
  Search,
  ArrowLeft,
} from "lucide-react";
import Sidebar from "../../../component/Sidebar";
import { getProjectEnvVariables } from "../../../shared/projectEnvVariables";
import PageHeader from "../../../component/PageHeader";
import { useAuth, User as AuthUser, Department, GenbaWorkAreas, GenbaActivity, User, GenbaSO } from "../../../routes/AuthContext";
import { DateNumberType } from "node_modules/react-datepicker/dist/date_utils";

interface UserRole {
  id: string;
  name: string;
  level: number;
}

const Modal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center backdrop-brightness-50 bg-opacity-50 p-4">
      <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-auto p-6 border border-blue-100">
        <div className="flex justify-between items-center border-b pb-3 mb-4 border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={onClose} className="text-gray-500 hover:text-gray-700 text-2xl">
            <X size={24} />
          </motion.button>
        </div>
        <div>{children}</div>
      </motion.div>
    </motion.div>
  );
};

interface StatCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: React.ReactNode;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtext, icon, color = "blue" }) => {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    green: "bg-green-50 text-green-600 border-green-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
    orange: "bg-orange-50 text-orange-600 border-orange-100",
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{
        y: -5,
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0,0,0,0.1)",
      }}
      className={`rounded-2xl shadow-md p-6 {} bg-white cursor-pointer transition-transform duration-200`}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className={`p-3 rounded-full ${colorMap[color]}`}>{icon}</div>
      </div>
    </motion.div>
  );
};

const GenbaActivitys: React.FC = () => {
  const navigate = useNavigate();
  const projectEnvVariables = getProjectEnvVariables();
  const { user, getGenbaActivities, getGenbaAreas, createGenbaActivity, updateGenbaActivity, deleteGenbaActivity, fetchUser, getDepartment, hasPermission, getGenbaSOs } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState<boolean>(() => {
    const stored = localStorage.getItem("sidebarOpen");
    return stored ? JSON.parse(stored) : false;
  });

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [activities, setActivities] = useState<GenbaActivity[]>([]);
  const [areas, setAreas] = useState<GenbaWorkAreas[]>([]);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [keterangan, setKeterangan] = useState("");
  const [fotoLampiran, setFotoLampiran] = useState<string[]>([]);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"karyawan" | "komite" | "management">("karyawan");
  const [detailView, setDetailView] = useState<{ type: "area"; data: GenbaWorkAreas } | null>(null);
  const [selectedActivity, setSelectedActivity] = useState<GenbaActivity | null>(null);
  const [selectedDepartment, setSelectedDepartment] = useState<string>("");
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [genbaSOs, setGenbaSOs] = useState<GenbaSO[]>([]);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [selectedAreaFilter, setSelectedAreaFilter] = useState<string>("");
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [resizedImages, setResizedImages] = useState<{ [key: string]: string }>({});

  const [openAttachmentModal, setOpenAttachmentModal] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const handleOpenActivityForm = (date: Date) => {
    const dateString = date.toISOString().split("T")[0];

    navigate("/genba/genbaactivity/formgenbaactivity", { state: { date: dateString } });
  };

  const handleCloseSuccessModal = useCallback(() => {
    setShowSuccessModal(false);
    navigate("/genba/genbaactivity");
  }, [navigate]);

  const handleOpenAttachmentModal = (attachments: any[]) => {
    setSelectedAttachments(attachments);
    setOpenAttachmentModal(true);
  };

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const [areasData, usersData, departmentsData, activitiesData, genbaSOsData] = await Promise.all([getGenbaAreas(), fetchUser(), getDepartment(), getGenbaActivities(), getGenbaSOs()]);

        setAreas(areasData);
        setDepartments(departmentsData);
        setActivities(activitiesData);
        setGenbaSOs(genbaSOsData);

        if (areasData.length > 0 && !selectedArea) {
          const userAreas = areasData.filter((a) => a.pic_user_id.toString() === user?.id?.toString());
          if (userAreas.length > 0) {
            setSelectedArea(userAreas[0].id.toString());
          } else {
            setSelectedArea(areasData[0].id.toString());
          }
        }

        const activeSO = genbaSOsData.find((so) => so.is_active);
        if (activeSO && user) {
          const userBridges = activeSO.bridges.filter((bridge) => bridge.user.id.toString() === user.id.toString());

          const roles: UserRole[] = [{ id: "karyawan", name: "Karyawan", level: 1 }];

          userBridges.forEach((bridge) => {
            const roleName = bridge.role.name.toLowerCase();

            // Semua role adalah karyawan
            if (!roles.find((r) => r.id === "karyawan")) {
              roles.push({ id: "karyawan", name: "Karyawan", level: 1 });
            }

            if (roleName === "komite 5s department" && !roles.find((r) => r.id === "komite")) {
              roles.push({ id: "komite", name: "Komite 5S Department", level: 2 });
            }

            if ((roleName === "koordinator 5s department" || roleName === "koordinator 5s") && !roles.find((r) => r.id === "komite")) {
              roles.push({ id: "komite", name: "Koordinator 5S / Department", level: 2 });
            }

            if (roleName === "penanggung jawab 5s" && !roles.find((r) => r.id === "management")) {
              roles.push({ id: "management", name: "Penanggung Jawab 5S", level: 3 });
            }
          });

          setUserRoles(roles);

          if (roles.length > 1) {
            setViewMode("karyawan");
          }
        } else {
          setUserRoles([{ id: "karyawan", name: "Karyawan", level: 1 }]);
        }
      } catch (error) {
        console.error("Error loading data:", error);
        alert("Gagal memuat data. Silakan refresh halaman.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [getGenbaAreas, getDepartment, getGenbaActivities, getGenbaSOs, fetchUser]);

  useEffect(() => {
    const isKomiteDept = userRoles.some((r) => r.name.toLowerCase().includes("komite 5s department"));
    if (isKomiteDept) {
      const now = new Date();
      setSelectedMonth(now.getMonth());
      setSelectedYear(now.getFullYear());
    }
  }, [userRoles]);

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

  const getCurrentArea = (): GenbaWorkAreas | undefined => {
    return areas.find((area) => area.id.toString() === selectedArea);
  };

  const getUserAreas = (): GenbaWorkAreas[] => {
    return areas.filter((area) => area.pic_user_id.toString() === user?.id?.toString());
  };

  const getFilteredActivities = (): GenbaActivity[] => {
    let filtered = activities;

    // if (viewMode === "komite" && user?.department) {
    //   filtered = filtered.filter((activity) => activity.work_area?.department?.name === user.department?.name);
    // } else if (viewMode === "karyawan") {
    //   filtered = filtered.filter((activity) => activity.reporter?.nik === user?.nik);
    // }

    if (selectedArea) {
      filtered = filtered.filter((activity) => activity.work_area?.id.toString() === selectedArea);
    }

    // filter by month/year
    filtered = filtered.filter((activity) => {
      const date = new Date(activity.date);
      return date.getMonth() === selectedMonth && date.getFullYear() === selectedYear;
    });

    if (searchTerm) {
      filtered = filtered.filter(
        (activity) => activity.reporter?.name.toLowerCase().includes(searchTerm.toLowerCase()) || activity.work_area?.name.toLowerCase().includes(searchTerm.toLowerCase()) || activity.reporter?.nik.includes(searchTerm)
      );
    }

    return filtered;
  };

  // GenbaActivity.tsx - di dalam GenbaActivitys component (handleExportActivitiesPDF)

  const handleExportActivitiesPDF = useCallback(() => {
    const doc = new jsPDF();
    const activitiesToExport = getFilteredActivities(); // Menggunakan data yang sudah difilter

    // Header Laporan
    doc.setFontSize(18);
    doc.text("Laporan Aktivitas Genba Harian", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    // Menggunakan filter bulan dan tahun yang sudah dipilih
    doc.text(`Periode: ${new Date(selectedYear, selectedMonth).toLocaleDateString("id-ID", { month: "long", year: "numeric" })}`, 14, 30);
    // Menggunakan filter area yang dipilih
    doc.text(`Filter Area: ${areas.find((a) => a.id.toString() === selectedAreaFilter)?.name || "Semua Area"}`, 14, 37);
    // Menggunakan filter pencarian
    doc.text(`Pencarian: ${searchTerm || "-"}`, 14, 44);

    // Persiapan Data Tabel
    const tableColumn = ["Tanggal", "Reporter", "Area Kerja", "Department", "Keterangan Singkat", "Lampiran"];
    const tableRows = activitiesToExport.map((activity) => [
      formatDate(new Date(activity.date)),
      activity.reporter?.name || "-",
      activity.work_area?.name || "-",
      activity.work_area?.department?.name || "-",
      // Membatasi panjang Keterangan Singkat
      activity.keterangan ? activity.keterangan.substring(0, 70) + (activity.keterangan.length > 70 ? "..." : "") : "-",
      activity.attachment?.length || 0,
    ]);

    // Generate Tabel (PERBAIKAN UTAMA DI SINI)
    // Menggunakan autoTable yang diimpor sebagai fungsi, bukan sebagai metode doc.
    (autoTable as any)(doc, {
      head: [tableColumn], // Header tabel
      body: tableRows, // Data baris
      startY: 50,
      headStyles: { fillColor: [59, 130, 246] }, // Warna Biru (sama seperti di Reports.tsx)
      margin: { top: 10 },
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 60 }, // Lebar kolom Keterangan Singkat
      },
    });

    // Simpan File
    doc.save(`Genba_Activity_Report_${selectedYear}_${selectedMonth + 1}.pdf`);
  }, [activities, areas, selectedAreaFilter, selectedMonth, selectedYear, searchTerm, getFilteredActivities]);

  const getDepartmentScore = (department: string, month: number, year: number): number => {
    const departmentActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activity.work_area?.department?.name === department && activityDate.getMonth() === month && activityDate.getFullYear() === year;
    });

    const totalDays = new Date(year, month + 1, 0).getDate();

    // ✅ Jika department Production → semua hari dihitung (termasuk Sabtu & Minggu)
    const isProduction = department === "Production";

    // Ambil unique tanggal lapor bulan ini
    const uniqueDays = new Set(
      departmentActivities
        .filter((a) => {
          const d = new Date(a.date);
          const day = d.getDay();
          return d.getMonth() === month && d.getFullYear() === year && (isProduction || (day !== 0 && day !== 6));
        })
        .map((a) => new Date(a.date).getDate())
    ).size;

    // Hitung total hari kerja sesuai aturan Production
    let workingDays = 0;
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const day = date.getDay();
      if (isProduction || (day !== 0 && day !== 6)) workingDays++;
    }

    const score = workingDays > 0 ? (uniqueDays / workingDays) * 100 : 0;
    return Math.min(score, 100);
  };

  // Hitung score bulan ini (berdasarkan hari kerja)
  const getCurrentMonthScore = (): number => {
    const selectedAreaObj = areas.find((a) => a.id.toString() === selectedArea);
    const isDefaultArea = !!selectedAreaObj?.is_default;

    // JIKA AREA NON-DAILY, KEMBALIKAN SCORE 0%
    if (!isDefaultArea) {
      return 0;
    }

    const filtered = getFilteredActivities();
    const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();

    // Hitung total hari kerja (Senin–Jumat)
    let totalWorkingDays = 0;
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      const dow = date.getDay();
      if (dow !== 0 && dow !== 6) totalWorkingDays++;
    }

    // Hari unik yang dilaporkan (hari kerja)
    const uniqueReportedDays = new Set(
      filtered
        .filter((a) => {
          const d = new Date(a.date);
          const dow = d.getDay();
          return dow !== 0 && dow !== 6;
        })
        .map((a) => new Date(a.date).toLocaleDateString("id-ID"))
    ).size;

    return totalWorkingDays > 0 ? Math.min((uniqueReportedDays / totalWorkingDays) * 100, 100) : 0;
  };

  const getEmployeeMonthlyScore = (nik: string, month: number, year: number): number => {
    const employeeActivities = activities.filter((activity) => {
      const activityDate = new Date(activity.date);
      return activity.reporter?.nik === nik && activityDate.getMonth() === month && activityDate.getFullYear() === year;
    });

    const department = employeeActivities[0]?.work_area?.department?.name || "";
    const isProduction = department === "Production";

    const totalDays = new Date(year, month + 1, 0).getDate();
    let workingDays = 0;
    for (let d = 1; d <= totalDays; d++) {
      const date = new Date(year, month, d);
      const dow = date.getDay();
      if (isProduction || (dow !== 0 && dow !== 6)) workingDays++;
    }

    const uniqueDays = new Set(
      employeeActivities
        .filter((a) => {
          const d = new Date(a.date);
          const day = d.getDay();
          return d.getMonth() === month && d.getFullYear() === year && (isProduction || (day !== 0 && day !== 6));
        })
        .map((a) => new Date(a.date).getDate())
    ).size;

    const score = workingDays > 0 ? (uniqueDays / workingDays) * 100 : 0;
    return Math.min(score, 100);
  };

  const getAreaMonthlyScore = (areaId: number, month: number, year: number): number => {
    const area = areas.find((a) => a.id === areaId);
    if (!area) return 0;

    // 1. Tentukan apakah ini area Production
    const isProduction = area.department?.name === "Production"; // <-- BARU

    // Filter aktivitas hanya untuk area dan PIC yang sesuai
    const areaActivities = activities.filter((a) => (a.genba_work_area_id === areaId || a.work_area?.id === areaId) && new Date(a.date).getMonth() === month && new Date(a.date).getFullYear() === year);

    if (!area.is_default) {
      // Asumsi: jika ada minimal 1 laporan di bulan ini, dianggap 100%
      const hasReport = areaActivities.length > 0;
      return hasReport ? 100 : 0;
    }

    // Ambil semua tanggal unik aktivitas
    const reportedDays = new Set(areaActivities.map((a) => new Date(a.date).toLocaleDateString("id-ID")));

    // 2. Hitung Total Hari Target (Penyebut: 30 hari untuk Production, ~20 hari untuk lainnya)
    const totalDaysInMonth = new Date(year, month + 1, 0).getDate();
    let totalTargetDays = 0; // Ganti workingDays menjadi totalTargetDays

    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(year, month, d);
      const day = date.getDay(); // 0=Minggu, 6=Sabtu

      // Logika Target Hari: Jika Production (true) atau bukan weekend
      if (isProduction || (day !== 0 && day !== 6)) {
        // <-- PERUBAHAN UTAMA DI SINI
        totalTargetDays++;
      }
    }

    // 3. Hitung Berapa Hari yang Dilaporkan (Pembilang)
    let reportedTargetDays = 0; // Ganti reportedWorkingDays
    reportedDays.forEach((dayStr) => {
      const [dd, mm, yyyy] = dayStr.split("/");
      // Note: New Date(yyyy, mm-1, dd) should be used, but since the day of week check is correct below, we proceed.
      const date = new Date(+yyyy, +mm - 1, +dd);
      const day = date.getDay();

      // Logika Laporan: Jika Production (true) atau bukan weekend
      if (isProduction || (day !== 0 && day !== 6)) {
        // <-- PERUBAHAN UTAMA DI SINI
        reportedTargetDays++;
      }
    });

    // 4. Hitung Score dengan menggunakan totalTargetDays dan reportedTargetDays
    const score = totalTargetDays > 0 ? (reportedTargetDays / totalTargetDays) * 100 : 0;
    return Math.floor(score);
  };

  const getKaryawanCalendarDays = () => {
    const year = selectedYear;
    const month = selectedMonth;
    const totalDays = new Date(year, month + 1, 0).getDate();

    // Filter aktivitas hanya milik user login dan area terpilih
    const userActivities = activities.filter((a) => {
      if (!a.date) return false;
      const d = new Date(a.date);
      return (
        a.reporter?.nik === user?.nik &&
        a.work_area?.id?.toString() === selectedArea && // ✅ filter area aktif
        d.getMonth() === month &&
        d.getFullYear() === year
      );
    });

    const days = [];
    for (let i = 1; i <= totalDays; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = dayDate.toLocaleDateString("id-ID");

      const hasReport = userActivities.some((act) => new Date(act.date).toLocaleDateString("id-ID") === dateStr);

      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isPast = dayDate < new Date() && !isToday;

      days.push({
        date: i,
        hasReport,
        isToday,
        isPast,
      });
    }

    return days;
  };

  const getCalendarDays = (targetDate?: Date) => {
    const date = targetDate || currentDate;
    const year = date.getFullYear();
    const month = date.getMonth();
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();

    const filteredActivities = activities.filter((a) => a.genba_work_area_id === detailView?.data.id || a.work_area?.id === detailView?.data.id);

    const days = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const dayDate = new Date(year, month, i);
      const dateStr = formatDate(dayDate);
      const hasReport = filteredActivities.some((activity) => new Date(activity.date).toLocaleDateString("id-ID") === dateStr);
      const isToday = dayDate.toDateString() === new Date().toDateString();
      const isPast = dayDate < new Date() && !isToday;

      days.push({
        date: i,
        hasReport,
        isToday,
        isPast,
        fullDate: dayDate,
      });
    }

    return days;
  };

  const initializeCamera = async (): Promise<void> => {
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

  const capturePhoto = (): void => {
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

  const closeCamera = (): void => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const removePhoto = (index: number): void => {
    setFotoLampiran((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    // Validasi wajib isi
    if (!selectedArea) {
      setError("Area wajib diisi!");
      setIsLoading(false);
      return;
    }

    try {
      // Siapkan payload
      const payload = {
        date: currentDate.toLocaleDateString("en-CA"),
        genba_work_area_id: parseInt(selectedArea),
        keterangan: keterangan || "",
      };

      // Jika ada lampiran base64, konversi ke File[]
      let files: File[] | null = null;
      if (fotoLampiran.length > 0) {
        files = await Promise.all(
          fotoLampiran.map(async (base64, index) => {
            const response = await fetch(base64);
            const blob = await response.blob();
            return new File([blob], `photo_${index + 1}.jpg`, { type: "image/jpeg" });
          })
        );
      }

      // Kirim ke backend via AuthContext
      await createGenbaActivity(payload, files ?? []);

      // Jika berhasil
      setSuccess("Laporan berhasil disimpan!");
      setShowSuccessModal(true);

      // Refresh data aktivitas
      const activitiesData = await getGenbaActivities();
      setActivities(activitiesData);

      // Reset form
      setSelectedArea("");
      setKeterangan("");
      setFotoLampiran([]);
      setShowForm(false);
    } catch (err: any) {
      console.error("Full submission error:", err);
      setError(err.message || "Gagal menyimpan laporan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  const getTodaysStatus = (nik: string): React.JSX.Element => {
    const today = new Date();
    const todayStr = today.toLocaleDateString("id-ID");

    const hasReportToday = activities.some((activity) => activity.reporter?.nik === nik && new Date(activity.date).toLocaleDateString("id-ID") === todayStr);

    if (hasReportToday) {
      return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sudah Lapor</span>;
    } else {
      return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Belum Lapor</span>;
    }
  };

  const getFotoUrl = (filePath: string): string => {
    if (!filePath.startsWith("http")) {
      return `${projectEnvVariables.envVariables.VITE_BACKEND_API_URL}/${filePath}`;
    }
    return filePath;
  };

  const getUniqueEmployees = (): User[] => {
    const employeeMap = new Map();

    activities.forEach((activity) => {
      if (activity.reporter) {
        const key = `${activity.reporter.nik}-${activity.reporter.name}`;
        if (!employeeMap.has(key)) {
          employeeMap.set(key, activity.reporter);
        }
      }
    });

    return Array.from(employeeMap.values());
  };

  const renderEmployeeDetail = (area: GenbaWorkAreas): React.JSX.Element => {
    const isDefault = area.is_default;

    // SESUDAH (Fix filter bulan/tahun di areaActivities):
    const areaActivities = activities
      .filter((a) => a.genba_work_area_id === area.id || a.work_area?.id === area.id)
      .filter((a) => {
        const d = new Date(a.date);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
      })
      .sort((a, b) => new Date(b.date || "").getTime() - new Date(a.date || "").getTime());

    const reportedDays = new Set(areaActivities.filter((a) => new Date(a.date).getMonth() === selectedMonth && new Date(a.date).getFullYear() === selectedYear).map((a) => new Date(a.date).getDate()));

    const totalDaysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
    const isProduction = area.department?.name === "Production";

    let workingDays = 0;
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const date = new Date(selectedYear, selectedMonth, d);
      const dow = date.getDay();
      if (isProduction || (dow !== 0 && dow !== 6)) workingDays++;
    }

    const reportedWorkingDays = Array.from(reportedDays).filter((d) => {
      const date = new Date(selectedYear, selectedMonth, d);
      const dow = date.getDay();
      return isProduction || (dow !== 0 && dow !== 6);
    }).length;

    // ✅ Jika area non-daily → score hilang
    const monthlyScore = isDefault ? (workingDays > 0 ? (reportedWorkingDays / workingDays) * 100 : 0) : 0;

    const detailCalendarDays = getCalendarDays(new Date(selectedYear, selectedMonth));

    const activeDays = reportedDays.size;

    return (
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => setDetailView(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Detail Laporan Area - {area.name}</h3>
            <p className="text-gray-600">
              PIC: {area.pic?.name ?? "-"} | Department: {area.department?.name ?? "-"}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Bulan:{" "}
              {new Date(selectedYear, selectedMonth).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}{" "}
              | Total Aktivitas: {areaActivities.length}
            </p>
          </div>
        </div>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Score Bulan Ini" value={`${monthlyScore.toFixed(0)}%`} icon={<CheckCircle className="w-6 h-6" />} color="blue" />
          <StatCard title="Total Laporan" value={areaActivities.length} icon={<Calendar className="w-6 h-6" />} color="blue" />
          <StatCard title="Hari Aktif" value={activeDays} icon={<Activity className="w-6 h-6" />} color="blue" />
        </div>

        {/* Kalender */}
        <div className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {new Date(selectedYear, selectedMonth).toLocaleDateString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const newDate = new Date(selectedYear, selectedMonth - 1, 1);
                  setSelectedMonth(newDate.getMonth());
                  setSelectedYear(newDate.getFullYear());
                }}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
              >
                <ChevronLeft size={16} className="text-gray-700" />
              </button>
              <button
                onClick={() => {
                  const newDate = new Date(selectedYear, selectedMonth + 1, 1);
                  setSelectedMonth(newDate.getMonth());
                  setSelectedYear(newDate.getFullYear());
                }}
                className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow"
              >
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
            {detailCalendarDays.map((day, index) => {
              const dayOfWeek = new Date(selectedYear, selectedMonth, day.date).getDay();
              const colStart = index === 0 ? dayOfWeek + 1 : undefined;

              const activityForDay = areaActivities.find(
                (a) => new Date(a.date).getDate() === day.fullDate.getDate() && new Date(a.date).getMonth() === day.fullDate.getMonth() && new Date(a.date).getFullYear() === day.fullDate.getFullYear()
              );

              // Perhatikan: Variabel 'area' dan 'isDefault' yang bertentangan telah dihapus di sini

              const hasActivity = !!activityForDay;
              const isSameDay = day.fullDate.toDateString() === new Date().toDateString();
              const isPastDay = day.fullDate < new Date() && !isSameDay;

              let dayStatus = "empty"; // Cek apakah hari adalah akhir pekan dan bukan area Production (logika dari workingDays)
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // 0=Minggu, 6=Sabtu
              const isWorkingDay = isProduction || !isWeekend;

              if (isDefault) {
                // Menggunakan 'isDefault' dari awal fungsi (Area Daily)
                // MODIFIKASI FINAL: AREA DAILY (is_default: true) MENGAKTIFKAN SEMUA STATUS WARNA
                if (hasActivity) {
                  dayStatus = "has-report"; // Hijau: Sudah Lapor
                } else if (!isWorkingDay) {
                  dayStatus = "empty"; // Abu-abu: Hari Libur (jika bukan production)
                } else if (isSameDay) {
                  dayStatus = "today-empty"; // Biru/Orange: Belum Lapor (Hari Ini)
                } else if (isPastDay) {
                  dayStatus = "past-empty"; // Merah: Tidak Lapor (Masa Lalu)
                } else {
                  dayStatus = "empty"; // Abu-abu: Tanggal Masa Depan/Normal
                }
              } else {
                // AREA NON-DAILY (is_default: false) HANYA TAMPIL HIJAU ATAU ABU-ABU
                if (hasActivity) {
                  dayStatus = "has-report";
                } else {
                  dayStatus = "empty";
                }
              }

              return (
                <motion.div
                  key={day.date}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => {
                    if (activityForDay) setSelectedActivity(activityForDay);
                  }}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                    dayStatus === "has-report"
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : dayStatus === "today-empty"
                      ? "bg-blue-100 text-blue-800 border border-blue-200"
                      : dayStatus === "past-empty"
                      ? "bg-red-100 text-red-800 border border-red-200"
                      : "bg-gray-100 text-gray-500 border border-gray-200"
                  }`}
                  style={colStart ? { gridColumnStart: colStart } : undefined}
                >
                  <span className="text-sm font-medium">{day.date}</span>
                  {dayStatus === "has-report" && <CheckCircle size={12} className="mt-1" />}
                  {dayStatus === "past-empty" && <AlertCircle size={12} className="mt-1" />}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Tabel laporan */}
        <div className="overflow-x-auto mb-6">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 text-sm font-medium text-gray-500">Tanggal</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Reporter</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Keterangan</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                <th className="text-left py-3 text-sm font-medium text-gray-500">Attachment</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const year = selectedYear;
                const month = selectedMonth;
                const lastDay = new Date(year, month + 1, 0).getDate();
                const today = new Date();
                const rows = [];

                for (let d = lastDay; d >= 1; d--) {
                  const rowDate = new Date(year, month, d);
                  const rowDateStr = rowDate.toLocaleDateString("id-ID");
                  const activity = areaActivities.find((a) => new Date(a.date).toLocaleDateString("id-ID") === rowDateStr);

                  const dow = rowDate.getDay();
                  if (!isProduction && (dow === 0 || dow === 6)) continue; // skip weekend jika bukan Production

                  // 🎯 Status hari ini
                  let statusEl;

                  if (isDefault) {
                    // LOGIC UNTUK AREA DAILY (is_default: true)
                    // TETAP MENGGUNAKAN LOGIKA LAMA (Sudah Lapor, Belum Lapor, Tidak Lapor)
                    if (activity) {
                      statusEl = <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sudah Lapor</span>;
                    } else if (rowDate.toDateString() === today.toDateString()) {
                      statusEl = <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">Belum Lapor</span>;
                    } else if (rowDate < today) {
                      statusEl = <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium">Tidak Lapor</span>;
                    } else {
                      // Untuk tanggal di masa depan (tidak ada aktivitas)
                      statusEl = <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Belum Lapor</span>;
                    }
                  } else {
                    // LOGIC UNTUK AREA NON-DAILY (is_default: false)
                    // HANYA MENAMPILKAN "Sudah Lapor" atau "-"
                    if (activity) {
                      // Hanya jika ada activity, tampilkan "Sudah Lapor"
                      statusEl = <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sudah Lapor</span>;
                    } else {
                      // Jika tidak ada activity, tampilkan "-"
                      statusEl = <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-full text-xs font-medium">-</span>;
                    }
                  }

                  rows.push(
                    <tr key={rowDateStr} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 text-sm">{rowDateStr}</td>
                      <td className="py-3 text-sm">{activity?.reporter?.name || "-"}</td>
                      <td className="py-3 text-sm">{activity?.keterangan || "-"}</td>
                      <td className="py-3">{statusEl}</td>
                      <td className="py-3">
                        {activity?.attachment?.length ? (
                          <button onClick={() => handleOpenAttachmentModal(activity.attachment)} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-all">
                            📎 {activity.attachment.length} Lampiran
                          </button>
                        ) : (
                          <span className="text-gray-400 text-sm">Tidak ada Attachment</span>
                        )}
                      </td>
                    </tr>
                  );
                }

                return rows;
              })()}
            </tbody>
          </table>
        </div>

        <AnimatePresence>
          {openAttachmentModal && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 flex items-center justify-center z-50 p-6">
              <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto p-6 relative">
                <button onClick={() => setOpenAttachmentModal(false)} className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition">
                  <X size={20} />
                </button>
                <h2 className="text-xl font-bold text-gray-900 mb-4">Lampiran Gambar</h2>

                {selectedAttachments.length ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {selectedAttachments.map((att, i) => {
                      const filePath = att.file_path || att.path;
                      const fileName = att.file_name || att.filename || `Lampiran ${i + 1}`;
                      return (
                        <div key={i} className="relative">
                          <img src={getFotoUrl(filePath)} alt={fileName} className="w-full h-auto rounded-lg shadow-md cursor-pointer" onClick={() => window.open(getFotoUrl(filePath), "_blank")} />
                          <p className="text-sm text-gray-500 mt-2">{fileName}</p>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm text-center">Tidak ada lampiran</p>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedActivity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Form Laporan Harian</h2>
                    <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-gray-900 text-sm mt-1">Tanggal: {selectedActivity?.date ? new Date(selectedActivity.date).toLocaleDateString("id-ID") : "-"}</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                    <input type="text" value={selectedActivity?.reporter?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                    <input type="text" value={selectedActivity?.reporter?.nik ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input type="text" value={selectedActivity?.reporter?.department?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Komite 5S</label>
                    <input
                      type="text"
                      value={`${
                        selectedActivity?.committee_role?.name
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ") ?? "-"
                      }`}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
                    <input type="text" value={selectedActivity?.date ? new Date(selectedActivity.date).toLocaleDateString("id-ID") : "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                    <input type="text" value={selectedActivity?.work_area?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Penanggung Jawab Area</label>
                    <input type="text" value={selectedActivity?.work_area?.pic?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                    <textarea value={selectedActivity?.keterangan ?? "-"} disabled rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Foto</label>
                    {selectedActivity?.attachment?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {selectedActivity.attachment.map((att, index) => (
                          <div key={index} className="relative">
                            <img src={getFotoUrl(att.file_path)} alt={`Lampiran ${index + 1}`} className="w-full h-24 object-cover rounded-lg cursor-pointer" onClick={() => window.open(getFotoUrl(att.file_path), "_blank")} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-1">Tidak ada lampiran</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <button onClick={() => setSelectedActivity(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Tutup
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  const renderKaryawanView = (): React.JSX.Element => {
    const handleMonthChange = (offset: number) => {
      const newDate = new Date(selectedYear, selectedMonth + offset, 1);
      setSelectedYear(newDate.getFullYear());
      setSelectedMonth(newDate.getMonth());
      setCurrentDate(newDate);
    };

    const userAreas = getUserAreas();
    const calendarDays = getKaryawanCalendarDays();

    const currentArea = getCurrentArea();

    return (
      <>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6 bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
            <h3 className="text-base sm:text-lg font-bold text-gray-900 text-center sm:text-left">{currentDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}</h3>

            <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto">
              {userAreas.length > 1 && (
                <select
                  value={selectedArea}
                  onChange={(e) => setSelectedArea(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                >
                  {userAreas.map((area) => (
                    <option key={area.id} value={area.id.toString()}>
                      {area.name}
                    </option>
                  ))}
                </select>
              )}

              <div className="flex items-center justify-center gap-2">
                <button onClick={() => handleMonthChange(-1)} className="p-2 sm:p-3 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow active:scale-95">
                  <ChevronLeft size={18} className="text-gray-700 sm:w-5 sm:h-5" />
                </button>

                <button onClick={() => handleMonthChange(1)} className="p-2 sm:p-3 rounded-full bg-white shadow-sm flex items-center justify-center hover:shadow-md transition-shadow active:scale-95">
                  <ChevronRight size={18} className="text-gray-700 sm:w-5 sm:h-5" />
                </button>
              </div>
            </div>

            {/* Styling tambahan untuk mobile */}
            <style>
              {`
      @media (max-width: 640px) {
        select {
          font-size: 14px;
          padding: 8px 10px;
        }

        button svg {
          width: 16px;
          height: 16px;
        }
      }
    `}
            </style>
          </div>

          <div className="grid grid-cols-7 gap-2 mb-4">
            {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map((day) => (
              <div key={day} className="text-center text-xs text-gray-500 font-medium">
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {calendarDays.map((day, index) => {
              const dayOfWeek = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date).getDay();
              const colStart = index === 0 ? dayOfWeek + 1 : undefined;

              const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day.date);
              const selectedAreaObj = areas.find((a) => a.id.toString() === selectedArea);
              const isDefaultArea = !!selectedAreaObj?.is_default;

              const activityForDay = activities.find((a) => a.work_area?.id.toString() === selectedArea && new Date(a.date).toLocaleDateString("id-ID") === clickedDate.toLocaleDateString("id-ID"));

              const isProduction = user?.department?.name === "Production";
              const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

              let dayStatus = "empty";
              if (isDefaultArea) {
                if (day.hasReport) dayStatus = "has-report";
                else if (day.isToday && !day.hasReport) dayStatus = "today-empty";
                else if (day.isPast && !day.hasReport) dayStatus = "past-empty";
              } else {
                if (day.hasReport) dayStatus = "has-report";
                else if (day.isToday && !day.hasReport) dayStatus = "today-empty";
              }

              // 🔧 Warna weekend untuk non-production
              let dayClass = "";
              if (!isProduction && isWeekend) {
                dayClass = "bg-gray-200 text-gray-400 border border-gray-300 cursor-not-allowed";
              } else {
                dayClass =
                  dayStatus === "has-report"
                    ? "bg-green-100 text-green-800 border border-green-200"
                    : dayStatus === "today-empty"
                    ? "bg-blue-100 text-blue-800 border border-blue-200 hover:bg-blue-200"
                    : dayStatus === "past-empty"
                    ? "bg-red-100 text-red-800 border border-red-200"
                    : "bg-gray-100 text-gray-500 border border-gray-200 hover:bg-gray-200";
              }

              return (
                <motion.div
                  key={day.date}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    if (day.hasReport && activityForDay) {
                      setSelectedActivity(activityForDay);
                    } else if (day.isToday && !day.hasReport) {
                      const dateString = clickedDate.toISOString().split("T")[0];
                      navigate(`/genba/genbaactivity/formgenbaactivity?area=${selectedArea}`);
                    } else if (day.isPast && !day.hasReport && !isDefaultArea) {
                      return;
                    }
                  }}
                  className={`h-12 rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer ${dayClass}`}
                  style={colStart ? { gridColumnStart: colStart } : undefined}
                >
                  <span className="text-sm font-medium">{day.date}</span>

                  {!(!isProduction && isWeekend) && (
                    <>
                      {dayStatus === "has-report" && <CheckCircle size={12} className="mt-1" />}
                      {isDefaultArea && dayStatus === "past-empty" && <AlertCircle size={12} className="mt-1" />}
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Statistik mengikuti area terpilih */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard title="Score Bulan Ini" value={`${getCurrentMonthScore().toFixed(0)}%`} icon={<CheckCircle className="w-6 h-6" />} color="blue" />
          <StatCard title="Total Laporan" value={activities.filter((a) => a.work_area?.id.toString() === selectedArea && new Date(a.date).getMonth() === selectedMonth).length} icon={<Calendar className="w-6 h-6" />} color="blue" />
          <StatCard title="Area Bertanggung Jawab" value={`${userAreas.length} Area`} icon={<MapPin className="w-6 h-6" />} color="blue" />
        </div>

        {/* Profil Pelapor dan Map */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Pelapor</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <User1 className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.name || "User"}</p>
                    <p className="text-sm text-gray-500">NIK: {user?.nik || "N/A"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Department:</span>
                    <span className="font-medium">{user?.department?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pengawas Area:</span>
                    <span className="font-medium">{currentArea?.pic?.name || "Unknown"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Komite 5S:</span>
                    <span className="font-medium">
                      {user?.genbaSoRole?.role_name
                        ? user.genbaSoRole.role_name
                            .split(" ")
                            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                            .join(" ")
                        : "Unkown"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Map of the Path</h3>
              <div className="bg-gray-100 rounded-xl w-full flex items-center justify-center overflow-hidden">
                {currentArea?.attachment && currentArea.attachment.length > 0 ? (
                  <div className={`${currentArea?.attachment && currentArea.attachment.length > 0 ? "bg-transparent" : "bg-gray-100"} rounded-xl w-full md:h-80 flex items-center justify-center overflow-hidden`}>
                    {currentArea.attachment.map((file, index) => {
                      const imageUrl = getFotoUrl(file.path);
                      return (
                        <div key={index} className="w-full aspect-[4/3] flex items-center justify-center bg-white rounded-xl shadow-sm hover:shadow-md transition-all">
                          <img src={imageUrl} alt={file.filename} className="w-full h-full object-contain rounded-xl cursor-pointer hover:opacity-90 transition" onClick={() => window.open(imageUrl, "_blank")} />
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 text-sm">Tidak ada denah area</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Score Overview */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Score Overview Area Bertanggung Jawab</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {userAreas.map((area) => {
              const areaActivities = activities.filter((a) => a.work_area?.id.toString() === area.id.toString() && new Date(a.date || "").getMonth() === selectedMonth);
              const totalDays = new Date(selectedYear, selectedMonth + 1, 0).getDate();
              const uniqueDays = new Set(areaActivities.map((a) => new Date(a.date).toLocaleDateString("id-ID"))).size;
              // LOGIKA PERBAIKAN: Hitung skor hanya jika is_default: true
              const areaIsDefault = !!area.is_default;
              const rawScore = totalDays > 0 ? (uniqueDays / totalDays) * 100 : 0;
              // Jika non-default, score adalah 0
              const score = areaIsDefault ? rawScore : 0;

              return (
                <div key={area.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold text-gray-900">{area.name}</h4>
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
                    <span>{uniqueDays} hari aktif</span>
                    <span>{Math.round(score)}% tercover</span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedActivity && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 backdrop-brightness-50 bg-opacity-50 flex items-center justify-center z-50 p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="p-6 border-b border-gray-200">
                  <div className="flex justify-between items-center">
                    <h2 className="text-xl font-bold text-gray-900">Form Laporan Harian</h2>
                    <button onClick={() => setSelectedActivity(null)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <X size={20} />
                    </button>
                  </div>
                  <p className="text-gray-900 text-sm mt-1">Tanggal: {selectedActivity?.date ? new Date(selectedActivity.date).toLocaleDateString("id-ID") : "-"}</p>
                </div>

                {/* Body */}
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nama</label>
                    <input type="text" value={selectedActivity?.reporter?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                    <input type="text" value={selectedActivity?.reporter?.nik ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                    <input type="text" value={selectedActivity?.reporter?.department?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Komite 5S</label>
                    <input
                      type="text"
                      value={`${
                        selectedActivity?.committee_role?.name
                          .split(" ")
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(" ") ?? "-"
                      }`}
                      disabled
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
                    <input type="text" value={selectedActivity?.date ? new Date(selectedActivity.date).toLocaleDateString("id-ID") : "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                    <input type="text" value={selectedActivity?.work_area?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Penanggung Jawab Area</label>
                    <input type="text" value={selectedActivity?.work_area?.pic?.name ?? "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Keterangan</label>
                    <textarea value={selectedActivity?.keterangan ?? "-"} disabled rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 resize-none" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lampiran Foto</label>
                    {selectedActivity?.attachment?.length ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
                        {selectedActivity.attachment.map((att, index) => (
                          <div key={index} className="relative">
                            <img src={getFotoUrl(att.file_path)} alt={`Lampiran ${index + 1}`} className="w-full h-24 object-cover rounded-lg cursor-pointer" onClick={() => window.open(getFotoUrl(att.file_path), "_blank")} />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-600 mt-1">Tidak ada lampiran</p>
                    )}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-200 flex gap-3">
                  <button onClick={() => setSelectedActivity(null)} className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors">
                    Tutup
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    );
  };

  const renderKomiteView = (): React.JSX.Element => {
    const currentDepartment = user?.department?.name || "-";
    const uniqueEmployees = getUniqueEmployees().filter((emp) => emp.department?.name === currentDepartment);
    const filteredEmployees = uniqueEmployees.filter((employee: User) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nik.includes(searchTerm));
    const isKomiteDept = userRoles.some((r) => r.name.toLowerCase().includes("komite 5s department"));
    const isKoordinatorDept = userRoles.some((r) => r.name.toLowerCase().includes("koordinator 5s department"));

    if (detailView && detailView.type === "area") {
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

              {!isKomiteDept && (
                <>
                  <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value={2023}>2023</option>
                    <option value={2024}>2024</option>
                    <option value={2025}>2025</option>
                  </select>
                  <select value={selectedMonth} onChange={(e) => setSelectedMonth(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i} value={i}>
                        {new Date(2024, i).toLocaleDateString("id-ID", { month: "long" })}
                      </option>
                    ))}
                  </select>
                </>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Score Department" value={`${getDepartmentScore(currentDepartment, selectedMonth, selectedYear).toFixed(0)}%`} icon={<BarChart3 className="w-6 h-6" />} color="blue" />
            <StatCard title="Total Karyawan" value={filteredEmployees.length} icon={<Users className="w-6 h-6" />} color="blue" />
            <StatCard
              title="Karyawan Aktif"
              value={
                filteredEmployees.filter((emp) => {
                  const today = formatDate(new Date());
                  return activities.some((a) => a.reporter?.nik === emp.nik && new Date(a.date).toLocaleDateString("id-ID") === today);
                }).length
              }
              icon={<CheckCircle className="w-6 h-6" />}
              color="blue"
            />
            <StatCard
              title="Rata-rata Score"
              value={filteredEmployees.length > 0 ? `${(filteredEmployees.reduce((sum, emp) => sum + getEmployeeMonthlyScore(emp.nik, selectedMonth, selectedYear), 0) / filteredEmployees.length).toFixed(0)}%` : "0%"}
              icon={<BarChart3 className="w-6 h-6" />}
              color="blue"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Nama PIC</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NIK</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Area</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status Hari Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Total Laporan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {areas
                  .filter((area) => {
                    const sameDepartment = area.department?.id?.toString() === user?.department?.id?.toString();
                    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || area.pic?.name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesDeptSelection = !selectedDepartment || area.department?.name === selectedDepartment;
                    return sameDepartment && matchesDeptSelection && matchesSearch;
                  })

                  .map((area) => {
                    const areaActivities = activities.filter((a) => a.genba_work_area_id === area.id && new Date(a.date).getMonth() === selectedMonth && new Date(a.date).getFullYear() === selectedYear);
                    const totalReports = areaActivities.length;
                    const score = getAreaMonthlyScore(area.id, selectedMonth, selectedYear);
                    const todayStr = new Date().toLocaleDateString("id-ID");
                    const isDailyReport = !!area.is_default;
                    const hasReportToday = areaActivities.some((a) => new Date(a.date).toLocaleDateString("id-ID") === todayStr);

                    const statusHariIni = isDailyReport ? (
                      hasReportToday ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sudah Lapor</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Belum Lapor</span>
                      )
                    ) : (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Non-Daily</span>
                    );

                    return (
                      <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{area.pic?.name || "-"}</td>
                        <td className="py-3 text-sm">{area.pic?.nik || "-"}</td>
                        <td className="py-3 text-sm">{area.department?.name || "-"}</td>
                        <td className="py-3 text-sm font-semibold">{area.name}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{score.toFixed(0)}%</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{statusHariIni}</td>
                        <td className="py-3 text-sm">{totalReports}</td>
                        <td className="py-3">
                          <button onClick={() => setDetailView({ type: "area", data: area })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

  const renderManagementView = (): React.JSX.Element => {
    const departmentsList = Array.from(new Set(areas.map((area) => area.department?.name).filter(Boolean) as string[]));
    const uniqueEmployees = getUniqueEmployees();
    const filteredEmployees = uniqueEmployees
      .filter((employee) => !selectedDepartment || employee.department?.name === selectedDepartment)
      .filter((employee) => employee.name.toLowerCase().includes(searchTerm.toLowerCase()) || employee.nik.includes(searchTerm));

    if (detailView && detailView.type === "area") {
      return renderEmployeeDetail(detailView.data);
    }

    // ✅ Hitung total laporan bulan ini saja
    const monthlyActivities = activities.filter((a) => new Date(a.date).getMonth() === selectedMonth && new Date(a.date).getFullYear() === selectedYear);

    // ✅ Hitung rata-rata skor (berdasarkan skor area yang benar)
    const departmentScores = departmentsList.map((dept) => getDepartmentScore(dept, selectedMonth, selectedYear));
    const averageScore = departmentScores.length > 0 ? departmentScores.reduce((a, b) => a + b, 0) / departmentScores.length : 0;

    return (
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Executive Dashboard 5S</h3>
            <div className="flex gap-3">
              <motion.button
                onClick={handleExportActivitiesPDF}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="px-4 py-2 rounded-lg bg-blue-600 text-white shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center"
              >
                <Download className="mr-2 h-4 w-4" /> Export PDF
              </motion.button>
              <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value={2023}>2023</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
              </select>
              <select
                value={selectedMonth} // Menggunakan state selectedMonth
                onChange={(e) => setSelectedMonth(Number(e.target.value))} // Mengupdate state
                className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {/* Array bulan untuk opsi, index 0=Januari hingga 11=Desember */}
                {["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"].map((month, index) => (
                  <option key={index} value={index}>
                    {month}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard title="Total Department" value={departmentsList.length} subtext="Active departments" icon={<Building2 className="w-6 h-6" />} color="blue" />
            <StatCard title="Total Karyawan" value={uniqueEmployees.length} subtext="Registered employees" icon={<Users className="w-6 h-6" />} color="blue" />
            <StatCard title="Total Laporan" value={monthlyActivities.length} subtext="This month" icon={<FileText className="w-6 h-6" />} color="blue" />
            <StatCard title="Rata-rata Score" value={`${averageScore.toFixed(0)}%`} subtext="Company wide" icon={<BarChart3 className="w-6 h-6" />} color="blue" />
          </div>

          {/* Performance per Department */}
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
                  {departmentsList.map((dept) => {
                    const score = getDepartmentScore(dept, selectedMonth, selectedYear);
                    const deptEmployees = uniqueEmployees.filter((emp) => emp.department?.name === dept);
                    const activeEmployees = deptEmployees.filter((emp) => {
                      const today = formatDate(new Date());
                      return activities.some((a) => a.reporter?.nik === emp.nik && new Date(a.date).toLocaleDateString("id-ID") === today);
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

        {/* Laporan per Area */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-md p-6 border border-blue-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 space-y-4 md:space-y-0">
            <h3 className="text-lg font-bold text-gray-900">Laporan Per Area</h3>
            <div className="flex gap-3">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari area atau karyawan..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <select value={selectedDepartment} onChange={(e) => setSelectedDepartment(e.target.value)} className="px-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Semua Department</option>
                {departmentsList.map((dept) => (
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
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Nama PIC</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">NIK</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Department</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Area</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Score Bulan Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Status Hari Ini</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Total Laporan</th>
                  <th className="text-left py-3 text-sm font-medium text-gray-500">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {areas
                  .filter((area) => (!selectedDepartment || area.department?.name === selectedDepartment) && (area.name.toLowerCase().includes(searchTerm.toLowerCase()) || area.pic?.name.toLowerCase().includes(searchTerm.toLowerCase())))
                  .map((area) => {
                    const areaActivities = activities.filter((a) => a.genba_work_area_id === area.id && new Date(a.date).getMonth() === selectedMonth && new Date(a.date).getFullYear() === selectedYear);
                    const totalReports = areaActivities.length;
                    const score = getAreaMonthlyScore(area.id, selectedMonth, selectedYear);
                    const todayStr = new Date().toLocaleDateString("id-ID");
                    const isDailyReport = !!area.is_default;
                    const hasReportToday = areaActivities.some((a) => new Date(a.date).toLocaleDateString("id-ID") === todayStr);

                    const statusHariIni = isDailyReport ? (
                      hasReportToday ? (
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">Sudah Lapor</span>
                      ) : (
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">Belum Lapor</span>
                      )
                    ) : (
                      <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-xs font-medium">Non-Daily</span>
                    );

                    return (
                      <tr key={area.id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 text-sm font-medium">{area.pic?.name || "-"}</td>
                        <td className="py-3 text-sm">{area.pic?.nik || "-"}</td>
                        <td className="py-3 text-sm">{area.department?.name || "-"}</td>
                        <td className="py-3 text-sm font-semibold">{area.name}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{score.toFixed(0)}%</span>
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div className={`h-2 rounded-full ${score >= 80 ? "bg-green-500" : score >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${score}%` }}></div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3">{statusHariIni}</td>
                        <td className="py-3 text-sm">{totalReports}</td>
                        <td className="py-3">
                          <button onClick={() => setDetailView({ type: "area", data: area })} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
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

  const renderViewContent = (): React.JSX.Element => {
    if (isLoading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (detailView) {
      return renderEmployeeDetail(detailView.data);
    }

    switch (viewMode) {
      case "karyawan":
        return renderKaryawanView();
      case "komite":
        return renderKomiteView();
      case "management":
        return renderManagementView();
      default:
        return renderKaryawanView();
    }
  };

  const currentArea = getCurrentArea();

  return (
    <div className={`flex h-screen font-sans antialiased bg-blue-50`}>
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          mainTitle="Genba Activity"
          mainTitleHighlight="Management"
          description={`Laporan ${viewMode === "karyawan" ? "harian penanggung jawab area kerja" : viewMode === "komite" ? "department untuk komite 5S" : "executive dashboard management"}`}
          icon={<Calendar />}
          isMobile={isMobile}
          toggleSidebar={toggleSidebar}
        />

        <main className="flex-1 overflow-y-auto p-4 md:p-6 custom-scrollbar bg-gray-50">
          {detailView && (
            <div className="mb-4">
              <button onClick={() => setDetailView(null)} className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
                <ArrowLeft size={16} />
                Kembali ke {viewMode === "komite" ? "Komite" : viewMode === "management" ? "Management" : "Karyawan"}
              </button>
            </div>
          )}

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between space-y-5 md:space-y-0">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Genba <span className="text-blue-600">Activity</span>
              </h1>
              <p className="text-gray-600 mt-2 text-sm max-w-xl">
                {viewMode === "karyawan"
                  ? "Effortlessly track, manage, and complete your daily tasks and activities to optimize productivity."
                  : viewMode === "komite"
                  ? "Monitor and manage 5S activities across your department with comprehensive reporting."
                  : "Executive overview of all 5S activities across departments and areas."}
              </p>
            </div>

            {!detailView && userRoles.length > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 px-5 py-2 sm:py-3 w-full sm:w-auto text-center sm:text-left">
                  <span className="text-sm font-medium text-gray-700">{userRoles.find((role) => role.id === viewMode)?.name}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap w-full sm:w-auto">
                  {userRoles.map((role) => {
                    const isActive = viewMode === role.id;
                    const colorMap: Record<string, string> = {
                      karyawan: "from-blue-500 to-blue-600",
                      komite: "from-blue-500 to-blue-600",
                      management: "from-blue-500 to-blue-600",
                    };

                    return (
                      <motion.button
                        key={role.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setViewMode(role.id as "karyawan" | "komite" | "management")}
                        className={`text-sm font-medium px-4 py-2.5 rounded-xl shadow-sm border transition-all duration-200 ${
                          isActive ? `bg-gradient-to-br ${colorMap[role.id] || "from-gray-500 to-gray-600"} text-white border-transparent` : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {role.name}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {renderViewContent()}
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
                  <input type="text" value={user?.name || "User"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">NIK</label>
                  <input type="text" value={user?.nik || "N/A"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Department</label>
                  <input type="text" value={user?.department?.name || "-"} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Komite 5S</label>
                  <input
                    type="text"
                    value={`${
                      user?.genbaSoRole?.role_name
                        .split(" ")
                        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(" ") || "-"
                    }`}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tanggal *</label>
                  <input type="text" value={formatDate(currentDate)} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Area *</label>
                  <select value={selectedArea} onChange={(e) => setSelectedArea(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="">Pilih Area Kerja ...</option>
                    {getUserAreas().map((area) => (
                      <option key={area.id} value={area.id.toString()}>
                        {area.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Penanggung Jawab Area</label>
                  <input type="text" value={currentArea?.pic?.name || ""} disabled className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-600" />
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
                  disabled={!selectedArea || isLoading}
                  className="flex-1 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {isLoading ? "Menyimpan..." : "Save"}
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

      <Modal isOpen={showSuccessModal} onClose={handleCloseSuccessModal} title="Success!">
        <div className="flex flex-col items-center justify-center py-4">
          <CheckCircle className="text-green-500 text-6xl mb-4" />
          <p className="text-lg font-medium text-gray-800 text-center">Genba area has been created successfully!</p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleCloseSuccessModal}
            className="mt-6 px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
          >
            Go to Genba Areas
          </motion.button>
        </div>
      </Modal>
    </div>
  );
};

export default GenbaActivitys;
