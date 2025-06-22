// app/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Image from "next/image";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import TitleDescription from "@/components/ui/TitleDescription";
import styles from "./login.module.css";

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

export default function LoginPage() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const handleBack = () => {
    router.push("/");
  };

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
    <div className={styles.container}>
      <div className={styles.content}>
        {/* Left side: Account Type Selector */}
        <div className={styles.formContainer}>
          <ActionHeader type="back" secondaryAction={handleBack} />
          <div className={styles.formWrapper}>
            <TitleDescription
              title="Select Account Type"
              description="Please select the account you want to sign up or log in with."
            />

            <div className={styles.accountOptions}>
              {accountTypes.map((account) => (
                <button
                  key={account.type}
                  onClick={() => handleSelection(account.type)}
                  className={styles.accountOption}
                >
                  <div className={styles.accountInfo}>
                    <h3 className={styles.accountTitle}>{account.title}</h3>
                    <p className={styles.accountDescription}>
                      {account.description}
                    </p>
                  </div>
                  <div className={styles.arrow}>
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
        </div>
        {/* Right side: Hero image */}
        <div className={styles.imageContainer}></div>
      </div>
    </div>
  );
}
