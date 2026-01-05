import prisma from "../utils/prismaClient.js";
import fs from "fs";
import path from "path";
import slugify from "slugify";
import { addDays, format } from "date-fns";

const imgUrl = (filename) => (filename ? `/img/lapangan/${filename}` : null);

const PUBLIC_IMG = path.join(process.cwd(), "public", "img");
if (!fs.existsSync(PUBLIC_IMG)) fs.mkdirSync(PUBLIC_IMG, { recursive: true });

/**
 * Generate unique slug (slugify + append -1, -2, ... jika sudah ada)
 */
async function generateUniqueSlug(base) {
  base = base.trim();
  let slug = slugify(base, { lower: true, strict: true });
  let count = 1;
  while (await prisma.lapangan.findUnique({ where: { slug } })) {
    slug = `${slugify(base, { lower: true, strict: true })}-${count}`;
    count++;
  }
  return slug;
}

// ============================================================
// Generate jadwal otomatis
// ============================================================
/**
 * Generate jadwal otomatis per tanggal
 * @param lapangan_id
 * @param tanggal string 'YYYY-MM-DD'
 * @param interval menit
 * @param breakTime menit
 */
async function generateJadwal(
  lapangan_id,
  tanggal,
  interval = 60,
  breakTime = 0
) {
  const sessionTimes = [
    { start: "08:00", end: "11:00" },
    { start: "12:00", end: "16:00" },
    { start: "19:00", end: "22:00" },
  ];

  const jadwals = [];
  const tanggalDate = new Date(tanggal); // convert string ke Date

  sessionTimes.forEach((s) => {
    let [hour, minute] = s.start.split(":").map(Number);
    const [endHour, endMinute] = s.end.split(":").map(Number);

    while (hour < endHour || (hour === endHour && minute < endMinute)) {
      // Hitung waktu akhir slot
      let endSlotHour = hour;
      let endSlotMinute = minute + interval;

      if (endSlotMinute >= 60) {
        endSlotHour += Math.floor(endSlotMinute / 60);
        endSlotMinute %= 60;
      }

      // Jika slot melebihi batas sesi, hentikan
      if (
        endSlotHour > endHour ||
        (endSlotHour === endHour && endSlotMinute > endMinute)
      )
        break;

      const slot = `${hour.toString().padStart(2, "0")}:${minute
        .toString()
        .padStart(2, "0")} - ${endSlotHour
        .toString()
        .padStart(2, "0")}:${endSlotMinute.toString().padStart(2, "0")}`;

      // Gunakan Date object untuk tanggal
      jadwals.push({
        lapangan_id,
        tanggal: tanggalDate,
        slot,
        status: "tersedia",
      });

      // Update ke slot berikutnya + breakTime
      hour = endSlotHour;
      minute = endSlotMinute + breakTime;

      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute %= 60;
      }
    }
  });

  if (jadwals.length > 0) {
    await prisma.jadwalLapangan.createMany({
      data: jadwals,
      skipDuplicates: true, // mencegah duplikasi slot
    });
  }

  return jadwals;
}

/* ============================================================
   GET – Semua lapangan (ringkasan untuk dashboard / table)
   ============================================================ */
export async function getLapanganList(req, res) {
  try {
    const list = await prisma.lapangan.findMany({
      include: { detail: true, gambarList: true },
      orderBy: { created_at: "desc" },
    });

    const formatted = list.map((l) => ({
      id: l.id,
      nama: l.nama,
      slug: l.slug,
      lokasi: l.lokasi,
      harga: l.harga !== null ? Number(l.harga) : null,
      rating: l.rating,
      status: l.status,
      gambar: imgUrl(l.gambar),
      gambarList: (l.gambarList || []).map((g) => imgUrl(g.file_name)),
      detail: {
        ...l.detail,
        interval: l.detail?.interval ?? null,
        breakTime: l.detail?.breakTime ?? null,
      },
      created_at: l.created_at,
    }));

    res.json(formatted);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Gagal mengambil daftar lapangan" });
  }
}

/* ============================================================
   GET – Detail lapangan (public / user)
   ============================================================ */
