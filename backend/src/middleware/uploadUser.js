// src/middleware/uploadUser.js
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";
import crypto from "crypto";

// Multer memory storage
const storage = multer.memoryStorage();

export const uploadUser = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

// Helper upload buffer ke Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "user") => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result.secure_url);
      }
    );

    const readable = new Readable();
    readable.push(fileBuffer);
    readable.push(null);
    readable.pipe(stream);
  });
};

// Upload KTP mitra
export const uploadKtp = multer({ storage }); // sama memoryStorage
export const uploadMitra = multer({ storage }); // untuk register-mitra (foto + ktp)
