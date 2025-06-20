import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MachineHistoryRecord, MachineHistoryFormData, AllMasterData } from "../../routes/AuthContext";
import Select from "react-select";

interface EditHistoryFormProps {
  record: MachineHistoryRecord;
  masterData: AllMasterData;
  onSave: (data: Partial<MachineHistoryFormData>) => void;
  onCancel: () => void;
}

const EditHistoryForm: React.FC<EditHistoryFormProps> = ({ record, masterData, onSave, onCancel }) => {
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

  const handleSelectChange = (selectedOption: { value: string; label: string } | null, actionMeta: { name?: string }) => {
    if (actionMeta.name) {
      setFormData((prev) => ({
        ...prev,
        [actionMeta.name!]: selectedOption ? selectedOption.value : "",
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  // Define a common className for all input and select fields
  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm p-2 border bg-white";
  const selectClassName = "mt-1 block w-full rounded-md shadow-sm sm:text-sm";
  const selectPrefixClassName = "react-select"; // For react-select

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
            <input type="date" name="date" id="date" value={formData.date || ""} onChange={handleChange} className={inputClassName} required />
          </div>
          <div className="space-y-1">
            <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
              Shift
            </label>
            <Select
              inputId="shift"
              name="shift"
              options={masterData.shifts.map((s) => ({ value: s.name, label: s.name }))}
              value={formData.shift ? { value: formData.shift, label: formData.shift } : null}
              onChange={handleSelectChange}
              placeholder="Select Shift"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="group" className="block text-sm font-medium text-gray-700">
              Group
            </label>
            <Select
              inputId="group"
              name="group"
              options={masterData.groups.map((g) => ({ value: g.name, label: g.name }))}
              value={formData.group ? { value: formData.group, label: formData.group } : null}
              onChange={handleSelectChange}
              placeholder="Select Group"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>

          {/* Machine Select (Menggunakan react-select) */}
          <div className="space-y-1">
            <label htmlFor="mesin" className="block text-sm font-medium text-gray-700">
              Machine
            </label>
            <Select
              inputId="mesin"
              name="mesin"
              options={masterData.mesin.map((m) => ({ value: m.name, label: m.name }))}
              value={formData.mesin ? { value: formData.mesin, label: formData.mesin } : null}
              onChange={handleSelectChange}
              placeholder="Select or search machine..."
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              Unit
            </label>
            <Select
              inputId="unit"
              name="unit"
              options={masterData.units.map((u) => ({ value: u.name, label: u.name }))}
              value={formData.unit ? { value: formData.unit, label: formData.unit } : null}
              onChange={handleSelectChange}
              placeholder="Select Unit"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700">
              Running Hour
            </label>
            <input type="number" name="runningHour" id="runningHour" value={formData.runningHour ?? ""} onChange={handleChange} className={inputClassName} step="0.1" />
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
            <Select
              inputId="stopTime"
              name="stopTime"
              options={masterData.stoptimes.map((st) => ({ value: st.name, label: st.name }))}
              value={formData.stopTime ? { value: formData.stopTime, label: formData.stopTime } : null}
              onChange={handleSelectChange}
              placeholder="Select Downtime Type"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700">
              Stop Hour (HH)
            </label>
            <input type="number" name="stopJam" id="stopJam" value={formData.stopJam ?? ""} onChange={handleChange} className={inputClassName} min="0" max="23" placeholder="00-23" />
          </div>
          <div className="space-y-1">
            <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700">
              Stop Minute (MM)
            </label>
            <input type="number" name="stopMenit" id="stopMenit" value={formData.stopMenit ?? ""} onChange={handleChange} className={inputClassName} min="0" max="59" placeholder="00-59" />
          </div>
          <div className="space-y-1">
            <label htmlFor="startJam" className="block text-sm font-medium text-gray-700">
              Start Hour (HH)
            </label>
            <input type="number" name="startJam" id="startJam" value={formData.startJam ?? ""} onChange={handleChange} className={inputClassName} min="0" max="23" placeholder="00-23" />
          </div>
          <div className="space-y-1">
            <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700">
              Start Minute (MM)
            </label>
            <input type="number" name="startMenit" id="startMenit" value={formData.startMenit ?? ""} onChange={handleChange} className={inputClassName} min="0" max="59" placeholder="00-59" />
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
            <Select
              inputId="itemTrouble"
              name="itemTrouble"
              options={masterData.itemtroubles.map((it) => ({ value: it.name, label: it.name }))}
              value={formData.itemTrouble ? { value: formData.itemTrouble, label: formData.itemTrouble } : null}
              onChange={handleSelectChange}
              placeholder="Select or search problem item..."
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700">
              Problem Description
            </label>
            <textarea name="jenisGangguan" id="jenisGangguan" value={formData.jenisGangguan || ""} onChange={handleChange} rows={3} className={inputClassName}></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700">
              Action Taken
            </label>
            <textarea name="bentukTindakan" id="bentukTindakan" value={formData.bentukTindakan || ""} onChange={handleChange} rows={3} className={inputClassName}></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700">
              Root Cause
            </label>
            <textarea name="rootCause" id="rootCause" value={formData.rootCause || ""} onChange={handleChange} rows={3} className={inputClassName}></textarea>
          </div>
          <div className="space-y-1">
            <label htmlFor="perbaikanPerawatan" className="block text-sm font-medium text-gray-700">
              Repair/Maintenance Type
            </label>
            <Select
              inputId="perbaikanPerawatan"
              name="perbaikanPerawatan"
              options={[
                { value: "perbaikan", label: "Repair" },
                { value: "perawatan", label: "Maintenance" },
              ]}
              value={formData.perbaikanPerawatan ? { value: formData.perbaikanPerawatan, label: formData.perbaikanPerawatan === "perbaikan" ? "Repair" : "Maintenance" } : null}
              onChange={handleSelectChange}
              placeholder="Select Type"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
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
            <Select
              inputId="jenisAktivitas"
              name="jenisAktivitas"
              options={masterData.jenisaktivitas.map((ja) => ({ value: ja.name, label: ja.name }))}
              value={formData.jenisAktivitas ? { value: formData.jenisAktivitas, label: formData.jenisAktivitas } : null}
              onChange={handleSelectChange}
              placeholder="Select Activity Type"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
              Specific Activity
            </label>
            <Select
              inputId="kegiatan"
              name="kegiatan"
              options={masterData.kegiatans.map((k) => ({ value: k.name, label: k.name }))}
              value={formData.kegiatan ? { value: formData.kegiatan, label: formData.kegiatan } : null}
              onChange={handleSelectChange}
              placeholder="Select or search specific activity..."
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
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
            <input type="text" name="kodePart" id="kodePart" value={formData.kodePart || ""} onChange={handleChange} className={inputClassName} />
          </div>
          <div className="space-y-1">
            <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700">
              Part Name
            </label>
            <input type="text" name="sparePart" id="sparePart" value={formData.sparePart || ""} onChange={handleChange} className={inputClassName} />
          </div>
          <div className="space-y-1">
            <label htmlFor="idPart" className="block text-sm font-medium text-gray-700">
              Part ID
            </label>
            <input type="text" name="idPart" id="idPart" value={formData.idPart || ""} onChange={handleChange} className={inputClassName} />
          </div>
          <div className="space-y-1">
            <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
              Quantity
            </label>
            <input type="number" name="jumlah" id="jumlah" value={formData.jumlah ?? ""} onChange={handleChange} className={inputClassName} min="0" />
          </div>
          <div className="space-y-1">
            <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700">
              Part Unit
            </label>
            <Select
              inputId="unitSparePart"
              name="unitSparePart"
              options={masterData.unitspareparts.map((usp) => ({ value: usp.name, label: usp.name }))}
              value={formData.unitSparePart ? { value: formData.unitSparePart, label: formData.unitSparePart } : null}
              onChange={handleSelectChange}
              placeholder="Select Unit"
              isClearable
              isSearchable
              className={selectClassName}
              classNamePrefix={selectPrefixClassName}
            />
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
