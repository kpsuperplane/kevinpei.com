import Image from "next/image";
import { Instagram, Github, Linkedin } from "lucide-react";

import styles from "./nav.module.scss";
import me from "./me.jpg";
import ThemeSelector from "./ThemeSelector";

const IMAGE_SIZE = 36;

export default function () {
  return (
    <header>
      <nav className={styles.root}>
        <div className={styles.start}>
          <a href="/" className={styles.home}>
            <Image
              width={IMAGE_SIZE}
              height={IMAGE_SIZE}
              className={styles.image}
              alt="Photo of Kevin Pei"
              src={me}
            />
            <h1 className={styles.name}>
              Hi, I&rsquo;m <span className={styles.fancy}>Kevin</span> 👋
            </h1>
          </a>
        </div>
        <ThemeSelector />
        <div className={styles.end}>
          <div className={styles.links}>
            <a target="_blank" href="/assets/kevin-pei-resume-20201024.pdf">
              Resume
            </a>
            <span className={styles.divider} />
            <a target="_blank" href="https://instagram.com/kpsuperplane">
              <Instagram size="1em" />
            </a>
            <a target="_blank" href="https://github.com/kpsuperplane">
              <Github size="1em" />
            </a>
            <a target="_blank" href="https://www.linkedin.com/in/kpsuperplane/">
              <Linkedin size="1em" />
            </a>
          </div>
        </div>
      </nav>
    </header>
  );
}
