import { HEAD_WEIGHTS, MIN_VIDEO_SECONDS } from "../config/weights.js";
import {
  BRAND_SAFETY_PATTERNS,
  COMMONLY_MUTED,
  RAGE_PATTERNS,
  REPLY_TRIGGERS,
  SLOP_PATTERNS,
  STRONG_OPENERS,
  UTILITY_MARKERS,
  WEAK_OPENERS,
} from "./lexicons.js";
import type {
  AnalysisReport,
  DraftContext,
  Finding,
  HeadScores,
} from "./types.js";

const clamp = (n: number) => Math.max(0, Math.min(100, Math.round(n)));

const countMatches = (text: string, patterns: RegExp[]) =>
  patterns.filter((p) => p.test(text)).length;

function textStats(text: string) {
  const lines = text.split("\n").filter((l) => l.trim().length > 0);
  const words = text.split(/\s+/).filter(Boolean);
  const emoji =
    text.match(/\p{Extended_Pictographic}/gu)?.length ?? 0;
  return {
    chars: text.length,
    words: words.length,
    lines: lines.length,
    hashtags: (text.match(/#\w+/g) ?? []).length,
    mentions: (text.match(/@\w+/g) ?? []).length,
    links: (text.match(/https?:\/\/\S+/g) ?? []).length,
    emoji,
    questions: (text.match(/\?/g) ?? []).length,
  };
}

/**
 * Deterministic per-head scoring of a draft. This is the offline model of the
 * algorithm's prediction heads — the LLM judge refines it, but this always
 * works without an API key.
 */
export function analyzeDraft(ctx: DraftContext): AnalysisReport {
  const text = ctx.text.trim();
  const stats = textStats(text);
  const findings: Finding[] = [];
  const firstLine = (text.split("\n")[0] ?? "").trim();

  // --- hook (anti not_dwelled) ---
  let hook = 50;
  if (STRONG_OPENERS.some((p) => p.test(firstLine))) {
    hook += 25;
    findings.push({
      head: "hook",
      level: "good",
      message: "First line uses a strong opener shape (number/question/claim).",
    });
  }
  if (WEAK_OPENERS.some((p) => p.test(firstLine))) {
    hook -= 25;
    findings.push({
      head: "hook",
      level: "bad",
      message: "First line starts with throat-clearing.",
      suggestion:
        "Cut the warm-up. Open with the payoff, a number, or a question — not_dwelled (scroll-past) is a negatively weighted head.",
    });
  }
  if (/^https?:\/\//.test(firstLine) || /^#/.test(firstLine)) {
    hook -= 20;
    findings.push({
      head: "hook",
      level: "bad",
      message: "Post opens with a link or hashtag.",
      suggestion: "Lead with the idea; move links to the end or a reply.",
    });
  }
  const firstWords = firstLine.split(/\s+/).length;
  if (firstWords > 0 && firstWords <= 12 && stats.lines > 1) {
    hook += 10; // punchy standalone first line
  }

  // --- dwell ---
  let dwell = 40;
  if (stats.chars >= 120 && stats.chars <= 280) dwell += 20;
  else if (stats.chars > 280) dwell += 25; // long-form sustains dwell_time
  else if (stats.chars < 60) {
    dwell -= 15;
    findings.push({
      head: "dwell",
      level: "warn",
      message: `Very short post (${stats.chars} chars).`,
      suggestion:
        "dwell_time is the only continuous signal the model tracks. One-liners must be exceptional; otherwise add substance worth reading.",
    });
  }
  if (stats.lines >= 3) {
    dwell += 15;
    findings.push({
      head: "dwell",
      level: "good",
      message: "Line breaks create a scannable rhythm that sustains dwell.",
    });
  }

  // --- reply ---
  const replyHits = countMatches(text, REPLY_TRIGGERS);
  let reply = 30 + replyHits * 20;
  if (replyHits > 0) {
    findings.push({
      head: "reply",
      level: "good",
      message: "Contains a genuine conversation opener.",
    });
  } else {
    findings.push({
      head: "reply",
      level: "warn",
      message: "Nothing invites a reply.",
      suggestion:
        "P(reply) is a top positive head. End with an open question or a defensible take people will want to answer.",
    });
  }

  // --- repost / quote ---
  let repost = 35;
  const quotable =
    stats.lines > 1 &&
    text
      .split("\n")
      .some((l) => l.trim().length > 0 && l.trim().length <= 90 && !l.includes("http"));
  if (quotable) repost += 15;
  if (/\b(?:\d+%|\$\d|\d+x)\b/.test(text)) {
    repost += 15;
    findings.push({
      head: "repost",
      level: "good",
      message: "Concrete numbers make it citable — quote/repost fuel.",
    });
  }

  // --- dm_share (utility) ---
  const utilityHits = countMatches(text, UTILITY_MARKERS);
  const listItems = (text.match(/^\s*(?:\d+[.)]|[-•·▸])\s+/gm) ?? []).length;
  let dm_share = 25 + utilityHits * 15 + (listItems >= 3 ? 15 : 0);
  if (utilityHits >= 2) {
    findings.push({
      head: "dm_share",
      level: "good",
      message:
        "Utility framing (how-to/list/tool) — share-via-DM has its own positive head.",
    });
  }

  // --- profile_click / follow ---
  let profile_click = 40;
  if (
    /\b(?:i built|i made|i grew|i wrote|i analyzed|i tested|i shipped|i spent|my (?:approach|system|process))\b/i.test(
      text,
    )
  ) {
    profile_click += 20;
    findings.push({
      head: "profile_click",
      level: "good",
      message:
        "First-person authority claim — drives profile clicks, and P(follow_author) is directly rewarded.",
    });
  }
  if (/\bfollow (?:me|us|for more)\b/i.test(text)) {
    profile_click -= 15; // explicit begging is slop, handled below too
  }

  // --- media ---
  let media = 30;
  if (ctx.hasImage) {
    media += 30;
    findings.push({
      head: "media",
      level: "good",
      message: "Image attached — photo_expand is a scored head.",
    });
  }
  if (ctx.videoSeconds !== undefined) {
    if (ctx.videoSeconds >= MIN_VIDEO_SECONDS) {
      media += 40;
      findings.push({
        head: "media",
        level: "good",
        message: `Video ≥ ${MIN_VIDEO_SECONDS}s — eligible for the video-quality-view head.`,
      });
    } else {
      findings.push({
        head: "media",
        level: "warn",
        message: `Video under ${MIN_VIDEO_SECONDS}s forfeits the VQV head entirely.`,
        suggestion: "Lengthen the video past the minimum duration or drop it.",
      });
    }
  }

  // --- negative_reaction risk ---
  const rageHits = countMatches(text, RAGE_PATTERNS);
  let negative_reaction = rageHits * 25;
  const capsWords = (text.match(/\b[A-Z]{4,}\b/g) ?? []).length;
  if (capsWords >= 3) negative_reaction += 15;
  if (rageHits > 0) {
    findings.push({
      head: "negative_reaction",
      level: "bad",
      message: "Rage-bait framing detected.",
      suggestion:
        "The model predicts who would block/mute/report you and suppresses delivery to them preemptively — dunks reach your fans but never expand.",
    });
  }

  // --- slop risk ---
  const slopHits = countMatches(text, SLOP_PATTERNS);
  let slop = slopHits * 30;
  if (stats.hashtags > 2) {
    slop += 15;
    findings.push({
      head: "slop",
      level: "warn",
      message: `${stats.hashtags} hashtags reads as spam-era optimization.`,
      suggestion:
        "The ranker never sees hashtags — the model reads no text at all. Keep 0-1 for humans, not the algorithm.",
    });
  }
  if (stats.emoji > 6) slop += 15;
  if (slopHits > 0) {
    findings.push({
      head: "slop",
      level: "bad",
      message: "Engagement-bait phrasing detected.",
      suggestion:
        "Once the post gets traction a Grok judge scores quality/slop. Bait phrasing risks a slop label; earn the action instead of asking for it.",
    });
  }

  // --- muted_keyword risk ---
  const lower = text.toLowerCase();
  const mutedHits = COMMONLY_MUTED.filter((w) => lower.includes(w));
  const muted_keyword = Math.min(100, mutedHits.length * 30);
  if (mutedHits.length > 0) {
    findings.push({
      head: "muted_keyword",
      level: "warn",
      message: `Contains commonly muted terms: ${mutedHits.join(", ")}.`,
      suggestion:
        "Every viewer who muted one of these tokens silently never sees the post. Rephrase if the term isn't load-bearing.",
    });
  }

  // --- brand_safety risk ---
  const bsHits = countMatches(text, BRAND_SAFETY_PATTERNS);
  const brand_safety = Math.min(100, bsHits * 35);
  if (bsHits > 0) {
    findings.push({
      head: "brand_safety",
      level: "warn",
      message: "Phrasing may trip safety/brand-safety classifiers.",
      suggestion:
        "Borderline posts get a MediumRisk verdict: excluded from ad-adjacent slots and demoted from safe placement even when not removed.",
    });
  }

  // --- link placement (affects click vs dwell tradeoff) ---
  if (stats.links > 0) {
    findings.push({
      head: "dwell",
      level: "warn",
      message: "Contains an external link.",
      suggestion:
        "Links divert the click head but often end dwell. Consider the link in a reply so the post itself carries the dwell.",
    });
  }

  const scores: HeadScores = {
    hook: clamp(hook),
    dwell: clamp(dwell),
    reply: clamp(reply),
    repost: clamp(repost),
    dm_share: clamp(dm_share),
    profile_click: clamp(profile_click),
    media: clamp(media),
    negative_reaction: clamp(negative_reaction),
    slop: clamp(slop),
    muted_keyword: clamp(muted_keyword),
    brand_safety: clamp(brand_safety),
  };

  const hasMedia = ctx.hasImage === true || ctx.videoSeconds !== undefined;
  return { scores, composite: composite(scores, hasMedia), findings, stats };
}

/**
 * Weighted composite mirroring the algorithm's Σ(weight × P) shape, 0-100.
 * Like the real ranker — where text posts simply lack the VQV/photo terms
 * rather than being penalized for them — the media head only enters the
 * composite when the post actually carries media.
 */
export function composite(scores: HeadScores, includeMedia = true): number {
  let positive = 0;
  let positiveMax = 0;
  let penalty = 0;
  for (const [head, weight] of Object.entries(HEAD_WEIGHTS) as [
    keyof HeadScores,
    number,
  ][]) {
    if (head === "media" && !includeMedia) continue;
    if (weight >= 0) {
      positive += scores[head] * weight;
      positiveMax += 100 * weight;
    } else {
      penalty += scores[head] * -weight;
    }
  }
  const raw = (positive / positiveMax) * 100 - (penalty / positiveMax) * 100;
  return clamp(raw);
}
