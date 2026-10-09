import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  login: (nama: string, email: string) => void;
  logout: () => void;
}

// persist -> data login tetap ada meskipun halaman di-refresh (disimpan di localStorage)
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      login: (nama, email) => set({ user: { nama: nama.trim(), email: email.trim() } }),
      logout: () => set({ user: null }),
    }),
    { name: 'auth-storage-catering' }
  )
);

export default useAuthStore;
