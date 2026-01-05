"use client";

import Navbar from "./navbar";
import React, { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import localFont from "next/font/local";
import GoogleMapEmbed from "./GoogleMapEmbed"; // path sesuai folder
import { addToCart } from "@/utils/cart";
import { useRouter } from "next/navigation";
import Notification from "@/components/Notification";

import Cookies from "js-cookie";

import { CartItem } from "@/types/cart";

const CART_KEY = "cart";

import {
  FaMosque,
  FaWifi,
  FaCar,
  FaMotorcycle,
  FaRestroom,
} from "react-icons/fa";
import {
  MdLocalDrink,
  MdOutlineSportsTennis,
  MdOutlineAir,
  MdRestaurant,
  MdShower,
  MdFastfood,
  MdHealthAndSafety,
  MdOutlineAirlineSeatReclineNormal,
} from "react-icons/md";
import { IoShirtSharp } from "react-icons/io5";

const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });
const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });

const fasilitasIcons: Record<string, React.ReactNode> = {
  ac: <MdOutlineAir size={18} className="text-gray-600" />,
  mushola: <FaMosque size={18} className="text-gray-600" />,
  wifi: <FaWifi size={18} className="text-gray-600" />,
  "ruang ganti": <IoShirtSharp size={18} className="text-gray-600" />,
  toilet: <FaRestroom size={18} className="text-gray-600" />,
  "parkir mobil": <FaCar size={18} className="text-gray-600" />,
  "parkir motor": <FaMotorcycle size={18} className="text-gray-600" />,
  "jual minum": <MdLocalDrink size={18} className="text-gray-600" />,
  minum: <MdLocalDrink size={18} className="text-gray-600" />,
  "sewa raket": <MdOutlineSportsTennis size={18} className="text-gray-600" />,
  "cafe & resto": <MdRestaurant size={18} className="text-gray-600" />,
  cafe: <MdRestaurant size={18} className="text-gray-600" />,
  resto: <MdRestaurant size={18} className="text-gray-600" />,
  "tribun penonton": (
    <MdOutlineAirlineSeatReclineNormal size={18} className="text-gray-600" />
  ),
  "hot shower": <MdShower size={18} className="text-gray-600" />,
  "treatment room": <MdHealthAndSafety size={18} className="text-gray-600" />,
  "jual makanan ringan": <MdFastfood size={18} className="text-gray-600" />,
};

function getMapsUrl(maps: string | null | undefined, alamat?: string | null) {
  if (!maps)
    return alamat
      ? `https://www.google.com/maps?q=${encodeURIComponent(
          alamat
        )}&output=embed`
      : null;

  const iframeMatch = maps.match(/src=["']([^"']+)["']/);
  if (iframeMatch && iframeMatch[1]) return iframeMatch[1];

  if (maps.includes("google.com") || maps.includes("goo.gl")) {
    try {
      const url = new URL(maps);
      return `https://www.google.com/maps?q=${encodeURIComponent(
        url.href
      )}&output=embed`;
    } catch {
      return null;
    }
  }

  return alamat
    ? `https://www.google.com/maps?q=${encodeURIComponent(alamat)}&output=embed`
    : null;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export type Slot = {
  id: number;
  tanggal: string;
  slot: string; // "08:00 - 09:00"
  jamMulai: string;
  jamSelesai: string;
  status: string;
};

export type LapanganDetail = {
  id: number;
  nama: string;
  slug: string;
  lokasi?: string | null;
  harga: number;
  rating?: number | null;
  status?: string | null;
  gambar?: string | null;
  gambarList?: string[];
  detail?: {
    alamat?: string | null;
    maps?: string | null;
    deskripsi?: string | null;
    type?: string | null;
    fasilitas?: string[] | null;
  };
  jadwal?: Slot[];
  ulasan?: unknown[];
};

const RatingStars = ({ rating = 0 }: { rating?: number | null }) => {
  const value = rating ?? 0;
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    stars.push(
      i <= Math.floor(value) ? (
        <AiFillStar key={i} className="text-yellow-400" />
      ) : (
        <AiOutlineStar key={i} className="text-yellow-400" />
      )
    );
  }
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">{stars}</div>
      <div className="text-sm text-gray-600 font-semibold">
        {value.toFixed(1)}
      </div>
    </div>
  );
};

