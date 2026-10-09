import type { ReactNode } from 'react';
import Logo from './Logo';

interface AuthLayoutProps {
  judul: string;
  deskripsi: string;
  children: ReactNode;
  footer: ReactNode;
}

/** Layout dua kolom untuk Login & Daftar: panel visual di kiri, form di kanan. */
const AuthLayout = ({ judul, deskripsi, children, footer }: AuthLayoutProps) => (
  <div className="mx-auto grid max-w-4xl overflow-hidden rounded-[2rem] shadow-lift md:grid-cols-[1fr_1.1fr]">
    <div className="pattern-dots relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-brand-500 p-10 text-white md:flex">
      <div className="pointer-events-none absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-saffron-300/30 blur-3xl" />
      <Logo className="h-12 w-12" />
      <div className="relative">
        <p className="text-6xl" aria-hidden="true">🍛 🍗 🥗</p>
        <h2 className="mt-6 text-3xl font-semibold leading-tight">Hangatnya masakan rumah, untuk setiap acara.</h2>
        <p className="mt-3 text-sm text-white/80">
          Pesan nasi box, tumpeng, hingga prasmanan pernikahan dalam beberapa klik.
        </p>
      </div>
    </div>

    <div className="bg-surface p-7 sm:p-10 dark:bg-surface-dark">
      <h1 className="text-3xl font-semibold">{judul}</h1>
      <p className="mt-2 text-sm text-ink-muted">{deskripsi}</p>
      <div className="mt-7">{children}</div>
      <div className="mt-6 space-y-2 text-center text-sm text-ink-muted">{footer}</div>
    </div>
  </div>
);

export default AuthLayout;
