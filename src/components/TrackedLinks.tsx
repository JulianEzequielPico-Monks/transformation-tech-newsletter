"use client";

import Link from "next/link";
import { Info } from "lucide-react";
import { trackNavLinkClick, trackSourceLinkClick } from "@/lib/analytics";

type Source = { name: string; url: string };

export function TrackedSourceLinks({ sources }: { sources: Source[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {sources.map((source) => (
        <li key={source.url}>
          <a
            href={source.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
            onClick={() => trackSourceLinkClick({ sourceName: source.name, sourceUrl: source.url })}
          >
            {source.name}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function TrackedHowItWorksLink() {
  return (
    <Link
      href="/how-it-works"
      className="inline-flex items-center gap-1.5 text-sm text-stone-400 transition-colors hover:text-stone-600"
      onClick={() => trackNavLinkClick({ label: "how_it_works", destination: "/how-it-works" })}
    >
      <Info className="h-3.5 w-3.5" />
      How this works
    </Link>
  );
}

export function TrackedLogoLink({ children }: { children: React.ReactNode }) {
  return (
    <Link
      href="/"
      className="inline-flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-70"
      onClick={() => trackNavLinkClick({ label: "logo", destination: "/" })}
    >
      {children}
    </Link>
  );
}
