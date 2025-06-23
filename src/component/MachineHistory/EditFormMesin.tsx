import { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth, MachineHistoryFormData, MachineHistoryRecord, Mesin, Shift, Group, StopTime, Unit, ItemTrouble, JenisAktivitas, Kegiatan, UnitSparePart, AllMasterData } from "../../routes/AuthContext";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const EditFormMesin = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getAllMasterData, getMachineHistoryById, updateMachineHistory, masterData, isMasterDataLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mesinList, setMesinList] = useState<Mesin[]>([]);
  const [shiftList, setShiftList] = useState<Shift[]>([]);
  const [groupList, setGroupList] = useState<Group[]>([]);
  const [stopTimeList, setStopTimeList] = useState<StopTime[]>([]);
  const [unitList, setUnitList] = useState<Unit[]>([]);
  const [itemTroubleList, setItemTroubleList] = useState<ItemTrouble[]>([]);
  const [jenisAktivitasList, setJenisAktivitasList] = useState<JenisAktivitas[]>([]);
  const [kegiatanList, setKegiatanList] = useState<Kegiatan[]>([]);
  const [unitSparePartList, setUnitSparePartList] = useState<UnitSparePart[]>([]);

  const [formData, setFormData] = useState<MachineHistoryFormData>({
    date: "",
    shift: "",
    group: "",
    stopJam: null,
    stopMenit: null,
    startJam: null,
    startMenit: null,
    stopTime: "",
    unit: "",
    mesin: "",
    runningHour: 0,
    itemTrouble: "",
    jenisGangguan: "",
    bentukTindakan: "",
    perbaikanPerawatan: "",
    rootCause: "",
    jenisAktivitas: "",
    kegiatan: "",
    kodePart: "",
    sparePart: "",
    idPart: "",
    jumlah: 0,
    unitSparePart: "",
  });

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        if (!masterData) {
          const fetchedMasterData: AllMasterData = await getAllMasterData();
          setMesinList(fetchedMasterData.mesin || []);
          setShiftList(fetchedMasterData.shifts || []);
          setGroupList(fetchedMasterData.groups || []);
          setStopTimeList(fetchedMasterData.stoptimes || []);
          setUnitList(fetchedMasterData.units || []);
          setItemTroubleList(fetchedMasterData.itemtroubles || []);
          setJenisAktivitasList(fetchedMasterData.jenisaktivitas || []);
          setKegiatanList(fetchedMasterData.kegiatans || []);
          setUnitSparePartList(fetchedMasterData.unitspareparts || []);
        } else {
          setMesinList(masterData.mesin || []);
          setShiftList(masterData.shifts || []);
          setGroupList(masterData.groups || []);
          setStopTimeList(masterData.stoptimes || []);
          setUnitList(masterData.units || []);
          setItemTroubleList(masterData.itemtroubles || []);
          setJenisAktivitasList(masterData.jenisaktivitas || []);
          setKegiatanList(masterData.kegiatans || []);
          setUnitSparePartList(masterData.unitspareparts || []);
        }

        if (id) {
          const machineDataResult: MachineHistoryRecord | null = await getMachineHistoryById(id);
          if (machineDataResult) {
            setFormData({
              date: machineDataResult.date,
              shift: machineDataResult.shift,
              group: machineDataResult.group,
              stopJam: machineDataResult.stopJam,
              stopMenit: machineDataResult.stopMenit,
              startJam: machineDataResult.startJam,
              startMenit: machineDataResult.startMenit,
              stopTime: machineDataResult.stopTime,
              unit: machineDataResult.unit,
              mesin: machineDataResult.mesin,
              runningHour: machineDataResult.runningHour,
              itemTrouble: machineDataResult.itemTrouble,
              jenisGangguan: machineDataResult.jenisGangguan,
              bentukTindakan: machineDataResult.bentukTindakan,
              perbaikanPerawatan: machineDataResult.perbaikanPerawatan,
              rootCause: machineDataResult.rootCause,
              jenisAktivitas: machineDataResult.jenisAktivitas,
              kegiatan: machineDataResult.kegiatan,
              kodePart: machineDataResult.kodePart,
              sparePart: machineDataResult.sparePart,
              idPart: machineDataResult.idPart,
              jumlah: machineDataResult.jumlah,
              unitSparePart: machineDataResult.unitSparePart,
            });
            setSelectedDate(new Date(machineDataResult.date));
          } else {
            setError("Data history mesin tidak ditemukan.");
            toast.error("Data history mesin tidak ditemukan.");
          }
        } else {
          setError("ID history mesin tidak diberikan untuk pengeditan.");
          toast.error("ID history mesin tidak diberikan.");
        }
      } catch (err: any) {
        setError(err.message || "Terjadi kesalahan saat memuat data.");
        toast.error(err.message || "Gagal memuat data untuk pengeditan.");
      } finally {
        setLoading(false);
      }
    };

    if (!isMasterDataLoading) {
      fetchData();
    }
  }, [id, getAllMasterData, getMachineHistoryById, updateMachineHistory, navigate, masterData, isMasterDataLoading]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date);
    setFormData((prev) => ({
      ...prev,
      date: date ? date.toISOString().split("T")[0] : "",
    }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!id) {
      toast.error("ID history mesin tidak ditemukan untuk update.");
      return;
    }
    try {
      await updateMachineHistory(id, formData);
      toast.success("History mesin berhasil diperbarui!");
      navigate("/machinehistory");
    } catch (err: any) {
      toast.error(err.message || "Gagal memperbarui history mesin.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Memuat data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Edit History Mesin</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
            Tanggal:
          </label>
          <DatePicker selected={selectedDate} onChange={handleDateChange} dateFormat="yyyy-MM-dd" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="mesin" className="block text-sm font-medium text-gray-700">
            Mesin:
          </label>
          <select id="mesin" name="mesin" value={formData.mesin} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Mesin</option>
            {mesinList.map((mesin) => (
              <option key={mesin.id} value={mesin.name}>
                {mesin.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="shift" className="block text-sm font-medium text-gray-700">
            Shift:
          </label>
          <select id="shift" name="shift" value={formData.shift} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Shift</option>
            {shiftList.map((shift) => (
              <option key={shift.id} value={shift.name}>
                {shift.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="group" className="block text-sm font-medium text-gray-700">
            Group:
          </label>
          <select id="group" name="group" value={formData.group} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Group</option>
            {groupList.map((group) => (
              <option key={group.id} value={group.name}>
                {group.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="stopTime" className="block text-sm font-medium text-gray-700">
            Stop Time:
          </label>
          <select id="stopTime" name="stopTime" value={formData.stopTime} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Stop Time</option>
            {stopTimeList.map((st) => (
              <option key={st.id} value={st.name}>
                {st.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="startJam" className="block text-sm font-medium text-gray-700">
              Start Jam (HH):
            </label>
            <input
              type="number"
              id="startJam"
              name="startJam"
              value={formData.startJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="23"
            />
          </div>
          <div>
            <label htmlFor="startMenit" className="block text-sm font-medium text-gray-700">
              Start Menit (MM):
            </label>
            <input
              type="number"
              id="startMenit"
              name="startMenit"
              value={formData.startMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="59"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="stopJam" className="block text-sm font-medium text-gray-700">
              Stop Jam (HH):
            </label>
            <input
              type="number"
              id="stopJam"
              name="stopJam"
              value={formData.stopJam ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="23"
            />
          </div>
          <div>
            <label htmlFor="stopMenit" className="block text-sm font-medium text-gray-700">
              Stop Menit (MM):
            </label>
            <input
              type="number"
              id="stopMenit"
              name="stopMenit"
              value={formData.stopMenit ?? ""}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="59"
            />
          </div>
        </div>

        <div>
          <label htmlFor="runningHour" className="block text-sm font-medium text-gray-700">
            Running Hour:
          </label>
          <input
            type="number"
            id="runningHour"
            name="runningHour"
            value={formData.runningHour}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            step="0.01"
          />
        </div>

        <div>
          <label htmlFor="itemTrouble" className="block text-sm font-medium text-gray-700">
            Item Trouble:
          </label>
          <select id="itemTrouble" name="itemTrouble" value={formData.itemTrouble} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Item Trouble</option>
            {itemTroubleList.map((it) => (
              <option key={it.id} value={it.name}>
                {it.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="jenisGangguan" className="block text-sm font-medium text-gray-700">
            Jenis Gangguan:
          </label>
          <textarea
            id="jenisGangguan"
            name="jenisGangguan"
            value={formData.jenisGangguan}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="bentukTindakan" className="block text-sm font-medium text-gray-700">
            Bentuk Tindakan:
          </label>
          <textarea
            id="bentukTindakan"
            name="bentukTindakan"
            value={formData.bentukTindakan}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="rootCause" className="block text-sm font-medium text-gray-700">
            Root Cause:
          </label>
          <textarea
            id="rootCause"
            name="rootCause"
            value={formData.rootCause}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          ></textarea>
        </div>

        <div>
          <label htmlFor="jenisAktivitas" className="block text-sm font-medium text-gray-700">
            Jenis Aktivitas:
          </label>
          <select id="jenisAktivitas" name="jenisAktivitas" value={formData.jenisAktivitas} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Jenis Aktivitas</option>
            {jenisAktivitasList.map((ja) => (
              <option key={ja.id} value={ja.name}>
                {ja.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kegiatan" className="block text-sm font-medium text-gray-700">
            Kegiatan:
          </label>
          <select id="kegiatan" name="kegiatan" value={formData.kegiatan} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Kegiatan</option>
            {kegiatanList.map((keg) => (
              <option key={keg.id} value={keg.name}>
                {keg.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="kodePart" className="block text-sm font-medium text-gray-700">
            Kode Part:
          </label>
          <input type="text" id="kodePart" name="kodePart" value={formData.kodePart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="sparePart" className="block text-sm font-medium text-gray-700">
            Spare Part:
          </label>
          <input type="text" id="sparePart" name="sparePart" value={formData.sparePart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="idPart" className="block text-sm font-medium text-gray-700">
            ID Part:
          </label>
          <input type="text" id="idPart" name="idPart" value={formData.idPart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="jumlah" className="block text-sm font-medium text-gray-700">
            Jumlah:
          </label>
          <input type="number" id="jumlah" name="jumlah" value={formData.jumlah} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
        </div>

        <div>
          <label htmlFor="unitSparePart" className="block text-sm font-medium text-gray-700">
            Unit Spare Part:
          </label>
          <select id="unitSparePart" name="unitSparePart" value={formData.unitSparePart} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm">
            <option value="">Pilih Unit Spare Part</option>
            {unitSparePartList.map((usp) => (
              <option key={usp.id} value={usp.name}>
                {usp.name}
              </option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Perbarui History
        </button>
      </form>
    </div>
  );
};

export default EditFormMesin;
