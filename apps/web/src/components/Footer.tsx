import { Link } from 'react-router-dom';
import { Clock, MapPin, Phone, Mail } from 'lucide-react';
import Logo from './Logo';
import { daftarKategori } from '../utils/kategori';

const Footer = () => {
  return (
    <footer className="relative mt-16 overflow-hidden bg-brand-900 text-white">
      <div className="pattern-dots pointer-events-none absolute inset-0 opacity-40" />

      <div className="relative mx-auto grid max-w-6xl gap-8 px-5 py-10 md:grid-cols-3">
        {/* Brand + Menu */}
        <div>
          <div className="flex items-center gap-2.5">
            <Logo className="h-10 w-10" />
            <span className="font-display text-lg font-semibold">Rasa Nusa Catering</span>
          </div>
          <p className="mt-3 text-sm leading-relaxed text-white/70">
            Hidangan nusantara segar, diantar tepat waktu untuk setiap momen Anda.
          </p>
        </div>

        {/* Menu */}
        <div>
          <h4 className="font-display text-base font-semibold text-saffron-300">Menu Kami</h4>
          <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-white/75">
            {daftarKategori.map((k) => (
              <li key={k.value}>
                <Link to={`/menu?kategori=${k.value}`} className="transition hover:text-white">
                  {k.emoji} {k.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Kontak + Jam */}
        <div>
          <h4 className="font-display text-base font-semibold text-saffron-300">Hubungi Kami</h4>
          <ul className="mt-3 space-y-2 text-sm text-white/75">
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-300" />
              Jl. Melati Raya No. 21, Jakarta Selatan
            </li>
            <li className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 flex-shrink-0 text-saffron-300" />
              0812-0000-1234
            </li>
            <li className="flex items-center gap-2.5">
              <Mail className="h-4 w-4 flex-shrink-0 text-saffron-300" />
              halo@rasanusa.example
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 h-4 w-4 flex-shrink-0 text-saffron-300" />
              <span>
                Senin – Sabtu, 07.00 – 20.00
                <br />
                <span className="text-white/55">Minggu: pesanan terjadwal · Pesan min. H-2</span>
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="relative border-t border-white/10 px-5 py-4 text-center text-xs text-white/55">
        © {new Date().getFullYear()} Rasa Nusa Catering.semua menu, harga, dan pembayaran bersifat simulasi.
      </div>
    </footer>
  );
};

export default Footer;