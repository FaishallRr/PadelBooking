import prisma from "../utils/prismaClient.js";
import dayjs from "dayjs";
import { createNotification } from "../utils/notificationHelper.js";

export const autoApproveRefundH3 = async () => {
  console.log("⏰ Auto approve refund H-3 running...");

  // batas H-3
  const limitDate = dayjs().add(3, "day").startOf("day").toDate();

  // 1️⃣ ambil refund yang eligible
  const refunds = await prisma.refund.findMany({
    where: {
      status: "pending",
      order: {
        tanggal: {
          gte: limitDate,
        },
      },
    },
    include: {
      order: {
        include: {
          lapangan: { select: { nama: true } },
        },
      },
      transaksi: true,
      user: true,
    },
  });

  if (refunds.length === 0) {
    console.log("✅ Tidak ada refund H-3");
    return;
  }

  console.log(`🔁 ${refunds.length} refund akan diproses`);

  for (const refund of refunds) {
    try {
      await prisma.$transaction(async (tx) => {
        // 2️⃣ ambil wallet
        const wallet = await tx.wallet_user.findUnique({
          where: { user_id: refund.user_id },
        });

        if (!wallet) throw new Error("Wallet tidak ditemukan");

        // 3️⃣ update saldo (jumlah sudah dipotong 10% saat request)
        const updatedWallet = await tx.wallet_user.update({
          where: { id: wallet.id },
          data: {
            saldo: {
              increment: Number(refund.jumlah),
            },
          },
        });

        // 4️⃣ wallet history
        await tx.wallet_history.create({
          data: {
            wallet_id: wallet.id,
            order_id: refund.order_id,
            transaksi_id: refund.transaksi_id,
            jumlah: Number(refund.jumlah),
            saldo_akhir: updatedWallet.saldo,
            tipe: "refund",
          },
        });

        // 5️⃣ update refund
        await tx.refund.update({
          where: { id: refund.id },
          data: {
            status: "approved",
            processed_at: new Date(),
          },
        });

        // 6️⃣ update order & transaksi
        await tx.order_booking.update({
          where: { id: refund.order_id },
          data: {
            status: "refund",
          },
        });

        await tx.transaksi.update({
          where: { id: refund.transaksi_id },
          data: {
            status_pembayaran: "refund",
          },
        });

        // 7️⃣ Kembalikan jadwal ke tersedia
        if (refund.order?.jadwalLapanganId) {
          await tx.jadwalLapangan.update({
            where: { id: refund.order.jadwalLapanganId },
            data: { status: "tersedia" },
          });
        }
      });

      // Notifikasi
      await createNotification(
        refund.user_id,
        `Refund Rp ${Number(refund.jumlah).toLocaleString("id-ID")} untuk ${refund.order?.lapangan?.nama || "lapangan"} telah disetujui otomatis dan dikembalikan ke wallet.`
      );

      console.log(`✅ Refund #${refund.id} auto-approved`);
    } catch (err) {
      console.error(`❌ Refund #${refund.id} gagal:`, err.message);
    }
  }
};
