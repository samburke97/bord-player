// app/api/health/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    console.log("🔍 Health check starting...");

    // Environment check
    const envCheck = {
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      hasDirectUrl: !!process.env.DIRECT_URL,
      nodeEnv: process.env.NODE_ENV,
      hasPrisma: !!prisma,
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 30) + "...",
      isNeonDatabase: process.env.DATABASE_URL?.includes("neon.tech"),
    };

    console.log("🌍 Environment check:", envCheck);

    if (!process.env.DATABASE_URL) {
      console.error("❌ No DATABASE_URL found");
      return NextResponse.json(
        {
          status: "error",
          message: "DATABASE_URL environment variable is missing",
          environment: envCheck,
          help: "Add DATABASE_URL to your Vercel environment variables",
        },
        { status: 500 }
      );
    }

    if (!prisma) {
      console.error("❌ Prisma client not available");
      return NextResponse.json(
        {
          status: "error",
          message: "Prisma client not available",
          environment: envCheck,
        },
        { status: 500 }
      );
    }

    console.log("🔌 Testing database connection...");

    // Test database connection with timeout
    const connectionPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Connection timeout after 10s")), 10000)
    );

    await Promise.race([connectionPromise, timeoutPromise]);
    console.log("✅ Database connected successfully");

    // Test a simple query
    console.log("📊 Testing database query...");
    const centerCount = await prisma.center.count({
      where: { isActive: true },
    });
    console.log(`✅ Query successful - Found ${centerCount} active centers`);

    return NextResponse.json({
      status: "✅ SUCCESS",
      message: "Database connected and working perfectly!",
      centerCount,
      environment: envCheck,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Health check failed:", error);

    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        status: "❌ ERROR",
        message: errorMessage,
        error:
          error instanceof Error
            ? {
                name: error.name,
                message: error.message,
              }
            : "Unknown error",
        environment: {
          hasDatabaseUrl: !!process.env.DATABASE_URL,
          hasDirectUrl: !!process.env.DIRECT_URL,
          nodeEnv: process.env.NODE_ENV,
          hasPrisma: !!prisma,
          isNeonDatabase: process.env.DATABASE_URL?.includes("neon.tech"),
        },
        help: "Check your environment variables in Vercel dashboard",
      },
      { status: 500 }
    );
  } finally {
    if (prisma) {
      try {
        await prisma.$disconnect();
        console.log("🔌 Database disconnected");
      } catch (disconnectError) {
        console.warn("⚠️ Error disconnecting:", disconnectError);
      }
    }
  }
}
