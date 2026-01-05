import prisma from "../utils/prismaClient.js";

export const getMyWallet = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.users.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ message: "User tidak ditemukan" });
    }

    let wallet = await prisma.wallet_user.findUnique({
      where: { user_id: userId },
      include: {
        history: {
          orderBy: { created_at: "desc" },
          include: {
            order: {
              select: {
                id: true,
                tanggal: true,
                jam_mulai: true,
                jam_selesai: true,
                lapangan: { select: { nama: true } },
              },
            },
          },
        },
      },
    });

    // Kalau belum ada wallet, buat baru
    if (!wallet) {
      wallet = await prisma.wallet_user.create({
        data: { user_id: userId, saldo: 0 },
        include: {
          history: true,
        },
      });
    }

    return res.status(200).json({
      message: "Berhasil mengambil data wallet",
      saldo: Number(wallet.saldo),
      history: wallet.history,
    });
  } catch (error) {
    console.error("GET WALLET ERROR:", error);
    return res.status(500).json({ message: "Gagal mengambil data wallet" });
  }
};
