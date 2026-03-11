#!/usr/bin/env node
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createMemoryFeedClient, createMercuryClient } from "./lib/providers.js";

function help() {
  console.log(`memory-network commands:
  memory-network feed --user-id <uuid>
  memory-network search --user-id <uuid> --query <text>
  memory-network friends --user-id <uuid>
`);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const config = readConfig();
  const feed = createMemoryFeedClient(config);
  const mercury = createMercuryClient(config);

  const userId = String(flags["user-id"] || "").trim();

  if (cmd === "feed") {
    if (!userId) throw new Error("feed requires --user-id.");
    console.log(JSON.stringify(await feed.feed(userId), null, 2));
    return;
  }

  if (cmd === "search") {
    const query = String(flags.query || "").trim();
    if (!userId || !query) throw new Error("search requires --user-id and --query.");
    console.log(JSON.stringify(await feed.search(userId, query), null, 2));
    return;
  }

  if (cmd === "friends") {
    if (!userId) throw new Error("friends requires --user-id.");
    console.log(JSON.stringify(await mercury.friends(userId), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

