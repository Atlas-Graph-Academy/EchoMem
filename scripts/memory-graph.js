#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { parseArgs, toInt } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createEchoMemClient, createIditorGraphClient } from "./lib/providers.js";

function printHelp() {
  console.log(`memory-graph commands:
  memory-graph render [--backend extension|iditor_user] [--page <n>] [--page-size <n>] [--offset <n>] [--force] [--include-details] [--graph-id <uuid>]
  memory-graph narrative-context --memory-id <uuid> [--backend extension|iditor_user] [--graph-id <uuid>]
  memory-graph narrative-text --input <json-file> [--backend extension|iditor_user] [--memory-id <uuid>] [--graph-id <uuid>] [--language <en|zh|...>]
  memory-graph public-preview --slug <slug>
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
  const backend = String(flags.backend || config.graphBackend || "extension");
  const extensionClient = () => createEchoMemClient(config);
  const iditorClient = () => createIditorGraphClient(config);

  if (cmd === "render") {
    const force = Boolean(flags.force);
    let resp;
    if (backend === "iditor_user") {
      resp = await iditorClient().getGraphData({
        offset: toInt(flags.offset, 0),
        limit: toInt(flags["page-size"], 220),
        minimal: !Boolean(flags["include-details"]),
        force,
        groupId: String(flags["graph-id"] || "").trim(),
      });
    } else {
      resp = await extensionClient().getGraphData({
        page: toInt(flags.page, 1),
        pageSize: toInt(flags["page-size"], 220),
        force,
        includeDetails: Boolean(flags["include-details"]),
      });
    }
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  if (cmd === "narrative-context") {
    const memoryId = String(flags["memory-id"] || "").trim();
    if (!memoryId) throw new Error("narrative-context requires --memory-id.");
    const graphId = String(flags["graph-id"] || "").trim();
    const resp =
      backend === "iditor_user"
        ? await iditorClient().getNarrativeContext(memoryId, graphId)
        : await extensionClient().getNarrativeContext(memoryId);
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  if (cmd === "narrative-text") {
    const input = String(flags.input || "").trim();
    if (!input) throw new Error("narrative-text requires --input <json-file>.");
    const raw = await fs.readFile(input, "utf-8");
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      throw new Error("--input JSON must be an array of narrative memories.");
    }
    if (backend === "iditor_user") {
      const memoryId = String(flags["memory-id"] || "").trim();
      if (!memoryId) throw new Error("iditor_user narrative-text requires --memory-id.");
      const language = String(flags.language || "en").trim();
      const graphId = String(flags["graph-id"] || "").trim();
      const narrativeText = parsed.map((m) => `${m.key || m.id}: ${m.description || m.text || ""}`).join("\n");
      const resp = await iditorClient().saveNarrativeContext({
        memoryId,
        language,
        narrative: narrativeText,
        keyIdMap: {},
        graphId,
      });
      console.log(JSON.stringify(resp, null, 2));
      return;
    }
    const resp = await extensionClient().postNarrativeText(parsed);
    console.log(JSON.stringify(resp, null, 2));
    return;
  }

  if (cmd === "public-preview") {
    const slug = String(flags.slug || "").trim();
    if (!slug) throw new Error("public-preview requires --slug.");
    const resp = await iditorClient().getPublicGraph(slug);
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
