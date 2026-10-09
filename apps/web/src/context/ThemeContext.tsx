import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

export type Tema = 'terang' | 'gelap';

interface ThemeContextValue {
  tema: Tema;
  toggleTema: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const temaAwal = (): Tema => {
  try {
    const tersimpan = localStorage.getItem('tema');
    if (tersimpan === 'terang' || tersimpan === 'gelap') return tersimpan;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'gelap' : 'terang';
  } catch {
    return 'terang';
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [tema, setTema] = useState<Tema>(temaAwal);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', tema === 'gelap');
    try {
      localStorage.setItem('tema', tema);
    } catch {
      /* penyimpanan diblokir — abaikan */
    }
  }, [tema]);

  const toggleTema = () => setTema((prev) => (prev === 'terang' ? 'gelap' : 'terang'));

  return <ThemeContext.Provider value={{ tema, toggleTema }}>{children}</ThemeContext.Provider>;
};

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = (): ThemeContextValue => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme harus dipakai di dalam <ThemeProvider>');
  return ctx;
};
