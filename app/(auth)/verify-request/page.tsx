// app/auth/verify-request/page.tsx
import { Metadata } from "next";
import VerifyRequestContent from "@/components/auth/VerifyRequestContent";

export const metadata: Metadata = {
  title: "Check Your Email | Bord",
  description: "We've sent you a sign-in link",
};

export default function VerifyRequestPage() {
  return <VerifyRequestContent />;
}
