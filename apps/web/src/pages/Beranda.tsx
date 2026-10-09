import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CalendarCheck,
  ClipboardList,
  CreditCard,
  Leaf,
  PartyPopper,
  Quote,
  ShieldCheck,
  Star,
  Truck,
  type LucideIcon,
} from 'lucide-react';
import { produkDummy } from '../data/produkDummy';
import { daftarKategori } from '../utils/kategori';
import PaketCard from '../components/PaketCard';
import HeroCarousel from '../components/HeroCarousel';

const keunggulan: { Icon: LucideIcon; judul: string; teks: string }[] = [
  { Icon: Leaf, judul: 'Bahan Segar Harian', teks: 'Belanja pagi, masak pagi, tanpa pengawet.' },
  { Icon: ShieldCheck, judul: '100% Halal & Higienis', teks: 'Dapur bersertifikat, chef berseragam lengkap.' },
  { Icon: Truck, judul: 'Antar Tepat Waktu', teks: 'Armada sendiri, garansi telat diganti diskon.' },
  { Icon: PartyPopper, judul: 'Fleksibel Sesuai Acara', teks: 'Menu bisa disesuaikan budget & selera tamu.' },
];

const caraPesan: { Icon: LucideIcon; judul: string; teks: string }[] = [
  { Icon: ClipboardList, judul: 'Pilih Paket', teks: 'Telusuri menu dan tentukan jumlah porsi sesuai tamu.' },
  { Icon: CalendarCheck, judul: 'Tentukan Jadwal', teks: 'Isi tanggal, jam, dan alamat acara (minimal H-2).' },
  { Icon: CreditCard, judul: 'Bayar Aman', teks: 'Transfer, e-wallet, atau QRIS — konfirmasi instan.' },
  { Icon: Truck, judul: 'Makanan Tiba', teks: 'Kami antar hangat dan rapi, tinggal dinikmati.' },
];

const testimoni = [
  {
    nama: 'Bu Ratna',
    peran: 'Panitia arisan keluarga',
    teks: 'Tumpeng-nya cantik banget dan rasanya enak, semua tamu minta nambah. Antarnya juga on time!',
  },
  {
    nama: 'Dimas P.',
    peran: 'Office manager, startup fintech',
    teks: 'Langganan nasi box buat rapat bulanan. Porsi pas, tidak pernah telat, dan rendangnya juara.',
  },
  {
    nama: 'Sinta & Aldi',
    peran: 'Pengantin, Maret lalu',
    teks: 'Prasmanan wedding-nya bikin tamu puas. Tim pelayannya sigap dan ramah. Terima kasih Rasa Nusa!',
  },
];

const Beranda = () => {
  const terlaris = produkDummy.filter((p) => p.tag === 'Terlaris').slice(0, 4);

  return (
    <div className="space-y-20">
      <HeroCarousel />

      {/* Keunggulan */}
      <section aria-label="Keunggulan kami" className="-mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {keunggulan.map(({ Icon, judul, teks }) => (
          <div key={judul} className="card flex items-start gap-4 p-5">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 dark:bg-brand-400/10 dark:text-saffron-300">
              <Icon className="h-6 w-6" strokeWidth={1.75} />
            </span>
            <div>
              <h3 className="font-display text-base font-semibold">{judul}</h3>
              <p className="mt-1 text-sm text-ink-muted">{teks}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Kategori */}
      <section>
        <div className="mb-8 max-w-xl">
          <p className="eyebrow">Pilihan Hidangan</p>
          <h2 className="section-title mt-3">Apa yang Anda butuhkan untuk acara ini?</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {daftarKategori.map((k) => (
            <Link
              key={k.value}
              to={`/menu?kategori=${k.value}`}
              className={`group relative overflow-hidden rounded-card bg-gradient-to-br ${k.gradient} p-5 transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-6`}
            >
              <span className="block text-5xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 sm:text-6xl">
                {k.emoji}
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold text-ink dark:text-paper">{k.label}</h3>
              <p className="mt-1 text-sm text-ink-soft dark:text-paper/70">{k.ringkas}</p>
              <ArrowRight className="absolute bottom-5 right-5 h-5 w-5 text-ink/50 transition group-hover:translate-x-1 group-hover:text-ink dark:text-paper/50" />
            </Link>
          ))}
        </div>
      </section>

      {/* Terlaris */}
      <section>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-xl">
            <p className="eyebrow">Paling Dicari</p>
            <h2 className="section-title mt-3">Paket Terlaris Bulan Ini</h2>
          </div>
          <Link to="/menu" className="btn-secondary">
            Lihat semua menu <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {terlaris.map((p) => (
            <PaketCard key={p.id} produk={p} />
          ))}
        </div>
      </section>

      {/* Cara pesan */}
      <section className="relative overflow-hidden rounded-[2rem] bg-ink px-6 py-14 text-paper sm:px-12 dark:bg-surface-dark">
        <div className="pattern-dots pointer-events-none absolute inset-0 opacity-30" />
        <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand-500/30 blur-3xl" />
        <div className="relative">
          <p className="eyebrow !text-saffron-300">Cara Pesan</p>
          <h2 className="section-title mt-3 max-w-lg">Pesan dalam 4 langkah mudah</h2>
          <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {caraPesan.map(({ Icon, judul, teks }, i) => (
              <li key={judul} className="relative">
                <span className="font-display text-6xl font-bold text-white/10">0{i + 1}</span>
                <span className="-mt-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-saffron-400 text-ink">
                  <Icon className="h-6 w-6" strokeWidth={1.75} />
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold">{judul}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-paper/70">{teks}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Testimoni */}
      <section>
        <div className="mb-8 max-w-xl">
          <p className="eyebrow">Kata Pelanggan</p>
          <h2 className="section-title mt-3">Dipercaya untuk ribuan acara</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimoni.map((t) => (
            <figure key={t.nama} className="card relative p-6">
              <Quote className="absolute right-5 top-5 h-8 w-8 text-saffron-200 dark:text-saffron-400/25" />
              <div className="flex gap-0.5" aria-label="Bintang 5 dari 5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-saffron-400 text-saffron-400" />
                ))}
              </div>
              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-soft dark:text-paper/80">
                “{t.teks}”
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-display text-base font-bold text-brand-700 dark:bg-brand-400/20 dark:text-saffron-300">
                  {t.nama[0]}
                </span>
                <span>
                  <span className="block text-sm font-bold">{t.nama}</span>
                  <span className="block text-xs text-ink-muted">{t.peran}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-brand-700 to-brand-500 px-6 py-14 text-center text-white sm:px-12">
        <div className="pattern-dots pointer-events-none absolute inset-0" />
        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl font-semibold sm:text-4xl">Acara Anda sebentar lagi. Urusan makanan, serahkan ke kami.</h2>
          <p className="mt-3 text-white/85">Pesan minimal H-2 dan nikmati hidangan hangat langsung di lokasi acara.</p>
          <Link to="/menu" className="btn-gold mt-7 inline-flex">
            Pesan Sekarang <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Beranda;
