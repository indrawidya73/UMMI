import { useState, useMemo } from 'react';
import { getJenjangById, jenjangUMMI } from '@/stores/jenjangUMMIStore';
import { Plus, Trash2, Users, BookOpen, Calendar, School, UserCog, Edit2, X, KeyRound, Check, GraduationCap } from 'lucide-react';
import TemplateKelompokUMMI from './TemplateKelompokUMMI';
import type { AppData, KelompokUMMI, Siswa } from '../../types';

interface AdminKelompokUMMIProps {
  data: AppData;
  onUpdate: (d: AppData) => void;
}

export default function AdminKelompokUMMI({ data, onUpdate }: AdminKelompokUMMIProps) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [nama, setNama] = useState('');
  const [jenjangId, setJenjangId] = useState('');
  const [guruId, setGuruId] = useState('');
  const [tingkat, setTingkat] = useState(1);
  const [selectedKelas, setSelectedKelas] = useState<string[]>([]);
  const [tahunAjaran, setTahunAjaran] = useState('2026/2027');
  const [kapasitas, setKapasitas] = useState<string>('30');

  const kelompok = data.kelompokUMMI || [];
  const guruList = data.guru || [];
  const kelasList = data.kelas || [];
  const siswaList = data.siswa || [];

  // Group kelas by tingkat
  const kelasByTingkat = useMemo(() => {
    const grouped: Record<number, typeof kelasList> = {};
    kelasList.forEach(k => {
      if (!grouped[k.tingkat]) grouped[k.tingkat] = [];
      grouped[k.tingkat].push(k);
    });
    return grouped;
  }, [kelasList]);

  // Preview siswa dari kelas yang dipilih
  const previewSiswa = useMemo(() => {
    return siswaList.filter(s => {
      const kelasNama = kelasList.find(k => k.id === s.kelasId)?.nama;
      return kelasNama && selectedKelas.includes(kelasNama);
    });
  }, [siswaList, kelasList, selectedKelas]);

  const resetForm = () => {
    setNama('');
    setJenjangId('');
    setGuruId('');
    setTingkat(1);
    setSelectedKelas([]);
    setTahunAjaran('2026/2027');
    setKapasitas('30');
    setEditingId(null);
  };

  const saveKelompok = (newKelompok: KelompokUMMI[]) => {
    onUpdate({ ...data, kelompokUMMI: newKelompok });
  };

  const handleToggleKelas = (kelasNama: string) => {
    setSelectedKelas(prev => 
      prev.includes(kelasNama) 
        ? prev.filter(k => k !== kelasNama)
        : [...prev, kelasNama]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newKelompok: KelompokUMMI = {
      id: 'K' + Date.now().toString(36).toUpperCase(),
      nama,
      jenjang_id: jenjangId,
      guru_pengampu_id: guruId,
      tingkat_sekolah: tingkat,
      kelas_sumber: selectedKelas,
      tahun_ajaran: tahunAjaran,
      kapasitas: kapasitas === '' ? 0 : Number(kapasitas),
      created_at: new Date().toISOString(),
    };

    saveKelompok([...kelompok, newKelompok]);
    setShowForm(false);
    resetForm();
  };

  const handleEdit = (k: KelompokUMMI) => {
    setEditingId(k.id);
    setNama(k.nama);
    setJenjangId(k.jenjang_id);
    setGuruId(k.guru_pengampu_id);
    setTingkat(k.tingkat_sekolah);
    setSelectedKelas(k.kelas_sumber || []);
    setTahunAjaran(k.tahun_ajaran);
    setKapasitas(k.kapasitas.toString());
    setShowForm(true);
  };

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    const updated = kelompok.map(k => 
      k.id === editingId 
        ? {
            ...k,
            nama,
            jenjang_id: jenjangId,
            guru_pengampu_id: guruId,
            tingkat_sekolah: tingkat,
            kelas_sumber: selectedKelas,
            tahun_ajaran: tahunAjaran,
            kapasitas: kapasitas === '' ? 0 : Number(kapasitas),
          }
        : k
    );

    saveKelompok(updated);
    setShowForm(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (!confirm('Yakin ingin menghapus kelompok ini?')) return;
    saveKelompok(kelompok.filter(k => k.id !== id));
  };

  const handleUpload = (rows: any[]) => {
    const newKelompoks: KelompokUMMI[] = [];

    rows.forEach(row => {
      try {
        newKelompoks.push({
          id: 'K' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substr(2, 3),
          nama: row.nama,
          jenjang_id: row.jenjang_id,
          guru_pengampu_id: row.guru_pengampu_id,
          tingkat_sekolah: parseInt(row.tingkat_sekolah) || 1,
          kelas_sumber: row.kelas_sumber.split(',').map((k: string) => k.trim()).filter(Boolean),
          tahun_ajaran: row.tahun_ajaran || '2026/2027',
          kapasitas: parseInt(row.kapasitas) || 30,
          created_at: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error creating kelompok:', row, err);
      }
    });

    saveKelompok([...kelompok, ...newKelompoks]);
    alert(`Berhasil import ${newKelompoks.length} kelompok!`);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const getGuruName = (guruId: string) => {
    const guru = guruList.find(g => g.id?.toString() === guruId || g.nip === guruId);
    return guru?.nama || guruId;
  };

  const getGuruUser = (guruId: string) => {
    try {
      const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
      const guru = guruList.find(g => g.id?.toString() === guruId);
      return users.find((u: any) => u.refId === guruId || u.refId === guru?.nip);
    } catch {
      return null;
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Kelompok UMMI</h2>
          <p className="text-gray-600 text-sm mt-1">Kelola kelompok belajar mengaji metode UMMI</p>
        </div>
        <button 
          onClick={() => { setShowForm(!showForm); if (showForm) resetForm(); }}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-lg flex items-center gap-2 transition shadow-sm"
        >
          <Plus size={20} />
          {showForm ? 'Tutup Form' : 'Tambah Kelompok'}
        </button>
      </div>

      {/* Template Import */}
      <TemplateKelompokUMMI onUpload={handleUpload} />

      {/* Form */}
      {showForm && (
        <form onSubmit={editingId ? handleUpdate : handleSubmit} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-900">
              {editingId ? 'Edit Kelompok' : 'Tambah Kelompok Baru'}
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelompok</label>
              <input type="text" value={nama} onChange={e => setNama(e.target.value)}
                placeholder="Contoh: Jilid 2 - Ust. Ahmad"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenjang</label>
              <select value={jenjangId} onChange={e => setJenjangId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" required>
                <option value="">Pilih Jenjang</option>
                {jenjangUMMI.map(j => (
                  <option key={j.id} value={j.id}>{j.nama} ({j.tipe})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Guru Pengampu</label>
              <select value={guruId} onChange={e => setGuruId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none bg-white" required>
                <option value="">Pilih Guru</option>
                {guruList.map(g => (
                  <option key={g.id} value={g.id?.toString() || ''}>
                    {g.nama} (NIP: {g.nip})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat Sekolah</label>
              <input type="number" min={1} max={6} value={tingkat}
                onChange={e => setTingkat(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>

            {/* Kelas Sumber — Checkbox Grid */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kelas Sumber ({selectedKelas.length} dipilih)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
                {Object.entries(kelasByTingkat).map(([tingkat, kelasGroup]) => (
                  <div key={tingkat} className="border border-gray-200 rounded-lg p-2">
                    <p className="text-xs font-semibold text-gray-500 mb-1">Tingkat {tingkat}</p>
                    <div className="space-y-1">
                      {kelasGroup.map(k => (
                        <label key={k.id} className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded transition">
                          <input
                            type="checkbox"
                            checked={selectedKelas.includes(k.nama)}
                            onChange={() => handleToggleKelas(k.nama)}
                            className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                          />
                          <span className="text-sm text-gray-700">{k.nama}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Preview kelas yang dipilih */}
              {selectedKelas.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {selectedKelas.map(k => (
                    <span key={k} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                      <Check className="w-3 h-3" />
                      Kelas {k}
                      <button type="button" onClick={() => handleToggleKelas(k)} className="ml-1 text-emerald-500 hover:text-emerald-700">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Preview Siswa */}
            {previewSiswa.length > 0 && (
              <div className="md:col-span-2 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4" />
                    Preview Siswa ({previewSiswa.length} siswa)
                  </h4>
                  <span className="text-xs text-gray-500">Dari kelas yang dipilih</span>
                </div>
                <div className="max-h-40 overflow-y-auto">
                  <table className="w-full text-xs">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-2 py-1 text-left">No</th>
                        <th className="px-2 py-1 text-left">NIS</th>
                        <th className="px-2 py-1 text-left">Nama</th>
                        <th className="px-2 py-1 text-left">Kelas</th>
                        <th className="px-2 py-1 text-left">Jilid</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {previewSiswa.slice(0, 10).map((s, idx) => (
                        <tr key={s.id} className="hover:bg-white">
                          <td className="px-2 py-1 text-gray-600">{idx + 1}</td>
                          <td className="px-2 py-1 text-gray-700 font-mono">{s.nis}</td>
                          <td className="px-2 py-1 text-gray-900 font-medium">{s.nama}</td>
                          <td className="px-2 py-1">
                            <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px]">
                              {kelasList.find(k => k.id === s.kelasId)?.nama}
                            </span>
                          </td>
                          <td className="px-2 py-1">
                            <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">
                              {s.jilid}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {previewSiswa.length > 10 && (
                        <tr>
                          <td colSpan={5} className="px-2 py-1 text-center text-gray-500 text-[10px]">
                            ... dan {previewSiswa.length - 10} siswa lainnya
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tahun Ajaran</label>
              <input type="text" value={tahunAjaran} onChange={e => setTahunAjaran(e.target.value)}
                placeholder="2026/2027"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
              <input type="text" inputMode="numeric" pattern="[0-9]*"
                value={kapasitas} onChange={e => setKapasitas(e.target.value)}
                placeholder="30"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-emerald-500 outline-none" required />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={handleCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">Batal</button>
            <button type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition shadow-sm">
              {editingId ? 'Update Kelompok' : 'Simpan Kelompok'}
            </button>
          </div>
        </form>
      )}

      {/* List Kelompok */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            Daftar Kelompok ({kelompok.length})
          </h3>
        </div>

        {kelompok.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada kelompok. Klik "Tambah Kelompok" untuk membuat.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {kelompok.map((k, index) => {
              const jenjang = getJenjangById(k.jenjang_id);
              const guruUser = getGuruUser(k.guru_pengampu_id);
              // Ambil siswa untuk kelompok ini
              const siswaKelompok = siswaList.filter(s => {
                const kelasNama = kelasList.find(kl => kl.id === s.kelasId)?.nama;
                return kelasNama && k.kelas_sumber?.includes(kelasNama);
              });

              return (
                <div key={`${k.id}-${index}`} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{k.nama}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">
                          {jenjang?.nama || k.jenjang_id}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><UserCog className="w-3.5 h-3.5" />{getGuruName(k.guru_pengampu_id)}</span>
                        <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" />Tingkat {k.tingkat_sekolah}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{k.tahun_ajaran}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Kapasitas: {k.kapasitas}</span>
                        <span className="flex items-center gap-1"><GraduationCap className="w-3.5 h-3.5" />{siswaKelompok.length} Siswa</span>
                      </div>
                      {guruUser && (
                        <div className="mt-2 flex items-center gap-2 text-xs">
                          <span className="flex items-center gap-1 text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                            <KeyRound className="w-3 h-3" />User: {guruUser.username}
                          </span>
                          <span className="text-gray-400">|</span>
                          <span className="text-gray-500">Pass: {guruUser.password}</span>
                        </div>
                      )}
                      {/* Kelas yang dipilih — berjajar */}
                      {k.kelas_sumber?.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-500 mb-1">Kelas:</p>
                          <div className="flex flex-wrap gap-1">
                            {k.kelas_sumber.map((ks, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">
                                <Check className="w-3 h-3" />
                                {ks}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      {/* Daftar siswa dalam kelompok */}
                      {siswaKelompok.length > 0 && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-600 mb-2">Siswa dalam Kelompok ({siswaKelompok.length}):</p>
                          <div className="flex flex-wrap gap-1">
                            {siswaKelompok.slice(0, 8).map(s => (
                              <span key={s.id} className="px-2 py-0.5 bg-white border border-gray-200 text-gray-700 text-xs rounded">
                                {s.nama}
                              </span>
                            ))}
                            {siswaKelompok.length > 8 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">+{siswaKelompok.length - 8} lainnya</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <button onClick={() => handleEdit(k)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(k.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}