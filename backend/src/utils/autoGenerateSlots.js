import cron from "node-cron";
import { ensure7DaysSlots } from "../controller/lapanganController.js";
import prisma from "./prismaClient.js";

export async function autoGenerateSlots() {
  const lapanganList = await prisma.lapangan.findMany();
  for (const lapangan of lapanganList) {
    await ensure7DaysSlots(lapangan.id);
  }
  console.log(
    "✅ Slot 7 hari ke depan berhasil diperbarui untuk semua lapangan"
  );
}

// Cron job, misal tiap jam 00:00
export function startSlotCron() {
  cron.schedule("0 0 * * *", () => {
    console.log("🕛 Mulai auto-generate slots...");
    autoGenerateSlots().catch(console.error);
  });
}
