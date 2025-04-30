// app/actions/onboarding.ts
"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth/authOptions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { z } from "zod";

// Validation schemas
const sportsSchema = z.object({
  sports: z.array(z.string()).min(1, "Select at least one sport"),
});

const playerTypeSchema = z.object({
  playerType: z.enum([
    "SENIOR",
    "ADULT",
    "CONCESSION",
    "STUDENT",
    "JUNIOR",
    "OTHER",
  ]),
});

// Save sports preferences
export async function saveSportsPreferences(
  prevState: any,
  formData: FormData
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Get all selected sports from formData
    const selectedSports = formData.getAll("sports");

    const validatedFields = sportsSchema.safeParse({
      sports: selectedSports,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please select at least one sport",
      };
    }

    const { sports } = validatedFields.data;

    // Find player profile
    const player = await prisma.player.findFirst({
      where: { userId: session.user.id },
    });

    if (!player) {
      return { error: "Player profile not found" };
    }

    // Update player sports (delete existing and create new)
    await prisma.$transaction([
      prisma.playerSport.deleteMany({
        where: { playerId: player.id },
      }),
      prisma.playerSport.createMany({
        data: sports.map((sportId) => ({
          playerId: player.id,
          sportId: sportId,
        })),
      }),
      prisma.player.update({
        where: { id: player.id },
        data: { onboardingSportsCompleted: true },
      }),
    ]);

    revalidatePath("/auth/player/onboarding/sports");
    return { success: true };
  } catch (error) {
    console.error("Save sports error:", error);
    return { error: "Failed to save sports preferences" };
  }
}

// Save player type
export async function savePlayerType(prevState: any, formData: FormData) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const playerType = formData.get("playerType");

    const validatedFields = playerTypeSchema.safeParse({
      playerType,
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Please select a player type",
      };
    }

    const { playerType: validatedPlayerType } = validatedFields.data;

    // Find player profile
    const player = await prisma.player.findFirst({
      where: { userId: session.user.id },
    });

    if (!player) {
      return { error: "Player profile not found" };
    }

    // Update player type
    await prisma.player.update({
      where: { id: player.id },
      data: {
        playerType: validatedPlayerType,
        onboardingTypeCompleted: true,
      },
    });

    revalidatePath("/auth/player/onboarding/player-type");
    return { success: true };
  } catch (error) {
    console.error("Save player type error:", error);
    return { error: "Failed to save player type" };
  }
}

// Complete onboarding
export async function completeOnboarding() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Find player profile
    const player = await prisma.player.findFirst({
      where: { userId: session.user.id },
    });

    if (!player) {
      return { error: "Player profile not found" };
    }

    // Mark onboarding as complete
    await prisma.player.update({
      where: { id: player.id },
      data: {
        onboardingCompleted: true,
        onboardingCompletedAt: new Date(),
      },
    });

    revalidatePath("/auth/player/onboarding/complete");
    return { success: true };
  } catch (error) {
    console.error("Complete onboarding error:", error);
    return { error: "Failed to complete onboarding" };
  }
}

// Skip onboarding step
export async function skipOnboardingStep(step: "sports" | "player-type") {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    // Find player profile
    const player = await prisma.player.findFirst({
      where: { userId: session.user.id },
    });

    if (!player) {
      return { error: "Player profile not found" };
    }

    // Update specific step as completed
    const updateData =
      step === "sports"
        ? { onboardingSportsCompleted: true }
        : { onboardingTypeCompleted: true };

    await prisma.player.update({
      where: { id: player.id },
      data: updateData,
    });

    return { success: true };
  } catch (error) {
    console.error(`Skip ${step} step error:`, error);
    return { error: `Failed to skip ${step} step` };
  }
}

// Get onboarding status
export async function getOnboardingStatus() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return { error: "Unauthorized" };
    }

    const player = await prisma.player.findFirst({
      where: { userId: session.user.id },
      include: {
        sports: {
          include: {
            sport: true,
          },
        },
      },
    });

    if (!player) {
      return { error: "Player profile not found" };
    }

    return {
      onboardingCompleted: player.onboardingCompleted,
      onboardingSportsCompleted: player.onboardingSportsCompleted,
      onboardingTypeCompleted: player.onboardingTypeCompleted,
      sports: player.sports.map((ps) => ps.sport),
      playerType: player.playerType,
    };
  } catch (error) {
    console.error("Get onboarding status error:", error);
    return { error: "Failed to get onboarding status" };
  }
}
