import { describe, expect, it } from "vitest";
import { analyzeDraft } from "../src/scoring/heuristics.js";

describe("analyzeDraft", () => {
  it("rewards a strong utility post", () => {
    const report = analyzeDraft({
      text: [
        "I analyzed 500 viral posts to find what actually works.",
        "",
        "5 patterns showed up every time:",
        "1. Open with the payoff",
        "2. One idea per line",
        "3. Numbers beat adjectives",
        "4. End with a question",
        "5. No hashtags",
        "",
        "Which one do you disagree with?",
      ].join("\n"),
    });
    expect(report.composite).toBeGreaterThan(60);
    expect(report.scores.hook).toBeGreaterThan(60);
    expect(report.scores.dm_share).toBeGreaterThan(50);
    expect(report.scores.reply).toBeGreaterThan(40);
    expect(report.scores.slop).toBe(0);
  });

  it("flags engagement bait as slop", () => {
    const report = analyzeDraft({
      text: "Like this if you agree! Retweet to spread the word! Follow me for more! #growth #hustle #mindset",
    });
    expect(report.scores.slop).toBeGreaterThanOrEqual(60);
    expect(report.findings.some((f) => f.head === "slop" && f.level === "bad")).toBe(
      true,
    );
    expect(report.composite).toBeLessThan(40);
  });

  it("flags rage bait as negative-reaction risk", () => {
    const report = analyzeDraft({
      text: "If you still use this framework you're an idiot. Wake up people. Fight me.",
    });
    expect(report.scores.negative_reaction).toBeGreaterThanOrEqual(50);
  });

  it("flags commonly muted keywords", () => {
    const report = analyzeDraft({
      text: "Huge giveaway! Join our crypto presale and mint your NFT today.",
    });
    expect(report.scores.muted_keyword).toBeGreaterThanOrEqual(90);
  });

  it("penalizes weak throat-clearing openers", () => {
    const strong = analyzeDraft({ text: "Nobody talks about the real cost of microservices. Here it is." });
    const weak = analyzeDraft({ text: "So today I wanted to share some thoughts about microservices." });
    expect(strong.scores.hook).toBeGreaterThan(weak.scores.hook);
  });

  it("gates the video head on minimum duration", () => {
    const short = analyzeDraft({ text: "New demo of the app.", videoSeconds: 5 });
    const long = analyzeDraft({ text: "New demo of the app.", videoSeconds: 45 });
    expect(long.scores.media).toBeGreaterThan(short.scores.media);
    expect(
      short.findings.some((f) => f.head === "media" && f.level === "warn"),
    ).toBe(true);
  });

  it("keeps risk heads at zero for clean text", () => {
    const report = analyzeDraft({
      text: "The fastest way to learn a codebase: read the tests first. They show you what the authors actually cared about.",
    });
    expect(report.scores.slop).toBe(0);
    expect(report.scores.negative_reaction).toBe(0);
    expect(report.scores.muted_keyword).toBe(0);
    expect(report.scores.brand_safety).toBe(0);
  });
});
