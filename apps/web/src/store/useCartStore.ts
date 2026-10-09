import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, Produk } from '../types';
import { hitungSubtotal } from '../utils/biaya';

interface CartState {
  items: CartItem[];
  /** Tambah paket; jumlah awal default ke minimal pemesanan paket tersebut. */
  tambahItem: (produk: Produk, jumlah?: number) => void;
  /** Ubah jumlah; otomatis dijepit ke minimal pemesanan paket. */
  ubahJumlah: (id: number, jumlahBaru: number) => void;
  hapusItem: (id: number) => void;
  kosongkanKeranjang: () => void;
  getSubtotal: () => number;
  /** Jumlah jenis paket di keranjang (bukan total porsi). */
  getJumlahPaket: () => number;
}

const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      tambahItem: (produk, jumlah = produk.minPesan) =>
        set((state) => {
          const jumlahValid = Math.max(jumlah, produk.minPesan);
          const sudahAda = state.items.some((item) => item.id === produk.id);
          if (sudahAda) {
            return {
              items: state.items.map((item) =>
                item.id === produk.id ? { ...item, jumlah: item.jumlah + jumlahValid } : item
              ),
            };
          }
          const itemBaru: CartItem = {
            id: produk.id,
            nama: produk.nama,
            kategori: produk.kategori,
            harga: produk.harga,
            satuan: produk.satuan,
            emoji: produk.emoji,
            minPesan: produk.minPesan,
            langkah: produk.langkah,
            jumlah: jumlahValid,
          };
          return { items: [...state.items, itemBaru] };
        }),

      ubahJumlah: (id, jumlahBaru) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, jumlah: Math.max(item.minPesan, jumlahBaru) } : item
          ),
        })),

      hapusItem: (id) => set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      kosongkanKeranjang: () => set({ items: [] }),

      getSubtotal: () => hitungSubtotal(get().items),

      getJumlahPaket: () => get().items.length,
    }),
    { name: 'cart-storage-catering' }
  )
);

export default useCartStore;
