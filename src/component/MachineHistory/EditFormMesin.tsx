// Ini bisa di dalam file DashboardView.tsx Anda atau di file terpisah seperti components/EditHistoryForm.tsx
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MachineHistoryRecord, MachineHistoryFormData, AllMasterData } from "../../routes/AuthContext"; // Pastikan path benar

interface EditHistoryFormProps {
  record: MachineHistoryRecord;
  masterData: AllMasterData; // Menerima semua data master
  onSave: (data: Partial<MachineHistoryFormData>) => void;
  onCancel: () => void;
}

const EditHistoryForm: React.FC<EditHistoryFormProps> = ({ record, masterData, onSave, onCancel }) => {
  // Inisialisasi formData dengan nilai dari record yang sedang diedit
  const [formData, setFormData] = useState<Partial<MachineHistoryFormData>>({
    date: record.date,
    shift: record.shift, // Ini adalah nama
    group: record.group, // Ini adalah nama
    stopJam: record.stopJam ?? undefined,
    stopMenit: record.stopMenit ?? undefined,
    startJam: record.startJam ?? undefined,
    startMenit: record.startMenit ?? undefined,
    stopTime: record.stopTime, // Ini adalah nama
    unit: record.unit, // Ini adalah nama
    mesin: record.mesin, // Ini adalah nama
    runningHour: record.runningHour ?? undefined,
    itemTrouble: record.itemTrouble, // Ini adalah nama
    jenisGangguan: record.jenisGangguan,
    bentukTindakan: record.bentukTindakan,
    perbaikanPerawatan: record.perbaikanPerawatan,
    rootCause: record.rootCause,
    jenisAktivitas: record.jenisAktivitas, // Ini adalah nama
    kegiatan: record.kegiatan, // Ini adalah nama
    kodePart: record.kodePart,
    sparePart: record.sparePart,
    idPart: record.idPart,
    jumlah: record.jumlah ?? undefined,
    unitSparePart: record.unitSparePart, // Ini adalah nama
  });

  // Pastikan nilai angka di form tetap number atau undefined, bukan string kosong
  useEffect(() => {
    setFormData({
      date: record.date,
      shift: record.shift,
      group: record.group,
      stopJam: record.stopJam ?? undefined,
      stopMenit: record.stopMenit ?? undefined,
      startJam: record.startJam ?? undefined,
      startMenit: record.startMenit ?? undefined,
      stopTime: record.stopTime,
      unit: record.unit,
      mesin: record.mesin,
      runningHour: record.runningHour ?? undefined,
      itemTrouble: record.itemTrouble,
      jenisGangguan: record.jenisGangguan,
      bentukTindakan: record.bentukTindakan,
      perbaikanPerawatan: record.perbaikanPerawatan,
      rootCause: record.rootCause,
      jenisAktivitas: record.jenisAktivitas,
      kegiatan: record.kegiatan,
      kodePart: record.kodePart,
      sparePart: record.sparePart,
      idPart: record.idPart,
      jumlah: record.jumlah ?? undefined,
      unitSparePart: record.unitSparePart,
    });
  }, [record]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // Handle number inputs to convert value to number or undefined if empty
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData); // Kirim formData ke parent component untuk diproses lebih lanjut
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* SECTION: Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Date
          </label>
          <input type="date" name="date" id="date" value={formData.date || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required />
        </div>
        <div>
          <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
            Shift
          </label>
          <select name="shift" id="shift" value={formData.shift || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required>
            <option value="">Select Shift</option>
            {masterData.shifts.map((s) => (
              <option key={s.id} value={s.name}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
            Group
          </label>
          <select name="group" id="group" value={formData.group || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required>
            <option value="">Select Group</option>
            {masterData.groups.map((g) => (
              <option key={g.id} value={g.name}>
                {g.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="mesin" className="block text-sm font-medium text-gray-700">
            Machine
          </label>
          <select name="mesin" id="mesin" value={formData.mesin || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required>
            <option value="">Select Machine</option>
            {masterData.mesin.map((m) => (
              <option key={m.id} value={m.name}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
            Unit
          </label>
          <select name="unit" id="unit" value={formData.unit || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" required>
            <option value="">Select Unit</option>
            {masterData.units.map((u) => (
              <option key={u.id} value={u.name}>
                {u.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700">
            Running Hour
          </label>
          <input
            type="number"
            name="runningHour"
            id="runningHour"
            value={formData.runningHour ?? ""}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            step="0.1"
          />
        </div>
      </div>

      {/* SECTION: Stop Time Details */}
      <div className="border-t border-blue-100 pt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Stop Time Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700">
              Stop Type
            </label>
            <select name="stopTime" id="stopTime" value={formData.stopTime || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="">Select Stop Type</option>
              {masterData.stoptimes.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700">
              Stop Jam (HH)
            </label>
            <input
              type="number"
              name="stopJam"
              id="stopJam"
              value={formData.stopJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
              max="23"
            />
          </div>
          <div>
            <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700">
              Stop Menit (MM)
            </label>
            <input
              type="number"
              name="stopMenit"
              id="stopMenit"
              value={formData.stopMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
              max="59"
            />
          </div>
          <div>
            <label htmlFor="startJam" className="block text-sm font-medium text-gray-700">
              Start Jam (HH)
            </label>
            <input
              type="number"
              name="startJam"
              id="startJam"
              value={formData.startJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
              max="23"
            />
          </div>
          <div>
            <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700">
              Start Menit (MM)
            </label>
            <input
              type="number"
              name="startMenit"
              id="startMenit"
              value={formData.startMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
              max="59"
            />
          </div>
        </div>
      </div>

      {/* SECTION: Issue Details */}
      <div className="border-t border-blue-100 pt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Issue Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700">
              Item Trouble
            </label>
            <select name="itemTrouble" id="itemTrouble" value={formData.itemTrouble || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="">Select Item Trouble</option>
              {masterData.itemtroubles.map((it) => (
                <option key={it.id} value={it.name}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700">
              Issue Description
            </label>
            <textarea
              name="jenisGangguan"
              id="jenisGangguan"
              value={formData.jenisGangguan || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700">
              Action Taken
            </label>
            <textarea
              name="bentukTindakan"
              id="bentukTindakan"
              value={formData.bentukTindakan || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700">
              Root Cause
            </label>
            <textarea
              name="rootCause"
              id="rootCause"
              value={formData.rootCause || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            ></textarea>
          </div>
          <div>
            <label htmlFor="perbaikanPerawatan" className="block text-sm font-medium text-gray-700">
              Perbaikan/Perawatan
            </label>
            <select
              name="perbaikanPerawatan"
              id="perbaikanPerawatan"
              value={formData.perbaikanPerawatan || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Type</option>
              <option value="perbaikan">Perbaikan</option>
              <option value="perawatan">Perawatan</option>
              {/* Add more options if 'perbaikanPerawatan' has other defined values */}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION: Maintenance Details */}
      <div className="border-t border-blue-100 pt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Maintenance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700">
              Activity Type
            </label>
            <select
              name="jenisAktivitas"
              id="jenisAktivitas"
              value={formData.jenisAktivitas || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Activity Type</option>
              {masterData.jenisaktivitas.map((ja) => (
                <option key={ja.id} value={ja.name}>
                  {ja.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
              Specific Activity
            </label>
            <select name="kegiatan" id="kegiatan" value={formData.kegiatan || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
              <option value="">Select Specific Activity</option>
              {masterData.kegiatans.map((k) => (
                <option key={k.id} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION: Spare Parts Used */}
      <div className="border-t border-blue-100 pt-4">
        <h3 className="text-lg font-semibold mb-2 text-gray-800">Spare Parts Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="kodePart" className="block text-sm font-medium text-gray-700">
              Part Code
            </label>
            <input type="text" name="kodePart" id="kodePart" value={formData.kodePart || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700">
              Part Name
            </label>
            <input
              type="text"
              name="sparePart"
              id="sparePart"
              value={formData.sparePart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            />
          </div>
          <div>
            <label htmlFor="idPart" className="block text-sm font-medium text-gray-700">
              ID Part
            </label>
            <input type="text" name="idPart" id="idPart" value={formData.idPart || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm" />
          </div>
          <div>
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="jumlah"
              id="jumlah"
              value={formData.jumlah ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              min="0"
            />
          </div>
          <div>
            <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700">
              Unit Spare Part
            </label>
            <select
              name="unitSparePart"
              id="unitSparePart"
              value={formData.unitSparePart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            >
              <option value="">Select Unit</option>
              {masterData.unitspareparts.map((usp) => (
                <option key={usp.id} value={usp.name}>
                  {usp.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t border-blue-100">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Batal
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Simpan Perubahan
        </motion.button>
      </div>
    </form>
  );
};

export default EditHistoryForm; 
