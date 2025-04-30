import React from "react";
import styles from "./OpeningHours.module.css";

interface OpeningHour {
  dayOfWeek: number; // 0 = Monday, 1 = Tuesday, etc.
  isOpen: boolean;
  openTime: string;
  closeTime: string;
}

interface OpeningHoursProps {
  openingHours: OpeningHour[];
}

const days = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const OpeningHours: React.FC<OpeningHoursProps> = ({ openingHours }) => {
  // Get current day (0 = Sunday in JS, but we use 0 = Monday)
  const currentJsDay = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentDay = currentJsDay === 0 ? 6 : currentJsDay - 1; // Convert to our format

  return (
    <section className={styles.section}>
      <h2 className={styles.title}>Opening Times</h2>
      <div className={styles.hoursContainer}>
        {days.map((day, index) => {
          // Find the opening hours for this day
          const hours = openingHours.find((h) => h.dayOfWeek === index);
          const isToday = index === currentDay;

          return (
            <div
              key={day}
              className={`${styles.row} ${isToday ? styles.today : ""}`}
            >
              <span className={styles.day}>{day}</span>
              <span className={styles.hours}>
                {hours?.isOpen
                  ? `${hours.openTime} - ${hours.closeTime}`
                  : "Closed"}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default OpeningHours;
