"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedAdmin from "@/components/ProtectedAdmin";
import { WalletMinimal, LayoutDashboard, Menu, X } from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";
import dayjs from "dayjs";
import Navbar from "@/components/navbar";
import Notification from "@/components/Notification";

/* ===================== FONT ===================== */
const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

/* ===================== TYPES ===================== */
type Refund = {
  id: number;
  user: { nama: string };
  order: { lapanganNama: string; tanggal: string };
  jumlah: number;
  alasan: string;
  status: "pending" | "approved" | "rejected";
};

/* ===================== COMPONENT ===================== */
export default function AdminRefundPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"success" | "error">("success");

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,

      path: "/admin/dashboard",
    },
    {
      label: "Refund",
      icon: <WalletMinimal size={20} />,
      path: "/admin/refund",
      active: true,
    },
    {
      label: "Transaksi",
      icon: <WalletMinimal size={20} />,
      path: "/admin/booking",
    },
  ];

  /* ===================== NOTIF EFFECT ===================== */
  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 2500);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

  /* ===================== FETCH REFUND ===================== */
  useEffect(() => {
    const fetchRefunds = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        setLoading(true);
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/refund/admin`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!res.ok) throw new Error("Gagal fetch refund");
        const data = await res.json();

        const refundsData: Refund[] = data.history.map((r: any) => ({
          id: r.id,
          user: { nama: r.user?.nama || "User" },
          order: { lapanganNama: r.lapanganNama, tanggal: r.tanggal },
          jumlah: r.jumlah, // ⬅️ JANGAN HITUNG LAGI
          alasan: r.alasan || "-",
          status: r.refundStatus,
        }));

        setRefunds(refundsData);
      } catch (err: any) {
        console.error(err);
        alert(err.message || "Gagal memuat refund");
      } finally {
        setLoading(false);
      }
    };

    fetchRefunds();
  }, []);

  /* ===================== APPROVE REFUND ===================== */
  const approveRefund = async (id: number) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/refund/approve`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refund_id: id }),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Gagal approve refund");

      // update status di UI
      setRefunds((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: "approved" } : r))
      );

      setNotifType("success");
      setNotifMessage("Refund berhasil disetujui");
      setShowNotif(true);
    } catch (err: any) {
      console.error(err);
      setNotifType("error");
      setNotifMessage(err.message || "Gagal approve refund");
      setShowNotif(true);
    }
  };

  /* ===================== RENDER ===================== */
  return (
    <ProtectedAdmin>
      <div
        className={`min-h-screen bg-gradient-to-br from-gray-50 via-gray-50 to-gray-100 flex relative ${PoppinsRegular.className}`}
      >
        {/* TOGGLE SIDEBAR */}
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
          className={`fixed top-0 left-0 h-screen z-40 ${
            open ? "w-64" : "w-20"
          } bg-white/90 backdrop-blur-xl border-r border-gray-200 px-4 py-8 flex flex-col gap-6 shadow-[0_4px_14px_rgba(0,0,0,0.06)] transition-all duration-300 rounded-r-3xl`}
        >
          <nav className="flex flex-col gap-3 mt-[60px]">
            {menuItems.map((item, i) => (
              <button
                key={i}
                onClick={() => item.path && router.push(item.path)}
                className={`flex items-center ${
                  open ? "gap-3 px-4" : "justify-center px-0"
                } py-3 rounded-xl border transition-all duration-200 group ${
                  item.active
                    ? "text-white bg-[var(--color-primary)] border-[var(--color-hover)] shadow"
                    : "bg-white border-gray-200 hover:bg-gray-100 text-gray-700"
                }`}
              >
                <div
                  className={`w-9 h-9 flex items-center justify-center rounded-xl shadow-inner transition-all duration-200 ${
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
          <div className="w-full mt-[-60px] mb-4">
            <Navbar />
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h2
                className={`text-2xl font-bold text-gray-700 ${PoppinsBold.className}`}
              >
                Refund Management
              </h2>
              <p className="text-gray-500 mb-8 mt-2">
                Refund akan otomatis disetujui H-3 sebelum tanggal booking
              </p>
            </div>

            <hr className="my-6 border-gray-200/70" />

            {/* SUMMARY */}
            <div className="flex gap-3">
              <div className="px-4 py-3 rounded-xl bg-yellow-50 border border-yellow-200">
                <p className="text-xs text-yellow-700">Pending</p>
                <p className="text-lg font-bold text-yellow-800">
                  {refunds.filter((r) => r.status === "pending").length}
                </p>
              </div>

              <div className="px-4 py-3 rounded-xl bg-green-50 border border-green-200">
                <p className="text-xs text-green-700">Approved</p>
                <p className="text-lg font-bold text-green-800">
                  {refunds.filter((r) => r.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          {loading && (
            <p className="text-sm text-gray-400 mt-6 animate-pulse">
              Memuat refund...
            </p>
          )}

          {!loading && refunds.length === 0 && (
            <div className="mt-16 text-center text-gray-400">
              <p className="text-lg font-semibold">Tidak ada refund</p>
              <p className="text-sm mt-1">
                Semua refund sudah diproses dengan baik ✨
              </p>
            </div>
          )}

          {!loading && refunds.length > 0 && (
            <div className="mt-6 bg-white rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.06)] border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  {/* TABLE HEADER */}
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="text-left text-[11px] uppercase tracking-wider text-gray-400">
                      <th className="px-5 py-4 font-semibold">User</th>
                      <th className="px-5 py-4 font-semibold">Lapangan</th>
                      <th className="px-5 py-4 font-semibold">Tanggal</th>
                      <th className="px-5 py-4 font-semibold">Jumlah</th>
                      <th className="px-5 py-4 font-semibold">Alasan</th>
                      <th className="px-5 py-4 font-semibold text-center">
                        Status
                      </th>
                      <th className="px-5 py-4 font-semibold text-right">
                        Aksi
                      </th>
                    </tr>
                  </thead>

                  {/* TABLE BODY */}
                  <tbody className="divide-y divide-gray-100">
                    {refunds.map((r) => (
                      <tr key={r.id} className="transition hover:bg-gray-50/80">
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center text-white text-xs font-bold">
                              {r.user.nama.charAt(0)}
                            </div>

                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-800 leading-tight">
                                {r.user.nama}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {r.order.lapanganNama}
                        </td>

                        <td className="px-5 py-4 text-gray-600">
                          {dayjs(r.order.tanggal).format("DD MMM YYYY")}
                        </td>

                        <td className="px-5 py-4 font-semibold text-emerald-600">
                          Rp {r.jumlah.toLocaleString("id-ID")}
                        </td>

                        <td className="px-5 py-4 text-gray-600 max-w-[260px]">
                          <p className="line-clamp-2">{r.alasan}</p>
                        </td>

                        {/* STATUS */}
                        <td className="px-5 py-4 text-center">
                          {r.status === "approved" ? (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                              <span className="w-2 h-2 rounded-full bg-green-500" />
                              Approved
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700">
                              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                              Pending
                            </span>
                          )}
                        </td>

                        {/* ACTION */}
                        <td className="px-5 py-4 text-right">
                          {r.status === "pending" && (
                            <button
                              onClick={() => approveRefund(r.id)}
                              className="px-4 py-2 text-xs font-semibold rounded-xl border border-green-600 text-green-600
             hover:bg-green-600 hover:text-white
             active:scale-95 transition-all duration-200"
                            >
                              Approve
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Notifikasi */}
          {showNotif && (
            <Notification type={notifType} message={notifMessage} />
          )}
        </main>
      </div>
    </ProtectedAdmin>
  );
}
