import React from "react";
import {
  FaGlobe,
  FaEnvelope,
  FaPhone,
  FaInstagram,
  FaTiktok,
  FaLinkedin,
  FaFacebookF,
  FaTwitter,
} from "react-icons/fa";
import { ChevronRightIcon } from "@heroicons/react/24/outline";

import styles from "./Links.module.css";

interface Social {
  id: string;
  platform: "Facebook" | "Instagram" | "TikTok" | "Linkedin" | "Twitter";
  url: string;
}

interface LinksProps {
  website?: string;
  email?: string;
  phone?: string;
  socials: Social[];
}

const socialIcons: Record<Social["platform"], JSX.Element> = {
  Facebook: <FaFacebookF />,
  Instagram: <FaInstagram />,
  TikTok: <FaTiktok />,
  Linkedin: <FaLinkedin />,
  Twitter: <FaTwitter />,
};

const Links: React.FC<LinksProps> = ({ website, email, phone, socials }) => {
  return (
    <div className={styles.linksContainer}>
      {website && (
        <div>
          <a
            href={website}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.link}
          >
            <FaGlobe className={styles.icon} />
            <span>Website</span>
            <ChevronRightIcon className={styles.chevron} />
          </a>
        </div>
      )}
      {email && (
        <div>
          <a href={`mailto:${email}`} className={styles.link}>
            <FaEnvelope className={styles.icon} />
            <span>Email</span>
            <ChevronRightIcon className={styles.chevron} />
          </a>
        </div>
      )}
      {phone && (
        <div>
          <a href={`tel:${phone}`} className={styles.link}>
            <FaPhone className={styles.icon} />
            <span>Phone</span>
            <ChevronRightIcon className={styles.chevron} />
          </a>
        </div>
      )}

      <div className={styles.socialIcons}>
        {socials.map(
          ({ platform, url, id }) =>
            url && (
              <a
                key={id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.socialIcon}
              >
                {socialIcons[platform]}
              </a>
            )
        )}
      </div>
    </div>
  );
};

export default Links;
