export const startOfDay = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
export const endOfDay = (d = new Date()) =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate() + 1);
export const startOfMonth = (d = new Date()) => new Date(d.getFullYear(), d.getMonth(), 1);
export const addHours = (d, h) => new Date(new Date(d).getTime() + h * 3600 * 1000);
