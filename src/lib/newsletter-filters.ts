import type { NewsletterBucket, NewsletterLink } from "@/types/newsletter";

export type SectionFilter = "all" | "topPicks" | "useful" | "maybeUseful";

export type FilterState = {
  section: SectionFilter;
  tags: string[];
  tagMode: "or" | "and";
  sources: string[];
};

export const DEFAULT_FILTER_STATE: FilterState = {
  section: "all",
  tags: [],
  tagMode: "or",
  sources: [],
};

export function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export type LinkFilterContext = {
  bucket: NewsletterBucket;
  topPickIds: ReadonlySet<string>;
};

export function linkMatchesFilters(
  link: NewsletterLink,
  context: LinkFilterContext,
  filters: FilterState,
): boolean {
  // Section: single-select, implicit AND vs other categories.
  if (filters.section !== "all") {
    if (filters.section === "topPicks") {
      if (!context.topPickIds.has(link.id)) return false;
    } else if (filters.section !== context.bucket) {
      return false;
    }
  }

  // Tags: multi-select with internal AND/OR.
  if (filters.tags.length > 0) {
    const linkTagKeys = link.tags
      .map(normalizeTag)
      .filter((tag) => tag.length > 0);
    const matches =
      filters.tagMode === "and"
        ? filters.tags.every((tag) => linkTagKeys.includes(tag))
        : filters.tags.some((tag) => linkTagKeys.includes(tag));
    if (!matches) return false;
  }

  // Sources: multi-select, OR-only (each link has exactly one source).
  if (filters.sources.length > 0) {
    if (!link.source || !filters.sources.includes(link.source)) return false;
  }

  return true;
}

export function isFilterActive(filters: FilterState): boolean {
  return (
    filters.section !== "all" ||
    filters.tags.length > 0 ||
    filters.sources.length > 0
  );
}
