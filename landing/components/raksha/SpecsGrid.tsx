import { Drone, Cpu, Layers } from "lucide-react";

const specs = [
  {
    icon: Drone,
    title: "A purpose-built platform",
    label: "01 / AIRFRAME & AUTONOMY",
    rows: [
      ["Flight controller", "Pixhawk / PX4"],
      ["Navigation", "ROS 2 + SLAM"],
    ],
  },
  {
    icon: Cpu,
    title: "Intelligence on board",
    label: "02 / PAYLOAD & COMPUTE",
    rows: [
      ["Edge computer", "Raspberry Pi 5"],
      ["AI acceleration", "NPU / AI accelerator"],
      ["Sensors", "RGB and thermal"],
    ],
  },
  {
    icon: Layers,
    title: "Connected mission control",
    label: "03 / SOFTWARE ARCHITECTURE",
    rows: [
      ["Backend", "Node.js / Express"],
      ["Database", "PostgreSQL + PostGIS"],
      ["Mission control", "Next.js"],
    ],
  },
];

export default function SpecsGrid() {
  return (
    <section id="hardware" className="hardware">
      <div className="wrap">
        <div className="section-heading">
          <h2>Engineered as one.</h2>
        </div>
        <div className="spec-grid">
          {specs.map((spec) => (
            <article key={spec.title}>
              <spec.icon size={30} strokeWidth={1.4} />

              <h3>{spec.title}</h3>
              <dl>
                {spec.rows.map(([name, value]) => (
                  <div key={name}>
                    <dt>{name}</dt>
                    <dd>{value}</dd>
                  </div>
                ))}
              </dl>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
