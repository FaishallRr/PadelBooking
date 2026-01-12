import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const isVercel = process.env.VERCEL === "1";

/**
 * ===========================
 * PATH (LOCAL ONLY)
 * ===========================
 */
const USER_PATH = path.join(process.cwd(), "public", "img", "user");
const KTP_PATH = path.join(process.cwd(), "public", "img", "mitra", "ktp");

/**
 * ===========================
 * CREATE FOLDER (LOCAL ONLY)
 * ===========================
 */
if (!isVercel) {
  if (!fs.existsSync(USER_PATH)) {
    fs.mkdirSync(USER_PATH, { recursive: true });
  }

  if (!fs.existsSync(KTP_PATH)) {
    fs.mkdirSync(KTP_PATH, { recursive: true });
  }
}

/**
 * ===========================
 * STORAGE
 * ===========================
 */

// 🔹 STORAGE USER
const storageUser = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, USER_PATH),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const id = req.user?.id ?? "temp";
        cb(null, `user_${id}_${Date.now()}${ext}`);
      },
    });

// 🔹 STORAGE KTP
const storageKtp = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, KTP_PATH),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uid = crypto.randomUUID();
        cb(null, `ktp_${uid}_${Date.now()}${ext}`);
      },
    });

// 🔹 STORAGE MITRA (FOTO + KTP)
const storageMitra = isVercel
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => {
        if (file.fieldname === "ktp") cb(null, KTP_PATH);
        else cb(null, USER_PATH);
      },
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const uid = crypto.randomUUID();
        cb(null, `${file.fieldname}_${uid}_${Date.now()}${ext}`);
      },
    });

/**
 * ===========================
 * FILE FILTER
 * ===========================
 */
function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

/**
 * ===========================
 * EXPORT MIDDLEWARE
 * ===========================
 */

export const uploadUser = multer({
  storage: storageUser,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("foto");

export const uploadKtp = multer({
  storage: storageKtp,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single("ktp");

export const uploadMitra = multer({
  storage: storageMitra,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
}).fields([
  { name: "foto", maxCount: 1 },
  { name: "ktp", maxCount: 1 },
]);
