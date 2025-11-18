import React from "react";
import { Document, Page, Text, View, StyleSheet, Image, Font } from "@react-pdf/renderer";

// --- Interfaces (Sesuaikan dengan yang ada di GenbaActivity.tsx) ---
interface GenbaPhotoBase64 {
  base64_data: string;
  file_path: string;
}

interface GenbaActivity {
  id: number;
  date: string;
  keterangan: string;
  reporter?: { name: string; nik: string };
  work_area?: { name: string; department?: { name: string } };
  all_photos_base64: GenbaPhotoBase64[];
  attachment: any[];
}

interface DepartmentScore {
  department: string;
  score: number;
}

interface PDFProps {
  activitiesToExport: GenbaActivity[];
  departmentScores: DepartmentScore[];
  period: string;
  filterDisplay: string;
  totalActivity: number;
}

// 1. Definisikan Stylesheet
// Catatan: react-pdf menggunakan Flexbox untuk layout, bukan CSS biasa.
const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 35,
  },
  // Cover
  coverContainer: {
    flexGrow: 1,
    backgroundColor: "#3b82f6", // blue-600
    justifyContent: "center",
    alignItems: "center",
  },
  coverTitle: {
    fontSize: 24,
    color: "#ffffff",
    textAlign: "center",
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 14,
    color: "#ffffff",
    textAlign: "center",
  },
  // Header & Summary
  header: {
    backgroundColor: "#3b82f6",
    padding: 10,
    marginBottom: 10,
  },
  headerText: {
    fontSize: 16,
    color: "#ffffff",
    textAlign: "center",
  },
  summaryText: {
    fontSize: 11,
    marginBottom: 5,
    color: "#374151",
  },
  // Table
  table: {
    width: "auto",
    marginBottom: 15,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableColHeader: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#eff6ff",
    padding: 5,
  },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    padding: 5,
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#1f2937",
  },
  tableCell: {
    fontSize: 8,
    color: "#1f2937",
  },
  // Image
  imageTitle: {
    fontSize: 14,
    marginTop: 15,
    marginBottom: 10,
  },
  imageSection: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  imageWrapper: {
    width: "49%", // 2 images per row
    marginBottom: 15,
    padding: 5,
    border: "1pt solid #ccc",
  },
  image: {
    width: "100%",
    maxHeight: 180, // Kontrol tinggi maksimum
    objectFit: "cover",
  },
  imageCaption: {
    fontSize: 7,
    textAlign: "center",
    marginTop: 4,
  },
});

