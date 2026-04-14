import midtransClient from "midtrans-client";
import dotenv from "dotenv";
dotenv.config();

// =============================================
// Midtrans Snap Client
// =============================================
const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

// =============================================
// Core API Client (untuk refund, status check)
// =============================================
const coreApi = new midtransClient.CoreApi({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === "true",
  serverKey: process.env.MIDTRANS_SERVER_KEY || "",
  clientKey: process.env.MIDTRANS_CLIENT_KEY || "",
});

/**
 * Buat Snap Token untuk payment
 * @param {object} params
 * @param {string} params.orderId - unique order ID
 * @param {number} params.grossAmount - total bayar (sudah termasuk admin fee)
 * @param {string} params.customerName
 * @param {string} params.customerEmail
 * @param {string} params.customerPhone
 * @param {Array} params.items - [{id, price, quantity, name}]
 */
export async function createSnapTransaction({
  orderId,
  grossAmount,
  customerName,
  customerEmail,
  customerPhone,
  items = [],
}) {
  const parameter = {
    transaction_details: {
      order_id: orderId,
      gross_amount: grossAmount,
    },
    customer_details: {
      first_name: customerName,
      email: customerEmail,
      phone: customerPhone,
    },
    item_details: items,
    callbacks: {
      finish: `${process.env.FRONTEND_URL || "http://localhost:3000"}/checkout/payment?order_id=${orderId}`,
    },
  };

  const transaction = await snap.createTransaction(parameter);
  return {
    token: transaction.token,
    redirect_url: transaction.redirect_url,
  };
}

/**
 * Cek status transaksi di Midtrans
 * @param {string} orderId - midtrans order ID
 */
export async function getTransactionStatus(orderId) {
  return await coreApi.transaction.status(orderId);
}

/**
 * Refund via Midtrans
 * @param {string} orderId
 * @param {number} amount
 * @param {string} reason
 */
export async function refundTransaction(orderId, amount, reason = "Customer request") {
  return await coreApi.transaction.refund(orderId, {
    refund_key: `refund-${orderId}-${Date.now()}`,
    amount,
    reason,
  });
}

export { snap, coreApi };
