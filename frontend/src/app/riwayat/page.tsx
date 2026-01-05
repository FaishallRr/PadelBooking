"use client";

import React, { useEffect, useState } from "react";
import Cookies from "js-cookie";
import {
  CheckCircle,
  Clock,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { motion } from "framer-motion";
import localFont from "next/font/local";
import Navbar from "@/components/navbar";
import dayjs from "dayjs";

const PoppinsRegular = localFont({ src: "../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../fonts/Poppins-Bold.ttf" });

type Status = "BERHASIL" | "PENDING" | "GAGAL";

type WalletHistory = {
  id: number; // ID wallet / refund
  lapanganNama: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  jumlah: number;
  status: Status;
  orderId?: number;
  refundId?: number; // untuk cancel refund
  refundStatus?: "pending" | "approved" | "rejected" | "selesai";
};

const statusConfig: Record<
  Status,
  { label: string; color: string; icon: React.ReactNode }
> = {
  BERHASIL: {
    label: "Berhasil",
    color: "bg-green-100 text-green-700",
    icon: <CheckCircle size={14} />,
  },
  PENDING: {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-700",
    icon: <Clock size={14} />,
  },
  GAGAL: {
    label: "Gagal",
    color: "bg-red-100 text-red-700",
    icon: <XCircle size={14} />,
  },
};

export default function WalletTab() {
  const [saldo, setSaldo] = useState(0);
  const [history, setHistory] = useState<WalletHistory[]>([]);
  const [filterStatus, setFilterStatus] = useState<"SEMUA" | Status>("SEMUA");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [refundLoadingIds, setRefundLoadingIds] = useState<number[]>([]);
  const [refundErrors, setRefundErrors] = useState<Record<number, string>>({});
  const [refundReasons, setRefundReasons] = useState<Record<number, string>>(
    {}
  );
  const [refundSuccessIds, setRefundSuccessIds] = useState<number[]>([]);

  // ===== MODAL & NOTIF =====
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedRefundId, setSelectedRefundId] = useState<number | null>(null);

  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"success" | "error">("success");

  useEffect(() => {
    if (showNotif) {
      const timer = setTimeout(() => setShowNotif(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [showNotif]);

  const fetchWallet = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Silakan login terlebih dahulu");

      // Wallet
      const resWallet = await fetch("http://localhost:5000/api/wallet/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const walletData = await resWallet.json();
      setSaldo(Number(walletData.saldo) || 0);

      const walletHistory: WalletHistory[] = (walletData.history || []).map(
        (h: any) => ({
          id: h.id,
          lapanganNama: h.order?.lapangan?.nama || "Lapangan Tidak Diketahui",
          tanggal: h.order?.tanggal || "",
          jamMulai: h.order?.jam_mulai || "-",
          jamSelesai: h.order?.jam_selesai || "-",
          jumlah: Number(h.jumlah),
          status: (h.status as Status) || "BERHASIL",
          orderId: h.order?.id,
        })
      );

      // Refund
      const resRefund = await fetch("http://localhost:5000/api/refund/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const refundData = await resRefund.json();
      const refundHistory: WalletHistory[] = (refundData.history || []).map(
        (r: any) => ({
          id: r.id,
          lapanganNama:
            r.order?.lapangan?.nama ||
            r.lapanganNama ||
            "Lapangan Tidak Diketahui",
          tanggal: r.order?.tanggal || r.tanggal || "",
          jamMulai: r.order?.jam_mulai || r.jamMulai || "-",
          jamSelesai: r.order?.jam_selesai || r.jamSelesai || "-",
          jumlah: -Number(r.jumlah),
          status:
            r.status.toLowerCase() === "pending"
              ? "PENDING"
              : r.status.toLowerCase() === "approved" ||
                r.status.toLowerCase() === "selesai"
              ? "BERHASIL"
              : "GAGAL",
          orderId: r.order_id,
          refundId: r.id,
          refundStatus: r.status.toLowerCase(),
        })
      );

      setHistory(
        [...walletHistory, ...refundHistory].sort(
          (a, b) =>
            new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        )
      );
    } catch (err: any) {
      setError(err.message || "Terjadi kesalahan");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallet();
  }, []);

  const filteredHistory =
    filterStatus === "SEMUA"
      ? history
      : history.filter((h) => h.status === filterStatus);

  const canRefund = (tanggal: string) => {
    const today = new Date();
    const playDate = new Date(tanggal);
    const diffDays = Math.ceil(
      (playDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays >= 3;
  };

  const handleCancelRefund = async (refundId: number) => {
    setRefundLoadingIds((prev) => [...prev, refundId]);
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Silakan login terlebih dahulu");

      const res = await fetch("http://localhost:5000/api/refund/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ refund_id: refundId }),
      });
      if (!res.ok) throw new Error("Gagal membatalkan refund");

      fetchWallet();

      setNotifType("success");
      setNotifMessage("Refund berhasil dibatalkan");
      setShowNotif(true);
    } catch (err: any) {
      setNotifType("error");
      setNotifMessage(err.message || "Terjadi kesalahan");
      setShowNotif(true);
    } finally {
      setRefundLoadingIds((prev) => prev.filter((id) => id !== refundId));
    }
  };

  const handleRefund = async (orderId?: number) => {
    if (!orderId) return;
    const reason = refundReasons[orderId] || "";
    if (!reason) {
      setRefundErrors((prev) => ({
        ...prev,
        [orderId]: "Silakan isi alasan refund",
      }));
      return;
    }

    setRefundLoadingIds((prev) => [...prev, orderId]);
    setRefundErrors((prev) => ({ ...prev, [orderId]: "" }));
    setRefundSuccessIds((prev) => prev.filter((id) => id !== orderId));

    setHistory((prev) =>
      prev.map((h) =>
        h.orderId === orderId
          ? { ...h, refundStatus: "pending", status: "PENDING" }
          : h
      )
    );

    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Silakan login terlebih dahulu");

      const res = await fetch("http://localhost:5000/api/refund", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId, alasan: reason }),
      });
      if (!res.ok) throw new Error("Gagal mengajukan refund");

      setRefundSuccessIds((prev) => [...prev, orderId]);
      setRefundReasons((prev) => ({ ...prev, [orderId]: "" }));

      setNotifType("success");
      setNotifMessage("Pengajuan refund berhasil dikirim ke admin");
      setShowNotif(true);
    } catch (err: any) {
      setRefundErrors((prev) => ({
        ...prev,
        [orderId]: err.message || "Terjadi kesalahan",
      }));
      setHistory((prev) =>
        prev.map((h) =>
          h.orderId === orderId
            ? { ...h, refundStatus: undefined, status: h.status }
            : h
        )
      );

      setNotifType("error");
      setNotifMessage(err.message || "Terjadi kesalahan");
      setShowNotif(true);
    } finally {
      setRefundLoadingIds((prev) => prev.filter((id) => id !== orderId));
    }
  };

  return (
    <div className={`min-h-screen bg-gray-50 ${PoppinsRegular.className}`}>
      <Navbar />
      <div className="max-w-4xl mx-auto p-6 mb-10">
        <h2
          className={`text-2xl font-bold text-gray-800 ${PoppinsBold.className}`}
        >
          Wallet
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Kelola saldo & riwayat transaksi booking
        </p>

        <div
          className="relative overflow-hidden rounded-3xl p-6 mb-10 text-white shadow-lg cursor-default mt-5"
          style={{
            background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
          }}
        >
          <p className="text-sm opacity-90">Saldo Aktif</p>
          <p className="text-3xl font-bold tracking-tight mt-1">
            Rp {saldo.toLocaleString("id-ID")}
          </p>
          <p className="text-xs opacity-80 mt-2">
            Digunakan untuk pembayaran booking lapangan
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {["SEMUA", "BERHASIL", "PENDING", "GAGAL"].map((s) => {
            const active = filterStatus === s;
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s as any)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  active
                    ? "text-white border-transparent shadow-sm"
                    : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                }`}
                style={active ? { backgroundColor: "#22c55e" } : {}}
              >
                {s === "SEMUA"
                  ? "Semua"
                  : statusConfig[s as Status]?.label ?? s}
              </button>
            );
          })}
        </div>

        {/* List */}
        {!loading && !error && filteredHistory.length > 0 && (
          <ul className="space-y-4">
            {filteredHistory.map((h) => {
              const isExpanded = expandedId === h.id;
              const refundDisabled =
                h.refundStatus === "approved" || h.refundStatus === "selesai";

              return (
                <li
                  key={h.refundStatus ? `refund-${h.id}` : `wallet-${h.id}`}
                  className="relative bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition"
                >
                  <div
                    className="flex justify-between items-center cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : h.id)}
                  >
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide">
                        Lapangan
                      </p>
                      <h4 className="font-semibold text-gray-800">
                        {h.lapanganNama}
                      </h4>
                      {h.tanggal && (
                        <p className="text-sm text-gray-500">
                          {dayjs(h.tanggal).format("DD MMM YYYY")} ·{" "}
                          {h.jamMulai} - {h.jamSelesai}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full ${
                          statusConfig[h.status]?.color ?? ""
                        }`}
                      >
                        {statusConfig[h.status]?.icon ?? null}{" "}
                        {statusConfig[h.status]?.label ?? h.status}
                      </span>
                      {isExpanded ? <ChevronUp /> : <ChevronDown />}
                    </div>
                  </div>

                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{
                      height: isExpanded ? "auto" : 0,
                      opacity: isExpanded ? 1 : 0,
                    }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 border-t border-gray-100 pt-4 flex items-center justify-between">
                      <p className="text-sm text-gray-400">Nominal</p>
                      <p
                        className={`text-lg font-bold ${
                          h.jumlah < 0 ? "text-red-600" : "text-green-600"
                        }`}
                      >
                        {h.jumlah < 0 ? "-" : "+"} Rp{" "}
                        {Math.abs(h.jumlah).toLocaleString("id-ID")}
                      </p>
                    </div>

                    {/* Refund */}
                    <div className="mt-4">
                      {canRefund(h.tanggal) &&
                      !refundDisabled &&
                      !h.refundStatus ? (
                        <div className="mt-3">
                          <p className="text-sm text-gray-500 mb-2">
                            Ajukan Refund
                          </p>
                          <textarea
                            className="w-full border border-gray-200 rounded-lg p-2 text-sm resize-none"
                            rows={3}
                            placeholder="Tuliskan alasan refund..."
                            value={refundReasons[h.orderId || 0] || ""}
                            onChange={(e) =>
                              setRefundReasons({
                                ...refundReasons,
                                [h.orderId || 0]: e.target.value,
                              })
                            }
                          />
                          {refundErrors[h.orderId || 0] && (
                            <p className="text-red-500 text-sm mt-1">
                              {refundErrors[h.orderId || 0]}
                            </p>
                          )}
                          {refundSuccessIds.includes(h.orderId || 0) && (
                            <p className="text-green-500 text-sm mt-1">
                              Pengajuan refund berhasil dikirim ke admin
                            </p>
                          )}
                          <button
                            onClick={() => handleRefund(h.orderId)}
                            disabled={refundLoadingIds.includes(h.orderId || 0)}
                            className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-semibold transition disabled:opacity-60"
                          >
                            {refundLoadingIds.includes(h.orderId || 0)
                              ? "Mengirim..."
                              : "Ajukan Refund"}
                          </button>
                        </div>
                      ) : h.refundStatus === "pending" ? (
                        <button
                          onClick={() => {
                            if (h.refundId) setSelectedRefundId(h.refundId);
                            setShowConfirm(true);
                          }}
                          className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-semibold transition"
                        >
                          Batalkan Pengajuan Refund
                        </button>
                      ) : (
                        <p className="text-sm text-gray-400 mt-2">
                          {h.refundStatus === "approved" ||
                          h.refundStatus === "selesai"
                            ? "Refund sudah selesai"
                            : "Refund hanya bisa diajukan H-3 sebelum bermain"}
                        </p>
                      )}
                    </div>
                  </motion.div>
                </li>
              );
            })}
          </ul>
        )}

        {/* MODAL KONFIRMASI */}
        {showConfirm && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
              onClick={() => setShowConfirm(false)}
            />
            <div className="relative bg-white rounded-2xl p-6 w-[90%] max-w-md shadow-xl animate-fadeIn">
              <h3 className="text-lg font-semibold text-gray-800 text-center">
                Konfirmasi Batalkan Refund
              </h3>
              <p className="text-gray-500 text-center mt-2">
                Apakah kamu yakin ingin membatalkan pengajuan refund ini?
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
                    if (selectedRefundId) handleCancelRefund(selectedRefundId);
                    setShowConfirm(false);
                  }}
                  className="flex-1 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 transition"
                >
                  Ya, Batalkan
                </button>
              </div>
            </div>
          </div>
        )}

        {/* NOTIF TOAST */}
        {showNotif && (
          <div
            className={`fixed top-6 right-6 z-[2000] px-5 py-3 rounded-xl text-white shadow-lg animate-fadeIn ${
              notifType === "success" ? "bg-green-500" : "bg-red-500"
            }`}
          >
            {notifMessage}
          </div>
        )}
      </div>
    </div>
  );
}
