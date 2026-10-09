import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CalendarCheck, Check, ShieldCheck, ShoppingBasket, Star, Truck } from 'lucide-react';
import { produkDummy } from '../data/produkDummy';
import { formatRupiah } from '../utils/formatRupiah';
import { kategoriInfo } from '../utils/kategori';
import { GRATIS_ONGKIR_MIN, MIN_HARI_PESAN } from '../utils/biaya';
import useCartStore from '../store/useCartStore';
import Piring from '../components/Piring';
import QtyStepper from '../components/QtyStepper';
import PaketCard from '../components/PaketCard';

const DetailPaket = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const tambahItem = useCartStore((state) => state.tambahItem);

  const produk = produkDummy.find((p) => p.id === Number(id));
  const [jumlah, setJumlah] = useState(produk?.minPesan ?? 1);

  if (!produk) {
    return (
      <div className="py-16 text-center">
        <h1 className="font-display text-2xl font-semibold">Paket tidak ditemukan</h1>
        <p className="mt-1 text-ink-muted">Paket dengan ID {id} tidak ada di menu kami.</p>
        <Link to="/menu" className="btn-primary mt-5 inline-flex">Kembali ke Menu</Link>
      </div>
    );
  }

  const info = kategoriInfo[produk.kategori];
  const total = produk.harga * jumlah;
  const serupa = produkDummy.filter((p) => p.kategori === produk.kategori && p.id !== produk.id).slice(0, 3);
  const lainnya = serupa.length < 3
    ? [...serupa, ...produkDummy.filter((p) => p.kategori !== produk.kategori && p.tag === 'Terlaris' && p.id !== produk.id)].slice(0, 3)
    : serupa;

  const handleBeliSekarang = () => {
    tambahItem(produk, jumlah);
    navigate('/keranjang');
  };

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn-secondary mb-6 !py-2 text-sm">
        <ArrowLeft className="h-4 w-4" /> Kembali
      </button>

      <div className="grid gap-8 lg:grid-cols-[1.05fr_1fr] lg:gap-12">
        <div className="group lg:sticky lg:top-24 lg:self-start">
          <Piring
            kategori={produk.kategori}
            emoji={produk.emoji}
            ukuran="text-[7rem]"
            className="h-80 w-full rounded-[2rem] shadow-soft sm:h-[26rem]"
          />
        </div>

        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-xs font-bold uppercase tracking-wider ${info.teks}`}>{info.label}</span>
            {produk.tag && <span className="chip">{produk.tag}</span>}
            <span className="chip-leaf"><ShieldCheck className="h-3 w-3" /> Halal</span>
          </div>

          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">{produk.nama}</h1>

          <p className="mt-3 flex items-center gap-3 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1 font-bold text-ink dark:text-paper">
              <Star className="h-4 w-4 fill-saffron-400 text-saffron-400" /> {produk.rating}
            </span>
            · {produk.terjual.toLocaleString('id-ID')} terjual
          </p>

          <p className="mt-5 flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tabular-nums text-brand-700 dark:text-saffron-300">
              {formatRupiah(produk.harga)}
            </span>
            <span className="text-ink-muted">/ {produk.satuan}</span>
          </p>

          <p className="mt-4 leading-relaxed text-ink-soft dark:text-paper/80">{produk.deskripsi}</p>

          <div className="card mt-6 p-5">
            <h2 className="font-display text-lg font-semibold">Isi Paket</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {produk.menu.map((m) => (
                <li key={m} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-leaf-500" strokeWidth={2.5} />
                  {m}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 rounded-card bg-paper-dim p-5 dark:bg-white/5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wide text-ink-soft dark:text-paper/70">
                  Jumlah ({produk.satuan})
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">Minimal {produk.minPesan} · kelipatan {produk.langkah}</p>
              </div>
              <QtyStepper
                jumlah={jumlah}
                min={produk.minPesan}
                langkah={produk.langkah}
                onChange={(j) => setJumlah(Math.max(produk.minPesan, j))}
              />
            </div>
            <div className="mt-4 flex items-center justify-between border-t border-dashed border-ink/15 pt-4 dark:border-white/15">
              <span className="text-sm text-ink-soft dark:text-paper/70">Estimasi total</span>
              <span className="text-2xl font-extrabold tabular-nums">{formatRupiah(total)}</span>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <button onClick={() => tambahItem(produk, jumlah)} className="btn-secondary flex-1 !py-3">
              <ShoppingBasket className="h-4 w-4" /> Tambah ke Keranjang
            </button>
            <button onClick={handleBeliSekarang} className="btn-primary flex-1">
              Pesan Sekarang
            </button>
          </div>

          <ul className="mt-6 grid gap-3 text-sm text-ink-soft sm:grid-cols-2 dark:text-paper/70">
            <li className="flex items-center gap-2.5"><CalendarCheck className="h-4 w-4 text-brand-600 dark:text-saffron-300" /> Pesan minimal H-{MIN_HARI_PESAN} sebelum acara</li>
            <li className="flex items-center gap-2.5"><Truck className="h-4 w-4 text-brand-600 dark:text-saffron-300" /> Gratis ongkir di atas {formatRupiah(GRATIS_ONGKIR_MIN)}</li>
          </ul>
        </div>
      </div>

      {lainnya.length > 0 && (
        <section className="mt-20">
          <h2 className="section-title mb-6 !text-2xl">Mungkin Anda juga suka</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {lainnya.map((p) => (
              <PaketCard key={p.id} produk={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default DetailPaket;
