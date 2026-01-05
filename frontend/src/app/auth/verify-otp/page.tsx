"use client";

import { useState, useEffect, useRef } from "react";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import localFont from "next/font/local";

// FONT
const PoppinsRegular = localFont({ src: "../../../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../../../fonts/Poppins-Bold.ttf" });

// NOTIFICATION COMPONENT
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

export default function VerifyOtpPage() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email") ?? "";
  const role = params.get("role") || "user";

  const steps =
    role === "mitra"
      ? ["Email", "Verifikasi", "Data Diri"]
      : ["Email", "Verifikasi", "Data Diri"];

  const activeStep = 1; // halaman verifikasi OTP

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [otpState, setOtpState] = useState<"normal" | "success" | "error">(
    "normal"
  );
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const showNotif = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 2500);
  };

  useEffect(() => {
    if (!email) router.replace(`/auth/send-otp?role=${role}`);
  }, [email, role, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    setOtpState("normal");

    if (value !== "" && index < 5) inputsRef.current[index + 1]?.focus();
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && otpValues[index] === "" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post("http://localhost:5000/auth/send-otp", { email, role });

      showNotif("success", "OTP baru telah dikirim!");
    } catch (error) {
      showNotif("error", "Gagal mengirim ulang OTP!");
      console.log(error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otp = otpValues.join("");

    try {
      await axios.post("http://localhost:5000/auth/verify-otp", {
        email,
        otp,
        role,
      });

      setOtpState("success");
      showNotif("success", "OTP benar!");

      setTimeout(() => {
        if (role === "mitra") {
          router.push(`/auth/register?email=${email}&role=mitra&step=3`);
        } else {
          router.push(`/auth/register?email=${email}&role=user&step=3`);
        }
      }, 1000);
    } catch (error) {
      setOtpState("error");
      showNotif("error", "OTP salah!");

      if (error instanceof AxiosError) console.log(error.response?.data);
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 ${PoppinsRegular.className}`}
    >
      {notif && <Notification type={notif.type} message={notif.message} />}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md p-10">
        {/* === STEPPER (IDENTIK DENGAN SEND-OTP) === */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((label, index) => {
            const active = index === activeStep;
            const finished = index < activeStep;

            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                      active || finished ? "text-white" : "text-gray-500"
                    }`}
                    style={{
                      background:
                        active || finished ? "var(--color-primary)" : "#e5e7eb",
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
                  <div
                    className={`w-8 h-0.5 ${
                      finished ? "bg-[var(--color-primary)]" : "bg-gray-300"
                    }`}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        <h1
          className={`text-2xl font-semibold text-center mb-6 text-gray-700 ${PoppinsBold.className}`}
        >
          Verifikasi OTP ({role === "mitra" ? "Akun Mitra" : "Akun Pengguna"})
        </h1>

        <p className="text-center text-gray-600 mb-4 text-[16px] font-medium">
          Kode OTP telah dikirim ke:
          <span className="font-semibold text-gray-700"> {email}</span>
        </p>

        {/* === OTP INPUT === */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div
            className={`flex justify-between gap-3 ${
              otpState === "error" ? "animate-shake" : ""
            }`}
          >
            {otpValues.map((v, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                type="text"
                maxLength={1}
                value={v}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-12 text-center text-xl text-gray-700 border rounded-xl outline-none transition-all duration-200
                  ${
                    otpState === "error"
                      ? "border-red-500 ring-1 ring-red-500"
                      : otpState === "success"
                      ? "border-green-500 ring-1 ring-green-500"
                      : "border-gray-300 focus:ring-1 focus:ring-[var(--color-primary)]"
                  }`}
              />
            ))}
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-hover)] transition"
          >
            Verifikasi OTP
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={handleResendOtp}
            className="text-[var(--color-primary)] hover:underline font-medium"
          >
            Kirim ulang OTP
          </button>
        </div>
      </div>

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

        @keyframes shake {
          0% {
            transform: translateX(0);
          }
          25% {
            transform: translateX(-4px);
          }
          50% {
            transform: translateX(4px);
          }
          75% {
            transform: translateX(-4px);
          }
          100% {
            transform: translateX(0);
          }
        }
        .animate-shake {
          animation: shake 0.3s ease-in-out;
        }
      `}</style>
    </div>
  );
}
