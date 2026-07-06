# Decoding the X "For You" Algorithm — Virality Playbook & App Blueprint

Source analyzed: [github.com/xai-org/x-algorithm](https://github.com/xai-org/x-algorithm) (May 15, 2026 release).
All file references below point into that repo. Facts are grounded in code; inferences are marked.

> **Honest caveat up front:** xAI redacted the tuning. The `params`, `util`, `clients`, and
> `grox/prompts` modules referenced everywhere in the code are **not in the release**, so the
> exact weight values (how much a reply is worth vs. a like), age cutoffs, and the Grok judge
> prompts are withheld. What IS fully public: the complete list of signals, the scoring formula
> shape, every filter, the distribution mechanics, and the content-quality pipeline. That is
> more than enough to reverse-engineer strategy — just don't trust anyone selling "exact X
> algorithm weights"; they don't exist publicly.

---

## 1. TL;DR — the 10 facts that matter most

1. **The ranking model never reads your post.** A post enters the ranker as: hashed post ID + hashed author ID + post age + product surface. No text, no hashtags, no keywords, no media features, no follower count (`phoenix/recsys_model.py:126-144`). Everything it "knows" is learned from *who engages with the post and with you* in near-real-time.
2. **Your author embedding is your reputation.** Since new posts have no learned embedding yet, the dominant transferable signal for a fresh post is the author-ID embedding — the engagement identity you accumulated across all past posts. Consistent engagement in one lane compounds; erratic content dilutes it.
3. **Final score = Σ (weight × P(action))** across ~20 predicted actions. Positives: favorite, reply, repost, quote, click, profile click, photo expand, video quality view, share, share-via-DM, share-via-copy-link, dwell, follow-author. Negatives: not-interested, block, mute, report, and **not-dwelled** (`home-mixer/scorers/ranking_scorer.rs:146-170`).
4. **Scroll-past is a negative signal.** `not_dwelled` has its own negative weight, and dwell time is the *only* continuous behavioral signal in user history (`phoenix/recsys_model.py:557`). Hooking the reader in the first line is a scoring event, not just a writing tip.
5. **Predicted follows are directly rewarded.** `follow_author_score` is a positive scoring head — the algorithm literally optimizes for showing your post to people likely to follow you.
6. **In-network reach dies in ~48h and is recency-sorted.** Thunder (followers' feeds) stores ~2 days of posts and sorts purely by recency — zero engagement ranking at the source (`thunder/posts/post_store.rs:521-526`, `thunder_service.rs:333-339`). The ranker distinguishes post age hourly up to **80 hours**, then everything is just "old" (`phoenix/recsys_model.py:33`).
7. **Author diversity decay:** your 2nd, 3rd… post in one feed load gets exponentially attenuated (`(1-floor)·decay^n + floor`). Spamming posts cannibalizes your own slots (`ranking_scorer.rs:186-217`).
8. **Grok is the quality judge.** Once a post hits minimum traction, a Grok VLM scores it: quality ("banger" threshold ≥ 0.4), slop score 1–3, NSFW/gore/violent/spam booleans, topics, tags, description (`grox/classifiers/content/banger_initial_screen.py`). Verdicts auto-apply moderation labels with no human in the loop.
9. **Unscored = penalized.** A post with no Grok verdict defaults to MediumRisk brand safety, and posts newer than a cutoff need a `PTOS_REVIEWED` label to do better (`home-mixer/models/brand_safety.rs:47-55`). Media-risky content silently loses good feed positions (ad-adjacent slots) even when not removed.
10. **Replies are second-class in-network** — they only surface near the top of threads within your follow graph (`post_store.rs:291-315`) — **but replies to big accounts get an LLM quality score 0–3**, and a 0 gets auto-labeled spam (`grox/tasks/task_pub.py:463-487`). High-quality replies under large accounts are a sanctioned discovery channel; low-effort ones are actively punished.

---

## 2. System architecture (what happens when a feed loads)

```
Request → Query hydration (your engagement history, follows, topics, seen-posts bloom filter)
        → Candidate sources (parallel):
            • Thunder        — recent posts from accounts you follow (in-network, recency only)
            • Phoenix        — ML retrieval from global corpus (out-of-network, two-tower)
            • Phoenix MoE    — second retrieval against a Mixture-of-Experts cluster
            • Phoenix Topics — topic-driven retrieval (new users / topic requests)
            • TweetMixer     — legacy recommender
        → Hydration (author info, engagement counts, media, topics, safety labels)
        → 14 eligibility filters (age, seen, muted, blocked, dupes…)
        → Scoring: Phoenix transformer → weighted sum → author-diversity decay → OON multiplier
        → Optional VMRanker (value model + DPP diversity re-rank)
        → Top-K selection → visibility filtering → conversation dedup
        → Blending (ads, Who-to-Follow, prompts) → feed
```

Key structural facts:

- **No in-network/out-of-network quota exists.** Everything competes in one ranked pool; OON posts just get a score multiplier (`OonWeightFactor`, value withheld). New users (young account + minimum follows) get a special `NEW_USER_OON_WEIGHT_FACTOR` (`ranking_scorer.rs:220-239`).
- **Candidate isolation:** each candidate is scored independently of the other candidates in the batch (attention masking, `phoenix/grok.py:39-71`). You compete at the sort, not inside the model.
- **Results are cached ~3 minutes** per user (Redis, TTL 180s, ≥500 posts triggers cache-serving mode) — rapid refreshes re-rank the same pool (`redis_post_candidate_cache_side_effect.rs`).
- **Served history:** last 50 responses tracked; anything you were already shown is filtered out via client seen-IDs, a server-side impression bloom filter, and a served-history store. **One impression per user per post** — you rarely get a second chance at the same viewer.

---

## 3. The scoring formula, decoded

```
weighted_score = w_fav·P(fav) + w_reply·P(reply) + w_repost·P(repost) + w_quote·P(quote)
              + w_click·P(click) + w_profile_click·P(profile_click) + w_photo·P(photo_expand)
              + w_vqv·P(video_quality_view)            # only if video ≥ min duration
              + w_share·P(share) + w_dm·P(share_via_dm) + w_link·P(share_via_copy_link)
              + w_dwell·P(dwell) + w_dwell_time·E[dwell_seconds]
              + w_follow·P(follow_author)
              − w_ni·P(not_interested) − w_block·P(block) − w_mute·P(mute)
              − w_report·P(report) − w_nd·P(not_dwelled)

final = normalize(weighted_score) × diversity_decay(author, position) × oon_factor(if OON)
```

(`home-mixer/scorers/ranking_scorer.rs:146-183`; head list `phoenix/runners.py:233-253`)

What this implies:

- **Shares are tracked in three separate flavors** (native share, share via DM, copy link). DM-shares are a distinct head — "content people send to a friend" is its own optimization target. The demo pipeline weights in `run_pipeline.py:355-361` (fav 1.0, reply 0.5, repost 0.3, dwell 0.2) are illustrative only, but they demonstrate the mechanism.
- **Video has a dedicated head (VQV)** that only activates above a minimum duration (`MIN_VIDEO_DURATION_MS`, value withheld; Thunder ingests "video posts" into a dedicated store only when duration qualifies). Ultra-short videos forfeit the VQV term entirely.
- **Profile clicks are scored.** Content that makes people check who you are contributes — and pairs with `follow_author`: curiosity → profile visit → follow is a modeled path.
- **Negative heads are predictions, not just reactions.** The model predicts *who would* block/mute/report you and suppresses delivery to them preemptively. Rage-bait reaches its fans but is choked off from expansion because the marginal audience predicts negative.

---

## 4. Distribution mechanics — the two doors into a feed

### Door 1: In-network (Thunder)
- Followers' candidate fetch is **pure recency** within ~48h retention, with per-author caps per fetch (`MAX_ORIGINAL_POSTS_PER_AUTHOR`, value withheld).
- Original posts, replies/reposts, and videos live in **separate stores**. Replies surface only if they're near the top of a thread and inside the viewer's follow graph. Your retweet of someone is deduplicated against the original.
- Implication: **followers are your guaranteed candidate pool but not guaranteed impressions** — you still must win the scoring stage against OON content in each follower's feed.

### Door 2: Out-of-network (Phoenix retrieval)
- Two-tower model: the viewer's engagement-history embedding is dot-producted against precomputed post embeddings; top-K (~200 in the demo) enter ranking (`phoenix/recsys_retrieval_model.py`).
- A post's retrieval embedding = hashed post ID + hashed author ID only. **A post becomes retrievable to a cohort because people in that cohort engaged with it (or with you) — engagement literally writes the post's address in embedding space.**
- This is the viral cascade mechanically: early engagers' cohorts determine which lookalike audiences the post is retrieved for next. Wrong early audience → embedded in the wrong neighborhood → dead cascade.
- Topic retrieval: new users and topic-followers get posts via Grok topic matching — posts carry Grok-assigned topic IDs (32-slot taxonomy), and posts **without topic data are removed** from topic-filtered requests (`topic_ids_filter.rs:95-100`).

### The cold-start ladder (inference, grounded)
A brand-new post from a small account climbs: followers see it (Thunder, recency) → their engagement trains the post embedding in near-real-time → Phoenix retrieval starts surfacing it to engagement-lookalikes → traction crosses the Grox threshold → Grok scores quality/topics → topic retrieval + brand-safe placement unlock → compounding or dying within the **80-hour freshness window**.

---

## 5. Grox — the Grok-as-judge quality layer

Every post that gains minimum traction gets an LLM verdict (`grox/`):

| Output | Detail |
|---|---|
| `quality_score` | "Banger" screen; positive at **≥ 0.4** |
| `slop_score` | 1–3; engagement-bait/low-effort detector |
| `tweet_bool_metadata` | isHighQuality, isNsfw, isSoftNsfw, isGore, isViolent, isSpam, isAdult |
| `taxonomy_categories` | topics from a live hourly-refreshed taxonomy → feeds topic retrieval |
| `tags`, `description` | searchable/embeddable content understanding |
| `has_minor_score` | child-safety screen |

- **PTOS policy stack** (7 categories: ViolentMedia, AdultContent, Spam, IllegalAndRegulatedBehaviors, HateOrAbuse, ViolentSpeech, SuicideOrSelfHarm) applies and even *removes* moderation labels autonomously.
- **Reply economy is bifurcated by target size:** replies under low-follower accounts → binary spam classifier; replies under large accounts → 0–3 quality scorer whose signals include paste-detection (`is_pasted`), user agent, app attestation, and author blocks received in 24h (`grox/tasks/task_rank_replies.py:22-28`). **Copy-pasted replies are detectably flagged to the judge.** Score 0 → auto spam label.
- **Multimodal embeddings** (text + images + video ASR transcript) are generated per post for search/retrieval — so while the *ranker* doesn't read text, the *retrieval and topic systems* absolutely understand your content, including what's said inside your video.

---

## 6. Eligibility filters — the silent reach killers

Before scoring, a post is dropped if: too old (`MAX_POST_AGE`), already seen/served (bloom filter + served history), author blocked/muted either direction, contains a viewer's muted keyword (tokenized match — a common muted word caps your audience), paywalled to non-subscribers, duplicate/retweet-dupe, or fails core-data hydration. Post-selection: visibility filtering (spam/gore/violence labels → drop, **including via a quoted or parent post** — quoting a labeled post nukes your own post via `drop_ancillary_posts`), and **conversation dedup: only the highest-scoring post per conversation survives** (`dedup_conversation_filter.rs`) — your reply competes against every other branch of the thread for a single slot.

Hydrated-but-not-model signals worth knowing: author follower buckets (<100, 100–1K, 1K–10K, 10K–100K, 100K–1M, ≥1M), mutual-follow Jaccard similarity between viewer and author (MinHash), engagement counts (cached 5–10 min), media/language flags. These feed metrics, the VMRanker value model, and brand-safety/ad blending.

---

## 7. The playbook — what actually moves the needle

Everything below is legitimate content strategy derived from the code — no fake engagement, no automation of engagement (that's exactly what Grox's spam/attestation signals catch, and it backfires mechanically).

### Content construction
1. **Optimize the dwell curve, not just the like.** First line must stop the scroll (not_dwelled is negatively weighted); body length should sustain dwell (dwell_time is the one continuous signal). Substantive posts beat one-liners on two heads at once.
2. **Build for the share-via-DM head.** "Send this to someone who…" content — practical, saveable, insider — is a separately-scored action. Utility content (guides, lists, tools) is DM-share bait by design.
3. **Ask for replies structurally, not literally.** Reply probability is a top head; posts with a genuine open loop (question, hot-but-defensible take, fill-in-the-blank) score it. But slop-y engagement bait risks slop_score 2–3 from the Grok judge.
4. **Use media deliberately.** Photos get a photo_expand head. Video only pays if it clears the minimum duration for VQV *and* retains (quality view, not just view) — and the ASR transcript is embedded, so **say your keywords out loud in videos**.
5. **Quote-posts are scored** (quoted_click, quoted_vqv heads) — quoting with added insight taps the original's momentum. But never quote borderline content: a labeled parent kills your post.
6. **Make profiles click-worthy.** profile_click and follow_author are scored heads; a sharp bio and pinned post convert the curiosity the algorithm is already rewarding.

### Timing & cadence
7. **The clock is real: hourly age buckets to 80h, in-network retention ~48h.** Post when your existing audience is awake — early engagement writes the post's retrieval embedding. A dead first hour buries the post in embedding space.
8. **Space posts hours apart.** Author-diversity decay attenuates your 2nd+ post per feed load; multiple posts in one window cannibalize each other. One strong post per feed-session window beats three mediocre ones.
9. **Never delete-and-repost to the same audience carelessly** — seen-filtering is per-post-ID; a repost is a fresh ID, but your followers who dwelt-then-skipped already trained negative signal into your author embedding for that content.

### Audience & identity
10. **Niche consistency is mechanical, not mystical.** Your author embedding is trained by who engages with you. A tight engagement cohort → clean embedding → precise lookalike retrieval. Random viral off-niche posts pollute the very vector that routes your future posts.
11. **Reply-guy strategy, executed properly, is sanctioned:** thoughtful, original, non-pasted replies under large accounts get a 0–3 Grok quality score and thread-top visibility to the big account's audience — the highest-leverage free distribution for small accounts. Pasted/templated replies are flagged (`is_pasted`) and score-0 replies are auto-labeled spam.
12. **Mutual-follow density matters.** The system computes viewer↔author mutual-follow Jaccard; engaging genuinely inside a community (follows back, mutuals) tightens that similarity for your whole cohort.
13. **Target the topic taxonomy.** Grok assigns your posts topics from a live taxonomy; topic-followers and new users are fed via topic retrieval, and topicless posts are *excluded* from those surfaces. Clear, on-topic content = an extra distribution door (and new-user feeds are follower-count-blind).

### What to avoid (mechanically punished)
14. Borderline/NSFW-ish/gore-adjacent content → brand-safety MediumRisk → excluded from ad-adjacent slots and safe-inventory placement even when not removed.
15. Rage-bait → predicted block/mute/report/not-interested chokes expansion beyond your fans.
16. Engagement-bait phrasing → slop_score; low-effort → quality < 0.4 banger threshold.
17. Muted-keyword-heavy vocabulary (crypto-spam words, politics triggers) → silently filtered for every viewer who muted them.
18. Automation fingerprints: user agent, app attestation, paste detection, and blocks-received-in-24h are fed to the judge.

---

## 8. App blueprint — "X Growth Copilot"

What an app can honestly build from this, using the public X API v2 + this algorithm knowledge:

### Core features (ranked by feasibility × value)

1. **Pre-post scorer.** Score a draft against the known heads: hook strength (not_dwelled risk), dwell potential (length/structure), reply-trigger presence, DM-shareability, media/VQV eligibility (video length check), slop/engagement-bait risk (LLM judge mimicking Grox's banger/slop screen), muted-keyword risk list, brand-safety risk. Output: per-head radar + concrete rewrite suggestions. *(An LLM with a rubric reconstructed from §7 approximates the Grok judge surprisingly well.)*
2. **Golden-window monitor.** Track each post's first 60–180 min (the embedding-writing window): impressions/engagement velocity via the API, alert when a post is outperforming → "amplify now" (reply to it with added value, pin it) or underperforming → post-mortem.
3. **Niche-coherence tracker.** Cluster the user's posts and their engagers; measure cohort consistency over time (a proxy for author-embedding cleanliness). Warn when content drifts off-lane.
4. **Reply-target finder.** Surface fresh (<1h) posts from large accounts in the user's niche where a substantive reply is possible; draft-assist with originality checks (never templates — that's the flagged pattern). This weaponizes the one sanctioned small-account distribution channel.
5. **Cadence planner.** Enforce spacing (diversity decay), schedule into the follower-activity window, respect the 48h/80h decay clocks.
6. **Topic alignment assistant.** Map drafts to X's visible topic taxonomy; flag posts likely to land topicless (losing topic-retrieval distribution).
7. **Follower-conversion audit.** Since profile_click→follow is a modeled path: score bio/pinned-post conversion, track P(follow) proxy = profile visits per impression.

### Honest limits to design around
- The API exposes impressions/likes/replies/etc., but **not** dwell, DM-shares, or the Phoenix scores — the app models proxies, it can't read the real heads.
- Weights are withheld and runtime-tunable (feature switches) — build the scorer as configurable weights, not hardcoded "truth."
- Anything that automates engagement (auto-reply, engagement pods, mass-following) is both against X ToS and *mechanically detected* by this very pipeline — the app should refuse that category; it destroys the author embedding it's trying to build.

### Suggested architecture
```
Next.js/React dashboard
  ├─ X API v2 (OAuth2): posts, metrics, timelines
  ├─ Scoring service: LLM-as-judge (banger/slop rubric) + heuristic heads
  ├─ Velocity worker: poll post metrics @5min for first 3h, then hourly to 80h
  ├─ Embedding service: cluster user's content + engager cohorts (niche coherence)
  └─ Postgres: post history, per-head scores, follower snapshots
```

---

## 9. Bottom line

The algorithm is an engagement-probability machine with a taste layer. It cannot be gamed with tricks — it has no keyword field to stuff, no hashtag lever, and its negative heads and Grok judge specifically hunt the tricks. What it *can* be systematically satisfied by: content engineered for dwell + replies + DM-shares, posted on a clock that respects the embedding-writing window, from an account whose engagement identity is coherent enough that retrieval knows exactly whom to hand your next post to. The "hack" is operational discipline around mechanics most creators don't know exist — which is exactly the gap an app can fill.