export async function getLapanganBySlug(req, res) {
  try {
    const { slug } = req.params;
    if (!slug) return res.status(400).json({ error: "Parameter slug wajib" });

    const lapangan = await prisma.lapangan.findFirst({
      where: { slug },
      include: {
        detail: true,
        gambarList: true,
        jadwal: { orderBy: { tanggal: "asc" } }, // ⚡ huruf kecil
        ulasan: true,
      },
    });

    if (!lapangan)
      return res.status(404).json({ error: "Lapangan tidak ditemukan" });

    // Definisikan session time ranges
    const sessionTimes = [
      { name: "pagi", start: "08:00", end: "11:00" },
      { name: "siang", start: "12:00", end: "16:00" },
      { name: "malam", start: "19:00", end: "22:00" },
    ];

    // Group jadwal per tanggal & per sesi
    const groupedJadwal = {};

    (lapangan.jadwal || []).forEach((j) => {
      const tgl = j.tanggal.toISOString().slice(0, 10);
      if (!groupedJadwal[tgl])
        groupedJadwal[tgl] = { pagi: [], siang: [], malam: [] };

      const slotStart = j.slot.split(" - ")[0]; // ambil jam mulai

      const session = sessionTimes.find(
        (s) => slotStart >= s.start && slotStart < s.end
      );
      if (session)
        groupedJadwal[tgl][session.name].push({
          id: j.id,
          slot: j.slot,
          status: j.status,
        });
    });

    res.json({
      id: lapangan.id,
      nama: lapangan.nama,
      slug: lapangan.slug,
      lokasi: lapangan.lokasi,
      harga: lapangan.harga != null ? Number(lapangan.harga) : null,
      rating: lapangan.rating,
      status: lapangan.status,
      gambar: imgUrl(lapangan.gambar),
      gambarList: lapangan.gambarList.map((g) => imgUrl(g.file_name)),
      detail: {
        ...lapangan.detail,
        interval: lapangan.detail?.interval ?? null,
        breakTime: lapangan.detail?.breakTime ?? null,
      },
      jadwal: groupedJadwal,
      ulasan: lapangan.ulasan || [],
    });
  } catch (err) {
    console.error("getLapanganBySlug error:", err);
    res.status(500).json({ error: "Gagal mengambil detail lapangan" });
  }
}

/* ============================================================
   Upload gambar (multer sudah menyimpan file di public/img)
   Endpoint: POST /mitra/lapangan/:id/upload
   ============================================================ */
export async function uploadGambar(req, res) {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: "ID lapangan wajib" });

    const files = req.files;
    if (!files || files.length === 0)
      return res.status(400).json({ error: "Tidak ada file yang diupload" });

    // createMany expects plain objects; map safely for files that have filename
    const data = (files || [])
      .filter((f) => f && f.filename)
      .map((f) => ({
        lapangan_id: Number(id),
        file_name: f.filename, // ⬅️ SIMPAN NAMA FILE SAJA
      }));

    if (data.length === 0)
      return res
        .status(400)
        .json({ error: "Tidak ada file valid yang diupload" });

    await prisma.lapanganGambar.createMany({
      data,
      skipDuplicates: true,
    });

    return res.json({
      message: "Upload berhasil",
      files: data.map((d) => imgUrl(d.file_name)),
    });
  } catch (err) {
    console.error("uploadGambar error:", err);
    return res.status(500).json({
      error: "Gagal upload gambar",
      detail: err?.message || String(err),
    });
  }
}

/* ============================================================
   GET – semua lapangan milik Mitra (butuh authMiddleware)
   ============================================================ */
export async function getLapanganMitra(req, res) {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    // 🔥 ambil mitra dulu
    const mitra = await prisma.mitra.findUnique({
      where: { userId },
    });

    if (!mitra) return res.status(403).json({ message: "Bukan akun mitra" });

    const lapangan = await prisma.lapangan.findMany({
      where: { mitra_id: mitra.id }, // ✅ FIX
      include: { detail: true, gambarList: true },
      orderBy: { created_at: "desc" },
    });

    return res.json(lapangan);
  } catch (err) {
    console.error("getLapanganMitra error:", err);
    return res.status(500).json({ message: "Gagal memuat lapangan mitra" });
  }
}

/* ============================================================
   POST – Tambah Lapangan (mitra)
   Endpoint expects multipart/form-data (multer)
   - fields: nama, lokasi, harga, deskripsi, tipe, alamat, maps, fasilitas (JSON/string/CSV)
   - gambar (file) -> utama
   - gambarList (files[]) -> galeri
   - interval (minutes), breakTime (minutes)
   ============================================================ */
