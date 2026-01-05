"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AiFillStar, AiOutlineSearch } from "react-icons/ai";
import localFont from "next/font/local";
import { useRouter } from "next/navigation";
import { FilterValues } from "./filterSidebarComponents";

const PoppinsRegular = localFont({ src: "../fonts/Poppins-Regular.ttf" });
const PoppinsBold = localFont({ src: "../fonts/Poppins-Bold.ttf" });

export interface Lapangan {
  id: number;
  nama: string;
  slug: string;
  lokasi: string | null;
  harga: number;
  rating: number | null;
  status: string | null;
  gambar: string | null;
  type?: string | null;
  facilities: string[];
}

interface LapanganAPI {
  id: number;
  nama: string;
  slug: string;
  lokasi: string | null;
  harga: number;
  rating: number | null;
  status: string | null;
  gambar: string | null;
  type?: string | null;
  fasilitas: string[];

  detail?: LapanganDetail; // <--- TAMBAHKAN INI
}

interface LapanganDetail {
  id: number;
  lapangan_id: number;
  alamat: string;
  maps: string;
  deskripsi: string;
  type: string;
  fasilitas: string[];
}

interface LapanganComponentsProps {
  filters: FilterValues;
}

const LapanganComponents: React.FC<LapanganComponentsProps> = ({ filters }) => {
  const [lapanganList, setLapanganList] = useState<Lapangan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const router = useRouter();

  useEffect(() => {
    const fetchLapangan = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/lapangan");
        const data: LapanganAPI[] = await res.json();

        const mappedData: Lapangan[] = data.map((lap) => {
          let imageUrl: string | null = null;

          if (lap.gambar) {
            imageUrl = lap.gambar.startsWith("http")
              ? lap.gambar
              : `http://localhost:5000${lap.gambar}`;
          }

          return {
            ...lap,
            gambar: imageUrl,
            type: lap.type ?? lap.detail?.type ?? null,
            facilities: lap.detail?.fasilitas ?? [],
          };
        });

        setLapanganList(mappedData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLapangan();
  }, []);

  const isFiltering =
    filters.type !== "Semua Jenis" ||
    filters.price !== "Semua Harga" ||
    filters.rating !== "Semua Rating" ||
    filters.facilities.length > 0 ||
    search.trim() !== "";

  const filteredLapangan = isFiltering
    ? lapanganList.filter((lap) => {
        if (search.trim() !== "") {
          const s = search.toLowerCase();
          if (
            !lap.nama.toLowerCase().includes(s) &&
            !lap.lokasi?.toLowerCase().includes(s)
          )
            return false;
        }
        if (filters.type !== "Semua Jenis") {
          const t = (lap.type ?? "").toLowerCase();
          if (t !== filters.type.toLowerCase()) return false;
        }

        if (
          filters.facilities.length > 0 &&
          !filters.facilities.every((fac) =>
            lap.facilities
              .map((f) => f.toLowerCase())
              .includes(fac.toLowerCase())
          )
        )
          return false;
        if (filters.price === "< 100K" && lap.harga >= 100000) return false;
        if (
          filters.price === "100K - 200K" &&
          !(lap.harga >= 100000 && lap.harga <= 200000)
        )
          return false;
        if (filters.price === "> 200K" && lap.harga <= 200000) return false;
        if (filters.rating === "4+" && (lap.rating ?? 0) < 4) return false;
        if (filters.rating === "4.5+" && (lap.rating ?? 0) < 4.5) return false;
        if (filters.rating === "5" && (lap.rating ?? 0) < 5) return false;
        return true;
      })
    : lapanganList;

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center text-center mt-20 text-gray-500">
        Loading...
      </div>
    );

  return (
    <div className="flex-1 p-4 sm:p-8">
      {/* Search Input */}
      <div className="mb-6 relative">
        <AiOutlineSearch
          className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          size={20}
        />
        <input
          type="text"
          placeholder="Cari nama lapangan atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={`w-full pl-12 p-3 rounded-xl border border-gray-300 text-gray-700 
            focus:outline-none focus:ring-1 focus:ring-(--color-primary)
            transition-all duration-300 text-[16px] font-medium ${PoppinsRegular.className}`}
        />
      </div>

      {/* Lapangan Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-[70px] mt-7 min-h-[200px]">
        {filteredLapangan.length > 0 ? (
          filteredLapangan.map((lap) => {
            const isMaintenance =
              lap.status?.toLowerCase() === "dalam_perbaikan";
            return (
              <div
                key={lap.id}
                onClick={() => {
                  if (!isMaintenance) {
                    router.push(`/lapangan/${lap.slug}`);
                  }
                }}
                className={`${
                  isMaintenance ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div
                  className={`
    relative rounded-2xl flex flex-col h-full
    w-full sm:w-72 md:w-88 lg:w-[280px]
    transition-all duration-300 ease-in-out
    ${
      isMaintenance
        ? "bg-gray-200 border border-gray-300 opacity-65 shadow-lg transform hover:scale-[1.02] "
        : "bg-white shadow-lg hover:shadow-2xl transform hover:scale-[1.02]"
    }
  `}
                >
                  {/* Status */}
                  <span
                    className={`
    absolute top-3 right-3
    px-3 py-1
    text-sm font-semibold
    rounded-full shadow-md
    flex items-center justify-center
    ${
      lap.status?.toLowerCase() === "tersedia"
        ? "bg-green-600 text-white"
        : lap.status?.toLowerCase() === "dalam_perbaikan"
        ? "bg-yellow-500 text-white"
        : "bg-gray-500 text-white"
    }
  `}
                  >
                    {lap.status
                      ? lap.status
                          .replace(/_/g, " ") // underscore → spasi
                          .replace(/\b\w/g, (c) => c.toUpperCase()) // kapital tiap kata
                      : "Tidak Tersedia"}
                  </span>

                  {/* Gambar */}
                  {lap.gambar ? (
                    <img
                      src={lap.gambar}
                      alt={lap.nama}
                      className="w-full h-48 object-contain rounded-t-2xl"
                    />
                  ) : (
                    <div className="w-full h-48 bg-gray-300 flex items-center justify-center text-white rounded-t-2xl">
                      No Image
                    </div>
                  )}

                  {/* Info */}
                  <div className="p-4 space-y-2 flex flex-col flex-1">
                    <p
                      className={`text-[13px] text-gray-400 ${PoppinsBold.className}`}
                    >
                      Venue
                    </p>
                    <p
                      className={`text-[18px] font-bold text-gray-700 ${PoppinsBold.className}`}
                    >
                      {lap.nama}
                    </p>

                    <div
                      className={`flex items-center gap-1.5 text-sm text-gray-600 -mt-1.5 ${PoppinsRegular.className}`}
                    >
                      <AiFillStar className="text-yellow-400 text-[18px]" />
                      <span>{lap.rating?.toFixed(1) ?? "0.0"}</span>
                      <p className="text-xl text-gray-500">•</p>
                      <span className="text-[14px]">
                        {lap.lokasi ?? "Lokasi tidak tersedia"}
                      </span>
                    </div>

                    <div
                      className={`flex items-center gap-1 mt-[-3px] ${PoppinsRegular.className}`}
                    >
                      <Image
                        src="https://asset.ayo.co.id/assets/img/padel.png"
                        alt="Padel Icon"
                        width={18}
                        height={18}
                      />
                      <p className="text-[13px] text-gray-400">Padel</p>
                    </div>

                    <div
                      className={`flex mt-9 gap-2 font-medium ${PoppinsRegular.className}`}
                    >
                      <p className="text-gray-600 text-[13px]">Mulai</p>
                      <p className="text-gray-700 text-[15px] font-bold mt-[-3px]">
                        Rp {lap.harga.toLocaleString("id-ID")}
                      </p>
                      <p className="text-gray-600 text-[13px]">/sesi</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center text-gray-500 py-20">
            Tidak ada lapangan yang sesuai dengan pencarian
          </div>
        )}
      </div>
    </div>
  );
};

export default LapanganComponents;
