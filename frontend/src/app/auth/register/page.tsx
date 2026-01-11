"use client";

import { Suspense, useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import localFont from "next/font/local";

// Font Awesome
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

// Fonts
const PoppinsRegular = localFont({
  src: "../../../fonts/Poppins-Regular.ttf",
  variable: "--font-poppins",
});

const PoppinsBold = localFont({
  src: "../../../fonts/Poppins-Bold.ttf",
  variable: "--font-poppins",
});

function RegisterContent() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params?.get("email") || "";
  const role = params?.get("role") || "user"; // ⭐ default user

  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [noHp, setNoHp] = useState("");
  const [message, setMessage] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const togglePassword = () => setShowPassword((prev) => !prev);

  const [showNotif, setShowNotif] = useState(false);

  const [showSuccess, setShowSuccess] = useState(false);

  const [showTerms, setShowTerms] = useState(false);
  const [isChecked, setIsChecked] = useState(false);

  // Redirect jika tidak ada email
  useEffect(() => {
    if (!email) router.push(`/auth/send-otp?role=${role}`);
  }, [email, role]);

  // STEP UI GENERATOR (DINAMIS BERDASARKAN ROLE)
  const steps =
    role === "mitra"
      ? ["Email", "Verifikasi", "Data Diri"]
      : ["Email", "Verifikasi", "Data Diri"];

  const currentStepIndex = 2;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (["user", "mitra"].includes(role) && !isChecked) {
      setMessage("Anda harus menyetujui syarat & ketentuan terlebih dahulu");
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2000);
      return;
    }

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
        email,
        nama: name,
        username,
        password,
        no_hp: noHp,
        role,
      });

      // === REGISTER SUCCESS ===
      setShowSuccess(true);

      setTimeout(() => {
        router.push("/auth/login");
      }, 2000);
    } catch (err) {
      const msg =
        err instanceof AxiosError
          ? err.response?.data?.message
          : "Terjadi kesalahan saat memproses pendaftaran";

      setMessage(msg);
      setShowNotif(true);
      setTimeout(() => setShowNotif(false), 2500);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 py-12 ${PoppinsRegular.className}`}
    >
      <div className="bg-white w-full max-w-lg h-auto rounded-2xl shadow-md p-10">
        {/* ================== AUTO STEPPER ================== */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((step, index) => {
            const isActive = index === currentStepIndex;
            const isFinished = index < currentStepIndex;
            const isLast = index === steps.length - 1;

            return (
              <div key={index} className="flex items-center gap-3">
                <div className="flex flex-col items-center">
                  {/* CIRCLE */}
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold
              ${isActive || isFinished ? "text-white" : "text-gray-500"}
            `}
                    style={{
                      background: isActive
                        ? "var(--color-primary)"
                        : isFinished
                        ? "#22c55e" // HIJAU UNTUK SUDAH LEWAT
                        : "#e5e7eb",
                    }}
                  >
                    {index + 1}
                  </div>

                  {/* LABEL (Biar ga turun-turun) */}
                  <p
                    className={`text-sm mt-1 font-medium whitespace-nowrap 
              ${isActive ? "text-(--color-primary)" : "text-gray-500"}
            `}
                  >
                    {step}
                  </p>
                </div>

                {/* CONNECTOR LINE */}
                {!isLast && (
                  <div
                    className={`w-8 h-0.5 ${
                      isFinished ? "bg-(--color-primary)" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        <h2
          className={`text-2xl font-bold text-center text-gray-700 mb-3 ${PoppinsBold.className}`}
        >
          Lengkapi Data Diri
        </h2>

        <p className="text-center text-gray-500 mb-5">
          Semua data ini diperlukan untuk membuat akun.
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Nama */}
          <div>
            <label className="font-medium text-gray-700 text-[15px]">
              Nama Lengkap
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Masukkan nama lengkap Anda"
              className="w-full pl-4 p-2 rounded-xl border border-gray-300 mt-2 text-[15px] text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition duration-300"
            />
          </div>

          {/* Username */}
          <div>
            <label className="font-medium text-gray-700 text-[15px]">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Masukkan username Anda"
              className="w-full pl-4 p-2 rounded-xl border border-gray-300 mt-2 text-[15px] text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition duration-300"
            />
          </div>

          {/* Password */}
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
                className="w-full pl-4 pr-12 p-2 rounded-xl border border-gray-300 text-[15px] text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition duration-300"
              />

              <FontAwesomeIcon
                icon={showPassword ? faEye : faEyeSlash}
                className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-lg text-gray-400"
                onClick={togglePassword}
              />
            </div>
          </div>

          {/* Nomor HP */}
          <div>
            <label className="font-medium text-gray-700 text-[15px]">
              Nomor HP
            </label>
            <input
              value={noHp}
              onChange={(e) => setNoHp(e.target.value)}
              placeholder="Masukkan nomor HP Anda"
              className="w-full pl-4 p-2 rounded-xl border border-gray-300 mt-2 text-[15px] text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition duration-300"
            />
          </div>

          {/* TERMS CHECKBOX */}
          {/* TERMS CHECKBOX – hanya untuk USER */}
          {["user", "mitra"].includes(role) && (
            <div className="flex items-start gap-3 mt-1">
              <input
                type="checkbox"
                className="mt-1 w-5 h-5 cursor-pointer"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
              />

              <p className="text-gray-600 text-sm leading-5">
                Saya telah membaca dan menyetujui
                <span
                  className="cursor-pointer font-semibold ml-1"
                  style={{ color: "var(--color-primary)" }}
                  onClick={() => setShowTerms(true)}
                >
                  Syarat & Ketentuan
                </span>
              </p>
            </div>
          )}

          <button
            type="submit"
            className="w-full mt-4 text-white font-semibold py-2.5 rounded-xl transition-all duration-300"
            style={{ background: "var(--color-primary)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "var(--color-hover)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "var(--color-primary)")
            }
          >
            {role === "mitra" ? "Daftar Sekarang" : "Daftar Sekarang"}
          </button>
        </form>

        {["user", "mitra"].includes(role) && (
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
        )}
      </div>

      {/* NOTIFIKASI */}
      {showNotif && (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]"></div>

          <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{ background: "#e74c3c" }}
              >
                !
              </div>

              <p className="text-gray-600 text-[16px] font-semibold">
                {message}
              </p>
            </div>
          </div>
        </div>
      )}

      {showSuccess && (
        <div className="fixed inset-0 flex items-center justify-center z-999">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

          <div className="relative bg-white px-8 py-7 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl"
                style={{ background: "#22c55e" }}
              >
                ✓
              </div>

              <p className="text-gray-700 text-lg font-semibold">
                Pendaftaran Berhasil
              </p>

              <p className="text-gray-500 text-sm">
                Akun berhasil dibuat. Mengalihkan ke halaman login...
              </p>
            </div>
          </div>
        </div>
      )}

      {/* TERMS MODAL */}
      {["user", "mitra"].includes(role) && showTerms && (
        <div className="fixed inset-0 flex items-center justify-center z-999">
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm"></div>

          <div className="relative bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-lg animate-fadeIn">
            <h3
              className="text-xl font-bold mb-3 text-center"
              style={{ color: "var(--color-primary)" }}
            >
              Syarat & Ketentuan
            </h3>

            <div className="text-gray-600 text-sm leading-6 max-h-64 overflow-y-auto pr-2">
              <p>
                • Seluruh informasi yang diberikan harus akurat, lengkap, dan
                sesuai dengan data sebenarnya.
                <br />• Pihak kami berhak melakukan verifikasi terhadap seluruh
                data yang diinput oleh pengguna.
                <br />• Setiap tindakan yang melanggar ketentuan atau mengarah
                pada penyalahgunaan sistem akan dikenakan sanksi sesuai
                kebijakan yang berlaku.
              </p>
            </div>

            <button
              className="w-full mt-5 text-white font-semibold py-2.5 rounded-xl"
              style={{ background: "var(--color-primary)" }}
              onClick={() => setShowTerms(false)}
            >
              Saya Sudah Membaca
            </button>
          </div>
        </div>
      )}

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.25s ease-out;
        }
      `}</style>
    </div>
  );
}

/* =========================
   DEFAULT EXPORT (WAJIB)
   ========================= */
export default function RegisterPage() {
  return (
    <Suspense fallback={<div />}>
      <RegisterContent />
    </Suspense>
  );
}
