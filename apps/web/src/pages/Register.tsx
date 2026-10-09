import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import AuthLayout from '../components/AuthLayout';
import Field from '../components/Field';

interface FormDaftar {
  nama: string;
  email: string;
  password: string;
  konfirmasiPassword: string;
}

interface LocationState {
  from?: { pathname: string };
}

const Register = () => {
  const [form, setForm] = useState<FormDaftar>({ nama: '', email: '', password: '', konfirmasiPassword: '' });
  const [tampilkanPassword, setTampilkanPassword] = useState(false);
  const [errorForm, setErrorForm] = useState('');

  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const location = useLocation();

  const tujuanAsal = (location.state as LocationState | null)?.from?.pathname ?? '/';

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { nama, email, password, konfirmasiPassword } = form;

    if (!nama.trim() || !email.trim() || !password || !konfirmasiPassword) {
      setErrorForm('Semua field wajib diisi.');
      return;
    }
    if (!email.includes('@')) {
      setErrorForm('Format email tidak valid.');
      return;
    }
    if (password.length < 6) {
      setErrorForm('Password minimal 6 karakter.');
      return;
    }
    if (password !== konfirmasiPassword) {
      setErrorForm('Konfirmasi password tidak cocok.');
      return;
    }

    setErrorForm('');
    // Simulasi registrasi — langsung login. Di aplikasi asli, panggil API register.
    login(nama, email);
    navigate(tujuanAsal, { replace: true });
  };

  return (
    <AuthLayout
      judul="Buat akun baru"
      deskripsi="Simulasi registrasi sederhana — data tidak benar-benar dikirim ke server."
      footer={
        <p>
          Sudah punya akun?{' '}
          <Link to="/login" className="font-bold text-brand-600 hover:underline dark:text-saffron-300">
            Masuk di sini
          </Link>
        </p>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
        <Field label="Nama lengkap" htmlFor="nama">
          <input id="nama" name="nama" value={form.nama} onChange={handleChange} placeholder="Contoh: Sinta Dewi" autoComplete="name" className="input-field" />
        </Field>
        <Field label="Email" htmlFor="email">
          <input id="email" name="email" value={form.email} onChange={handleChange} placeholder="nama@email.com" type="email" autoComplete="email" className="input-field" />
        </Field>
        <Field label="Password" htmlFor="password">
          <div className="relative">
            <input
              id="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Minimal 6 karakter"
              type={tampilkanPassword ? 'text' : 'password'}
              autoComplete="new-password"
              className="input-field pr-11"
            />
            <button
              type="button"
              onClick={() => setTampilkanPassword((prev) => !prev)}
              aria-label={tampilkanPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink dark:hover:text-paper"
            >
              {tampilkanPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </Field>
        <Field label="Konfirmasi password" htmlFor="konfirmasiPassword">
          <input
            id="konfirmasiPassword"
            name="konfirmasiPassword"
            value={form.konfirmasiPassword}
            onChange={handleChange}
            placeholder="Ulangi password"
            type={tampilkanPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="input-field"
          />
        </Field>

        {errorForm && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{errorForm}</p>}

        <button type="submit" className="btn-primary mt-1">Daftar</button>
      </form>
    </AuthLayout>
  );
};

export default Register;
