// src/utils/uploadUser.js
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

const USER_PATH = path.join(process.cwd(), "public", "img", "user");
if (!fs.existsSync(USER_PATH)) fs.mkdirSync(USER_PATH, { recursive: true });

const KTP_PATH = path.join(process.cwd(), "public", "img", "mitra", "ktp");
if (!fs.existsSync(KTP_PATH)) fs.mkdirSync(KTP_PATH, { recursive: true });

const storageMitra = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "ktp") cb(null, KTP_PATH);
    else cb(null, path.join(process.cwd(), "public", "uploads"));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uid = crypto.randomUUID();
    cb(null, `ktp_${uid}_${Date.now()}${ext}`);
  },
});

// storage untuk upload single user foto
const storageUser = multer.diskStorage({
  destination: (req, file, cb) => cb(null, USER_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = req.user?.id ?? "temp";
    cb(null, `user_${id}_${Date.now()}${ext}`);
  },
});

// storage untuk upload ktp
const storageKtp = multer.diskStorage({
  destination: (req, file, cb) => cb(null, KTP_PATH),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uid = crypto.randomUUID();
    cb(null, `ktp_${uid}_${Date.now()}${ext}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new Error("Only image uploads are allowed"));
  }
  cb(null, true);
}

export const uploadUser = multer({
  storage: storageUser,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

export const uploadKtp = multer({
  storage: storageKtp,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

// Untuk register-mitra — menerima fields foto (user) + ktp (mitra)
export const uploadMitra = multer({
  storage: storageMitra,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});
