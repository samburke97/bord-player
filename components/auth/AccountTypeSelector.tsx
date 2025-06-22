// components/auth/AccountTypeSelector.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";

interface AccountType {
  type: "player" | "business";
  title: string;
  description: string;
}

const accountTypes: AccountType[] = [
  {
    type: "player",
    title: "Player Account",
    description: "I'm looking to play",
  },
  {
    type: "business",
    title: "Business Account",
    description: "I'm looking to manage",
  },
];

export default function AccountTypeSelector() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleSelection = (type: string) => {
    setSelectedType(type);

    // Navigate to specific login pages
    if (type === "business") {
      router.push("/login/business");
    } else {
      router.push("/login/player");
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 min-h-screen flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Select Account Type
        </h1>
        <p className="text-gray-600">
          Please select the account you want to sign up or log in with.
        </p>
      </div>

      <div className="space-y-4">
        {accountTypes.map((account) => (
          <button
            key={account.type}
            onClick={() => handleSelection(account.type)}
            className="w-full p-4 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 text-left flex items-center justify-between group"
          >
            <div>
              <h3 className="font-semibold text-gray-900">{account.title}</h3>
              <p className="text-gray-600 text-sm">{account.description}</p>
            </div>
            <div className="text-gray-400 group-hover:text-gray-600 transition-colors duration-200">
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Select"
                width={20}
                height={20}
              />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
