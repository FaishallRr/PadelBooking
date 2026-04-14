// src/controller/pencairanController.js
import prisma from "../utils/prismaClient.js";
import { createNotification } from "../utils/notificationHelper.js";
import { WITHDRAWAL_FEE_PERCENT, calculateWithdrawalAmounts } from "../utils/constants.js";

// =============================================
// MITRA: Ajukan Pencairan
// POST /api/mitra/pencairan
// body: { jumlah }
// =============================================
export const requestPencairan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { jumlah } = req.body;

    if (!jumlah || jumlah <= 0) {
      return res.status(400).json({ message: "Jumlah pencairan harus lebih dari 0" });
    }

    // Ambil mitra
    const mitra = await prisma.mitra.findUnique({ where: { userId } });
    if (!mitra) return res.status(403).json({ message: "Bukan akun mitra" });
    if (mitra.status !== "aktif") return res.status(403).json({ message: "Akun mitra belum aktif" });

    // ✅ VALIDATE BANK DETAILS
    if (!mitra.bank_mitra || !mitra.no_rekening_mitra) {
      return res.status(400).json({
        message: "Data rekening bank belum lengkap. Silakan update data mitra terlebih dahulu.",
        required: ["bank_mitra", "no_rekening_mitra"],
      });
    }

    // Hitung saldo tersedia (belum dicairkan)
    const pendapatan = await prisma.pendapatan_mitra.findMany({
      where: { mitra_id: mitra.id, status: "belum_cair" },
    });
    const saldoTersedia = pendapatan.reduce((sum, p) => sum + Number(p.jumlah), 0);

    // Cek pencairan yang masih pending
    const pendingPencairan = await prisma.pencairan_pendapatan.findMany({
      where: { mitra_id: mitra.id, status: { in: ["pending", "diproses"] } },
    });
    const totalPending = pendingPencairan.reduce((sum, p) => sum + Number(p.jumlah), 0);

    const saldoAvailable = saldoTersedia - totalPending;

    if (jumlah > saldoAvailable) {
      return res.status(400).json({
        message: `Saldo tersedia tidak cukup. Tersedia: Rp ${saldoAvailable.toLocaleString("id-ID")}`,
        saldo_tersedia: saldoAvailable,
      });
    }

    // ✅ CALCULATE WITHDRAWAL AMOUNTS (dengan fee)
    const { withdrawalFee, netAmount } = calculateWithdrawalAmounts(jumlah);

    // ✅ CREATE PENCAIRAN WITH BANK SNAPSHOT
    const pencairan = await prisma.pencairan_pendapatan.create({
      data: {
        mitra_id: mitra.id,
        jumlah,
        status: "pending",
        bank_name: mitra.bank_mitra, // 🔥 SNAPSHOT BANK DATA
        account_number: mitra.no_rekening_mitra, // 🔥 SNAPSHOT ACCOUNT
        // Will be set on approval: biaya_admin_pencairan, jumlah_diterima
      },
    });

    // Return response dengan preview fee calculation
    res.status(201).json({
      message: "Pencairan berhasil diajukan",
      data: {
        id: pencairan.id,
        jumlah_requested: Number(jumlah),
        estimated_withdrawal_fee: withdrawalFee,
        estimated_net_amount: netAmount,
        bank_name: mitra.bank_mitra,
        account_number: mitra.no_rekening_mitra,
        status: pencairan.status,
        created_at: pencairan.created_at,
        note: "Fee admin 5% akan dipotong setelah disetujui oleh admin",
      },
    });
  } catch (err) {
    console.error("REQUEST PENCAIRAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengajukan pencairan", error: err.message });
  }
};

// =============================================
// MITRA: Lihat Riwayat Pencairan
// GET /api/mitra/pencairan
// =============================================
export const getMyPencairan = async (req, res) => {
  try {
    const mitra = await prisma.mitra.findUnique({ where: { userId: req.user.id } });
    if (!mitra) return res.status(403).json({ message: "Bukan akun mitra" });

    // Saldo tersedia
    const pendapatan = await prisma.pendapatan_mitra.findMany({
      where: { mitra_id: mitra.id, status: "belum_cair" },
    });
    const saldoTersedia = pendapatan.reduce((sum, p) => sum + Number(p.jumlah), 0);

    // Pending pencairan
    const pendingPencairan = await prisma.pencairan_pendapatan.findMany({
      where: { mitra_id: mitra.id, status: { in: ["pending", "diproses"] } },
    });
    const totalPending = pendingPencairan.reduce((sum, p) => sum + Number(p.jumlah), 0);

    // Riwayat pencairan
    const pencairan = await prisma.pencairan_pendapatan.findMany({
      where: { mitra_id: mitra.id },
      orderBy: { created_at: "desc" },
    });

    // Total sudah dicairkan
    const totalDicairkan = pencairan
      .filter((p) => p.status === "berhasil")
      .reduce((sum, p) => sum + Number(p.jumlah_diterima), 0);

    res.json({
      saldo_tersedia: saldoTersedia - totalPending,
      total_pending: totalPending,
      total_dicairkan: totalDicairkan,
      data: pencairan,
    });
  } catch (err) {
    console.error("GET MY PENCAIRAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data pencairan" });
  }
};

