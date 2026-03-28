import Link from "next/link";

export default function NotFound() {
  return (
    <section className="panel mx-auto max-w-2xl space-y-4 border border-amber-100 bg-gradient-to-br from-white to-amber-50/45 p-6 text-center md:p-10">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-700">404</p>
      <h1 className="text-3xl font-semibold md:text-4xl">Newsletter not found</h1>
      <p className="mx-auto max-w-lg text-stone-600">
        The requested issue does not exist in the generated JSON dataset.
      </p>
      <Link
        href="/history"
        className="inline-flex items-center justify-center rounded-full border border-violet-200 bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-100"
      >
        Go to history
      </Link>
    </section>
  );
}
