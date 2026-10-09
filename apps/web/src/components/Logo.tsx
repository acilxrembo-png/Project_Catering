interface LogoProps {
  className?: string;
}

/** Logo: cloche (tudung saji) di atas piring, dalam kotak merah cabai. */
const Logo = ({ className = 'h-10 w-10' }: LogoProps) => (
  <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Logo Rasa Nusa">
    <defs>
      <linearGradient id="logo-g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stopColor="#EF5B3A" />
        <stop offset="1" stopColor="#B8301A" />
      </linearGradient>
    </defs>
    <rect width="64" height="64" rx="18" fill="url(#logo-g)" />
    <path d="M14 42h36" stroke="#FFF3DD" strokeWidth="4" strokeLinecap="round" />
    <path d="M17 42a15 15 0 0 1 30 0" fill="#FFF3DD" />
    <circle cx="32" cy="24" r="3" fill="#FFF3DD" />
    <path d="M32 21v-3" stroke="#FFF3DD" strokeWidth="3" strokeLinecap="round" />
    <path d="M22 47h20" stroke="#F5B83D" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default Logo;
