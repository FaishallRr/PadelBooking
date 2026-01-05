import express from "express";
import prisma from "../utils/prismaClient.js";

const router = express.Router();

/**
 * GET /api/jadwal?lapangan_id=14
 */
router.get("/", async (req, res) => {
  try {
    const lapangan_id = Number(req.query.lapangan_id);
    if (!lapangan_id || Number.isNaN(lapangan_id)) {
      return res.status(400).json({ error: "lapangan_id wajib number" });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const jadwal = await prisma.jadwalLapangan.findMany({
      where: {
        lapangan_id,
        tanggal: { gte: today },
      },
      orderBy: [{ tanggal: "asc" }, { slot: "asc" }],
    });

    const data = jadwal.map((j) => {
      const [jamMulai, jamSelesai] = j.slot.split("-");
      return {
        id: j.id, // 🔥 INI YANG MASUK CART
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
});

export default router;
