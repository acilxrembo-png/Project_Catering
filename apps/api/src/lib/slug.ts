// @ts-nocheck
export const slugify = (text) =>
  text
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// slug unik: tambah sufiks angka jika sudah dipakai
export async function uniqueSlug(model, text, ignoreId) {
  const base = slugify(text) || "item";
  let slug = base;
  let i = 1;
  while (true) {
    const found = await model.findUnique({ where: { slug } });
    if (!found || found.id === ignoreId) return slug;
    slug = `${base}-${++i}`;
  }
}
