// @ts-nocheck
import { prisma } from "../../lib/prisma.js";
import { badRequest, forbidden, notFound } from "../../lib/httpError.js";
import { getPagination, pageMeta } from "../../lib/pagination.js";
import { notify, notifyRoles } from "../../lib/notify.js";
import { audit } from "../../lib/audit.js";
import * as midtrans from "../../lib/midtrans.js";
import { changeStatus } from "../orders/orders.service.js";

export async function request(user, { paymentId, amount, reason }) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId }, include: { order: true } });
  if (!payment) throw notFound("Pembayaran tidak ditemukan");
  if (user.role === "PELANGGAN" && payment.order.customerId !== user.id) throw forbidden("Bukan pembayaran Anda");
  if (payment.status !== "SUCCESS") throw badRequest("Hanya pembayaran sukses yang dapat di-refund");

  const agg = await prisma.refund.aggregate({
    _sum: { amount: true },
    where: { paymentId, status: { in: ["REQUESTED", "APPROVED", "PROCESSED"] } },
  });
  const refundable = Number(payment.amount) - Number(agg._sum.amount ?? 0);
  if (amount > refundable + 0.5) throw badRequest(`Maksimal refund Rp${refundable.toLocaleString("id-ID")}`);

  const refund = await prisma.refund.create({
    data: { paymentId, orderId: payment.orderId, amount, reason, requestedById: user.id },
  });
  await notifyRoles(["ADMIN"], "PAYMENT", "Permintaan refund", `Refund ${payment.order.orderNumber} menunggu persetujuan`, { refundId: refund.id });
  return refund;
}

export async function decide(user, id, approve) {
  const refund = await prisma.refund.findUnique({ where: { id } });
  if (!refund) throw notFound("Refund tidak ditemukan");
  if (refund.status !== "REQUESTED") throw badRequest("Refund sudah diputuskan");
  const updated = await prisma.refund.update({
    where: { id },
    data: { status: approve ? "APPROVED" : "REJECTED", approvedById: user.id },
  });
  await audit({ userId: user.id, action: approve ? "REFUND_APPROVE" : "REFUND_REJECT", entity: "Refund", entityId: id, newValue: { amount: refund.amount } });
  return updated;
}

export async function process(user, id) {
  const refund = await prisma.refund.findUnique({ where: { id }, include: { payment: true, order: true } });
  if (!refund) throw notFound("Refund tidak ditemukan");
  if (refund.status !== "APPROVED") throw badRequest("Refund harus berstatus APPROVED");

  let gatewayResponse = null;
  let gatewayRefundId = null;
  if (refund.payment.gateway === "MIDTRANS") {
    try {
      gatewayResponse = await midtrans.refundTransaction({
        externalId: refund.payment.externalId,
        amount: Number(refund.amount),
        reason: refund.reason,
        refundKey: `RF-${refund.id}-${refund.payment.externalId}`,
      });
      gatewayRefundId = String(gatewayResponse.refund_chargeback_id ?? "");
    } catch (e) {
      await prisma.refund.update({ where: { id }, data: { status: "FAILED", gatewayResponse: e.details ?? { message: e.message } } });
      throw e;
    }
  }
  // gateway MANUAL: uang dikembalikan manual oleh kasir/admin, sistem hanya mencatat

  return prisma.$transaction(async (tx) => {
    const done = await tx.refund.update({
      where: { id },
      data: { status: "PROCESSED", processedAt: new Date(), gatewayResponse, gatewayRefundId },
    });
    const agg = await tx.refund.aggregate({ _sum: { amount: true }, where: { paymentId: refund.paymentId, status: "PROCESSED" } });
    if (Number(agg._sum.amount) >= Number(refund.payment.amount) - 0.5) {
      await tx.payment.update({ where: { id: refund.paymentId }, data: { status: "REFUNDED" } });
    }
    const paid = Math.max(0, Number(refund.order.paidAmount) - Number(refund.amount));
    await tx.order.update({
      where: { id: refund.orderId },
      data: { paidAmount: paid, paymentStatus: paid <= 0 ? "REFUNDED" : "PARTIALLY_REFUNDED" },
    });
    if (paid <= 0 && ["PAID", "CANCELLED"].includes(refund.order.status)) {
      await changeStatus(tx, refund.orderId, "REFUNDED", { userId: user.id, note: "Refund penuh diproses" });
    }
    await notify(refund.order.customerId, "PAYMENT", "Refund diproses",
      `Refund Rp${Number(refund.amount).toLocaleString("id-ID")} untuk ${refund.order.orderNumber} telah diproses`, { orderId: refund.orderId }, tx);
    await audit({ userId: user.id, action: "REFUND_PROCESS", entity: "Refund", entityId: id });
    return done;
  });
}

export async function list(user, q) {
  const { page, limit, skip } = getPagination(q);
  const where = {
    ...(user.role === "PELANGGAN" && { order: { customerId: user.id } }),
    ...(q.status && { status: q.status }),
    ...(q.orderId && { orderId: Number(q.orderId) }),
  };
  const [data, total] = await Promise.all([
    prisma.refund.findMany({
      where, skip, take: limit, orderBy: { createdAt: "desc" },
      include: { order: { select: { orderNumber: true } }, requestedBy: { select: { name: true } } },
    }),
    prisma.refund.count({ where }),
  ]);
  return { data, meta: pageMeta(page, limit, total) };
}
