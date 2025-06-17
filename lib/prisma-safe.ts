// lib/prisma-safe.ts
import { prisma } from "@/lib/prisma";
import type { PrismaClient } from "@prisma/client";

/**
 * Type-safe wrapper for Prisma operations
 * Returns the result or a fallback value if Prisma is unavailable
 */
export async function withPrisma<T>(
  operation: (client: PrismaClient) => Promise<T>,
  fallback: T,
  context?: string
): Promise<T> {
  try {
    // Check if we're in a build environment without database access
    if (!process.env.DATABASE_URL) {
      console.warn(
        `No database URL available${
          context ? ` for ${context}` : ""
        }, returning fallback`
      );
      return fallback;
    }

    // Check if Prisma is available
    if (!prisma) {
      console.warn(
        `Prisma client not available${
          context ? ` for ${context}` : ""
        }, returning fallback`
      );
      return fallback;
    }

    // Test database connection
    await prisma.$connect();

    // Execute the operation with the guaranteed non-null client
    const result = await operation(prisma);
    return result;
  } catch (error) {
    console.error(
      `Prisma operation failed${context ? ` for ${context}` : ""}:`,
      error
    );
    return fallback;
  } finally {
    if (prisma) {
      try {
        // Only disconnect in production to avoid connection churn
        if (process.env.NODE_ENV === "production") {
          await prisma.$disconnect();
        }
      } catch (disconnectError) {
        console.warn("Error disconnecting from database:", disconnectError);
      }
    }
  }
}
