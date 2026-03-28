import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";

import { AnalyticsScript } from "@/components/AnalyticsScript";
import { getAllNewsletters, getLatestNewsletter } from "@/lib/newsletters";
import { getNewsletterSourcesConfig } from "@/lib/newsletter-sources";

import "./globals.css";

export const metadata: Metadata = {
  title: "Transformation Tech Digest",
  description:
    "A friendly weekly digest of useful transformation and technology links.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const allNewslettersPromise = getAllNewsletters();
  const latestNewsletterPromise = getLatestNewsletter();
  const sourceConfigPromise = getNewsletterSourcesConfig();

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col">
        <AnalyticsScript gaId={gaId} />
        <header className="sticky top-0 z-30 border-b border-stone-300/50 bg-[#eae8e4]/80 backdrop-blur-xl">
          <div className="app-shell flex items-center justify-between gap-4 py-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 rounded-lg px-1 py-1 transition-opacity hover:opacity-70"
            >
              <Image
                src="/monk-gradient-dot-small.png"
                alt=""
                width={28}
                height={28}
                className="rounded-full"
                aria-hidden
              />
              <Image
                src="/monks-logo.png"
                alt="Monks"
                width={90}
                height={24}
                className="object-contain"
              />
              <span className="hidden text-stone-400 sm:inline">|</span>
              <span className="font-heading hidden text-[0.95rem] font-semibold text-stone-800 sm:inline">
                Transformation Tech Digest
              </span>
            </Link>

            <LayoutHistoryMenu
              allNewslettersPromise={allNewslettersPromise}
              latestNewsletterPromise={latestNewsletterPromise}
            />
          </div>
        </header>

        <main className="app-shell flex-1 py-6 md:py-8">{children}</main>
        <LayoutFooter sourceConfigPromise={sourceConfigPromise} />
      </body>
    </html>
  );
}

async function LayoutHistoryMenu({
  allNewslettersPromise,
  latestNewsletterPromise,
}: {
  allNewslettersPromise: ReturnType<typeof getAllNewsletters>;
  latestNewsletterPromise: ReturnType<typeof getLatestNewsletter>;
}) {
  const [allNewsletters, latestNewsletter] = await Promise.all([
    allNewslettersPromise,
    latestNewsletterPromise,
  ]);

  const history = latestNewsletter
    ? allNewsletters.filter((item) => item.slug !== latestNewsletter.slug)
    : allNewsletters;
  const recentHistory = history.slice(0, 5);

  return (
    <details className="group relative">
      <summary className="inline-flex cursor-pointer list-none items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900">
        Past issues
        <ChevronDown className="h-4 w-4 text-stone-400 transition-transform group-open:rotate-180" />
      </summary>

      <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-lg shadow-stone-900/5 backdrop-blur">
        {latestNewsletter ? (
          <Link
            href={`/newsletter/${latestNewsletter.slug}`}
            className="block rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100"
          >
            Latest: {latestNewsletter.date}
          </Link>
        ) : null}

        {recentHistory.length > 0 ? <div className="my-2 h-px bg-stone-200" /> : null}

        <ul className="max-h-[300px] space-y-1 overflow-y-auto pb-1">
          {recentHistory.map((item) => (
            <li key={item.slug}>
              <Link
                href={`/newsletter/${item.slug}`}
                className="block rounded-lg px-3 py-2 text-sm text-stone-600 hover:bg-stone-100 hover:text-stone-900"
              >
                {item.date}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mt-1 border-t border-stone-200 pt-2">
          <Link
            href="/archive"
            className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
          >
            View all issues
          </Link>
        </div>
      </div>
    </details>
  );
}

async function LayoutFooter({
  sourceConfigPromise,
}: {
  sourceConfigPromise: ReturnType<typeof getNewsletterSourcesConfig>;
}) {
  const config = await sourceConfigPromise;

  return (
    <footer className="mt-8 border-t border-stone-300/60 bg-[#eae8e4]/80 py-7 backdrop-blur">
      <div className="app-shell space-y-3">
        <p className="text-sm font-medium text-stone-700">{config.thanksMessage}</p>
        {config.sources.length > 0 ? (
          <ul className="flex flex-wrap gap-2">
            {config.sources.map((source) => (
              <li key={source.url}>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex rounded-full border border-stone-300 bg-white px-3 py-1 text-sm text-stone-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-900"
                >
                  {source.name}
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-stone-600">Add sources in data/newsletter-sources.json.</p>
        )}
      </div>
    </footer>
  );
}
