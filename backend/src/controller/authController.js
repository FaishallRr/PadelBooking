import prisma from "../utils/prismaClient.js";
import { generateOtp } from "../utils/otpGenerator.js";
import { sendOtpEmail } from "../utils/sendOtpEmail.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";

/* ========================= SEND OTP ========================= */
export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email harus diisi" });

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email))
      return res.status(400).json({ message: "Format email tidak valid" });

    const otp = generateOtp();
    const expired_at = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.otp_codes.deleteMany({ where: { user_email: email } });

    await prisma.otp_codes.create({
      data: {
        user_email: email,
        kode_otp: otp,
        expired_at,
        digunakan: false,
      },
    });

    try {
      await sendOtpEmail(email, otp);
    } catch (err) {
      console.warn("Email gagal dikirim:", err.message);
    }

    res.json({ message: "OTP dikirim", expired_at });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal mengirim OTP", error: error.message });
  }
};

/* ========================= VERIFY OTP ========================= */
export const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ message: "Email dan OTP harus diisi" });

    const record = await prisma.otp_codes.findFirst({
      where: { user_email: email },
      orderBy: { created_at: "desc" },
    });

    if (!record)
      return res.status(400).json({ message: "OTP tidak ditemukan" });
    if (record.expired_at < new Date())
      return res.status(400).json({ message: "OTP sudah expired" });
    if (record.digunakan)
      return res.status(400).json({ message: "OTP sudah digunakan" });
    if (record.kode_otp !== otp)
      return res.status(400).json({ message: "OTP salah" });

    await prisma.otp_codes.update({
      where: { id: record.id },
      data: { digunakan: true },
    });

    res.json({ message: "OTP diverifikasi" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Gagal verifikasi OTP", error: error.message });
  }
};

/* ========================= REGISTER ========================= */
export const registerUser = async (req, res) => {
  try {
    const { email, nama, username, password, no_hp, role } = req.body;

    if (!email || !nama || !username || !password)
      return res.status(400).json({ message: "Semua field wajib diisi" });

    if (password.length < 6)
      return res.status(400).json({ message: "Password minimal 6 karakter" });

    const exist = await prisma.users.findFirst({
      where: { OR: [{ email }, { username }] },
    });

    if (exist)
      return res.status(400).json({ message: "Email/Username sudah terpakai" });

    const hashed = await bcrypt.hash(password, 10);

    // VALIDASI ROLE
    const allowedRoles = ["user", "mitra", "admin"];
    const finalRole = allowedRoles.includes(role) ? role : "user";

    const user = await prisma.users.create({
      data: {
        email,
        nama,
        username,
        password: hashed,
        no_hp: no_hp || null,
        role: finalRole, // <-- ROLE TIDAK DI-HARDCODE LAGI
        status: "aktif",
      },
    });

    await prisma.wallet_user.create({
      data: {
        user_id: user.id,
        saldo: 0,
      },
    });

    res.json({ message: "Registrasi berhasil", user });
  } catch (error) {
    res.status(500).json({ message: "Gagal registrasi", error: error.message });
  }
};

/* ========================= LOGIN (COOKIE VERSION) ========================= */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.users.findUnique({ where: { email } });
    if (!user)
      return res.status(400).json({ message: "Email tidak ditemukan" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Password salah" });

    // Buat token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Cek apakah mitra sudah isi data
    let isMitraCompleted = true;

    if (user.role === "mitra") {
      const mitraData = await prisma.mitra.findUnique({
        where: { userId: user.id }, // FIXED
      });

      isMitraCompleted = !!mitraData; // true kalau sudah isi, false kalau belum
    }

    return res.status(200).json({
      message: "Login berhasil",
      role: user.role,
      token,
      user_id: user.id,
      isMitraCompleted,
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({
      message: "Gagal login",
      error: error.message,
    });
  }
};

/* ========================= GET PROFILE ========================= */
export const getProfile = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Token tidak valid" });
    }

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    const cleanFoto = user.foto ? user.foto.replace("/img/user/", "") : null;

    res.json({
      id: user.id,
      nama: user.nama,
      username: user.username,
      email: user.email,
      no_hp: user.no_hp,
      foto: cleanFoto,
      bio: user.bio,
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal mengambil profil",
      error: error.message,
    });
  }
};

