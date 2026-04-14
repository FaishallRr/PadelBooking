import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
} from "../controller/notifikasiController.js";

const router = express.Router();

router.get("/", authMiddleware, getMyNotifications);
// ⚠️ /read-all HARUS sebelum /:id/read agar tidak ditangkap oleh :id
router.patch("/read-all", authMiddleware, markAllAsRead);
router.patch("/:id/read", authMiddleware, markAsRead);

export default router;

