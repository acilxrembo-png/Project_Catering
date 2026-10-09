import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = () => {
  const { tema, toggleTema } = useTheme();
  const gelap = tema === 'gelap';

  return (
    <button
      onClick={toggleTema}
      title={gelap ? 'Mode terang' : 'Mode gelap'}
      aria-label={gelap ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'}
      className="relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-ink/12 bg-surface transition hover:border-brand-400 active:scale-90 dark:border-white/12 dark:bg-surface-dark"
    >
      <Sun
        className={`absolute h-[18px] w-[18px] text-saffron-500 transition-all duration-500 ${
          gelap ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'
        }`}
      />
      <Moon
        className={`absolute h-[18px] w-[18px] text-saffron-300 transition-all duration-500 ${
          gelap ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'
        }`}
      />
    </button>
  );
};

export default ThemeToggle;
