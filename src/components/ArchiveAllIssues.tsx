"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

type IssueItem = {
  slug: string;
  title: string;
  formattedDate: string;
  total: number;
  emailsProcessed: number;
};

type Props = {
  newsletters: IssueItem[];
  total: number;
};

export function ArchiveAllIssues({ newsletters, total }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <section className="panel border border-stone-200 bg-gradient-to-b from-white to-stone-50/50 p-5 md:p-7">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">Explore</p>
          <h2 className="text-2xl font-semibold md:text-3xl">All issues ({total})</h2>
        </div>

        <button
          type="button"
          className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:bg-stone-100"
          aria-label={open ? "Collapse all issues" : "Expand all issues"}
          onClick={() => setOpen((v) => !v)}
        >
          <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? "rotate-180" : "rotate-0"}`} />
        </button>
      </div>

      <div className={`grid transition-all duration-300 ease-in-out ${open ? "mt-5 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
        <div className="overflow-hidden">
          {newsletters.length === 0 ? (
            <p className="text-stone-600">No issues yet.</p>
          ) : (
            <ul className="space-y-3">
              {newsletters.map((newsletter) => (
                <li key={newsletter.slug}>
                  <Link
                    href={`/newsletter/${newsletter.slug}`}
                    className="block rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(30,41,59,0.4)] transition-all hover:border-violet-200 hover:bg-violet-50/40 hover:shadow-md"
                  >
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-stone-900">{newsletter.formattedDate}</p>
                      <span className="text-xs text-stone-400">{newsletter.total} links</span>
                      {newsletter.emailsProcessed > 0 && (
                        <span className="text-xs text-stone-400">· {newsletter.emailsProcessed} emails</span>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
}
