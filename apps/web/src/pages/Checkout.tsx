import { useState, type ChangeEvent, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Landmark, QrCode, Smartphone, type LucideIcon } from 'lucide-react';
import useCartStore from '../store/useCartStore';
import useAuthStore from '../store/useAuthStore';
import useOrderStore from '../store/useOrderStore';
import usePembayaran from '../hooks/usePembayaran';
import StepIndicator from '../components/StepIndicator';
import Field from '../components/Field';
import { formatRupiah, formatTanggalPanjang } from '../utils/formatRupiah';
import { hitungOngkir, hitungSubtotal, tanggalPalingAwal, MIN_HARI_PESAN } from '../utils/biaya';
import type { Alamat, DetailAcara, MetodePembayaran } from '../types';

const metodePembayaranList: { value: MetodePembayaran; label: string; info: string; Icon: LucideIcon }[] = [
  { value: 'transfer-bank', label: 'Transfer Bank (Virtual Account)', info: 'BCA, Mandiri, BNI, BRI', Icon: Landmark },
  { value: 'e-wallet', label: 'E-Wallet', info: 'OVO, GoPay, Dana, ShopeePay', Icon: Smartphone },
  { value: 'qris', label: 'QRIS', info: 'Scan dengan aplikasi bank / e-wallet apa pun', Icon: QrCode },
];

