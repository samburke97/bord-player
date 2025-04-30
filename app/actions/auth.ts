"use server";

import { z } from "zod";
import prisma from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  generateVerificationCode,
  validateEmail,
  validateUsername,
} from "@/lib/auth/utils";
import { sendVerificationEmail, sendPasswordResetEmail } from "@/lib/email";
import { signIn } from "next-auth/react";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";

// Validation schemas
const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20),
  dateOfBirth: z.string().optional(),
  countryCode: z.string().default("+44"),
  phoneNumber: z.string().optional(),
});

const verifyEmailSchema = z.object({
  email: z.string().email(),
  code: z.string().length(4),
});

// Register user action
export async function registerUser(prevState: any, formData: FormData) {
  try {
    const validatedFields = registerSchema.safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      username: formData.get("username"),
      dateOfBirth: formData.get("dateOfBirth"),
      countryCode: formData.get("countryCode"),
      phoneNumber: formData.get("phoneNumber"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Invalid form data",
      };
    }

    const {
      email,
      password,
      firstName,
      lastName,
      username,
      dateOfBirth,
      countryCode,
      phoneNumber,
    } = validatedFields.data;

    // Check if email exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return {
        errors: { email: ["Email already registered"] },
        message: "Email already registered",
      };
    }

    // Check username availability
    const existingUsername = await prisma.player.findFirst({
      where: { username: username.toLowerCase() },
    });

    if (existingUsername) {
      return {
        errors: { username: ["Username already taken"] },
        message: "Username already taken",
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);
    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    // Create user with player profile
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: `${firstName} ${lastName}`,
        role: "USER",
        verificationToken: verificationCode,
        verificationTokenExpires: verificationExpires,
        player: {
          create: {
            firstName,
            lastName,
            username: username.toLowerCase(),
            dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
            phoneCountryCode: countryCode,
            phoneNumber,
            onboardingCompleted: false,
          },
        },
      },
      include: {
        player: true,
      },
    });

    // Send verification email
    await sendVerificationEmail(email, verificationCode);

    return {
      success: true,
      message: "Registration successful",
      email: email,
    };
  } catch (error) {
    console.error("Registration error:", error);
    return {
      errors: {},
      message: "Registration failed. Please try again.",
    };
  }
}

// Verify email action
export async function verifyEmailAction(prevState: any, formData: FormData) {
  try {
    const validatedFields = verifyEmailSchema.safeParse({
      email: formData.get("email"),
      code: formData.get("code"),
    });

    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
        message: "Invalid verification data",
      };
    }

    const { email, code } = validatedFields.data;

    const user = await prisma.user.findFirst({
      where: {
        email,
        verificationToken: code,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      return {
        errors: { code: ["Invalid or expired verification code"] },
        message: "Invalid or expired verification code",
      };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: new Date(),
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    return {
      success: true,
      message: "Email verified successfully",
    };
  } catch (error) {
    console.error("Verification error:", error);
    return {
      errors: {},
      message: "Verification failed. Please try again.",
    };
  }
}

// Resend verification code action
export async function resendVerificationCode(email: string) {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return { error: "User not found" };
    }

    if (user.emailVerified) {
      return { error: "Email already verified" };
    }

    const verificationCode = generateVerificationCode();
    const verificationExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        verificationToken: verificationCode,
        verificationTokenExpires: verificationExpires,
      },
    });

    await sendVerificationEmail(email, verificationCode);

    return { success: true };
  } catch (error) {
    console.error("Resend verification error:", error);
    return { error: "Failed to resend verification code" };
  }
}

// Check username availability action
export async function checkUsernameAvailability(username: string) {
  try {
    if (!validateUsername(username)) {
      return {
        available: false,
        error: "Invalid username format",
      };
    }

    const existingUsername = await prisma.player.findFirst({
      where: { username: username.toLowerCase() },
    });

    return {
      available: !existingUsername,
    };
  } catch (error) {
    console.error("Username check error:", error);
    return {
      available: false,
      error: "Failed to check username",
    };
  }
}

// Login action for credentials (redirects will be handled by NextAuth)
export async function loginWithCredentials(prevState: any, formData: FormData) {
  try {
    const email = formData.get("email");
    const password = formData.get("password");

    if (!email || !password) {
      return { error: "Email and password are required" };
    }

    const result = await signIn("player-credentials", {
      email,
      password,
      redirect: false,
    });

    if (result?.error) {
      return { error: "Invalid email or password" };
    }

    return { success: true };
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid email or password" };
        default:
          return { error: "Authentication failed" };
      }
    }
    throw error;
  }
}
