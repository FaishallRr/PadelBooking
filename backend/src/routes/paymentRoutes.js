import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  createPayment,
  handleMidtransNotification,
  getPaymentStatus,
} from "../controller/paymentController.js";

const router = express.Router();

// Buat Snap Token
router.post("/create", authMiddleware, createPayment);

// Webhook dari Midtrans (TANPA auth - dipanggil oleh Midtrans)
router.post("/notification", handleMidtransNotification);

// Cek status pembayaran
router.get("/status/:midtransOrderId", authMiddleware, getPaymentStatus);

export default router;
