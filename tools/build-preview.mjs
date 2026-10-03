import { appendFileSync, cpSync, existsSync, lstatSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, "preview.config.json");
const OUTPUT_DIR = path.join(ROOT, ".pages-dist");

const ignoredNames = new Set([".DS_Store", "Thumbs.db"]);
const ignoredRootDirectories = new Set([".git", ".pages-dist", "node_modules"]);

function fail(message) {
  console.error(`\n[preview-build] ERROR: ${message}`);
  process.exit(1);
}

function readJson(filePath) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`Could not read valid JSON from ${path.relative(ROOT, filePath)}: ${error.message}`);
  }
}

function isPlainObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function validateConfig(raw) {
  if (!isPlainObject(raw)) fail("preview.config.json must contain a JSON object.");

  const mode = raw.mode ?? "static";
  if (!new Set(["static", "command"]).has(mode)) {
    fail('"mode" must be either "static" or "command".');
  }

  const sourceDir = raw.sourceDir ?? "site";
  if (typeof sourceDir !== "string" || !sourceDir.trim()) {
    fail('"sourceDir" must be a non-empty string.');
  }

  const spaFallback = raw.spaFallback ?? false;
  const emitMetadata = raw.emitMetadata ?? true;
  if (typeof spaFallback !== "boolean") fail('"spaFallback" must be true or false.');
  if (typeof emitMetadata !== "boolean") fail('"emitMetadata" must be true or false.');

  const build = isPlainObject(raw.build) ? raw.build : {};
  const workingDirectory = build.workingDirectory ?? ".";
  const command = build.command ?? "";
  const publishDir = build.publishDir ?? "";

  for (const [name, value] of Object.entries({ workingDirectory, command, publishDir })) {
    if (typeof value !== "string") fail(`"build.${name}" must be a string.`);
  }

  if (mode === "command") {
    if (!command.trim()) fail('Command mode requires a non-empty "build.command".');
    if (!publishDir.trim()) fail('Command mode requires a non-empty "build.publishDir".');
  }

  return {
    mode,
    sourceDir,
    spaFallback,
    emitMetadata,
    build: { workingDirectory, command, publishDir },
  };
}

function resolveInsideRoot(base, value, label) {
  const resolved = path.resolve(base, value);
  const relative = path.relative(ROOT, resolved);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    fail(`${label} must resolve inside the repository: ${value}`);
  }
  return resolved;
}

function relativeFromRoot(filePath) {
  const relative = path.relative(ROOT, filePath);
  return relative || ".";
}

function shouldInclude(sourcePath) {
  const relative = path.relative(ROOT, sourcePath);
  if (!relative) return true;
  const parts = relative.split(path.sep);
  if (ignoredRootDirectories.has(parts[0])) return false;
  if (ignoredNames.has(parts.at(-1))) return false;
  return true;
}

function assertNoLinks(directory) {
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (!shouldInclude(fullPath)) continue;
      const stats = lstatSync(fullPath);
      if (stats.isSymbolicLink()) {
        fail(`Symbolic links are not supported in a Pages artifact: ${relativeFromRoot(fullPath)}`);
      }
      if (stats.isDirectory()) visit(fullPath);
    }
  };
  visit(directory);
}

function copyDirectory(source, destination) {
  if (!existsSync(source)) fail(`Publish source does not exist: ${relativeFromRoot(source)}`);
  if (!statSync(source).isDirectory()) fail(`Publish source is not a directory: ${relativeFromRoot(source)}`);
  assertNoLinks(source);
  cpSync(source, destination, {
    recursive: true,
    force: true,
    filter: shouldInclude,
  });
}

function runBuildCommand(config) {
  const workingDirectory = resolveInsideRoot(ROOT, config.build.workingDirectory, "build.workingDirectory");
  if (!existsSync(workingDirectory) || !statSync(workingDirectory).isDirectory()) {
    fail(`Build working directory does not exist: ${relativeFromRoot(workingDirectory)}`);
  }

  console.log(`[preview-build] Running command in ${relativeFromRoot(workingDirectory)}:`);
  console.log(config.build.command);

  const result = spawnSync(config.build.command, {
    cwd: workingDirectory,
    env: process.env,
    shell: true,
    stdio: "inherit",
  });

  if (result.error) fail(`Build command could not start: ${result.error.message}`);
  if (result.status !== 0) fail(`Build command exited with status ${result.status}.`);

  return resolveInsideRoot(workingDirectory, config.build.publishDir, "build.publishDir");
}

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = units[0];
  for (let index = 1; index < units.length && value >= 1024; index += 1) {
    value /= 1024;
    unit = units[index];
  }
  return `${value.toFixed(value >= 10 ? 1 : 2)} ${unit}`;
}

