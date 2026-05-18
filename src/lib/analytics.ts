"use client";

import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";
import type { NewsletterBucket } from "@/types/newsletter";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

export const ANALYTICS_EVENTS = {
  ISSUE_VIEW: "newsletter_issue_view",
  LINK_CLICK: "newsletter_link_click",
  LINK_FEEDBACK: "newsletter_link_feedback",
  TAG_FILTER: "newsletter_tag_filter",
  TAG_MODE_CHANGE: "newsletter_tag_mode_change",
  SECTION_TOGGLE: "newsletter_section_toggle",
  GROUPED_TOGGLE: "newsletter_grouped_toggle",
  FILTER_DRAWER_TOGGLE: "newsletter_filter_drawer_toggle",
  FILTER_EMPTY_RESULTS: "newsletter_filter_empty_results",
  PAGE_VIEW: "newsletter_page_view",
  BACK_TO_TOP: "newsletter_back_to_top",
  HISTORY_MENU_TOGGLE: "newsletter_history_menu_toggle",
  HISTORY_MENU_NAV: "newsletter_history_menu_nav",
  ARCHIVE_ALL_TOGGLE: "newsletter_archive_all_toggle",
  ARCHIVE_ISSUE_CLICK: "newsletter_archive_issue_click",
  HIGHLIGHTS_PANEL_TOGGLE: "newsletter_highlights_panel_toggle",
  SOURCE_LINK_CLICK: "newsletter_source_link_click",
  NAV_LINK_CLICK: "newsletter_nav_link_click",
  SUMMARY_TOGGLE: "newsletter_summary_toggle",
  SUMMARY_LINK_CLICK: "newsletter_summary_link_click",
  HIGHLIGHT_CLICK: "newsletter_highlight_click",
  SECTION_FILTER: "newsletter_section_filter",
  SOURCE_FILTER: "newsletter_source_filter",
  FILTER_CLEAR: "newsletter_filter_clear",
} as const;

export const SECTION_NAMES: Record<NewsletterBucket, string> = {
  useful: "useful",
  maybeUseful: "maybe_useful",
  discarded: "discarded",
};

export const FEEDBACK_VOTES = {
  UP: "up",
  DOWN: "down",
} as const;

export const TAG_ACTIONS = {
  SELECT: "select",
  DESELECT: "deselect",
  CLEAR: "clear",
} as const;

export const TAG_MODES = {
  OR: "or",
  AND: "and",
} as const;

export const SECTION_TOGGLE_STATES = {
  OPEN: "open",
  CLOSED: "closed",
} as const;

// ---------------------------------------------------------------------------
// Internal helper
// ---------------------------------------------------------------------------

async function trackEvent(eventName: string, params: Record<string, string | number>): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

// ---------------------------------------------------------------------------
// Tracking functions
// ---------------------------------------------------------------------------

export function trackNewsletterIssueView(args: {
  newsletterSlug: string;
  date: string;
  totalLinks: number;
}): void {
  void trackEvent(ANALYTICS_EVENTS.ISSUE_VIEW, {
    newsletter_slug: args.newsletterSlug,
    date: args.date,
    total_links: args.totalLinks,
  });
}

export function trackNewsletterLinkClick(args: {
  newsletterSlug: string;
  section: NewsletterBucket;
  linkId: string;
  title: string;
  url: string;
  activeSection?: string;
  activeTagCount?: number;
  activeSourceCount?: number;
}): void {
  const params: Record<string, string | number> = {
    newsletter_slug: args.newsletterSlug,
    section: SECTION_NAMES[args.section],
    link_id: args.linkId,
    link_title: args.title,
    link_url: args.url,
  };
  if (args.activeSection !== undefined) params.active_section = args.activeSection;
  if (args.activeTagCount !== undefined) params.active_tag_count = args.activeTagCount;
  if (args.activeSourceCount !== undefined) params.active_source_count = args.activeSourceCount;
  void trackEvent(ANALYTICS_EVENTS.LINK_CLICK, params);
}

export function trackNewsletterFeedback(args: {
  newsletterSlug: string;
  section: NewsletterBucket;
  linkId: string;
  vote: "up" | "down";
}): void {
  void trackEvent(ANALYTICS_EVENTS.LINK_FEEDBACK, {
    newsletter_slug: args.newsletterSlug,
    section: SECTION_NAMES[args.section],
    link_id: args.linkId,
    vote: args.vote,
  });
}

export function trackTagFilter(args: {
  newsletterSlug: string;
  tag: string;
  action: "select" | "deselect" | "clear";
}): void {
  void trackEvent(ANALYTICS_EVENTS.TAG_FILTER, {
    newsletter_slug: args.newsletterSlug,
    tag: args.tag,
    action: args.action,
  });
}

