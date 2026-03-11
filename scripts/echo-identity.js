#!/usr/bin/env node
import fs from "node:fs/promises";
import process from "node:process";
import { parseArgs } from "./lib/args.js";
import { readConfig } from "./lib/config.js";
import { createEchoMemClient } from "./lib/providers.js";

function help() {
  console.log(`echo-identity commands:
  echo-identity profile
  echo-identity templates [--limit <n>]
  echo-identity template-create --title <text> --template <text> [--tags a,b,c]
  echo-identity template-delete --ids <id1,id2,...>
  echo-identity extract --file <path> [--save true|false]
  echo-identity compose --intent <text> [--template-ids id1,id2] [--memory-ids id1,id2]
`);
}

function csvToArray(value) {
  return String(value || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

async function main() {
  const { positionals, flags } = parseArgs(process.argv.slice(2));
  const cmd = positionals[0];
  if (!cmd || cmd === "help") return help();

  const client = createEchoMemClient(readConfig());

  if (cmd === "profile") {
    console.log(JSON.stringify(await client.getProfileSummary(), null, 2));
    return;
  }

  if (cmd === "templates") {
    const limit = Math.max(1, Number.parseInt(String(flags.limit || "60"), 10) || 60);
    console.log(JSON.stringify(await client.listPromptTemplates(limit), null, 2));
    return;
  }

  if (cmd === "template-create") {
    const title = String(flags.title || "").trim();
    const template = String(flags.template || "").trim();
    if (!title || !template) throw new Error("template-create requires --title and --template.");
    const tags = csvToArray(flags.tags);
    console.log(JSON.stringify(await client.createPromptTemplate({ title, template, tags }), null, 2));
    return;
  }

  if (cmd === "template-delete") {
    const ids = csvToArray(flags.ids);
    if (!ids.length) throw new Error("template-delete requires --ids id1,id2,...");
    console.log(JSON.stringify(await client.deletePromptTemplates(ids), null, 2));
    return;
  }

  if (cmd === "extract") {
    const file = String(flags.file || "").trim();
    if (!file) throw new Error("extract requires --file.");
    const rawData = await fs.readFile(file, "utf-8");
    const save = String(flags.save || "true").toLowerCase() !== "false";
    console.log(JSON.stringify(await client.extractPromptTemplates(rawData, save), null, 2));
    return;
  }

  if (cmd === "compose") {
    const intent = String(flags.intent || "").trim();
    if (!intent) throw new Error("compose requires --intent.");
    const templateIds = csvToArray(flags["template-ids"]);
    const memoryIds = csvToArray(flags["memory-ids"]);
    console.log(JSON.stringify(await client.generatePrompt({ intent, templateIds, memoryIds }), null, 2));
    return;
  }

  help();
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});

