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
      {/* Add this block for testing */}
      <div style={{ height: "200vh", background: "#f0f0f0" }}>
        {/* Dummy content to make the page scroll */}
        <p style={{ padding: "2rem", textAlign: "center" }}>
          Scroll down to see the SearchBar in the Nav!
        </p>
      </div>
    </div>
  );
}