// =============================================
// ADMIN: List Semua Pencairan
// GET /api/admin/pencairan
// =============================================
export const getAllPencairan = async (req, res) => {
  try {
    const pencairan = await prisma.pencairan_pendapatan.findMany({
      include: {
        mitra: {
          include: {
            user: { select: { nama: true, email: true } },
          },
        },
      },
      orderBy: { created_at: "desc" },
    });

    res.json({ data: pencairan });
  } catch (err) {
    console.error("GET ALL PENCAIRAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil data pencairan" });
  }
};

// =============================================
// ADMIN: Setujui Pencairan
// POST /api/admin/pencairan/approve
// body: { pencairan_id }
// =============================================
export const approvePencairan = async (req, res) => {
  try {
    const { pencairan_id } = req.body;
    if (!pencairan_id) return res.status(400).json({ message: "pencairan_id wajib" });

    const pencairan = await prisma.pencairan_pendapatan.findUnique({
      where: { id: Number(pencairan_id) },
      include: { mitra: true },
    });

    if (!pencairan) return res.status(404).json({ message: "Pencairan tidak ditemukan" });
    if (pencairan.status !== "pending") {
      return res.status(400).json({ message: "Pencairan sudah diproses" });
    }

    // ✅ USE CONSTANT FOR WITHDRAWAL FEE
    const biayaAdminPencairan = Math.round(Number(pencairan.jumlah) * WITHDRAWAL_FEE_PERCENT);
    const jumlahDiterima = Number(pencairan.jumlah) - biayaAdminPencairan;

    await prisma.$transaction(async (tx) => {
      // 1. Update pencairan
      await tx.pencairan_pendapatan.update({
        where: { id: pencairan.id },
        data: {
          status: "berhasil",
          biaya_admin_pencairan: biayaAdminPencairan,
          jumlah_diterima: jumlahDiterima,
          processed_at: new Date(),
        },
      });

      // 2. Update pendapatan_mitra yang belum cair → sudah_cair
      // Tandai pendapatan sebanyak jumlah pencairan
      const pendapatanBelumCair = await tx.pendapatan_mitra.findMany({
        where: { mitra_id: pencairan.mitra_id, status: "belum_cair" },
        orderBy: { created_at: "asc" },
      });

      let remaining = Number(pencairan.jumlah);
      for (const p of pendapatanBelumCair) {
        if (remaining <= 0) break;
        const amount = Number(p.jumlah);
        if (amount <= remaining) {
          await tx.pendapatan_mitra.update({
            where: { id: p.id },
            data: { status: "sudah_cair" },
          });
          remaining -= amount;
        }
      }
    });

    // Notifikasi ke mitra
    await createNotification(
      pencairan.mitra.userId,
      `Pencairan Rp ${Number(pencairan.jumlah).toLocaleString("id-ID")} disetujui. Diterima: Rp ${jumlahDiterima.toLocaleString("id-ID")} (setelah potongan admin 5%).`
    );

    res.json({
      message: "Pencairan berhasil disetujui",
      jumlah: Number(pencairan.jumlah),
      biaya_admin: biayaAdminPencairan,
      jumlah_diterima: jumlahDiterima,
    });
  } catch (err) {
    console.error("APPROVE PENCAIRAN ERROR:", err);
    res.status(500).json({ message: "Gagal menyetujui pencairan" });
  }
};

// =============================================
// ADMIN: Tolak Pencairan
// POST /api/admin/pencairan/reject
// body: { pencairan_id, catatan }
// =============================================
export const rejectPencairan = async (req, res) => {
  try {
    const { pencairan_id, catatan } = req.body;
    if (!pencairan_id) return res.status(400).json({ message: "pencairan_id wajib" });

    const pencairan = await prisma.pencairan_pendapatan.findUnique({
      where: { id: Number(pencairan_id) },
      include: { mitra: true },
    });

    if (!pencairan) return res.status(404).json({ message: "Pencairan tidak ditemukan" });
    if (pencairan.status !== "pending") {
      return res.status(400).json({ message: "Pencairan sudah diproses" });
    }

    await prisma.pencairan_pendapatan.update({
      where: { id: pencairan.id },
      data: {
        status: "ditolak",
        catatan: catatan || "Ditolak oleh admin",
        processed_at: new Date(),
      },
    });

    // Notifikasi ke mitra
    await createNotification(
      pencairan.mitra.userId,
      `Pencairan Rp ${Number(pencairan.jumlah).toLocaleString("id-ID")} ditolak. Alasan: ${catatan || "Tidak ada keterangan"}`
    );

    res.json({ message: "Pencairan ditolak" });
  } catch (err) {
    console.error("REJECT PENCAIRAN ERROR:", err);
    res.status(500).json({ message: "Gagal menolak pencairan" });
  }
};
