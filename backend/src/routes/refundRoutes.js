import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import {
  requestRefund,
  getMyRefunds,
  cancelRefund,
  approveRefund,
  getAllRefundsAdmin,
} from "../controller/refundController.js";
import { adminOnly } from "../middleware/adminOnly.js";

const router = express.Router();

router.post("/", authMiddleware, requestRefund);
router.get("/me", authMiddleware, getMyRefunds);
// routes/refundRoutes.js
router.post("/cancel", authMiddleware, cancelRefund);

router.post("/approve", authMiddleware, adminOnly, approveRefund);

router.get("/admin", authMiddleware, adminOnly, getAllRefundsAdmin);

export default router;
