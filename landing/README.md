# RakshaAI landing page

Next.js App Router, React, TypeScript, Tailwind CSS, and Lucide.

## Run

- `npm install`
- `npm run dev` — localhost:5173
- `npm run build` — static production export in `out/`

## Page structure

Centered introduction → pain points and advantages → interactive drone concept visual → three specification cards → Launch Dashboard.

The capability showcase, long introduction, technical download section, detailed footnotes, and telemetry demo were removed in the simplified revision.

## Dashboard integration

All Launch Dashboard links open `http://localhost:3000` in the same tab. The dashboard is a separate, unchanged checkout of https://github.com/piyushgoilkar17/RAKSHA at this repository's root; the landing page lives in `landing/`.

Start both apps in separate terminals:

1. At the repository root, run `npm ci` once, then `npm run dev` (port 3000).
2. In `landing/`, run `npm run dev` (port 5173).
3. Open http://localhost:5173 and select Launch Dashboard. Browser Back returns to the landing page.

For a deployed dashboard, set `NEXT_PUBLIC_DASHBOARD_URL=https://your-dashboard-host` in this landing project's `.env.local`, then restart development or rebuild the static export. Configure the real deployed URL before publishing; localhost is for local development only. The repository's advertised Vercel deployment was unavailable at integration time.

Dashboard source, authentication, API configuration, and functionality are unchanged. Its backend services require the repository's existing setup. The landing Login button remains a placeholder.

The drone image is generated concept imagery. English is the available language. Platform details come from the supplied brief and have not been independently validated.


## Interactive 3D aircraft

The aircraft showcase now uses a locally authored Three.js concept hexacopter (`components/raksha/hexacopter.ts`) rather than a static-only image. The model has six arms/rotors, landing skids, and a dual-camera gimbal. It is schematic concept geometry, not a manufacturer CAD asset.

- Drag or use arrow keys to orbit.
- Front, Top, and Reset provide camera presets.
- Plus/minus buttons (or keyboard +/- with viewer focused) control zoom.
- Auto-rotate is optional and off by default.
- The 3D engine loads near the viewport; rendering pauses off-screen or when the page is hidden.
- Browsers without WebGL show the existing concept image.

TypeScript and the production static build pass. Desktop WebGL and view controls were checked in the browser. Mobile layout was inspected at 390px with no document overflow; the final camera-framing update passed source review, but a clean final mobile capture was unavailable.
