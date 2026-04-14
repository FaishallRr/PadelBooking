export const mitraOnly = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "mitra") {
      return res.status(403).json({
        message: "Akses ditolak. Khusus mitra.",
      });
    }

    next();
  } catch (err) {
    console.error("mitraOnly middleware error:", err);
    return res.status(500).json({
      message: "Kesalahan server (mitraOnly)",
    });
  }
};