const GenbaActivityPDF: React.FC<PDFProps> = ({ activitiesToExport, departmentScores, period, filterDisplay, totalActivity }) => {
  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" });
  const getFileName = (filePath: string) => filePath.split("/").pop() || "Unnamed File";

  const tableColumn = ["Tanggal", "Reporter", "Area Kerja", "Department", "Keterangan Singkat", "Lampiran"];

  return (
    <Document>
      {/* 1. COVER PAGE */}
      <Page size="A4" style={styles.coverContainer}>
        <Text style={styles.coverTitle}>LAPORAN AKTIVITAS GENBA</Text>
        <Text style={styles.coverSubtitle}>{`Periode: ${period}`}</Text>
        <Text style={styles.coverSubtitle}>{`Dibuat pada: ${new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" })}`}</Text>
      </Page>

      {/* 2. SUMMARY AND SCORE PAGE */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerText}>RINGKASAN STATISTIK DAN SKOR</Text>
        </View>
        <Text style={styles.summaryText}>{`Periode: ${period}`}</Text>
        <Text style={styles.summaryText}>{`Filter Area: ${filterDisplay}`}</Text>
        <Text style={[styles.summaryText, { marginBottom: 15 }]}>{`Total Aktivitas: ${totalActivity}`}</Text>

        {/* Score Table */}
        <Text style={{ fontSize: 14, marginBottom: 5, fontWeight: "bold", color: "#1f2937" }}>SKOR PER DEPARTMENT</Text>
        <View style={[styles.table, { width: "50%" }]}>
          <View style={styles.tableRow} fixed>
            <View style={[styles.tableColHeader, { width: "60%" }]}>
              <Text style={styles.tableCellHeader}>Department</Text>
            </View>
            <View style={[styles.tableColHeader, { width: "40%" }]}>
              <Text style={styles.tableCellHeader}>Skor (%)</Text>
            </View>
          </View>
          {departmentScores.map((data, index) => (
            <View key={index} style={styles.tableRow} wrap={false}>
              <View style={[styles.tableCol, { width: "60%" }]}>
                <Text style={styles.tableCell}>{data.department}</Text>
              </View>
              <View style={[styles.tableCol, { width: "40%" }]}>
                <Text style={styles.tableCell}>{Math.round(data.score)}</Text>
              </View>
            </View>
          ))}
        </View>
      </Page>

      {/* 3. DETAIL ACTIVITIES PAGE */}
      <Page size="A4" style={styles.page} wrap>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>DETAIL LAPORAN AKTIVITAS</Text>
        </View>
        <Text style={styles.summaryText}>{`Total Aktivitas: ${activitiesToExport.length}`}</Text>

        {/* Main Activity Table */}
        <View style={styles.table}>
          <View style={styles.tableRow} fixed>
            {tableColumn.map((col, index) => (
              <View key={index} style={[styles.tableColHeader, { width: index === 4 ? "25%" : index === 5 ? "15%" : "10%" }]}>
                <Text style={styles.tableCellHeader}>{col}</Text>
              </View>
            ))}
          </View>
          {activitiesToExport.map((activity, rowIndex) => {
            const attachmentDetails = activity.attachment && activity.attachment.length > 0 ? activity.attachment.map((att: any, index: number) => `${index + 1}. ${att.filename || "File Lampiran"}`).join("\n") : "-";
            const keterangann = activity.keterangan ? activity.keterangan.substring(0, 70) + (activity.keterangan.length > 70 ? "..." : "") : "-";

            return (
              <View key={rowIndex} style={styles.tableRow} wrap={false}>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>{formatDate(activity.date)}</Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>{activity.reporter?.name || "-"}</Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>{activity.work_area?.name || "-"}</Text>
                </View>
                <View style={[styles.tableCol, { width: "10%" }]}>
                  <Text style={styles.tableCell}>{activity.work_area?.department?.name || "-"}</Text>
                </View>
                <View style={[styles.tableCol, { width: "25%" }]}>
                  <Text style={styles.tableCell}>{keterangann}</Text>
                </View>
                <View style={[styles.tableCol, { width: "15%" }]}>
                  <Text style={styles.tableCell}>{attachmentDetails}</Text>
                </View>
              </View>
            );
          })}
        </View>
      </Page>

      {/* 4. DETAIL IMAGE PAGES */}
      <Page size="A4" style={styles.page} break>
        <View style={styles.header} fixed>
          <Text style={styles.headerText}>DOKUMENTASI FOTO (LAMPIRAN)</Text>
        </View>

        {activitiesToExport.map(
          (activity, index) =>
            activity.all_photos_base64 &&
            activity.all_photos_base64.length > 0 && (
              <View key={index} wrap={false} style={{ marginBottom: 15, borderBottom: "1pt solid #ccc", paddingBottom: 10 }}>
                <Text style={styles.imageTitle}>{`Aktivitas Tgl ${formatDate(activity.date)} - ${activity.work_area?.name || "Area"}`}</Text>

                <View style={styles.imageSection}>
                  {activity.all_photos_base64.map((photo, photoIndex) => {
                    const imageSrc = photo.base64_data;
                    const fileName = getFileName(photo.file_path);

                    // PENTING: <Image> Menerima Base64 Data URL (string) secara langsung
                    return (
                      <View key={photoIndex} style={styles.imageWrapper} break>
                        {imageSrc ? (
                          <Image src={imageSrc} style={styles.image} />
                        ) : (
                          <View style={[styles.image, { backgroundColor: "#f0f0f0", justifyContent: "center", alignItems: "center" }]}>
                            <Text style={{ color: "red", fontSize: 8 }}>[Gambar Tidak Ditemukan]</Text>
                          </View>
                        )}
                        <Text style={styles.imageCaption}>{fileName}</Text>
                        <Text style={styles.imageCaption}>{`Oleh: ${activity.reporter?.name || "-"}, Tgl: ${formatDate(activity.date)}`}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            )
        )}
      </Page>
    </Document>
  );
};

export default GenbaActivityPDF;
