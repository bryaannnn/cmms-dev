import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MachineHistoryRecord, MachineHistoryFormData, AllMasterData } from "../../routes/AuthContext";
import { FiSearch } from "react-icons/fi";

interface EditHistoryFormProps {
  record: MachineHistoryRecord;
  masterData: AllMasterData;
  onSave: (data: Partial<MachineHistoryFormData>) => void;
  onCancel: () => void;
}

const EditHistoryForm: React.FC<EditHistoryFormProps> = ({ record, masterData, onSave, onCancel }) => {
  const [machineSearch, setMachineSearch] = useState("");
  const [itemTroubleSearch, setItemTroubleSearch] = useState("");
  const [kegiatanSearch, setKegiatanSearch] = useState("");
  const [formData, setFormData] = useState<Partial<MachineHistoryFormData>>({
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
    if (type === "number") {
      setFormData((prev) => ({ ...prev, [name]: value === "" ? undefined : Number(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const filteredMachines = masterData.mesin.filter((machine) => machine.name.toLowerCase().includes(machineSearch.toLowerCase()));

  const filteredItemTroubles = masterData.itemtroubles.filter((item) => item.name.toLowerCase().includes(itemTroubleSearch.toLowerCase()));

  const filteredKegiatans = masterData.kegiatans.filter((kegiatan) => kegiatan.name.toLowerCase().includes(kegiatanSearch.toLowerCase()));

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-4 bg-white rounded-xl shadow-md">
      {/* SECTION: Basic Information */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="date" className="block text-sm font-medium text-gray-700">
              Date
            </label>
            <input
              type="date"
              name="date"
              id="date"
              value={formData.date || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              required
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
              Shift
            </label>
            <select name="shift" id="shift" value={formData.shift || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" required>
              <option value="">Select Shift</option>
              {masterData.shifts.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="group" className="block text-sm font-medium text-gray-700">
              Group
            </label>
            <select name="group" id="group" value={formData.group || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" required>
              <option value="">Select Group</option>
              {masterData.groups.map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="mesin" className="block text-sm font-medium text-gray-700">
              Machine
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search machines..."
                value={machineSearch}
                onChange={(e) => setMachineSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              />
            </div>
            <select name="mesin" id="mesin" value={formData.mesin || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" required>
              <option value="">Select Machine</option>
              {filteredMachines.map((m) => (
                <option key={m.id} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <select name="unit" id="unit" value={formData.unit || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border" required>
              <option value="">Select Unit</option>
              {masterData.units.map((u) => (
                <option key={u.id} value={u.name}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700">
              Running Hour
            </label>
            <input
              type="number"
              name="runningHour"
              id="runningHour"
              value={formData.runningHour ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              step="0.1"
            />
          </div>
        </div>
      </div>

      {/* SECTION: Downtime Details */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Downtime Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700">
              Downtime Type
            </label>
            <select name="stopTime" id="stopTime" value={formData.stopTime || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              <option value="">Select Downtime Type</option>
              {masterData.stoptimes.map((st) => (
                <option key={st.id} value={st.name}>
                  {st.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700">
              Stop Hour (HH)
            </label>
            <input
              type="number"
              name="stopJam"
              id="stopJam"
              value={formData.stopJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
              max="23"
              placeholder="00-23"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700">
              Stop Minute (MM)
            </label>
            <input
              type="number"
              name="stopMenit"
              id="stopMenit"
              value={formData.stopMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
              max="59"
              placeholder="00-59"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="startJam" className="block text-sm font-medium text-gray-700">
              Start Hour (HH)
            </label>
            <input
              type="number"
              name="startJam"
              id="startJam"
              value={formData.startJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
              max="23"
              placeholder="00-23"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700">
              Start Minute (MM)
            </label>
            <input
              type="number"
              name="startMenit"
              id="startMenit"
              value={formData.startMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
              max="59"
              placeholder="00-59"
            />
          </div>
        </div>
      </div>

      {/* SECTION: Issue Details */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Issue Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700">
              Problem Item
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search problem items..."
                value={itemTroubleSearch}
                onChange={(e) => setItemTroubleSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              />
            </div>
            <select
              name="itemTrouble"
              id="itemTrouble"
              value={formData.itemTrouble || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Select Problem Item</option>
              {filteredItemTroubles.map((it) => (
                <option key={it.id} value={it.name}>
                  {it.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700">
              Problem Description
            </label>
            <textarea
              name="jenisGangguan"
              id="jenisGangguan"
              value={formData.jenisGangguan || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            ></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700">
              Action Taken
            </label>
            <textarea
              name="bentukTindakan"
              id="bentukTindakan"
              value={formData.bentukTindakan || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            ></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700">
              Root Cause
            </label>
            <textarea
              name="rootCause"
              id="rootCause"
              value={formData.rootCause || ""}
              onChange={handleChange}
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            ></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="perbaikanPerawatan" className="block text-sm font-medium text-gray-700">
              Repair/Maintenance Type
            </label>
            <select
              name="perbaikanPerawatan"
              id="perbaikanPerawatan"
              value={formData.perbaikanPerawatan || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Select Type</option>
              <option value="perbaikan">Repair</option>
              <option value="perawatan">Maintenance</option>
            </select>
          </div>
        </div>
      </div>

      {/* SECTION: Maintenance Details */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Maintenance Details</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700">
              Activity Type
            </label>
            <select
              name="jenisAktivitas"
              id="jenisAktivitas"
              value={formData.jenisAktivitas || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            >
              <option value="">Select Activity Type</option>
              {masterData.jenisaktivitas.map((ja) => (
                <option key={ja.id} value={ja.name}>
                  {ja.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
              Specific Activity
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FiSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search activities..."
                value={kegiatanSearch}
                onChange={(e) => setKegiatanSearch(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              />
            </div>
            <select name="kegiatan" id="kegiatan" value={formData.kegiatan || ""} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border">
              <option value="">Select Specific Activity</option>
              {filteredKegiatans.map((k) => (
                <option key={k.id} value={k.name}>
                  {k.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION: Spare Parts Used */}
      <div className="bg-gray-50 p-6 rounded-lg shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">Spare Parts Used</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label htmlFor="kodePart" className="block text-sm font-medium text-gray-700">
              Part Code
            </label>
            <input
              type="text"
              name="kodePart"
              id="kodePart"
              value={formData.kodePart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700">
              Part Name
            </label>
            <input
              type="text"
              name="sparePart"
              id="sparePart"
              value={formData.sparePart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="idPart" className="block text-sm font-medium text-gray-700">
              Part ID
            </label>
            <input
              type="text"
              name="idPart"
              id="idPart"
              value={formData.idPart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input
              type="number"
              name="jumlah"
              id="jumlah"
              value={formData.jumlah ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
              min="0"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700">
              Part Unit
            </label>
            <select
              name="unitSparePart"
              id="unitSparePart"
              value={formData.unitSparePart || ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border"
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

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
        <motion.button
          type="button"
          onClick={onCancel}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          Cancel
        </motion.button>
        <motion.button
          type="submit"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
        >
          Save Changes
        </motion.button>
      </div>
    </form>
  );
};

export default EditHistoryForm;
