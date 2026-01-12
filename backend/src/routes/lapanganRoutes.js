import express from "express";
import { uploadLapangan } from "../middleware/uploadLapangan.js";
import { handleMulter } from "../utils/handleMulter.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getLapanganList,
  getLapanganBySlug,
  uploadGambar,
  createJadwal,
  getLapanganMitra,
  tambahLapangan,
  getDetailLapangan,
  updateLapangan,
  deleteLapangan,
  updateStatusLapangan,
  toggleStatusLapangan,
} from "../controller/lapanganController.js";

const router = express.Router();

/* ============================================
   MITRA — PROTECTED ROUTES
============================================ */

// Semua lapangan milik mitra
router.get("/mitra/lapangan", authMiddleware, getLapanganMitra);

// Tambah lapangan
router.post(
  "/mitra/lapangan/tambah-data",
  authMiddleware,
  uploadLapangan.fields([
    { name: "gambarUtama", maxCount: 1 },
    { name: "gambarList", maxCount: 10 },
  ]),
  tambahLapangan
);

// Update lapangan
router.put(
  "/mitra/lapangan/:slug",
  authMiddleware,
  uploadLapangan.fields([
    { name: "gambarUtama", maxCount: 1 },
    { name: "gambarList", maxCount: 10 },
  ]),
  updateLapangan
);

// Hapus lapangan
router.delete("/mitra/lapangan/:slug", authMiddleware, deleteLapangan);

// Update status lapangan manual
router.patch(
  "/mitra/lapangan/:slug/status",
  authMiddleware,
  updateStatusLapangan
);

// Toggle status lapangan otomatis
router.patch(
  "/mitra/lapangan/:slug/toggle-status",
  authMiddleware,
  toggleStatusLapangan
);

// Detail lapangan milik mitra
router.get("/mitra/lapangan/:slug", authMiddleware, getDetailLapangan);

// Upload gambar ekstra
router.post(
  "/mitra/lapangan/:id/upload",
  authMiddleware,
  handleMulter(uploadLapangan.array("gambarList", 10)),
  uploadGambar
);

// Buat slot manual
router.post("/mitra/lapangan/:id/create-slots", authMiddleware, createJadwal);

/* ============================================
   PUBLIC ROUTES
============================================ */

// List semua lapangan
router.get("/", getLapanganList);

// Detail lapangan public
router.get("/:slug", getLapanganBySlug);

export default router;
