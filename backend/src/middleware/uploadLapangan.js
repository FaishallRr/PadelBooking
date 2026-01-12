import multer from "multer";
import path from "path";
import fs from "fs";

const TMP_DIR = path.join("/tmp", "img", "lapangan");

// Pastikan folder tmp ada
if (!fs.existsSync(TMP_DIR)) {
  fs.mkdirSync(TMP_DIR, { recursive: true });
}

// Konfigurasi storage multer
const storageLapangan = multer.diskStorage({
  destination: (req, file, cb) => cb(null, TMP_DIR),
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

export const uploadLapangan = multer({
  storage: storageLapangan,
  limits: { fileSize: 10 * 1024 * 1024 }, // max 10MB
  fileFilter,
});
