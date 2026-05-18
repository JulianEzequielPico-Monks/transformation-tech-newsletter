"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  Filter,
  Lightbulb,
  Monitor,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Star,
  Tag,
  TestTube,
  Workflow,
  Wrench,
  X,
  type LucideIcon,
} from "lucide-react";

import {
  trackFilterClear,
  trackSectionFilter,
  trackSourceFilter,
  trackTagFilter,
  trackTagModeChange,
} from "@/lib/analytics";
import {
  type FilterState,
  type LinkFilterContext,
  type SectionFilter,
  isFilterActive,
  linkMatchesFilters,
  normalizeTag,
} from "@/lib/newsletter-filters";
import type { NewsletterLink } from "@/types/newsletter";

const TAG_ICONS: Record<string, LucideIcon> = {
  frontend: Monitor,
  backend: Server,
  mobile: Smartphone,
  automation: Workflow,
  qa: TestTube,
  tooling: Wrench,
  ai: BrainCircuit,
  thinking: Lightbulb,
  "general concepts": BookOpen,
  security: Shield,
  mindblown: Sparkles,
};

type IndexedLink = {
  link: NewsletterLink;
  context: LinkFilterContext;
};

type FilterPanelProps = {
  newsletterSlug: string;
  filters: FilterState;
  onFiltersChange: (next: FilterState) => void;
  indexedLinks: IndexedLink[];
  sectionCounts: Record<SectionFilter, number>;
  availableTags: { key: string; label: string }[];
  availableSources: string[];
};

const SECTION_OPTIONS: { value: SectionFilter; label: string; Icon?: LucideIcon }[] = [
  { value: "all", label: "All links" },
  { value: "topPicks", label: "Top Picks", Icon: Star },
  { value: "useful", label: "Useful Links" },
  { value: "maybeUseful", label: "Maybe Useful" },
];

