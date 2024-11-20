import styles from "./SearchBar.module.css";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";

const SearchBar = () => {
  return (
    <div className={styles.search}>
      <MagnifyingGlassIcon className={styles.icon} />
      <input type="text" placeholder="Search for your type of fun" />
    </div>
  );
};

export default SearchBar;
