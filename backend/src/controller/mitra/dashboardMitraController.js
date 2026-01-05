import prisma from "../../utils/prismaClient.js";

/**
 * Helper: range hari ini WIB
 */
function getTodayRangeWIB() {
  const now = new Date();
  const wibOffset = 7 * 60 * 60 * 1000;

  const wibNow = new Date(now.getTime() + wibOffset);

  const start = new Date(wibNow);
  start.setHours(0, 0, 0, 0);

  const end = new Date(wibNow);
  end.setHours(23, 59, 59, 999);

  // balik ke UTC
  start.setTime(start.getTime() - wibOffset);
  end.setTime(end.getTime() - wibOffset);

  return { start, end };
}

/**
 * ===============================
 * DASHBOARD SUMMARY MITRA
 * ===============================
 */
export const getDashboardMitra = async (req, res) => {
  try {
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({ message: "Akun ini bukan mitra" });
    }

    const mitraId = mitra.id;
    const { start, end } = getTodayRangeWIB();

    const [totalBooking, bookingHariIni, bookings] = await Promise.all([
      prisma.order_booking.count({
        where: {
          status: "dibayar",
          lapangan: { mitra_id: mitraId },
        },
      }),
      prisma.order_booking.count({
        where: {
          status: "dibayar",
          tanggal: { gte: start, lte: end },
          lapangan: { mitra_id: mitraId },
        },
      }),
      prisma.order_booking.findMany({
        where: {
          status: "dibayar",
          lapangan: { mitra_id: mitraId },
        },
        select: { total_harga: true },
      }),
    ]);

    const totalPendapatan = bookings.reduce(
      (sum, b) => sum + Math.floor(Number(b.total_harga) / 1.11),
      0
    );

    return res.json({
      message: "Dashboard mitra berhasil diambil",
      data: {
        total_booking: totalBooking,
        booking_hari_ini: bookingHariIni,
        total_pendapatan: totalPendapatan,
      },
    });
  } catch (error) {
    console.error("DASHBOARD MITRA ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil dashboard mitra" });
  }
};

/**
 * ===============================
 * GRAFIK REVENUE MITRA
 * ===============================
 */
export const getRevenueChartMitra = async (req, res) => {
  try {
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({ message: "Akun ini bukan mitra" });
    }

    const mitraId = mitra.id;

    const bookings = await prisma.order_booking.findMany({
      where: {
        status: "dibayar",
        lapangan: { mitra_id: mitraId },
      },
      select: {
        tanggal: true,
        total_harga: true,
      },
      orderBy: { tanggal: "asc" },
    });

    const grouped = Object.create(null);

    for (const b of bookings) {
      const dateKey = b.tanggal.toISOString().slice(0, 10);
      const net = Math.floor(Number(b.total_harga) / 1.11);

      grouped[dateKey] = (grouped[dateKey] || 0) + net;
    }

    const data = Object.entries(grouped).map(([date, total]) => ({
      date,
      total,
    }));

    return res.json({
      message: "Grafik revenue berhasil diambil",
      data,
    });
  } catch (error) {
    console.error("REVENUE MITRA ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil grafik revenue" });
  }
};
