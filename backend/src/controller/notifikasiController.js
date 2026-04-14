// src/controller/notifikasiController.js
import prisma from "../utils/prismaClient.js";

/**
 * GET /api/notifikasi
 * Ambil notifikasi milik user login
 */
export const getMyNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const notifikasi = await prisma.notifikasi.findMany({
      where: { user_id: userId },
      orderBy: { created_at: "desc" },
      take: 50,
    });

    const unreadCount = await prisma.notifikasi.count({
      where: { user_id: userId, dibaca: false },
    });

    res.json({
      unread_count: unreadCount,
      data: notifikasi,
    });
  } catch (err) {
    console.error("GET NOTIFIKASI ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil notifikasi" });
  }
};

/**
 * PATCH /api/notifikasi/:id/read
 * Tandai notifikasi sudah dibaca
 */
export const markAsRead = async (req, res) => {
  try {
    const userId = req.user.id;
    const notifId = Number(req.params.id);

    const notif = await prisma.notifikasi.findUnique({
      where: { id: notifId },
    });

    if (!notif || notif.user_id !== userId) {
      return res.status(404).json({ message: "Notifikasi tidak ditemukan" });
    }

    await prisma.notifikasi.update({
      where: { id: notifId },
      data: { dibaca: true },
    });

    res.json({ message: "Notifikasi ditandai sudah dibaca" });
  } catch (err) {
    console.error("MARK READ ERROR:", err);
    res.status(500).json({ message: "Gagal update notifikasi" });
  }
};

/**
 * PATCH /api/notifikasi/read-all
 * Tandai semua notifikasi sudah dibaca
 */
export const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    await prisma.notifikasi.updateMany({
      where: { user_id: userId, dibaca: false },
      data: { dibaca: true },
    });

    res.json({ message: "Semua notifikasi ditandai sudah dibaca" });
  } catch (err) {
    console.error("MARK ALL READ ERROR:", err);
    res.status(500).json({ message: "Gagal update notifikasi" });
  }
};
