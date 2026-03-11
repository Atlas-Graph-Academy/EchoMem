#!/usr/bin/env node
import process from "node:process";
import { EchoMemClient } from "./lib/echomem-client.js";
import { parseArgs, toInt } from "./lib/args.js";
import { readConfig, requireConfig } from "./lib/config.js";

function printHelp() {
  console.log(`echo-chat commands:
  echo-chat search --query <text> [--k <n>] [--threshold <f>] [--time-frame-days <n>]
  echo-chat context --context-id <uuid>
  echo-chat time-range --start <iso> --end <iso> [--limit <n>]
`);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help" || cmd === "--help") {
    printHelp();
    return;
  }

  const config = readConfig();
  requireConfig(config, ["baseUrl", "apiKey"]);
  const client = new EchoMemClient(config);

  if (cmd === "search") {
    const query = String(flags.query || "").trim();
    if (!query) throw new Error("search requires --query.");
    const resp = await client.searchMemories({
      query,
      k: toInt(flags.k, 8),
      similarityThreshold: Number.parseFloat(String(flags.threshold ?? "0.1")),
      timeFrameDays: flags["time-frame-days"] ? toInt(flags["time-frame-days"], undefined) : undefined,
    });
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  if (cmd === "context") {
    const contextId = String(flags["context-id"] || "").trim();
    if (!contextId) throw new Error("context requires --context-id.");
    const resp = await client.getContextMessages(contextId);
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  if (cmd === "time-range") {
    const startDate = String(flags.start || "").trim();
    const endDate = String(flags.end || "").trim();
    if (!startDate || !endDate) throw new Error("time-range requires --start and --end.");
    const resp = await client.getMemoriesByTimeRange({
      startDate,
      endDate,
      limit: toInt(flags.limit, 50),
    });
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  printHelp();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

