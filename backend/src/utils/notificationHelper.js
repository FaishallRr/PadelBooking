import prisma from "./prismaClient.js";

/**
 * Helper untuk membuat notifikasi
 * @param {number} userId 
 * @param {string} pesan 
 */
export async function createNotification(userId, pesan) {
  try {
    await prisma.notifikasi.create({
      data: {
        user_id: userId,
        pesan,
      },
    });
  } catch (err) {
    console.error("NOTIFIKASI CREATE ERROR:", err.message);
    // Jangan throw, agar tidak mengganggu flow utama
  }
}
