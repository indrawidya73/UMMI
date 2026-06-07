import { useState, useEffect, useMemo } from 'react';
import {
  BookOpen, GraduationCap, Calendar, ClipboardCheck, FileText,
  LayoutDashboard, UserCog, School, LogOut, Menu as MenuIcon, X,
  Plus, Edit2, Trash2, Save, Search, Printer,
  BarChart3, TrendingUp, Award, AlertCircle, CheckCircle2, Filter,
  Settings, Upload, Download, Eye, EyeOff, KeyRound, Users
} from 'lucide-react';
import type {
  AppData, User, UserRole, Guru, Siswa, Kelas, TahunAjaran, Absensi, Penilaian,
  JilidType, StatusAbsen, PenilaianHarian
} from './types';
import { JILID_OPTIONS } from './types';
import { loadData, saveData, getNextId } from './store';
import { exportToExcel, exportToCSV, exportToPDF, buildHTMLTable } from './utils/exportUtils';

// ==================== AUTH CONTEXT ====================
type Page = 'dashboard' | 'admin-users' | 'admin-import' | 'guru' | 'pengampu' | 'siswa' | 'kelas' | 'tahun-ajaran' | 'absensi' | 'penilaian' | 'penilaian-harian' | 'laporan';

function Login({ onLogin }: { onLogin: (user: User) => void }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const data = useMemo(() => loadData(), []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      onLogin(user);
    } else {
      setError('Username atau password salah!');
    }
  };

  const quickLogin = (uname: string, pwd: string) => {
    setUsername(uname);
    setPassword(pwd);
    setError('');
    const user = data.users.find(u => u.username === uname && u.password === pwd);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-amber-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-72 sm:w-96 max-w-full mb-4">
            <img
              src="/logos/sukma-logo.svg"
              alt="Logo SUKMA - Sekolah Unggulan Kebonsari Malang - Sekolah Para Juara"
              className="w-full h-auto"
            />
          </div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-emerald-900 mb-1">
            Laporan Hasil Belajar Mengaji
          </h1>
          <p className="text-emerald-700 font-medium">METODE UMMI</p>
          <p className="text-gray-600 text-sm mt-1">MI ISLAMIYAH - MALANG</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8 border border-emerald-100">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Login</h2>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Masukkan username"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition"
                placeholder="Masukkan password"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-3 rounded-lg transition shadow-md hover:shadow-lg"
            >
              Masuk
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-3 text-center">Demo Login (klik untuk login cepat):</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => quickLogin('admin', 'admin123')}
                className="flex items-center justify-center gap-1.5 px-2 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-lg text-xs font-medium transition"
              >
                <Settings className="w-4 h-4" /> Admin
              </button>
              <button
                onClick={() => quickLogin('guru', 'guru123')}
                className="flex items-center justify-center gap-1.5 px-2 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-xs font-medium transition"
              >
                <UserCog className="w-4 h-4" /> Guru
              </button>
              <button
                onClick={() => quickLogin('siswa', 'siswa123')}
                className="flex items-center justify-center gap-1.5 px-2 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-lg text-xs font-medium transition"
              >
                <GraduationCap className="w-4 h-4" /> Siswa
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-500 mt-6">
          © 2025 MI Islamiyah Malang. All rights reserved.
        </p>
      </div>
    </div>
  );
}

