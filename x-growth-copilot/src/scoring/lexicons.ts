/**
 * Pattern lexicons for the risk heads. The Grox judge prompts were withheld
 * from the open-source release, so these encode the *observable* pattern
 * classes: engagement-bait (slop), rage-bait (negative reaction heads),
 * commonly-muted keywords, and brand-safety-adjacent phrasing.
 */

/** Engagement-bait phrasing the Grox slop screen exists to catch. */
export const SLOP_PATTERNS: RegExp[] = [
  /\blike (?:this |and )?(?:if|for)\b/i,
  /\b(?:rt|retweet|repost) (?:this |and )?(?:if|for|to)\b/i,
  /\bfollow (?:me|us|for more|back)\b/i,
  /\bcomment below\b/i,
  /\bwho(?:'s| is) with me\b/i,
  /\btag (?:a|your|someone)\b/i,
  /\bdrop a\b/i,
  /\bsmash that\b/i,
  /\bturn on notifications\b/i,
  /\bdon'?t scroll\b/i,
  /\byou won'?t believe\b/i,
  /\bthis will blow your mind\b/i,
  /\b100% guaranteed\b/i,
  /\bwant (?:the|my) (?:free|full)\b.*\b(?:dm|comment|reply)\b/i,
  /\b(?:dm|comment|reply) ["'“”]?\w+["'“”]? (?:and|to) (?:i'?ll|get|receive)\b/i,
];

/** Rage-bait / dunk framing that feeds the block/mute/report/not-interested heads. */
export const RAGE_PATTERNS: RegExp[] = [
  /\b(?:idiots?|morons?|stupid people|clowns?)\b/i,
  /\bif you (?:still|actually) (?:believe|think|use)\b.*\byou(?:'re| are)\b/i,
  /\beveryone who \w+s? is\b/i,
  /\bwake up,? (?:people|sheeple)\b/i,
  /\bunpopular opinion\b/i,
  /\bhot take\b/i,
  /\bi said what i said\b/i,
  /\bfight me\b/i,
  /\bratio(?:'d|ed)?\b/i,
];

/**
 * Words commonly present in user muted-keyword lists. The MutedKeywordFilter
 * removes the post from every viewer who muted a matching token — a silent
 * per-viewer reach cap.
 */
export const COMMONLY_MUTED: string[] = [
  "giveaway",
  "airdrop",
  "whitelist",
  "mint",
  "nft",
  "crypto",
  "presale",
  "pump",
  "moon",
  "lambo",
  "onlyfans",
  "trump",
  "biden",
  "maga",
  "woke",
  "spoiler",
  "spoilers",
  "gofundme",
  "sponsored",
  "ad:",
  "promo",
  "discount code",
  "link in bio",
];

/**
 * Phrasing that risks NSFW/gore/violence-adjacent safety labels. A post that
 * reads borderline gets a MediumRisk brand-safety verdict — never shown next
 * to ads and demoted from safe-slot placement even when not removed.
 */
export const BRAND_SAFETY_PATTERNS: RegExp[] = [
  /\b(?:kill(?:ed|ing)?|murder(?:ed)?|slaughter(?:ed)?)\b/i,
  /\b(?:blood(?:y|bath)?|gore|corpse)\b/i,
  /\b(?:nsfw|18\+|onlyfans)\b/i,
  /\b(?:bomb(?:ing|ed)?|shoot(?:ing|er)?|massacre)\b/i,
  /\b(?:suicide|self[- ]harm)\b/i,
];

/** First-word openers that historically read as low-hook (throat-clearing). */
export const WEAK_OPENERS: RegExp[] = [
  /^(?:so|well|okay|ok|um|just|i just|today i|recently)\b/i,
  /^(?:gm|good morning|happy \w+day)\b/i,
  /^i (?:think|feel|guess|wanted to)\b/i,
];

/** Strong opener shapes: number, question, direct address, bold claim, contrast. */
export const STRONG_OPENERS: RegExp[] = [
  /^\d+/,
  /^(?:how|why|what|when|which|who|where)\b/i,
  /^(?:you|your)\b/i,
  /^(?:stop|never|always|most|nobody|everyone|everything)\b/i,
  /^(?:the (?:one|only|real|hidden|biggest))\b/i,
  /^(?:unpopular|controversial)?\s*truth\b/i,
  /^(?:i spent|i analyzed|i read|i built|i tested|after \d)/i,
];

/** Utility/save markers that feed the share-via-DM head. */
export const UTILITY_MARKERS: RegExp[] = [
  /\bhow to\b/i,
  /\bstep[- ]by[- ]step\b/i,
  /\bguide\b/i,
  /\bchecklist\b/i,
  /\btemplate\b/i,
  /\bframework\b/i,
  /\btools?\b/i,
  /\bresources?\b/i,
  /\btips?\b/i,
  /\bmistakes?\b/i,
  /\blessons?\b/i,
  /\bsave this\b/i,
  /\bbookmark\b/i,
  /^\s*(?:\d+[.)]|[-•·▸])\s+/m,
];

/** Conversation-opening shapes that feed the reply head. */
export const REPLY_TRIGGERS: RegExp[] = [
  /\?\s*$/m,
  /\bwhat(?:'s| is) your\b/i,
  /\bam i (?:wrong|missing something)\b/i,
  /\bchange my mind\b/i,
  /\bagree or disagree\b/i,
  /\bwhich (?:one|of these)\b/i,
  /\bwrong answers only\b/i,
  /\bcurious (?:what|how|if)\b/i,
  /\banyone else\b/i,
  /\bwhat would you\b/i,
];
