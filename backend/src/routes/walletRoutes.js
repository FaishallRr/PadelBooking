import express from "express";
import { getMyWallet } from "../controller/walletController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/me", authMiddleware, getMyWallet);

export default router;
