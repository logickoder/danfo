# DESIGN.md: Danfo

Single source of truth for Danfo's visual system. Authoritative for any UI work in this repo.
Deliberately NOT bankstract-cloud's DESIGN.md: that brand is dark, burnt-orange B2B infra.
Danfo is a consumer utility named after the yellow Lagos bus, and the identity comes from the
bus. What carries over from bankstract is discipline, not pixels: money-in-mono, in-world
motion only, the anti-slop checklist, honest copy.

The approved mockups live on the design canvas (Claude artifact "Danfo route page"). When this
file and the canvas disagree, this file wins; fix the canvas.

## Tokens

```yaml
colors:
  paper: "#FAF7F0"        # page background. Light theme on purpose.
  sky: "#F6E9C9"          # warm Lagos haze behind the street scenes
  card: "#FFFFFF"
  ink: "#111111"          # text AND a first-class color: borders, kerb stripes, ink bands
  ink-soft: "#4A4A4A"
  asphalt: "#2E2E2E"      # road surface in every scene
  yellow: "#F2B705"       # danfo yellow. The one brand accent.
  yellow-deep: "#D9A404"  # hover / pressed, and the bus's shaded faces
  success: "#1A7F37"
  error: "#C62828"
  hazard: "#FF9F1C"       # error states only: hazard band, stalled-bus lights
  kraft: "#8B5E34"        # bundle bands. Illustration only, never UI.

typography:
  display: "Bungee"          # street-signage caps. Headlines, plates, buttons, app tiles.
  body: "DM Sans"            # 400 / 500 / 600 / 700
  mono: "JetBrains Mono"     # every naira amount, filenames, CSV, labels. Law.

surfaces:
  panel: "2-3px solid ink border, 8-12px radius, flat offset ink shadow (4-8px), no blur"
  plate: "the yellow headline plate: yellow fill, 3px ink border, 6px flat shadow"
  shadows: "shadow-hard-3 / -4 / -6 / -8 (ink), shadow-hard-paper-5 (on ink). Tokens in globals.css; never a raw shadow-[...]"
```

Display sizes: Bungee runs wide. Desktop hero 62px, section titles 40px, card titles 18-24px,
buttons 12-16px. Mobile hero 32px, stepping down to 26px below 360px wide (clamp) so
"Statement in." never overflows.

## Rules

- **Light theme is the identity.** Never add a dark mode. The one exception is the night-bus
  scene in the hero (see Time of day), a designed scene, not an inversion toggle. Ink bands (conveyor, footer) are
  sections, not a theme.
- **Yellow is functional.** CTAs, plates, active states, the kerb. If a section works with the
  yellow removed, the yellow is being wasted.
- **Hard edges.** Ink borders, small radii, flat offset shadows. Grounded in hand-painted danfo
  panels. If a section reads as a neobrutalism template, go back to photos of real buses.
- **Money always in mono.** Amounts are the DecimalString as it arrived, sign as a string
  prefix, currency code beside it.
- **One primary action per view.** Yellow fill is the primary. Everything else is outline or a
  text link.

## Illustration

- **2.5D flat vector.** Every object gets two flat tones (lit face, shaded face) plus a lighter
  top, with 2-3px ink outlines. It reads as 3D, stays SVG, animates with CSS. No gradients, no
  raster, no Lottie, no 3D engine.
- **The street:** sky band, two-tone buildings with window grids, asphalt road, yellow and ink
  kerb blocks (Lagos kerb paint), paper lane dashes.
- **The danfo:** yellow body, deep-yellow front face, lighter roof, two ink side stripes, dark
  windows with a light slant, open door with the conductor, round headlight, spoked wheels.
  Naira notes are small outlined rectangles in three muted tints with a mono "₦".

## The bus carries the state

One bus, always looping. Its load tells you where you are: messy money in, clean bundles out.

| State | Bus |
|---|---|
| Waiting | a few notes peek out of the windows, conductor waves you in |
| Converting | stuffed: notes in every window, riding low, heavy bounce, notes flying |
| Parsed, picking an app | sorting: banded bundles in the windows, one loose note |
| Downloaded | clean bundles strapped on a roof rack, speed lines |
| Error | stalled, hazard lights blink, smoke puff, notes blow back |

## Time of day

The hero and nav follow the clock in Lagos (`src/lib/sky.ts`), because the street is in Lagos.

- **Day, 06:30 to 19:00:** the sun arcs through its own strip of sky above the rooftops, low on
  the left at sunrise, high at midday, low on the right by 18:45, warming to orange at either
  end. The hero keeps its content clear of that strip.
