"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import { AiFillEye, AiFillEyeInvisible } from "react-icons/ai";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({
  src: "../../../../fonts/Poppins-Regular.ttf",
});
const PoppinsBold = localFont({
  src: "../../../../fonts/Poppins-Bold.ttf",
});

// VALIDATION
const schema = z
  .object({
    oldPassword: z.string().min(6, "Minimal 6 karakter"),
    newPassword: z.string().min(6, "Minimal 6 karakter"),
    confirmPassword: z.string().min(6, "Minimal 6 karakter"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi kata sandi tidak cocok",
    path: ["confirmPassword"],
  });

export default function PasswordPage() {
  const router = useRouter();

  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // NOTIF POPUP
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"success" | "error">("error");

  const showPopup = (message: string, type: "success" | "error") => {
    setNotifMessage(message);
    setNotifType(type);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2500);
  };

  // SUBMIT
  const onSubmit = async (values: any) => {
    try {
      await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/profile/password`,
        {
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      showPopup("Kata sandi berhasil diubah!", "success");

      setTimeout(() => router.push("/user/profile"), 1500);
    } catch (err: any) {
      showPopup(
        err.response?.data?.message || "Gagal mengubah kata sandi",
        "error"
      );
    }
  };

  return (
    <div className={`${PoppinsRegular.className}`}>
      <Navbar />

      <div className="min-h-screen bg-gray-50 flex justify-center py-10">
        <div className="w-[70%] flex gap-10">
          {/* SIDEBAR */}
          <div className="w-64 bg-white shadow-lg rounded-2xl p-6 h-fit border border-gray-100">
            <h3
              className={`text-xl font-bold mb-5 text-gray-700 ${PoppinsBold.className}`}
            >
              Profil
            </h3>

            <div className="flex flex-col gap-3">
              <button
                onClick={() => router.push("/user/profile")}
                className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-[15px] transition-all"
              >
                Data Diri
              </button>

              <button className="text-left px-3 py-2 rounded-lg bg-[#E8F5E9] text-green-700 text-[15px] font-medium">
                Ubah Kata Sandi
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 bg-white shadow-lg rounded-2xl h-fit p-10 border border-gray-100">
            <h2
              className={`text-2xl text-gray-700 mb-6 font-bold ${PoppinsBold.className}`}
            >
              Ubah Kata Sandi
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* OLD PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kata Sandi Lama *
                </label>
                <div className="relative mt-2">
                  <input
                    type={showOld ? "text" : "password"}
                    {...form.register("oldPassword")}
                    placeholder="Masukkan kata sandi lama"
                    className="w-full p-3 text-[15px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOld(!showOld)}
                    className="absolute right-3 top-3 text-xl text-gray-500"
                  >
                    {showOld ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </button>
                </div>
                {form.formState.errors.oldPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.oldPassword.message as string}
                  </p>
                )}
              </div>

              {/* NEW PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Kata Sandi Baru *
                </label>
                <div className="relative mt-2">
                  <input
                    type={showNew ? "text" : "password"}
                    {...form.register("newPassword")}
                    placeholder="Masukkan kata sandi baru"
                    className="w-full p-3 text-[15px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-3 text-xl text-gray-500"
                  >
                    {showNew ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </button>
                </div>
                {form.formState.errors.newPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.newPassword.message as string}
                  </p>
                )}
              </div>

              {/* CONFIRM PASSWORD */}
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Konfirmasi Kata Sandi Baru *
                </label>
                <div className="relative mt-2">
                  <input
                    type={showConfirm ? "text" : "password"}
                    {...form.register("confirmPassword")}
                    placeholder="Konfirmasi kata sandi baru"
                    className="w-full p-3 text-[15px] rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-3 text-xl text-gray-500"
                  >
                    {showConfirm ? <AiFillEyeInvisible /> : <AiFillEye />}
                  </button>
                </div>
                {form.formState.errors.confirmPassword && (
                  <p className="text-red-500 text-sm mt-1">
                    {form.formState.errors.confirmPassword.message as string}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="px-6 py-2 text-[15px] w-full sm:w-auto rounded-xl text-white font-semibold transition-all"
                style={{ background: "var(--color-primary)" }}
              >
                Simpan Kata Sandi
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* POPUP NOTIFICATION */}
      {showNotif && (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
          {/* Overlay */}
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]"></div>

          {/* Card */}
          <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center">
            <div className="flex flex-col items-center gap-3">
              {/* ICON */}
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: notifType === "error" ? "#e74c3c" : "#2ecc71",
                }}
              >
                {notifType === "error" ? "!" : "✔"}
              </div>

              <p className="text-gray-700 text-lg font-semibold">
                {notifMessage}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
