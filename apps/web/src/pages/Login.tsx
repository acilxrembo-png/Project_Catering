import { useState, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import useAuthStore from '../store/useAuthStore';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';

interface LocationState {
  from?: { pathname: string };
}

const Login = () => {
  const [nama, setNama] = useState('');
  const [email, setEmail] = useState('');
  const [errorForm, setErrorForm] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const tujuanAsal = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!nama.trim() || !email.trim()) {
      setErrorForm('Nama dan email wajib diisi.');
      return;
    }
    if (!email.includes('@')) {
      setErrorForm('Format email tidak valid.');
      return;
    }
    login(nama, email);
    navigate(tujuanAsal, { replace: true });
  };

  return (
    <AuthLayout
      judul="Selamat datang kembali"
      deskripsi="Simulasi login sederhana — cukup isi nama & email, tidak ada validasi password sungguhan."
      footer={
        <>
          <p>
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-brand-600 hover:underline dark:text-saffron-300">
              Daftar di sini
            </Link>
          </p>
          <p><Link to="/" className="hover:underline">← Kembali ke Beranda</Link></p>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Nama lengkap" htmlFor="nama">
          <input id="nama" value={nama} onChange={(e) => setNama(e.target.value)} placeholder="Contoh: Sinta Dewi" autoComplete="name" className="input-field" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama@email.com" type="email" autoComplete="email" className="input-field" />
        </Field>
        {errorForm && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{errorForm}</p>}
        <button type="submit" className="btn-primary mt-1">Masuk</button>
      </form>
    </AuthLayout>
  );
};

export default Login;
