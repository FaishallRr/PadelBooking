"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { format, differenceInDays } from "date-fns";

interface Booking {
  id: number;
  lapangan: {
    nama: string;
    slug: string;
  };
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  total_harga: number;
  status: string;
  refund?: {
    id: number;
    jumlah: number;
    alasan: string;
  };
}

const RefundComponent: React.FC = () => {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [alasan, setAlasan] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await axios.get("/api/booking/my");
        setBookings(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const canRefund = (booking: Booking) => {
    if (booking.status !== "dibayar") return false;
    if (booking.refund) return false;

    const tanggalMain = new Date(booking.tanggal);
    const diff = differenceInDays(tanggalMain, new Date());
    return diff >= 3; // minimal H-3
  };

  const handleRefundSubmit = async () => {
    if (!selectedBooking) return;
    setSubmitting(true);
    try {
      await axios.post("/api/refund", {
        order_id: selectedBooking.id,
        alasan,
      });
      alert("Refund request berhasil dikirim, tunggu persetujuan admin");
      // refresh list
      const res = await axios.get("/api/booking/my");
      setBookings(res.data);
      setSelectedBooking(null);
      setAlasan("");
    } catch (err: any) {
      alert(err.response?.data?.message || "Gagal request refund");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading booking...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Booking Saya</h2>

      {bookings.length === 0 && <p>Tidak ada booking</p>}

      <div className="space-y-4">
        {bookings.map((b) => {
          const eligible = canRefund(b);
          return (
            <div
              key={b.id}
              className="border p-4 rounded shadow flex justify-between items-center"
            >
              <div>
                <p className="font-semibold">{b.lapangan.nama}</p>
                <p>
                  {format(new Date(b.tanggal), "dd MMM yyyy")} | {b.jam_mulai} -{" "}
                  {b.jam_selesai}
                </p>
                <p>Rp {b.total_harga.toLocaleString("id-ID")}</p>
                <p>Status: {b.status}</p>
                {b.refund && (
                  <p className="text-red-500">
                    Refund diajukan: {b.refund.alasan}
                  </p>
                )}
              </div>

              {eligible && (
                <button
                  onClick={() => setSelectedBooking(b)}
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Ajukan Refund
                </button>
              )}
            </div>
          );
        })}
      </div>

      {selectedBooking && (
        <div className="fixed inset-0 bg-black/30 flex justify-center items-center">
          <div className="bg-white p-6 rounded shadow w-96">
            <h3 className="font-bold text-lg mb-2">Ajukan Refund</h3>
            <p className="mb-2">Lapangan: {selectedBooking.lapangan.nama}</p>
            <textarea
              placeholder="Alasan refund"
              value={alasan}
              onChange={(e) => setAlasan(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setSelectedBooking(null)}
                className="px-4 py-2 border rounded"
              >
                Batal
              </button>
              <button
                onClick={handleRefundSubmit}
                disabled={submitting || !alasan}
                className="px-4 py-2 bg-red-500 text-white rounded disabled:bg-gray-300"
              >
                {submitting ? "Mengirim..." : "Kirim Refund"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RefundComponent;
