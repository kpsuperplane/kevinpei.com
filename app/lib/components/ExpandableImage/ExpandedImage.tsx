import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./ExpandableImage.module.scss";
import Image from "next/image";

export function numerify(
  input: string | number | undefined
): number | undefined {
  if (typeof input === "string") {
    return Number(input);
  }
  return input;
}

const ANIMATION_CONFIG = {
  duration: 250,
  iterations: 1,
  fill: "forwards" as "forwards",
};

function getActualRect(elem: HTMLImageElement): {
  centerX: number;
  centerY: number;
  width: number;
  height: number;
} {
  const rect = elem.getBoundingClientRect();
  const aspectRatio =
    Number(elem.getAttribute("width")) / Number(elem.getAttribute("height"));
  return {
    width: Math.min(rect.width, rect.height * aspectRatio),
    height: Math.min(rect.height, rect.width / aspectRatio),
    centerX: rect.x + rect.width / 2,
    centerY: rect.y + rect.height / 2,
  };
}

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  onDismiss: () => void;
  sourceRef: React.RefObject<HTMLImageElement>;
};

export default function ExpandedImage({
  onDismiss,
  sourceRef,
  ...props
}: Props) {
  const backdrop = useRef<HTMLDivElement>(null);
  const targetRef = useRef<HTMLImageElement>(null);
  const getSourceTransform = useCallback(() => {
    const source = getActualRect(sourceRef.current!);
    const target = getActualRect(targetRef.current!);
    return {
      transform: `translate(${source.centerX - target.centerX}px, ${
        source.centerY - target.centerY
      }px) scale(${source.width / target.width}, ${
        source.height / target.height
      })`,
      borderRadius: `${8 * (target.width / source.width)}px`,
    };
  }, [sourceRef]);
  const opened = useRef(false);
  useEffect(() => {
    if (!opened.current) {
      opened.current = true;
      backdrop.current!.animate(
        [
          {
            opacity: 1,
          },
        ],
        ANIMATION_CONFIG
      );
      const transform = getSourceTransform();
      targetRef.current!.animate(
        [
          { ...transform, opacity: 1 },
          {
            opacity: 1,
            transform: "translate(0px, 0px) scale(1)",
            borderRadius: "0px",
          },
        ],
        ANIMATION_CONFIG
      );
    }
  }, [sourceRef, getSourceTransform]);
  const close = useCallback(() => {
    targetRef.current!.animate([getSourceTransform()], ANIMATION_CONFIG);
    backdrop.current
      ?.animate([{ opacity: 0 }], ANIMATION_CONFIG)
      .addEventListener("finish", onDismiss);
  }, []);
  return (
    <div className={styles.expanded} onClick={close}>
      <div className={styles.backdrop} ref={backdrop} />
      <Image
        {...props}
        role="button"
        placeholder={undefined}
        height={numerify(props.height)}
        width={numerify(props.width)}
        src={props.src ?? ""}
        alt={props.alt ?? ""}
        ref={targetRef}
      />
    </div>
  );
}
