# Hyperframes Composition Brief: Echo List

## Objective
Create a 15-second polished launch film for Echo List.

## Output
- Composition directory: `brag-output/composition/`
- Rendered video: `brag-output/brag.mp4`
- Format: landscape — 1920x1080, 30fps
- Duration: 15 seconds

## Source Material
- Project root: `spotify_similar/`
- Primary files read: `app/similar-app.tsx` (UI, copy), `app/globals.css` (tokens, echo
  treatment), `app/layout.tsx` (fonts), `README.md`, live-run output from the deployed app
- Product name: Echo List
- Strongest claim: Spotify removed "benzer playlist", and this brings it back; "Giriş gerekmez."
- Key UI to recreate: the song picker (segmented control, search dropdown, chips, primary button)
  and the results list (rows with "… yankısı" tags, the "Linkleri kopyala" → "Kopyalandı" bar)
- Copy that must appear verbatim (from the app):
  - Echo List
  - Giriş gerekmez.
  - Playlist linki / Şarkılar
  - 2 şarkının benzerlerini bul
  - Şımarık, Dudu dinleniyor…
  - Linkleri kopyala / Kopyalandı
  - "<seed> yankısı" tags

## Creative Direction
- Tone preset: polished
- Creative direction: quiet Apple-style product film, where the echo is the motif
- Interpretation: restraint. Front-loaded ease-out motion, readable holds, soft slides and
  crossfades, no bounce.
- Angle / Hook / Outro: see `brag-plan.md`
- Avoid: generic SaaS language, abstract filler, real album artwork (use the app's echo-glyph
  cover placeholder), any personal data

## Visual Identity
- Background #eef0f4, surface #e3e6ed, raised #ffffff, line #d3d7e0
- Ink #161a24, muted #646b7c, accent #2b45f5
- Display: Bricolage Grotesque (local woff2 in `assets/fonts/`); body: system-ui
- Echo treatment: outlined cobalt copies (`-webkit-text-stroke`), offset 0.11em × i, opacity
  0.58 / 0.36 / 0.14

## Storyboard
Contract: `brag-output/brag-plan.md`.
1. Hook — 2.7s — "Spotify “benzer playlist”i kaldırdı." then "Geri getirdik."
2. Reveal — 2.5s — Echo List wordmark and echoes, then "Giriş gerekmez."
3. Pick songs — 3.5s — "Birkaç şarkı seç." with picker: type "tarkan", pick Şımarık and Dudu,
   press the button
4. Echoes — 4.0s — "Yankılarını bul." with ripple, five result rows, then copy pressed
5. Outro — 2.3s — wordmark and echoes, "Giriş gerekmez.", URL

## Audio
- Role: warm bed with sparse professional accents
- Music: `assets/music/happy-beats-business-moves-vol-12-by-ende-dot-app.mp3`, ~0.32, fade in
  0.4s, fade out over the last ~0.9s
- Cue guidance: `brag/assets/music/cues/happy-beats-business-moves-vol-12-by-ende-dot-app.music-cues.json`.
  Strong cues 8.74 (results) and 13.11 (outro). Beats 3.27 (wordmark echoes).
- Audio-reactive: subtle. RMS drives the opacity and scale of the cobalt ring glow only.
- SFX: keypresses for typing, `interface/click_003` / `click_002` for picks and presses,
  `impact/impactSoft_medium_001` for the wordmark, `interface/drop_001` for the results landing,
  `interface/bong_001` for the outro. Volumes 0.5–0.7.

## Hyperframes Instructions
Standalone `index.html`, a single paused GSAP timeline, local assets only. Run `check` as the
gate, then render to `../brag.mp4`.
