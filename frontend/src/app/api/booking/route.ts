// app/api/booking/route.ts
import { NextRequest, NextResponse } from "next/server";

// Simulasi database sederhana
let bookings: any[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { lapangan_id, jadwalLapanganId, total_harga } = body;

    if (!lapangan_id || !jadwalLapanganId || !total_harga) {
      return NextResponse.json(
        { message: "Data booking tidak lengkap" },
        { status: 400 }
      );
    }

    // ===== Simulasi validasi slot =====
    const now = new Date();
    const bookingDate = new Date(); // Contoh, bisa diganti sesuai item.tanggal
    bookingDate.setDate(now.getDate() + 1); // Slot besok

    // Hanya contoh: jika tanggal lebih dari 30 hari dari sekarang, slot dianggap tidak ada
    if (bookingDate.getTime() - now.getTime() > 30 * 24 * 60 * 60 * 1000) {
      return NextResponse.json(
        { message: "Slot tidak ditemukan" },
        { status: 404 }
      );
    }

    // Simulasi create booking
    const order = {
      id: bookings.length + 1,
      lapangan_id,
      jadwalLapanganId,
      total_harga,
      status: "pending",
    };
    bookings.push(order);

    return NextResponse.json({ message: "Booking berhasil", data: { order } });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message || "Booking gagal" },
      { status: 500 }
    );
  }
}

// GET booking user
export async function GET(req: NextRequest) {
  const token = req.headers.get("authorization");
  if (!token) return NextResponse.json({ bookings: [] });

  // Kembalikan semua booking (simulasi)
  return NextResponse.json({ bookings });
}
