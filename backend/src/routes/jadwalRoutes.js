import express from "express";
import prisma from "../utils/prismaClient.js";

const router = express.Router();

// Handler function untuk beide routes
async function getAvailableJadwal(req, res) {
  try {
    const lapangan_id = Number(req.query.lapangan_id);
    if (!lapangan_id || Number.isNaN(lapangan_id)) {
      return res.status(400).json({ error: "lapangan_id wajib number" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter by specific tanggal if provided
    let whereFilter = {
      lapangan_id,
      tanggal: { gte: today },
      status: "tersedia",
    };

    if (req.query.tanggal) {
      const filterDate = new Date(req.query.tanggal);
      filterDate.setHours(0, 0, 0, 0);
      const nextDate = new Date(filterDate);
      nextDate.setDate(nextDate.getDate() + 1);

      whereFilter.tanggal = {
        gte: filterDate,
        lt: nextDate,
      };
    }

    const jadwal = await prisma.jadwalLapangan.findMany({
      where: whereFilter,
      orderBy: [{ tanggal: "asc" }, { slot: "asc" }],
    });

    const data = jadwal.map((j) => {
      const [jamMulai, jamSelesai] = j.slot.split("-");
      return {
        id: j.id,
        lapanganId: j.lapangan_id,
        tanggal: j.tanggal.toISOString().split("T")[0],
        jamMulai: jamMulai.trim(),
        jamSelesai: jamSelesai.trim(),
        status: j.status,
      };
    });

    res.json({ data });
  } catch (err) {
    console.error("GET /api/jadwal error:", err);
    res.status(500).json({ error: "Failed to fetch jadwal" });
  }
}

/**
 * GET /api/jadwal?lapangan_id=14&tanggal=2024-01-15
 */
router.get("/", getAvailableJadwal);

/**
 * GET /api/jadwal/available?lapangan_id=14&tanggal=2024-01-15
 */
router.get("/available", getAvailableJadwal);

export default router;
