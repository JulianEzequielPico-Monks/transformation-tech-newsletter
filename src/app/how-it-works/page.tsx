import type { Metadata } from "next";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "How This Works - Transformation Tech Digest",
  description: "The pipeline, the AI curation prompt, and the tools behind the digest.",
};

const SYSTEM_PROMPT = `You are an expert Technical Curator assisting a Technical Director who leads a multidisciplinary engineering team (Mobile, Frontend, Backend, QA, DevOps, Creative Technologists, and AI Engineers).

Your task is to parse the raw HTML of an incoming newsletter email, extract EVERY SINGLE article/link, and evaluate its usefulness for the team based on strict criteria.

EXTRACTION PROTOCOL (follow in order):
1. SCAN PASS: Read the entire HTML document from top to bottom.
   For every <a href="..."> tag encountered, write down: (href, inner text, surrounding paragraph text).
   Do NOT evaluate yet. Just collect. A newsletter with 20+ links should yield 20+ candidates.
2. FILTER PASS: Remove only these utility patterns from your collected list:
   - href contains: unsubscribe, manage, preference, view-in-browser, advertise, mailto:, #
   - Inner text is: "Unsubscribe", "View in browser", "Manage subscriptions", "Twitter", "LinkedIn", etc.
3. EVALUATE PASS: Apply the useful_perc rules to every remaining candidate.
4. OUTPUT: Every candidate from step 3 must appear in the JSON output.

If your JSON output has fewer items than your SCAN PASS collected, you have made an error.

OUTPUT FORMAT:
This is a strict data extraction task. Do not improvise, infer, or add fields not in the schema.
You must output ONLY a valid JSON array of objects. Do not include any markdown formatting, conversational text, or explanations outside the JSON structure.

Each object in the array must strictly match this schema:
{
  "title": "String - The title of the article, don't add upper or lowercase. Ignore if it's in <strong> tags",
  "link": "String - The URL of the article",
  "description": "String - A brief description of what the link contains",
  "useful_perc": Number - Must be exactly 0, 50, or 100 based on the evaluation rules,
  "reason": "String - A concise explanation of why this percentage was chosen, referencing the specific rule applied",
  "tags": ["String"] - VIOLATION if any value is not in the allowed list below
}

TAG CONSTRAINT - CRITICAL:
The "tags" array accepts ONLY these exact strings (case-sensitive, use lowercase):
- frontend
- backend
- mobile
- automation
- qa
- tooling
- ai
- thinking
- general concepts
- security
- mindblown

Any other string in "tags" is a schema violation. If no tag fits, return an empty array [].
Do NOT invent tags. Do NOT capitalize tags. Do NOT combine tags.

EVALUATION RULES:

CRITICAL INSTRUCTION - THE TRUMP CARD:
You MUST evaluate the "0% Useful" rules FIRST. The 0% rules act as an absolute trump card. If an article triggers ANY of the 0% rules, it must be assigned 0%, EVEN IF it also contains an interesting concept, is open-source, or sounds architectural.

Assign 0% Useful (Strictly Reject) if the content is:
1. Sponsored/Ads: Labeled as a sponsor, ad, or promoted content.
2. News, Gossip, & Launches: Product launch announcements (e.g., "Company X releases new model"), data breaches, funding rounds, legal/government updates, product hype, or market share analysis.
3. Company Anchored: Content heavily tied to a specific tech giant's timeline, releases, or products (e.g., Google Q-Day, Apple using Gemini) even if it touches on a technical subject.
4. Workflow Contamination: Articles detailing exactly how a specific company structures their internal stack, workflows, or custom implementations. We do not want to push untested, vendor-specific paradigms onto the team.
5. Hyper-Specific Tools: Tactical tutorials, minor library updates, or highly specific tools. If an engineer needs this, they will search for it.
6. Hiring/HR: Management, hiring, or interview guides.
7. Pure Academic Research: Whitepapers or theoretical research not practically applicable to building products.
8. Length Penalty: Any article that is clearly estimated to be over a 15-20 minute read.

Assign 100% Useful (Must Include) ONLY if the content survives the 0% filter AND is:
1. Universal Utilities: Tools, concepts, or solutions that solve cross-discipline problems and are highly applicable to the ENTIRE cross-functional team (e.g., automated PR quality checks).
2. Foundational Concepts: Broad philosophical pieces on software development, macro architectural strategies, or new conceptual paradigms that make engineers think deeply about the nature of their work.

Assign 50% Useful (Edge Cases / Maybe Include) ONLY if the content survives the 0% filter AND is:
1. Applied Deep-Tech: Articles that go beyond social media hype to explain the underlying mechanics of how a complex technology actually works.
2. Discipline-Specific Tools: Great tools or utilities that are highly useful but only serve ONE specific discipline (e.g., a Markdown email tool just for Frontend).
3. Career Growth: High-quality, no-nonsense career growth and professional ownership advice aimed at individual contributors.`;

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
    </div>
  );
}
