// lib/prisma.ts - Build-Safe Version
import { PrismaClient } from "@prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  // Skip Prisma creation during build if no DATABASE_URL
  if (
    process.env.NEXT_PHASE === "phase-production-build" &&
    !process.env.DATABASE_URL
  ) {
    console.log("Skipping Prisma client creation during build phase");
    return null;
  }

  if (!process.env.DATABASE_URL) {
    console.warn("DATABASE_URL not found");
    return null;
  }

  try {
    return new PrismaClient({
      log:
        process.env.NODE_ENV === "development"
          ? ["query", "error", "warn"]
          : ["error"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL,
        },
      },
    });
  } catch (error) {
    console.error("Failed to create Prisma client:", error);
    return null;
  }
}

const globalForPrisma = globalThis as unknown as {
  __prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production" && prisma) {
  globalForPrisma.__prisma = prisma;
}

// Graceful shutdown handler
if (typeof window === "undefined" && prisma) {
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
