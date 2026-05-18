"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ChevronDown, Sparkles } from "lucide-react";

import { trackHighlightClick, trackHighlightsPanelToggle } from "@/lib/analytics";
import type { NewsletterLink } from "@/types/newsletter";

type ResolvedHighlight = {
  link: NewsletterLink;
  commentary?: string;
};

type NewsletterHighlightProps = {
  newsletterSlug: string;
  link: NewsletterLink;
  commentary?: string;
};

export function NewsletterHighlight({
  newsletterSlug,
  link,
  commentary,
}: NewsletterHighlightProps) {
  let faviconUrl: string | null = null;
  let hostname: string | null = null;
  try {
    const parsed = new URL(link.url);
    hostname = parsed.hostname;
    faviconUrl = `https://www.google.com/s2/favicons?domain=${parsed.hostname}&sz=64`;
  } catch {
    // invalid URL — skip favicon
  }

  return (
    <article className="rounded-xl border border-stone-200 border-l-4 border-l-violet-400 bg-white p-4 md:p-5">
      <div className="flex items-start gap-4">
        {faviconUrl ? (
          <div className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200 bg-white shadow-sm sm:flex">
            <Image
              src={faviconUrl}
              alt=""
              width={28}
              height={28}
              className="rounded-sm"
              unoptimized
            />
          </div>
        ) : null}

        <div className="min-w-0 space-y-2">
          <h3 className="text-[1.2rem] font-bold leading-tight text-stone-900 md:text-[1.3rem]">
            <Link
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-inherit decoration-transparent underline-offset-4 transition-colors hover:text-violet-700 hover:underline"
              onClick={() =>
                trackHighlightClick({
                  newsletterSlug,
                  linkId: link.id,
                  url: link.url,
                })
              }
            >
              {link.title}
            </Link>
          </h3>

          {hostname ? (
            <p className="text-[0.7rem] font-medium uppercase tracking-wide text-stone-400">
              {hostname}
            </p>
          ) : null}

          {commentary ? (
            <div className="markdown-body text-[0.9rem] leading-7 text-stone-700">
              <ReactMarkdown>{commentary}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-[0.9rem] leading-7 text-stone-700">{link.description}</p>
          )}
        </div>
      </div>
    </article>
  );
}

type HighlightsPanelProps = {
  newsletterSlug: string;
  label: string;
  highlights: ResolvedHighlight[];
};

export function HighlightsPanel({
  newsletterSlug,
  label,
  highlights,
}: HighlightsPanelProps) {
  const [isOpen, setIsOpen] = useState(true);
  const count = highlights.length;

  return (
    <section className="panel border border-stone-200 bg-white p-5 md:p-6">
      <button
        type="button"
        className="flex w-full items-start justify-between gap-4 text-left"
        aria-expanded={isOpen}
        onClick={() =>
          setIsOpen((current) => {
            trackHighlightsPanelToggle({
              newsletterSlug,
              state: current ? "closed" : "open",
            });
            return !current;
          })
        }
      >
        <div className="space-y-1">
          <h2 className="flex items-center gap-2 text-[1.25rem] font-semibold leading-tight text-violet-700">
            <Sparkles className="h-4 w-4" />
            {label}
            <span className="text-[0.95rem] font-normal text-stone-400">({count})</span>
          </h2>
          <p className="max-w-2xl text-[0.85rem] leading-6 text-stone-400">
            {count > 1 ? "Hand-picked reads chosen for the team this week." : "The one read worth your time this week."}
          </p>
        </div>
        <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600">
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </span>
      </button>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="space-y-3">
            {highlights.map(({ link, commentary }) => (
              <NewsletterHighlight
                key={link.id}
                newsletterSlug={newsletterSlug}
                link={link}
                commentary={commentary}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