export function FilterPanel(props: FilterPanelProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [drawerOpen]);

  const activeCount =
    (props.filters.section !== "all" ? 1 : 0) +
    props.filters.tags.length +
    props.filters.sources.length;

  return (
    <>
      {/* Mobile trigger */}
      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex w-full items-center justify-between gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-[0.85rem] font-medium text-stone-700 shadow-sm transition-colors hover:border-stone-300"
          onClick={() => setDrawerOpen(true)}
        >
          <span className="inline-flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filters
          </span>
          {activeCount > 0 ? (
            <span className="rounded-full bg-violet-100 px-2 py-0.5 text-[0.7rem] font-semibold text-violet-700">
              {activeCount}
            </span>
          ) : null}
        </button>
      </div>

      {/* Desktop sticky sidebar */}
      <aside className="hidden lg:block">
        <ScrollFadeContainer>
          <FilterPanelBody {...props} />
        </ScrollFadeContainer>
      </aside>

      {/* Mobile drawer */}
      {drawerOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            aria-label="Close filters"
            className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-[#f5f3ef] shadow-xl">
            <div className="flex items-center justify-between border-b border-stone-200 px-4 py-3">
              <span className="inline-flex items-center gap-2 text-[0.85rem] font-semibold text-stone-700">
                <Filter className="h-4 w-4" />
                Filters
              </span>
              <button
                type="button"
                aria-label="Close filters"
                className="rounded-full p-1 text-stone-500 transition-colors hover:bg-stone-200/60 hover:text-stone-700"
                onClick={() => setDrawerOpen(false)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <FilterPanelBody {...props} />
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function FilterPanelBody({
  newsletterSlug,
  filters,
  onFiltersChange,
  indexedLinks,
  sectionCounts,
  availableTags,
  availableSources,
}: FilterPanelProps) {
  const active = isFilterActive(filters);

  // Counts that respect the *other* active filters, so the user sees how many
  // results each chip would narrow to.
  const tagCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const tag of availableTags) {
      let n = 0;
      const probe: FilterState = {
        ...filters,
        tags: [tag.key],
        tagMode: "or",
      };
      for (const { link, context } of indexedLinks) {
        if (linkMatchesFilters(link, context, probe)) n++;
      }
      counts.set(tag.key, n);
    }
    return counts;
  }, [availableTags, indexedLinks, filters]);

  const sourceCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const source of availableSources) {
      let n = 0;
      const probe: FilterState = { ...filters, sources: [source] };
      for (const { link, context } of indexedLinks) {
        if (linkMatchesFilters(link, context, probe)) n++;
      }
      counts.set(source, n);
    }
    return counts;
  }, [availableSources, indexedLinks, filters]);

  function selectSection(next: SectionFilter) {
    if (next === filters.section) return;
    trackSectionFilter({ newsletterSlug, section: next });
    onFiltersChange({ ...filters, section: next });
  }

  function toggleTag(key: string) {
    const isActive = filters.tags.includes(key);
    trackTagFilter({
      newsletterSlug,
      tag: key,
      action: isActive ? "deselect" : "select",
    });
    onFiltersChange({
      ...filters,
      tags: isActive
        ? filters.tags.filter((t) => t !== key)
        : [...filters.tags, key],
    });
  }

  function setTagMode(mode: "or" | "and") {
    if (mode === filters.tagMode) return;
    trackTagModeChange({ newsletterSlug, mode });
    onFiltersChange({ ...filters, tagMode: mode });
  }

  function toggleSource(source: string) {
    const isActive = filters.sources.includes(source);
    trackSourceFilter({
      newsletterSlug,
      source,
      action: isActive ? "deselect" : "select",
    });
    onFiltersChange({
      ...filters,
      sources: isActive
        ? filters.sources.filter((s) => s !== source)
        : [...filters.sources, source],
    });
  }

  function clearAll() {
    trackFilterClear({ newsletterSlug });
    onFiltersChange({
      section: "all",
      tags: [],
      tagMode: "or",
      sources: [],
    });
  }

  return (
    <div className="space-y-5 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="inline-flex items-center gap-1.5 text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-stone-500">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </span>
        {active ? (
          <button
            type="button"
            className="text-[0.72rem] font-medium text-violet-600 transition-colors hover:text-violet-800"
            onClick={clearAll}
          >
            Clear all
          </button>
        ) : null}
      </div>

      <FilterGroup title="Section">
        <ul className="space-y-1">
          {SECTION_OPTIONS.map(({ value, label, Icon }) => {
            const isActive = filters.section === value;
            const count = sectionCounts[value];
            const disabled = value !== "all" && count === 0;
            return (
              <li key={value}>
                <button
                  type="button"
                  disabled={disabled}
                  className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[0.82rem] transition-colors ${
                    isActive
                      ? "border-violet-300 bg-violet-100 text-violet-950"
                      : disabled
                      ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-300"
                      : "border-stone-200 bg-white text-stone-700 hover:border-violet-200 hover:bg-violet-50"
                  }`}
                  onClick={() => selectSection(value)}
                >
                  <span className="inline-flex items-center gap-2">
                    {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
                    {label}
                  </span>
                  <span
                    className={`text-[0.7rem] font-medium ${
                      isActive ? "text-violet-700" : "text-stone-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </FilterGroup>

      {availableTags.length > 0 ? (
        <FilterGroup
          title="Tags"
          headerRight={
            filters.tags.length >= 2 ? (
              <ModeToggle mode={filters.tagMode} onChange={setTagMode} />
            ) : null
          }
        >
          <ul className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const isActive = filters.tags.includes(tag.key);
              const count = tagCounts.get(tag.key) ?? 0;
              const Icon = TAG_ICONS[tag.key];
              return (
                <li key={tag.key}>
                  <button
                    type="button"
                    disabled={!isActive && count === 0}
                    className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide transition-colors ${
                      isActive
                        ? "border-violet-300 bg-violet-100 text-violet-950"
                        : count === 0
                        ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-300"
                        : "border-stone-300 bg-white text-stone-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900"
                    }`}
                    onClick={() => toggleTag(tag.key)}
                  >
                    {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
                    {tag.label}
                    <span
                      className={`text-[0.6rem] font-medium normal-case tracking-normal ${
                        isActive ? "text-violet-700" : "text-stone-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      ) : null}

      {availableSources.length > 0 ? (
        <FilterGroup title="Sources">
          <ul className="space-y-1">
            {availableSources.map((source) => {
              const isActive = filters.sources.includes(source);
              const count = sourceCounts.get(source) ?? 0;
              const disabled = !isActive && count === 0;
              return (
                <li key={source}>
                  <button
                    type="button"
                    disabled={disabled}
                    className={`flex w-full items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-[0.78rem] transition-colors ${
                      isActive
                        ? "border-violet-300 bg-violet-100 text-violet-950"
                        : disabled
                        ? "cursor-not-allowed border-stone-200 bg-stone-50 text-stone-300"
                        : "border-stone-200 bg-white text-stone-700 hover:border-violet-200 hover:bg-violet-50"
                    }`}
                    onClick={() => toggleSource(source)}
                  >
                    <span className="line-clamp-2 break-words">{source}</span>
                    <span
                      className={`shrink-0 text-[0.7rem] font-medium ${
                        isActive ? "text-violet-700" : "text-stone-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </FilterGroup>
      ) : null}
    </div>
  );
}

function FilterGroup({
  title,
  headerRight,
  children,
}: {
  title: string;
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-semibold uppercase tracking-[0.14em] text-stone-400">
          <Tag className="h-3 w-3" />
          {title}
        </span>
        {headerRight}
      </div>
      {children}
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "or" | "and";
  onChange: (mode: "or" | "and") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5">
      <button
        type="button"
        className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition-colors ${
          mode === "or"
            ? "bg-white text-stone-800 shadow-sm"
            : "text-stone-400 hover:text-stone-600"
        }`}
        onClick={() => onChange("or")}
      >
        Any
      </button>
      <button
        type="button"
        className={`rounded-full px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wide transition-colors ${
          mode === "and"
            ? "bg-white text-stone-800 shadow-sm"
            : "text-stone-400 hover:text-stone-600"
        }`}
        onClick={() => onChange("and")}
      >
        All
      </button>
    </div>
  );
}

function ScrollFadeContainer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [fadeTop, setFadeTop] = useState(false);
  const [fadeBottom, setFadeBottom] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    function update() {
      if (!el) return;
      const overflows = el.scrollHeight > el.clientHeight + 1;
      setFadeTop(overflows && el.scrollTop > 1);
      setFadeBottom(
        overflows && el.scrollTop + el.clientHeight < el.scrollHeight - 1,
      );
    }

    update();
    el.addEventListener("scroll", update, { passive: true });
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      ro.disconnect();
    };
  }, []);

  const fadeStart = fadeTop ? "transparent 0" : "#000 0";
  const fadeTopStop = fadeTop ? "#000 1.25rem" : "#000 0";
  const fadeBottomStop = fadeBottom
    ? "#000 calc(100% - 1.25rem)"
    : "#000 100%";
  const fadeEnd = fadeBottom ? "transparent 100%" : "#000 100%";
  const mask = `linear-gradient(to bottom, ${fadeStart}, ${fadeTopStop}, ${fadeBottomStop}, ${fadeEnd})`;

  return (
    <div
      ref={ref}
      className="sticky top-[5.5rem] -mx-2 max-h-[calc(100vh-6.5rem)] overflow-y-auto overscroll-contain px-2 py-2"
      style={{ maskImage: mask, WebkitMaskImage: mask }}
    >
      {children}
    </div>
  );
}

export { normalizeTag };
