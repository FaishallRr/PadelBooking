import prisma from "../src/utils/prismaClient.js";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting seeder...");

  // ========== CLEANUP PREVIOUS TEST DATA ==========
  console.log("🧹 Cleaning up previous test data...");
  await prisma.order_booking.deleteMany({});
  await prisma.transaksi.deleteMany({});
  await prisma.pendapatan_mitra.deleteMany({});
  await prisma.notifikasi.deleteMany({});
  await prisma.ulasan.deleteMany({});
  await prisma.jadwalLapangan.deleteMany({});
  console.log("✅ Cleanup complete");

  // ========== USERS ==========
  console.log("📝 Creating users...");

  // Admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.users.upsert({
    where: { email: "admin@padel.com" },
    update: {},
    create: {
      nama: "Admin Padel",
      username: "admin",
      email: "admin@padel.com",
      password: adminPassword,
      no_hp: "08123456789",
      role: "admin",
      status: "aktif",
    },
  });
  console.log(`✅ Admin created: ${admin.email}`);

  // Regular user 1
  const userPassword1 = await bcrypt.hash("user123", 10);
  const user1 = await prisma.users.upsert({
    where: { email: "user1@padel.com" },
    update: {},
    create: {
      nama: "Budi Santoso",
      username: "budi_santoso",
      email: "user1@padel.com",
      password: userPassword1,
      no_hp: "08234567890",
      bio: "Pemain padel profesional",
      role: "user",
      status: "aktif",
    },
  });
  console.log(`✅ User1 created: ${user1.email}`);

  // Regular user 2
  const userPassword2 = await bcrypt.hash("user123", 10);
  const user2 = await prisma.users.upsert({
    where: { email: "user2@padel.com" },
    update: {},
    create: {
      nama: "Ani Wijaya",
      username: "ani_wijaya",
      email: "user2@padel.com",
      password: userPassword2,
      no_hp: "08345678901",
      bio: "Hobbyis padel",
      role: "user",
      status: "aktif",
    },
  });
  console.log(`✅ User2 created: ${user2.email}`);

  // Mitra user 1
  const mitraPassword = await bcrypt.hash("mitra123", 10);
  const mitraUser = await prisma.users.upsert({
    where: { email: "mitra@padel.com" },
    update: {},
    create: {
      nama: "PT Padel Sports",
      username: "padel_sports",
      email: "mitra@padel.com",
      password: mitraPassword,
      no_hp: "08456789012",
      role: "mitra",
      status: "aktif",
    },
  });
  console.log(`✅ Mitra user created: ${mitraUser.email}`);

  // ========== MITRA ==========
  console.log("🏢 Creating mitra...");

  const mitra = await prisma.mitra.upsert({
    where: { userId: mitraUser.id },
    update: {},
    create: {
      userId: mitraUser.id,
      nama_usaha: "Padel Sports Central",
      alamat_usaha: "Jl. Gatot Subroto No. 123, Jakarta Selatan",
      no_ktp: "1234567890123456",
      foto_ktp: "/img/mitra/ktp_sample.jpg",
      withdraw_type: "monthly",
      withdraw_day: 15,
      bank_mitra: "BCA",
      no_rekening_mitra: "1234567890",
      status: "aktif",
    },
  });
  console.log(`✅ Mitra created: ${mitra.nama_usaha}`);

  // ========== WALLET USER ==========
  console.log("💰 Creating wallets...");

  await prisma.wallet_user.upsert({
    where: { user_id: user1.id },
    update: {},
    create: {
      user_id: user1.id,
      saldo: 500000,
    },
  });
  console.log(`✅ Wallet for user1: Rp 500.000`);

  await prisma.wallet_user.upsert({
    where: { user_id: user2.id },
    update: {},
    create: {
      user_id: user2.id,
      saldo: 250000,
    },
  });
  console.log(`✅ Wallet for user2: Rp 250.000`);

  // ========== LAPANGAN ==========
  console.log("🎾 Creating lapangan...");

  const lapangan1 = await prisma.lapangan.upsert({
    where: { slug: "padel-court-1" },
    update: {},
    create: {
      mitra_id: mitra.id,
      nama: "Padel Court 1",
      slug: "padel-court-1",
      lokasi: "Jakarta Selatan",
      harga: 400000,
      gambar: "/img/lapangan/court1.jpg",
      rating: 4.5,
      status: "tersedia",
    },
  });
  console.log(`✅ Lapangan1 created: ${lapangan1.nama}`);

  const lapangan2 = await prisma.lapangan.upsert({
    where: { slug: "padel-court-2" },
    update: {},
    create: {
      mitra_id: mitra.id,
      nama: "Padel Court 2",
      slug: "padel-court-2",
      lokasi: "Jakarta Selatan",
      harga: 450000,
      gambar: "/img/lapangan/court2.jpg",
      rating: 4.7,
      status: "tersedia",
    },
  });
  console.log(`✅ Lapangan2 created: ${lapangan2.nama}`);

  // ========== LAPANGAN DETAIL ==========
  console.log("📋 Creating lapangan details...");

  await prisma.lapanganDetail.upsert({
    where: { lapangan_id: lapangan1.id },
    update: {},
    create: {
      lapangan_id: lapangan1.id,
      alamat: "Jl. Gatot Subroto No. 123, Jakarta Selatan 12740",
      maps: "https://maps.google.com/...",
      deskripsi:
        "Lapangan padel berkualitas internasional dengan pencahayaan LED modern. Cocok untuk pemula hingga profesional.",
      type: "Indoor",
      fasilitas: {
        parkir: true,
        restroom: true,
        kantin: true,
        wifi: true,
        ac: true,
        shower: true,
      },
      interval: 60,
      breakTime: 10,
    },
  });
  console.log(`✅ Lapangan Detail 1 created`);

  await prisma.lapanganDetail.upsert({
    where: { lapangan_id: lapangan2.id },
    update: {},
    create: {
      lapangan_id: lapangan2.id,
      alamat: "Jl. Gatot Subroto No. 125, Jakarta Selatan 12740",
      maps: "https://maps.google.com/...",
      deskripsi:
        "Lapangan padel outdoor dengan pemandangan taman. Dilengkapi tribun penonton dan fasilitas lengkap.",
      type: "Outdoor",
      fasilitas: {
        parkir: true,
        restroom: true,
        kantin: true,
        wifi: false,
        ac: false,
        shower: true,
      },
      interval: 60,
      breakTime: 10,
    },
  });
  console.log(`✅ Lapangan Detail 2 created`);

  // ========== RAKET PADEL ==========
  console.log("🎾 Creating raket padel...");

  const raket1 = await prisma.raket_padel.upsert({
    where: { id: 1 },
    update: {},
    create: {
      nama: "Raket Padel Premium",
      harga: 150000,
    },
  });
  console.log(`✅ Raket1 created: ${raket1.nama}`);

  const raket2 = await prisma.raket_padel.upsert({
    where: { id: 2 },
    update: {},
    create: {
      nama: "Raket Padel Standard",
      harga: 100000,
    },
  });
  console.log(`✅ Raket2 created: ${raket2.nama}`);

  // ========== JADWAL LAPANGAN ==========
  console.log("📅 Creating jadwal lapangan...");

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Jadwal untuk lapangan 1
  const jadwal1 = await prisma.jadwalLapangan.create({
    data: {
      lapangan_id: lapangan1.id,
      tanggal: tomorrow,
      slot: "09:00-10:00",
      status: "tersedia",
    },
  });
  console.log(`✅ Jadwal1 created for ${lapangan1.nama}`);

  const jadwal2 = await prisma.jadwalLapangan.create({
    data: {
      lapangan_id: lapangan1.id,
      tanggal: tomorrow,
      slot: "10:00-11:00",
      status: "tersedia",
    },
  });
  console.log(`✅ Jadwal2 created for ${lapangan1.nama}`);

  // Jadwal untuk lapangan 2
  const jadwal3 = await prisma.jadwalLapangan.create({
    data: {
      lapangan_id: lapangan2.id,
      tanggal: tomorrow,
      slot: "14:00-15:00",
      status: "tersedia",
    },
  });
  console.log(`✅ Jadwal3 created for ${lapangan2.nama}`);

  // ========== ORDER BOOKING ==========
  console.log("📦 Creating order booking...");

  const order1 = await prisma.order_booking.create({
    data: {
      user_id: user1.id,
      lapangan_id: lapangan1.id,
      jadwalLapanganId: jadwal1.id,
      tanggal: tomorrow,
      jam_mulai: "09:00",
      jam_selesai: "10:00",
      total_harga: 400000,
      status: "dibayar",
      sewa_raket: true,
      biaya_raket: 150000,
    },
  });
  console.log(`✅ Order1 created by ${user1.nama}`);

  // ========== TRANSAKSI ==========
  console.log("💳 Creating transaksi...");

  const transaksi1 = await prisma.transaksi.create({
    data: {
      user_id: user1.id,
      lapangan_id: lapangan1.id,
      jadwal_id: jadwal1.id,
      order_id: order1.id,
      total_harga: 550000, // lapangan + raket
      status_pembayaran: "berhasil",
    },
  });
  console.log(`✅ Transaksi1 created: Rp ${transaksi1.total_harga}`);

  // ========== WALLET HISTORY ==========
  console.log("📊 Creating wallet history...");

  await prisma.wallet_history.create({
    data: {
      wallet_id: (
        await prisma.wallet_user.findUnique({ where: { user_id: user1.id } })
      ).id,
      jumlah: -550000,
      saldo_akhir: -50000,
      tipe: "booking",
      order_id: order1.id,
    },
  });
  console.log(`✅ Wallet history created for order`);

  // ========== PENDAPATAN MITRA ==========
  console.log("💰 Creating pendapatan mitra...");

  await prisma.pendapatan_mitra.create({
    data: {
      mitra_id: mitra.id,
      transaksi_id: transaksi1.id,
      jumlah: 400000, // hanya lapangan, tidak termasuk raket
    },
  });
  console.log(`✅ Pendapatan mitra created: Rp 400.000`);

  // ========== ULASAN ==========
  console.log("⭐ Creating ulasan...");

  await prisma.ulasan.create({
    data: {
      user_id: user1.id,
      lapangan_id: lapangan1.id,
      rating: 5,
      komentar: "Lapangan bagus, pelayanan ramah, recommended!",
    },
  });
  console.log(`✅ Ulasan created for ${lapangan1.nama}`);

  // ========== NOTIFIKASI ==========
  console.log("🔔 Creating notifikasi...");

  await prisma.notifikasi.create({
    data: {
      user_id: user1.id,
      pesan: "Booking Anda untuk 14 Jan 2026 telah dikonfirmasi",
      dibaca: false,
    },
  });
  console.log(`✅ Notifikasi created for ${user1.nama}`);

  console.log("✨ Seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
