import { Check, Minus, Layers } from "lucide-react";
const rows = [
  [
    "Zero real-time visibility",
    "First responders enter hazard zones without current terrain and situational intelligence.",
    "Autonomous edge intelligence",
    "Raspberry Pi 5 with a dedicated AI accelerator runs YOLO and OpenCV locally, without cloud reliance.",
  ],
  [
    "Communication blackouts",
    "Damaged cellular infrastructure interrupts cloud-dependent vision systems and traditional drone streams.",
    "Resilient local perception",
    "On-device analysis continues without cellular service; telemetry reaches command when a link is available.",
  ],
  [
    "Navigation blindspots",
    "Collapsed structures and dense smoke can compromise navigation and ground conventional UAVs.",
    "GPS-degraded autonomy",
    "PX4, MAVLink, ROS 2, and onboard SLAM support navigation through challenging environments.",
  ],
  [
    "Manual triage delay",
    "Teams must manually review hours of aerial footage to identify potential survivors.",
    "Geo-tagged, unified intelligence",
    "Automated survivor and hazard tagging supports a shared Next.js dashboard with PostGIS spatial data.",
  ],
];
export default function PainpointsAdvantages() {
  return (
    <section className="response" id="mission-specs">
      <div className="response-banner">
        <div className="wrap">

          <h2>
            Less uncertainty.
            <br />
            More time to save lives.
          </h2>
          <div className="mission-types">
            <span>01 / Disaster prevention</span>
            <span>02 / Tactical response</span>
            <span>03 / Relief coordination</span>
          </div>
          <Layers className="banner-icon" size={180} strokeWidth={0.6} />
        </div>
      </div>
      <div className="comparison wrap">
        <div className="compare-head">
          <h3>When disaster strikes</h3>
          <h3>
            <span className="orange-square" /> The RakshaAI advantage
          </h3>
        </div>
        {rows.map(([a, b, c, d]) => (
          <div className="compare-row" key={a}>
            <div>
              <Minus className="minus" size={19} />
              <section>
                <h4>{a}</h4>
                <p>{b}</p>
              </section>
            </div>
            <div>
              <Check className="check" size={19} />
              <section>
                <h4>{c}</h4>
                <p>{d}</p>
              </section>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