export async function tambahLapangan(req, res) {
  try {
    const {
      nama,
      harga: hargaRaw,
      deskripsi,
      tipe,
      alamat,
      maps,
      fasilitas,
      lokasi,
      interval: intervalRaw,
      breakTime: breakTimeRaw,
      tanggalMulai,
    } = req.body;

    if (!nama || !lokasi)
      return res.status(400).json({ message: "Nama & lokasi wajib diisi" });

    const harga = hargaRaw ? Number(hargaRaw) : null;
    const interval = intervalRaw ? Number(intervalRaw) : 60;
    const breakTime = breakTimeRaw ? Number(breakTimeRaw) : 0;

    // 🔥 AMBIL MITRA DARI USER LOGIN
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({
        message: "Akun ini belum terdaftar sebagai mitra",
      });
    }

    // parse fasilitas
    let fasilitasParsed = [];
    if (fasilitas) {
      if (typeof fasilitas === "string") {
        try {
          fasilitasParsed = JSON.parse(fasilitas);
        } catch {
          fasilitasParsed = fasilitas
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean);
        }
      } else if (Array.isArray(fasilitas)) {
        fasilitasParsed = fasilitas;
      }
    }

    const gambar = req.files?.gambar?.[0]?.filename || null;
    const gambarListFiles = Array.isArray(req.files?.gambarList)
      ? req.files.gambarList
      : [];

    const slug = await generateUniqueSlug(
      slugify(nama, { lower: true, strict: true })
    );

    // ✅ CREATE LAPANGAN (FIX)
    const lapangan = await prisma.lapangan.create({
      data: {
        nama,
        harga,
        slug,
        lokasi,
        gambar,
        mitra_id: mitra.id, // 🔥 FIX UTAMA
        detail: {
          create: {
            alamat,
            maps,
            deskripsi,
            type: tipe,
            fasilitas: fasilitasParsed,
            interval,
            breakTime,
          },
        },
      },
    });

    // Simpan gambar list
    if (gambarListFiles.length > 0) {
      const data = gambarListFiles
        .filter((f) => f?.filename)
        .map((f) => ({
          lapangan_id: lapangan.id,
          file_name: f.filename,
        }));
      await prisma.lapanganGambar.createMany({
        data,
        skipDuplicates: true,
      });
    }

    const startDate = tanggalMulai || new Date().toISOString().split("T")[0];

    const jadwalCreated = await generateJadwal(
      lapangan.id,
      startDate,
      interval,
      breakTime
    );

    const result = await prisma.lapangan.findUnique({
      where: { id: lapangan.id },
      include: { detail: true, gambarList: true },
    });

    return res.status(201).json({
      message: "Lapangan berhasil ditambahkan",
      data: result,
      jadwal: jadwalCreated,
    });
  } catch (err) {
    console.error("tambahLapangan error:", err);
    return res.status(500).json({
      message: "Gagal tambah lapangan",
      detail: err?.message || String(err),
    });
  }
}

/* ============================================================
   GET – Detail Lapangan Mitra (by slug) (requires auth)
   ============================================================ */
export async function getDetailLapangan(req, res) {
  try {
    const { slug } = req.params;
    const mitra = await prisma.mitra.findUnique({
      where: { userId: req.user.id },
    });

    if (!mitra) {
      return res.status(403).json({ message: "Bukan mitra" });
    }

    const lapangan = await prisma.lapangan.findFirst({
      where: { slug, mitra_id: mitra.id }, // ✅
      include: { detail: true, gambarList: true },
    });

    if (!lapangan)
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    return res.json({
      id: lapangan.id,
      slug: lapangan.slug,
      nama: lapangan.nama,
      lokasi: lapangan.lokasi,
      harga:
        lapangan.harga !== null && lapangan.harga !== undefined
          ? Number(lapangan.harga)
          : null,
      gambar: imgUrl(lapangan.gambar),

      gambarList: lapangan.gambarList.map((g) => imgUrl(g.file_name)),

      detail: {
        ...lapangan.detail,
        interval: lapangan.detail?.interval ?? null,
        breakTime: lapangan.detail?.breakTime ?? null,
      },
    });
  } catch (err) {
    console.error("getDetailLapangan error:", err);
    return res.status(500).json({ message: "Kesalahan server" });
  }
}

