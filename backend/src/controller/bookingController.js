import prisma from "../utils/prismaClient.js";
import { isSlotExpired } from "../utils/isSlotExpired.js";

/**
 * POST /api/booking
 * body: { lapangan_id, jadwalLapanganId, total_harga }
 */
export const createBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const { lapangan_id, jadwalLapanganId, total_harga } = req.body;

    if (!lapangan_id || !jadwalLapanganId || !total_harga) {
      return res.status(400).json({ message: "Data booking tidak lengkap" });
    }

    const jadwal = await prisma.jadwalLapangan.findUnique({
      where: { id: jadwalLapanganId },
    });
    if (!jadwal)
      return res.status(404).json({ message: "Jadwal tidak ditemukan" });

    // Pastikan jadwal.tanggal berupa Date object
    const bookingDate = new Date(jadwal.tanggal);

    if (isSlotExpired(bookingDate.toISOString(), jadwal.slot)) {
      return res.status(400).json({ message: "Jadwal sudah lewat" });
    }

    const [jamMulai, jamSelesai] = jadwal.slot.split("-");

    // Cek booking existing
    const existingBooking = await prisma.order_booking.findFirst({
      where: {
        jadwalLapanganId,
        tanggal: bookingDate,
        status: { in: ["pending", "dibayar"] },
        OR: [{ expired_at: null }, { expired_at: { gt: new Date() } }],
      },
    });

    if (existingBooking) {
      return res.status(400).json({ message: "Jadwal tidak tersedia" });
    }

    // Create booking
    const order = await prisma.order_booking.create({
      data: {
        user_id: userId,
        lapangan_id,
        jadwalLapanganId,
        tanggal: bookingDate,
        jam_mulai: jamMulai,
        jam_selesai: jamSelesai,
        total_harga,
        status: "pending",
        expired_at: new Date(Date.now() + 15 * 60 * 1000),
      },
    });

    return res.status(201).json({
      message: "Booking berhasil",
      data: { order },
    });
  } catch (err) {
    console.error("BOOKING ERROR:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const getMyBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await prisma.order_booking.findMany({
      where: { user_id: userId },
      include: {
        lapangan: { select: { nama: true, slug: true } },
        jadwalLapangan: true,
        transaksi: true,
      },
      orderBy: { created_at: "desc" },
    });

    return res.json(orders);
  } catch (err) {
    console.error("GET MY BOOKING ERROR:", err);
    return res
      .status(500)
      .json({ message: "Gagal mengambil booking", error: err.message });
  }
};

export const getBookingByLapangan = async (req, res) => {
  try {
    const lapanganId = Number(req.params.lapanganId);
    const { tanggal } = req.query;

    if (!lapanganId || !tanggal) {
      return res.status(400).json({ message: "Parameter tidak lengkap" });
    }

    const bookingDate = new Date(`${tanggal}T00:00:00.000Z`); // aman timezone

    const bookings = await prisma.order_booking.findMany({
      where: {
        lapangan_id: lapanganId,
        tanggal: bookingDate,
        status: { in: ["pending", "dibayar"] },
        OR: [{ expired_at: null }, { expired_at: { gt: new Date() } }],
      },
      select: {
        jadwalLapanganId: true,
      },
    });

    return res.json(bookings);
  } catch (err) {
    console.error("GET BOOKING BY LAPANGAN ERROR:", err);
    return res.status(500).json({ message: "Gagal ambil booking" });
  }
};
