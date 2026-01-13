import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import path from "path";

/* =====================
   ROUTES
===================== */
import authRoutes from "./routes/authRoutes.js";
import lapanganRoutes from "./routes/lapanganRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import checkoutRoutes from "./routes/checkoutRoutes.js";
import jadwalRoutes from "./routes/jadwalRoutes.js";
import walletRoutes from "./routes/walletRoutes.js";
import refundRoutes from "./routes/refundRoutes.js";

import dashboardMitraRoutes from "./routes/mitra/dashboardMitraRoutes.js";
import bookingMitraRoutes from "./routes/mitra/bookingMitraRoutes.js";

/* =====================
   CRON LOGIC (DIPAKAI VIA HTTP)
===================== */
import { releaseExpiredSlot } from "./jobs/releaseExpiredSlot.js";
import { autoGenerateSlots } from "./utils/autoGenerateSlots.js";
import { autoApproveRefundH3 } from "./jobs/autoApproveRefund.js";

dotenv.config();
const app = express();

/* =====================
   MIDDLEWARE
===================== */
app.use(
  cors({
    origin: [
      "https://padeltime.web.id",
      "https://padeltime.vercel.app",
      "http://localhost:3000",
      "http://localhost:5000",
    ],
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   STATIC FILES
===================== */
app.use("/img", express.static(path.join(process.cwd(), "public", "img")));

/* =====================
   ROUTES
===================== */
app.use("/auth", authRoutes);
app.use("/api/booking", bookingRoutes);
app.use("/api/lapangan", lapanganRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", checkoutRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/refund", refundRoutes);
app.use("/api/jadwal", jadwalRoutes);
app.use("/api/mitra", dashboardMitraRoutes);
app.use("/api/mitra", bookingMitraRoutes);

/* =====================
   CRON ENDPOINTS (SERVERLESS SAFE)
   → DIPANGGIL OLEH VERCEL CRON
===================== */

/**
 * 🔥 Auto expire slot
 * cron: * * * * *
 */
app.post("/api/cron/expire-slot", async (req, res) => {
  try {
    await releaseExpiredSlot();
    res.json({ success: true });
  } catch (err) {
    console.error("Expire slot error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔥 Auto generate slot harian
 * cron: 0 0 * * *
 */
app.post("/api/cron/generate-slot", async (req, res) => {
  try {
    await autoGenerateSlots();
    res.json({ success: true });
  } catch (err) {
    console.error("Generate slot error:", err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * 🔥 Auto approve refund H-3
 * cron: every 30 minutes
 */
app.post("/api/cron/auto-approve-refund", async (req, res) => {
  try {
    await autoApproveRefundH3();
    res.json({ success: true });
  } catch (err) {
    console.error("Auto approve refund error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* =====================
   HEALTH CHECK
===================== */
app.get("/", (req, res) => {
  res.json({
    status: "OK",
    service: "PadelTime Backend",
  });
});

/* =====================
   ERROR HANDLER
===================== */
app.use((err, req, res, next) => {
  console.error("SERVER ERROR:", err);
  res.status(500).json({
    error: err.message || "Internal Server Error",
  });
});

/* =====================
   EXPORT (WAJIB UNTUK VERCEL)
===================== */
app.listen(process.env.PORT, () => {
  console.log(`Server is running on port ${process.env.PORT}`);
});