/* ============================================================
   UPDATE – Lapangan (mitra)
   - handles updating lapangan table and lapanganDetail (upsert)
   - accepts multipart/form-data (file optional)
   ============================================================ */
export async function updateLapangan(req, res) {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    // 1️⃣ Ambil MITRA dari USER
    const mitra = await prisma.mitra.findUnique({
      where: { userId },
    });

    if (!mitra) {
      return res.status(403).json({ message: "Akun ini bukan mitra" });
    }

    const {
      nama,
      harga,
      lokasi,
      alamat,
      maps,
      deskripsi,
      tipe,
      fasilitas,
      interval,
      breakTime,
      utamaType,
      utamaServerIndex,
      existingGambar,
      deletedImages,
    } = req.body;

    // 2️⃣ Ambil LAPANGAN milik mitra
    const lapangan = await prisma.lapangan.findFirst({
      where: {
        slug,
        mitra_id: mitra.id, // ✅ FIX UTAMA
      },
      include: { gambarList: true },
    });

    if (!lapangan) {
      return res.status(404).json({
        message: "Lapangan tidak ditemukan atau bukan milik Anda",
      });
    }

    // ======================
    // PARSE JSON AMAN
    // ======================
    let existing = [];
    let deleted = [];

    try {
      existing = JSON.parse(existingGambar || "[]");
    } catch {}
    try {
      deleted = JSON.parse(deletedImages || "[]");
    } catch {}

    existing = existing.filter(Boolean);
    deleted = deleted.filter(Boolean);

    const filteredExisting = existing.filter((f) => !deleted.includes(f));

    // ======================
    // HAPUS GAMBAR YANG DIDELETE
    // ======================
    if (deleted.length > 0) {
      await prisma.lapanganGambar.deleteMany({
        where: {
          lapangan_id: lapangan.id,
          file_name: { in: deleted },
        },
      });

      for (const filename of deleted) {
        const filePath = path.join(
          process.cwd(),
          "public",
          "img",
          "lapangan",
          filename
        );
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }
    }

    // ======================
    // SIMPAN GAMBAR BARU
    // ======================
    const newFiles = req.files?.gambarList || [];
    if (newFiles.length > 0) {
      await prisma.lapanganGambar.createMany({
        data: newFiles.map((f) => ({
          lapangan_id: lapangan.id,
          file_name: f.filename,
        })),
      });
    }

    // ======================
    // FOTO UTAMA
    // ======================
    let gambarUtama = lapangan.gambar;

    if (utamaType === "server") {
      const idx = Number(utamaServerIndex);
      gambarUtama = filteredExisting[idx] || null;
    }

    if (utamaType === "new" && req.files?.gambarUtama?.[0]) {
      gambarUtama = req.files.gambarUtama[0].filename;
    }

    if (!gambarUtama) {
      const latest = await prisma.lapanganGambar.findFirst({
        where: { lapangan_id: lapangan.id },
        orderBy: { id: "asc" },
      });
      gambarUtama = latest?.file_name || null;
    }

    // ======================
    // PARSE DATA LAIN
    // ======================
    const hargaNumber =
      harga !== undefined && harga !== "" ? Number(harga) : lapangan.harga;

    let fasilitasParsed = [];
    if (fasilitas) {
      try {
        fasilitasParsed = JSON.parse(fasilitas);
      } catch {}
    }

    // ======================
    // UPDATE LAPANGAN
    // ======================
    await prisma.lapangan.update({
      where: { id: lapangan.id },
      data: {
        nama,
        lokasi,
        harga: hargaNumber,
        gambar: gambarUtama,
      },
    });

    // ======================
    // UPSERT DETAIL
    // ======================
    await prisma.lapanganDetail.upsert({
      where: { lapangan_id: lapangan.id },
      update: {
        alamat,
        maps,
        deskripsi,
        type: tipe,
        fasilitas: fasilitasParsed,
        interval: interval ? Number(interval) : 60,
        breakTime: breakTime ? Number(breakTime) : 0,
      },
      create: {
        lapangan_id: lapangan.id,
        alamat,
        maps,
        deskripsi,
        type: tipe,
        fasilitas: fasilitasParsed,
        interval: interval ? Number(interval) : 60,
        breakTime: breakTime ? Number(breakTime) : 0,
      },
    });

    return res.json({
      message: "Lapangan berhasil diperbarui",
    });
  } catch (err) {
    console.error("updateLapangan error:", err);
    return res.status(500).json({
      message: "Gagal update lapangan",
      detail: err?.message || String(err),
    });
  }
}

