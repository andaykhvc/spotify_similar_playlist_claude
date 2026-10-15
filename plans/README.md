# Animation plans

Written by `improve-animations` at commit `cd665ad`. Each plan is self-contained and can be
handed to any agent.

| # | Plan | Severity | Status |
| --- | --- | --- | --- |
| 001 | [Shared motion easing tokens](001-motion-easing-tokens.md) | LOW | DONE |
| 002 | [Hero echo once per load, faster echo](002-hero-echo-once-and-faster.md) | HIGH | DONE |
| 003 | [Faster arrive cascade](003-faster-arrive-cascade.md) | MEDIUM | DONE |
| 004 | [Faster segmented thumb](004-faster-segmented-thumb.md) | MEDIUM | DONE |

## Execution order

1. **001** first. It adds `--motion-ease-out` and `--motion-ease-in-out`, which 002–004
   reference.
2. **002** next. It has the highest impact.
3. **003** and **004** can follow in either order. Both touch different single lines in
   `app/globals.css`.

All four touch `app/globals.css`, so run them sequentially, not in parallel.

## Not planned (noted during the audit)

- `app/similar-app.tsx:461`: the playlist cover's hover shadow isn't gated to
  `(hover: hover) and (pointer: fine)`, so it can stick after a tap on touch screens. It is
  cosmetic only, with no motion.
- `app/similar-app.tsx:637`: the "Kaydediliyor…" save label swaps instantly. It could reuse
  the existing `.swap` class (missed opportunity, low value).
