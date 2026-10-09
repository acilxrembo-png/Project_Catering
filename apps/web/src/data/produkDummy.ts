import type { KategoriFilter, Produk } from '../types';

// Data dummy — di aplikasi asli ini datang dari backend/API.
export const produkDummy: Produk[] = [
  {
    id: 1,
    nama: 'Nasi Box Ayam Bakar Madu',
    kategori: 'nasi-box',
    harga: 38000,
    satuan: 'box',
    minPesan: 20,
    langkah: 5,
    emoji: '🍗',
    deskripsi:
      'Ayam bakar bumbu madu yang juicy, disajikan dengan nasi pulen dan lalapan segar. Favorit untuk rapat kantor dan acara keluarga.',
    menu: ['Nasi putih pulen', 'Ayam bakar madu (paha atas)', 'Tempe orek kering', 'Lalapan & sambal terasi', 'Kerupuk udang', 'Buah potong'],
    rating: 4.8,
    terjual: 1240,
    tag: 'Terlaris',
  },
  {
    id: 2,
    nama: 'Nasi Box Rendang Sapi',
    kategori: 'nasi-box',
    harga: 48000,
    satuan: 'box',
    minPesan: 20,
    langkah: 5,
    emoji: '🍖',
    deskripsi:
      'Rendang sapi empuk dimasak 6 jam dengan santan dan rempah pilihan, ditemani sayur daun singkong dan sambal hijau.',
    menu: ['Nasi putih', 'Rendang sapi 2 potong', 'Sayur daun singkong', 'Telur balado', 'Sambal ijo', 'Kerupuk', 'Air mineral'],
    rating: 4.9,
    terjual: 980,
    tag: 'Premium',
  },
  {
    id: 3,
    nama: 'Nasi Box Ikan Bakar Rica',
    kategori: 'nasi-box',
    harga: 42000,
    satuan: 'box',
    minPesan: 20,
    langkah: 5,
    emoji: '🐟',
    deskripsi:
      'Ikan kakap bakar dengan bumbu rica-rica pedas gurih. Cocok untuk Anda yang suka seafood.',
    menu: ['Nasi putih', 'Ikan bakar rica-rica', 'Tumis kangkung', 'Perkedel kentang', 'Sambal dabu-dabu', 'Buah potong'],
    rating: 4.6,
    terjual: 612,
  },
  {
    id: 4,
    nama: 'Prasmanan Nusantara',
    kategori: 'prasmanan',
    harga: 75000,
    satuan: 'pax',
    minPesan: 50,
    langkah: 10,
    emoji: '🍛',
    deskripsi:
      'Paket prasmanan lengkap dengan 6 menu utama, termasuk counter, alat saji, dan 2 petugas. Cocok untuk syukuran dan reuni.',
    menu: ['Nasi putih & nasi kuning', 'Ayam goreng lengkuas', 'Sapi lada hitam', 'Capcay kuah', 'Perkedel & kerupuk', 'Acar & sambal', 'Puding buah', 'Air mineral'],
    rating: 4.7,
    terjual: 430,
    tag: 'Terlaris',
  },
  {
    id: 5,
    nama: 'Prasmanan Wedding Premium',
    kategori: 'prasmanan',
    harga: 135000,
    satuan: 'pax',
    minPesan: 100,
    langkah: 10,
    emoji: '🥘',
    deskripsi:
      'Layanan lengkap untuk pernikahan: 10 menu, 2 live station, dekorasi buffet, dan tim 8 pelayan berseragam.',
    menu: ['Live station sate & bakso', 'Gulai kambing muda', 'Ayam betutu', 'Udang saus padang', 'Sayur asem Betawi', 'Aneka gorengan', 'Es buah & es campur', 'Dekorasi buffet & 8 pelayan'],
    rating: 4.9,
    terjual: 156,
    tag: 'Premium',
  },
  {
    id: 6,
    nama: 'Tumpeng Mini Nasi Kuning',
    kategori: 'tumpeng',
    harga: 650000,
    satuan: 'tumpeng',
    minPesan: 1,
    langkah: 1,
    emoji: '🍚',
    deskripsi:
      'Tumpeng nasi kuning untuk sekitar 10 orang. Lengkap dengan lauk tradisional dan hiasan sayur segar.',
    menu: ['Nasi kuning bentuk kerucut', 'Ayam goreng kuning', 'Telur pindang', 'Urap sayur', 'Perkedel', 'Tempe orek', 'Serundeng', 'Sambal goreng ati'],
    rating: 4.8,
    terjual: 721,
    tag: 'Terlaris',
  },
  {
    id: 7,
    nama: 'Tumpeng Besar Syukuran',
    kategori: 'tumpeng',
    harga: 1450000,
    satuan: 'tumpeng',
    minPesan: 1,
    langkah: 1,
    emoji: '🎉',
    deskripsi:
      'Tumpeng besar untuk sekitar 25 orang dengan 9 lauk pendamping dan ukiran hiasan sayur bertema acara Anda.',
    menu: ['Nasi kuning / nasi putih', 'Ayam bakar utuh', 'Rendang daging', 'Telur dadar iris', 'Urap sayur', 'Kering kentang', 'Teri kacang', 'Sambal goreng ati', 'Hiasan ukiran sayur'],
    rating: 4.9,
    terjual: 288,
    tag: 'Premium',
  },
  {
    id: 8,
    nama: 'Snack Box Jajan Pasar',
    kategori: 'snack-box',
    harga: 22000,
    satuan: 'box',
    minPesan: 25,
    langkah: 5,
    emoji: '🥟',
    deskripsi:
      'Tiga jajanan pasar tradisional yang dibuat segar pagi hari, ditemani air mineral.',
    menu: ['Lemper ayam', 'Risoles ragout', 'Kue lapis', 'Air mineral gelas'],
    rating: 4.5,
    terjual: 1530,
  },
  {
    id: 9,
    nama: 'Snack Box Premium',
    kategori: 'snack-box',
    harga: 34000,
    satuan: 'box',
    minPesan: 25,
    langkah: 5,
    emoji: '🥐',
    deskripsi:
      'Empat camilan gurih dan manis dalam box eksklusif dengan stiker nama acara.',
    menu: ['Croissant isi ayam', 'Pastel mayo', 'Brownies fudgy', 'Buah potong', 'Jus kemasan'],
    rating: 4.7,
    terjual: 502,
    tag: 'Baru',
  },
  {
    id: 10,
    nama: 'Puding Coklat Silky Cup',
    kategori: 'dessert',
    harga: 14000,
    satuan: 'cup',
    minPesan: 30,
    langkah: 10,
    emoji: '🍮',
    deskripsi:
      'Puding coklat lembut dengan vla vanila hangat, disajikan dalam cup 120 ml.',
    menu: ['Puding coklat premium', 'Vla vanila', 'Taburan choco chips'],
    rating: 4.6,
    terjual: 874,
  },
  {
    id: 11,
    nama: 'Dessert Table Mix',
    kategori: 'dessert',
    harga: 32000,
    satuan: 'pax',
    minPesan: 30,
    langkah: 10,
    emoji: '🧁',
    deskripsi:
      'Meja dessert cantik berisi cupcake, mini tart, dan macaron untuk pesta ulang tahun maupun pernikahan.',
    menu: ['Cupcake buttercream', 'Mini fruit tart', 'Macaron aneka rasa', 'Choco fountain & topping'],
    rating: 4.8,
    terjual: 203,
    tag: 'Baru',
  },
  {
    id: 12,
    nama: 'Es Teh & Kopi Susu Station',
    kategori: 'minuman',
    harga: 13000,
    satuan: 'gelas',
    minPesan: 50,
    langkah: 10,
    emoji: '🧋',
    deskripsi:
      'Booth minuman lengkap dengan barista, es teh manis, es kopi susu gula aren, dan es jeruk peras.',
    menu: ['Es teh manis', 'Es kopi susu gula aren', 'Es jeruk peras', 'Cup & es batu', 'Barista 1 orang'],
    rating: 4.7,
    terjual: 665,
    tag: 'Terlaris',
  },
];

export interface ParameterCari {
  kataKunci?: string;
  kategori?: KategoriFilter;
}

// Simulasi panggilan API dengan delay, dipakai oleh custom hook useFetchProduk
export const fetchProdukSimulasi = ({
  kataKunci = '',
  kategori = 'semua',
}: ParameterCari = {}): Promise<Produk[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const kunci = kataKunci.trim().toLowerCase();
      const hasil = produkDummy.filter((p) => {
        const cocokKataKunci =
          p.nama.toLowerCase().includes(kunci) || p.menu.some((m) => m.toLowerCase().includes(kunci));
        const cocokKategori = kategori === 'semua' || p.kategori === kategori;
        return cocokKataKunci && cocokKategori;
      });
      resolve(hasil);
    }, 350);
  });
};
