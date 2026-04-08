const ESPN_BASE = 'https://site.api.espn.com/apis';

type Sport = 'football' | 'basketball' | 'baseball' | 'hockey' | 'soccer';
type League = 'nfl' | 'nba' | 'mlb' | 'nhl' | 'mls';

const LEAGUE_MAP: Record<string, { sport: Sport; league: League }> = {
  nfl: { sport: 'football', league: 'nfl' },
  nba: { sport: 'basketball', league: 'nba' },
  mlb: { sport: 'baseball', league: 'mlb' },
  nhl: { sport: 'hockey', league: 'nhl' },
  mls: { sport: 'soccer', league: 'mls' },
};

function resolveLeague(input: string): { sport: Sport; league: League } | null {
  const key = input.toLowerCase().trim();
  return LEAGUE_MAP[key] ?? null;
}

async function espnFetch(url: string) {
  const start = Date.now();
  console.log(`[espn] Fetching: ${url}`);

  const res = await fetch(url, { signal: AbortSignal.timeout(8_000) });
  if (!res.ok) {
    throw new Error(`ESPN API ${res.status}: ${res.statusText}`);
  }
  const data = await res.json();

  console.log(`[espn] Done in ${Date.now() - start}ms`);
  return data;
}

export async function getScores(league: string) {
  const resolved = resolveLeague(league);
  if (!resolved) return { error: `Unknown league "${league}". Try: NFL, NBA, MLB, NHL, MLS` };

  try {
    const data = await espnFetch(
      `${ESPN_BASE}/site/v2/sports/${resolved.sport}/${resolved.league}/scoreboard`,
    );

    const events = (data.events ?? []).slice(0, 5).map((event: any) => {
      const competition = event.competitions?.[0];
      const competitors = (competition?.competitors ?? []).map((team: any) => ({
        name: team.team?.displayName ?? team.team?.name,
        score: team.score,
        winner: team.winner,
      }));

      return {
        name: event.shortName ?? event.name,
        status: competition?.status?.type?.shortDetail ?? 'Unknown',
        competitors,
      };
    });

    return { league: resolved.league.toUpperCase(), games: events };
  } catch (error) {
    return { error: `Failed to fetch scores: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getStandings(league: string) {
  const resolved = resolveLeague(league);
  if (!resolved) return { error: `Unknown league "${league}". Try: NFL, NBA, MLB, NHL, MLS` };

  try {
    const data = await espnFetch(
      `${ESPN_BASE}/v2/sports/${resolved.sport}/${resolved.league}/standings`,
    );

    const groups = (data.children ?? []).slice(0, 2).map((group: any) => ({
      name: group.name ?? group.abbreviation,
      teams: (group.standings?.entries ?? []).slice(0, 5).map((entry: any) => ({
        name: entry.team?.displayName ?? entry.team?.name,
        wins: entry.stats?.find((s: any) => s.name === 'wins')?.value,
        losses: entry.stats?.find((s: any) => s.name === 'losses')?.value,
      })),
    }));

    return { league: resolved.league.toUpperCase(), groups };
  } catch (error) {
    return { error: `Failed to fetch standings: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getNews(league: string) {
  const resolved = resolveLeague(league);
  if (!resolved) return { error: `Unknown league "${league}". Try: NFL, NBA, MLB, NHL, MLS` };

  try {
    const data = await espnFetch(
      `${ESPN_BASE}/site/v2/sports/${resolved.sport}/${resolved.league}/news?limit=3`,
    );

    const articles = (data.articles ?? []).map((article: any) => ({
      headline: article.headline,
      description: article.description,
      published: article.published,
    }));

    return { league: resolved.league.toUpperCase(), articles };
  } catch (error) {
    return { error: `Failed to fetch news: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

export async function getLeaders(league: string, season?: string) {
  const resolved = resolveLeague(league);
  if (!resolved) return { error: `Unknown league "${league}". Try: NFL, NBA, MLB, NHL, MLS` };

  const effectiveSeason = season ?? '2025';

  try {
    const data = await espnFetch(
      `https://sports.core.api.espn.com/v2/sports/${resolved.sport}/leagues/${resolved.league}/seasons/${effectiveSeason}/types/2/leaders?limit=5`,
    );

    const categories = (data.categories ?? []).slice(0, 3).map((cat: any) => ({
      name: cat.displayName ?? cat.name,
      leaders: (cat.leaders ?? []).slice(0, 3).map((leader: any) => ({
        name: leader.athlete?.displayName ?? 'Unknown',
        value: leader.value,
      })),
    }));

    return { league: resolved.league.toUpperCase(), season: effectiveSeason, categories };
  } catch (error) {
    return { error: `Failed to fetch leaders: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}
