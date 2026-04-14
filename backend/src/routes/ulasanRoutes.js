import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createUlasan,
  getUlasanByLapangan,
  checkUlasan,
} from "../controller/ulasanController.js";

const router = express.Router();

// User: buat ulasan
router.post("/", authMiddleware, createUlasan);

// Public: ambil ulasan per lapangan
router.get("/lapangan/:lapanganId", getUlasanByLapangan);

// User: cek apakah sudah ulasan
router.get("/check/:orderId", authMiddleware, checkUlasan);

export default router;
