# X Growth Copilot

Score and rewrite X (Twitter) posts against the mechanics of the open-sourced
[For You algorithm](https://github.com/xai-org/x-algorithm) — driven entirely by
your Claude Code subscription. No API key, no server.

## How it works

Two parts:

1. **Deterministic scorer** (this package): models the algorithm's prediction
   heads — hook (anti scroll-past), dwell, reply, repost, DM-share,
   profile-click/follow, media — plus the risk heads: negative-reaction
   (block/mute/report), slop (Grok's engagement-bait screen), muted-keyword
   exposure, and brand-safety. Outputs per-head scores, a weighted composite
   (same Σ weight × P shape as the real ranker), and concrete findings.

2. **The `tweet-optimizer` skill** (`.claude/skills/tweet-optimizer/`): Claude
   Code acts as the Grok-style quality judge and the rewriter. Give it a draft
   or a topic; it scores, writes 3 human-voiced variants, re-scores each, and
   iterates until they pass the quality gates.

Why these heads and gates: see `../docs/x-algorithm-virality-playbook.md`.

## Usage

In Claude Code, from this repo:

```
/tweet-optimizer just shipped dark mode for my music app, want to post about it
```

or paste a draft to fix:

```
/tweet-optimizer So today I wanted to share some thoughts about why consistency matters...
```

### Direct CLI

```bash
npm install
npm run analyze -- "your draft text"            # pretty report
npm run analyze -- --json "your draft text"     # machine-readable
npm run analyze -- --image "text"               # post will carry an image
npm run analyze -- --video 45 "text"            # post will carry a 45s video
```

## Honest limits

- Scores are *engineering estimates* of how well a draft feeds each prediction
  head — not the model's real probabilities (those depend on your author
  embedding and each viewer's history, which nothing outside X can see).
- xAI withheld the real head weights; `src/config/weights.ts` is the tunable
  stand-in with the correct positive/negative structure.
- Nothing here automates engagement. That category is both against X ToS and
  mechanically detected by the very pipeline this models — it destroys the
  author embedding you're trying to build.

## Development

```bash
npm test          # vitest suite for the scoring engine
npm run typecheck
```
