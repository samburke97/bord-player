import React from "react";
import styles from "./Hero.module.css";
import SearchBar from "../ui/searchbar/SearchBar";

const HeroSection = () => {
  return (
    <section className={styles.heroSection}>
      <h1 className={styles.title}>The Home of the Game</h1>
      <SearchBar />
    </section>
  );
};

export default HeroSection;
