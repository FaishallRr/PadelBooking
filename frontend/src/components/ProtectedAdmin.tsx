"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import localFont from "next/font/local";

const PoppinsRegular = localFont({
  src: "../fonts/Poppins-Regular.ttf",
});

export default function ProtectedAdmin({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  // Ambil data auth dari Zustand
  const { token, role } = useAuthStore();

  // Hindari flicker / blank
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // Belum login → ke login
    if (!token) {
      router.replace("/auth/login");
      return;
    }

    // Bukan admin → tetap lempar ke login (sesuai request)
    if (role !== "admin") {
      router.replace("/auth/login");
      return;
    }

    setChecking(false);
  }, [token, role, router]);

  if (checking) {
    return (
      <div
        className={`min-h-screen flex flex-col justify-center items-center text-center text-gray-600 ${PoppinsRegular.className}`}
      >
        Memeriksa hak akses admin...
      </div>
    );
  }

  return <>{children}</>;
}
