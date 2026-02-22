/**
 * Song Matching Utilities
 * Ported from backend maptoSaavn.ts for Gaana→Saavn matching
 */

/**
 * Normalize string for comparison
 * - lowercase
 * - remove accents
 * - keep only alphanumeric and spaces
 */
function normalize(str: string): string {
  return (str || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9 ]+/g, ' ')    // keep only alphanumeric
    .replace(/\s+/g, ' ')            // collapse whitespace
    .trim();
}

/**
 * Compute fuzzy similarity between two strings (0..1)
 * Uses token set Jaccard weighted by token length
 */
function similarity(a: string, b: string): number {
  const na = normalize(a);
  const nb = normalize(b);
  if (!na || !nb) return 0;
  if (na === nb) return 1;

  // Token set Jaccard weighted by token length
  const ta = new Set(na.split(' '));
  const tb = new Set(nb.split(' '));
  const inter = [...ta].filter((t) => tb.has(t));
  const union = new Set([...ta, ...tb]);
  const jaccard = inter.length / union.size;

  // Character overlap
  const overlap = inter.join('').length / Math.max(na.replace(/ /g, '').length, 1);

  return jaccard * 0.7 + overlap * 0.3;
}

/**
 * Compute artist match score (0..1)
 */
function artistMatchScore(sourceArtists: string[], targetArtistsStr: string): number {
  const targetArtists = targetArtistsStr
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

  let hits = 0;
  for (const s of sourceArtists) {
    const ns = normalize(s);
    if (targetArtists.some((a) => normalize(a) === ns)) hits++;
  }
  return hits / Math.max(sourceArtists.length, 1);
}

interface SourceTrack {
  title: string;
  artist?: string;
  duration?: number; // in seconds
}

interface SearchCandidate {
  id?: string;
  songId?: string;
  title?: string;
  name?: string;
  primaryArtists?: string;
  music?: string;
  singers?: string;
  artist?: string;
  artists?: Array<{ name?: string; role?: string }> | string;
  duration?: string | number;
}

/**
 * Extract artist names from various formats
 */
function extractArtistString(candidate: SearchCandidate): string {
  // Handle artists array (from Saavn search API)
  if (Array.isArray(candidate.artists)) {
    const artistNames = candidate.artists
      .filter((a) => a.role === 'singer' || a.role === 'music')
      .map((a) => a.name)
      .filter(Boolean);
    if (artistNames.length > 0) {
      return artistNames.join(', ');
    }
    // Fallback: include all artists
    return candidate.artists.map((a) => a.name).filter(Boolean).join(', ');
  }
  
  // Handle string formats
  return candidate.primaryArtists || candidate.music || candidate.singers || candidate.artist || '';
}

/**
 * Score a candidate song against source track
 * Returns 0..1 score with weighted components:
 * - Title: 55%
 * - Artist: 30%
 * - Duration: 15%
 */
export function scoreCandidate(source: SourceTrack, candidate: SearchCandidate): number {
  const titleScore = similarity(
    source.title,
    candidate.title || candidate.name || ''
  );

  // Parse source artists (split by comma or & or feat)
  const sourceArtists = (source.artist || '')
    .split(/[,&]|feat\.?/i)
    .map((s) => s.trim())
    .filter(Boolean);

  // Extract artist string from candidate (handles both array and string formats)
  const candidateArtistStr = extractArtistString(candidate);
  
  const artistScore = artistMatchScore(sourceArtists, candidateArtistStr);

  // Duration difference penalty
  const durSource = (source.duration || 0) * 1000; // convert to ms
  const durCandidate =
    typeof candidate.duration === 'number'
      ? candidate.duration * 1000
      : parseInt(candidate.duration || '0', 10) * 1000;

  let durationScore = 0.5; // neutral baseline
  if (durSource && durCandidate) {
    const diff = Math.abs(durSource - durCandidate);
    const ratio = diff / Math.max(durSource, 1);
    durationScore = Math.max(0, 1 - ratio); // linear decay
  }

  return titleScore * 0.55 + artistScore * 0.3 + durationScore * 0.15;
}

/**
 * Find the best matching candidate from search results
 * Returns the candidate with highest score above threshold
 */
export function findBestMatch(
  source: SourceTrack,
  candidates: SearchCandidate[],
  minScore: number = 0.4
): { match: SearchCandidate | null; score: number } {
  let best: SearchCandidate | null = null;
  let bestScore = -1;

  for (const cand of candidates) {
    const score = scoreCandidate(source, cand);
    if (score > bestScore) {
      bestScore = score;
      best = cand;
    }
  }

  if (bestScore < minScore) {
    return { match: null, score: bestScore };
  }

  return { match: best, score: bestScore };
}

/**
 * Clean a song title for better search matching
 */
export function cleanTitle(title: string): string {
  return title
    .replace(/-\s*from\s+"[^"]+"/i, '')        // Remove "- from "Movie""
    .replace(/\(.*?version\)/gi, '')            // Remove "(version)"
    .replace(/\[.*?\]/g, '')                    // Remove [brackets]
    .replace(/"|"|"/g, '')                      // Remove smart quotes
    .replace(/-\s*remix.*/i, '')                // Remove "- remix..."
    .replace(/feat\..*/i, '')                   // Remove "feat..."
    .replace(/\s+/g, ' ')                       // Collapse whitespace
    .trim();
}
