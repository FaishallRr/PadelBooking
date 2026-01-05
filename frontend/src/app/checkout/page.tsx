// src/app/checkout/page.tsx
"use client";

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import { CheckCircle2, Trash2 } from "lucide-react";
import { CartItem } from "@/types/cart";
import { isSlotExpired } from "@/utils/isSlotExpired";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";
import Notification from "@/components/Notification";

const Poppins = localFont({
  src: [
    { path: "../../fonts/Poppins-Regular.ttf", weight: "400" },
    { path: "../../fonts/Poppins-Bold.ttf", weight: "700" },
  ],
});

const SEWA_RAKET_PRICE = 30000;
const PPN_RATE = 0.11;
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function CheckoutPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastLapanganSlug, setLastLapanganSlug] = useState<string | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [saldo, setSaldo] = useState<number | null>(null);
  const router = useRouter();

  // ================= Load cart dan buang slot expired =================
  useEffect(() => {
    const userId = Cookies.get("user_id");
    if (!userId) {
      setIsLoaded(true);
      return;
    }

    const raw = Cookies.get("cart");
    const parsed = raw ? JSON.parse(raw) : {};
    const userCart: CartItem[] = parsed[`user_${userId}`] || [];

    const validCart = userCart.filter(
      (item) =>
        !item.tanggal ||
        !item.jamMulai ||
        !isSlotExpired(item.tanggal, item.jamMulai)
    );

    if (validCart.length !== userCart.length) {
      parsed[`user_${userId}`] = validCart;
      Cookies.set("cart", JSON.stringify(parsed));
      setNotification({
        type: "error",
        message: "Beberapa jadwal sudah lewat dan dihapus dari cart",
      });
    }

    setCart(validCart);
    setLastLapanganSlug(validCart[validCart.length - 1]?.lapanganSlug ?? null);
    setIsLoaded(true);
  }, []);

  // ================= Redirect jika cart kosong =================
  useEffect(() => {
    if (!isLoaded) return;
    if (cart.length === 0)
      router.replace(
        lastLapanganSlug ? `/lapangan/${lastLapanganSlug}` : "/lapangan"
      );
  }, [cart, isLoaded, lastLapanganSlug, router]);

  // ================= Ambil saldo =================
  useEffect(() => {
    const fetchWallet = async () => {
      const token = Cookies.get("token");
      if (!token) return;

      try {
        const res = await fetch(`${API_URL}/api/wallet/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Gagal ambil saldo");
        setSaldo(Number(data.saldo));
      } catch (err: any) {
        setNotification({
          type: "error",
          message: err.message || "Gagal ambil saldo",
        });
      }
    };
    fetchWallet();
  }, []);

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

  // ================= Refresh booking terbaru =================
  const refreshBookings = async (lapanganId: number, date: string) => {
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/booking/lapangan/${lapanganId}?tanggal=${date}`
      );
      const data = await res.json();
      return data || [];
    } catch (err) {
      console.error("Gagal refresh bookings:", err);
      return [];
    }
  };

  // ================= Toggle raket =================
  const toggleRaket = (jadwalId: number) => {
    const updated = cart.map((item) =>
      item.jadwalId === jadwalId
        ? {
            ...item,
            extras: { ...item.extras, sewaRaket: !item.extras?.sewaRaket },
          }
        : item
    );
    setCart(updated);
    const userId = Cookies.get("user_id");
    if (userId) {
      const parsed = JSON.parse(Cookies.get("cart") || "{}");
      parsed[`user_${userId}`] = updated;
      Cookies.set("cart", JSON.stringify(parsed));
    }
  };

  // ================= Remove item =================
  const removeItem = (jadwalId: number) => {
    const updated = cart.filter((i) => i.jadwalId !== jadwalId);
    setCart(updated);
    const userId = Cookies.get("user_id");
    if (userId) {
      const parsed = JSON.parse(Cookies.get("cart") || "{}");
      parsed[`user_${userId}`] = updated;
      Cookies.set("cart", JSON.stringify(parsed));
    }
  };

  // ================= Checkout =================
  const handleCheckout = async () => {
    if (!cart.length || isSubmitting) return;

    const token = Cookies.get("token");
    if (!token) {
      setNotification({ type: "error", message: "Silakan login dulu" });
      return;
    }

    if (saldo === null) {
      setNotification({ type: "error", message: "Saldo belum tersedia" });
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Refresh slot terbaru sebelum checkout
      const latestBookingsMap: Record<number, any[]> = {};
      for (const item of cart) {
        if (!latestBookingsMap[item.lapanganId]) {
          latestBookingsMap[item.lapanganId] = await refreshBookings(
            item.lapanganId,
            item.tanggal
          );
        }
      }

      // Cek apakah ada slot yang bentrok
      const conflictedSlots = cart.filter((item) =>
        latestBookingsMap[item.lapanganId].some(
          (b) => b.jadwalLapanganId === item.jadwalId
        )
      );

      if (conflictedSlots.length > 0) {
        const names = conflictedSlots
          .map((i) => `${i.lapanganNama} (${i.tanggal} ${i.jamMulai})`)
          .join(", ");
        // Update cart dengan flag isBooked
        const updatedCart = cart.map((item) => ({
          ...item,
          isBooked: latestBookingsMap[item.lapanganId].some(
            (b) => b.jadwalLapanganId === item.jadwalId
          ),
        }));
        setCart(updatedCart);

        setNotification({
          type: "error",
          message: `Beberapa slot sudah dibooking orang lain: ${names}`,
        });
        return;
      }

      // Hitung total
      const totalBayar = cart.reduce((sum, item) => {
        const raketPrice = item.extras?.sewaRaket ? SEWA_RAKET_PRICE : 0;
        return sum + item.harga + raketPrice;
      }, 0);

      if (saldo < totalBayar) {
        setNotification({
          type: "error",
          message: `Saldo tidak cukup (${saldo.toLocaleString(
            "id-ID"
          )} < ${totalBayar.toLocaleString("id-ID")})`,
        });
        return;
      }

      // Lanjut checkout semua item
      for (const item of cart) {
        const bookingRes = await fetch(`${API_URL}/api/booking`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            lapangan_id: item.lapanganId,
            jadwalLapanganId: item.jadwalId,
            total_harga:
              item.harga + (item.extras?.sewaRaket ? SEWA_RAKET_PRICE : 0),
          }),
        });

        const bookingJson = await bookingRes.json();
        if (!bookingRes.ok)
          throw new Error(bookingJson.message || "Booking gagal");

        const orderId = bookingJson.data.order.id;
        if (!orderId) throw new Error("Order ID tidak ditemukan");

        // Checkout wallet
        const payRes = await fetch(`${API_URL}/api/checkout/wallet`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ order_id: orderId }),
        });
        const payJson = await payRes.json();
        if (!payRes.ok) throw new Error(payJson.message || "Pembayaran gagal");

        // Hapus item dari cart
        setCart((prev) => prev.filter((c) => c.jadwalId !== item.jadwalId));
      }

      // Hapus semua cart cookies
      const userId = Cookies.get("user_id");
      if (userId) {
        const parsed = JSON.parse(Cookies.get("cart") || "{}");
        parsed[`user_${userId}`] = [];
        Cookies.set("cart", JSON.stringify(parsed));
      }

      setNotification({ type: "success", message: "Pembayaran berhasil!" });
      setTimeout(() => {
        setNotification(null);
        router.push("/riwayat");
      }, 2000);
    } catch (err: any) {
      setNotification({
        type: "error",
        message: err.message || "Checkout gagal",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // ================= Hitung biaya =================
  const subtotal = cart.reduce((sum, item) => sum + item.harga, 0);
  const raketTotal =
    cart.filter((i) => i.extras?.sewaRaket).length * SEWA_RAKET_PRICE;
  const dpp = subtotal + raketTotal;
  const ppn = Math.round(dpp * PPN_RATE);
  const total = dpp + ppn;

  return (
    <>
      <Navbar />
      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
      <main className={`bg-gray-50 min-h-screen py-8 ${Poppins.className}`}>
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-12 gap-6 mt-9">
          {/* LEFT: Cart */}
          <div className="md:col-span-8 space-y-4">
            <AnimatePresence>
              {cart.map((item) => {
                const expired = isSlotExpired(item.tanggal, item.jamMulai);
                return (
                  <motion.div
                    key={item.jadwalId}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.25 }}
                    className={`bg-white rounded-xl border p-5 shadow-sm ${
                      item.isBooked ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                  >
                    {/* HEADER */}
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs text-gray-500">Lapangan</span>
                        <div className="font-semibold text-lg">
                          {item.lapanganNama}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {item.tanggal} · {item.jamMulai} – {item.jamSelesai}
                        </div>
                      </div>
                      <div className="flex flex-col gap-5 items-end">
                        <div className="font-bold">
                          Rp {item.harga.toLocaleString("id-ID")}
                        </div>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => removeItem(item.jadwalId)}
                          className="text-gray-400 hover:text-red-600"
                          title="Hapus jadwal"
                          disabled={item.isBooked}
                        >
                          <Trash2 size={20} />
                        </motion.button>
                      </div>
                    </div>

                    {/* SEWA RAKET */}
                    {item.supportsRaket && (
                      <motion.div
                        whileTap={
                          !expired && !item.isBooked ? { scale: 0.97 } : {}
                        }
                        onClick={() =>
                          !expired &&
                          !item.isBooked &&
                          toggleRaket(item.jadwalId)
                        }
                        className={`mt-4 p-4 rounded-lg border transition ${
                          expired || item.isBooked
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        } ${
                          item.extras?.sewaRaket
                            ? "border-green-600 bg-green-50"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                              item.extras?.sewaRaket
                                ? "bg-green-600 border-green-600"
                                : "border-gray-400"
                            }`}
                          >
                            <AnimatePresence>
                              {item.extras?.sewaRaket && (
                                <motion.div
                                  initial={{ scale: 0 }}
                                  animate={{ scale: 1 }}
                                  exit={{ scale: 0 }}
                                  transition={{
                                    type: "spring",
                                    stiffness: 400,
                                  }}
                                >
                                  <CheckCircle2
                                    size={14}
                                    className="text-white"
                                  />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          <div className="flex-1">
                            <div className="text-sm font-medium">
                              Sewa Raket
                            </div>
                            <div className="text-xs text-gray-500">
                              Praktis, tidak perlu bawa raket sendiri
                            </div>
                          </div>
                          <div className="text-sm font-semibold">
                            + Rp 30.000
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ================= RIGHT ================= */}
          <div className="md:col-span-4 space-y-4">
            {/* RINCIAN BIAYA */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border p-5 shadow-sm"
            >
              <h3 className="font-semibold mb-3">Rincian Biaya</h3>

              <div className="flex justify-between text-sm mb-2">
                <span>Biaya Sewa</span>
                <span>Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between text-sm mb-2">
                <span>Produk Tambahan</span>
                <span>Rp {raketTotal.toLocaleString("id-ID")}</span>
              </div>

              <div className="flex justify-between text-sm text-gray-600 mb-3">
                <span>PPN 11%</span>
                <span>Rp {ppn.toLocaleString("id-ID")}</span>
              </div>

              <motion.div
                key={total}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="border-t pt-3 flex justify-between font-bold"
              >
                <span>Total Bayar</span>
                <span>Rp {total.toLocaleString("id-ID")}</span>
              </motion.div>
            </motion.div>

            {/* PEMBAYARAN */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white rounded-xl border p-5 shadow-sm"
            >
              <h3 className="font-semibold mb-2">Atur Pembayaran</h3>
              <div className="text-sm text-gray-600">Bayar Lunas</div>
              <div className="font-bold mt-1">
                Rp {total.toLocaleString("id-ID")}
              </div>
            </motion.div>

            {/* KEBIJAKAN */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border p-5 shadow-sm text-sm"
            >
              <h3 className="font-semibold mb-2">
                Kebijakan Reschedule & Pembatalan
              </h3>
              <ul className="list-disc pl-4 space-y-1 text-gray-600">
                <li>Refund maksimal H-3 sebelum jadwal</li>
                <li>Pencairan dana maksimal H+3 hari kerja</li>
              </ul>
            </motion.div>

            {/* CTA */}
            <motion.button
              whileHover={{ scale: cart.length && !isSubmitting ? 1.02 : 1 }}
              whileTap={{ scale: 0.97 }}
              disabled={cart.length === 0 || isSubmitting}
              onClick={handleCheckout}
              className="w-full bg-[var(--color-primary)] hover:bg-[var(--color-hover)] disabled:bg-gray-300 text-white py-3 rounded-xl font-semibold transition duration-300"
            >
              {isSubmitting ? "Memproses Pembayaran..." : "Bayar Sekarang"}
            </motion.button>
          </div>
        </div>
      </main>
    </>
  );
}
