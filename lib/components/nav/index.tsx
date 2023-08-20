import Image from "next/image";
import Link from "next/link";
import { Instagram, Github, Linkedin } from "lucide-react";

import styles from "./nav.module.scss";
import me from "./me.jpg";
import ThemeSelector from "./ThemeSelector";

const IMAGE_SIZE = 48;

export default function () {
  return (
    <header>
      <nav className={styles.root}>
        <Link href="/" className={styles.start}>
          <Image
            width={IMAGE_SIZE}
            height={IMAGE_SIZE}
            className={styles.image}
            alt="Photo of Kevin Pei"
            src={me}
          />
          <h1 className={styles.name}>Hi, I&rsquo;m Kevin 👋</h1>
        </Link>
        <ThemeSelector />
        <div className={styles.end}>
          <div className={styles.links}>
            <Link target="_blank" href="/assets/kevin-pei-resume-20201024.pdf">
              Resume
            </Link>
            <span className={styles.divider} />
            <Link target="_blank" href="https://instagram.com/kpsuperplane">
              <Instagram size="1em" />
            </Link>
            <Link target="_blank" href="https://github.com/kpsuperplane">
              <Github size="1em" />
            </Link>
            <Link
              target="_blank"
              href="https://www.linkedin.com/in/kpsuperplane/"
            >
              <Linkedin size="1em" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
