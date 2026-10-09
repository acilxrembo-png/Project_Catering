import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, SearchX, X } from 'lucide-react';
import useDebounce from '../hooks/useDebounce';
import useFetchProduk from '../hooks/useFetchProduk';
import PaketCard from '../components/PaketCard';
import { filterKategori, isKategori } from '../utils/kategori';
import type { KategoriFilter } from '../types';

const Menu = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [kataKunci, setKataKunci] = useState(searchParams.get('cari') ?? '');
  const kategoriParam = searchParams.get('kategori');
  const kategori: KategoriFilter = isKategori(kategoriParam) ? kategoriParam : 'semua';

  const kataKunciDebounced = useDebounce(kataKunci, 350);
  const { data: produk, loading, error } = useFetchProduk({
    kataKunci: kataKunciDebounced,
    kategori,
  });

  const ubahParam = (kunci: string, nilai: string | null) => {
    setSearchParams(
      (prev) => {
        const params = new URLSearchParams(prev);
        if (nilai) params.set(kunci, nilai);
        else params.delete(kunci);
        return params;
      },
      { replace: true }
    );
  };

  const handleCari = (nilai: string) => {
    setKataKunci(nilai);
    ubahParam('cari', nilai || null);
  };

  return (
    <div>
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow">Menu & Paket</p>
        <h1 className="section-title mt-3">Pilih hidangan untuk acara Anda</h1>
        <p className="mt-3 text-ink-muted">
          Semua paket dimasak segar di hari acara. Harga per porsi, dengan minimal pemesanan sesuai jenis hidangan.
        </p>
      </header>

      <div className="sticky top-[65px] z-20 -mx-5 mb-8 border-y border-ink/8 bg-paper/90 px-5 py-4 backdrop-blur-xl dark:border-white/8 dark:bg-[#17100D]/90">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative lg:w-80">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
            <input
              value={kataKunci}
              onChange={(e) => handleCari(e.target.value)}
              placeholder="Cari rendang, tumpeng, es kopi…"
              aria-label="Cari menu"
              className="input-field !rounded-full pl-11 pr-10"
            />
            {kataKunci && (
              <button
                onClick={() => handleCari('')}
                aria-label="Hapus pencarian"
                className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-ink-muted hover:bg-paper-dim hover:text-ink dark:hover:bg-white/10"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 lg:pb-0" role="tablist" aria-label="Filter kategori">
            {filterKategori.map((k) => {
              const aktif = kategori === k.value;
              return (
                <button
                  key={k.value}
                  role="tab"
                  aria-selected={aktif}
                  onClick={() => ubahParam('kategori', k.value === 'semua' ? null : k.value)}
                  className={`flex-shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    aktif
                      ? 'border-brand-600 bg-brand-600 text-white shadow-md shadow-brand-600/25'
                      : 'border-ink/12 bg-surface text-ink-soft hover:border-brand-400 hover:text-brand-700 dark:border-white/12 dark:bg-surface-dark dark:text-paper/80'
                  }`}
                >
                  {k.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading && (
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true" aria-label="Memuat menu">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="card h-[22rem] animate-pulse overflow-hidden">
              <div className="h-44 bg-paper-dim dark:bg-white/5" />
              <div className="space-y-3 p-5">
                <div className="h-3 w-1/3 rounded-full bg-paper-dim dark:bg-white/10" />
                <div className="h-5 w-3/4 rounded-full bg-paper-dim dark:bg-white/10" />
                <div className="h-3 w-full rounded-full bg-paper-dim dark:bg-white/10" />
              </div>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && produk.length === 0 && (
        <div className="py-16 text-center">
          <SearchX className="mx-auto h-12 w-12 text-ink-muted" strokeWidth={1.25} />
          <h2 className="mt-3 font-display text-2xl font-semibold">Menu tidak ditemukan</h2>
          <p className="mt-1 text-ink-muted">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
          <button onClick={() => { setKataKunci(''); setSearchParams({}, { replace: true }); }} className="btn-secondary mt-5">
            Reset filter
          </button>
        </div>
      )}

      {!loading && produk.length > 0 && (
        <>
          <p className="mb-4 text-sm text-ink-muted">{produk.length} paket tersedia</p>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {produk.map((item) => (
              <PaketCard key={item.id} produk={item} />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default Menu;
