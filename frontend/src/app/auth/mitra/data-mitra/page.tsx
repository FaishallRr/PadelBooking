"use client";

import { useEffect, useState, ChangeEvent, FormEvent, useRef } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";

import { Upload, X } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import ProtectedMitra from "@/components/ProtectedMitra";

/* ===== Fonts ===== */
const PoppinsRegular = localFont({
  src: "../../../../fonts/Poppins-Regular.ttf",
  variable: "--font-poppins",
});
const PoppinsBold = localFont({
  src: "../../../../fonts/Poppins-Bold.ttf",
  variable: "--font-poppins-bold",
});

/* ===== Helper Parse JWT ===== */
function parseJwt(token: string | undefined | null) {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const decoded = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/* ===== Notification Popup Component ===== */
function Notification({
  type,
  message,
}: {
  type: "success" | "error" | "info";
  message: string;
}) {
  const color =
    type === "success" ? "#22c55e" : type === "error" ? "#ef4444" : "#3b82f6";

  const icon = type === "success" ? "✓" : type === "error" ? "!" : "ℹ";

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[9999]">
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]"></div>

      <div className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeInScale">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-bold"
            style={{ background: color }}
          >
            {icon}
          </div>

          <p className="text-gray-700 text-[16px] font-medium">{message}</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================= */
/* ===================   MAIN COMPONENT   ======================= */
/* ============================================================= */

export default function DataMitraForm() {
  const router = useRouter(); // ← FIX: pindah ke dalam komponen

  const [form, setForm] = useState({
    nama_usaha: "",
    alamat_usaha: "",
    no_ktp: "",
    withdraw_type: "",
    withdraw_day: "",
    bank_mitra: "",
    no_rekening_mitra: "",
  });

  const [agree, setAgree] = useState(false);
  const [fotoKtpFile, setFotoKtpFile] = useState<File | null>(null);
  const [previewKtp, setPreviewKtp] = useState<string | null>(null);
  const [dragActiveKtp, setDragActiveKtp] = useState(false);
  const fileInputKtpRef = useRef<HTMLInputElement | null>(null);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [showTerms, setShowTerms] = useState(false);

  /* ===== Auto-close Notification ===== */
  useEffect(() => {
    if (errorMsg || successMsg) {
      const t = setTimeout(() => {
        setErrorMsg(null);
        setSuccessMsg(null);
      }, 2200);
      return () => clearTimeout(t);
    }
  }, [errorMsg, successMsg]);

  /* Cleanup preview */
  useEffect(() => {
    return () => {
      if (previewKtp) URL.revokeObjectURL(previewKtp);
    };
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  /* ===== Upload Foto KTP ===== */
  const setKtp = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return setErrorMsg("File harus berupa gambar JPG/PNG");
    }
    if (file.size > 6 * 1024 * 1024) {
      return setErrorMsg("Ukuran maksimal 6 MB");
    }

    if (previewKtp) URL.revokeObjectURL(previewKtp);

    setFotoKtpFile(file);
    setPreviewKtp(URL.createObjectURL(file));
    setErrorMsg(null);
  };

  const handleDropKtp = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActiveKtp(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setKtp(file);
  };

  const openKtpDialog = () => fileInputKtpRef.current?.click();

  /* ===== Validation ===== */
  const validateBeforeSubmit = () => {
    if (!form.nama_usaha.trim())
      return setErrorMsg("Nama usaha wajib diisi."), false;

    if (!form.alamat_usaha.trim())
      return setErrorMsg("Alamat usaha wajib diisi."), false;

    if (!form.no_ktp.trim())
      return setErrorMsg("Nomor KTP wajib diisi."), false;

    if (!form.withdraw_type)
      return setErrorMsg("Pilih tipe penarikan terlebih dahulu."), false;

    if (form.withdraw_type === "daily") {
      if (!form.bank_mitra.trim() || !form.no_rekening_mitra.trim())
        return setErrorMsg("Bank & nomor rekening wajib diisi."), false;
    }

    if (form.withdraw_type === "monthly") {
      const d = Number(form.withdraw_day);
      if (!d || d < 1 || d > 28)
        return setErrorMsg("Tanggal penarikan harus antara 1–28."), false;
    }

    if (!fotoKtpFile) return setErrorMsg("Foto KTP wajib diupload."), false;

    if (!agree)
      return (
        setErrorMsg("Mohon setujui Syarat & Ketentuan terlebih dahulu."), false
      );

    return true;
  };

  /* ===== Submit ===== */
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (loading) return;

    if (!validateBeforeSubmit()) return;

    let userId: number | null = null;
    const cookieUser = Cookies.get("user_id");

    if (cookieUser) {
      userId = Number(cookieUser);
    } else {
      const token = Cookies.get("token");
      const payload = parseJwt(token);
      userId = Number(payload?.id ?? payload?.userId ?? payload?.sub);
    }

    if (!userId) {
      setErrorMsg("User ID tidak ditemukan. Silakan login ulang.");
      return;
    }

    const fd = new FormData();
    fd.append("user_id", String(userId));
    fd.append("nama_usaha", form.nama_usaha);
    fd.append("alamat_usaha", form.alamat_usaha);
    fd.append("no_ktp", form.no_ktp);
    fd.append("withdraw_type", form.withdraw_type);

    if (form.withdraw_type === "monthly") {
      fd.append("withdraw_day", form.withdraw_day);
    } else {
      fd.append("bank_mitra", form.bank_mitra);
      fd.append("no_rekening_mitra", form.no_rekening_mitra);
    }

    fd.append("ktp", fotoKtpFile as Blob);

    setLoading(true);

    try {
      const token = Cookies.get("token");

      const res = await axios.post(
        "http://localhost:5000/auth/register-mitra",
        fd,
        {
          withCredentials: true,
          headers: {
            Authorization: token ? `Bearer ${token}` : "",
          },
        }
      );

      if (res.data.message === "Data mitra sudah terisi") {
        setErrorMsg(
          "Data mitra Anda telah lengkap. Tidak perlu mengisi ulang."
        );
        return;
      }

      setSuccessMsg(
        "Data mitra berhasil disimpan. Mengalihkan ke dashboard..."
      );

      setTimeout(() => {
        router.push("/mitra/dashboard");
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || "Gagal register mitra.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12 ${PoppinsRegular.className}`}
    >
      {errorMsg && <Notification type="error" message={errorMsg} />}
      {successMsg && <Notification type="success" message={successMsg} />}

      <ProtectedMitra>
        <div className="bg-white w-full max-w-lg rounded-3xl shadow-md p-10">
          <h1
            className={`text-2xl font-bold text-center mb-6 text-gray-700 ${PoppinsBold.className}`}
          >
            Lengkapi Data Mitra
          </h1>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Nama Usaha */}
            <div>
              <Label>Nama Usaha</Label>
              <Input
                name="nama_usaha"
                value={form.nama_usaha}
                onChange={handleChange}
                placeholder="Masukkan nama usaha Anda"
                className="mt-2 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                style={
                  {
                    "--tw-ring-color": "var(--color-primary)",
                  } as React.CSSProperties
                }
              />
            </div>

            {/* Alamat */}
            <div>
              <Label>Alamat Usaha</Label>
              <Input
                name="alamat_usaha"
                value={form.alamat_usaha}
                onChange={handleChange}
                placeholder="Masukkan alamat usaha Anda"
                className="mt-2 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                style={
                  {
                    "--tw-ring-color": "var(--color-primary)",
                  } as React.CSSProperties
                }
              />
            </div>

            {/* KTP */}
            <div>
              <Label>Nomor KTP</Label>
              <Input
                name="no_ktp"
                value={form.no_ktp}
                onChange={handleChange}
                placeholder="Masukkan nomor KTP Anda"
                className="mt-2 rounded-xl text-[15px] text-gray-700  focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                style={
                  {
                    "--tw-ring-color": "var(--color-primary)",
                  } as React.CSSProperties
                }
              />
            </div>

            {/* Upload KTP */}
            <div>
              <Label>Upload Foto KTP</Label>

              <div
                className={`mt-3 border-2 border-dashed rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  dragActiveKtp
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-300 bg-gray-50/40"
                }`}
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragActiveKtp(true);
                }}
                onDragLeave={() => setDragActiveKtp(false)}
                onDrop={handleDropKtp}
                onClick={openKtpDialog}
              >
                {previewKtp ? (
                  <div className="relative flex justify-center">
                    <img
                      src={previewKtp}
                      alt="Preview KTP"
                      className="w-60 rounded-xl shadow"
                    />

                    <button
                      type="button"
                      className="absolute top-2 right-2 bg-white p-1.5 rounded-full shadow"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (previewKtp) URL.revokeObjectURL(previewKtp);
                        setPreviewKtp(null);
                        setFotoKtpFile(null);
                      }}
                    >
                      <X size={18} />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="p-4 rounded-full bg-gray-300 text-white shadow-lg">
                      <Upload size={28} />
                    </div>
                    <p className="font-medium text-gray-700">
                      Drop foto KTP atau klik untuk upload
                    </p>
                    <p className="text-xs text-gray-500">Max 6MB • JPG/PNG</p>
                  </div>
                )}
              </div>

              <input
                ref={fileInputKtpRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) setKtp(f);
                }}
              />
            </div>

            {/* Withdraw */}
            <div>
              <Label>Tipe Penarikan</Label>

              <Select
                value={form.withdraw_type}
                onValueChange={(v: string) =>
                  setForm((p) => ({ ...p, withdraw_type: v }))
                }
              >
                <SelectTrigger className="mt-2 rounded-xl">
                  <SelectValue placeholder="Pilih tipe withdraw" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Harian</SelectItem>
                  <SelectItem value="monthly">Bulanan</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {form.withdraw_type === "monthly" && (
              <div>
                <Label>Tanggal Penarikan (1–28)</Label>
                <Input
                  type="number"
                  name="withdraw_day"
                  value={form.withdraw_day}
                  onChange={handleChange}
                  min={1}
                  max={28}
                  className="mt-2 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                  style={
                    {
                      "--tw-ring-color": "var(--color-primary)",
                    } as React.CSSProperties
                  }
                />
              </div>
            )}

            {form.withdraw_type === "daily" && (
              <>
                <div>
                  <Label>Bank Mitra</Label>
                  <Input
                    name="bank_mitra"
                    value={form.bank_mitra}
                    onChange={handleChange}
                    className="mt-2 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                    style={
                      {
                        "--tw-ring-color": "var(--color-primary)",
                      } as React.CSSProperties
                    }
                  />
                </div>

                <div>
                  <Label>No Rekening Mitra</Label>
                  <Input
                    name="no_rekening_mitra"
                    value={form.no_rekening_mitra}
                    onChange={handleChange}
                    className="mt-2 rounded-xl text-[15px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-(--color-primary) transition-all duration-300"
                    style={
                      {
                        "--tw-ring-color": "var(--color-primary)",
                      } as React.CSSProperties
                    }
                  />
                </div>
              </>
            )}

            {/* Terms */}
            <div className="flex items-start gap-3 pt-2">
              <Checkbox
                checked={agree}
                onCheckedChange={(v: boolean) => setAgree(Boolean(v))}
              />

              <p className="text-gray-700 text-sm leading-tight">
                Saya telah membaca dan menyetujui{" "}
                <span
                  className="font-semibold text-[var(--color-primary)] cursor-pointer hover:underline"
                  onClick={() => setShowTerms(true)}
                >
                  Syarat & Ketentuan
                </span>
              </p>
            </div>

            <button
              type="submit"
              className="w-full text-white py-2.5 rounded-xl font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ background: "var(--color-primary)" }}
            >
              {loading ? "Mengirim..." : "Simpan Data Mitra"}
            </button>
          </form>
        </div>

        {/* Pop-up Terms */}
        {showTerms && (
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
                  • Data yang Anda masukkan harus benar dan sesuai identitas.
                  <br />• Kami berhak melakukan verifikasi & validasi.
                  <br />• Pelanggaran terhadap ketentuan dapat menyebabkan akun
                  dibatasi.
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
      </ProtectedMitra>
    </div>
  );
}