export function trackTagModeChange(args: {
  newsletterSlug: string;
  mode: "or" | "and";
}): void {
  void trackEvent(ANALYTICS_EVENTS.TAG_MODE_CHANGE, {
    newsletter_slug: args.newsletterSlug,
    mode: args.mode,
  });
}

export function trackSectionToggle(args: {
  newsletterSlug: string;
  section: NewsletterBucket;
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.SECTION_TOGGLE, {
    newsletter_slug: args.newsletterSlug,
    section: SECTION_NAMES[args.section],
    state: args.state,
  });
}

export function trackGroupedToggle(args: {
  newsletterSlug: string;
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.GROUPED_TOGGLE, {
    newsletter_slug: args.newsletterSlug,
    state: args.state,
  });
}

export function trackFilterDrawerToggle(args: {
  newsletterSlug: string;
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.FILTER_DRAWER_TOGGLE, {
    newsletter_slug: args.newsletterSlug,
    state: args.state,
  });
}

export function trackFilterEmptyResults(args: {
  newsletterSlug: string;
  section: string;
  tagCount: number;
  sourceCount: number;
}): void {
  void trackEvent(ANALYTICS_EVENTS.FILTER_EMPTY_RESULTS, {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
    tag_count: args.tagCount,
    source_count: args.sourceCount,
  });
}

export function trackSourceLinkClick(args: {
  sourceName: string;
  sourceUrl: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.SOURCE_LINK_CLICK, {
    source_name: args.sourceName,
    source_url: args.sourceUrl,
  });
}

export function trackNavLinkClick(args: {
  label: string;
  destination: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.NAV_LINK_CLICK, {
    label: args.label,
    destination: args.destination,
  });
}

export function trackSummaryToggle(args: {
  newsletterSlug: string;
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.SUMMARY_TOGGLE, {
    newsletter_slug: args.newsletterSlug,
    state: args.state,
  });
}

export function trackSummaryLinkClick(args: {
  newsletterSlug: string;
  linkUrl: string;
  linkText: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.SUMMARY_LINK_CLICK, {
    newsletter_slug: args.newsletterSlug,
    link_url: args.linkUrl,
    link_text: args.linkText,
  });
}

export function trackHighlightClick(args: {
  newsletterSlug: string;
  linkId: string;
  url: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.HIGHLIGHT_CLICK, {
    newsletter_slug: args.newsletterSlug,
    link_id: args.linkId,
    link_url: args.url,
  });
}

export function trackSectionFilter(args: {
  newsletterSlug: string;
  section: "all" | "topPicks" | "useful" | "maybeUseful";
}): void {
  void trackEvent(ANALYTICS_EVENTS.SECTION_FILTER, {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
  });
}

export function trackSourceFilter(args: {
  newsletterSlug: string;
  source: string;
  action: "select" | "deselect" | "clear";
}): void {
  void trackEvent(ANALYTICS_EVENTS.SOURCE_FILTER, {
    newsletter_slug: args.newsletterSlug,
    source: args.source,
    action: args.action,
  });
}

export function trackFilterClear(args: {
  newsletterSlug: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.FILTER_CLEAR, {
    newsletter_slug: args.newsletterSlug,
  });
}

export function trackPageView(args: { page: string }): void {
  void trackEvent(ANALYTICS_EVENTS.PAGE_VIEW, { page: args.page });
}

export function trackBackToTop(args: { page: string }): void {
  void trackEvent(ANALYTICS_EVENTS.BACK_TO_TOP, { page: args.page });
}

export function trackHistoryMenuToggle(args: {
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.HISTORY_MENU_TOGGLE, { state: args.state });
}

export function trackHistoryMenuNav(args: {
  destination: string;
  label: string;
}): void {
  void trackEvent(ANALYTICS_EVENTS.HISTORY_MENU_NAV, {
    destination: args.destination,
    label: args.label,
  });
}

export function trackArchiveAllToggle(args: {
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.ARCHIVE_ALL_TOGGLE, { state: args.state });
}

export function trackArchiveIssueClick(args: {
  newsletterSlug: string;
  position: number;
}): void {
  void trackEvent(ANALYTICS_EVENTS.ARCHIVE_ISSUE_CLICK, {
    newsletter_slug: args.newsletterSlug,
    position: args.position,
  });
}

export function trackHighlightsPanelToggle(args: {
  newsletterSlug: string;
  state: "open" | "closed";
}): void {
  void trackEvent(ANALYTICS_EVENTS.HIGHLIGHTS_PANEL_TOGGLE, {
    newsletter_slug: args.newsletterSlug,
    state: args.state,
  });
}
