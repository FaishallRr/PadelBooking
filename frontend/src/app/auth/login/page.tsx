"use client";

import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import localFont from "next/font/local";
import { useAuthStore } from "@/store/authStore";

// ======================= FONTS =======================
const PoppinsRegular = localFont({
  src: "../../../fonts/Poppins-Regular.ttf",
  variable: "--font-poppins",
});

const PoppinsBold = localFont({
  src: "../../../fonts/Poppins-Bold.ttf",
  variable: "--font-poppins",
});

// ======================= NOTIFICATION =======================
function Notification({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />

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
// ================================================================

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNotif, setShowNotif] = useState(false);

  const togglePassword = () => setShowPassword(!showPassword);

  // ====================== VALIDASI INPUT ======================
  const validateInput = () => {
    if (!email.trim() && !password.trim()) {
      return "Harap isi email dan password";
    }
    if (!email.trim()) return "Harap isi email";
    if (!password.trim()) return "Harap isi password";
    return null;
  };
  // =============================================================

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // CEK INPUT SEBELUM SUBMIT KE BACKEND
    const validationError = validateInput();
    if (validationError) {
      setMessage(validationError);
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2500);
      return;
    }

    try {
      const res = await axios.post("http://localhost:5000/auth/login", {
        email,
        password,
      });

      // SIMPAN TOKEN + ROLE DI COOKIE
      Cookies.set("token", res.data.token, { expires: 7 });
      Cookies.set("role", res.data.role, { expires: 7 });
      Cookies.set("user_id", String(res.data.user_id), { expires: 7 });

      // SIMPAN DI ZUSTAND
      setAuth(res.data.token, res.data.role);

      // REDIRECT PER ROLE
      if (res.data.role === "mitra") {
        if (!res.data.isMitraCompleted) {
          router.push("/auth/mitra/data-mitra");
        } else {
          router.push("/mitra/dashboard");
        }
        return;
      }

      if (res.data.role === "user") {
        router.push("/");
        return;
      }

      if (res.data.role === "admin") {
        router.push("/admin/dashboard");
        return;
      }
    } catch (error: any) {
      const errMsg =
        error?.response?.data?.message || "Login gagal. Periksa data Anda.";

      setMessage(errMsg);
      setShowNotif(true);

      setTimeout(() => setShowNotif(false), 2500);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 ${PoppinsRegular.className}`}
    >
      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md p-10">
        <h2
          className={`text-2xl text-center text-gray-700 mb-2 font-bold ${PoppinsBold.className}`}
        >
          Selamat Datang
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Masuk untuk melanjutkan ke akun Anda.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="font-medium text-gray-700 text-[15px]">
              Email
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email Anda"
              className="w-full pl-4 p-2 rounded-xl border border-gray-300 mt-2 text-[15px] text-gray-700  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                transition-all duration-300"
            />
          </div>

          <div>
            <label className="font-medium text-gray-700 text-[15px]">
              Password
            </label>
            <div className="relative mt-2">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                className="w-full pl-4 pr-12 p-2 rounded-xl border border-gray-300 text-[15px] text-gray-700  focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]
                transition-all duration-300"
              />
              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-lg text-gray-400"
                onClick={togglePassword}
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full text-white font-semibold py-2.5 rounded-xl"
            style={{ background: "var(--color-primary)" }}
          >
            Masuk
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Belum punya akun?{" "}
          <span
            className="font-medium cursor-pointer"
            style={{ color: "var(--color-primary)" }}
            onClick={() => router.push("/auth/send-otp")}
          >
            Daftar Sekarang
          </span>
        </p>
      </div>

      {showNotif && <Notification type="error" message={message} />}
    </div>
  );
}
