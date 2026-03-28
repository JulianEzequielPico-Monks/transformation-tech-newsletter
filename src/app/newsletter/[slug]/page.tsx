import type { Metadata } from "next";
import { notFound } from "next/navigation";

import {
  IssueSections,
  type IssueSectionDefinition,
} from "@/components/IssueSections";
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

  return {
    title: `${newsletter.title} | Newsletter`,
    description: `Issue published on ${formatNewsletterDate(newsletter.date)} with ${newsletter.counts.total} curated links.`,
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

  const sections: IssueSectionDefinition[] = [
    {
      key: "useful",
      title: "Useful Links",
      description: "High-confidence links with immediate practical value for your team.",
      tone: "teal",
      defaultOpen: false,
      links: newsletter.sections.useful,
    },
    {
      key: "maybeUseful",
      title: "Maybe Useful Links",
      description: "Interesting signals and experiments that are worth a quick scan.",
      tone: "amber",
      defaultOpen: false,
      links: newsletter.sections.maybeUseful,
    },
    {
      key: "discarded",
      title: "Discarded Links",
      description: "Low-priority links kept for transparency and future traceability.",
      tone: "rose",
      defaultOpen: false,
      links: newsletter.sections.discarded,
    },
  ];

  return (
    <article className="space-y-5 md:space-y-6">
      <header className="panel space-y-2 border border-violet-200 bg-gradient-to-r from-white via-violet-50/50 to-amber-50/40 p-5 md:p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-500">
          {formatNewsletterDate(newsletter.date)}
        </p>
        <h1 className="text-3xl font-bold leading-tight md:text-5xl">{newsletter.title}</h1>
      </header>

      <IssueSections key={newsletter.slug} newsletterSlug={newsletter.slug} date={newsletter.date} sections={sections} />
    </article>
  );
}
