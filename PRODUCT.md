# Raksha AI

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

The primary audience and deployment stage remain open: a student/research demonstration, emergency-responder testing, or active rescue operations have not been confirmed.

## Product Purpose

Help users monitor drones, review possible survivors and hazards, plan missions, and view maps and alerts in a raksha-assisted disaster-response workflow.

## Capabilities and Constraints

- Keep simulated data clearly identified.
- AI findings require human verification.
- Preserve the distinction between possible detections and verified information.
- Repository documentation describes a decision-support and research prototype; operational readiness has not been established.
- Existing screens cover fleet monitoring, detection review, maps, mission planning, alerts, reports, analytics, and gateway settings. Their presence does not establish production capability or connected drone hardware.

## Brand Commitments

The user requested changing AeroRescue to Drone. The current interface name is Raksha AI, with a D monogram.

## Evidence on Hand

- `README.md`: product concept, intended workflows, and prototype limitations; it still uses the previous AeroRescue name.
- `src/App.tsx` and `src/components/`: existing web application and workflow screens.
- `src/services/seedData.ts` and `src/services/simulation.ts`: seeded and simulated application data.
- No verified field-performance claims or operational certification have been established during initialization.

## Product Principles

1. Help users connect fleet status, detections, maps, missions, and alerts into a coherent response workflow.
2. Keep human verification central when presenting AI findings.
3. Clearly distinguish simulated information from real observations.
4. Describe demonstrated capabilities accurately; do not present roadmap ideas as validated functionality.

## Open Decisions

- Primary user group and intended deployment stage.
- Product-specific accessibility requirements and field operating conditions.
- Hardware integration and validation requirements for any future operational use.
