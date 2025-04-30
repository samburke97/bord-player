"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import Container from "./Container";
import styles from "./Footer.module.css";
import { footerLinks } from "@/config/footerConfig";
import ThemeToggle from "./ThemeToggle";

interface FooterLinkProps {
  href: string;
  label: string;
  ariaLabel?: string;
  title?: string;
  isExternal?: boolean;
}

interface FooterColumnProps {
  title: string;
  links: FooterLinkProps[];
  isSocial?: boolean;
}

// FooterColumn component definition
const FooterColumn = ({
  title,
  links,
  isSocial = false,
}: FooterColumnProps) => {
  const headingId = `${title.toLowerCase().replace(/\s+/g, "-")}-heading`;

  return (
    <nav className={styles.column} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        {title}
      </h2>
      <ul className={styles.linkList} role="list">
        {links.map((link, index) => (
          <li key={index}>
            <Link
              href={link.href}
              className={isSocial ? styles.socialLink : styles.link}
              aria-label={link.ariaLabel}
              title={link.title}
              {...(link.isExternal
                ? { rel: "noopener noreferrer", target: "_blank" }
                : {})}
            >
              {link.label}
              {isSocial && (
                <Image
                  src="/icons/utility-outline/forward.svg"
                  alt=""
                  width={16}
                  height={16}
                  loading="lazy"
                />
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default function Footer() {
  const [currentYear, setCurrentYear] = useState<number>(2025);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());

    // Add schema.org structured data
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.innerHTML = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "Bord Sports",
      url: "https://yourdomain.com",
      sameAs: [
        "https://instagram.com/bordsports",
        "https://facebook.com/bordsports",
        "https://linkedin.com/company/bordsports",
      ],
    });
    document.head.appendChild(script);

    return () => {
      if (script.parentNode) {
        document.head.removeChild(script);
      }
    };
  }, []);

  return (
    <footer
      className={styles.footer}
      role="contentinfo"
      aria-label="Site footer"
    >
      <Container>
        <div className={styles.container}>
          <div className={styles.topSection}>
            <FooterColumn title="Discover" links={footerLinks.discover} />
            <FooterColumn title="Legal" links={footerLinks.legal} />
            <FooterColumn
              title="Follow Us"
              links={footerLinks.social}
              isSocial={true}
            />
          </div>

          <div className={styles.bottomSection}>
            <div className={styles.bottomLeft}>
              <ThemeToggle />
            </div>
            <p className={styles.copyright}>
              <span aria-label="Copyright">©</span> {currentYear} Bord Sports
              Ltd
            </p>
          </div>
        </div>
      </Container>
    </footer>
  );
}
