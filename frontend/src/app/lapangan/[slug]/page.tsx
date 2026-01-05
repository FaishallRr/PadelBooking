import LapanganDetailComponent from "@/components/lapanganDetail";
import type { LapanganDetail } from "@/components/lapanganDetail";

async function fetchLapangan(slug: string): Promise<LapanganDetail | null> {
  try {
    const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    const res = await fetch(`${baseURL}/api/lapangan/${slug}`, {
      cache: "no-store",
    });

    if (!res.ok) return null;

    return await res.json();
  } catch (err) {
    console.error("Error fetching lapangan:", err);
    return null;
  }
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params; // FIX UTAMA!

  const lapangan = await fetchLapangan(slug);

  if (!lapangan) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h1 className="text-xl font-semibold">Lapangan tidak ditemukan</h1>
        <p className="text-gray-500 mt-2">
          Pastikan link atau slug yang kamu gunakan benar.
        </p>
      </div>
    );
  }

  return <LapanganDetailComponent lapangan={lapangan} />;
}
