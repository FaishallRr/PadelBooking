import express from "express";
import {
  createBooking,
  getMyBooking,
  getBookingByLapangan,
} from "../controller/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/booking
router.post("/", authMiddleware, createBooking);

// GET /api/booking/my
router.get("/my", authMiddleware, getMyBooking);

// 🔥 GET /api/booking/lapangan/:lapanganId
router.get("/lapangan/:lapanganId", getBookingByLapangan);

export default router;
