"use client";

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

type EventParams = Record<string, string | number | boolean>;

function trackEvent(eventName: string, params: EventParams): void {
  if (typeof window === "undefined") {
    return;
  }

  if (typeof window.gtag === "function") {
    window.gtag("event", eventName, params);
  }
}

export function trackNewsletterLinkClick(args: {
  newsletterSlug: string;
  section: "useful" | "maybeUseful" | "discarded";
  title: string;
  url: string;
}): void {
  trackEvent("newsletter_link_click", {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
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
  trackEvent("newsletter_link_feedback", {
    newsletter_slug: args.newsletterSlug,
    section: args.section,
    link_id: args.linkId,
    vote: args.vote,
  });
}
