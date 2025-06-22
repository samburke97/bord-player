"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import Button from "@/components/ui/Button";

function AuthErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const handleBack = () => {
    router.push("/login");
  };

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case "Configuration":
        return "There is a problem with the server configuration.";
      case "AccessDenied":
        return "Access denied. You do not have permission to sign in.";
      case "Verification":
        return "The verification token has expired or has already been used.";
      default:
        return "An error occurred during authentication. Please try again.";
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <ActionHeader type="back" secondaryAction={handleBack} />

      <div className="flex-1 flex items-center justify-center px-6">
        <div className="max-w-md w-full text-center">
          <div className="mb-8">
            <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
              <svg
                className="w-8 h-8 text-red-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Authentication Error
            </h1>
            <p className="text-gray-600">{getErrorMessage(error)}</p>
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

export default function AuthErrorContentWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      }
    >
      <AuthErrorContent />
    </Suspense>
  );
}
