export interface JenjangUMMI {
  id: string;
  nama: string;
  tipe: 'Jilid' | 'Al Quran' | 'Tajwid' | 'GHORIB';
  urutan: number;
}

export const jenjangUMMI: JenjangUMMI[] = [
  { id: 'jilid-1', nama: 'Jilid 1', tipe: 'Jilid', urutan: 1 },
  { id: 'jilid-2', nama: 'Jilid 2', tipe: 'Jilid', urutan: 2 },
  { id: 'jilid-3', nama: 'Jilid 3', tipe: 'Jilid', urutan: 3 },
  { id: 'jilid-4', nama: 'Jilid 4', tipe: 'Jilid', urutan: 4 },
  { id: 'jilid-5', nama: 'Jilid 5', tipe: 'Jilid', urutan: 5 },
  { id: 'jilid-6', nama: 'Jilid 6', tipe: 'Jilid', urutan: 6 },
  { id: 'al-quran', nama: 'Al Qur\'an', tipe: 'Al Quran', urutan: 7 },
  { id: 'tajwid', nama: 'Tajwid', tipe: 'Tajwid', urutan: 8 },
  { id: 'ghorib', nama: 'GHORIB', tipe: 'GHORIB', urutan: 9 },
];

export function getJenjangById(id: string): JenjangUMMI | undefined {
  return jenjangUMMI.find(j => j.id === id);
}

export function getNextJenjang(currentId: string): JenjangUMMI | undefined {
  const current = getJenjangById(currentId);
  if (!current) return undefined;
  return jenjangUMMI.find(j => j.urutan === current.urutan + 1);
}
