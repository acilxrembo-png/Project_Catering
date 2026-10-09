// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound, unauthorized } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { notify, notifyRoles } from "../../lib/notify.js";
import { audit } from "../../lib/audit.js";
import * as midtrans from "../../lib/midtrans.js";
import { changeStatus } from "../orders/orders.service.js";

const CLOSED = ["CANCELLED", "REFUNDED", "COMPLETED"];

// ----------------------------------------------------------- helper nominal
function computeAmount(order, type) {
  const total = Number(order.totalAmount);
  const paid = Number(order.paidAmount);
  if (type === "FULL") {
    if (paid > 0) throw badRequest("Pesanan sudah memiliki pembayaran, gunakan SETTLEMENT untuk pelunasan");
    return total;
  }
  if (type === "DOWN_PAYMENT") {
    if (order.paymentScheme !== "DOWN_PAYMENT") throw badRequest("Pesanan ini tidak memakai skema DP");
    if (paid > 0) throw badRequest("DP sudah dibayar");
    return Math.ceil((total * (order.dpPercentage ?? 50)) / 100);
  }
  if (paid <= 0) throw badRequest("Belum ada DP, pelunasan tidak dapat dilakukan");
  return total - paid;
}

async function loadPayableOrder(user, orderId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { customer: true, invoices: { orderBy: { id: "desc" }, take: 1 } },
  });
  if (!order) throw notFound("Pesanan tidak ditemukan");
  if (user.role === "PELANGGAN" && order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
  if (CLOSED.includes(order.status)) throw badRequest(`Pesanan berstatus ${order.status}, tidak dapat dibayar`);
  if (order.paymentStatus === "PAID") throw badRequest("Pesanan sudah lunas");
  return order;
}

const nextExternalId = async (order) => {
  const n = await prisma.payment.count({ where: { orderId: order.id } });
  return `PAY-${order.orderNumber}-${n + 1}`;
};

// ------------------------------------------------- dampak pembayaran sukses
export async function applySuccess(tx, payment, actorId = null) {
  // idempotent: hanya sekali per payment
  const flip = await tx.payment.updateMany({
    where: { id: payment.id, status: { not: "SUCCESS" } },
    data: { status: "SUCCESS", paidAt: payment.paidAt ?? new Date() },
  });
  if (flip.count === 0) return;

  const order = await tx.order.findUnique({ where: { id: payment.orderId } });
  const paid = Number(order.paidAmount) + Number(payment.amount);
  const full = paid >= Number(order.totalAmount) - 0.5;

  await tx.order.update({
    where: { id: order.id },
    data: { paidAmount: paid, paymentStatus: full ? "PAID" : "PARTIALLY_PAID" },
  });
  if (payment.invoiceId) {
    await tx.invoice.update({
      where: { id: payment.invoiceId },
      data: { status: full ? "PAID" : "PARTIAL", ...(full && { paidAt: new Date() }) },
    });
  }
  if (["PENDING", "WAITING_PAYMENT"].includes(order.status)) {
    await changeStatus(tx, order.id, "PAID", { userId: actorId, note: "Pembayaran diterima" });
  }
  await notify(order.customerId, "PAYMENT", "Pembayaran diterima",
    `Pembayaran Rp${Number(payment.amount).toLocaleString("id-ID")} untuk ${order.orderNumber} berhasil`, { orderId: order.id }, tx);
  await notifyRoles(["ADMIN", "KASIR"], "PAYMENT", "Pembayaran masuk", `${order.orderNumber} ${full ? "lunas" : "DP/sebagian"}`, { orderId: order.id }, tx);
}

// ------------------------------------------------------ pembayaran gateway
export async function createGatewayPayment(user, { orderId, type, gateway }) {
  const order = await loadPayableOrder(user, orderId);
  const amount = computeAmount(order, type);

  // pakai ulang transaksi yang masih berlaku
  const existing = await prisma.payment.findFirst({
    where: { orderId, type, gateway, status: "PENDING", expiresAt: { gt: new Date() }, snapToken: { not: null } },
  });
  if (existing && Number(existing.amount) === amount) return existing;

  const dueAt = order.paymentDueAt && order.paymentDueAt > new Date() ? order.paymentDueAt : new Date(Date.now() + 24 * 3600e3);
  const expiryMinutes = Math.ceil((dueAt.getTime() - Date.now()) / 60000);
  const externalId = await nextExternalId(order);

  const snap = await midtrans.createSnap({
    externalId, amount, expiryMinutes,
    customer: { name: order.customer.name, email: order.customer.email, phone: order.customer.phone },
  });

  return prisma.payment.create({
    data: {
      orderId, invoiceId: order.invoices[0]?.id, type, gateway, externalId, amount,
      snapToken: snap.token, paymentUrl: snap.redirect_url, expiresAt: dueAt, gatewayResponse: snap,
    },
  });
}