/* ============================================================
   CREATE SLOTS – buat jadwal per tanggal
   Endpoint: POST /mitra/lapangan/:id/create-slots
   Body: { date: "YYYY-MM-DD" }
   Menggunakan interval & breakTime yang tersimpan di lapanganDetail (menit)
   ============================================================ */
export async function createJadwal(req, res) {
  try {
    const { lapangan_id, date } = req.body;
    if (!lapangan_id || !date)
      return res.status(400).json({ message: "lapangan_id & date wajib" });

    const detail = await prisma.lapanganDetail.findUnique({
      where: { lapangan_id: Number(lapangan_id) },
    });
    if (!detail)
      return res
        .status(404)
        .json({ message: "Detail lapangan tidak ditemukan" });

    const jadwalCreated = await generateJadwal(
      lapangan_id,
      date,
      detail.interval ?? 60,
      detail.breakTime ?? 0
    );

    if (jadwalCreated.length === 0)
      return res.status(400).json({ message: "Tidak ada slot yang dibuat" });

    return res
      .status(201)
      .json({ message: "Jadwal dibuat", jadwal: jadwalCreated });
  } catch (err) {
    console.error("createJadwal error:", err);
    return res.status(500).json({
      message: "Gagal membuat jadwal",
      detail: err?.message || String(err),
    });
  }
}

/**
 * GET /api/jadwal/:lapangan_id
 * list jadwal per lapangan
 */
export async function getJadwal(req, res) {
  try {
    const { lapangan_id } = req.params;
    const jadwal = await prisma.jadwalLapangan.findMany({
      where: { lapangan_id: Number(lapangan_id) },
      orderBy: { id: "asc" },
    });
    res.json(jadwal);
  } catch (err) {
    console.error("getJadwal error:", err);
    res.status(500).json({ message: err?.message || "Kesalahan server" });
  }
}

export async function ensure7DaysSlots(lapanganId) {
  try {
    const lastSlot = await prisma.jadwalLapangan.findFirst({
      where: { lapangan_id: lapanganId },
      orderBy: { tanggal: "desc" },
    });

    let startDate = new Date();
    if (lastSlot) {
      const lastDate = new Date(lastSlot.tanggal);
      if (lastDate >= startDate) startDate = addDays(lastDate, 1);
    }

    const detail = await prisma.lapanganDetail.findUnique({
      where: { lapangan_id: lapanganId },
    });
    const interval = detail?.interval ?? 60;
    const breakTime = detail?.breakTime ?? 0;

    const jadwalCreated = [];
    for (let i = 0; i < 7; i++) {
      const date = format(addDays(startDate, i), "yyyy-MM-dd");
      const created = await generateJadwal(
        lapanganId,
        date,
        interval,
        breakTime
      );
      jadwalCreated.push(...created);
    }
    return jadwalCreated;
  } catch (err) {
    console.error("ensure7DaysSlots error:", err.stack);
    throw err;
  }
}

/**
 * Endpoint opsional: POST /mitra/lapangan/:id/ensure-slots
 * Manual trigger agar lapangan selalu punya 7 hari ke depan
 */
export async function ensureJadwalMitra(req, res) {
  try {
    const { id } = req.params;
    const mitraId = req.user?.id;
    if (!id) return res.status(400).json({ message: "ID lapangan wajib" });
    if (!mitraId) return res.status(401).json({ message: "Unauthorized" });

    const lapangan = await prisma.lapangan.findUnique({
      where: { id: Number(id), mitra_id: mitraId },
    });
    if (!lapangan)
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    const jadwalCreated = await ensure7DaysSlots(Number(id));

    res.status(201).json({
      message: "Slot 7 hari ke depan berhasil dibuat",
      jadwal: jadwalCreated,
    });
  } catch (err) {
    console.error("ensureJadwalMitra error:", err.stack);
    res.status(500).json({
      message: "Gagal memastikan jadwal",
      detail: err?.message || String(err),
    });
  }
}

