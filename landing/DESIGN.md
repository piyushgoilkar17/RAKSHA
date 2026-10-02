---
name: RakshaAI
description: A light aerospace product studio for a disaster-response concept aircraft.
colors:
  foreground: "#14222d"
  white: "#fff"
  studio-ink: "#18364c"
  studio-muted: "#526878"
  studio-floor: "#eaf0f4"
  action: "#193c53"
  action-hover: "#285d7b"
  dashboard-action: "#214c68"
  dashboard-hover: "#2c6385"
  mission-panel: "#17374a"
  mission-body: "#c4d6e1"
  amber-label: "#edac79"
  amber-tab: "#dc8950"
  focus: "#df7b46"
  viewer-focus: "#c77537"
  hardware-surface: "#edf2f6"
  banner-surface: "#dfedf7"
  control-active: "#e1edf4"
  control-ink: "#264960"
  border: "#e2e8f0"
typography:
  display:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.5rem, 4.7vw, 4.5rem)"
    fontWeight: 650
    lineHeight: 1.13
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2rem, 3.3vw, 2.9rem)"
    fontWeight: 550
    lineHeight: 1.13
    letterSpacing: "-.035em"
  intro:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.125rem, 1.7vw, 1.375rem)"
    fontWeight: 700
    lineHeight: 1.8
  body:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: "16px"
    lineHeight: 1.7
  label:
    fontFamily: "Inter, Arial, Helvetica, sans-serif"
    fontSize: "12px"
    fontWeight: 700
    lineHeight: 1.7
    letterSpacing: "0.14em"
rounded:
  control: "6px"
  action: "8px"
  toolbar: "10px"
  hardware: "14px"
  explorer: "16px"
spacing:
  compact: "8px"
  control: "12px"
  inset: "24px"
  grid: "28px"
  card: "32px"
components:
  explore-action:
    backgroundColor: "{colors.action}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: "15px 24px"
  explore-action-hover:
    backgroundColor: "{colors.action-hover}"
  viewer-control:
    textColor: "{colors.control-ink}"
    rounded: "{rounded.control}"
    padding: "7px 10px"
  viewer-control-active:
    backgroundColor: "{colors.control-active}"
  explorer:
    backgroundColor: "{colors.studio-floor}"
    rounded: "{rounded.explorer}"
  hardware-card:
    backgroundColor: "{colors.white}"
    rounded: "{rounded.hardware}"
    padding: "32px"
  dashboard-action:
    backgroundColor: "{colors.dashboard-action}"
    textColor: "{colors.white}"
    rounded: "{rounded.action}"
    padding: "27px 52px"
---

# Design System: RakshaAI

## Overview

**Creative North Star: Aerospace product studio.** This description records the implemented landing surface; it is not a new brand direction. Light enterprise surfaces, slate-blue structure and restrained amber markers frame a directly manipulable aircraft. The interface uses real object shading and soft physical elevation to make the aircraft and hardware tangible.

The source of this record is the final aircraft-studio CSS cascade and React components. It documents code observations rather than claiming a new browser or live-panel review. Frontmatter holds extracted reusable values; extensions live in `.impeccable/design.json`.

Key characteristics are a spacious centered introduction, matte studio floor, dark supporting mission panel, compact manipulation controls, and elevated hardware cards.

## Colors

Primary action colors are dark slate blues. The dashboard uses its own slightly brighter blue action and hover pair. Amber marks selected workflow tabs, mission labels and keyboard focus, retaining the light enterprise identity in PRODUCT.md.

White is the page and card surface. Studio floor and hardware surface provide neighboring cool neutral planes; studio ink and muted text establish hierarchy. The mission panel reverses to white headings and a pale blue body. Keep focus colors distinct from passive borders.

## Typography

Inter with Arial, Helvetica and sans-serif fallbacks is the single type family. The display is centered, tightly tracked and balanced; the introduction is deliberately bold and constrained to 70ch. Headline values describe the aircraft section, while the body role describes mission copy. Uppercase eyebrows use the label role. The CSS declares intermediate weights for display and headline; bundled font faces supply 400, 500, 600 and 700.

## Layout

