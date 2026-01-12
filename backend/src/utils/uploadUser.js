// src/utils/uploadUser.js
import multer from "multer";
import crypto from "crypto";
import path from "path";

/**
 * =========================
 * STORAGE (SERVERLESS SAFE)
 * =========================
 * File disimpan di memory (RAM)
 * Tidak ada fs / mkdir / disk write
 */
const storage = multer.memoryStorage();

/**
 * =========================
 * FILE FILTER (LOGIC TETAP)
 * =========================
 */
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

/**
 * =========================
 * HELPER BUAT NAMA FILE
 * (LOGIC TETAP ADA)
 * =========================
 */
function generateFilename(prefix, originalname, userId = "temp") {
  const ext = path.extname(originalname);
  const uid = crypto.randomUUID();
  return `${prefix}_${userId}_${uid}_${Date.now()}${ext}`;
}

/**
 * =========================
 * UPLOAD USER PHOTO
 * =========================
 */
export const uploadUser = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
});

/**
 * =========================
 * UPLOAD KTP
 * =========================
 */
export const uploadKtp = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * =========================
 * UPLOAD MITRA
 * (USER + KTP)
 * =========================
 */
export const uploadMitra = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

/**
 * =========================
 * EXPORT HELPER (OPTIONAL)
 * Dipakai di controller
 * =========================
 */
export function mapUploadedFile(file, type, userId) {
  if (!file) return null;

  return {
    buffer: file.buffer, // ← buat Cloudinary
    mimetype: file.mimetype,
    originalname: file.originalname,
    filename: generateFilename(type, file.originalname, userId),
  };
}
