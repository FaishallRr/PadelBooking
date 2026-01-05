"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { useAuthStore } from "@/store/authStore";
import { useWalletStore } from "@/store/walletStore";

import FilterSidebar, {
  FilterValues,
} from "@/components/filterSidebarComponents";
import LapanganComponents from "@/components/lapanganComponents";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";

import localFont from "next/font/local";

const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });
const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });

export default function Home() {
  const router = useRouter();
  const { token, role } = useAuthStore();
  const { fetchWallet } = useWalletStore();

  const [filters, setFilters] = useState<FilterValues>({
    price: "Semua Harga",
    rating: "Semua Rating",
    type: "Semua Jenis",
    facilities: [],
  });

  // =====================================================
  // 🔁 AUTO REDIRECT BERDASARKAN ROLE
  // =====================================================
  useEffect(() => {
    if (!token) return;

    if (role === "mitra") {
      router.replace("/mitra/dashboard");
      return;
    }

    if (role === "admin") {
      router.replace("/admin/dashboard");
      return;
    }
  }, [token, role, router]);

  // =====================================================
  // 💰 FETCH WALLET (KHUSUS USER)
  // =====================================================
  useEffect(() => {
    if (!token || role !== "user") return;

    fetchWallet();
  }, [token, role, fetchWallet]);

  return (
    <div className="w-full min-h-screen bg-gray-50 overflow-hidden">
      <Navbar />

      <div className="max-w-[1200px] w-full mx-auto pt-10 flex gap-10 px-4">
        {/* Sidebar */}
        <div className="mt-2">
          <FilterSidebar filters={filters} onFilterChange={setFilters} />
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col">
          <div className="ml-8">
            <p
              className={`text-4xl font-bold text-gray-700 ${PoppinsBold.className}`}
            >
              Temukan Lapangan Padel Impian Anda
            </p>

            <p
              className={`text-[16px] text-gray-500 font-medium mt-[11px] ${PoppinsRegular.className}`}
            >
              Cari berdasarkan nama lapangan atau kota, lalu persempit dengan
              filter.
            </p>
          </div>

          <div className="-mt-1">
            <LapanganComponents filters={filters} />
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
