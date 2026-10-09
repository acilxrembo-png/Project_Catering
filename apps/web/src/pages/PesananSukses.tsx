import { useParams, Link, Navigate } from 'react-router-dom';
import { CheckCircle2, Printer } from 'lucide-react';
import useOrderStore from '../store/useOrderStore';
import { formatRupiah, formatTanggalPanjang } from '../utils/formatRupiah';
import type { MetodePembayaran } from '../types';

const metodeLabel: Record<MetodePembayaran, string> = {
  'transfer-bank': 'Transfer Bank (Virtual Account)',
  'e-wallet': 'E-Wallet',
  qris: 'QRIS',
};

const PesananSukses = () => {
  const { id = '' } = useParams<{ id: string }>();
  const pesanan = useOrderStore((state) => state.pesanan.find((p) => p.id === id));

  if (!pesanan) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="mx-auto max-w-md text-center">
      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-leaf-100 dark:bg-leaf-400/15">
        <CheckCircle2 className="h-11 w-11 text-leaf-500" strokeWidth={1.75} />
      </div>
      <h1 className="mt-4 text-3xl font-semibold">Pembayaran Berhasil!</h1>
      <p className="mt-1.5 text-ink-muted">Terima kasih! Dapur kami mulai menyiapkan pesanan Anda.</p>

      {/* Invoice bergaya struk dengan tepi bergerigi */}
      <div className="mt-8 text-left">
        <div className="ticket-edge-top" />
        <div className="border-x border-ink/10 bg-surface px-6 py-6 font-mono text-[13px] dark:border-white/10 dark:bg-surface-dark">
          <p className="text-center font-display text-lg font-semibold">Rasa Nusa Catering</p>
          <p className="text-center text-[11px] text-ink-muted">Bukti pemesanan</p>

          <div className="my-4 border-t border-dashed border-ink/25 dark:border-white/20" />

          <div className="flex justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">No. Invoice</p>
              <p className="font-semibold">{pesanan.id}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] uppercase tracking-wide text-ink-muted">Dipesan</p>
              <p>{new Date(pesanan.tanggal).toLocaleDateString('id-ID')}</p>
            </div>
          </div>

          <div className="mt-3 rounded-lg bg-saffron-50 p-3 dark:bg-saffron-400/10">
            <p className="text-[10px] uppercase tracking-wide text-ink-muted">Jadwal acara</p>
            <p className="font-semibold">{formatTanggalPanjang(pesanan.acara.tanggal)}</p>
            <p>Diantar pukul {pesanan.acara.jam} WIB</p>
          </div>

          <div className="my-4 border-t border-dashed border-ink/25 dark:border-white/20" />

          {pesanan.items.map((item) => (
            <div key={item.id} className="py-1">
              <p className="font-semibold">{item.emoji} {item.nama}</p>
              <p className="flex justify-between text-ink-soft dark:text-paper/70">
                <span>{item.jumlah} {item.satuan} × {formatRupiah(item.harga)}</span>
                <span>{formatRupiah(item.harga * item.jumlah)}</span>
              </p>
            </div>
          ))}

          <div className="my-4 border-t border-dashed border-ink/25 dark:border-white/20" />

          <div className="flex justify-between py-0.5"><span>Subtotal</span><span>{formatRupiah(pesanan.subtotal)}</span></div>
          <div className="flex justify-between py-0.5"><span>Ongkos kirim</span><span>{pesanan.ongkir === 0 ? 'GRATIS' : formatRupiah(pesanan.ongkir)}</span></div>
          <div className="mt-2 flex justify-between border-t border-dashed border-ink/25 pt-3 text-base font-semibold dark:border-white/20">
            <span>Total dibayar</span>
            <span>{formatRupiah(pesanan.total)}</span>
          </div>

          <div className="my-4 border-t border-dashed border-ink/25 dark:border-white/20" />

          <p>Metode: <span className="font-semibold">{metodeLabel[pesanan.metodePembayaran]}</span></p>
          <p className="mt-0.5">Status: <span className="font-semibold text-leaf-600 dark:text-leaf-300">{pesanan.status}</span></p>
          <p className="mt-0.5">Kirim ke: {pesanan.alamat.namaPenerima}, {pesanan.alamat.kota}</p>
        </div>
        <div className="ticket-edge-bottom" />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-3 print:hidden">
        <button onClick={() => window.print()} className="btn-secondary"><Printer className="h-4 w-4" /> Cetak</button>
        <Link to="/menu" className="btn-secondary">Pesan Lagi</Link>
        <Link to="/pesanan-saya" className="btn-primary">Lihat Pesanan Saya</Link>
      </div>
    </div>
  );
};

export default PesananSukses;
