"use client";

import { useMemo, useState } from "react";

import { FilterPanel } from "@/components/FilterPanel";
import {
  IssueSections,
  type IssueSectionDefinition,
} from "@/components/IssueSections";
import {
  DEFAULT_FILTER_STATE,
  type FilterState,
  type LinkFilterContext,
  type SectionFilter,
  linkMatchesFilters,
  normalizeTag,
} from "@/lib/newsletter-filters";

type NewsletterFilterableContentProps = {
  newsletterSlug: string;
  date: string;
  sections: IssueSectionDefinition[];
  groupedSections: IssueSectionDefinition[];
  hideLinkIds: string[];
  topPickIds: string[];
};

export function NewsletterFilterableContent({
  newsletterSlug,
  date,
  sections,
  groupedSections,
  hideLinkIds,
  topPickIds,
}: NewsletterFilterableContentProps) {
  const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTER_STATE);

  const hideSet = useMemo(() => new Set(hideLinkIds), [hideLinkIds]);
  const topPickSet = useMemo(() => new Set(topPickIds), [topPickIds]);

  // Flat index of links + context used to compute live chip counts.
  const indexedLinks = useMemo(() => {
    const flat: { link: typeof sections[number]["links"][number]; context: LinkFilterContext }[] = [];
    for (const section of sections) {
      for (const link of section.links) {
        if (hideSet.has(link.id)) continue;
        flat.push({ link, context: { bucket: section.key, topPickIds: topPickSet } });
      }
    }
    for (const section of groupedSections) {
      for (const link of section.links) {
        if (hideSet.has(link.id)) continue;
        flat.push({ link, context: { bucket: section.key, topPickIds: topPickSet } });
      }
    }
    return flat;
  }, [sections, groupedSections, hideSet, topPickSet]);

  const sectionCounts = useMemo<Record<SectionFilter, number>>(() => {
    const counts: Record<SectionFilter, number> = {
      all: 0,
      topPicks: 0,
      useful: 0,
      maybeUseful: 0,
    };
    const probeBase: FilterState = { ...filters, section: "all" };
    for (const { link, context } of indexedLinks) {
      // Count against all OTHER filters held constant.
      if (!linkMatchesFilters(link, context, probeBase)) continue;
      counts.all++;
      if (context.bucket === "useful") counts.useful++;
      if (context.bucket === "maybeUseful") counts.maybeUseful++;
      if (topPickSet.has(link.id)) counts.topPicks++;
    }
    return counts;
  }, [indexedLinks, filters, topPickSet]);

  const availableTags = useMemo(() => {
    const map = new Map<string, string>();
    for (const { link } of indexedLinks) {
      for (const raw of link.tags) {
        const label = raw.trim();
        const key = normalizeTag(raw);
        if (!key || !label) continue;
        if (!map.has(key)) map.set(key, label);
      }
    }
    return Array.from(map.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [indexedLinks]);

  const availableSources = useMemo(() => {
    const set = new Set<string>();
    for (const { link } of indexedLinks) {
      if (link.source) set.add(link.source);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [indexedLinks]);

  return (
    <div className="grid gap-5 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-8">
      <FilterPanel
        newsletterSlug={newsletterSlug}
        filters={filters}
        onFiltersChange={setFilters}
        indexedLinks={indexedLinks}
        sectionCounts={sectionCounts}
        availableTags={availableTags}
        availableSources={availableSources}
      />
      <div className="min-w-0">
        <IssueSections
          newsletterSlug={newsletterSlug}
          date={date}
          sections={sections}
          groupedSections={groupedSections}
          hideLinkIds={filters.section === "topPicks" ? [] : hideLinkIds}
          topPickIds={topPickIds}
          filters={filters}
        />
      </div>
    </div>
  );
}
