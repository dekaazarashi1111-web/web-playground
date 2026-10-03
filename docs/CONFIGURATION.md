# Configuration reference

The deployment workflow always creates `.pages-dist/` and uploads that directory to GitHub Pages. `preview.config.json` controls how `.pages-dist/` is prepared.

## Full default configuration

```json
{
  "$schema": "./tools/preview-config.schema.json",
  "mode": "static",
  "sourceDir": "site",
  "spaFallback": false,
  "emitMetadata": true,
  "build": {
    "workingDirectory": ".",
    "command": "",
    "publishDir": ""
  }
}
```

## Fields

### `mode`

Allowed values:

- `static` — copy `sourceDir` directly.
- `command` — run `build.command`, then copy `build.publishDir`.

### `sourceDir`

Repository-relative source directory used by `static` mode. Default: `site`.

The copied result must contain a top-level `index.html`.

### `spaFallback`

When `true`, the final `index.html` is also written as `404.html`. Default: `false`.

### `emitMetadata`

When `true`, the build creates:

```text
_preview/meta.json
```

The generated file contains deployment information such as the Pages base URL, base path, repository, ref, commit SHA, mode, source, build time, file count, and total size.

A page can load it with a relative request:

```js
const metadataUrl = new URL("./_preview/meta.json", document.baseURI);
const metadata = await fetch(metadataUrl).then((response) => response.json());
```

### `build.workingDirectory`

Repository-relative working directory for `command` mode. Default: `.`.

### `build.command`

Shell command run in `build.workingDirectory`.

Examples:

```text
npm ci && npm run build
pnpm install --frozen-lockfile && pnpm build
python -m pip install -r requirements.txt && python build.py
```

The default workflow explicitly sets up Node.js 24. Other runtimes already available on GitHub's `ubuntu-latest` runner may also be used, or the workflow can be extended with an additional setup action.

### `build.publishDir`

Output directory copied after the build command. It is resolved relative to `build.workingDirectory`.

Common values:

```text
dist
build
out
public
```

## Generated output rules

The builder:

1. Cleans `.pages-dist/`.
2. Runs the configured command when required.
3. Copies the selected publish source.
4. Confirms a top-level `index.html` exists.
5. Adds `.nojekyll` if absent.
6. Optionally generates SPA fallback and metadata.
7. Prints file count and total size.
8. Adds a build summary to the GitHub Actions run.

## Environment variables available to command mode

| Variable | Example |
|---|---|
| `PAGES_BASE_URL` | `https://octocat.github.io/web-preview` |
| `PAGES_ORIGIN` | `https://octocat.github.io` |
| `PAGES_BASE_PATH` | `/web-preview` |
| `GITHUB_PAGES` | `true` |
| `GITHUB_REPOSITORY` | `octocat/web-preview` |
| `GITHUB_REF_NAME` | `main` |
| `GITHUB_SHA` | Current commit SHA |

For a user or organization Pages repository named `USERNAME.github.io`, `PAGES_BASE_PATH` is normally empty. For a project Pages repository, it is normally `/<repository>`.

## JSON Schema

`preview.config.json` references `tools/preview-config.schema.json`. Editors with JSON Schema support can use it for completion and validation.
