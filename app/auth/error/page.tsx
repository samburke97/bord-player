"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import styles from "./error.module.css";
import Button from "@/components/ui/Button";
import TitleDescription from "@/components/ui/TitleDescription";
import Container from "@/components/layout/Container";

const errorMessages: Record<string, { title: string; description: string }> = {
  Configuration: {
    title: "Server Error",
    description:
      "There is a problem with the server configuration. Please try again later.",
  },
  AccessDenied: {
    title: "Access Denied",
    description: "You do not have permission to sign in with this account.",
  },
  Verification: {
    title: "Verification Failed",
    description:
      "The verification link is invalid or has expired. Please request a new one.",
  },
  Default: {
    title: "Authentication Error",
    description: "An error occurred during authentication. Please try again.",
  },
  OAuthAccountNotLinked: {
    title: "Account Already Exists",
    description:
      "An account with this email already exists. Please sign in using your original method.",
  },
  EmailSignin: {
    title: "Email Error",
    description: "Unable to send the verification email. Please try again.",
  },
  CredentialsSignin: {
    title: "Invalid Credentials",
    description: "The email or password you entered is incorrect.",
  },
  SessionRequired: {
    title: "Session Required",
    description: "You must be signed in to access this page.",
  },
};

export default function AuthErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "Default";

  const errorInfo = errorMessages[error] || errorMessages.Default;

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.content}>
          <div className={styles.card}>
            {/* Error icon */}
            <div className={styles.iconContainer}>
              <div className={styles.errorIcon}>
                <Image
                  src="/icons/utility-outline/warning.svg"
                  alt="Error"
                  width={32}
                  height={32}
                />
              </div>
            </div>

            {/* Content */}
            <div className={styles.textContent}>
              <TitleDescription
                title={errorInfo.title}
                description={errorInfo.description}
              />

              {/* Specific error guidance */}
              {error === "OAuthAccountNotLinked" && (
                <div className={styles.guidance}>
                  <p>
                    Try signing in with the method you used when you first
                    created your account.
                  </p>
                </div>
              )}

              {error === "Verification" && (
                <div className={styles.guidance}>
                  <p>
                    Verification links expire after 24 hours for security
                    reasons.
                  </p>
                </div>
              )}

              {error === "EmailSignin" && (
                <div className={styles.guidance}>
                  <p>
                    This might be due to a temporary server issue. Please wait a
                    moment and try again.
                  </p>
                </div>
              )}

              {/* Action buttons */}
              <div className={styles.actions}>
                <Link href="/login">
                  <Button variant="primary-green" fullWidth>
                    Try Again
                  </Button>
                </Link>

                <Link href="/">
                  <Button variant="ghost" fullWidth>
                    ← Back to Home
                  </Button>
                </Link>
              </div>
            </div>

            {/* Help section */}
            <div className={styles.helpSection}>
              <p className={styles.helpText}>
                Still having trouble?{" "}
                <a
                  href="mailto:support@bordfinder.com"
                  className={styles.supportLink}
                >
                  Contact our support team
                </a>
              </p>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
