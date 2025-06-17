// lib/prisma.ts - Simplified and Robust
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

let prisma: PrismaClient;

if (process.env.NODE_ENV === "production") {
  // In production, always create a new client
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required in production");
  }

  prisma = new PrismaClient({
    log: ["error"],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
} else {
  // In development, use global to prevent multiple instances
  if (!global.__prisma) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is required");
    }

    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  }
  prisma = global.__prisma;
}

// Graceful shutdown
if (typeof window === "undefined") {
  const shutdown = async () => {
    try {
      await prisma.$disconnect();
    } catch (error) {
      console.error("Error during Prisma shutdown:", error);
    }
  };

  process.on("beforeExit", shutdown);
  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

export { prisma };
