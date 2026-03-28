"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

import type { Newsletter } from "@/types/newsletter";

type HistoryMenuProps = {
  latest: Newsletter | null;
  history: Newsletter[];
};

export function HistoryMenu({ latest, history }: HistoryMenuProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-1 rounded-full border border-stone-300 bg-white px-3 py-1.5 text-sm font-medium text-stone-700 shadow-sm transition-colors hover:border-stone-400 hover:bg-stone-50 hover:text-stone-900"
      >
        Past issues
        <ChevronDown className={`h-4 w-4 text-stone-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open ? (
        <div className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-2xl border border-stone-200/80 bg-white/95 p-2 shadow-lg shadow-stone-900/5 backdrop-blur">
          {latest ? (
            <Link
              href={`/newsletter/${latest.slug}`}
              onClick={() => setOpen(false)}
              className="block rounded-xl bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-900 hover:bg-violet-100"
            >
              Latest: {latest.date}
            </Link>
          ) : null}

          {history.length > 0 ? <div className="my-2 h-px bg-stone-200" /> : null}

          <ul className="max-h-[300px] space-y-1 overflow-y-auto pb-1">
            {history.map((item) => (
              <li key={item.slug}>
                <Link
                  href={`/newsletter/${item.slug}`}
                  onClick={() => setOpen(false)}
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
              onClick={() => setOpen(false)}
              className="block rounded-lg px-3 py-2 text-sm font-medium text-stone-700 hover:bg-stone-100"
            >
              View all issues
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}
