import multer from "multer";
import path from "path";
import fs from "fs";
import { randomBytes } from "crypto";

// Folder lapangan
const LAPANGAN_IMG = path.join(process.cwd(), "public", "img", "lapangan");
if (!fs.existsSync(LAPANGAN_IMG))
  fs.mkdirSync(LAPANGAN_IMG, { recursive: true });

const storageLapangan = multer.diskStorage({
  destination: (req, file, cb) => cb(null, LAPANGAN_IMG),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    // Gunakan random ID atau lapangan ID jika tersedia, fallback ke UUID
    const id =
      req.params.id || req.body.lapanganId || randomBytes(6).toString("hex");
    const timestamp = Date.now();
    cb(null, `lapangan_${id}_${timestamp}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

export const uploadLapangan = multer({
  storage: storageLapangan,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
