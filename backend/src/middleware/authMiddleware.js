import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    let token = null;

    // 1️⃣ Ambil token dari Authorization Header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.split(" ")[1];
    }

    // 2️⃣ Fallback dari cookie (optional)
    if (!token && req.cookies?.token) {
      token = req.cookies.token;
    }

    // 3️⃣ Jika token tidak ada
    if (!token) {
      return res.status(401).json({
        message: "Unauthorized: token tidak ditemukan",
      });
    }

    // 4️⃣ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 5️⃣ Normalisasi payload (penting)
    const userId = decoded.id ?? decoded.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: payload token tidak valid",
      });
    }

    // 6️⃣ Inject user ke request
    req.user = {
      id: Number(userId),
      role: decoded.role || "user",
      email: decoded.email || null,
    };

    next();
  } catch (error) {
    console.error("AUTH ERROR:", error.message);

    return res.status(401).json({
      message: "Unauthorized: token tidak valid atau expired",
    });
  }
};
