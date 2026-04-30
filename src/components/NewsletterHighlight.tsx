"use client";

import Image from "next/image";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { Sparkles } from "lucide-react";

import { trackHighlightClick } from "@/lib/analytics";
import type { NewsletterLink } from "@/types/newsletter";

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
    <section className="panel relative overflow-hidden border border-violet-300 bg-gradient-to-br from-violet-50 via-white to-amber-50 p-6 md:p-8">
      <div className="flex items-center gap-2 text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-violet-700">
        <Sparkles className="h-3.5 w-3.5" />
        This week&apos;s pick
      </div>

      <div className="mt-4 flex items-start gap-4">
        {faviconUrl ? (
          <div className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-stone-200 bg-white shadow-sm sm:flex">
            <Image
              src={faviconUrl}
              alt=""
              width={32}
              height={32}
              className="rounded-sm"
              unoptimized
            />
          </div>
        ) : null}

        <div className="min-w-0 space-y-3">
          <h2 className="text-2xl font-bold leading-tight text-stone-900 md:text-3xl">
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
          </h2>

          {hostname ? (
            <p className="text-[0.72rem] font-medium uppercase tracking-wide text-stone-400">
              {hostname}
            </p>
          ) : null}

          {commentary ? (
            <div className="markdown-body text-[0.95rem] leading-7 text-stone-700">
              <ReactMarkdown>{commentary}</ReactMarkdown>
            </div>
          ) : (
            <p className="text-[0.95rem] leading-7 text-stone-700">{link.description}</p>
          )}
        </div>
      </div>
    </section>
  );
}
