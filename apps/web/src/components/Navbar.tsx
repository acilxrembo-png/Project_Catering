import { useEffect } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, ShoppingBasket, X, LogOut } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import useCartStore from '../store/useCartStore';
import useToggle from '../hooks/useToggle';
import ThemeToggle from './ThemeToggle';
import Logo from './Logo';

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `relative py-1 text-sm font-semibold transition ${
    isActive
      ? 'text-brand-600 dark:text-saffron-300 after:absolute after:-bottom-1 after:left-0 after:h-0.5 after:w-full after:rounded-full after:bg-current'
      : 'text-ink-soft hover:text-ink dark:text-paper/70 dark:hover:text-paper'
  }`;

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `rounded-xl px-4 py-3 text-base font-semibold transition ${
    isActive
      ? 'bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-saffron-300'
      : 'text-ink-soft hover:bg-paper-dim dark:text-paper/80 dark:hover:bg-white/5'
  }`;

const Navbar = () => {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const jumlahPaket = useCartStore((state) => state.items.length);
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [menuTerbuka, toggleMenu, setMenuTerbuka] = useToggle(false);

  // Tutup menu mobile setiap pindah halaman
  useEffect(() => setMenuTerbuka(false), [pathname, setMenuTerbuka]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 border-b border-ink/8 bg-paper/85 backdrop-blur-xl dark:border-white/8 dark:bg-[#17100D]/85">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <Logo className="h-10 w-10 drop-shadow-sm" />
          <span className="leading-none">
            <span className="block font-display text-xl font-semibold text-ink dark:text-paper">
              Rasa Nusa
            </span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.28em] text-brand-600 dark:text-saffron-300">
              Catering
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Navigasi utama">
          <NavLink to="/" end className={navLinkClass}>Beranda</NavLink>
          <NavLink to="/menu" className={navLinkClass}>Menu & Paket</NavLink>
          {user && <NavLink to="/pesanan-saya" className={navLinkClass}>Pesanan Saya</NavLink>}
        </nav>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />

          <Link
            to="/keranjang"
            aria-label={`Keranjang, ${jumlahPaket} paket`}
            className="relative flex h-10 items-center gap-2 rounded-full border border-ink/12 bg-surface px-3.5 text-sm font-semibold transition hover:border-brand-400 dark:border-white/12 dark:bg-surface-dark"
          >
            <ShoppingBasket className="h-[18px] w-[18px]" />
            <span className="hidden sm:inline">Keranjang</span>
            {jumlahPaket > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {jumlahPaket}
              </span>
            )}
          </Link>

          {user ? (
            <div className="hidden items-center gap-2 md:flex">
              <span className="hidden max-w-[120px] truncate text-sm text-ink-muted lg:inline">
                Hai, {user.nama.split(' ')[0]}
              </span>
              <button onClick={handleLogout} className="btn-secondary !px-3.5 !py-2 text-xs" title="Keluar">
                <LogOut className="h-3.5 w-3.5" /> Keluar
              </button>
            </div>
          ) : (
            <Link to="/login" className="btn-primary hidden !px-5 !py-2.5 md:inline-flex">
              Masuk
            </Link>
          )}

          <button
            onClick={toggleMenu}
            aria-label={menuTerbuka ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={menuTerbuka}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-ink/12 bg-surface md:hidden dark:border-white/12 dark:bg-surface-dark"
          >
            {menuTerbuka ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {menuTerbuka && (
        <nav className="mx-auto flex max-w-6xl animate-fade-up flex-col gap-1 border-t border-ink/8 px-5 pb-4 pt-3 md:hidden dark:border-white/8" aria-label="Navigasi seluler">
          <NavLink to="/" end className={mobileLinkClass}>Beranda</NavLink>
          <NavLink to="/menu" className={mobileLinkClass}>Menu & Paket</NavLink>
          {user && <NavLink to="/pesanan-saya" className={mobileLinkClass}>Pesanan Saya</NavLink>}
          {user ? (
            <button onClick={handleLogout} className="btn-secondary mt-2">
              <LogOut className="h-4 w-4" /> Keluar ({user.nama.split(' ')[0]})
            </button>
          ) : (
            <Link to="/login" className="btn-primary mt-2">Masuk</Link>
          )}
        </nav>
      )}
    </header>
  );
};

export default Navbar;
