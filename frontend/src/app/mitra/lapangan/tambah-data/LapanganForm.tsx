"use client";
import { useState, useRef, ChangeEvent, DragEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, X, Star, ChevronDown } from "lucide-react";
import localFont from "next/font/local";
import Cookies from "js-cookie";

const PoppinsRegular = localFont({
  src: "../../../../fonts/Poppins-Regular.ttf",
});
const PoppinsBold = localFont({ src: "../../../../fonts/Poppins-Bold.ttf" });

interface LapanganFormProps {
  mode: "tambah" | "edit";
  slug?: string;
}

interface ServerImage {
  url: string;
}

export default function LapanganForm({ mode, slug }: LapanganFormProps) {
  const isEdit = mode === "edit";
  const [step, setStep] = useState(1);

  const [utamaType, setUtamaType] = useState<"server" | "new">(
    mode === "edit" ? "server" : "new"
  );
  const [utamaServerIndex, setUtamaServerIndex] = useState<number | null>(null);
  const [utamaNewIndex, setUtamaNewIndex] = useState<number | null>(null);

  // Step 1
  const [namaLapangan, setNamaLapangan] = useState("");
  const [lokasi, setLokasi] = useState("");
  const [lokasiOpen, setLokasiOpen] = useState(false);
  const [harga, setHarga] = useState("");

  // Step 2
  const [deskripsi, setDeskripsi] = useState("");
  const [lokasiDetail, setLokasiDetail] = useState("");
  const [linkMaps, setLinkMaps] = useState("");
  const [tipeLapangan, setTipeLapangan] = useState("");
  const [tipeLapanganOpen, setTipeLapanganOpen] = useState(false);
  const [selectedFasilitas, setSelectedFasilitas] = useState<string[]>([]);
  const [interval, setInterval] = useState<number>(1);
  const [breakTime, setBreakTime] = useState<number>(10);
  const [startTime, setStartTime] = useState("08:00");

  // Step 3
  const [dragActive, setDragActive] = useState(false);
  const [previews, setPreviews] = useState<File[]>([]);
  const [serverPreviews, setServerPreviews] = useState<ServerImage[]>([]);
  const [fileUtamaIndex, setFileUtamaIndex] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [deletedImages, setDeletedImages] = useState<string[]>([]);

  // Notification
  const [showNotif, setShowNotif] = useState(false);
  const [notifType, setNotifType] = useState<"success" | "error">("success");
  const [notifMessage, setNotifMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ===============================
  // Fetch data lapangan saat edit
  // ===============================
  useEffect(() => {
    if (!isEdit || !slug) return;

    const fetchLapangan = async () => {
      try {
        const token = Cookies.get("token");
        if (!token) throw new Error("Token tidak ditemukan");

        const backendRes = await fetch(
          `http://localhost:5000/api/lapangan/mitra/lapangan/${slug}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
          }
        );

        if (!backendRes.ok) throw new Error("Gagal ambil data lapangan");

        const data = await backendRes.json();

        setNamaLapangan(data.nama);
        setHarga(formatRupiah(data.harga));
        setLokasi(data.lokasi);
        setDeskripsi(data.detail?.deskripsi || "");
        setLokasiDetail(data.detail?.alamat || "");
        setLinkMaps(data.detail?.maps || "");
        setTipeLapangan(data.detail?.type || "");
        setSelectedFasilitas(data.detail?.fasilitas || []);
        setInterval((data.detail?.interval ?? 60) / 60);
        setBreakTime(data.detail?.breakTime ?? 10);
        setStartTime(data.detail?.startTime || "08:00");

        const allImages: string[] = [];

        // masukkan gambar utama dulu
        if (data.gambar) {
          allImages.push(data.gambar);
        }

        // masukkan gambar list
        if (Array.isArray(data.gambarList)) {
          data.gambarList.forEach((img: string) => {
            if (!allImages.includes(img)) {
              allImages.push(img);
            }
          });
        }

        const serverImages: ServerImage[] = allImages.map((url: string) => ({
          url: `http://localhost:5000${url}`,
        }));

        setServerPreviews(serverImages);

        // set foto utama index = 0 (karena kita push duluan)
        setUtamaType("server");
        setUtamaServerIndex(0);
      } catch (err: any) {
        showNotification(
          "error",
          err.message || "Gagal mengambil data lapangan"
        );
      }
    };

    fetchLapangan();
  }, [isEdit, slug]);

  const formatRupiah = (value: string | number) => {
    if (!value) return "";
    const numberString = value.toString().replace(/\D/g, "");
    return numberString.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const toggleFasilitas = (f: string) => {
    setSelectedFasilitas((prev) =>
      prev.includes(f) ? prev.filter((item) => item !== f) : [...prev, f]
    );
  };

  const showNotification = (type: "success" | "error", message: string) => {
    setNotifType(type);
    setNotifMessage(message);
    setShowNotif(true);
    setTimeout(() => setShowNotif(false), 2500);
  };

  const handleDropFiles = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = Array.from(e.dataTransfer.files).filter((f) =>
      f.type.startsWith("image/")
    );

    // 🔒 VALIDASI MAX 6 FOTO
    if (previews.length + serverPreviews.length + files.length > 6) {
      showNotification("error", "Maksimal 6 foto lapangan");
      return;
    }

    setPreviews((prev) => [...prev, ...files]);
  };

  const setUtamaServer = (idx: number) => {
    setUtamaType("server");
    setUtamaServerIndex(idx);
    setUtamaNewIndex(null);
  };

  const setUtamaNew = (idx: number) => {
    setUtamaType("new");
    setUtamaNewIndex(idx);
    setFileUtamaIndex(idx);
    setUtamaServerIndex(null);
  };

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const files = Array.from(e.target.files).filter((f) =>
      f.type.startsWith("image/")
    );

    // 🔒 VALIDASI MAX 6 FOTO
    if (previews.length + serverPreviews.length + files.length > 6) {
      showNotification("error", "Maksimal 6 foto lapangan");
      return;
    }

    setPreviews((prev) => [...prev, ...files]);
  };

  const openFileDialog = () => fileInputRef.current?.click();
  const removeFile = (idx: number, isServer = false) => {
    if (isServer) {
      setDeletedImages((prev) => [...prev, serverPreviews[idx].url]);

      const newList = serverPreviews.filter((_, i) => i !== idx);
      setServerPreviews(newList);

      if (utamaType === "server") {
        if (utamaServerIndex === idx) {
          setUtamaServerIndex(newList.length > 0 ? 0 : null);
        } else if (utamaServerIndex! > idx) {
          setUtamaServerIndex(utamaServerIndex! - 1);
        }
      }
    } else {
      if (utamaType === "new" && utamaNewIndex === idx) {
        setUtamaNewIndex(null);
        setFileUtamaIndex(null);
      }

      setPreviews((prev) => prev.filter((_, i) => i !== idx));
    }
  };

  const setAsUtama = (idx: number) => setFileUtamaIndex(idx);

  // =========================
  // Submit Form
  // =========================
  const handleSubmit = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      const token = Cookies.get("token");
      if (!token) throw new Error("Token tidak ditemukan");

      // =====================
      // Buat FormData
      // =====================
      const formData = new FormData();

      if (isEdit) {
        formData.append("deletedImages", JSON.stringify(deletedImages));
      }

      // Data utama
      formData.append("nama", namaLapangan || "");
      formData.append("lokasi", lokasi || "");
      formData.append("deskripsi", deskripsi || "");
      formData.append("harga", harga.replace(/\D/g, "") || "0"); // default 0
      formData.append("tipe", tipeLapangan || "");
      formData.append("alamat", lokasiDetail || "");
      formData.append("maps", linkMaps || "");
      formData.append("fasilitas", JSON.stringify(selectedFasilitas || []));
      formData.append("interval", ((interval || 1) * 60).toString()); // convert ke menit
      formData.append("breakTime", (breakTime || 10).toString()); // default 10 menit
      formData.append("startTime", startTime || "08:00");
      formData.append("utamaType", utamaType);

      if (utamaType === "server" && utamaServerIndex !== null) {
        formData.append("utamaServerIndex", String(utamaServerIndex));
      }

      if (utamaType === "new" && utamaNewIndex !== null) {
        formData.append("utamaNewIndex", String(utamaNewIndex));
      }

      // Foto utama
      // =====================
      // Foto utama (AMAN)
      // =====================
      let finalUtamaNewIndex = utamaNewIndex;

      // auto set foto utama jika belum dipilih
      if (
        utamaType === "new" &&
        finalUtamaNewIndex === null &&
        previews.length > 0
      ) {
        finalUtamaNewIndex = 0;
      }

      // =====================
      // Upload gambar baru (SELALU)
      // =====================
      if (previews.length > 0) {
        previews.forEach((file, idx) => {
          if (utamaType === "new" && idx === finalUtamaNewIndex) {
            formData.append("gambarUtama", file);
          } else {
            formData.append("gambarList", file);
          }
        });
      }

      // Gambar lama yang tetap dipakai
      if (isEdit) {
        formData.append(
          "existingGambar",
          JSON.stringify(serverPreviews.map((img) => img.url.split("/").pop()))
        );
      }

      // =====================
      // Debug: cek isi FormData
      // =====================
      // console.log("FormData entries:");
      // for (const [key, value] of formData.entries()) console.log(key, value);

      // =====================
      // Request ke backend
      // =====================
      const url = isEdit
        ? `http://localhost:5000/api/lapangan/mitra/lapangan/${slug}`
        : "http://localhost:5000/api/lapangan/mitra/lapangan/tambah-data";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      });

      const text = await res.text();

      console.log("STATUS:", res.status);
      console.log("RESPONSE TEXT:", text);

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        data = { message: text };
      }

      if (!res.ok) {
        throw new Error(data?.message || "Gagal submit lapangan");
      }

      showNotification(
        "success",
        isEdit ? "Lapangan berhasil diperbarui!" : "Lapangan berhasil dibuat!"
      );

      setTimeout(() => {
        window.location.href = "/mitra/lapangan";
      }, 1000);
    } catch (err: any) {
      showNotification("error", err.message || "Terjadi kesalahan saat submit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const steps = ["Lapangan", "Detail", "Upload"];

  return (
    <div
      className={`min-h-screen bg-[#F5F9F7] flex items-center justify-center px-4 ${PoppinsRegular.className}`}
    >
      {/* Notification Overlay */}
      {showNotif && (
        <div
          className="fixed inset-0 flex items-center justify-center z-[999]"
          onClick={() => setShowNotif(false)} // klik backdrop tetap bisa tutup notif
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[1px]" />
          <div
            className="relative bg-white px-8 py-6 rounded-2xl shadow-xl w-[85%] max-w-md text-center animate-fadeIn"
            onClick={(e) => e.stopPropagation()} // klik popup tidak tutup notif
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className="w-13 h-13 rounded-full flex items-center justify-center text-white text-3xl font-bold"
                style={{
                  background: notifType === "success" ? "#2ecc71" : "#e74c3c",
                }}
              >
                {notifType === "success" ? "✓" : "!"}
              </div>
              <p className="text-gray-600 text-[16px] font-semibold">
                {notifMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white w-full max-w-lg rounded-2xl shadow-md p-10">
        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-4 mb-10">
          {steps.map((label, index) => {
            const isActive = step === index + 1;
            const isFinished = step > index + 1;
            const isLast = index === steps.length - 1;
            return (
              <div key={index} className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center font-semibold text-white transition-all duration-300"
                    style={{
                      background:
                        isActive || isFinished
                          ? "var(--color-primary)"
                          : "#e5e7eb",
                      color: isActive || isFinished ? "#fff" : "#6b7280",
                    }}
                  >
                    {index + 1}
                  </div>
                  <p
                    className="text-sm mt-1 font-medium whitespace-nowrap"
                    style={{
                      color:
                        isActive || isFinished
                          ? "var(--color-primary)"
                          : "#6b7280",
                    }}
                  >
                    {label}
                  </p>
                </div>
                {!isLast && (
                  <div
                    className="w-8 h-0.5 rounded"
                    style={{
                      background: isFinished
                        ? "var(--color-primary)"
                        : "#e5e7eb",
                    }}
                  ></div>
                )}
              </div>
            );
          })}
        </div>

        {/* Step Forms */}
        {step === 1 && (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold text-center text-gray-700 mb-3 ${PoppinsBold.className}`}
            >
              Lengkapi Data Lapangan
            </h2>
            <p className="text-center text-gray-500 mb-5">
              Semua data ini diperlukan untuk menambahkan lapangan padel Anda.
            </p>

            <label className="font-medium text-gray-700 text-[15px] ml-1">
              Nama Lapangan
            </label>
            <Input
              placeholder="Masukkan nama lapangan Anda"
              value={namaLapangan}
              onChange={(e) => setNamaLapangan(e.target.value)}
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            <label className="font-medium text-gray-700 text-[15px] ml-1 mt-4">
              Lokasi
            </label>
            <div className="relative w-full">
              <div
                className="border border-gray-300 rounded-xl p-2.5 pl-4 cursor-pointer flex justify-between items-center mt-2"
                onClick={() => setLokasiOpen((prev) => !prev)}
              >
                <span
                  className={
                    lokasi
                      ? "text-gray-700 text-[15px]"
                      : "text-gray-500 text-[15px]"
                  }
                >
                  {lokasi || "Pilih Lokasi"}
                </span>
                <ChevronDown
                  className={lokasiOpen ? "rotate-180" : ""}
                  size={20}
                />
              </div>

              {lokasiOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 shadow-lg text-[15px]">
                  {["Semarang Kota", "Kabupaten Semarang"].map((l) => (
                    <div
                      key={l}
                      className="p-3 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white"
                      onClick={() => {
                        setLokasi(l);
                        setLokasiOpen(false);
                      }}
                    >
                      {l}
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label className="font-medium text-gray-700 text-[15px] ml-1 mt-4">
              Harga per Jam
            </label>
            <Input
              placeholder="Masukkan harga per jam"
              value={harga}
              onChange={(e) => setHarga(formatRupiah(e.target.value))}
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            <Button
              className="w-full py-5 bg-[var(--color-primary)] hover:bg-[var(--color-hover)] text-white font-bold rounded-full shadow-lg mt-4 text-[15px]"
              onClick={() => {
                if (!namaLapangan || !lokasi || !harga) {
                  showNotification(
                    "error",
                    "Semua field di step 1 harus diisi!"
                  );
                  return;
                }

                setStep(2);
              }}
            >
              Lanjutkan
            </Button>
          </div>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold text-center text-gray-700 mb-3 ${PoppinsBold.className}`}
            >
              Detail Lapangan & Fasilitas
            </h2>
            <p className="text-center text-gray-500 mb-8">
              Lengkapi detail lapangan dan pilih fasilitas.
            </p>

            {/* Deskripsi multiline */}
            <label className="font-medium text-gray-700 text-[15px] ml-1">
              Deskripsi Lapangan
            </label>
            <textarea
              placeholder="Masukkan deskripsi lapangan Anda"
              value={deskripsi}
              onChange={(e) => setDeskripsi(e.target.value)}
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] resize-none h-28"
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            {/* Lokasi Detail */}
            <label className="font-medium text-gray-700 text-[15px] ml-1 mt-4">
              Lokasi Detail
            </label>
            <Input
              placeholder="Contoh: Jl. Kebon Jeruk, Kec. Jeruk, Kab. Semarang"
              value={lokasiDetail}
              onChange={(e) => setLokasiDetail(e.target.value)}
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            {/* Link Maps */}
            <label className="font-medium text-gray-700 text-[15px] ml-1 mt-4">
              Link Google Maps
            </label>
            <Input
              placeholder="<iframe src='https://www.google.com/maps/embed..."
              value={linkMaps}
              onChange={(e) => setLinkMaps(e.target.value)}
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            {/* Tipe Lapangan */}
            <label className="font-medium text-gray-700 text-[15px] ml-1 mt-4">
              Tipe Lapangan
            </label>
            <div className="relative w-full">
              <div
                className="border border-gray-300 rounded-xl p-2.5 pl-4 cursor-pointer flex justify-between items-center mt-2 text-[15px]"
                onClick={() => setTipeLapanganOpen((prev) => !prev)}
              >
                <span
                  className={
                    tipeLapangan
                      ? "text-gray-700 text-[15px]"
                      : "text-gray-500 text-[15px]"
                  }
                >
                  {tipeLapangan || "Pilih tipe"}
                </span>
                <ChevronDown
                  className={tipeLapanganOpen ? "rotate-180" : ""}
                  size={20}
                />
              </div>

              {tipeLapanganOpen && (
                <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-xl mt-1 shadow-lg text-[15px]">
                  {["indoor", "outdoor"].map((t) => (
                    <div
                      key={t}
                      className="p-3 cursor-pointer hover:bg-[var(--color-primary)] hover:text-white"
                      onClick={() => {
                        setTipeLapangan(t);
                        setTipeLapanganOpen(false);
                      }}
                    >
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Fasilitas */}
            <label className="block text-gray-700 mb-1 font-medium mt-4 ml-1">
              Fasilitas
            </label>
            <div className="flex flex-wrap gap-2 mt-2 mb-4">
              {[
                "Sewa Raket",
                "AC",
                "Mushola",
                "WiFi",
                "Ruang Ganti",
                "Toilet",
                "Parkir Mobil",
                "Parkir Motor",
                "Jual Minum",
                "Cafe",
                "Toko Olahraga",
                "Tribun Penonton",
                "Hot Shower",
                "Treatment Room",
                "Jual Makanan Ringan",
              ].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => toggleFasilitas(f)}
                  className={`px-3 py-1 rounded-full border transition-all text-[14px] ${
                    selectedFasilitas.includes(f)
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[var(--color-primary)/20]"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Interval per Sesi */}
            <label className="block text-gray-700 mb-1 font-medium mt-6 ml-1">
              Interval per Sesi (Jam)
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {[1, 1.5, 2].map((i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setInterval(Number(i))}
                  className={`px-3 py-1 rounded-full border transition-all text-[14px] ${
                    interval === i
                      ? "bg-[var(--color-primary)] text-white border-[var(--color-primary)]"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-[var(--color-primary)/20]"
                  }`}
                >
                  {i} Jam
                </button>
              ))}
            </div>

            {/* Jeda Antar Sesi */}
            <label className="block text-gray-700 mb-1 font-medium mt-4 ml-1">
              Jeda Antar Sesi (Menit)
            </label>
            <Input
              type="number"
              placeholder="Contoh: 10 menit"
              className="w-full pl-4 p-4 py-5 rounded-xl border border-gray-300 mt-2 text-[15px] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
              min={0}
              max={60}
              step={5}
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              style={
                {
                  "--tw-ring-color": "var(--color-primary)",
                } as React.CSSProperties
              }
            />

            {/* Button */}
            <div className="flex justify-between mt-3">
              <Button
                variant="outline"
                className="rounded-full border-gray-300 font-bold text-[15px]"
                onClick={() => setStep(1)}
              >
                Kembali
              </Button>
              <Button
                className="bg-[var(--color-primary)] hover:bg-[var(--color-hover)] font-bold rounded-full shadow-lg text-[15px]"
                onClick={() => {
                  if (
                    !deskripsi ||
                    !lokasiDetail ||
                    !linkMaps ||
                    !tipeLapangan
                  ) {
                    showNotification(
                      "error",
                      "Semua field di step 2 harus diisi!"
                    );
                    return;
                  }
                  setStep(3);
                }}
              >
                Lanjutkan
              </Button>
            </div>
          </div>
        )}

        {/* Step 3 */}
        {step === 3 && (
          <div className="space-y-6">
            <h2
              className={`text-2xl font-bold text-center text-gray-700 mb-3 ${PoppinsBold.className}`}
            >
              Upload Foto Lapangan
            </h2>
            <p className="text-center text-gray-500 mb-5">
              Upload minimal 3 foto lapangan.
            </p>

            <div
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-[var(--color-primary)] bg-[var(--color-primary)/10]"
                  : "border-gray-300 bg-gray-50/40"
              }`}
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDropFiles}
              onClick={openFileDialog}
            >
              {serverPreviews.length > 0 || previews.length > 0 ? (
                <div className="flex flex-wrap justify-center gap-4">
                  {/* ================= SERVER IMAGES ================= */}
                  {serverPreviews.map((img, idx) => {
                    const isUtama =
                      utamaType === "server" && utamaServerIndex === idx;

                    return (
                      <div
                        key={`server-${idx}`}
                        className={`relative rounded-xl overflow-hidden shadow-lg w-32 h-32 flex items-center justify-center transition-all
      ${
        isUtama
          ? "ring-4 ring-[var(--color-primary)] scale-[1.03]"
          : "hover:scale-[1.02]"
      }`}
                      >
                        <img
                          src={img.url}
                          alt={`Server ${idx}`}
                          className="w-full h-full object-cover"
                        />

                        {isUtama && (
                          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                        )}

                        {isUtama && (
                          <div className="absolute top-1 left-1 bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                            Foto Utama
                          </div>
                        )}

                        {/* Hapus */}
                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx, true);
                          }}
                        >
                          <X size={16} />
                        </button>

                        {/* Set utama */}
                        <button
                          type="button"
                          className={`absolute bottom-1 left-1 px-2 py-1 rounded-full flex items-center gap-1 text-xs shadow transition
        ${
          isUtama
            ? "bg-green-600 text-white cursor-default"
            : "bg-[var(--color-primary)] text-white"
        }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUtamaServer(idx);
                          }}
                        >
                          <Star size={12} /> {isUtama ? "Utama ✓" : "Set Utama"}
                        </button>
                      </div>
                    );
                  })}

                  {/* ================= NEW IMAGES ================= */}
                  {previews.map((file, idx) => {
                    const isUtama =
                      utamaType === "new" && utamaNewIndex === idx;

                    return (
                      <div
                        key={`new-${idx}`}
                        className={`relative rounded-xl overflow-hidden shadow-lg w-32 h-32 flex items-center justify-center transition-all
      ${
        isUtama
          ? "ring-4 ring-[var(--color-primary)] scale-[1.03]"
          : "hover:scale-[1.02]"
      }`}
                      >
                        <img
                          src={URL.createObjectURL(file)}
                          alt={`Preview ${idx}`}
                          className="w-full h-full object-cover"
                        />

                        {isUtama && (
                          <div className="absolute inset-0 bg-black/20 pointer-events-none"></div>
                        )}

                        {isUtama && (
                          <div className="absolute top-1 left-1 bg-[var(--color-primary)] text-white text-[10px] px-2 py-0.5 rounded-full shadow">
                            Foto Utama
                          </div>
                        )}

                        <button
                          type="button"
                          className="absolute top-1 right-1 bg-white p-1 rounded-full shadow hover:bg-red-500 hover:text-white transition"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeFile(idx);
                          }}
                        >
                          <X size={16} />
                        </button>

                        <button
                          type="button"
                          className={`absolute bottom-1 left-1 px-2 py-1 rounded-full flex items-center gap-1 text-xs shadow transition
        ${
          isUtama
            ? "bg-green-600 text-white cursor-default"
            : "bg-[var(--color-primary)] text-white"
        }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setUtamaType("new");
                            setUtamaNewIndex(idx);
                            setFileUtamaIndex(idx);
                            setUtamaServerIndex(null);
                          }}
                        >
                          <Star size={12} /> {isUtama ? "Utama ✓" : "Set Utama"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="p-4 rounded-full bg-gray-300 text-white shadow-lg">
                    <Upload size={28} />
                  </div>
                  <p className="font-medium text-gray-700">
                    Drop foto atau klik untuk upload
                  </p>
                  <p className="text-xs text-gray-500">
                    Max 6MB per file • JPG/PNG
                  </p>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            <div className="flex justify-between mt-6">
              <Button
                variant="outline"
                className="rounded-full border-gray-300 font-bold text-[15px]"
                onClick={() => setStep(2)}
              >
                Kembali
              </Button>
              <Button
                disabled={isSubmitting}
                className={`font-bold rounded-full shadow-lg text-[15px] ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[var(--color-primary)] hover:bg-[var(--color-hover)]"
                }`}
                onClick={() => {
                  const totalImages = serverPreviews.length + previews.length;

                  if (totalImages > 6) {
                    showNotification("error", "Maksimal 6 foto lapangan");
                    return;
                  }

                  if (totalImages < 3) {
                    showNotification(
                      "error",
                      "Minimal harus ada 3 foto lapangan"
                    );
                    return;
                  }

                  handleSubmit();
                }}
              >
                {isSubmitting ? "Memproses..." : "Submit"}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
