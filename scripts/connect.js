#!/usr/bin/env node
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createMemoryFeedClient } from "./lib/providers.js";

function help() {
  console.log(`connect commands:
  connect find --user-id <uuid> --query <text>
  connect friends-prior --user-id <uuid> --query <text>
  connect similar --memory-id <uuid>
`);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const client = createMemoryFeedClient(readConfig());

  if (cmd === "find") {
    const userId = String(flags["user-id"] || "").trim();
    const query = String(flags.query || "").trim();
    if (!userId || !query) throw new Error("find requires --user-id and --query.");
    console.log(JSON.stringify(await client.search(userId, query), null, 2));
    return;
  }

  if (cmd === "friends-prior") {
    const userId = String(flags["user-id"] || "").trim();
    const query = String(flags.query || "").trim();
    if (!userId || !query) throw new Error("friends-prior requires --user-id and --query.");
    console.log(JSON.stringify(await client.friendsPriorSearch(userId, query), null, 2));
    return;
  }

  if (cmd === "similar") {
    const memoryId = String(flags["memory-id"] || "").trim();
    if (!memoryId) throw new Error("similar requires --memory-id.");
    console.log(JSON.stringify(await client.similar(memoryId), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

