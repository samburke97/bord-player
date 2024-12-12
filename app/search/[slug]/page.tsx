import fetchCenters from "@/app/lib/data/centers/fetchCenters";
import SearchItem from "@/app/ui/Search/SeachItem";
import SearchMap from "@/app/ui/Search/SearchMap";
import styles from "./Search.module.css";

const Search = async () => {
  const centers = await fetchCenters();

  return (
    <div className="content-container">
      <div className={styles.contentContainer}>
        <div className={styles.leftPanel}>
          <SearchItem centers={centers} />
        </div>
        <div className={styles.rightPanel}>
          <SearchMap centers={centers} />
        </div>
      </div>
    </div>
  );
};

export default Search;
