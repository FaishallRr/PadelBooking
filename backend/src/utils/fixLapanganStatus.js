// src/utils/fixLapanganStatus.js
import prisma from "./prismaClient.js"; // pastikan prisma.js ada di src/lib

async function fixStatuses() {
  try {
    const lapanganList = await prisma.lapangan.findMany();

    for (const lap of lapanganList) {
      let newStatus = lap.status;

      if (lap.status === "available") newStatus = "tersedia";
      else if (lap.status === "maintenance") newStatus = "dalam_perbaikan";

      if (lap.status !== newStatus) {
        await prisma.lapangan.update({
          where: { id: lap.id },
          data: { status: newStatus },
        });
        console.log(
          `Updated lapangan "${lap.nama}": ${lap.status} → ${newStatus}`
        );
      }
    }

    console.log("✅ Semua status lapangan sudah diperbaiki sesuai enum.");
    process.exit(0);
  } catch (err) {
    console.error("❌ Gagal memperbaiki status lapangan:", err);
    process.exit(1);
  }
}

fixStatuses();
