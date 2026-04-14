import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  requestPencairan,
  getMyPencairan,
} from "../../controller/pencairanController.js";

const router = express.Router();

// Mitra: ajukan pencairan
router.post("/pencairan", authMiddleware, requestPencairan);

// Mitra: lihat riwayat pencairan
router.get("/pencairan", authMiddleware, getMyPencairan);

export default router;
