"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import Image from "next/image";

export default function PlayerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleBack = () => {
    router.push("/login");
  };

  const handleEmailSignIn = async () => {
    if (!email) return;

    setIsLoading(true);
    try {
      await signIn("email", {
        email,
        callbackUrl: "/", // Redirect to homepage for players
      });
    } catch (error) {
      console.error("Sign in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    signIn("google", { callbackUrl: "/" });
  };

  const handleFacebookSignIn = () => {
    signIn("facebook", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ActionHeader type="back" secondaryAction={handleBack} />

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2">
        {/* Left side - Form */}
        <div className="flex flex-col justify-center px-6 py-12 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome to Bord
              </h1>
              <p className="mt-2 text-sm text-gray-600">
                Sign in to find and book amazing sports activities near you.
              </p>
            </div>

            <div className="space-y-4">
              {/* Google Sign In */}
              <Button
                variant="outline"
                fullWidth
                onClick={handleGoogleSignIn}
                className="flex items-center justify-center gap-3 py-3"
              >
                <Image
                  src="/icons/auth/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </Button>

              {/* Facebook Sign In */}
              <Button
                variant="outline"
                fullWidth
                onClick={handleFacebookSignIn}
                className="flex items-center justify-center gap-3 py-3"
              >
                <Image
                  src="/icons/auth/facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
                Continue with Facebook
              </Button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="bg-white px-2 text-gray-500">OR</span>
                </div>
              </div>

              {/* Email Input */}
              <TextInput
                id="email"
                label=""
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email address"
                className="mb-4"
              />

              {/* Continue Button */}
              <Button
                fullWidth
                onClick={handleEmailSignIn}
                disabled={!email || isLoading}
                className="py-3"
              >
                {isLoading ? "Sending..." : "Continue"}
              </Button>
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className="hidden lg:block relative">
          <Image
            src="/images/auth/business-hero.jpg"
            alt="Basketball players"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>
    </div>
  );
}
