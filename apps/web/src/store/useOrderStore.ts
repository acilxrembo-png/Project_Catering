import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { DataPesananBaru, Pesanan } from '../types';

interface OrderState {
  pesanan: Pesanan[];
  tambahPesanan: (data: DataPesananBaru) => Pesanan;
  getPesananById: (id: string) => Pesanan | undefined;
}

// Menyimpan riwayat pesanan setelah checkout berhasil.
const useOrderStore = create<OrderState>()(
  persist(
    (set, get) => ({
      pesanan: [],

      tambahPesanan: (data) => {
        const pesananBaru: Pesanan = {
          id: `RN-${Date.now().toString().slice(-8)}`,
          tanggal: new Date().toISOString(),
          status: 'Dibayar',
          ...data,
        };
        set((state) => ({ pesanan: [pesananBaru, ...state.pesanan] }));
        return pesananBaru;
      },

      getPesananById: (id) => get().pesanan.find((p) => p.id === id),
    }),
    { name: 'order-storage-catering' }
  )
);

export default useOrderStore;
