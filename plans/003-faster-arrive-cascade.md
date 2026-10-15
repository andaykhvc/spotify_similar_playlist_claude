# 003 — Bring the arrive cascade inside the UI duration budget

- **Status**: DONE
- **Commit**: cd665ad
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`app/globals.css`), 2 lines
- **Depends on**: 001 (`--motion-ease-out` token)

## Problem

`.arrive` runs on every result row, every playlist tile and the saved screen. Each item takes
420ms, which is over the 300ms UI budget, with a 28ms stagger capped at 12 items. The last row
finishes at 12×28 + 420 = **756ms** after the list mounts. The stagger is decorative, and it
holds the list in a half-faded state for most of a second.

```css
/* app/globals.css:242-245 — current */
.arrive {
  animation: arrive 420ms cubic-bezier(0.2, 0.8, 0.2, 1) both;
  animation-delay: calc(min(var(--i), 12) * 28ms);
}
```

Used at: `app/similar-app.tsx:685` (result rows), `:453` (playlist grid), `:503` and `:506`
(saved screen, `--i` 2 and 4).

## Target

260ms per item, a 30ms stagger (inside the 30–80ms stagger range) capped at 10 items. The last
item finishes at 10×30 + 260 = **560ms**.

```css
/* target */
.arrive {
  animation: arrive 260ms var(--motion-ease-out) both;
  animation-delay: calc(min(var(--i), 10) * 30ms);
}
```

The `@keyframes arrive` (`opacity: 0; transform: translateY(6px)`) stays unchanged.

## Repo conventions to follow

- Motion tokens come from plan 001: `--motion-ease-out: cubic-bezier(0.23, 1, 0.32, 1)` on
  `:root` in `app/globals.css`.
- Exemplar of a token-based rule after plan 001: `.popover { animation: materialize 180ms var(--motion-ease-out); }`.

## Steps

1. In `app/globals.css`, replace the two declarations inside `.arrive` (lines 243–244) with:
   ```css
   animation: arrive 260ms var(--motion-ease-out) both;
   animation-delay: calc(min(var(--i), 10) * 30ms);
   ```

## Boundaries

- Do NOT change `@keyframes arrive`, the `--i` values in `app/similar-app.tsx`, or the
  reduced-motion block (it already sets `.arrive { animation: none; }`).
- Do NOT edit `app/similar-app.tsx`.
- If the quoted lines don't match (drift since `cd665ad`), STOP and report.

## Verification

- **Mechanical**: `npm run lint`, `npm run typecheck`, `npm run build` all pass.
- **Feel check**: `npm run dev`, generate a result (for example the "Şarkılar" tab, pick any
  song, then "Benzerlerini bul"):
  - Rows ripple in quickly, and the whole list is readable about half a second after it appears.
  - Rows 11 and later arrive together with row 10, with no long tail.
  - In the DevTools Animations panel at 10% speed, each row starts moving on its first frame.
    The movement is front-loaded, with no slow start.
  - With `prefers-reduced-motion: reduce` emulated, the rows appear instantly.
- **Done when**: `.arrive` uses 260ms, `var(--motion-ease-out)` and `min(var(--i), 10) * 30ms`,
  and the checks above pass.
