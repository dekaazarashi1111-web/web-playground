# Repository instructions for AI agents and automation

## Repository purpose

This repository is a reusable GitHub Pages playground. Its primary job is to publish the latest static preview or test site from one stable public repository.

## Default editing scope

- Treat `site/` as disposable preview content.
- You may freely create, replace, rename, and delete files and directories inside `site/`.
- Remove stale files from previous previews when performing a full replacement.
- Update `PREVIEW_NOTES.md` after a material replacement.

## Stable infrastructure

Preserve these files unless the requested project requires an infrastructure change:

- `.github/workflows/deploy-pages.yml`
- `tools/build-preview.mjs`
- `tools/serve-preview.mjs`
- `tools/preview-config.schema.json`
- `docs/`

`preview.config.json` may be changed when switching between raw static publishing and a build-based project.

## Static mode requirements

- The publish source is defined by `preview.config.json`; the default is `site/`.
- Ensure the published root contains `index.html`.
- Prefer relative URLs such as `./assets/app.css` and `../images/item.png`.
- Do not assume the Pages site is hosted at the domain root. Project Pages commonly uses a repository subpath.
- Browser-only HTML/CSS/JavaScript, static assets, JSON, SVG, fonts, and nested pages are supported.

## Command mode requirements

- Set `mode` to `command`.
- Define `build.workingDirectory`, `build.command`, and `build.publishDir`.
- The workflow provides `PAGES_BASE_URL`, `PAGES_ORIGIN`, and `PAGES_BASE_PATH` to the build command.
- The resulting publish directory must contain `index.html` at its top level.
- Set `spaFallback` to `true` when an SPA should use `index.html` as `404.html`.

## Completion checklist

1. Remove obsolete preview files.
2. Confirm the expected file structure is present.
3. Confirm an `index.html` exists at the final published root.
4. Run `node tools/build-preview.mjs` when a runtime is available.
5. Resolve missing local asset references found during manual review.
6. Update `PREVIEW_NOTES.md` with the current purpose, mode, routes, and build notes.
7. Commit all intended additions, changes, and deletions.
