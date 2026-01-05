// src/utils/isSlotExpired.js
export function isSlotExpired(tanggal, jamMulai) {
  const slotDate = new Date(`${tanggal}T${jamMulai}:00`);
  const now = new Date();
  return slotDate < now;
}
