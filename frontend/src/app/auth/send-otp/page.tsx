"use client";

import { useState } from "react";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import localFont from "next/font/local";

// Load local fonts
const PoppinsRegular = localFont({
  src: "../../../fonts/Poppins-Regular.ttf",
});
const PoppinsBold = localFont({
  src: "../../../fonts/Poppins-Bold.ttf",
});

// 🔔 Notification Modal
function Notification({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]"></div>

      <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            style={{ background: type === "success" ? "#2ecc71" : "#e74c3c" }}
          >
            {type === "success" ? "✓" : "!"}
          </div>

          <p className="text-gray-600 text-lg font-semibold">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default function SendOtpPage() {
  const router = useRouter();
  const params = useSearchParams();

  // 📌 Ambil role dari query (default user)
  const role = params.get("role") || "user";

  // 📌 Step dynamic
  const steps =
    role === "mitra"
      ? ["Email", "Verifikasi", "Data Diri"]
      : ["Email", "Verifikasi", "Data Diri"];

  const [email, setEmail] = useState("");
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const showNotif = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 2500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await axios.post("http://localhost:5000/auth/send-otp", {
        email,
        role, // ⭐ tetap aman, logic backend tidak berubah
      });

      showNotif("success", "OTP berhasil dikirim!");

      setTimeout(() => {
        router.push(`/auth/verify-otp?email=${email}&role=${role}`);
      }, 1200);
    } catch (error) {
      if (error instanceof AxiosError) {
        showNotif(
          "error",
          error.response?.data?.message || "Gagal mengirim OTP"
        );
      } else {
        showNotif("error", "Terjadi kesalahan");
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 ${PoppinsRegular.className}`}
    >
      {notif && <Notification type={notif.type} message={notif.message} />}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md p-10">
        {/* Stepper Dynamic */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((label, index) => {
            const active = index === 0;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      active ? "text-white" : "text-gray-500"
                    }`}
                    style={{
                      background: active ? "var(--color-primary)" : "#e5e7eb",
                    }}
                  >
                    {index + 1}
                  </div>

                  <p
                    className={`text-sm mt-1 font-medium ${
                      active ? "text-[var(--color-primary)]" : "text-gray-500"
                    }`}
                  >
                    {label}
                  </p>
                </div>

                {index < steps.length - 1 && (
                  <div className="w-8 h-0.5 bg-gray-300"></div>
                )}
              </div>
            );
          })}
        </div>

        <h2
          className={`text-2xl font-bold text-center text-gray-700 mb-3 ${PoppinsBold.className}`}
        >
          Buat Akun {role === "mitra" ? "Mitra" : "Pengguna"}
        </h2>

        <p className="text-center text-gray-500 mb-5">
          Kami akan mengirimkan kode verifikasi ke email ini.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-medium text-gray-700 text-[15px] ml-1">
              Email
            </label>
            <input
              type="email"
              className={`w-full pl-4 p-2 rounded-xl border border-gray-300 text-gray-700 
                focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                transition-all duration-300 text-[15px] font-medium mt-2`}
              placeholder="Masukkan alamat email Anda"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <button
            type="submit"
            className="w-full text-white font-semibold py-2.5 rounded-xl transition-all duration-300"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-primary)")
            }
          >
            Lanjutkan
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Sudah punya akun?{" "}
          <span
            className="font-medium cursor-pointer"
            style={{ color: "var(--color-primary)" }}
            onClick={() => router.push("/auth/login")}
          >
            Masuk
          </span>
        </p>
      </div>
    </div>
  );
}
