import { Check } from 'lucide-react';

const langkahLabel = ['Acara & Alamat', 'Pembayaran', 'Konfirmasi'] as const;

const StepIndicator = ({ langkahAktif }: { langkahAktif: 1 | 2 | 3 }) => {
  return (
    <ol className="mb-8 flex items-center gap-2" aria-label="Langkah checkout">
      {langkahLabel.map((label, index) => {
        const nomor = index + 1;
        const aktif = nomor === langkahAktif;
        const selesai = nomor < langkahAktif;

        return (
          <li key={label} className="flex flex-1 items-center gap-2.5 last:flex-none sm:last:flex-1" aria-current={aktif ? 'step' : undefined}>
            <span
              className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition ${
                aktif
                  ? 'bg-brand-600 text-white shadow-lg shadow-brand-600/30 ring-4 ring-brand-600/15'
                  : selesai
                    ? 'bg-leaf-500 text-white'
                    : 'bg-paper-dim text-ink-muted dark:bg-white/10'
              }`}
            >
              {selesai ? <Check className="h-4 w-4" /> : nomor}
            </span>
            <span className={`hidden text-sm sm:inline ${aktif ? 'font-bold' : 'text-ink-muted'}`}>{label}</span>
            {nomor < langkahLabel.length && (
              <span className={`h-0.5 flex-1 rounded-full ${selesai ? 'bg-leaf-400' : 'bg-ink/10 dark:bg-white/10'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
};

export default StepIndicator;
