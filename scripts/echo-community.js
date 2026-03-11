#!/usr/bin/env node
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createMemoryFeedClient, createMercuryClient } from "./lib/providers.js";

function help() {
  console.log(`echo-community commands:
  echo-community discover --topic <text> --user-id <uuid> [--limit <n>]
  echo-community create --name <text> --seed-user-id <uuid> [--topic <text>] [--limit <n>]
  echo-community insights --group-id <text> [--map-type category|description]
`);
}

function parseCsv(v) {
  return String(v || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const config = readConfig();
  const feed = createMemoryFeedClient(config);
  const mercury = createMercuryClient(config);

  if (cmd === "discover") {
    const topic = String(flags.topic || positionals[1] || "").trim();
    const userId = String(flags["user-id"] || "").trim();
    if (!topic || !userId) throw new Error("discover requires --topic and --user-id.");
    const limit = Math.max(1, Number.parseInt(String(flags.limit || "30"), 10) || 30);
    const search = await feed.friendsPriorSearch(userId, topic);
    console.log(
      JSON.stringify(
        {
          topic,
          userId,
          mode: "friends-prior-search",
          count: search.count,
          memories: (search.memories || []).slice(0, limit),
        },
        null,
        2
      )
    );
    return;
  }

  if (cmd === "create") {
    const name = String(flags.name || positionals[1] || "").trim();
    const seedUserId = String(flags["seed-user-id"] || "").trim();
    const topic = String(flags.topic || "").trim();
    if (!name || !seedUserId) throw new Error("create requires --name and --seed-user-id.");

    const feedResp = await feed.feed(seedUserId);
    const memories = (feedResp.emotionGroups || []).flatMap((g) => g.memories || []);
    const suggestedMembers = [...new Set(memories.map((m) => m.user_id).filter(Boolean))].slice(
      0,
      Math.max(1, Number.parseInt(String(flags.limit || "20"), 10) || 20)
    );

    console.log(
      JSON.stringify(
        {
          status: "draft",
          name,
          topic: topic || null,
          seedUserId,
          memberCandidateCount: suggestedMembers.length,
          memberCandidates: suggestedMembers,
          note: "This first pass returns a draft community object only. Persist/create endpoint is not exposed in OSS runtime.",
        },
        null,
        2
      )
    );
    return;
  }

  if (cmd === "insights") {
    const groupId = String(flags["group-id"] || positionals[1] || "").trim();
    if (!groupId) throw new Error("insights requires --group-id.");
    const userIds = parseCsv(groupId);
    const mapType = String(flags["map-type"] || "category");
    const map = await mercury.mapConvergence({ mapType, maxTier: 3 });

    console.log(
      JSON.stringify(
        {
          groupId,
          interpretedUserIds: userIds,
          mapType,
          convergenceCount: map.count,
          topNodes: (map.nodes || []).slice(0, 40),
          topPaths: (map.paths || []).slice(0, 20),
          note: "Pass comma-separated user IDs in --group-id for local grouping conventions.",
        },
        null,
        2
      )
    );
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
