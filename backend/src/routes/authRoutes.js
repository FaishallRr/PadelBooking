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

import { uploadUser, uploadKtp, uploadMitra } from "../utils/uploadUser.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { checkMitraBeforeUpload } from "../middleware/checkMitraBeforeUpload.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/register", registerUser);

// register mitra: butuh auth + upload foto + ktp
router.post(
  "/register-mitra",
  authMiddleware,
  checkMitraBeforeUpload, // CEK DULU SEBELUM UPLOAD FOTO
  uploadMitra.fields([{ name: "ktp", maxCount: 1 }]),
  registerMitra
);

router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

router.put(
  "/update-profile",
  authMiddleware,
  uploadUser.single("foto"),
  updateProfile
);
router.put("/profile/password", authMiddleware, updatePassword);

export default router;
