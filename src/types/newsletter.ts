export type NewsletterBucket = "useful" | "maybeUseful" | "discarded";

export type NewsletterLink = {
  id: string;
  title: string;
  description: string;
  reason: string;
  tags: string[];
  url: string;
};

export type NewsletterSections = {
  useful: NewsletterLink[];
  maybeUseful: NewsletterLink[];
  discarded: NewsletterLink[];
};

export type NewsletterCounts = {
  total: number;
  useful: number;
  maybeUseful: number;
  discarded: number;
};

export type NewsletterHighlight = {
  linkId: string;
  commentary?: string;
};

export type Newsletter = {
  slug: string;
  title: string;
  date: string;
  summary?: string;
  highlights?: NewsletterHighlight[];
  sections: NewsletterSections;
  counts: NewsletterCounts;
  emailsProcessed: number;
};
