import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/adminOnly.js";
import {
  getAdminDashboardSummary,
  getAllLapanganAdmin,
  toggleStatusLapanganAdmin,
  deleteLapanganAdmin,
} from "../controller/lapanganController.js";
import {
  getAllMitra,
  updateMitraStatus,
  getMitraPendapatan,
  getAdminRevenueChart,
  getAdminEarningsDashboard,
} from "../controller/adminMitraController.js";
import {
  getAllTransactions,
  getTransactionDetail,
  getTransactionStats,
} from "../controller/adminTransactionController.js";
import {
  getAllPencairan,
  approvePencairan,
  rejectPencairan,
} from "../controller/pencairanController.js";
import {
  getAllRefundsAdmin,
} from "../controller/refundController.js";

const router = express.Router();

// Dashboard
router.get("/dashboard/summary", authMiddleware, adminOnly, getAdminDashboardSummary);
router.get("/revenue-chart", authMiddleware, adminOnly, getAdminRevenueChart);

// 💰 EARNINGS DASHBOARD (NEW)
router.get("/earnings-dashboard", authMiddleware, adminOnly, getAdminEarningsDashboard);

// 💳 TRANSACTIONS (NEW)
router.get("/transactions", authMiddleware, adminOnly, getAllTransactions);
router.get("/transactions/stats/summary", authMiddleware, adminOnly, getTransactionStats);
router.get("/transactions/:id", authMiddleware, adminOnly, getTransactionDetail);

// Lapangan
router.get("/lapangan", authMiddleware, adminOnly, getAllLapanganAdmin);
router.patch("/lapangan/:slug/toggle-status", authMiddleware, adminOnly, toggleStatusLapanganAdmin);
router.delete("/lapangan/:slug", authMiddleware, adminOnly, deleteLapanganAdmin);

// Refund
router.get("/refunds", authMiddleware, adminOnly, getAllRefundsAdmin);

// Mitra Management
router.get("/mitra", authMiddleware, adminOnly, getAllMitra);
router.patch("/mitra/:id/status", authMiddleware, adminOnly, updateMitraStatus);
router.get("/mitra/:id/pendapatan", authMiddleware, adminOnly, getMitraPendapatan);

// Pencairan
router.get("/pencairan", authMiddleware, adminOnly, getAllPencairan);
router.post("/pencairan/approve", authMiddleware, adminOnly, approvePencairan);
router.post("/pencairan/reject", authMiddleware, adminOnly, rejectPencairan);

export default router;