/* ========================= UPDATE PROFILE ========================= */
export const updateProfile = async (req, res) => {
  try {
    const { nama, username, no_hp, bio } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    // === CEK USERNAME DUPLIKAT ===
    if (username) {
      const existing = await prisma.users.findFirst({
        where: { username, NOT: { id: req.user.id } },
      });

      if (existing) {
        return res
          .status(400)
          .json({ message: "Username sudah dipakai user lain" });
      }
    }

    const dataUpdate = { nama, username, no_hp, bio };

    // === HANDLE FOTO BARU ===
    if (req.file) {
      if (user.foto) {
        const oldPath = path.join(
          process.cwd(),
          "public",
          "img",
          "user",
          user.foto.replace("/img/user/", "")
        );

        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }

      dataUpdate.foto = req.file.filename;
    }

    const updated = await prisma.users.update({
      where: { id: req.user.id },
      data: dataUpdate,
    });

    res.json({
      message: "Profil berhasil diperbarui",
      profile: {
        id: updated.id,
        nama: updated.nama,
        username: updated.username,
        email: updated.email,
        no_hp: updated.no_hp,
        foto: updated.foto,
        bio: updated.bio,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Gagal update profil",
      error: error.message,
    });
  }
};

/* ========================= UPDATE PASSWORD ========================= */
export const updatePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.users.findUnique({
      where: { id: req.user.id },
    });

    const valid = await bcrypt.compare(oldPassword, user.password);
    if (!valid) return res.status(400).json({ message: "Password lama salah" });

    const hashed = await bcrypt.hash(newPassword, 10);

    await prisma.users.update({
      where: { id: req.user.id },
      data: { password: hashed },
    });

    res.json({ message: "Password diperbarui" });
  } catch (error) {
    res.status(500).json({
      message: "Gagal update password",
      error: error.message,
    });
  }
};

// ========================= regiter MITRA =========================
// src/controller/authController.js
// ... (import & top code tetap sama)

export const registerMitra = async (req, res) => {
  try {
    const userId = req.user.id; // dari authMiddleware

    const {
      nama_usaha,
      alamat_usaha,
      no_ktp,
      withdraw_type,
      withdraw_day,
      bank_mitra,
      no_rekening_mitra,
    } = req.body;

    // validasi basic
    if (!nama_usaha || !alamat_usaha || !no_ktp || !withdraw_type) {
      return res.status(400).json({
        error: "Semua field wajib diisi kecuali yang opsional.",
      });
    }

    // cek file KTP wajib
    if (!req.files || !req.files.ktp || !req.files.ktp[0]) {
      return res.status(400).json({ error: "Foto KTP wajib diupload!" });
    }

    const ktpFile = req.files.ktp[0].filename;

    // cek di database apakah user sudah pernah daftar mitra
    const exist = await prisma.mitra.findUnique({
      where: { userId },
    });

    if (exist) {
      return res.status(400).json({
        error: "Data mitra sudah pernah dibuat.",
      });
    }

    // buat payload prisma
    const payload = {
      userId,
      nama_usaha,
      alamat_usaha,
      no_ktp,
      foto_ktp: ktpFile,
      withdraw_type,
      status: "pending",
    };

    if (withdraw_type === "monthly") {
      payload.withdraw_day = Number(withdraw_day);
      payload.bank_mitra = null;
      payload.no_rekening_mitra = null;
    }

    if (withdraw_type === "daily") {
      payload.bank_mitra = bank_mitra;
      payload.no_rekening_mitra = no_rekening_mitra;
      payload.withdraw_day = null;
    }

    const mitra = await prisma.mitra.create({ data: payload });

    return res.json({
      message: "Data mitra berhasil disimpan",
      mitra,
    });
  } catch (err) {
    console.error("REGISTER MITRA ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
};
