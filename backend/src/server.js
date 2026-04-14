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
import paymentRoutes from "./routes/paymentRoutes.js";
import ulasanRoutes from "./routes/ulasanRoutes.js";
import notifikasiRoutes from "./routes/notifikasiRoutes.js";

import dashboardMitraRoutes from "./routes/mitra/dashboardMitraRoutes.js";
import bookingMitraRoutes from "./routes/mitra/bookingMitraRoutes.js";
import pencairanMitraRoutes from "./routes/mitra/pencairanMitraRoutes.js";

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
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =====================
   TIMEOUT HANDLER (CRITICAL untuk prevent hanging)
===================== */
const REQUEST_TIMEOUT = 30000; // 30 seconds
app.use((req, res, next) => {
  res.setTimeout(REQUEST_TIMEOUT, () => {
    console.error(`Request timeout for ${req.method} ${req.path}`);
    if (!res.headersSent) {
      res.status(408).json({ error: "Request timeout" });
    }
  });
  next();
});

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
app.use("/api/payment", paymentRoutes);
app.use("/api/ulasan", ulasanRoutes);
app.use("/api/notifikasi", notifikasiRoutes);
app.use("/api/mitra", dashboardMitraRoutes);
app.use("/api/mitra", bookingMitraRoutes);
app.use("/api/mitra", pencairanMitraRoutes);

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
const server = app.listen(process.env.PORT || 5000, () => {
  console.log(`Server is running on port ${process.env.PORT || 5000}`);
});

// Global timeout untuk connections
server.keepAliveTimeout = 65000; // Nginx default 60s, jadi set 65s
server.headersTimeout = 66000;

export default app;
