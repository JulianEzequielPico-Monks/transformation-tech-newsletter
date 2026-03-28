import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getAllNewsletters } from "@/lib/newsletters";

export const metadata = {
  title: "Newsletter Archive",
};

export default async function ArchivePage() {
  const newsletters = await getAllNewsletters();

  return (
    <section className="panel space-y-6 border border-violet-200 bg-gradient-to-b from-white via-violet-50/35 to-white p-5 md:p-7">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">Explore</p>
        <h1 className="text-3xl font-semibold md:text-4xl">Archive</h1>
        <p className="max-w-2xl text-stone-600">
          {newsletters.length} issues generated from your JSON feed.
        </p>
      </div>

      {newsletters.length === 0 ? (
        <p className="text-stone-600">No issues found yet. Add JSON files in data/newsletters.</p>
      ) : (
        <ul className="space-y-4">
          {newsletters.map((newsletter) => (
            <li
              key={newsletter.slug}
              className="rounded-2xl border border-stone-200 bg-white p-4 shadow-[0_12px_28px_-24px_rgba(30,41,59,0.4)] transition-shadow hover:shadow-md"
            >
              <h2 className="text-xl font-semibold leading-tight">{newsletter.title}</h2>

              <Link
                href={`/newsletter/${newsletter.slug}`}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-violet-300 bg-violet-50 px-3 py-1.5 text-sm font-medium text-violet-950 transition-colors hover:bg-violet-100"
              >
                Open issue
                <ArrowRight className="h-4 w-4" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
