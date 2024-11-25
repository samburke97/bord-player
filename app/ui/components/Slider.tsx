"use client";

import React, { useState, useRef } from "react";
import styles from "./Slider.module.css";

const Slider = () => {
  const [leftWidth, setLeftWidth] = useState(50); // Initial width as percentage
  const sliderRef = useRef<HTMLDivElement | null>(null);

  const handleMouseMove = (event: MouseEvent) => {
    if (sliderRef.current) {
      const containerWidth = sliderRef.current.parentElement?.offsetWidth || 0;
      const newWidth = (event.clientX / containerWidth) * 100;
      if (newWidth >= 10 && newWidth <= 90) {
        setLeftWidth(newWidth);
      }
    }
  };

  const handleMouseUp = () => {
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
  };

  const handleMouseDown = (event: React.MouseEvent) => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
  };

  return (
    <div
      className={styles.slider}
      ref={sliderRef}
      style={{ left: `${leftWidth}%` }}
      onMouseDown={handleMouseDown}
    />
  );
};

export default Slider;
