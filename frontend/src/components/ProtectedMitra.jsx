"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import localFont from "next/font/local";

const PoppinsRegular = localFont({
  src: "../fonts/Poppins-Regular.ttf",
});

export default function ProtectedMitra({ children }) {
  const router = useRouter();

  // Ambil data auth dari Zustand
  const { token, role } = useAuthStore();

  // Hindari tampilan blank sambil cek auth
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Jika token belum ada → redirect login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Jika role bukan mitra → redirect homepage
    if (role !== "mitra") {
      router.replace("/");
      return;
    }

    setChecking(false); // selesai pengecekan
  }, [token, role, router]);

  // Tampilkan loading sementara pengecekan store
  if (checking) {
    return (
      <div
        className={`w-full py-10 flex flex-col justify-center items-center text-center text-gray-600 ${PoppinsRegular.className}`}
      >
        Memeriksa hak akses mitra...
      </div>
    );
  }

  return <>{children}</>;
}
