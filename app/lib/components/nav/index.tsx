import Image from "next/image";
import { Instagram, Github, Linkedin, Mail, ScrollText } from "lucide-react";

import styles from "./nav.module.scss";
import me from "./me.jpg";
import ThemeSelector from "./ThemeSelector";
import Link from "#/app/lib/components/transitions/Link";

const IMAGE_SIZE = 36;

export default function () {
  return (
    <header>
      <nav className={styles.root}>
        <div className={styles.start}>
          <Link title="Navigate Home" href="/" className={styles.home}>
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
          </Link>
        </div>
        <ThemeSelector />
        <div className={styles.end}>
          <div className={styles.links}>
            <a
              title="My Resume"
              target="_blank"
              href="/assets/kevin-pei-resume.pdf"
            >
              <span style={{ verticalAlign: "text-bottom" }}>
                <ScrollText size="1em" />
              </span>{" "}
              Resume
            </a>
            <span className={styles.divider} />
            <Link
              title="My Instagram"
              target="_blank"
              href="https://instagram.com/kpsuperplane"
            >
              <Instagram size="1em" />
            </Link>
            <Link
              title="My Github"
              target="_blank"
              href="https://github.com/kpsuperplane"
            >
              <Github size="1em" />
            </Link>
            <Link
              title="My LinkedIn"
              target="_blank"
              href="https://www.linkedin.com/in/kpsuperplane/"
            >
              <Linkedin size="1em" />
            </Link>
            <Link title="My Email" href="mailto:hello@kevinpei.com">
              <Mail size="1em" />
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
