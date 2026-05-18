import { generateObject } from "ai";
import { z } from "zod";

import { fetchAdzunaListings } from "@/lib/jobs/adzuna";
import { fetchLiveListings } from "@/lib/jobs/live-search";
import { seedJobs } from "@/lib/jobs/seed";
import {
  RANK_JOBS_SYSTEM,
  buildRankJobsUser,
} from "@/lib/ai/prompts";
import { DEFAULT_MODEL, openrouter } from "@/lib/ai/openrouter";

export type DiscoveryCandidate = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  source_url: string;
  posted_at: string;
};

export type RankedCandidate = DiscoveryCandidate & {
  score: number;
  reasons: string[];
};

const RankSchema = z.object({
  matches: z.array(
    z.object({
      id: z.string(),
      score: z.number().min(0).max(100),
      reasons: z.array(z.string()).max(3),
    }),
  ),
});

/**
 * Discover & rank: live AI web search is the primary source, Adzuna fills
 * in if configured, and the curated UC seed is only used as a *backstop* if
 * the live channels return fewer than 5 listings (the URLs in the seed are
 * hand-written and may go stale). Every URL in the candidate pool has been
 * either fetched live by the AI or HEAD-validated, so users never click
 * through to a 404.
 */
export async function discover(opts: {
  resume: string;
  limit?: number;
}): Promise<RankedCandidate[]> {
  // Live AI-driven web search runs in parallel with the optional Adzuna
  // call so the slowest network leg is the dominant cost, not the sum.
  const [live, adzuna] = await Promise.all([
    fetchLiveListings(),
    fetchAdzunaListings({ what: "intern", perPage: 15 }),
  ]);

  const liveAndAdzuna = dedupe([...live, ...adzuna]);

  // Only borrow from the curated seed if the live + Adzuna sources are too
  // sparse to give the ranker variety. Seed URLs are hand-written and may
  // be stale, so we HEAD-validate them before adding so users never click
  // through to a 404.
  let candidates: DiscoveryCandidate[];
  if (liveAndAdzuna.length >= 5) {
    candidates = liveAndAdzuna;
  } else {
    const seedVerified = await validateUrls(seedJobs);
    console.info(
      `[discover] live+adzuna=${liveAndAdzuna.length}, validated seed=${seedVerified.length}/${seedJobs.length}`,
    );
    candidates = dedupe([...liveAndAdzuna, ...seedVerified]);
  }

  // Trim to keep prompt tokens reasonable. Take 30 to ensure variety.
  const pool = candidates.slice(0, 30);

  const aiScores = await rankWithAI({ resume: opts.resume, pool });

  const ranked: RankedCandidate[] = pool
    .map((c) => {
      const r = aiScores.get(c.id);
      if (r) {
        return { ...c, score: r.score, reasons: r.reasons };
      }
      const fallback = heuristicScore(c, opts.resume);
      return { ...c, score: fallback.score, reasons: fallback.reasons };
    })
    .sort((a, b) => b.score - a.score);

  return ranked.slice(0, opts.limit ?? 12);
}

async function rankWithAI(args: {
  resume: string;
  pool: DiscoveryCandidate[];
}): Promise<Map<string, { score: number; reasons: string[] }>> {
  const out = new Map<string, { score: number; reasons: string[] }>();
  try {
    const { object } = await generateObject({
      model: openrouter.chat(DEFAULT_MODEL),
      schema: RankSchema,
      system: RANK_JOBS_SYSTEM,
      prompt: buildRankJobsUser({
        resume: args.resume,
        jobs: args.pool.map((c) => ({
          id: c.id,
          title: c.title,
          company: c.company,
          location: c.location,
          description: c.description,
        })),
      }),
      temperature: 0.3,
      maxOutputTokens: 6000,
    });
    for (const m of object.matches) {
      out.set(m.id, {
        score: clamp(m.score, 0, 100),
        reasons: m.reasons.slice(0, 3),
      });
    }
  } catch (err) {
    console.error("[discover] AI ranking failed; falling back to heuristic:", err);
  }
  return out;
}

/**
 * Deterministic fallback when the AI call fails. Counts overlap between
 * resume tokens and the listing's title/company/description. Produces a
 * spread of scores between 30 and 80 so the UI never shows a flat wall.
 */
function heuristicScore(
  c: DiscoveryCandidate,
  resume: string,
): { score: number; reasons: string[] } {
  const resumeTokens = tokenize(resume);
  const listingTokens = tokenize(
    `${c.title} ${c.company} ${c.location} ${c.description}`,
  );
  const matched = new Set<string>();
  for (const t of listingTokens) if (resumeTokens.has(t)) matched.add(t);
  const overlap = matched.size;
  // Simple sigmoidal mapping: 0 hits -> ~32, 5 hits -> ~55, 15+ hits -> ~78.
  const score = Math.round(32 + 50 * (overlap / (overlap + 6)));

  const interesting = [...matched]
    .filter((w) => w.length > 4 && !STOPWORDS.has(w))
    .slice(0, 3);
  const reasons =
    interesting.length > 0
      ? [`Resume mentions: ${interesting.join(", ")}.`]
      : ["Generic match, re-run the AI rescan for a personalised score."];

  return { score, reasons };
}

const STOPWORDS = new Set([
  "internship",
  "intern",
  "engineer",
  "engineering",
  "software",
  "graduate",
  "summer",
  "company",
  "position",
  "experience",
  "skills",
  "applied",
  "applications",
]);

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9+#./-]+/g, " ")
      .split(/\s+/)
      .filter((w) => w.length >= 3),
  );
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

/**
 * HEAD-check every candidate URL in parallel and drop ones that 404 or
 * time out. Used for the curated seed; live results already pass through
 * their own validation in lib/jobs/live-search.ts.
 */
async function validateUrls<T extends { source_url: string }>(
  candidates: readonly T[],
): Promise<T[]> {
  const results = await Promise.all(
    candidates.map(async (c) => {
      const ok = await headCheck(c.source_url);
      return ok ? c : null;
    }),
  );
  const out: T[] = [];
  for (const r of results) {
    if (r) out.push(r);
  }
  return out;
}

async function headCheck(url: string): Promise<boolean> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
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

/**
 * Drop near-duplicates across the live, Adzuna, and seed sources. Match key
 * is `${company}|${title}` lowercased and stripped of punctuation. First
 * occurrence wins, which is why we order live > adzuna > seed.
 */
function dedupe(xs: DiscoveryCandidate[]): DiscoveryCandidate[] {
  const seen = new Set<string>();
  const out: DiscoveryCandidate[] = [];
  for (const x of xs) {
    const key = `${normalize(x.company)}|${normalize(x.title)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(x);
  }
  return out;
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/\binternship\b|\bintern\b|\bgraduate\b|\(.*?\)/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
