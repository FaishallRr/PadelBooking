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
  ChevronRight,
  Search,
  Filter,
  Download,
} from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

type Transaction = {
  id: number;
  order_id: number;
  midtrans_order_id: string;
  user: {
    id: number;
    nama: string;
    email: string;
    no_hp: string;
  };
  lapangan: {
    id: number;
    nama: string;
    lokasi: string;
  };
  order: {
    id: number;
    tanggal: string;
    jam_mulai: string;
    jam_selesai: string;
    status: string;
  };
  total_harga: number;
  biaya_admin: number;
  biaya_mitra: number;
  status_pembayaran: "pending" | "berhasil" | "gagal";
  payment_type: string;
  created_at: string;
  net_amount: number;
};

type TransactionSummary = {
  data: Transaction[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    total_transactions: number;
    total_revenue: number;
    total_admin_fee: number;
    total_mitra_earning: number;
  };
};

export default function AdminTransaksiPage() {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [summary, setSummary] = useState({
    total_transactions: 0,
    total_revenue: 0,
    total_admin_fee: 0,
    total_mitra_earning: 0,
  });
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Selected transaction for detail
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

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

  const fetchTransactions = async (page = 1) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const params = new URLSearchParams();
      params.append("page", page.toString());
      params.append("limit", "20");
      if (statusFilter) params.append("status", statusFilter);
      if (startDate) params.append("startDate", startDate);
      if (endDate) params.append("endDate", endDate);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions?${params}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );

      const result: TransactionSummary = await res.json();
      if (res.ok) {
        setTransactions(result.data);
        setPagination(result.pagination);
        setSummary(result.summary);
      }
    } catch (err) {
      console.error("Gagal fetch transaksi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchTransactions(1);
  }, [statusFilter, startDate, endDate]);

  const handleFetchDetail = async (id: number) => {
    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/transactions/${id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          cache: "no-store",
        },
      );

      const result = await res.json();
      if (res.ok) {
        setSelectedTransaction(result.data);
      }
    } catch (err) {
      console.error("Gagal fetch detail transaksi:", err);
    }
  };

  const filteredTransactions = transactions.filter((t) =>
    searchTerm === ""
      ? true
      : t.user.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.lapangan.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.midtrans_order_id.includes(searchTerm),
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "berhasil":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "gagal":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      berhasil: "Berhasil",
      pending: "Menunggu",
      gagal: "Gagal",
    };
    return labels[status] || status;
  };

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
              Manajemen Transaksi
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Lihat dan kelola semua transaksi pembayaran
            </p>
          </div>

          {/* SUMMARY CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-400 to-blue-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Transaksi</p>
              <h3 className="text-2xl font-bold mt-2">
                {summary.total_transactions}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-green-400 to-green-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Total Revenue</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {summary.total_revenue
                  .toLocaleString("id-ID")
                  .replace(/,/g, ".")}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Biaya Admin</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {summary.total_admin_fee
                  .toLocaleString("id-ID")
                  .replace(/,/g, ".")}
              </h3>
            </div>

            <div className="bg-gradient-to-br from-purple-400 to-purple-600 rounded-2xl p-6 text-white shadow-lg">
              <p className="text-sm opacity-90">Earning Mitra</p>
              <h3 className="text-2xl font-bold mt-2">
                Rp{" "}
                {summary.total_mitra_earning
                  .toLocaleString("id-ID")
                  .replace(/,/g, ".")}
              </h3>
            </div>
          </div>

          {/* FILTERS */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter size={20} className="text-gray-600" />
              <h3
                className={`text-lg font-semibold text-gray-800 ${PoppinsBold.className}`}
              >
                Filter Transaksi
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pencarian
                </label>
                <div className="relative">
                  <Search
                    size={18}
                    className="absolute left-3 top-3 text-gray-400"
                  />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nama, lapangan, atau ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status Pembayaran
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                >
                  <option value="">Semua Status</option>
                  <option value="berhasil">Berhasil</option>
                  <option value="pending">Menunggu</option>
                  <option value="gagal">Gagal</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Mulai
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Akhir
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* TRANSACTIONS TABLE */}
          <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex items-center justify-center h-48">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)]"></div>
                  <p className="mt-4 text-gray-600">Memuat transaksi...</p>
                </div>
              </div>
            ) : filteredTransactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50">
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        ID Transaksi
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        Pengguna
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        Lapangan
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        Total
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        Admin Fee
                      </th>
                      <th className="text-left px-6 py-4 font-semibold text-gray-700">
                        Status
                      </th>
                      <th className="text-center px-6 py-4 font-semibold text-gray-700">
                        Aksi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        className="border-b border-gray-200 hover:bg-gray-50 transition"
                      >
                        <td className="px-6 py-4 font-medium text-gray-900">
                          #{transaction.id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900">
                            {transaction.user.nama}
                          </div>
                          <div className="text-xs text-gray-500">
                            {transaction.user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-900">
                          {transaction.lapangan.nama}
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          Rp {transaction.total_harga.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4 text-yellow-600 font-medium">
                          Rp {transaction.biaya_admin.toLocaleString("id-ID")}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                              transaction.status_pembayaran,
                            )}`}
                          >
                            {getStatusLabel(transaction.status_pembayaran)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleFetchDetail(transaction.id)}
                            className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-hover)] transition"
                          >
                            <ChevronRight size={20} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <WalletMinimal size={40} className="mx-auto mb-3 opacity-30" />
                <p>Tidak ada transaksi ditemukan</p>
              </div>
            )}
          </div>

          {/* PAGINATION */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  pagination.page > 1 && fetchTransactions(pagination.page - 1)
                }
                disabled={pagination.page === 1}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              {Array.from({ length: Math.min(5, pagination.totalPages) }).map(
                (_, i) => {
                  const pageNum =
                    pagination.page <= 3 ? i + 1 : pagination.page - 2 + i;
                  return (
                    pageNum <= pagination.totalPages && (
                      <button
                        key={pageNum}
                        onClick={() => fetchTransactions(pageNum)}
                        className={`px-4 py-2 rounded-lg border ${
                          pageNum === pagination.page
                            ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                            : "border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  );
                },
              )}
              <button
                onClick={() =>
                  pagination.page < pagination.totalPages &&
                  fetchTransactions(pagination.page + 1)
                }
                disabled={pagination.page === pagination.totalPages}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}

          {/* DETAIL MODAL */}
          {selectedTransaction && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                  <h2 className={`text-xl font-bold ${PoppinsBold.className}`}>
                    Detail Transaksi #{selectedTransaction.id}
                  </h2>
                  <button
                    onClick={() => setSelectedTransaction(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition"
                  >
                    <X size={20} />
                  </button>
                </div>

                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Informasi Pengguna
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nama</p>
                        <p className="font-medium">
                          {selectedTransaction.user.nama}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Email</p>
                        <p className="font-medium">
                          {selectedTransaction.user.email}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Lapangan Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Informasi Lapangan
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Nama Lapangan</p>
                        <p className="font-medium">
                          {selectedTransaction.lapangan.nama}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Lokasi</p>
                        <p className="font-medium">
                          {selectedTransaction.lapangan.lokasi}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Booking Info */}
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Informasi Booking
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Tanggal</p>
                        <p className="font-medium">
                          {new Date(
                            selectedTransaction.order.tanggal,
                          ).toLocaleDateString("id-ID")}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Jam</p>
                        <p className="font-medium">
                          {selectedTransaction.order.jam_mulai} -{" "}
                          {selectedTransaction.order.jam_selesai}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Payment Details */}
                  <div className="border-t border-gray-200 pt-4">
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Detail Pembayaran
                    </h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Harga</span>
                        <span className="font-medium">
                          Rp{" "}
                          {selectedTransaction.total_harga.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-yellow-600">
                        <span>Biaya Admin (5%)</span>
                        <span className="font-medium">
                          - Rp{" "}
                          {selectedTransaction.biaya_admin.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between text-green-600 border-t border-gray-200 pt-2">
                        <span className="font-medium">Earning Mitra</span>
                        <span className="font-bold text-lg">
                          Rp{" "}
                          {selectedTransaction.biaya_mitra.toLocaleString(
                            "id-ID",
                          )}
                        </span>
                      </div>
                      <div className="mt-3 p-3 bg-gray-100 rounded-lg flex justify-between">
                        <span className="text-gray-700">Status</span>
                        <span
                          className={`font-semibold ${getStatusBadge(
                            selectedTransaction.status_pembayaran,
                          )}`}
                        >
                          {getStatusLabel(
                            selectedTransaction.status_pembayaran,
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </ProtectedAdmin>
    </div>
  );
}
