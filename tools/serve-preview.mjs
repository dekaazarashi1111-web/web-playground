import { createReadStream, existsSync, readFileSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const OUTPUT_DIR = path.join(ROOT, ".pages-dist");
const CONFIG_PATH = path.join(ROOT, "preview.config.json");
const PORT = Number.parseInt(process.env.PORT || process.argv[2] || "4173", 10);

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  console.error("PORT must be an integer from 1 to 65535.");
  process.exit(1);
}

const buildResult = spawnSync(process.execPath, [path.join(ROOT, "tools", "build-preview.mjs")], {
  cwd: ROOT,
  env: {
    ...process.env,
    PAGES_BASE_URL: process.env.PAGES_BASE_URL || `http://localhost:${PORT}`,
    PAGES_ORIGIN: process.env.PAGES_ORIGIN || `http://localhost:${PORT}`,
    PAGES_BASE_PATH: process.env.PAGES_BASE_PATH || "",
    GITHUB_PAGES: "true",
  },
  stdio: "inherit",
});

if (buildResult.status !== 0) process.exit(buildResult.status || 1);

let spaFallback = false;
try {
  spaFallback = Boolean(JSON.parse(readFileSync(CONFIG_PATH, "utf8")).spaFallback);
} catch {
  // The build step already reports configuration errors.
}

const mimeTypes = new Map([
  [".avif", "image/avif"],
  [".css", "text/css; charset=utf-8"],
  [".csv", "text/csv; charset=utf-8"],
  [".gif", "image/gif"],
  [".html", "text/html; charset=utf-8"],
  [".ico", "image/x-icon"],
  [".jpeg", "image/jpeg"],
  [".jpg", "image/jpeg"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".mp3", "audio/mpeg"],
  [".mp4", "video/mp4"],
  [".pdf", "application/pdf"],
  [".png", "image/png"],
  [".svg", "image/svg+xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"],
  [".wasm", "application/wasm"],
  [".webm", "video/webm"],
  [".webp", "image/webp"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
  [".xml", "application/xml; charset=utf-8"],
]);

function insideOutput(filePath) {
  const relative = path.relative(OUTPUT_DIR, filePath);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function resolveRequestPath(requestUrl) {
  let pathname;
  try {
    pathname = decodeURIComponent(new URL(requestUrl || "/", `http://localhost:${PORT}`).pathname);
  } catch {
    return null;
  }

  const relative = pathname.replace(/^\/+/, "");
  let candidate = path.resolve(OUTPUT_DIR, relative);
  if (!insideOutput(candidate)) return null;

  if (existsSync(candidate) && statSync(candidate).isDirectory()) {
    candidate = path.join(candidate, "index.html");
  }
  return candidate;
}

function sendFile(response, filePath, statusCode = 200, headOnly = false) {
  const extension = path.extname(filePath).toLowerCase();
  response.writeHead(statusCode, {
    "Content-Type": mimeTypes.get(extension) || "application/octet-stream",
    "Content-Length": statSync(filePath).size,
    "Cache-Control": "no-store, max-age=0",
    "X-Content-Type-Options": "nosniff",
  });
  if (headOnly) {
    response.end();
    return;
  }
  createReadStream(filePath).pipe(response);
}

const server = createServer((request, response) => {
  const headOnly = request.method === "HEAD";
  if (request.method !== "GET" && !headOnly) {
    response.writeHead(405, { Allow: "GET, HEAD" });
    response.end("Method Not Allowed");
    return;
  }

  const candidate = resolveRequestPath(request.url);
  if (!candidate) {
    response.writeHead(400, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Bad Request");
    return;
  }

  if (existsSync(candidate) && statSync(candidate).isFile()) {
    sendFile(response, candidate, 200, headOnly);
    return;
  }

  const fallback = spaFallback
    ? path.join(OUTPUT_DIR, "index.html")
    : path.join(OUTPUT_DIR, "404.html");

  if (existsSync(fallback)) {
    sendFile(response, fallback, 404, headOnly);
    return;
  }

  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
  response.end("Not Found");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`\n[preview-server] http://127.0.0.1:${PORT}/`);
  console.log("[preview-server] Press Ctrl+C to stop.\n");
});
