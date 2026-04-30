import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { BackToTop } from "@/components/BackToTop";
import {
  IssueSections,
  type IssueSectionDefinition,
} from "@/components/IssueSections";
import { HighlightsPanel } from "@/components/NewsletterHighlight";
import { SummaryPanel } from "@/components/SummaryPanel";
import {
  formatNewsletterDate,
  getAllNewsletterSlugs,
  getNewsletterBySlug,
} from "@/lib/newsletters";

type NewsletterPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export async function generateStaticParams(): Promise<Array<{ slug: string }>> {
  const slugs = await getAllNewsletterSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: NewsletterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) {
    return {
      title: "Newsletter not found",
    };
  }

  const description = `Issue published on ${formatNewsletterDate(newsletter.date)} with ${newsletter.counts.total} curated links.`;

  return {
    title: newsletter.title,
    description,
    openGraph: {
      title: `${newsletter.title} | Monks - Transformation Tech Digest`,
      description,
    },
  };
}

export default async function NewsletterPage({
  params,
}: NewsletterPageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  const peerSections: IssueSectionDefinition[] = [
    {
      key: "useful",
      title: "Useful Links",
      description: "High-confidence links with immediate practical value for your team.",
      tone: "teal",
      defaultOpen: true,
      hideCount: true,
      links: newsletter.sections.useful,
    },
  ];

  const groupedSections: IssueSectionDefinition[] = [
    {
      key: "maybeUseful",
      title: "Maybe Useful",
      description: "Interesting signals and experiments worth a quick scan.",
      tone: "amber",
      defaultOpen: false,
      links: newsletter.sections.maybeUseful,
    },
    {
      key: "discarded",
      title: "Discarded",
      description: "Low-priority links kept for transparency.",
      tone: "rose",
      defaultOpen: false,
      links: newsletter.sections.discarded,
    },
  ];

  const allLinks = [
    ...newsletter.sections.useful,
    ...newsletter.sections.maybeUseful,
    ...newsletter.sections.discarded,
  ];
  type ResolvedHighlight = { link: typeof allLinks[number]; commentary?: string };
  const highlights: ResolvedHighlight[] = (newsletter.highlights ?? []).flatMap((h) => {
    const link = allLinks.find((l) => l.id === h.linkId);
    if (!link) return [];
    return [h.commentary ? { link, commentary: h.commentary } : { link }];
  });
  const hideLinkIds = highlights.map(({ link }) => link.id);
  const highlightsLabel = highlights.length > 1 ? "This week's picks" : "This week's pick";

  return (
    <article className="space-y-5 md:space-y-6">
      <header className="space-y-4 border-b border-stone-200 pb-5">
        <Link
          href="/archive"
          className="inline-flex items-center gap-1.5 rounded-full border border-stone-200 bg-white px-3 py-1 text-[0.78rem] font-medium text-stone-500 transition-colors hover:border-stone-300 hover:text-stone-700"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          All issues
        </Link>
        <div className="space-y-1.5">
          <p className="text-[0.78rem] text-stone-500">{formatNewsletterDate(newsletter.date)}</p>
          <h1 className="text-2xl font-bold leading-tight md:text-3xl">{newsletter.title}</h1>
        </div>
      </header>

      {newsletter.summary ? <SummaryPanel newsletterSlug={newsletter.slug} summary={newsletter.summary} /> : null}

      {highlights.length > 0 ? (
        <HighlightsPanel
          newsletterSlug={newsletter.slug}
          label={highlightsLabel}
          highlights={highlights}
        />
      ) : null}

      <IssueSections
        key={newsletter.slug}
        newsletterSlug={newsletter.slug}
        date={newsletter.date}
        sections={peerSections}
        groupedSections={groupedSections}
        hideLinkIds={hideLinkIds}
      />

      <BackToTop />
    </article>
  );
}
