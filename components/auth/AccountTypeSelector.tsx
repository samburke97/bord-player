"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Button from "@/components/ui/Button";
import TitleDescription from "@/components/ui/TitleDescription";

interface AccountType {
  type: "player" | "business";
  title: string;
  description: string;
  icon: string;
}

const accountTypes: AccountType[] = [
  {
    type: "player",
    title: "Player Account",
    description: "I'm looking to play",
    icon: "/icons/player.svg",
  },
  {
    type: "business",
    title: "Business Account",
    description: "I'm looking to manage",
    icon: "/icons/business.svg",
  },
];

export default function AccountTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelection = (type: string) => {
    setSelectedType(type);

    // Redirect based on account type
    if (type === "business") {
      window.location.href = "https://admin.bordfinder.com/login";
    } else {
      router.push("/login");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <TitleDescription
        title="Select Account Type"
        description="Please select the account you want to sign up or log in with."
      />

      <div className="space-y-4 mt-8">
        {accountTypes.map((account) => (
          <button
            key={account.type}
            onClick={() => handleSelection(account.type)}
            className="w-full p-4 border rounded-lg hover:bg-gray-50 transition-colors text-left"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{account.title}</h3>
                <p className="text-gray-600 text-sm">{account.description}</p>
              </div>
              <span>→</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
