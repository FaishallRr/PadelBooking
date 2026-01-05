import multer from "multer";
import path from "path";
import fs from "fs";

// Folder upload (public/img/mitra/lapangan)
// SEKARANG
const uploadPath = path.join(process.cwd(), "public", "img", "lapangan");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // cek folder
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

export const uploadLapangan = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // max 5MB/file
});
