// src/middleware/uploadLapangan.js
import multer from "multer";
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

// Multer memory storage (file ada di buffer, tidak disimpan lokal)
const storage = multer.memoryStorage();

export const uploadLapangan = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      return cb(new Error("Only image uploads are allowed"));
    }
    cb(null, true);
  },
});

// Helper upload buffer ke Cloudinary
export const uploadToCloudinary = (fileBuffer, folder = "lapangan") => {
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
