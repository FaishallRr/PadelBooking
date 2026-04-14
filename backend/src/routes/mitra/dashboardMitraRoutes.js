import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import {
  getDashboardMitra,
  getRevenueChartMitra,
  getPendapatanDetail,
} from "../../controller/mitra/dashboardMitraController.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboardMitra);
router.get("/revenue-chart", authMiddleware, getRevenueChartMitra);
router.get("/pendapatan/detail", authMiddleware, getPendapatanDetail);

export default router;
