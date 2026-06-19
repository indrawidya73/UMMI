import { useState, useMemo } from 'react';
import { jenjangUMMI } from '@/stores/jenjangUMMIStore';
import { X, Award, CheckCircle2, AlertCircle, ArrowUp } from 'lucide-react';
import type { AppData } from '../../types';

interface NaikJenjangModalProps {
  onClose: () => void;
  data: AppData;
  onUpdate: (d: AppData) => void;
}

export default function NaikJenjangModal({ onClose, data, onUpdate }: NaikJenjangModalProps) {
  const [selectedSiswa, setSelectedSiswa] = useState<number[]>([]);
  const [targetJenjang, setTargetJenjang] = useState('');
  const [search, setSearch] = useState('');
  const [success, setSuccess] = useState(false);

  const allSiswa = data.siswa || [];

  const filteredSiswa = allSiswa.filter(s => 
    s.nama.toLowerCase().includes(search.toLowerCase()) ||
    s.nis.includes(search)
  );

  const handleToggleSiswa = (id: number) => {
    setSelectedSiswa(prev => prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]);
  };

  const handleSelectAll = () => {
    if (selectedSiswa.length === filteredSiswa.length) {
      setSelectedSiswa([]);
    } else {
      setSelectedSiswa(filteredSiswa.map(s => s.id));
    }
  };

  const handleNaikJenjang = () => {
    if (!targetJenjang || selectedSiswa.length === 0) return;

    const newData: AppData = {
      ...data,
      siswa: data.siswa.map(s => 
        selectedSiswa.includes(s.id) ? { ...s, jilid: targetJenjang } : s
      )
    };

    onUpdate(newData);
    setSuccess(true);
    setTimeout(() => { setSuccess(false); onClose(); }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl my-8 max-h-[90vh] flex flex-col">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
              <Award className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Naik Jenjang Siswa</h3>
              <p className="text-xs text-gray-500">Pilih siswa dan jenjang tujuan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition"><X className="w-5 h-5" /></button>
        </div>

        {success && (
          <div className="m-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle2 className="w-5 h-5" />
            <span className="text-sm font-medium">Berhasil naik jenjang! Modal akan tertutup...</span>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Jenjang Tujuan</label>
            <select value={targetJenjang} onChange={e => setTargetJenjang(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none bg-white">
              <option value="">Pilih Jenjang Tujuan</option>
              {jenjangUMMI.map(j => <option key={j.id} value={j.id}>{j.nama} ({j.tipe})</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Cari Siswa</label>
            <input type="text" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 outline-none" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Pilih Siswa ({selectedSiswa.length} dipilih)</label>
              <button onClick={handleSelectAll} className="text-xs text-amber-600 hover:text-amber-700 font-medium">
                {selectedSiswa.length === filteredSiswa.length ? 'Batal Pilih' : 'Pilih Semua'}
              </button>
            </div>

            <div className="border border-gray-200 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
              {filteredSiswa.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />Tidak ada siswa ditemukan
                </div>
              ) : (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left w-10"><input type="checkbox" checked={selectedSiswa.length === filteredSiswa.length && filteredSiswa.length > 0} onChange={handleSelectAll} className="w-4 h-4 rounded" /></th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Nama</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">NIS</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-700">Jenjang Saat Ini</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredSiswa.map(s => (
                      <tr key={s.id} onClick={() => handleToggleSiswa(s.id)} className={`cursor-pointer transition ${selectedSiswa.includes(s.id) ? 'bg-amber-50' : 'hover:bg-gray-50'}`}>
                        <td className="px-3 py-2">
                          <input type="checkbox" checked={selectedSiswa.includes(s.id)} onChange={() => handleToggleSiswa(s.id)} className="w-4 h-4 rounded" onClick={e => e.stopPropagation()} />
                        </td>
                        <td className="px-3 py-2 font-medium text-gray-900">{s.nama}</td>
                        <td className="px-3 py-2 text-gray-600 font-mono text-xs">{s.nis}</td>
                        <td className="px-3 py-2"><span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded font-medium">{s.jilid}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Batal</button>
          <button onClick={handleNaikJenjang} disabled={!targetJenjang || selectedSiswa.length === 0}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg flex items-center gap-2 transition disabled:bg-gray-300">
            <ArrowUp className="w-4 h-4" />Naikkan {selectedSiswa.length} Siswa
          </button>
        </div>
      </div>
    </div>
  );
}