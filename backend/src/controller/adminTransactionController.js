// src/controller/adminTransactionController.js
import prisma from "../utils/prismaClient.js";

/**
 * GET /api/admin/transactions
 * Get all transactions with detailed breakdown
 * Query params: ?status=pending|berhasil|gagal&page=1&limit=50&startDate=2026-04-01&endDate=2026-04-30
 */
export const getAllTransactions = async (req, res) => {
  try {
    const { status, page = 1, limit = 50, startDate, endDate } = req.query;
    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(500, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    // Build filter
    const where = {};

    if (status) {
      where.status_pembayaran = status;
    }

    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    // Get transactions
    const [transactions, total] = await Promise.all([
      prisma.transaksi.findMany({
        where,
        include: {
          user: { select: { id: true, nama: true, email: true, no_hp: true } },
          lapangan: { select: { id: true, nama: true, lokasi: true } },
          order: { select: { id: true, tanggal: true, jam_mulai: true, jam_selesai: true, status: true } },
        },
        orderBy: { created_at: "desc" },
        take: limitNum,
        skip,
      }),
      prisma.transaksi.count({ where }),
    ]);

    // Format response
    const data = transactions.map((t) => ({
      id: t.id,
      order_id: t.order_id,
      midtrans_order_id: t.midtrans_order_id,
      user: t.user,
      lapangan: t.lapangan,
      order: t.order,
      total_harga: Number(t.total_harga),
      biaya_admin: Number(t.biaya_admin),
      biaya_mitra: Number(t.biaya_mitra),
      status_pembayaran: t.status_pembayaran,
      payment_type: t.payment_type,
      created_at: t.created_at,
      net_amount: Number(t.total_harga) - Number(t.biaya_admin),
    }));

    return res.json({
      message: "Transaksi berhasil diambil",
      data,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages: Math.ceil(total / limitNum),
      },
      summary: {
        total_transactions: total,
        total_revenue: data.reduce((sum, t) => sum + t.total_harga, 0),
        total_admin_fee: data.reduce((sum, t) => sum + t.biaya_admin, 0),
        total_mitra_earning: data.reduce((sum, t) => sum + t.biaya_mitra, 0),
      },
    });
  } catch (err) {
    console.error("getAllTransactions error:", err);
    return res.status(500).json({ message: "Gagal mengambil transaksi", error: err.message });
  }
};

/**
 * GET /api/admin/transactions/:id
 * Get transaction details
 */
export const getTransactionDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, nama: true, email: true, no_hp: true, username: true } },
        lapangan: {
          include: {
            mitra: { include: { user: { select: { nama: true, email: true } } } },
          },
        },
        order: {
          include: {
            transaksi: true,
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    return res.json({
      message: "Detail transaksi",
      data: {
        ...transaksi,
        total_harga: Number(transaksi.total_harga),
        biaya_admin: Number(transaksi.biaya_admin),
        biaya_mitra: Number(transaksi.biaya_mitra),
      },
    });
  } catch (err) {
    console.error("getTransactionDetail error:", err);
    return res.status(500).json({ message: "Gagal mengambil detail transaksi" });
  }
};

/**
 * GET /api/admin/transactions/stats/summary
 * Get transaction statistics
 */
export const getTransactionStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const where = {};
    if (startDate || endDate) {
      where.created_at = {};
      if (startDate) {
        where.created_at.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.created_at.lte = end;
      }
    }

    const [successCount, pendingCount, failedCount, totalRevenue, totalAdminFee] = await Promise.all([
      prisma.transaksi.count({ where: { ...where, status_pembayaran: "berhasil" } }),
      prisma.transaksi.count({ where: { ...where, status_pembayaran: "pending" } }),
      prisma.transaksi.count({ where: { ...where, status_pembayaran: "gagal" } }),
      prisma.transaksi.aggregate({
        where: { ...where, status_pembayaran: "berhasil" },
        _sum: { total_harga: true },
      }),
      prisma.transaksi.aggregate({
        where: { ...where, status_pembayaran: "berhasil" },
        _sum: { biaya_admin: true },
      }),
    ]);

    return res.json({
      message: "Statistik transaksi",
      stats: {
        success: successCount,
        pending: pendingCount,
        failed: failedCount,
        total_transactions: successCount + pendingCount + failedCount,
        total_revenue: Number(totalRevenue._sum.total_harga || 0),
        total_admin_fee: Number(totalAdminFee._sum.biaya_admin || 0),
        average_transaction: successCount > 0 ? Math.round((Number(totalRevenue._sum.total_harga || 0)) / successCount) : 0,
      },
    });
  } catch (err) {
    console.error("getTransactionStats error:", err);
    return res.status(500).json({ message: "Gagal mengambil statistik" });
  }
};
