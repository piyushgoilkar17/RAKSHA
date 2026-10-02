import { useEffect, useRef, useState } from "react";
import { RotateCcw, Plus, Minus, Play, Pause, Move, Box } from "lucide-react";

type Actions = {
  view: (kind: "front" | "top" | "reset") => void;
  zoom: (direction: number) => void;
  orbit: (active: boolean) => void;
  rotate: (x: number, y: number) => void;
};
export default function DroneViewer() {
  const host = useRef<HTMLDivElement>(null);
  const actions = useRef<Actions | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "fallback">(
    "loading",
  );
  const [orbit, setOrbit] = useState(false);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false;
    let cleanup = () => {};
    const observer = new IntersectionObserver(
      async (entries) => {
        if (!entries.some((e) => e.isIntersecting)) return;
        observer.disconnect();
        try {
          const [
            THREE,
            { OrbitControls },
            { RoomEnvironment },
            { createHexacopter },
          ] = await Promise.all([
            import("three"),
            import("three/addons/controls/OrbitControls.js"),
            import("three/addons/environments/RoomEnvironment.js"),
            import("./hexacopter"),
          ]);
          if (disposed) return;
          const scene = new THREE.Scene();
          scene.background = new THREE.Color(0xeaf0f4);
          const renderer = new THREE.WebGLRenderer({
            antialias: true,
            alpha: false,
            powerPreference: "low-power",
          });
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
          renderer.shadowMap.enabled = true;
          renderer.shadowMap.type = THREE.PCFShadowMap;
          renderer.toneMapping = THREE.ACESFilmicToneMapping;
          renderer.toneMappingExposure = 1.3;
          const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100);
          camera.position.set(5.5, 4.1, 7);
          const pmrem = new THREE.PMREMGenerator(renderer);
          const room = new RoomEnvironment();
          const environment = pmrem.fromScene(room, 0.04);
          scene.environment = environment.texture;
          room.dispose();
          pmrem.dispose();
          const controls = new OrbitControls(camera, renderer.domElement);
          controls.target.set(0, -0.04, 0);
          controls.enableDamping = true;
          controls.enablePan = false;
          controls.enableZoom = false;
          controls.minPolarAngle = 0.12;
          controls.maxPolarAngle = Math.PI * 0.49;
          controls.autoRotateSpeed = 0.8;
          const craft = createHexacopter();
          scene.add(craft);
          const floor = new THREE.Mesh(
            new THREE.PlaneGeometry(200, 200),
            new THREE.MeshStandardMaterial({
              color: 0xeaf0f4,
              roughness: 1,
              metalness: 0,
            }),
          );
          floor.rotation.x = -Math.PI / 2;
          floor.position.y = -1.05;
          floor.receiveShadow = true;
          scene.add(floor);
          const light = new THREE.DirectionalLight(0xfff5e9, 4);
          light.position.set(-3, 8, 5);
          light.castShadow = true;
          light.shadow.mapSize.set(1024, 1024);
          light.shadow.camera.left = -5;
          light.shadow.camera.right = 5;
          light.shadow.camera.top = 5;
          light.shadow.camera.bottom = -5;
          light.shadow.normalBias = 0.035;
          light.shadow.bias = -0.0003;
          light.shadow.radius = 4;
          scene.add(light);
          scene.add(new THREE.HemisphereLight(0xdaecff, 0x6c818d, 2));
          renderer.domElement.setAttribute("aria-hidden", "true");
          element.appendChild(renderer.domElement);
          let fitScale = 1;
          const resize = () => {
            const w = element.clientWidth,
              h = element.clientHeight;
            renderer.setSize(w, h);
            camera.aspect = w / h;
            const nextScale = Math.max(1, 1.2 / camera.aspect);
            camera.position
              .sub(controls.target)
              .multiplyScalar(nextScale / fitScale)
              .add(controls.target);
            fitScale = nextScale;
            camera.updateProjectionMatrix();
            controls.update();
          };
          const resizeObserver = new ResizeObserver(resize);
          resizeObserver.observe(element);
          resize();
          const home = () => {
            camera.position.set(5.5, 4.1, 7).multiplyScalar(fitScale);
            controls.target.set(0, -0.04, 0);
          };
          actions.current = {
            view(kind) {
              controls.autoRotate = false;
              setOrbit(false);
              if (kind === "top")
                camera.position.set(0.01, 10 * fitScale, 0.01);
              else if (kind === "front")
                camera.position.set(0, fitScale, 9 * fitScale);
              else home();
              controls.update();
            },
            zoom(direction) {
              const offset = camera.position.clone().sub(controls.target);
              offset.setLength(
                THREE.MathUtils.clamp(
                  offset.length() * direction,
                  5.8,
                  14 * fitScale,
                ),
              );
              camera.position.copy(controls.target).add(offset);
              controls.update();
            },
            orbit(active) {
              controls.autoRotate = active;
            },
            rotate(x, y) {
              const offset = camera.position.clone().sub(controls.target);
              const s = new THREE.Spherical().setFromVector3(offset);
              s.theta += x;
              s.phi = THREE.MathUtils.clamp(s.phi + y, 0.12, Math.PI * 0.49);
              camera.position
                .copy(controls.target)
                .add(new THREE.Vector3().setFromSpherical(s));
              controls.update();
            },
          };
          let visible = true;
          const visibility = new IntersectionObserver((es) => {
            visible = es[0].isIntersecting;
          });
          visibility.observe(element);
          let previousTime = 0;
          renderer.setAnimationLoop((time) => {
            const delta = previousTime ? Math.min((time - previousTime) / 1000, 0.05) : 0; previousTime = time;
            if (visible && !document.hidden) {
              controls.update(delta);
              renderer.render(scene, camera);
            }
          });
          const lost = (event: Event) => {
            event.preventDefault();
            setStatus("fallback");
            renderer.setAnimationLoop(null);
          };
          renderer.domElement.addEventListener("webglcontextlost", lost);
          cleanup = () => {
            renderer.setAnimationLoop(null);
            resizeObserver.disconnect();
            visibility.disconnect();
            controls.dispose();
            renderer.domElement.removeEventListener("webglcontextlost", lost);
            scene.traverse((obj) => {
              if (obj instanceof THREE.Mesh) {
                obj.geometry.dispose();
                const mats = Array.isArray(obj.material)
                  ? obj.material
                  : [obj.material];
                mats.forEach((m) => m.dispose());
              }
            });
            environment.dispose();
            renderer.dispose();
            renderer.domElement.remove();
            actions.current = null;
          };
          setStatus("ready");
        } catch {
          if (!disposed) setStatus("fallback");
        }
      },
      { rootMargin: "250px" },
    );
    observer.observe(element);
    return () => {
      disposed = true;
      observer.disconnect();
      cleanup();
    };
  }, []);
  return (
    <div className="drone-viewer">
      <div className="viewer-title">
        <span>
          <Box size={18} /> Explore the aircraft
        </span>
        <span>3D concept model</span>
      </div>
      <div
        className="viewer-stage"
        ref={host}
        tabIndex={status === "ready" ? 0 : -1}
        role="group"
        aria-label="Interactive hexacopter. Drag to rotate, or use arrow keys. Use the zoom buttons to magnify."
        onKeyDown={(event) => {
          const keys: Record<string, [number, number]> = {
            ArrowLeft: [-0.15, 0],
            ArrowRight: [0.15, 0],
            ArrowUp: [0, -0.12],
            ArrowDown: [0, 0.12],
          };
          if (keys[event.key]) {
            event.preventDefault();
            actions.current?.rotate(...keys[event.key]);
          } else if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            actions.current?.zoom(0.87);
          } else if (event.key === "-") {
            event.preventDefault();
            actions.current?.zoom(1.15);
          }
        }}
      >
        {status !== "ready" && (
          <div className="viewer-fallback">
            <img
              src="/landing-assets/hexacopter-hero.png"
              alt="Concept rescue hexacopter with six rotors and a camera payload"
            />
            <p role="status">
              {status === "loading"
                ? "Preparing the 3D aircraft…"
                : "3D is unavailable in this browser. Showing the aircraft concept image."}
            </p>
          </div>
        )}
      </div>
      <div className="viewer-toolbar" aria-label="3D view controls">
        <div className="view-presets">
          <button
            disabled={status !== "ready"}
            onClick={() => actions.current?.view("front")}
          >
            Front
          </button>
          <button
            disabled={status !== "ready"}
            onClick={() => actions.current?.view("top")}
          >
            Top
          </button>
          <button
            disabled={status !== "ready"}
            aria-label="Reset view"
            onClick={() => actions.current?.view("reset")}
          >
            <RotateCcw size={17} />
          </button>
        </div>
        <div className="zoom-controls">
          <button
            disabled={status !== "ready"}
            aria-label="Zoom out"
            onClick={() => actions.current?.zoom(1.15)}
          >
            <Minus size={18} />
          </button>
          <button
            disabled={status !== "ready"}
            aria-label="Zoom in"
            onClick={() => actions.current?.zoom(0.87)}
          >
            <Plus size={18} />
          </button>
          <button
            disabled={status !== "ready"}
            aria-label={orbit ? "Pause rotation" : "Auto rotate"}
            aria-pressed={orbit}
            onClick={() => {
              actions.current?.orbit(!orbit);
              setOrbit(!orbit);
            }}
          >
            {orbit ? <Pause size={17} /> : <Play size={17} />}
          </button>
        </div>
      </div>
      <div className="viewer-hint">
        <Move size={15} />
        <span>Drag to rotate · Use + / − to zoom</span>
      </div>
    </div>
  );
}
