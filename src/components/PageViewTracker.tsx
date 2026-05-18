"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useEffect } from "react";

import { trackArchiveIssueClick, trackPageView } from "@/lib/analytics";

export function PageViewTracker({ page }: { page: string }) {
  useEffect(() => {
    trackPageView({ page });
  }, [page]);
  return null;
}

type TrackedLatestIssueLinkProps = {
  newsletterSlug: string;
  href: string;
  className?: string;
  children: ReactNode;
};

export function TrackedLatestIssueLink({
  newsletterSlug,
  href,
  className,
  children,
}: TrackedLatestIssueLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={() =>
        trackArchiveIssueClick({ newsletterSlug, position: -1 })
      }
    >
      {children}
    </Link>
  );
}