const Checkout = () => {
  const navigate = useNavigate();
  const items = useCartStore((state) => state.items);
  const kosongkanKeranjang = useCartStore((state) => state.kosongkanKeranjang);
  const user = useAuthStore((state) => state.user);
  const tambahPesanan = useOrderStore((state) => state.tambahPesanan);
  const { proses, status, error } = usePembayaran();

  const [langkah, setLangkah] = useState<1 | 2 | 3>(1);
  const [alamat, setAlamat] = useState<Alamat>({
    namaPenerima: user?.nama ?? '',
    telepon: '',
    alamatLengkap: '',
    kota: '',
    kodePos: '',
  });
  const [acara, setAcara] = useState<DetailAcara>({ tanggal: '', jam: '12:00', catatan: '' });
  const [metodePembayaran, setMetodePembayaran] = useState<MetodePembayaran>('transfer-bank');
  const [errorForm, setErrorForm] = useState('');

  const subtotal = hitungSubtotal(items);
  const ongkir = hitungOngkir(subtotal);
  const total = subtotal + ongkir;
  const tanggalMin = tanggalPalingAwal();

  if (items.length === 0 && status !== 'sukses') {
    return (
      <div className="py-20 text-center">
        <p className="text-6xl" aria-hidden="true">🧺</p>
        <h1 className="mt-4 text-3xl font-semibold">Keranjang kosong</h1>
        <p className="mt-2 text-ink-muted">Tidak ada paket untuk di-checkout.</p>
        <Link to="/menu" className="btn-primary mt-6 inline-flex">Pilih Menu Dulu</Link>
      </div>
    );
  }

  const handleAlamatChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAlamat((prev) => ({ ...prev, [name]: value }));
  };

  const handleAcaraChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setAcara((prev) => ({ ...prev, [name]: value }));
  };

  const handleLanjutKePembayaran = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { namaPenerima, telepon, alamatLengkap, kota, kodePos } = alamat;
    if (!namaPenerima.trim() || !telepon.trim() || !alamatLengkap.trim() || !kota.trim() || !kodePos.trim()) {
      setErrorForm('Semua field alamat wajib diisi.');
      return;
    }
    if (!/^[0-9+\-\s]{9,16}$/.test(telepon)) {
      setErrorForm('Nomor telepon tidak valid.');
      return;
    }
    if (!acara.tanggal || !acara.jam) {
      setErrorForm('Tanggal dan jam acara wajib diisi.');
      return;
    }
    if (acara.tanggal < tanggalMin) {
      setErrorForm(`Pemesanan minimal H-${MIN_HARI_PESAN} sebelum acara.`);
      return;
    }
    setErrorForm('');
    setLangkah(2);
  };

  const handleBayar = async () => {
    await proses({ metodePembayaran });
    const pesananBaru = tambahPesanan({ items, alamat, acara, metodePembayaran, subtotal, ongkir, total });
    kosongkanKeranjang();
    navigate(`/pesanan-sukses/${pesananBaru.id}`);
  };

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="mb-2 text-3xl font-semibold sm:text-4xl">Checkout</h1>
      <p className="mb-8 text-ink-muted">Selesaikan pesanan Anda dalam 3 langkah.</p>
      <StepIndicator langkahAktif={langkah} />

      <div className="grid items-start gap-8 lg:grid-cols-[1fr_340px]">
        <div>
          {langkah === 1 && (
            <form onSubmit={handleLanjutKePembayaran} className="card space-y-5 p-6 sm:p-8" noValidate>
              <div>
                <h2 className="font-display text-xl font-semibold">Jadwal Acara</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Tanggal acara" htmlFor="tanggal" petunjuk={`Paling cepat ${formatTanggalPanjang(tanggalMin)}`}>
                    <input id="tanggal" name="tanggal" type="date" min={tanggalMin} value={acara.tanggal} onChange={handleAcaraChange} className="input-field" />
                  </Field>
                  <Field label="Jam antar" htmlFor="jam">
                    <input id="jam" name="jam" type="time" value={acara.jam} onChange={handleAcaraChange} className="input-field" />
                  </Field>
                </div>
              </div>

              <div className="border-t border-dashed border-ink/15 pt-5 dark:border-white/15">
                <h2 className="font-display text-xl font-semibold">Alamat Pengantaran</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                  <Field label="Nama penerima" htmlFor="namaPenerima">
                    <input id="namaPenerima" name="namaPenerima" value={alamat.namaPenerima} onChange={handleAlamatChange} placeholder="Nama penerima" autoComplete="name" className="input-field" />
                  </Field>
                  <Field label="Nomor telepon / WhatsApp" htmlFor="telepon">
                    <input id="telepon" name="telepon" value={alamat.telepon} onChange={handleAlamatChange} placeholder="0812xxxxxxx" inputMode="tel" autoComplete="tel" className="input-field" />
                  </Field>
                  <Field label="Alamat lengkap" htmlFor="alamatLengkap" className="sm:col-span-2">
                    <textarea id="alamatLengkap" name="alamatLengkap" value={alamat.alamatLengkap} onChange={handleAlamatChange} placeholder="Nama gedung / jalan, nomor, RT/RW, patokan" rows={3} className="input-field resize-none" />
                  </Field>
                  <Field label="Kota" htmlFor="kota">
                    <input id="kota" name="kota" value={alamat.kota} onChange={handleAlamatChange} placeholder="Kota" className="input-field" />
                  </Field>
                  <Field label="Kode pos" htmlFor="kodePos">
                    <input id="kodePos" name="kodePos" value={alamat.kodePos} onChange={handleAlamatChange} placeholder="Kode pos" inputMode="numeric" className="input-field" />
                  </Field>
                  <Field label="Catatan untuk dapur (opsional)" htmlFor="catatan" className="sm:col-span-2">
                    <textarea id="catatan" name="catatan" value={acara.catatan} onChange={handleAcaraChange} placeholder="Mis. tanpa pedas, ada tamu alergi kacang, minta tambahan sambal" rows={2} className="input-field resize-none" />
                  </Field>
                </div>
              </div>

              {errorForm && <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-700 dark:bg-red-500/10 dark:text-red-300">{errorForm}</p>}

              <button type="submit" className="btn-primary w-full">Lanjut ke Pembayaran</button>
            </form>
          )}

          {langkah === 2 && (
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Pilih Metode Pembayaran</h2>
              <div className="mt-5 space-y-3" role="radiogroup" aria-label="Metode pembayaran">
                {metodePembayaranList.map((m) => {
                  const aktif = metodePembayaran === m.value;
                  return (
                    <label
                      key={m.value}
                      className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 p-4 transition ${
                        aktif
                          ? 'border-brand-600 bg-brand-50 dark:bg-brand-400/10'
                          : 'border-ink/10 hover:border-brand-300 dark:border-white/10'
                      }`}
                    >
                      <input
                        type="radio"
                        name="metodePembayaran"
                        value={m.value}
                        checked={aktif}
                        onChange={() => setMetodePembayaran(m.value)}
                        className="h-4 w-4 accent-brand-600"
                      />
                      <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-sm dark:bg-white/10 dark:text-saffron-300">
                        <m.Icon className="h-5 w-5" strokeWidth={1.75} />
                      </span>
                      <span>
                        <span className="block text-sm font-bold">{m.label}</span>
                        <span className="block text-xs text-ink-muted">{m.info}</span>
                      </span>
                    </label>
                  );
                })}
              </div>

              <div className="mt-7 flex gap-3">
                <button onClick={() => setLangkah(1)} className="btn-secondary">
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </button>
                <button onClick={() => setLangkah(3)} className="btn-primary flex-1">Lanjut ke Konfirmasi</button>
              </div>
            </div>
          )}

          {langkah === 3 && (
            <div className="card p-6 sm:p-8">
              <h2 className="font-display text-xl font-semibold">Konfirmasi Pesanan</h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl bg-paper-dim p-4 dark:bg-white/5">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">
                    <CalendarDays className="h-3.5 w-3.5" /> Jadwal acara
                  </p>
                  <p className="text-sm font-semibold">{formatTanggalPanjang(acara.tanggal)}</p>
                  <p className="text-sm">Diantar pukul {acara.jam} WIB</p>
                  {acara.catatan && <p className="mt-2 text-xs italic text-ink-muted">“{acara.catatan}”</p>}
                </div>
                <div className="rounded-2xl bg-paper-dim p-4 dark:bg-white/5">
                  <p className="mb-1.5 text-xs font-bold uppercase tracking-wide text-ink-muted">Dikirim ke</p>
                  <p className="text-sm font-semibold">{alamat.namaPenerima} · {alamat.telepon}</p>
                  <p className="text-sm">{alamat.alamatLengkap}, {alamat.kota} {alamat.kodePos}</p>
                </div>
              </div>

              <p className="mt-4 text-sm text-ink-muted">
                Pembayaran via <span className="font-bold text-ink dark:text-paper">{metodePembayaranList.find((m) => m.value === metodePembayaran)?.label}</span>
              </p>

              {error && <p role="alert" className="mt-4 text-sm text-red-600">{error}</p>}

              <div className="mt-7 flex gap-3">
                <button onClick={() => setLangkah(2)} disabled={status === 'memproses'} className="btn-secondary">
                  <ArrowLeft className="h-4 w-4" /> Kembali
                </button>
                <button onClick={handleBayar} disabled={status === 'memproses'} className="btn-primary flex-1">
                  {status === 'memproses' ? 'Memproses pembayaran…' : `Bayar ${formatRupiah(total)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        <aside className="card p-6 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold">Ringkasan</h2>
          <ul className="mt-4 space-y-3">
            {items.map((item) => (
              <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                <span className="flex gap-2">
                  <span aria-hidden="true">{item.emoji}</span>
                  <span>
                    <span className="block font-semibold leading-snug">{item.nama}</span>
                    <span className="text-xs text-ink-muted">{item.jumlah} {item.satuan} × {formatRupiah(item.harga)}</span>
                  </span>
                </span>
                <span className="whitespace-nowrap font-semibold tabular-nums">{formatRupiah(item.harga * item.jumlah)}</span>
              </li>
            ))}
          </ul>
          <div className="my-4 border-t border-dashed border-ink/15 dark:border-white/15" />
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd className="tabular-nums">{formatRupiah(subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">Ongkos kirim</dt><dd className={`tabular-nums ${ongkir === 0 ? 'font-semibold text-leaf-600 dark:text-leaf-300' : ''}`}>{ongkir === 0 ? 'GRATIS' : formatRupiah(ongkir)}</dd></div>
          </dl>
          <div className="mt-3 flex items-baseline justify-between border-t border-ink/10 pt-3 dark:border-white/10">
            <span className="font-semibold">Total</span>
            <span className="text-xl font-extrabold tabular-nums text-brand-700 dark:text-saffron-300">{formatRupiah(total)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Checkout;
