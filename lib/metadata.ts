import { Metadata } from "next";

export function getMetadata(
  title: string,
  description: string,
  other: Metadata = {}
): Metadata {
  return {
    authors: {
      name: "Kevin Pei",
      url: "https://kevinpei.com",
    },
    title,
    description,
    openGraph: {
      title,
      description,
    },
    ...other,
  };
}
