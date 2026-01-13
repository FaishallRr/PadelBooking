import "dotenv/config";
import { PrismaClient } from "../../generated/prisma-client/client.js";

const prisma = new PrismaClient();

export default prisma;
