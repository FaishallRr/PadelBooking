// src/controller/checkoutController.js
// LEGACY: Checkout via wallet (kept for backward compatibility)
// New payment flow uses /api/payment/create → Midtrans
import prisma from "../utils/prismaClient.js";
import { calculatePriceBreakdown } from "../utils/constants.js";
import { createNotification } from "../utils/notificationHelper.js";

export const checkoutWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User tidak ditemukan" });

    const { order_id, sewa_raket = false } = req.body;
    if (!order_id)
      return res.status(400).json({ message: "order_id tidak dikirim" });

    const order = await prisma.order_booking.findUnique({
      where: { id: order_id },
      include: {
        lapangan: { include: { mitra: true } },
      },
    });
    if (!order)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    const wallet = await prisma.wallet_user.findUnique({
      where: { user_id: userId },
    });
    if (!wallet)
      return res.status(404).json({ message: "Wallet tidak ditemukan" });

    // Hitung harga dengan admin fee
    const hargaSewa = Number(order.total_harga);
    const { totalBayar, biayaAdmin, biayaMitra, biayaRaket } = calculatePriceBreakdown(hargaSewa, sewa_raket);

    if (wallet.saldo < totalBayar) {
      return res.status(400).json({ message: "Saldo tidak cukup" });
    }

    const saldoAkhir = wallet.saldo - totalBayar;

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Transaksi
      let transaksi = await tx.transaksi.findUnique({
        where: { order_id },
      });

      if (!transaksi) {
        transaksi = await tx.transaksi.create({
          data: {
            user_id: userId,
            lapangan_id: order.lapangan_id,
            jadwal_id: order.jadwalLapanganId,
            order_id: order.id,
            total_harga: totalBayar,
            biaya_admin: biayaAdmin,
            biaya_mitra: biayaMitra,
            status_pembayaran: "berhasil",
            payment_type: "wallet",
          },
        });
      } else {
        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: {
            status_pembayaran: "berhasil",
            total_harga: totalBayar,
            biaya_admin: biayaAdmin,
            biaya_mitra: biayaMitra,
            payment_type: "wallet",
          },
        });
      }

      // 2️⃣ Update wallet
      await tx.wallet_user.update({
        where: { user_id: userId },
        data: { saldo: saldoAkhir },
      });

      // 3️⃣ Wallet history
      await tx.wallet_history.create({
        data: {
          wallet_id: wallet.id,
          transaksi_id: transaksi.id,
          order_id: order.id,
          jumlah: totalBayar,
          tipe: "booking",
          saldo_akhir: saldoAkhir,
        },
      });

      // 4️⃣ Update order
      await tx.order_booking.update({
        where: { id: order.id },
        data: {
          status: "dibayar",
          sewa_raket,
          biaya_raket: biayaRaket,
          total_harga: totalBayar,
        },
      });

      // 5️⃣ Update jadwal → booked
      await tx.jadwalLapangan.update({
        where: { id: order.jadwalLapanganId },
        data: { status: "booked" },
      });

      // 6️⃣ Catat pendapatan mitra
      if (order.lapangan?.mitra) {
        await tx.pendapatan_mitra.create({
          data: {
            mitra_id: order.lapangan.mitra.id,
            transaksi_id: transaksi.id,
            jumlah: biayaMitra,
          },
        });
      }
    });

    // Notifikasi
    await createNotification(
      userId,
      `Pembayaran via wallet berhasil! Booking ${order.lapangan.nama} telah dikonfirmasi. Total: Rp ${totalBayar.toLocaleString("id-ID")}`
    );

    return res.json({
      message: "Pembayaran berhasil",
      order_id,
      total_bayar: totalBayar,
      biaya_admin: biayaAdmin,
    });
  } catch (err) {
    console.error("CHECKOUT WALLET ERROR:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
