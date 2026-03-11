#!/usr/bin/env node
import process from "node:process";
import { EchoMemClient } from "./lib/echomem-client.js";
import { parseArgs, toInt } from "./lib/args.js";
import { readConfig, requireConfig } from "./lib/config.js";
import { buildMarkdownItems, scanMarkdownFiles } from "./lib/openclaw-markdown.js";

function printHelp() {
  console.log(`echo-memory commands:
  echo-memory sync [--dir <path>] [--process-mode immediate|deferred] [--run-jobs] [--limit <n>] [--dry-run]
  echo-memory status [--limit <n>] [--offset <n>]
  echo-memory search --query <text> [--k <n>] [--threshold <f>] [--time-frame-days <n>]
  echo-memory time-range --start <iso> --end <iso> [--limit <n>]
`);
}

async function syncCommand(flags, client, config) {
  const rootDir = String(flags.dir || config.openclawMemoryDir || "").trim();
  if (!rootDir) {
    throw new Error("sync requires --dir or OPENCLAW_MEMORY_DIR.");
  }

  const processMode = String(flags["process-mode"] || "deferred");
  const runJobs = Boolean(flags["run-jobs"]);
  const dryRun = Boolean(flags["dry-run"]);
  const limit = toInt(flags.limit, 0);

  const files = await scanMarkdownFiles(rootDir);
  const selected = limit > 0 ? files.slice(0, limit) : files;
  const items = await buildMarkdownItems(selected);

  if (dryRun) {
    console.log(JSON.stringify({ mode: "dry-run", rootDir, fileCount: selected.length, sample: selected.slice(0, 5) }, null, 2));
    return;
  }

  const resp = await client.ingestMarkdown(items, processMode);
  console.log(JSON.stringify(resp, null, 2));

  if (runJobs && processMode === "deferred" && Array.isArray(resp.jobs)) {
    for (const job of resp.jobs) {
      if (!job?.job_id) continue;
      const runResp = await client.runIngestionJob(job.job_id);
      console.log(JSON.stringify({ job_id: job.job_id, run: runResp }, null, 2));
    }
  }
}

async function statusCommand(flags, client) {
  const limit = toInt(flags.limit, 50);
  const offset = toInt(flags.offset, 0);
  const memories = await client.listMemories(limit, offset);
  console.log(JSON.stringify(memories, null, 2));
}

async function searchCommand(flags, client) {
  const query = String(flags.query || "").trim();
  if (!query) throw new Error("search requires --query.");
  const k = toInt(flags.k, 10);
  const threshold = Number.parseFloat(String(flags.threshold ?? "0.1"));
  const timeFrameDays = flags["time-frame-days"] ? toInt(flags["time-frame-days"], undefined) : undefined;
  const resp = await client.searchMemories({
    query,
    k,
    similarityThreshold: Number.isFinite(threshold) ? threshold : 0.1,
    timeFrameDays,
  });
  console.log(JSON.stringify(resp, null, 2));
}

async function timeRangeCommand(flags, client) {
  const startDate = String(flags.start || "").trim();
  const endDate = String(flags.end || "").trim();
  if (!startDate || !endDate) throw new Error("time-range requires --start and --end.");
  const limit = toInt(flags.limit, 50);
  const resp = await client.getMemoriesByTimeRange({ startDate, endDate, limit });
  console.log(JSON.stringify(resp, null, 2));
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

  switch (cmd) {
    case "sync":
      await syncCommand(flags, client, config);
      break;
    case "status":
      await statusCommand(flags, client);
      break;
    case "search":
      await searchCommand(flags, client);
      break;
    case "time-range":
      await timeRangeCommand(flags, client);
      break;
    default:
      printHelp();
      process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

