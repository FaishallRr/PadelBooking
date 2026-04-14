// src/routes/authRoutes.js
import express from "express";
import {
  sendOtp,
  verifyOtp,
  registerUser,
  login,
  getProfile,
  updateProfile,
  updatePassword,
  registerMitra,
} from "../controller/authController.js";

import { uploadUser, uploadMitra } from "../utils/uploadUser.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkMitraBeforeUpload } from "../middleware/checkMitraBeforeUpload.js";

const router = express.Router();

/* ============================================
   AUTH ROUTES
============================================ */

// Kirim OTP
router.post("/send-otp", sendOtp);

// Verifikasi OTP
router.post("/verify-otp", verifyOtp);

// Register user biasa
router.post("/register", registerUser);

// Login
router.post("/login", login);

// Get profile user
router.get("/profile", authMiddleware, getProfile);

// Update profile + upload foto user (disk storage via multer)
router.put(
  "/update-profile",
  authMiddleware,
  uploadUser.single("foto"),
  updateProfile
);

// Update password
router.put("/profile/password", authMiddleware, updatePassword);

/* ============================================
   MITRA ROUTES
============================================ */

// Register Mitra: auth + cek + upload foto + ktp (disk storage via multer)
router.post(
  "/register-mitra",
  authMiddleware,
  checkMitraBeforeUpload,
  uploadMitra.fields([
    { name: "foto", maxCount: 1 },
    { name: "ktp", maxCount: 1 },
  ]),
  registerMitra
);

export default router;