// ============================================================
// MITRA: delete lapangan (by slug)
export async function deleteLapangan(req, res) {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const mitra = await prisma.mitra.findUnique({
      where: { userId },
    });

    if (!mitra) return res.status(403).json({ message: "Bukan akun mitra" });

    const lapangan = await prisma.lapangan.findFirst({
      where: {
        slug,
        mitra_id: mitra.id, // ✅ FIX
      },
    });

    if (!lapangan)
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    // Hapus gambar utama
    if (lapangan.gambar) {
      const filePath = path.join(PUBLIC_IMG, "lapangan", lapangan.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Hapus semua gambar list
    const gambarList = await prisma.lapanganGambar.findMany({
      where: { lapangan_id: lapangan.id },
    });
    for (const g of gambarList) {
      const filePath = path.join(PUBLIC_IMG, "lapangan", g.file_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.lapanganGambar.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.lapanganDetail.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.jadwalLapangan.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.lapangan.delete({ where: { id: lapangan.id } });

    res.json({ message: "Lapangan berhasil dihapus" });
  } catch (err) {
    console.error("deleteLapangan error:", err);
    res
      .status(500)
      .json({ message: "Gagal menghapus lapangan", detail: err.message });
  }
}

// ============================================================
// MITRA: update status lapangan manual
export async function updateStatusLapangan(req, res) {
  try {
    const { slug } = req.params;
    const { status } = req.body; // Harus "tersedia" | "dalam_perbaikan"
    const mitraId = req.user.id;

    // Validasi enum
    const validStatuses = ["tersedia", "dalam_perbaikan"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        message: `Status tidak valid. Pilih salah satu: ${validStatuses.join(
          ", "
        )}`,
      });
    }

    // Ambil lapangan milik mitra
    const lapangan = await prisma.lapangan.findFirst({
      where: { slug, mitra_id: mitraId },
    });

    if (!lapangan)
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });

    // Update status
    const updated = await prisma.lapangan.update({
      where: { id: lapangan.id },
      data: { status },
    });

    return res.json({
      message: "Status berhasil diperbarui",
      status: updated.status,
    });
  } catch (err) {
    console.error("updateStatusLapangan error:", err);
    return res
      .status(500)
      .json({ message: "Gagal update status", detail: err.message });
  }
}

// ============================================================
// MITRA: toggle status lapangan otomatis (tanpa body)
// toggleStatusLapangan
// toggleStatusLapangan
export const toggleStatusLapangan = async (req, res) => {
  const { slug } = req.params;

  try {
    // Ambil lapangan berdasarkan slug
    const lapangan = await prisma.lapangan.findUnique({ where: { slug } });

    if (!lapangan) {
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    }

    // Toggle status
    const newStatus =
      lapangan.status === "tersedia" ? "dalam_perbaikan" : "tersedia";

    const updated = await prisma.lapangan.update({
      where: { slug },
      data: { status: newStatus },
    });

    return res.json({
      message: "Status lapangan berhasil diubah",
      status: updated.status,
    });
  } catch (err) {
    console.error("toggleStatusLapangan error:", err);
    return res.status(500).json({ message: "Gagal toggle status" });
  }
};

export const getAdminDashboardSummary = async (req, res) => {
  try {
    const [totalUsers, totalLapangan, totalBooking, revenueAgg] =
      await Promise.all([
        prisma.users.count(), // ✅ FIX
        prisma.lapangan.count(),
        prisma.order_booking.count(),
        prisma.transaksi.aggregate({
          _sum: { total_harga: true },
        }),
      ]);

    res.json({
      totalUsers,
      totalLapangan,
      totalBooking,
      totalRevenue: revenueAgg._sum.total_harga || 0,
    });
  } catch (err) {
    console.error("getAdminDashboardSummary error:", err);
    res.status(500).json({
      message: "Gagal mengambil dashboard admin",
    });
  }
};

export const getAllLapanganAdmin = async (req, res) => {
  try {
    const lapangan = await prisma.lapangan.findMany({
      include: {
        detail: true,
      },
      orderBy: {
        created_at: "desc",
      },
    });

    res.json(lapangan);
  } catch (error) {
    console.error("getAllLapanganAdmin error:", error);
    res.status(500).json({
      message: "Gagal mengambil data lapangan admin",
    });
  }
};

