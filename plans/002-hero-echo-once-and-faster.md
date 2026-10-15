# 002 — Play the hero echo once per page load, and make every echo faster

- **Status**: DONE
- **Commit**: cd665ad
- **Severity**: HIGH
- **Category**: Purpose & frequency, Easing & duration
- **Estimated scope**: 2 files, ~25 lines
- **Depends on**: 001 (`--motion-ease-out` token)

## Problem

The "Echo List" wordmark plays its echo animation every time the picker screen mounts. The
animation is 1100ms per ghost, and the last ghost starts after 120 + 3×110 = 450ms, so it takes
about **1.55s** in total. The picker remounts on every return:

- "Yeni arama" on the results screen: `app/similar-app.tsx:126`
- "Yeni liste oluştur" on the saved screen: `app/similar-app.tsx:133`
- **every failed or empty generate**: `app/similar-app.tsx:103` and `:109`

So a user retrying a search watches the brand animation again and again. That is decoration on
a screen visited tens of times per session, and it is too slow even for a first impression.

```tsx
/* app/similar-app.tsx:194 — current */
function Echo({ children }: { children: React.ReactNode }) {
  return (
    <span className="echo">
      {children}
      {[1, 2, 3].map((i) => (
        <span key={i} aria-hidden className="echo-ghost" style={{ "--i": i } as React.CSSProperties}>
          {children}
        </span>
      ))}
    </span>
  );
}

function Wordmark() {
  return (
    <h1 className="display text-[clamp(5rem,24vw,9.5rem)] leading-[0.8] tracking-[-0.045em]">
      <Echo>
        Echo
        <br />
        List
      </Echo>
    </h1>
  );
}
```

```css
/* app/globals.css:101-102 — current */
animation: echo-out 1100ms cubic-bezier(0.16, 1, 0.3, 1) both;
animation-delay: calc(120ms + var(--i) * 110ms);
```

`Echo` is also used on the rare "Kaydedildi." success screen (`app/similar-app.tsx:501`). That
use should keep animating, just faster.

## Target

- The echo animates only on the **first** picker mount of a page load. When the user returns to
  the picker later, the ghosts render already settled, with no animation.
- The echo is faster everywhere: 700ms per ghost, delays 60 + i×60ms, about 0.94s in total.

```css
/* target, app/globals.css */
.echo-ghost {
  /* …unchanged properties… */
  animation: echo-out 700ms var(--motion-ease-out) both;
  animation-delay: calc(60ms + var(--i) * 60ms);
}
/* Already-seen echoes render settled. Must come after .echo-ghost. */
.echo-still {
  animation: none;
}
```

## Repo conventions to follow

- App state lives in `SimilarApp` (`app/similar-app.tsx`, the `useState` hooks around lines
  59–62) and flows down as props. Imitate how `size` / `setSize` are passed to `Picker` at
  `app/similar-app.tsx:135`.
- Use React state, not a module-level `let` and not `sessionStorage`: there is no persistence
  requirement, and the React lint rules flag module mutation.

## Steps

1. `app/globals.css`, in `.echo-ghost` (around lines 101–102): replace the two lines with
   ```css
   animation: echo-out 700ms var(--motion-ease-out) both;
   animation-delay: calc(60ms + var(--i) * 60ms);
   ```
2. `app/globals.css`, directly after the `@keyframes echo-out { … }` block (ends around line
   109), add:
   ```css
   /* Already-seen echoes render settled. Must come after .echo-ghost. */
   .echo-still {
     animation: none;
   }
   ```
3. `app/similar-app.tsx`, `Echo`: add an `animate` prop that defaults to `true`, and add
   `echo-still` when it is false:
   ```tsx
   /** Text followed by fading outlined copies of itself: the brand's echo. */
   function Echo({ children, animate = true }: { children: React.ReactNode; animate?: boolean }) {
     return (
       <span className="echo">
         {children}
         {[1, 2, 3].map((i) => (
           <span
             key={i}
             aria-hidden
             className={animate ? "echo-ghost" : "echo-ghost echo-still"}
             style={{ "--i": i } as React.CSSProperties}
           >
             {children}
           </span>
         ))}
       </span>
     );
   }
   ```
4. `app/similar-app.tsx`, `Wordmark`: take an `animate` prop and pass it to `Echo`:
   ```tsx
   function Wordmark({ animate }: { animate: boolean }) {
     return (
       <h1 className="display text-[clamp(5rem,24vw,9.5rem)] leading-[0.8] tracking-[-0.045em]">
         <Echo animate={animate}>
           Echo
           <br />
           List
         </Echo>
       </h1>
     );
   }
   ```
5. `app/similar-app.tsx`, `SimilarApp`: after `const [size, setSize] = useState(30);` add
   ```tsx
   // The hero echo is a first-impression moment: once per page load, never on returns.
   const [heroSeen, setHeroSeen] = useState(false);
   ```
   As the **first line** of `async function generate(input: GenerateInput) {` (line 88), add
   `setHeroSeen(true);`.
6. `app/similar-app.tsx`, where `Picker` is rendered (line 135): add the prop
   `animateHero={!heroSeen}`.
7. `app/similar-app.tsx`, `Picker` (line 219): add `animateHero` to the destructured props and
   add `animateHero: boolean;` to the props type. Then change `<Wordmark />` (around line 240)
   to `<Wordmark animate={animateHero} />`.
8. Leave the `Saved` screen's `<Echo>Kaydedildi.</Echo>` (line 501) unchanged. It uses the
   default `animate = true`.

## Boundaries

- Do NOT change the echo's look: the `.echo-ghost` transform, opacity, stroke and `--i` values
  stay as they are.
- Do NOT touch the `@media (prefers-reduced-motion: reduce)` block. It already sets
  `.echo-ghost { animation: none; }`.
- Do NOT add dependencies, `sessionStorage`, or module-level variables.
- If any quoted code doesn't match the file (drift since `cd665ad`), STOP and report.

## Verification

- **Mechanical**: `npm run lint` (0 errors and 0 warnings), `npm run typecheck`,
  `npm run build`, `npm test` (27 tests pass).
- **Feel check**: `npm run dev`, open http://127.0.0.1:3000:
  - On a fresh load the echo plays once and is fully settled in under 1 second.
  - Paste the invalid link `abc` and press "Benzerlerini bul". The error appears and the
    wordmark is shown **settled, with no replay**.
  - Generate any result, then click "Yeni arama". There is no replay.
  - Reload the page. The echo plays again, since it's a new page load.
  - In the DevTools Animations panel at 10% speed on first load, all three ghosts start
    staggered by 60ms and slide out without a pause before they move.
  - With `prefers-reduced-motion: reduce` emulated (Rendering panel), the ghosts appear static
    in their final positions.
- **Done when**: the hero echo animates only on the first picker render per page load, takes
  ≤ 1s, and "Kaydedildi." still animates.
