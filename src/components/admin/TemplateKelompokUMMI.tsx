import { useState } from 'react';
import { Upload, Download, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TemplateKelompokUMMIProps {
  onUpload: (data: any[]) => void;
}

const CSV_TEMPLATE = `nama,jenjang_id,guru_pengampu_id,tingkat_sekolah,kelas_sumber,tahun_ajaran,kapasitas
Jilid 1 - Ust. Ahmad,jilid-1,G001,1,"1A,1B",2026/2027,25
Jilid 2 - Ust. Budi,jilid-2,G002,2,"2A,2B",2026/2027,25
Al Quran - Ust. Choir,al-quran,G003,3,"3A,3B",2026/2027,20
Tajwid - Ust. Dedi,tajwid,G004,4,"4A,4B",2026/2027,20
GHORIB - Ust. Eko,ghorib,G005,5,"5A,5B",2026/2027,15`;

const JENJANG_OPTIONS = [
  { id: 'jilid-1', nama: 'Jilid 1' },
  { id: 'jilid-2', nama: 'Jilid 2' },
  { id: 'jilid-3', nama: 'Jilid 3' },
  { id: 'jilid-4', nama: 'Jilid 4' },
  { id: 'jilid-5', nama: 'Jilid 5' },
  { id: 'jilid-6', nama: 'Jilid 6' },
  { id: 'al-quran', nama: 'Al Qur\'an' },
  { id: 'tajwid', nama: 'Tajwid' },
  { id: 'ghorib', nama: 'GHORIB' },
];

export default function TemplateKelompokUMMI({ onUpload }: TemplateKelompokUMMIProps) {
  const [csvText, setCsvText] = useState('');
  const [parsedData, setParsedData] = useState<any[] | null>(null);
  const [error, setError] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  const downloadTemplate = () => {
    const blob = new Blob([CSV_TEMPLATE], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'template_kelompok_ummi.csv';
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
    setError('');
    try {
      const lines = text.trim().split(/\r?\n/).filter(l => l.trim());
      if (lines.length < 2) {
        setError('File CSV minimal harus memiliki header dan 1 baris data');
        setParsedData(null);
        return;
      }

      const sep = lines[0].includes('\t') ? '\t' : ',';
      const headers = lines[0].split(sep).map(h => h.trim().toLowerCase());

      const required = ['nama', 'jenjang_id', 'guru_pengampu_id'];
      const missing = required.filter(r => !headers.includes(r));
      if (missing.length > 0) {
        setError(`Kolom wajib tidak ditemukan: ${missing.join(', ')}`);
        setParsedData(null);
        return;
      }

      const data: any[] = [];
      for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split(sep).map(c => c.trim().replace(/^"|"$/g, ''));
        const row: any = {};
        headers.forEach((h, idx) => { row[h] = cols[idx] || ''; });
        data.push(row);
      }

      setParsedData(data);
      setShowPreview(true);
    } catch (err) {
      setError('Gagal memparse CSV: ' + (err as Error).message);
      setParsedData(null);
    }
  };

  const handleImport = () => {
    if (!parsedData || parsedData.length === 0) return;
    onUpload(parsedData);
    setCsvText('');
    setParsedData(null);
    setShowPreview(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-emerald-600" />
          Import Kelompok dari CSV
        </h3>
        <button
          onClick={downloadTemplate}
          className="inline-flex items-center gap-2 text-sm text-emerald-600 hover:text-emerald-700 font-medium"
        >
          <Download className="w-4 h-4" />
          Download Template
        </button>
      </div>

      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-400 hover:bg-emerald-50/30 transition">
        <Upload className="w-8 h-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm text-gray-600 mb-2">Upload file CSV atau paste data di bawah</p>
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg cursor-pointer hover:bg-emerald-700 transition text-sm">
          <Upload className="w-4 h-4" />
          Pilih File CSV
          <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Paste Area */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Atau paste CSV di sini:</label>
        <textarea
          value={csvText}
          onChange={(e) => setCsvText(e.target.value)}
          placeholder={CSV_TEMPLATE}
          className="w-full h-32 px-3 py-2 border border-gray-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={() => parseCSV(csvText)}
            disabled={!csvText.trim()}
            className="px-3 py-1.5 bg-gray-700 text-white rounded text-xs font-medium hover:bg-gray-800 transition disabled:bg-gray-300"
          >
            Parse Data
          </button>
          {parsedData && (
            <button
              onClick={handleImport}
              className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium hover:bg-emerald-700 transition flex items-center gap-1"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Import {parsedData.length} Data
            </button>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Preview */}
      {showPreview && parsedData && parsedData.length > 0 && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-3 py-2 border-b border-gray-200">
            <p className="text-sm font-medium text-gray-700">Preview Data ({parsedData.length} baris)</p>
          </div>
          <div className="overflow-x-auto max-h-48 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left font-medium">No</th>
                  <th className="px-2 py-1.5 text-left font-medium">Nama</th>
                  <th className="px-2 py-1.5 text-left font-medium">Jenjang</th>
                  <th className="px-2 py-1.5 text-left font-medium">Guru ID</th>
                  <th className="px-2 py-1.5 text-left font-medium">Tingkat</th>
                  <th className="px-2 py-1.5 text-left font-medium">Kelas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {parsedData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-2 py-1.5 text-gray-600">{idx + 1}</td>
                    <td className="px-2 py-1.5 font-medium text-gray-900">{row.nama}</td>
                    <td className="px-2 py-1.5">
                      <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded text-[10px] font-medium">
                        {JENJANG_OPTIONS.find(j => j.id === row.jenjang_id)?.nama || row.jenjang_id}
                      </span>
                    </td>
                    <td className="px-2 py-1.5 font-mono text-gray-600">{row.guru_pengampu_id}</td>
                    <td className="px-2 py-1.5 text-gray-600">{row.tingkat_sekolah}</td>
                    <td className="px-2 py-1.5 text-gray-600">{row.kelas_sumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-3 text-xs text-gray-600">
        <p className="font-medium text-gray-700 mb-1">Format CSV:</p>
        <code className="block font-mono text-[10px] bg-white p-2 rounded border border-gray-200 mb-2">
          nama,jenjang_id,guru_pengampu_id,tingkat_sekolah,kelas_sumber,tahun_ajaran,kapasitas
        </code>
        <p className="mb-1"><strong>Jenjang ID:</strong> jilid-1, jilid-2, jilid-3, jilid-4, jilid-5, jilid-6, al-quran, tajwid, ghorib</p>
        <p><strong>Kelas Sumber:</strong> Pisahkan dengan koma, contoh: "1A,1B,2A"</p>
      </div>
    </div>
  );
}
