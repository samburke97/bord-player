// components/auth/LoginForm.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import TitleDescription from "@/components/ui/TitleDescription";
import TextInput from "@/components/ui/TextInput";
import Button from "@/components/ui/Button";
import styles from "./LoginForm.module.css";

interface LoginFormProps {
  accountType: "player" | "business";
  title: string;
  description: string;
  callbackUrl: string;
}

export default function LoginForm({
  accountType,
  title,
  description,
  callbackUrl,
}: LoginFormProps) {
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
        callbackUrl,
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
        callbackUrl,
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
        callbackUrl,
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
      <div className={styles.content}>
        {/* Left side: Login Form */}
        <div className={styles.formContainer}>
          <ActionHeader type="back" secondaryAction={handleBack} />
          <div className={styles.formWrapper}>
            <TitleDescription title={title} description={description} />

            {/* Social Login Buttons */}
            <div className={styles.authButtons}>
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className={styles.socialButton}
              >
                <Image
                  src="/icons/socials/google.svg"
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
                  src="/icons/socials/facebook.svg"
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
