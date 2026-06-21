---
name: Base-path asset references
description: Why public assets and local imports 404 in artifacts mounted under a non-root path, and how to reference them safely.
---

# Base-path-safe asset references

Each web artifact in this monorepo is mounted under its own path prefix by the shared proxy (e.g. `/centspick/`, set as Vite `base`). Anything referenced root-relative (`/images/foo.png`) resolves at the domain root and 404s, because the file is actually served at `${base}images/foo.png`.

**Rule:**
- In React/JS code (incl. data arrays, `<img src>`, `image=` props): use `` `${import.meta.env.BASE_URL}images/foo.png` `` — `BASE_URL` already ends with a trailing slash.
- In `index.html`: root-relative `/favicon.svg`, `/src/main.tsx` are fine — Vite rewrites them to the base prefix at build time (dev preview also works through the proxy fallback). Do not "fix" these.
- Local module imports must be path-correct relative to the file (e.g. a component in `components/layout/` imports a sibling-of-parent as `../Logo`, not `./Logo`).

**Why:** During the CentsPick build this bit twice — first a wrong relative import (`./Logo` from `components/layout/Navbar.tsx`), then several root-relative `/images/*.png` refs that rendered as broken images only under the `/centspick/` base. Typecheck passes either way, so these only surface as runtime 404s in the preview.

**How to apply:** When adding images/assets to any non-root artifact, default to `import.meta.env.BASE_URL` prefixes and verify in the preview screenshot that images actually load (a green typecheck does not catch this).
