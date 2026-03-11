#!/usr/bin/env node
import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createEchoMemClient } from "./lib/providers.js";

function help() {
  console.log(`echo-page commands:
  echo-page generate --user-id <uuid> [--output <file>]
  echo-page customize --user-id <uuid> [--layout timeline|cards] [--visibility public|friends|private] [--output <file>]
  echo-page publish --user-id <uuid> [--slug <slug>]
`);
}

async function writeJsonIfNeeded(file, data) {
  if (!file) return;
  const outPath = path.resolve(process.cwd(), file);
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, `${JSON.stringify(data, null, 2)}\n`, "utf-8");
}

function summarize(memories) {
  const emotion = new Map();
  const category = new Map();
  for (const m of memories) {
    const e = String(m.emotion || "unknown").toLowerCase();
    emotion.set(e, (emotion.get(e) || 0) + 1);
    const c = String(m.category || "unknown").toLowerCase();
    category.set(c, (category.get(c) || 0) + 1);
  }
  const sortMap = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([key, count]) => ({ key, count }));
  return { topEmotion: sortMap(emotion), topCategory: sortMap(category) };
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const client = createEchoMemClient(readConfig());
  const userId = String(flags["user-id"] || positionals[1] || "").trim();
  if (!userId) throw new Error("All commands require --user-id.");

  if (cmd === "generate") {
    const [profile, memoriesResp] = await Promise.all([client.getProfileSummary(), client.listMemories(300, 0)]);
    const page = {
      userId,
      generatedAt: new Date().toISOString(),
      profile,
      memoryCount: memoriesResp.count,
      highlights: summarize(memoriesResp.data || []),
      sampleMemories: (memoriesResp.data || []).slice(0, 24),
      privacy: {
        model: "opt-in",
        note: "Output is sanitized. Raw source content is not included by default.",
      },
    };
    await writeJsonIfNeeded(String(flags.output || "").trim(), page);
    console.log(JSON.stringify(page, null, 2));
    return;
  }

  if (cmd === "customize") {
    const output = String(flags.output || "").trim();
    const customization = {
      userId,
      updatedAt: new Date().toISOString(),
      layout: String(flags.layout || "timeline"),
      visibility: String(flags.visibility || "friends"),
      sections: {
        profile: true,
        highlights: true,
        memories: true,
      },
    };
    await writeJsonIfNeeded(output, customization);
    console.log(JSON.stringify(customization, null, 2));
    return;
  }

  if (cmd === "publish") {
    const slug = String(flags.slug || `echo-${userId.slice(0, 8)}`).trim();
    const resp = {
      userId,
      slug,
      status: "preview",
      url: `/echo-page/${slug}`,
      note: "Publishing endpoint is intentionally not exposed in OSS runtime. Use this payload as handoff to a trusted deployment surface.",
    };
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
