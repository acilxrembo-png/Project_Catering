// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { generateNumber } from "../../lib/number.js";
import { getSetting } from "../../lib/settings.js";
import { addHours, endOfDay, startOfDay } from "../../lib/dates.js";
import { notify, notifyRoles } from "../../lib/notify.js";
import { validateVoucher } from "../vouchers/vouchers.service.js";

// ---------------------------------------------------------------- alur status
export const FLOW = {
  PENDING: ["WAITING_PAYMENT", "PAID", "CANCELLED"],
  WAITING_PAYMENT: ["PAID", "CANCELLED"],
  PAID: ["CONFIRMED", "CANCELLED", "REFUNDED"],
  CONFIRMED: ["PREPARING", "CANCELLED"],
  PREPARING: ["READY", "CANCELLED"],
  READY: ["DELIVERING", "COMPLETED"],
  DELIVERING: ["COMPLETED"],
  COMPLETED: [],
  CANCELLED: ["REFUNDED"],
  REFUNDED: [],
};

const STATUS_TEXT = {
  PAID: "Pembayaran diterima",
  CONFIRMED: "Pesanan dikonfirmasi",
  PREPARING: "Pesanan sedang diproduksi",
  READY: "Pesanan siap",
  DELIVERING: "Pesanan sedang diantar",
  COMPLETED: "Pesanan selesai",
  CANCELLED: "Pesanan dibatalkan",
  REFUNDED: "Dana dikembalikan",
};

/**
 * Ubah status pesanan + efek sampingnya. Dipakai juga oleh modul payments/production/deliveries.
 * `db` boleh transaksi (tx) atau prisma.
 */
export async function changeStatus(db, orderId, toStatus, { userId = null, note, reason } = {}) {
  const order = await db.order.findUnique({ where: { id: orderId }, include: { items: true } });
  if (!order) throw notFound("Pesanan tidak ditemukan");
  if (order.status === toStatus) return order;
  if (!FLOW[order.status]?.includes(toStatus)) {
    throw badRequest(`Status tidak dapat diubah dari ${order.status} ke ${toStatus}`);
  }

  const data = { status: toStatus };
  if (toStatus === "CANCELLED") Object.assign(data, { cancelledAt: new Date(), cancelReason: reason ?? note });
  if (toStatus === "COMPLETED") data.completedAt = new Date();

  const updated = await db.order.update({ where: { id: orderId }, data });
  await db.orderStatusHistory.create({
    data: { orderId, fromStatus: order.status, toStatus, note: note ?? reason, changedById: userId },
  });

  if (toStatus === "CONFIRMED") {
    const existing = await db.productionTask.count({ where: { orderId } });
    if (!existing) {
      for (const item of order.items) {
        await db.productionTask.create({
          data: {
            orderId,
            orderItemId: item.id,
            dueAt: addHours(order.eventDate, -2),
            priority: order.eventDate.getTime() - Date.now() < 48 * 3600e3 ? 1 : 0,
          },
        });
      }
      await notifyRoles(["DAPUR"], "PRODUCTION", "Tugas produksi baru", `Pesanan ${order.orderNumber} perlu diproduksi`, { orderId }, db);
    }
  }

  if (toStatus === "READY" && order.fulfillmentType === "DELIVERY") {
    const has = await db.delivery.findUnique({ where: { orderId } });
    if (!has) await db.delivery.create({ data: { orderId, scheduledAt: order.eventDate } });
  }

  if (toStatus === "CANCELLED") {
    await db.productionTask.updateMany({
      where: { orderId, status: { in: ["QUEUED", "IN_PROGRESS"] } },
      data: { status: "CANCELLED" },
    });
    if (order.voucherId) {
      const usage = await db.voucherUsage.findUnique({ where: { orderId } });
      if (usage) {
        await db.voucherUsage.delete({ where: { orderId } });
        await db.voucher.update({ where: { id: order.voucherId }, data: { usedCount: { decrement: 1 } } });
      }
    }
    await db.invoice.updateMany({ where: { orderId, status: { in: ["UNPAID", "PARTIAL"] } }, data: { status: "VOID" } });
  }

  if (toStatus === "COMPLETED") {
    const points = Math.floor(Number(order.totalAmount) / 10000);
    if (points > 0) {
      await db.customerProfile.updateMany({
        where: { userId: order.customerId },
        data: { loyaltyPoints: { increment: points } },
      });
    }
  }

  if (STATUS_TEXT[toStatus]) {
    await notify(order.customerId, "ORDER", STATUS_TEXT[toStatus], `Pesanan ${order.orderNumber}: ${STATUS_TEXT[toStatus]}`, { orderId }, db);
  }
  return updated;
}

