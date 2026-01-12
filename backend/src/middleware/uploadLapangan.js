import multer from "multer";
import path from "path";
import fs from "fs";

const isVercel = process.env.VERCEL === "1";

// ==========================
// LOCAL PATH
// ==========================
const LAPANGAN_IMG = path.join(process.cwd(), "public", "img", "lapangan");

// ==========================
// CREATE FOLDER (LOCAL ONLY)
// ==========================
if (!isVercel) {
  if (!fs.existsSync(LAPANGAN_IMG)) {
    fs.mkdirSync(LAPANGAN_IMG, { recursive: true });
  }
}

// ==========================
// STORAGE
// ==========================
const storageLapangan = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, LAPANGAN_IMG),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const id = req.params.id ?? "temp";
        cb(null, `lapangan_${id}_${Date.now()}${ext}`);
      },
    });

// ==========================
// FILTER
// ==========================
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"), false);
  }
  cb(null, true);
}

// ==========================
// EXPORT
// ==========================
export const uploadLapangan = multer({
  storage: storageLapangan,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
}).single("foto");
