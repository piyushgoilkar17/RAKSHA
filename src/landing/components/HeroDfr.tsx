import { lazy, Suspense } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../ui/tabs";
const DroneViewer = lazy(() => import("./DroneViewer"));
const steps = [
  {
    name: "Autonomous Deployment",
    text: "Navigate beyond the reach of GPS.",
    desc: "Onboard navigation helps RakshaAI reach difficult disaster zones.",
  },
  {
    name: "Edge Perception",
    text: "Find the people who need help.",
    desc: "On-device AI identifies potential survivors without relying on the cloud.",
  },
  {
    name: "Dual-Spectrum Sensing",
    text: "See more with RGB and thermal.",
    desc: "Visual and thermal sensing give response teams a clearer view.",
  },
  {
    name: "Threat Geo-Tagging",
    text: "Put every finding on the map.",
    desc: "Tag survivors and hazards to help teams plan their response.",
  },
  {
    name: "Command Center Telemetry",
    text: "Keep the response connected.",
    desc: "Share field observations with command teams when a link is available.",
  },
];
export default function HeroDfr() {
  return (
    <section id="platform" className="hero hero-centered wrap">
      <div className="hero-heading">
        <h1>
          Drone as First Responder<span>— here’s how it works.</span>
        </h1>
        <p className="hero-paragraph">
          RakshaAI helps response teams see what’s happening before they enter a
          disaster zone. Using onboard AI, RGB and thermal cameras, it locates
          potential survivors, maps hazards, and shares critical information.{" "}
          <strong>A clearer picture for a faster, coordinated response.</strong>
        </p>
        <a className="explore-3d-link" href="#mission">
          Explore the aircraft in 3D
        </a>
      </div>
    </section>
  );
}
export function MissionVisual() {
  return (
    <section
      id="mission"
      className="mission-visual-section wrap"
      aria-label="How RakshaAI works"
    >
      <div className="mission-title">
        <h2>Meet your first responder.</h2>
        <p>Six rotors. A new perspective.</p>
      </div>
      <Tabs defaultValue="0" className="workflow">
        <div className="mission-explorer">
          <Suspense fallback={<div className="viewer-loading" role="status">Loading aircraft explorer…</div>}><DroneViewer /></Suspense>
          <div className="mission-copy">
            {steps.map((step, i) => (
              <TabsContent
                value={String(i)}
                key={step.name}
                className="mission-detail"
              >
                <span className="mission-counter">0{i + 1} / 05</span>
                <h3>{step.text}</h3>
                <p>{step.desc}</p>
                <span className="mission-detail-label">{step.name}</span>
              </TabsContent>
            ))}
          </div>
        </div>
        <TabsList className="workflow-tabs">
          {steps.map((s, i) => (
            <TabsTrigger key={s.name} value={String(i)}>
              <span className="step-num">0{i + 1}</span>
              <span className="step-label">{s.name}</span>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>
    </section>
  );
}
