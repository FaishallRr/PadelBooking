"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import ProtectedMitra from "@/components/ProtectedMitra";
import {
  LayoutDashboard,
  CalendarPlus2,
  CalendarCheck,
  ChartNoAxesCombined,
  WalletMinimal,
  Menu,
  X,
  Send,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Copy,
} from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

type WithdrawalRequest = {
  id: number;
  jumlah: number;
  estimated_withdrawal_fee?: number;
  estimated_net_amount?: number;
  bank_name: string;
  account_number: string;
  status: "pending" | "diproses" | "berhasil" | "ditolak";
  biaya_admin_pencairan?: number;
  jumlah_diterima?: number;
  created_at: string;
  processed_at?: string;
  catatan?: string;
};

type WithdrawalBalance = {
  saldo_tersedia: number;
  total_pending: number;
  total_dicairkan: number;
  data: WithdrawalRequest[];
};

type MitraData = {
  bank_mitra: string;
  no_rekening_mitra: string;
  nama_usaha: string;
};

export default function MitraPencairanPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [mitraData, setMitraData] = useState<MitraData | null>(null);
  const [withdrawalData, setWithdrawalData] =
    useState<WithdrawalBalance | null>(null);
  const [loading, setLoading] = useState(true);

  const [jumlah, setJumlah] = useState("");
  const [estimatedFee, setEstimatedFee] = useState(0);
  const [estimatedNet, setEstimatedNet] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"success" | "error">("success");

  const [activeTab, setActiveTab] = useState<"form" | "history">("form");
  const [copied, setCopied] = useState(false);

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
    },
    {
      label: "Pencairan",
      icon: <WalletMinimal size={20} />,
      path: "/mitra/pencairan",
      active: true,
    },
  ];

  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

  // Fetch withdrawal info
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        // Fetch withdrawal data (includes bank details from first request)
        const withdrawRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/pencairan`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          },
        );
        const withdrawResult = await withdrawRes.json();
        if (withdrawRes.ok) {
          setWithdrawalData(withdrawResult);
          // Extract bank details from the first withdrawal record if available
          if (withdrawResult.data && withdrawResult.data.length > 0) {
            const firstWithdrawal = withdrawResult.data[0];
            if (firstWithdrawal.bank_name && firstWithdrawal.account_number) {
              setMitraData({
                bank_mitra: firstWithdrawal.bank_name,
                no_rekening_mitra: firstWithdrawal.account_number,
                nama_usaha: "Usaha Mitra",
              });
            }
          }
        }
      } catch (err) {
        console.error("Gagal fetch data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate fee when jumlah changes
  useEffect(() => {
    if (jumlah && !isNaN(Number(jumlah))) {
      const amount = Number(jumlah);
      const fee = Math.round(amount * 0.05); // 5% fee
      const net = amount - fee;
      setEstimatedFee(fee);
      setEstimatedNet(net);
    }
  }, [jumlah]);

  const handleRequestWithdrawal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jumlah || Number(jumlah) <= 0) {
      setNotifMessage("Masukkan jumlah yang valid");
      setNotifType("error");
      setShowNotif(true);
      return;
    }

    if (Number(jumlah) > (withdrawalData?.saldo_tersedia || 0)) {
      setNotifMessage("Saldo tidak cukup");
      setNotifType("error");
      setShowNotif(true);
      return;
    }

    setSubmitting(true);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/pencairan`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ jumlah: Number(jumlah) }),
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      // Refresh data
      const withdrawRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/mitra/pencairan`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );
      const withdrawResult = await withdrawRes.json();
      if (withdrawRes.ok) {
        setWithdrawalData(withdrawResult);
      }

      setJumlah("");
      setNotifMessage(
        "Pencairan berhasil diajukan! Menunggu persetujuan admin.",
      );
      setNotifType("success");
      setShowNotif(true);
    } catch (err: any) {
      setNotifMessage(err.message || "Gagal mengajukan pencairan");
      setNotifType("error");
      setShowNotif(true);
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
      case "diproses":
        return "bg-blue-50 border-blue-200 text-blue-800";
      case "berhasil":
        return "bg-green-50 border-green-200 text-green-800";
      case "ditolak":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-gray-50 border-gray-200 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock size={16} className="text-yellow-600" />;
      case "diproses":
        return <AlertCircle size={16} className="text-blue-600" />;
      case "berhasil":
        return <CheckCircle size={16} className="text-green-600" />;
      case "ditolak":
        return <XCircle size={16} className="text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Menunggu",
      diproses: "Diproses",
      berhasil: "Berhasil",
      ditolak: "Ditolak",
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className={`min-h-screen bg-gray-50 ${PoppinsRegular.className}`}>
        <ProtectedMitra>
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
              <p className="mt-4 text-gray-600">Memuat data...</p>
            </div>
          </div>
        </ProtectedMitra>
      </div>
    );
  }

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

          {/* NOTIFICATION */}
          {showNotif && (
            <div
              className={`mb-4 p-4 rounded-xl border ${
                notifType === "success"
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-red-50 border-red-200 text-red-800"
              }`}
            >
              {notifMessage}
            </div>
          )}

          {/* HEADER */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6">
            <h1
              className={`text-2xl font-bold text-gray-800 ${PoppinsBold.className}`}
            >
              Pencairan Dana
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Tarik dana pendapatan Anda dengan aman dan mudah
            </p>
          </div>

          {/* BALANCE CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Saldo Tersedia</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {(withdrawalData?.saldo_tersedia || 0).toLocaleString("id-ID")}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Menunggu Persetujuan</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {(withdrawalData?.total_pending || 0).toLocaleString("id-ID")}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Dicairkan</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {(withdrawalData?.total_dicairkan || 0).toLocaleString("id-ID")}
              </h3>
            </div>
          </div>

          {/* CONTENT TABS */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {/* TAB BUTTONS */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab("form")}
                className={`flex-1 px-6 py-4 font-medium transition-all ${
                  activeTab === "form"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                <Send className="inline mr-2" size={18} />
                Ajukan Pencairan
              </button>
              <button
                onClick={() => setActiveTab("history")}
                className={`flex-1 px-6 py-4 font-medium transition-all ${
                  activeTab === "history"
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-white text-gray-600 hover:bg-gray-50"
                }`}
              >
                Riwayat Pencairan
              </button>
            </div>

            {/* TAB CONTENT */}
            <div className="p-6">
              {activeTab === "form" ? (
                <div>
                  {/* BANK INFO */}
                  <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                    <h3 className="font-semibold text-blue-900 mb-3">
                      Informasi Rekening Bank
                    </h3>
                    <div className="space-y-2 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Nama Usaha:</span>{" "}
                        {mitraData?.nama_usaha || "-"}
                      </p>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="text-gray-600 text-xs">Bank</p>
                          <p className="font-medium text-gray-900">
                            {mitraData?.bank_mitra || "Belum diatur"}
                          </p>
                        </div>
                        {mitraData?.bank_mitra && (
                          <button
                            onClick={() =>
                              copyToClipboard(mitraData.bank_mitra || "")
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Copy size={16} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center justify-between bg-white p-3 rounded-lg">
                        <div>
                          <p className="text-gray-600 text-xs">
                            Nomor Rekening
                          </p>
                          <p className="font-medium text-gray-900">
                            {mitraData?.no_rekening_mitra || "Belum diatur"}
                          </p>
                        </div>
                        {mitraData?.no_rekening_mitra && (
                          <button
                            onClick={() =>
                              copyToClipboard(mitraData.no_rekening_mitra || "")
                            }
                            className="p-2 hover:bg-gray-100 rounded-lg transition"
                          >
                            <Copy size={16} className="text-gray-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {!mitraData?.bank_mitra || !mitraData?.no_rekening_mitra ? (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
                      <p className="font-medium mb-2">
                        ⚠️ Data Rekening Belum Lengkap
                      </p>
                      <p className="text-sm">
                        Silakan update data mitra Anda terlebih dahulu sebelum
                        mengajukan pencairan.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleRequestWithdrawal}>
                      {/* AMOUNT INPUT */}
                      <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Jumlah Pencairan (Rp)
                        </label>
                        <input
                          type="number"
                          value={jumlah}
                          onChange={(e) => setJumlah(e.target.value)}
                          min="0"
                          step="10000"
                          placeholder="Masukkan jumlah"
                          disabled={submitting}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent disabled:bg-gray-100"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Saldo tersedia: Rp{" "}
                          {(withdrawalData?.saldo_tersedia || 0).toLocaleString(
                            "id-ID",
                          )}
                        </p>
                      </div>

                      {/* FEE BREAKDOWN */}
                      {jumlah && !isNaN(Number(jumlah)) && (
                        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-xl">
                          <h4 className="font-medium text-gray-900 mb-3">
                            Rincian Biaya
                          </h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">
                                Jumlah Pengajuan
                              </span>
                              <span className="font-medium">
                                Rp {Number(jumlah).toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="flex justify-between text-red-600">
                              <span>Biaya Admin (5%)</span>
                              <span className="font-medium">
                                - Rp {estimatedFee.toLocaleString("id-ID")}
                              </span>
                            </div>
                            <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-green-600">
                              <span>Jumlah Diterima</span>
                              <span>
                                Rp {estimatedNet.toLocaleString("id-ID")}
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* SUBMIT BUTTON */}
                      <button
                        type="submit"
                        disabled={
                          submitting ||
                          !jumlah ||
                          !mitraData?.bank_mitra ||
                          !mitraData?.no_rekening_mitra
                        }
                        className="w-full py-3 bg-[var(--color-primary)] hover:bg-[var(--color-hover)] text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {submitting ? "Memproses..." : "Ajukan Pencairan"}
                      </button>

                      <p className="text-xs text-gray-500 mt-3 text-center">
                        ℹ️ Pencairan akan diproses oleh admin dalam waktu 1-2
                        hari kerja
                      </p>
                    </form>
                  )}
                </div>
              ) : (
                <div>
                  {/* HISTORY TABLE */}
                  {withdrawalData?.data && withdrawalData.data.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 bg-gray-50">
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Tanggal
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Jumlah
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Biaya Admin
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Diterima
                            </th>
                            <th className="text-left px-4 py-3 font-semibold text-gray-700">
                              Status
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {withdrawalData.data.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-gray-200 hover:bg-gray-50"
                            >
                              <td className="px-4 py-3 text-gray-900">
                                {new Date(item.created_at).toLocaleDateString(
                                  "id-ID",
                                )}
                              </td>
                              <td className="px-4 py-3 font-medium text-gray-900">
                                Rp {item.jumlah.toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 text-red-600">
                                Rp{" "}
                                {(
                                  item.biaya_admin_pencairan ||
                                  item.estimated_withdrawal_fee ||
                                  0
                                ).toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3 font-medium text-green-600">
                                Rp{" "}
                                {(
                                  item.jumlah_diterima ||
                                  item.estimated_net_amount ||
                                  0
                                ).toLocaleString("id-ID")}
                              </td>
                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                    item.status,
                                  )}`}
                                >
                                  {getStatusIcon(item.status)}
                                  {getStatusLabel(item.status)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <WalletMinimal
                        size={40}
                        className="mx-auto mb-3 opacity-30"
                      />
                      <p>Belum ada riwayat pencairan</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </main>
      </ProtectedMitra>
    </div>
  );
}
