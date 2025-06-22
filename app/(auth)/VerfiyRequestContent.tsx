"use client";

import { useRouter } from "next/navigation";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import Button from "@/components/ui/Button";

export default function VerifyRequestContent() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/login");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ActionHeader type="back" secondaryAction={handleBack} />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Check Your Email
            </h1>
            <p className="text-gray-600">
              We've sent you a sign-in link. Please check your email and click
              the link to continue.
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-600">
              <strong>Didn't receive the email?</strong> Check your spam folder
              or try signing in again.
            </p>
          </div>

          <div className="space-y-4">
            <Button fullWidth onClick={handleBack}>
              Try Again
            </Button>

            <Button
              variant="outline"
              fullWidth
              onClick={() => router.push("/")}
            >
              Go Home
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
