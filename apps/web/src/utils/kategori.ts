import type { Kategori, KategoriFilter, Satuan } from '../types';

export interface KategoriInfo {
  value: Kategori;
  label: string;
  emoji: string;
  ringkas: string;
  /** Kelas gradient untuk "piring" ilustrasi kategori (terang & gelap). */
  gradient: string;
  /** Kelas warna teks aksen kategori. */
  teks: string;
}

export const kategoriInfo: Record<Kategori, KategoriInfo> = {
  'nasi-box': {
    value: 'nasi-box',
    label: 'Nasi Box',
    emoji: '🍱',
    ringkas: 'Praktis untuk rapat, seminar & arisan',
    gradient: 'from-amber-200 to-orange-300 dark:from-amber-500/35 dark:to-orange-600/35',
    teks: 'text-orange-700 dark:text-orange-300',
  },
  prasmanan: {
    value: 'prasmanan',
    label: 'Prasmanan',
    emoji: '🍛',
    ringkas: 'Hidangan lengkap untuk pernikahan & gathering',
    gradient: 'from-rose-200 to-orange-200 dark:from-rose-500/35 dark:to-orange-500/30',
    teks: 'text-rose-700 dark:text-rose-300',
  },
  tumpeng: {
    value: 'tumpeng',
    label: 'Tumpeng',
    emoji: '🍚',
    ringkas: 'Syukuran, ulang tahun & peresmian',
    gradient: 'from-yellow-200 to-amber-300 dark:from-yellow-500/35 dark:to-amber-600/35',
    teks: 'text-amber-700 dark:text-amber-300',
  },
  'snack-box': {
    value: 'snack-box',
    label: 'Snack Box',
    emoji: '🥟',
    ringkas: 'Jajanan pasar & kue kering segar',
    gradient: 'from-lime-200 to-emerald-300 dark:from-lime-500/30 dark:to-emerald-600/35',
    teks: 'text-emerald-700 dark:text-emerald-300',
  },
  dessert: {
    value: 'dessert',
    label: 'Dessert',
    emoji: '🍰',
    ringkas: 'Penutup manis untuk semua tamu',
    gradient: 'from-pink-200 to-rose-300 dark:from-pink-500/35 dark:to-rose-600/35',
    teks: 'text-pink-700 dark:text-pink-300',
  },
  minuman: {
    value: 'minuman',
    label: 'Minuman',
    emoji: '🧋',
    ringkas: 'Es teh, kopi & wedang station',
    gradient: 'from-sky-200 to-cyan-300 dark:from-sky-500/30 dark:to-cyan-600/35',
    teks: 'text-sky-700 dark:text-sky-300',
  },
};

export const daftarKategori: KategoriInfo[] = Object.values(kategoriInfo);

export const filterKategori: { value: KategoriFilter; label: string }[] = [
  { value: 'semua', label: 'Semua' },
  ...daftarKategori.map((k) => ({ value: k.value, label: k.label })),
];

export const isKategori = (nilai: string | null): nilai is Kategori =>
  nilai !== null && nilai in kategoriInfo;

export const satuanLabel: Record<Satuan, string> = {
  box: 'box',
  pax: 'pax',
  tumpeng: 'tumpeng',
  cup: 'cup',
  gelas: 'gelas',
};
