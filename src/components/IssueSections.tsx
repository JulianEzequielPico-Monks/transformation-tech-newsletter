"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";

import { LinkCard } from "@/components/LinkCard";
import {
  trackGroupedToggle,
  trackNewsletterIssueView,
  trackSectionToggle,
} from "@/lib/analytics";
import {
  DEFAULT_FILTER_STATE,
  type FilterState,
  isFilterActive,
  linkMatchesFilters,
} from "@/lib/newsletter-filters";
import type { NewsletterBucket, NewsletterLink } from "@/types/newsletter";

export type IssueSectionDefinition = {
  key: NewsletterBucket;
  title: string;
  description: string;
  tone: "teal" | "amber" | "rose";
  collapsible?: boolean;
  defaultOpen?: boolean;
  hideCount?: boolean;
  links: NewsletterLink[];
};

type IssueSectionsProps = {
  newsletterSlug: string;
  date: string;
  sections: IssueSectionDefinition[];
  groupedSections?: IssueSectionDefinition[];
  groupedLabel?: string;
  groupedDescription?: string;
  hideLinkIds?: string[];
  topPickIds?: string[];
  filters?: FilterState;
};

const toneClassMap: Record<IssueSectionDefinition["tone"], string> = {
  teal: "border-stone-200 bg-white",
  amber: "border-stone-200 bg-white",
  rose: "border-stone-200 bg-white",
};

export function IssueSections({
  newsletterSlug,
  date,
  sections,
  groupedSections = [],
  groupedLabel = "Everything else we scanned",
  groupedDescription = "The rest of what came in this week. Open it if you want to dig in.",
  hideLinkIds = [],
  topPickIds = [],
  filters = DEFAULT_FILTER_STATE,
}: IssueSectionsProps) {
  const hideSet = useMemo(() => new Set(hideLinkIds), [hideLinkIds]);
  const topPickSet = useMemo(() => new Set(topPickIds), [topPickIds]);

  const visibleSections = useMemo(
    () =>
      sections.map((section) => ({
        ...section,
        links: section.links.filter((link) => !hideSet.has(link.id)),
      })),
    [sections, hideSet],
  );

  const visibleGroupedSections = useMemo(
    () =>
      groupedSections.map((section) => ({
        ...section,
        links: section.links.filter((link) => !hideSet.has(link.id)),
      })),
    [groupedSections, hideSet],
  );

  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      [...sections, ...groupedSections].map((section) => [
        section.key,
        section.defaultOpen ?? true,
      ]),
    ),
  );
  const [groupOpen, setGroupOpen] = useState(false);

  const totalLinks =
    visibleSections.reduce((sum, s) => sum + s.links.length, 0) +
    visibleGroupedSections.reduce((sum, s) => sum + s.links.length, 0);

  useEffect(() => {
    trackNewsletterIssueView({ newsletterSlug, date, totalLinks });
  }, [newsletterSlug, date, totalLinks]);

  const filtersActive = isFilterActive(filters);

  // When any filter narrows results, auto-open the grouped wrapper so matches
  // inside Maybe Useful / Discarded are immediately visible.
  const effectiveGroupOpen = filtersActive ? true : groupOpen;

  const groupedFilteredTotal = useMemo(() => {
    if (!filtersActive) {
      return visibleGroupedSections.reduce((sum, s) => sum + s.links.length, 0);
    }
    let n = 0;
    for (const section of visibleGroupedSections) {
      for (const link of section.links) {
        if (
          linkMatchesFilters(
            link,
            { bucket: section.key, topPickIds: topPickSet },
            filters,
          )
        ) {
          n++;
        }
      }
    }
    return n;
  }, [visibleGroupedSections, filters, filtersActive, topPickSet]);

  return (
    <div className="space-y-5 md:space-y-6">
      {visibleSections.map((section) => renderSection(section, { nested: false }))}

      {visibleGroupedSections.length > 0 ? (
        <section className="panel border border-stone-200 bg-stone-50/40 p-5 md:p-6">
          <button
            type="button"
            className="flex w-full items-start justify-between gap-4 text-left"
            aria-expanded={effectiveGroupOpen}
            onClick={() => {
              setGroupOpen((current) => {
                trackGroupedToggle({
                  newsletterSlug,
                  state: current ? "closed" : "open",
                });
                return !current;
              });
            }}
          >
            <div className="space-y-1">
              <h2 className="text-[1.25rem] font-semibold leading-tight text-stone-700">
                {groupedLabel}
                <span className="ml-2 text-[0.95rem] font-normal text-stone-400">
                  ({groupedFilteredTotal})
                </span>
              </h2>
              <p className="max-w-2xl text-[0.85rem] leading-6 text-stone-400">{groupedDescription}</p>
            </div>
            <span className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600">
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-300 ${effectiveGroupOpen ? "rotate-180" : "rotate-0"}`}
              />
            </span>
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${effectiveGroupOpen ? "mt-5 grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
          >
            <div className="overflow-hidden">
              <div className="space-y-5">
                {visibleGroupedSections.map((section) => renderSection(section, { nested: true }))}
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );

  function renderSection(
    section: IssueSectionDefinition,
    options: { nested: boolean },
  ) {
    const filteredLinks = filtersActive
      ? section.links.filter((link) =>
          linkMatchesFilters(
            link,
            { bucket: section.key, topPickIds: topPickSet },
            filters,
          ),
        )
      : section.links;

    const content =
      section.links.length === 0 ? (
        <p className="text-stone-500">No links in this section for this issue.</p>
      ) : filteredLinks.length === 0 ? (
        <p className="text-stone-500">No links in this section match the active filters.</p>
      ) : (
        <ul className="space-y-4">
          {filteredLinks.map((item) => (
            <LinkCard
              key={item.id}
              newsletterSlug={newsletterSlug}
              section={section.key}
              link={item}
              activeSection={filtersActive ? filters.section : undefined}
              activeTagCount={filtersActive ? filters.tags.length : undefined}
              activeSourceCount={filtersActive ? filters.sources.length : undefined}
            />
          ))}
        </ul>
      );

    const isOpen = openSections[section.key] ?? true;
    const padding = options.nested ? "p-4 md:p-5" : "p-5 md:p-6";

    return (
      <section
        key={section.key}
        className={`panel border ${padding} ${toneClassMap[section.tone]}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-baseline gap-2 text-[1.25rem] font-semibold leading-tight">
              {section.title}
              {section.hideCount ? null : (
                <span className="text-[0.95rem] font-normal text-stone-400">({filteredLinks.length})</span>
              )}
            </h2>
            <p className="max-w-2xl text-[0.85rem] leading-6 text-stone-400">{section.description}</p>
          </div>

          <button
            type="button"
            className="mt-1 inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-stone-300 bg-white text-stone-600 transition-colors hover:bg-stone-100"
            aria-label={isOpen ? `Collapse ${section.title}` : `Expand ${section.title}`}
            onClick={() => {
              setOpenSections((current) => ({
                ...current,
                [section.key]: !isOpen,
              }));
              trackSectionToggle({ newsletterSlug, section: section.key, state: isOpen ? "closed" : "open" });
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
          <div className="overflow-hidden">{content}</div>
        </div>
      </section>
    );
  }
}
