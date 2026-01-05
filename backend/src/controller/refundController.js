import prisma from "../utils/prismaClient.js";

/**
 * Ajukan refund oleh user
 * POST /api/refund
 * body: { order_id, alasan }
 */
export const requestRefund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, alasan } = req.body;

    if (!order_id) {
      return res.status(400).json({ message: "order_id wajib diisi" });
    }

    const order = await prisma.order_booking.findUnique({
      where: { id: Number(order_id) },
      include: { transaksi: true, lapangan: true },
    });

    if (!order || order.user_id !== userId) {
      return res.status(404).json({ message: "Order tidak ditemukan" });
    }

    if (order.status !== "dibayar") {
      return res.status(400).json({ message: "Order belum dibayar" });
    }

    if (!order.transaksi || order.transaksi.status_pembayaran !== "berhasil") {
      return res.status(400).json({ message: "Transaksi belum berhasil" });
    }

    // Cek H-3 sebelum jadwal
    const now = new Date();
    const refundDeadline = new Date(order.tanggal);
    refundDeadline.setDate(refundDeadline.getDate() - 3);
    if (now > refundDeadline) {
      return res
        .status(400)
        .json({ message: "Refund hanya bisa diajukan H-3 sebelum jadwal" });
    }

    // Cek apakah refund sudah diajukan
    const existing = await prisma.refund.findUnique({
      where: { order_id: order.id },
    });

    if (existing) {
      return res.status(400).json({ message: "Refund sudah diajukan" });
    }

    // Buat refund
    const refund = await prisma.refund.create({
      data: {
        user_id: userId,
        order_id: order.id,
        transaksi_id: order.transaksi.id,
        jumlah: order.total_harga,
        alasan,
      },
      include: {
        order: {
          select: {
            tanggal: true,
            jam_mulai: true,
            jam_selesai: true,
            lapangan: { select: { nama: true } },
          },
        },
      },
    });

    return res.status(201).json({
      message: "Permintaan refund berhasil dikirim",
      data: refund,
    });
  } catch (err) {
    console.error("REFUND ERROR:", err);
    return res
      .status(500)
      .json({ message: "Gagal request refund", error: err.message });
  }
};

/**
 * Ambil riwayat refund user
 * GET /api/refund/me
 */
export const getMyRefunds = async (req, res) => {
  try {
    const userId = req.user.id;

    const refunds = await prisma.refund.findMany({
      where: { user_id: userId },
      include: {
        order: {
          select: {
            tanggal: true,
            jam_mulai: true,
            jam_selesai: true,
            lapangan: { select: { nama: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // map ke format FE WalletHistory
    // controller/refundController.js
    const history = refunds.map((r) => ({
      id: r.id,
      lapanganNama: r.order?.lapangan?.nama || "Lapangan Tidak Diketahui",
      tanggal: r.order?.tanggal || "",
      jamMulai: r.order?.jam_mulai || "-",
      jamSelesai: r.order?.jam_selesai || "-",
      jumlah: -Number(r.jumlah),
      status: r.status.toUpperCase(), // BERHASIL / PENDING / GAGAL untuk UI nominal
      orderId: r.order_id,
      refundStatus: r.status, // <--- tambah field ini
    }));

    return res.status(200).json({ history });
  } catch (err) {
    console.error("GET REFUND HISTORY ERROR:", err);
    return res
      .status(500)
      .json({ message: "Gagal mengambil riwayat refund", error: err.message });
  }
};

// controller/refundController.js
export const cancelRefund = async (req, res) => {
  try {
    const userId = req.user.id;
    const { refund_id } = req.body;

    if (!refund_id)
      return res.status(400).json({ message: "refund_id wajib diisi" });

    const refund = await prisma.refund.findUnique({
      where: { id: Number(refund_id) },
    });

    if (!refund || refund.user_id !== userId)
      return res.status(404).json({ message: "Refund tidak ditemukan" });

    if (refund.status !== "pending")
      return res.status(400).json({
        message: "Hanya refund dengan status pending yang bisa dibatalkan",
      });

    await prisma.refund.delete({
      where: { id: refund.id },
    });

    return res.status(200).json({ message: "Pengajuan refund dibatalkan" });
  } catch (err) {
    console.error("CANCEL REFUND ERROR:", err);
    return res
      .status(500)
      .json({ message: "Gagal membatalkan refund", error: err.message });
  }
};

export const approveRefund = async (req, res) => {
  try {
    const { refund_id } = req.body;

    if (!refund_id) {
      return res.status(400).json({ message: "refund_id wajib diisi" });
    }

    await prisma.$transaction(async (tx) => {
      // 1️⃣ Ambil refund
      const refund = await tx.refund.findUnique({
        where: { id: refund_id },
      });

      if (!refund) {
        throw new Error("Data refund tidak ditemukan");
      }

      if (refund.status !== "pending") {
        throw new Error("Refund sudah diproses");
      }

      // 2️⃣ Ambil wallet user
      const wallet = await tx.wallet_user.findUnique({
        where: { user_id: refund.user_id },
      });

      if (!wallet) {
        throw new Error("Wallet user tidak ditemukan");
      }

      // 3️⃣ Update saldo wallet
      const updatedWallet = await tx.wallet_user.update({
        where: { id: wallet.id },
        data: {
          saldo: {
            increment: Number(refund.jumlah),
          },
        },
      });

      // 4️⃣ Catat wallet history (INI YANG KEMARIN SALAH)
      await tx.wallet_history.create({
        data: {
          wallet_id: wallet.id, // ✅ WAJIB
          order_id: refund.order_id, // opsional
          transaksi_id: refund.transaksi_id,
          jumlah: Number(refund.jumlah),
          saldo_akhir: updatedWallet.saldo,
          tipe: "refund",
        },
      });

      // 5️⃣ Update refund
      await tx.refund.update({
        where: { id: refund_id },
        data: {
          status: "approved",
          processed_at: new Date(),
        },
      });

      // 6️⃣ (OPSIONAL TAPI BAGUS) update order & transaksi
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
    });

    return res.json({
      message: "Refund berhasil disetujui",
    });
  } catch (err) {
    console.error(err);
    return res.status(400).json({
      message: err.message || "Gagal approve refund",
    });
  }
};

export const getAllRefundsAdmin = async (req, res) => {
  const refunds = await prisma.refund.findMany({
    include: {
      user: { select: { nama: true } },
      order: {
        select: {
          tanggal: true,
          lapangan: { select: { nama: true } },
        },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const data = refunds.map((r) => ({
    id: r.id,
    user: r.user,
    lapanganNama: r.order.lapangan.nama,
    tanggal: r.order.tanggal,
    jumlah: Number(r.jumlah) * 0.8,
    alasan: r.alasan,
    refundStatus: r.status,
  }));

  res.json({ history: data });
};
