# 001 — Add shared motion easing tokens and use them for entrances

- **Status**: DONE. `--motion-ease-in-out` was added and then removed: plan 004 chose the
  ease-out fallback, so nothing used it.
- **Commit**: cd665ad
- **Severity**: LOW
- **Category**: Cohesion & tokens
- **Estimated scope**: 1 file (`app/globals.css`), ~10 lines

## Problem

Every animation in `app/globals.css` hand-types its own cubic-bezier. Five near-identical
"ease-out" curves exist and none is a shared token, so there is no single place to tune how
the app moves, and plans 002–004 need a token to point at.

```css
/* app/globals.css:101 — current */
animation: echo-out 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
/* app/globals.css:163 — current */
transition: transform 320ms cubic-bezier(0.3, 0.9, 0.3, 1);
/* app/globals.css:227 — current */
animation: materialize 180ms cubic-bezier(0.2, 0.8, 0.2, 1);
/* app/globals.css:243 — current */
animation: arrive 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
/* app/globals.css:257-259 — current */
transition:
  opacity 160ms cubic-bezier(0.2, 0.8, 0.2, 1),
  transform 160ms cubic-bezier(0.2, 0.8, 0.2, 1);
```

## Target

Two tokens on `:root`, named with a `--motion-` prefix. **Do not name them `--ease-out` /
`--ease-in-out`**: Tailwind v4 already defines `--ease-out: cubic-bezier(0, 0, 0.2, 1)` in
`node_modules/tailwindcss/theme.css:435`, and redefining it would silently change Tailwind's
`ease-out` utility.

```css
/* target, inside the first :root block */
--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
--motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
```

This plan swaps the curve **only** in `.popover` and `.swap, .chip-in`. The `.echo-ghost`,
`.arrive` and `.segmented-thumb` lines are changed by plans 002, 003 and 004 (they also change
durations there).

## Repo conventions to follow

- Design tokens live in the first `:root` block of `app/globals.css` (lines 4–18), as
  lowercase custom properties, e.g. `--shadow: 0 12px 32px -12px rgb(22 26 36 / 0.25);`.
- The dark-mode `:root` block (inside `@media (prefers-color-scheme: dark)`) only overrides
  colours. Do **not** copy the motion tokens into it; they are theme-independent.

## Steps

1. In `app/globals.css`, in the first `:root` block, add these two lines directly after
   `--shadow: 0 12px 32px -12px rgb(22 26 36 / 0.25);` (line 16):
   ```css
   --motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1);
   --motion-ease-in-out: cubic-bezier(0.77, 0, 0.175, 1);
   ```
2. In `.popover` (around line 227), change
   `animation: materialize 180ms cubic-bezier(0.2, 0.8, 0.2, 1);` to
   `animation: materialize 180ms var(--motion-ease-out);`
3. In the `.swap, .chip-in` rule (around lines 255–260), change the transition to:
   ```css
   transition:
     opacity 160ms var(--motion-ease-out),
     transform 160ms var(--motion-ease-out);
   ```

## Boundaries

- Do NOT touch `.ripple span` (line 130). Its `cubic-bezier(0.2, 0.6, 0.3, 1)` is a deliberate
  decaying-wave curve for a looping status indicator.
- Do NOT touch `.echo-ghost`, `.arrive` or `.segmented-thumb`. Plans 002–004 own them.
- Do NOT touch `.press` or `.field` (`ease-out` keywords at 100–150ms are correct for press and
  focus feedback).
- Do NOT edit `app/similar-app.tsx`.
- If a quoted line doesn't match the file (drift since `cd665ad`), STOP and report.

## Verification

- **Mechanical**: `npm run lint` (no errors), `npm run typecheck` (passes), `npm run build`
  (compiles). Run
  `grep -n "cubic-bezier(0.2, 0.8, 0.2, 1)" app/globals.css`: it should only print the
  `.arrive` line (until plan 003 runs).
- **Feel check**: `npm run dev`, open http://127.0.0.1:3000:
  - Go to the "Şarkılar" tab and type `tarkan`. The results dropdown should open with a quick
    settle and no lag before it starts moving.
  - Pick a song. The chip should appear and settle without a pop.
  - In the DevTools Animations panel at 10% speed, both should start moving on frame one.
    The new curve is front-loaded, so at least half the movement should be done in the first
    quarter of the duration.
- **Done when**: both tokens exist on `:root`, `.popover`, `.swap` and `.chip-in` use them, and
  all three checks pass.
