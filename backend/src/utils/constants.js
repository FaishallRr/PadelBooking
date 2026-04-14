// =============================================
// Business Constants
// =============================================

/** Persentase biaya admin dari setiap transaksi (5%) */
export const ADMIN_FEE_PERCENT = 0.05;

/** Persentase biaya admin untuk withdrawn (5%) */
export const WITHDRAWAL_FEE_PERCENT = 0.05;

/** Persentase potongan refund (10%) - user dapat 90% */
export const REFUND_CUT_PERCENT = 0.10;

/** Biaya sewa raket (Rp) */
export const SEWA_RAKET_PRICE = 30000;

/** Expired order booking (menit) */
export const ORDER_EXPIRE_MINUTES = 15;

/** Batas refund sebelum jadwal (hari) */
export const REFUND_DEADLINE_DAYS = 3;

/**
 * Hitung breakdown harga
 * @param {number} hargaSewa - harga sewa lapangan
 * @param {boolean} sewaRaket - apakah sewa raket
 * @returns {{ subtotal, biayaRaket, biayaAdmin, biayaMitra, totalBayar }}
 */
export function calculatePriceBreakdown(hargaSewa, sewaRaket = false) {
  const biayaRaket = sewaRaket ? SEWA_RAKET_PRICE : 0;
  const subtotal = hargaSewa + biayaRaket;
  const biayaAdmin = Math.round(subtotal * ADMIN_FEE_PERCENT);
  const biayaMitra = subtotal;
  const totalBayar = subtotal + biayaAdmin;

  return {
    subtotal,
    biayaRaket,
    biayaAdmin,
    biayaMitra,
    totalBayar,
  };
}

/**
 * Calculate withdrawal amount after fee
 * @param {number} amount - Total amount to withdraw
 * @returns {object} { withdrawalFee, netAmount }
 */
export function calculateWithdrawalAmounts(amount) {
  const amountNum = Number(amount);
  const withdrawalFee = Math.round(amountNum * WITHDRAWAL_FEE_PERCENT);
  const netAmount = amountNum - withdrawalFee;

  return {
    withdrawalFee,
    netAmount,
  };
}

