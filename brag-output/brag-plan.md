# Brag Plan: Echo List

## What is this app?
A web app that brings back Spotify's removed "similar playlist" feature: paste any public playlist
or pick a few songs, and it finds tracks that echo them (Last.fm similarity, matched back to
Spotify). No login required; you can copy the links or connect Spotify to save.

## The angle
Spotify took a feature away; this app quietly puts it back. The name is the idea: every song has
an echo. The video treats it like a calm, confident product film. It states the loss in one line,
answers with the name, then shows the product doing it on real Turkish pop. The app's own visual
signature carries the brand: the wordmark with fading outlined copies trailing it.

## Hook (first 2-3 seconds)
On the app's cool mist background, a single display line slams in: **Spotify "benzer
playlist"i kaldırdı.** It holds long enough to read. A short answer follows underneath:
**Geri getirdik.** The hook is a fact the target viewer already feels, said plainly.

## Key moments (the middle)
- The "Echo List" wordmark lands, and its three outlined echoes slide out of it. This is the
  app's real hero treatment.
- **Song picker in use:** the "Şarkılar" tab is active and "tarkan" types into the search field.
  The dropdown shows **Şımarık** and **Dudu**. A cursor picks both, they drop in as chips, and
  the button reads "2 şarkının benzerlerini bul".
- **Result:** a brief "Şımarık, Dudu dinleniyor…" ripple, then five real suggestions cascade in,
  each tagged with what it echoes ("Dudu yankısı"). Then "Linkleri kopyala" is pressed and turns
  into "✓ Kopyalandı".

## Outro / punchline
The wordmark returns large, with echoes, and the line **Giriş gerekmez.** sits under it with the
URL.

## User flow worth showing
1. Entry: the "Şarkılar" tab. Type "tarkan" and pick Şımarık and Dudu.
2. Key action: "2 şarkının benzerlerini bul", then the "dinleniyor…" loading ripple.
3. Result: a list of similar songs with "… yankısı" tags, then "Linkleri kopyala" →
   "✓ Kopyalandı".

The suggestion rows use real output from a live run of the deployed app with these two seeds:
Kuzu Kuzu (Tarkan), Aya Benzer (Mustafa Sandal), Kırmızı (Hande Yener), Deli Et Beni (Emel
Müftüoğlu), Komple (Burak Kut). Album art is replaced with the app's own cover placeholder (echo
glyph), with no third-party artwork.