function collectStats(directory) {
  let files = 0;
  let bytes = 0;
  const visit = (current) => {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const fullPath = path.join(current, entry.name);
      if (entry.isDirectory()) {
        visit(fullPath);
      } else if (entry.isFile()) {
        files += 1;
        bytes += statSync(fullPath).size;
      }
    }
  };
  visit(directory);
  return { files, bytes };
}

function writeMetadata(config, sourceLabel, stats) {
  if (!config.emitMetadata) return;
  const metadataDirectory = path.join(OUTPUT_DIR, "_preview");
  mkdirSync(metadataDirectory, { recursive: true });
  const metadata = {
    schemaVersion: 1,
    builtAt: new Date().toISOString(),
    mode: config.mode,
    source: sourceLabel,
    repository: process.env.GITHUB_REPOSITORY || null,
    ref: process.env.GITHUB_REF_NAME || process.env.GITHUB_REF || null,
    sha: process.env.GITHUB_SHA || null,
    runId: process.env.GITHUB_RUN_ID || null,
    baseUrl: process.env.PAGES_BASE_URL || null,
    origin: process.env.PAGES_ORIGIN || null,
    basePath: process.env.PAGES_BASE_PATH || "",
    filesBeforeMetadata: stats.files,
    bytesBeforeMetadata: stats.bytes,
  };
  writeFileSync(path.join(metadataDirectory, "meta.json"), `${JSON.stringify(metadata, null, 2)}\n`);
}

function appendStepSummary(config, sourceLabel, stats) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  const baseUrl = process.env.PAGES_BASE_URL || "Not available during local build";
  const markdown = [
    "## Preview artifact",
    "",
    "| Item | Value |",
    "|---|---|",
    `| Mode | \`${config.mode}\` |`,
    `| Source | \`${sourceLabel.replaceAll("|", "\\|")}\` |`,
    `| Files | ${stats.files} |`,
    `| Size | ${formatBytes(stats.bytes)} |`,
    `| SPA fallback | ${config.spaFallback ? "Enabled" : "Disabled"} |`,
    `| Pages base URL | ${baseUrl} |`,
    "",
  ].join("\n");
  appendFileSync(summaryPath, markdown);
}

if (!existsSync(CONFIG_PATH)) fail("preview.config.json was not found at the repository root.");
const config = validateConfig(readJson(CONFIG_PATH));

rmSync(OUTPUT_DIR, { recursive: true, force: true });
mkdirSync(OUTPUT_DIR, { recursive: true });

let sourceDirectory;
let sourceLabel;
if (config.mode === "static") {
  sourceDirectory = resolveInsideRoot(ROOT, config.sourceDir, "sourceDir");
  sourceLabel = relativeFromRoot(sourceDirectory);
} else {
  sourceDirectory = runBuildCommand(config);
  sourceLabel = relativeFromRoot(sourceDirectory);
}

if (path.resolve(sourceDirectory) === path.resolve(OUTPUT_DIR)) {
  fail("The publish source cannot be .pages-dist itself.");
}

console.log(`[preview-build] Copying ${sourceLabel} -> .pages-dist`);
copyDirectory(sourceDirectory, OUTPUT_DIR);

const entryFile = path.join(OUTPUT_DIR, "index.html");
if (!existsSync(entryFile) || !statSync(entryFile).isFile()) {
  fail("The published root must contain index.html.");
}

if (config.spaFallback) {
  cpSync(entryFile, path.join(OUTPUT_DIR, "404.html"), { force: true });
  console.log("[preview-build] SPA fallback enabled: index.html -> 404.html");
}

const noJekyll = path.join(OUTPUT_DIR, ".nojekyll");
if (!existsSync(noJekyll)) writeFileSync(noJekyll, "");

const statsBeforeMetadata = collectStats(OUTPUT_DIR);
writeMetadata(config, sourceLabel, statsBeforeMetadata);
const finalStats = collectStats(OUTPUT_DIR);
appendStepSummary(config, sourceLabel, finalStats);

console.log(`[preview-build] Ready: ${finalStats.files} files, ${formatBytes(finalStats.bytes)}`);
console.log(`[preview-build] Output: ${relativeFromRoot(OUTPUT_DIR)}`);
