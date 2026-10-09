import { useState } from 'react';
import type { MetodePembayaran } from '../types';

export type StatusBayar = 'idle' | 'memproses' | 'sukses' | 'gagal';

interface ParameterBayar {
  metodePembayaran: MetodePembayaran;
}

/**
 * Mensimulasikan proses pembayaran. Di aplikasi sungguhan, isi `proses` diganti
 * dengan pemanggilan API backend yang terhubung ke payment gateway
 * (Midtrans / Xendit).
 */
const usePembayaran = () => {
  const [status, setStatus] = useState<StatusBayar>('idle');
  const [error, setError] = useState<string | null>(null);

  const proses = (_params: ParameterBayar): Promise<{ berhasil: true }> =>
    new Promise((resolve) => {
      setStatus('memproses');
      setError(null);

      // Simulasi delay gateway (1,5 detik); selalu berhasil di demo ini.
      setTimeout(() => {
        setStatus('sukses');
        resolve({ berhasil: true });
      }, 1500);
    });

  const reset = () => {
    setStatus('idle');
    setError(null);
  };

  return { proses, status, error, reset };
};

export default usePembayaran;
