"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BrainCircuit,
  ChevronDown,
  Lightbulb,
  Monitor,
  Server,
  Shield,
  Smartphone,
  Sparkles,
  Tag,
  TestTube,
  Workflow,
  Wrench,
  type LucideIcon,
} from "lucide-react";

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

import { LinkCard } from "@/components/LinkCard";
import { trackNewsletterIssueView, trackTagFilter, trackTagModeChange, trackSectionToggle } from "@/lib/analytics";
import type { NewsletterBucket, NewsletterLink } from "@/types/newsletter";

export type IssueSectionDefinition = {
  key: NewsletterBucket;
  title: string;
  description: string;
  tone: "teal" | "amber" | "rose";
  collapsible?: boolean;
  defaultOpen?: boolean;
  links: NewsletterLink[];
};

type IssueSectionsProps = {
  newsletterSlug: string;
  date: string;
  sections: IssueSectionDefinition[];
};

const toneClassMap: Record<IssueSectionDefinition["tone"], string> = {
  teal: "border-violet-200 bg-gradient-to-b from-white to-violet-50/50",
  amber: "border-amber-200 bg-gradient-to-b from-white to-amber-50/50",
  rose: "border-pink-200 bg-gradient-to-b from-white to-pink-50/50",
};

function normalizeTag(tag: string): string {
  return tag.trim().toLowerCase();
}

export function IssueSections({ newsletterSlug, date, sections }: IssueSectionsProps) {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [tagMode, setTagMode] = useState<"or" | "and">("or");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(sections.map((section) => [section.key, section.defaultOpen ?? true])),
  );

  const totalLinks = sections.reduce((sum, s) => sum + s.links.length, 0);

  useEffect(() => {
    trackNewsletterIssueView({ newsletterSlug, date, totalLinks });
  }, [newsletterSlug, date, totalLinks]);

  const allTags = useMemo(() => {
    const uniqueTags = new Map<string, string>();

    sections.forEach((section) => {
      section.links.forEach((link) => {
        link.tags.forEach((rawTag) => {
          const label = rawTag.trim();
          const key = normalizeTag(rawTag);

          if (!key || !label) {
            return;
          }

          if (!uniqueTags.has(key)) {
            uniqueTags.set(key, label);
          }
        });
      });
    });

    return Array.from(uniqueTags.entries())
      .map(([key, label]) => ({ key, label }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [sections]);

  function toggleTag(tagKey: string) {
    setSelectedTags((current) => {
      const isActive = current.includes(tagKey);
      trackTagFilter({ newsletterSlug, tag: tagKey, action: isActive ? "deselect" : "select" });
      return isActive ? current.filter((item) => item !== tagKey) : [...current, tagKey];
    });
  }

  return (
    <div className="space-y-5 md:space-y-6">
      {allTags.length > 0 ? (
        <section className="panel border border-stone-200 p-4 md:p-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-1.5 text-[0.65rem] font-medium uppercase tracking-[0.14em] text-stone-400">
                <Tag className="h-3 w-3" />
                Filter by tag
              </span>
              <div className="flex items-center gap-3">
                {selectedTags.length >= 2 ? (
                  <div className="inline-flex items-center rounded-full border border-stone-200 bg-stone-100 p-0.5">
                    <button
                      type="button"
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide transition-colors ${tagMode === "or" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                      onClick={() => { setTagMode("or"); trackTagModeChange({ newsletterSlug, mode: "or" }); }}
                    >
                      Match any
                    </button>
                    <button
                      type="button"
                      className={`rounded-full px-2.5 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide transition-colors ${tagMode === "and" ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
                      onClick={() => { setTagMode("and"); trackTagModeChange({ newsletterSlug, mode: "and" }); }}
                    >
                      Match all
                    </button>
                  </div>
                ) : null}
                {selectedTags.length > 0 ? (
                  <button
                    type="button"
                    className="text-[0.72rem] font-medium text-violet-600 transition-colors hover:text-violet-800"
                    onClick={() => { trackTagFilter({ newsletterSlug, tag: "", action: "clear" }); setSelectedTags([]); }}
                  >
                    Clear ({selectedTags.length})
                  </button>
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                className={`rounded-full border px-3 py-[0.3rem] text-[0.7rem] font-semibold uppercase leading-none tracking-wide transition-colors ${
                  selectedTags.length === 0
                    ? "border-violet-300 bg-violet-100 text-violet-950"
                    : "border-stone-300 bg-white text-stone-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900"
                }`}
                onClick={() => { trackTagFilter({ newsletterSlug, tag: "", action: "clear" }); setSelectedTags([]); }}
              >
                All
              </button>

              {allTags.map((tag) => {
                const active = selectedTags.includes(tag.key);
                const Icon = TAG_ICONS[tag.key];

                return (
                  <button
                    key={tag.key}
                    type="button"
                    className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-[0.3rem] text-[0.7rem] font-semibold uppercase leading-none tracking-wide transition-colors ${
                      active
                        ? "border-violet-300 bg-violet-100 text-violet-950"
                        : "border-stone-300 bg-white text-stone-500 hover:border-violet-200 hover:bg-violet-50 hover:text-violet-900"
                    }`}
                    onClick={() => toggleTag(tag.key)}
                  >
                    {Icon ? <Icon className="h-3 w-3 shrink-0" /> : null}
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      ) : null}

      {sections.map((section) => {
        const filteredLinks = selectedTags.length > 0
          ? section.links.filter((link) => {
              const linkTagKeys = link.tags.map(normalizeTag).filter((tag) => tag.length > 0);
              return tagMode === "and"
                ? selectedTags.every((tag) => linkTagKeys.includes(tag))
                : selectedTags.some((tag) => linkTagKeys.includes(tag));
            })
          : section.links;

        const content =
          section.links.length === 0 ? (
            <p className="text-stone-500">No links in this section for this issue.</p>
          ) : filteredLinks.length === 0 ? (
            <p className="text-stone-500">No links in this section match the selected tags.</p>
          ) : (
            <ul className="space-y-4">
              {filteredLinks.map((item) => (
                <LinkCard
                  key={item.id}
                  newsletterSlug={newsletterSlug}
                  section={section.key}
                  link={item}
                />
              ))}
            </ul>
          );

        const isOpen = openSections[section.key] ?? true;

        return (
          <section
            key={section.key}
            className={`panel border p-5 md:p-6 ${toneClassMap[section.tone]}`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <h2 className="flex items-baseline gap-2 text-[1.7rem] font-bold leading-tight">
                  {section.title}
                  <span className="text-[1rem] font-normal text-stone-400">({filteredLinks.length})</span>
                </h2>
                <p className="max-w-2xl text-[0.88rem] leading-6 text-stone-400">{section.description}</p>
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
      })}
    </div>
  );
}