/**
 * Optional Adzuna fetch, if app id/key are set we add fresh listings to the
 * candidate pool ranked by AI. If not configured, we silently fall back to
 * the curated UC seed alone.
 */

export type AdzunaJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  source_url: string;
  posted_at: string;
};

export async function fetchAdzunaListings(opts: {
  what?: string;
  perPage?: number;
}): Promise<AdzunaJob[]> {
  const appId = process.env.ADZUNA_APP_ID;
  const appKey = process.env.ADZUNA_APP_KEY;
  if (!appId || !appKey) return [];

  const params = new URLSearchParams({
    app_id: appId,
    app_key: appKey,
    results_per_page: String(opts.perPage ?? 20),
    what: opts.what ?? "intern",
    "content-type": "application/json",
    sort_by: "date",
  });

  try {
    const res = await fetch(
      `https://api.adzuna.com/v1/api/jobs/nz/search/1?${params.toString()}`,
      { next: { revalidate: 1800 } },
    );
    if (!res.ok) return [];
    const data: { results?: Array<Record<string, unknown>> } = await res.json();
    return (data.results ?? []).flatMap((r) => {
      try {
        const id = String(r.id ?? "");
        const company = String(
          (r.company as { display_name?: string })?.display_name ?? "Unknown",
        );
        const location = String(
          (r.location as { display_name?: string })?.display_name ?? "",
        );
        return [
          {
            id: `adzuna-${id}`,
            title: String(r.title ?? "Untitled"),
            company,
            location,
            description: String(r.description ?? "").slice(0, 1200),
            source_url: String(r.redirect_url ?? ""),
            posted_at: String(r.created ?? new Date().toISOString()),
          },
        ];
      } catch {
        return [];
      }
    });
  } catch {
    return [];
  }
}