const GW_METHOD = {
  bank_transfer: "VIRTUAL_ACCOUNT", echannel: "VIRTUAL_ACCOUNT", permata: "VIRTUAL_ACCOUNT",
  qris: "QRIS", gopay: "EWALLET", shopeepay: "EWALLET", credit_card: "CREDIT_CARD", cstore: "RETAIL_OUTLET",
};

function mapMidtransStatus(b) {
  switch (b.transaction_status) {
    case "settlement": return "SUCCESS";
    case "capture": return b.fraud_status === "accept" || !b.fraud_status ? "SUCCESS" : "PENDING";
    case "pending": return "PENDING";
    case "deny":
    case "failure": return "FAILED";
    case "cancel": return "CANCELLED";
    case "expire": return "EXPIRED";
    default: return null; // refund, partial_refund, dll ditangani modul refunds
  }
}

export async function handleMidtransWebhook(body) {
  const eventId = `${body.transaction_id}:${body.transaction_status}`;
  const valid = midtrans.verifySignature(body);

  let log;
  try {
    log = await prisma.paymentWebhookLog.create({
      data: {
        gateway: "MIDTRANS", eventType: body.transaction_status, externalId: body.order_id,
        eventId, payload: body, signatureValid: valid,
      },
    });
  } catch (e) {
    if (e.code === "P2002") return { duplicate: true }; // sudah pernah diproses
    throw e;
  }
  if (!valid) {
    await prisma.paymentWebhookLog.update({ where: { id: log.id }, data: { errorMessage: "Signature tidak valid" } });
    throw unauthorized("Signature tidak valid");
  }

  const payment = await prisma.payment.findUnique({ where: { externalId: body.order_id } });
  if (!payment) {
    await prisma.paymentWebhookLog.update({ where: { id: log.id }, data: { errorMessage: "Payment tidak ditemukan" } });
    return { ignored: true };
  }

  const newStatus = mapMidtransStatus(body);
  await prisma.$transaction(async (tx) => {
    const details = {
      method: GW_METHOD[body.payment_type] ?? undefined,
      channel: body.va_numbers?.[0]?.bank ?? body.bank ?? body.issuer ?? body.payment_type,
      vaNumber: body.va_numbers?.[0]?.va_number ?? body.permata_va_number ?? undefined,
      fraudStatus: body.fraud_status,
      ...(!payment.gatewayTxId && body.transaction_id && { gatewayTxId: body.transaction_id }),
    };
    if (newStatus === "SUCCESS") {
      await tx.payment.update({ where: { id: payment.id }, data: { ...details, paidAt: new Date(body.settlement_time ?? Date.now()) } });
      await applySuccess(tx, { ...payment, paidAt: new Date(body.settlement_time ?? Date.now()) });
    } else if (newStatus && payment.status === "PENDING" && newStatus !== "PENDING") {
      await tx.payment.update({ where: { id: payment.id }, data: { ...details, status: newStatus, failureReason: body.status_message } });
    } else {
      await tx.payment.update({ where: { id: payment.id }, data: details });
    }
    await tx.paymentWebhookLog.update({ where: { id: log.id }, data: { paymentId: payment.id, processed: true, processedAt: new Date() } });
  });
  return { processed: true };
}

// ---------------------------------------------------------- pembayaran manual
export async function submitTransfer(user, { orderId, type, amount, channel, proofUrl }) {
  const order = await loadPayableOrder(user, orderId);
  const expected = computeAmount(order, type);
  if (Math.round(amount) !== Math.round(expected)) throw badRequest(`Nominal harus Rp${expected.toLocaleString("id-ID")}`);
  const payment = await prisma.payment.create({
    data: {
      orderId, invoiceId: order.invoices[0]?.id, type, gateway: "MANUAL", method: "BANK_TRANSFER",
      channel, amount, proofUrl, externalId: await nextExternalId(order),
    },
  });
  await notifyRoles(["KASIR", "ADMIN"], "PAYMENT", "Bukti transfer baru", `${order.orderNumber} menunggu verifikasi`, { orderId, paymentId: payment.id });
  return payment;
}