// -------------------------------------------------------------- buat pesanan
export async function createOrder(user, input) {
  const isStaff = user.role !== "PELANGGAN";
  const customerId = isStaff ? input.customerId : user.id;
  if (!customerId) throw badRequest("customerId wajib diisi untuk pesanan yang dibuat staf");
  const source = isStaff ? input.source ?? "POS" : "ONLINE";
  const customer = await prisma.user.findFirst({ where: { id: customerId, role: "PELANGGAN", isActive: true } });
  if (!customer) throw notFound("Pelanggan tidak ditemukan");

  const now = new Date();
  if (input.eventDate.getTime() <= now.getTime()) throw badRequest("Tanggal acara harus di masa depan");

  // sumber item
  let rawItems = input.items;
  if (input.fromCart) {
    const cart = await prisma.cartItem.findMany({ where: { cart: { userId: customerId } } });
    if (!cart.length) throw badRequest("Keranjang kosong");
    rawItems = cart.map((c) => ({ productId: c.productId, variantId: c.variantId ?? undefined, quantity: c.quantity, notes: c.notes ?? undefined }));
  }

  return prisma.$transaction(
    async (tx) => {
      // ---- item
      const ids = [...new Set(rawItems.map((i) => i.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: ids }, deletedAt: null, isAvailable: true },
        include: { variants: { where: { isAvailable: true } } },
      });
      const byId = new Map(products.map((p) => [p.id, p]));
      const qtyPerProduct = new Map();
      const items = rawItems.map((i) => {
        const p = byId.get(i.productId);
        if (!p) throw badRequest(`Produk #${i.productId} tidak tersedia`);
        let unitPrice = Number(p.basePrice);
        let variantName = null;
        if (p.variants.length && !i.variantId) throw badRequest(`Pilih varian untuk ${p.name}`);
        if (i.variantId) {
          const v = p.variants.find((x) => x.id === i.variantId);
          if (!v) throw badRequest(`Varian tidak valid untuk ${p.name}`);
          unitPrice = Number(v.price);
          variantName = v.name;
        }
        if (i.quantity < p.minOrderQty) throw badRequest(`Minimal pemesanan ${p.name} adalah ${p.minOrderQty} ${p.unit}`);
        if (p.maxOrderQty && i.quantity > p.maxOrderQty) throw badRequest(`Maksimal pemesanan ${p.name} adalah ${p.maxOrderQty} ${p.unit}`);
        if (input.eventDate < addHours(now, p.leadTimeHours)) {
          throw badRequest(`${p.name} harus dipesan minimal ${p.leadTimeHours} jam sebelum acara`);
        }
        qtyPerProduct.set(p.id, (qtyPerProduct.get(p.id) ?? 0) + i.quantity);
        return {
          productId: p.id, variantId: i.variantId ?? null, productName: p.name, variantName,
          unitPrice, quantity: i.quantity, subtotal: unitPrice * i.quantity, notes: i.notes,
        };
      });

      // ---- kapasitas harian
      for (const [pid, qty] of qtyPerProduct) {
        const p = byId.get(pid);
        if (!p.dailyCapacity) continue;
        const agg = await tx.orderItem.aggregate({
          _sum: { quantity: true },
          where: {
            productId: pid,
            order: {
              eventDate: { gte: startOfDay(input.eventDate), lt: endOfDay(input.eventDate) },
              status: { notIn: ["CANCELLED", "REFUNDED"] },
            },
          },
        });
        if ((agg._sum.quantity ?? 0) + qty > p.dailyCapacity) {
          throw badRequest(`Kapasitas produksi ${p.name} pada tanggal tersebut tidak mencukupi`);
        }
      }

      const subtotal = items.reduce((s, i) => s + i.subtotal, 0);

      // ---- voucher
      let discountAmount = 0;
      let voucher = null;
      if (input.voucherCode) {
        const r = await validateVoucher({ code: input.voucherCode, userId: customerId, subtotal }, tx);
        voucher = r.voucher;
        discountAmount = r.discount;
      }

      // ---- pengiriman & alamat
      let shipping = { addressId: null, shippingName: null, shippingPhone: null, shippingAddress: null };
      let shippingFee = 0;
      let deliveryZoneId = null;
      if (input.fulfillmentType === "DELIVERY") {
        if (!input.deliveryZoneId) throw badRequest("deliveryZoneId wajib untuk pengantaran");
        const zone = await tx.deliveryZone.findFirst({ where: { id: input.deliveryZoneId, isActive: true } });
        if (!zone) throw badRequest("Zona pengiriman tidak valid");
        if (subtotal < Number(zone.minOrderAmount)) {
          throw badRequest(`Minimal pesanan untuk zona ${zone.name} adalah Rp${Number(zone.minOrderAmount).toLocaleString("id-ID")}`);
        }
        deliveryZoneId = zone.id;
        shippingFee = zone.freeShippingOver && subtotal >= Number(zone.freeShippingOver) ? 0 : Number(zone.fee);

        if (input.addressId) {
          const a = await tx.address.findFirst({ where: { id: input.addressId, userId: customerId } });
          if (!a) throw badRequest("Alamat tidak valid");
          shipping = {
            addressId: a.id,
            shippingName: a.recipientName,
            shippingPhone: a.phone,
            shippingAddress: [a.street, a.district, a.city, a.province, a.postalCode].filter(Boolean).join(", "),
          };
        } else if (input.shippingAddress && input.shippingName && input.shippingPhone) {
          shipping = { addressId: null, shippingName: input.shippingName, shippingPhone: input.shippingPhone, shippingAddress: input.shippingAddress };
        } else {
          throw badRequest("Isi addressId atau shippingName, shippingPhone, dan shippingAddress");
        }
      }

      // ---- biaya & total
      const servicePct = Number(await getSetting("service_fee_percent", 0, tx));
      const taxPct = Number(await getSetting("tax_percent", 0, tx));
      const taxable = subtotal - discountAmount;
      const serviceFee = Math.round((taxable * servicePct) / 100);
      const taxAmount = Math.round(((taxable + serviceFee) * taxPct) / 100);
      const totalAmount = taxable + serviceFee + taxAmount + shippingFee;

      // ---- pembayaran
      const dpPercentage =
        input.paymentScheme === "DOWN_PAYMENT"
          ? input.dpPercentage ?? Number(await getSetting("default_dp_percent", 50, tx))
          : null;
      const dueHours = Number(await getSetting("payment_due_hours", 24, tx));
      const paymentDueAt = addHours(now, dueHours);

      const orderNumber = await generateNumber(tx, "order", "ORD");
      const order = await tx.order.create({
        data: {
          orderNumber, source, status: "WAITING_PAYMENT", customerId,
          cashierId: isStaff ? user.id : null,
          fulfillmentType: input.fulfillmentType,
          eventName: input.eventName, eventDate: input.eventDate, guestCount: input.guestCount,
          ...shipping, deliveryZoneId,
          subtotal, discountAmount, shippingFee, serviceFee, taxAmount, totalAmount,
          paymentScheme: input.paymentScheme, dpPercentage, paymentDueAt,
          voucherId: voucher?.id,
          customerNotes: input.customerNotes, internalNotes: input.internalNotes,
          items: { create: items },
          statusHistory: { create: { toStatus: "WAITING_PAYMENT", note: "Pesanan dibuat", changedById: user.id } },
        },
        include: { items: true },
      });

      await tx.invoice.create({
        data: {
          invoiceNumber: await generateNumber(tx, "invoice", "INV", "issuedAt"),
          orderId: order.id, subtotal, discountAmount, shippingFee, taxAmount, totalAmount,
          dueDate: paymentDueAt,
        },
      });

      if (voucher) {
        await tx.voucherUsage.create({ data: { voucherId: voucher.id, userId: customerId, orderId: order.id, discount: discountAmount } });
        await tx.voucher.update({ where: { id: voucher.id }, data: { usedCount: { increment: 1 } } });
      }
      if (input.fromCart) await tx.cartItem.deleteMany({ where: { cart: { userId: customerId } } });

      await notify(customerId, "ORDER", "Pesanan dibuat", `Pesanan ${orderNumber} menunggu pembayaran`, { orderId: order.id }, tx);
      await notifyRoles(["ADMIN", "KASIR"], "ORDER", "Pesanan baru", `Pesanan ${orderNumber} masuk`, { orderId: order.id }, tx);
      return order;
    },
    { timeout: 20000 }
  );
}

