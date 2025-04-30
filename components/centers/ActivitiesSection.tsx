"use client";

import React, { useState } from "react";
import styles from "./ActivitiesSection.module.css";
import ActivitiesCarousel from "@/components/centers/ActivitiesCarousel";
import ActivityModal from "@/components/centers/ActivityModal";

interface PricingOption {
  id: string;
  price: number;
  playerType: string;
  duration: string | null;
  priceType: string;
}

interface Activity {
  id?: string;
  title: string;
  description?: string;
  imageUrl?: string;
  buttonTitle?: string;
  buttonLink?: string;
  type?: string;
  pricing?: PricingOption[];
}

interface ActivitiesSectionProps {
  activities: Activity[];
}

const ActivitiesSection: React.FC<ActivitiesSectionProps> = ({
  activities,
}) => {
  const [selectedActivity, setSelectedActivity] = useState<Activity | null>(
    null
  );
  const [isModalOpen, setIsModalOpen] = useState(false);

  if (!activities || activities.length === 0) {
    return null;
  }

  // Handler for when an activity card is clicked
  const handleActivityClick = (activity: Activity) => {
    console.log("Activity clicked:", activity);
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  // Handler to close the modal
  const handleModalClose = () => {
    setIsModalOpen(false);
  };

  return (
    <section className={styles.section}>
      <ActivitiesCarousel
        activities={activities}
        onActivityClick={handleActivityClick}
      />

      <ActivityModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={handleModalClose}
      />
    </section>
  );
};

export default ActivitiesSection;
