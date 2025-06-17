// lib/prisma.ts - Final Version
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

// Safe query wrapper with better error handling
export async function safePrismaQuery<T>(
  queryFn: () => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  if (!prisma) {
    console.warn(
      `Prisma client not available${
        context ? ` for ${context}` : ""
      }, returning fallback`
    );
    return fallback;
  }

  try {
    // Test connection before running query
    await prisma.$connect();
    const result = await queryFn();
    return result;
  } catch (error) {
    console.error(
      `Prisma query failed${context ? ` for ${context}` : ""}:`,
      error
    );
    return fallback;
  } finally {
    // Don't disconnect in development (keeps connection alive)
    if (process.env.NODE_ENV === "production") {
      try {
        await prisma.$disconnect();
      } catch (error) {
        console.warn("Failed to disconnect Prisma client:", error);
      }
    }
  }
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
