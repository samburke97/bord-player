import React from "react";
import styles from "./SocialLinks.module.css";
import Image from "next/image";

interface Social {
  id: string;
  platform: string;
  url: string;
}

interface SocialLinksProps {
  socials: Social[];
}

const SocialLinks: React.FC<SocialLinksProps> = ({ socials }) => {
  if (!socials || socials.length === 0) {
    return null;
  }

  // Function to get the correct icon path based on platform
  const getSocialIcon = (platform: string): string => {
    // Convert to lowercase and remove any spaces for consistency
    const normalizedPlatform = platform.toLowerCase().replace(/\s+/g, "");

    const platformMap: Record<string, string> = {
      facebook: "facebook.svg",
      instagram: "instagram.svg",
      twitter: "twitter.svg",
      x: "twitter.svg",
      linkedin: "linkedin.svg",
      youtube: "youtube.svg",
      tiktok: "tiktok.svg",
      pinterest: "pinterest.svg",
      snapchat: "snapchat.svg",
    };

    return platformMap[normalizedPlatform] || `${normalizedPlatform}.svg`;
  };

  return (
    <section className={styles.container}>
      {socials.map((social) => (
        <a
          key={social.id}
          href={social.url}
          className={styles.socialIcon}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Visit our ${social.platform}`}
        >
          <Image
            src={`/icons/socials/${getSocialIcon(social.platform)}`}
            alt={`${social.platform} icon`}
            width={20}
            height={20}
          />
        </a>
      ))}
    </section>
  );
};

export default SocialLinks;
