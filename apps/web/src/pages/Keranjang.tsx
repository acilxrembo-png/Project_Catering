import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBasket, Trash2, Truck } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import { formatRupiah } from '../utils/formatRupiah';
import { GRATIS_ONGKIR_MIN, hitungOngkir, hitungSubtotal } from '../utils/biaya';
import Piring from '../components/Piring';
import QtyStepper from '../components/QtyStepper';

const Keranjang = () => {
  const items = useCartStore((state) => state.items);
  const ubahJumlah = useCartStore((state) => state.ubahJumlah);
  const hapusItem = useCartStore((state) => state.hapusItem);
  const navigate = useNavigate();

  const subtotal = hitungSubtotal(items);
  const ongkir = hitungOngkir(subtotal);
  const total = subtotal + ongkir;
  const kurangUntukGratis = GRATIS_ONGKIR_MIN - subtotal;
  const progres = Math.min(100, (subtotal / GRATIS_ONGKIR_MIN) * 100);

  if (items.length === 0) {
    return (
      <div className="py-20 text-center">
        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-saffron-100 dark:bg-saffron-400/15">
          <ShoppingBasket className="h-10 w-10 text-saffron-600 dark:text-saffron-300" strokeWidth={1.5} />
        </div>
        <h1 className="mt-6 text-3xl font-semibold">Keranjang Anda masih kosong</h1>
        <p className="mt-2 text-ink-muted">Yuk pilih hidangan favorit untuk acara Anda.</p>
        <Link to="/menu" className="btn-primary mt-6 inline-flex">Lihat Menu & Paket</Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-8 text-3xl font-semibold sm:text-4xl">Keranjang Pesanan</h1>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.map((item) => (
            <div key={item.id} className="card flex flex-col gap-4 p-4 sm:flex-row sm:items-center">
              <Piring kategori={item.kategori} emoji={item.emoji} ukuran="text-4xl" className="h-24 w-full flex-shrink-0 rounded-2xl sm:w-24" />

              <div className="min-w-0 flex-1">
                <Link to={`/menu/${item.id}`} className="font-display text-lg font-semibold leading-snug hover:text-brand-600 dark:hover:text-saffron-300">
                  {item.nama}
                </Link>
                <p className="mt-0.5 text-sm text-ink-muted">
                  {formatRupiah(item.harga)} / {item.satuan} · min. {item.minPesan}
                </p>
                <div className="mt-3">
                  <QtyStepper
                    ukuran="sm"
                    jumlah={item.jumlah}
                    min={item.minPesan}
                    langkah={item.langkah}
                    onChange={(j) => ubahJumlah(item.id, j)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end sm:justify-center">
                <p className="text-lg font-extrabold tabular-nums">{formatRupiah(item.harga * item.jumlah)}</p>
                <button
                  onClick={() => hapusItem(item.id)}
                  aria-label={`Hapus ${item.nama}`}
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-500/10"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            </div>
          ))}
        </div>

        <aside className="card sticky top-24 p-6">
          <h2 className="font-display text-xl font-semibold">Ringkasan Pesanan</h2>

          <div className="mt-4 rounded-2xl bg-leaf-50 p-4 dark:bg-leaf-400/10">
            <p className="flex items-center gap-2 text-sm font-semibold text-leaf-700 dark:text-leaf-200">
              <Truck className="h-4 w-4" />
              {kurangUntukGratis > 0
                ? `Tambah ${formatRupiah(kurangUntukGratis)} lagi untuk gratis ongkir`
                : 'Selamat! Anda dapat gratis ongkir'}
            </p>
            <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-leaf-200/60 dark:bg-white/10">
              <div className="h-full rounded-full bg-leaf-500 transition-all duration-500" style={{ width: `${progres}%` }} />
            </div>
          </div>

          <dl className="mt-5 space-y-2.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-muted">Subtotal</dt>
              <dd className="font-semibold tabular-nums">{formatRupiah(subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">Ongkos kirim</dt>
              <dd className={`font-semibold tabular-nums ${ongkir === 0 ? 'text-leaf-600 dark:text-leaf-300' : ''}`}>
                {ongkir === 0 ? 'GRATIS' : formatRupiah(ongkir)}
              </dd>
            </div>
          </dl>
          <div className="my-4 border-t border-dashed border-ink/15 dark:border-white/15" />
          <div className="flex items-baseline justify-between">
            <span className="font-semibold">Total</span>
            <span className="text-2xl font-extrabold tabular-nums text-brand-700 dark:text-saffron-300">{formatRupiah(total)}</span>
          </div>

          <button onClick={() => navigate('/checkout')} className="btn-primary mt-6 w-full">
            Lanjut ke Checkout
          </button>
          <Link to="/menu" className="mt-3 block text-center text-sm font-semibold text-ink-muted hover:text-brand-600 dark:hover:text-saffron-300">
            + Tambah paket lain
          </Link>
        </aside>
      </div>
    </div>
  );
};

export default Keranjang;
