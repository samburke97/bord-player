import React from "react";
import styles from "./Container.module.css";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  as?: React.ElementType;
  fluid?: boolean;
  size?: "sm" | "md" | "lg" | "xl" | "responsive";
  centered?: boolean;
};

export default function Container({
  children,
  className = "",
  as: Component = "div",
  fluid = false,
  size = "responsive",
  centered = false,
}: ContainerProps) {
  return (
    <Component
      className={`${styles.container} ${fluid ? styles.fluid : ""} ${
        styles[size]
      } ${centered ? styles.centered : ""} ${className}`}
    >
      {children}
    </Component>
  );
}
