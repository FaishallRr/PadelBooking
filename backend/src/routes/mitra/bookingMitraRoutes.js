import express from "express";
import { authMiddleware } from "../../middleware/authMiddleware.js";
import { getBookingMitra } from "../../controller/mitra/bookingMitraController.js";

const router = express.Router();

router.get("/booking", authMiddleware, getBookingMitra);

export default router;
