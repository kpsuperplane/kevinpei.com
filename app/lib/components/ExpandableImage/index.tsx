"use client";

import { useCallback, useRef, useState } from "react";
import styles from "./ExpandableImage.module.scss";
import Image from "next/image";
import { createPortal } from "react-dom";
import ExpandedImage, { numerify } from "./ExpandedImage";

export default function (props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const [opened, setOpened] = useState(false);
  const open = useCallback(() => setOpened(true), []);
  const close = useCallback(() => setOpened(false), []);

  const imageRef = useRef<HTMLImageElement>(null);

  return (
    <>
      <Image
        {...props}
        role="button"
        className={styles.image}
        placeholder={undefined}
        onClick={open}
        height={numerify(props.height)}
        width={numerify(props.width)}
        src={props.src ?? ""}
        alt={props.alt ?? ""}
        ref={imageRef}
      />
      {opened &&
        createPortal(
          <ExpandedImage sourceRef={imageRef} onDismiss={close} {...props} />,
          document.body
        )}
    </>
  );
}
