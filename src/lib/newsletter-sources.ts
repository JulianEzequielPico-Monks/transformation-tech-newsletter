import { promises as fs } from "node:fs";
import path from "node:path";

export type NewsletterSource = {
  name: string;
  url: string;
};

export type NewsletterSourcesConfig = {
  thanksMessage: string;
  sources: NewsletterSource[];
};

const SOURCE_FILE = path.join(process.cwd(), "data/newsletter-sources.json");

const DEFAULT_CONFIG: NewsletterSourcesConfig = {
  thanksMessage:
    "Thank you to the newsletters and publications that inspire this curated digest.",
  sources: [],
};

type RawRecord = Record<string, unknown>;

function toString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function normalizeSource(value: unknown): NewsletterSource | null {
  if (typeof value !== "object" || value === null) {
    return null;
  }

  const source = value as RawRecord;
  const name = toString(source.name).trim();
  const url = toString(source.url).trim();

  if (!name || !url) {
    return null;
  }

  return { name, url };
}

export async function getNewsletterSourcesConfig(): Promise<NewsletterSourcesConfig> {
  try {
    const fileContent = await fs.readFile(SOURCE_FILE, "utf8");
    const json = JSON.parse(fileContent) as RawRecord;

    const sources = Array.isArray(json.sources)
      ? json.sources.map(normalizeSource).filter((entry): entry is NewsletterSource => entry !== null)
      : [];

    return {
      thanksMessage: toString(json.thanksMessage, DEFAULT_CONFIG.thanksMessage),
      sources,
    };
  } catch {
    return DEFAULT_CONFIG;
  }
}