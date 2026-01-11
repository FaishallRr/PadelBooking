"use client";

import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Navbar from "@/components/navbar";
import ProtectedMitra from "@/components/ProtectedMitra";
import {
  Trash2,
  Wrench,
  CheckCircle,
  LayoutDashboard,
  CalendarCheck,
  WalletMinimal,
  CalendarPlus2,
  Menu,
  ChartNoAxesCombined,
  X,
} from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

/* =====================
   TYPES
====================== */
type LapanganAPI = {
  id: string;
  slug: string;
  nama: string;
  gambar?: string | null;
  status: "tersedia" | "dalam_perbaikan";
  type?: string | null;
  detail?: {
    type?: string;
    fasilitas?: string[];
  };
};

type Lapangan = {
  id: string;
  slug: string;
  nama: string;
  gambar: string | null;
  status: "tersedia" | "dalam_perbaikan";
  type: string | null;
  facilities: string[];
};

/* =====================
   HELPERS
====================== */
export const LAPANGAN_STATUS = {
  TERSEDIA: "tersedia",
  DALAM_PERBAIKAN: "dalam_perbaikan",
} as const;

const STATUS_LABEL = {
  tersedia: "Tersedia",
  dalam_perbaikan: "Dalam Perbaikan",
};

const formatStatus = (status: "tersedia" | "dalam_perbaikan") =>
  STATUS_LABEL[status];

