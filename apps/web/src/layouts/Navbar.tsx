import { useState } from "react";
 
type NavItem = { label: string; href: string };
 
const NAV_ITEMS: NavItem[] = [
  { label: "Beranda", href: "#beranda" },
  { label: "Menu", href: "#menu" },
  { label: "Paket", href: "#paket" },
  { label: "Cara pesan", href: "#cara-pesan" },
  { label: "Kontak", href: "#kontak" },
];
 
export default function Navbar() {
  const [open, setOpen] = useState<boolean>(false);
  const [active, setActive] = useState<string>("#beranda");
 
  const handleSelect = (href: string) => {
    setActive(href);
    setOpen(false);
  };
 
  return (
    <header className="sticky top-0 z-10 border-b border-line bg-surface">
      <div className="mx-auto flex h-[68px] max-w-6xl items-center gap-8 px-5">
        {/* Logo */}
        <a
          href="#beranda"
          onClick={() => handleSelect("#beranda")}
          aria-label="Dapur Kita, ke beranda"
          className="flex items-center gap-2.5 text-xl font-extrabold tracking-tight"
        >
          <span className="grid h-[34px] w-[34px] place-items-center rounded-t-[10px] rounded-b-[17px] bg-brand">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5 fill-none stroke-brand-ink stroke-2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 14h16a8 8 0 0 0-16 0Z" />
              <path d="M3 18h18" />
              <path d="M12 6V4" />
            </svg>
          </span>
          Dapur Kita
        </a>
 
        {/* Menu desktop */}
        <ul className="hidden flex-1 gap-1 md:flex">
          {NAV_ITEMS.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                onClick={() => handleSelect(item.href)}
                aria-current={active === item.href ? "page" : undefined}
                className={`block rounded-full px-3.5 py-2 font-medium transition-colors hover:bg-canvas hover:text-ink ${
                  active === item.href
                    ? "bg-canvas text-ink shadow-[inset_0_-3px_0_var(--color-accent)]"
                    : "text-muted"
                }`}
              >
                {item.label}
              </a>
            </li>
          ))}
        </ul>
 
        {/* Tombol desktop */}
        <div className="hidden items-center gap-2.5 md:flex">
          <a
            href="#masuk"
            className="rounded-full border-2 border-brand px-5 py-2.5 font-bold text-brand transition active:scale-95"
          >
            Masuk
          </a>
          <a
            href="#daftar"
            className="rounded-full border-2 border-brand bg-brand px-5 py-2.5 font-bold text-brand-ink transition active:scale-95"
          >
            Daftar
          </a>
        </div>
 
        {/* Hamburger mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Tutup menu" : "Buka menu"}
          aria-expanded={open}
          aria-controls="mobile-panel"
          className="ml-auto grid h-11 w-11 place-items-center rounded-xl border border-line bg-surface text-ink md:hidden"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-[22px] w-[22px] fill-none stroke-current stroke-2"
            strokeLinecap="round"
          >
            {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
          </svg>
        </button>
      </div>
 
      {/* Panel mobile */}
      {open && (
        <div id="mobile-panel" className="border-t border-line px-5 pb-5 pt-3 md:hidden">
          <ul className="mb-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.href}>
                <a
                  href={item.href}
                  onClick={() => handleSelect(item.href)}
                  aria-current={active === item.href ? "page" : undefined}
                  className={`block border-b border-line py-3.5 ${
                    active === item.href ? "font-bold text-brand" : "font-medium"
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex gap-2.5">
            <a
              href="#masuk"
              className="flex-1 rounded-full border-2 border-brand px-5 py-2.5 text-center font-bold text-brand"
            >
              Masuk
            </a>
            <a
              href="#daftar"
              className="flex-1 rounded-full border-2 border-brand bg-brand px-5 py-2.5 text-center font-bold text-brand-ink"
            >
              Daftar
            </a>
          </div>
        </div>
      )}
    </header>
  );
}