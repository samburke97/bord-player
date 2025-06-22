"use client";

import LoginForm from "@/components/auth/LoginForm";

export default function PlayerLoginPage() {
  return (
    <LoginForm
      accountType="player"
      title="Welcome to Bord"
      description="Create an account or log in to discover sports and activities near you."
      callbackUrl="/"
    />
  );
}
