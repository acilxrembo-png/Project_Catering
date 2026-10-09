import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import { ArrowRight, type LucideIcon, Truck, ChefHat, BadgePercent } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/pagination';

interface Slide {
  key: string;
  bg: string;
  glow: string;
  Icon: LucideIcon;
  tag: string;
  judul: string;
  deskripsi: string;
  cta: string;
  to: string;
  piring: string[];
}

const slides: Slide[] = [
  {
    key: 'segar',
    bg: 'bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500',
    glow: 'bg-saffron-300/30',
    Icon: ChefHat,
    tag: 'Dimasak Segar Setiap Hari',
    judul: 'Hidangan Nusantara untuk Setiap Momen Berharga',
    deskripsi:
      'Dari rapat kantor hingga pernikahan impian — chef kami memasak dengan bumbu asli dan bahan segar pilihan, diantar tepat waktu.',
    cta: 'Lihat Menu & Paket',
    to: '/menu',
    piring: ['🍛', '🍗', '🥗'],
  },
  {
    key: 'tumpeng',
    bg: 'bg-gradient-to-br from-leaf-900 via-leaf-700 to-leaf-500',
    glow: 'bg-saffron-300/25',
    Icon: BadgePercent,
    tag: 'Spesial Syukuran',
    judul: 'Tumpeng Cantik Lengkap dengan 8 Lauk Tradisional',
    deskripsi:
      'Rayakan ulang tahun, aqiqah, atau peresmian dengan tumpeng nasi kuning berhias sayur ukir. Mulai dari Rp 650.000.',
    cta: 'Pesan Tumpeng',
    to: '/menu?kategori=tumpeng',
    piring: ['🍚', '🎉', '🌶️'],
  },
  {
    key: 'antar',
    bg: 'bg-gradient-to-br from-[#3A2118] via-[#5A2E1F] to-[#8A4527]',
    glow: 'bg-brand-400/30',
    Icon: Truck,
    tag: 'Gratis Ongkir',
    judul: 'Gratis Antar untuk Pesanan di Atas Rp 1,5 Juta',
    deskripsi:
      'Armada berpendingin dan tim pengantar berseragam memastikan makanan tiba hangat, rapi, dan tepat jam acara.',
    cta: 'Mulai Pesan',
    to: '/menu',
    piring: ['🍱', '🧋', '🍰'],
  },
];

const HeroCarousel = () => {
  return (
    // translateZ(0) membuat compositing layer baru supaya sudut membulat tetap ter-clip saat slide bergeser.
    <div className="overflow-hidden rounded-[2rem] shadow-lift [transform:translateZ(0)]">
      <Swiper
        modules={[Autoplay, Pagination]}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        className="hero-swiper h-[520px] sm:h-[460px]"
      >
        {slides.map(({ key, bg, glow, Icon, tag, judul, deskripsi, cta, to, piring }) => (
          <SwiperSlide key={key} className="h-full">
            <section className={`pattern-dots relative flex h-full items-center overflow-hidden ${bg} px-7 py-10 text-white sm:px-14`}>
              <div className={`pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full ${glow} blur-3xl`} />
              <div className="pointer-events-none absolute -bottom-24 left-1/3 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

              <div className="relative z-10 max-w-xl">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/12 py-1.5 pl-1.5 pr-4 text-xs font-bold uppercase tracking-wider ring-1 ring-inset ring-white/25 backdrop-blur">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-saffron-400 text-ink">
                    <Icon className="h-3.5 w-3.5" />
                  </span>
                  {tag}
                </p>
                <h1 className="mt-5 text-[2rem] font-semibold leading-[1.1] sm:text-5xl">{judul}</h1>
                <p className="mt-4 max-w-md text-sm leading-relaxed text-white/85 sm:text-base">{deskripsi}</p>
                <Link to={to} className="btn-gold mt-7 inline-flex w-fit">
                  {cta} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>

              {/* Ilustrasi piring melayang — disembunyikan di layar kecil */}
              <div className="pointer-events-none absolute right-10 top-1/2 hidden -translate-y-1/2 lg:block" aria-hidden="true">
                <div className="relative h-[340px] w-[340px]">
                  <div className="absolute inset-0 rounded-full bg-white/15 ring-1 ring-white/30 backdrop-blur-sm" />
                  <div className="absolute inset-5 rounded-full bg-white/90 shadow-2xl dark:bg-white/85" />
                  <span className="absolute inset-0 flex animate-float items-center justify-center text-[9rem] drop-shadow-xl">
                    {piring[0]}
                  </span>
                  <span className="absolute -left-6 bottom-8 animate-float-slow rounded-full bg-white p-4 text-5xl shadow-xl">{piring[1]}</span>
                  <span className="absolute -right-4 top-4 animate-float rounded-full bg-white p-4 text-4xl shadow-xl">{piring[2]}</span>
                </div>
              </div>
            </section>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};

export default HeroCarousel;
