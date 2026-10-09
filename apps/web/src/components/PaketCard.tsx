import { Link } from 'react-router-dom';
import { Check, Plus, Star, Users } from 'lucide-react';
import type { Produk } from '../types';
import { formatRupiah } from '../utils/formatRupiah';
import { kategoriInfo } from '../utils/kategori';
import useCartStore from '../store/useCartStore';
import useToggle from '../hooks/useToggle';
import Piring from './Piring';

const PaketCard = ({ produk }: { produk: Produk }) => {
  const tambahItem = useCartStore((state) => state.tambahItem);
  const [berhasil, , setBerhasil] = useToggle(false);
  const info = kategoriInfo[produk.kategori];

  const handleTambah = () => {
    tambahItem(produk);
    setBerhasil(true);
    window.setTimeout(() => setBerhasil(false), 1400);
  };

  return (
    <article className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1.5 hover:shadow-lift">
      <Link to={`/menu/${produk.id}`} className="relative block" aria-label={`Lihat detail ${produk.nama}`}>
        <Piring kategori={produk.kategori} emoji={produk.emoji} className="h-44 w-full" />
        {produk.tag && (
          <span
            className={`absolute left-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide shadow-sm ${
              produk.tag === 'Terlaris'
                ? 'bg-brand-600 text-white'
                : produk.tag === 'Premium'
                  ? 'bg-ink text-saffron-300'
                  : 'bg-leaf-500 text-white'
            }`}
          >
            {produk.tag}
          </span>
        )}
        <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur dark:bg-black/50 dark:text-paper">
          <Star className="h-3 w-3 fill-saffron-400 text-saffron-400" /> {produk.rating}
        </span>
      </Link>

      <div className="flex flex-1 flex-col gap-2 p-5">
        <p className={`text-xs font-bold uppercase tracking-wider ${info.teks}`}>{info.label}</p>
        <Link to={`/menu/${produk.id}`}>
          <h3 className="font-display text-lg font-semibold leading-snug transition-colors group-hover:text-brand-600 dark:group-hover:text-saffron-300">
            {produk.nama}
          </h3>
        </Link>
        <p className="line-clamp-2 text-sm text-ink-muted">{produk.deskripsi}</p>

        <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-soft dark:text-paper/70">
          <Users className="h-3.5 w-3.5" /> Min. {produk.minPesan} {produk.satuan} · {produk.terjual.toLocaleString('id-ID')} terjual
        </p>

        <div className="mt-auto flex items-end justify-between gap-3 pt-3">
          <div>
            <p className="whitespace-nowrap text-xl font-extrabold tabular-nums text-brand-700 dark:text-saffron-300">
              {formatRupiah(produk.harga)}
            </p>
            <p className="text-xs text-ink-muted">/ {produk.satuan}</p>
          </div>
          <button
            onClick={handleTambah}
            aria-label={`Tambah ${produk.nama} ke keranjang`}
            className={`flex h-11 items-center gap-1.5 rounded-full px-4 text-sm font-bold transition active:scale-95 ${
              berhasil
                ? 'bg-leaf-500 text-white'
                : 'bg-brand-600 text-white shadow-lg shadow-brand-600/25 hover:bg-brand-700'
            }`}
          >
            {berhasil ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {berhasil ? 'Masuk' : 'Pesan'}
          </button>
        </div>
      </div>
    </article>
  );
};

export default PaketCard;