export async function recordManualPayment(user, input) {
  const order = await loadPayableOrder(user, input.orderId);
  const remaining = Number(order.totalAmount) - Number(order.paidAmount);
  const expected = computeAmount(order, input.type);
  if (input.amount > remaining + 0.5) throw badRequest("Nominal melebihi sisa tagihan");
  if (input.type !== "DOWN_PAYMENT" && Math.round(input.amount) !== Math.round(expected)) {
    throw badRequest(`Nominal harus Rp${expected.toLocaleString("id-ID")}`);
  }
  if (input.type === "DOWN_PAYMENT" && input.amount < expected) {
    throw badRequest(`Minimal DP Rp${expected.toLocaleString("id-ID")}`);
  }

  let cashierShiftId = null;
  if (["CASH", "EDC"].includes(input.method)) {
    if (user.role !== "KASIR") throw forbidden("Pembayaran tunai/EDC dicatat oleh kasir dengan shift terbuka");
    const shift = await prisma.cashierShift.findFirst({ where: { cashierId: user.id, status: "OPEN" } });
    if (!shift) throw badRequest("Buka shift kasir terlebih dahulu");
    cashierShiftId = shift.id;
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId: order.id, invoiceId: order.invoices[0]?.id, type: input.type, gateway: "MANUAL",
        method: input.method, channel: input.channel, status: "PENDING", amount: input.amount,
        proofUrl: input.proofUrl, externalId: await nextExternalId(order),
        verifiedById: user.id, verifiedAt: new Date(), cashierShiftId,
      },
    });
    await applySuccess(tx, payment, user.id);
    return tx.payment.findUnique({ where: { id: payment.id } });
  });
}

export async function verifyPayment(user, id, { approve, reason }) {
  const payment = await prisma.payment.findUnique({ where: { id } });
  if (!payment) throw notFound("Pembayaran tidak ditemukan");
  if (payment.gateway !== "MANUAL" || payment.status !== "PENDING") {
    throw badRequest("Hanya pembayaran manual berstatus PENDING yang dapat diverifikasi");
  }
  const result = await prisma.$transaction(async (tx) => {
    if (approve) {
      await tx.payment.update({ where: { id }, data: { verifiedById: user.id, verifiedAt: new Date() } });
      await applySuccess(tx, payment, user.id);
    } else {
      await tx.payment.update({
        where: { id },
        data: { status: "FAILED", failureReason: reason ?? "Bukti transfer ditolak", verifiedById: user.id, verifiedAt: new Date() },
      });
      const order = await tx.order.findUnique({ where: { id: payment.orderId } });
      await notify(order.customerId, "PAYMENT", "Pembayaran ditolak", reason ?? "Bukti transfer ditolak, silakan unggah ulang", { orderId: order.id }, tx);
    }
    return tx.payment.findUnique({ where: { id } });
  });
  await audit({ userId: user.id, action: approve ? "PAYMENT_VERIFY" : "PAYMENT_REJECT", entity: "Payment", entityId: id });
  return result;
}

// ------------------------------------------------------------------- query
export async function listPayments(user, q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(user.role === "PELANGGAN" && { order: { customerId: user.id } }),
    ...(q.status && { status: q.status }),
    ...(q.gateway && { gateway: q.gateway }),
    ...(q.orderId && { orderId: Number(q.orderId) }),
    ...(q.needsVerification === "true" && { gateway: "MANUAL", status: "PENDING", method: "BANK_TRANSFER" }),
  };
  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true, totalAmount: true, customer: { select: { name: true } } } } },
    }),
    prisma.payment.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}

export async function getPayment(user, id) {
  const p = await prisma.payment.findUnique({ where: { id }, include: { order: true, refunds: true } });
  if (!p) throw notFound("Pembayaran tidak ditemukan");
  if (user.role === "PELANGGAN" && p.order.customerId !== user.id) throw forbidden("Bukan pembayaran Anda");
  return p;
}

export const listInvoices = async (user, orderId) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw notFound("Pesanan tidak ditemukan");
  if (user.role === "PELANGGAN" && order.customerId !== user.id) throw forbidden("Bukan pesanan Anda");
  return prisma.invoice.findMany({ where: { orderId }, include: { payments: true } });
};
