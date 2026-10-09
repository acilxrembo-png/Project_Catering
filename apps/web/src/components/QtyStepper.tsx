import { Minus, Plus } from 'lucide-react';

interface QtyStepperProps {
  jumlah: number;
  min: number;
  langkah: number;
  onChange: (jumlahBaru: number) => void;
  ukuran?: 'sm' | 'md';
}

const QtyStepper = ({ jumlah, min, langkah, onChange, ukuran = 'md' }: QtyStepperProps) => {
  const tombol = ukuran === 'md' ? 'h-9 w-9' : 'h-7 w-7';
  const ikon = ukuran === 'md' ? 'h-4 w-4' : 'h-3.5 w-3.5';
  const dapatKurang = jumlah - langkah >= min;

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-ink/12 bg-surface p-1 dark:border-white/12 dark:bg-surface-dark">
      <button
        type="button"
        onClick={() => onChange(jumlah - langkah)}
        disabled={!dapatKurang}
        aria-label={`Kurangi ${langkah}`}
        className={`${tombol} flex items-center justify-center rounded-full bg-paper-dim transition hover:bg-brand-100 hover:text-brand-700 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-white/8 dark:hover:bg-brand-400/20`}
      >
        <Minus className={ikon} />
      </button>
      <span className={`min-w-10 text-center font-bold tabular-nums ${ukuran === 'md' ? 'text-base' : 'text-sm'}`}>
        {jumlah}
      </span>
      <button
        type="button"
        onClick={() => onChange(jumlah + langkah)}
        aria-label={`Tambah ${langkah}`}
        className={`${tombol} flex items-center justify-center rounded-full bg-brand-600 text-white transition hover:bg-brand-700`}
      >
        <Plus className={ikon} />
      </button>
    </div>
  );
};

export default QtyStepper;
