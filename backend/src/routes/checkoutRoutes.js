import express from "express";
import { checkoutWallet } from "../controller/checkoutController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/checkout/wallet", authMiddleware, checkoutWallet);

export default router;
