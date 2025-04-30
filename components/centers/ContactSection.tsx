import React from "react";
import styles from "./ContactSection.module.css";
import Image from "next/image";
import SocialLinks from "./SocialLinks";

interface ContactSectionProps {
  address?: string;
  website?: string;
  phone?: string;
  email?: string;
  socials: [];
}

const ContactSection: React.FC<ContactSectionProps> = ({
  address,
  website,
  phone,
  email,
  socials,
}) => {
  if (!address && !website && !phone && !email) {
    return null;
  }

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Contact</h2>
      <div className={styles.contactList}>
        {address && (
          <a
            href={`https://maps.google.com/?q=${address}`}
            className={styles.contactItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.icon}>
              <Image
                src="/icons/utility-outline/location.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
            <span className={styles.label}>Directions</span>
            <div className={styles.chevron}>
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
          </a>
        )}

        {website && (
          <a
            href={website}
            className={styles.contactItem}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.icon}>
              <Image
                src="/icons/utility-outline/website.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
            <span className={styles.label}>Website</span>
            <div className={styles.chevron}>
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
          </a>
        )}

        {phone && (
          <a href={`tel:${phone}`} className={styles.contactItem}>
            <div className={styles.icon}>
              <Image
                src="/icons/utility-outline/phone.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
            <span className={styles.label}>{phone}</span>
            <div className={styles.chevron}>
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
          </a>
        )}

        {email && (
          <a href={`mailto:${email}`} className={styles.contactItem}>
            <div className={styles.icon}>
              {" "}
              <Image
                src="/icons/utility-outline/mail.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
            <span className={styles.label}>Email</span>
            <div className={styles.chevron}>
              <Image
                src="/icons/utility-outline/right.svg"
                alt="Share center"
                width={24}
                height={24}
              />
            </div>
          </a>
        )}
      </div>
      <SocialLinks socials={socials || []} />
    </section>
  );
};

export default ContactSection;
