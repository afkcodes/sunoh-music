/**
 * The prediction heads mirror xai-org/x-algorithm's PhoenixScores
 * (home-mixer/scorers/ranking_scorer.rs). We model proxies for each head a
 * draft can influence at writing time. Scores are 0-100 estimates of how well
 * the draft is engineered for that head — not calibrated probabilities.
 */
export type PositiveHead =
  | "hook" // anti not_dwelled: does the first line stop the scroll
  | "dwell" // dwell + dwell_time: does the body hold attention
  | "reply" // P(reply): does it open a conversation
  | "repost" // P(retweet)+P(quote): is it shareable-in-public
  | "dm_share" // P(share_via_dm)+P(share): is it send-to-a-friend material
  | "profile_click" // P(profile_click)+P(follow_author): curiosity about the author
  | "media"; // photo_expand / video-quality-view eligibility

export type RiskHead =
  | "negative_reaction" // P(not_interested)+P(block)+P(mute)+P(report)
  | "slop" // Grox banger/slop screen risk
  | "muted_keyword" // reach silently capped by common muted words
  | "brand_safety"; // MediumRisk verdict risk (loses safe-slot placement)

export type Head = PositiveHead | RiskHead;

export interface Finding {
  head: Head;
  level: "good" | "warn" | "bad";
  message: string;
  suggestion?: string;
}

export interface DraftContext {
  text: string;
  hasImage?: boolean;
  /** Video length in seconds, if the post will carry a video. */
  videoSeconds?: number;
  /** Optional niche/topic the account posts in, used by the LLM stages. */
  niche?: string;
}

export interface HeadScores {
  hook: number;
  dwell: number;
  reply: number;
  repost: number;
  dm_share: number;
  profile_click: number;
  media: number;
  negative_reaction: number; // higher = MORE risk
  slop: number; // higher = MORE risk
  muted_keyword: number; // higher = MORE risk
  brand_safety: number; // higher = MORE risk
}

export interface AnalysisReport {
  scores: HeadScores;
  /** Weighted composite, 0-100. Mirrors Σ(w·P) − Σ(w·P_negative). */
  composite: number;
  findings: Finding[];
  stats: {
    chars: number;
    words: number;
    lines: number;
    hashtags: number;
    mentions: number;
    links: number;
    emoji: number;
    questions: number;
  };
}
