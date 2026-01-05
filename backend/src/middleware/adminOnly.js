export const adminOnly = (req, res, next) => {
  try {
    // authMiddleware HARUS jalan dulu
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "admin") {
      return res.status(403).json({
        message: "Akses ditolak. Khusus admin.",
      });
    }

    next();
  } catch (err) {
    console.error("adminOnly middleware error:", err);
    return res.status(500).json({
      message: "Kesalahan server (adminOnly)",
    });
  }
};
