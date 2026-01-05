export function isSlotExpired(tanggal: string, jamMulai: string): boolean {
  const now = new Date();

  const [hour, minute] = jamMulai.split(":").map(Number);

  const slotTime = new Date(tanggal);
  slotTime.setHours(hour, minute, 0, 0);

  return slotTime.getTime() <= now.getTime();
}
