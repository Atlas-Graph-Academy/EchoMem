#!/usr/bin/env node
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createMercuryClient } from "./lib/providers.js";

function help() {
  console.log(`memory-map commands:
  memory-map render [--map-type category|description]
  memory-map search --query <text> [--map-type category|description] [--limit <n>]
  memory-map convergence [--map-type category|description] [--run-index <n>] [--max-tier <n>]
  memory-map compute-convergence [--map-type category|description]
`);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const client = createMercuryClient(readConfig());
  const mapType = String(flags["map-type"] || "category");

  if (cmd === "render") {
    console.log(JSON.stringify(await client.mapRender(mapType), null, 2));
    return;
  }

  if (cmd === "search") {
    const query = String(flags.query || "").trim();
    if (!query) throw new Error("search requires --query.");
    console.log(
      JSON.stringify(
        await client.mapSearch({
          query,
          mapType,
          limit: Math.max(1, Number.parseInt(String(flags.limit || "20"), 10) || 20),
        }),
        null,
        2
      )
    );
    return;
  }

  if (cmd === "convergence") {
    const runIndexRaw = flags["run-index"];
    const runIndex = runIndexRaw !== undefined ? Number.parseInt(String(runIndexRaw), 10) : null;
    const maxTier = Math.max(1, Math.min(4, Number.parseInt(String(flags["max-tier"] || "3"), 10) || 3));
    console.log(JSON.stringify(await client.mapConvergence({ mapType, runIndex, maxTier }), null, 2));
    return;
  }

  if (cmd === "compute-convergence") {
    console.log(JSON.stringify(await client.mapConvergenceCompute(mapType), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

