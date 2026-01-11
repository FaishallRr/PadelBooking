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
    },
    {
      label: "Pendapatan",
      icon: <ChartNoAxesCombined size={20} />,
      path: "/mitra/pendapatan",
      active: true,
    },
  ];

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
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
              <div>
                <h2
                  className={`text-xl font-bold text-gray-800 ${PoppinsBold.className}`}
                >
                  Grafik Pendapatan
                </h2>
                <p className="text-sm text-gray-500 mt-1">
                  Performa pendapatan berdasarkan booking
                </p>

                {/* TOTAL */}
                <div className="mt-4 inline-flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                  <span className="text-sm text-gray-600">Total:</span>
                  <span className="font-bold text-green-600">
                    Rp{" "}
                    {filteredRevenue
                      .reduce((sum, item) => sum + item.revenue, 0)
                      .toLocaleString("id-ID")}
                  </span>
                </div>
              </div>

              {/* FILTER */}
              <div className="flex gap-1 bg-gray-100 p-1.5 rounded-2xl shadow-inner">
                {[
                  { label: "7 Hari", value: "7" },
                  { label: "30 Hari", value: "30" },
                  { label: "Semua", value: "all" },
                ].map((item) => (
                  <button
                    key={item.value}
                    onClick={() => setRange(item.value as FilterRange)}
                    className={`px-5 py-2 text-sm rounded-xl transition-all duration-200 font-medium
  ${
    range === item.value
      ? "bg-green-500 text-white shadow-md scale-[1.02]"
      : "text-gray-600 hover:bg-white hover:shadow"
  }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* CHART */}
            <div className="w-full h-[340px]">
              {filteredRevenue.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-400">
                  <ChartNoAxesCombined size={40} className="mb-3" />
                  <p className="text-sm">Belum ada data pendapatan</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={filteredRevenue}
                    margin={{ top: 10, right: 20, left: 10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 6" opacity={0.25} />
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) =>
                        new Date(date).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                        })
                      }
                    />
                    <YAxis
                      tickFormatter={(value) =>
                        `Rp ${Number(value).toLocaleString("id-ID")}`
                      }
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#22c55e"
                      strokeWidth={4}
                      dot={false}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </main>
      </ProtectedMitra>
    </div>
  );
}
