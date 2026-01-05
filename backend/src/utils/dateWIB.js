export function getTodayRangeWIB() {
  const now = new Date();

  // offset WIB +7 jam
  const wibOffset = 7 * 60 * 60 * 1000;
  const wibNow = new Date(now.getTime() + wibOffset);

  // start of day WIB
  const startOfDay = new Date(wibNow);
  startOfDay.setHours(0, 0, 0, 0);

  // end of day WIB
  const endOfDay = new Date(wibNow);
  endOfDay.setHours(23, 59, 59, 999);

  // balikin ke UTC sebelum query DB
  startOfDay.setTime(startOfDay.getTime() - wibOffset);
  endOfDay.setTime(endOfDay.getTime() - wibOffset);

  return { startOfDay, endOfDay };
}
