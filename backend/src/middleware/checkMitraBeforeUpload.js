// src/middlewares/checkMitraBeforeUpload.js
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();

export async function checkMitraBeforeUpload(req, res, next) {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token hilang" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;

    // CEK apakah user sudah pernah mengisi data mitra
    const exist = await prisma.mitra.findUnique({
      where: { userId: req.userId },
    });

    if (exist) {
      return res.status(400).json({
        error: "Data mitra sudah pernah dibuat. Tidak dapat upload ulang.",
      });
    }

    next();
  } catch (err) {
    console.error("CHECK MITRA FAILED:", err);
    return res.status(401).json({ error: "Token tidak valid" });
  }
}
