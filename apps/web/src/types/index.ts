export type Kategori =
  | 'nasi-box'
  | 'prasmanan'
  | 'tumpeng'
  | 'snack-box'
  | 'dessert'
  | 'minuman';

export type KategoriFilter = Kategori | 'semua';

export type Satuan = 'box' | 'pax' | 'tumpeng' | 'cup' | 'gelas';

export type TagProduk = 'Terlaris' | 'Baru' | 'Premium';

export interface Produk {
  id: number;
  nama: string;
  kategori: Kategori;
  /** Harga per satuan (box / pax / tumpeng / dst). */
  harga: number;
  satuan: Satuan;
  /** Minimal pemesanan. */
  minPesan: number;
  /** Kelipatan tombol +/- di stepper jumlah. */
  langkah: number;
  emoji: string;
  deskripsi: string;
  /** Isi paket / daftar menu. */
  menu: string[];
  rating: number;
  terjual: number;
  tag?: TagProduk;
}

export interface CartItem {
  id: number;
  nama: string;
  kategori: Kategori;
  harga: number;
  satuan: Satuan;
  emoji: string;
  minPesan: number;
  langkah: number;
  jumlah: number;
}

export interface User {
  nama: string;
  email: string;
}

export interface Alamat {
  namaPenerima: string;
  telepon: string;
  alamatLengkap: string;
  kota: string;
  kodePos: string;
}

export interface DetailAcara {
  /** Format YYYY-MM-DD */
  tanggal: string;
  /** Format HH:mm */
  jam: string;
  catatan: string;
}

export type MetodePembayaran = 'transfer-bank' | 'e-wallet' | 'qris';

export type StatusPesanan = 'Dibayar' | 'Diproses' | 'Dikirim' | 'Selesai';

export interface Pesanan {
  id: string;
  tanggal: string;
  status: StatusPesanan;
  items: CartItem[];
  alamat: Alamat;
  acara: DetailAcara;
  metodePembayaran: MetodePembayaran;
  subtotal: number;
  ongkir: number;
  total: number;
}

export type DataPesananBaru = Omit<Pesanan, 'id' | 'tanggal' | 'status'>;
