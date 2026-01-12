import express from "express";
import {
  uploadLapangan,
  uploadToCloudinary,
} from "../middleware/uploadLapangan.js";
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
  async (req, res) => {
    try {
      // Upload gambar utama
      let gambarUtamaUrl = null;
      if (req.files["gambarUtama"]?.length) {
        gambarUtamaUrl = await uploadToCloudinary(
          req.files["gambarUtama"][0].buffer,
          "lapangan"
        );
      }

      // Upload gambar list
      let gambarListUrls = [];
      if (req.files["gambarList"]?.length) {
        for (const file of req.files["gambarList"]) {
          const url = await uploadToCloudinary(file.buffer, "lapangan");
          gambarListUrls.push(url);
        }
      }

      // Panggil controller dengan URL Cloudinary
      await tambahLapangan(req, res, { gambarUtamaUrl, gambarListUrls });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload gagal", error: err.message });
    }
  }
);

// Update lapangan
router.put(
  "/mitra/lapangan/:slug",
  authMiddleware,
  uploadLapangan.fields([
    { name: "gambarUtama", maxCount: 1 },
    { name: "gambarList", maxCount: 10 },
  ]),
  async (req, res) => {
    try {
      let gambarUtamaUrl = null;
      if (req.files["gambarUtama"]?.length) {
        gambarUtamaUrl = await uploadToCloudinary(
          req.files["gambarUtama"][0].buffer,
          "lapangan"
        );
      }

      let gambarListUrls = [];
      if (req.files["gambarList"]?.length) {
        for (const file of req.files["gambarList"]) {
          const url = await uploadToCloudinary(file.buffer, "lapangan");
          gambarListUrls.push(url);
        }
      }

      await updateLapangan(req, res, { gambarUtamaUrl, gambarListUrls });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Update gagal", error: err.message });
    }
  }
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
  uploadLapangan.array("gambarList", 10),
  async (req, res) => {
    try {
      let gambarListUrls = [];
      if (req.files?.length) {
        for (const file of req.files) {
          const url = await uploadToCloudinary(file.buffer, "lapangan");
          gambarListUrls.push(url);
        }
      }

      await uploadGambar(req, res, { gambarListUrls });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload gagal", error: err.message });
    }
  }
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
