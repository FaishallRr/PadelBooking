import express from "express";
import {
  createBooking,
  getMyBooking,
  getBookingByLapangan,
} from "../controller/bookingController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/booking - alias untuk /my (get user's bookings)
router.get("/", authMiddleware, getMyBooking);

// POST /api/booking
router.post("/", authMiddleware, createBooking);

// GET /api/booking/my (alternative endpoint)
router.get("/my", authMiddleware, getMyBooking);

// 🔥 GET /api/booking/lapangan/:lapanganId
router.get("/lapangan/:lapanganId", getBookingByLapangan);

export default router;
