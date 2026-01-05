import prisma from "../../utils/prismaClient.js";

export const getBookingMitra = async (req, res) => {
  try {
    // 1️⃣ ambil mitra
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({
        message: "Akun ini bukan mitra",
      });
    }

    const mitraId = mitra.id;

    // 2️⃣ ambil booking
    const bookings = await prisma.order_booking.findMany({
      where: {
        lapangan: {
          mitra_id: mitraId,
        },
      },
      orderBy: {
        created_at: "desc",
      },
      include: {
        user: {
          select: {
            nama: true,
            email: true,
          },
        },
        lapangan: {
          select: {
            nama: true,
            lokasi: true,
          },
        },
      },
    });

    res.status(200).json({
      message: "Data booking mitra berhasil diambil",
      total: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error("BOOKING MITRA ERROR:", error);
    res.status(500).json({
      message: "Gagal mengambil booking mitra",
    });
  }
};
