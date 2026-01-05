"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

interface Slot {
  start: string;
  end: string;
}

const generateSlots = (
  start: string,
  end: string,
  intervalMinutes: number
): Slot[] => {
  const slots: Slot[] = [];
  const [startH, startM] = start.split(":").map(Number);
  const [endH, endM] = end.split(":").map(Number);

  let current = new Date();
  current.setHours(startH, startM, 0, 0);

  const endTime = new Date();
  endTime.setHours(endH, endM, 0, 0);

  while (current < endTime) {
    const slotStart = new Date(current);
    current.setMinutes(current.getMinutes() + intervalMinutes);
    const slotEnd = new Date(current);
    if (slotEnd <= endTime) {
      slots.push({
        start: slotStart.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5),
      });
    }
  }

  return slots;
};

const LapanganJadwalPage = () => {
  const searchParams = useSearchParams();
  const [tanggal, setTanggal] = useState<string>("");
  const [slots, setSlots] = useState<{ session: string; slots: Slot[] }[]>([]);

  useEffect(() => {
    const tanggalParam = searchParams.get("tanggal");
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const todayString = `${yyyy}-${mm}-${dd}`;

    setTanggal(tanggalParam || todayString);

    // Generate slot otomatis
    const sessionTimes = [
      { session: "Pagi", start: "08:00", end: "11:00" },
      { session: "Siang", start: "12:00", end: "16:00" },
      { session: "Malam", start: "19:00", end: "22:00" },
    ];

    const allSlots = sessionTimes.map((s) => ({
      session: s.session,
      slots: generateSlots(s.start, s.end, 10), // interval 10 menit
    }));

    setSlots(allSlots);
  }, [searchParams]);

  return (
    <div>
      <h1>Jadwal tanggal: {tanggal}</h1>
      {slots.map((s) => (
        <div key={s.session}>
          <h2>{s.session}</h2>
          {s.slots.length === 0 ? (
            <p>Tidak ada slot</p>
          ) : (
            <ul>
              {s.slots.map((slot) => (
                <li key={slot.start}>
                  {slot.start} - {slot.end}
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
};

export default LapanganJadwalPage;
