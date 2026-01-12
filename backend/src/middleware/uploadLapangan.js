import multer from "multer";
import path from "path";
import fs from "fs";

const TMP_DIR = "/tmp/lapangan";

const storageLapangan = multer.diskStorage({
  destination: (req, file, cb) => {
    try {
      if (!fs.existsSync(TMP_DIR)) {
        fs.mkdirSync(TMP_DIR, { recursive: true });
      }
      cb(null, TMP_DIR);
    } catch (err) {
      cb(err);
    }
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const id = req.params.id || "temp";
    cb(null, `lapangan_${id}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    cb(new Error("Only image files allowed"), false);
  } else {
    cb(null, true);
  }
};

export const uploadLapangan = multer({
  storage: storageLapangan,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
