"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./Centers.module.css";
import CenterHeader from "@/components/centers/CenterHeader";
import ImageGallery from "@/components/centers/ImageGallery";
import QuickInfo from "@/components/centers/QuickInfo";
import CenterDescription from "@/components/centers/CenterDescription";
import ActivitiesSection from "@/components/centers/ActivitiesSection";
import LocationSection from "@/components/centers/LocationSection";
import OpeningHours from "@/components/centers/OpeningHours";
import FacilitiesSection from "@/components/centers/FacilitiesSection";
import ContactSection from "@/components/centers/ContactSection";
import StickySidebar from "@/components/centers/StickySidebar";
import Container from "@/components/layout/Container";
import { useDistance } from "@/hooks/useDistance";
import type { Center } from "@/types/entities";

interface CenterDetailsClientProps {
  center: Center;
}

export default function CenterDetailsClient({
  center,
}: CenterDetailsClientProps) {
  // Track if we're on a large screen
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  // Track if the hero image gallery is completely out of view
  const [heroIsOutOfView, setHeroIsOutOfView] = useState(false);

  // Ref to the hero element - this includes the gallery and title
  const heroRef = useRef<HTMLDivElement>(null);

  // Get distance from the custom hook
  const { distance } = useDistance(
    center.latitude ? Number(center.latitude) : null,
    center.longitude ? Number(center.longitude) : null
  );

  useEffect(() => {
    // Function to check if we're on a large screen
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    // Function to check if hero is out of view
    const checkHeroVisibility = () => {
      if (!heroRef.current) return;

      // Get hero element's position
      const rect = heroRef.current.getBoundingClientRect();

      // Hero is out of view when its ENTIRE element is above the viewport's top edge plus header
      // The header is 80px tall
      const isOutOfView = rect.bottom <= 80;

      setHeroIsOutOfView(isOutOfView);
    };

    // Set initial states
    checkScreenSize();
    checkHeroVisibility();

    // Add event listeners
    window.addEventListener("resize", checkScreenSize);
    window.addEventListener("scroll", checkHeroVisibility, { passive: true });

    // Clean up
    return () => {
      window.removeEventListener("resize", checkScreenSize);
      window.removeEventListener("scroll", checkHeroVisibility);
    };
  }, []);

  // Determine the appropriate class based on whether a logo exists
  const mobileTitleClass = center.logoUrl
    ? `${styles.mobileTitleContainer} ${styles.mobileTitleWithLogo}`
    : styles.mobileTitleContainer;

  return (
    <div className={styles.centerPageWrapper}>
      <div className={styles.heroSection} ref={heroRef}>
        <div className={styles.mobileHeaderWrapper}>
          <ImageGallery images={center.images || []} logoUrl={center.logoUrl} />

          <div className={mobileTitleClass}>
            <h1 className={styles.mobileTitle}>{center.name}</h1>
            <div className={styles.mobileSubtitle}>
              <span
                className={
                  center.isOpenNow ? styles.statusTag : styles.statusClosed
                }
              >
                {center.isOpenNow ? "Open Now" : "Closed Now"}
              </span>
              <span>•</span>
              <span>{center.type || "Climbing Gym"}</span>
              {distance !== null && (
                <>
                  <span>•</span>
                  <span>{distance} km</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Header - Only visible on desktop */}
        <div className={styles.desktopOnly}>
          <Container>
            <CenterHeader
              name={center.name}
              logo={center.logoUrl}
              status={center.isOpenNow ? "Open Now" : "Closed Now"}
              type={center.type || "Climbing Gym"}
              distance={distance}
            />

            <ImageGallery images={center.images || []} />
          </Container>
        </div>
      </div>

      {/* Main Content Area with Two Column Layout on Desktop */}
      <div className={styles.mainContentWrapper}>
        <Container>
          <div className={styles.twoColumnLayout}>
            {/* Left Column - Main Content */}
            <div className={styles.mainColumn}>
              {/* Feature Tags */}
              <QuickInfo
                features={center.tags?.map((tag) => tag.name) || []}
                sports={center.sports?.map((sport) => sport.name) || []}
              />

              {/* Description */}
              <CenterDescription
                description={center.description || undefined}
              />

              {/* Activities Section */}
              <ActivitiesSection activities={center.activities || []} />

              {/* Location/Map Section */}
              <LocationSection
                address={center.address || undefined}
                latitude={center.latitude}
                longitude={center.longitude}
              />

              {/* Opening Hours Section */}
              <OpeningHours openingHours={center.openingHours || []} />

              {/* Facilities Section */}
              <FacilitiesSection facilities={center.facilities || []} />

              {/* Contact Section */}
              <ContactSection
                address={center.address || undefined}
                website={center.links?.[0]?.url}
                phone={center.phone || undefined}
                email={center.email || undefined}
                socials={[]}
              />
            </div>

            {/* Right Column - Sticky Sidebar (desktop only) */}
            {isLargeScreen && (
              <div className={styles.sidebarColumn}>
                <StickySidebar
                  showCenterInfo={heroIsOutOfView}
                  centerName={center.name}
                  centerType={center.type || "Climbing Gym"}
                  websiteUrl={center.links?.[0]?.url}
                  isOpen={center.isOpenNow}
                  distance={distance || undefined}
                />
              </div>
            )}
          </div>
        </Container>
      </div>

      {/* Mobile Fixed Bottom Button */}
      {!isLargeScreen && center.links?.[0]?.url && (
        <div className={styles.mobileVisitButtonContainer}>
          <a
            href={center.links[0].url}
            className={styles.mobileVisitButton}
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
}
