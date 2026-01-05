"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  CalendarCheck,
  WalletMinimal,
  CalendarPlus2,
  Menu,
  ChartNoAxesCombined,
  X,
  Pencil,
  Eye,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";
import localFont from "next/font/local";
import Navbar from "@/components/navbar";

const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

// ============================
// TYPE
// ============================
type LapanganType = {
  id: number;
  nama: string;
  status?: string;
  gambar?: string;
  rating?: number;
  lokasi?: string;
  harga?: number;
  slug: string;
};

export default function LapanganPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);

  const [loading, setLoading] = useState(true);
  const [lapangan, setLapangan] = useState<LapanganType[]>([]);
  const [error, setError] = useState("");

  // =============================
  // FETCH DATA LAPANGAN MITRA
  // =============================
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");

        if (!token) {
          setError("Token tidak ditemukan, silakan login kembali.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          "http://localhost:5000/api/lapangan/mitra/lapangan",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const text = await res.text(); // ambil response sebagai text dulu
        let data;

        try {
          data = JSON.parse(text); // coba parse JSON
        } catch {
          throw new Error("Response server bukan JSON:\n" + text);
        }

        if (!res.ok) {
          throw new Error(data.message || "Gagal mengambil data lapangan");
        }

        setLapangan(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/mitra/dashboard",
    },
    {
      label: "Lapangan",
      icon: <CalendarPlus2 size={20} />,
      active: true,
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

  return (
    <div
      className={`min-h-screen bg-gray-50 relative ${PoppinsRegular.className}`}
    >
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

      {/* MAIN CONTENT */}
      <main
        className={`
    transition-all duration-300
    ${open ? "ml-64" : "ml-20"}
    p-10 mt-7
    min-h-screen
  `}
      >
        <div className="w-[100%] mt-[-60px] mb-4">
          <Navbar />
        </div>
        <div className="flex items-center justify-between">
          <h1
            className={`text-[23px] font-medium text-gray-700 tracking-tight ${PoppinsBold.className}`}
          >
            Data Lapangan
          </h1>

          <button
            onClick={() => router.push("/mitra/lapangan/tambah-data")}
            className="px-4 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl shadow-md transition text-[15px] font-bold transition duration-300"
          >
            + Tambah Lapangan
          </button>
        </div>

        <p className="text-gray-500 mt-1 mb-8 text-[17px]">
          Kelola semua lapangan yang kamu miliki.
        </p>

        {/* LOADING */}
        {loading && (
          <p className="text-gray-500 text-[15px] text-center mt-18">
            Loading data lapangan...
          </p>
        )}

        {/* ERROR */}
        {error && (
          <p className="text-red-600 bg-red-100 p-3 rounded-xl">{error}</p>
        )}

        {/* NO DATA */}
        {!loading && lapangan.length === 0 && (
          <div className="text-center mt-20">
            <p className="text-gray-500 text-[15px] text-center mt-18">
              Belum ada data lapangan...
            </p>
          </div>
        )}

        {/* LIST GRID */}
        {!loading && lapangan.length > 0 && (
          <div className="max-w-full mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-10 min-h-[200px]">
            {lapangan.map((lap) => (
              <div
                key={lap.id}
                onClick={() => router.push(`/lapangan/${lap.slug}`)}
                className="cursor-pointer"
              >
                <div
                  className="
  relative bg-white rounded-2xl shadow-lg
  hover:shadow-2xl
  transform hover:scale-[1.02]
  transition-all duration-300
  ease-in-out
  flex flex-col
  h-full
  w-full
"
                >
                  {/* STATUS */}
                  <span
                    className={`absolute top-3 right-3 px-3 py-1 text-sm font-semibold rounded-full shadow-md
                    ${
                      lap.status?.toLowerCase() === "tersedia"
                        ? "bg-green-600 text-white"
                        : lap.status?.toLowerCase() === "dalam_perbaikan"
                        ? "bg-yellow-500 text-white"
                        : "bg-gray-500 text-white"
                    }`}
                  >
                    {(lap.status || "Tidak Tersedia")
                      .replace(/_/g, " ")
                      .replace(/\b\w/g, (c) => c.toUpperCase())}
                  </span>

                  {/* GAMBAR */}
                  {lap.gambar ? (
                    <img
                      src={`http://localhost:5000/img/lapangan/${lap.gambar}`}
                      alt={lap.nama}
                      className="w-full h-48 object-contain rounded-t-2xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-white rounded-t-2xl">
                      No Image
                    </div>
                  )}

                  {/* INFORMASI */}
                  <div className="p-4 flex flex-col flex-1">
                    <p className="text-[13px] text-gray-400 font-medium">
                      Venue
                    </p>

                    <p
                      className={`text-[18px] font-bold text-gray-700 ${PoppinsBold.className}`}
                    >
                      {lap.nama}
                    </p>

                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      ⭐ <span>{Number(lap.rating || 0).toFixed(1)}</span>
                      <span className="text-xl text-gray-500">•</span>
                      <span className="text-[14px]">
                        {lap.lokasi ?? "Lokasi tidak tersedia"}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 mt-1">
                      <img
                        src="https://asset.ayo.co.id/assets/img/padel.png"
                        width={18}
                      />
                      <p className="text-[13px] text-gray-400">Padel</p>
                    </div>

                    {/* HARGA */}
                    <div className="flex mt-8 gap-2 font-medium">
                      <p className="text-gray-600 text-[13px]">Mulai</p>
                      <p className="text-gray-700 text-[15px] font-bold mt-[-3px]">
                        Rp {Number(lap.harga || 0).toLocaleString("id-ID")}
                      </p>
                      <p className="text-gray-600 text-[13px]">/sesi</p>
                    </div>
                  </div>

                  {/* BUTTON */}
                  <div className="flex justify-between gap-3 p-4 mt-[-15px]">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        router.push(`/mitra/lapangan/edit/${lap.slug}`);
                      }}
                      className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-2 py-2 rounded-xl text-sm shadow transition w-full justify-center duration-300"
                    >
                      <Pencil size={16} /> Edit
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
