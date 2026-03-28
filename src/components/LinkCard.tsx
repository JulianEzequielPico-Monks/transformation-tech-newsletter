"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ChevronDown,
  Lightbulb,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";

import { trackNewsletterFeedback, trackNewsletterLinkClick } from "@/lib/analytics";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { NewsletterBucket, NewsletterLink } from "@/types/newsletter";

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

const TAG_TONE = "text-[0.7rem] font-medium uppercase text-stone-500";

export function LinkCard({
  newsletterSlug,
  section,
  link,
}: LinkCardProps) {
  const [voteState, setVoteState] = useState<"up" | "down" | null>(null);
  const [reasonOpen, setReasonOpen] = useState(false);

  return (
    <li
      className={`space-y-3 rounded-xl border p-4 transition-shadow hover:shadow-md ${SECTION_TONE[section]}`}
    >
      <h3 className="max-w-3xl text-[1.25rem] font-bold leading-snug text-stone-900 md:text-[1.35rem]">
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

      <p className="text-[0.9rem] leading-6 text-stone-500">{link.description}</p>

      <button
        type="button"
        onClick={() => setReasonOpen((v) => !v)}
        className="inline-flex items-center gap-1 text-[0.75rem] text-stone-400 transition-colors hover:text-stone-600"
      >
        <Lightbulb className="h-3 w-3 shrink-0" />
        Why this?
        <ChevronDown className={`h-3 w-3 transition-transform ${reasonOpen ? "rotate-180" : ""}`} />
      </button>
      <div className={`grid transition-all duration-300 ease-in-out ${reasonOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          <p className="pt-1 text-[0.8rem] leading-relaxed text-stone-500">{link.reason}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        {link.tags.length > 0 ? (
          <ul className="flex flex-wrap gap-2" aria-label="Tags">
            {link.tags.map((tag) => (
              <li key={`${link.id}-${tag}`}>
                <Badge variant="outline" className={TAG_TONE}>
                  {tag}
                </Badge>
              </li>
            ))}
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
            className={`h-8 w-8 rounded-full p-0 ${voteState === "up" ? "bg-violet-100 text-violet-900" : "text-stone-400 hover:bg-violet-50 hover:text-violet-700"}`}
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
            <ThumbsUp className="h-4 w-4" />
          </Button>

          <Button
            type="button"
            variant="ghost"
            title="Thumbs down"
            aria-label="Thumbs down"
            className={`h-8 w-8 rounded-full p-0 ${voteState === "down" ? "bg-pink-100 text-pink-900" : "text-stone-400 hover:bg-pink-50 hover:text-pink-700"}`}
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
            <ThumbsDown className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </li>
  );
}
