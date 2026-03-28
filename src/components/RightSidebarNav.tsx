"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Clock3, History } from "lucide-react";

import type { Newsletter } from "@/types/newsletter";
import { cn } from "@/lib/utils";

type RightSidebarNavProps = {
  latest: Newsletter | null;
  history: Newsletter[];
};

export function RightSidebarNav({ latest, history }: RightSidebarNavProps) {
  const pathname = usePathname();

  return (
    <aside className="w-full rounded-xl border border-stone-200 bg-white p-4 md:sticky md:top-6 md:w-72 md:self-start">
      <nav aria-label="Newsletter navigation" className="space-y-4">
        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <Clock3 className="h-4 w-4" />
            Last
          </h2>
          {latest ? (
            <Link
              href={`/newsletter/${latest.slug}`}
              className={cn(
                "block rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === `/newsletter/${latest.slug}`
                  ? "bg-stone-900 text-white"
                  : "text-stone-700 hover:bg-stone-100",
              )}
            >
              {latest.date}
            </Link>
          ) : (
            <p className="px-3 text-sm text-stone-500">No issues available.</p>
          )}
        </section>

        <section className="space-y-2">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
            <History className="h-4 w-4" />
            History
          </h2>
          <ul className="space-y-1 pl-3">
            {history.map((item) => {
              const href = `/newsletter/${item.slug}`;
              const active = pathname === href;
              return (
                <li key={item.slug}>
                  <Link
                    href={href}
                    className={cn(
                      "block rounded-md px-3 py-1.5 text-sm transition-colors",
                      active
                        ? "bg-stone-100 font-semibold text-stone-900"
                        : "text-stone-600 hover:bg-stone-50 hover:text-stone-900",
                    )}
                  >
                    {item.date}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </nav>
    </aside>
  );
}
