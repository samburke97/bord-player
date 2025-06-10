import { PrismaClient } from "@prisma/client";

declare global {
  var prisma: PrismaClient | undefined;
}

// Don't initialize Prisma during build
const isBuilding =
  process.env.NEXT_PHASE === "phase-production-build" ||
  process.argv.some((arg) => arg.includes("build"));

let prisma: PrismaClient;

if (isBuilding) {
  // Return empty object during build
  prisma = {} as PrismaClient;
} else if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export { prisma };
