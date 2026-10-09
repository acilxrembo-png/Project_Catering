import { useState, useEffect } from 'react';
import { fetchProdukSimulasi, type ParameterCari } from '../data/produkDummy';
import type { Produk } from '../types';

interface HasilFetch {
  data: Produk[];
  loading: boolean;
  error: string | null;
}

/**
 * Mengambil daftar paket berdasarkan kata kunci & kategori. Menangani loading,
 * error, dan membatalkan update state bila komponen unmount / parameter berubah.
 */
const useFetchProduk = ({ kataKunci = '', kategori = 'semua' }: ParameterCari = {}): HasilFetch => {
  const [data, setData] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let batal = false;

    const ambilData = async () => {
      setLoading(true);
      setError(null);
      try {
        const hasil = await fetchProdukSimulasi({ kataKunci, kategori });
        if (!batal) setData(hasil);
      } catch {
        if (!batal) setError('Gagal mengambil data menu');
      } finally {
        if (!batal) setLoading(false);
      }
    };

    void ambilData();

    return () => {
      batal = true;
    };
  }, [kataKunci, kategori]);

  return { data, loading, error };
};

export default useFetchProduk;
