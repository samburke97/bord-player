import fetchCenters from "./lib/data/centers/fetchCenters";
import styles from "./ui/components/Homepage/Homepage.module.css";
import SearchBar from "./ui/components/Homepage/SearchBar";
import MyCarousel from "./ui/components/Homepage/Carousel";

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
