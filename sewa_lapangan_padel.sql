-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Waktu pembuatan: 08 Jan 2026 pada 09.14
-- Versi server: 10.4.32-MariaDB
-- Versi PHP: 8.4.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `sewa_lapangan_padel`
--

-- --------------------------------------------------------

--
-- Struktur dari tabel `jadwallapangan`
--

CREATE TABLE `jadwallapangan` (
  `id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `tanggal` datetime(3) NOT NULL,
  `slot` varchar(191) NOT NULL,
  `status` enum('tersedia','dikunci','booked') NOT NULL DEFAULT 'tersedia',
  `locked_until` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `jadwallapangan`
--

INSERT INTO `jadwallapangan` (`id`, `lapangan_id`, `tanggal`, `slot`, `status`, `locked_until`) VALUES
(1, 1, '2026-01-05 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(2, 1, '2026-01-05 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(3, 1, '2026-01-05 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(4, 1, '2026-01-05 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(5, 1, '2026-01-05 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(6, 1, '2026-01-05 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(7, 1, '2026-01-05 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(15, 1, '2026-01-06 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(16, 1, '2026-01-06 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(17, 1, '2026-01-06 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(18, 1, '2026-01-06 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(19, 1, '2026-01-06 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(20, 1, '2026-01-06 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(21, 1, '2026-01-06 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(22, 1, '2026-01-07 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(23, 1, '2026-01-07 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(24, 1, '2026-01-07 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(25, 1, '2026-01-07 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(26, 1, '2026-01-07 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(27, 1, '2026-01-07 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(28, 1, '2026-01-07 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(29, 1, '2026-01-08 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(30, 1, '2026-01-08 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(31, 1, '2026-01-08 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(32, 1, '2026-01-08 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(33, 1, '2026-01-08 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(34, 1, '2026-01-08 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(35, 1, '2026-01-08 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(36, 1, '2026-01-09 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(37, 1, '2026-01-09 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(38, 1, '2026-01-09 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(39, 1, '2026-01-09 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(40, 1, '2026-01-09 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(41, 1, '2026-01-09 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(42, 1, '2026-01-09 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(43, 1, '2026-01-10 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(44, 1, '2026-01-10 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(45, 1, '2026-01-10 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(46, 1, '2026-01-10 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(47, 1, '2026-01-10 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(48, 1, '2026-01-10 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(49, 1, '2026-01-10 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(50, 1, '2026-01-11 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(51, 1, '2026-01-11 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(52, 1, '2026-01-11 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(53, 1, '2026-01-11 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(54, 1, '2026-01-11 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(55, 1, '2026-01-11 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(56, 1, '2026-01-11 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(57, 1, '2026-01-12 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(58, 1, '2026-01-12 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(59, 1, '2026-01-12 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(60, 1, '2026-01-12 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(61, 1, '2026-01-12 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(62, 1, '2026-01-12 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(63, 1, '2026-01-12 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(64, 1, '2026-01-13 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(65, 1, '2026-01-13 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(66, 1, '2026-01-13 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(67, 1, '2026-01-13 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(68, 1, '2026-01-13 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(69, 1, '2026-01-13 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(70, 1, '2026-01-13 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(71, 1, '2026-01-14 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(72, 1, '2026-01-14 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(73, 1, '2026-01-14 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(74, 1, '2026-01-14 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(75, 1, '2026-01-14 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(76, 1, '2026-01-14 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(77, 1, '2026-01-14 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(78, 1, '2026-01-15 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(79, 1, '2026-01-15 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(80, 1, '2026-01-15 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(81, 1, '2026-01-15 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(82, 1, '2026-01-15 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(83, 1, '2026-01-15 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(84, 1, '2026-01-15 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(85, 1, '2026-01-16 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(86, 1, '2026-01-16 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(87, 1, '2026-01-16 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(88, 1, '2026-01-16 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(89, 1, '2026-01-16 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(90, 1, '2026-01-16 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(91, 1, '2026-01-16 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(92, 1, '2026-01-17 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(93, 1, '2026-01-17 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(94, 1, '2026-01-17 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(95, 1, '2026-01-17 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(96, 1, '2026-01-17 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(97, 1, '2026-01-17 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(98, 1, '2026-01-17 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(99, 1, '2026-01-18 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(100, 1, '2026-01-18 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(101, 1, '2026-01-18 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(102, 1, '2026-01-18 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(103, 1, '2026-01-18 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(104, 1, '2026-01-18 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(105, 1, '2026-01-18 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(106, 1, '2026-01-19 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(107, 1, '2026-01-19 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(108, 1, '2026-01-19 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(109, 1, '2026-01-19 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(110, 1, '2026-01-19 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(111, 1, '2026-01-19 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(112, 1, '2026-01-19 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(113, 1, '2026-01-20 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(114, 1, '2026-01-20 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(115, 1, '2026-01-20 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(116, 1, '2026-01-20 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(117, 1, '2026-01-20 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(118, 1, '2026-01-20 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(119, 1, '2026-01-20 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(120, 1, '2026-01-21 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(121, 1, '2026-01-21 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(122, 1, '2026-01-21 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(123, 1, '2026-01-21 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(124, 1, '2026-01-21 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(125, 1, '2026-01-21 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(126, 1, '2026-01-21 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(127, 1, '2026-01-22 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(128, 1, '2026-01-22 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(129, 1, '2026-01-22 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(130, 1, '2026-01-22 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(131, 1, '2026-01-22 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(132, 1, '2026-01-22 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(133, 1, '2026-01-22 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(134, 1, '2026-01-23 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(135, 1, '2026-01-23 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(136, 1, '2026-01-23 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(137, 1, '2026-01-23 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(138, 1, '2026-01-23 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(139, 1, '2026-01-23 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(140, 1, '2026-01-23 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(141, 1, '2026-01-24 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(142, 1, '2026-01-24 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(143, 1, '2026-01-24 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(144, 1, '2026-01-24 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(145, 1, '2026-01-24 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(146, 1, '2026-01-24 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(147, 1, '2026-01-24 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL),
(148, 1, '2026-01-25 00:00:00.000', '08:00 - 09:00', 'tersedia', NULL),
(149, 1, '2026-01-25 00:00:00.000', '09:10 - 10:10', 'tersedia', NULL),
(150, 1, '2026-01-25 00:00:00.000', '12:00 - 13:00', 'tersedia', NULL),
(151, 1, '2026-01-25 00:00:00.000', '13:10 - 14:10', 'tersedia', NULL),
(152, 1, '2026-01-25 00:00:00.000', '14:20 - 15:20', 'tersedia', NULL),
(153, 1, '2026-01-25 00:00:00.000', '19:00 - 20:00', 'tersedia', NULL),
(154, 1, '2026-01-25 00:00:00.000', '20:10 - 21:10', 'tersedia', NULL);

-- --------------------------------------------------------

--
-- Struktur dari tabel `lapangan`
--

CREATE TABLE `lapangan` (
  `id` int(11) NOT NULL,
  `mitra_id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `slug` varchar(191) NOT NULL,
  `lokasi` varchar(191) DEFAULT NULL,
  `harga` decimal(65,30) NOT NULL,
  `gambar` varchar(191) DEFAULT NULL,
  `rating` double DEFAULT NULL,
  `status` enum('tersedia','dalam_perbaikan') NOT NULL DEFAULT 'tersedia',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lapangan`
--

INSERT INTO `lapangan` (`id`, `mitra_id`, `nama`, `slug`, `lokasi`, `harga`, `gambar`, `rating`, `status`, `created_at`) VALUES
(1, 1, 'Ambassador Tenis', 'ambassador-tenis', 'Semarang Kota', 150000.000000000000000000000000000000, 'lapangan_temp_1767593177672.jpg', NULL, 'tersedia', '2026-01-05 06:06:05.361');

-- --------------------------------------------------------

--
-- Struktur dari tabel `lapangandetail`
--

CREATE TABLE `lapangandetail` (
  `id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `alamat` varchar(191) NOT NULL,
  `maps` text NOT NULL,
  `deskripsi` text NOT NULL,
  `type` varchar(191) NOT NULL,
  `fasilitas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NOT NULL CHECK (json_valid(`fasilitas`)),
  `interval` int(11) NOT NULL DEFAULT 60,
  `breakTime` int(11) NOT NULL DEFAULT 10
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lapangandetail`
--

INSERT INTO `lapangandetail` (`id`, `lapangan_id`, `alamat`, `maps`, `deskripsi`, `type`, `fasilitas`, `interval`, `breakTime`) VALUES
(1, 1, 'Jl. Dr. Wahidin No.41, Candi, Kec. Candisari, Kota Semarang, Jawa Tengah 50257', '<iframe src=\"https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15839.77708524621!2d110.41565649546801!3d-7.015836700000004!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x2e708d61dd9c6949%3A0xd89c764b128c3810!2sPadel%20Ground!5e0!3m2!1sid!2sid!4v1767593134534!5m2!1sid!2sid\" width=\"600\" height=\"450\" style=\"border:0;\" allowfullscreen=\"\" loading=\"lazy\" referrerpolicy=\"no-referrer-when-downgrade\"></iframe>', '⚠️ Chat ONLY ⚠️\r\nWhatsApp Admin : 081 1313 7090\r\n\r\nJadilah MEMBER - START FROM Rp 135.000/ jam - Dapat AUTO REMINDER Untuk PERPANJANGAN , Click Menu MEMBERSHIP di ATAS.\r\n\r\nFinest Indoor Tennis Dome in Malang, Jawa Timur , Indonesia. Est. July 2024.\r\n3 Profesional Tennis Courts Available, ITF Court Length\r\n\r\n⚠️ Chat ONLY ⚠️\r\nWhatsApp Admin : 081 1313 7090\r\n\r\nDemi Kenyamanan Bersama, dengan konfirmasi booking ini, user menyetujui untuk mengikuti PERATURAN VENUE :\r\n1. WAJIB GUNAKAN SEPATU & PERLENGKAPAN TENNIS khusus di dalam lapangan, gunakan & lepas Alas Kaki dari luar SEBELUM memasuki lapangan\r\n2. VENUE berhak RESCHEDULE jadwal user apabila ada event khusus yang bertabrakan dengan jadwal user TANPA pemberitahuan sebelumnya.\r\n3. VENUE AMBASSADOR adalah Zona BEBAS ROKOK, VAPE, MIRAS, OBAT-OBATAN TERLARANG, SENJATA TAJAM & API, PERKELAHIAN. Pelanggar akan diserahkan kepada yang berwajib\r\n4. User MENYETUJUI Venue merekam apapun & siapapun yang memasuki area sekitar VENUE\r\n5. USER wajib menjaga sopan santun & etika terhadap semua pengunjung & karyawan AMBASSADOR\r\n6. USER wajib mengetahui & menjaga kondisi KESEHATAN pribadi masing-masing sebelum, saat & setelah berada di area sekitar VENUE.\r\n7. VENUE tidak memiliki tenaga medis & tidak bertanggung jawab apabila terjadi masalah kesehatan dengan seluruh pengunjung area sekitar. Bantuan Medis akan segera dipanggilkan Ambulans terdekat & tercepat.\r\n\r\nGunakan Sepatu Olahraga Tennis\r\nNo Smoking / Vaping\r\nJagalah Sopan Santun\r\n06.00 - 15.00 tanpa Lampu, bisa Request\r\n15.00 - 22.00 include Lampu\r\n\r\n⚠️ AWAS PENIPUAN ⚠️\r\nNorek Official BCA atas nama\r\nPT AMBASSADOR SPORT INDONESIA', 'indoor', '[\"Sewa Raket\",\"AC\",\"Mushola\",\"WiFi\",\"Ruang Ganti\",\"Toilet\",\"Parkir Mobil\",\"Parkir Motor\",\"Jual Minum\",\"Cafe\",\"Tribun Penonton\",\"Hot Shower\",\"Treatment Room\",\"Jual Makanan Ringan\"]', 60, 10);

-- --------------------------------------------------------

--
-- Struktur dari tabel `lapangangambar`
--

CREATE TABLE `lapangangambar` (
  `id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `file_name` varchar(191) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `lapangangambar`
--

INSERT INTO `lapangangambar` (`id`, `lapangan_id`, `file_name`, `created_at`) VALUES
(1, 1, 'lapangan_temp_1767593165314.jpg', '2026-01-05 06:06:05.372'),
(2, 1, 'lapangan_temp_1767593165315.jpg', '2026-01-05 06:06:05.372');

-- --------------------------------------------------------

--
-- Struktur dari tabel `mitra`
--

CREATE TABLE `mitra` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `nama_usaha` varchar(191) NOT NULL,
  `alamat_usaha` varchar(191) NOT NULL,
  `no_ktp` varchar(191) NOT NULL,
  `foto_ktp` varchar(191) NOT NULL,
  `withdraw_type` varchar(191) DEFAULT NULL,
  `withdraw_day` int(11) DEFAULT NULL,
  `bank_mitra` varchar(191) DEFAULT NULL,
  `no_rekening_mitra` varchar(191) DEFAULT NULL,
  `status` enum('pending','aktif','ditolak') NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `mitra`
--

INSERT INTO `mitra` (`id`, `userId`, `nama_usaha`, `alamat_usaha`, `no_ktp`, `foto_ktp`, `withdraw_type`, `withdraw_day`, `bank_mitra`, `no_rekening_mitra`, `status`, `created_at`) VALUES
(1, 1, 'Lapangan Padel Jaya Kusuma', 'Jl. Poncowolo Barat No. 1, Gang Buntu', '6402031905060004', 'ktp_0d8c4afa-b68b-4c37-8ae5-c94886ec6f80_1767592964026.jpeg', 'monthly', 4, NULL, NULL, 'pending', '2026-01-05 06:02:44.036');

-- --------------------------------------------------------

--
-- Struktur dari tabel `notifikasi`
--

CREATE TABLE `notifikasi` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `pesan` varchar(191) NOT NULL,
  `dibaca` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `order_booking`
--

CREATE TABLE `order_booking` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `jadwalLapanganId` int(11) NOT NULL,
  `tanggal` datetime(3) NOT NULL,
  `jam_mulai` varchar(191) NOT NULL,
  `jam_selesai` varchar(191) NOT NULL,
  `total_harga` decimal(65,30) NOT NULL,
  `status` varchar(191) NOT NULL,
  `sewa_raket` tinyint(1) NOT NULL DEFAULT 0,
  `biaya_raket` int(11) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `expired_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `order_booking`
--

INSERT INTO `order_booking` (`id`, `user_id`, `lapangan_id`, `jadwalLapanganId`, `tanggal`, `jam_mulai`, `jam_selesai`, `total_harga`, `status`, `sewa_raket`, `biaya_raket`, `created_at`, `expired_at`) VALUES
(1, 3, 1, 57, '2026-01-12 00:00:00.000', '08:00 ', ' 09:00', 180000.000000000000000000000000000000, 'refund', 0, 0, '2026-01-06 16:37:18.824', '2026-01-06 16:52:18.823'),
(2, 3, 1, 62, '2026-01-12 00:00:00.000', '19:00 ', ' 20:00', 180000.000000000000000000000000000000, 'refund', 0, 0, '2026-01-06 16:57:30.846', '2026-01-06 17:12:30.844');

-- --------------------------------------------------------

--
-- Struktur dari tabel `otp_codes`
--

CREATE TABLE `otp_codes` (
  `id` int(11) NOT NULL,
  `user_email` varchar(191) NOT NULL,
  `kode_otp` varchar(191) NOT NULL,
  `expired_at` datetime(3) NOT NULL,
  `digunakan` tinyint(1) NOT NULL DEFAULT 0,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `otp_codes`
--

INSERT INTO `otp_codes` (`id`, `user_email`, `kode_otp`, `expired_at`, `digunakan`, `created_at`) VALUES
(1, 'fshl.users@gmail.com', '432883', '2026-01-05 06:03:38.979', 1, '2026-01-05 05:58:38.991'),
(5, 'faishalrasyid4@gmail.com', '601458', '2026-01-05 06:41:09.243', 0, '2026-01-05 06:36:09.255'),
(7, 'faisrasyid869@gmail.com', '571767', '2026-01-05 06:43:11.643', 1, '2026-01-05 06:38:11.668'),
(8, 'ajirangga766@gmail.com', '211214', '2026-01-05 08:06:21.573', 1, '2026-01-05 08:01:21.579'),
(13, 'ardhialirsyad@gmail.com', '614555', '2026-01-05 08:52:19.013', 0, '2026-01-05 08:47:19.023'),
(14, 'nalafloristsemarang@gmail.com', '194090', '2026-01-06 16:56:12.111', 1, '2026-01-06 16:51:12.118');

-- --------------------------------------------------------

--
-- Struktur dari tabel `pencairan_pendapatan`
--

CREATE TABLE `pencairan_pendapatan` (
  `id` int(11) NOT NULL,
  `mitra_id` int(11) NOT NULL,
  `jumlah` decimal(65,30) NOT NULL,
  `status` enum('pending','diproses','berhasil','ditolak') NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `pendapatan_mitra`
--

CREATE TABLE `pendapatan_mitra` (
  `id` int(11) NOT NULL,
  `mitra_id` int(11) NOT NULL,
  `transaksi_id` int(11) NOT NULL,
  `jumlah` decimal(65,30) NOT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `raket_padel`
--

CREATE TABLE `raket_padel` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `harga` decimal(65,30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `refund`
--

CREATE TABLE `refund` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `transaksi_id` int(11) NOT NULL,
  `order_id` int(11) NOT NULL,
  `jumlah` decimal(65,30) NOT NULL,
  `alasan` varchar(191) DEFAULT NULL,
  `status` enum('pending','approved','rejected','selesai') NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `processed_at` datetime(3) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `refund`
--

INSERT INTO `refund` (`id`, `user_id`, `transaksi_id`, `order_id`, `jumlah`, `alasan`, `status`, `created_at`, `processed_at`) VALUES
(1, 3, 1, 1, 180000.000000000000000000000000000000, 'salah input jam kak', 'approved', '2026-01-06 16:37:37.846', '2026-01-06 16:38:17.748'),
(2, 3, 2, 2, 180000.000000000000000000000000000000, 'jashdkjashdkjashd', 'approved', '2026-01-06 17:00:11.716', '2026-01-06 17:30:00.077');

-- --------------------------------------------------------

--
-- Struktur dari tabel `sewa_raket`
--

CREATE TABLE `sewa_raket` (
  `id` int(11) NOT NULL,
  `transaksi_id` int(11) NOT NULL,
  `raket_id` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `total_harga` decimal(65,30) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `transaksi`
--

CREATE TABLE `transaksi` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `jadwal_id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `total_harga` decimal(65,30) NOT NULL,
  `status_pembayaran` enum('pending','berhasil','gagal','refund') NOT NULL DEFAULT 'pending',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `transaksi`
--

INSERT INTO `transaksi` (`id`, `user_id`, `lapangan_id`, `jadwal_id`, `order_id`, `total_harga`, `status_pembayaran`, `created_at`) VALUES
(1, 3, 1, 57, 1, 180000.000000000000000000000000000000, 'refund', '2026-01-06 16:37:18.839'),
(2, 3, 1, 62, 2, 180000.000000000000000000000000000000, 'refund', '2026-01-06 16:57:30.868');

-- --------------------------------------------------------

--
-- Struktur dari tabel `ulasan`
--

CREATE TABLE `ulasan` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `lapangan_id` int(11) NOT NULL,
  `rating` int(11) NOT NULL,
  `komentar` varchar(191) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Struktur dari tabel `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `nama` varchar(191) NOT NULL,
  `username` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `no_hp` varchar(191) DEFAULT NULL,
  `foto` varchar(191) DEFAULT NULL,
  `bio` varchar(191) DEFAULT NULL,
  `role` enum('admin','user','mitra') NOT NULL DEFAULT 'user',
  `status` enum('aktif','nonaktif') NOT NULL DEFAULT 'aktif',
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `users`
--

INSERT INTO `users` (`id`, `nama`, `username`, `email`, `password`, `no_hp`, `foto`, `bio`, `role`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Muhammad Ardhi Al-Irsyad', 'Ardhi', 'fshl.users@gmail.com', '$2b$10$ost/Dy97gp/dZYo1Ulo6kOrBibebDVV/e2LP3MsniRRp0BIaJSeOK', '0878765423', NULL, NULL, 'mitra', 'aktif', '2026-01-05 05:59:50.150', '2026-01-05 05:59:50.150'),
(2, 'Faishal Rasyid Rusianto', 'Faishal', 'faisrasyid869@gmail.com', '$2b$10$Bq59HnjZbk6Diu.nvRR3P.8WAj7YWqgaF7aJuJuQZofnciLY/SG6q', '0845457851', NULL, NULL, 'admin', 'aktif', '2026-01-05 06:39:03.776', '2026-01-05 06:39:03.776'),
(3, 'ardhi', 'rdh', 'ardhialirsyad@gmail.com', '$2b$10$y0vwcJA3/6lx0RgfoR/7jeWtgXGnXrKHrR3XAj1sO24Hm1ppN0BUq', '081770082360', NULL, NULL, 'user', 'aktif', '2026-01-05 08:40:04.268', '2026-01-05 08:40:04.268'),
(4, 'Nala Florist', 'Nala', 'nalafloristsemarang@gmail.com', '$2b$10$s4qieqb7aao7jSpU611CDe4pEZVXby7cGe4uyj428ylsa.U8427Aq', '089767773672', NULL, NULL, 'user', 'aktif', '2026-01-06 16:55:39.589', '2026-01-06 16:55:39.589');

-- --------------------------------------------------------

--
-- Struktur dari tabel `wallet_history`
--

CREATE TABLE `wallet_history` (
  `id` int(11) NOT NULL,
  `wallet_id` int(11) NOT NULL,
  `jumlah` int(11) NOT NULL,
  `saldo_akhir` int(11) NOT NULL,
  `tipe` enum('booking','refund','topup') NOT NULL,
  `transaksi_id` int(11) DEFAULT NULL,
  `order_id` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `wallet_history`
--

INSERT INTO `wallet_history` (`id`, `wallet_id`, `jumlah`, `saldo_akhir`, `tipe`, `transaksi_id`, `order_id`, `created_at`) VALUES
(1, 3, 180000, 820000, 'booking', 1, 1, '2026-01-06 16:37:18.843'),
(2, 3, 180000, 1000000, 'refund', 1, 1, '2026-01-06 16:38:17.744'),
(3, 3, 180000, 820000, 'booking', 2, 2, '2026-01-06 16:57:30.876'),
(4, 3, 180000, 1000000, 'refund', 2, 2, '2026-01-06 17:30:00.072');

-- --------------------------------------------------------

--
-- Struktur dari tabel `wallet_user`
--

CREATE TABLE `wallet_user` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `saldo` int(11) NOT NULL DEFAULT 0,
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `wallet_user`
--

INSERT INTO `wallet_user` (`id`, `user_id`, `saldo`, `updated_at`) VALUES
(1, 1, 0, '2026-01-05 05:59:50.160'),
(2, 2, 0, '2026-01-05 06:39:03.789'),
(3, 3, 1000000, '2026-01-06 17:30:00.066'),
(4, 4, 500000, '2026-01-06 16:55:39.594');

-- --------------------------------------------------------

--
-- Struktur dari tabel `_prisma_migrations`
--

CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) NOT NULL,
  `checksum` varchar(64) NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) NOT NULL,
  `logs` text DEFAULT NULL,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `applied_steps_count` int(10) UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data untuk tabel `_prisma_migrations`
--

INSERT INTO `_prisma_migrations` (`id`, `checksum`, `finished_at`, `migration_name`, `logs`, `rolled_back_at`, `started_at`, `applied_steps_count`) VALUES
('27b7d355-9173-4aeb-9f20-06f9bba2bdeb', '19b068cc87e976400295d6f9e49c1175e36c21395074dd7e8ebb99a3245302f5', '2026-01-05 05:56:11.631', '20260105055610_init_clean', NULL, NULL, '2026-01-05 05:56:10.061', 1);

--
-- Indexes for dumped tables
--

--
-- Indeks untuk tabel `jadwallapangan`
--
ALTER TABLE `jadwallapangan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `JadwalLapangan_lapangan_id_tanggal_slot_key` (`lapangan_id`,`tanggal`,`slot`);

--
-- Indeks untuk tabel `lapangan`
--
ALTER TABLE `lapangan`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Lapangan_slug_key` (`slug`),
  ADD KEY `Lapangan_mitra_id_fkey` (`mitra_id`);

--
-- Indeks untuk tabel `lapangandetail`
--
ALTER TABLE `lapangandetail`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `LapanganDetail_lapangan_id_key` (`lapangan_id`);

--
-- Indeks untuk tabel `lapangangambar`
--
ALTER TABLE `lapangangambar`
  ADD PRIMARY KEY (`id`),
  ADD KEY `LapanganGambar_lapangan_id_fkey` (`lapangan_id`);

--
-- Indeks untuk tabel `mitra`
--
ALTER TABLE `mitra`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `Mitra_userId_key` (`userId`);

--
-- Indeks untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifikasi_user_id_fkey` (`user_id`);

--
-- Indeks untuk tabel `order_booking`
--
ALTER TABLE `order_booking`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_booking_user_id_fkey` (`user_id`),
  ADD KEY `order_booking_lapangan_id_fkey` (`lapangan_id`),
  ADD KEY `order_booking_jadwalLapanganId_fkey` (`jadwalLapanganId`);

--
-- Indeks untuk tabel `otp_codes`
--
ALTER TABLE `otp_codes`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `pencairan_pendapatan`
--
ALTER TABLE `pencairan_pendapatan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pencairan_pendapatan_mitra_id_fkey` (`mitra_id`);

--
-- Indeks untuk tabel `pendapatan_mitra`
--
ALTER TABLE `pendapatan_mitra`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pendapatan_mitra_mitra_id_fkey` (`mitra_id`);

--
-- Indeks untuk tabel `raket_padel`
--
ALTER TABLE `raket_padel`
  ADD PRIMARY KEY (`id`);

--
-- Indeks untuk tabel `refund`
--
ALTER TABLE `refund`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `refund_transaksi_id_key` (`transaksi_id`),
  ADD UNIQUE KEY `refund_order_id_key` (`order_id`),
  ADD KEY `refund_user_id_fkey` (`user_id`);

--
-- Indeks untuk tabel `sewa_raket`
--
ALTER TABLE `sewa_raket`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sewa_raket_transaksi_id_fkey` (`transaksi_id`),
  ADD KEY `sewa_raket_raket_id_fkey` (`raket_id`);

--
-- Indeks untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `transaksi_order_id_key` (`order_id`),
  ADD KEY `transaksi_user_id_fkey` (`user_id`),
  ADD KEY `transaksi_lapangan_id_fkey` (`lapangan_id`),
  ADD KEY `transaksi_jadwal_id_fkey` (`jadwal_id`);

--
-- Indeks untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD PRIMARY KEY (`id`),
  ADD KEY `ulasan_user_id_fkey` (`user_id`),
  ADD KEY `ulasan_lapangan_id_fkey` (`lapangan_id`);

--
-- Indeks untuk tabel `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_key` (`username`),
  ADD UNIQUE KEY `users_email_key` (`email`);

--
-- Indeks untuk tabel `wallet_history`
--
ALTER TABLE `wallet_history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `wallet_history_wallet_id_idx` (`wallet_id`),
  ADD KEY `wallet_history_transaksi_id_idx` (`transaksi_id`),
  ADD KEY `wallet_history_order_id_idx` (`order_id`);

--
-- Indeks untuk tabel `wallet_user`
--
ALTER TABLE `wallet_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `wallet_user_user_id_key` (`user_id`);

--
-- Indeks untuk tabel `_prisma_migrations`
--
ALTER TABLE `_prisma_migrations`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT untuk tabel yang dibuang
--

--
-- AUTO_INCREMENT untuk tabel `jadwallapangan`
--
ALTER TABLE `jadwallapangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=155;

--
-- AUTO_INCREMENT untuk tabel `lapangan`
--
ALTER TABLE `lapangan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `lapangandetail`
--
ALTER TABLE `lapangandetail`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `lapangangambar`
--
ALTER TABLE `lapangangambar`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `mitra`
--
ALTER TABLE `mitra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `order_booking`
--
ALTER TABLE `order_booking`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `otp_codes`
--
ALTER TABLE `otp_codes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT untuk tabel `pencairan_pendapatan`
--
ALTER TABLE `pencairan_pendapatan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `pendapatan_mitra`
--
ALTER TABLE `pendapatan_mitra`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `raket_padel`
--
ALTER TABLE `raket_padel`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `refund`
--
ALTER TABLE `refund`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `sewa_raket`
--
ALTER TABLE `sewa_raket`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT untuk tabel `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `wallet_history`
--
ALTER TABLE `wallet_history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT untuk tabel `wallet_user`
--
ALTER TABLE `wallet_user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Ketidakleluasaan untuk tabel pelimpahan (Dumped Tables)
--

--
-- Ketidakleluasaan untuk tabel `jadwallapangan`
--
ALTER TABLE `jadwallapangan`
  ADD CONSTRAINT `JadwalLapangan_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lapangan`
--
ALTER TABLE `lapangan`
  ADD CONSTRAINT `Lapangan_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lapangandetail`
--
ALTER TABLE `lapangandetail`
  ADD CONSTRAINT `LapanganDetail_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `lapangangambar`
--
ALTER TABLE `lapangangambar`
  ADD CONSTRAINT `LapanganGambar_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `mitra`
--
ALTER TABLE `mitra`
  ADD CONSTRAINT `Mitra_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `notifikasi`
--
ALTER TABLE `notifikasi`
  ADD CONSTRAINT `notifikasi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `order_booking`
--
ALTER TABLE `order_booking`
  ADD CONSTRAINT `order_booking_jadwalLapanganId_fkey` FOREIGN KEY (`jadwalLapanganId`) REFERENCES `jadwallapangan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_booking_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `order_booking_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pencairan_pendapatan`
--
ALTER TABLE `pencairan_pendapatan`
  ADD CONSTRAINT `pencairan_pendapatan_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `pendapatan_mitra`
--
ALTER TABLE `pendapatan_mitra`
  ADD CONSTRAINT `pendapatan_mitra_mitra_id_fkey` FOREIGN KEY (`mitra_id`) REFERENCES `mitra` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `refund`
--
ALTER TABLE `refund`
  ADD CONSTRAINT `refund_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `refund_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `refund_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `sewa_raket`
--
ALTER TABLE `sewa_raket`
  ADD CONSTRAINT `sewa_raket_raket_id_fkey` FOREIGN KEY (`raket_id`) REFERENCES `raket_padel` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `sewa_raket_transaksi_id_fkey` FOREIGN KEY (`transaksi_id`) REFERENCES `transaksi` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `transaksi`
--
ALTER TABLE `transaksi`
  ADD CONSTRAINT `transaksi_jadwal_id_fkey` FOREIGN KEY (`jadwal_id`) REFERENCES `jadwallapangan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `transaksi_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `ulasan`
--
ALTER TABLE `ulasan`
  ADD CONSTRAINT `ulasan_lapangan_id_fkey` FOREIGN KEY (`lapangan_id`) REFERENCES `lapangan` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `ulasan_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `wallet_history`
--
ALTER TABLE `wallet_history`
  ADD CONSTRAINT `wallet_history_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `order_booking` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `wallet_history_wallet_id_fkey` FOREIGN KEY (`wallet_id`) REFERENCES `wallet_user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Ketidakleluasaan untuk tabel `wallet_user`
--
ALTER TABLE `wallet_user`
  ADD CONSTRAINT `wallet_user_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
