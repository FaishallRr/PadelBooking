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

    const [totalBooking, bookingHariIni, pendapatanAll] = await Promise.all([
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
      prisma.pendapatan_mitra.findMany({
        where: { mitra_id: mitraId },
        select: { jumlah: true, status: true },
      }),
    ]);

    const totalPendapatan = pendapatanAll.reduce(
      (sum, p) => sum + Number(p.jumlah),
      0
    );
    const pendapatanBelumCair = pendapatanAll
      .filter((p) => p.status === "belum_cair")
      .reduce((sum, p) => sum + Number(p.jumlah), 0);

    return res.json({
      message: "Dashboard mitra berhasil diambil",
      data: {
        total_booking: totalBooking,
        booking_hari_ini: bookingHariIni,
        total_pendapatan: totalPendapatan,
        pendapatan_belum_cair: pendapatanBelumCair,
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

    // Ambil dari pendapatan_mitra (sumber kebenaran)
    const pendapatan = await prisma.pendapatan_mitra.findMany({
      where: { mitra_id: mitraId },
      include: {
        transaksi: {
          select: { created_at: true },
        },
      },
      orderBy: { created_at: "asc" },
    });

    const grouped = Object.create(null);

    for (const p of pendapatan) {
      const dateKey = p.created_at.toISOString().slice(0, 10);
      grouped[dateKey] = (grouped[dateKey] || 0) + Number(p.jumlah);
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

/**
 * ===============================
 * DETAIL PENDAPATAN MITRA
 * ===============================
 */
export const getPendapatanDetail = async (req, res) => {
  try {
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({ message: "Akun ini bukan mitra" });
    }

    const pendapatan = await prisma.pendapatan_mitra.findMany({
      where: { mitra_id: mitra.id },
      include: {
        transaksi: {
          select: {
            id: true,
            total_harga: true,
            biaya_admin: true,
            biaya_mitra: true,
            payment_type: true,
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

    const totalPendapatan = pendapatan.reduce((sum, p) => sum + Number(p.jumlah), 0);
    const belumCair = pendapatan
      .filter((p) => p.status === "belum_cair")
      .reduce((sum, p) => sum + Number(p.jumlah), 0);
    const sudahCair = pendapatan
      .filter((p) => p.status === "sudah_cair")
      .reduce((sum, p) => sum + Number(p.jumlah), 0);

    res.json({
      total_pendapatan: totalPendapatan,
      belum_cair: belumCair,
      sudah_cair: sudahCair,
      data: pendapatan,
    });
  } catch (error) {
    console.error("GET PENDAPATAN DETAIL ERROR:", error);
    res.status(500).json({ message: "Gagal mengambil detail pendapatan" });
  }
};
