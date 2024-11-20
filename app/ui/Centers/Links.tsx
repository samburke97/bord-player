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

const Links = () => {
  return (
    <div className={styles.linksContainer}>
      <div className={styles.link}>
        <FaGlobe className={styles.icon} />
        <span>Website</span>
        <ChevronRightIcon className={styles.chevron} />
      </div>
      <div className={styles.link}>
        <FaEnvelope className={styles.icon} />
        <span>Email</span>
        <ChevronRightIcon className={styles.chevron} />
      </div>
      <div className={styles.link}>
        <FaPhone className={styles.icon} />
        <span>Phone Number</span>
        <ChevronRightIcon className={styles.chevron} />
      </div>
      <div className={styles.socialIcons}>
        <FaInstagram className={styles.socialIcon} />
        <FaTiktok className={styles.socialIcon} />
        <FaLinkedin className={styles.socialIcon} />
        <FaFacebookF className={styles.socialIcon} />
        <FaTwitter className={styles.socialIcon} />
      </div>
    </div>
  );
};

export default Links;
