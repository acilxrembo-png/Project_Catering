/** Ongkos kirim flat dalam kota. */
export const ONGKIR_FLAT = 35000;
/** Subtotal minimal untuk gratis ongkir. */
export const GRATIS_ONGKIR_MIN = 1_500_000;
/** Minimal H-berapa pesanan harus dibuat sebelum hari acara. */
export const MIN_HARI_PESAN = 2;

export const hitungOngkir = (subtotal: number): number =>
  subtotal === 0 || subtotal >= GRATIS_ONGKIR_MIN ? 0 : ONGKIR_FLAT;

export const hitungSubtotal = (items: { harga: number; jumlah: number }[]): number =>
  items.reduce((acc, item) => acc + item.harga * item.jumlah, 0);

/** Tanggal paling awal yang boleh dipilih (YYYY-MM-DD), memakai zona waktu lokal. */
export const tanggalPalingAwal = (): string => {
  const d = new Date();
  d.setDate(d.getDate() + MIN_HARI_PESAN);
  const bulan = String(d.getMonth() + 1).padStart(2, '0');
  const hari = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${bulan}-${hari}`;
};
