import type { Metadata } from "next";
import fs from "fs";
import path from "path";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "How This Works - Transformation Tech Digest",
  description: "The pipeline, the AI curation prompt, and the tools behind the digest.",
};

const SYSTEM_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "src/app/how-it-works/SystemPrompt.md"),
  "utf-8"
);

const SUMMARY_PROMPT = fs.readFileSync(
  path.join(process.cwd(), "src/app/how-it-works/SummaryPrompt.md"),
  "utf-8"
);

const STACK = [
  {
    name: "n8n",
    description: "Orchestrates the full pipeline. Currently triggered manually, a Tech Team member runs it after forwarding a curated newsletter email to the processing inbox.",
  },
  {
    name: "Gmail API",
    description: "Reads the raw HTML of newsletter emails from a dedicated inbox. The Tech Team manually selects and forwards newsletters to be processed, only emails added by the team are picked up.",
  },
  {
    name: "Gemini 3.0 Flash",
    description: "Parses each newsletter's raw HTML, extracts every link, and scores it against the curation rules above.",
  },
  {
    name: "Google Sheets & Drive APIs",
    description: "Raw AI output is appended to a Sheet for human review before the approved JSON is written to Drive.",
  },
  {
    name: "Firebase Analytics",
    description: "Tracks link clicks and thumbs-up/down feedback so we can measure what the team actually finds useful over time.",
  },
  {
    name: "Next.js",
    description: "Renders this site statically from the JSON files produced by the pipeline.",
  },
  {
    name: "Vercel",
    description: "Hosts and deploys the site. Every JSON update triggers a new build automatically.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="space-y-8">
      <section className="panel space-y-4 border border-violet-200 bg-gradient-to-b from-white via-violet-50/35 to-white p-5 md:p-7">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-violet-700">Under the hood</p>
          <h1 className="text-3xl font-semibold md:text-4xl">How this works</h1>
          <p className="max-w-2xl text-[0.88rem] leading-6 text-stone-500">
            The pipeline is currently triggered manually by the Tech Team. Each run processes a newsletter email that was hand-picked and forwarded to the processing inbox — nothing gets in automatically.
          </p>
        </div>
      </section>

      <section className="panel space-y-5 p-5 md:p-7">
        <h2 className="text-2xl font-semibold">The stack</h2>
        <ul className="space-y-4">
          {STACK.map((item) => (
            <li key={item.name} className="flex gap-4 rounded-xl border border-stone-200 bg-white p-4">
              <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">
                {item.name[0]}
              </div>
              <div className="space-y-0.5">
                <p className="font-semibold text-stone-900">{item.name}</p>
                <p className="text-sm leading-relaxed text-stone-500">{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel space-y-5 p-5 md:p-7">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">The curation prompt</h2>
          <p className="text-sm text-stone-500">This is the exact system prompt sent to Gemini for every newsletter.</p>
        </div>
        <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm leading-relaxed text-amber-900">
          The prompt is grounded in real past curations: patterns of what got marked useful or discarded informed every rule you see below. After each issue, the output is reviewed by a human and the prompt is refined if something was missed, misclassified, or the rules need sharpening.
        </div>
        <pre className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-4 text-[0.78rem] leading-relaxed whitespace-pre-wrap text-stone-700">
          {SYSTEM_PROMPT}
        </pre>
      </section>

      <section className="panel space-y-5 p-5 md:p-7">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold">The summary prompt</h2>
          <p className="text-sm text-stone-500">This prompt generates the human-readable summary shown at the top of each issue.</p>
        </div>
        <div className="rounded-xl border border-violet-200 bg-violet-50/60 px-4 py-3 text-sm leading-relaxed text-violet-900">
          Once curation is done, the structured JSON already contains every scored and tagged link — but raw data alone doesn't give readers a quick sense of what a given issue is about. This second prompt takes the curated output and produces a flowing, paragraph-form snapshot of the Useful and Maybe Useful sections, grouping links by theme and embedding them inline. It's the difference between a spreadsheet and a briefing.
        </div>
        <pre className="overflow-x-auto rounded-xl border border-stone-200 bg-stone-50 p-4 text-[0.78rem] leading-relaxed whitespace-pre-wrap text-stone-700">
          {SUMMARY_PROMPT}
        </pre>
      </section>
    </div>
  );
}