// ==================== SIDEBAR ====================
function Sidebar({
  user, currentPage, onNavigate, onLogout, isOpen, onClose
}: {
  user: User;
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const guruMenu: Array<{ page: Page; label: string; icon: any }> = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'guru', label: 'Data Guru', icon: UserCog },
    { page: 'pengampu', label: 'Pengampu UMMI', icon: BookOpen },
    { page: 'siswa', label: 'Data Siswa', icon: GraduationCap },
    { page: 'kelas', label: 'Data Kelas', icon: School },
    { page: 'tahun-ajaran', label: 'Tahun Ajaran', icon: Calendar },
    { page: 'absensi', label: 'Absensi', icon: ClipboardCheck },
    { page: 'penilaian', label: 'Penilaian', icon: BookOpen },
    { page: 'penilaian-harian', label: 'Penilaian Harian', icon: ClipboardCheck },
    { page: 'laporan', label: 'Laporan', icon: FileText },
  ];

  const siswaMenu: Array<{ page: Page; label: string; icon: any }> = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'penilaian-harian', label: 'Kartu Prestasi', icon: ClipboardCheck },
    { page: 'laporan', label: 'Laporan Saya', icon: FileText },
  ];

  const adminMenu: Array<{ page: Page; label: string; icon: any }> = [
    { page: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { page: 'admin-users', label: 'Manajemen User', icon: UserCog },
    { page: 'admin-import', label: 'Import Massal', icon: FileText },
  ];

  const menu = user.role === 'admin' ? adminMenu : user.role === 'guru' ? guruMenu : siswaMenu;

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-64 bg-emerald-900 text-white z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="p-5 border-b border-emerald-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center flex-shrink-0">
              <School className="w-5 h-5 text-white" />
            </div>
            <div className="overflow-hidden">
              <h2 className="font-serif font-bold text-sm leading-tight">MI Islamiyah</h2>
              <p className="text-emerald-300 text-xs">Metode UMMI</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {menu.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => { onNavigate(item.page); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-amber-500 text-white shadow-md'
                    : 'text-emerald-100 hover:bg-emerald-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-3 border-t border-emerald-800">
          <div className="px-3 py-2 mb-2">
            <p className="text-xs text-emerald-300">Login sebagai</p>
            <p className="text-sm font-semibold truncate">{user.name}</p>
            <span className="inline-block mt-1 px-2 py-0.5 bg-emerald-800 text-emerald-200 text-xs rounded">
              {user.role === 'admin' ? 'Administrator' : user.role === 'guru' ? 'Guru' : 'Siswa'}
            </span>
          </div>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-300 hover:bg-red-900/30 transition"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

// ==================== DASHBOARD ====================
// ==================== LINE CHART (SVG) ====================
function LineChart({ labels, values, color, title, icon: Icon, minY = 60 }: {
  labels: string[];
  values: number[];
  color: string;
  title: string;
  icon: any;
  minY?: number;
}) {
  const W = 640;
  const H = 220;
  const padL = 36;
  const padR = 18;
  const padT = 18;
  const padB = 40;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const maxY = 100;

  const xFor = (i: number) => padL + (labels.length === 1 ? chartW / 2 : (i * chartW) / (labels.length - 1));
  const yFor = (v: number) => padT + chartH - ((Math.max(minY, Math.min(maxY, v)) - minY) / (maxY - minY)) * chartH;

  const points = values.map((v, i) => `${xFor(i)},${yFor(v)}`).join(' ');
  const areaPoints = `${padL},${padT + chartH} ${points} ${padL + chartW},${padT + chartH}`;

  // Buat 5 garis grid merata dari minY ke maxY
  const steps = 5;
  const gridLines = Array.from({ length: steps + 1 }, (_, i) => Math.round(minY + ((maxY - minY) / steps) * i));

  // Hindari label x menumpuk bila terlalu banyak
  const labelEvery = labels.length > 12 ? Math.ceil(labels.length / 12) : 1;

  const gradId = `grad-${title.replace(/[^a-zA-Z0-9]/g, '')}`;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-4">
      <div className="flex items-center gap-2 mb-3">
        <Icon className="w-5 h-5" style={{ color }} />
        <h3 className="font-semibold text-gray-900 text-sm">{title}</h3>
      </div>
      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full" style={{ minWidth: 420 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.25" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Grid + Y labels */}
          {gridLines.map((g) => (
            <g key={g}>
              <line x1={padL} y1={yFor(g)} x2={padL + chartW} y2={yFor(g)} stroke="#e5e7eb" strokeWidth="1" strokeDasharray="3 3" />
              <text x={padL - 6} y={yFor(g) + 3} textAnchor="end" fontSize="9" fill="#9ca3af">{g}</text>
            </g>
          ))}
          {/* Area */}
          <polygon points={areaPoints} fill={`url(#${gradId})`} />
          {/* Line */}
          <polyline points={points} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
          {/* Dots + value labels */}
          {values.map((v, i) => (
            <g key={i}>
              <circle cx={xFor(i)} cy={yFor(v)} r="3.5" fill="white" stroke={color} strokeWidth="2.5" />
              {(i % labelEvery === 0 || i === values.length - 1) && (
                <text x={xFor(i)} y={yFor(v) - 9} textAnchor="middle" fontSize="9" fontWeight="700" fill={color}>{v}</text>
              )}
              {(i % labelEvery === 0 || i === values.length - 1) && (
                <text x={xFor(i)} y={H - 14} textAnchor="middle" fontSize="9" fill="#6b7280">{labels[i]}</text>
              )}
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
}

const BULAN_NAMA = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

function Dashboard({ user, data }: { user: User; data: AppData }) {
  const activeTAId = data.tahunAjaran.find(ta => ta.aktif)?.id || data.tahunAjaran[0]?.id;
  const [periode, setPeriode] = useState<'minggu' | 'bulan' | 'tahun'>('minggu');
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [filterJilid, setFilterJilid] = useState<string>('all');

  // Hitung tren naik-turun pencapaian (tingkat kehadiran) dari data absensi
  const trend = useMemo(() => {
    // siswa sesuai filter kelas & jilid
    const siswaIds = new Set(
      data.siswa
        .filter(s => filterKelas === 'all' || s.kelasId === Number(filterKelas))
        .filter(s => filterJilid === 'all' || s.jilid === filterJilid)
        .map(s => s.id)
    );

    // absensi siswa terpilih
    let absen = data.absensi.filter(a => siswaIds.has(a.siswaId));
    // batasi ke tahun ajaran aktif kecuali periode tahun
    if (periode !== 'tahun' && activeTAId) {
      absen = absen.filter(a => a.tahunAjaranId === activeTAId);
    }

    const buckets = new Map<string, { hadir: number; total: number; order: number }>();

    const addBucket = (key: string, order: number, isHadir: boolean) => {
      const b = buckets.get(key) || { hadir: 0, total: 0, order };
      b.total += 1;
      if (isHadir) b.hadir += 1;
      buckets.set(key, b);
    };

    absen.forEach(a => {
      const isHadir = a.status === 'H';
      if (periode === 'minggu') {
        addBucket(`P${a.pertemuan}`, a.pertemuan, isHadir);
      } else if (periode === 'bulan') {
        const d = new Date(a.tanggal);
        const order = d.getFullYear() * 12 + d.getMonth();
        addBucket(BULAN_NAMA[d.getMonth()] + " '" + String(d.getFullYear()).slice(2), order, isHadir);
      } else {
        const d = new Date(a.tanggal);
        addBucket(String(d.getFullYear()), d.getFullYear(), isHadir);
      }
    });

    const sorted = Array.from(buckets.entries()).sort((a, b) => a[1].order - b[1].order);
    const labels = sorted.map(([k]) => k);
    const values = sorted.map(([, v]) => v.total ? Math.round((v.hadir / v.total) * 100) : 0);

    const avg = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : 0;
    const last = values[values.length - 1] || 0;
    const prev = values[values.length - 2] || last;
    const delta = last - prev;

    return { labels, values, avg, last, delta, jumlahSiswa: siswaIds.size };
  }, [data, periode, filterKelas, filterJilid, activeTAId]);

  return _Dashboard({ user, data, periode, setPeriode, filterKelas, setFilterKelas, filterJilid, setFilterJilid, trend });
}

function _Dashboard({ user, data, periode, setPeriode, filterKelas, setFilterKelas, filterJilid, setFilterJilid, trend }: {
  user: User;
  data: AppData;
  periode: 'minggu' | 'bulan' | 'tahun';
  setPeriode: (p: 'minggu' | 'bulan' | 'tahun') => void;
  filterKelas: string;
  setFilterKelas: (v: string) => void;
  filterJilid: string;
  setFilterJilid: (v: string) => void;
  trend: { labels: string[]; values: number[]; avg: number; last: number; delta: number; jumlahSiswa: number };
}) {
  const stats = useMemo(() => {
    const totalSiswa = data.siswa.length;
    const totalGuru = data.guru.length;
    const totalKelas = data.kelas.length;
    const aktifTA = data.tahunAjaran.find(ta => ta.aktif);
    
    if (user.role === 'siswa') {
      const myData = data.siswa.find(s => s.id === user.refId);
      const myAbsensi = data.absensi.filter(a => a.siswaId === user.refId);
      const myHadir = myAbsensi.filter(a => a.status === 'H').length;
      const myNilai = data.penilaian.find(p => p.siswaId === user.refId);
      const totalNilai = myNilai
        ? myNilai.teoriMembaca.hafal + myNilai.teoriMembaca.kelancaran + myNilai.teoriMembaca.fasoha + myNilai.teoriMembaca.tartil + myNilai.tahfidz.juz1 * 5 + myNilai.tahfidz.juz30 * 5 + myNilai.tahfidz.juz29_28 * 5
        : 0;
      
      return [
        { label: 'Jilid Saat Ini', value: myData?.jilid || '-', icon: BookOpen, color: 'emerald' },
        { label: 'Kehadiran', value: `${myHadir}/${myAbsensi.length}`, icon: CheckCircle2, color: 'green' },
        { label: 'Total Nilai', value: totalNilai, icon: Award, color: 'amber' },
        { label: 'Kelas', value: data.kelas.find(k => k.id === myData?.kelasId)?.nama || '-', icon: School, color: 'blue' },
      ];
    }

    return [
      { label: 'Total Siswa', value: totalSiswa, icon: GraduationCap, color: 'emerald' },
      { label: 'Total Guru', value: totalGuru, icon: UserCog, color: 'blue' },
      { label: 'Total Kelas', value: totalKelas, icon: School, color: 'amber' },
      { label: 'Th. Ajaran Aktif', value: aktifTA ? `${aktifTA.tahun} - ${aktifTA.semester}` : '-', icon: Calendar, color: 'purple' },
    ];
  }, [data, user]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Selamat datang, <span className="font-semibold text-emerald-700">{user.name}</span></p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          const colorMap: Record<string, string> = {
            emerald: 'from-emerald-500 to-emerald-700',
            green: 'from-green-500 to-green-700',
            amber: 'from-amber-500 to-amber-600',
            blue: 'from-blue-500 to-blue-700',
            purple: 'from-purple-500 to-purple-700',
          };
          return (
            <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-5 hover:shadow-md transition">
              <div className={`w-10 h-10 md:w-12 md:h-12 rounded-lg bg-gradient-to-br ${colorMap[stat.color]} flex items-center justify-center mb-3`}>
                <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
              </div>
              <p className="text-xs md:text-sm text-gray-600">{stat.label}</p>
              <p className="text-lg md:text-2xl font-bold text-gray-900 mt-1 truncate">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Grafik Tren Pencapaian Siswa (1 garis, naik-turun per periode) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-gray-900">Grafik Tren Pencapaian Siswa</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {/* Periode toggle */}
            <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden">
              {([['minggu', 'Mingguan'], ['bulan', 'Bulanan'], ['tahun', 'Tahunan']] as const).map(([val, lbl]) => (
                <button
                  key={val}
                  onClick={() => setPeriode(val)}
                  className={`px-3 py-2 text-xs font-medium transition ${periode === val ? 'bg-emerald-700 text-white' : 'bg-white text-gray-600 hover:bg-gray-50'}`}
                >
                  {lbl}
                </button>
              ))}
            </div>
            {/* Filter kelas */}
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-white"
            >
              <option value="all">Semua Kelas</option>
              {data.kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
            </select>
            {/* Filter jilid */}
            <select
              value={filterJilid}
              onChange={(e) => setFilterJilid(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-xs bg-white"
            >
              <option value="all">Semua Jilid</option>
              {JILID_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>

        {/* Ringkasan */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-3 text-center">
            <p className="text-[11px] text-emerald-700">Rata-rata Pencapaian</p>
            <p className="text-xl font-bold text-emerald-800">{trend.avg}%</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-center">
            <p className="text-[11px] text-blue-700">Periode Terakhir</p>
            <p className="text-xl font-bold text-blue-800">{trend.last}%</p>
          </div>
          <div className={`rounded-lg p-3 text-center border ${trend.delta >= 0 ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
            <p className={`text-[11px] ${trend.delta >= 0 ? 'text-green-700' : 'text-red-700'}`}>Perubahan</p>
            <p className={`text-xl font-bold ${trend.delta >= 0 ? 'text-green-800' : 'text-red-800'}`}>
              {trend.delta >= 0 ? '▲ +' : '▼ '}{trend.delta}%
            </p>
          </div>
        </div>

        {trend.values.length > 0 ? (
          <>
            <LineChart
              title={`Tingkat Pencapaian (Kehadiran) ${periode === 'minggu' ? 'per Minggu' : periode === 'bulan' ? 'per Bulan' : 'per Tahun'}`}
              icon={TrendingUp}
              color="#059669"
              labels={trend.labels}
              values={trend.values}
              minY={0}
            />
            <p className="text-[11px] text-gray-400 text-center mt-2">
              Menampilkan tren naik-turun pencapaian dari {trend.jumlahSiswa} siswa
              {filterKelas !== 'all' && ` • Kelas ${data.kelas.find(k => k.id === Number(filterKelas))?.nama}`}
              {filterJilid !== 'all' && ` • ${filterJilid}`}
            </p>
          </>
        ) : (
          <div className="py-10 text-center text-gray-500 text-sm">
            Belum ada data untuk filter yang dipilih.
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-gray-900">Distribusi Jilid Siswa</h3>
          </div>
          <div className="space-y-2">
            {JILID_OPTIONS.map((jilid) => {
              const count = data.siswa.filter(s => s.jilid === jilid).length;
              const pct = data.siswa.length ? (count / data.siswa.length) * 100 : 0;
              return (
                <div key={jilid}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-700">{jilid}</span>
                    <span className="font-semibold text-gray-900">{count}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-emerald-700" />
            <h3 className="font-semibold text-gray-900">Informasi Sistem</h3>
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Tahun Ajaran Aktif</span>
              <span className="font-semibold text-gray-900">
                {data.tahunAjaran.find(ta => ta.aktif)?.tahun} - {data.tahunAjaran.find(ta => ta.aktif)?.semester}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Metode Pembelajaran</span>
              <span className="font-semibold text-gray-900">UMMI</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Pertemuan/Semester</span>
              <span className="font-semibold text-gray-900">{data.pertemuan.length} Pertemuan</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Madrasah</span>
              <span className="font-semibold text-gray-900">MI Islamiyah Malang</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-gray-600">Kepala Madrasah</span>
              <span className="font-semibold text-gray-900">Nur Kholifah, S.Pd.I</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== DATA GURU ====================
function DataGuru({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [editing, setEditing] = useState<Guru | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const filtered = data.guru.filter(g => 
    g.nama.toLowerCase().includes(search.toLowerCase()) ||
    g.nip.includes(search) ||
    g.jabatan.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (g: Guru) => {
    let newGuru: Guru[];
    if (data.guru.find(x => x.id === g.id)) {
      newGuru = data.guru.map(x => x.id === g.id ? g : x);
    } else {
      newGuru = [...data.guru, { ...g, id: getNextId(data.guru) }];
    }
    onUpdate({ ...data, guru: newGuru });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus data guru ini?')) {
      onUpdate({ ...data, guru: data.guru.filter(g => g.id !== id) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Data Guru</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola data guru MI Islamiyah</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Guru
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari guru berdasarkan nama, NIP, atau jabatan..."
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
          />
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">No</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">NIP</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Nama</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Jabatan</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">JK</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Jilid Diajar</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">No. Telp</th>
                <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((g, idx) => (
                <tr key={g.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">{g.nip}</td>
                  <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">{g.nama}</td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{g.jabatan}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${g.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {g.jenisKelamin}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex flex-wrap gap-1 max-w-[220px]">
                      {(g.jilidAjar && g.jilidAjar.length > 0) ? g.jilidAjar.map(j => (
                        <span key={j} className="px-1.5 py-0.5 bg-amber-100 text-amber-800 rounded text-[10px] font-medium whitespace-nowrap">{j}</span>
                      )) : <span className="text-gray-400 text-xs">-</span>}
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{g.noTelp}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => { setEditing(g); setShowForm(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded transition"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(g.id)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <GuruForm
          guru={editing}
          kelasList={data.kelas}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function GuruForm({ guru, kelasList, onSave, onClose }: {
  guru: Guru | null;
  kelasList: Kelas[];
  onSave: (g: Guru) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Guru>(guru || {
    id: 0, nip: '', nama: '', jabatan: '', jenisKelamin: 'L', noTelp: '', alamat: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{guru ? 'Edit' : 'Tambah'} Guru</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">NIP</label>
            <input required type="text" value={form.nip} onChange={(e) => setForm({ ...form, nip: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jabatan</label>
            <input required type="text" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as 'L' | 'P' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp</label>
              <input required type="text" value={form.noTelp} onChange={(e) => setForm({ ...form, noTelp: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas (Opsional)</label>
            <select value={form.kelasId || ''} onChange={(e) => setForm({ ...form, kelasId: e.target.value ? Number(e.target.value) : undefined })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              <option value="">- Bukan Wali Kelas -</option>
              {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jilid yang Diajar (UMMI)</label>
            <p className="text-xs text-gray-500 mb-2">Pilih jilid yang diampu. Siswa otomatis dikelompokkan dari data siswa.</p>
            <div className="grid grid-cols-3 gap-2">
              {JILID_OPTIONS.map(j => {
                const checked = (form.jilidAjar || []).includes(j);
                return (
                  <label key={j} className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer text-xs transition ${checked ? 'bg-amber-50 border-amber-400 text-amber-800 font-medium' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const current = form.jilidAjar || [];
                        setForm({ ...form, jilidAjar: e.target.checked ? [...current, j] : current.filter(x => x !== j) });
                      }}
                      className="w-3.5 h-3.5 text-amber-600 rounded focus:ring-amber-500"
                    />
                    {j}
                  </label>
                );
              })}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea required rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== DATA SISWA ====================
function DataSiswa({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [editing, setEditing] = useState<Siswa | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');
  const [filterKelas, setFilterKelas] = useState<string>('all');

  const filtered = data.siswa.filter(s => {
    const matchSearch = s.nama.toLowerCase().includes(search.toLowerCase()) || s.nis.includes(search);
    const matchKelas = filterKelas === 'all' || s.kelasId === Number(filterKelas);
    return matchSearch && matchKelas;
  });

  const handleSave = (s: Siswa) => {
    let newSiswa: Siswa[];
    if (data.siswa.find(x => x.id === s.id)) {
      newSiswa = data.siswa.map(x => x.id === s.id ? s : x);
    } else {
      newSiswa = [...data.siswa, { ...s, id: getNextId(data.siswa) }];
    }
    onUpdate({ ...data, siswa: newSiswa });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (confirm('Yakin ingin menghapus data siswa ini?')) {
      onUpdate({
        ...data,
        siswa: data.siswa.filter(s => s.id !== id),
        absensi: data.absensi.filter(a => a.siswaId !== id),
        penilaian: data.penilaian.filter(p => p.siswaId !== id),
      });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Data Siswa</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola data siswa MI Islamiyah</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Siswa
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau NIS..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterKelas}
              onChange={(e) => setFilterKelas(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none bg-white"
            >
              <option value="all">Semua Kelas</option>
              {data.kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">No</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">NIS</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Nama</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Kelas</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Jilid</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">JK</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Wali</th>
                <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((s, idx) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2.5 text-gray-700 font-mono text-xs whitespace-nowrap">{s.nis}</td>
                  <td className="px-3 py-2.5 text-gray-900 font-medium whitespace-nowrap">{s.nama}</td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">
                      {data.kelas.find(k => k.id === s.kelasId)?.nama || '-'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">
                    <select
                      value={s.jilid}
                      onChange={(e) => onUpdate({ ...data, siswa: data.siswa.map(x => x.id === s.id ? { ...x, jilid: e.target.value as JilidType } : x) })}
                      className="px-2 py-1 border border-amber-300 rounded text-xs bg-amber-50 font-medium text-amber-800 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                      {JILID_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                    </select>
                  </td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                      {s.jenisKelamin}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-gray-700 whitespace-nowrap">{s.namaWali}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="Edit">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(s.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="px-3 py-8 text-center text-gray-500">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <SiswaForm
          siswa={editing}
          kelasList={data.kelas}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function SiswaForm({ siswa, kelasList, onSave, onClose }: {
  siswa: Siswa | null;
  kelasList: Kelas[];
  onSave: (s: Siswa) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Siswa>(siswa || {
    id: 0, nis: '', nama: '', kelasId: kelasList[0]?.id || 1, jilid: 'Jilid 1',
    jenisKelamin: 'L', tanggalLahir: '', namaWali: '', noTelpWali: '', alamat: ''
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{siswa ? 'Edit' : 'Tambah'} Siswa</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NIS</label>
              <input required type="text" value={form.nis} onChange={(e) => setForm({ ...form, nis: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Kelamin</label>
              <select value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as 'L' | 'P' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                <option value="L">Laki-laki</option>
                <option value="P">Perempuan</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input required type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Kelas</label>
              <select required value={form.kelasId} onChange={(e) => setForm({ ...form, kelasId: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                {kelasList.map(k => <option key={k.id} value={k.id}>{k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jilid</label>
              <select value={form.jilid} onChange={(e) => setForm({ ...form, jilid: e.target.value as JilidType })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
                {JILID_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Lahir</label>
            <input required type="date" value={form.tanggalLahir} onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Wali</label>
            <input required type="text" value={form.namaWali} onChange={(e) => setForm({ ...form, namaWali: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">No. Telp Wali</label>
            <input required type="text" value={form.noTelpWali} onChange={(e) => setForm({ ...form, noTelpWali: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
            <textarea required rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== DATA KELAS ====================
function DataKelas({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [editing, setEditing] = useState<Kelas | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (k: Kelas) => {
    let newKelas: Kelas[];
    if (data.kelas.find(x => x.id === k.id)) {
      newKelas = data.kelas.map(x => x.id === k.id ? k : x);
    } else {
      newKelas = [...data.kelas, { ...k, id: getNextId(data.kelas) }];
    }
    onUpdate({ ...data, kelas: newKelas });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    const siswaCount = data.siswa.filter(s => s.kelasId === id).length;
    if (siswaCount > 0) {
      alert(`Tidak dapat menghapus kelas ini karena masih ada ${siswaCount} siswa!`);
      return;
    }
    if (confirm('Yakin ingin menghapus kelas ini?')) {
      onUpdate({ ...data, kelas: data.kelas.filter(k => k.id !== id) });
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Data Kelas</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola data kelas 1 sampai 6</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah Kelas
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.kelas.map((k) => {
          const siswaCount = data.siswa.filter(s => s.kelasId === k.id).length;
          return (
            <div key={k.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-lg flex items-center justify-center">
                    <School className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Kelas {k.nama}</h3>
                    <p className="text-xs text-gray-500">Tingkat {k.tingkat}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => { setEditing(k); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(k.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="space-y-2 text-sm pt-3 border-t border-gray-100">
                <div className="flex justify-between">
                  <span className="text-gray-600">Wali Kelas</span>
                  <span className="font-medium text-gray-900 text-right">{k.waliKelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Jumlah Siswa</span>
                  <span className="font-semibold text-emerald-700">{siswaCount} / {k.kapasitas}</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                  <div className="h-full bg-emerald-500" style={{ width: `${(siswaCount / k.kapasitas) * 100}%` }} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {showForm && (
        <KelasForm
          kelas={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function KelasForm({ kelas, onSave, onClose }: {
  kelas: Kelas | null;
  onSave: (k: Kelas) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<Kelas>(kelas || {
    id: 0, nama: '', tingkat: 1, waliKelas: '', kapasitas: 30
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{kelas ? 'Edit' : 'Tambah'} Kelas</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Kelas</label>
            <input required type="text" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: 1A, 2B" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tingkat</label>
            <select required value={form.tingkat} onChange={(e) => setForm({ ...form, tingkat: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {[1, 2, 3, 4, 5, 6].map(t => <option key={t} value={t}>Tingkat {t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Wali Kelas</label>
            <input required type="text" value={form.waliKelas} onChange={(e) => setForm({ ...form, waliKelas: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Kapasitas</label>
            <input required type="number" min={1} value={form.kapasitas} onChange={(e) => setForm({ ...form, kapasitas: Number(e.target.value) })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== TAHUN AJARAN ====================
function TahunAjaran({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [editing, setEditing] = useState<TahunAjaran | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleSave = (ta: TahunAjaran) => {
    let newTA: TahunAjaran[];
    if (data.tahunAjaran.find(x => x.id === ta.id)) {
      newTA = data.tahunAjaran.map(x => x.id === ta.id ? ta : x);
    } else {
      newTA = [...data.tahunAjaran, { ...ta, id: getNextId(data.tahunAjaran) }];
    }
    onUpdate({ ...data, tahunAjaran: newTA });
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (id: number) => {
    if (data.tahunAjaran.find(ta => ta.id === id)?.aktif) {
      alert('Tidak dapat menghapus tahun ajaran yang aktif!');
      return;
    }
    if (confirm('Yakin ingin menghapus?')) {
      onUpdate({ ...data, tahunAjaran: data.tahunAjaran.filter(ta => ta.id !== id) });
    }
  };

  const handleSetAktif = (id: number) => {
    onUpdate({ ...data, tahunAjaran: data.tahunAjaran.map(ta => ({ ...ta, aktif: ta.id === id })) });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Tahun Ajaran</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola tahun ajaran dan semester (Ganjil/Genap)</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 rounded-lg font-medium transition shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.tahunAjaran.map((ta) => (
          <div key={ta.id} className={`bg-white rounded-xl shadow-sm border-2 p-5 transition ${
            ta.aktif ? 'border-emerald-500 ring-2 ring-emerald-100' : 'border-gray-100'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  ta.aktif ? 'bg-gradient-to-br from-emerald-500 to-emerald-700' : 'bg-gray-200'
                }`}>
                  <Calendar className={`w-6 h-6 ${ta.aktif ? 'text-white' : 'text-gray-500'}`} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{ta.tahun}</h3>
                  <span className={`inline-block mt-0.5 px-2 py-0.5 text-xs rounded font-medium ${
                    ta.semester === 'Ganjil' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                  }`}>
                    Semester {ta.semester}
                  </span>
                </div>
              </div>
              <div className="flex gap-1">
                <button onClick={() => { setEditing(ta); setShowForm(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => handleDelete(ta.id)} className="p-1.5 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="pt-3 border-t border-gray-100">
              {ta.aktif ? (
                <div className="flex items-center gap-2 text-emerald-700 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4" /> Aktif
                </div>
              ) : (
                <button
                  onClick={() => handleSetAktif(ta.id)}
                  className="text-sm text-emerald-700 hover:text-emerald-800 font-medium"
                >
                  Aktifkan →
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {showForm && (
        <TAForm
          ta={editing}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function TAForm({ ta, onSave, onClose }: {
  ta: TahunAjaran | null;
  onSave: (t: TahunAjaran) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<TahunAjaran>(ta || {
    id: 0, tahun: '2024/2025', semester: 'Ganjil', aktif: false
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{ta ? 'Edit' : 'Tambah'} Tahun Ajaran</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={(e) => { e.preventDefault(); onSave(form); }} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
            <input required type="text" value={form.tahun} onChange={(e) => setForm({ ...form, tahun: e.target.value })} placeholder="Contoh: 2024/2025" className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Semester</label>
            <select value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value as 'Ganjil' | 'Genap' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              <option value="Ganjil">Ganjil</option>
              <option value="Genap">Genap</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" id="aktif" checked={form.aktif} onChange={(e) => setForm({ ...form, aktif: e.target.checked })} className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500" />
            <label htmlFor="aktif" className="text-sm text-gray-700">Set sebagai tahun ajaran aktif</label>
          </div>
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ABSENSI DENGAN EXCEL POPUP ====================
function Absensi({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [selectedKelas, setSelectedKelas] = useState<number>(data.kelas[0]?.id || 1);
  const [showExcel, setShowExcel] = useState(false);
  const [activeTA, setActiveTA] = useState<number>(data.tahunAjaran.find(ta => ta.aktif)?.id || 1);

  const siswaKelas = data.siswa.filter(s => s.kelasId === selectedKelas);
  const pertemuanList = data.pertemuan;

  const getStatus = (siswaId: number, pertemuan: number): StatusAbsen => {
    return data.absensi.find(a => a.siswaId === siswaId && a.pertemuan === pertemuan && a.tahunAjaranId === activeTA)?.status || 'H';
  };

  const summary = useMemo(() => {
    return siswaKelas.map(s => {
      const abs = data.absensi.filter(a => a.siswaId === s.id && a.tahunAjaranId === activeTA);
      return {
        siswa: s,
        H: abs.filter(a => a.status === 'H').length,
        S: abs.filter(a => a.status === 'S').length,
        I: abs.filter(a => a.status === 'I').length,
        A: abs.filter(a => a.status === 'A').length,
        total: abs.length,
      };
    });
  }, [siswaKelas, data.absensi, activeTA]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Absensi</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola absensi siswa per kelas</p>
        </div>
        <button
          onClick={() => setShowExcel(true)}
          className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white px-5 py-2.5 rounded-lg font-medium transition shadow-md hover:shadow-lg"
        >
          <FileText className="w-4 h-4" /> Buka Excel Editor
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
            <select value={selectedKelas} onChange={(e) => setSelectedKelas(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {data.kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
            <select value={activeTA} onChange={(e) => setActiveTA(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {data.tahunAjaran.map(ta => <option key={ta.id} value={ta.id}>{ta.tahun} - {ta.semester}</option>)}
            </select>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-center">
            <p className="text-xs text-green-700">Total Hadir</p>
            <p className="text-xl font-bold text-green-800">{summary.reduce((a, b) => a + b.H, 0)}</p>
          </div>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-center">
            <p className="text-xs text-yellow-700">Total Sakit</p>
            <p className="text-xl font-bold text-yellow-800">{summary.reduce((a, b) => a + b.S, 0)}</p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
            <p className="text-xs text-blue-700">Total Izin</p>
            <p className="text-xl font-bold text-blue-800">{summary.reduce((a, b) => a + b.I, 0)}</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
            <p className="text-xs text-red-700">Total Alpha</p>
            <p className="text-xl font-bold text-red-800">{summary.reduce((a, b) => a + b.A, 0)}</p>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-emerald-50 text-emerald-900">
                <th className="px-3 py-2 text-left font-semibold border border-emerald-200 sticky left-0 bg-emerald-50 z-10">No</th>
                <th className="px-3 py-2 text-left font-semibold border border-emerald-200 sticky left-12 bg-emerald-50 z-10 min-w-[180px]">Nama</th>
                {pertemuanList.map(p => (
                  <th key={p.pertemuan} className="px-1.5 py-2 text-center font-semibold border border-emerald-200 min-w-[40px]">
                    P{p.pertemuan}
                  </th>
                ))}
                <th className="px-2 py-2 text-center font-semibold border border-emerald-200 bg-green-100">H</th>
                <th className="px-2 py-2 text-center font-semibold border border-emerald-200 bg-yellow-100">S</th>
                <th className="px-2 py-2 text-center font-semibold border border-emerald-200 bg-blue-100">I</th>
                <th className="px-2 py-2 text-center font-semibold border border-emerald-200 bg-red-100">A</th>
              </tr>
            </thead>
            <tbody>
              {summary.map((row, idx) => (
                <tr key={row.siswa.id} className="hover:bg-gray-50">
                  <td className="px-3 py-1.5 text-gray-600 border border-gray-200 sticky left-0 bg-white">{idx + 1}</td>
                  <td className="px-3 py-1.5 text-gray-900 font-medium border border-gray-200 sticky left-12 bg-white whitespace-nowrap">{row.siswa.nama}</td>
                  {pertemuanList.map(p => {
                    const status = getStatus(row.siswa.id, p.pertemuan);
                    const colorClass = status === 'H' ? 'bg-green-100 text-green-800' : 
                                      status === 'S' ? 'bg-yellow-100 text-yellow-800' :
                                      status === 'I' ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800';
                    return (
                      <td key={p.pertemuan} className={`px-1 py-1 text-center border border-gray-200 font-bold text-xs ${colorClass}`}>
                        {status}
                      </td>
                    );
                  })}
                  <td className="px-2 py-1.5 text-center border border-gray-200 font-bold text-green-700 bg-green-50">{row.H}</td>
                  <td className="px-2 py-1.5 text-center border border-gray-200 font-bold text-yellow-700 bg-yellow-50">{row.S}</td>
                  <td className="px-2 py-1.5 text-center border border-gray-200 font-bold text-blue-700 bg-blue-50">{row.I}</td>
                  <td className="px-2 py-1.5 text-center border border-gray-200 font-bold text-red-700 bg-red-50">{row.A}</td>
                </tr>
              ))}
              {summary.length === 0 && (
                <tr><td colSpan={pertemuanList.length + 6} className="px-3 py-8 text-center text-gray-500">Tidak ada siswa di kelas ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showExcel && (
        <ExcelPopup
          data={data}
          kelasId={selectedKelas}
          tahunAjaranId={activeTA}
          onUpdate={onUpdate}
          onClose={() => setShowExcel(false)}
        />
      )}
    </div>
  );
}

function ExcelPopup({ data, kelasId, tahunAjaranId, onUpdate, onClose }: {
  data: AppData;
  kelasId: number;
  tahunAjaranId: number;
  onUpdate: (d: AppData) => void;
  onClose: () => void;
}) {
  const siswaKelas = data.siswa.filter(s => s.kelasId === kelasId);
  const [localAbs, setLocalAbs] = useState<Record<string, StatusAbsen>>(() => {
    const map: Record<string, StatusAbsen> = {};
    siswaKelas.forEach(s => {
      data.pertemuan.forEach(p => {
        const key = `${s.id}_${p.pertemuan}`;
        map[key] = data.absensi.find(a => a.siswaId === s.id && a.pertemuan === p.pertemuan && a.tahunAjaranId === tahunAjaranId)?.status || 'H';
      });
    });
    return map;
  });

  const [localDates, setLocalDates] = useState<Record<number, string>>(() => {
    const map: Record<number, string> = {};
    data.pertemuan.forEach(p => { map[p.pertemuan] = p.tanggal; });
    return map;
  });

  const handleCellChange = (siswaId: number, pertemuan: number, value: StatusAbsen) => {
    setLocalAbs({ ...localAbs, [`${siswaId}_${pertemuan}`]: value });
  };

  const handleDateChange = (pertemuan: number, value: string) => {
    setLocalDates({ ...localDates, [pertemuan]: value });
  };

  const handleSave = () => {
    const newAbsensi: Absensi[] = [];
    Object.entries(localAbs).forEach(([key, status]) => {
      const [siswaIdStr, pertemuanStr] = key.split('_');
      const siswaId = Number(siswaIdStr);
      const pertemuan = Number(pertemuanStr);
      newAbsensi.push({
        siswaId,
        kelasId,
        tahunAjaranId,
        pertemuan,
        tanggal: localDates[pertemuan] || new Date().toISOString().split('T')[0],
        status,
      });
    });
    // Remove old absensi for this class and tahun
    const filtered = data.absensi.filter(a => !(a.kelasId === kelasId && a.tahunAjaranId === tahunAjaranId));
    onUpdate({ ...data, absensi: [...filtered, ...newAbsensi] });
    onClose();
  };

  const handleFillAll = (pertemuan: number, status: StatusAbsen) => {
    const newLocal = { ...localAbs };
    siswaKelas.forEach(s => { newLocal[`${s.id}_${pertemuan}`] = status; });
    setLocalAbs(newLocal);
  };

  const getStatusColor = (s: StatusAbsen) => {
    switch (s) {
      case 'H': return 'bg-green-500 text-white';
      case 'S': return 'bg-yellow-500 text-white';
      case 'I': return 'bg-blue-500 text-white';
      case 'A': return 'bg-red-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-7xl max-h-[95vh] flex flex-col">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-emerald-700 to-emerald-800 text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-lg">Excel Editor - Absensi</h3>
              <p className="text-xs text-emerald-100">
                Kelas {data.kelas.find(k => k.id === kelasId)?.nama} • {data.tahunAjaran.find(ta => ta.id === tahunAjaranId)?.tahun} - {data.tahunAjaran.find(ta => ta.id === tahunAjaranId)?.semester}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-lg"><X className="w-5 h-5" /></button>
        </div>

        <div className="p-3 border-b border-gray-200 bg-gray-50 flex flex-wrap items-center gap-3 text-xs">
          <span className="font-semibold text-gray-700">Legenda:</span>
          <span className="px-2 py-1 bg-green-500 text-white rounded font-medium">H = Hadir</span>
          <span className="px-2 py-1 bg-yellow-500 text-white rounded font-medium">S = Sakit</span>
          <span className="px-2 py-1 bg-blue-500 text-white rounded font-medium">I = Izin</span>
          <span className="px-2 py-1 bg-red-500 text-white rounded font-medium">A = Alpha</span>
          <span className="ml-auto text-gray-500">Klik cell untuk mengubah status</span>
        </div>

        <div className="flex-1 overflow-auto p-3">
          <div className="overflow-x-auto">
            <table className="w-full text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-100 sticky top-0 z-20">
                  <th className="px-2 py-2 text-left font-bold border-2 border-emerald-300 sticky left-0 bg-emerald-100 z-30 min-w-[40px]">No</th>
                  <th className="px-2 py-2 text-left font-bold border-2 border-emerald-300 sticky left-10 bg-emerald-100 z-30 min-w-[160px]">Nama</th>
                  {data.pertemuan.map(p => (
                    <th key={p.pertemuan} className="px-1 py-1 text-center border-2 border-emerald-300 min-w-[60px]">
                      <div className="font-bold">P{p.pertemuan}</div>
                      <input
                        type="date"
                        value={localDates[p.pertemuan] || ''}
                        onChange={(e) => handleDateChange(p.pertemuan, e.target.value)}
                        className="mt-1 w-full text-[10px] px-1 py-0.5 border border-emerald-200 rounded"
                      />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {siswaKelas.map((s, idx) => (
                  <tr key={s.id} className="hover:bg-emerald-50/50">
                    <td className="px-2 py-1 text-center text-gray-600 border border-gray-300 font-medium sticky left-0 bg-white z-10">{idx + 1}</td>
                    <td className="px-2 py-1 text-gray-900 font-medium border border-gray-300 sticky left-10 bg-white z-10 whitespace-nowrap">{s.nama}</td>
                    {data.pertemuan.map(p => {
                      const status = localAbs[`${s.id}_${p.pertemuan}`] || 'H';
                      return (
                        <td key={p.pertemuan} className="p-0.5 border border-gray-300 text-center">
                          <select
                            value={status}
                            onChange={(e) => handleCellChange(s.id, p.pertemuan, e.target.value as StatusAbsen)}
                            className={`w-full px-1 py-1 text-center font-bold text-xs border-0 cursor-pointer focus:ring-2 focus:ring-emerald-500 ${getStatusColor(status)}`}
                          >
                            <option value="H">H</option>
                            <option value="S">S</option>
                            <option value="I">I</option>
                            <option value="A">A</option>
                          </select>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
            <p className="text-xs font-semibold text-amber-900 mb-2">Quick Fill (Set semua siswa):</p>
            <div className="flex flex-wrap gap-2">
              {data.pertemuan.map(p => (
                <div key={p.pertemuan} className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-amber-200">
                  <span className="text-xs font-medium text-gray-700">P{p.pertemuan}:</span>
                  <button onClick={() => handleFillAll(p.pertemuan, 'H')} className="px-1.5 py-0.5 bg-green-500 text-white text-xs rounded font-bold">H</button>
                  <button onClick={() => handleFillAll(p.pertemuan, 'S')} className="px-1.5 py-0.5 bg-yellow-500 text-white text-xs rounded font-bold">S</button>
                  <button onClick={() => handleFillAll(p.pertemuan, 'I')} className="px-1.5 py-0.5 bg-blue-500 text-white text-xs rounded font-bold">I</button>
                  <button onClick={() => handleFillAll(p.pertemuan, 'A')} className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded font-bold">A</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 flex justify-end gap-2 bg-gray-50 rounded-b-2xl">
          <button onClick={onClose} className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium">Batal</button>
          <button onClick={handleSave} className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-medium flex items-center gap-2 shadow-md">
            <Save className="w-4 h-4" /> Simpan Absensi
          </button>
        </div>
      </div>
    </div>
  );
}

// ==================== PENILAIAN ====================
function Penilaian({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [selectedKelas, setSelectedKelas] = useState<number>(data.kelas[0]?.id || 1);
  const [activeTA, setActiveTA] = useState<number>(data.tahunAjaran.find(ta => ta.aktif)?.id || 1);

  const siswaKelas = data.siswa.filter(s => s.kelasId === selectedKelas);

  const getPenilaian = (siswaId: number): Penilaian => {
    return data.penilaian.find(p => p.siswaId === siswaId && p.tahunAjaranId === activeTA) || {
      siswaId,
      kelasId: selectedKelas,
      tahunAjaranId: activeTA,
      jilid: 'Jilid 1',
      teoriMembaca: { hafal: 0, kelancaran: 0, fasoha: 0, tartil: 0 },
      tahfidz: { juz1: 0, juz30: 0, juz29_28: 0 },
      ketidakhadiran: { sakit: 0, izin: 0, alpha: 0 },
      perilaku: { disiplin: 'B', kerapian: 'B', kesopanan: 'B', kebersihan: 'B' },
      teoriMembacaNilai: { hafalan: 'B', kelancaran: 'B', fasoha: 'B', tartil: 'B', juz30: 'B', juz29_30: 'B' },
      tahfidzNilai: { hafalan: 'B', kelancaran: 'B', fasoha: 'B', tartil: 'B' },
    };
  };

  const calculateJumlah = (p: Penilaian): number => {
    return p.teoriMembaca.hafal + p.teoriMembaca.kelancaran + p.teoriMembaca.fasoha + p.teoriMembaca.tartil +
           (p.tahfidz.juz1 * 5) + (p.tahfidz.juz30 * 5) + (p.tahfidz.juz29_28 * 5);
  };

  const updatePenilaian = (siswaId: number, updater: (p: Penilaian) => Penilaian) => {
    const existing = data.penilaian.find(p => p.siswaId === siswaId && p.tahunAjaranId === activeTA);
    const updated = updater(getPenilaian(siswaId));
    if (existing) {
      onUpdate({ ...data, penilaian: data.penilaian.map(p => p.siswaId === siswaId && p.tahunAjaranId === activeTA ? updated : p) });
    } else {
      onUpdate({ ...data, penilaian: [...data.penilaian, updated] });
    }
  };

  const nilaiOptions = ['', 'A', 'B+', 'B', 'C+', 'C'];
  const perilakuOptions = ['', 'A', 'B+', 'B', 'C+', 'C'];

  // ===== Siapkan data export =====
  const kelasNama = data.kelas.find(k => k.id === selectedKelas)?.nama || '-';
  const taInfo = data.tahunAjaran.find(t => t.id === activeTA);
  const taLabel = taInfo ? `${taInfo.tahun} - ${taInfo.semester}` : '-';

  const buildExportData = () => {
    const headerRows = [
      ['No', 'Nama', 'Jilid', 'Hafal', 'Kelancaran', 'Fasoha', 'Tartil', 'Juz 1', 'Juz 30', 'Juz 29&28',
       'Sakit', 'Izin', 'Alpha', 'Disiplin', 'Kerapian', 'Kesopanan', 'Kebersihan',
       'TM-Hafalan', 'TM-Kelancaran', 'TM-Fasoha', 'TM-Tartil', 'TM-Juz30', 'TM-Juz2930',
       'TF-Hafalan', 'TF-Kelancaran', 'TF-Fasoha', 'TF-Tartil', 'Jumlah'],
    ];
    const rows = siswaKelas.map((s, idx) => {
      const p = getPenilaian(s.id);
      return [
        idx + 1, s.nama, p.jilid,
        p.teoriMembaca.hafal, p.teoriMembaca.kelancaran, p.teoriMembaca.fasoha, p.teoriMembaca.tartil,
        p.tahfidz.juz1, p.tahfidz.juz30, p.tahfidz.juz29_28,
        p.ketidakhadiran.sakit, p.ketidakhadiran.izin, p.ketidakhadiran.alpha,
        p.perilaku.disiplin, p.perilaku.kerapian, p.perilaku.kesopanan, p.perilaku.kebersihan,
        p.teoriMembacaNilai.hafalan, p.teoriMembacaNilai.kelancaran, p.teoriMembacaNilai.fasoha, p.teoriMembacaNilai.tartil, p.teoriMembacaNilai.juz30, p.teoriMembacaNilai.juz29_30,
        p.tahfidzNilai.hafalan, p.tahfidzNilai.kelancaran, p.tahfidzNilai.fasoha, p.tahfidzNilai.tartil,
        calculateJumlah(p),
      ];
    });
    return { headerRows, rows };
  };

  const handleExportExcel = () => {
    const { headerRows, rows } = buildExportData();
    exportToExcel({
      filename: `Penilaian_${kelasNama}_${taLabel}`.replace(/[/\s]/g, '_'),
      title: 'PENILAIAN HASIL BELAJAR MENGAJI - METODE UMMI',
      subtitle: [`MI Islamiyah Malang`, `Kelas ${kelasNama} • Tahun Ajaran ${taLabel}`],
      headerRows, rows,
    });
  };

  const handleExportCSV = () => {
    const { headerRows, rows } = buildExportData();
    exportToCSV({ filename: `Penilaian_${kelasNama}_${taLabel}`.replace(/[/\s]/g, '_'), headerRows, rows });
  };

  const handleExportPDF = () => {
    const { headerRows, rows } = buildExportData();
    const totalIdx = rows.map((_, i) => i); // semua baris normal
    exportToPDF({
      title: 'PENILAIAN HASIL BELAJAR MENGAJI - METODE UMMI',
      subtitle: ['MI Islamiyah Malang', `Kelas ${kelasNama} • Tahun Ajaran ${taLabel}`],
      htmlContent: buildHTMLTable(headerRows, rows, []),
      landscape: true,
    });
    void totalIdx;
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Penilaian</h1>
          <p className="text-gray-600 text-sm mt-1">Input nilai mengaji siswa</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={handleExportExcel} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handleExportCSV} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={handleExportPDF} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Kelas</label>
            <select value={selectedKelas} onChange={(e) => setSelectedKelas(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {data.kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
            <select value={activeTA} onChange={(e) => setActiveTA(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {data.tahunAjaran.map(ta => <option key={ta.id} value={ta.id}>{ta.tahun} - {ta.semester}</option>)}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-emerald-700 text-white">
                <th rowSpan={2} className="px-2 py-2 border border-emerald-800 sticky left-0 bg-emerald-700 z-10 min-w-[30px]">No</th>
                <th rowSpan={2} className="px-2 py-2 border border-emerald-800 sticky left-8 bg-emerald-700 z-10 min-w-[150px]">Nama</th>
                <th rowSpan={2} className="px-2 py-2 border border-emerald-800 min-w-[100px]">Jilid</th>
                <th colSpan={4} className="px-2 py-1 border border-emerald-800 bg-emerald-600">Teori Membaca</th>
                <th colSpan={3} className="px-2 py-1 border border-emerald-800 bg-emerald-600">Tahfidz</th>
                <th colSpan={3} className="px-2 py-1 border border-emerald-800 bg-amber-600">Ketidakhadiran</th>
                <th colSpan={4} className="px-2 py-1 border border-emerald-800 bg-blue-600">Perilaku</th>
                <th colSpan={6} className="px-2 py-1 border border-emerald-800 bg-purple-600">Teori Membaca (Nilai)</th>
                <th colSpan={4} className="px-2 py-1 border border-emerald-800 bg-indigo-600">Tahfidz (Nilai)</th>
                <th rowSpan={2} className="px-2 py-2 border border-emerald-800 bg-yellow-500 text-yellow-900 min-w-[50px]">Jumlah</th>
              </tr>
              <tr className="bg-emerald-600 text-white">
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Hafal</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kelancaran</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Fasoha</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Tartil</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px] bg-amber-500/20">Juz 1</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px] bg-amber-500/20">Juz 30</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px] bg-amber-500/20">Juz 29&28</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Sakit</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Izin</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Alpha</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Disiplin</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kerapian</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kesopanan</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kebersihan</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Hafalan</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kelancaran</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Fasoha</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Tartil</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Juz 30</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Juz 29 30</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Hafalan</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Kelancaran</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Fasoha</th>
                <th className="px-1 py-1 border border-emerald-800 min-w-[50px]">Tartil</th>
              </tr>
            </thead>
            <tbody>
              {siswaKelas.map((s, idx) => {
                const p = getPenilaian(s.id);
                const jumlah = calculateJumlah(p);
                return (
                  <tr key={s.id} className="hover:bg-amber-50/30">
                    <td className="px-2 py-1 text-center text-gray-600 border border-gray-300 sticky left-0 bg-white z-10">{idx + 1}</td>
                    <td className="px-2 py-1 text-gray-900 font-medium border border-gray-300 sticky left-8 bg-white z-10 whitespace-nowrap">{s.nama}</td>
                    <td className="px-1 py-1 border border-gray-300">
                      <select value={p.jilid} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, jilid: e.target.value as JilidType }))} className="w-full px-1 py-0.5 border border-amber-300 rounded text-xs bg-amber-50 font-medium text-amber-800 focus:ring-2 focus:ring-amber-500 outline-none">
                        {JILID_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
                      </select>
                    </td>
                    {/* Teori Membaca */}
                    {(['hafal', 'kelancaran', 'fasoha', 'tartil'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300">
                        <input type="number" min={0} max={100} value={p.teoriMembaca[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, teoriMembaca: { ...prev.teoriMembaca, [field]: Number(e.target.value) } }))} className="w-full px-1 py-0.5 text-center text-xs border border-gray-200 rounded focus:ring-2 focus:ring-emerald-500 outline-none" />
                      </td>
                    ))}
                    {/* Tahfidz */}
                    {(['juz1', 'juz30', 'juz29_28'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300 bg-amber-50/30">
                        <input type="number" min={0} value={p.tahfidz[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, tahfidz: { ...prev.tahfidz, [field]: Number(e.target.value) } }))} className="w-full px-1 py-0.5 text-center text-xs border border-amber-200 rounded focus:ring-2 focus:ring-amber-500 outline-none bg-white" />
                      </td>
                    ))}
                    {/* Ketidakhadiran */}
                    {(['sakit', 'izin', 'alpha'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300">
                        <input type="number" min={0} value={p.ketidakhadiran[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, ketidakhadiran: { ...prev.ketidakhadiran, [field]: Number(e.target.value) } }))} className="w-full px-1 py-0.5 text-center text-xs border border-gray-200 rounded focus:ring-2 focus:ring-amber-500 outline-none" />
                      </td>
                    ))}
                    {/* Perilaku */}
                    {(['disiplin', 'kerapian', 'kesopanan', 'kebersihan'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300 bg-blue-50/30">
                        <select value={p.perilaku[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, perilaku: { ...prev.perilaku, [field]: e.target.value } }))} className="w-full px-1 py-0.5 text-center text-xs border border-blue-200 rounded font-bold focus:ring-2 focus:ring-blue-500 outline-none bg-white">
                          {perilakuOptions.map(opt => <option key={opt} value={opt}>{opt || '-'}</option>)}
                        </select>
                      </td>
                    ))}
                    {/* Teori Membaca Nilai */}
                    {(['hafalan', 'kelancaran', 'fasoha', 'tartil', 'juz30', 'juz29_30'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300 bg-purple-50/30">
                        <select value={p.teoriMembacaNilai[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, teoriMembacaNilai: { ...prev.teoriMembacaNilai, [field]: e.target.value } }))} className="w-full px-1 py-0.5 text-center text-xs border border-purple-200 rounded font-bold focus:ring-2 focus:ring-purple-500 outline-none bg-white">
                          {nilaiOptions.map(opt => <option key={opt} value={opt}>{opt || '-'}</option>)}
                        </select>
                      </td>
                    ))}
                    {/* Tahfidz Nilai */}
                    {(['hafalan', 'kelancaran', 'fasoha', 'tartil'] as const).map(field => (
                      <td key={field} className="px-1 py-1 border border-gray-300 bg-indigo-50/30">
                        <select value={p.tahfidzNilai[field]} onChange={(e) => updatePenilaian(s.id, prev => ({ ...prev, tahfidzNilai: { ...prev.tahfidzNilai, [field]: e.target.value } }))} className="w-full px-1 py-0.5 text-center text-xs border border-indigo-200 rounded font-bold focus:ring-2 focus:ring-indigo-500 outline-none bg-white">
                          {nilaiOptions.map(opt => <option key={opt} value={opt}>{opt || '-'}</option>)}
                        </select>
                      </td>
                    ))}
                    {/* Jumlah */}
                    <td className="px-2 py-1 text-center border border-gray-300 bg-yellow-100 font-bold text-yellow-900 text-sm">
                      {jumlah}
                    </td>
                  </tr>
                );
              })}
              {siswaKelas.length === 0 && (
                <tr><td colSpan={26} className="px-3 py-8 text-center text-gray-500">Tidak ada siswa di kelas ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ==================== LAPORAN ====================
// Konversi angka ke kata (terbilang) bahasa Indonesia
function terbilang(n: number): string {
  const satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  if (n < 0) return '';
  if (n < 12) return satuan[n];
  if (n < 20) return terbilang(n - 10) + ' belas';
  if (n < 100) return (terbilang(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + terbilang(n % 10) : '')).trim();
  if (n < 200) return ('seratus' + (n % 100 ? ' ' + terbilang(n % 100) : '')).trim();
  if (n < 1000) return (terbilang(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + terbilang(n % 100) : '')).trim();
  if (n < 2000) return ('seribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '')).trim();
  return (terbilang(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + terbilang(n % 1000) : '')).trim();
}

function capitalize(s: string): string {
  if (!s) return '';
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Konversi nilai angka ke huruf
function nilaiHuruf(n: number): string {
  if (n <= 0) return '';
  if (n >= 90) return 'A';
  if (n >= 85) return 'B+';
  if (n >= 80) return 'B';
  if (n >= 75) return 'C+';
  if (n >= 70) return 'C';
  return 'D';
}

function Laporan({ data, user }: { data: AppData; user: User }) {
  const [selectedSiswa, setSelectedSiswa] = useState<number>(
    user.role === 'siswa' ? (user.refId || 0) : (data.siswa[0]?.id || 0)
  );
  const [activeTA, setActiveTA] = useState<number>(data.tahunAjaran.find(ta => ta.aktif)?.id || 1);

  const siswa = data.siswa.find(s => s.id === selectedSiswa);
  const kelas = data.kelas.find(k => k.id === siswa?.kelasId);
  const ta = data.tahunAjaran.find(t => t.id === activeTA);
  const nilai = data.penilaian.find(p => p.siswaId === selectedSiswa && p.tahunAjaranId === activeTA);
  const absensi = data.absensi.filter(a => a.siswaId === selectedSiswa && a.tahunAjaranId === activeTA);

  const totalSakit = absensi.filter(a => a.status === 'S').length;
  const totalIzin = absensi.filter(a => a.status === 'I').length;
  const totalAlpha = absensi.filter(a => a.status === 'A').length;

  const guruKelas = data.guru.find(g => g.kelasId === siswa?.kelasId);

  // Helper baris materi
  const nilaiRow = (n: number) => ({
    nilai: n > 0 ? n : '',
    huruf: nilaiHuruf(n),
    ket: n > 0 ? capitalize(terbilang(n)) : '',
  });

  const hafalan = nilaiRow(nilai?.teoriMembaca.hafal || 0);
  const kelancaran = nilaiRow(nilai?.teoriMembaca.kelancaran || 0);
  const fashoha = nilaiRow(nilai?.teoriMembaca.fasoha || 0);
  const tartil = nilaiRow(nilai?.teoriMembaca.tartil || 0);

  // Tahfidz: model menyimpan jumlah juz (count). Jika count > 0 dianggap tuntas dgn nilai.
  const tahfidzScore = (count: number) => (count > 0 ? 85 : 0);
  const juz30 = nilaiRow(tahfidzScore(nilai?.tahfidz.juz30 || 0));
  const juz2829 = nilaiRow(tahfidzScore(nilai?.tahfidz.juz29_28 || 0));
  const juz1 = nilaiRow(tahfidzScore(nilai?.tahfidz.juz1 || 0));

  const jumlahNilai =
    (nilai?.teoriMembaca.hafal || 0) +
    (nilai?.teoriMembaca.kelancaran || 0) +
    (nilai?.teoriMembaca.fasoha || 0) +
    (nilai?.teoriMembaca.tartil || 0) +
    tahfidzScore(nilai?.tahfidz.juz30 || 0) +
    tahfidzScore(nilai?.tahfidz.juz29_28 || 0) +
    tahfidzScore(nilai?.tahfidz.juz1 || 0);

  const jumlahTidakHadir = totalSakit + totalIzin + totalAlpha;

  // Download laporan sebagai PDF (membuka jendela cetak berisi laporan)
  const handleDownloadLaporanPDF = () => {
    const el = document.getElementById('laporan-print');
    if (!el) { window.print(); return; }
    const win = window.open('', '_blank', 'width=900,height=1000');
    if (!win) { alert('Mohon izinkan pop-up untuk mengunduh PDF.'); return; }
    win.document.write(`
      <!doctype html><html lang="id"><head><meta charset="UTF-8" />
      <title>Laporan - ${siswa?.nama || ''}</title>
      <script src="https://cdn.tailwindcss.com"><\/script>
      <style>
        @page { size: A4 portrait; margin: 12mm; }
        * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
        body { font-family: Arial, sans-serif; }
      </style>
      </head><body>
        <div style="max-width:210mm;margin:0 auto;">${el.innerHTML}</div>
        <script>window.onload=function(){setTimeout(function(){window.print();},600);};<\/script>
      </body></html>
    `);
    win.document.close();
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Laporan Hasil Belajar</h1>
          <p className="text-gray-600 text-sm mt-1">Cetak laporan penilaian siswa (A4) atau simpan sebagai PDF</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.role === 'guru' && (
            <select value={selectedSiswa} onChange={(e) => setSelectedSiswa(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
              {data.siswa.map(s => <option key={s.id} value={s.id}>{s.nama} - {data.kelas.find(k => k.id === s.kelasId)?.nama}</option>)}
            </select>
          )}
          <select value={activeTA} onChange={(e) => setActiveTA(Number(e.target.value))} className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm bg-white">
            {data.tahunAjaran.map(t => <option key={t.id} value={t.id}>{t.tahun} - {t.semester}</option>)}
          </select>
          {user.role === 'guru' ? (
            <button onClick={() => window.print()} className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
              <Printer className="w-4 h-4" /> Cetak / Simpan PDF
            </button>
          ) : (
            <button onClick={handleDownloadLaporanPDF} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-lg font-medium shadow-sm">
              <Download className="w-4 h-4" /> Download PDF
            </button>
          )}
        </div>
      </div>

      {/* Info bantuan */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-xs text-amber-800 flex items-start gap-2 print:hidden">
        <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
        <span>
          {user.role === 'guru' ? (
            <>Tips: Klik <b>Cetak / Simpan PDF</b>. Pada dialog cetak browser, pilih ukuran kertas <b>A4</b>, lalu pilih tujuan <b>"Save as PDF"</b>. Aktifkan <b>Background graphics</b> agar garis tabel tercetak rapi.</>
          ) : (
            <>Klik <b>Download PDF</b> untuk menyimpan laporan. Pada dialog yang muncul, pilih tujuan <b>"Save as PDF"</b> dan ukuran kertas <b>A4</b>.</>
          )}
        </span>
      </div>

      {siswa && nilai && (
        <div className="flex justify-center">
          <div className="laporan-page bg-white rounded-xl shadow-md border border-gray-200 print:shadow-none print:border-0 print:rounded-none" id="laporan-print">
            <div className="laporan-inner p-6 md:p-10 print:p-0">
              {/* Kop Surat */}
              <div className="text-center border-b-4 border-double border-gray-800 pb-3 mb-4">
                <div className="flex items-center justify-between gap-3">
                  <img
                    src="/logos/ummi-logo.svg"
                    alt="Logo UMMI"
                    className="kop-logo w-16 h-16 object-contain flex-shrink-0"
                  />
                  <div className="flex-1">
                    <p className="text-[11px] text-gray-700 font-medium">YAYASAN LEMBAGA PENDIDIKAN ISLAM KEBONSARI</p>
                    <h2 className="text-xl font-serif font-bold text-emerald-900 tracking-wide">MADRASAH IBTIDAIYAH ISLAMIYAH</h2>
                    <p className="text-[10px] text-gray-600">NSM : 111235730037 &nbsp;•&nbsp; NPSN : 60720789</p>
                    <p className="text-[10px] text-gray-600">Jl. S. Supriyadi 172 - Telp. (0341) 877190 Kebonsari - Sukun Malang 65149</p>
                  </div>
                  <img
                    src="/logos/mi-islamiyah-logo.svg"
                    alt="Logo MI Islamiyah"
                    className="kop-logo w-16 h-16 object-contain flex-shrink-0"
                  />
                </div>
              </div>

              {/* Judul */}
              <div className="text-center mb-4">
                <h1 className="text-base font-bold text-gray-900 uppercase leading-tight">Laporan Penilaian Akhir Tahun Hasil Belajar Mengaji</h1>
                <h2 className="text-lg font-bold text-emerald-700">METODE UMMI</h2>
                <p className="text-sm text-gray-700 font-medium">TAHUN PELAJARAN {ta?.tahun}</p>
              </div>

              {/* Identitas Siswa */}
              <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 mb-4 text-sm">
                <div className="flex">
                  <span className="w-28 text-gray-700">Nama Siswa</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{siswa.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-700">Jilid / Al Qur'an</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{nilai.jilid}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-700">Kelas</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{kelas?.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-700">Tahun Pelajaran</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{ta?.tahun}</span>
                </div>
                <div className="flex">
                  <span className="w-28 text-gray-700"></span>
                </div>
                <div className="flex">
                  <span className="w-32 text-gray-700">Semester</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold">{ta?.semester === 'Genap' ? 'II / (GENAP)' : 'I / (GANJIL)'}</span>
                </div>
              </div>

              {/* Tabel Materi UMMI */}
              <table className="w-full text-sm border-collapse border border-gray-700 mb-4">
                <thead>
                  <tr>
                    <th rowSpan={2} className="border border-gray-700 px-2 py-1 text-center w-10 bg-gray-100">No.</th>
                    <th rowSpan={2} className="border border-gray-700 px-3 py-1 text-center bg-gray-100">MATERI UMMI</th>
                    <th colSpan={3} className="border border-gray-700 px-2 py-1 text-center bg-gray-100">NILAI KETUNTASAN</th>
                  </tr>
                  <tr>
                    <th className="border border-gray-700 px-2 py-1 text-center w-16 bg-gray-100">Nilai</th>
                    <th className="border border-gray-700 px-2 py-1 text-center w-16 bg-gray-100">Huruf</th>
                    <th className="border border-gray-700 px-2 py-1 text-center w-40 bg-gray-100">Keterangan</th>
                  </tr>
                </thead>
                <tbody>
                  {/* 1. Teori Membaca */}
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">1.</td>
                    <td className="border border-gray-700 px-3 py-1 font-semibold" colSpan={4}>Teori Membaca</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">a.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Hafalan</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{hafalan.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{hafalan.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{hafalan.huruf}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">b.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Kelancaran</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{kelancaran.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{kelancaran.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{kelancaran.huruf}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">c.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Fashoha</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{fashoha.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{fashoha.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{fashoha.huruf}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">d.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Tartil</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{tartil.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{tartil.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{tartil.huruf}</td>
                  </tr>
                  {/* 2. Tahfidz */}
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">2.</td>
                    <td className="border border-gray-700 px-3 py-1 font-semibold" colSpan={4}>Tahfidz</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">a.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Juz 30</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz30.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{juz30.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz30.huruf}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">b.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Juz 28, 29</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz2829.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{juz2829.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz2829.huruf}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">c.</td>
                    <td className="border border-gray-700 px-3 py-1 pl-6">Juz 1</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz1.nilai}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-semibold">{juz1.ket}</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{juz1.huruf}</td>
                  </tr>
                  {/* Jumlah */}
                  <tr className="bg-yellow-100 font-bold">
                    <td className="border border-gray-700 px-2 py-1 text-center" colSpan={2}>Jumlah</td>
                    <td className="border border-gray-700 px-2 py-1 text-center">{jumlahNilai}</td>
                    <td className="border border-gray-700 px-2 py-1" colSpan={2}></td>
                  </tr>
                </tbody>
              </table>

              {/* Ketidakhadiran & Perilaku */}
              <table className="w-full text-sm border-collapse border border-gray-700 mb-6">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-700 px-2 py-1 text-center w-8">No.</th>
                    <th className="border border-gray-700 px-2 py-1 text-left">Ketidakhadiran</th>
                    <th className="border border-gray-700 px-2 py-1 text-center w-16">Hari</th>
                    <th className="border border-gray-700 px-2 py-1 text-left">Perilaku</th>
                    <th className="border border-gray-700 px-2 py-1 text-center w-16">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">1.</td>
                    <td className="border border-gray-700 px-2 py-1">Sakit</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{totalSakit}</td>
                    <td className="border border-gray-700 px-2 py-1">Kedisiplinan</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{nilai.perilaku.disiplin}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">2.</td>
                    <td className="border border-gray-700 px-2 py-1">Izin</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{totalIzin}</td>
                    <td className="border border-gray-700 px-2 py-1">Kerapian</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{nilai.perilaku.kerapian}</td>
                  </tr>
                  <tr>
                    <td className="border border-gray-700 px-2 py-1 text-center">3.</td>
                    <td className="border border-gray-700 px-2 py-1">Tanpa Keterangan</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{totalAlpha}</td>
                    <td className="border border-gray-700 px-2 py-1">Kesopanan</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{nilai.perilaku.kesopanan}</td>
                  </tr>
                  <tr className="font-bold">
                    <td className="border border-gray-700 px-2 py-1 text-center" colSpan={2}>Jumlah</td>
                    <td className="border border-gray-700 px-2 py-1 text-center">{jumlahTidakHadir}</td>
                    <td className="border border-gray-700 px-2 py-1">Kebersihan</td>
                    <td className="border border-gray-700 px-2 py-1 text-center font-bold">{nilai.perilaku.kebersihan}</td>
                  </tr>
                </tbody>
              </table>

              {/* Tanda Tangan */}
              <div className="grid grid-cols-2 gap-4 text-sm mt-6">
                <div></div>
                <div className="text-center">
                  <p>Malang, 02 Juni 2025</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <p>Orang tua / Wali</p>
                  <div className="h-16"></div>
                  <p>(...................................)</p>
                </div>
                <div className="text-center">
                  <p>Ustad / Ustadzah</p>
                  <div className="h-16"></div>
                  <p className="font-bold underline">{guruKelas?.nama || kelas?.waliKelas || '...................................'}</p>
                </div>
              </div>

              <div className="flex flex-col items-center text-sm mt-6">
                <p>Mengetahui,</p>
                <p>Kepala MI Islamiyah</p>
                <div className="h-16"></div>
                <p className="font-bold underline">Nur Kholifah, S.Pd.I</p>
                <p className="text-xs">NIY. 05022003</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {!siswa && <div className="bg-white rounded-xl p-10 text-center text-gray-500">Pilih siswa untuk melihat laporan</div>}
    </div>
  );
}

// ==================== PENILAIAN HARIAN (KARTU PRESTASI SISWA) ====================
function PenilaianHarianPage({ data, user, onUpdate }: {
  data: AppData;
  user: User;
  onUpdate: (d: AppData) => void;
}) {
  const isGuru = user.role === 'guru';
  const isSiswa = user.role === 'siswa';

  // Pilih siswa
  const [selectedSiswa, setSelectedSiswa] = useState<number>(
    isSiswa ? (user.refId || 0) : (data.siswa[0]?.id || 0)
  );
  const [filterKelas, setFilterKelas] = useState<string>('all');
  const [activeTA, setActiveTA] = useState<number>(data.tahunAjaran.find(ta => ta.aktif)?.id || 1);

  const siswa = data.siswa.find(s => s.id === selectedSiswa);
  const kelas = data.kelas.find(k => k.id === siswa?.kelasId);
  const ta = data.tahunAjaran.find(t => t.id === activeTA);
  const guruPengampu = siswa
    ? data.guru.find(g => g.jilidAjar?.includes(siswa.jilid))
    : undefined;

  const phList = (data.penilaianHarian || []).filter(p => p.siswaId === selectedSiswa && p.tahunAjaranId === activeTA)
    .sort((a, b) => a.tatapMuka - b.tatapMuka);

  // siswa pilihan utk dropdown
  const siswaPilihan = data.siswa.filter(s => filterKelas === 'all' || s.kelasId === Number(filterKelas));

  const handleUpdate = (id: number, patch: Partial<PenilaianHarian>) => {
    const list = data.penilaianHarian || [];
    onUpdate({ ...data, penilaianHarian: list.map(p => p.id === id ? { ...p, ...patch } : p) });
  };

  const handleAdd = () => {
    if (!siswa) return;
    const list = data.penilaianHarian || [];
    const nextTM = phList.length > 0 ? Math.max(...phList.map(p => p.tatapMuka)) + 1 : 1;
    const newId = list.length > 0 ? Math.max(...list.map(p => p.id)) + 1 : 1;
    const baru: PenilaianHarian = {
      id: newId,
      siswaId: selectedSiswa,
      guruId: isGuru ? (user.refId || undefined) : undefined,
      tahunAjaranId: activeTA,
      tatapMuka: nextTM,
      tanggal: new Date().toISOString().split('T')[0],
      hafalanSurat: '',
      hafalanAyat: '',
      ummiJilidSurat: siswa.jilid,
      ummiHalAyat: '',
      materi: '',
      nilai: '',
      disimakGuru: '',
      disimakOrtu: '',
      keterangan: '',
    };
    onUpdate({ ...data, penilaianHarian: [...list, baru] });
  };

  const handleDelete = (id: number) => {
    if (!confirm('Hapus baris ini?')) return;
    const list = data.penilaianHarian || [];
    onUpdate({ ...data, penilaianHarian: list.filter(p => p.id !== id) });
  };

  const nilaiOptions = ['', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'D'];

  // Hitung baris kosong supaya tampilannya seperti kartu (minimal 20 baris terlihat)
  const minRows = 20;
  const emptyRows = Math.max(0, minRows - phList.length);

  // ===== Export Kartu Prestasi =====
  const phHeader = [['Tatap Muka', 'Tanggal', 'Hafalan Surat', 'Hafalan Ayat', 'Jilid/Surat', 'Hal/Ayat', 'Materi', 'Nilai', 'Disimak Guru', 'Disimak Ortu', 'Keterangan']];
  const phRows = () => phList.map(p => [
    p.tatapMuka,
    p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID') : '',
    p.hafalanSurat, p.hafalanAyat, p.ummiJilidSurat, p.ummiHalAyat,
    p.materi, p.nilai, p.disimakGuru, p.disimakOrtu, p.keterangan,
  ]);
  const phFilenameBase = siswa ? `KartuPrestasi_${siswa.nama}`.replace(/[/\s]/g, '_') : 'KartuPrestasi';
  const phSubtitle = siswa
    ? [`MI Islamiyah Malang - Metode UMMI`, `Nama: ${siswa.nama} • Kelas: ${kelas?.nama} • Jilid: ${siswa.jilid}`, `Th. Ajaran: ${ta?.tahun} - ${ta?.semester}`]
    : [];

  const handlePHExcel = () => {
    if (!siswa) return;
    exportToExcel({ filename: phFilenameBase, title: 'KARTU PRESTASI SISWA', subtitle: phSubtitle, headerRows: phHeader, rows: phRows() });
  };
  const handlePHCSV = () => {
    if (!siswa) return;
    exportToCSV({ filename: phFilenameBase, headerRows: phHeader, rows: phRows() });
  };
  const handlePHPDF = () => {
    if (!siswa) return;
    exportToPDF({ title: 'KARTU PRESTASI SISWA', subtitle: phSubtitle, htmlContent: buildHTMLTable(phHeader, phRows(), []), landscape: true });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 print:hidden">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Penilaian Harian</h1>
          <p className="text-gray-600 text-sm mt-1">Kartu Prestasi Siswa - Guru Pengampu UMMI</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isGuru && (
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-sm"
            >
              <Plus className="w-4 h-4" /> Tambah Tatap Muka
            </button>
          )}
          <button onClick={handlePHExcel} className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> Excel
          </button>
          <button onClick={handlePHCSV} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> CSV
          </button>
          <button onClick={handlePHPDF} className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-3 py-2 rounded-lg text-sm font-medium shadow-sm">
            <Download className="w-4 h-4" /> PDF
          </button>
        </div>
      </div>

      {/* Filter */}
      {isGuru && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 print:hidden">
          <div className="grid sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Filter Kelas</label>
              <select value={filterKelas} onChange={(e) => setFilterKelas(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                <option value="all">Semua Kelas</option>
                {data.kelas.map(k => <option key={k.id} value={k.id}>Kelas {k.nama}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Pilih Siswa</label>
              <select value={selectedSiswa} onChange={(e) => setSelectedSiswa(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {siswaPilihan.map(s => (
                  <option key={s.id} value={s.id}>{s.nama} - {data.kelas.find(k => k.id === s.kelasId)?.nama}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Tahun Ajaran</label>
              <select value={activeTA} onChange={(e) => setActiveTA(Number(e.target.value))} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white">
                {data.tahunAjaran.map(t => <option key={t.id} value={t.id}>{t.tahun} - {t.semester}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Kartu */}
      {siswa ? (
        <div className="flex justify-center">
          <div className="bg-white rounded-xl shadow-md border border-gray-200 w-full max-w-5xl print:shadow-none print:border-0 print:rounded-none" id="laporan-print">
            <div className="p-4 md:p-6 print:p-0">
              {/* Header kartu */}
              <div className="flex items-center gap-3 bg-emerald-700 text-white px-3 py-2 rounded-md mb-4">
                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden">
                  <img src="/logos/ummi-logo.svg" alt="UMMI" className="w-8 h-8 object-contain" />
                </div>
                <h2 className="font-bold tracking-wide text-lg flex-1">KARTU PRESTASI SISWA</h2>
              </div>

              {/* Identitas */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-1 text-sm mb-3">
                <div className="flex">
                  <span className="w-24 text-gray-700">Nama</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">{siswa.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-700">Jilid / Tkt.</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">{siswa.jilid}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-700">No. Induk</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">{siswa.nis}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-700">Ustadz/ah</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">{guruPengampu?.nama || kelas?.waliKelas || '-'}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-700">Kelas</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">{kelas?.nama}</span>
                </div>
                <div className="flex">
                  <span className="w-24 text-gray-700">Tempat</span>
                  <span className="mr-1">:</span>
                  <span className="font-semibold flex-1 border-b border-dotted border-gray-400">MI Islamiyah Malang</span>
                </div>
                {ta && (
                  <div className="flex md:col-span-2">
                    <span className="w-24 text-gray-700">Th. Ajaran</span>
                    <span className="mr-1">:</span>
                    <span className="font-semibold border-b border-dotted border-gray-400">{ta.tahun} - Semester {ta.semester}</span>
                  </div>
                )}
              </div>

              {/* Tabel Kartu Prestasi */}
              <div className="overflow-x-auto">
                <table className="w-full text-[11px] border-collapse border-2 border-emerald-700">
                  <thead>
                    <tr className="bg-emerald-50">
                      <th rowSpan={2} className="border border-emerald-700 px-1 py-1 align-middle w-12 text-emerald-900">Tatap Muka</th>
                      <th rowSpan={2} className="border border-emerald-700 px-1 py-1 align-middle w-20 text-emerald-900">Tanggal</th>
                      <th colSpan={2} className="border border-emerald-700 px-1 py-1 text-emerald-900">Hafalan</th>
                      <th colSpan={2} className="border border-emerald-700 px-1 py-1 text-emerald-900">Ummi/AlQur'an</th>
                      <th rowSpan={2} className="border border-emerald-700 px-1 py-1 align-middle text-emerald-900">Materi</th>
                      <th rowSpan={2} className="border border-emerald-700 px-1 py-1 align-middle w-14 text-emerald-900">Nilai</th>
                      <th colSpan={2} className="border border-emerald-700 px-1 py-1 text-emerald-900">Disimak</th>
                      <th rowSpan={2} className="border border-emerald-700 px-1 py-1 align-middle text-emerald-900">Keterangan</th>
                      {isGuru && <th rowSpan={2} className="border border-emerald-700 px-1 py-1 w-10 print:hidden text-emerald-900"></th>}
                    </tr>
                    <tr className="bg-emerald-50">
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Surat</th>
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Ayat</th>
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Jilid/Surat</th>
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Hal/Ayat</th>
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Guru</th>
                      <th className="border border-emerald-700 px-1 py-1 text-emerald-900">Ortu</th>
                    </tr>
                  </thead>
                  <tbody>
                    {phList.map((p) => (
                      <tr key={p.id} className="hover:bg-emerald-50/30">
                        <td className="border border-emerald-700 px-1 py-0.5 text-center font-semibold">{p.tatapMuka}</td>
                        <td className="border border-emerald-700 px-1 py-0.5 text-center whitespace-nowrap">
                          {isGuru ? (
                            <input type="date" value={p.tanggal} onChange={(e) => handleUpdate(p.id, { tanggal: e.target.value })} className="w-full text-[11px] bg-transparent text-center outline-none border-0 print:hidden" />
                          ) : null}
                          <span className={isGuru ? 'hidden print:inline' : ''}>
                            {p.tanggal ? new Date(p.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}
                          </span>
                        </td>
                        <CellEditable value={p.hafalanSurat} editable={isGuru} onChange={(v) => handleUpdate(p.id, { hafalanSurat: v })} />
                        <CellEditable value={p.hafalanAyat} editable={isGuru} onChange={(v) => handleUpdate(p.id, { hafalanAyat: v })} align="center" />
                        <CellEditable value={p.ummiJilidSurat} editable={isGuru} onChange={(v) => handleUpdate(p.id, { ummiJilidSurat: v })} />
                        <CellEditable value={p.ummiHalAyat} editable={isGuru} onChange={(v) => handleUpdate(p.id, { ummiHalAyat: v })} align="center" />
                        <CellEditable value={p.materi} editable={isGuru} onChange={(v) => handleUpdate(p.id, { materi: v })} />
                        <td className="border border-emerald-700 px-1 py-0.5 text-center">
                          {isGuru ? (
                            <select value={p.nilai} onChange={(e) => handleUpdate(p.id, { nilai: e.target.value })} className="w-full bg-amber-50 text-amber-900 font-bold text-[11px] text-center outline-none border-0 print:hidden">
                              {nilaiOptions.map(o => <option key={o} value={o}>{o || '-'}</option>)}
                            </select>
                          ) : null}
                          <span className={`${isGuru ? 'hidden print:inline' : ''} font-bold text-amber-700`}>{p.nilai}</span>
                        </td>
                        <CellEditable value={p.disimakGuru} editable={isGuru} onChange={(v) => handleUpdate(p.id, { disimakGuru: v })} align="center" />
                        <CellEditable value={p.disimakOrtu} editable={isGuru} onChange={(v) => handleUpdate(p.id, { disimakOrtu: v })} align="center" />
                        <CellEditable value={p.keterangan} editable={isGuru} onChange={(v) => handleUpdate(p.id, { keterangan: v })} />
                        {isGuru && (
                          <td className="border border-emerald-700 px-1 py-0.5 text-center print:hidden">
                            <button onClick={() => handleDelete(p.id)} className="text-red-600 hover:bg-red-50 p-0.5 rounded">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                    {/* Baris kosong untuk meniru tampilan kartu fisik */}
                    {Array.from({ length: emptyRows }).map((_, i) => (
                      <tr key={`empty-${i}`}>
                        <td className="border border-emerald-700 h-6"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        <td className="border border-emerald-700"></td>
                        {isGuru && <td className="border border-emerald-700 print:hidden"></td>}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-3 text-[10px] text-gray-500 print:hidden">
                Catatan: Klik sel pada kolom yang dapat diedit untuk mengisi. Tekan tombol <b>+ Tambah Tatap Muka</b> untuk menambah baris baru.
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">Pilih siswa untuk melihat kartu prestasi</div>
      )}
    </div>
  );
}

// Sel editable di tabel kartu prestasi
function CellEditable({ value, editable, onChange, align = 'left' }: {
  value: string;
  editable: boolean;
  onChange: (v: string) => void;
  align?: 'left' | 'center' | 'right';
}) {
  const alignClass = align === 'center' ? 'text-center' : align === 'right' ? 'text-right' : 'text-left';
  if (!editable) {
    return <td className={`border border-emerald-700 px-1 py-0.5 ${alignClass}`}>{value}</td>;
  }
  return (
    <td className={`border border-emerald-700 px-0.5 py-0 ${alignClass}`}>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-transparent text-[11px] px-1 py-0.5 outline-none border-0 focus:bg-emerald-50 ${alignClass}`}
      />
    </td>
  );
}

// ==================== PENGAMPU UMMI (GURU PER JILID + SISWA) ====================
function PengampuUMMI({ data }: { data: AppData }) {
  const [search, setSearch] = useState('');
  const [filterJilid, setFilterJilid] = useState<string>('all');

  // Build: untuk tiap jilid -> guru pengampu + siswa (dari data siswa)
  const groups = useMemo(() => {
    return JILID_OPTIONS.map(jilid => {
      const pengampu = data.guru.filter(g => (g.jilidAjar || []).includes(jilid));
      const siswa = data.siswa.filter(s => s.jilid === jilid);
      return { jilid, pengampu, siswa };
    });
  }, [data.guru, data.siswa]);

  const visibleGroups = groups.filter(g => {
    const matchJilid = filterJilid === 'all' || g.jilid === filterJilid;
    if (!matchJilid) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const inSiswa = g.siswa.some(s => s.nama.toLowerCase().includes(q));
    const inGuru = g.pengampu.some(gr => gr.nama.toLowerCase().includes(q));
    return inSiswa || inGuru || g.jilid.toLowerCase().includes(q);
  });

  const jilidColors: Record<string, string> = {
    'Jilid 1': 'from-emerald-500 to-emerald-600',
    'Jilid 2': 'from-teal-500 to-teal-600',
    'Jilid 3': 'from-cyan-500 to-cyan-600',
    'Jilid 4': 'from-sky-500 to-sky-600',
    'Jilid 5': 'from-blue-500 to-blue-600',
    'Jilid 6': 'from-indigo-500 to-indigo-600',
    "Al Qur'an": 'from-amber-500 to-amber-600',
    'Tajwid': 'from-orange-500 to-orange-600',
    'GHORIB': 'from-rose-500 to-rose-600',
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Pengampu UMMI</h1>
        <p className="text-gray-600 text-sm mt-1">
          Data guru pengampu per Jilid (Jilid 1 s/d 6, Al Qur'an, Tajwid, GHORIB) beserta siswanya yang diambil dari data siswa
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama guru atau siswa..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterJilid}
              onChange={(e) => setFilterJilid(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none text-sm appearance-none bg-white"
            >
              <option value="all">Semua Jilid</option>
              {JILID_OPTIONS.map(j => <option key={j} value={j}>{j}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleGroups.map(group => (
          <div key={group.jilid} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className={`bg-gradient-to-r ${jilidColors[group.jilid] || 'from-gray-500 to-gray-600'} px-5 py-3 flex items-center justify-between`}>
              <div className="flex items-center gap-2 text-white">
                <BookOpen className="w-5 h-5" />
                <h3 className="font-bold text-lg">{group.jilid}</h3>
              </div>
              <span className="bg-white/20 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
                {group.siswa.length} Siswa
              </span>
            </div>

            <div className="p-4">
              {/* Guru Pengampu */}
              <div className="mb-3">
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Guru Pengampu</p>
                {group.pengampu.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {group.pengampu.map(g => (
                      <div key={g.id} className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-1.5">
                        <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
                          {g.nama.charAt(0)}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-emerald-900 leading-tight">{g.nama}</p>
                          <p className="text-[10px] text-emerald-600">{g.jabatan}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs">
                    <AlertCircle className="w-4 h-4" /> Belum ada guru pengampu. Tetapkan di menu Data Guru.
                  </div>
                )}
              </div>

              {/* Siswa */}
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Daftar Siswa</p>
                {group.siswa.length > 0 ? (
                  <div className="border border-gray-100 rounded-lg overflow-hidden max-h-64 overflow-y-auto">
                    <table className="w-full text-xs">
                      <thead className="sticky top-0">
                        <tr className="bg-gray-50 text-gray-600">
                          <th className="px-2 py-1.5 text-left font-semibold w-8">No</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Nama</th>
                          <th className="px-2 py-1.5 text-left font-semibold">Kelas</th>
                          <th className="px-2 py-1.5 text-center font-semibold">JK</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {group.siswa.map((s, idx) => (
                          <tr key={s.id} className="hover:bg-gray-50">
                            <td className="px-2 py-1.5 text-gray-500">{idx + 1}</td>
                            <td className="px-2 py-1.5 text-gray-900 font-medium whitespace-nowrap">{s.nama}</td>
                            <td className="px-2 py-1.5">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                                {data.kelas.find(k => k.id === s.kelasId)?.nama || '-'}
                              </span>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${s.jenisKelamin === 'L' ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'}`}>
                                {s.jenisKelamin}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 py-3 text-center bg-gray-50 rounded-lg">Belum ada siswa pada jilid ini</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {visibleGroups.length === 0 && (
        <div className="bg-white rounded-xl p-10 text-center text-gray-500">Tidak ada data yang cocok</div>
      )}
    </div>
  );
}

// ==================== ADMIN: MANAJEMEN USER ====================
function AdminUsers({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [filterRole, setFilterRole] = useState<'all' | 'admin' | 'guru' | 'siswa'>('all');
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<Record<string, boolean>>({});

  const filteredUsers = data.users.filter(u => {
    const matchRole = filterRole === 'all' || u.role === filterRole;
    const matchSearch = !search.trim() ||
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.name.toLowerCase().includes(search.toLowerCase());
    return matchRole && matchSearch;
  });

  const handleSave = (u: User, oldUsername?: string) => {
    if (oldUsername) {
      // edit
      onUpdate({ ...data, users: data.users.map(x => x.username === oldUsername ? u : x) });
    } else {
      // add - cek duplicate username
      if (data.users.find(x => x.username === u.username)) {
        alert('Username sudah digunakan!');
        return;
      }
      onUpdate({ ...data, users: [...data.users, u] });
    }
    setShowForm(false);
    setEditing(null);
  };

  const handleDelete = (username: string) => {
    if (username === 'admin') {
      alert('User admin utama tidak dapat dihapus!');
      return;
    }
    if (!confirm(`Hapus user "${username}"?`)) return;
    onUpdate({ ...data, users: data.users.filter(u => u.username !== username) });
  };

  const handleResetPassword = (username: string) => {
    const newPw = prompt('Masukkan password baru:', 'password123');
    if (!newPw) return;
    onUpdate({ ...data, users: data.users.map(u => u.username === username ? { ...u, password: newPw } : u) });
    alert(`Password user "${username}" berhasil direset.`);
  };

  const togglePw = (uname: string) => setShowPasswords({ ...showPasswords, [uname]: !showPasswords[uname] });

  const stats = {
    total: data.users.length,
    admin: data.users.filter(u => u.role === 'admin').length,
    guru: data.users.filter(u => u.role === 'guru').length,
    siswa: data.users.filter(u => u.role === 'siswa').length,
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Manajemen User</h1>
          <p className="text-gray-600 text-sm mt-1">Kelola akun login Guru, Siswa, dan Admin</p>
        </div>
        <button
          onClick={() => { setEditing(null); setShowForm(true); }}
          className="inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-4 py-2.5 rounded-lg font-medium shadow-sm"
        >
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-rose-500 to-rose-700 text-white rounded-xl p-4">
          <Users className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-xs opacity-90">Total User</p>
          <p className="text-2xl font-bold">{stats.total}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white rounded-xl p-4">
          <Settings className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-xs opacity-90">Admin</p>
          <p className="text-2xl font-bold">{stats.admin}</p>
        </div>
        <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 text-white rounded-xl p-4">
          <UserCog className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-xs opacity-90">Guru</p>
          <p className="text-2xl font-bold">{stats.guru}</p>
        </div>
        <div className="bg-gradient-to-br from-amber-500 to-amber-600 text-white rounded-xl p-4">
          <GraduationCap className="w-6 h-6 mb-2 opacity-80" />
          <p className="text-xs opacity-90">Siswa</p>
          <p className="text-2xl font-bold">{stats.siswa}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari username atau nama..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={filterRole}
              onChange={(e) => setFilterRole(e.target.value as any)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg text-sm appearance-none bg-white"
            >
              <option value="all">Semua Role</option>
              <option value="admin">Administrator</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-rose-50 text-rose-900">
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">No</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Username</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Password</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Nama Lengkap</th>
                <th className="px-3 py-2.5 text-left font-semibold whitespace-nowrap">Role</th>
                <th className="px-3 py-2.5 text-center font-semibold whitespace-nowrap">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((u, idx) => (
                <tr key={u.username} className="hover:bg-gray-50">
                  <td className="px-3 py-2.5 text-gray-600">{idx + 1}</td>
                  <td className="px-3 py-2.5 font-mono text-xs font-semibold text-gray-900">{u.username}</td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">
                        {showPasswords[u.username] ? u.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePw(u.username)}
                        className="text-gray-400 hover:text-gray-700"
                        title={showPasswords[u.username] ? 'Sembunyikan' : 'Tampilkan'}
                      >
                        {showPasswords[u.username] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-gray-900 whitespace-nowrap">{u.name}</td>
                  <td className="px-3 py-2.5">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      u.role === 'admin' ? 'bg-rose-100 text-rose-700' :
                      u.role === 'guru' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {u.role === 'admin' ? 'Administrator' : u.role === 'guru' ? 'Guru' : 'Siswa'}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="flex items-center justify-center gap-1">
                      <button
                        onClick={() => handleResetPassword(u.username)}
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded"
                        title="Reset Password"
                      >
                        <KeyRound className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => { setEditing(u); setShowForm(true); }}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                        title="Edit"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(u.username)}
                        className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr><td colSpan={6} className="px-3 py-8 text-center text-gray-500">Tidak ada user</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <UserForm
          user={editing}
          guruList={data.guru}
          siswaList={data.siswa}
          existingUsers={data.users}
          onSave={handleSave}
          onClose={() => { setShowForm(false); setEditing(null); }}
        />
      )}
    </div>
  );
}

function UserForm({ user, guruList, siswaList, existingUsers, onSave, onClose }: {
  user: User | null;
  guruList: Guru[];
  siswaList: Siswa[];
  existingUsers: User[];
  onSave: (u: User, oldUsername?: string) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState<User>(user || {
    username: '', password: '', role: 'guru', name: '', refId: undefined
  });
  const [showPw, setShowPw] = useState(false);

  const refOptions = form.role === 'guru' ? guruList : form.role === 'siswa' ? siswaList : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user && existingUsers.find(x => x.username === form.username)) {
      alert('Username sudah digunakan!');
      return;
    }
    onSave(form, user?.username);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md my-8">
        <div className="p-5 border-b flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">{user ? 'Edit User' : 'Tambah User'}</h3>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X className="w-5 h-5" /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as UserRole, refId: undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              disabled={!!user}
            >
              <option value="admin">Administrator</option>
              <option value="guru">Guru</option>
              <option value="siswa">Siswa</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
            <input
              required
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
              disabled={!!user}
              placeholder="contoh: ahmad01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                required
                type={showPw ? 'text' : 'password'}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg text-sm font-mono"
                placeholder="Min. 6 karakter"
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPw(!showPw)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-500"
              >
                {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
            <input
              required
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
          </div>
          {form.role !== 'admin' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tautkan ke Data {form.role === 'guru' ? 'Guru' : 'Siswa'} (opsional)
              </label>
              <select
                value={form.refId || ''}
                onChange={(e) => setForm({ ...form, refId: e.target.value ? Number(e.target.value) : undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white"
              >
                <option value="">- Tidak ditautkan -</option>
                {refOptions.map((r: any) => (
                  <option key={r.id} value={r.id}>{r.nama}</option>
                ))}
              </select>
            </div>
          )}
          <div className="flex gap-2 pt-2">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium">Batal</button>
            <button type="submit" className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ==================== ADMIN: IMPORT MASSAL ====================
type ImportType = 'guru' | 'siswa';

interface ImportRow {
  no: number;
  data: Record<string, string>;
  valid: boolean;
  errors: string[];
}

function AdminImport({ data, onUpdate }: { data: AppData; onUpdate: (d: AppData) => void }) {
  const [tipe, setTipe] = useState<ImportType>('siswa');
  const [csvText, setCsvText] = useState('');
  const [rows, setRows] = useState<ImportRow[]>([]);
  const [imported, setImported] = useState<number | null>(null);

  // Template CSV
  const templateGuru = `username,password,nip,nama,jabatan,jenis_kelamin,no_telp,alamat,jilid_ajar
ustadz1,ustadz123,198801012015011001,Ustadz Fulan S.Pd,Guru Pengampu Jilid 1,L,081234567001,Jl. Sulfat No. 1,Jilid 1;Jilid 2
ustadzah1,ustadzah123,199002022016012002,Ustadzah Fulanah S.Pd.I,Guru Pengampu Al Quran,P,081234567002,Jl. Veteran No. 2,Al Qur'an;Tajwid
ustadz2,ustadz456,199103032017011003,Ustadz Ahmad S.Pd,Guru Pengampu GHORIB,L,081234567003,Jl. Kalpataru No. 3,GHORIB`;

  const templateSiswa = `username,password,nis,nama,kelas,jilid,jenis_kelamin,tanggal_lahir,nama_wali,no_telp_wali,alamat
siswa01,siswa123,20240001,Ahmad Budi Santoso,1A,Jilid 1,L,2018-01-15,Bapak Budi,08111111111,Jl. Merdeka No. 1
siswa02,siswa123,20240002,Aisyah Putri Sari,1A,Jilid 2,P,2018-02-20,Bapak Sari,08111111112,Jl. Merdeka No. 2
siswa03,siswa123,20240003,Muhammad Rizki,1B,Jilid 1,L,2018-03-10,Bapak Rizki,08111111113,Jl. Merdeka No. 3`;

  const currentTemplate = tipe === 'guru' ? templateGuru : templateSiswa;

  const downloadTemplate = (format: 'csv' | 'xls') => {
    const blob = format === 'csv'
      ? new Blob([currentTemplate], { type: 'text/csv;charset=utf-8;' })
      : new Blob([`\uFEFF${currentTemplate.replace(/,/g, '\t')}`], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_import_${tipe}.${format === 'csv' ? 'csv' : 'xls'}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      setCsvText(text);
      parseCSV(text);
    };
    reader.readAsText(file);
  };

  const parseCSV = (text: string) => {
    const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
    if (lines.length < 2) {
      setRows([]);
      return;
    }
    // Auto-detect separator: tab or comma
    const sep = lines[0].includes('\t') ? '\t' : ',';
    const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());
    const parsed: ImportRow[] = lines.slice(1).map((line, idx) => {
      const cols = line.split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
      const row: Record<string, string> = {};
      headers.forEach((h, i) => { row[h] = cols[i] || ''; });
      const errors: string[] = [];

      if (!row.username) errors.push('username kosong');
      if (!row.password) errors.push('password kosong');
      if (!row.nama) errors.push('nama kosong');
      if (data.users.find(u => u.username === row.username)) errors.push('username sudah ada');

      if (tipe === 'siswa') {
        if (!row.nis) errors.push('nis kosong');
        if (!row.kelas) errors.push('kelas kosong');
        if (row.kelas && !data.kelas.find(k => k.nama.toLowerCase() === row.kelas.toLowerCase())) {
          errors.push(`kelas "${row.kelas}" tidak ditemukan`);
        }
      } else {
        if (!row.nip) errors.push('nip kosong');
      }

      return {
        no: idx + 1,
        data: row,
        valid: errors.length === 0,
        errors,
      };
    });
    setRows(parsed);
  };

  const handleParseManual = () => parseCSV(csvText);

  const handleImport = () => {
    const validRows = rows.filter(r => r.valid);
    if (validRows.length === 0) {
      alert('Tidak ada data valid untuk diimport!');
      return;
    }
    if (!confirm(`Import ${validRows.length} ${tipe}? Data dengan error akan dilewati.`)) return;

    let newGuru = [...data.guru];
    let newSiswa = [...data.siswa];
    const newUsers = [...data.users];

    validRows.forEach(r => {
      const d = r.data;
      if (tipe === 'guru') {
        const guruId = newGuru.length > 0 ? Math.max(...newGuru.map(g => g.id)) + 1 : 1;
        const jilidAjar = d.jilid_ajar
          ? d.jilid_ajar.split(';').map(j => j.trim()).filter(Boolean) as JilidType[]
          : [];
        newGuru.push({
          id: guruId,
          nip: d.nip,
          nama: d.nama,
          jabatan: d.jabatan || '-',
          jenisKelamin: (d.jenis_kelamin?.toUpperCase() === 'P' ? 'P' : 'L'),
          noTelp: d.no_telp || '-',
          alamat: d.alamat || '-',
          jilidAjar,
        });
        newUsers.push({
          username: d.username,
          password: d.password,
          role: 'guru',
          name: d.nama,
          refId: guruId,
        });
      } else {
        const siswaId = newSiswa.length > 0 ? Math.max(...newSiswa.map(s => s.id)) + 1 : 1;
        const kelas = data.kelas.find(k => k.nama.toLowerCase() === d.kelas.toLowerCase());
        newSiswa.push({
          id: siswaId,
          nis: d.nis,
          nama: d.nama,
          kelasId: kelas?.id || 1,
          jilid: (d.jilid as JilidType) || 'Jilid 1',
          jenisKelamin: (d.jenis_kelamin?.toUpperCase() === 'P' ? 'P' : 'L'),
          tanggalLahir: d.tanggal_lahir || '',
          namaWali: d.nama_wali || '-',
          noTelpWali: d.no_telp_wali || '-',
          alamat: d.alamat || '-',
        });
        newUsers.push({
          username: d.username,
          password: d.password,
          role: 'siswa',
          name: d.nama,
          refId: siswaId,
        });
      }
    });

    onUpdate({ ...data, guru: newGuru, siswa: newSiswa, users: newUsers });
    setImported(validRows.length);
    setRows([]);
    setCsvText('');
  };

  const validCount = rows.filter(r => r.valid).length;
  const invalidCount = rows.length - validCount;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-gray-900">Import Massal</h1>
        <p className="text-gray-600 text-sm mt-1">Import data Guru atau Siswa beserta akun login secara bersamaan menggunakan template CSV/Excel</p>
      </div>

      {imported !== null && (
        <div className="bg-green-50 border-2 border-green-300 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <p className="font-semibold text-green-900">Berhasil mengimport {imported} {tipe}!</p>
            <p className="text-sm text-green-700 mt-1">Data dan akun login telah ditambahkan ke sistem.</p>
            <button onClick={() => setImported(null)} className="mt-2 text-xs text-green-700 underline">Tutup</button>
          </div>
        </div>
      )}

      {/* Step 1: Pilih Tipe */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">1. Pilih Tipe Data yang Akan Diimport</p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => { setTipe('siswa'); setRows([]); setCsvText(''); }}
            className={`p-4 rounded-xl border-2 text-left transition ${tipe === 'siswa' ? 'border-amber-500 bg-amber-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <GraduationCap className={`w-8 h-8 mb-2 ${tipe === 'siswa' ? 'text-amber-600' : 'text-gray-400'}`} />
            <p className={`font-semibold ${tipe === 'siswa' ? 'text-amber-900' : 'text-gray-700'}`}>Import Siswa</p>
            <p className="text-xs text-gray-500 mt-1">Tambah banyak siswa + akun login sekaligus</p>
          </button>
          <button
            onClick={() => { setTipe('guru'); setRows([]); setCsvText(''); }}
            className={`p-4 rounded-xl border-2 text-left transition ${tipe === 'guru' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
          >
            <UserCog className={`w-8 h-8 mb-2 ${tipe === 'guru' ? 'text-emerald-600' : 'text-gray-400'}`} />
            <p className={`font-semibold ${tipe === 'guru' ? 'text-emerald-900' : 'text-gray-700'}`}>Import Guru</p>
            <p className="text-xs text-gray-500 mt-1">Tambah banyak guru pengampu + akun login</p>
          </button>
        </div>
      </div>

      {/* Step 2: Download Template */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-1">2. Download Template</p>
        <p className="text-xs text-gray-500 mb-3">Gunakan template ini sebagai panduan format data. Isi sesuai contoh kemudian upload kembali.</p>
        <div className="flex flex-wrap gap-2 mb-3">
          <button
            onClick={() => downloadTemplate('csv')}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Template .CSV
          </button>
          <button
            onClick={() => downloadTemplate('xls')}
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            <Download className="w-4 h-4" /> Template .XLS (Excel)
          </button>
        </div>

        {/* Preview kolom template */}
        <div className="bg-gray-50 rounded-lg p-3 overflow-x-auto">
          <p className="text-xs font-semibold text-gray-700 mb-2">Format kolom ({tipe}):</p>
          <code className="text-[11px] text-gray-700 whitespace-pre-wrap break-all block font-mono">
            {currentTemplate.split('\n')[0]}
          </code>
          <p className="text-[11px] text-gray-500 mt-2">
            <b>Catatan:</b>
            {tipe === 'siswa' ? (
              <> Kolom <code>kelas</code> harus sesuai nama kelas (contoh: 1A, 2B). Kolom <code>jilid</code>: Jilid 1-6, Al Qur'an, Tajwid, GHORIB. <code>jenis_kelamin</code>: L atau P.</>
            ) : (
              <> Kolom <code>jilid_ajar</code> dapat diisi lebih dari satu, pisahkan dengan titik koma (<code>;</code>). Contoh: <code>Jilid 1;Jilid 2</code></>
            )}
          </p>
        </div>
      </div>

      {/* Step 3: Upload / Paste */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
        <p className="text-sm font-semibold text-gray-900 mb-3">3. Upload File atau Paste Data</p>

        <label className="flex items-center justify-center gap-2 px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 hover:border-rose-400 transition mb-3">
          <Upload className="w-5 h-5 text-gray-500" />
          <span className="text-sm text-gray-700">Pilih file CSV atau XLS untuk di-upload</span>
          <input type="file" accept=".csv,.xls,.xlsx,.txt,.tsv" onChange={handleFileUpload} className="hidden" />
        </label>

        <details className="mb-3">
          <summary className="text-xs text-gray-600 cursor-pointer hover:text-gray-900">atau paste isi CSV/Excel langsung di sini ↓</summary>
          <textarea
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste isi file CSV/Excel di sini (termasuk header)..."
            className="mt-2 w-full h-32 px-3 py-2 border border-gray-200 rounded-lg text-xs font-mono"
          />
          <button
            onClick={handleParseManual}
            className="mt-2 px-3 py-1.5 bg-gray-700 text-white rounded text-xs font-medium"
          >
            Parse Data
          </button>
        </details>
      </div>

      {/* Step 4: Preview & Import */}
      {rows.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">4. Preview Data ({rows.length} baris)</p>
              <p className="text-xs mt-1">
                <span className="text-green-700 font-semibold">{validCount} valid</span>
                {invalidCount > 0 && <span className="text-red-700 font-semibold ml-3">{invalidCount} error</span>}
              </p>
            </div>
            <button
              onClick={handleImport}
              disabled={validCount === 0}
              className="inline-flex items-center gap-2 bg-rose-600 hover:bg-rose-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-sm disabled:bg-gray-300 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" /> Import {validCount} Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-2 py-2 text-left">No</th>
                  <th className="px-2 py-2 text-left">Status</th>
                  <th className="px-2 py-2 text-left">Username</th>
                  <th className="px-2 py-2 text-left">Password</th>
                  <th className="px-2 py-2 text-left">Nama</th>
                  {tipe === 'siswa' ? (
                    <>
                      <th className="px-2 py-2 text-left">NIS</th>
                      <th className="px-2 py-2 text-left">Kelas</th>
                      <th className="px-2 py-2 text-left">Jilid</th>
                    </>
                  ) : (
                    <>
                      <th className="px-2 py-2 text-left">NIP</th>
                      <th className="px-2 py-2 text-left">Jabatan</th>
                      <th className="px-2 py-2 text-left">Jilid Ajar</th>
                    </>
                  )}
                  <th className="px-2 py-2 text-left">Catatan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map(r => (
                  <tr key={r.no} className={r.valid ? '' : 'bg-red-50'}>
                    <td className="px-2 py-1.5">{r.no}</td>
                    <td className="px-2 py-1.5">
                      {r.valid ? (
                        <span className="inline-flex items-center gap-1 text-green-700 font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5" /> OK
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-red-700 font-semibold">
                          <AlertCircle className="w-3.5 h-3.5" /> Error
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-1.5 font-mono">{r.data.username}</td>
                    <td className="px-2 py-1.5 font-mono">{r.data.password}</td>
                    <td className="px-2 py-1.5">{r.data.nama}</td>
                    {tipe === 'siswa' ? (
                      <>
                        <td className="px-2 py-1.5 font-mono">{r.data.nis}</td>
                        <td className="px-2 py-1.5">{r.data.kelas}</td>
                        <td className="px-2 py-1.5">{r.data.jilid}</td>
                      </>
                    ) : (
                      <>
                        <td className="px-2 py-1.5 font-mono">{r.data.nip}</td>
                        <td className="px-2 py-1.5">{r.data.jabatan}</td>
                        <td className="px-2 py-1.5">{r.data.jilid_ajar}</td>
                      </>
                    )}
                    <td className="px-2 py-1.5 text-red-700 text-[11px]">{r.errors.join(', ')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ==================== MAIN APP ====================
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [data, setData] = useState<AppData>(() => loadData());

  useEffect(() => {
    const saved = localStorage.getItem('ummi_session');
    if (saved) {
      try { setUser(JSON.parse(saved)); } catch {}
    }
  }, []);

  const handleLogin = (u: User) => {
    setUser(u);
    localStorage.setItem('ummi_session', JSON.stringify(u));
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('ummi_session');
    setCurrentPage('dashboard');
  };

  const handleUpdate = (newData: AppData) => {
    setData(newData);
    saveData(newData);
  };

  if (!user) return <Login onLogin={handleLogin} />;

  const pageTitle: Record<Page, string> = {
    'dashboard': 'Dashboard',
    'admin-users': 'Manajemen User',
    'admin-import': 'Import Massal',
    'guru': 'Data Guru',
    'pengampu': 'Pengampu UMMI',
    'siswa': 'Data Siswa',
    'kelas': 'Data Kelas',
    'tahun-ajaran': 'Tahun Ajaran',
    'absensi': 'Absensi',
    'penilaian': 'Penilaian',
    'penilaian-harian': 'Penilaian Harian',
    'laporan': 'Laporan',
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        user={user}
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 min-w-0">
        {/* Top bar mobile */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <button onClick={() => setSidebarOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg">
            <MenuIcon className="w-5 h-5" />
          </button>
          <h2 className="font-semibold text-gray-900 text-sm">{pageTitle[currentPage]}</h2>
          <div className="w-9 h-9 bg-emerald-700 rounded-full flex items-center justify-center text-white text-xs font-bold">
            {user.name.charAt(0)}
          </div>
        </header>

        <main className="p-4 md:p-6 lg:p-8 max-w-full">
          {currentPage === 'dashboard' && <Dashboard user={user} data={data} />}
          {currentPage === 'admin-users' && user.role === 'admin' && <AdminUsers data={data} onUpdate={handleUpdate} />}
          {currentPage === 'admin-import' && user.role === 'admin' && <AdminImport data={data} onUpdate={handleUpdate} />}
          {currentPage === 'guru' && user.role === 'guru' && <DataGuru data={data} onUpdate={handleUpdate} />}
          {currentPage === 'pengampu' && user.role === 'guru' && <PengampuUMMI data={data} />}
          {currentPage === 'siswa' && user.role === 'guru' && <DataSiswa data={data} onUpdate={handleUpdate} />}
          {currentPage === 'kelas' && user.role === 'guru' && <DataKelas data={data} onUpdate={handleUpdate} />}
          {currentPage === 'tahun-ajaran' && user.role === 'guru' && <TahunAjaran data={data} onUpdate={handleUpdate} />}
          {currentPage === 'absensi' && user.role === 'guru' && <Absensi data={data} onUpdate={handleUpdate} />}
          {currentPage === 'penilaian' && user.role === 'guru' && <Penilaian data={data} onUpdate={handleUpdate} />}
          {currentPage === 'penilaian-harian' && <PenilaianHarianPage data={data} user={user} onUpdate={handleUpdate} />}
          {currentPage === 'laporan' && <Laporan data={data} user={user} />}
        </main>
      </div>
    </div>
  );
}