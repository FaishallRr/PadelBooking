export interface CartItem {
  jadwalId: number;
  lapanganId: number;
  lapanganNama: string;
  lapanganSlug: string;
  tanggal: string;
  jamMulai: string;
  jamSelesai: string;
  harga: number;
  supportsRaket?: boolean;
  extras?: { sewaRaket?: boolean };
  isBooked?: boolean; // harus ada
  slotId?: number; // optional
}