The shared desktop container is `min(1376px, calc(100% - 112px))`, narrowing its gutters at existing responsive breakpoints. The studio explorer uses a 1.9fr aircraft region and a .9fr mission region with a 250px minimum. At 1000px this becomes 1.5fr and 1fr with a 220px mission minimum. At 700px the regions stack, the viewer height changes from 540px to 410px, and mission content follows the aircraft.

Keep the current simple page sequence: centered heading and bold introduction, response context and pain-point comparison, interactive aircraft, three hardware cards, then the large dashboard launch action. Detailed deleted footnotes and the removed capability section are not part of this surface. PRODUCT.md remains the authority for content constraints.

Hardware cards use a three-column arrangement on large screens and a single column on mobile. Hero padding is 90px above and 76px below, becoming 52px on both sides on mobile. The dashboard block uses 95px vertical space, reduced to 60px on mobile.

## Elevation & Depth

Depth is physical but restrained: the WebGL aircraft casts a soft shadow on a rough matte floor, toolbar groups float gently above that surface, and hardware cards use diffuse shadows with a white inset highlight. The middle hardware card lifts by 8px; all three use a subtle 3-degree X rotation on desktop. Mobile removes those transforms. Exact shadow values are recorded in the sidecar.

The aircraft uses physically shaded geometry, room environment lighting, warm directional light and cool hemisphere light. Preserve the floor as a continuous plane rather than introducing decorative backgrounds that interfere with silhouette or controls.

## Shapes

Rounded rectangles organize the interface: compact controls, action buttons, toolbar groups, hardware cards and the enclosing explorer step through the frontmatter radii. The explorer clips its interior to a continuous outer shape. Workflow tabs use the action radius and a thin inset amber selection mark.

## Components

**Actions.** The explore action has a 48px minimum height. The dashboard launch is intentionally much larger, with a responsive font and a minimum width capped by available space. Hover changes fill; keyboard focus adds a 3px amber outline with a 5px offset.

**Aircraft explorer.** This is real WebGL geometry with manual drag, keyboard arrow rotation, Front, Top and Reset presets, zoom buttons, plus/minus keyboard zoom and an optional auto-rotate toggle. Panning and wheel zoom are disabled. Presets stop auto rotation. Controls remain disabled until ready, expose accessible labels, and indicate the auto-rotate state with `aria-pressed`. The focusable stage has its own inset amber outline. The canvas is hidden from assistive technology; the enclosing group supplies instructions.

**Concept disclosure.** Keep the visible “3D concept model” label. The procedurally authored aircraft is a concept, not supplied CAD or a validated aircraft rendering. Do not imply validated flight specifications through visual treatment or labels.

**Loading and fallback.** Next.js dynamically loads the viewer without server rendering. Three.js, its controls, environment and aircraft geometry import only when the viewer approaches within 250px of the viewport. The static concept image and status message cover preparation or WebGL failure. Render calls pause outside the viewport or while the document is hidden; this is a visibility-gated animation loop, not an on-demand renderer. Pixel ratio is capped at 1.75 and the renderer requests low-power operation.

**Motion.** Auto rotation is off by default for all visitors. It starts only after an explicit action. Reduced-motion CSS removes animations and transitions, disables smooth scrolling and removes the base card tilt; the more specific middle-card desktop transform remains in the current cascade. Reduced motion does not separately disable user-requested WebGL orbit. Mission content normally reveals over .35s; links and buttons transition background, color and opacity over .2s.

**Workflow and hardware.** Tabs remain secondary to the aircraft, with a light selected fill and amber inset line. Hardware cards retain simplified specification rows and physical elevation. The sticky navigation uses a translucent white background, subtle bottom border and backdrop blur.

## Do's and Don'ts

- Do keep the visible concept disclaimer, direct manipulation instructions, fallback image and keyboard controls together.
- Do preserve light surfaces, slate structure and restrained amber interaction cues.
- Do maintain the simplified landing structure and the three hardware cards.
- Do keep movement user-initiated and the renderer visibility-gated.
- Don't present procedural geometry as validated CAD or invent verified performance claims.
- Don't restore deleted detailed copy or the removed capability section through a design refresh.
- Don't claim dashboard or sign-in connectivity before those destinations are connected.
