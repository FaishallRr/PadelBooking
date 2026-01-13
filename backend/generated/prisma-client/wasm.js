
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.21.1
 * Query Engine version: bf0e5e8a04cada8225617067eaa03d041e2bba36
 */
Prisma.prismaVersion = {
  client: "5.21.1",
  engine: "bf0e5e8a04cada8225617067eaa03d041e2bba36"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.UsersScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  username: 'username',
  email: 'email',
  password: 'password',
  no_hp: 'no_hp',
  foto: 'foto',
  bio: 'bio',
  role: 'role',
  status: 'status',
  created_at: 'created_at',
  updated_at: 'updated_at'
};

exports.Prisma.MitraScalarFieldEnum = {
  id: 'id',
  userId: 'userId',
  nama_usaha: 'nama_usaha',
  alamat_usaha: 'alamat_usaha',
  no_ktp: 'no_ktp',
  foto_ktp: 'foto_ktp',
  withdraw_type: 'withdraw_type',
  withdraw_day: 'withdraw_day',
  bank_mitra: 'bank_mitra',
  no_rekening_mitra: 'no_rekening_mitra',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.Otp_codesScalarFieldEnum = {
  id: 'id',
  user_email: 'user_email',
  kode_otp: 'kode_otp',
  expired_at: 'expired_at',
  digunakan: 'digunakan',
  created_at: 'created_at'
};

exports.Prisma.LapanganScalarFieldEnum = {
  id: 'id',
  mitra_id: 'mitra_id',
  nama: 'nama',
  slug: 'slug',
  lokasi: 'lokasi',
  harga: 'harga',
  gambar: 'gambar',
  rating: 'rating',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.LapanganDetailScalarFieldEnum = {
  id: 'id',
  lapangan_id: 'lapangan_id',
  alamat: 'alamat',
  maps: 'maps',
  deskripsi: 'deskripsi',
  type: 'type',
  fasilitas: 'fasilitas',
  interval: 'interval',
  breakTime: 'breakTime'
};

exports.Prisma.LapanganGambarScalarFieldEnum = {
  id: 'id',
  lapangan_id: 'lapangan_id',
  file_name: 'file_name',
  created_at: 'created_at'
};

exports.Prisma.JadwalLapanganScalarFieldEnum = {
  id: 'id',
  lapangan_id: 'lapangan_id',
  tanggal: 'tanggal',
  slot: 'slot',
  status: 'status',
  locked_until: 'locked_until'
};

exports.Prisma.Order_bookingScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  lapangan_id: 'lapangan_id',
  jadwalLapanganId: 'jadwalLapanganId',
  tanggal: 'tanggal',
  jam_mulai: 'jam_mulai',
  jam_selesai: 'jam_selesai',
  total_harga: 'total_harga',
  status: 'status',
  sewa_raket: 'sewa_raket',
  biaya_raket: 'biaya_raket',
  created_at: 'created_at',
  expired_at: 'expired_at'
};

exports.Prisma.TransaksiScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  lapangan_id: 'lapangan_id',
  jadwal_id: 'jadwal_id',
  order_id: 'order_id',
  total_harga: 'total_harga',
  status_pembayaran: 'status_pembayaran',
  created_at: 'created_at'
};

exports.Prisma.Raket_padelScalarFieldEnum = {
  id: 'id',
  nama: 'nama',
  harga: 'harga'
};

exports.Prisma.Sewa_raketScalarFieldEnum = {
  id: 'id',
  transaksi_id: 'transaksi_id',
  raket_id: 'raket_id',
  jumlah: 'jumlah',
  total_harga: 'total_harga'
};

exports.Prisma.Wallet_userScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  saldo: 'saldo',
  updated_at: 'updated_at'
};

exports.Prisma.Wallet_historyScalarFieldEnum = {
  id: 'id',
  wallet_id: 'wallet_id',
  jumlah: 'jumlah',
  saldo_akhir: 'saldo_akhir',
  tipe: 'tipe',
  transaksi_id: 'transaksi_id',
  order_id: 'order_id',
  created_at: 'created_at'
};

exports.Prisma.RefundScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  transaksi_id: 'transaksi_id',
  order_id: 'order_id',
  jumlah: 'jumlah',
  alasan: 'alasan',
  status: 'status',
  created_at: 'created_at',
  processed_at: 'processed_at'
};

exports.Prisma.NotifikasiScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  pesan: 'pesan',
  dibaca: 'dibaca',
  created_at: 'created_at'
};

exports.Prisma.UlasanScalarFieldEnum = {
  id: 'id',
  user_id: 'user_id',
  lapangan_id: 'lapangan_id',
  rating: 'rating',
  komentar: 'komentar',
  created_at: 'created_at'
};

exports.Prisma.Pendapatan_mitraScalarFieldEnum = {
  id: 'id',
  mitra_id: 'mitra_id',
  transaksi_id: 'transaksi_id',
  jumlah: 'jumlah',
  created_at: 'created_at'
};

exports.Prisma.Pencairan_pendapatanScalarFieldEnum = {
  id: 'id',
  mitra_id: 'mitra_id',
  jumlah: 'jumlah',
  status: 'status',
  created_at: 'created_at'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.users_role = exports.$Enums.users_role = {
  admin: 'admin',
  user: 'user',
  mitra: 'mitra'
};

exports.users_status = exports.$Enums.users_status = {
  aktif: 'aktif',
  nonaktif: 'nonaktif'
};

exports.mitra_status = exports.$Enums.mitra_status = {
  pending: 'pending',
  aktif: 'aktif',
  ditolak: 'ditolak'
};

exports.lapangan_status = exports.$Enums.lapangan_status = {
  tersedia: 'tersedia',
  dalam_perbaikan: 'dalam_perbaikan'
};

exports.jadwal_status = exports.$Enums.jadwal_status = {
  tersedia: 'tersedia',
  dikunci: 'dikunci',
  booked: 'booked'
};

exports.transaksi_status_pembayaran = exports.$Enums.transaksi_status_pembayaran = {
  pending: 'pending',
  berhasil: 'berhasil',
  gagal: 'gagal',
  refund: 'refund'
};

exports.wallet_tipe = exports.$Enums.wallet_tipe = {
  booking: 'booking',
  refund: 'refund',
  topup: 'topup'
};

exports.refund_status = exports.$Enums.refund_status = {
  pending: 'pending',
  approved: 'approved',
  rejected: 'rejected',
  selesai: 'selesai'
};

exports.pencairan_status = exports.$Enums.pencairan_status = {
  pending: 'pending',
  diproses: 'diproses',
  berhasil: 'berhasil',
  ditolak: 'ditolak'
};

exports.Prisma.ModelName = {
  users: 'users',
  Mitra: 'Mitra',
  otp_codes: 'otp_codes',
  Lapangan: 'Lapangan',
  LapanganDetail: 'LapanganDetail',
  LapanganGambar: 'LapanganGambar',
  JadwalLapangan: 'JadwalLapangan',
  order_booking: 'order_booking',
  transaksi: 'transaksi',
  raket_padel: 'raket_padel',
  sewa_raket: 'sewa_raket',
  wallet_user: 'wallet_user',
  wallet_history: 'wallet_history',
  refund: 'refund',
  notifikasi: 'notifikasi',
  ulasan: 'ulasan',
  pendapatan_mitra: 'pendapatan_mitra',
  pencairan_pendapatan: 'pencairan_pendapatan'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