export default function LapanganDetailComponent({
  lapangan,
}: {
  lapangan: LapanganDetail;
}) {
  // ---------- STATES ----------
  const [imgIndex, setImgIndex] = useState(0);
  const [isImgOpen, setIsImgOpen] = useState(false);
  const [isFacilitiesOpen, setIsFacilitiesOpen] = useState(false);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [cartSlots, setCartSlots] = useState<Slot[]>([]);
  const [loadingBooking, setLoadingBooking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );

  const [bookings, setBookings] = useState<any[]>([]);

  const router = useRouter();

  const scheduleRef = useRef<HTMLDivElement | null>(null);
  const dateCarouselRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    console.log("Lapangan Data:", lapangan);
  }, [lapangan]);

  useEffect(() => {
    if (!selectedDate || !lapangan.id) return;

    fetch(
      `${BACKEND_URL}/api/booking/lapangan/${lapangan.id}?tanggal=${selectedDate}`
    )
      .then((res) => res.json())
      .then((data) => {
        console.log("Fetched bookings data:", data); // Debug log
        setBookings(data);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setBookings([]);
      });
  }, [selectedDate, lapangan.id]);

  // normalize images
  const images = useMemo(() => {
    const raw = lapangan.gambarList?.length
      ? lapangan.gambarList
      : lapangan.gambar
      ? [lapangan.gambar]
      : [];

    return raw
      .filter((u) => typeof u === "string" && u.trim() !== "")
      .map((u) => {
        // sudah absolute
        if (u.startsWith("http://") || u.startsWith("https://")) return u;

        // dari backend: /img/lapangan/xxx.png
        if (u.startsWith("/img/")) return `${BACKEND_URL}${u}`;

        // fallback (jaga-jaga)
        return `${BACKEND_URL}/${u.replace(/^\/+/, "")}`;
      });
  }, [lapangan]);

  const generateSlots = (
    tanggal: string,
    start: string,
    end: string,
    intervalMinutes: number,
    breakMinutes: number,
    startId: number
  ) => {
    const slots: Slot[] = [];
    let id = startId;
    let current = new Date(`${tanggal}T${start}:00`);
    const endTime = new Date(`${tanggal}T${end}:00`);
    while (current < endTime) {
      const slotStart = current;
      const slotEnd = new Date(current.getTime() + intervalMinutes * 60000);
      if (slotEnd > endTime) break;
      const jamMulai = slotStart.toTimeString().slice(0, 5);
      const jamSelesai = slotEnd.toTimeString().slice(0, 5);
      slots.push({
        id: id++,
        tanggal,
        slot: `${jamMulai} - ${jamSelesai}`,
        jamMulai,
        jamSelesai,
        status: "tersedia",
      });
      current = new Date(slotEnd.getTime() + breakMinutes * 60000);
    }
    return { slots, nextId: id };
  };

  // auto generate slot jika lapangan.jadwal kosong
  const autoGenerateSlots = (
    existingSlots: Slot[],
    interval: number,
    breakTime: number
  ) => {
    const result: Record<string, Slot[]> = {};
    let nextId = existingSlots.length + 1;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      const iso = date.toISOString().split("T")[0];

      const daySlots = existingSlots.filter((s) => s.tanggal === iso);
      if (daySlots.length > 0) {
        result[iso] = daySlots;
        continue;
      }

      const { slots, nextId: newId } = generateSlots(
        iso,
        "09:00",
        "24:00",
        interval,
        breakTime,
        nextId
      );

      nextId = newId;
      result[iso] = slots;
    }

    return result;
  };

  // group slots by date
  console.log("lapangan.jadwal:", JSON.stringify(lapangan.jadwal, null, 2));

  const slotsByDate = useMemo(() => {
    const map: Record<string, Slot[]> = {};
    const jadwalArray: Slot[] = Array.isArray(lapangan.jadwal)
      ? lapangan.jadwal
      : (Object.values(lapangan.jadwal || {}).flat() as Slot[]);

    let nextId = jadwalArray.length + 1;
    const today = new Date();

    for (let i = 0; i < 7; i++) {
      const d = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const iso = d.toISOString().split("T")[0];

      const daySlots = jadwalArray.filter((s) => s.tanggal === iso);
      if (daySlots.length > 0) {
        map[iso] = daySlots;
        continue;
      }

      const pagi = generateSlots(iso, "08:00", "11:00", 60, 10, nextId);
      nextId = pagi.nextId;
      const siang = generateSlots(iso, "12:00", "16:00", 60, 10, nextId);
      nextId = siang.nextId;
      const malam = generateSlots(iso, "19:00", "22:00", 60, 10, nextId);
      nextId = malam.nextId;

      map[iso] = [...pagi.slots, ...siang.slots, ...malam.slots];
    }

    // urutkan per tanggal
    Object.keys(map).forEach((key) => {
      map[key].sort((a, b) => {
        const [ah, am] = a.slot.split(" - ")[0].split(":").map(Number);
        const [bh, bm] = b.slot.split(" - ")[0].split(":").map(Number);
        return ah * 60 + am - (bh * 60 + bm);
      });
    });

    return map;
  }, [lapangan.jadwal]);

  // current month & days
  const todayIso = useMemo(() => new Date().toLocaleDateString("sv-SE"), []);
  const currentMonth = useMemo(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  }, []);
  const daysInMonth = useMemo(() => {
    const { year, month } = currentMonth;
    const last = new Date(year, month + 1, 0);
    const days: string[] = [];
    for (let d = 1; d <= last.getDate(); d++) {
      const date = new Date(year, month, d);
      // pakai locale sv-SE supaya format yyyy-mm-dd tetap sama
      days.push(date.toLocaleDateString("sv-SE"));
    }
    return days;
  }, [currentMonth]);

  const isToday = (iso: string) => iso === todayIso;

  const groupSlotsByPeriod = (slots: Slot[]) => {
    const pagi: Slot[] = [];
    const siang: Slot[] = [];
    const malam: Slot[] = [];

    slots.forEach((s) => {
      const start = s.slot.split("-")[0].trim();
      const hour = parseInt(start.split(":")[0], 10);
      if (hour >= 8 && hour < 12) pagi.push(s);
      else if (hour >= 12 && hour < 17) siang.push(s);
      else malam.push(s);
    });

    return { pagi, siang, malam };
  };

  const openGallery = (index = 0) => {
    setImgIndex(index);
    setIsImgOpen(true);
  };

  const toggleSlot = (jadwalId: number, status: string) => {
    if (status !== "tersedia") return;
    setSelectedSlots((prev) =>
      prev.includes(jadwalId)
        ? prev.filter((x) => x !== jadwalId)
        : [...prev, jadwalId]
    );
  };

  const handleCheckAvailability = () => {
    scheduleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollDates = (dir: "left" | "right") => {
    if (!dateCarouselRef.current) return;
    const el = dateCarouselRef.current;
    const amount = el.clientWidth * 0.6;
    el.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isSlotBooked = (slot: Slot) => {
    return bookings.some(
      (b) => slot.jamMulai < b.jam_selesai && slot.jamSelesai > b.jam_mulai
    );
  };

  const isSlotExpired = (tanggal: string, jamMulai: string) => {
    const slotTime = new Date(`${tanggal}T${jamMulai}:00`);
    return slotTime <= new Date();
  };

  useEffect(() => {
    if (!notification) return;
    const t = setTimeout(() => setNotification(null), 2000);
    return () => clearTimeout(t);
  }, [notification]);

  const handleAddSelectedSlotsToCart = () => {
    const userId = Number(Cookies.get("user_id"));
    if (!userId) return;

    const daySlots = slotsByDate[selectedDate] || [];

    const selectedSlotObjects = daySlots.filter((s) =>
      selectedSlots.includes(s.id)
    );

    if (selectedSlotObjects.length === 0) return;

    selectedSlotObjects.forEach((jadwal) => {
      addToCart(userId, {
        slotId: Date.now() + jadwal.id, // UI only
        jadwalId: jadwal.id, // 🔥 Ini yang dipakai backend
        lapanganId: lapangan.id,
        lapanganNama: lapangan.nama,
        lapanganSlug: lapangan.slug,
        tanggal: jadwal.tanggal,
        jamMulai: jadwal.jamMulai,
        jamSelesai: jadwal.jamSelesai,
        harga: lapangan.harga,
        supportsRaket: hasSewaRaket,
        extras: { sewaRaket: false },
        isBooked: false,
      });
    });

    setNotification({
      type: "success",
      message: "Jadwal berhasil masuk ke keranjang",
    });
  };

  const hasSewaRaket = useMemo(() => {
    return (
      lapangan.detail?.fasilitas
        ?.map((f) => f.toLowerCase())
        .includes("sewa raket") ?? false
    );
  }, [lapangan.detail?.fasilitas]);

  const handleBooking = async () => {
    if (selectedSlots.length === 0) {
      setMessage("Pilih minimal 1 slot untuk booking.");
      return;
    }

    setLoadingBooking(true);
    setMessage(null);

    try {
      // Ambil semua slot di tanggal yang sedang dipilih
      const daySlots = slotsByDate[selectedDate] || [];

      // Filter slot yang dipilih user
      const bookedSlots = selectedSlots
        .map((slotId) => daySlots.find((s) => s.id === slotId))
        .filter(Boolean) as Slot[];

      if (bookedSlots.length === 0) {
        setMessage("Slot tidak valid.");
        setLoadingBooking(false);
        return;
      }

      // tanggalMulai otomatis dari slot pertama
      const tanggalMulai = bookedSlots[0].tanggal;

      // jam mulai: dari slot pertama, jam selesai: dari slot terakhir
      const jamMulai = bookedSlots[0].slot.split(" - ")[0];
      const jamSelesai =
        bookedSlots[bookedSlots.length - 1].slot.split(" - ")[1];

      const payload = {
        user_id: Number(Cookies.get("user_id")) || 1,
        lapangan_id: lapangan.id,
        tanggalMulai, // otomatis
        jamMulai,
        jamSelesai,
        jadwal_ids: bookedSlots.map((s) => s.id),
      };

      const res = await fetch(`${BACKEND_URL}/api/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) setMessage(data?.error || "Booking gagal");
      else {
        setMessage(
          `Booking berhasil! Tanggal: ${tanggalMulai}, ${jamMulai} - ${jamSelesai}`
        );
        setSelectedSlots([]);
        // TODO: refetch jadwal kalau API mendukung
      }
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Network error");
    } finally {
      setLoadingBooking(false);
    }
  };

  return (
    <div className={`${PoppinsRegular.className} w-full bg-gray-50 p-4 md:p-6`}>
      <div className="-mt-6">
        <Navbar />
      </div>

      <div className="max-w-[80%] mx-auto mt-10">
        {/* top: gallery + sidebar */}
        <div className="lg:flex lg:items-start lg:gap-6">
          {/* left: images + info */}
          <div className="lg:flex-1 space-y-5">
            {/* IMAGE GRID WRAPPER (relative) */}
            <div className="relative">
              <div className="grid grid-cols-3 gap-3">
                {/* MAIN IMAGE */}
                <div
                  className="relative col-span-3 md:col-span-2 aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition group"
                  onClick={() => openGallery(0)}
                >
                  {lapangan.status && (
                    <span
                      className={`absolute top-3 right-3 z-10 px-3 py-1 text-xs font-semibold rounded-full
            ${
              lapangan.status.toLowerCase() === "tersedia"
                ? "bg-green-600 text-white"
                : "bg-yellow-500 text-white"
            }`}
                    >
                      {lapangan.status.replace(/_/g, " ")}
                    </span>
                  )}

                  {images[0] ? (
                    <Image
                      src={images[0]}
                      alt="Lapangan utama"
                      fill
                      unoptimized
                      className="object-contain group-hover:scale-[1.03] transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                      No image
                    </div>
                  )}
                </div>

                {/* RIGHT IMAGES */}
                <div className="hidden md:flex flex-col gap-3 col-span-1">
                  {[1, 2].map((idx) => (
                    <div
                      key={idx}
                      onClick={() => images[idx] && openGallery(idx)}
                      className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-xl transition group"
                    >
                      {images[idx] ? (
                        <>
                          <Image
                            src={images[idx]}
                            alt={`Lapangan ${idx + 1}`}
                            fill
                            unoptimized
                            className="object-contain group-hover:scale-[1.05] transition-transform duration-500"
                          />

                          {idx === 2 && images.length > 3 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white font-semibold text-lg">
                              +{images.length - 2} foto
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                          More
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {images.length > 0 && (
                <button
                  onClick={() => openGallery(0)}
                  className="absolute bottom-4 right-4 bg-black/70 hover:bg-black/80 text-white text-sm px-4 py-2 rounded-xl shadow-lg transition"
                >
                  Lihat Semua Foto
                </button>
              )}
            </div>

            <div className="flex justify-between">
              <div>
                {/* TITLE / RATING / LOCATION */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                  <div>
                    <h1
                      className={`text-2xl text-gray-700 font-bold mt-8 ${PoppinsBold.className}`}
                    >
                      {lapangan.nama}
                    </h1>
                    <div className="flex items-center gap-1.5 mt-2">
                      <RatingStars rating={lapangan.rating ?? 0} />
                      <p className="text-xl text-gray-500">•</p>
                      <div className="flex text-[14px] items-center gap-1 text-gray-600">
                        <span>{lapangan.lokasi ?? "-"}</span>
                      </div>
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-2 ${PoppinsRegular.className}`}
                    >
                      <Image
                        src="https://asset.ayo.co.id/assets/img/padel.png"
                        alt="Padel Icon"
                        width={18}
                        height={18}
                      />
                      <p className="text-[14px] text-gray-500">Padel</p>
                    </div>
                  </div>
                  {/* inline small actions could go here */}
                </div>

                <div className="w-[100%] h-px bg-gray-300 my-4 opacity-60"></div>

                {/* DESCRIPTION */}
                <div>
                  <h2 className="text-[17px] text-gray-700 font-semibold">
                    Deskripsi
                  </h2>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[14px] whitespace-pre-line w-[80%]">
                    {lapangan.detail?.deskripsi ?? "Belum ada deskripsi."}
                  </p>
                </div>

                {/* MAP */}
                {lapangan.detail && (
                  <div className="mt-6">
                    <h2 className="text-[16px] font-semibold text-gray-700">
                      Lokasi Venue
                    </h2>

                    {lapangan.detail?.alamat && (
                      <p className="text-gray-600 text-[14px] mt-2">
                        {lapangan.detail.alamat
                          .split(" ")
                          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                          .join(" ")}
                      </p>
                    )}

                    <GoogleMapEmbed
                      maps={lapangan.detail.maps}
                      className="mt-3"
                    />
                  </div>
                )}

                <div className="w-[100%] h-px bg-gray-300 mt-5 my-4 opacity-60"></div>

                {/* TYPE LAPANGAN */}
                <div>
                  <h2 className="text-[16px] font-semibold text-gray-700">
                    Type Lapangan
                  </h2>
                  <p className="text-gray-600 text-[14px] mt-2">
                    {lapangan.detail?.type
                      ? lapangan.detail.type.charAt(0).toUpperCase() +
                        lapangan.detail.type.slice(1)
                      : "Belum ada deskripsi."}
                  </p>
                </div>

                {/* FASILITAS */}
                <div>
                  <h2 className="text-[19px] text-gray-700 font-semibold mt-6">
                    Fasilitas
                  </h2>

                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                    {(lapangan.detail?.fasilitas || [])
                      .slice(0, 6)
                      .map((f, i) => {
                        const key = f.toLowerCase();
                        const Icon = fasilitasIcons[key];

                        // Ubah jadi Kapital di awal kata
                        const capitalized =
                          f.charAt(0).toUpperCase() + f.slice(1);

                        return (
                          <div
                            key={i}
                            className="flex items-center gap-2 text-[15px] text-gray-500"
                          >
                            {Icon || (
                              <span className="w-4 h-4 bg-gray-300 rounded-full" />
                            )}
                            <span>{capitalized}</span>
                          </div>
                        );
                      })}
                  </div>

                  <div className="mt-5">
                    <button
                      onClick={() => setIsFacilitiesOpen(true)}
                      className="px-4 py-2 text-[14px] rounded-full bg-[var(--color-primary)] text-white hover:bg-[var(--color-hover)] transition duration-300"
                    >
                      Lihat Semua Fasilitas
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-4 h-full border rounded-2xl shadow-sm top-6 mt-6">
                <div className="text-[14px] font-medium text-gray-500">
                  Mulai dari
                </div>

                <div className="mt-1">
                  <span className="text-[22px] font-bold text-gray-700">
                    Rp {Number(lapangan.harga).toLocaleString("id-ID")}
                  </span>
                  <span className="text-[14px] text-gray-600 ml-1">
                    Per Sesi
                  </span>
                </div>

                <button
                  onClick={handleCheckAvailability}
                  className="w-full text-[16px] mt-3 py-2 rounded-xl text-white font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-hover)] transition duration-300"
                >
                  Cek Ketersediaan
                </button>

                <div className="mt-3">
                  <div className="text-xs text-gray-500">Catatan</div>
                  <div className="text-xs text-gray-700 mt-0.5 leading-relaxed">
                    Pilih slot lebih dari 1 untuk booking beberapa jam
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div ref={scheduleRef} className="mt-10">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl text-gray-800 font-bold">
              {new Date().toLocaleString("id-ID", {
                month: "long",
                year: "numeric",
              })}
            </h2>

            <div className="flex items-center gap-2">
              <button
                onClick={() => scrollDates("left")}
                className="p-2 rounded-md bg-white text-gray-500 shadow-sm"
              >
                <FaChevronLeft />
              </button>
              <button
                onClick={() => scrollDates("right")}
                className="p-2 rounded-md bg-white text-gray-500 shadow-sm"
              >
                <FaChevronRight />
              </button>
            </div>
          </div>

          {/* horizontal date carousel */}
          <div
            ref={dateCarouselRef}
            className="flex gap-3 overflow-x-auto overflow-y-visible pb-4 pt-2 no-scrollbar"
          >
            {daysInMonth.map((iso) => {
              const d = new Date(iso);
              const dayName = d.toLocaleDateString("id-ID", {
                weekday: "short",
              });
              const dayNum = d.toLocaleDateString("id-ID", { day: "numeric" });
              const isSel = selectedDate === iso;
              const isNow = isToday(iso);

              return (
                <button
                  key={iso}
                  onClick={() => setSelectedDate(iso)}
                  className={`
          relative z-10 min-w-[90px] flex-shrink-0 flex flex-col items-center gap-1 
          px-3 py-3 rounded-2xl transition-shadow

          ${
            isSel
              ? "bg-[var(--color-primary)] text-white shadow-lg"
              : "bg-white text-gray-700 hover:shadow-md"
          }

          ${isNow && !isSel ? "ring-2 ring-green-500" : ""}
        `}
                >
                  <div
                    className={`${
                      isSel ? "text-white" : "text-gray-600"
                    } text-xs`}
                  >
                    {dayName}
                  </div>

                  <div
                    className={`${
                      isSel ? "text-white" : "text-gray-800"
                    } text-lg font-bold`}
                  >
                    {dayNum}
                  </div>

                  <div
                    className={`text-xs ${
                      isSel ? "text-white" : "text-gray-700/60"
                    }`}
                  >
                    {d.toLocaleDateString("id-ID", { month: "short" })}
                  </div>
                </button>
              );
            })}
          </div>

          {/* slots for selectedDate grouped by period */}
          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-5">
            {(() => {
              const daySlots = slotsByDate[selectedDate] || [];
              const { pagi, siang, malam } = groupSlotsByPeriod(daySlots);
              const periodCard = (
                title: string,
                from: string,
                to: string,
                slots: Slot[],
                date: string
              ) => (
                <div
                  key={title + date}
                  className="bg-white border rounded-2xl p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="text-sm font-semibold text-gray-700">
                        {title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {from} - {to}
                      </div>
                    </div>
                    <div className="text-xs text-gray-400">
                      {slots.length} slot
                    </div>
                  </div>

                  {slots.length === 0 ? (
                    <div className="text-center text-sm text-gray-400 py-6">
                      Tidak ada slot
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-3">
                      {slots.map((s) => {
                        const [start, end] = s.slot.split(" - ");

                        const expired = isSlotExpired(s.tanggal, start);

                        const bookedByServer = isSlotBooked(s);

                        const disabled =
                          s.status !== "tersedia" || bookedByServer || expired;
                        const selected = selectedSlots.includes(s.id);

                        return (
                          <button
                            key={s.id}
                            disabled={disabled}
                            onClick={() => {
                              if (disabled) return;
                              toggleSlot(s.id, s.status);
                            }}
                            className={`w-full flex items-center justify-between gap-3 p-3 rounded-lg transition border
  ${
    disabled
      ? "bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200"
      : selected
      ? "bg-[var(--color-primary)] text-white border-green-500"
      : "bg-white hover:bg-[var(--color-hover)] hover:text-white border-gray-200"
  }
`}
                          >
                            <div className="text-sm text-left">
                              <div
                                className={`font-semibold ${
                                  selected ? "text-white" : "text-gray-700"
                                }`}
                              >
                                {s.slot}
                              </div>
                              <div
                                className={`text-xs mt-1 ${
                                  disabled ? "text-gray-400" : "text-gray-500"
                                }`}
                              >
                                {expired
                                  ? "Waktu telah lewat"
                                  : bookedByServer
                                  ? "Sudah dipesan"
                                  : "Tersedia"}
                              </div>
                            </div>
                            <div>
                              <div
                                className={`text-xs px-3 py-1 rounded-full ${
                                  expired
                                    ? "bg-gray-200 text-gray-500"
                                    : disabled
                                    ? "bg-red-100 text-red-600"
                                    : selected
                                    ? "bg-white/20 text-white"
                                    : "bg-green-100 text-green-700"
                                }`}
                              >
                                {expired
                                  ? "Expired"
                                  : selected
                                  ? "Terpilih"
                                  : "Pilih"}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );

              return [
                periodCard("Pagi", "08:00", "11:00", pagi, selectedDate),
                periodCard("Siang", "12:00", "16:00", siang, selectedDate),
                periodCard("Malam", "19:00", "22:00", malam, selectedDate),
              ];
            })()}
          </div>

          {/* mobile booking */}
          <div className="md:hidden fixed left-0 right-0 bottom-4 px-4">
            <div className="max-w-3xl mx-auto">
              <button
                onClick={handleBooking}
                disabled={loadingBooking}
                className="w-full py-3 rounded-xl text-white font-semibold bg-[var(--color-primary)] hover:bg-[var(--color-hover)]"
              >
                {loadingBooking ? "Memproses..." : "Booking Sekarang"}
              </button>
            </div>
          </div>
        </div>

        {/* IMAGE LIGHTBOX MODAL */}
        {isImgOpen && images.length > 0 && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsImgOpen(false)} // klik background close
          >
            <div
              className="relative max-w-4xl w-full h-[70vh] scale-95 opacity-0 animate-openLightbox"
              onClick={(e) => e.stopPropagation()} // mencegah close saat klik konten
            >
              {/* CLOSE */}
              <button
                onClick={() => setIsImgOpen(false)}
                className="absolute -top-12 -right-9 z-20 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <FaTimes size={23} />
              </button>

              {/* LEFT */}
              <button
                onClick={() =>
                  setImgIndex((p) => (p === 0 ? images.length - 1 : p - 1))
                }
                className="absolute -left-13 top-1/2 -translate-y-1/2 z-20 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <FaChevronLeft size={20} />
              </button>

              {/* RIGHT */}
              <button
                onClick={() =>
                  setImgIndex((p) => (p === images.length - 1 ? 0 : p + 1))
                }
                className="absolute -right-13 top-1/2 -translate-y-1/2 z-20 text-white rounded-full p-3 shadow-lg hover:scale-110 transition-transform duration-300"
              >
                <FaChevronRight size={20} />
              </button>

              {/* IMAGE */}
              <div className="relative w-full h-full rounded-xl overflow-hidden">
                <Image
                  key={images[imgIndex]}
                  src={images[imgIndex]}
                  alt={`img-${imgIndex}`}
                  fill
                  unoptimized
                  className="object-contain transition-opacity duration-500 ease-in-out"
                />
              </div>

              {/* THUMBNAILS */}
              <div className="absolute left-1/2 -translate-x-1/2 -bottom-24 flex gap-4 px-4">
                {images.map((u, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`relative w-26 h-20 rounded overflow-hidden border transition-transform duration-300 ${
                      i === imgIndex
                        ? "ring-3 ring-[var(--color-primary)] scale-110"
                        : "hover:scale-105"
                    }`}
                  >
                    <Image
                      src={u}
                      alt={`thumb-${i}`}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* FACILITIES MODAL (NOT AUTO CLOSE) */}
        {isFacilitiesOpen && (
          <div
            className="fixed inset-0 z-40 flex items-center justify-center bg-black/60"
            onClick={() => setIsFacilitiesOpen(false)}
          >
            <div className="bg-white rounded-xl w-[min(720px,95%)] p-6 relative max-h-[85vh] overflow-y-auto animate-openLightbox">
              <button
                onClick={() => setIsFacilitiesOpen(false)}
                className="absolute top-4 right-4 p-2 rounded-full text-xl text-gray-700 hover:text-gray-400 transition duration-300 cursor-pointer"
              >
                <FaTimes />
              </button>

              {/* Title */}
              <h3 className="text-[21px] font-bold mb-6 mt-[-10px] text-gray-700">
                Tentang Venue
              </h3>

              {/* Deskripsi */}
              <div className="mb-3">
                <h4 className="text-[16px] font-bold text-gray-700">
                  Deskripsi
                </h4>
                <p className="text-gray-500 text-[14px] mt-2 leading-relaxed">
                  {lapangan.detail?.deskripsi}
                </p>
              </div>

              <div className="w-[100%] h-px bg-gray-200 my-3 opacity-60"></div>

              {/* Fasilitas */}
              <div className="mb-6">
                <h4 className="text-[16px] font-bold text-gray-700">
                  Fasilitas
                </h4>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3 text-[14px]">
                  {(lapangan.detail?.fasilitas || []).map((f, i) => {
                    const key = f.toLowerCase();
                    const Icon = fasilitasIcons[key];

                    const capitalized =
                      f.length > 0 ? f.charAt(0).toUpperCase() + f.slice(1) : f;

                    return (
                      <div
                        key={i}
                        className="flex items-center gap-3 p-3 border rounded-lg bg-gray-50"
                      >
                        {Icon || (
                          <span className="w-3 h-3 bg-gray-300 rounded-full" />
                        )}

                        <span className="text-gray-700">{capitalized}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="w-[100%] h-px bg-gray-200 my-3 opacity-60"></div>

              {/* Kebijakan Refund & Reschedule */}
              <div>
                <h4 className="text-[16px] font-bold text-gray-700">
                  Kebijakan refund & reschedule
                </h4>
                <p className="text-gray-500 mt-2 leading-relaxed text-[14px]">
                  Reschedule hingga 3 hari sebelum jadwal sewa. Hanya berlaku
                  untuk 1 kali reschedule.
                </p>
              </div>
            </div>
          </div>
        )}

        <style jsx>{`
          @keyframes openLightbox {
            0% {
              opacity: 0;
              transform: scale(0.95);
            }
            100% {
              opacity: 1;
              transform: scale(1);
            }
          }

          .animate-openLightbox {
            animation: openLightbox 0.3s forwards;
          }
        `}</style>

        {/* booking action - mobile: float bottom */}
        <div className="mt-6 flex justify-end items-center gap-3">
          <button
            onClick={handleAddSelectedSlotsToCart}
            disabled={selectedSlots.length === 0}
            className="bg-green-600 text-white px-4 py-2 rounded-xl disabled:opacity-50"
          >
            Masukkan ke Keranjang ({selectedSlots.length})
          </button>

          {message && <div className="text-gray-700">{message}</div>}
        </div>
      </div>

      {notification && (
        <Notification type={notification.type} message={notification.message} />
      )}
    </div>
  );
}
