#!/usr/bin/env node
import process from "node:process";
import { parseArgs, toInt } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createEchoMemClient } from "./lib/providers.js";

function help() {
  console.log(`memory-signal commands:
  memory-signal analyze [--limit <n>]
  memory-signal trends [--start <iso>] [--end <iso>] [--limit <n>]
`);
}

function summarizeSignals(memories) {
  const emotion = new Map();
  const category = new Map();
  const object = new Map();

  for (const m of memories) {
    const e = String(m.emotion || "unknown").toLowerCase();
    emotion.set(e, (emotion.get(e) || 0) + 1);
    const c = String(m.category || "unknown").toLowerCase();
    category.set(c, (category.get(c) || 0) + 1);
    const o = String(m.object || "unknown").toLowerCase();
    object.set(o, (object.get(o) || 0) + 1);
  }

  const sortMap = (map) => [...map.entries()].sort((a, b) => b[1] - a[1]).map(([k, v]) => ({ key: k, count: v }));
  return {
    totals: { memories: memories.length },
    topEmotion: sortMap(emotion).slice(0, 12),
    topCategory: sortMap(category).slice(0, 12),
    topObject: sortMap(object).slice(0, 12),
  };
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const client = createEchoMemClient(readConfig());

  if (cmd === "analyze") {
    const limit = toInt(flags.limit, 200);
    const resp = await client.listMemories(limit, 0);
    console.log(JSON.stringify(summarizeSignals(resp.data), null, 2));
    return;
  }

  if (cmd === "trends") {
    const startDate = String(flags.start || "").trim();
    const endDate = String(flags.end || "").trim();
    if (!startDate || !endDate) throw new Error("trends requires --start and --end.");
    const limit = toInt(flags.limit, 500);
    const resp = await client.getMemoriesByTimeRange({ startDate, endDate, limit });
    console.log(JSON.stringify(summarizeSignals(resp.memories || []), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

