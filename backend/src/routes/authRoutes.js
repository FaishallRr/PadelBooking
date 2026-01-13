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

// Update profile + upload foto user
router.put(
  "/update-profile",
  authMiddleware,
  uploadUser.single("foto"),
  async (req, res) => {
    try {
      let fotoUrl = null;
      if (req.file) {
        fotoUrl = await uploadToCloudinary(req.file.buffer, "user");
      }

      // Controller updateProfile menerima fotoUrl
      await updateProfile(req, res, { fotoUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload gagal", error: err.message });
    }
  }
);

// Update password
router.put("/profile/password", authMiddleware, updatePassword);

/* ============================================
   MITRA ROUTES
============================================ */

// Register Mitra: auth + cek + upload foto + ktp
router.post(
  "/register-mitra",
  authMiddleware,
  checkMitraBeforeUpload,
  uploadMitra.fields([
    { name: "foto", maxCount: 1 },
    { name: "ktp", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      let fotoUrl = null;
      let ktpUrl = null;

      if (req.files["foto"]?.length) {
        fotoUrl = await uploadToCloudinary(req.files["foto"][0].buffer, "user");
      }

      if (req.files["ktp"]?.length) {
        ktpUrl = await uploadToCloudinary(req.files["ktp"][0].buffer, "ktp");
      }

      // Controller registerMitra menerima URL Cloudinary
      await registerMitra(req, res, { fotoUrl, ktpUrl });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Upload gagal", error: err.message });
    }
  }
);

export default router;
