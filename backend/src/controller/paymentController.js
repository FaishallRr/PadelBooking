// src/controller/paymentController.js
import prisma from "../utils/prismaClient.js";
import { createSnapTransaction, getTransactionStatus } from "../utils/midtrans.js";
import { ADMIN_FEE_PERCENT, calculatePriceBreakdown, SEWA_RAKET_PRICE } from "../utils/constants.js";
import { createNotification } from "../utils/notificationHelper.js";

/**
 * POST /api/payment/create
 * Buat Midtrans Snap Token
 * body: { order_id, sewa_raket }
 */
export const createPayment = async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ message: "User tidak ditemukan" });

    const { order_id, sewa_raket = false } = req.body;
    if (!order_id) return res.status(400).json({ message: "order_id tidak dikirim" });

    // 1. Ambil order
    const order = await prisma.order_booking.findUnique({
      where: { id: Number(order_id) },
      include: {
        lapangan: {
          include: { mitra: true },
        },
        user: true,
      },
    });

    if (!order) return res.status(404).json({ message: "Order tidak ditemukan" });
    if (order.user_id !== userId) return res.status(403).json({ message: "Bukan order Anda" });
    if (order.status !== "pending") return res.status(400).json({ message: "Order sudah diproses" });

    // 2. Hitung harga
    const hargaSewa = Number(order.total_harga);
    const { biayaAdmin, biayaMitra, totalBayar, biayaRaket } = calculatePriceBreakdown(hargaSewa, sewa_raket);

    // 3. Generate unique Midtrans order ID
    const midtransOrderId = `PADEL-${order.id}-${Date.now()}`;

    // 4. Item details untuk Midtrans
    const items = [
      {
        id: `sewa-${order.lapangan_id}`,
        price: hargaSewa,
        quantity: 1,
        name: `Sewa ${order.lapangan.nama}`,
      },
      {
        id: "biaya-admin",
        price: biayaAdmin,
        quantity: 1,
        name: "Biaya Layanan (5%)",
      },
    ];

    if (sewa_raket) {
      items.push({
        id: "sewa-raket",
        price: SEWA_RAKET_PRICE,
        quantity: 1,
        name: "Sewa Raket Padel",
      });
    }

    // 5. Buat Snap Token
    const { token, redirect_url } = await createSnapTransaction({
      orderId: midtransOrderId,
      grossAmount: totalBayar,
      customerName: order.user.nama,
      customerEmail: order.user.email,
      customerPhone: order.user.no_hp || "",
      items,
    });

    // 6. Simpan/update transaksi
    let transaksi = await prisma.transaksi.findUnique({ where: { order_id: order.id } });

    if (!transaksi) {
      transaksi = await prisma.transaksi.create({
        data: {
          user_id: userId,
          lapangan_id: order.lapangan_id,
          jadwal_id: order.jadwalLapanganId,
          order_id: order.id,
          total_harga: totalBayar,
          biaya_admin: biayaAdmin,
          biaya_mitra: biayaMitra,
          status_pembayaran: "pending",
          midtrans_order_id: midtransOrderId,
          snap_token: token,
        },
      });
    } else {
      await prisma.transaksi.update({
        where: { id: transaksi.id },
        data: {
          total_harga: totalBayar,
          biaya_admin: biayaAdmin,
          biaya_mitra: biayaMitra,
          midtrans_order_id: midtransOrderId,
          snap_token: token,
        },
      });
    }

    // 7. Update order dengan biaya raket
    await prisma.order_booking.update({
      where: { id: order.id },
      data: {
        sewa_raket,
        biaya_raket: biayaRaket,
        total_harga: totalBayar,
      },
    });

    return res.json({
      message: "Snap token berhasil dibuat",
      snap_token: token,
      redirect_url,
      midtrans_order_id: midtransOrderId,
      total_bayar: totalBayar,
      biaya_admin: biayaAdmin,
    });
  } catch (err) {
    console.error("CREATE PAYMENT ERROR:", err);
    return res.status(500).json({ message: "Gagal membuat pembayaran", error: err.message });
  }
};

/**
 * POST /api/payment/notification
 * Webhook dari Midtrans
 */
