// app/login/page.tsx
import { Metadata } from "next";
import AccountTypeSelector from "@/components/auth/AccountTypeSelector";

export const metadata: Metadata = {
  title: "Select Account Type | Bord",
  description: "Choose your account type to continue",
};

export default function LoginPage() {
  return <AccountTypeSelector />;
}
