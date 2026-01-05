// src/utils/auth.js
const { prisma } = require("../lib/prisma");

async function getToken(token) {
  // Dummy, misal token = userId
  if (!token) return null;

  const user = await prisma.users.findUnique({ where: { id: Number(token) } });
  return user;
}

module.exports = { getToken };