/* =====================
   COMPONENT
====================== */
export default function MitraDashboard() {
  const router = useRouter();
  const pathname = usePathname();

  const [open, setOpen] = useState(true);
  const [lapangan, setLapangan] = useState<Lapangan[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"success" | "error">("success");

  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);

  const [summary, setSummary] = useState({
    totalPendapatan: 0,
    totalBooking: 0,
    bookingHariIni: 0,
  });

  // ======================
  // EFFECT
  // ======================
  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      active: true,
      path: "/mitra/dashboard",
    },
    {
      label: "Lapangan",
      icon: <CalendarPlus2 size={20} />,
      path: "/mitra/lapangan",
    },
    {
      label: "Booking",
      icon: <CalendarCheck size={20} />,
      path: "/mitra/booking",
    },
    {
      label: "Pendapatan",
      icon: <ChartNoAxesCombined size={20} />,
      path: "/mitra/pendapatan",
    },
  ];

  /* =====================
     FETCH LAPANGAN
  ====================== */
  useEffect(() => {
    const fetchLapangan = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/lapangan/mitra/lapangan`,
          { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" }
        );

        const data: LapanganAPI[] = await res.json();

        const mappedData: Lapangan[] = data.map((lap) => ({
          id: lap.id,
          slug: lap.slug,
          nama: lap.nama,
          status: lap.status,
          gambar: lap.gambar
            ? lap.gambar.startsWith("http")
              ? lap.gambar
              : `${process.env.NEXT_PUBLIC_API_URL}/img/lapangan/${lap.gambar}`
            : null,
          type: lap.type ?? lap.detail?.type ?? null,
          facilities: lap.detail?.fasilitas ?? [],
        }));

        setLapangan(mappedData);
      } catch (err) {
        console.error(err);
        alert("Gagal mengambil data lapangan");
      } finally {
        setLoading(false);
      }
    };

    fetchLapangan();
  }, []);

  /* =====================
   FETCH DASHBOARD SUMMARY
====================== */
  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/dashboard`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        const summaryData = result.data; // ⬅️ INI KUNCI

        setSummary({
          totalPendapatan: summaryData.total_pendapatan,
          totalBooking: summaryData.total_booking,
          bookingHariIni: summaryData.booking_hari_ini,
        });
      } catch (err) {
        console.error("Gagal fetch summary:", err);
      }
    };

    fetchSummary();
  }, []);

  /* =====================
     TOGGLE STATUS
  ====================== */
  const handleToggleStatus = async (slug: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lapangan/mitra/lapangan/${slug}/toggle-status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setLapangan((prev) =>
        prev.map((l) => (l.slug === slug ? { ...l, status: data.status } : l))
      );
    } catch (err) {
      console.error(err);
      alert("Gagal toggle status lapangan");
    }
  };

  const handleUpdateStatus = async (
    slug: string,
    status: "tersedia" | "dalam_perbaikan"
  ) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lapangan/mitra/lapangan/${slug}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ status }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal update status");

      setLapangan((prev) =>
        prev.map((l) => (l.slug === slug ? { ...l, status: data.status } : l))
      );
    } catch (err) {
      console.error(err);
      alert("Gagal mengubah status lapangan");
    }
  };

  /* =====================
     DELETE LAPANGAN
  ====================== */
  const handleDeleteLapangan = async (slug: string) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/lapangan/mitra/lapangan/${slug}`,
        { method: "DELETE", headers: { Authorization: `Bearer ${token}` } }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Gagal menghapus lapangan");
      }

      // update UI
      setLapangan((prev) => prev.filter((l) => l.slug !== slug));

      // ✅ notif sukses
      setNotifType("success");
      setNotifMessage("Lapangan berhasil dihapus");
      setShowNotif(true);
    } catch (err: any) {
      console.error(err);

      // ❌ notif error
      setNotifType("error");
      setNotifMessage(err.message || "Gagal menghapus lapangan");
      setShowNotif(true);
    }
  };

  /* =====================
     RENDER
  ====================== */

  return (
    <div
      className={`min-h-screen bg-gray-50 relative ${PoppinsRegular.className}`}
    >
      <ProtectedMitra>
        {/* BUTTON TOGGLE SIDEBAR */}
        <button
          onClick={() => setOpen(!open)}
          className={`absolute fixed top-6 z-[999] w-11 h-11 rounded-2xl flex items-center justify-center shadow-lg text-white transition-all duration-300 bg-[var(--color-primary)] hover:bg-[var(--color-hover)] ${
            open ? "left-59" : "left-4.5"
          }`}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>

        {/* SIDEBAR */}
        <aside
          className={`
    fixed top-0 left-0 h-screen z-40
    ${open ? "w-64" : "w-20"}
    bg-white/90 backdrop-blur-xl
    border-r border-gray-200
    px-4 py-8
    flex flex-col gap-6
    shadow-[0_4px_14px_rgba(0,0,0,0.06)]
    transition-all duration-300
    rounded-r-3xl
  `}
        >
          <nav className="flex flex-col gap-3 mt-[60px]">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => item.path && router.push(item.path)}
                className={`flex items-center ${
                  open ? "gap-3 px-4" : "justify-center px-0"
                } py-3 rounded-xl border transition-all duration-200 group
                      ${
                        item.active
                          ? "text-white bg-[var(--color-primary)] border-[var(--color-hover)] shadow"
                          : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
                      }`}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-xl shadow-inner transition-all duration-200
                        ${
                          item.active
                            ? "bg-[var(--color-primary-light)]"
                            : "bg-gray-100 group-hover:bg-gray-200"
                        }`}
                >
                  {item.icon}
                </div>
                {open && (
                  <span className="font-medium whitespace-nowrap text-[15px]">
                    {item.label}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </aside>

        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />

            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                Konfirmasi Hapus
              </h3>

              <p className="text-gray-500 text-center mt-2">
                Apakah kamu yakin ingin menghapus lapangan ini?
              </p>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-100 transition"
                >
                  Batal
                </button>

                <button
                  onClick={() => {
                    if (selectedSlug) {
                      handleDeleteLapangan(selectedSlug);
                    }
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Ya, Hapus
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN */}
        <main
          className={`
    transition-all duration-300
    ${open ? "ml-64" : "ml-20"}
    p-10 mt-7
    min-h-screen
  `}
        >
          <div className="w-full mt-[-60px] mb-4">
            <Navbar />
          </div>

          <h1
            className={`text-2xl font-bold text-gray-700 ${PoppinsBold.className}`}
          >
            Dashboard
          </h1>
          <p className="text-gray-500 mb-10 mt-2">
            Selamat datang, kelola padel Anda di sini
          </p>

          <div className="flex flex-col md:flex-row gap-6 mt-8 mb-10">
            {/* TOTAL PENDAPATAN */}
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:-translate-y-1 transition duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Pendapatan</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    Rp {summary.totalPendapatan.toLocaleString("id-ID")}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                  <WalletMinimal size={26} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Akumulasi dari semua booking
              </p>
            </div>

            {/* TOTAL BOOKING */}
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:-translate-y-1 transition duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] ">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Booking</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.totalBooking}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center duration-300 hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] ">
                  <CalendarCheck size={26} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Jumlah booking keseluruhan
              </p>
            </div>

            {/* BOOKING HARI INI */}
            <div className="flex-1 bg-white rounded-2xl p-6 border border-gray-200 shadow-sm hover:-translate-y-1 transition">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Booking Hari Ini</p>
                  <h3 className="text-2xl font-bold text-gray-800 mt-1">
                    {summary.bookingHariIni}
                  </h3>
                </div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center">
                  <CalendarPlus2 size={26} />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-4">
                Booking yang masuk hari ini
              </p>
            </div>
          </div>

          <h2
            className={`text-2xl font-bold mb-4 text-gray-700 ${PoppinsBold.className}`}
          >
            Status Lapangan
          </h2>

          {loading ? (
            <p>Loading...</p>
          ) : lapangan.length === 0 ? (
            <p className="text-gray-500 text-center mt-5">Belum ada lapangan</p>
          ) : (
            <div className="grid gap-6">
              {lapangan.map((item) => {
                const isMaintenance = item.status === "dalam_perbaikan";

                return (
                  <div
                    key={item.slug} // Ganti dari item.id ke item.slug
                    className="
            relative group rounded-2xl overflow-hidden
            glass border border-gray-200/70
            shadow-sm hover:shadow-xl
            transition-all duration-300
          "
                  >
                    {/* TOP GRADIENT LINE */}
                    <div
                      className={`absolute top-0 left-0 h-1 w-full ${
                        isMaintenance
                          ? "bg-gradient-to-r from-red-500 to-orange-400"
                          : "bg-gradient-to-r from-green-500 to-emerald-400"
                      }`}
                    />

                    <div className="relative flex items-center gap-6 p-6">
                      {/* IMAGE */}
                      <div className="relative shrink-0">
                        <img
                          src={item.gambar ?? "/placeholder.jpg"}
                          alt={item.nama}
                          className="w-44 h-28 object-cover rounded-xl ring-1 ring-gray-200 group-hover:scale-[1.02] transition"
                        />

                        {/* STATUS BADGE */}
                        <span
                          className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 shadow-md backdrop-blur ${
                            item.status === "dalam_perbaikan"
                              ? "bg-red-500/90 text-white"
                              : "bg-green-500/90 text-white"
                          }`}
                        >
                          {item.status === "dalam_perbaikan" ? (
                            <Wrench size={12} />
                          ) : (
                            <CheckCircle size={12} />
                          )}
                          {formatStatus(item.status)}
                        </span>
                      </div>

                      {/* INFO */}
                      <div className="flex-1">
                        <h3 className="text-xl font-semibold text-gray-800">
                          {item.nama}
                        </h3>
                        <p className="text-sm text-gray-500 mt-0.5">
                          {item.type ?? "—"}
                        </p>

                        {item.facilities.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-3">
                            {item.facilities.map((f, i) => (
                              <span
                                key={i}
                                className="text-[11px] px-2.5 py-1 rounded-full bg-gray-100 text-gray-600 border border-gray-200"
                              >
                                {f}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* ACTIONS */}
                      <div className="flex flex-col items-end gap-4">
                        {/* MODERN SWITCH */}
                        <button
                          onClick={() => handleToggleStatus(item.slug)}
                          className={`w-14 h-7 rounded-full relative transition-all duration-300 ${
                            item.status === "dalam_perbaikan"
                              ? "bg-red-500/80"
                              : "bg-green-500/80"
                          }`}
                        >
                          <span
                            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-300 ${
                              item.status === "dalam_perbaikan"
                                ? "translate-x-7"
                                : ""
                            }`}
                          />
                        </button>

                        {/* DELETE ICON */}
                        <button
                          onClick={() => {
                            setSelectedSlug(item.slug);
                            setShowConfirm(true);
                          }}
                          className="opacity-0 group-hover:opacity-100 p-2 rounded-lg text-red-500 hover:bg-red-100 transition"
                          title="Hapus Lapangan"
                        >
                          <Trash2 size={22} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </ProtectedMitra>
    </div>
  );
}