- **Night, 19:00 to 06:30:** the night-bus scene. Ink sky with stars, a crescent moon, an amber
  haze band, dark buildings with lit windows, street lamps with flat light cones, the danfo's
  cabin lit and its headlight on. Text in the scene turns paper. The converter card does not
  change, and the page below the hero stays light: this is a scene, not a dark mode.
- **The sun or moon is the control.** Tapping it flips the scene for the visit, with a "Tap the
  sun" hint until first use. Nothing is stored, so a reload goes back to the clock. Never wire
  it to `prefers-color-scheme`.
- **No flash, no motion.** A pre-paint script sets `html[data-sky]` before first render; CSS does
  the rest. Day and night swap instantly. Nothing animates, so reduced motion needs nothing.

## Page structure

1. Hero: the street scene with the bus looping, the "Statement in. Budget out." headline on
   its plate, and the converter card sitting in the scene. The tool is above the fold.
2. Three stops. One trip: the road with three bus-stop signposts on the kerb (your bank, the
   danfo, your app). Each post is part of its sign and runs from the sign's bottom to the kerb.
3. The conveyor (ink band): a raw statement fragment, the bus, the clean CSV.
4. Why not just link your bank: three sourced cards.
5. Privacy plate and FAQ.
6. Terminus footer: "Last stop: your budget." with the CTA and the bus parked with bundles.

## The hero card

States: idle, converting, fully checked, partly checked, downloaded, error. All live in the
same card; the page never navigates.

- **Converting:** file chip, rotating slogans, a progress bar.
- **Checked:** bank detected from the PDF ("Read as a First Bank statement"), a tick per check
  that ran, the first 3 rows as a preview, the app picker, the download button.
- **Partly checked:** a check the engine marks `disabled` shows as a grey dash with the
  engine's own `row_wise_reason`. Never write bank-specific copy for it. Partly checked still
  converts.
- **Downloaded:** "Bus don land.", the filename, the import steps for that app, then
  "Another app?" (same statement, another trip, nothing uploaded again).
- **Errors:** an amber and ink hazard band, a red mono label, a Bungee title, one action.
  Copy is always what happened, why, what to do.

## Scaling

- **Banks never get a picker.** The engine detects the bank. Banks only appear in display
  lists, and the hero says "Works with N Nigerian banks", never a list of names.
- **Destination boards.** The bank and app lists on the stop signs are fixed-height LED panels
  that cycle one name at a time, with "See all N" under them. Static first name under
  reduced motion. Full list in the DOM for screen readers.
- **App picker:** 2 columns up to 4 apps, 3 columns for 5-6, then the top 5 plus a "More apps"
  tile that opens a searchable list.

## Motion

In-world motion only. Every animation is something a danfo does: drive, idle and bob, pull in,
stall, sort its load, or its route board flipping. UI interactions stay static or hover-only,
transitions 150ms or less. Everything respects `prefers-reduced-motion` (no loops, static
frames). Banned: scroll-triggered fade-up cascades, parallax, floating elements, sparkles,
skeleton shimmer, animated dash offsets, anything that could belong to a generic SaaS
template.

## Voice

Plain English base. Pidgin as seasoning, never the whole dish: "Oya, drop your statement.",
"Where you dey budget?", "Bus don land.", "That one no be PDF." Loading slogans rotate one line
each: "No shaking.", "Hold your change.", "Last stop: your budget." The moment it feels like a
costume, cut it.

- No em-dashes, anywhere, ever.
- No emojis in copy.
- No marketing words: seamless, powerful, robust, blazingly fast, smart, AI-powered.
- No fake numbers, no invented testimonials. Demo rows in illustrations are labelled examples.
- Every claim must stay true. "Same PDF, same file, every time" is a product promise: nothing
  non-deterministic (AI cleanup, guessed categories) ever touches the output.
- The lockup: "Danfo: statement to budget app" wherever the name appears in public.

## Anti-slop (do not ship)

- Gradients of any kind (stripes are drawn as blocks, never `linear-gradient`), glassmorphism,
  purple/blue AI-template palettes
- Soft blurred drop shadows; Danfo shadows are flat and offset
- Floating dashboard mockups, sparkle heroes, scroll-triggered fade-up cascades
- rounded-2xl on everything; Danfo radii are small and consistent
- Stock 3D objects, raster Lottie decorations
- A hero that could belong to any SaaS. If the screenshot is not obviously a danfo, redo it.
