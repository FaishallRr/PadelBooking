import multer from "multer";
import path from "path";
import fs from "fs";

// Tentukan folder tempat menyimpan gambar lapangan
const LAPANGAN_IMG = path.join(process.cwd(), "public", "img", "lapangan");

// Pastikan folder ada, buat recursive jika belum ada
try {
  if (!fs.existsSync(LAPANGAN_IMG)) {
    fs.mkdirSync(LAPANGAN_IMG, { recursive: true });
    console.log(`Folder created: ${LAPANGAN_IMG}`);
  }
} catch (err) {
  console.error("Failed to create folder:", err);
}

// Konfigurasi storage multer
const storageLapangan = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, LAPANGAN_IMG);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = req.params.id ?? "temp";
    const timestamp = Date.now();
    const safeName = file.originalname
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_\-\.]/g, "");
    cb(null, `lapangan_${id}_${timestamp}_${safeName}${ext}`);
  },
});

// Filter file hanya gambar
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

// Export multer upload
export const uploadLapangan = multer({
  storage: storageLapangan,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter,
});
