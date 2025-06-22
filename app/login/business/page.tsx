import { Metadata } from "next";
import BusinessLoginForm from "@/components/auth/BusinessLoginForm";

export const metadata: Metadata = {
  title: "Business Login | Bord",
  description: "Sign in to manage your business on Bord",
};

export default function BusinessLoginPage() {
  return <BusinessLoginForm />;
}
