// src/controller/ulasanController.js
import prisma from "../utils/prismaClient.js";

/**
 * POST /api/ulasan
 * Buat ulasan setelah booking selesai
 * body: { order_id, rating (1-5), komentar }
 */
export const createUlasan = async (req, res) => {
  try {
    const userId = req.user.id;
    const { order_id, rating, komentar } = req.body;

    if (!order_id || !rating) {
      return res.status(400).json({ message: "order_id dan rating wajib diisi" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating harus 1-5" });
    }

    // Ambil order
    const order = await prisma.order_booking.findUnique({
      where: { id: Number(order_id) },
      include: { lapangan: true },
    });

    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });
    if (order.user_id !== userId) return res.status(403).json({ message: "Bukan order Anda" });
    if (order.status !== "dibayar") {
      return res.status(400).json({ message: "Hanya order yang sudah dibayar yang bisa diulas" });
    }

    // Cek sudah tanggal bermain
    const now = new Date();
    const tanggalMain = new Date(order.tanggal);
    if (now < tanggalMain) {
      return res.status(400).json({ message: "Anda hanya bisa mengulas setelah tanggal bermain" });
    }

    // Cek apakah sudah pernah ulasan
    const existing = await prisma.ulasan.findFirst({
      where: { user_id: userId, lapangan_id: order.lapangan_id },
    });

    if (existing) {
      return res.status(400).json({ message: "Anda sudah pernah memberikan ulasan untuk lapangan ini" });
    }

    // Buat ulasan
    const ulasan = await prisma.ulasan.create({
      data: {
        user_id: userId,
        lapangan_id: order.lapangan_id,
        rating: Number(rating),
        komentar: komentar || null,
      },
    });

    // Update rata-rata rating lapangan
    const allUlasan = await prisma.ulasan.findMany({
      where: { lapangan_id: order.lapangan_id },
      select: { rating: true },
    });

    const avgRating = allUlasan.reduce((sum, u) => sum + u.rating, 0) / allUlasan.length;

    await prisma.lapangan.update({
      where: { id: order.lapangan_id },
      data: { rating: Math.round(avgRating * 10) / 10 }, // 1 decimal
    });

    res.status(201).json({
      message: "Ulasan berhasil dikirim",
      data: ulasan,
      rating_lapangan: Math.round(avgRating * 10) / 10,
    });
  } catch (err) {
    console.error("CREATE ULASAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengirim ulasan" });
  }
};

/**
 * GET /api/ulasan/lapangan/:lapanganId
 * Ambil semua ulasan untuk lapangan tertentu
 */
export const getUlasanByLapangan = async (req, res) => {
  try {
    const lapanganId = Number(req.params.lapanganId);

    const ulasan = await prisma.ulasan.findMany({
      where: { lapangan_id: lapanganId },
      include: {
        user: {
          select: { nama: true, foto: true, username: true },
        },
      },
      orderBy: { created_at: "desc" },
    });

    // Stats
    const totalUlasan = ulasan.length;
    const avgRating = totalUlasan > 0
      ? Math.round((ulasan.reduce((sum, u) => sum + u.rating, 0) / totalUlasan) * 10) / 10
      : 0;

    const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    ulasan.forEach((u) => { distribution[u.rating]++; });

    res.json({
      total: totalUlasan,
      average_rating: avgRating,
      distribution,
      data: ulasan,
    });
  } catch (err) {
    console.error("GET ULASAN ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil ulasan" });
  }
};

/**
 * GET /api/ulasan/check/:orderId
 * Cek apakah user sudah memberikan ulasan untuk order tertentu
 */
export const checkUlasan = async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = Number(req.params.orderId);

    const order = await prisma.order_booking.findUnique({
      where: { id: orderId },
    });

    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

    const existing = await prisma.ulasan.findFirst({
      where: { user_id: userId, lapangan_id: order.lapangan_id },
    });

    res.json({ hasReviewed: !!existing, ulasan: existing });
  } catch (err) {
    console.error("CHECK ULASAN ERROR:", err);
    res.status(500).json({ message: "Gagal cek ulasan" });
  }
};
