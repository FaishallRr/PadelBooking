import prisma from "../utils/prismaClient.js";

export const releaseExpiredSlot = async () => {
  try {
    const result = await prisma.jadwalLapangan.updateMany({
      where: {
        status: "dikunci",
        locked_until: { lt: new Date() },
      },
      data: {
        status: "tersedia",
        locked_until: null,
      },
    });

    if (result.count > 0) {
      console.log(`🔓 ${result.count} slot dilepas otomatis`);
    }
  } catch (err) {
    console.error("❌ Gagal release slot:", err);
  }
};
