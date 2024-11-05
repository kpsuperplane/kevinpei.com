import styles from "./KevinDefinition.module.scss";

import Image from "next/image";
import me from "./lib/components/nav/me.jpg";

export default function KevinDefinition() {
  return (
    <section className={styles.root}>
      <header className={styles.header}>
        <Image className={styles.image} alt="Photo of Kevin Pei" src={me} />
        <div>
          <h1>Kevin Pei</h1>
          <p
            style={{
              color: "var(--text-deemphasized)",
              fontSize: "0.8em",
            }}
          >
            [ˈkɛvɪn peɪ] · noun
          </p>
        </div>
      </header>
      <p>A silly person who enjoys building cool things</p>
      <blockquote>
        <p>
          <em>Sometimes Kevin can be a real Kevin</em>
        </p>
      </blockquote>
    </section>
  );
}
