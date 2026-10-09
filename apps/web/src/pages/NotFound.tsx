import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="py-20 text-center">
      <p className="text-7xl" aria-hidden="true">🍽️</p>
      <p className="mt-4 font-display text-6xl font-semibold text-brand-600/30 dark:text-saffron-300/30">404</p>
      <h1 className="mt-2 text-2xl font-semibold">Hidangan yang Anda cari tidak ada di meja ini</h1>
      <p className="mt-2 text-ink-muted">Halaman tidak ditemukan atau sudah dipindahkan.</p>
      <Link to="/" className="btn-primary mt-6 inline-flex">Kembali ke Beranda</Link>
    </div>
  );
};

export default NotFound;
