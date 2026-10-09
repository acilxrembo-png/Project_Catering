import { Link } from 'react-router-dom';
import { CalendarDays, ChevronDown, ReceiptText } from 'lucide-react';
import useOrderStore from '../store/useOrderStore';
import useToggle from '../hooks/useToggle';
import { formatRupiah, formatTanggalPanjang } from '../utils/formatRupiah';
import type { Pesanan } from '../types';

const RiwayatPesananItem = ({ pesanan }: { pesanan: Pesanan }) => {
  const [terbuka, toggleTerbuka] = useToggle(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={toggleTerbuka}
        aria-expanded={terbuka}
        className="flex w-full items-center gap-4 p-5 text-left transition hover:bg-paper-dim/60 dark:hover:bg-white/5"
      >
        <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-saffron-100 text-2xl dark:bg-saffron-400/15" aria-hidden="true">
          {pesanan.items[0]?.emoji ?? '🍽️'}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-mono text-sm font-semibold">{pesanan.id}</span>
          <span className="mt-0.5 flex items-center gap-1.5 text-xs text-ink-muted">
            <CalendarDays className="h-3.5 w-3.5" /> Acara {formatTanggalPanjang(pesanan.acara.tanggal)}
          </span>
        </span>
        <span className="text-right">
          <span className="block font-extrabold tabular-nums">{formatRupiah(pesanan.total)}</span>
          <span className="chip-leaf mt-1">{pesanan.status}</span>
        </span>
        <ChevronDown className={`h-5 w-5 flex-shrink-0 text-ink-muted transition-transform ${terbuka ? 'rotate-180' : ''}`} />
      </button>

      {terbuka && (
        <div className="space-y-2 border-t border-ink/8 bg-paper-dim/40 p-5 text-sm dark:border-white/8 dark:bg-white/[0.03]">
          {pesanan.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between gap-3">
              <span>{item.emoji} {item.nama} <span className="text-ink-muted">· {item.jumlah} {item.satuan}</span></span>
              <span className="font-semibold tabular-nums">{formatRupiah(item.harga * item.jumlah)}</span>
            </div>
          ))}
          <p className="pt-2 text-xs text-ink-muted">
            Diantar pukul {pesanan.acara.jam} ke {pesanan.alamat.namaPenerima}, {pesanan.alamat.kota}
          </p>
          <Link to={`/pesanan-sukses/${pesanan.id}`} className="inline-flex items-center gap-1.5 pt-1 text-xs font-bold text-brand-600 hover:underline dark:text-saffron-300">
            <ReceiptText className="h-3.5 w-3.5" /> Lihat invoice
          </Link>
        </div>
      )}
    </div>
  );
};

const RiwayatPesanan = () => {
  const pesanan = useOrderStore((state) => state.pesanan);

  if (pesanan.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-6xl" aria-hidden="true">📋</p>
        <h1 className="mt-4 text-3xl font-semibold">Belum ada pesanan</h1>
        <p className="mt-2 text-ink-muted">Pesanan yang sudah dibayar akan muncul di sini.</p>
        <Link to="/menu" className="btn-primary mt-6 inline-flex">Mulai Pesan</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-semibold sm:text-4xl">Pesanan Saya</h1>
      <p className="mb-8 mt-2 text-ink-muted">{pesanan.length} pesanan tercatat</p>
      <div className="space-y-4">
        {pesanan.map((p) => (
          <RiwayatPesananItem key={p.id} pesanan={p} />
        ))}
      </div>
    </div>
  );
};

export default RiwayatPesanan;
