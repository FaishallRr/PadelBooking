-- CreateTable
CREATE TABLE `users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `username` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `no_hp` VARCHAR(191) NULL,
    `foto` VARCHAR(191) NULL,
    `bio` VARCHAR(191) NULL,
    `role` ENUM('admin', 'user', 'mitra') NOT NULL DEFAULT 'user',
    `status` ENUM('aktif', 'nonaktif') NOT NULL DEFAULT 'aktif',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `users_username_key`(`username`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Mitra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `nama_usaha` VARCHAR(191) NOT NULL,
    `alamat_usaha` VARCHAR(191) NOT NULL,
    `no_ktp` VARCHAR(191) NOT NULL,
    `foto_ktp` VARCHAR(191) NOT NULL,
    `withdraw_type` VARCHAR(191) NULL,
    `withdraw_day` INTEGER NULL,
    `bank_mitra` VARCHAR(191) NULL,
    `no_rekening_mitra` VARCHAR(191) NULL,
    `status` ENUM('pending', 'aktif', 'ditolak') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Mitra_userId_key`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `otp_codes` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_email` VARCHAR(191) NOT NULL,
    `kode_otp` VARCHAR(191) NOT NULL,
    `expired_at` DATETIME(3) NOT NULL,
    `digunakan` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Lapangan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mitra_id` INTEGER NOT NULL,
    `nama` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `lokasi` VARCHAR(191) NULL,
    `harga` DECIMAL(65, 30) NOT NULL,
    `gambar` VARCHAR(191) NULL,
    `rating` DOUBLE NULL,
    `status` ENUM('tersedia', 'dalam_perbaikan') NOT NULL DEFAULT 'tersedia',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Lapangan_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LapanganDetail` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lapangan_id` INTEGER NOT NULL,
    `alamat` VARCHAR(191) NOT NULL,
    `maps` TEXT NOT NULL,
    `deskripsi` TEXT NOT NULL,
    `type` VARCHAR(191) NOT NULL,
    `fasilitas` JSON NOT NULL,
    `interval` INTEGER NOT NULL DEFAULT 60,
    `breakTime` INTEGER NOT NULL DEFAULT 10,

    UNIQUE INDEX `LapanganDetail_lapangan_id_key`(`lapangan_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `LapanganGambar` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lapangan_id` INTEGER NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `JadwalLapangan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `lapangan_id` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `slot` VARCHAR(191) NOT NULL,
    `status` ENUM('tersedia', 'dikunci', 'booked') NOT NULL DEFAULT 'tersedia',
    `locked_until` DATETIME(3) NULL,

    UNIQUE INDEX `JadwalLapangan_lapangan_id_tanggal_slot_key`(`lapangan_id`, `tanggal`, `slot`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `order_booking` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `lapangan_id` INTEGER NOT NULL,
    `jadwalLapanganId` INTEGER NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_mulai` VARCHAR(191) NOT NULL,
    `jam_selesai` VARCHAR(191) NOT NULL,
    `total_harga` DECIMAL(65, 30) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `sewa_raket` BOOLEAN NOT NULL DEFAULT false,
    `biaya_raket` INTEGER NOT NULL DEFAULT 0,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `expired_at` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `transaksi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `lapangan_id` INTEGER NOT NULL,
    `jadwal_id` INTEGER NOT NULL,
    `order_id` INTEGER NULL,
    `total_harga` DECIMAL(65, 30) NOT NULL,
    `status_pembayaran` ENUM('pending', 'berhasil', 'gagal', 'refund') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `transaksi_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `raket_padel` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nama` VARCHAR(191) NOT NULL,
    `harga` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `sewa_raket` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `transaksi_id` INTEGER NOT NULL,
    `raket_id` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `total_harga` DECIMAL(65, 30) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_user` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `saldo` INTEGER NOT NULL DEFAULT 0,
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `wallet_user_user_id_key`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wallet_history` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `wallet_id` INTEGER NOT NULL,
    `jumlah` INTEGER NOT NULL,
    `saldo_akhir` INTEGER NOT NULL,
    `tipe` ENUM('booking', 'refund', 'topup') NOT NULL,
    `transaksi_id` INTEGER NULL,
    `order_id` INTEGER NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `wallet_history_wallet_id_idx`(`wallet_id`),
    INDEX `wallet_history_transaksi_id_idx`(`transaksi_id`),
    INDEX `wallet_history_order_id_idx`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refund` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `transaksi_id` INTEGER NOT NULL,
    `order_id` INTEGER NOT NULL,
    `jumlah` DECIMAL(65, 30) NOT NULL,
    `alasan` VARCHAR(191) NULL,
    `status` ENUM('pending', 'approved', 'rejected', 'selesai') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `processed_at` DATETIME(3) NULL,

    UNIQUE INDEX `refund_transaksi_id_key`(`transaksi_id`),
    UNIQUE INDEX `refund_order_id_key`(`order_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `notifikasi` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `pesan` VARCHAR(191) NOT NULL,
    `dibaca` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ulasan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `user_id` INTEGER NOT NULL,
    `lapangan_id` INTEGER NOT NULL,
    `rating` INTEGER NOT NULL,
    `komentar` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pendapatan_mitra` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mitra_id` INTEGER NOT NULL,
    `transaksi_id` INTEGER NOT NULL,
    `jumlah` DECIMAL(65, 30) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `pencairan_pendapatan` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `mitra_id` INTEGER NOT NULL,
    `jumlah` DECIMAL(65, 30) NOT NULL,
    `status` ENUM('pending', 'diproses', 'berhasil', 'ditolak') NOT NULL DEFAULT 'pending',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mitra` ADD CONSTRAINT `Mitra_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Lapangan` ADD CONSTRAINT `Lapangan_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `Mitra`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LapanganDetail` ADD CONSTRAINT `LapanganDetail_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `LapanganGambar` ADD CONSTRAINT `LapanganGambar_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `JadwalLapangan` ADD CONSTRAINT `JadwalLapangan_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_booking` ADD CONSTRAINT `order_booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_booking` ADD CONSTRAINT `order_booking_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `order_booking` ADD CONSTRAINT `order_booking_jadwalLapanganId_fkey` FOREIGN KEY (`jadwalLapanganId`) REFERENCES `JadwalLapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_jadwal_id_fkey` FOREIGN KEY (`jadwal_id`) REFERENCES `JadwalLapangan`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transaksi` ADD CONSTRAINT `transaksi_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sewa_raket` ADD CONSTRAINT `sewa_raket_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sewa_raket` ADD CONSTRAINT `sewa_raket_raket_id_fkey` FOREIGN KEY (`raket_id`) REFERENCES `raket_padel`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_user` ADD CONSTRAINT `wallet_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_history` ADD CONSTRAINT `wallet_history_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet_user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallet_history` ADD CONSTRAINT `wallet_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refund` ADD CONSTRAINT `refund_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refund` ADD CONSTRAINT `refund_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refund` ADD CONSTRAINT `refund_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifikasi` ADD CONSTRAINT `notifikasi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ulasan` ADD CONSTRAINT `ulasan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ulasan` ADD CONSTRAINT `ulasan_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `Lapangan`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pendapatan_mitra` ADD CONSTRAINT `pendapatan_mitra_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `Mitra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `pencairan_pendapatan` ADD CONSTRAINT `pencairan_pendapatan_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `Mitra`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
