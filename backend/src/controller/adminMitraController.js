// src/controller/adminMitraController.js
import prisma from "../utils/prismaClient.js";
import { createNotification } from "../utils/notificationHelper.js";

/**
 * GET /api/admin/mitra
 * List semua mitra beserta status dan ringkasan pendapatan
 */
export const getAllMitra = async (req, res) => {
  try {
    const mitras = await prisma.mitra.findMany({
      include: {
        user: {
          select: {
            id: true,
            nama: true,
            email: true,
            no_hp: true,
            status: true,
          },
        },
        lapangan: {
          select: { id: true, nama: true, status: true },
        },
        pendapatan: {
          select: { jumlah: true, status: true },
        },
        pencairan: {
          select: { jumlah: true, status: true, created_at: true },
          orderBy: { created_at: "desc" },
          take: 5,
        },
      },
      orderBy: { created_at: "desc" },
    });

    const data = mitras.map((m) => {
      const totalPendapatan = m.pendapatan.reduce(
        (sum, p) => sum + Number(p.jumlah),
        0,
      );
      const pendapatanBelumCair = m.pendapatan
        .filter((p) => p.status === "belum_cair")
        .reduce((sum, p) => sum + Number(p.jumlah), 0);
      const totalDicairkan = m.pencairan
        .filter((p) => p.status === "berhasil")
        .reduce((sum, p) => sum + Number(p.jumlah), 0);

      return {
        id: m.id,
        nama_usaha: m.nama_usaha,
        alamat_usaha: m.alamat_usaha,
        status: m.status,
        withdraw_type: m.withdraw_type,
        bank_mitra: m.bank_mitra,
        no_rekening_mitra: m.no_rekening_mitra,
        created_at: m.created_at,
        user: m.user,
        jumlah_lapangan: m.lapangan.length,
        lapangan: m.lapangan,
        total_pendapatan: totalPendapatan,
        pendapatan_belum_cair: pendapatanBelumCair,
        total_dicairkan: totalDicairkan,
        pencairan_terakhir: m.pencairan,
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("GET ALL MITRA ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data mitra" });
  }
};

/**
 * PATCH /api/admin/mitra/:id/status
 * Aktifkan/nonaktifkan mitra
 * body: { status: "aktif" | "pending" | "ditolak" }
 */
export const updateMitraStatus = async (req, res) => {
  try {
    const mitraId = Number(req.params.id);
    const { status } = req.body;

    if (!["aktif", "pending", "ditolak"].includes(status)) {
      return res.status(400).json({ message: "Status tidak valid" });
    }

    const mitra = await prisma.mitra.findUnique({
      where: { id: mitraId },
      include: { user: true },
    });

    if (!mitra)
      return res.status(404).json({ message: "Mitra tidak ditemukan" });

    await prisma.mitra.update({
      where: { id: mitraId },
      data: { status },
    });

    // Update user status juga
    if (status === "ditolak") {
      await prisma.users.update({
        where: { id: mitra.userId },
        data: { role: "user" }, // Kembalikan ke user biasa
      });
    }

    // Notifikasi ke mitra
    const statusLabel = {
      aktif: "disetujui",
      pending: "dalam review",
      ditolak: "ditolak",
    };
    await createNotification(
      mitra.userId,
      `Status mitra Anda telah ${statusLabel[status]} oleh admin.`,
    );

    res.json({ message: `Status mitra berhasil diubah ke ${status}`, status });
  } catch (err) {
    console.error("UPDATE MITRA STATUS ERROR:", err);
    res.status(500).json({ message: "Gagal mengubah status mitra" });
  }
};

/**
 * GET /api/admin/mitra/:id/pendapatan
 * Lihat detail pendapatan mitra spesifik
 */
export const getMitraPendapatan = async (req, res) => {
  try {
    const mitraId = Number(req.params.id);

    const mitra = await prisma.mitra.findUnique({
      where: { id: mitraId },
      include: { user: { select: { nama: true } } },
    });

    if (!mitra)
      return res.status(404).json({ message: "Mitra tidak ditemukan" });

    const pendapatan = await prisma.pendapatan_mitra.findMany({
      where: { mitra_id: mitraId },
      include: {
        transaksi: {
          select: {
            id: true,
            total_harga: true,
            biaya_admin: true,
            biaya_mitra: true,
            created_at: true,
            order: {
              select: {
                tanggal: true,
                jam_mulai: true,
                jam_selesai: true,
                lapangan: { select: { nama: true } },
                user: { select: { nama: true } },
              },
            },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    const totalPendapatan = pendapatan.reduce(
      (sum, p) => sum + Number(p.jumlah),
      0,
    );
    const belumCair = pendapatan
      .filter((p) => p.status === "belum_cair")
      .reduce((sum, p) => sum + Number(p.jumlah), 0);

    res.json({
      mitra: { id: mitra.id, nama_usaha: mitra.nama_usaha, user: mitra.user },
      total_pendapatan: totalPendapatan,
      belum_cair: belumCair,
      data: pendapatan,
    });
  } catch (err) {
    console.error("GET MITRA PENDAPATAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil pendapatan mitra" });
  }
};

/**
 * GET /api/admin/revenue-chart
 * Grafik pendapatan admin (biaya_admin dari semua transaksi berhasil)
 */
export const getAdminRevenueChart = async (req, res) => {
  try {
    const { range } = req.query; // "7", "30", "all"

    const where = { status_pembayaran: "berhasil" };

    if (range && range !== "all") {
      const days = Number(range);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      where.created_at = { gte: cutoff };
    }

    const transaksis = await prisma.transaksi.findMany({
      where,
      select: {
        biaya_admin: true,
        biaya_mitra: true,
        total_harga: true,
        created_at: true,
      },
      orderBy: { created_at: "asc" },
    });

    // Group per hari
    const grouped = {};
    for (const t of transaksis) {
      const dateKey = t.created_at.toISOString().slice(0, 10);
      if (!grouped[dateKey]) {
        grouped[dateKey] = { admin: 0, mitra: 0, total: 0 };
      }
      grouped[dateKey].admin += Number(t.biaya_admin);
      grouped[dateKey].mitra += Number(t.biaya_mitra);
      grouped[dateKey].total += Number(t.total_harga);
    }

    const data = Object.entries(grouped).map(([date, val]) => ({
      date,
      admin_revenue: val.admin,
      mitra_revenue: val.mitra,
      total_revenue: val.total,
    }));

    const totalAdminRevenue = transaksis.reduce(
      (sum, t) => sum + Number(t.biaya_admin),
      0,
    );

    res.json({
      total_admin_revenue: totalAdminRevenue,
      data,
    });
  } catch (err) {
    console.error("ADMIN REVENUE CHART ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil grafik revenue" });
  }
};

/**
 * GET /api/admin/earnings-dashboard
 * Dashboard admin melihat total pendapatan dari:
 * 1. Biaya admin dari transaksi
 * 2. Biaya admin dari pencairan (fee)
 * 3. Status pencairan
 */
export const getAdminEarningsDashboard = async (req, res) => {
  try {
    // 1. Total admin fee dari successful transactions
    const transactionFees = await prisma.transaksi.aggregate({
      where: { status_pembayaran: "berhasil" },
      _sum: { biaya_admin: true },
    });

    // 2. Total withdrawal fees dari approved withdrawals
    const withdrawalFees = await prisma.pencairan_pendapatan.aggregate({
      where: { status: "berhasil" },
      _sum: { biaya_admin_pencairan: true },
    });

    // 3. Pending & processing withdrawals
    const pendingWithdrawals = await prisma.pencairan_pendapatan.findMany({
      where: { status: "pending" },
      include: {
        mitra: {
          include: {
            user: { select: { nama: true, email: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    const processingWithdrawals = await prisma.pencairan_pendapatan.findMany({
      where: { status: "diproses" },
      include: {
        mitra: {
          include: {
            user: { select: { nama: true, email: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
      take: 10,
    });

    // 4. Count withdrawals by status
    const [pendingCount, processingCount, approvedCount, rejectedCount] =
      await Promise.all([
        prisma.pencairan_pendapatan.count({ where: { status: "pending" } }),
        prisma.pencairan_pendapatan.count({ where: { status: "diproses" } }),
        prisma.pencairan_pendapatan.count({ where: { status: "berhasil" } }),
        prisma.pencairan_pendapatan.count({ where: { status: "ditolak" } }),
      ]);

    // 5. Total amounts by status
    const withdrawalTotals = await prisma.pencairan_pendapatan.groupBy({
      by: ["status"],
      _sum: { jumlah: true },
    });

    const withdrawalMap = {};
    withdrawalTotals.forEach((item) => {
      withdrawalMap[item.status] = Number(item._sum.jumlah || 0);
    });

    const totalTransactionFees = Number(transactionFees._sum.biaya_admin || 0);
    const totalWithdrawalFees = Number(
      withdrawalFees._sum.biaya_admin_pencairan || 0,
    );
    const totalEarnings = totalTransactionFees + totalWithdrawalFees;

    return res.json({
      message: "Dashboard pendapatan admin",
      earnings_summary: {
        total_transaction_fees: totalTransactionFees,
        total_withdrawal_fees: totalWithdrawalFees,
        total_earnings: totalEarnings,
      },
      withdrawal_status: {
        pending: {
          count: pendingCount,
          total: withdrawalMap.pending || 0,
          data: pendingWithdrawals.map((w) => ({
            id: w.id,
            mitra_nama: w.mitra.user.nama,
            mitra_email: w.mitra.user.email,
            jumlah: Number(w.jumlah),
            created_at: w.created_at,
          })),
        },
        processing: {
          count: processingCount,
          total: withdrawalMap.diproses || 0,
          data: processingWithdrawals.map((w) => ({
            id: w.id,
            mitra_nama: w.mitra.user.nama,
            mitra_email: w.mitra.user.email,
            jumlah: Number(w.jumlah),
            created_at: w.created_at,
          })),
        },
        approved: {
          count: approvedCount,
          total: withdrawalMap.berhasil || 0,
        },
        rejected: {
          count: rejectedCount,
          total: withdrawalMap.ditolak || 0,
        },
      },
      stats: {
        total_pending_withdrawal: withdrawalMap.pending || 0,
        total_processing_withdrawal: withdrawalMap.diproses || 0,
        total_approved_withdrawal: withdrawalMap.berhasil || 0,
      },
    });
  } catch (err) {
    console.error("ADMIN EARNINGS DASHBOARD ERROR:", err);
    return res
      .status(500)
      .json({
        message: "Gagal mengambil dashboard pendapatan",
        error: err.message,
      });
  }
};
