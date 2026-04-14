"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import ProtectedAdmin from "@/components/ProtectedAdmin";
import {
  LayoutDashboard,
  Store,
  Users,
  WalletMinimal,
  Menu,
  X,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

type WithdrawalRequest = {
  id: number;
  mitra_nama: string;
  mitra_email: string;
  jumlah: number;
  created_at: string;
};

type EarningsDashboard = {
  message: string;
  earnings_summary: {
    total_transaction_fees: number;
    total_withdrawal_fees: number;
    total_earnings: number;
  };
  withdrawal_status: {
    pending: {
      count: number;
      total: number;
      data: WithdrawalRequest[];
    };
    processing: {
      count: number;
      total: number;
      data: WithdrawalRequest[];
    };
    approved: {
      count: number;
      total: number;
    };
    rejected: {
      count: number;
      total: number;
    };
  };
  stats: {
    total_pending_withdrawal: number;
    total_processing_withdrawal: number;
    total_approved_withdrawal: number;
  };
};

export default function AdminEarningsPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [earningsData, setEarningsData] = useState<EarningsDashboard | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const [selectedTab, setSelectedTab] = useState<
    "pending" | "processing" | "overview"
  >("overview");

  const menuItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/admin/dashboard",
    },
    {
      label: "Transaksi",
      icon: <WalletMinimal size={20} />,
      path: "/admin/transaksi",
    },
    {
      label: "Earnings",
      icon: <TrendingUp size={20} />,
      path: "/admin/earnings",
      active: true,
    },
    {
      label: "Mitra",
      icon: <Store size={20} />,
      path: "/admin/mitra",
    },
    {
      label: "Pengguna",
      icon: <Users size={20} />,
      path: "/admin/users",
    },
  ];

  useEffect(() => {
    const fetchEarningsData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/earnings-dashboard`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );

        const result = await res.json();
        if (res.ok) {
          setEarningsData(result);
        }
      } catch (err) {
        console.error("Gagal fetch earnings data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEarningsData();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={20} className="text-yellow-600" />;
      case "processing":
        return <Clock size={20} className="text-blue-600" />;
      case "approved":
        return <CheckCircle size={20} className="text-green-600" />;
      case "rejected":
        return <XCircle size={20} className="text-red-600" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${PoppinsRegular.className}`}>
        <ProtectedAdmin>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              <p className="mt-4 text-gray-600">Memuat data earnings...</p>
            </div>
          </div>
        </ProtectedAdmin>
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen bg-gray-50 relative ${PoppinsRegular.className}`}
    >
      <ProtectedAdmin>
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
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6">
            <h1
              className={`text-2xl font-bold text-gray-800 ${PoppinsBold.className}`}
            >
              Dashboard Pendapatan Admin
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Lihat ringkasan pendapatan dari biaya transaksi dan pencairan
            </p>
          </div>

          {/* EARNINGS SUMMARY */}
          {earningsData && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                {/* Transaction Fees */}
                <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-90">Biaya Transaksi</p>
                      <h3 className="text-3xl font-bold mt-2">
                        Rp{" "}
                        {earningsData.earnings_summary.total_transaction_fees
                          .toLocaleString("id-ID")
                          .replace(/,/g, ".")}
                      </h3>
                      <p className="text-xs opacity-80 mt-2">
                        Dari{" "}
                        {earningsData.stats.total_pending_withdrawal +
                          earningsData.stats.total_processing_withdrawal +
                          earningsData.stats.total_approved_withdrawal}{" "}
                        transaksi
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <WalletMinimal size={24} />
                    </div>
                  </div>
                </div>

                {/* Withdrawal Fees */}
                <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-90">Biaya Pencairan</p>
                      <h3 className="text-3xl font-bold mt-2">
                        Rp{" "}
                        {earningsData.earnings_summary.total_withdrawal_fees
                          .toLocaleString("id-ID")
                          .replace(/,/g, ".")}
                      </h3>
                      <p className="text-xs opacity-80 mt-2">
                        Dari {earningsData.withdrawal_status.approved.count}{" "}
                        pencairan
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <TrendingUp size={24} />
                    </div>
                  </div>
                </div>

                {/* Total Earnings */}
                <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Pendapatan</p>
                      <h3 className="text-3xl font-bold mt-2">
                        Rp{" "}
                        {earningsData.earnings_summary.total_earnings
                          .toLocaleString("id-ID")
                          .replace(/,/g, ".")}
                      </h3>
                      <p className="text-xs opacity-80 mt-2">
                        Semua sumber pendapatan
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle size={24} />
                    </div>
                  </div>
                </div>
              </div>

              {/* WITHDRAWAL STATUS CARDS */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white rounded-2xl p-6 border border-yellow-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock size={24} className="text-yellow-600" />
                    <h3 className="font-semibold text-gray-800">Menunggu</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earningsData.withdrawal_status.pending.count}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Rp{" "}
                    {earningsData.withdrawal_status.pending.total
                      .toLocaleString("id-ID")
                      .replace(/,/g, ".")}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-blue-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <TrendingUp size={24} className="text-blue-600" />
                    <h3 className="font-semibold text-gray-800">Diproses</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earningsData.withdrawal_status.processing.count}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Rp{" "}
                    {earningsData.withdrawal_status.processing.total
                      .toLocaleString("id-ID")
                      .replace(/,/g, ".")}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-green-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <CheckCircle size={24} className="text-green-600" />
                    <h3 className="font-semibold text-gray-800">Disetujui</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earningsData.withdrawal_status.approved.count}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Rp{" "}
                    {earningsData.withdrawal_status.approved.total
                      .toLocaleString("id-ID")
                      .replace(/,/g, ".")}
                  </p>
                </div>

                <div className="bg-white rounded-2xl p-6 border border-red-200 shadow-sm">
                  <div className="flex items-center gap-3 mb-3">
                    <XCircle size={24} className="text-red-600" />
                    <h3 className="font-semibold text-gray-800">Ditolak</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {earningsData.withdrawal_status.rejected.count}
                  </p>
                  <p className="text-sm text-gray-600 mt-2">
                    Rp{" "}
                    {earningsData.withdrawal_status.rejected.total
                      .toLocaleString("id-ID")
                      .replace(/,/g, ".")}
                  </p>
                </div>
              </div>

              {/* PENDING & PROCESSING REQUESTS */}
              <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
                {/* TAB BUTTONS */}
                <div className="flex border-b border-gray-200">
                  <button
                    onClick={() => setSelectedTab("pending")}
                    className={`flex-1 px-6 py-4 font-medium transition-all ${
                      selectedTab === "pending"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <Clock className="inline mr-2" size={18} />
                    Menunggu Persetujuan (
                    {earningsData.withdrawal_status.pending.count})
                  </button>
                  <button
                    onClick={() => setSelectedTab("processing")}
                    className={`flex-1 px-6 py-4 font-medium transition-all ${
                      selectedTab === "processing"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <TrendingUp className="inline mr-2" size={18} />
                    Sedang Diproses (
                    {earningsData.withdrawal_status.processing.count})
                  </button>
                  <button
                    onClick={() => setSelectedTab("overview")}
                    className={`flex-1 px-6 py-4 font-medium transition-all ${
                      selectedTab === "overview"
                        ? "bg-[var(--color-primary)] text-white"
                        : "bg-white text-gray-600 hover:bg-gray-50"
                    }`}
                  >
                    <CheckCircle className="inline mr-2" size={18} />
                    Ringkasan
                  </button>
                </div>

                {/* TAB CONTENT */}
                <div className="p-6">
                  {selectedTab === "pending" ? (
                    <div>
                      {earningsData.withdrawal_status.pending.data.length >
                      0 ? (
                        <div className="space-y-4">
                          {earningsData.withdrawal_status.pending.data.map(
                            (item) => (
                              <div
                                key={item.id}
                                className="p-4 border border-yellow-200 bg-yellow-50 rounded-xl flex items-center justify-between hover:shadow-md transition"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {item.mitra_nama}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {item.mitra_email}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      item.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-yellow-700">
                                    Rp{" "}
                                    {item.jumlah
                                      .toLocaleString("id-ID")
                                      .replace(/,/g, ".")}
                                  </p>
                                  <p className="text-xs text-yellow-600 mt-1">
                                    Menunggu
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <CheckCircle
                            size={40}
                            className="mx-auto mb-3 opacity-30"
                          />
                          <p>Tidak ada pencairan menunggu persetujuan</p>
                        </div>
                      )}
                    </div>
                  ) : selectedTab === "processing" ? (
                    <div>
                      {earningsData.withdrawal_status.processing.data.length >
                      0 ? (
                        <div className="space-y-4">
                          {earningsData.withdrawal_status.processing.data.map(
                            (item) => (
                              <div
                                key={item.id}
                                className="p-4 border border-blue-200 bg-blue-50 rounded-xl flex items-center justify-between hover:shadow-md transition"
                              >
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">
                                    {item.mitra_nama}
                                  </p>
                                  <p className="text-sm text-gray-600">
                                    {item.mitra_email}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {new Date(
                                      item.created_at,
                                    ).toLocaleDateString("id-ID", {
                                      weekday: "long",
                                      day: "numeric",
                                      month: "long",
                                      year: "numeric",
                                    })}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold text-blue-700">
                                    Rp{" "}
                                    {item.jumlah
                                      .toLocaleString("id-ID")
                                      .replace(/,/g, ".")}
                                  </p>
                                  <p className="text-xs text-blue-600 mt-1">
                                    Diproses
                                  </p>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12 text-gray-500">
                          <TrendingUp
                            size={40}
                            className="mx-auto mb-3 opacity-30"
                          />
                          <p>Tidak ada pencairan yang sedang diproses</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                        <p className="text-sm text-gray-600 mb-1">
                          Ringkasan Pendapatan
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          Rp{" "}
                          {earningsData.earnings_summary.total_earnings
                            .toLocaleString("id-ID")
                            .replace(/,/g, ".")}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
                          <p className="text-xs text-gray-600">
                            Biaya Transaksi
                          </p>
                          <p className="text-lg font-bold text-blue-700 mt-2">
                            Rp{" "}
                            {earningsData.earnings_summary.total_transaction_fees
                              .toLocaleString("id-ID")
                              .replace(/,/g, ".")}
                          </p>
                        </div>

                        <div className="bg-green-50 p-4 rounded-xl border border-green-200">
                          <p className="text-xs text-gray-600">
                            Biaya Pencairan
                          </p>
                          <p className="text-lg font-bold text-green-700 mt-2">
                            Rp{" "}
                            {earningsData.earnings_summary.total_withdrawal_fees
                              .toLocaleString("id-ID")
                              .replace(/,/g, ".")}
                          </p>
                        </div>
                      </div>

                      <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                        <p className="text-sm text-gray-600 mb-3">
                          Status Pencairan
                        </p>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">✓ Disetujui:</span>
                            <span className="font-bold">
                              {earningsData.withdrawal_status.approved.count}{" "}
                              pencairan
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">⏳ Menunggu:</span>
                            <span className="font-bold">
                              {earningsData.withdrawal_status.pending.count}{" "}
                              pencairan
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">⚙️ Diproses:</span>
                            <span className="font-bold">
                              {earningsData.withdrawal_status.processing.count}{" "}
                              pencairan
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-700">✗ Ditolak:</span>
                            <span className="font-bold">
                              {earningsData.withdrawal_status.rejected.count}{" "}
                              pencairan
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </main>
      </ProtectedAdmin>
    </div>
  );
}
