import { generateObject } from "ai";
import { z } from "zod";

import { openrouter } from "@/lib/ai/openrouter";
import { SYSTEM_BASE } from "@/lib/ai/prompts";
import type { DiscoveryCandidate } from "@/lib/jobs/discovery";

/**
 * Live AI-driven web search for currently-open NZ internships and grad roles.
 *
 * Uses OpenRouter's `:online` plugin on `openai/gpt-5.4-mini:online`.
 * The heavier `gpt-5.5:online` is more thorough but burns 5-7 minutes per
 * call on reasoning, which is unusable for a click-and-wait demo. Mini
 * comes back in ~30s with 8-15 listings, costs ~$0.06, and we patch the
 * recall problem with strict server-side URL validation below.
 *
 * Every URL the model returns is HEAD-validated before we hand it to the
 * ranker, fabricated or stale URLs are filtered out so the user never
 * sees a 404 when they click "Source".
 */

const LIVE_SEARCH_MODEL = "openai/gpt-5.4-mini:online";

// OpenAI's strict JSON-mode (used by generateObject) requires every key in
// `properties` to also appear in `required`. Optional fields are rejected.
// Keep this schema lean, five required strings, no fluff.
const LiveJobSchema = z.object({
  title: z.string(),
  company: z.string(),
  location: z.string(),
  url: z.string(),
  summary: z.string(),
});

const LiveJobsSchema = z.object({
  jobs: z.array(LiveJobSchema).max(25),
});

const SYSTEM = `${SYSTEM_BASE}

Your job: find currently-open NZ-based internship, summer-intern, and graduate engineering / software / data / ML / mechatronics / electrical / mechanical / civil / biomedical / policy-tech roles by searching the open web RIGHT NOW.

PRIORITISE SPECIFIC ROLE URLs, NOT GENERIC CAREERS PAGES:
  • jobs.lever.co/COMPANY/UUID  (a specific posting)  ✓
  • boards.greenhouse.io/COMPANY/jobs/JOB_ID         ✓
  • COMPANY.workable.com/jobs/JOB_ID                 ✓
  • jobs.ashbyhq.com/COMPANY/UUID                    ✓
  • https://company.com/careers/role-slug            ✓ (deep link to a specific role)
  • https://company.com/careers                      ✗ (too generic, return only as last resort)
  • https://nz.indeed.com/...                        ✗ (Indeed listings expire and break)

Search the web in this turn. Do NOT recall UUIDs from training data. Quote URLs only from the live search results you see in this response. If your search didn't surface a specific role posting at a company, OMIT that company rather than fabricating one.

For Lumin specifically: their canonical careers domain is lumin.com (not luminpdf.com).

Skip senior, staff, principal, contract, or non-NZ roles (unless the listing explicitly says "Remote, NZ friendly"). Skip listings that have closed or whose application date has passed. Better to return 8 verified specific-role URLs than 25 with broken or generic links.`;

const PROMPT = `Find up to 25 currently-open NZ INTERNSHIP, SUMMER-INTERN, GRADUATE-PROGRAMME, or EARLY-CAREER engineering/software/data/ML roles ONLY. Strong preference for roles that visibly accept applications right now.

HARD FILTERS (do not return roles that match any):
  • "Senior", "Staff", "Principal", "Lead", "Manager", "Director", "Head of"
  • Contract, contractor, fixed-term, temp roles
  • Roles requiring 3+ years experience
  • Roles outside NZ unless explicitly "Remote, NZ-friendly"

Target audience: penultimate / final-year university students and recent graduates (0-2 years experience).

Each entry MUST have:
  • title: exact role title as published on the posting
  • company: hiring company name (the actual employer, not the ATS)
  • location: city / hybrid / remote info from the posting
  • url: the canonical posting URL, verified to load in your search
  • summary: one sentence (under 28 words) on what the role does day-to-day, drawn from the listing copy

Cover variety: mix big-co (Xero, Trade Me, Microsoft NZ, AWS NZ, Spark, ANZ, ASB, Westpac, Fisher & Paykel Healthcare, Beca, Stantec, IBM NZ, Deloitte, KPMG, EY, PwC, Air New Zealand, Contact Energy, EROAD), scale-ups (Partly, Halter, Soul Machines, Tracksuit, Volpara, Pushpay, Vista, Mint Innovation, Flox, Propellerhead, Allbirds), and mission-driven (Stats NZ, IRD, MBIE, Orion NZ).

Better to return 8 verified roles than 20 with broken links.`;

