// lib/prisma-safe.ts - Fixed Version
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

export async function withPrisma<T>(
  operation: (client: PrismaClient) => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    // More aggressive error handling in production
    if (!process.env.DATABASE_URL) {
      const message = `No DATABASE_URL available${
        context ? ` for ${context}` : ""
      }`;
      console.error(message);

      if (process.env.NODE_ENV === "production") {
        throw new Error(message);
      }
      return fallback;
    }

    if (!prisma) {
      const message = `Prisma client not available${
        context ? ` for ${context}` : ""
      }`;
      console.error(message);

      if (process.env.NODE_ENV === "production") {
        throw new Error(message);
      }
      return fallback;
    }

    // Test connection with timeout
    const connectionPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Database connection timeout")), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);

    // Execute operation
    const result = await operation(prisma);
    console.log(
      `✅ Database operation successful${context ? ` for ${context}` : ""}`
    );
    return result;
  } catch (error) {
    console.error(
      `❌ Prisma operation failed${context ? ` for ${context}` : ""}:`,
      error
    );

    // In production, log more details for debugging
    if (process.env.NODE_ENV === "production") {
      console.error("Environment check:", {
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        hasDirectUrl: !!process.env.DIRECT_URL,
        nodeEnv: process.env.NODE_ENV,
        hasPrisma: !!prisma,
      });
    }

    return fallback;
  } finally {
    // Only disconnect in serverless environments
    if (prisma && process.env.NODE_ENV === "production") {
      try {
        await prisma.$disconnect();
      } catch (disconnectError) {
        console.warn("Error disconnecting from database:", disconnectError);
      }
    }
  }
}
