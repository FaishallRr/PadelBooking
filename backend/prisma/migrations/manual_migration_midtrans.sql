-- =============================================
-- Migration: Add Midtrans + Admin Fee + Pencairan
-- Run this BEFORE deploying the new backend
-- =============================================

-- 1. Tambah field Midtrans dan admin fee ke transaksi
ALTER TABLE `transaksi`
  ADD COLUMN `biaya_admin` DECIMAL(65,30) NOT NULL DEFAULT 0 AFTER `total_harga`,
  ADD COLUMN `biaya_mitra` DECIMAL(65,30) NOT NULL DEFAULT 0 AFTER `biaya_admin`,
  ADD COLUMN `midtrans_order_id` VARCHAR(191) NULL AFTER `status_pembayaran`,
  ADD COLUMN `snap_token` VARCHAR(191) NULL AFTER `midtrans_order_id`,
  ADD COLUMN `payment_type` VARCHAR(191) NULL AFTER `snap_token`;

-- Index untuk midtrans_order_id (unique)
ALTER TABLE `transaksi`
  ADD UNIQUE KEY `transaksi_midtrans_order_id_key` (`midtrans_order_id`);

-- 2. Tambah status ke pendapatan_mitra + unique transaksi_id
ALTER TABLE `pendapatan_mitra`
  ADD COLUMN `status` ENUM('belum_cair','sudah_cair') NOT NULL DEFAULT 'belum_cair' AFTER `jumlah`,
  ADD UNIQUE KEY `pendapatan_mitra_transaksi_id_key` (`transaksi_id`);

-- Add foreign key transaksi_id -> transaksi
ALTER TABLE `pendapatan_mitra`
  ADD CONSTRAINT `pendapatan_mitra_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- 3. Tambah field ke pencairan_pendapatan
ALTER TABLE `pencairan_pendapatan`
  ADD COLUMN `biaya_admin_pencairan` DECIMAL(65,30) NOT NULL DEFAULT 0 AFTER `jumlah`,
  ADD COLUMN `jumlah_diterima` DECIMAL(65,30) NOT NULL DEFAULT 0 AFTER `biaya_admin_pencairan`,
  ADD COLUMN `catatan` VARCHAR(191) NULL AFTER `jumlah_diterima`,
  ADD COLUMN `processed_at` DATETIME(3) NULL AFTER `created_at`;