## Tone
- Preset: polished
- Creative direction: quiet Apple-style product film, where the echo is the motif
- Interpretation: few scenes, long readable holds, soft crossfades and slides. Motion stays
  precise and front-loaded (the app's own `cubic-bezier(0.23, 1, 0.32, 1)`), with no bounce. The
  confidence comes from restraint.

## Format: landscape — 1920x1080 (`brag.mp4`), plus a vertical 1080x1920 cut (`brag-vertical.mp4`, from `composition-vertical/`)
## Duration: 15s (user request)

To re-render: copy `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` from the /brag skill into
`composition*/assets/music/` (it is not committed), then `npx hyperframes render` in that folder.

## Visual identity (from the project)
- Background: #eef0f4 (mist)
- Surface: #e3e6ed; raised: #ffffff; line: #d3d7e0
- Accent: #2b45f5 (cobalt)
- Text: #161a24 (ink); muted #646b7c
- Display font: Bricolage Grotesque 700 (shipped woff2 from the app build)
- Body font: system-ui (SF Pro on macOS), as in the app
- Strongest visual element: the echo wordmark (outlined cobalt copies offset 0.11em, fading
  0.58 / 0.36 / 0.14)

## Share copy (draft)
Spotify "benzer playlist"i kaldırdı, Echo List geri getirdi: bir playlist linki ya da birkaç
şarkı ver, yankılarını bul. Giriş gerekmez.

## Audio direction
- Role: warm bed with sparse professional accents
- Music: `happy-beats-business-moves-vol-12-by-ende-dot-app.mp3` (steady, clean; polished)
- Music treatment: starts at 0, volume ~0.32, quick fade-in over 0.4s, fade out over the last
  ~0.9s under the outro
- Music cue guidance: bundled preset `vol-12` (≈110 BPM). Strong cues in the window: 8.74s
  (0.99) for the result reveal and 13.11s (0.98) for the outro wordmark. Beat grid near the
  reveal: 2.73 / 3.27, near the picks: 6.56 / 7.09 / 7.64.
- Audio-reactive treatment: subtle. Music RMS makes the cobalt echo-ring glow behind the UI
  breathe. No visualizer graphics.
- SFX posture: sparse, motion-matched
- Audio-coupled moments: typing "tarkan" (keypresses), the two song picks and the button press
  (clicks), the wordmark reveal (one soft impact), the results arrival (one soft drop), the copy
  press (click), the outro (soft bong)
- Restraint rule: no SFX on every result row; nothing bright or repeated loudly.

## Storyboard

### Scene 1 — Hook — 2.7s (0.0–2.7)
The mist canvas with faint cobalt echo rings at the right edge. Large left-anchored display line:
"Spotify “benzer playlist”i kaldırdı." It slams in and holds about 1.4s. Then "Geri getirdik." in
cobalt appears under it and holds about 0.9s.
Sequential/interaction: two lines, one after the other
Audio intent: the bed fades in, calm
Audio-coupled idea: none (let the line land in silence over the bed)
Transition mood: clean → Scene 2

### Scene 2 — Reveal — 2.5s (2.7–5.2)
The "Echo List" wordmark lands large on the left. Its three outlined echoes slide out to the right
(beat-aligned near 3.27). "Giriş gerekmez." settles under it.
Sequential/interaction: wordmark first, then echoes, then the line
Audio intent: one warm, soft impact as the wordmark lands
Audio-coupled idea: impact at the wordmark landing
Transition mood: soft slide → Scene 3

### Scene 3 — Pick songs — 3.5s (5.2–8.7)
Split frame. On the left is the step line "Birkaç şarkı seç." On the right, a recreated app
picker card: the segmented control with "Şarkılar" active, and a search field that types
"tarkan". The dropdown shows Şımarık and Dudu (Tarkan). A cursor clicks each, the chips settle
in, and the button "2 şarkının benzerlerini bul" is pressed.
Sequential/interaction: yes. Typing, two picks, then a button press (simulated cursor).
Audio intent: tactile, precise
Audio-coupled idea: keypress per character, a click per pick, a click on the button
Transition mood: clean → Scene 4

### Scene 4 — Echoes — 4.0s (8.7–12.7)
The left line becomes "Yankılarını bul." The card shows a brief ripple with "Şımarık, Dudu
dinleniyor…", then the results header and five rows cascade in quickly (reveal fast, then hold
the full set for at least 2s). Each row has the cover placeholder, title, artist and an
"… yankısı" tag. At about 11.6 a cursor presses "Linkleri kopyala (5)", which becomes
"✓ Kopyalandı".
Sequential/interaction: yes. Row cascade (fast in, long hold) and the copy press.
Audio intent: payoff. The results lock near the strong cue at 8.74–9.3.
Audio-coupled idea: one soft drop when the list lands, a click on copy
Transition mood: soft crossfade → Scene 5

### Scene 5 — Outro — 2.3s (12.7–15.0)
The wordmark returns large and centered-left with its echoes (beat-locked near 13.11). Under it:
"Giriş gerekmez." and the URL "spotify-similar-playlist-claude.vercel.app". It holds to the end
while the music fades.
Sequential/interaction: none
Audio intent: settle and resolve
Audio-coupled idea: soft bong at the wordmark landing
Transition mood: end

**Music mood for this video:** steady, clean, quietly upbeat
**Audio summary:** a warm bed fades in under the hook, small tactile clicks carry the flow, one
soft payoff lands on the results, and the bed fades under the final wordmark.
