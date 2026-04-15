"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

export default function PaymentPage() {
  const router = useRouter();
  const [totalBayar, setTotalBayar] = useState<number>(0);
  const [biayaAdmin, setBiayaAdmin] = useState<number>(0);
  const [cart, setCart] = useState<any[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  // Load Midtrans Snap library
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://app.sandbox.midtrans.com/snap/snap.js";
    script.setAttribute(
      "data-client-key",
      process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY || "",
    );
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    // Ambil data checkout dari Cookies
    const checkoutCart = Cookies.get("checkout_cart");
    const checkoutTotal = Cookies.get("checkout_total");

    if (!checkoutCart || !checkoutTotal) {
      router.replace("/checkout");
      return;
    }

    const parsedCart = JSON.parse(checkoutCart);
    setCart(parsedCart);
    setTotalBayar(Number(checkoutTotal));

    // Buat order di backend
    const createOrder = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/booking`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              lapangan_id: parsedCart[0].lapanganId,
              jadwalLapanganId: parsedCart[0].jadwalId,
              total_harga: Number(checkoutTotal),
            }),
          },
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrderId(data.data.order.id);
      } catch (err: any) {
        toast.error("Gagal membuat order: " + err.message);
      }
    };

    createOrder();
  }, [router]);

  const handleMidtransPayment = async () => {
    if (!orderId) {
      toast.error("Order belum siap");
      return;
    }

    setIsPaying(true);
    try {
      const token = Cookies.get("token");

      // Get Snap token dari backend
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/payment/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            order_id: orderId,
            sewa_raket: false,
          }),
        },
      );

      const data = await res.json();
      if (!res.ok)
        throw new Error(data.message || "Gagal membuat payment token");

      setBiayaAdmin(data.biaya_admin);

      // Show Midtrans Snap payment UI
      if (window.snap) {
        window.snap.pay(data.snap_token, {
          onSuccess: async (result: any) => {
            console.log("Payment success:", result);
            toast.success("Pembayaran berhasil!");
            Cookies.remove("checkout_cart");
            Cookies.remove("checkout_total");
            router.push("/booking/success");
          },
          onPending: (result: any) => {
            console.log("Payment pending:", result);
            toast.loading("Menunggu konfirmasi pembayaran...");
          },
          onError: (result: any) => {
            console.log("Payment error:", result);
            toast.error("Pembayaran gagal");
            setIsPaying(false);
          },
          onClose: () => {
            console.log("Payment UI closed");
            setIsPaying(false);
          },
        });
      } else {
        throw new Error("Midtrans library tidak terload");
      }
    } catch (err: any) {
      toast.error(err.message);
      setIsPaying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <Toaster position="top-right" />

      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Pembayaran</h1>

        {/* Booking Details */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            Detail Pemesanan
          </h2>
          {cart.length > 0 && (
            <div className="text-sm text-gray-600 space-y-2">
              <p>
                <span className="font-medium">Lapangan:</span>{" "}
                {cart[0].lapanganNama}
              </p>
              <p>
                <span className="font-medium">Tanggal:</span>{" "}
                {new Date(cart[0].tanggal).toLocaleDateString("id-ID")}
              </p>
              <p>
                <span className="font-medium">Jam:</span> {cart[0].jamMulai} -{" "}
                {cart[0].jamSelesai}
              </p>
            </div>
          )}
        </div>

        {/* Price Breakdown */}
        <div className="mb-6 space-y-2 text-sm">
          <div className="flex justify-between text-gray-700">
            <span>Harga Sewa:</span>
            <span className="font-medium">
              Rp {(totalBayar - biayaAdmin).toLocaleString("id-ID")}
            </span>
          </div>
          {biayaAdmin > 0 && (
            <div className="flex justify-between text-gray-700">
              <span>Biaya Admin (5%):</span>
              <span className="font-medium">
                Rp {biayaAdmin.toLocaleString("id-ID")}
              </span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between text-lg font-bold text-gray-900">
            <span>Total Bayar:</span>
            <span>Rp {totalBayar.toLocaleString("id-ID")}</span>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="space-y-3">
          <button
            onClick={handleMidtransPayment}
            disabled={isPaying || !orderId}
            className="w-full px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {isPaying ? "Memproses..." : "Bayar dengan Kartu / E-Wallet"}
          </button>

          <p className="text-xs text-center text-gray-500 text-wrap">
            🔒 Pembayaran aman melalui Midtrans | Terima Kartu Kredit, Debit,
            e-Wallet, Transfer Bank
          </p>
        </div>

        {/* Test Card Info */}
        <div className="mt-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-xs font-semibold text-yellow-800 mb-1">
            Untuk Testing (Sandbox):
          </p>
          <p className="text-xs text-yellow-700">
            Kartu: 4811 1111 1111 1114
            <br />
            Exp: 12/25 | CVV: 123
          </p>
        </div>
      </div>
    </div>
  );
}

// Type definition for Midtrans window object
declare global {
  interface Window {
    snap: any;
  }
}
