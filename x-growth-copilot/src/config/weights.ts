import type { HeadScores } from "../scoring/types.js";

/**
 * Composite weights, shaped like the algorithm's weighted scorer:
 * positive heads add, risk heads subtract. xAI withheld the real values
 * (the params module is not in the open-source release), so these are
 * editorial defaults — tune freely, the shape is what's faithful.
 */
export const HEAD_WEIGHTS: Record<keyof HeadScores, number> = {
  hook: 1.0,
  dwell: 0.9,
  reply: 0.9,
  repost: 0.7,
  dm_share: 0.8,
  profile_click: 0.5,
  media: 0.3,
  negative_reaction: -1.2,
  slop: -1.0,
  muted_keyword: -0.5,
  brand_safety: -0.6,
};

/** Video must exceed a minimum duration for the VQV head to activate at all. */
export const MIN_VIDEO_SECONDS = 10;
