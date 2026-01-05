import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  getAdminDashboardSummary,
  getAllLapanganAdmin,
  toggleStatusLapanganAdmin,
  deleteLapanganAdmin,
  getAllRefunds,
} from "../controller/lapanganController.js";

const router = express.Router();

router.get(
  "/dashboard/summary",
  authMiddleware,
  adminOnly,
  getAdminDashboardSummary
);

router.get("/lapangan", authMiddleware, adminOnly, getAllLapanganAdmin);

// 🔥 TAMBAHAN INI
router.patch(
  "/lapangan/:slug/toggle-status",
  authMiddleware,
  adminOnly,
  toggleStatusLapanganAdmin
);

router.delete(
  "/lapangan/:slug",
  authMiddleware,
  adminOnly,
  deleteLapanganAdmin
);

router.get("/refunds", authMiddleware, adminOnly, getAllRefunds);

export default router;