export async function fetchLiveListings(): Promise<DiscoveryCandidate[]> {
  let raw: z.infer<typeof LiveJobsSchema>;
  try {
    const { object } = await generateObject({
      model: openrouter.chat(LIVE_SEARCH_MODEL),
      schema: LiveJobsSchema,
      system: SYSTEM,
      prompt: PROMPT,
      temperature: 0.3,
      maxOutputTokens: 6000,
    });
    raw = object;
  } catch (err) {
    console.warn("[live-search] AI search failed:", err);
    return [];
  }

  console.info(
    `[live-search] AI returned ${raw.jobs.length} candidates:`,
    raw.jobs.map((j) => `${j.company} → ${j.url}`).slice(0, 25),
  );

  const candidates = raw.jobs
    .filter((j) => isReasonableUrl(j.url))
    .filter((j) => !looksLikeKnownBadHost(j.url))
    .filter((j) => isEarlyCareerTitle(j.title))
    .map((j) => ({ ...j, url: normalizeUrl(j.url) }));

  // Validate URLs in parallel with a 6-second budget each.
  const verified = await Promise.all(
    candidates.map(async (j) => {
      const ok = await isLiveUrl(j.url);
      if (!ok) console.info(`[live-search] dropped (404/timeout): ${j.url}`);
      return ok ? j : null;
    }),
  );
  const live = verified.filter((j): j is (typeof candidates)[number] => !!j);

  console.info(
    `[live-search] ${live.length}/${raw.jobs.length} URLs verified live.`,
  );

  const today = new Date().toISOString();
  return live.map((j, i) => ({
    id: `live-${slug(j.company)}-${slug(j.title)}-${i}`,
    title: j.title.slice(0, 200),
    company: j.company.slice(0, 120),
    location: j.location.slice(0, 120),
    description: j.summary.slice(0, 800),
    source_url: j.url,
    posted_at: today,
  }));
}

const KNOWN_BAD_HOSTS = new Set([
  "luminpdf.com", // canonical is lumin.com
]);

/**
 * Belt-and-braces title filter, even though the prompt says "no senior",
 * the model occasionally slips one through. We drop anything whose title
 * implies seniority before we even waste a HEAD request on it.
 */
const SENIOR_RE =
  /\b(senior|staff|principal|lead|manager|director|head\s+of|architect|chief|vp|vice\s+president)\b/i;
const CONTRACT_RE = /\b(contract|contractor|fixed[\s-]?term|temp(orary)?)\b/i;

function isEarlyCareerTitle(title: string): boolean {
  if (SENIOR_RE.test(title)) return false;
  if (CONTRACT_RE.test(title)) return false;
  return true;
}

function looksLikeKnownBadHost(u: string): boolean {
  try {
    const host = new URL(u).hostname.replace(/^www\./, "");
    return KNOWN_BAD_HOSTS.has(host);
  } catch {
    return true;
  }
}

function normalizeUrl(u: string): string {
  try {
    const url = new URL(u);
    // Drop common tracking params
    [
      "utm_source",
      "utm_medium",
      "utm_campaign",
      "utm_content",
      "utm_term",
      "fbclid",
      "gclid",
    ].forEach((p) => url.searchParams.delete(p));
    return url.toString();
  } catch {
    return u;
  }
}

function isReasonableUrl(u: string): boolean {
  try {
    const url = new URL(u);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * HEAD-request the URL with a short timeout. If HEAD is rejected (some sites
 * 405 it), fall back to GET with a small range and treat anything < 400 as
 * live. We follow redirects.
 */
async function isLiveUrl(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    let res = await fetch(url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; LadderBot/1.0; +https://ladder.app)",
      },
    });
    if (res.status === 405 || res.status === 403) {
      // Some hosts (Greenhouse occasionally, Lever's CDN) reject HEAD; retry GET.
      res = await fetch(url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (compatible; LadderBot/1.0; +https://ladder.app)",
          Range: "bytes=0-2048",
        },
      });
    }
    return res.status >= 200 && res.status < 400;
  } catch {
    return false;
  } finally {
    clearTimeout(timeout);
  }
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 32);
}
