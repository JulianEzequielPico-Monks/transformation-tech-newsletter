"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { trackSummaryToggle, trackSummaryLinkClick } from "@/lib/analytics";

type SummaryPanelProps = {
  newsletterSlug: string;
  summary: string;
};

export function SummaryPanel({ newsletterSlug, summary }: SummaryPanelProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <section className="panel border border-stone-200 bg-gradient-to-b from-white to-stone-50/50 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-[1.7rem] font-bold leading-tight">Summary</h2>
        <button
          type="button"
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:bg-stone-100"
          aria-label={isOpen ? "Collapse Summary" : "Expand Summary"}
          onClick={() => {
            const next = !isOpen;
            setIsOpen(next);
            trackSummaryToggle({ newsletterSlug, state: next ? "open" : "closed" });
          }}
        >
          <ChevronDown
            className={`h-4 w-4 transition-transform duration-300 ${isOpen ? "rotate-180" : "rotate-0"}`}
          />
        </button>
      </div>

      <div
        className={`grid transition-all duration-300 ease-in-out ${isOpen ? "mt-4 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden">
          <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm font-bold leading-relaxed text-amber-900">
            This summary doesn&apos;t cover all the links. Explore the sections below and use the tag filters to find what&apos;s most relevant to you.
          </div>
          <div className="markdown-body">
            <ReactMarkdown
              components={{
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() =>
                      trackSummaryLinkClick({
                        newsletterSlug,
                        linkUrl: href ?? "",
                        linkText: typeof children === "string" ? children : "",
                      })
                    }
                  >
                    {children}
                  </a>
                ),
              }}
            >
              {summary}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </section>
  );
}
