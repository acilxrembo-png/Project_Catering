export const formatRupiah = (angka: number): string => `Rp ${angka.toLocaleString('id-ID')}`;

export const formatTanggalPanjang = (iso: string): string =>
  new Date(iso).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
