// app/(auth)/login/page.tsx
"use client";

import { useRouter } from "next/navigation";
import ActionHeader from "@/components/layout/headers/ActionHeader";
import styles from "./page.module.css";

interface AccountType {
  type: "player" | "business";
  title: string;
  description: string;
  route: string;
}

const accountTypes: AccountType[] = [
  {
    type: "player",
    title: "Player Account",
    description: "I'm looking to play",
    route: "/player",
  },
  {
    type: "business",
    title: "Business Account",
    description: "I'm looking to manage",
    route: "/business",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const handleBack = () => {
    router.push("/");
  };

  const handleSelection = (route: string) => {
    router.push(route);
  };

  return (
    <div className={styles.container}>
      <ActionHeader
        type="back"
        secondaryAction={handleBack}
        className={styles.header}
      />

      <div className={styles.content}>
        {/* Left side - Account selector */}
        <div className={styles.formContainer}>
          <div className={styles.formWrapper}>
            <h1 className={styles.title}>Select Account Type</h1>
            <p className={styles.description}>
              Please select the account you want to sign up or log in with.
            </p>

            <div className={styles.accountTypes}>
              {accountTypes.map((account) => (
                <button
                  key={account.type}
                  onClick={() => handleSelection(account.route)}
                  className={styles.accountTypeButton}
                >
                  <div className={styles.accountTypeContent}>
                    <div>
                      <h3 className={styles.accountTypeTitle}>
                        {account.title}
                      </h3>
                      <p className={styles.accountTypeDescription}>
                        {account.description}
                      </p>
                    </div>
                    <div className={styles.arrow}>
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 18l6-6-6-6" />
                      </svg>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right side - Image */}
        <div className={styles.imageContainer}></div>
      </div>
    </div>
  );
}
