#!/usr/bin/env node
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createMemoryFeedClient } from "./lib/providers.js";

function help() {
  console.log(`echo-match commands:
  echo-match find --user-id <uuid> --query <text> [--limit <n>]
  echo-match compare --id-a <uuid> --id-b <uuid>
  echo-match explain --match-id <memory-id>
`);
}

function getId(flags, positional, key) {
  const fromFlag = String(flags[key] || "").trim();
  if (fromFlag) return fromFlag;
  return String(positional || "").trim();
}

function countBy(memories, field) {
  const counts = new Map();
  for (const memory of memories || []) {
    const key = String(memory?.[field] || "unknown").toLowerCase();
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

function toTopRows(map, limit = 10) {
  return [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([key, count]) => ({ key, count }));
}

function overlapSummary(a, b, limit = 8) {
  const shared = [];
  for (const [key, countA] of a.entries()) {
    const countB = b.get(key) || 0;
    if (countB > 0) shared.push({ key, score: countA + countB, countA, countB });
  }
  return shared.sort((x, y) => y.score - x.score).slice(0, limit);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const feedClient = createMemoryFeedClient(readConfig());

  if (cmd === "find") {
    const userId = getId(flags, positionals[1], "user-id");
    const query = String(flags.query || positionals[2] || "").trim();
    if (!userId || !query) throw new Error("find requires --user-id and --query (or positional values).");
    const limit = Math.max(1, Number.parseInt(String(flags.limit || "20"), 10) || 20);
    const resp = await feedClient.friendsPriorSearch(userId, query);
    console.log(JSON.stringify({ ...resp, memories: (resp.memories || []).slice(0, limit) }, null, 2));
    return;
  }

  if (cmd === "compare") {
    const idA = getId(flags, positionals[1], "id-a");
    const idB = getId(flags, positionals[2], "id-b");
    if (!idA || !idB) throw new Error("compare requires --id-a and --id-b (or positional values).");

    const [feedA, feedB] = await Promise.all([feedClient.feed(idA), feedClient.feed(idB)]);
    const memA = (feedA.emotionGroups || []).flatMap((g) => g.memories || []);
    const memB = (feedB.emotionGroups || []).flatMap((g) => g.memories || []);

    const emotionA = countBy(memA, "emotion");
    const emotionB = countBy(memB, "emotion");
    const categoryA = countBy(memA, "category");
    const categoryB = countBy(memB, "category");

    const result = {
      idA,
      idB,
      memoryCountA: memA.length,
      memoryCountB: memB.length,
      sharedEmotion: overlapSummary(emotionA, emotionB),
      sharedCategory: overlapSummary(categoryA, categoryB),
      topEmotionA: toTopRows(emotionA),
      topEmotionB: toTopRows(emotionB),
    };
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  if (cmd === "explain") {
    const matchId = getId(flags, positionals[1], "match-id");
    if (!matchId) throw new Error("explain requires --match-id <memory-id> (or positional value).");
    console.log(JSON.stringify(await feedClient.similar(matchId), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
