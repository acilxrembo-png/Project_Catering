import type { Kategori } from '../types';
import { kategoriInfo } from '../utils/kategori';

interface PiringProps {
  kategori: Kategori;
  emoji: string;
  /** Ukuran emoji utama, mis. "text-6xl". */
  ukuran?: string;
  className?: string;
}

/**
 * "Foto" hidangan berupa piring ilustratif: gradient sesuai kategori, cincin
 * piring, dan emoji hidangan di tengah — tanpa perlu hosting gambar.
 */
const Piring = ({ kategori, emoji, ukuran = 'text-6xl', className = '' }: PiringProps) => {
  const info = kategoriInfo[kategori];
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden bg-gradient-to-br ${info.gradient} ${className}`}
      aria-hidden="true"
    >
      <div className="pointer-events-none absolute -left-6 -top-6 h-24 w-24 rounded-full bg-white/30 blur-2xl dark:bg-white/10" />
      <div className="pointer-events-none absolute -bottom-8 -right-8 h-28 w-28 rounded-full bg-white/25 blur-2xl dark:bg-white/5" />
      <div className="relative flex aspect-square h-[72%] items-center justify-center rounded-full bg-white/70 shadow-[inset_0_0_0_6px_rgb(255_255_255_/_0.55),0_10px_30px_-8px_rgb(43_27_20_/_0.35)] transition-transform duration-500 group-hover:scale-105 group-hover:rotate-3 dark:bg-white/15 dark:shadow-[inset_0_0_0_6px_rgb(255_255_255_/_0.12),0_10px_30px_-8px_rgb(0_0_0_/_0.5)]">
        <span className={`${ukuran} drop-shadow-md`}>{emoji}</span>
      </div>
    </div>
  );
};

export default Piring;
