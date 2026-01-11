"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import axios, { AxiosError } from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import localFont from "next/font/local";

/* ================= FONT ================= */
const PoppinsRegular = localFont({
  src: "../../../fonts/Poppins-Regular.ttf",
});
const PoppinsBold = localFont({
  src: "../../../fonts/Poppins-Bold.ttf",
});

/* ================= API BASE ================= */
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

/* ================= NOTIFICATION ================= */
function Notification({
  type,
  message,
}: {
  type: "success" | "error";
  message: string;
}) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-[999]">
      <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]" />
      <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center">
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

/* ================= CONTENT ================= */
function VerifyOtpContent() {
  const router = useRouter();
  const params = useSearchParams();

  const email = params.get("email") ?? "";
  const role = params.get("role") || "user";

  const steps = ["Email", "Verifikasi", "Data Diri"];
  const activeStep = 1;

  const [otpValues, setOtpValues] = useState(["", "", "", "", "", ""]);
  const [otpState, setOtpState] = useState<"normal" | "success" | "error">(
    "normal"
  );
  const [notif, setNotif] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const showNotif = (type: "success" | "error", message: string) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 2500);
  };

  useEffect(() => {
    if (!email) {
      router.replace(`/auth/send-otp?role=${role}`);
    }
  }, [email, role, router]);

  const handleChange = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otpValues];
    newOtp[index] = value;
    setOtpValues(newOtp);
    setOtpState("normal");

    if (value && index < 5) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      inputsRef.current[index - 1]?.focus();
    }
  };

  const handleResendOtp = async () => {
    try {
      await axios.post(`${API_URL}/auth/send-otp`, { email, role });
      showNotif("success", "OTP baru telah dikirim!");
    } catch {
      showNotif("error", "Gagal mengirim ulang OTP");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const otp = otpValues.join("");

    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, {
        email,
        otp,
        role,
      });

      if (typeof res.data !== "object") {
        throw new Error("Response bukan JSON");
      }

      setOtpState("success");
      showNotif("success", "OTP benar!");

      setTimeout(() => {
        router.push(`/auth/register?email=${email}&role=${role}&step=3`);
      }, 1000);
    } catch (err) {
      setOtpState("error");

      if (err instanceof AxiosError) {
        showNotif("error", err.response?.data?.message || "OTP salah");
      } else {
        showNotif("error", "Terjadi kesalahan server");
      }
    }
  };

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 ${PoppinsRegular.className}`}
    >
      {notif && <Notification {...notif} />}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md p-10">
        {/* STEPPER */}
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
                  />
                )}
              </div>
            );
          })}
        </div>

        <h2
          className={`text-2xl font-semibold text-center mb-6 text-gray-700 ${PoppinsBold.className}`}
        >
          Verifikasi OTP
        </h2>

        <p className="text-center text-gray-600 mb-6">
          Kode OTP dikirim ke <b>{email}</b>
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex justify-between gap-3">
            {otpValues.map((v, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputsRef.current[i] = el;
                }}
                value={v}
                maxLength={1}
                onChange={(e) => handleChange(i, e.target.value)}
                onKeyDown={(e) => handleKeyDown(i, e)}
                className={`w-12 h-12 text-center text-xl border rounded-xl outline-none ${
                  otpState === "error"
                    ? "border-red-500"
                    : otpState === "success"
                    ? "border-green-500"
                    : "border-gray-300 focus:ring-2"
                }`}
                style={
                  {
                    "--tw-ring-color": "var(--color-primary)",
                  } as React.CSSProperties
                }
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
    </div>
  );
}

/* ================= SUSPENSE WRAPPER ================= */
export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div />}>
      <VerifyOtpContent />
    </Suspense>
  );
}
