import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";
import cron from "node-cron";

import authRoutes from "./routes/authRoutes.js";
import lapanganRoutes from "./routes/lapanganRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import jadwalRoutes from "./routes/jadwalRoutes.js";

import { startSlotCron, autoGenerateSlots } from "./utils/autoGenerateSlots.js";

import walletRoutes from "./routes/walletRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";

import { releaseExpiredSlot } from "./jobs/releaseExpiredSlot.js";

import dashboardMitraRoutes from "./routes/mitra/dashboardMitraRoutes.js";
import bookingMitraRoutes from "./routes/mitra/bookingMitraRoutes.js";

import { autoApproveRefundH3 } from "./jobs/autoApproveRefund.js";

dotenv.config();
const app = express();

/* =====================================
   MIDDLEWARE
===================================== */
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================================
   STATIC FILES
===================================== */
app.use("/img", express.static(path.join(process.cwd(), "public", "img")));

/* =====================================
   ROUTES
===================================== */
app.use("/api/booking", bookingRoutes);
app.use("/auth", authRoutes);
app.use("/api/lapangan", lapanganRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", checkoutRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/mitra", dashboardMitraRoutes);
app.use("/api/mitra", bookingMitraRoutes);

/* =====================================
   CRON JOBS (GLOBAL)
===================================== */

// 🔥 Auto expire order (tiap 1 menit)
cron.schedule("* * * * *", async () => {
  try {
    await releaseExpiredSlot();
  } catch (err) {
    console.error("❌ Expire order cron error:", err);
  }
});

// 🔥 Auto generate slot harian
startSlotCron();

cron.schedule("*/30 * * * *", async () => {
  try {
    await autoApproveRefundH3();
  } catch (err) {
    console.error("Auto approve refund error:", err);
  }
});

/* =====================================
   ERROR HANDLER
===================================== */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

/* =====================================
   START SERVER
===================================== */
const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`🚀 Backend running at http://localhost:${PORT}`);

  try {
    console.log("⚡ Generate slot 7 hari ke depan saat server start...");
    await autoGenerateSlots();
    console.log("✅ Slot berhasil digenerate saat startup");
  } catch (err) {
    console.error("❌ Error generate slot saat startup:", err);
  }
});
