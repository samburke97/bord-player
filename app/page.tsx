import fetchCenters from "./lib/data/centers/fetchCenters";
import styles from "./ui/Homepage/Homepage.module.css";
import SearchBar from "./ui/components/SearchBar/SearchBarClient";
import MyCarousel from "./ui/Homepage/Carousel";

export default async function Home() {
  const centers = await fetchCenters();

  return (
    <div className={`${styles.homepage}`}>
      <div className="content-container">
        <div className={`${styles.space}`}>
          <h1>Jump on bord some Sports & Activities</h1>
          <SearchBar />
        </div>
        <div className={`${styles.space}`}>
          <h2>Recently Added</h2>
        </div>
      </div>
      <MyCarousel centers={centers} />
    </div>
  );
}
