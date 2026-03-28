"use client";

import { logEvent } from "firebase/analytics";
import { getFirebaseAnalytics } from "@/lib/firebase";

async function trackEvent(eventName: string, params: Record<string, string | number>): Promise<void> {
  const analytics = await getFirebaseAnalytics();
  if (!analytics) return;
  logEvent(analytics, eventName, params);
}

export function trackNewsletterIssueView(args: {
  newsletterSlug: string;
  date: string;
  totalLinks: number;
}): void {
  void trackEvent("newsletter_issue_view", {
    newsletter_slug: args.newsletterSlug,
    date: args.date,
    total_links: args.totalLinks,
  });
}

export function trackNewsletterLinkClick(args: {
  newsletterSlug: string;
  section: "useful" | "maybeUseful" | "discarded";
  linkId: string;
  title: string;
  url: string;
}): void {
  void trackEvent("newsletter_link_click", {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
    link_id: args.linkId,
    link_title: args.title,
    link_url: args.url,
  });
}

export function trackNewsletterFeedback(args: {
  newsletterSlug: string;
  section: "useful" | "maybeUseful" | "discarded";
  linkId: string;
  vote: "up" | "down";
}): void {
  void trackEvent("newsletter_link_feedback", {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
    link_id: args.linkId,
    vote: args.vote,
  });
}

export function trackTagFilter(args: {
  newsletterSlug: string;
  tag: string;
  action: "select" | "deselect" | "clear";
}): void {
  void trackEvent("newsletter_tag_filter", {
    newsletter_slug: args.newsletterSlug,
    tag: args.tag,
    action: args.action,
  });
}
