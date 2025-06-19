"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import styles from "./verify-request.module.css";
import Button from "@/components/ui/Button";
import TitleDescription from "@/components/ui/TitleDescription";
import Container from "@/components/layout/Container";

export default function VerifyRequestPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(60); // 60 second cooldown
  const [canResend, setCanResend] = useState(false);

  // Countdown timer for resend button
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [timeLeft]);

  const handleResendEmail = async () => {
    if (!email || !canResend) return;

    try {
      setIsResending(true);
      setResendMessage(null);

      const result = await signIn("email", {
        email,
        redirect: false,
      });

      if (result?.error) {
        setResendMessage("Failed to resend email. Please try again.");
      } else {
        setResendMessage("Email sent! Check your inbox.");
        setTimeLeft(60);
        setCanResend(false);
      }
    } catch (error) {
      console.error("Resend email error:", error);
      setResendMessage("Failed to resend email. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  const maskedEmail = email
    ? email.replace(/(.{2})(.*)(@.*)/, "$1***$3")
    : "your email";

  return (
    <div className={styles.container}>
      <Container>
        <div className={styles.content}>
          <div className={styles.card}>
            {/* Success icon */}
            <div className={styles.iconContainer}>
              <div className={styles.successIcon}>
                <Image
                  src="/icons/utility-outline/mail.svg"
                  alt="Email sent"
                  width={32}
                  height={32}
                />
              </div>
            </div>

            {/* Content */}
            <div className={styles.textContent}>
              <TitleDescription
                title="Check your email"
                description={`We've sent a sign-in link to ${maskedEmail}`}
              />

              <div className={styles.instructions}>
                <p>
                  Click the link in the email to sign in to your account. The
                  link will expire in 24 hours.
                </p>
              </div>

              {/* Resend message */}
              {resendMessage && (
                <div className={styles.resendMessage}>{resendMessage}</div>
              )}

              {/* Action buttons */}
              <div className={styles.actions}>
                <Button
                  onClick={handleResendEmail}
                  variant="outline"
                  disabled={!canResend || isResending}
                  fullWidth
                >
                  {isResending
                    ? "Sending..."
                    : canResend
                    ? "Resend email"
                    : `Resend in ${timeLeft}s`}
                </Button>

                <Link href="/login" className={styles.backLink}>
                  <Button variant="ghost" fullWidth>
                    ← Back to sign in
                  </Button>
                </Link>
              </div>
            </div>

            {/* Help section */}
            <div className={styles.helpSection}>
              <details className={styles.helpDetails}>
                <summary className={styles.helpSummary}>
                  Didn't receive the email?
                </summary>
                <div className={styles.helpContent}>
                  <ul className={styles.helpList}>
                    <li>Check your spam or junk folder</li>
                    <li>Make sure you entered the correct email address</li>
                    <li>Wait a few minutes for the email to arrive</li>
                    <li>Try resending the email</li>
                  </ul>
                  <p className={styles.helpContact}>
                    Still having trouble?{" "}
                    <a
                      href="mailto:support@bordfinder.com"
                      className={styles.supportLink}
                    >
                      Contact support
                    </a>
                  </p>
                </div>
              </details>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
