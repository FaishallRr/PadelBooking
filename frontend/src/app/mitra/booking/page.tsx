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

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

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

type Booking = {
  id: number;
  status: string;
  tanggal: string;
  jam_mulai: string;
  jam_selesai: string;
  total_harga: number;
  user: {
    nama: string;
    email: string;
  };
  lapangan: {
    nama: string;
    lokasi: string;
  };
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

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingLoading, setBookingLoading] = useState(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");

  type FilterRange = "7" | "30" | "all";

  const [range, setRange] = useState<FilterRange>("7");

  const [revenueData, setRevenueData] = useState<
    { date: string; revenue: number }[]
  >([]);

  const [summary, setSummary] = useState({
    totalPendapatan: 0,
    totalBooking: 0,
    bookingHariIni: 0,
  });

  const filteredRevenue = React.useMemo(() => {
    if (range === "all") return revenueData;

    const days = range === "7" ? 7 : 30;
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    return revenueData.filter((item) => {
      const date = new Date(item.date);
      return date >= cutoff;
    });
  }, [range, revenueData]);

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
      active: true,
    },

    {
      label: "Pendapatan",
      icon: <ChartNoAxesCombined size={20} />,
      path: "/mitra/pendapatan",
    },
  ];

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/booking`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setBookings(result.data);
      } catch (err) {
        console.error("Gagal fetch booking:", err);
      } finally {
        setBookingLoading(false);
      }
    };

    fetchBooking();
  }, []);

  useEffect(() => {
    const fetchRevenue = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/revenue-chart`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        const result = await res.json();
        if (!res.ok) throw new Error(result.message);

        setRevenueData(
          result.data.map((item: any) => ({
            date: item.date,
            revenue: item.total,
          }))
        );
      } catch (err) {
        console.error("Gagal fetch revenue chart:", err);
      }
    };

    fetchRevenue();
  }, []);

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

  const filteredBookings = bookings.filter((b) => {
    const matchStatus =
      statusFilter === "all" ? true : b.status === statusFilter;

    const keyword = search.toLowerCase();

    const matchSearch =
      b.user.nama.toLowerCase().includes(keyword) ||
      b.user.email.toLowerCase().includes(keyword) ||
      b.lapangan.nama.toLowerCase().includes(keyword);

    return matchStatus && matchSearch;
  });

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

  const STATUS_OPTIONS = [
    { key: "all", label: "Semua" },
    { key: "menunggu", label: "Menunggu" },
    { key: "dibayar", label: "Dibayar" },
    { key: "refund", label: "refund" },
    { key: "dibatalkan", label: "Dibatalkan" },
  ];

  const statusStyle = (status: string) => {
    switch (status) {
      case "dibayar":
        return "bg-green-100 text-green-700";
      case "menunggu":
        return "bg-yellow-100 text-yellow-700";
      case "dibatalkan":
        return "bg-red-100 text-red-700";
      case "refund":
        return "bg-blue-100 text-blue-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  /* =====================
     RENDER
  ====================== */

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-white px-4 py-3 rounded-xl shadow-lg border">
        <p className="text-xs text-gray-500">
          {new Date(label).toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
        <p className="text-lg font-bold text-green-600 mt-1">
          Rp {payload[0].value.toLocaleString("id-ID")}
        </p>
      </div>
    );
  };

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

        {/* MAIN */}
        <main
          className={`
           transition-all duration-300
           ${open ? "ml-64" : "ml-20"}
           p-10 mt-7
           min-h-screen
         `}
        >
          {/* NAVBAR */}
          <div className="w-full mt-[-60px] mb-4">
            <Navbar />
          </div>
          {/* HEADER */}
          <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div>
              <h1
                className={`text-2xl font-bold text-gray-800 ${PoppinsBold.className}`}
              >
                Booking Lapangan
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Kelola & pantau seluruh booking pelanggan
              </p>
            </div>

            <div className="px-4 py-2 rounded-xl bg-green-50 text-green-700 text-sm font-semibold">
              Total Booking: {filteredBookings.length}
            </div>
          </div>

          {/* FILTER & SEARCH */}
          <div className="bg-white rounded-2xl p-4 mb-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((s) => (
                <button
                  key={s.key}
                  onClick={() => setStatusFilter(s.key)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition
        ${
          statusFilter === s.key
            ? "bg-green-500 text-white border-green-500 shadow"
            : "bg-white text-gray-600 hover:bg-green-50"
        }`}
                >
                  {s.label}
                </button>
              ))}
            </div>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari user / lapangan"
              className="w-full md:w-72 px-4 py-2 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-200"
            />
          </div>

          {/* TABLE */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-sm border-separate border-spacing-0">
              <thead className="bg-gray-50 text-gray-600 sticky top-0 z-10">
                <tr className="border-b last:border-b-0 hover:bg-green-50/40 transition">
                  <th className="px-4 py-3 text-left">User</th>
                  <th className="px-4 py-3 text-left">Lapangan</th>
                  <th className="px-4 py-3 text-center">Tanggal</th>
                  <th className="px-4 py-3 text-center">Jam</th>
                  <th className="px-4 py-3 text-center">Total</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {bookingLoading && (
                  <tr>
                    <td colSpan={6} className="py-10">
                      <div className="flex justify-center">
                        <div className="w-1/2 h-4 bg-gray-200 rounded animate-pulse" />
                      </div>
                    </td>
                  </tr>
                )}

                {!bookingLoading && filteredBookings.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-gray-400">
                      Tidak ada booking ditemukan
                    </td>
                  </tr>
                )}

                {!bookingLoading &&
                  filteredBookings.map((b) => (
                    <tr key={b.id} className="transition hover:bg-gray-50/80">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                            {b.user.nama.charAt(0)}
                          </div>

                          <div className="flex flex-col">
                            <span className="font-semibold text-gray-800 leading-tight">
                              {b.user.nama}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="font-medium">{b.lapangan.nama}</div>
                      </td>

                      <td className="px-4 py-3 text-center">
                        {new Date(b.tanggal).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>

                      <td className="px-4 py-3 text-center">
                        {b.jam_mulai} - {b.jam_selesai}
                      </td>

                      <td className="px-4 py-3 text-center font-semibold">
                        Rp {Number(b.total_harga).toLocaleString("id-ID")}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${statusStyle(
                            b.status
                          )}`}
                        >
                          <span className="w-2 h-2 rounded-full bg-current opacity-70" />
                          {b.status}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {/* EMPTY STATE (opsional) */}
            <div className="hidden p-6 text-center text-gray-500">
              Belum ada data booking
            </div>
          </div>
        </main>
      </ProtectedMitra>
    </div>
  );
}
