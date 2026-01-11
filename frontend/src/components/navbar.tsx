"use client";

import { useEffect, useRef, useState } from "react";
import Cookies from "js-cookie";
import localFont from "next/font/local";
import {
  ShoppingCart,
  UserRound,
  User,
  LogOut,
  ChevronDown,
  Store,
  Wallet,
} from "lucide-react";
import { History } from "lucide-react";
import CartSidebar from "@/components/CartSidebar";
import Notification from "@/components/Notification";

const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });
const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });

interface NavbarProps {
  largeText?: boolean;
  role?: string | null;
}

export default function Navbar({ largeText }: NavbarProps) {
  const [showCart, setShowCart] = useState(false);
  const [isLogin, setIsLogin] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [registerDropdown, setRegisterDropdown] = useState(false);
  const [role, setRole] = useState<string | null>(null);
  const [cartCount, setCartCount] = useState(0); // ✅ pindah ke dalam komponen

  const [saldo, setSaldo] = useState<number>(0);

  const [loadingSaldo, setLoadingSaldo] = useState(true);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const registerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    const userRole = Cookies.get("role");
    setIsLogin(!!token);
    setRole(userRole ?? null);

    const updateCart = () => {
      try {
        const userId = Cookies.get("user_id");
        if (!userId) {
          setCartCount(0);
          return;
        }

        const raw = Cookies.get("cart");
        if (!raw) {
          setCartCount(0);
          return;
        }

        const allCart = JSON.parse(raw);
        const cart = Array.isArray(allCart[`user_${userId}`])
          ? allCart[`user_${userId}`]
          : [];

        setCartCount(cart.length);
      } catch {
        setCartCount(0);
      }
    };

    updateCart();
    window.addEventListener("cartUpdated", updateCart);

    return () => {
      window.removeEventListener("cartUpdated", updateCart);
    };
  }, []);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) return;

    const fetchWallet = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/wallet/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) throw new Error("Gagal ambil wallet");

        const data = await res.json();

        setSaldo(Number(data.saldo) || 0); // ✅ FIX
      } catch (err) {
        console.error(err);
        setSaldo(0); // ❗ NUMBER, bukan string
      } finally {
        setLoadingSaldo(false);
      }
    };

    fetchWallet();
  }, []);

  // ⭐ ADD FOR LARGE TEXT
  const isLargeText = role === "mitra" || role === "admin";

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setDropdown(false);
      }
      if (
        registerRef.current &&
        !registerRef.current.contains(e.target as Node)
      ) {
        setRegisterDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogoClick = () => {
    if (role === "mitra") return (window.location.href = "/mitra/dashboard");
    if (role === "admin") return (window.location.href = "/admin/dashboard");
    return (window.location.href = "/");
  };

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleOpenCart = () => {
    if (!Cookies.get("token")) {
      setNotification({
        type: "error",
        message: "Silakan login terlebih dahulu",
      });
      return;
    }

    setShowCart(true);
  };

  const formatRupiah = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(value);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    Cookies.remove("role");
    Cookies.remove("user_id");
    Cookies.remove("cart");

    // biar badge cart langsung update ke 0
    window.dispatchEvent(new Event("cartUpdated"));

    window.location.href = "/";
  };

  useEffect(() => {
    if (!notification) return;

    const timer = setTimeout(() => {
      setNotification(null);
    }, 2000);

    return () => clearTimeout(timer);
  }, [notification]);

  return (
    <>
      <header className="w-full bg-gray-50 h-20 flex items-center">
        <div className="max-w-[1200px] w-full mx-auto px-4 flex justify-between items-center">
          {/* ⭐ LOGO – ikut largeText */}
          <h1
            className={`cursor-pointer text-gray-700 ${PoppinsBold.className} ${
              isLargeText ? "text-[26px]" : "text-2xl"
            }`}
            onClick={handleLogoClick}
          >
            Padel Time
          </h1>

          <div className="flex items-center gap-6">
            {/* ================= WALLET ================= */}
            {isLogin && role === "user" && (
              <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl shadow-sm border">
                <Wallet size={18} className="text-green-600" />
                <span className="text-sm font-semibold text-gray-700">
                  {loadingSaldo ? "Loading..." : formatRupiah(saldo)}
                </span>
              </div>
            )}

            {role !== "mitra" && role !== "admin" && (
              <div
                className="relative cursor-pointer flex items-center justify-center"
                onClick={handleOpenCart}
              >
                <ShoppingCart
                  size={isLargeText ? 26 : 20} // ⭐ lebih besar di mitra/admin
                  className="text-gray-600 hover:text-gray-900 transition"
                />
                <div className="absolute top-0 right-0 -translate-y-2 translate-x-2 bg-red-700 text-white text-[10px] min-w-[15px] h-[15px] flex items-center justify-center rounded-full font-bold">
                  {cartCount} {/* ✅ gunakan cartCount */}
                </div>
              </div>
            )}

            <div className="h-6 w-[1.7px] bg-gray-300 rounded-full"></div>

            {/* ================= NON LOGIN ================= */}
            {!isLogin && (
              <div className="flex items-center gap-3">
                <button
                  className={`px-4 py-2 font-bold text-gray-600 hover:text-gray-500 transition ${
                    isLargeText ? "text-lg" : "text-base"
                  } ${PoppinsRegular.className}`}
                  onClick={() => (window.location.href = "/auth/login")}
                >
                  Masuk
                </button>

                <div className="relative">
                  <button
                    className={`px-4 py-2 bg-(--color-primary) hover:bg-(--color-hover) text-white rounded-xl font-bold flex items-center gap-1 transition ${
                      isLargeText ? "text-lg" : "text-base"
                    } ${PoppinsRegular.className}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      setRegisterDropdown(true);
                    }}
                  >
                    Daftar <ChevronDown size={isLargeText ? 20 : 18} />
                  </button>
                </div>
              </div>
            )}

            {/* ================= LOGIN ================= */}
            {isLogin && (
              <div className="relative" ref={dropdownRef}>
                <UserRound
                  size={isLargeText ? 32 : 25} // ⭐ diperbesar
                  strokeWidth={1.8}
                  className="text-gray-700 cursor-pointer hover:text-gray-900 transition"
                  onClick={() => setDropdown(!dropdown)}
                />

                {dropdown && (
                  <div className="absolute right-0 mt-3 w-48 bg-white rounded-xl shadow-md p-3 z-50 border animate-fadeIn">
                    <p
                      className={`px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer ${
                        isLargeText ? "text-[17px]" : "text-[15px]"
                      } text-gray-700`}
                      onClick={() => (window.location.href = "/user/profile")}
                    >
                      <User size={18} /> Profile
                    </p>

                    {role !== "mitra" && role !== "admin" && (
                      <p
                        className={`px-3 py-2 hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer ${
                          isLargeText ? "text-[17px]" : "text-[15px]"
                        } text-gray-700`}
                        onClick={() => (window.location.href = "/riwayat")}
                      >
                        <History size={18} /> Riwayat
                      </p>
                    )}

                    <p
                      className={`px-3 py-2 text-red-500 hover:bg-gray-100 rounded-lg flex items-center gap-2 cursor-pointer ${
                        isLargeText ? "text-[17px]" : "text-[15px]"
                      }`}
                      onClick={handleLogout}
                    >
                      <LogOut size={18} /> Logout
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ===== REGISTER MODAL TIDAK DIUBAH ===== */}
        {registerDropdown && (
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[999] animate-fadeIn"
            onClick={() => setRegisterDropdown(false)}
          >
            <div
              className="relative w-[520px] bg-white/70 backdrop-blur-2xl shadow-2xl rounded-3xl p-8 border border-white/40 animate-pop"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-4 text-xl font-bold text-gray-700 hover:text-gray-900 transition p-1 rounded-full hover:bg-gray-200/60"
                onClick={() => setRegisterDropdown(false)}
              >
                ✕
              </button>

              <h2
                className={`text-[22px] font-bold text-gray-800 text-center mb-7 tracking-wide ${PoppinsBold.className}`}
              >
                Pilih Jenis Akun
              </h2>

              <div className="flex gap-6">
                {/* PENGGUNA */}
                <div
                  className="flex-1 group p-6 bg-white/60 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:bg-white hover:scale-[1.03] transition cursor-pointer flex flex-col items-center text-center"
                  onClick={() =>
                    (window.location.href = "/auth/send-otp?role=user")
                  }
                >
                  <div className="w-16 h-16 rounded-2xl bg-blue-300 flex items-center justify-center group-hover:bg-blue-200 transition">
                    <UserRound size={32} className="text-blue-700" />
                  </div>

                  <p className="font-bold text-gray-800 text-[17px] mt-4">
                    Pengguna
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Booking lapangan & pembayaran mudah.
                  </p>
                </div>

                {/* MITRA */}
                <div
                  className="flex-1 group p-6 bg-white/60 border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl hover:bg-white hover:scale-[1.03] transition cursor-pointer flex flex-col items-center text-center"
                  onClick={() =>
                    (window.location.href = "/auth/send-otp?role=mitra")
                  }
                >
                  <div className="w-16 h-16 rounded-2xl bg-green-300 flex items-center justify-center group-hover:bg-green-200 transition">
                    <Store size={32} className="text-green-700" />
                  </div>

                  <p className="font-bold text-gray-800 text-[17px] mt-4">
                    Mitra
                  </p>
                  <p className="text-gray-500 text-sm mt-1">
                    Kelola lapangan & terima pesanan.
                  </p>
                </div>
              </div>
            </div>

            <style jsx>{`
              @keyframes fadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              @keyframes pop {
                from {
                  opacity: 0;
                  transform: scale(0.9);
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              .animate-fadeIn {
                animation: fadeIn 0.25s ease-out;
              }
              .animate-pop {
                animation: pop 0.22s ease-out;
              }
            `}</style>
          </div>
        )}
      </header>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}

      <CartSidebar open={showCart} onClose={() => setShowCart(false)} />
    </>
  );
}
