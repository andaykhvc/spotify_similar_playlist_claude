# 004 — Make the segmented control's thumb faster

- **Status**: DONE, using the fallback curve: `transition: transform 200ms var(--motion-ease-out);`.
  The thumb's position, sampled every frame after a click, showed ease-in-out at about 9% of
  the way after 65ms, so the press felt delayed. Ease-out reaches 25% at 17ms and 47% at 29ms.
  Reversing mid-flight continues from the current position.
- **Commit**: cd665ad
- **Severity**: MEDIUM
- **Category**: Easing & duration
- **Estimated scope**: 1 file (`app/globals.css`), 1 line
- **Depends on**: 001 (`--motion-ease-in-out` token)

## Problem

The "Playlist linki / Şarkılar" thumb slides in 320ms. That is over the 300ms UI budget for a
control users flip back and forth several times per session. The curve is also a hand-typed
ease-out, while this is on-screen movement from one known position to another.

```css
/* app/globals.css:163 — current, inside .segmented-thumb */
transition: transform 320ms cubic-bezier(0.3, 0.9, 0.3, 1);
```

## Target

```css
/* target */
transition: transform 200ms var(--motion-ease-in-out);
```

`--motion-ease-in-out` is `cubic-bezier(0.77, 0, 0.175, 1)` (added by plan 001), the strong
ease-in-out for on-screen movement. A CSS transition (not keyframes) is kept on purpose: it
retargets mid-flight when the user taps the other segment during the slide.

## Repo conventions to follow

- Motion tokens live on `:root` in `app/globals.css` (plan 001).
- The reduced-motion block already sets `.segmented-thumb { transition-duration: 1ms; }`.
  Leave it as is.

## Steps

1. In `app/globals.css`, inside `.segmented-thumb` (line 163), replace
   `transition: transform 320ms cubic-bezier(0.3, 0.9, 0.3, 1);` with
   `transition: transform 200ms var(--motion-ease-in-out);`

## Boundaries

- Do NOT change the thumb's geometry, colours or shadow, or the `data-active` selector.
- Do NOT edit `app/similar-app.tsx`.
- If the quoted line doesn't match (drift since `cd665ad`), STOP and report.

## Verification

- **Mechanical**: `npm run lint`, `npm run typecheck`, `npm run build` pass.
- **Feel check**: `npm run dev`, then click between "Playlist linki" and "Şarkılar":
  - The thumb lands in about 0.2s and feels snappy, not floaty.
  - Click the other segment rapidly while the thumb is still moving. It reverses from where it
    is, without jumping back to the start.
  - In the DevTools Animations panel at 10% speed, the thumb eases out of rest and into the
    target symmetrically.
  - **Judgment call:** if the ease-in phase makes the press feel delayed at full speed, use
    `transition: transform 200ms var(--motion-ease-out);` instead. Report which curve you
    chose and why.
  - With `prefers-reduced-motion: reduce` emulated, the thumb jumps instantly.
- **Done when**: the thumb transition is 200ms on a `--motion-*` token, and the checks above
  pass.
