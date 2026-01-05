"use client";

import { useState, useEffect } from "react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast"; // notification

export default function PaymentPage() {
  const router = useRouter();
  const [saldo, setSaldo] = useState<number | null>(null);
  const [totalBayar, setTotalBayar] = useState<number>(0);
  const [cart, setCart] = useState<any[]>([]);
  const [isPaying, setIsPaying] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

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

    // Buat order sementara di backend (POST /api/booking)
    const createOrder = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:5000/api/booking", {
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
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setOrderId(data.data.order.id);
      } catch (err: any) {
        toast.error("Gagal membuat order: " + err.message);
      }
    };

    createOrder();

    // Ambil saldo user
    const fetchWallet = async () => {
      try {
        const token = Cookies.get("token");
        const res = await fetch("http://localhost:5000/api/wallet/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok) setSaldo(Number(data.saldo));
      } catch (err) {
        console.error(err);
      }
    };
    fetchWallet();
  }, [router]);

  const handleWalletPayment = async () => {
    if (!saldo) return;
    if (!orderId) return;

    if (saldo < totalBayar) {
      toast.error(
        `Saldo tidak mencukupi. Total bayar: Rp ${totalBayar.toLocaleString(
          "id-ID"
        )}, saldo Anda: Rp ${saldo.toLocaleString("id-ID")}`
      );
      return;
    }

    setIsPaying(true);
    try {
      const token = Cookies.get("token");
      const res = await fetch("http://localhost:5000/api/checkout/wallet", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Pembayaran gagal");

      toast.success("Pembayaran berhasil!");
      Cookies.remove("checkout_cart");
      Cookies.remove("checkout_total");
      router.push("/booking/success");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsPaying(false);
    }
  };

  return (
    <div className="p-6">
      <Toaster position="top-right" />
      <h2 className="text-xl font-semibold mb-4">Pilih Metode Pembayaran</h2>

      <div className="mb-4">
        <p>Total Bayar: Rp {totalBayar.toLocaleString("id-ID")}</p>
        <p>Saldo Wallet: Rp {saldo?.toLocaleString("id-ID") ?? "—"}</p>
      </div>

      <button
        onClick={handleWalletPayment}
        disabled={isPaying}
        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
      >
        {isPaying ? "Memproses..." : "Bayar dengan Wallet"}
      </button>
    </div>
  );
}
