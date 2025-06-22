// app/login/player/page.tsx
import { Metadata } from "next";
import PlayerLoginForm from "@/components/auth/PlayerLoginForm";

export const metadata: Metadata = {
  title: "Player Login | Bord",
  description: "Sign in to find and book sports activities",
};

export default function PlayerLoginPage() {
  return <PlayerLoginForm />;
}
