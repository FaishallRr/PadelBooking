"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import Navbar from "@/components/navbar";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({
  src: "../../../fonts/Poppins-Regular.ttf",
});

const PoppinsBold = localFont({
  src: "../../../fonts/Poppins-Bold.ttf",
});

// VALIDATION
const schema = z.object({
  fullName: z.string().min(3),
  username: z.string().min(3),
  phone: z.string(),
  email: z.string().email(),
  photo: z.any().optional(),
});

export default function ProfilePage() {
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);

  // NOTIF
  const [showNotif, setShowNotif] = useState(false);
  const [notifMessage, setNotifMessage] = useState("");
  const [notifType, setNotifType] = useState<"error" | "success">("error");

  const showPopup = (message: string, type: "error" | "success") => {
    setNotifMessage(message);
    setNotifType(type);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2500);
  };

  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: "",
      username: "",
      phone: "",
      email: "",
      photo: undefined,
    },
  });

  // LOAD PROFILE DATA
  useEffect(() => {
    async function load() {
      try {
        const token = Cookies.get("token");
        if (!token) {
          showPopup("Anda belum login", "error");
          return;
        }

        const res = await axios.get(
          `${process.env.NEXT_PUBLIC_API_URL}/auth/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = res.data;

        // Fill input fields
        form.setValue("fullName", data.nama);
        form.setValue("username", data.username);
        form.setValue("phone", data.no_hp);
        form.setValue("email", data.email);

        // 📌 SET FOTO dari backend
        if (data.foto) {
          setPreview(
            `${process.env.NEXT_PUBLIC_API_URL}/img/user/${data.foto}`
          );
        } else {
          setPreview(null);
        }
      } catch {
        showPopup("Gagal memuat profil", "error");
      }
    }

    load();
  }, []);

  // HANDLE INPUT FILE
  const handlePhoto = (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;

    form.setValue("photo", file);

    // Preview dari file
    setPreview(URL.createObjectURL(file));
  };

  // SUBMIT UPDATE
  const onSubmit = async (values: any) => {
    try {
      const fd = new FormData();
      fd.append("nama", values.fullName);
      fd.append("username", values.username);

      if (values.photo) {
        fd.append("foto", values.photo);
      }

      const res = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`,
        fd,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${Cookies.get("token")}`,
          },
        }
      );

      // 📌 UPDATE FOTO DI FE SETELAH UPDATE
      if (res.data.profile?.foto) {
        setPreview(
          `${process.env.NEXT_PUBLIC_API_URL}/img/user/${res.data.profile.foto}`
        );
      }

      showPopup("Profil berhasil diperbarui!", "success");
    } catch (err) {
      if (err instanceof AxiosError) {
        showPopup(
          err.response?.data?.message || "Gagal memperbarui profil",
          "error"
        );
      } else {
        showPopup("Terjadi kesalahan", "error");
      }
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
              <button className="text-left px-3 py-2 rounded-lg bg-[#E8F5E9] text-green-700 text-[15px] transition-all">
                Data Diri
              </button>

              <button
                className="text-left px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 text-[15px] font-medium"
                onClick={() => router.push("/user/profile/password")}
              >
                Ubah Kata Sandi
              </button>
            </div>
          </div>

          {/* CONTENT */}
          <div className="flex-1 bg-white shadow-md rounded-2xl p-10">
            <h2
              className={`text-2xl text-gray-700 mb-6 font-bold ${PoppinsBold.className}`}
            >
              Data Diri
            </h2>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* FOTO */}
              <div className="flex items-center gap-6">
                <img
                  src={preview ?? "/default-avatar.png"}
                  className="w-24 h-24 rounded-full object-cover border shadow-sm"
                />

                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhoto}
                  className="text-sm"
                />
              </div>

              {/* NAMA */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Nama Lengkap *
                </label>
                <input
                  {...form.register("fullName")}
                  className="w-full mt-2 p-3 rounded-xl text-[15px] border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Username *
                </label>
                <input
                  {...form.register("username")}
                  className="w-full mt-2 p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:outline-none transition duration-300"
                />
              </div>

              {/* PHONE */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Nomor Ponsel
                </label>
                <input
                  {...form.register("phone")}
                  disabled
                  className="w-full mt-2 p-3 rounded-xl border bg-gray-100 text-gray-500"
                />
              </div>

              {/* EMAIL */}
              <div>
                <label className="font-medium text-gray-700 text-sm">
                  Email
                </label>
                <input
                  {...form.register("email")}
                  disabled
                  className="w-full mt-2 p-3 rounded-xl border bg-gray-100 text-gray-500"
                />
              </div>

              <button
                type="submit"
                className="px-6 py-2 text-[15px] rounded-xl text-white font-semibold"
                style={{ background: "var(--color-primary)" }}
              >
                Simpan Perubahan
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* NOTIFICATION POPUP */}
      {showNotif && (
        <div className="fixed inset-0 flex items-center justify-center z-[999]">
          <div className="absolute inset-0 bg-black/15 backdrop-blur-[1px]"></div>

          <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn">
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: notifType === "error" ? "#e74c3c" : "#2ecc71",
                }}
              >
                {notifType === "error" ? "!" : "✔"}
              </div>

              <p className="text-gray-600 text-lg font-semibold">
                {notifMessage}
              </p>
            </div>
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
