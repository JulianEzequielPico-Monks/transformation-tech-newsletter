import { promises as fs } from "node:fs";
import path from "node:path";

import type {
  Newsletter,
  NewsletterCounts,
  NewsletterLink,
  NewsletterSections,
} from "@/types/newsletter";

const NEWSLETTER_DIR = path.join(process.cwd(), "data/newsletters");

type RawRecord = Record<string, unknown>;

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function sanitizeId(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function normalizeLink(link: unknown, fallbackId: string): NewsletterLink {
  const source = (typeof link === "object" && link !== null
    ? link
    : {}) as RawRecord;

  const title = toString(source.title, "Untitled link");

  return {
    id: toString(source.id, sanitizeId(title) || fallbackId),
    title,
    description: toString(source.description, "No description provided."),
    reason: toString(source.reason, "No reason provided."),
    tags: toStringArray(source.tags),
    url: toString(source.url),
  };
}

function computeCounts(sections: NewsletterSections): NewsletterCounts {
  const useful = sections.useful.length;
  const maybeUseful = sections.maybeUseful.length;
  const discarded = sections.discarded.length;

  return {
    useful,
    maybeUseful,
    discarded,
    total: useful + maybeUseful + discarded,
  };
}

function normalizeSections(raw: RawRecord, slug: string): NewsletterSections {
  const sectionBlock =
    (typeof raw.sections === "object" && raw.sections !== null
      ? raw.sections
      : {}) as RawRecord;

  const usefulSource =
    (Array.isArray(sectionBlock.useful)
      ? sectionBlock.useful
      : raw.usefulLinks) ?? [];

  const maybeSource =
    (Array.isArray(sectionBlock.maybeUseful)
      ? sectionBlock.maybeUseful
      : raw.maybeUsefulLinks) ?? [];

  const discardedSource =
    (Array.isArray(sectionBlock.discarded)
      ? sectionBlock.discarded
      : raw.discardedLinks) ?? [];

  const useful = Array.isArray(usefulSource)
    ? usefulSource.map((item, index) =>
        normalizeLink(item, `${slug}-useful-${String(index + 1)}`),
      )
    : [];

  const maybeUseful = Array.isArray(maybeSource)
    ? maybeSource.map((item, index) =>
        normalizeLink(item, `${slug}-maybe-${String(index + 1)}`),
      )
    : [];

  const discarded = Array.isArray(discardedSource)
    ? discardedSource.map((item, index) =>
        normalizeLink(item, `${slug}-discarded-${String(index + 1)}`),
      )
    : [];

  return {
    useful,
    maybeUseful,
    discarded,
  };
}

async function readNewsletterFile(fileName: string): Promise<Newsletter | null> {
  const filePath = path.join(NEWSLETTER_DIR, fileName);
  const fileContent = await fs.readFile(filePath, "utf8");
  const json = JSON.parse(fileContent) as RawRecord;

  const inferredSlug = fileName.replace(/\.json$/i, "");
  const slug = toString(json.slug, inferredSlug);
  const date = toString(json.date);

  if (!date) {
    return null;
  }

  const sections = normalizeSections(json, slug);

  return {
    slug,
    date,
    title: toString(json.title, `Newsletter ${date}`),
    sections,
    counts: computeCounts(sections),
  };
}

export async function getAllNewsletters(): Promise<Newsletter[]> {
  let files: string[] = [];

  try {
    files = await fs.readdir(NEWSLETTER_DIR);
  } catch {
    return [];
  }

  const jsonFiles = files.filter((file) => file.endsWith(".json"));
  const parsed = await Promise.all(jsonFiles.map(readNewsletterFile));

  return parsed
    .filter((entry): entry is Newsletter => entry !== null)
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getLatestNewsletter(): Promise<Newsletter | null> {
  const all = await getAllNewsletters();
  return all[0] ?? null;
}

export async function getNewsletterBySlug(
  slug: string,
): Promise<Newsletter | null> {
  const all = await getAllNewsletters();
  return all.find((entry) => entry.slug === slug) ?? null;
}

export async function getAllNewsletterSlugs(): Promise<string[]> {
  const all = await getAllNewsletters();
  return all.map((entry) => entry.slug);
}

export function formatNewsletterDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00Z`);

  if (Number.isNaN(parsed.getTime())) {
    return date;
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "long",
    timeZone: "UTC",
  }).format(parsed);
}
