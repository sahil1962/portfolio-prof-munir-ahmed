import type { Metadata } from "next";

export function buildMetadata(opts: {
  title: string;
  description: string;
  canonical: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: opts.canonical },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: opts.canonical,
    },
  };
}
