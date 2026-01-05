// src/controller/checkoutController.js
import prisma from "../utils/prismaClient.js";

export const checkoutWallet = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId)
      return res.status(401).json({ message: "User tidak ditemukan" });

    const { order_id, sewa_raket = false } = req.body;
    if (!order_id)
      return res.status(400).json({ message: "order_id tidak dikirim" });

    const BIAYA_RAKET = sewa_raket ? 30000 : 0;

    const order = await prisma.order_booking.findUnique({
      where: { id: order_id },
    });
    if (!order)
      return res.status(404).json({ message: "Order tidak ditemukan" });

    const wallet = await prisma.wallet_user.findUnique({
      where: { user_id: userId },
    });
    if (!wallet)
      return res.status(404).json({ message: "Wallet tidak ditemukan" });

    const totalBayar = Number(order.total_harga) + Number(BIAYA_RAKET);

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
            status_pembayaran: "berhasil",
          },
        });
      } else {
        await tx.transaksi.update({
          where: { id: transaksi.id },
          data: { status_pembayaran: "berhasil" },
        });
      }

      // 2️⃣ Update wallet
      await tx.wallet_user.update({
        where: { user_id: userId },
        data: { saldo: saldoAkhir },
      });

      // 3️⃣ Wallet history (WAJIB saldo_akhir)
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
          biaya_raket: BIAYA_RAKET,
          total_harga: totalBayar,
        },
      });
    });

    return res.json({
      message: "Pembayaran berhasil",
      order_id,
      total_bayar: totalBayar,
    });
  } catch (err) {
    console.error("CHECKOUT WALLET ERROR:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};