// ----------------------------------------------------------------- query
const detailInclude = {
  items: true,
  customer: { select: { id: true, name: true, email: true, phone: true } },
  cashier: { select: { id: true, name: true } },
  deliveryZone: true,
  voucher: { select: { code: true, name: true } },
  statusHistory: { orderBy: { createdAt: "asc" }, include: { changedBy: { select: { name: true } } } },
  payments: { orderBy: { createdAt: "desc" } },
  invoices: true,
  refunds: true,
  productionTasks: true,
  delivery: true,
};

export async function listOrders(user, q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(user.role === "PELANGGAN" && { customerId: user.id }),
    ...(user.role === "DAPUR" && { status: { in: ["CONFIRMED", "PREPARING", "READY"] } }),
    ...(q.status && user.role !== "DAPUR" && { status: q.status }),
    ...(q.paymentStatus && { paymentStatus: q.paymentStatus }),
    ...(q.source && { source: q.source }),
    ...(q.fulfillmentType && { fulfillmentType: q.fulfillmentType }),
    ...(q.customerId && user.role !== "PELANGGAN" && { customerId: Number(q.customerId) }),
    ...(q.q && { OR: [{ orderNumber: { contains: q.q, mode: "insensitive" } }, { eventName: { contains: q.q, mode: "insensitive" } }] }),
    ...((q.from || q.to) && {
      eventDate: { ...(q.from && { gte: new Date(q.from) }), ...(q.to && { lte: new Date(q.to) }) },
    }),
  };
  const [data, total] = await Promise.all([
    prisma.order.findMany({
      where, skip, take: limit,
      orderBy: q.sort === "eventDate" ? { eventDate: "asc" } : { createdAt: "desc" },
      include: { items: true, customer: { select: { id: true, name: true, phone: true } } },
    }),
    prisma.order.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function getOrder(user, id) {
  const order = await prisma.order.findUnique({ where: { id }, include: detailInclude });
  if (!order) throw notFound("Pesanan tidak ditemukan");
  if (user.role === "PELANGGAN" && order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
  return order;
}

// ---------------------------------------------------------------- aksi
export async function updateStatus(user, id, { status, note, reason }) {
  if (user.role === "DAPUR" && !["PREPARING", "READY"].includes(status)) {
    throw forbidden("Dapur hanya dapat mengubah status ke PREPARING atau READY");
  }
  if (user.role === "KASIR" && ["PREPARING", "READY"].includes(status)) {
    throw forbidden("Status produksi diubah oleh dapur atau admin");
  }
  if (status === "CANCELLED" && !(reason ?? note)) throw badRequest("Alasan pembatalan wajib diisi");
  return prisma.$transaction((tx) => changeStatus(tx, id, status, { userId: user.id, note, reason }));
}

export async function cancelOrder(user, id, reason) {
  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) throw notFound("Pesanan tidak ditemukan");
  if (user.role === "PELANGGAN") {
    if (order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
    if (!["PENDING", "WAITING_PAYMENT"].includes(order.status) || Number(order.paidAmount) > 0) {
      throw badRequest("Pesanan yang sudah dibayar hanya dapat dibatalkan oleh admin/kasir");
    }
  } else if (!["ADMIN", "KASIR"].includes(user.role)) {
    throw forbidden();
  }
  return prisma.$transaction((tx) => changeStatus(tx, id, "CANCELLED", { userId: user.id, reason }));
}

export async function updateNotes(id, internalNotes) {
  return prisma.order.update({ where: { id }, data: { internalNotes } });
}
