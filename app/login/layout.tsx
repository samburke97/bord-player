// app/login/business/page.tsx
"use client";

import { useState, useEffect, Suspense } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import styles from "./login.module.css";
import Button from "@/components/ui/Button";
import TextInput from "@/components/ui/TextInput";
import Container from "@/components/layout/Container";

// Social provider button component
function SocialButton({
  provider,
  icon,
  children,
  onClick,
  isLoading = false,
}: {
  provider: string;
  icon: string;
  children: React.ReactNode;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={isLoading}
      className={styles.socialButton}
      type="button"
    >
      <Image
        src={icon}
        alt={`${provider} icon`}
        width={20}
        height={20}
        className={styles.socialIcon}
      />
      <span>{children}</span>
    </button>
  );
}

// Email form component
function EmailForm({
  onSubmit,
  isLoading,
}: {
  onSubmit: (email: string) => void;
  isLoading: boolean;
}) {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState<string | null>(null);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateEmail(email)) {
      onSubmit(email);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.emailForm}>
      <TextInput
        id="email"
        type="email"
        value={email}
        onChange={(e) => {
          setEmail(e.target.value);
          if (emailError) validateEmail(e.target.value);
        }}
        placeholder="Enter your business email address"
        error={emailError}
        disabled={isLoading}
      />

      <Button
        type="submit"
        variant="primary-green"
        fullWidth
        disabled={isLoading || !email}
      >
        {isLoading ? "Sending..." : "Continue"}
      </Button>
    </form>
  );
}

// Main login form component
function BusinessLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, status } = useSession();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEmailForm, setShowEmailForm] = useState(false);

  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const urlError = searchParams.get("error");

  // Redirect if already authenticated
  useEffect(() => {
    if (status === "authenticated" && session) {
      router.push(callbackUrl);
    }
  }, [status, session, router, callbackUrl]);

  // Handle URL errors
  useEffect(() => {
    if (urlError) {
      switch (urlError) {
        case "OAuthAccountNotLinked":
          setError(
            "An account with this email already exists. Please use your original sign-in method."
          );
          break;
        case "EmailSignin":
          setError("Unable to send email. Please try again.");
          break;
        case "Verification":
          setError("The verification link is invalid or has expired.");
          break;
        default:
          setError("An error occurred during sign-in. Please try again.");
      }
    }
  }, [urlError]);

  const handleBack = () => {
    router.push("/login");
  };

  const handleSocialSignIn = async (provider: string) => {
    try {
      setIsLoading(true);
      setLoadingProvider(provider);
      setError(null);

      await signIn(provider, {
        callbackUrl,
        redirect: true,
      });
    } catch (error) {
      console.error(`${provider} sign-in error:`, error);
      setError(`Failed to sign in with ${provider}. Please try again.`);
    } finally {
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  const handleEmailSignIn = async (email: string) => {
    try {
      setIsLoading(true);
      setError(null);

      const result = await signIn("email", {
        email,
        callbackUrl,
        redirect: false,
      });

      if (result?.error) {
        setError("Failed to send verification email. Please try again.");
      } else {
        // Redirect to verify request page
        router.push(`/auth/verify-request?email=${encodeURIComponent(email)}`);
      }
    } catch (error) {
      console.error("Email sign-in error:", error);
      setError("Failed to send verification email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const toggleEmailForm = () => {
    setShowEmailForm(!showEmailForm);
    setError(null);
  };

  if (status === "loading") {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
      </div>
    );
  }

  return (
    <div className={styles.loginForm}>
      {/* Back button */}
      <button onClick={handleBack} className={styles.backButton}>
        <Image
          src="/icons/utility-outline/left.svg"
          alt="Back"
          width={20}
          height={20}
        />
        Back
      </button>

      <div className={styles.header}>
        <h1 className={styles.title}>Bord for Business</h1>
        <p className={styles.description}>
          Create an account or log in to manage your business on Bord
        </p>
      </div>

      {error && <div className={styles.errorContainer}>{error}</div>}

      <div className={styles.authOptions}>
        {!showEmailForm ? (
          <>
            {/* Social sign-in buttons */}
            <div className={styles.socialProviders}>
              <SocialButton
                provider="google"
                icon="/icons/login/google.svg"
                onClick={() => handleSocialSignIn("google")}
                isLoading={loadingProvider === "google"}
              >
                Continue with Google
              </SocialButton>

              <SocialButton
                provider="facebook"
                icon="/icons/login/facebook.svg"
                onClick={() => handleSocialSignIn("facebook")}
                isLoading={loadingProvider === "facebook"}
              >
                Continue with Facebook
              </SocialButton>
            </div>

            {/* Divider */}
            <div className={styles.divider}>
              <span>OR</span>
            </div>

            {/* Email option */}
            <Button
              variant="outline"
              fullWidth
              onClick={toggleEmailForm}
              disabled={isLoading}
            >
              Continue with Email
            </Button>
          </>
        ) : (
          <>
            {/* Back button */}
            <button
              onClick={toggleEmailForm}
              className={styles.backButton}
              disabled={isLoading}
            >
              <Image
                src="/icons/utility-outline/left.svg"
                alt="Back"
                width={20}
                height={20}
              />
              Back
            </button>

            {/* Email form */}
            <EmailForm onSubmit={handleEmailSignIn} isLoading={isLoading} />
          </>
        )}
      </div>

      {/* Footer */}
      <div className={styles.footer}>
        <p className={styles.footerText}>
          By continuing, you agree to Bord's{" "}
          <Link href="/terms" className={styles.footerLink}>
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="/privacy" className={styles.footerLink}>
            Privacy Policy
          </Link>
        </p>
      </div>
    </div>
  );
}

// Main page component with Suspense
export default function BusinessLoginPage() {
  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.content}>
          {/* Left side: Form */}
          <div className={styles.formContainer}>
            <Suspense
              fallback={
                <div className={styles.loadingContainer}>
                  <div className={styles.spinner} />
                </div>
              }
            >
              <BusinessLoginForm />
            </Suspense>
          </div>

          {/* Right side: Hero image */}
          <div className={styles.heroContainer}>
            <div className={styles.heroContent}>
              <h2 className={styles.heroTitle}>Grow Your Business</h2>
              <p className={styles.heroSubtitle}>
                Connect with players and manage your sports facility with ease
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
