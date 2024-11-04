import { useEffect } from "react";
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

type Props = React.ImgHTMLAttributes<HTMLImageElement> & {
  onDismiss: () => void;
  imageRef: React.RefObject<HTMLImageElement>;
};

export default function ExpandedImage({
  onDismiss,
  imageRef,
  ...props
}: Props) {
  return (
    <div className={styles.expanded} onClick={onDismiss}>
      <Image
        {...props}
        role="button"
        placeholder={undefined}
        height={numerify(props.height)}
        width={numerify(props.width)}
        src={props.src ?? ""}
        alt={props.alt ?? ""}
      />
    </div>
  );
}
