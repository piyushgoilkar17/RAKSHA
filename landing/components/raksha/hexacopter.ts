import * as THREE from "three";

/** Original schematic geometry: six arms, six motors, six propellers, dual camera payload. */
export function createHexacopter() {
  const craft = new THREE.Group();
  const graphite = new THREE.MeshStandardMaterial({
    color: 0x202e38,
    metalness: 0.68,
    roughness: 0.34,
  });
  const shell = new THREE.MeshStandardMaterial({
    color: 0xd6e0e6,
    metalness: 0.62,
    roughness: 0.28,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x101a24,
    metalness: 0.45,
    roughness: 0.36,
  });
  const orange = new THREE.MeshStandardMaterial({
    color: 0xe5853c,
    metalness: 0.3,
    roughness: 0.33,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x7c929f,
    metalness: 0.85,
    roughness: 0.26,
  });
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0x103f5c,
    metalness: 0.5,
    roughness: 0.1,
    clearcoat: 1,
  });
  const thermal = new THREE.MeshPhysicalMaterial({
    color: 0xc47638,
    metalness: 0.65,
    roughness: 0.16,
    clearcoat: 1,
  });
  const led = new THREE.MeshStandardMaterial({
    color: 0x54d7c1,
    emissive: 0x278b80,
    emissiveIntensity: 0.7,
  });
  const mesh = (
    geometry: THREE.BufferGeometry,
    material: THREE.Material,
    parent: THREE.Object3D = craft,
  ) => {
    const m = new THREE.Mesh(geometry, material);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  const cylinder = (
    r: number,
    h: number,
    material: THREE.Material,
    parent: THREE.Object3D = craft,
  ) => mesh(new THREE.CylinderGeometry(r, r, h, 32), material, parent);
  const bar = (
    a: THREE.Vector3,
    b: THREE.Vector3,
    r: number,
    mat: THREE.Material,
    parent: THREE.Object3D = craft,
  ) => {
    const m = cylinder(r, a.distanceTo(b), mat, parent);
    m.position.copy(a).add(b).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      b.clone().sub(a).normalize(),
    );
    return m;
  };
  const body = mesh(new THREE.CylinderGeometry(0.83, 1.02, 0.43, 6), graphite);
  body.position.y = 0.18;
  body.rotation.y = Math.PI / 6;
  const plate = mesh(new THREE.CylinderGeometry(0.78, 0.86, 0.12, 6), shell);
  plate.position.y = 0.47;
  plate.rotation.y = Math.PI / 6;
  const top = mesh(new THREE.BoxGeometry(0.55, 0.14, 0.67), dark);
  top.position.set(0, 0.59, 0);
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3 + Math.PI / 6;
    const x = Math.cos(angle),
      z = Math.sin(angle);
    bar(
      new THREE.Vector3(x * 0.67, 0.21, z * 0.67),
      new THREE.Vector3(x * 2.16, 0.29, z * 2.16),
      0.085,
      graphite,
    );
    const sleeve = cylinder(0.125, 0.22, steel);
    sleeve.position.set(x * 1.03, 0.22, z * 1.03);
    sleeve.quaternion.setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      new THREE.Vector3(x, 0, z),
    );
    const motor = cylinder(0.185, 0.28, graphite);
    motor.position.set(x * 2.18, 0.37, z * 2.18);
    const band = cylinder(0.188, 0.045, orange);
    band.position.set(x * 2.18, 0.47, z * 2.18);
    const cap = cylinder(0.137, 0.085, steel);
    cap.position.set(x * 2.18, 0.56, z * 2.18);
    const prop = new THREE.Group();
    prop.position.set(x * 2.18, 0.63, z * 2.18);
    prop.rotation.y = angle + 0.35;
    craft.add(prop);
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-0.08, -0.055);
    bladeShape.bezierCurveTo(-0.42, -0.2, -0.85, -0.18, -0.96, -0.075);
    bladeShape.bezierCurveTo(-0.78, 0.015, -0.34, 0.09, 0, 0.04);
    bladeShape.bezierCurveTo(0.42, 0.2, 0.85, 0.18, 0.96, 0.075);
    bladeShape.bezierCurveTo(0.78, -0.015, 0.34, -0.09, -0.08, -0.055);
    const blade = mesh(
      new THREE.ExtrudeGeometry(bladeShape, {
        depth: 0.022,
        bevelEnabled: true,
        bevelSegments: 2,
        steps: 1,
        bevelSize: 0.008,
        bevelThickness: 0.005,
      }),
      dark,
      prop,
    );
    blade.rotation.x = -Math.PI / 2;
    const hub = cylinder(0.07, 0.09, steel, prop);
    hub.position.y = 0.025;
    const bolt = cylinder(0.034, 0.025, steel);
    bolt.position.set(x * 0.61, 0.545, z * 0.61);
    if (i === 1 || i === 2) {
      const nav = cylinder(0.045, 0.07, led);
      nav.position.set(x * 1.78, 0.29, z * 1.78);
    }
  }
  // Paired landing skids leave clearance for the gimballed sensor module.
  for (const x of [-0.67, 0.67]) {
    for (const z of [-0.48, 0.48])
      bar(
        new THREE.Vector3(x, -0.02, z),
        new THREE.Vector3(x * 1.35, -0.91, z * 1.9),
        0.046,
        graphite,
      );
    bar(
      new THREE.Vector3(x * 1.35, -0.94, -1.11),
      new THREE.Vector3(x * 1.35, -0.94, 1.11),
      0.055,
      graphite,
    );
    for (const z of [-0.85, 0.85]) {
      const foot = mesh(new THREE.BoxGeometry(0.17, 0.06, 0.22), dark);
      foot.position.set(x * 1.35, -0.97, z);
    }
  }
  const mount = cylinder(0.14, 0.25, steel);
  mount.position.set(0, -0.23, 0.33);
  const gimbal = new THREE.Group();
  gimbal.position.set(0, -0.57, 0.39);
  craft.add(gimbal);
  const housing = mesh(
    new THREE.BoxGeometry(0.72, 0.4, 0.36),
    graphite,
    gimbal,
  );
  for (const [x, mat, r] of [
    [-0.19, glass, 0.125],
    [0.2, thermal, 0.1],
  ] as const) {
    const rim = cylinder(r + 0.045, 0.095, steel, gimbal);
    rim.rotation.x = Math.PI / 2;
    rim.position.set(x, 0, 0.22);
    const lens = cylinder(r, 0.022, mat, gimbal);
    lens.rotation.x = Math.PI / 2;
    lens.position.set(x, 0, 0.276);
    const pupil = cylinder(r * 0.45, 0.024, dark, gimbal);
    pupil.rotation.x = Math.PI / 2;
    pupil.position.set(x, 0, 0.29);
  }
  for (const x of [-0.44, 0.44]) {
    const bracket = mesh(
      new THREE.BoxGeometry(0.055, 0.32, 0.16),
      steel,
      gimbal,
    );
    bracket.position.set(x, 0.16, 0);
  }
  for (let i = 0; i < 5; i++) {
    const vent = mesh(new THREE.BoxGeometry(0.38, 0.018, 0.035), dark);
    vent.position.set(0, 0.544, -0.28 + i * 0.08);
  }
  const antenna = cylinder(0.015, 0.42, dark);
  antenna.position.set(0.42, 0.78, -0.32);
  const tip = mesh(new THREE.SphereGeometry(0.035, 12, 8), orange);
  tip.position.copy(antenna.position);
  tip.position.y += 0.22;
  return craft;
}