export const handleMidtransNotification = async (req, res) => {
  try {
    const notification = req.body;

    const orderId = notification.order_id;
    const transactionStatus = notification.transaction_status;
    const fraudStatus = notification.fraud_status;
    const paymentType = notification.payment_type;

    console.log(`📨 Midtrans Notification: ${orderId} → ${transactionStatus} (${paymentType})`);

    // Cari transaksi berdasarkan midtrans_order_id
    const transaksi = await prisma.transaksi.findUnique({
      where: { midtrans_order_id: orderId },
      include: {
        order: {
          include: { lapangan: { include: { mitra: true } } },
        },
      },
    });

    if (!transaksi) {
      console.warn(`⚠️ Transaksi tidak ditemukan untuk midtrans_order_id: ${orderId}`);
      return res.status(200).json({ message: "OK" }); // Midtrans expects 200
    }

    // Determine payment status
    let statusPembayaran = "pending";
    let orderStatus = "pending";

    if (transactionStatus === "capture") {
      if (fraudStatus === "accept") {
        statusPembayaran = "berhasil";
        orderStatus = "dibayar";
      } else {
        statusPembayaran = "pending";
      }
    } else if (transactionStatus === "settlement") {
      statusPembayaran = "berhasil";
      orderStatus = "dibayar";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      statusPembayaran = "gagal";
      orderStatus = "expired";
    } else if (transactionStatus === "pending") {
      statusPembayaran = "pending";
    }

    // Update transaksi
    await prisma.transaksi.update({
      where: { id: transaksi.id },
      data: {
        status_pembayaran: statusPembayaran,
        payment_type: paymentType,
      },
    });

    // Update order
    if (transaksi.order) {
      await prisma.order_booking.update({
        where: { id: transaksi.order.id },
        data: { status: orderStatus },
      });
    }

    // Jika pembayaran gagal/expired → kembalikan jadwal ke tersedia
    if (statusPembayaran === "gagal" && transaksi.order) {
      await prisma.jadwalLapangan.update({
        where: { id: transaksi.jadwal_id },
        data: { status: "tersedia", locked_until: null },
      });
    }

    // Jika pembayaran berhasil → update jadwal + catat pendapatan mitra
    if (statusPembayaran === "berhasil" && transaksi.order) {
      // Update jadwal jadi 'booked'
      await prisma.jadwalLapangan.update({
        where: { id: transaksi.jadwal_id },
        data: { status: "booked" },
      });

      // Catat pendapatan mitra
      const mitra = transaksi.order.lapangan?.mitra;
      if (mitra) {
        const existing = await prisma.pendapatan_mitra.findUnique({
          where: { transaksi_id: transaksi.id },
        });

        if (!existing) {
          await prisma.pendapatan_mitra.create({
            data: {
              mitra_id: mitra.id,
              transaksi_id: transaksi.id,
              jumlah: Number(transaksi.biaya_mitra),
            },
          });
        }
      }

      // Notifikasi ke user
      await createNotification(
        transaksi.user_id,
        `Pembayaran berhasil! Booking ${transaksi.order.lapangan.nama} pada ${transaksi.order.tanggal.toISOString().slice(0, 10)} ${transaksi.order.jam_mulai}-${transaksi.order.jam_selesai} sudah dikonfirmasi.`
      );
    }

    return res.status(200).json({ message: "OK" });
  } catch (err) {
    console.error("MIDTRANS NOTIFICATION ERROR:", err);
    return res.status(200).json({ message: "OK" }); // Always return 200 to Midtrans
  }
};

/**
 * GET /api/payment/status/:midtransOrderId
 * Cek status pembayaran
 */
export const getPaymentStatus = async (req, res) => {
  try {
    const { midtransOrderId } = req.params;

    const transaksi = await prisma.transaksi.findUnique({
      where: { midtrans_order_id: midtransOrderId },
      include: {
        order: {
          include: {
            lapangan: { select: { nama: true, slug: true } },
          },
        },
      },
    });

    if (!transaksi) {
      return res.status(404).json({ message: "Transaksi tidak ditemukan" });
    }

    // Juga cek langsung ke Midtrans untuk real-time status
    let midtransStatus = null;
    try {
      midtransStatus = await getTransactionStatus(midtransOrderId);
    } catch {
      // Midtrans API mungkin belum tersedia (sandbox, dll)
    }

    return res.json({
      transaksi: {
        id: transaksi.id,
        status: transaksi.status_pembayaran,
        total_harga: Number(transaksi.total_harga),
        biaya_admin: Number(transaksi.biaya_admin),
        payment_type: transaksi.payment_type,
        midtrans_order_id: transaksi.midtrans_order_id,
      },
      order: transaksi.order
        ? {
            id: transaksi.order.id,
            status: transaksi.order.status,
            tanggal: transaksi.order.tanggal,
            jam_mulai: transaksi.order.jam_mulai,
            jam_selesai: transaksi.order.jam_selesai,
            lapangan: transaksi.order.lapangan,
          }
        : null,
      midtrans: midtransStatus,
    });
  } catch (err) {
    console.error("GET PAYMENT STATUS ERROR:", err);
    return res.status(500).json({ message: "Gagal cek status pembayaran" });
  }
};
