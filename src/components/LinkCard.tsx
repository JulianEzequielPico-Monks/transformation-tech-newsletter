"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Lightbulb,
  Monitor,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  TestTube,
  ThumbsDown,
  ThumbsUp,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

import { trackNewsletterFeedback, trackNewsletterLinkClick, trackReasonExpand } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsletterBucket, NewsletterLink } from "@/types/newsletter";

const TAG_ICONS: Record<string, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  mobile: Smartphone,
  automation: Workflow,
  qa: TestTube,
  tooling: Wrench,
  ai: BrainCircuit,
  thinking: Lightbulb,
  "general concepts": BookOpen,
  security: Shield,
  mindblown: Sparkles,
};

type LinkCardProps = {
  newsletterSlug: string;
  section: NewsletterBucket;
  link: NewsletterLink;
};

const SECTION_TONE: Record<NewsletterBucket, string> = {
  useful: "border-violet-200 bg-violet-50/60",
  maybeUseful: "border-amber-200 bg-amber-50/55",
  discarded: "border-pink-200 bg-pink-50/50",
};

const TAG_TONE = "text-[0.65rem] font-semibold uppercase tracking-wide text-stone-400";

export function LinkCard({
  newsletterSlug,
  section,
  link,
}: LinkCardProps) {
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);

  let faviconUrl: string | null = null;
  try {
    faviconUrl = `https://www.google.com/s2/favicons?domain=${new URL(link.url).hostname}&sz=64`;
  } catch {
    // invalid URL — skip favicon
  }

  return (
    <li className={`rounded-xl border p-5 transition-shadow hover:shadow-md ${SECTION_TONE[section]}`}>
      {/* Content zone */}
      <div className="flex gap-4">
        {faviconUrl ? (
          <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-stone-200/80 bg-white shadow-sm">
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
          <h3 className="max-w-3xl text-[1.2rem] font-bold leading-snug text-stone-900 md:text-[1.3rem]">
            <Link
              href={link.url}
              target="_blank"
              rel="noreferrer"
              className="text-inherit decoration-transparent underline-offset-4 transition-colors hover:text-violet-700 hover:underline"
              onClick={() =>
                trackNewsletterLinkClick({
                  newsletterSlug,
                  section,
                  linkId: link.id,
                  title: link.title,
                  url: link.url,
                })
              }
            >
              {link.title}
            </Link>
          </h3>

          <p className="max-w-2xl text-[0.88rem] leading-6 text-stone-500">{link.description}</p>
        </div>
      </div>

      {/* Why this — collapsible footnote */}
      <div className="mt-3">
        <button
          type="button"
          onClick={() => {
            const next = !reasonOpen;
            setReasonOpen(next);
            trackReasonExpand({ newsletterSlug, section, linkId: link.id, state: next ? "open" : "closed" });
          }}
          className="inline-flex items-center gap-1 text-[0.7rem] text-stone-400 transition-colors hover:text-stone-500"
        >
          <Lightbulb className="h-3 w-3 shrink-0" />
          Why this?
          <ChevronDown className={`h-3 w-3 transition-transform duration-200 ${reasonOpen ? "rotate-180" : ""}`} />
        </button>
        <div className={`grid transition-all duration-300 ease-in-out ${reasonOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
          <div className="overflow-hidden">
            <p className="pt-1.5 text-[0.78rem] italic leading-relaxed text-stone-400">{link.reason}</p>
          </div>
        </div>
      </div>

      {/* Meta zone — tags + feedback */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-stone-200/60 pt-3">
        {link.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-1.5" aria-label="Tags">
            {link.tags.map((tag) => {
              const Icon = TAG_ICONS[tag.trim().toLowerCase()];
              return (
                <li key={`${link.id}-${tag}`}>
                  <Badge variant="outline" className={`${TAG_TONE} inline-flex items-center gap-1`}>
                    {Icon ? <Icon className="h-2.5 w-2.5 shrink-0" /> : null}
                    {tag}
                  </Badge>
                </li>
              );
            })}
          </ul>
        ) : (
          <span />
        )}

        <div
          className="rounded-full border border-stone-200 bg-white p-0.5 shadow-sm"
          role="group"
          aria-label={`Feedback for ${link.title}`}
        >
          <Button
            type="button"
            variant="ghost"
            title="Thumbs up"
            aria-label="Thumbs up"
            className={`h-7 w-7 rounded-full p-0 ${voteState === "up" ? "bg-violet-100 text-violet-900" : "text-stone-400 hover:bg-violet-50 hover:text-violet-700"}`}
            onClick={() => {
              setVoteState("up");
              trackNewsletterFeedback({
                newsletterSlug,
                section,
                linkId: link.id,
                vote: "up",
              });
            }}
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            title="Thumbs down"
            aria-label="Thumbs down"
            className={`h-7 w-7 rounded-full p-0 ${voteState === "down" ? "bg-pink-100 text-pink-900" : "text-stone-400 hover:bg-pink-50 hover:text-pink-700"}`}
            onClick={() => {
              setVoteState("down");
              trackNewsletterFeedback({
                newsletterSlug,
                section,
                linkId: link.id,
                vote: "down",
              });
            }}
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </li>
  );
}
