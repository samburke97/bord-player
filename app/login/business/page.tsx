// app/login/business/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import TitleDescription from "@/components/ui/TitleDescription";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import styles from "./page.module.css";

export default function BusinessLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  const handleBack = () => {
    router.push("/login");
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("google", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Google sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacebookSignIn = async () => {
    setIsLoading(true);
    try {
      await signIn("facebook", {
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Facebook sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const validateEmail = (value: string) => {
    if (!value || value.trim() === "") {
      setEmailError("Email is required");
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) {
      setEmailError("Please enter a valid email address");
      return false;
    }

    setEmailError(null);
    return true;
  };

  const handleEmailContinue = async () => {
    if (!validateEmail(email)) {
      return;
    }

    setIsLoading(true);
    try {
      await signIn("email", {
        email,
        callbackUrl: "/dashboard",
        redirect: true,
      });
    } catch (error) {
      console.error("Email sign-in error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (emailError) {
      setEmailError(null);
    }
  };

  return (
    <div className={styles.container}>
      <ActionHeader type="back" secondaryAction={handleBack} />

      <div className={styles.content}>
        {/* Left side: Login Form */}
        <div className={styles.formContainer}>
          <div className={styles.formWrapper}>
            <TitleDescription
              title="Bord for Business"
              description="Create an account or log in to manage your business on bord."
            />

            {/* Social Login Buttons */}
            <div className={styles.authButtons}>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={styles.socialButton}
              >
                <Image
                  src="/icons/auth/google.svg"
                  alt="Google"
                  width={20}
                  height={20}
                />
                Continue with Google
              </button>

              <button
                onClick={handleFacebookSignIn}
                disabled={isLoading}
                className={styles.socialButton}
              >
                <Image
                  src="/icons/auth/facebook.svg"
                  alt="Facebook"
                  width={20}
                  height={20}
                />
                Continue with Facebook
              </button>
            </div>

            {/* Divider */}
            <div className={styles.divider}>OR</div>

            {/* Email Form */}
            <div className={styles.emailForm}>
              <TextInput
                id="email"
                label=""
                value={email}
                onChange={handleEmailChange}
                placeholder="Enter email address"
                error={emailError}
                type="email"
                autoComplete="email"
              />

              <div className={styles.continueButtonContainer}>
                <Button
                  variant="primary-green"
                  onClick={handleEmailContinue}
                  disabled={isLoading || !email}
                  fullWidth
                >
                  {isLoading ? "Loading..." : "Continue"}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right side: Hero image */}
        <div className={styles.imageContainer}></div>
      </div>
    </div>
  );
}
