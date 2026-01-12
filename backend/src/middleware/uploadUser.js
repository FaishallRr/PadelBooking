import multer from "multer";
import path from "path";
import fs from "fs";

// Folder user
const USER_IMG = path.join(process.cwd(), "public", "img", "user");
if (!fs.existsSync(USER_IMG)) fs.mkdirSync(USER_IMG, { recursive: true });

const storageUser = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, USER_IMG);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `user_${unique}${ext}`);
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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter,
});
