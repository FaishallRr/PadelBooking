// frontend/src/app/api/lapangan/[id]/slots/route.ts
import { NextResponse } from "next/server";

export async function GET(
  req: Request,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  // jika params adalah Promise, unwrap dulu
  const resolvedParams = await params;
  const { id } = resolvedParams;

  // contoh data sementara
  const lapanganData = [
    {
      id: 5,
      nama: "Lapangan Padel A",
      slots: [
        { tanggal: "2025-12-15", slot: "08:00 - 09:00", status: "tersedia" },
        { tanggal: "2025-12-15", slot: "09:00 - 10:00", status: "tersedia" },
        { tanggal: "2025-12-15", slot: "12:00 - 13:00", status: "tersedia" },
      ],
    },
  ];

  const lapangan = lapanganData.find((l) => l.id === Number(id));
  if (!lapangan)
    return NextResponse.json(
      { error: "Lapangan tidak ditemukan" },
      { status: 404 }
    );

  const grouped: Record<string, any> = {};
  lapangan.slots.forEach((s) => {
    if (!grouped[s.tanggal])
      grouped[s.tanggal] = { pagi: [], siang: [], malam: [] };
    const hour = parseInt(s.slot.split(":")[0], 10);
    if (hour >= 8 && hour < 12) grouped[s.tanggal].pagi.push(s);
    else if (hour >= 12 && hour < 17) grouped[s.tanggal].siang.push(s);
    else grouped[s.tanggal].malam.push(s);
  });

  return NextResponse.json(grouped);
}
