"use client";

import Cookies from "js-cookie";
import { X, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { CartItem } from "@/types/cart";
import { useRouter } from "next/navigation";
import localFont from "next/font/local";

const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });

/* ================= HELPERS ================= */
const formatTanggal = (date: string) =>
  new Date(date).toLocaleDateString("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

const formatRupiah = (value?: number) => {
  if (typeof value !== "number") return "0";
  return value.toLocaleString("id-ID");
};

/* ================= COMPONENT ================= */
export default function CartSidebar({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [cart, setCart] = useState<CartItem[]>([]);

  /* ===== LOAD CART FROM COOKIE ===== */
  const loadCart = () => {
    try {
      const userId = Cookies.get("user_id");
      if (!userId) {
        setCart([]);
        return;
      }

      const raw = Cookies.get("cart");
      const parsed = raw ? JSON.parse(raw) : {};

      const userCart = Array.isArray(parsed[`user_${userId}`])
        ? parsed[`user_${userId}`]
        : [];

      setCart(userCart);
    } catch (err) {
      console.error("Cart cookie rusak:", err);
      setCart([]);
    }
  };

  /* ===== REMOVE ITEM ===== */
  const removeItem = (jadwalId: number) => {
    const userId = Cookies.get("user_id");
    if (!userId) return;

    const raw = Cookies.get("cart");
    const parsed = raw ? JSON.parse(raw) : {};

    parsed[`user_${userId}`] = parsed[`user_${userId}`].filter(
      (item: CartItem) => item.jadwalId !== jadwalId
    );

    Cookies.set("cart", JSON.stringify(parsed));
    setCart(parsed[`user_${userId}`]);

    window.dispatchEvent(new Event("cartUpdated"));
  };

  /* ===== EFFECT ===== */
  useEffect(() => {
    loadCart();
    window.addEventListener("cartUpdated", loadCart);
    return () => window.removeEventListener("cartUpdated", loadCart);
  }, []);

  if (!open) return null;

  return (
    <>
      {/* OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/40 z-40 ${PoppinsRegular.className}`}
        onClick={onClose}
      />

      {/* SIDEBAR */}
      <div className="fixed right-0 top-0 h-full w-[360px] bg-white z-50 shadow-xl animate-slideIn flex flex-col">
        {/* HEADER */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className={`font-bold text-lg ${PoppinsBold.className}`}>
            Keranjang
          </h2>
          <X className="cursor-pointer" onClick={onClose} />
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 && (
            <p
              className={`text-gray-400 text-sm text-center ${PoppinsRegular.className}`}
            >
              Belum ada jadwal di keranjang.
            </p>
          )}

          {cart.map((item) => (
            <div
              key={item.jadwalId} // ✅
              className="border rounded-lg p-3 flex items-center justify-between"
            >
              {/* LEFT */}
              <div>
                <div className="text-sm font-medium text-gray-800">
                  {formatTanggal(item.tanggal)} · {item.jamMulai} –{" "}
                  {item.jamSelesai}
                </div>

                {item.extras?.sewaRaket && (
                  <div className="text-xs text-gray-500">+ Sewa Raket</div>
                )}

                <div className="text-sm font-semibold text-gray-900 mt-1">
                  Rp {formatRupiah(item.harga)}
                </div>
              </div>

              {/* RIGHT */}
              <button
                onClick={() => removeItem(item.jadwalId)}
                className="text-gray-400 hover:text-red-500 transition"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t">
          <button
            disabled={cart.length === 0}
            onClick={() => {
              onClose(); // optional: nutup sidebar
              router.push("/checkout");
            }}
            className={`w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white py-2 rounded-xl font-semibold transition duration-300 ${PoppinsBold.className}`}
          >
            Checkout
          </button>
        </div>
      </div>

      {/* ANIMATION */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.25s ease-out;
        }
      `}</style>
    </>
  );
}
