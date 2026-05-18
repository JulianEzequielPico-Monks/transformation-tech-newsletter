import { ArrowRight } from "lucide-react";
import { ArchiveAllIssues } from "@/components/ArchiveAllIssues";
import {
  PageViewTracker,
  TrackedLatestIssueLink,
} from "@/components/PageViewTracker";
import { formatNewsletterDate, getAllNewsletters } from "@/lib/newsletters";

export const dynamic = "force-static";

export const metadata = {
  title: "Newsletter Archive",
  description: "Browse all issues of the Monks Transformation Tech Digest — a weekly curation of useful technology and transformation links.",
  openGraph: {
    title: "Newsletter Archive | Monks - Transformation Tech Digest",
    description: "Browse all issues of the Monks Transformation Tech Digest — a weekly curation of useful technology and transformation links.",
  },
};

export default async function ArchivePage() {
  const newsletters = await getAllNewsletters();
  const latest = newsletters[0] ?? null;

  return (
    <div className="space-y-5 md:space-y-6">
      <PageViewTracker page="archive" />
      {latest ? (
        <section className="panel space-y-4 border border-violet-200 bg-gradient-to-r from-white via-violet-50/50 to-amber-50/40 p-5 md:p-7">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">Latest issue</p>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-stone-400">
              {formatNewsletterDate(latest.date)}
            </p>
          </div>
          <h1 className="text-3xl font-bold leading-tight md:text-5xl">{latest.title}</h1>
          <div className="flex items-center gap-3">
            <TrackedLatestIssueLink
              newsletterSlug={latest.slug}
              href={`/newsletter/${latest.slug}`}
              className="inline-flex items-center gap-2 rounded-full bg-violet-700 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-violet-800"
            >
              Read issue
              <ArrowRight className="h-4 w-4" />
            </TrackedLatestIssueLink>
            <span className="text-sm text-stone-400">
              {latest.counts.total} links curated
            </span>
            {latest.emailsProcessed > 0 && (
              <span className="text-sm text-stone-400">
                · {latest.emailsProcessed} emails processed
              </span>
            )}
          </div>
        </section>
      ) : null}

      <ArchiveAllIssues
        newsletters={newsletters.map((n) => ({
          slug: n.slug,
          title: n.title,
          formattedDate: formatNewsletterDate(n.date),
          total: n.counts.total,
          emailsProcessed: n.emailsProcessed,
        }))}
        total={newsletters.length}
      />
    </div>
  );
}