// ============================================================
// ADMIN: toggle status lapangan
// PATCH /api/admin/lapangan/:slug/toggle-status
// ============================================================
export const toggleStatusLapanganAdmin = async (req, res) => {
  const { slug } = req.params;

  try {
    const lapangan = await prisma.lapangan.findUnique({
      where: { slug },
    });

    if (!lapangan) {
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    }

    const newStatus =
      lapangan.status === "tersedia" ? "dalam_perbaikan" : "tersedia";

    const updated = await prisma.lapangan.update({
      where: { slug },
      data: { status: newStatus },
    });

    return res.json({
      message: "Status lapangan berhasil diubah",
      status: updated.status,
    });
  } catch (err) {
    console.error("toggleStatusLapanganAdmin error:", err);
    return res.status(500).json({
      message: "Gagal mengubah status lapangan",
    });
  }
};

// ============================================================
// ADMIN: delete lapangan
// DELETE /api/admin/lapangan/:slug
// ============================================================
export const deleteLapanganAdmin = async (req, res) => {
  const { slug } = req.params;

  try {
    const lapangan = await prisma.lapangan.findUnique({
      where: { slug },
    });

    if (!lapangan) {
      return res.status(404).json({ message: "Lapangan tidak ditemukan" });
    }

    // Hapus gambar utama
    if (lapangan.gambar) {
      const filePath = path.join(PUBLIC_IMG, "lapangan", lapangan.gambar);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    // Hapus gambar list
    const gambarList = await prisma.lapanganGambar.findMany({
      where: { lapangan_id: lapangan.id },
    });

    for (const g of gambarList) {
      const filePath = path.join(PUBLIC_IMG, "lapangan", g.file_name);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.lapanganGambar.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.lapanganDetail.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.jadwalLapangan.deleteMany({
      where: { lapangan_id: lapangan.id },
    });
    await prisma.lapangan.delete({
      where: { id: lapangan.id },
    });

    return res.json({
      message: "Lapangan berhasil dihapus",
    });
  } catch (err) {
    console.error("deleteLapanganAdmin error:", err);
    return res.status(500).json({
      message: "Gagal menghapus lapangan",
    });
  }
};

export const payWithWallet = async (req, res) => {
  const userId = req.user.id;
  const { orderId } = req.body;

  const order = await prisma.order_booking.findUnique({
    where: { id: orderId },
  });

  if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });

  const wallet = await prisma.wallet_user.findUnique({
    where: { user_id: userId },
  });

  if (wallet.saldo < order.total_harga)
    return res.status(400).json({ message: "Saldo tidak cukup" });

  await prisma.$transaction(async (tx) => {
    // 1️⃣ potong saldo
    await tx.wallet_user.update({
      where: { id: wallet.id },
      data: {
        saldo: { decrement: order.total_harga },
      },
    });

    // 2️⃣ histori wallet
    await tx.wallet_history.create({
      data: {
        wallet_id: wallet.id,
        jumlah: order.total_harga,
        tipe: "booking",
        catatan: `Bayar booking #${order.id}`,
      },
    });

    // 3️⃣ update order
    await tx.order_booking.update({
      where: { id: order.id },
      data: { status: "dibayar" },
    });

    // 4️⃣ transaksi
    await tx.transaksi.create({
      data: {
        user_id: userId,
        lapangan_id: order.lapangan_id,
        jadwal_id: order.jadwal_id,
        order_id: order.id,
        total_harga: order.total_harga,
        status_pembayaran: "berhasil",
        payment_method: "wallet",
      },
    });
  });

  res.json({ message: "Pembayaran berhasil via wallet" });
};

export const adminTopupWallet = async (req, res) => {
  const { userId, jumlah } = req.body;

  const wallet = await prisma.wallet_user.findUnique({
    where: { user_id: userId },
  });

  await prisma.$transaction(async (tx) => {
    await tx.wallet_user.update({
      where: { id: wallet.id },
      data: { saldo: { increment: jumlah } },
    });

    await tx.wallet_history.create({
      data: {
        wallet_id: wallet.id,
        jumlah,
        tipe: "topup",
        catatan: "Topup oleh admin",
      },
    });
  });

  res.json({ message: "Topup berhasil" });
};

// GET /api/admin/refund
export const getAllRefunds = async (req, res) => {
  try {
    const refunds = await prisma.refund.findMany({
      include: {
        user: { select: { nama: true } },
        order: { select: { tanggal: true, lapanganNama: true } },
      },
      orderBy: { created_at: "desc" },
    });
    res.json({ history: refunds });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal fetch refund" });
  }
};
