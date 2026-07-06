import { analyzeDraft } from "./scoring/heuristics.js";
import type { AnalysisReport, DraftContext, HeadScores } from "./scoring/types.js";

/**
 * CLI scorer. Usage:
 *   npm run analyze -- "draft text"            pretty report
 *   npm run analyze -- --json "draft text"     JSON report
 *   echo "draft" | npm run analyze -- --json   read from stdin
 * Flags: --image, --video <seconds>
 */

interface CliArgs {
  json: boolean;
  ctx: DraftContext;
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) chunks.push(chunk as Buffer);
  return Buffer.concat(chunks).toString("utf8");
}

async function parseArgs(argv: string[]): Promise<CliArgs> {
  let json = false;
  let hasImage = false;
  let videoSeconds: number | undefined;
  const textParts: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--json") json = true;
    else if (a === "--image") hasImage = true;
    else if (a === "--video") videoSeconds = Number(argv[++i]);
    else textParts.push(a);
  }

  let text = textParts.join(" ").trim();
  if (!text) text = (await readStdin()).trim();
  if (!text) {
    console.error('No draft provided. Pass text as an argument or via stdin.');
    process.exit(2);
  }
  return { json, ctx: { text, hasImage, videoSeconds } };
}

const POSITIVE: (keyof HeadScores)[] = [
  "hook",
  "dwell",
  "reply",
  "repost",
  "dm_share",
  "profile_click",
  "media",
];
const RISKS: (keyof HeadScores)[] = [
  "negative_reaction",
  "slop",
  "muted_keyword",
  "brand_safety",
];

function bar(score: number): string {
  const filled = Math.round(score / 5);
  return "█".repeat(filled) + "░".repeat(20 - filled);
}

function pretty(report: AnalysisReport): string {
  const out: string[] = [];
  out.push(`Composite: ${report.composite}/100`);
  out.push("");
  out.push("Positive heads (higher is better):");
  for (const h of POSITIVE) {
    out.push(`  ${h.padEnd(16)} ${bar(report.scores[h])} ${report.scores[h]}`);
  }
  out.push("Risk heads (lower is better):");
  for (const h of RISKS) {
    out.push(`  ${h.padEnd(16)} ${bar(report.scores[h])} ${report.scores[h]}`);
  }
  out.push("");
  if (report.findings.length > 0) {
    out.push("Findings:");
    for (const f of report.findings) {
      const icon = f.level === "good" ? "+" : f.level === "warn" ? "!" : "x";
      out.push(`  [${icon}] (${f.head}) ${f.message}`);
      if (f.suggestion) out.push(`      → ${f.suggestion}`);
    }
  }
  const s = report.stats;
  out.push("");
  out.push(
    `Stats: ${s.chars} chars, ${s.words} words, ${s.lines} lines, ` +
      `${s.hashtags} hashtags, ${s.links} links, ${s.emoji} emoji, ${s.questions} questions`,
  );
  return out.join("\n");
}

const { json, ctx } = await parseArgs(process.argv.slice(2));
const report = analyzeDraft(ctx);
console.log(json ? JSON.stringify(report, null, 2) : pretty(report));
