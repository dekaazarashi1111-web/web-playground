# Preview operations

## Pattern A: Completely replace the current preview

Use this for unrelated one-off designs and tests.

1. Delete the previous contents of `site/`.
2. Copy the new static files into `site/`.
3. Ensure `site/index.html` exists.
4. Keep asset references relative.
5. Update `PREVIEW_NOTES.md`.
6. Commit to `main`.

The public URL stays unchanged.

## Pattern B: Keep several previews at the same time

Create one directory per preview while keeping a root index as a catalog.

```text
site/
├── index.html
├── landing-a/
│   └── index.html
├── dashboard-b/
│   └── index.html
└── form-test/
    └── index.html
```

Typical URLs:

```text
https://USERNAME.github.io/REPOSITORY/
https://USERNAME.github.io/REPOSITORY/landing-a/
https://USERNAME.github.io/REPOSITORY/dashboard-b/
```

## Pattern C: Change the static source directory

Edit `preview.config.json`:

```json
{
  "$schema": "./tools/preview-config.schema.json",
  "mode": "static",
  "sourceDir": "prototype-output",
  "spaFallback": false,
  "emitMetadata": true,
  "build": {
    "workingDirectory": ".",
    "command": "",
    "publishDir": ""
  }
}
```

The selected source directory must contain `index.html` at its top level.

## Pattern D: Publish a Vite or other build-based application

Change `preview.config.json` to command mode:

```json
{
  "$schema": "./tools/preview-config.schema.json",
  "mode": "command",
  "sourceDir": "site",
  "spaFallback": true,
  "emitMetadata": true,
  "build": {
    "workingDirectory": ".",
    "command": "npm ci && npm run build",
    "publishDir": "dist"
  }
}
```

For Vite, read the Pages base path from the environment in `vite.config.js`:

```js
import { defineConfig } from "vite";

const pagesBase = process.env.PAGES_BASE_PATH
  ? `${process.env.PAGES_BASE_PATH}/`
  : "/";

export default defineConfig({
  base: pagesBase,
});
```

The build command receives:

- `PAGES_BASE_URL`
- `PAGES_ORIGIN`
- `PAGES_BASE_PATH`
- `GITHUB_PAGES=true`
- standard GitHub Actions environment variables such as `GITHUB_REPOSITORY` and `GITHUB_SHA`

## Pattern E: Single-page application fallback

Set:

```json
"spaFallback": true
```

The build step copies the published `index.html` to `404.html`. This lets GitHub Pages return the SPA shell for unknown routes. The application router is still responsible for interpreting the browser path.

Hash-based routing is another simple option because paths after `#` are handled entirely in the browser.

## File-path rules that work across repository names

Prefer:

```html
<link rel="stylesheet" href="./assets/main.css">
<a href="./details/">Details</a>
<img src="../images/item.png" alt="">
```

A URL beginning with `/` points to the domain root, not automatically to the repository subpath. Build tools should therefore be configured with `PAGES_BASE_PATH`, while hand-written static pages should normally use relative references.

## Local build and server

```bash
node tools/build-preview.mjs
node tools/serve-preview.mjs
```

The local server rebuilds once at startup, serves `.pages-dist/`, disables browser caching, supports directory `index.html`, and applies the configured SPA fallback.

## Restore an older preview

Use GitHub commit history to locate the desired state, then either:

- revert the commits that replaced it, or
- restore the previous `site/` contents and commit them as a new change.

The Pages URL remains unchanged after restoration.

## Suggested AI instruction for a full replacement

```text
Read AGENTS.md and PREVIEW_NOTES.md first.
Replace the current preview completely. Delete stale files under site/ and create the new structure there.
Keep the deployment infrastructure unless the project needs a build command.
Ensure the final published root has index.html, use repository-safe relative paths,
run the preview build when possible, and update PREVIEW_NOTES.md.
```

## Suggested AI instruction for multiple retained demos

```text
Add this as a new demo under site/DEMO-NAME/ without changing the existing demos.
Create or update the root site/index.html so it links to the new demo.
Use relative paths inside the demo and update PREVIEW_NOTES.md with the new route.
```
