import styles from "./NavBar.module.css";
import Image from "next/image";
import { Bars3Icon } from "@heroicons/react/24/outline";
import Link from "next/link";

const NavBar = () => {
  return (
    <nav className={`${styles.nav}`}>
      <div className="content-container">
        <div className={`${styles.nav__navbar}`}>
          <div>
            <Link href={`/`}>
              <Image
                src="/images/bord.png"
                alt="Bord Logo"
                width={78}
                height={18}
                layout="intrinsic"
              />
            </Link>
          </div>
          <div className={`${styles.nav__icon}`}>
            <Bars3Icon className="w-[24px] h-[24px]" />
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
