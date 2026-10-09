import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  htmlFor: string;
  children: ReactNode;
  petunjuk?: string;
  className?: string;
}

/** Pembungkus label + input supaya form konsisten dan mudah dibaca screen reader. */
const Field = ({ label, htmlFor, children, petunjuk, className = '' }: FieldProps) => (
  <div className={className}>
    <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-ink-soft dark:text-paper/70">
      {label}
    </label>
    {children}
    {petunjuk && <p className="mt-1 text-xs text-ink-muted">{petunjuk}</p>}
  </div>
);

export default Field;
