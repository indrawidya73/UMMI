import { useState, useMemo } from 'react';
import { getJenjangById } from '@/stores/jenjangUMMIStore';
import { BookOpen, Users, School, Calendar, Award, GraduationCap, UserCheck, TrendingUp, BarChart3, PieChart } from 'lucide-react';
import NaikJenjangModal from './NaikJenjangModal';
import type { AppData } from '../../types';

interface DashboardGuruUMMIProps {
  data: AppData;
  onUpdate: (d: AppData) => void;
}

export default function DashboardGuruUMMI({ data, onUpdate }: DashboardGuruUMMIProps) {
  const [showNaikJenjang, setShowNaikJenjang] = useState(false);
  const [activeChart, setActiveChart] = useState<'bar' | 'pie'>('bar');

  const kelompokList = data.kelompokUMMI || [];
  const allSiswa = data.siswa || [];

  const stats = useMemo(() => {
    const totalKelompok = kelompokList.length;
    const totalKapasitas = kelompokList.reduce((sum, k) => sum + (k.kapasitas || 0), 0);
    const jenjangUnik = new Set(kelompokList.map(k => k.jenjang_id)).size;
    const totalSiswa = allSiswa.length;
    return { totalKelompok, totalKapasitas, jenjangUnik, totalSiswa };
  }, [kelompokList, allSiswa]);

  const siswaPerJilid = useMemo(() => {
    const counts: Record<string, number> = {};
    allSiswa.forEach(s => {
      const jilid = s.jilid || 'Belum ada';
      counts[jilid] = (counts[jilid] || 0) + 1;
    });
    return counts;
  }, [allSiswa]);

  const siswaPerKelas = useMemo(() => {
    const counts: Record<string, number> = {};
    allSiswa.forEach(s => {
      const kelasNama = data.kelas?.find(k => k.id === s.kelasId)?.nama || 'Tidak diketahui';
      counts[kelasNama] = (counts[kelasNama] || 0) + 1;
    });
    return counts;
  }, [allSiswa, data]);

  const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Dashboard UMMI</h1>
        <p className="text-gray-600 text-sm mt-1">Overview semua kelompok mengajar dan perkembangan siswa</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center mb-3">
            <BookOpen className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <p className="text-xs md:text-sm text-gray-600">Total Kelompok</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stats.totalKelompok}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-3">
            <Users className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <p className="text-xs md:text-sm text-gray-600">Total Kapasitas</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stats.totalKapasitas}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mb-3">
            <School className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <p className="text-xs md:text-sm text-gray-600">Jenjang Diajar</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stats.jenjangUnik}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center mb-3">
            <GraduationCap className="w-5 h-5 md:w-6 md:h-6 text-white" />
          </div>
          <p className="text-xs md:text-sm text-gray-600">Total Siswa</p>
          <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1">{stats.totalSiswa}</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" />
              Distribusi Siswa per Jilid
            </h3>
            <div className="flex gap-1">
              <button onClick={() => setActiveChart('bar')} className={`p-1.5 rounded ${activeChart === 'bar' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400'}`}>
                <BarChart3 className="w-4 h-4" />
              </button>
              <button onClick={() => setActiveChart('pie')} className={`p-1.5 rounded ${activeChart === 'pie' ? 'bg-emerald-100 text-emerald-700' : 'text-gray-400'}`}>
                <PieChart className="w-4 h-4" />
              </button>
            </div>
          </div>

          {activeChart === 'bar' ? (
            <div className="space-y-3">
              {Object.entries(siswaPerJilid).map(([jilid, count], idx) => {
                const maxCount = Math.max(...Object.values(siswaPerJilid));
                const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
                return (
                  <div key={jilid} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700 font-medium">{jilid}</span>
                      <span className="text-gray-900 font-semibold">{count} siswa</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-wrap justify-center gap-4">
              {Object.entries(siswaPerJilid).map(([jilid, count], idx) => {
                const total = Object.values(siswaPerJilid).reduce((a, b) => a + b, 0);
                const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div key={jilid} className="flex flex-col items-center gap-1">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: colors[idx % colors.length] }}>
                      {percentage}%
                    </div>
                    <span className="text-xs text-gray-600 font-medium">{jilid}</span>
                    <span className="text-xs text-gray-500">{count} siswa</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            Distribusi Siswa per Kelas
          </h3>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {Object.entries(siswaPerKelas).map(([kelas, count], idx) => {
              const maxCount = Math.max(...Object.values(siswaPerKelas));
              const percentage = maxCount > 0 ? (count / maxCount) * 100 : 0;
              return (
                <div key={kelas} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-700 font-medium">Kelas {kelas}</span>
                    <span className="text-gray-900 font-semibold">{count} siswa</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: colors[idx % colors.length] }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Semua Kelompok */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-600" />
            Semua Kelompok UMMI ({kelompokList.length})
          </h3>
          <button onClick={() => setShowNaikJenjang(true)}
            className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white px-3 py-2 rounded-lg text-sm font-medium transition">
            <Award className="w-4 h-4" />Naik Jenjang Semua Siswa
          </button>
        </div>

        {kelompokList.length === 0 ? (
          <div className="p-10 text-center text-gray-500">
            <BookOpen className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada kelompok UMMI.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {kelompokList.map((k, index) => {
              const jenjang = getJenjangById(k.jenjang_id);
              const guru = data.guru?.find(g => g.id?.toString() === k.guru_pengampu_id || g.nip === k.guru_pengampu_id);
              return (
                <div key={`${k.id}-${index}`} className="p-4 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold text-gray-900">{k.nama}</h4>
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-xs rounded-full font-medium">{jenjang?.nama || k.jenjang_id}</span>
                      </div>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><UserCheck className="w-3.5 h-3.5" />{guru?.nama || k.guru_pengampu_id}</span>
                        <span className="flex items-center gap-1"><School className="w-3.5 h-3.5" />Tingkat {k.tingkat_sekolah}</span>
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{k.tahun_ajaran}</span>
                        <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />Kapasitas: {k.kapasitas}</span>
                      </div>
                      {k.kelas_sumber?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          <span className="text-xs text-gray-500 mr-1">Kelas:</span>
                          {k.kelas_sumber.map((ks, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded font-medium">{ks}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Naik Jenjang Modal */}
      {showNaikJenjang && (
        <NaikJenjangModal onClose={() => setShowNaikJenjang(false)} data={data} onUpdate={onUpdate} />
      )}
    </div>
  );
}