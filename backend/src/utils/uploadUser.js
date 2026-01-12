// src/utils/uploadUser.js
import multer from "multer";
import crypto from "crypto";

// =========================
// SERVERLESS SAFE
// =========================
// Vercel TIDAK BOLEH:
// - fs
// - mkdir
// - diskStorage
//
// Semua upload HARUS memory
// =========================

const storage = multer.memoryStorage();

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

// upload foto user
export const uploadUser = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// upload ktp
export const uploadKtp = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// upload mitra (foto + ktp)
export const uploadMitra = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
